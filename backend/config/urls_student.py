from django.urls import path
from learning.student_views import (
    StudentDashboardView,
    StudentSemestersView,
    StudentUnitsView,
    StudentUnitDetailView,
    StudentWeekDetailView,
    StudentRevisionView,
    StudentAskTutorView,
    StudentPracticeQuestionsView,
    StudentCheckPracticeQuestionView,
)
from assessments.student_views import (
    StudentAssessmentDetailView,
    StudentSubmitAttemptView,
    StudentAttemptDetailView,
    StudentAttemptHistoryView,
    StudentFinalTestView,
    StudentLeaderboardView,
)

urlpatterns = [
    path("dashboard/", StudentDashboardView.as_view(), name="student-dashboard"),
    path("semesters/", StudentSemestersView.as_view(), name="student-semesters"),
    path("units/", StudentUnitsView.as_view(), name="student-units"),
    path("units/<int:unit_id>/", StudentUnitDetailView.as_view(), name="student-unit-detail"),
    path("units/<int:unit_id>/revision/", StudentRevisionView.as_view(), name="student-unit-revision"),
    path("units/<int:unit_id>/final-test/", StudentFinalTestView.as_view(), name="student-unit-final-test"),
    path("weeks/<int:week_id>/", StudentWeekDetailView.as_view(), name="student-week-detail"),
    path("units/<int:unit_id>/weeks/<int:week_number>/", StudentWeekDetailView.as_view(), name="student-unit-week-number-detail"),
    path("assessments/<int:assessment_id>/", StudentAssessmentDetailView.as_view(), name="student-assessment-detail"),
    path("assessments/<int:assessment_id>/history/", StudentAttemptHistoryView.as_view(), name="student-assessment-history"),
    path("attempts/<int:attempt_id>/submit/", StudentSubmitAttemptView.as_view(), name="student-attempt-submit"),
    path("attempts/<int:attempt_id>/", StudentAttemptDetailView.as_view(), name="student-attempt-detail"),
    path("leaderboard/", StudentLeaderboardView.as_view(), name="student-leaderboard"),
    path("ask-tutor/", StudentAskTutorView.as_view(), name="student-ask-tutor"),
    path("practice-questions/", StudentPracticeQuestionsView.as_view(), name="student-practice-questions"),
    path("practice-questions/<int:pk>/check/", StudentCheckPracticeQuestionView.as_view(), name="student-practice-question-check"),
]

