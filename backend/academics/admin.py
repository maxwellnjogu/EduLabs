from django.contrib import admin
from .models import (
    University,
    Programme,
    AcademicSemester,
    Unit,
    LecturerAssignment,
    StudentEnrolment,
)


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "is_active", "created_at")
    search_fields = ("name", "code")


@admin.register(AcademicSemester)
class AcademicSemesterAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "academic_year",
        "university",
        "status",
        "start_date",
        "end_date",
        "is_active",
    )
    list_filter = ("university", "status", "academic_year")


@admin.register(Programme)
class ProgrammeAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "university", "is_active")
    list_filter = ("university", "is_active")
    search_fields = ("name", "code")


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "programme", "is_sample", "is_active")
    list_filter = ("programme__university", "is_sample", "is_active")
    search_fields = ("name", "code")


@admin.register(LecturerAssignment)
class LecturerAssignmentAdmin(admin.ModelAdmin):
    list_display = ("lecturer", "unit", "semester", "assigned_at", "is_active")
    list_filter = ("semester", "unit", "is_active")


@admin.register(StudentEnrolment)
class StudentEnrolmentAdmin(admin.ModelAdmin):
    list_display = ("student", "unit", "semester", "enrolled_at", "is_active")
    list_filter = ("semester", "unit", "is_active")
