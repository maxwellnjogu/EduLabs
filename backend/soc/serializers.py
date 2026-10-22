from rest_framework import serializers
from .models import SecurityEvent, SecurityAuditLog, LoginLog, ApiActivityLog


class SecurityEventSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    resolved_by_name = serializers.CharField(source="resolved_by.username", read_only=True)
    escalated_by_name = serializers.CharField(source="escalated_by.username", read_only=True)

    class Meta:
        model = SecurityEvent
        fields = [
            "id",
            "event_type",
            "severity",
            "timestamp",
            "description",
            "user",
            "user_name",
            "username_attempted",
            "source_ip",
            "endpoint",
            "http_status",
            "investigation_status",
            "resolution_notes",
            "resolved_at",
            "resolved_by",
            "resolved_by_name",
            "escalated_at",
            "escalated_by",
            "escalated_by_name",
            "escalation_notes",
            "is_demo_data",
        ]
        read_only_fields = ["id", "timestamp"]


class LoginLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginLog
        fields = [
            "id",
            "timestamp",
            "username",
            "role",
            "status",
            "ip_address",
            "user_agent",
            "failure_reason",
            "institution_code",
            "is_demo_data",
        ]


class ApiActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiActivityLog
        fields = [
            "id",
            "timestamp",
            "method",
            "endpoint",
            "status_code",
            "username",
            "ip_address",
            "response_time_ms",
            "is_blocked",
            "payload_summary",
            "is_demo_data",
        ]


class SecurityAuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.username", read_only=True)

    class Meta:
        model = SecurityAuditLog
        fields = [
            "id",
            "action",
            "actor",
            "actor_name",
            "target_model",
            "target_id",
            "details",
            "ip_address",
            "timestamp",
        ]
