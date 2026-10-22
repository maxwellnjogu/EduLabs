import random
from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from django.db import models
from django.db.models import Avg, Max, Count, Q
from academics.models import AcademicSemester, Unit, StudentEnrolment
from security.permissions import IsStudent
from security.utils import check_prompt_injection
from .models import (
    LearningWeek,
    LearningMaterial,
    RevisionResource,
    LecturerRecommendedTopic,
)
from .serializers import (
    LearningWeekSerializer,
    LearningMaterialSerializer,
    RevisionResourceSerializer,
    LecturerRecommendedTopicSerializer,
)
from academics.serializers import AcademicSemesterSerializer, UnitSerializer
from assessments.eligibility import get_readiness_status
from assessments.models import (
    Assessment,
    AssessmentAttempt,
    FinalExamEligibility,
    LeaderboardEntry,
)
from assessments.serializers import (
    AssessmentSerializer,
    AssessmentAttemptSerializer,
    FinalExamEligibilitySerializer,
    LeaderboardEntrySerializer,
)


class StudentDashboardView(views.APIView):
    """
    Consolidated dashboard for the authenticated student.
    Returns active semester, enrolled units, lab completion, readiness eligibility, and leaderboard snippet.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        student = request.user
        uni = student.university

        # Active semester
        active_semester = AcademicSemester.objects.filter(
            university=uni,
            status=AcademicSemester.Status.ACTIVE,
        ).first()

        if not active_semester:
            active_semester = AcademicSemester.objects.filter(status=AcademicSemester.Status.ACTIVE).first()

        # Enrolled units
        enrolments = StudentEnrolment.objects.filter(
            student=student,
            semester=active_semester,
            is_active=True,
        ).select_related("unit", "unit__programme")

        units_data = [UnitSerializer(e.unit).data for e in enrolments]

        # Recent attempts
        attempts = AssessmentAttempt.objects.filter(
            student=student,
            is_completed=True,
        ).select_related("assessment", "assessment__unit").order_by("-completed_at")[:5]

        # Lab completion + readiness (authoritative, shared with the gating logic)
        se_unit = Unit.objects.filter(code="RCS 305").first()
        se_passed_labs = 0
        readiness = None
        if se_unit and active_semester:
            readiness = get_readiness_status(student, se_unit, active_semester)
            se_passed_labs = readiness["labs_completed"]

        # Final exam readiness eligibility
        eligibility = None
        if se_unit and active_semester:
            eligibility_obj = FinalExamEligibility.objects.filter(
                student=student,
                unit=se_unit,
                semester=active_semester,
            ).first()
            if eligibility_obj:
                eligibility = FinalExamEligibilitySerializer(eligibility_obj).data

        # Leaderboard snippet
        lb_entry = LeaderboardEntry.objects.filter(student=student).first()
        lb_data = LeaderboardEntrySerializer(lb_entry).data if lb_entry else None

        # Programme is the overall course of study; units sit inside it.
        programme = se_unit.programme if se_unit else (
            enrolments[0].unit.programme if enrolments else None
        )
        programme_name = programme.name if programme else "Computer Science"

        return Response(
            {
                "student": {
                    "id": student.id,
                    "username": student.username,
                    "admission_number": student.admission_number,
                    "full_name": student.get_full_name() or student.username,
                    "display_name": student.display_name or student.username,
                    "university": student.university.name if student.university else "Riara University",
                    "programme": programme_name,
                    "year_of_study": student.year_of_study,
                    "is_demo_identity": True,
                },
                "active_semester": AcademicSemesterSerializer(active_semester).data if active_semester else None,
                "active_unit": UnitSerializer(se_unit).data if se_unit else None,
                "enrolled_units": units_data,
                "software_engineering_labs_passed": se_passed_labs,
                "total_labs_required": readiness["total_labs"] if readiness else 0,
                "readiness": readiness,
                "recent_attempts": AssessmentAttemptSerializer(attempts, many=True).data,
                "final_readiness_eligibility": eligibility,
                "leaderboard": lb_data,
            }
        )


class StudentSemestersView(views.APIView):
    """
    Returns active, closed, and historical semesters for the student.
    Ensures historical notes, results, and attempts remain accessible when semester ends.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        student = request.user
        semesters = AcademicSemester.objects.filter(
            student_enrolments__student=student,
        ).distinct().order_by("-start_date")

        return Response(AcademicSemesterSerializer(semesters, many=True).data)


class StudentUnitsView(views.APIView):
    """Returns enrolled units for a given semester (or active semester by default)."""
    permission_classes = [IsStudent]

    def get(self, request):
        student = request.user
        semester_id = request.query_params.get("semester_id")

        query = StudentEnrolment.objects.filter(student=student, is_active=True)
        if semester_id:
            query = query.filter(semester_id=semester_id)
        else:
            query = query.filter(semester__status=AcademicSemester.Status.ACTIVE)

        units = [e.unit for e in query.select_related("unit", "unit__programme", "semester")]
        return Response(UnitSerializer(units, many=True).data)


class StudentUnitDetailView(views.APIView):
    """
    Detailed unit view for student.
    Shows the 14 available learning weeks, published status, and associated labs.
    """
    permission_classes = [IsStudent]

    def get(self, request, unit_id):
        student = request.user
        # Verify student is enrolled in this unit
        enrolment = StudentEnrolment.objects.filter(
            student=student,
            unit_id=unit_id,
            is_active=True,
        ).first()

        if not enrolment:
            return Response(
                {"error": "Access Denied: You are not enrolled in this unit."},
                status=status.HTTP_403_FORBIDDEN,
            )

        unit = enrolment.unit
        semester = enrolment.semester

        # Locked unit check: prototype units cannot be entered
        if unit.is_sample:
            return Response(
                {
                    "error": f"Prototype Unit: {unit.name} ({unit.code}) is a locked prototype syllabus unit. Curriculum materials are accessible exclusively for Software Engineering (RCS 305).",
                    "is_sample": True,
                    "unit": UnitSerializer(unit).data,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Fetch all published labs for this unit
        published_labs = Assessment.objects.filter(
            unit=unit,
            assessment_type=Assessment.AssessmentType.LAB,
            status=Assessment.Status.PUBLISHED,
        ).select_related("week").order_by("week__week_number", "id")

        labs_data = []
        for lab in published_labs:
            w = lab.week
            attempts_qs = AssessmentAttempt.objects.filter(
                assessment=lab,
                student=student,
                is_completed=True,
            ).order_by("-completed_at", "-id")

            best_attempt = attempts_qs.order_by("-score").first()
            attempts_count = attempts_qs.count()

            mats = []
            if w:
                for m in w.materials.filter(is_published=True).order_by("created_at"):
                    mats.append({
                        "id": m.id,
                        "title": m.title,
                        "material_type": m.material_type,
                        "file_url": m.file.url if m.file else None,
                        "youtube_url": m.url if m.material_type == "youtube" else None,
                        "url": m.url,
                        "has_content": bool(m.content),
                    })

            is_passed = best_attempt.passed if best_attempt else False
            score_pct = best_attempt.percentage if best_attempt else None
            is_demo = best_attempt.is_demo_data if best_attempt else False

            clean_title = lab.title
            if clean_title.startswith("Lab: "):
                clean_title = clean_title[5:]
            elif clean_title.startswith("Week 1 Lab: "):
                clean_title = clean_title[12:]

            labs_data.append({
                "id": lab.id,
                "title": clean_title,
                "full_title": lab.title,
                "description": lab.description,
                "readiness_gate": lab.readiness_gate,
                "passing_threshold": lab.passing_threshold,
                "total_marks": lab.total_marks,
                "week_id": w.id if w else None,
                "week_number": w.week_number if w else None,
                "topic_title": w.title if w else clean_title,
                "is_completed": bool(best_attempt and is_passed),
                "passed": is_passed,
                "score": score_pct,
                "is_synthetic": is_demo,
                "attempts_count": attempts_count,
                "materials": mats,
                "materials_count": len(mats),
            })

        # Fetch weeks for backward compatibility
        weeks = LearningWeek.objects.filter(
            unit=unit,
            semester=semester,
        ).order_by("week_number")

        weeks_data = []
        for w in weeks:
            lab = published_labs.filter(week=w).first()
            user_attempt = None
            if lab:
                user_attempt = AssessmentAttempt.objects.filter(
                    assessment=lab,
                    student=student,
                    is_completed=True,
                ).order_by("-score").first()

            weeks_data.append(
                {
                    "id": w.id,
                    "week_number": w.week_number,
                    "title": w.title,
                    "description": w.description,
                    "is_published": w.is_published,
                    "published_at": w.published_at,
                    "materials_count": w.materials.filter(is_published=True).count(),
                    "has_lab": lab is not None,
                    "lab_id": lab.id if lab else None,
                    "lab_title": lab.title if lab else None,
                    "lab_passed": user_attempt.passed if user_attempt else False,
                    "lab_score": user_attempt.percentage if user_attempt else None,
                }
            )

        return Response(
            {
                "unit": UnitSerializer(unit).data,
                "semester": AcademicSemesterSerializer(semester).data if semester else None,
                "labs": labs_data,
                "weeks": weeks_data,
            }
        )


class StudentWeekDetailView(views.APIView):
    """
    Detailed weekly view:
    Shows published notes, PDF documents, diagrams, YouTube resources, practice questions,
    and the interactive lab status.
    """
    permission_classes = [IsStudent]

    def get(self, request, week_id=None, unit_id=None, week_number=None):
        student = request.user
        try:
            if week_id is not None:
                week = LearningWeek.objects.select_related("unit", "semester").get(id=week_id)
            elif unit_id is not None and week_number is not None:
                week = LearningWeek.objects.select_related("unit", "semester").get(unit_id=unit_id, week_number=week_number)
            else:
                return Response({"error": "Week identifier missing."}, status=status.HTTP_400_BAD_REQUEST)
        except LearningWeek.DoesNotExist:
            return Response({"error": "Learning week not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check locked unit
        if week.unit.is_sample:
            return Response(
                {"error": f"Prototype Unit: {week.unit.name} ({week.unit.code}) is locked during this evaluation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check enrolment
        is_enrolled = StudentEnrolment.objects.filter(
            student=student,
            unit=week.unit,
            semester=week.semester,
            is_active=True,
        ).exists()

        if not is_enrolled:
            return Response(
                {"error": "Access Denied: You are not enrolled in this unit."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Empty state check
        if not week.is_published:
            return Response(
                {
                    "week_number": week.week_number,
                    "title": week.title,
                    "is_published": False,
                    "message": f"No materials published for Week {week.week_number} yet.",
                    "materials": [],
                    "lab": None,
                }
            )

        materials = week.materials.filter(is_published=True).order_by("created_at")
        materials_data = LearningMaterialSerializer(materials, many=True, context={"request": request}).data

        # Check published lab
        lab = Assessment.objects.filter(
            unit=week.unit,
            semester=week.semester,
            week=week,
            status=Assessment.Status.PUBLISHED,
        ).first()

        lab_data = None
        if lab:
            # Check student's attempts
            attempts = AssessmentAttempt.objects.filter(
                assessment=lab,
                student=student,
                is_completed=True,
            ).order_by("-attempt_number")

            latest_attempt = attempts.first()
            best_attempt = attempts.order_by("-score").first()

            lab_data = {
                "id": lab.id,
                "title": lab.title,
                "description": lab.description,
                "passing_threshold": lab.passing_threshold,
                "total_marks": lab.total_marks,
                "quiz_marks": lab.quiz_marks,
                "flashcard_marks": lab.flashcard_marks,
                "written_marks": lab.written_marks,
                "attempts_count": attempts.count(),
                "max_retakes": lab.max_retakes,
                "can_attempt": (attempts.count() < lab.max_retakes) or not (best_attempt and best_attempt.passed),
                "latest_attempt": AssessmentAttemptSerializer(latest_attempt).data if latest_attempt else None,
                "best_percentage": best_attempt.percentage if best_attempt else None,
                "is_passed": best_attempt.passed if best_attempt else False,
            }

        # Practice questions are strictly derived from lecturer-published materials
        practice_questions = []
        practice_mat = week.materials.filter(
            is_published=True
        ).filter(
            models.Q(title__icontains="Practice") | models.Q(description__icontains="Practice") | models.Q(material_type=LearningMaterial.MaterialType.NOTES)
        ).first()
        if practice_mat and practice_mat.content:
            import re
            chunks = re.split(r"(?:^|\n)###\s+Q\d*:?\s*", practice_mat.content)
            for idx, chunk in enumerate(chunks[1:], 1):
                lines = chunk.strip().split("\n")
                prompt = lines[0].strip() if lines else ""
                topic_match = re.search(r"\*\*Topic\*\*:\s*([^\n]+)", chunk)
                ans_match = re.search(r"\*\*Answer & Explanation\*\*:\s*([\s\S]+?)(?:---|$)", chunk)
                practice_questions.append({
                    "id": idx,
                    "prompt": prompt,
                    "topic": topic_match.group(1).strip() if topic_match else "",
                    "answer": ans_match.group(1).strip() if ans_match else "",
                    "explanation": "",
                })

        return Response(
            {
                "week_id": week.id,
                "week_number": week.week_number,
                "title": week.title,
                "description": week.description,
                "is_published": True,
                "unit": UnitSerializer(week.unit).data,
                "materials": materials_data,
                "lab": lab_data,
                "practice_questions": practice_questions,
            }
        )


class StudentRevisionView(views.APIView):
    """
    Consolidated revision material, lecturer-recommended topics, and personalized weak topics.
    """
    permission_classes = [IsStudent]

    def get(self, request, unit_id):
        student = request.user
        try:
            unit = Unit.objects.get(id=unit_id)
        except Unit.DoesNotExist:
            return Response({"error": "Unit not found."}, status=status.HTTP_404_NOT_FOUND)

        # 15 agreed syllabus topics and filenames
        REVISION_TOPIC_CONFIG = [
            (1, "Software Development Life Cycle (SDLC) Fundamentals & Agile Methodologies", "01_sdlc_fundamentals.pdf", "SDLC"),
            (2, "Software Development Models — Waterfall, Agile, Spiral and V-Model", "02_software_process_models.pdf", "Models"),
            (3, "Requirements Engineering", "03_requirements_engineering.pdf", "Requirements"),
            (4, "Software Requirements Specification (SRS)", "04_srs_documentation.pdf", "SRS"),
            (5, "System Analysis and Design", "05_system_analysis_and_design.pdf", "Analysis"),
            (6, "Unified Modeling Language (UML)", "06_uml_modeling.pdf", "UML"),
            (7, "Software Architecture and Design Patterns", "07_software_architecture_patterns.pdf", "Architecture"),
            (8, "Object-Oriented Software Engineering", "08_oose_solid_principles.pdf", "OO"),
            (9, "Software Testing and Quality Assurance", "09_testing_quality_assurance.pdf", "Testing"),
            (10, "Software Verification and Validation", "10_verification_and_validation.pdf", "V&V"),
            (11, "Software Maintenance and Evolution", "11_maintenance_and_evolution.pdf", "Maintenance"),
            (12, "Software Project Management", "12_project_management.pdf", "Management"),
            (13, "Software Cost Estimation", "13_cost_estimation.pdf", "Estimation"),
            (14, "Risk Management in Software Projects", "14_risk_management.pdf", "Risk"),
            (15, "Version Control Systems — Git and GitHub", "15_version_control_git.pdf", "Git"),
        ]

        published_labs = Assessment.objects.filter(
            unit=unit,
            assessment_type=Assessment.AssessmentType.LAB,
            status=Assessment.Status.PUBLISHED,
        ).select_related("week").order_by("week__week_number", "id")

        labs_by_week = {lab.week.week_number: lab for lab in published_labs if lab.week}
        all_labs_list = list(published_labs)

        topics_dashboard = []
        completed_count = 0
        sdlc_passed = False

        for idx, (t_num, t_title, pdf_file, tag) in enumerate(REVISION_TOPIC_CONFIG):
            lab = labs_by_week.get(t_num) or (all_labs_list[idx] if idx < len(all_labs_list) else None)

            attempts = []
            best_attempt = None
            if lab:
                attempts_qs = AssessmentAttempt.objects.filter(
                    assessment=lab,
                    student=student,
                    is_completed=True,
                ).order_by("-completed_at", "-id")

                best_attempt = attempts_qs.order_by("-score").first()
                for att in attempts_qs:
                    attempts.append({
                        "id": att.id,
                        "score": att.score,
                        "percentage": att.percentage,
                        "passed": att.passed,
                        "is_demo_data": att.is_demo_data,
                        "submitted_at": att.completed_at.isoformat() if att.completed_at else (att.started_at.isoformat() if att.started_at else None),
                    })

            is_completed = bool(best_attempt and best_attempt.passed)
            if is_completed:
                completed_count += 1
            if lab and lab.readiness_gate and is_completed:
                if not best_attempt.is_demo_data:
                    sdlc_passed = True

            topics_dashboard.append({
                "topic_number": t_num,
                "title": t_title,
                "assessment_id": lab.id if lab else None,
                "status": "completed" if is_completed else "outstanding",
                "score": best_attempt.percentage if best_attempt else None,
                "passed": is_completed,
                "is_synthetic": best_attempt.is_demo_data if best_attempt else False,
                "is_required_gate": bool(lab and lab.readiness_gate),
                "attempts_count": len(attempts),
                "history": attempts,
                "pdf_filename": pdf_file,
                "pdf_url": f"/revision_pdfs/{pdf_file}",
            })

        resources = RevisionResource.objects.filter(unit=unit, is_published=True).order_by("-created_at")
        topics = LecturerRecommendedTopic.objects.filter(unit=unit).order_by("-priority")

        topic_misses = {}
        for top in topics_dashboard:
            if top["status"] == "outstanding":
                topic_misses[top["title"]] = 999
            elif top["score"] is not None and top["score"] < 80:
                topic_misses[top["title"]] = 100 - top["score"]

        failed_tags = AssessmentAttempt.objects.filter(
            student=student,
            assessment__unit=unit,
            is_completed=True,
        ).values_list("answers__question__topic_tag", flat=True)
        for t in failed_tags:
            if t:
                topic_misses[t] = topic_misses.get(t, 0) + 5

        ranked_weak = sorted(topic_misses.items(), key=lambda x: x[1], reverse=True)
        weak_topics_list = [
            {"topic": t[0], "is_synthetic": True}
            for t in ranked_weak[:5]
        ]

        summary_data = {
            "total_topics": 15,
            "completed_topics": completed_count,
            "progress_pct": round((completed_count / 15.0) * 100, 1),
            "sdlc_completed": sdlc_passed,
            "readiness_unlocked": sdlc_passed,
        }

        return Response(
            {
                "unit": UnitSerializer(unit).data,
                "performance_dashboard": {
                    "summary": summary_data,
                    "topics": topics_dashboard,
                },
                "revision_pack": RevisionResourceSerializer(resources, many=True, context={"request": request}).data,
                "lecturer_recommended_topics": LecturerRecommendedTopicSerializer(topics, many=True).data,
                "student_weak_topics": weak_topics_list,
            }
        )


class StudentAskTutorView(views.APIView):
    """
    Deterministic AI Revision Tutor service.
    First performs mandatory prompt injection security inspection.
    If blocked: returns 400 and logs high-severity security alert.
    If clean: provides curriculum-grounded answer based on SDLC Week 1 source knowledge.
    """
    permission_classes = [IsStudent]

    def post(self, request):
        query = request.data.get("query", "").strip()
        if not query:
            return Response({"error": "Query cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        # CRITICAL: Prompt Injection Guardrail check
        check_prompt_injection(query, request=request)

        # Grounded semantic response using local SDLC knowledge base
        q_lower = query.lower()

        if "waterfall" in q_lower or "predictive" in q_lower:
            answer = (
                "**Waterfall (Predictive) Model** is a linear, sequential development approach. "
                "Each phase (Requirement Analysis -> Design -> Implementation -> Testing -> Evolution) "
                "must be fully completed and signed off before proceeding. It is best suited for projects "
                "with stable, non-negotiable requirements like aerospace or safety-critical firmware."
            )
        elif "agile" in q_lower or "scrum" in q_lower or "sprint" in q_lower:
            answer = (
                "**Agile & Scrum Methodologies**: Agile focuses on iterative cycles, collaboration, "
                "and adapting to evolving customer needs. Scrum operationalizes this through time-boxed "
                "**Sprints** (1–4 weeks), a **Product Backlog** prioritized by business value, a **Sprint Backlog**, "
                "and **Daily Scrum meetings** (15 mins) answering: What did you do yesterday? What will you do today? Are there any blockers?"
            )
        elif "testing" in q_lower or "uat" in q_lower or "unit" in q_lower:
            answer = (
                "**Software Testing Levels**:\n"
                "1. **Unit Testing**: Tests isolated individual functions or procedures.\n"
                "2. **Integration Testing**: Validates communication and contracts between joined modules.\n"
                "3. **System Testing**: Evaluates end-to-end functionality against specifications.\n"
                "4. **User Acceptance Testing (UAT)**: Final real-world validation by client stakeholders."
            )
        elif "environment" in q_lower or "qa" in q_lower or "production" in q_lower:
            answer = (
                "**Three-Tier Deployment Environments**:\n"
                "- **Development**: Active developer coding and testing.\n"
                "- **Quality Assurance (QA)**: Isolated staging sandbox for regression and integration tests.\n"
                "- **Production**: The live operational server accessed by real end users. Direct deployment without QA validation is strictly prohibited."
            )
        else:
            answer = (
                f"**EduLabs Tutor Response**: In Software Engineering, the Software Development Life Cycle (SDLC) "
                f"provides the discipline required to deliver software on time and within budget. "
                f"The core sequence is **Requirement Analysis -> Design -> Implementation -> Testing -> Evolution**. "
                f"Feel free to ask about specific phases, Waterfall vs. Agile, Scrum ceremonies, or testing tiers!"
            )

        return Response(
            {
                "query": query,
                "answer": answer,
                "mode": "deterministic_curriculum_grounded",
                "timestamp": timezone.now().isoformat(),
            }
        )
