from rest_framework import serializers
from django.contrib.auth import get_user_model
from academics.models import University

User = get_user_model()


class UniversitySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ["id", "name", "code", "is_active"]


class UserProfileSerializer(serializers.ModelSerializer):
    university_detail = UniversitySimpleSerializer(source="university", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "admission_number",
            "display_name",
            "university",
            "university_detail",
            "is_student",
            "is_lecturer",
            "is_admin_user",
        ]
        read_only_fields = ["id", "role", "is_student", "is_lecturer", "is_admin_user"]


class StudentLoginSerializer(serializers.Serializer):
    university_code = serializers.CharField(required=True)
    admission_number = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class StandardLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class StudentRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    admission_number = serializers.CharField(max_length=50, required=True)
    email = serializers.EmailField(required=True)
    university_code = serializers.CharField(max_length=30, required=True)
    year_of_study = serializers.IntegerField(default=2, min_value=1, max_value=6)
    password = serializers.CharField(min_length=8, write_only=True, required=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True, required=True)

    def validate_admission_number(self, value):
        val = value.strip().upper()
        if User.objects.filter(admission_number__iexact=val).exists():
            raise serializers.ValidationError("A student with this admission number is already registered.")
        return val

    def validate_email(self, value):
        val = value.strip().lower()
        if User.objects.filter(email__iexact=val).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return val

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs


class LecturerRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    university_code = serializers.CharField(max_length=30, required=True)
    password = serializers.CharField(min_length=8, write_only=True, required=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True, required=True)

    def validate_username(self, value):
        val = value.strip().lower()
        if User.objects.filter(username__iexact=val).exists():
            raise serializers.ValidationError("This username is already taken.")
        return val

    def validate_email(self, value):
        val = value.strip().lower()
        if User.objects.filter(email__iexact=val).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return val

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True, help_text="Email, Admission Number, or Username")


class PasswordResetConfirmSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True)
    reset_token = serializers.CharField(required=True)
    new_password = serializers.CharField(min_length=8, write_only=True, required=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True, required=True)

    def validate(self, attrs):
        if attrs.get("new_password") != attrs.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

