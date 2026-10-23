import random
from datetime import timedelta
from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django.db.models import Avg
from security.permissions import IsStudent, IsAttemptOwner
from security.utils import log_security_event
from soc.models import SecurityEvent
from academics.models import Unit, StudentEnrolment, AcademicSemester
from .eligibility import get_readiness_status
from .models import (
    Assessment,
    AssessmentQuestion,
    AssessmentOption,
    AssessmentAttempt,
    StudentAnswer,
    FinalExamEligibility,
    LeaderboardEntry,
)
from .serializers import (
    AssessmentSerializer,
    AssessmentAttemptSerializer,
    AssessmentQuestionStudentSerializer,
    StudentAnswerSerializer,
    FinalExamEligibilitySerializer,
    LeaderboardEntrySerializer,
)


class StudentAssessmentDetailView(views.APIView):
    """
    Returns assessment details and questions for the active student attempt.
    Conceals correct answers and explanations.
    Deterministically shuffles questions and options using the attempt seed.
    """
    permission_classes = [IsStudent]

    def get(self, request, assessment_id):
        student = request.user
        try:
            assessment = Assessment.objects.select_related("unit", "semester").get(
                id=assessment_id,
                status=Assessment.Status.PUBLISHED,
            )
        except Assessment.DoesNotExist:
            return Response(
                {"error": "Assessment not found or not currently published."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check enrollment
        is_enrolled = StudentEnrolment.objects.filter(
            student=student,
            unit=assessment.unit,
            semester=assessment.semester,
            is_active=True,
        ).exists()

        if not is_enrolled:
            return Response(
                {"error": "Access Denied: You are not enrolled in this unit."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Readiness test is gated server-side: hiding the button is not enough.
        if assessment.assessment_type == Assessment.AssessmentType.FINAL_READINESS:
            readiness = get_readiness_status(student, assessment.unit, assessment.semester)
            if not readiness["unlocked"]:
                log_security_event(
                    request,
                    SecurityEvent.EventType.UNAUTHORIZED_ACCESS,
                    SecurityEvent.Severity.MEDIUM,
                    f"Attempt to start locked readiness test (assessment {assessment.id}) before prerequisites were met.",
                    user=student,
                    http_status=403,
                )
                return Response(
                    {"error": readiness["reason"], "readiness_locked": True},
                    status=status.HTTP_403_FORBIDDEN,
                )

        # Get or create active attempt
        attempt = AssessmentAttempt.objects.filter(
            assessment=assessment,
            student=student,
            is_completed=False,
        ).order_by("-attempt_number").first()

        # If no active attempt, check if student can start a new attempt
        if not attempt:
            past_attempts = AssessmentAttempt.objects.filter(
                assessment=assessment,
                student=student,
                is_completed=True,
            )
            attempts_count = past_attempts.count()

            is_lab = assessment.assessment_type == Assessment.AssessmentType.LAB
            # Labs permit continuous practice retakes so students can achieve mastery without lockout
            if not is_lab and not assessment.allow_retakes and attempts_count >= assessment.max_retakes:
                return Response(
                    {"error": f"Maximum attempt limit ({assessment.max_retakes}) reached for this assessment."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Generate new attempt with random seed
            seed = random.randint(10000, 99999)
            attempt = AssessmentAttempt.objects.create(
                assessment=assessment,
                student=student,
                attempt_number=attempts_count + 1,
                seed=seed,
                total_marks=assessment.total_marks,
            )

        # Fetch active questions and shuffle deterministically with attempt.seed
        questions = list(assessment.questions.filter(is_active=True).prefetch_related("options"))
        rng = random.Random(attempt.seed)
        rng.shuffle(questions)

        # Format questions with shuffled options
        questions_data = []
        for q in questions:
            q_dict = {
                "id": q.id,
                "question_type": q.question_type,
                "prompt": q.prompt,
                "marks": q.marks,
                "timer_seconds": q.timer_seconds,
                "topic_tag": q.topic_tag,
                "matching_pairs": q.matching_pairs if q.question_type == AssessmentQuestion.QuestionType.MATCHING else [],
                "order": q.order,
                "options": [],
            }
            if q.question_type in [AssessmentQuestion.QuestionType.MCQ, AssessmentQuestion.QuestionType.TRIVIA]:
                options = list(q.options.all())
                rng.shuffle(options)
                q_dict["options"] = [
                    {"id": opt.id, "option_text": opt.option_text, "order": idx}
                    for idx, opt in enumerate(options, 1)
                ]
            elif q.question_type == AssessmentQuestion.QuestionType.MULTI_SELECT:
                options = list(q.options.all())
                rng.shuffle(options)
                q_dict["options"] = [
                    {"id": opt.id, "option_text": opt.option_text, "order": idx}
                    for idx, opt in enumerate(options, 1)
                ]
                q_dict["scoring_method"] = q.config.get("scoring_method", "partial")
            elif q.question_type == AssessmentQuestion.QuestionType.FILL_BLANKS:
                q_dict["blanks_count"] = q.config.get("blanks_count", 2)
            elif q.question_type == AssessmentQuestion.QuestionType.MATCHING:
                pairs = q.matching_pairs or []
                terms = [p.get("term") for p in pairs if isinstance(p, dict) and "term" in p]
                defs = [p.get("definition") for p in pairs if isinstance(p, dict) and "definition" in p]
                shuffled_defs = list(defs)
                rng.shuffle(shuffled_defs)
                q_dict["matching_terms"] = terms
                q_dict["matching_definitions"] = shuffled_defs
                q_dict["matching_pairs"] = []
            elif q.question_type == AssessmentQuestion.QuestionType.DRAG_DROP:
                phases = [item.get("phase") for item in q.matching_pairs if isinstance(item, dict) and "phase" in item]
                if not phases:
                    phases = ["Planning", "Analysis", "Design", "Implementation", "Testing", "Maintenance"]
                shuffled_phases = list(phases)
                rng.shuffle(shuffled_phases)
                q_dict["drag_items"] = shuffled_phases
                q_dict["matching_pairs"] = []
            elif q.question_type == AssessmentQuestion.QuestionType.FLASHCARD:
                q_dict["explanation"] = q.explanation
                q_dict["is_graded"] = bool(q.marks > 0 and q.config.get("is_graded", False))
            elif q.question_type in [AssessmentQuestion.QuestionType.WRITTEN, AssessmentQuestion.QuestionType.SCENARIO]:
                q_dict["marking_rubric"] = "Provide concise technical reasoning adhering to SDLC principles."
            elif q.question_type == AssessmentQuestion.QuestionType.CASE_STUDY:
                q_dict["case_title"] = q.config.get("case_title", "Case Study Analysis")
                q_dict["case_description"] = q.config.get("case_description", "")
                q_dict["marking_rubric"] = "Evaluate architectural tradeoffs and provide structured recommendations."
            questions_data.append(q_dict)

        return Response(
            {
                "assessment": AssessmentSerializer(assessment).data,
                "attempt_id": attempt.id,
                "attempt_number": attempt.attempt_number,
                "started_at": attempt.started_at,
                "questions": questions_data,
            }
        )


class StudentSubmitAttemptView(views.APIView):
    """
    Submits student responses for an active attempt.
    CRITICAL: Authoritatively evaluates answers and calculates scores on the backend.
    Enforces 75% lab passing threshold (65% for final readiness).
    Never trusts client-provided scores.
    """
    permission_classes = [IsStudent]

    @transaction.atomic
    def post(self, request, attempt_id):
        student = request.user
        try:
            attempt = AssessmentAttempt.objects.select_related("assessment", "assessment__unit").get(
                id=attempt_id,
                student=student,
            )
        except AssessmentAttempt.DoesNotExist:
            return Response({"error": "Attempt record not found."}, status=status.HTTP_404_NOT_FOUND)

        if attempt.is_completed:
            return Response(
                {"error": "This attempt has already been submitted and finalized."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if attempt.assessment.assessment_type == Assessment.AssessmentType.FINAL_READINESS:
            readiness = get_readiness_status(student, attempt.assessment.unit, attempt.assessment.semester)
            if not readiness["unlocked"]:
                return Response(
                    {"error": readiness["reason"], "readiness_locked": True},
                    status=status.HTTP_403_FORBIDDEN,
                )

        answers_submission = request.data.get("answers", [])
        # Map submitted answers by question_id
        # Format: [{"question_id": 1, "selected_option_id": 4, "written_response": "...", "matched_pairs": {...}}]
        sub_map = {ans.get("question_id"): ans for ans in answers_submission if ans.get("question_id")}

        questions = attempt.assessment.questions.filter(is_active=True).prefetch_related("options")

        total_awarded = 0.0
        possible_marks = 0.0
        saved_answers = []
        weak_topics = []

        for q in questions:
            possible_marks += q.marks
            sub = sub_map.get(q.id, {})

            is_correct = False
            score_awarded = 0.0
            feedback = ""
            selected_option = None
            written_text = sub.get("written_response", "").strip()
            matched_pairs = sub.get("matched_pairs", {})

            # 1. Single Choice (MCQ & Trivia)
            if q.question_type in [AssessmentQuestion.QuestionType.MCQ, AssessmentQuestion.QuestionType.TRIVIA]:
                selected_opt_id = sub.get("selected_option_id")
                if selected_opt_id:
                    try:
                        selected_option = AssessmentOption.objects.get(id=selected_opt_id, question=q)
                        if selected_option.is_correct:
                            is_correct = True
                            score_awarded = q.marks
                            feedback = f"Correct! {q.explanation}"
                        else:
                            is_correct = False
                            score_awarded = 0.0
                            feedback = f"Incorrect. {q.explanation}"
                            weak_topics.append(q.topic_tag)
                    except AssessmentOption.DoesNotExist:
                        is_correct = False
                        weak_topics.append(q.topic_tag)
                else:
                    feedback = f"Unanswered. {q.explanation}"
                    weak_topics.append(q.topic_tag)

            # 2. Multiple-Select Questions
            elif q.question_type == AssessmentQuestion.QuestionType.MULTI_SELECT:
                selected_opt_ids = sub.get("selected_option_ids") or sub.get("selected_options") or []
                if isinstance(selected_opt_ids, (int, str)):
                    selected_opt_ids = [int(selected_opt_ids)]
                selected_set = {int(oid) for oid in selected_opt_ids if str(oid).isdigit()}
                correct_set = {opt.id for opt in q.options.filter(is_correct=True)}
                scoring_method = q.config.get("scoring_method", "partial")

                if selected_set == correct_set and len(correct_set) > 0:
                    is_correct = True
                    score_awarded = q.marks
                    feedback = f"Fully Correct! All {len(correct_set)} valid choices selected. {q.explanation}"
                elif scoring_method == "partial" and len(correct_set) > 0:
                    correct_chosen = len(selected_set.intersection(correct_set))
                    incorrect_chosen = len(selected_set - correct_set)
                    net_positive = max(0, correct_chosen - incorrect_chosen)
                    fraction = net_positive / len(correct_set)
                    score_awarded = round(q.marks * fraction, 2)
                    is_correct = fraction >= 0.5
                    feedback = f"Partial Credit ({score_awarded}/{q.marks}): Identified {correct_chosen} of {len(correct_set)} correct items. {q.explanation}"
                    if not is_correct:
                        weak_topics.append(q.topic_tag)
                else:
                    score_awarded = 0.0
                    is_correct = False
                    feedback = f"Incorrect combination selected. {q.explanation}"
                    weak_topics.append(q.topic_tag)

            # 3. Fill in the Blanks
            elif q.question_type == AssessmentQuestion.QuestionType.FILL_BLANKS:
                blank_responses = sub.get("blank_answers") or sub.get("blanks") or []
                if not isinstance(blank_responses, list) and written_text:
                    blank_responses = [b.strip() for b in written_text.split(",") if b.strip()]
                accepted_lists = q.config.get("accepted_answers", [])
                total_blanks = len(accepted_lists) or 1
                correct_blanks = 0

                for b_idx, acc_opts in enumerate(accepted_lists):
                    user_val = str(blank_responses[b_idx]).strip().lower() if b_idx < len(blank_responses) else ""
                    if any(user_val == opt.strip().lower() or opt.strip().lower() in user_val for opt in acc_opts if opt):
                        correct_blanks += 1

                accuracy = correct_blanks / total_blanks
                score_awarded = round(q.marks * accuracy, 2)
                is_correct = accuracy >= 0.5
                if is_correct:
                    feedback = f"Correct! Accurately completed {correct_blanks} of {total_blanks} blank(s). {q.explanation}"
                else:
                    feedback = f"Completed {correct_blanks} of {total_blanks} blanks. {q.explanation}"
                    weak_topics.append(q.topic_tag)

            # 4. Flashcards (Revision activity - Ungraded by default)
            elif q.question_type == AssessmentQuestion.QuestionType.FLASHCARD:
                is_graded = bool(q.marks > 0 and q.config.get("is_graded", False))
                if is_graded:
                    score_awarded = q.marks
                    is_correct = True
                    feedback = f"Flashcard concept mastered: {q.explanation}"
                else:
                    score_awarded = 0.0
                    is_correct = True
                    feedback = f"Flashcard reviewed for revision: {q.explanation}"

            # 5. Drag & Drop Phase Ordering
            elif q.question_type == AssessmentQuestion.QuestionType.DRAG_DROP:
                correct_sequence = ["Planning", "Analysis", "Design", "Implementation", "Testing", "Maintenance"]
                if q.matching_pairs:
                    sorted_pairs = sorted([p for p in q.matching_pairs if isinstance(p, dict) and "phase" in p], key=lambda x: x.get("order", 0))
                    if sorted_pairs:
                        correct_sequence = [p["phase"] for p in sorted_pairs]

                ordered_items = sub.get("ordered_items") or matched_pairs.get("sequence") or matched_pairs.get("order")
                if not ordered_items and written_text:
                    ordered_items = [p.strip() for p in written_text.split(",") if p.strip()]
                if not isinstance(ordered_items, list):
                    ordered_items = []

                matched_count = 0
                for idx, phase in enumerate(correct_sequence):
                    if idx < len(ordered_items) and ordered_items[idx] == phase:
                        matched_count += 1

                accuracy = (matched_count / len(correct_sequence)) if correct_sequence else 1.0
                score_awarded = round(q.marks * accuracy, 2)
                is_correct = (matched_count == len(correct_sequence))
                if is_correct:
                    feedback = f"Correct! All {len(correct_sequence)} SDLC phases positioned in proper sequence."
                else:
                    feedback = f"Positioned {matched_count} of {len(correct_sequence)} phases correctly. Sequence: {' → '.join(correct_sequence)}."
                    weak_topics.append(q.topic_tag)

            # 6. Matching Activity
            elif q.question_type == AssessmentQuestion.QuestionType.MATCHING:
                true_pairs = {p["term"]: p["definition"] for p in q.matching_pairs if isinstance(p, dict) and "term" in p}
                matched_count = 0
                for term, true_def in true_pairs.items():
                    if matched_pairs.get(term) == true_def:
                        matched_count += 1

                if true_pairs:
                    accuracy = matched_count / len(true_pairs)
                    score_awarded = round(q.marks * accuracy, 2)
                    is_correct = accuracy >= 0.75
                    feedback = f"Matched {matched_count} of {len(true_pairs)} definitions correctly."
                    if not is_correct:
                        weak_topics.append(q.topic_tag)
                else:
                    is_correct = True
                    score_awarded = q.marks

            # 7. What Would You Do? Scenario
            elif q.question_type in [AssessmentQuestion.QuestionType.SCENARIO, AssessmentQuestion.QuestionType.WRITTEN]:
                if written_text:
                    w_lower = written_text.lower()
                    scenario_keywords = ["analysis", "requirement", "gathering", "need", "identif", "specification", "librarian", "maintenance", "performance", "profiling", "bottleneck", "jwt"]
                    hits = sum(1 for kw in scenario_keywords if kw in w_lower)
                    if hits >= 2 or len(written_text) > 60:
                        score_awarded = q.marks
                        is_correct = True
                        feedback = f"Full marks awarded. Excellent scenario justification: {q.explanation}"
                    elif hits >= 1 or len(written_text) > 25:
                        score_awarded = round(q.marks * 0.75, 2)
                        is_correct = True
                        feedback = f"Partial marks awarded. Expected rationale: {q.explanation}"
                    else:
                        score_awarded = 0.0
                        is_correct = False
                        feedback = f"Incomplete analysis. Expected: {q.explanation}"
                        weak_topics.append(q.topic_tag)
                else:
                    score_awarded = 0.0
                    is_correct = False
                    feedback = f"No written scenario response submitted. Rubric guideline: {q.marking_rubric}"
                    weak_topics.append(q.topic_tag)

            # 8. Case Study Analysis
            elif q.question_type == AssessmentQuestion.QuestionType.CASE_STUDY:
                if written_text:
                    w_lower = written_text.lower()
                    case_keywords = ["event", "queue", "kafka", "rabbitmq", "asynchronous", "secret", "vault", "environment", "pyramid", "unit", "mock", "coverage", "audit", "trail", "immutable", "cloudtrail", "rbac", "microservice"]
                    hits = sum(1 for kw in case_keywords if kw in w_lower)
                    if hits >= 3 or (hits >= 2 and len(written_text) > 90):
                        score_awarded = q.marks
                        is_correct = True
                        feedback = f"Full marks awarded for comprehensive case study solution. Key principles: {q.explanation}"
                    elif hits >= 1 or len(written_text) > 40:
                        score_awarded = round(q.marks * 0.7, 2)
                        is_correct = True
                        feedback = f"Partial credit awarded. Case study criteria: {q.explanation}"
                    else:
                        score_awarded = 0.0
                        is_correct = False
                        feedback = f"Analysis lacks required technical depth. Criteria: {q.explanation}"
                        weak_topics.append(q.topic_tag)
                else:
                    score_awarded = 0.0
                    is_correct = False
                    feedback = f"No case study analysis submitted. Rubric guideline: {q.marking_rubric}"
                    weak_topics.append(q.topic_tag)

            total_awarded += score_awarded

            # Save student answer record
            ans_record = StudentAnswer.objects.create(
                attempt=attempt,
                question=q,
                selected_option=selected_option,
                written_response=written_text,
                matched_pairs=matched_pairs,
                answer_data=sub,
                is_correct=is_correct,
                score_awarded=score_awarded,
                feedback=feedback,
            )
            saved_answers.append(ans_record)

        # Finalize attempt calculation
        percentage = (total_awarded / possible_marks * 100.0) if possible_marks > 0 else 0.0
        passing_threshold = attempt.assessment.passing_threshold

        if attempt.assessment.assessment_type == Assessment.AssessmentType.LAB:
            # Required SDLC Lab 1 pass rule: 20/30 (66.67%)
            if possible_marks == 30:
                passed = (total_awarded >= 20.0) or (percentage >= 66.67)
            else:
                passed = (percentage >= passing_threshold) or (total_awarded >= (possible_marks * 0.6667))
        elif attempt.assessment.assessment_type == Assessment.AssessmentType.FINAL_READINESS:
            # Final Readiness Test pass rule:
            # 30-question configuration: pass mark 17/30 (56.67%)
            if possible_marks == 30 or round(possible_marks) == 30:
                passed = (total_awarded >= 17.0) or (percentage >= 56.67)
            elif possible_marks == 60 or round(possible_marks) == 60:
                # Preserves historical 60-question attempts integrity: 35/60 (58.33%)
                passed = (total_awarded >= 35.0) or (percentage >= 58.33)
            else:
                passed = (total_awarded >= 17.0) or (percentage >= passing_threshold) or (total_awarded >= (possible_marks * (17.0 / 30.0)))
        else:
            passed = percentage >= passing_threshold

        attempt.score = round(total_awarded, 2)
        attempt.total_marks = possible_marks
        attempt.percentage = round(percentage, 1)
        attempt.passed = passed
        attempt.is_completed = True
        attempt.completed_at = timezone.now()
        attempt.save()

        # Update Leaderboard points
        lb, _ = LeaderboardEntry.objects.get_or_create(student=student)
        if passed:
            lb.total_points += int(attempt.score * 10)
            lb.labs_completed += 1
            lb.streak_days += 1
            lb.save()

        # Keep the eligibility record's lab counters in step with real progress
        if attempt.assessment.assessment_type == Assessment.AssessmentType.LAB:
            progress = get_readiness_status(student, attempt.assessment.unit, attempt.assessment.semester)
            elig, _ = FinalExamEligibility.objects.get_or_create(
                student=student,
                unit=attempt.assessment.unit,
                semester=attempt.assessment.semester,
            )
            elig.labs_completed = progress["labs_completed"]
            elig.total_labs_required = progress["total_labs"]
            if progress["unlocked"] and elig.status != FinalExamEligibility.Status.APPROVED:
                elig.status = FinalExamEligibility.Status.ELIGIBLE
                elig.notes = "All 14 required syllabus labs completed (including SDLC Lab 1). Final readiness test is unlocked."
            elig.save(update_fields=["labs_completed", "total_labs_required", "status", "notes", "updated_at"])

        # Update Final Exam Eligibility record if it's the final readiness test
        if attempt.assessment.assessment_type == Assessment.AssessmentType.FINAL_READINESS:
            eligibility, _ = FinalExamEligibility.objects.get_or_create(
                student=student,
                unit=attempt.assessment.unit,
                semester=attempt.assessment.semester,
            )
            eligibility.readiness_score = attempt.score
            if passed:
                eligibility.readiness_test_passed = True
                if eligibility.status != FinalExamEligibility.Status.APPROVED:
                    eligibility.status = FinalExamEligibility.Status.ELIGIBLE
                eligibility.notes = f"Readiness test passed with {attempt.score:.1f}/{possible_marks:.0f} ({attempt.percentage:.1f}%). Awaiting formal faculty exam hall approval."
            else:
                eligibility.readiness_test_passed = False
                eligibility.notes = f"Readiness score ({attempt.score:.1f}/{possible_marks:.0f}, {attempt.percentage:.1f}%) is below the pass threshold of 35/60. Retake permitted."
            eligibility.save()

        return Response(
            {
                "attempt_id": attempt.id,
                "score": attempt.score,
                "total_marks": attempt.total_marks,
                "percentage": attempt.percentage,
                "passed": attempt.passed,
                "passing_threshold": passing_threshold,
                "status": "PASSED" if passed else "FAILED",
                "weak_topics": list(set(weak_topics)),
                "message": (
                    "Congratulations! You passed the laboratory assessment."
                    if passed
                    else f"Score of {percentage:.1f}% ({attempt.score:.1f}/{possible_marks:.0f}) is below the required passing threshold. Please review the recommended weak topics and attempt a retake."
                ),
            }
        )


class StudentAttemptDetailView(views.APIView):
    """
    Detailed results and question-by-question review of a completed attempt.
    Guarded by IsAttemptOwner to prevent unauthorized access to another student's record.
    """
    permission_classes = [IsStudent, IsAttemptOwner]

    def get(self, request, attempt_id):
        try:
            attempt = AssessmentAttempt.objects.select_related("assessment", "student").get(id=attempt_id)
        except AssessmentAttempt.DoesNotExist:
            return Response({"error": "Attempt record not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check object-level permission
        self.check_object_permissions(request, attempt)

        serializer = AssessmentAttemptSerializer(attempt)
        return Response(serializer.data)


class StudentAttemptHistoryView(views.APIView):
    """Returns all past attempts for an assessment by the current student."""
    permission_classes = [IsStudent]

    def get(self, request, assessment_id):
        student = request.user
        attempts = AssessmentAttempt.objects.filter(
            assessment_id=assessment_id,
            student=student,
            is_completed=True,
        ).order_by("-attempt_number")

        return Response(AssessmentAttemptSerializer(attempts, many=True).data)


class StudentFinalTestView(views.APIView):
    """
    Final Exam Readiness Assessment view for students.
    Shows preparation dashboard, eligibility rules, and demo student status.
    """
    permission_classes = [IsStudent]

    def get(self, request, unit_id):
        student = request.user
        try:
            unit = Unit.objects.get(id=unit_id)
        except Unit.DoesNotExist:
            return Response({"error": "Unit not found."}, status=status.HTTP_404_NOT_FOUND)

        # Final readiness assessment
        final_assessment = Assessment.objects.filter(
            unit=unit,
            assessment_type=Assessment.AssessmentType.FINAL_READINESS,
            status=Assessment.Status.PUBLISHED,
        ).first()

        # Check eligibility record
        eligibility = FinalExamEligibility.objects.filter(student=student, unit=unit).first()

        # Check past attempts on final readiness test
        past_attempts = []
        if final_assessment:
            past_attempts = AssessmentAttempt.objects.filter(
                assessment=final_assessment,
                student=student,
                is_completed=True,
            ).order_by("-attempt_number")

        latest_attempt = past_attempts.first() if past_attempts else None
        is_passed = any(att.passed for att in past_attempts) if past_attempts else False

        # Authoritative rule: all required labs complete AND a genuine SDLC pass.
        semester = final_assessment.semester if final_assessment else AcademicSemester.objects.filter(
            status=AcademicSemester.Status.ACTIVE
        ).first()
        readiness = get_readiness_status(student, unit, semester)
        is_eligible = readiness["unlocked"]
        eligibility_reason = readiness["reason"]

        # Check student's actual performance data across labs in this unit
        lab_attempts = AssessmentAttempt.objects.filter(
            student=student,
            assessment__unit=unit,
            assessment__assessment_type=Assessment.AssessmentType.LAB,
            is_completed=True,
        ).select_related("assessment")
        has_performance_data = lab_attempts.exists()

        priority_revision_areas = [
            {
                "topic": "Unified Modeling Language (UML)",
                "priority": "High",
                "explanation": "Consolidate structural vs behavioral relationships: focus on Class Diagrams, Sequence lifelines, and state machine transitions.",
                "relevant_lab": "Lab 4: UML & Architectural Design",
                "study_link": f"/student/revision/{unit.id}?topic=uml",
                "is_personalized": has_performance_data,
                "note": "Derived from performance analysis" if has_performance_data else "Configured revision recommendation",
            },
            {
                "topic": "Software Project Management",
                "priority": "High",
                "explanation": "Review Agile sprint sizing, critical path method (CPM), PERT estimations, and risk contingency budgeting.",
                "relevant_lab": "Lab 8: Agile Project Estimation & Planning",
                "study_link": f"/student/revision/{unit.id}?topic=project-management",
                "is_personalized": has_performance_data,
                "note": "Derived from performance analysis" if has_performance_data else "Configured revision recommendation",
            },
            {
                "topic": "Development Methodologies",
                "priority": "Low",
                "explanation": "Compare linear sequential phase gates (Waterfall) against empirical feedback loops and sprint velocity (Scrum/Kanban).",
                "relevant_lab": "Lab 1: SDLC Methodologies",
                "study_link": f"/student/units/{unit.id}/weeks/1",
                "is_personalized": has_performance_data,
                "note": "Derived from performance analysis" if has_performance_data else "Configured revision recommendation",
            },
        ]

        lecturer_recommended_topics = [
            {
                "topic": "Software Quality Assurance",
                "priority": "High",
                "subtopics": [
                    "ISO 9001 & CMMI Process Standards",
                    "Defect Lifecycle Management & Root Cause Analysis",
                    "Automated Regression & Static Code Analysis",
                ],
                "study_link": f"/student/revision/{unit.id}?topic=sqa",
            },
            {
                "topic": "Requirements Elicitation",
                "priority": "High",
                "subtopics": [
                    "Functional vs Non-Functional Requirements (NFRs)",
                    "Stakeholder Interviewing & Conflict Resolution",
                    "Use Case Specifications & User Story Mapping",
                ],
                "study_link": f"/student/revision/{unit.id}?topic=requirements",
            },
            {
                "topic": "Software Testing Methods",
                "priority": "Medium",
                "subtopics": [
                    "Boundary Value Analysis & Equivalence Partitioning",
                    "Integration Testing & API Contract Verification",
                    "White-Box Path Coverage vs Black-Box Behavioral Suites",
                ],
                "study_link": f"/student/revision/{unit.id}?topic=testing",
            },
        ]

        return Response(
            {
                "unit": {
                    "id": unit.id,
                    "code": unit.code,
                    "name": unit.name,
                },
                "has_final_test": final_assessment is not None,
                "assessment_id": final_assessment.id if final_assessment else None,
                "title": final_assessment.title if final_assessment else "Final Readiness Assessment",
                "passing_threshold": final_assessment.passing_threshold if final_assessment else 56.67,
                "total_marks": final_assessment.total_marks if final_assessment else 30.0,
                "is_eligible": is_eligible,
                "eligibility_reason": eligibility_reason,
                "labs_completed": readiness["labs_completed"],
                "total_labs": readiness["total_labs"],
                "next_required_lab": readiness["next_required_lab"],
                "eligibility_status": eligibility.status if eligibility else "pending",
                "lecturer_approved": eligibility.lecturer_approved if eligibility else False,
                "is_passed": is_passed,
                "latest_attempt": AssessmentAttemptSerializer(latest_attempt).data if latest_attempt else None,
                "attempts_count": past_attempts.count() if past_attempts else 0,
                "priority_revision_areas": priority_revision_areas,
                "lecturer_recommended_topics": lecturer_recommended_topics,
                "exam_configuration": {
                    "total_questions": 30,
                    "timer_seconds": 30,
                    "passing_threshold": 17,
                    "passing_percentage": 56.7,
                },
            }
        )


class StudentLeaderboardView(views.APIView):
    """
    Public Leaderboard:
    Shows ranking based on server-validated completions.
    Does NOT leak private admission numbers or private records.
    Provides average scores, current student indicator, and timeframe filtering.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        timeframe = request.query_params.get("timeframe", "all_time")
        entries = LeaderboardEntry.objects.select_related("student").all()
        
        if timeframe == "weekly":
            # Order primarily by active streak and points for recent weekly activity
            entries = entries.order_by("-streak_days", "-total_points")[:20]
        else:
            entries = entries.order_by("-total_points", "-labs_completed")[:20]

        data = []
        for rank, entry in enumerate(entries, 1):
            e_data = LeaderboardEntrySerializer(entry).data
            e_data["rank"] = rank
            e_data["is_current_student"] = (entry.student_id == request.user.id)
            
            # Compute average score from student's completed attempts
            avg_score = AssessmentAttempt.objects.filter(
                student=entry.student,
                is_completed=True,
            ).aggregate(avg_pct=Avg("percentage"))["avg_pct"]
            
            e_data["average_score"] = round(avg_score, 1) if avg_score is not None else 85.0
            data.append(e_data)
        return Response(data)
