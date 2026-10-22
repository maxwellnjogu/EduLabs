from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "EduLabs Profile",
            {
                "fields": (
                    "role",
                    "admission_number",
                    "university",
                    "display_name",
                )
            },
        ),
    )
    list_display = (
        "username",
        "email",
        "role",
        "admission_number",
        "university",
        "is_active",
        "is_staff",
    )
    list_filter = ("role", "university", "is_active", "is_staff")
    search_fields = ("username", "email", "admission_number", "first_name", "last_name")
