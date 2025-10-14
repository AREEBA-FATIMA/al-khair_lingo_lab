from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.UserProfileViewSet)
router.register(r'stats', views.UserStatsViewSet)

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.UserLoginView.as_view(), name='user-login'),
    path('logout/', views.UserLogoutView.as_view(), name='user-logout'),
    path('change-password/', views.PasswordChangeView.as_view(), name='password-change'),
    
    # User Management
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', views.UserUpdateView.as_view(), name='user-update'),
    path('profile/stats/', views.UserStatsView.as_view(), name='user-stats'),
    
    # Student Management (for teachers/admins)
    path('students/', views.StudentListView.as_view(), name='student-list'),
    path('students/<int:pk>/', views.StudentDetailView.as_view(), name='student-detail'),
    path('students/<int:pk>/progress/', views.StudentProgressView.as_view(), name='student-progress'),
    
    # Parent Management
    path('children/', views.ChildrenListView.as_view(), name='children-list'),
    path('children/<int:pk>/progress/', views.ChildProgressView.as_view(), name='child-progress'),
    
    # Router URLs
    path('', include(router.urls)),
]
