import os
import re
import uuid
from pathlib import Path
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied, ValidationError
from soc.models import SecurityEvent, SecurityAuditLog


# Allowed file extensions and corresponding MIME/header checks
# Allowed file extensions and corresponding MIME/header checks
ALLOWED_EXTENSIONS = {
    ".pdf": b"%PDF",
    ".docx": b"PK\x03\x04",
    ".txt": None,  # Plain text validated via decoding check
    ".png": b"\x89PNG\r\n\x1a\n",
    ".jpg": b"\xff\xd8\xff",
    ".jpeg": b"\xff\xd8\xff",
    ".webp": b"RIFF",
}

# Maximum file size: 15MB
MAX_UPLOAD_SIZE = 15 * 1024 * 1024

# Prompt injection signature patterns
PROMPT_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+instructions", re.IGNORECASE),
    re.compile(r"system\s+prompt", re.IGNORECASE),
    re.compile(r"jailbreak", re.IGNORECASE),
    re.compile(r"dan\s+mode", re.IGNORECASE),
    re.compile(r"disregard\s+(the\s+)?rules", re.IGNORECASE),
    re.compile(r"bypass\s+(the\s+)?(guardrail|filter|security)", re.IGNORECASE),
    re.compile(r"reveal\s+(the\s+)?(api\s+key|password|secret|instruction)", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+in\s+developer\s+mode", re.IGNORECASE),
    re.compile(r"<script.*?>.*?</script>", re.IGNORECASE),
    re.compile(r"drop\s+table", re.IGNORECASE),
    re.compile(r"union\s+select", re.IGNORECASE),
]


def get_client_ip(request):
    """Safely extracts client IP address from request."""
    if not request:
        return None
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


def log_security_event(
    request,
    event_type,
    severity,
    description,
    user=None,
    username_attempted="",
    http_status=403,
    is_demo_data=False,
):
    """
    Safely creates a SecurityEvent record in the database.
    Ensures credentials, passwords, or secrets are NEVER stored.
    """
    endpoint = request.path if request else "unknown"
    source_ip = get_client_ip(request)

    if not user and request and hasattr(request, "user") and request.user.is_authenticated:
        user = request.user

    # Sanitize description: never log passwords or JWT tokens
    clean_desc = re.sub(r"password=[\S]+", "password=[REDACTED]", description, flags=re.IGNORECASE)
    clean_desc = re.sub(r"Bearer\s+[\S]+", "Bearer [REDACTED]", clean_desc, flags=re.IGNORECASE)

    return SecurityEvent.objects.create(
        event_type=event_type,
        severity=severity,
        description=clean_desc,
        user=user if user and getattr(user, "is_authenticated", False) else None,
        username_attempted=username_attempted[:150],
        source_ip=source_ip,
        endpoint=endpoint[:255],
        http_status=http_status,
        is_demo_data=is_demo_data,
    )


def log_audit_trail(request, action, target_model, target_id, details=None):
    """Records an audit trail action."""
    actor = request.user if request and hasattr(request, "user") and request.user.is_authenticated else None
    ip = get_client_ip(request)
    return SecurityAuditLog.objects.create(
        action=action,
        actor=actor,
        target_model=target_model,
        target_id=str(target_id),
        details=details or {},
        ip_address=ip,
    )


def check_prompt_injection(user_input: str, request=None) -> None:
    """
    Inspects user input for prompt-injection attacks.
    If detected, logs a high-severity security event and raises a ValidationError.
    """
    if not user_input:
        return

    for pattern in PROMPT_INJECTION_PATTERNS:
        if pattern.search(user_input):
            # Prompt injection detected! Block immediately
            log_security_event(
                request=request,
                event_type=SecurityEvent.EventType.PROMPT_INJECTION,
                severity=SecurityEvent.Severity.HIGH,
                description=f"Prompt injection pattern detected: '{pattern.pattern}' in user query",
                http_status=400,
            )
            raise ValidationError(
                {"error": "Security Alert: Malicious prompt injection pattern detected and blocked by EduLabs Guardrails."}
            )


def validate_and_save_upload(uploaded_file, upload_subdir="materials"):
    """
    Strict server-side validation of uploaded files:
    1. Size limit enforcement
    2. Allowlist extension check
    3. Magic bytes / header content verification
    4. Safe UUID-based filename generation to prevent directory traversal
    """
    if uploaded_file.size > MAX_UPLOAD_SIZE:
        raise ValidationError(f"File size exceeds limit of {MAX_UPLOAD_SIZE // (1024*1024)}MB.")

    original_name = uploaded_file.name
    ext = os.path.splitext(original_name)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(f"File type '{ext}' is not permitted. Permitted formats: {', '.join(ALLOWED_EXTENSIONS.keys())}.")

    # Verify header / content
    expected_header = ALLOWED_EXTENSIONS[ext]
    uploaded_file.seek(0)
    
    if ext == ".txt":
        head_sample = uploaded_file.read(4096)
        uploaded_file.seek(0)
        if b"\x00" in head_sample:
            raise ValidationError("Binary or executable content detected in plain text file.")
        try:
            head_sample.decode("utf-8")
        except UnicodeDecodeError:
            try:
                head_sample.decode("latin-1")
            except Exception:
                raise ValidationError("Unable to decode plain text file content.")
    elif ext == ".webp":
        file_head = uploaded_file.read(12)
        uploaded_file.seek(0)
        if not (file_head.startswith(b"RIFF") and len(file_head) >= 12 and file_head[8:12] == b"WEBP"):
            raise ValidationError("File content header does not match declared WEBP image format.")
    else:
        file_head = uploaded_file.read(len(expected_header))
        uploaded_file.seek(0)
        if not file_head.startswith(expected_header):
            raise ValidationError("File content header does not match declared extension type.")

    # Generate random unique filename
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    return safe_filename

