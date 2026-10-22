from django.db import models

# Create your models here.

from django.conf import settings
from django.db import models


class University(models.Model):
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=30, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Programme(models.Model):
    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name="programmes",
    )
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=30)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["university", "code"],
                name="unique_programme_code_per_university",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.university.name})"


class AcademicSemester(models.Model):
    class Status(models.TextChoices):
        UPCOMING = "upcoming", "Upcoming"
        ACTIVE = "active", "Active"
        CLOSED = "closed", "Closed"
        ARCHIVED = "archived", "Archived"

    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name="semesters",
    )
    name = models.CharField(max_length=100, default="Semester 1")
    academic_year = models.CharField(max_length=50, default="2025/2026")
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["university", "name", "academic_year"],
                name="unique_semester_per_university_and_year",
            )
        ]

    def __str__(self):
        return f"{self.university.code} - {self.name} ({self.academic_year})"


class Unit(models.Model):
    programme = models.ForeignKey(
        Programme,
        on_delete=models.CASCADE,
        related_name="units",
    )
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=30)
    description = models.TextField(blank=True)
    is_sample = models.BooleanField(
        default=False,
        help_text="Designates prototype/sample units with non-demonstrated material",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["programme", "code"],
                name="unique_unit_code_per_programme",
            )
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class LecturerAssignment(models.Model):
    lecturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lecturer_assignments",
        limit_choices_to={"role": "lecturer"},
    )
    unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        related_name="lecturer_assignments",
    )
    semester = models.ForeignKey(
        AcademicSemester,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="lecturer_assignments",
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["lecturer", "unit", "semester"],
                name="unique_lecturer_assignment_per_unit_semester",
            )
        ]

    def __str__(self):
        sem_name = self.semester.name if self.semester else "General"
        return f"{self.lecturer.username} - {self.unit.code} ({sem_name})"


class StudentEnrolment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="unit_enrolments",
        limit_choices_to={"role": "student"},
    )
    unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        related_name="student_enrolments",
    )
    semester = models.ForeignKey(
        AcademicSemester,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="student_enrolments",
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "unit", "semester"],
                name="unique_student_enrolment_per_unit_semester",
            )
        ]

    def __str__(self):
        sem_name = self.semester.name if self.semester else "General"
        return f"{self.student.username} - {self.unit.code} ({sem_name})"

