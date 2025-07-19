from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from jobsearch_app.views import UserRegisterView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', UserRegisterView.as_view(), name='register'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    path('api/auth/', include('rest_framework.urls')),
    path('api/', include('jobsearch_app.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
