import os
from django.db import transaction
from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.db.models import Avg, Max, Count, Q
from django.contrib.auth import get_user_model
from academics.models import Unit, LecturerAssignment, AcademicSemester, StudentEnrolment
from security.permissions import IsLecturer
from security.utils import log_audit_trail

User = get_user_model()
from .models import (
    Assessment,
    AssessmentQuestion,
    AssessmentOption,
    AssessmentAttempt,
    StudentAnswer,
    FinalExamEligibility,
)
from .serializers import (
    AssessmentSerializer,
    AssessmentQuestionReviewSerializer,
    AssessmentAttemptSerializer,
    FinalExamEligibilitySerializer,
)
from learning.models import LearningWeek, LearningMaterial
from learning.serializers import LearningMaterialSerializer
from learning.material_service import process_uploaded_material
from . import gemini_service
from .gemini_service import (
    generate_sdlc_content,
    generate_grounded_questions,
    regenerate_single_question,
    GeminiError,
)
from learning.demo_sdlc_content import (
    WEEK1_LAB_MCQS,
    WEEK1_LAB_FLASHCARDS,
    WEEK1_LAB_WRITTEN,
    WEEK1_MATCHING_PAIRS,
    get_prepared_sdlc_activities,
    PREPARED_SDLC_TRIVIA,
    PREPARED_SDLC_FLASHCARDS,
    PREPARED_SDLC_SCENARIO,
    PREPARED_SDLC_DRAG_DROP,
    PREPARED_SDLC_MATCHING,
)


class LecturerGenerateDemoContentView(views.APIView):
    """
    SDLC DEMO AND LIVE AI CONTENT GENERATOR
    Supports both:
    1. Deterministic source-grounded demo questions (default).
    2. Live Gemini API question generation when explicitly requested (?use_gemini=true).
    Validates complete content before database writes.
    Uses database transactions to preserve existing assessments/questions on any error.
    """
    permission_classes = [IsLecturer]

    def post(self, request, unit_id=None, assessment_id=None):
        if unit_id is not None:
            try:
                unit = Unit.objects.get(id=unit_id)
            except Unit.DoesNotExist:
                return Response({"error": "Unit not found."}, status=status.HTTP_404_NOT_FOUND)
        elif assessment_id is not None:
            try:
                target_assessment = Assessment.objects.select_related("unit", "week").get(id=assessment_id)
                unit = target_assessment.unit
            except Assessment.DoesNotExist:
                return Response({"error": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": "Target unit or assessment must be provided."}, status=status.HTTP_400_BAD_REQUEST)

        week_number = int(request.data.get("week_number", 1))
        semester = AcademicSemester.objects.filter(status=AcademicSemester.Status.ACTIVE).first()
        use_gemini = request.query_params.get("use_gemini", "false").lower() == "true"
        selected_modes = request.data.get("modes") or request.data.get("selected_modes") or request.data.get("question_types")

        if use_gemini:
            api_key = os.environ.get("GEMINI_API_KEY", "").strip()
            model_name = os.environ.get("GEMINI_MODEL", "").strip()
            if not api_key:
                return Response(
                    {"error": "GEMINI_API_KEY is not configured in environment."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not model_name:
                return Response(
                    {"error": "GEMINI_MODEL is not configured in environment."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                raw_gemini_content = gemini_service.generate_sdlc_content("SDLC Fundamentals", "medium", 4)
            except GeminiError as ge:
                return Response({"error": ge.message}, status=ge.http_status)
            except Exception as e:
                return Response(
                    {"error": f"Failed to generate questions via Gemini: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # Check whether this is the SDLC Lab 1 builder workflow (prepared local SDLC content)
        is_builder_workflow = bool(selected_modes or assessment_id is not None)

        with transaction.atomic():
            week = LearningWeek.objects.filter(unit=unit, semester=semester, week_number=week_number).first()
            if not week:
                week = LearningWeek.objects.create(
                    unit=unit,
                    semester=semester,
                    week_number=week_number,
                    title="Software Development Lifecycle (SDLC) Fundamentals",
                    description="SDLC phases, environments, and Agile methodology.",
                    is_published=True,
                )

            title = f"Week {week_number} Lab: SDLC Phases & Agile Methodologies"
            if assessment_id is not None:
                assessment = target_assessment
            else:
                assessment = Assessment.objects.filter(unit=unit, semester=semester, week=week).first()

            if not assessment:
                assessment = Assessment.objects.create(
                    unit=unit,
                    semester=semester,
                    week=week,
                    title=title,
                    description="Interactive assessment populated from SDLC curriculum.",
                    passing_threshold=66.67 if is_builder_workflow else 75.0,
                    total_marks=16.0 if is_builder_workflow else 30.0,
                    status=Assessment.Status.DRAFT,
                    version=1,
                    allow_retakes=True,
                    max_retakes=3,
                    reveal_answers=True,
                    readiness_gate=True,
                )
            else:
                assessment.questions.all().delete()
                assessment.status = Assessment.Status.DRAFT
                assessment.readiness_gate = True
                assessment.save()

            current_order = 1
            total_calc_marks = 0.0

            if use_gemini:
                # Live Gemini generation path
                for mcq in raw_gemini_content.get("mcqs", []):
                    q_marks = float(mcq.get("marks", 2.0))
                    total_calc_marks += q_marks
                    q_obj = AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.MCQ,
                        prompt=mcq["prompt"],
                        marks=q_marks,
                        timer_seconds=int(mcq.get("timer_seconds", 15)),
                        topic_tag=mcq.get("topic_tag", "SDLC Fundamentals"),
                        explanation=mcq.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1
                    for opt_idx, opt_data in enumerate(mcq.get("options", []), 1):
                        AssessmentOption.objects.create(
                            question=q_obj,
                            option_text=opt_data["text"],
                            is_correct=bool(opt_data.get("is_correct", False)),
                            order=opt_idx,
                        )

                for fc in raw_gemini_content.get("flashcards", []):
                    fc_marks = float(fc.get("marks", 1.0))
                    total_calc_marks += fc_marks
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.FLASHCARD,
                        prompt=fc["prompt"],
                        marks=fc_marks,
                        timer_seconds=int(fc.get("timer_seconds", 10)),
                        topic_tag=fc.get("topic_tag", "Flashcards"),
                        explanation=fc.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                for wr in raw_gemini_content.get("written", []):
                    wr_marks = float(wr.get("marks", 3.0))
                    total_calc_marks += wr_marks
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.WRITTEN,
                        prompt=wr["prompt"],
                        marks=wr_marks,
                        timer_seconds=int(wr.get("timer_seconds", 45)),
                        topic_tag=wr.get("topic_tag", "Written Analysis"),
                        marking_rubric=wr.get("marking_rubric", ""),
                        explanation=wr.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                mt_pairs = raw_gemini_content.get("matching_pairs", [])
                if mt_pairs:
                    total_calc_marks += 2.0
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.MATCHING,
                        prompt="Match the SDLC agile terms with their correct definitions:",
                        marks=2.0,
                        timer_seconds=30,
                        topic_tag="Matching Activity",
                        matching_pairs=mt_pairs,
                        explanation="Scrum agile terminology pairs.",
                        order=current_order,
                    )
                    current_order += 1

                assessment.total_marks = total_calc_marks or 30.0
                assessment.save()
                return Response(
                    {
                        "message": "Gemini AI: Questions generated successfully",
                        "assessment": AssessmentSerializer(assessment).data,
                        "questions_generated": assessment.questions.count(),
                        "mode": "live_gemini",
                    },
                    status=status.HTTP_201_CREATED,
                )

            elif is_builder_workflow:
                # SDLC Lab 1 Assessment Builder workflow (Local pre-built SDLC content, NO Gemini/paid API calls)
                activities = get_prepared_sdlc_activities(selected_modes)

                for mcq in activities.get("mcqs", []):
                    q_marks = float(mcq.get("marks", 1.0))
                    total_calc_marks += q_marks
                    q_obj = AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.MCQ,
                        prompt=mcq["prompt"],
                        marks=q_marks,
                        timer_seconds=int(mcq.get("timer_seconds", 15)),
                        topic_tag=mcq.get("topic_tag", "SDLC Fundamentals"),
                        explanation=mcq.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1
                    for opt_idx, opt_data in enumerate(mcq.get("options", []), 1):
                        AssessmentOption.objects.create(
                            question=q_obj,
                            option_text=opt_data["text"],
                            is_correct=bool(opt_data.get("is_correct", False)),
                            order=opt_idx,
                        )

                for fc in activities.get("flashcards", []):
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.FLASHCARD,
                        prompt=fc["prompt"],
                        marks=float(fc.get("marks", 0.0)),
                        timer_seconds=int(fc.get("timer_seconds", 10)),
                        topic_tag=fc.get("topic_tag", "Flashcards"),
                        explanation=fc.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                sc = activities.get("scenario")
                if sc:
                    sc_marks = float(sc.get("marks", 2.0))
                    total_calc_marks += sc_marks
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.WRITTEN,
                        prompt=sc["prompt"],
                        marks=sc_marks,
                        timer_seconds=int(sc.get("timer_seconds", 25)),
                        topic_tag=sc.get("topic_tag", "What Would You Do? Scenario"),
                        marking_rubric=sc.get("marking_rubric", ""),
                        explanation=sc.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                dd = activities.get("drag_drop")
                if dd:
                    dd_marks = float(dd.get("marks", 3.0))
                    total_calc_marks += dd_marks
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.DRAG_DROP,
                        prompt=dd["prompt"],
                        marks=dd_marks,
                        timer_seconds=int(dd.get("timer_seconds", 20)),
                        topic_tag=dd.get("topic_tag", "Drag & Drop"),
                        matching_pairs=dd.get("matching_pairs", []),
                        explanation=dd.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                mt = activities.get("matching")
                if mt:
                    mt_marks = float(mt.get("marks", 6.0))
                    total_calc_marks += mt_marks
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.MATCHING,
                        prompt=mt["prompt"],
                        marks=mt_marks,
                        timer_seconds=int(mt.get("timer_seconds", 30)),
                        topic_tag=mt.get("topic_tag", "Matching Exercise"),
                        matching_pairs=mt.get("matching_pairs", []),
                        explanation=mt.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                assessment.total_marks = total_calc_marks or 16.0
                assessment.passing_threshold = 66.67
                assessment.readiness_gate = True
                assessment.save()

                return Response(
                    {
                        "message": "Prepared SDLC activities generated successfully",
                        "assessment": AssessmentSerializer(assessment).data,
                        "questions_generated": assessment.questions.count(),
                        "selected_modes": selected_modes,
                        "group_work_selected": activities.get("group_work_selected", False),
                        "mode": "prepared_local_sdlc",
                    },
                    status=status.HTTP_201_CREATED,
                )

            else:
                # Deterministic static demo pool path (19 items for test suite)
                for q_data in WEEK1_LAB_MCQS[:10]:
                    q_marks = float(q_data.get("marks", 2.0))
                    total_calc_marks += q_marks
                    q_obj = AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.MCQ,
                        prompt=q_data["prompt"],
                        marks=q_marks,
                        timer_seconds=int(q_data.get("timer_seconds", 15)),
                        topic_tag=q_data.get("topic_tag", "SDLC Fundamentals"),
                        explanation=q_data.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1
                    for opt_idx, opt_data in enumerate(q_data.get("options", []), 1):
                        AssessmentOption.objects.create(
                            question=q_obj,
                            option_text=opt_data["text"],
                            is_correct=bool(opt_data.get("is_correct", False)),
                            order=opt_idx,
                        )

                for fc in WEEK1_LAB_FLASHCARDS:
                    fc_marks = float(fc.get("marks", 1.0))
                    total_calc_marks += fc_marks
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.FLASHCARD,
                        prompt=fc["prompt"],
                        marks=fc_marks,
                        timer_seconds=int(fc.get("timer_seconds", 10)),
                        topic_tag=fc.get("topic_tag", "Flashcards"),
                        explanation=fc.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                for wr in WEEK1_LAB_WRITTEN[:3]:
                    wr_marks = float(wr.get("marks", 2.0))
                    total_calc_marks += wr_marks
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.WRITTEN,
                        prompt=wr["prompt"],
                        marks=wr_marks,
                        timer_seconds=int(wr.get("timer_seconds", 30)),
                        topic_tag=wr.get("topic_tag", "Written Analysis"),
                        marking_rubric=wr.get("marking_rubric", ""),
                        explanation=wr.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                total_calc_marks += 2.0
                AssessmentQuestion.objects.create(
                    assessment=assessment,
                    question_type=AssessmentQuestion.QuestionType.MATCHING,
                    prompt="Match each Software Engineering Concept to its definition:",
                    marks=2.0,
                    timer_seconds=30,
                    topic_tag="Matching Activity",
                    matching_pairs=WEEK1_MATCHING_PAIRS,
                    explanation="Matching activity pairs.",
                    order=current_order,
                )
                current_order += 1

                assessment.total_marks = total_calc_marks or 30.0
                assessment.passing_threshold = 75.0
                assessment.readiness_gate = True
                assessment.save()

                return Response(
                    {
                        "message": "Successfully populated deterministic demo assessment content",
                        "assessment": AssessmentSerializer(assessment).data,
                        "questions_generated": assessment.questions.count(),
                        "mode": "deterministic_prebuilt_source_grounded",
                    },
                    status=status.HTTP_201_CREATED,
                )


class LecturerAssessmentsView(views.APIView):
    """List or create assessments for an assigned unit."""
    permission_classes = [IsLecturer]

    def get(self, request, unit_id):
        assessments = Assessment.objects.filter(unit_id=unit_id).order_by("week__week_number", "created_at")
        return Response(AssessmentSerializer(assessments, many=True).data)

    def post(self, request, unit_id):
        # Create new assessment manually
        title = request.data.get("title", "").strip()
        week_id = request.data.get("week_id")
        assessment_type = request.data.get("assessment_type", Assessment.AssessmentType.LAB)
        passing_threshold = float(request.data.get("passing_threshold", 75.0))
        total_marks = float(request.data.get("total_marks", 30.0))

        if not title:
            return Response({"error": "Title is required."}, status=status.HTTP_400_BAD_REQUEST)

        unit = Unit.objects.get(id=unit_id)
        semester = AcademicSemester.objects.filter(status=AcademicSemester.Status.ACTIVE).first()
        week = LearningWeek.objects.filter(id=week_id).first() if week_id else None

        assessment = Assessment.objects.create(
            unit=unit,
            semester=semester,
            week=week,
            title=title,
            description=request.data.get("description", ""),
            assessment_type=assessment_type,
            passing_threshold=passing_threshold,
            total_marks=total_marks,
            status=Assessment.Status.DRAFT,
        )

        return Response(AssessmentSerializer(assessment).data, status=status.HTTP_201_CREATED)


class LecturerAssessmentDetailView(views.APIView):
    """Retrieve and update assessment configuration, questions, marks, and publish status."""
    permission_classes = [IsLecturer]

    def get(self, request, assessment_id):
        try:
            assessment = Assessment.objects.select_related("unit", "week", "semester").get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({"error": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)

        data = AssessmentSerializer(assessment).data
        questions = assessment.questions.all().prefetch_related("options")
        data["questions"] = AssessmentQuestionReviewSerializer(questions, many=True).data
        return Response(data)

    def patch(self, request, assessment_id):
        try:
            assessment = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({"error": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AssessmentSerializer(assessment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_audit_trail(request, "UPDATE_ASSESSMENT", "Assessment", assessment.id, request.data)
            resp_data = serializer.data
            if request.data.get("status") == Assessment.Status.PUBLISHED:
                resp_data["message"] = "Publish successful"
            return Response(resp_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LecturerAssessmentPreviewView(views.APIView):
    """Preview assessment with answer keys, rubrics, and explanations visible to lecturer."""
    permission_classes = [IsLecturer]

    def get(self, request, assessment_id):
        try:
            assessment = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({"error": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)

        questions = assessment.questions.all().prefetch_related("options")
        return Response(
            {
                "assessment": AssessmentSerializer(assessment).data,
                "questions": AssessmentQuestionReviewSerializer(questions, many=True).data,
            }
        )


class LecturerQuestionsView(views.APIView):
    """Add new question with options to assessment."""
    permission_classes = [IsLecturer]

    def post(self, request, assessment_id):
        try:
            assessment = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({"error": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)

        prompt = request.data.get("prompt", "").strip()
        q_type = request.data.get("question_type", AssessmentQuestion.QuestionType.MCQ)
        marks = float(request.data.get("marks", 2.0))
        timer = int(request.data.get("timer_seconds", 10))
        topic_tag = request.data.get("topic_tag", "General")
        explanation = request.data.get("explanation", "")
        rubric = request.data.get("marking_rubric", "")
        options_data = request.data.get("options", [])
        matching_pairs = request.data.get("matching_pairs", [])

        if not prompt:
            return Response({"error": "Question prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

        order = assessment.questions.count() + 1
        q_obj = AssessmentQuestion.objects.create(
            assessment=assessment,
            question_type=q_type,
            prompt=prompt,
            marks=marks,
            timer_seconds=timer,
            topic_tag=topic_tag,
            explanation=explanation,
            marking_rubric=rubric,
            matching_pairs=matching_pairs,
            order=order,
        )

        for idx, opt in enumerate(options_data, 1):
            AssessmentOption.objects.create(
                question=q_obj,
                option_text=opt.get("option_text", ""),
                is_correct=opt.get("is_correct", False),
                order=idx,
            )

        return Response(AssessmentQuestionReviewSerializer(q_obj).data, status=status.HTTP_201_CREATED)


class LecturerQuestionDetailView(views.APIView):
    """Edit or delete a question."""
    permission_classes = [IsLecturer]

    def patch(self, request, question_id):
        try:
            q_obj = AssessmentQuestion.objects.get(id=question_id)
        except AssessmentQuestion.DoesNotExist:
            return Response({"error": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

        prompt = request.data.get("prompt")
        if prompt:
            q_obj.prompt = prompt
        if "marks" in request.data:
            q_obj.marks = float(request.data["marks"])
        if "timer_seconds" in request.data:
            q_obj.timer_seconds = int(request.data["timer_seconds"])
        if "topic_tag" in request.data:
            q_obj.topic_tag = request.data["topic_tag"]
        if "explanation" in request.data:
            q_obj.explanation = request.data["explanation"]
        if "marking_rubric" in request.data:
            q_obj.marking_rubric = request.data["marking_rubric"]
        q_obj.save()

        # Update options if provided
        if "options" in request.data:
            q_obj.options.all().delete()
            for idx, opt in enumerate(request.data["options"], 1):
                AssessmentOption.objects.create(
                    question=q_obj,
                    option_text=opt.get("option_text", ""),
                    is_correct=opt.get("is_correct", False),
                    order=idx,
                )

        return Response(AssessmentQuestionReviewSerializer(q_obj).data)

    def delete(self, request, question_id):
        try:
            q_obj = AssessmentQuestion.objects.get(id=question_id)
            q_obj.delete()
            return Response({"message": "Question deleted successfully."})
        except AssessmentQuestion.DoesNotExist:
            return Response({"error": "Question not found."}, status=status.HTTP_404_NOT_FOUND)


class LecturerUnitAnalyticsView(views.APIView):
    """
    CRITICAL: Real database-derived student analytics for the unit.
    Returns:
    - Enrolled students cohort with attempts count, scores, pass/fail status, needs retake flag.
    - Average score, pass rate.
    - Most missed questions ranking.
    - Weak topics frequency across cohort.
    - Clearly designates synthetic demo records.
    """
    permission_classes = [IsLecturer]

    def get(self, request, unit_id):
        try:
            unit = Unit.objects.get(id=unit_id)
        except Unit.DoesNotExist:
            return Response({"error": "Unit not found."}, status=status.HTTP_404_NOT_FOUND)

        # Enrolled students
        enrolments = StudentEnrolment.objects.filter(unit=unit, is_active=True).select_related("student")

        # Get Lab 1 assessment
        lab1 = Assessment.objects.filter(unit=unit, week__week_number=1).first()

        students_cohort = []
        scores_list = []
        pass_count = 0
        fail_count = 0
        not_attempted_count = 0

        for e in enrolments:
            student = e.student
            attempts = AssessmentAttempt.objects.filter(
                assessment=lab1,
                student=student,
                is_completed=True,
            ).order_by("-attempt_number")

            attempts_count = attempts.count()
            latest_att = attempts.first()
            best_att = attempts.order_by("-score").first()

            if attempts_count == 0:
                not_attempted_count += 1
                status_str = "NOT_ATTEMPTED"
                needs_retake = True
            elif best_att and best_att.passed:
                pass_count += 1
                status_str = "PASSED"
                needs_retake = False
                scores_list.append(best_att.percentage)
            else:
                fail_count += 1
                status_str = "FAILED"
                needs_retake = True
                if latest_att:
                    scores_list.append(latest_att.percentage)

            students_cohort.append(
                {
                    "student_id": student.id,
                    "student_name": student.get_full_name() or student.username,
                    "admission_number": student.admission_number,
                    "attempts_count": attempts_count,
                    "latest_score": latest_att.percentage if latest_att else None,
                    "best_score": best_att.percentage if best_att else None,
                    "status": status_str,
                    "needs_retake": needs_retake,
                    "is_demo_data": getattr(latest_att, "is_demo_data", True) if latest_att else False,
                }
            )

        avg_score = round(sum(scores_list) / len(scores_list), 1) if scores_list else 0.0
        total_assessed = pass_count + fail_count
        pass_rate = round(pass_count / total_assessed * 100.0, 1) if total_assessed > 0 else 0.0

        # Frequently missed questions
        missed_answers = StudentAnswer.objects.filter(
            attempt__assessment=lab1,
            is_correct=False,
        ).values("question__id", "question__prompt", "question__topic_tag").annotate(
            missed_count=Count("id")
        ).order_by("-missed_count")[:5]

        missed_questions = [
            {
                "question_id": m["question__id"],
                "prompt": m["question__prompt"][:80],
                "topic": m["question__topic_tag"],
                "missed_count": m["missed_count"],
            }
            for m in missed_answers
        ]

        # Topic weakness breakdown
        topic_weaknesses = StudentAnswer.objects.filter(
            attempt__assessment=lab1,
            is_correct=False,
        ).values("question__topic_tag").annotate(
            count=Count("id")
        ).order_by("-count")[:6]

        weak_topics = [{"topic": tw["question__topic_tag"], "count": tw["count"]} for tw in topic_weaknesses if tw["question__topic_tag"]]

        return Response(
            {
                "unit": {
                    "id": unit.id,
                    "code": unit.code,
                    "name": unit.name,
                },
                "assessment_title": lab1.title if lab1 else "Week 1 Lab",
                "cohort_stats": {
                    "total_enrolled": enrolments.count(),
                    "total_attempted": total_assessed,
                    "passed_count": pass_count,
                    "failed_count": fail_count,
                    "not_attempted_count": not_attempted_count,
                    "average_score": avg_score,
                    "pass_rate_percentage": pass_rate,
                },
                "cohort_students": students_cohort,
                "most_frequently_missed_questions": missed_questions,
                "weak_topics": weak_topics,
                "synthetic_data_notice": "Note: Demonstration cohort records are synthetically labeled for hackathon presentation.",
            }
        )


class LecturerFinalExamApprovalsView(views.APIView):
    """
    Final University Exam Eligibility & Approval Page:
    Shows students who have sat readiness assessment and allows lecturer sign-off.
    Pass mark is 35/60.
    """
    permission_classes = [IsLecturer]

    def get(self, request, unit_id):
        try:
            unit = Unit.objects.get(id=unit_id)
        except Unit.DoesNotExist:
            return Response({"error": "Unit not found."}, status=status.HTTP_404_NOT_FOUND)

        semester = AcademicSemester.objects.filter(status=AcademicSemester.Status.ACTIVE).first()
        readiness_assessment = Assessment.objects.filter(
            unit=unit,
            assessment_type=Assessment.AssessmentType.FINAL_READINESS,
        ).first()

        enrolments = StudentEnrolment.objects.filter(unit=unit, semester=semester, is_active=True).select_related("student")
        
        records = []
        passed_count = 0
        approved_count = 0
        pending_count = 0

        for enr in enrolments:
            student = enr.student
            is_real_demo_student = (student.admission_number == "RU-2026-041" or student.username == "akamau")
            is_synthetic = not is_real_demo_student

            attempts = []
            if readiness_assessment:
                attempts = list(AssessmentAttempt.objects.filter(
                    assessment=readiness_assessment,
                    student=student,
                    is_completed=True,
                ).order_by("-completed_at"))

            latest_attempt = attempts[0] if attempts else None
            eligibility = FinalExamEligibility.objects.filter(student=student, unit=unit, semester=semester).first()

            raw_score = latest_attempt.score if latest_attempt else 0.0
            total_marks = latest_attempt.total_marks if latest_attempt else 60.0
            percentage = latest_attempt.percentage if latest_attempt else 0.0
            final_passed = (raw_score >= 35.0) or (percentage >= 58.33)

            is_approved = eligibility.lecturer_approved if eligibility else False
            if is_approved:
                approved_count += 1
            elif final_passed:
                pending_count += 1

            if final_passed:
                passed_count += 1

            has_pending_review = False
            if latest_attempt:
                written_answers = StudentAnswer.objects.filter(
                    attempt=latest_attempt,
                    question__question_type=AssessmentQuestion.QuestionType.WRITTEN,
                )
                has_pending_review = any(ans.feedback.startswith("Needs manual review") for ans in written_answers)

            records.append({
                "student_id": student.id,
                "student_name": student.get_full_name() or student.username,
                "admission_number": student.admission_number or f"RU-2026-{student.id:03d}",
                "year_of_study": student.year_of_study or 2,
                "is_synthetic": is_synthetic,
                "data_label": "Demo data" if is_synthetic else "Real Student",
                "attempts_count": len(attempts),
                "final_test_score": round(percentage, 1) if latest_attempt else None,
                "raw_score": round(raw_score, 1) if latest_attempt else None,
                "total_marks": total_marks,
                "pass_threshold_marks": 35.0,
                "final_test_passed": final_passed,
                "has_pending_review": has_pending_review,
                "grading_status": "Pending Written Review" if has_pending_review else ("Graded (Finalized)" if latest_attempt else "No Attempts"),
                "is_approved_for_final_exam": is_approved,
                "approval_status": "approved" if is_approved else ("eligible" if final_passed else "not_qualified"),
                "approved_at": eligibility.approved_at if eligibility else None,
                "approved_by": eligibility.approved_by.get_full_name() if eligibility and eligibility.approved_by else None,
                "approval_notes": eligibility.notes if eligibility else "",
                "attempts_history": [
                    {
                        "attempt_number": att.attempt_number,
                        "score": att.score,
                        "total_marks": att.total_marks,
                        "percentage": att.percentage,
                        "passed": (att.score >= 35.0) or (att.percentage >= 58.33),
                        "completed_at": att.completed_at,
                    }
                    for att in attempts
                ],
            })

        records.sort(key=lambda r: (r["is_synthetic"], r["student_name"]))

        return Response({
            "unit": {"id": unit.id, "code": unit.code, "name": unit.name},
            "metrics": {
                "total_enrolled": len(enrolments),
                "final_test_passed_count": passed_count,
                "approved_for_exam_count": approved_count,
                "pending_approval_count": pending_count,
            },
            "records": records,
        })

    def post(self, request, unit_id):
        try:
            unit = Unit.objects.get(id=unit_id)
        except Unit.DoesNotExist:
            return Response({"error": "Unit not found."}, status=status.HTTP_404_NOT_FOUND)

        student_id = request.data.get("student_id")
        is_approved = request.data.get("is_approved", True) in [True, "true", "1", 1]
        notes = request.data.get("approval_notes", "").strip()

        try:
            student = User.objects.get(id=student_id, role=User.Role.STUDENT)
        except User.DoesNotExist:
            return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        is_real_demo_student = (student.admission_number == "RU-2026-041" or student.username == "akamau")
        if not is_real_demo_student and is_approved:
            return Response(
                {"error": "Validation Error: Demo data cannot be formally approved for university hall sitting."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        semester = AcademicSemester.objects.filter(status=AcademicSemester.Status.ACTIVE).first()
        readiness_assessment = Assessment.objects.filter(
            unit=unit,
            assessment_type=Assessment.AssessmentType.FINAL_READINESS,
        ).first()

        eligibility, _ = FinalExamEligibility.objects.get_or_create(
            student=student,
            unit=unit,
            semester=semester,
        )

        if is_approved:
            latest_attempt = AssessmentAttempt.objects.filter(
                assessment=readiness_assessment,
                student=student,
                is_completed=True,
            ).order_by("-completed_at").first()

            if not latest_attempt:
                return Response(
                    {"error": "Approval Denied: Student has not completed any final readiness test attempts."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            raw_score = latest_attempt.score
            percentage = latest_attempt.percentage
            qualifies = (raw_score >= 35.0) or (percentage >= 58.33)

            if not qualifies:
                return Response(
                    {
                        "error": f"Approval Denied: Student score ({raw_score:.1f}/60) does not meet the pass threshold of 35/60. Student must retake the readiness exam to qualify.",
                        "qualified": False,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            pending_written = StudentAnswer.objects.filter(
                attempt=latest_attempt,
                question__question_type=AssessmentQuestion.QuestionType.WRITTEN,
                feedback__startswith="Needs manual review",
            ).exists()
            if pending_written:
                return Response(
                    {"error": "Approval Denied: Student has pending written responses that must be graded before approval."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            eligibility.lecturer_approved = True
            eligibility.approved_at = timezone.now()
            eligibility.approved_by = request.user
            eligibility.status = FinalExamEligibility.Status.APPROVED
            eligibility.notes = notes or f"Successfully approved for the final exam by Faculty Instructor {request.user.get_full_name()}."
            eligibility.save()

            log_audit_trail(request, "EXAM_APPROVAL_APPROVED", "FinalExamEligibility", eligibility.id, {"student": student.username, "score": raw_score})

            return Response({
                "message": "Successfully approved for the final exam",
                "eligibility": FinalExamEligibilitySerializer(eligibility).data,
            })
        else:
            eligibility.lecturer_approved = False
            eligibility.status = FinalExamEligibility.Status.DISQUALIFIED
            eligibility.notes = notes or "Approval revoked by faculty pending coursework or retake."
            eligibility.save()

            log_audit_trail(request, "EXAM_APPROVAL_REVOKED", "FinalExamEligibility", eligibility.id, {"student": student.username})

            return Response({
                "message": "Approval status updated: not approved.",
                "eligibility": FinalExamEligibilitySerializer(eligibility).data,
            })


class LecturerApproveFinalExamView(views.APIView):
    """Formally approves student for university examination sitting."""
    permission_classes = [IsLecturer]

    def post(self, request, eligibility_id):
        try:
            eligibility = FinalExamEligibility.objects.select_related("student", "unit").get(id=eligibility_id)
        except FinalExamEligibility.DoesNotExist:
            return Response({"error": "Eligibility record not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action", "approve")
        notes = request.data.get("notes", "").strip()

        if action == "approve":
            student = eligibility.student
            is_real = (student.admission_number == "RU-2026-041" or student.username == "akamau")
            if not is_real:
                return Response({"error": "Cannot approve synthetic demo records."}, status=status.HTTP_400_BAD_REQUEST)

            latest_att = AssessmentAttempt.objects.filter(
                assessment__unit=eligibility.unit,
                assessment__assessment_type=Assessment.AssessmentType.FINAL_READINESS,
                student=student,
                is_completed=True,
            ).order_by("-completed_at").first()

            if not latest_att or (latest_att.score < 35.0 and latest_att.percentage < 58.33):
                score_str = f"{latest_att.score:.1f}/60" if latest_att else "0/60"
                return Response({"error": f"Student score ({score_str}) does not meet the 35/60 pass threshold."}, status=status.HTTP_400_BAD_REQUEST)

            pending_written = StudentAnswer.objects.filter(
                attempt=latest_att,
                question__question_type=AssessmentQuestion.QuestionType.WRITTEN,
                feedback__startswith="Needs manual review",
            ).exists()
            if pending_written:
                return Response(
                    {"error": "Approval Denied: Student has pending written responses that must be graded before approval."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            eligibility.lecturer_approved = True
            eligibility.approved_at = timezone.now()
            eligibility.approved_by = request.user
            eligibility.status = FinalExamEligibility.Status.APPROVED
            eligibility.notes = notes or f"Successfully approved for the final exam by Faculty Instructor {request.user.get_full_name()}."
            eligibility.save()
            log_audit_trail(request, "EXAM_APPROVAL_APPROVE", "FinalExamEligibility", eligibility.id)
            return Response({
                "message": "Successfully approved for the final exam",
                "eligibility": FinalExamEligibilitySerializer(eligibility).data,
            })
        else:
            eligibility.lecturer_approved = False
            eligibility.status = FinalExamEligibility.Status.DISQUALIFIED
            eligibility.notes = notes or "Disqualified by lecturer pending retake or missing coursework."
            eligibility.save()
            log_audit_trail(request, "EXAM_APPROVAL_DISQUALIFY", "FinalExamEligibility", eligibility.id)
            return Response({
                "message": "Approval status updated: disqualified.",
                "eligibility": FinalExamEligibilitySerializer(eligibility).data,
            })


class LecturerGenerateExamReadinessView(views.APIView):
    """
    EXAM READINESS ASSESSMENT BUILDER
    Generates 60 questions for the Unit Capstone Final Exam Readiness Test.
    Combines MCQs and Written questions grounded in syllabus & weak areas (like UML).
    Sets total_marks = 60.0, passing_threshold = 58.33 (35/60 pass mark).
    """
    permission_classes = [IsLecturer]

    def post(self, request, unit_id):
        try:
            unit = Unit.objects.get(id=unit_id)
        except Unit.DoesNotExist:
            return Response({"error": "Unit not found."}, status=status.HTTP_404_NOT_FOUND)

        is_assigned = LecturerAssignment.objects.filter(
            lecturer=request.user,
            unit=unit,
            is_active=True,
        ).exists()
        if not is_assigned and not request.user.is_admin_user:
            return Response({"error": "Access Denied: You are not assigned to this unit."}, status=status.HTTP_403_FORBIDDEN)

        semester = AcademicSemester.objects.filter(status=AcademicSemester.Status.ACTIVE).first()
        assessment = Assessment.objects.filter(
            unit=unit,
            assessment_type=Assessment.AssessmentType.FINAL_READINESS,
        ).first()
        if not assessment:
            assessment = Assessment.objects.create(
                unit=unit,
                semester=semester,
                title=f"{unit.code} Final Exam Readiness Assessment",
                description="Comprehensive 60-question timed evaluation. Passing mark 35/60.",
                assessment_type=Assessment.AssessmentType.FINAL_READINESS,
                total_marks=60.0,
                passing_threshold=58.33,
                status=Assessment.Status.DRAFT,
            )

        topics = request.data.get("topics") or [
            "SDLC Methodologies & Architecture",
            "Requirements Engineering & Specification",
            "Software Architecture & Design Patterns",
            "Verification, Validation & Testing",
            "Project Management & Evolution",
        ]
        weak_areas = request.data.get("weak_areas") or [
            "Unified Modeling Language (UML) Diagrams",
            "Design Patterns & Object-Orientation",
            "Boundary Value & Integration Testing",
        ]
        mcq_count = int(request.data.get("mcq_count", 45))
        written_count = int(request.data.get("written_count", 15))
        difficulty = request.data.get("difficulty", "medium")

        from .gemini_service import generate_exam_readiness_questions, GeminiError
        try:
            payload = generate_exam_readiness_questions(
                unit=unit,
                topics=topics,
                weak_areas=weak_areas,
                mcq_count=mcq_count,
                written_count=written_count,
                difficulty=difficulty,
            )
        except GeminiError as exc:
            return Response({"error": exc.message}, status=exc.http_status)
        except Exception as exc:
            return Response({"error": f"Readiness generation failed: {str(exc)}"}, status=status.HTTP_502_BAD_GATEWAY)

        with transaction.atomic():
            assessment.questions.all().delete()
            current_order = 1

            for mcq in payload.get("mcqs", []):
                q_obj = AssessmentQuestion.objects.create(
                    assessment=assessment,
                    question_type=AssessmentQuestion.QuestionType.MCQ,
                    prompt=mcq["prompt"],
                    marks=1.0,
                    timer_seconds=int(mcq.get("timer_seconds", 60)),
                    topic_tag=mcq.get("topic_tag", "Exam Readiness"),
                    explanation=mcq.get("explanation", ""),
                    order=current_order,
                )
                current_order += 1
                for opt_idx, opt in enumerate(mcq.get("options", []), 1):
                    opt_text = opt.get("option_text") or opt.get("text", "")
                    AssessmentOption.objects.create(
                        question=q_obj,
                        option_text=opt_text,
                        is_correct=bool(opt.get("is_correct", False)),
                        order=opt_idx,
                    )

            for wr in payload.get("written", []):
                AssessmentQuestion.objects.create(
                    assessment=assessment,
                    question_type=AssessmentQuestion.QuestionType.WRITTEN,
                    prompt=wr["prompt"],
                    marks=1.0,
                    timer_seconds=int(wr.get("timer_seconds", 120)),
                    topic_tag=wr.get("topic_tag", "Exam Readiness Scenario"),
                    marking_rubric=wr.get("marking_rubric", ""),
                    explanation=wr.get("explanation", ""),
                    order=current_order,
                )
                current_order += 1

            assessment.total_marks = 60.0
            assessment.passing_threshold = 58.33  # 35/60
            assessment.status = Assessment.Status.DRAFT
            assessment.save()

            log_audit_trail(
                request,
                "GENERATE_EXAM_READINESS_QUESTIONS",
                "Assessment",
                assessment.id,
                {"questions_count": assessment.questions.count(), "weak_areas": weak_areas},
            )

        return Response(
            {
                "message": f"Successfully generated {assessment.questions.count()} readiness questions focused on {', '.join(weak_areas)}.",
                "assessment": AssessmentSerializer(assessment).data,
                "questions_generated": assessment.questions.count(),
            },
            status=status.HTTP_201_CREATED,
        )


class LecturerAssessmentMaterialsView(views.APIView):
    """
    Lists and uploads materials associated with a specific assessment / SDLC lab.
    """
    permission_classes = [IsLecturer]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, assessment_id):
        try:
            assessment = Assessment.objects.select_related("unit", "week").get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({"error": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)

        is_assigned = LecturerAssignment.objects.filter(
            lecturer=request.user,
            unit=assessment.unit,
            is_active=True,
        ).exists()
        if not is_assigned and not request.user.is_admin_user:
            return Response({"error": "Access Denied: You are not assigned to this unit."}, status=status.HTTP_403_FORBIDDEN)

        q = Q(assessment=assessment)
        if assessment.week:
            q |= Q(week=assessment.week)
        materials = LearningMaterial.objects.filter(q).distinct().order_by("-created_at")

        return Response(LearningMaterialSerializer(materials, many=True, context={"request": request}).data)

    def post(self, request, assessment_id):
        try:
            assessment = Assessment.objects.select_related("unit", "week").get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({"error": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)

        is_assigned = LecturerAssignment.objects.filter(
            lecturer=request.user,
            unit=assessment.unit,
            is_active=True,
        ).exists()
        if not is_assigned and not request.user.is_admin_user:
            return Response({"error": "Access Denied: You are not assigned to this unit."}, status=status.HTTP_403_FORBIDDEN)

        week = assessment.week
        if not week:
            week = LearningWeek.objects.filter(unit=assessment.unit).first()

        material_type = request.data.get("material_type", "notes")
        title = request.data.get("title", "").strip()
        description = request.data.get("description", "").strip()
        content = request.data.get("content", "").strip() or request.data.get("content_text", "").strip()
        url = request.data.get("url", "").strip() or request.data.get("youtube_url", "").strip()
        uploaded_file = request.FILES.get("file")

        if not title:
            if uploaded_file:
                title = os.path.splitext(uploaded_file.name)[0].replace("_", " ").title()
            else:
                return Response({"error": "Title is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate uploaded file format and header upfront
        if uploaded_file:
            from rest_framework.exceptions import ValidationError
            from security.utils import validate_and_save_upload
            try:
                validate_and_save_upload(uploaded_file, upload_subdir="materials")
            except ValidationError as ve:
                err_msg = ve.detail[0] if isinstance(ve.detail, list) and ve.detail else str(ve.detail)
                return Response({"error": err_msg}, status=status.HTTP_400_BAD_REQUEST)

        if uploaded_file and material_type == "notes":
            file_ext = os.path.splitext(uploaded_file.name)[1].lower()
            if file_ext == ".pdf":
                material_type = LearningMaterial.MaterialType.PDF
            elif file_ext == ".docx":
                material_type = LearningMaterial.MaterialType.DOCX
            elif file_ext == ".txt":
                material_type = LearningMaterial.MaterialType.TXT
            elif file_ext in [".png", ".jpg", ".jpeg", ".webp"]:
                material_type = LearningMaterial.MaterialType.IMAGE

        material = LearningMaterial(
            week=week,
            assessment=assessment,
            uploaded_by=request.user,
            title=title,
            description=description,
            material_type=material_type,
            file=uploaded_file,
            url=url,
            content=content,
            is_published=True,
        )
        material.save()

        process_uploaded_material(material, uploaded_file)

        log_audit_trail(
            request,
            "UPLOAD_ASSESSMENT_MATERIAL",
            "LearningMaterial",
            material.id,
            {"assessment": assessment.id, "title": title, "status": material.processing_status},
        )

        return Response(LearningMaterialSerializer(material, context={"request": request}).data, status=status.HTTP_201_CREATED)


class LecturerGenerateGroundedQuestionsView(views.APIView):
    """
    Generates assessment questions grounded strictly in selected teaching materials.
    Validates material processing status, question count, difficulty, and question types.
    Updates Assessment questions atomically in PostgreSQL.
    """
    permission_classes = [IsLecturer]

    def post(self, request, assessment_id):
        try:
            assessment = Assessment.objects.select_related("unit", "week", "semester").get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response({"error": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Verify lecturer assignment
        is_assigned = LecturerAssignment.objects.filter(
            lecturer=request.user,
            unit=assessment.unit,
            is_active=True,
        ).exists()
        if not is_assigned and not request.user.is_admin_user:
            return Response(
                {"error": "Access Denied: You are not assigned to manage assessments for this unit."},
                status=status.HTTP_403_FORBIDDEN,
            )

        week_number = assessment.week.week_number if assessment.week else 1

        # SDLC Lab 1 (Week 1): strictly local pre-built content with NO Gemini or paid API calls
        if week_number == 1 or assessment.id == 1:
            selected_modes = request.data.get("modes") or request.data.get("selected_modes") or request.data.get("question_types")
            activities = get_prepared_sdlc_activities(selected_modes)

            with transaction.atomic():
                assessment.questions.all().delete()
                current_order = 1
                total_calc_marks = 0.0

                for mcq in activities.get("mcqs", []):
                    q_marks = float(mcq.get("marks", 1.0))
                    total_calc_marks += q_marks
                    q_obj = AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.MCQ,
                        prompt=mcq["prompt"],
                        marks=q_marks,
                        timer_seconds=int(mcq.get("timer_seconds", 15)),
                        topic_tag=mcq.get("topic_tag", "SDLC Fundamentals"),
                        explanation=mcq.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1
                    for opt_idx, opt_data in enumerate(mcq.get("options", []), 1):
                        AssessmentOption.objects.create(
                            question=q_obj,
                            option_text=opt_data["text"],
                            is_correct=bool(opt_data.get("is_correct", False)),
                            order=opt_idx,
                        )

                for fc in activities.get("flashcards", []):
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.FLASHCARD,
                        prompt=fc["prompt"],
                        marks=float(fc.get("marks", 0.0)),
                        timer_seconds=int(fc.get("timer_seconds", 10)),
                        topic_tag=fc.get("topic_tag", "Flashcards"),
                        explanation=fc.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                sc = activities.get("scenario")
                if sc:
                    sc_marks = float(sc.get("marks", 2.0))
                    total_calc_marks += sc_marks
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.WRITTEN,
                        prompt=sc["prompt"],
                        marks=sc_marks,
                        timer_seconds=int(sc.get("timer_seconds", 25)),
                        topic_tag=sc.get("topic_tag", "What Would You Do? Scenario"),
                        marking_rubric=sc.get("marking_rubric", ""),
                        explanation=sc.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                dd = activities.get("drag_drop")
                if dd:
                    dd_marks = float(dd.get("marks", 3.0))
                    total_calc_marks += dd_marks
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.DRAG_DROP,
                        prompt=dd["prompt"],
                        marks=dd_marks,
                        timer_seconds=int(dd.get("timer_seconds", 20)),
                        topic_tag=dd.get("topic_tag", "Drag & Drop"),
                        matching_pairs=dd.get("matching_pairs", []),
                        explanation=dd.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                mt = activities.get("matching")
                if mt:
                    mt_marks = float(mt.get("marks", 6.0))
                    total_calc_marks += mt_marks
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_type=AssessmentQuestion.QuestionType.MATCHING,
                        prompt=mt["prompt"],
                        marks=mt_marks,
                        timer_seconds=int(mt.get("timer_seconds", 30)),
                        topic_tag=mt.get("topic_tag", "Matching Exercise"),
                        matching_pairs=mt.get("matching_pairs", []),
                        explanation=mt.get("explanation", ""),
                        order=current_order,
                    )
                    current_order += 1

                assessment.total_marks = total_calc_marks or 16.0
                assessment.passing_threshold = 66.67
                assessment.readiness_gate = True
                assessment.status = Assessment.Status.DRAFT
                assessment.save()

            return Response(
                {
                    "message": "Prepared SDLC activities generated successfully",
                    "assessment": AssessmentSerializer(assessment).data,
                    "questions_generated": assessment.questions.count(),
                    "selected_modes": selected_modes,
                    "group_work_selected": activities.get("group_work_selected", False),
                    "mode": "prepared_local_sdlc",
                },
                status=status.HTTP_201_CREATED,
            )

        material_ids = request.data.get("material_ids", [])
        if isinstance(material_ids, str):
            try:
                import json
                material_ids = json.loads(material_ids)
            except Exception:
                material_ids = [int(x.strip()) for x in material_ids.split(",") if x.strip().isdigit()]
        elif hasattr(request.data, "getlist") and not material_ids:
            raw_list = request.data.getlist("material_ids") or request.data.getlist("material_ids[]")
            material_ids = [int(x) for x in raw_list if str(x).isdigit()]

        if not material_ids or not isinstance(material_ids, list):
            return Response(
                {"error": "Please select at least one successfully processed teaching material for question generation."},
                status=status.HTTP_400_BAD_REQUEST,
            )


        materials = list(LearningMaterial.objects.filter(id__in=material_ids))
        if len(materials) != len(material_ids):
            return Response(
                {"error": "One or more selected materials could not be found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for m in materials:
            if m.week.unit_id != assessment.unit_id:
                return Response(
                    {"error": f"Material '{m.title}' does not belong to this academic unit."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if m.processing_status != LearningMaterial.ProcessingStatus.PROCESSED:
                return Response(
                    {
                        "error": f"Material '{m.title}' is not ready (status: {m.processing_status}). Only processed materials can be used for question generation."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        topic = request.data.get("topic", "").strip() or assessment.title
        difficulty = request.data.get("difficulty", "medium").strip().lower()
        question_count = int(request.data.get("question_count", 10))
        question_types = request.data.get("question_types") or ["mcq", "flashcard", "written", "matching"]
        append_mode = request.data.get("append", False) in [True, "true", "1"]

        week_number = assessment.week.week_number if assessment.week else 1

        try:
            payload = generate_grounded_questions(
                unit=assessment.unit,
                week_number=week_number,
                materials=materials,
                topic=topic,
                difficulty=difficulty,
                question_count=question_count,
                question_types=question_types,
            )
        except GeminiError as exc:
            return Response({"error": exc.message}, status=exc.http_status)
        except Exception as exc:
            return Response({"error": "Failed to generate grounded questions from AI provider."}, status=status.HTTP_502_BAD_GATEWAY)

        with transaction.atomic():
            if not append_mode:
                assessment.questions.all().delete()
                current_order = 1
            else:
                last_q = assessment.questions.order_by("-order").first()
                current_order = (last_q.order + 1) if last_q else 1

            # Populate MCQs
            for mcq in payload.get("mcqs", []):
                q_obj = AssessmentQuestion.objects.create(
                    assessment=assessment,
                    question_type=AssessmentQuestion.QuestionType.MCQ,
                    prompt=mcq["prompt"],
                    marks=float(mcq.get("marks", 2.0)),
                    timer_seconds=int(mcq.get("timer_seconds", 15)),
                    topic_tag=mcq.get("topic_tag", topic[:100]),
                    explanation=mcq.get("explanation", ""),
                    order=current_order,
                )
                current_order += 1
                for opt_idx, opt in enumerate(mcq.get("options", []), 1):
                    opt_text = opt.get("option_text") or opt.get("text", "")
                    AssessmentOption.objects.create(
                        question=q_obj,
                        option_text=opt_text,
                        is_correct=bool(opt.get("is_correct", False)),
                        order=opt_idx,
                    )

            # Populate Flashcards
            for fc in payload.get("flashcards", []):
                AssessmentQuestion.objects.create(
                    assessment=assessment,
                    question_type=AssessmentQuestion.QuestionType.FLASHCARD,
                    prompt=fc["prompt"],
                    marks=float(fc.get("marks", 1.0)),
                    timer_seconds=int(fc.get("timer_seconds", 10)),
                    topic_tag=fc.get("topic_tag", topic[:100]),
                    explanation=fc.get("explanation", ""),
                    order=current_order,
                )
                current_order += 1

            # Populate Written
            for wr in payload.get("written", []):
                AssessmentQuestion.objects.create(
                    assessment=assessment,
                    question_type=AssessmentQuestion.QuestionType.WRITTEN,
                    prompt=wr["prompt"],
                    marks=float(wr.get("marks", 2.0)),
                    timer_seconds=int(wr.get("timer_seconds", 45)),
                    topic_tag=wr.get("topic_tag", topic[:100]),
                    explanation=wr.get("explanation", ""),
                    marking_rubric=wr.get("marking_rubric", ""),
                    order=current_order,
                )
                current_order += 1

            # Populate Matching
            if payload.get("matching_pairs"):
                AssessmentQuestion.objects.create(
                    assessment=assessment,
                    question_type=AssessmentQuestion.QuestionType.MATCHING,
                    prompt="Match each software engineering concept with its accurate definition:",
                    marks=4.0,
                    timer_seconds=60,
                    topic_tag=topic[:100],
                    matching_pairs=payload["matching_pairs"],
                    order=current_order,
                )
                current_order += 1

            assessment.status = Assessment.Status.DRAFT
            assessment.save()

            log_audit_trail(
                request,
                "GENERATE_GROUNDED_QUESTIONS",
                "Assessment",
                assessment.id,
                {
                    "unit": assessment.unit.code,
                    "materials_count": len(materials),
                    "questions_created": assessment.questions.count(),
                    "topic": topic,
                    "difficulty": difficulty,
                },
            )

        return Response(
            {
                "message": f"Successfully generated questions grounded in {len(materials)} teaching material(s).",
                "assessment": AssessmentSerializer(assessment).data,
                "questions_generated": assessment.questions.count(),
                "mode": "grounded_gemini",
            },
            status=status.HTTP_201_CREATED,
        )


class LecturerRegenerateQuestionView(views.APIView):
    """
    Regenerates a single question with Gemini AI, grounded in unit materials.
    Preserves marks and updates options/rubric atomically.
    """
    permission_classes = [IsLecturer]

    def post(self, request, question_id):
        try:
            question = AssessmentQuestion.objects.select_related("assessment__unit", "assessment__week").get(id=question_id)
        except AssessmentQuestion.DoesNotExist:
            return Response({"error": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

        assessment = question.assessment
        is_assigned = LecturerAssignment.objects.filter(
            lecturer=request.user,
            unit=assessment.unit,
            is_active=True,
        ).exists()
        if not is_assigned and not request.user.is_admin_user:
            return Response({"error": "Access Denied: You are not assigned to manage this unit."}, status=status.HTTP_403_FORBIDDEN)

        material_ids = request.data.get("material_ids", [])
        materials = []
        if material_ids:
            materials = list(LearningMaterial.objects.filter(id__in=material_ids, week__unit=assessment.unit))
        elif assessment.week:
            materials = list(assessment.week.materials.filter(processing_status=LearningMaterial.ProcessingStatus.PROCESSED))

        try:
            new_data = regenerate_single_question(question, materials=materials)
        except GeminiError as exc:
            return Response({"error": exc.message}, status=exc.http_status)
        except Exception as exc:
            return Response({"error": "Failed to regenerate question via AI provider."}, status=status.HTTP_502_BAD_GATEWAY)

        with transaction.atomic():
            question.prompt = new_data["prompt"]
            question.explanation = new_data.get("explanation", "")
            if "marking_rubric" in new_data:
                question.marking_rubric = new_data["marking_rubric"]
            if "matching_pairs" in new_data:
                question.matching_pairs = new_data["matching_pairs"]
            question.save()

            if question.question_type == AssessmentQuestion.QuestionType.MCQ and "options" in new_data:
                question.options.all().delete()
                for idx, opt in enumerate(new_data["options"], 1):
                    opt_text = opt.get("option_text") or opt.get("text", "")
                    AssessmentOption.objects.create(
                        question=question,
                        option_text=opt_text,
                        is_correct=bool(opt.get("is_correct", False)),
                        order=idx,
                    )

            log_audit_trail(request, "REGENERATE_QUESTION", "AssessmentQuestion", question.id)

        return Response(AssessmentQuestionReviewSerializer(question).data)

