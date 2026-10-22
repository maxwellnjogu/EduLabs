from django.db import models
from django.conf import settings


class SecurityEvent(models.Model):
    class EventType(models.TextChoices):
        FAILED_LOGIN = "failed_login", "Repeated Failed Login"
        UNAUTHORIZED_ACCESS = "unauthorized_access", "Unauthorized Access Attempt"
        RESTRICTED_RECORD_ACCESS = "restricted_record_access", "Restricted Record Access Attempt"
        SUSPICIOUS_UPLOAD = "suspicious_upload", "Suspicious File Upload"
        RATE_LIMIT_EXCEEDED = "rate_limit_exceeded", "Abnormal API Request Rate"
        PROMPT_INJECTION = "prompt_injection", "Prompt Injection Attempt"

    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class InvestigationStatus(models.TextChoices):
        OPEN = "open", "Open / New"
        UNDER_INVESTIGATION = "under_investigation", "Under Investigation"
        ESCALATED = "escalated", "Escalated"
        RESOLVED = "resolved", "Resolved"
        FALSE_POSITIVE = "false_positive", "False Positive"

    event_type = models.CharField(
        max_length=40,
        choices=EventType.choices,
        default=EventType.UNAUTHORIZED_ACCESS,
    )
    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        default=Severity.MEDIUM,
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.TextField(
        help_text="Safe, sanitized description. Never includes passwords, tokens or secrets."
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="security_events",
    )
    username_attempted = models.CharField(
        max_length=150,
        blank=True,
        help_text="User identity or admission number attempted during event",
    )
    source_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
    )
    endpoint = models.CharField(
        max_length=255,
        help_text="Target API endpoint or resource URI",
    )
    http_status = models.PositiveIntegerField(
        default=200,
        help_text="HTTP status code returned to client",
    )
    investigation_status = models.CharField(
        max_length=30,
        choices=InvestigationStatus.choices,
        default=InvestigationStatus.OPEN,
    )
    resolution_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_security_events",
        limit_choices_to={"role": "admin"},
    )
    escalated_at = models.DateTimeField(null=True, blank=True)
    escalated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="escalated_security_events",
        limit_choices_to={"role": "admin"},
    )
    escalation_notes = models.TextField(blank=True)
    is_demo_data = models.BooleanField(
        default=False,
        help_text="Visibly designates synthetic demonstration alert records",
    )

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        demo_tag = "[DEMO] " if self.is_demo_data else ""
        return f"{demo_tag}[{self.severity.upper()}] {self.event_type} - {self.endpoint} ({self.investigation_status})"


class LoginLog(models.Model):
    class Status(models.TextChoices):
        SUCCESS = "success", "SUCCESS"
        FAILED = "failed", "FAILED"

    timestamp = models.DateTimeField(auto_now_add=True)
    username = models.CharField(max_length=150)
    role = models.CharField(max_length=30, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUCCESS)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    failure_reason = models.CharField(max_length=255, blank=True)
    institution_code = models.CharField(max_length=20, blank=True)
    is_demo_data = models.BooleanField(default=False)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"[{self.status.upper()}] {self.username} ({self.ip_address}) at {self.timestamp}"


class ApiActivityLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=10)
    endpoint = models.CharField(max_length=255)
    status_code = models.PositiveIntegerField(default=200)
    username = models.CharField(max_length=150, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    response_time_ms = models.PositiveIntegerField(default=20)
    is_blocked = models.BooleanField(default=False)
    payload_summary = models.CharField(max_length=255, blank=True)
    is_demo_data = models.BooleanField(default=False)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.method} {self.endpoint} -> {self.status_code} ({self.response_time_ms}ms)"


class SecurityAuditLog(models.Model):
    action = models.CharField(max_length=100)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    target_model = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        actor_name = self.actor.username if self.actor else "System"
        return f"Audit: {actor_name} performed {self.action} on {self.target_model}:{self.target_id}"
