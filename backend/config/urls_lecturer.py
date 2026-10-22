from django.urls import path
from learning.lecturer_views import (
    LecturerDashboardView,
    LecturerUnitsView,
    LecturerWeeksView,
    LecturerMaterialsView,
    LecturerMaterialDetailView,
    LecturerRevisionPackView,
)
from assessments.lecturer_views import (
    LecturerGenerateDemoContentView,
    LecturerAssessmentsView,
    LecturerAssessmentDetailView,
    LecturerAssessmentPreviewView,
    LecturerQuestionsView,
    LecturerQuestionDetailView,
    LecturerUnitAnalyticsView,
    LecturerFinalExamApprovalsView,
    LecturerApproveFinalExamView,
    LecturerAssessmentMaterialsView,
    LecturerGenerateGroundedQuestionsView,
    LecturerRegenerateQuestionView,
    LecturerGenerateExamReadinessView,
)

urlpatterns = [
    path("dashboard/", LecturerDashboardView.as_view(), name="lecturer-dashboard"),
    path("units/", LecturerUnitsView.as_view(), name="lecturer-units"),
    path("units/<int:unit_id>/weeks/", LecturerWeeksView.as_view(), name="lecturer-unit-weeks"),
    path("units/<int:unit_id>/analytics/", LecturerUnitAnalyticsView.as_view(), name="lecturer-unit-analytics"),
    path("units/<int:unit_id>/revision-pack/", LecturerRevisionPackView.as_view(), name="lecturer-unit-revision-pack"),
    path("units/<int:unit_id>/final-exam-approvals/", LecturerFinalExamApprovalsView.as_view(), name="lecturer-final-exam-approvals"),
    path("units/<int:unit_id>/generate-exam-readiness/", LecturerGenerateExamReadinessView.as_view(), name="lecturer-unit-generate-exam-readiness"),
    path("units/<int:unit_id>/generate-demo-content/", LecturerGenerateDemoContentView.as_view(), name="lecturer-generate-demo-content"),
    path("assessments/<int:assessment_id>/generate-demo-content/", LecturerGenerateDemoContentView.as_view(), name="lecturer-assessment-generate-demo-content"),
    path("assessments/<int:assessment_id>/generate-grounded/", LecturerGenerateGroundedQuestionsView.as_view(), name="lecturer-assessment-generate-grounded"),
    path("weeks/<int:week_id>/materials/", LecturerMaterialsView.as_view(), name="lecturer-week-materials"),
    path("materials/", LecturerMaterialsView.as_view(), name="lecturer-materials"),
    path("materials/<int:material_id>/", LecturerMaterialDetailView.as_view(), name="lecturer-material-detail"),
    path("assessments/<int:assessment_id>/materials/", LecturerAssessmentMaterialsView.as_view(), name="lecturer-assessment-materials"),
    path("units/<int:unit_id>/assessments/", LecturerAssessmentsView.as_view(), name="lecturer-unit-assessments"),
    path("assessments/<int:assessment_id>/", LecturerAssessmentDetailView.as_view(), name="lecturer-assessment-detail"),
    path("assessments/<int:assessment_id>/preview/", LecturerAssessmentPreviewView.as_view(), name="lecturer-assessment-preview"),
    path("assessments/<int:assessment_id>/questions/", LecturerQuestionsView.as_view(), name="lecturer-assessment-questions"),
    path("questions/<int:question_id>/", LecturerQuestionDetailView.as_view(), name="lecturer-question-detail"),
    path("questions/<int:question_id>/regenerate/", LecturerRegenerateQuestionView.as_view(), name="lecturer-question-regenerate"),
    path("final-exam-approvals/<int:eligibility_id>/approve/", LecturerApproveFinalExamView.as_view(), name="lecturer-approve-final-exam"),
]

