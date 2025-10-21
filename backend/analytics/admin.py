from django.contrib import admin
from .models import (
    OverallAnalytics, CampusAnalytics, TeacherAnalytics, 
    StudentAnalytics, ClassAnalytics, PerformanceTrend
)

@admin.register(OverallAnalytics)
class OverallAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_users', 'total_teachers', 'total_students', 'average_completion_rate']
    list_filter = ['date']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(CampusAnalytics)
class CampusAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['campus', 'date', 'total_students', 'average_class_completion', 'active_students_today']
    list_filter = ['campus', 'date']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(TeacherAnalytics)
class TeacherAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'date', 'total_students', 'average_completion_rate', 'active_students_today']
    list_filter = ['teacher', 'date']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(StudentAnalytics)
class StudentAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['student', 'date', 'levels_completed', 'total_xp_earned', 'current_streak']
    list_filter = ['student', 'date']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(ClassAnalytics)
class ClassAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['grade', 'date', 'total_students', 'average_completion_rate', 'active_students_today']
    list_filter = ['grade', 'date']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(PerformanceTrend)
class PerformanceTrendAdmin(admin.ModelAdmin):
    list_display = ['trend_type', 'date', 'total_users', 'active_users', 'levels_completed']
    list_filter = ['trend_type', 'date']
    readonly_fields = ['created_at']
