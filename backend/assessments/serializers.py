from rest_framework import serializers
from .models import (
    Assessment,
    AssessmentQuestion,
    AssessmentOption,
    AssessmentAttempt,
    StudentAnswer,
    FinalExamEligibility,
    LeaderboardEntry,
)


class AssessmentOptionStudentSerializer(serializers.ModelSerializer):
    """Option serializer for active student attempts - strictly conceals answer key."""
    class Meta:
        model = AssessmentOption
        fields = ["id", "option_text", "order"]


class AssessmentOptionReviewSerializer(serializers.ModelSerializer):
    """Option serializer for review/results and lecturer builder - includes answer key."""
    class Meta:
        model = AssessmentOption
        fields = ["id", "option_text", "is_correct", "order"]


class AssessmentQuestionStudentSerializer(serializers.ModelSerializer):
    """Question serializer for students during test - shuffles and hides correct answers."""
    options = AssessmentOptionStudentSerializer(many=True, read_only=True)

    class Meta:
        model = AssessmentQuestion
        fields = [
            "id",
            "question_type",
            "prompt",
            "marks",
            "timer_seconds",
            "topic_tag",
            "matching_pairs",
            "options",
            "order",
        ]


class AssessmentQuestionReviewSerializer(serializers.ModelSerializer):
    """Question serializer with rubric, explanations, and correct answers."""
    options = AssessmentOptionReviewSerializer(many=True, read_only=True)
    question_text = serializers.CharField(source="prompt", read_only=True)
    time_limit_seconds = serializers.IntegerField(source="timer_seconds", read_only=True)

    class Meta:
        model = AssessmentQuestion
        fields = [
            "id",
            "question_type",
            "prompt",
            "question_text",
            "marks",
            "timer_seconds",
            "time_limit_seconds",
            "topic_tag",
            "explanation",
            "marking_rubric",
            "matching_pairs",
            "options",
            "order",
        ]


class AssessmentSerializer(serializers.ModelSerializer):
    questions_count = serializers.IntegerField(source="questions.count", read_only=True)
    week_number = serializers.IntegerField(source="week.week_number", read_only=True)
    unit_code = serializers.CharField(source="unit.code", read_only=True)
    passing_threshold_percentage = serializers.FloatField(source="passing_threshold", read_only=True)

    class Meta:
        model = Assessment
        fields = [
            "id",
            "unit",
            "unit_code",
            "semester",
            "week",
            "week_number",
            "title",
            "description",
            "assessment_type",
            "passing_threshold",
            "passing_threshold_percentage",
            "total_marks",
            "quiz_marks",
            "flashcard_marks",
            "written_marks",
            "status",
            "version",
            "allow_retakes",
            "max_retakes",
            "reveal_answers",
            "questions_count",
            "created_at",
            "updated_at",
        ]


class StudentAnswerSerializer(serializers.ModelSerializer):
    question_detail = AssessmentQuestionReviewSerializer(source="question", read_only=True)
    selected_option_text = serializers.CharField(source="selected_option.option_text", read_only=True)

    class Meta:
        model = StudentAnswer
        fields = [
            "id",
            "question",
            "question_detail",
            "selected_option",
            "selected_option_text",
            "written_response",
            "matched_pairs",
            "is_correct",
            "score_awarded",
            "feedback",
            "answered_at",
        ]


class AssessmentAttemptSerializer(serializers.ModelSerializer):
    answers = StudentAnswerSerializer(many=True, read_only=True)
    assessment_title = serializers.CharField(source="assessment.title", read_only=True)
    assessment_type = serializers.CharField(source="assessment.assessment_type", read_only=True)
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    student_admission = serializers.CharField(source="student.admission_number", read_only=True)
    passing_threshold = serializers.FloatField(source="assessment.passing_threshold", read_only=True)

    class Meta:
        model = AssessmentAttempt
        fields = [
            "id",
            "assessment",
            "assessment_title",
            "assessment_type",
            "student",
            "student_name",
            "student_admission",
            "attempt_number",
            "started_at",
            "completed_at",
            "score",
            "total_marks",
            "percentage",
            "passed",
            "is_completed",
            "passing_threshold",
            "is_demo_data",
            "answers",
        ]


class FinalExamEligibilitySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    student_admission = serializers.CharField(source="student.admission_number", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.get_full_name", read_only=True)

    class Meta:
        model = FinalExamEligibility
        fields = [
            "id",
            "student",
            "student_name",
            "student_admission",
            "unit",
            "semester",
            "readiness_test_passed",
            "readiness_score",
            "labs_completed",
            "total_labs_required",
            "lecturer_approved",
            "approved_at",
            "approved_by",
            "approved_by_name",
            "status",
            "notes",
            "is_demo_data",
            "updated_at",
        ]


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    # Public leaderboard view: Privacy safe! Only display name or anonymized handle
    student_display = serializers.SerializerMethodField()

    class Meta:
        model = LeaderboardEntry
        fields = [
            "id",
            "rank",
            "student_display",
            "total_points",
            "labs_completed",
            "streak_days",
            "is_demo_data",
            "last_activity_at",
        ]

    def get_student_display(self, obj):
        if obj.student.display_name:
            return obj.student.display_name
        # Mask username for privacy: e.g. "a***u"
        u = obj.student.username
        if len(u) > 2:
            return f"{u[0]}***{u[-1]}"
        return f"Student #{obj.id}"
