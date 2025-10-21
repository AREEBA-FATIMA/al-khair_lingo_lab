from django.urls import path
from . import views

urlpatterns = [
    # Overall Analytics
    path('overall/', views.overall_analytics, name='overall-analytics'),
    path('dashboard-summary/', views.dashboard_summary, name='dashboard-summary'),
    
    # Specific Analytics
    path('campus/', views.campus_analytics, name='campus-analytics'),
    path('teachers/', views.teacher_analytics, name='teacher-analytics'),
    path('classes/', views.class_analytics, name='class-analytics'),
    path('students/', views.student_analytics, name='student-analytics'),
    
    # Trends
    path('trends/', views.performance_trends, name='performance-trends'),
]
