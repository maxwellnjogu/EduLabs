from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    InstitutionListView,
    StudentLoginView,
    LecturerLoginView,
    AdminLoginView,
    CurrentUserProfileView,
    StudentRegisterView,
    LecturerRegisterView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path("institutions/", InstitutionListView.as_view(), name="auth-institutions"),
    path("student-login/", StudentLoginView.as_view(), name="auth-student-login"),
    path("student-register/", StudentRegisterView.as_view(), name="auth-student-register"),
    path("lecturer-login/", LecturerLoginView.as_view(), name="auth-lecturer-login"),
    path("lecturer-register/", LecturerRegisterView.as_view(), name="auth-lecturer-register"),
    path("admin-login/", AdminLoginView.as_view(), name="auth-admin-login"),
    path("password-reset-request/", PasswordResetRequestView.as_view(), name="auth-password-reset-request"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),
    # General login alias that can handle any role
    path("login/", StudentLoginView.as_view(), name="auth-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("me/", CurrentUserProfileView.as_view(), name="auth-me"),
]
