from datetime import date, timedelta
from unittest.mock import patch, MagicMock

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from academics.models import University, Programme, AcademicSemester, Unit, LecturerAssignment
from assessments.models import (
    Assessment,
    AssessmentQuestion,
    AssessmentOption,
)
from assessments.gemini_service import GeminiError, _parse_gemini_response, _validate_payload

User = get_user_model()


class GeminiIntegrationTests(TestCase):
    """Automated integration tests for Stage 1 Gemini generation in the SDLC demo generator."""

    def setUp(self):
        self.client = APIClient()
        self.uni = University.objects.create(name="Riara University", code="RU")
        self.prog = Programme.objects.create(university=self.uni, name="Computer Science", code="CS")
        self.sem = AcademicSemester.objects.create(
            university=self.uni,
            name="Semester 1",
            academic_year="2025/2026",
            start_date=date.today() - timedelta(days=10),
            end_date=date.today() + timedelta(days=80),
            status=AcademicSemester.Status.ACTIVE,
        )
        self.unit = Unit.objects.create(programme=self.prog, name="Software Engineering", code="RCS 305")

        self.lecturer = User.objects.create_user(
            username="sdlc_lecturer",
            email="lecturer@riara.ac.ke",
            password="SecurePassword123!",
            role=User.Role.LECTURER,
            university=self.uni,
        )
        LecturerAssignment.objects.create(lecturer=self.lecturer, unit=self.unit, semester=self.sem)

        self.student = User.objects.create_user(
            username="student_user",
            email="student@riara.ac.ke",
            password="SecurePassword123!",
            role=User.Role.STUDENT,
            university=self.uni,
        )

        self.generate_url = f"/api/lecturer/units/{self.unit.id}/generate-demo-content/"

    def test_unauthorized_user_cannot_generate_demo_content(self):
        # Anonymous user
        res = self.client.post(self.generate_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Student user
        self.client.force_authenticate(user=self.student)
        res = self.client.post(self.generate_url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    @patch.dict("os.environ", {}, clear=True)
    def test_missing_api_key_returns_400_and_does_not_mutate(self):
        self.client.force_authenticate(user=self.lecturer)
        res = self.client.post(f"{self.generate_url}?use_gemini=true")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("GEMINI_API_KEY", res.data.get("error", ""))
        self.assertEqual(Assessment.objects.filter(unit=self.unit).count(), 0)

    @patch.dict("os.environ", {"GEMINI_API_KEY": "dummy_key"}, clear=True)
    def test_missing_model_returns_400_and_does_not_mutate(self):
        self.client.force_authenticate(user=self.lecturer)
        res = self.client.post(f"{self.generate_url}?use_gemini=true")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("GEMINI_MODEL", res.data.get("error", ""))
        self.assertEqual(Assessment.objects.filter(unit=self.unit).count(), 0)

    @patch.dict("os.environ", {"GEMINI_API_KEY": "dummy_key", "GEMINI_MODEL": "gemini-1.5-flash"}, clear=True)
    @patch("assessments.gemini_service.generate_sdlc_content")
    def test_preserves_existing_assessment_and_questions_on_gemini_error(self, mock_generate):
        mock_generate.side_effect = GeminiError("Gemini API quota or rate limit exceeded.", http_status=429)

        # Pre-create an assessment with 2 questions
        assessment = Assessment.objects.create(
            unit=self.unit,
            semester=self.sem,
            title="Existing Lab Assessment",
            passing_threshold=75.0,
            total_marks=30.0,
            status=Assessment.Status.DRAFT,
        )
        q1 = AssessmentQuestion.objects.create(
            assessment=assessment,
            question_type=AssessmentQuestion.QuestionType.MCQ,
            prompt="Original Q1",
            marks=2.0,
            timer_seconds=10,
            order=1,
        )
        q2 = AssessmentQuestion.objects.create(
            assessment=assessment,
            question_type=AssessmentQuestion.QuestionType.MCQ,
            prompt="Original Q2",
            marks=2.0,
            timer_seconds=10,
            order=2,
        )

        self.client.force_authenticate(user=self.lecturer)
        res = self.client.post(f"{self.generate_url}?use_gemini=true")

        self.assertEqual(res.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn("rate limit", res.data.get("error", ""))

        # Check existing questions were preserved intact
        assessment.refresh_from_db()
        self.assertEqual(assessment.questions.count(), 2)
        question_prompts = list(assessment.questions.values_list("prompt", flat=True))
        self.assertIn("Original Q1", question_prompts)
        self.assertIn("Original Q2", question_prompts)

    @patch.dict("os.environ", {"GEMINI_API_KEY": "dummy_key", "GEMINI_MODEL": "gemini-1.5-flash"}, clear=True)
    @patch("assessments.gemini_service.generate_sdlc_content")
    def test_successful_live_gemini_generation(self, mock_generate):
        mock_generate.return_value = {
            "mcqs": [
                {
                    "prompt": "What is the primary goal of the SDLC Requirements phase?",
                    "marks": 2.0,
                    "timer_seconds": 15,
                    "topic_tag": "Requirements",
                    "explanation": "To understand and document stakeholder needs.",
                    "options": [
                        {"text": "Writing unit tests", "is_correct": False},
                        {"text": "Gathering and documenting user needs", "is_correct": True},
                        {"text": "Deploying into production", "is_correct": False},
                        {"text": "Refactoring database indexes", "is_correct": False},
                    ],
                }
            ],
            "flashcards": [
                {
                    "prompt": "Waterfall Methodology",
                    "marks": 1.0,
                    "timer_seconds": 10,
                    "topic_tag": "SDLC Models",
                    "explanation": "Linear sequential life cycle model where each phase must be completed before the next begins.",
                }
            ],
            "written": [
                {
                    "prompt": "Explain why regression testing is necessary after deploying a patch.",
                    "marks": 3.0,
                    "timer_seconds": 45,
                    "topic_tag": "Testing",
                    "marking_rubric": "Mentions verification of existing functionality, unexpected side effects, and bug fixes.",
                    "explanation": "Regression testing ensures that new changes have not broken existing functionality.",
                }
            ],
            "matching_pairs": [
                {"term": "Sprint", "definition": "A time-boxed iteration in Scrum during which work is completed."},
                {"term": "Scrum Master", "definition": "Facilitator for an Agile development team."},
            ],
        }

        self.client.force_authenticate(user=self.lecturer)
        res = self.client.post(f"{self.generate_url}?use_gemini=true")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["mode"], "live_gemini")
        self.assertEqual(res.data["questions_generated"], 4)

        assessment = Assessment.objects.get(unit=self.unit, week__week_number=1)
        self.assertEqual(assessment.status, Assessment.Status.DRAFT)
        self.assertEqual(assessment.questions.count(), 4)

        mcq = assessment.questions.get(question_type=AssessmentQuestion.QuestionType.MCQ)
        self.assertEqual(mcq.options.count(), 4)
        self.assertEqual(mcq.options.filter(is_correct=True).count(), 1)
        self.assertEqual(mcq.options.get(is_correct=True).option_text, "Gathering and documenting user needs")

    def test_static_generation_path_remains_available(self):
        self.client.force_authenticate(user=self.lecturer)
        res = self.client.post(self.generate_url)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["mode"], "deterministic_prebuilt_source_grounded")
        self.assertEqual(res.data["questions_generated"], 19)

        assessment = Assessment.objects.get(unit=self.unit, week__week_number=1)
        self.assertEqual(assessment.questions.count(), 19)

    def test_never_leaks_api_key_in_gemini_error(self):
        secret_key = "AIzaSySecretTestingKey123"
        with patch.dict("os.environ", {"GEMINI_API_KEY": secret_key, "GEMINI_MODEL": "test-model"}, clear=True):
            with patch("assessments.gemini_service.genai.get_model") as mock_get_model:
                mock_get_model.side_effect = Exception(f"Failed to connect to Google API with key {secret_key}")

                self.client.force_authenticate(user=self.lecturer)
                res = self.client.post(f"{self.generate_url}?use_gemini=true")

                self.assertNotEqual(res.status_code, status.HTTP_201_CREATED)
                response_str = str(res.data)
                self.assertNotIn(secret_key, response_str)
                self.assertNotIn("AIzaSy", response_str)

    def test_payload_validation_rejects_mcq_with_multiple_or_no_correct_options(self):
        bad_payload_no_correct = {
            "mcqs": [
                {
                    "prompt": "Test Q",
                    "marks": 2.0,
                    "timer_seconds": 10,
                    "topic_tag": "Test",
                    "explanation": "Exp",
                    "options": [
                        {"text": "A", "is_correct": False},
                        {"text": "B", "is_correct": False},
                        {"text": "C", "is_correct": False},
                        {"text": "D", "is_correct": False},
                    ],
                }
            ],
            "flashcards": [{"prompt": "F", "marks": 1, "timer_seconds": 5, "topic_tag": "T", "explanation": "E"}],
            "written": [{"prompt": "W", "marks": 2, "timer_seconds": 10, "topic_tag": "T", "marking_rubric": "R", "explanation": "E"}],
            "matching_pairs": [{"term": "T", "definition": "D"}],
        }

        with self.assertRaises(GeminiError) as ctx:
            _validate_payload(bad_payload_no_correct)
        self.assertIn("exactly one correct option", ctx.exception.message)

    def test_lecturer_can_list_unit_assessments_and_authorization(self):
        # Create 2 assessments for this unit
        a1 = Assessment.objects.create(
            unit=self.unit,
            semester=self.sem,
            title="Lab 1: SDLC",
            passing_threshold=75.0,
            total_marks=30.0,
            status=Assessment.Status.PUBLISHED,
        )
        a2 = Assessment.objects.create(
            unit=self.unit,
            semester=self.sem,
            title="Lab 2: Agile",
            passing_threshold=75.0,
            total_marks=30.0,
            status=Assessment.Status.DRAFT,
        )

        url = f"/api/lecturer/units/{self.unit.id}/assessments/"

        # Anonymous check
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Student check
        self.client.force_authenticate(user=self.student)
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Lecturer check
        self.client.force_authenticate(user=self.lecturer)
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.data, list)
        self.assertGreaterEqual(len(res.data), 2)
        titles = [a["title"] for a in res.data]
        self.assertIn("Lab 1: SDLC", titles)
        self.assertIn("Lab 2: Agile", titles)

    def test_lecturer_can_retrieve_assessment_detail_with_questions(self):
        assessment = Assessment.objects.create(
            unit=self.unit,
            semester=self.sem,
            title="Detail Test Assessment",
            passing_threshold=75.0,
            total_marks=20.0,
            status=Assessment.Status.DRAFT,
        )
        q = AssessmentQuestion.objects.create(
            assessment=assessment,
            question_type=AssessmentQuestion.QuestionType.MCQ,
            prompt="Detail Question Prompt",
            marks=2.0,
            timer_seconds=15,
            topic_tag="Architecture",
            order=1,
        )
        AssessmentOption.objects.create(
            question=q,
            option_text="Option A",
            is_correct=True,
            order=1,
        )

        detail_url = f"/api/lecturer/assessments/{assessment.id}/"

        # Anonymous check
        res = self.client.get(detail_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Student check
        self.client.force_authenticate(user=self.student)
        res = self.client.get(detail_url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Lecturer check
        self.client.force_authenticate(user=self.lecturer)
        res = self.client.get(detail_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["id"], assessment.id)
        self.assertEqual(res.data["title"], "Detail Test Assessment")
        self.assertIn("questions", res.data)
        self.assertEqual(len(res.data["questions"]), 1)

        q_data = res.data["questions"][0]
        self.assertEqual(q_data["prompt"], "Detail Question Prompt")
        self.assertEqual(q_data["question_text"], "Detail Question Prompt")
        self.assertEqual(q_data["timer_seconds"], 15)
        self.assertEqual(q_data["time_limit_seconds"], 15)
        self.assertEqual(len(q_data["options"]), 1)
        self.assertEqual(q_data["options"][0]["option_text"], "Option A")
        self.assertTrue(q_data["options"][0]["is_correct"])

        # Non-existent assessment
        bad_url = "/api/lecturer/assessments/999999/"
        bad_res = self.client.get(bad_url)
        self.assertEqual(bad_res.status_code, status.HTTP_404_NOT_FOUND)
