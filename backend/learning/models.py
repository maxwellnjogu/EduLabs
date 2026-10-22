from django.db import models
from django.conf import settings
from academics.models import Unit, AcademicSemester


class LearningWeek(models.Model):
    unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        related_name="learning_weeks",
    )
    semester = models.ForeignKey(
        AcademicSemester,
        on_delete=models.CASCADE,
        related_name="learning_weeks",
    )
    week_number = models.PositiveSmallIntegerField(
        help_text="Week number between 1 and 14"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["week_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["unit", "semester", "week_number"],
                name="unique_week_per_unit_and_semester",
            )
        ]

    def __str__(self):
        return f"{self.unit.code} - Week {self.week_number}: {self.title}"


class LearningMaterial(models.Model):
    class MaterialType(models.TextChoices):
        PDF = "pdf", "PDF Document"
        DOCX = "docx", "DOCX Document"
        TXT = "txt", "Plain Text Document"
        IMAGE = "image", "Image / Diagram"
        VIDEO = "video", "Video Reference"
        YOUTUBE = "youtube", "YouTube Video"
        NOTES = "notes", "Lecture Notes / Markdown"

    class ProcessingStatus(models.TextChoices):
        UPLOADED = "uploaded", "Uploaded"
        PROCESSING = "processing", "Processing"
        PROCESSED = "processed", "Processed"
        FAILED = "failed", "Failed"
        REQUIRES_REVIEW = "requires_review", "Requires Manual Review"

    week = models.ForeignKey(
        LearningWeek,
        on_delete=models.CASCADE,
        related_name="materials",
    )
    assessment = models.ForeignKey(
        "assessments.Assessment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lab_materials",
        help_text="Optional direct association with a specific lab assessment",
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_materials",
        help_text="Lecturer who uploaded this material",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    material_type = models.CharField(
        max_length=20,
        choices=MaterialType.choices,
        default=MaterialType.NOTES,
    )
    file = models.FileField(
        upload_to="materials/%Y/%m/",
        null=True,
        blank=True,
    )
    url = models.URLField(
        max_length=500,
        blank=True,
        help_text="External URL or YouTube link",
    )
    content = models.TextField(
        blank=True,
        help_text="Lecture notes, summary, or formatted text",
    )
    extracted_text = models.TextField(
        blank=True,
        help_text="Clean extracted text content for AI grounding",
    )
    processing_status = models.CharField(
        max_length=20,
        choices=ProcessingStatus.choices,
        default=ProcessingStatus.PROCESSED,
    )
    processing_error = models.TextField(
        blank=True,
        help_text="Sanitized error description if extraction or processing failed",
    )
    file_size = models.PositiveIntegerField(
        default=0,
        help_text="File size in bytes",
    )
    original_filename = models.CharField(
        max_length=255,
        blank=True,
        help_text="Original uploaded filename before UUID renaming",
    )
    is_published = models.BooleanField(default=True)
    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.material_type}] {self.title} (Week {self.week.week_number})"



class RevisionResource(models.Model):
    class ResourceType(models.TextChoices):
        PAST_PAPER = "past_paper", "Past Paper Material"
        TOPIC_GUIDE = "topic_guide", "Revision Subtopic Guide"
        SUMMARY = "summary", "Consolidated Summary Notes"
        DOCUMENT = "document", "Document / Handout"

    unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        related_name="revision_resources",
    )
    semester = models.ForeignKey(
        AcademicSemester,
        on_delete=models.CASCADE,
        related_name="revision_resources",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    resource_type = models.CharField(
        max_length=30,
        choices=ResourceType.choices,
        default=ResourceType.TOPIC_GUIDE,
    )
    file = models.FileField(
        upload_to="revision/%Y/%m/",
        null=True,
        blank=True,
    )
    content = models.TextField(
        blank=True,
        help_text="Text content, question bank, or study guide",
    )
    is_published = models.BooleanField(default=True)
    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.unit.code} Revision - {self.title}"


class LecturerRecommendedTopic(models.Model):
    class Priority(models.TextChoices):
        HIGH = "high", "High Priority"
        MEDIUM = "medium", "Medium Priority"
        LOW = "low", "Low Priority"

    unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        related_name="recommended_topics",
    )
    semester = models.ForeignKey(
        AcademicSemester,
        on_delete=models.CASCADE,
        related_name="recommended_topics",
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.HIGH,
    )
    rationale = models.TextField(
        blank=True,
        help_text="Lecturer's advice on why this topic is important for readiness",
    )
    is_in_final_test = models.BooleanField(
        default=True,
        help_text="Incorporated into the final exam readiness assessment",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.unit.code}: {self.title} ({self.priority})"
