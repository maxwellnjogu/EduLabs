from django.contrib import admin
from .models import SecurityEvent, SecurityAuditLog


@admin.register(SecurityEvent)
class SecurityEventAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "event_type",
        "severity",
        "endpoint",
        "source_ip",
        "user",
        "investigation_status",
        "is_demo_data",
        "timestamp",
    )
    list_filter = ("event_type", "severity", "investigation_status", "is_demo_data")
    search_fields = ("description", "endpoint", "username_attempted", "source_ip")


@admin.register(SecurityAuditLog)
class SecurityAuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "actor", "target_model", "target_id", "ip_address", "timestamp")
    list_filter = ("action", "target_model")
