from django.db import models
from django.conf import settings
from academics.models import Unit, AcademicSemester
from learning.models import LearningWeek


class Assessment(models.Model):
    class AssessmentType(models.TextChoices):
        LAB = "lab", "Weekly Interactive Lab"
        FINAL_READINESS = "final_readiness", "Final Exam Readiness Test"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft (In Review)"
        PUBLISHED = "published", "Published"
        CLOSED = "closed", "Closed"

    unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        related_name="assessments",
    )
    semester = models.ForeignKey(
        AcademicSemester,
        on_delete=models.CASCADE,
        related_name="assessments",
    )
    week = models.ForeignKey(
        LearningWeek,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assessments",
        help_text="Associated learning week (null for final readiness assessment)",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assessment_type = models.CharField(
        max_length=30,
        choices=AssessmentType.choices,
        default=AssessmentType.LAB,
    )
    passing_threshold = models.FloatField(
        default=75.0,
        help_text="Passing threshold percentage (e.g. 75% for Lab, 65% for Final)",
    )
    total_marks = models.FloatField(
        default=30.0,
        help_text="Configured maximum total marks",
    )
    quiz_marks = models.FloatField(
        default=20.0,
        help_text="Marks allocated to multiple choice section",
    )
    flashcard_marks = models.FloatField(
        default=4.0,
        help_text="Marks allocated to flashcard review section",
    )
    written_marks = models.FloatField(
        default=6.0,
        help_text="Marks allocated to written response activities",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    version = models.PositiveIntegerField(default=1)
    allow_retakes = models.BooleanField(default=True)
    max_retakes = models.PositiveIntegerField(default=3)
    readiness_gate = models.BooleanField(
        default=False,
        help_text="A genuine (non-demo) pass of this lab is required before the final readiness test unlocks",
    )
    reveal_answers = models.BooleanField(
        default=True,
        help_text="Show feedback and correct answers on completion/failure",
    )
    activity_config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Configured testing modes and per-mode parameters",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["week__week_number", "created_at"]

    def __str__(self):
        week_str = f"Wk {self.week.week_number}" if self.week else "Final Test"
        return f"{self.unit.code} [{week_str}] {self.title} ({self.status})"


class AssessmentQuestion(models.Model):
    class QuestionType(models.TextChoices):
        MCQ = "mcq", "Multiple Choice Question"
        TRIVIA = "trivia", "Trivia Exercise"
        MULTI_SELECT = "multi_select", "Multiple-Select Question"
        FILL_BLANKS = "fill_blanks", "Fill in the Blanks"
        FLASHCARD = "flashcard", "Flashcard (Concept & Answer)"
        MATCHING = "matching", "Term-to-Definition Matching"
        DRAG_DROP = "drag_drop", "Drag & Drop Phase Ordering"
        WRITTEN = "written", "Short Written Response"
        SCENARIO = "scenario", "What Would You Do? Scenario"
        CASE_STUDY = "case_study", "Case Study Analysis"

    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    question_type = models.CharField(
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.MCQ,
    )
    prompt = models.TextField(help_text="Question text, prompt, or term")
    marks = models.FloatField(default=2.0)
    timer_seconds = models.PositiveIntegerField(
        default=10,
        help_text="Countdown time in seconds (e.g. 10s for MCQ, 30s for written)",
    )
    topic_tag = models.CharField(
        max_length=100,
        help_text="Topic classification tag for analytics and weakness tracking",
    )
    explanation = models.TextField(
        blank=True,
        help_text="Explanatory feedback shown after attempt completion",
    )
    marking_rubric = models.TextField(
        blank=True,
        help_text="Evaluation criteria or key concepts required for written answer",
    )
    matching_pairs = models.JSONField(
        default=list,
        blank=True,
        help_text="List of {term: '...', definition: '...'} for matching questions",
    )
    config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Structured mode-specific metadata: accepted_answers, case_study_data, scoring_rules, etc.",
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(
        default=True,
        help_text="Active questions are included in live student assessments. Inactive questions are retired for historical audit integrity.",
    )

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"[{self.question_type.upper()}] {self.prompt[:60]} ({self.marks} pts)"


class AssessmentOption(models.Model):
    question = models.ForeignKey(
        AssessmentQuestion,
        on_delete=models.CASCADE,
        related_name="options",
    )
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        flag = "[✓]" if self.is_correct else "[ ]"
        return f"{flag} {self.option_text[:60]}"


class AssessmentAttempt(models.Model):
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assessment_attempts",
        limit_choices_to={"role": "student"},
    )
    attempt_number = models.PositiveIntegerField(default=1)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(default=0.0)
    total_marks = models.FloatField(default=30.0)
    percentage = models.FloatField(default=0.0)
    passed = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    seed = models.IntegerField(
        default=12345,
        help_text="Seed for deterministic question/option shuffling per attempt",
    )
    is_demo_data = models.BooleanField(
        default=False,
        help_text="Visibly indicates synthetic demo attempts in analytics",
    )

    class Meta:
        ordering = ["-started_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["assessment", "student", "attempt_number"],
                name="unique_attempt_per_student_number",
            )
        ]

    def __str__(self):
        status_str = "Passed" if self.passed else "Failed"
        return f"{self.student.username} - {self.assessment.title} Att #{self.attempt_number}: {self.percentage:.1f}% ({status_str})"


class StudentAnswer(models.Model):
    attempt = models.ForeignKey(
        AssessmentAttempt,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    question = models.ForeignKey(
        AssessmentQuestion,
        on_delete=models.CASCADE,
        related_name="student_answers",
    )
    selected_option = models.ForeignKey(
        AssessmentOption,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    written_response = models.TextField(blank=True)
    matched_pairs = models.JSONField(
        default=dict,
        blank=True,
        help_text="Student's matched pair mappings {term: definition}",
    )
    answer_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Structured answers: multi_select option IDs, fill-in blanks, case study text, etc.",
    )
    is_correct = models.BooleanField(default=False)
    score_awarded = models.FloatField(default=0.0)
    feedback = models.TextField(blank=True)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["attempt", "question"],
                name="unique_answer_per_attempt_question",
            )
        ]

    def __str__(self):
        return f"Ans: Q{self.question.id} in Attempt {self.attempt.id} -> {self.score_awarded} pts"


class FinalExamEligibility(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending Requirements"
        ELIGIBLE = "eligible", "Eligible (Readiness Passed)"
        APPROVED = "approved", "Approved by Lecturer"
        DISQUALIFIED = "disqualified", "Disqualified"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="final_eligibilities",
        limit_choices_to={"role": "student"},
    )
    unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        related_name="final_eligibilities",
    )
    semester = models.ForeignKey(
        AcademicSemester,
        on_delete=models.CASCADE,
        related_name="final_eligibilities",
    )
    readiness_test_passed = models.BooleanField(default=False)
    readiness_score = models.FloatField(default=0.0)
    labs_completed = models.PositiveIntegerField(
        default=0,
        help_text="Number of passing labs completed",
    )
    total_labs_required = models.PositiveIntegerField(default=14)
    lecturer_approved = models.BooleanField(
        default=False,
        help_text="Official approval by lecturer for university examination",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
        limit_choices_to={"role": "lecturer"},
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    notes = models.TextField(blank=True)
    is_demo_data = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "unit", "semester"],
                name="unique_final_eligibility_per_student_unit_semester",
            )
        ]

    def __str__(self):
        return f"{self.student.username} - {self.unit.code}: {self.status}"


class LeaderboardEntry(models.Model):
    student = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="leaderboard_entry",
        limit_choices_to={"role": "student"},
    )
    total_points = models.PositiveIntegerField(default=0)
    labs_completed = models.PositiveIntegerField(default=0)
    streak_days = models.PositiveIntegerField(default=1)
    rank = models.PositiveIntegerField(default=1)
    is_demo_data = models.BooleanField(default=False)
    last_activity_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-total_points", "-labs_completed"]

    def __str__(self):
        return f"#{self.rank} {self.student.username} ({self.total_points} pts)"
