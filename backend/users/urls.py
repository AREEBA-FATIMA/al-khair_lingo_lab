from django.urls import path
from . import views

urlpatterns = [
    # Authentication URLs
    path('auth/student-login/', views.StudentLoginView.as_view(), name='student-login'),
    path('auth/email-login/', views.EmailLoginView.as_view(), name='email-login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/check/', views.check_auth, name='check-auth'),
    
    # Registration URLs
    path('register/student/', views.StudentRegistrationView.as_view(), name='student-registration'),
    path('register/teacher/', views.TeacherRegistrationView.as_view(), name='teacher-registration'),
    path('register/donor/', views.DonorRegistrationView.as_view(), name='donor-registration'),
    
    # User Management URLs
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('change-password/', views.PasswordChangeView.as_view(), name='change-password'),
    path('stats/', views.UserStatsView.as_view(), name='user-stats'),
    
    # User Lists (Admin only)
    path('students/', views.StudentListView.as_view(), name='student-list'),
    path('teachers/', views.TeacherListView.as_view(), name='teacher-list'),
    path('donors/', views.DonorListView.as_view(), name='donor-list'),
    
    # List Management (Admin only)
    path('manage/students/', views.StudentListManagementView.as_view(), name='manage-student-list'),
    path('manage/teachers/', views.TeacherListManagementView.as_view(), name='manage-teacher-list'),
    path('manage/donors/', views.DonorListManagementView.as_view(), name='manage-donor-list'),
    
    # Utility URLs
    path('check/student-id/', views.check_student_id, name='check-student-id'),
    path('check/email/', views.check_email, name='check-email'),
    path('logs/', views.LoginLogsView.as_view(), name='login-logs'),
]