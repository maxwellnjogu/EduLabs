from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    # Shared Authentication API
    path("api/auth/", include("users.urls")),
    # Three Dedicated Portal API Groups
    path("api/student/", include("config.urls_student")),
    path("api/lecturer/", include("config.urls_lecturer")),
    path("api/admin/", include("soc.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
