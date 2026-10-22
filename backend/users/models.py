from django.db import models

# Create your models here.

from django.contrib.auth.models import AbstractUser



class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        LECTURER = "lecturer", "Lecturer"
        ADMIN = "admin", "Administrator"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    admission_number = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        help_text="Student admission number (e.g. RU-2026-041)",
    )
    university = models.ForeignKey(
        "academics.University",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    display_name = models.CharField(
        max_length=150,
        blank=True,
        help_text="Optional public display name for leaderboard",
    )
    year_of_study = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Student's current year of study within their programme (e.g. 2)",
    )

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_lecturer(self):
        return self.role == self.Role.LECTURER

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN or self.is_superuser

    def __str__(self):
        name = self.get_full_name() or self.username
        if self.admission_number:
            return f"{name} ({self.admission_number})"
        return f"{name} ({self.role})"

