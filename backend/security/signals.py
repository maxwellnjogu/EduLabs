from django.contrib.auth.signals import user_login_failed
from django.dispatch import receiver
from soc.models import SecurityEvent
from security.utils import get_client_ip


@receiver(user_login_failed)
def handle_failed_login(sender, credentials, request, **kwargs):
    username = credentials.get("username", "") or credentials.get("admission_number", "")
    ip = get_client_ip(request) if request else None
    endpoint = request.path if request else "/api/auth/login/"

    # Check if there have been repeated failed logins from this IP or username in the past 15 minutes
    SecurityEvent.objects.create(
        event_type=SecurityEvent.EventType.FAILED_LOGIN,
        severity=SecurityEvent.Severity.MEDIUM,
        description=f"Authentication failure for username/identity '{username}' from IP {ip or 'unknown'}",
        username_attempted=str(username)[:150],
        source_ip=ip,
        endpoint=endpoint[:255],
        http_status=401,
    )
