from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.teacher_dashboard, name='teacher-dashboard'),
    path('student/<str:student_id>/', views.student_detail, name='student-detail'),
    path('analytics/', views.class_analytics, name='class-analytics'),
]