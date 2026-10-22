from django.contrib import admin
from .models import (
    LearningWeek,
    LearningMaterial,
    RevisionResource,
    LecturerRecommendedTopic,
)


@admin.register(LearningWeek)
class LearningWeekAdmin(admin.ModelAdmin):
    list_display = ("unit", "week_number", "title", "semester", "is_published", "published_at")
    list_filter = ("unit", "semester", "is_published")


@admin.register(LearningMaterial)
class LearningMaterialAdmin(admin.ModelAdmin):
    list_display = ("title", "week", "material_type", "is_published", "version", "created_at")
    list_filter = ("material_type", "is_published", "week__unit")
    search_fields = ("title", "description", "content")


@admin.register(RevisionResource)
class RevisionResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "unit", "resource_type", "semester", "is_published", "version")
    list_filter = ("resource_type", "is_published", "unit")


@admin.register(LecturerRecommendedTopic)
class LecturerRecommendedTopicAdmin(admin.ModelAdmin):
    list_display = ("title", "unit", "priority", "is_in_final_test", "created_at")
    list_filter = ("priority", "is_in_final_test", "unit")
