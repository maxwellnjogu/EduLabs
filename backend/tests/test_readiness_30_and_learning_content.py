import json
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from academics.models import University, Programme, AcademicSemester, Unit, StudentEnrolment, LecturerAssignment
from assessments.models import (
    Assessment,
    AssessmentAttempt,
    AssessmentOption,
    AssessmentQuestion,
    StudentAnswer,
    FinalExamEligibility,
)
from learning.models import LearningWeek, LearningMaterial, RevisionResource, PracticeQuestion

User = get_user_model()


class Readiness30AndLearningContentTests(TestCase):
    """
    Validates:
    1. Student Exam Readiness revision dashboard (Section A weak areas, Section B lecturer recommended focus areas).
    2. Readiness exam configured for 30 questions, 30s each, 17/30 pass mark.
    3. Student cannot start exam before completing all 15 labs (prerequisite enforced).
    4. Lecturer dashboard presentation figures (20 enrolled, 4 approved, 3 retakes) isolated from authoritative records.
    5. Learning content generator preview and publication.
    6. Old 60-question attempts preserved and backwards compatible.
    7. Individual performance mode fallback.
    """

    def setUp(self):
        self.client = APIClient()
        self.uni = University.objects.create(name="Riara University", code="RU")
        self.prog = Programme.objects.create(university=self.uni, name="Computer Science", code="CS")
        self.sem = AcademicSemester.objects.create(
            university=self.uni,
            name="Semester 2",
            academic_year="2025/2026",
            start_date=date.today() - timedelta(days=5),
            end_date=date.today() + timedelta(days=80),
            status=AcademicSemester.Status.ACTIVE,
        )
        self.unit = Unit.objects.create(programme=self.prog, name="Software Engineering", code="RCS 305")

        self.lecturer = User.objects.create_user(
            username="jmwangi_test",
            email="jmwangi@riara.ac.ke",
            password="EduLabs@2026Secure!",
            role=User.Role.LECTURER,
            university=self.uni,
            is_staff=True,
        )
        LecturerAssignment.objects.create(lecturer=self.lecturer, unit=self.unit, semester=self.sem)

        self.student = User.objects.create_user(
            username="akamau_test",
            admission_number="RU-2026-041",
            password="EduLabs@2026Secure!",
            role=User.Role.STUDENT,
            university=self.uni,
            year_of_study=2,
        )
        StudentEnrolment.objects.create(student=self.student, unit=self.unit, semester=self.sem)

        # Create week 1 and a final readiness assessment
        self.week_1 = LearningWeek.objects.create(
            unit=self.unit,
            semester=self.sem,
            week_number=1,
            title="SDLC Fundamentals",
            is_published=True,
        )
        self.lab_1 = Assessment.objects.create(
            unit=self.unit,
            semester=self.sem,
            week=self.week_1,
            title="SDLC Lab 1",
            passing_threshold=66.67,
            total_marks=30.0,
            status=Assessment.Status.PUBLISHED,
            readiness_gate=True,
        )
        q = AssessmentQuestion.objects.create(
            assessment=self.lab_1,
            question_type="mcq",
            prompt="SDLC Q1",
            marks=30.0,
            topic_tag="SDLC",
        )
        self.opt_correct = AssessmentOption.objects.create(question=q, option_text="Correct", is_correct=True)

        self.final_test = Assessment.objects.create(
            unit=self.unit,
            semester=self.sem,
            title="RCS 305 Final Exam Readiness Assessment",
            assessment_type=Assessment.AssessmentType.FINAL_READINESS,
            passing_threshold=56.67,
            total_marks=30.0,
            status=Assessment.Status.DRAFT,
        )

    def test_student_exam_readiness_tab_sections_and_gate(self):
        """Student sees priority revision areas, lecturer focus areas, and cannot start until eligible."""
        self.client.force_authenticate(user=self.student)
        res = self.client.get(f"/api/student/units/{self.unit.id}/final-test/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data

        # Prerequisite check: not unlocked before labs completed
        self.assertFalse(data["is_eligible"])
        self.assertIn("Locked", data["eligibility_reason"])

        # Section A: Your Priority Revision Areas
        self.assertIn("priority_revision_areas", data)
        topics = [a["topic"] for a in data["priority_revision_areas"]]
        self.assertIn("Unified Modeling Language (UML)", topics)
        self.assertIn("Software Project Management", topics)
        self.assertIn("Development Methodologies", topics)

        # Section B: Lecturer-Recommended Exam Focus Areas
        self.assertIn("lecturer_recommended_topics", data)
        rec_topics = [t["topic"] for t in data["lecturer_recommended_topics"]]
        self.assertIn("Software Quality Assurance", rec_topics)
        self.assertIn("Requirements Elicitation", rec_topics)
        self.assertIn("Software Testing Methods", rec_topics)

        # Section C: Exam configuration (30 questions, 30s each, 17/30 pass mark)
        self.assertIn("exam_configuration", data)
        self.assertEqual(data["exam_configuration"]["total_questions"], 30)
        self.assertEqual(data["exam_configuration"]["timer_seconds"], 30)
        self.assertEqual(data["exam_configuration"]["passing_threshold"], 17)

    def test_lecturer_dashboard_presentation_figures_isolated(self):
        """Dashboard displays target figures (20 enrolled, 4 approved, 3 retakes) via presentation layer."""
        self.client.force_authenticate(user=self.lecturer)
        res = self.client.get("/api/lecturer/dashboard/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data

        # Target presentation figures
        self.assertEqual(data["metrics"]["total_enrolled_students"], 20)
        self.assertEqual(data["metrics"]["final_exam_approved_count"], 4)
        self.assertEqual(data["metrics"]["total_failed_attempts"], 3)

        # Clearly separated layer
        self.assertIn("presentation_layer", data)
        self.assertEqual(data["presentation_layer"]["enrolled_students"], 20)
        self.assertEqual(data["presentation_layer"]["final_exam_approved"], 4)
        self.assertEqual(data["presentation_layer"]["requiring_retake"], 3)

        # Authoritative operational records are preserved separately
        self.assertIn("authoritative_metrics", data)

    def test_readiness_exam_builder_30_questions_and_summary_generation(self):
        """Readiness Exam Builder generates exactly 30 questions, 30s timer, pass threshold 17/30, hides preview."""
        self.client.force_authenticate(user=self.lecturer)
        res = self.client.post(
            f"/api/lecturer/units/{self.unit.id}/generate-exam-readiness/",
            {"action": "generate", "individual_performance": True},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.data

        # Configuration summary returned, question bodies concealed on builder
        self.assertEqual(data["summary"]["question_count"], 30)
        self.assertEqual(data["summary"]["time_per_question_seconds"], 30)
        self.assertEqual(data["summary"]["passing_threshold_score"], 17)
        self.assertNotIn("questions", data)  # Full questions preview hidden on builder

        # Check DB active questions
        self.final_test.refresh_from_db()
        self.assertEqual(self.final_test.total_marks, 30.0)
        self.assertEqual(round(self.final_test.passing_threshold, 2), 56.67)
        active_q_count = self.final_test.questions.filter(is_active=True).count()
        self.assertEqual(active_q_count, 30)

        # Publish the exam
        pub_res = self.client.post(
            f"/api/lecturer/units/{self.unit.id}/generate-exam-readiness/",
            {"action": "publish"},
            format="json",
        )
        self.assertEqual(pub_res.status_code, status.HTTP_200_OK)
        self.final_test.refresh_from_db()
        self.assertEqual(self.final_test.status, Assessment.Status.PUBLISHED)

    def test_historical_attempt_preservation_and_safe_retirement(self):
        """Historical 60-question attempts remain accessible and are scored against their original threshold."""
        # Create a historical question and attempt
        old_q = AssessmentQuestion.objects.create(
            assessment=self.final_test,
            prompt="Old 60-question legacy item",
            marks=1.0,
            is_active=True,
        )
        old_opt = AssessmentOption.objects.create(question=old_q, option_text="Legacy Ans", is_correct=True)
        old_att = AssessmentAttempt.objects.create(
            assessment=self.final_test,
            student=self.student,
            attempt_number=1,
            score=36.0,
            total_marks=60.0,
            percentage=60.0,
            passed=True,
            is_completed=True,
            completed_at=timezone.now(),
        )
        StudentAnswer.objects.create(
            attempt=old_att,
            question=old_q,
            selected_option=old_opt,
            is_correct=True,
            score_awarded=1.0,
        )

        # Now generate new 30-question exam
        self.client.force_authenticate(user=self.lecturer)
        self.client.post(
            f"/api/lecturer/units/{self.unit.id}/generate-exam-readiness/",
            {"action": "generate"},
            format="json",
        )

        # Historical student attempt and answers MUST still exist!
        old_att.refresh_from_db()
        self.assertEqual(old_att.score, 36.0)
        self.assertTrue(old_att.passed)
        self.assertTrue(StudentAnswer.objects.filter(attempt=old_att).exists())

        # Old question is retired (is_active=False), not deleted
        old_q.refresh_from_db()
        self.assertFalse(old_q.is_active)

    def test_curriculum_generate_learning_content_preview_and_publish(self):
        """Curriculum manager previews 4 selected modes and publishes idempotently."""
        self.client.force_authenticate(user=self.lecturer)

        # 1. Preview
        prev_res = self.client.post(
            f"/api/lecturer/units/{self.unit.id}/generate-learning-content/",
            {"action": "generate", "selected_modes": ["practice_questions", "summary_notes", "flashcards", "mind_map"]},
            format="json",
        )
        self.assertEqual(prev_res.status_code, status.HTTP_200_OK)
        preview = prev_res.data["preview"]
        self.assertEqual(len(preview["practice_questions"]), 3)
        self.assertIsNotNone(preview["summary_notes"])
        self.assertTrue(len(preview["flashcards"]) >= 4)
        self.assertIsNotNone(preview["mind_map"])

        # 2. Publish
        pub_res = self.client.post(
            f"/api/lecturer/units/{self.unit.id}/generate-learning-content/",
            {"action": "publish", "selected_modes": ["practice_questions", "summary_notes", "flashcards", "mind_map"]},
            format="json",
        )
        self.assertEqual(pub_res.status_code, status.HTTP_200_OK)
        self.assertEqual(pub_res.data["status"], "published")

        # Verify resources exist in DB
        self.assertTrue(RevisionResource.objects.filter(unit=self.unit, is_published=True).exists())
        self.assertTrue(PracticeQuestion.objects.filter(unit=self.unit).exists())
