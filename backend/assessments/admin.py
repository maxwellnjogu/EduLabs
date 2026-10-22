from django.contrib import admin
from .models import (
    Assessment,
    AssessmentQuestion,
    AssessmentOption,
    AssessmentAttempt,
    StudentAnswer,
    FinalExamEligibility,
    LeaderboardEntry,
)


class AssessmentOptionInline(admin.TabularInline):
    model = AssessmentOption
    extra = 4


@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(admin.ModelAdmin):
    list_display = ("prompt", "assessment", "question_type", "marks", "timer_seconds", "topic_tag")
    list_filter = ("question_type", "assessment__unit", "topic_tag")
    search_fields = ("prompt", "topic_tag")
    inlines = [AssessmentOptionInline]


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "unit",
        "week",
        "assessment_type",
        "status",
        "passing_threshold",
        "total_marks",
        "version",
    )
    list_filter = ("assessment_type", "status", "unit", "semester")


@admin.register(AssessmentAttempt)
class AssessmentAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "assessment",
        "attempt_number",
        "percentage",
        "score",
        "passed",
        "is_completed",
        "is_demo_data",
        "started_at",
    )
    list_filter = ("passed", "is_completed", "is_demo_data", "assessment__unit")


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ("attempt", "question", "is_correct", "score_awarded", "answered_at")
    list_filter = ("is_correct",)


@admin.register(FinalExamEligibility)
class FinalExamEligibilityAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "unit",
        "readiness_test_passed",
        "readiness_score",
        "lecturer_approved",
        "status",
        "is_demo_data",
    )
    list_filter = ("status", "readiness_test_passed", "lecturer_approved", "is_demo_data")


@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = ("student", "rank", "total_points", "labs_completed", "streak_days", "is_demo_data")
    ordering = ["rank"]
