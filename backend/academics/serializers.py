from rest_framework import serializers
from .models import (
    University,
    Programme,
    AcademicSemester,
    Unit,
    LecturerAssignment,
    StudentEnrolment,
)


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ["id", "name", "code", "is_active", "created_at"]


class AcademicSemesterSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source="university.name", read_only=True)

    class Meta:
        model = AcademicSemester
        fields = [
            "id",
            "university",
            "university_name",
            "name",
            "academic_year",
            "start_date",
            "end_date",
            "status",
            "is_active",
        ]


class UnitSerializer(serializers.ModelSerializer):
    programme_name = serializers.CharField(source="programme.name", read_only=True)
    university_name = serializers.CharField(source="programme.university.name", read_only=True)

    class Meta:
        model = Unit
        fields = [
            "id",
            "programme",
            "programme_name",
            "university_name",
            "name",
            "code",
            "description",
            "is_sample",
            "is_active",
        ]


class LecturerAssignmentSerializer(serializers.ModelSerializer):
    unit_detail = UnitSerializer(source="unit", read_only=True)
    semester_detail = AcademicSemesterSerializer(source="semester", read_only=True)

    class Meta:
        model = LecturerAssignment
        fields = ["id", "lecturer", "unit", "unit_detail", "semester", "semester_detail", "assigned_at", "is_active"]


class StudentEnrolmentSerializer(serializers.ModelSerializer):
    unit_detail = UnitSerializer(source="unit", read_only=True)
    semester_detail = AcademicSemesterSerializer(source="semester", read_only=True)

    class Meta:
        model = StudentEnrolment
        fields = ["id", "student", "unit", "unit_detail", "semester", "semester_detail", "enrolled_at", "is_active"]
