from rest_framework import serializers
from .models import (
    LearningWeek,
    LearningMaterial,
    RevisionResource,
    LecturerRecommendedTopic,
)


class LearningMaterialSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = LearningMaterial
        fields = [
            "id",
            "week",
            "assessment",
            "uploaded_by",
            "uploaded_by_name",
            "title",
            "description",
            "material_type",
            "file",
            "file_url",
            "url",
            "content",
            "extracted_text",
            "processing_status",
            "processing_error",
            "file_size",
            "original_filename",
            "is_published",
            "version",
            "created_at",
            "updated_at",
        ]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            name = obj.uploaded_by.get_full_name()
            return name if name else obj.uploaded_by.username
        return "Faculty / Course Team"



class LearningWeekSerializer(serializers.ModelSerializer):
    materials = LearningMaterialSerializer(many=True, read_only=True)
    materials_count = serializers.IntegerField(source="materials.count", read_only=True)

    class Meta:
        model = LearningWeek
        fields = [
            "id",
            "unit",
            "semester",
            "week_number",
            "title",
            "description",
            "is_published",
            "published_at",
            "materials_count",
            "materials",
        ]


class RevisionResourceSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = RevisionResource
        fields = [
            "id",
            "unit",
            "semester",
            "title",
            "description",
            "resource_type",
            "file",
            "file_url",
            "content",
            "is_published",
            "version",
            "created_at",
        ]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class LecturerRecommendedTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = LecturerRecommendedTopic
        fields = [
            "id",
            "unit",
            "semester",
            "title",
            "description",
            "priority",
            "rationale",
            "is_in_final_test",
            "created_at",
        ]
