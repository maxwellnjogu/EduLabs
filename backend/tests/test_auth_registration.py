from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from academics.models import University, Programme, Unit, AcademicSemester, StudentEnrolment

User = get_user_model()


class AuthRegistrationAndResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.uni = University.objects.create(name="Riara University", code="RU", is_active=True)
        self.prog = Programme.objects.create(university=self.uni, name="Computer Science", code="CS", is_active=True)
        self.sem = AcademicSemester.objects.create(
            university=self.uni,
            name="Semester 2",
            academic_year="2025/2026",
            start_date="2026-01-10",
            end_date="2026-05-30",
            status=AcademicSemester.Status.ACTIVE,
        )
        self.unit = Unit.objects.create(
            programme=self.prog,
            name="Software Engineering",
            code="RCS 305",
            is_active=True,
        )

    def test_student_registration_success(self):
        payload = {
            "first_name": "Faith",
            "last_name": "Mutua",
            "admission_number": "RU-2026-099",
            "email": "faith.mutua@riara.ac.ke",
            "university_code": "RU",
            "year_of_study": 2,
            "password": "Password123!",
            "confirm_password": "Password123!",
        }
        res = self.client.post("/api/auth/student-register/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", res.data)
        self.assertEqual(res.data["portal"], "student")

        # Verify DB record
        user = User.objects.get(admission_number="RU-2026-099")
        self.assertEqual(user.first_name, "Faith")
        self.assertEqual(user.role, User.Role.STUDENT)
        self.assertEqual(user.university, self.uni)
        self.assertTrue(user.check_password("Password123!"))

        # Verify auto-enrolment
        enrolment = StudentEnrolment.objects.filter(student=user, unit=self.unit).first()
        self.assertIsNotNone(enrolment)
        self.assertTrue(enrolment.is_active)

    def test_student_registration_duplicate_admission_fails(self):
        User.objects.create(
            username="existing_std",
            admission_number="RU-2026-041",
            role=User.Role.STUDENT,
            university=self.uni,
        )
        payload = {
            "first_name": "Duplicate",
            "last_name": "User",
            "admission_number": "RU-2026-041",
            "email": "dup@riara.ac.ke",
            "university_code": "RU",
            "year_of_study": 2,
            "password": "Password123!",
            "confirm_password": "Password123!",
        }
        res = self.client.post("/api/auth/student-register/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("admission_number", res.data)

    def test_lecturer_registration_success(self):
        payload = {
            "first_name": "Grace",
            "last_name": "Ochieng",
            "username": "gochieng",
            "email": "gochieng@riara.ac.ke",
            "university_code": "RU",
            "password": "Password123!",
            "confirm_password": "Password123!",
        }
        res = self.client.post("/api/auth/lecturer-register/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", res.data)
        self.assertEqual(res.data["portal"], "lecturer")

        user = User.objects.get(username="gochieng")
        self.assertEqual(user.role, User.Role.LECTURER)
        self.assertTrue(user.check_password("Password123!"))

    def test_password_reset_flow(self):
        user = User.objects.create(
            username="reset_user",
            admission_number="RU-2026-077",
            email="reset.user@riara.ac.ke",
            role=User.Role.STUDENT,
            university=self.uni,
        )
        user.set_password("OldPassword123!")
        user.save()

        # Step 1: Request reset
        req_res = self.client.post("/api/auth/password-reset-request/", {"identifier": "RU-2026-077"}, format="json")
        self.assertEqual(req_res.status_code, status.HTTP_200_OK)
        reset_token = req_res.data["reset_token"]
        self.assertTrue(reset_token.startswith("MAX-"))

        # Step 2: Confirm reset with new password
        conf_res = self.client.post(
            "/api/auth/password-reset-confirm/",
            {
                "identifier": "RU-2026-077",
                "reset_token": reset_token,
                "new_password": "BrandNewPassword2026!",
                "confirm_password": "BrandNewPassword2026!",
            },
            format="json",
        )
        self.assertEqual(conf_res.status_code, status.HTTP_200_OK)

        # Verify password actually changed
        user.refresh_from_db()
        self.assertFalse(user.check_password("OldPassword123!"))
        self.assertTrue(user.check_password("BrandNewPassword2026!"))
