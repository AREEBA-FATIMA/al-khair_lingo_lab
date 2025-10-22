from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, StudentLoginView, TeacherAdminLoginView, SimpleLoginView,
    UserRegistrationView, UserProfileView, PasswordChangeView,
    LogoutView, LoginLogViewSet
)
from .password_reset_views import (
    request_password_reset, reset_password, change_password, admin_reset_password
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'login-logs', LoginLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/login/', SimpleLoginView.as_view(), name='simple-login'),
    path('auth/student-login/', StudentLoginView.as_view(), name='student-login'),
    path('auth/teacher-admin-login/', TeacherAdminLoginView.as_view(), name='teacher-admin-login'),
    path('auth/register/', UserRegistrationView.as_view(), name='user-register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # Profile management
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', PasswordChangeView.as_view(), name='change-password'),
    
    # Password reset endpoints
    path('password-reset/request/', request_password_reset, name='request-password-reset'),
    path('password-reset/reset/', reset_password, name='reset-password'),
    path('password-reset/change/', change_password, name='change-password-api'),
    path('password-reset/admin-reset/', admin_reset_password, name='admin-reset-password'),
]