from django.urls import path
from .views import (
    AdminSOCDashboardView,
    AdminSOCEventsView,
    AdminSOCEventDetailView,
    AdminSOCEscalateEventView,
    AdminSOCLoginLogsView,
    AdminSOCApiActivityView,
    AdminSOCAuditTrailView,
    AdminSOCTriggerSimulationView,
)

urlpatterns = [
    path("soc/dashboard/", AdminSOCDashboardView.as_view(), name="admin-soc-dashboard"),
    path("soc/events/", AdminSOCEventsView.as_view(), name="admin-soc-events"),
    path("soc/events/<int:event_id>/", AdminSOCEventDetailView.as_view(), name="admin-soc-event-detail"),
    path("soc/events/<int:event_id>/escalate/", AdminSOCEscalateEventView.as_view(), name="admin-soc-event-escalate"),
    path("soc/logins/", AdminSOCLoginLogsView.as_view(), name="admin-soc-logins"),
    path("soc/api-activity/", AdminSOCApiActivityView.as_view(), name="admin-soc-api-activity"),
    path("soc/audit-trail/", AdminSOCAuditTrailView.as_view(), name="admin-soc-audit-trail"),
    path("soc/trigger-simulation/", AdminSOCTriggerSimulationView.as_view(), name="admin-soc-trigger-simulation"),
]
