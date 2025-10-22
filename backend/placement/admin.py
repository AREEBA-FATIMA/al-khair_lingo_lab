from django.contrib import admin
from .models import PlacementTest, PlacementTestAttempt


@admin.register(PlacementTest)
class PlacementTestAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'test_type', 'difficulty_level', 'questions_count',
        'pass_threshold', 'is_active', 'is_required'
    ]
    list_filter = [
        'test_type', 'difficulty_level', 'is_active', 'is_required'
    ]
    search_fields = ['name', 'description']
    ordering = ['test_type', 'difficulty_level']


@admin.register(PlacementTestAttempt)
class PlacementTestAttemptAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'test', 'status', 'percentage', 'passed',
        'started_at', 'completed_at'
    ]
    list_filter = [
        'status', 'passed', 'excellent_score', 'test__test_type'
    ]
    search_fields = ['user__username', 'test__name']
    ordering = ['-started_at']

