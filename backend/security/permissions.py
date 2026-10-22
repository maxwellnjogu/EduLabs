from rest_framework import permissions
from academics.models import LecturerAssignment, StudentEnrolment
from security.utils import log_security_event
from soc.models import SecurityEvent


class IsStudent(permissions.BasePermission):
    """Allows access only to authenticated students."""
    def has_permission(self, request, view):
        is_ok = bool(request.user and request.user.is_authenticated and request.user.is_student)
        if not is_ok and request.user and request.user.is_authenticated:
            log_security_event(
                request=request,
                event_type=SecurityEvent.EventType.UNAUTHORIZED_ACCESS,
                severity=SecurityEvent.Severity.MEDIUM,
                description=f"Non-student role ({request.user.role}) attempted to access student endpoint",
                user=request.user,
                http_status=403,
            )
        return is_ok


class IsLecturer(permissions.BasePermission):
    """Allows access only to authenticated lecturers."""
    def has_permission(self, request, view):
        is_ok = bool(request.user and request.user.is_authenticated and request.user.is_lecturer)
        if not is_ok and request.user and request.user.is_authenticated:
            log_security_event(
                request=request,
                event_type=SecurityEvent.EventType.UNAUTHORIZED_ACCESS,
                severity=SecurityEvent.Severity.MEDIUM,
                description=f"Non-lecturer role ({request.user.role}) attempted to access lecturer endpoint",
                user=request.user,
                http_status=403,
            )
        return is_ok


class IsAdminRole(permissions.BasePermission):
    """Allows access only to authenticated administrators and SOC personnel."""
    def has_permission(self, request, view):
        is_ok = bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_admin_user or request.user.is_superuser)
        )
        if not is_ok and request.user and request.user.is_authenticated:
            log_security_event(
                request=request,
                event_type=SecurityEvent.EventType.UNAUTHORIZED_ACCESS,
                severity=SecurityEvent.Severity.HIGH,
                description=f"Unauthorized user {request.user.username} ({request.user.role}) attempted to access admin/SOC endpoint",
                user=request.user,
                http_status=403,
            )
        return is_ok


class IsAttemptOwner(permissions.BasePermission):
    """Object-level permission allowing students to view only their own attempts."""
    def has_object_permission(self, request, view, obj):
        # Admins or assigned lecturers can review; students must own the attempt
        if request.user.is_admin_user:
            return True
        if request.user.is_lecturer:
            # Check lecturer assigned to assessment unit
            return LecturerAssignment.objects.filter(
                lecturer=request.user,
                unit=obj.assessment.unit,
                is_active=True,
            ).exists()
        
        # Student owner check
        is_owner = obj.student == request.user
        if not is_owner:
            log_security_event(
                request=request,
                event_type=SecurityEvent.EventType.RESTRICTED_RECORD_ACCESS,
                severity=SecurityEvent.Severity.HIGH,
                description=f"Student {request.user.username} attempted to access attempt record #{obj.id} belonging to student {obj.student.username}",
                user=request.user,
                http_status=403,
            )
        return is_owner
