from django.urls import path
from . import views

urlpatterns = [
    # Overall Analytics
    path('overall/', views.overall_analytics, name='overall-analytics'),
    path('dashboard-summary/', views.dashboard_summary, name='dashboard-summary'),
    
    # New API endpoints for donor dashboard
    path('overall-stats/', views.overall_stats, name='overall-stats'),
    path('campus-data/', views.campus_data, name='campus-data'),
    path('teacher-performance/', views.teacher_performance, name='teacher-performance'),
    path('student-performance/', views.student_performance, name='student-performance'),
    path('daily-activity/', views.daily_activity, name='daily-activity'),
    
    # Specific Analytics
    path('campus/', views.campus_analytics, name='campus-analytics'),
    path('teachers/', views.teacher_analytics, name='teacher-analytics'),
    path('classes/', views.class_analytics, name='class-analytics'),
    path('students/', views.student_analytics, name='student-analytics'),
    
    # Trends
    path('trends/', views.performance_trend, name='performance-trends'),
    
    # List APIs
    path('campus-list/', views.campus_list, name='campus-list'),
    path('teachers-list/', views.teachers_list, name='teachers-list'),
    path('classes-list/', views.classes_list, name='classes-list'),
]
