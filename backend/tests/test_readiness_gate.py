from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from academics.models import University, Programme, AcademicSemester, Unit, StudentEnrolment
from assessments.models import (
    Assessment,
    AssessmentAttempt,
    AssessmentOption,
    AssessmentQuestion,
)
from learning.models import LearningWeek
from soc.models import SecurityEvent

User = get_user_model()


class ReadinessGateTests(TestCase):
    """Backend enforcement: readiness test requires a GENUINE SDLC pass plus all other labs."""

    def setUp(self):
        self.client = APIClient()
        uni = University.objects.create(name="Riara University", code="RU")
        prog = Programme.objects.create(university=uni, name="Computer Science", code="CS")
        self.sem = AcademicSemester.objects.create(
            university=uni, name="Semester 2", academic_year="2025/2026",
            start_date=date.today() - timedelta(days=5), end_date=date.today() + timedelta(days=80),
            status=AcademicSemester.Status.ACTIVE,
        )
        self.unit = Unit.objects.create(programme=prog, name="Software Engineering", code="RCS 305")
        self.student = User.objects.create_user(
            username="gate_student", admission_number="RU-2026-777", password="P@ssw0rd123456!",
            role=User.Role.STUDENT, university=uni, year_of_study=2,
        )
        StudentEnrolment.objects.create(student=self.student, unit=self.unit, semester=self.sem)

        # SDLC lab (gate) + one other lab with a synthetic demo pass
        self.sdlc, self.sdlc_q, self.sdlc_ok, self.sdlc_bad = self._make_lab(1, "SDLC", gate=True)
        self.other, *_ = self._make_lab(2, "Requirements")
        AssessmentAttempt.objects.create(
            assessment=self.other, student=self.student, attempt_number=1, is_completed=True,
            score=9.0, total_marks=10.0, percentage=90.0, passed=True, is_demo_data=True,
            completed_at=timezone.now(),
        )

        # Final readiness test
        self.final = Assessment.objects.create(
            unit=self.unit, semester=self.sem, title="Final Readiness",
            assessment_type=Assessment.AssessmentType.FINAL_READINESS,
            passing_threshold=65.0, total_marks=10.0, status=Assessment.Status.PUBLISHED,
        )
        fq = AssessmentQuestion.objects.create(
            assessment=self.final, question_type="mcq", prompt="Final Q", marks=10.0, topic_tag="SDLC",
        )
        AssessmentOption.objects.create(question=fq, option_text="Right", is_correct=True)

        self.client.force_authenticate(user=self.student)

    def _make_lab(self, week_no, title, gate=False):
        week = LearningWeek.objects.create(
            unit=self.unit, semester=self.sem, week_number=week_no, title=title, is_published=True,
        )
        lab = Assessment.objects.create(
            unit=self.unit, semester=self.sem, week=week, title=title, passing_threshold=75.0,
            total_marks=10.0, status=Assessment.Status.PUBLISHED, readiness_gate=gate,
        )
        q = AssessmentQuestion.objects.create(
            assessment=lab, question_type="mcq", prompt=f"{title} Q", marks=10.0, topic_tag=title,
        )
        ok = AssessmentOption.objects.create(question=q, option_text="Right", is_correct=True)
        bad = AssessmentOption.objects.create(question=q, option_text="Wrong", is_correct=False)
        return lab, q, ok, bad

    def _status(self):
        return self.client.get(f"/api/student/units/{self.unit.id}/final-test/").data

    def _take_sdlc(self, correct):
        start = self.client.get(f"/api/student/assessments/{self.sdlc.id}/")
        self.assertEqual(start.status_code, status.HTTP_200_OK)
        option = self.sdlc_ok if correct else self.sdlc_bad
        return self.client.post(
            f"/api/student/attempts/{start.data['attempt_id']}/submit/",
            {"answers": [{"question_id": self.sdlc_q.id, "selected_option_id": option.id}]},
            format="json",
        )

    def test_locked_before_sdlc_progress_shows_one_of_two(self):
        data = self._status()
        self.assertFalse(data["is_eligible"])
        self.assertEqual((data["labs_completed"], data["total_labs"]), (1, 2))
        self.assertIn("SDLC", data["eligibility_reason"])

    def test_direct_api_cannot_bypass_lock_and_event_is_logged(self):
        resp = self.client.get(f"/api/student/assessments/{self.final.id}/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(resp.data.get("readiness_locked"))
        self.assertTrue(SecurityEvent.objects.filter(
            event_type=SecurityEvent.EventType.UNAUTHORIZED_ACCESS, user=self.student).exists())

    def test_demo_sdlc_attempt_does_not_unlock(self):
        AssessmentAttempt.objects.create(
            assessment=self.sdlc, student=self.student, attempt_number=1, is_completed=True,
            score=10.0, total_marks=10.0, percentage=100.0, passed=True, is_demo_data=True,
        )
        self.assertFalse(self._status()["is_eligible"])
        self.assertEqual(self.client.get(f"/api/student/assessments/{self.final.id}/").status_code, 403)

    def test_failed_sdlc_keeps_lock_then_pass_unlocks(self):
        failed = self._take_sdlc(correct=False)
        self.assertEqual(failed.status_code, status.HTTP_200_OK)
        self.assertFalse(failed.data["passed"])
        self.assertFalse(self._status()["is_eligible"])
        self.assertEqual(self.client.get(f"/api/student/assessments/{self.final.id}/").status_code, 403)

        passed = self._take_sdlc(correct=True)
        self.assertTrue(passed.data["passed"])
        data = self._status()
        self.assertTrue(data["is_eligible"])
        self.assertEqual((data["labs_completed"], data["total_labs"]), (2, 2))
        self.assertEqual(self.client.get(f"/api/student/assessments/{self.final.id}/").status_code, 200)

        # Retake preserved: both SDLC attempts are stored separately, only one is genuine-pass.
        attempts = AssessmentAttempt.objects.filter(assessment=self.sdlc, student=self.student)
        self.assertEqual(attempts.count(), 2)
        self.assertFalse(attempts.filter(is_demo_data=True).exists())

    def test_dashboard_reports_programme_and_year(self):
        data = self.client.get("/api/student/dashboard/").data
        self.assertEqual(data["student"]["programme"], "Computer Science")
        self.assertEqual(data["student"]["year_of_study"], 2)
        self.assertEqual(data["active_unit"]["code"], "RCS 305")
        self.assertFalse(data["readiness"]["unlocked"])
