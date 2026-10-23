from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from academics.models import Unit, AcademicSemester, LecturerAssignment, University, Programme, StudentEnrolment
from learning.models import LearningWeek, PracticeQuestion
from assessments.models import Assessment, AssessmentAttempt

User = get_user_model()


class PracticeQuestionsTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.university = University.objects.create(
            name="Riara University",
            code="RU",
        )
        self.programme = Programme.objects.create(
            university=self.university,
            name="Computer Science",
            code="CS",
        )

        self.semester = AcademicSemester.objects.create(
            university=self.university,
            name="Semester 1",
            academic_year="2025/2026",
            status=AcademicSemester.Status.ACTIVE,
            start_date=date.today() - timedelta(days=10),
            end_date=date.today() + timedelta(days=80),
        )

        # Create unit
        self.unit = Unit.objects.create(
            programme=self.programme,
            name="Software Engineering",
            code="RCS 305",
        )

        # Create week
        self.week = LearningWeek.objects.create(
            unit=self.unit,
            semester=self.semester,
            week_number=1,
            title="Introduction to SDLC",
            is_published=True,
        )

        # Create lab assessment
        self.lab = Assessment.objects.create(
            unit=self.unit,
            semester=self.semester,
            week=self.week,
            title="Week 1 Lab: SDLC Phases & Agile",
            status=Assessment.Status.PUBLISHED,
            passing_threshold=75,
            total_marks=30,
        )

        # Create student user
        self.student = User.objects.create_user(
            username="test_student",
            email="student@edulabs.ac.ke",
            password="SecurePassword123!",
            role="student",
        )

        StudentEnrolment.objects.create(
            student=self.student,
            unit=self.unit,
            semester=self.semester,
            is_active=True,
        )

        # Create lecturer user
        self.lecturer = User.objects.create_user(
            username="test_lecturer",
            email="lecturer@edulabs.ac.ke",
            password="SecurePassword123!",
            role="lecturer",
        )

        LecturerAssignment.objects.create(
            lecturer=self.lecturer,
            unit=self.unit,
            semester=self.semester,
            is_active=True,
        )

        # Seed initial 3 questions
        self.q1 = PracticeQuestion.objects.create(
            unit=self.unit,
            week=self.week,
            assessment=self.lab,
            topic="SDLC Phases - Analysis",
            prompt="Which activity belongs to the Analysis phase?",
            options=[
                {"key": "A", "text": "Writing application code"},
                {"key": "B", "text": "Gathering and finalizing user requirements"},
                {"key": "C", "text": "Deploying the application"},
                {"key": "D", "text": "Fixing production bugs"},
            ],
            correct_answer="B",
            explanation="Analysis focuses on understanding and documenting stakeholder requirements.",
            order=1,
            status=PracticeQuestion.Status.PUBLISHED,
        )

        self.q2 = PracticeQuestion.objects.create(
            unit=self.unit,
            week=self.week,
            assessment=self.lab,
            topic="Software Testing",
            prompt="What is the main purpose of software testing?",
            options=[
                {"key": "A", "text": "To define the project budget"},
                {"key": "B", "text": "To choose the system architecture"},
                {"key": "C", "text": "To identify defects and verify expected behavior"},
                {"key": "D", "text": "To train end-users"},
            ],
            correct_answer="C",
            explanation="Testing checks whether the software behaves as expected and helps identify defects.",
            order=2,
            status=PracticeQuestion.Status.PUBLISHED,
        )

        self.q3 = PracticeQuestion.objects.create(
            unit=self.unit,
            week=self.week,
            assessment=self.lab,
            topic="SDLC Models - Waterfall",
            prompt="Which statement best describes the Waterfall model?",
            options=[
                {"key": "A", "text": "Work proceeds through sequential phases"},
                {"key": "B", "text": "Requirements are never documented"},
                {"key": "C", "text": "Every task must be completed by a different company"},
                {"key": "D", "text": "Testing happens only after maintenance"},
            ],
            correct_answer="A",
            explanation="Waterfall generally progresses through defined phases, with each phase preceding the next.",
            order=3,
            status=PracticeQuestion.Status.PUBLISHED,
        )

    def test_student_can_fetch_published_questions(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get(f"/api/student/practice-questions/?unit_id={self.unit.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 3)
        self.assertEqual(res.data[0]["prompt"], "Which activity belongs to the Analysis phase?")
        self.assertEqual(res.data[0]["correct_answer"], "B")
        self.assertEqual(res.data[1]["prompt"], "What is the main purpose of software testing?")
        self.assertEqual(res.data[2]["prompt"], "Which statement best describes the Waterfall model?")

    def test_student_week_detail_includes_practice_questions_and_flashcards(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get(f"/api/student/units/{self.unit.id}/weeks/{self.week.week_number}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("quick_practice_questions", res.data)
        self.assertEqual(len(res.data["quick_practice_questions"]), 3)
        self.assertIn("flashcards", res.data)
        self.assertTrue(len(res.data["flashcards"]) > 0)

    def test_draft_questions_are_hidden_from_students(self):
        # Create a draft question
        draft_q = PracticeQuestion.objects.create(
            unit=self.unit,
            week=self.week,
            topic="Draft Concept",
            prompt="Is this draft visible to students?",
            options=[
                {"key": "A", "text": "Yes"},
                {"key": "B", "text": "No"},
            ],
            correct_answer="B",
            explanation="Draft questions are private.",
            order=4,
            status=PracticeQuestion.Status.DRAFT,
        )

        self.client.force_authenticate(user=self.student)
        res = self.client.get(f"/api/student/practice-questions/?unit_id={self.unit.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        prompts = [q["prompt"] for q in res.data]
        self.assertNotIn("Is this draft visible to students?", prompts)
        self.assertEqual(len(res.data), 3)

    def test_student_check_practice_question_endpoint(self):
        self.client.force_authenticate(user=self.student)

        # Check correct answer for Q1 (Correct: B)
        res_correct = self.client.post(
            f"/api/student/practice-questions/{self.q1.id}/check/",
            {"selected_option": "B"},
            format="json",
        )
        self.assertEqual(res_correct.status_code, status.HTTP_200_OK)
        self.assertTrue(res_correct.data["is_correct"])
        self.assertEqual(res_correct.data["correct_answer"], "B")

        # Check incorrect answer for Q1
        res_incorrect = self.client.post(
            f"/api/student/practice-questions/{self.q1.id}/check/",
            {"selected_option": "A"},
            format="json",
        )
        self.assertEqual(res_incorrect.status_code, status.HTTP_200_OK)
        self.assertFalse(res_incorrect.data["is_correct"])

    def test_student_cannot_manage_questions(self):
        self.client.force_authenticate(user=self.student)

        # Attempt create
        res = self.client.post(
            "/api/lecturer/practice-questions/",
            {"unit_id": self.unit.id, "prompt": "Hacker question", "options": [{"key": "A", "text": "1"}, {"key": "B", "text": "2"}], "correct_answer": "A"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt delete
        res_del = self.client.delete(f"/api/lecturer/practice-questions/{self.q1.id}/")
        self.assertEqual(res_del.status_code, status.HTTP_403_FORBIDDEN)

    def test_lecturer_can_create_edit_reorder_and_publish_question(self):
        self.client.force_authenticate(user=self.lecturer)

        # Create
        res = self.client.post(
            "/api/lecturer/practice-questions/",
            {
                "unit_id": self.unit.id,
                "assessment_id": self.lab.id,
                "topic": "Agile Methodologies",
                "prompt": "What is the primary role of a Scrum Master?",
                "options": [
                    {"key": "A", "text": "Write all application code"},
                    {"key": "B", "text": "Facilitate process and remove blockers"},
                    {"key": "C", "text": "Set the market price of the software"},
                    {"key": "D", "text": "Approve employee leave"},
                ],
                "correct_answer": "B",
                "explanation": "A Scrum Master acts as a servant-leader, removing impediments for the team.",
                "status": "published",
                "order": 4,
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        new_id = res.data["id"]

        # Edit
        res_edit = self.client.put(
            f"/api/lecturer/practice-questions/{new_id}/",
            {"explanation": "Updated explanation for Scrum Master role."},
            format="json",
        )
        self.assertEqual(res_edit.status_code, status.HTTP_200_OK)
        self.assertEqual(res_edit.data["explanation"], "Updated explanation for Scrum Master role.")

        # Reorder
        res_reorder = self.client.post(
            "/api/lecturer/practice-questions/reorder/",
            {"order_ids": [new_id, self.q1.id, self.q2.id, self.q3.id]},
            format="json",
        )
        self.assertEqual(res_reorder.status_code, status.HTTP_200_OK)

        # Verify ordering
        q_refreshed = PracticeQuestion.objects.get(id=new_id)
        self.assertEqual(q_refreshed.order, 1)

        # Delete
        res_del = self.client.delete(f"/api/lecturer/practice-questions/{new_id}/")
        self.assertEqual(res_del.status_code, status.HTTP_200_OK)
        self.assertFalse(PracticeQuestion.objects.filter(id=new_id).exists())

    def test_prevent_duplicate_questions_on_repeat_publish(self):
        self.client.force_authenticate(user=self.lecturer)

        payload = {
            "unit_id": self.unit.id,
            "prompt": "Which activity belongs to the Analysis phase?",
            "options": [
                {"key": "A", "text": "Writing code"},
                {"key": "B", "text": "Gathering user requirements"},
            ],
            "correct_answer": "B",
            "explanation": "Updated explanation",
            "status": "published",
        }

        # First click
        res1 = self.client.post("/api/lecturer/practice-questions/", payload, format="json")
        # Second click (e.g. repeat click or page refresh)
        res2 = self.client.post("/api/lecturer/practice-questions/", payload, format="json")

        self.assertIn(res1.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertEqual(res2.status_code, status.HTTP_200_OK)

        # Count should remain 3 questions (not 4)
        self.assertEqual(
            PracticeQuestion.objects.filter(unit=self.unit, prompt=payload["prompt"]).count(),
            1,
        )
