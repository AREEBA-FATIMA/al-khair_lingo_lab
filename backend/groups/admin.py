from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Group, GroupProgress, GroupUnlockTest, GroupUnlockTestAttempt


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = (
        'group_number', 'name', 'difficulty', 'is_unlocked', 
        'unlock_condition', 'xp_reward', 'is_active', 'created_at'
    )
    list_filter = ('difficulty', 'is_unlocked', 'unlock_condition', 'is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('group_number',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('group_number', 'name', 'description', 'difficulty')
        }),
        ('Unlock Configuration', {
            'fields': ('is_unlocked', 'unlock_condition', 'required_level')
        }),
        ('Test Configuration', {
            'fields': ('test_questions', 'pass_percentage'),
            'classes': ('collapse',)
        }),
        ('Rewards', {
            'fields': ('xp_reward', 'badge_name', 'badge_description')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(GroupProgress)
class GroupProgressAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'group', 'is_unlocked', 'is_completed', 
        'completion_percentage', 'levels_completed', 'total_xp_earned', 'created_at'
    )
    list_filter = ('is_unlocked', 'is_completed', 'group', 'created_at')
    search_fields = ('user__username', 'group__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'unlocked_at', 'completed_at')
    
    fieldsets = (
        ('Progress Data', {
            'fields': ('user', 'group', 'is_unlocked', 'is_completed', 'completion_percentage')
        }),
        ('Statistics', {
            'fields': ('levels_completed', 'total_xp_earned', 'time_spent_minutes')
        }),
        ('Test Results', {
            'fields': ('unlock_test_passed', 'unlock_test_attempts', 'best_unlock_test_score')
        }),
        ('Timestamps', {
            'fields': ('unlocked_at', 'completed_at', 'last_accessed_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'group')


@admin.register(GroupUnlockTest)
class GroupUnlockTestAdmin(admin.ModelAdmin):
    list_display = (
        'group', 'name', 'questions_count', 'pass_percentage', 
        'time_limit_minutes', 'xp_reward', 'is_active', 'created_at'
    )
    list_filter = ('is_active', 'group', 'created_at')
    search_fields = ('name', 'description', 'group__name')
    ordering = ('group__group_number',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Test Information', {
            'fields': ('group', 'name', 'description')
        }),
        ('Test Configuration', {
            'fields': ('questions_count', 'pass_percentage', 'time_limit_minutes')
        }),
        ('Rewards', {
            'fields': ('xp_reward',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(GroupUnlockTestAttempt)
class GroupUnlockTestAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'test', 'score', 'percentage', 'passed', 
        'time_taken_seconds', 'started_at', 'completed_at'
    )
    list_filter = ('passed', 'test', 'started_at', 'completed_at')
    search_fields = ('user__username', 'test__name')
    ordering = ('-started_at',)
    readonly_fields = ('started_at', 'completed_at', 'xp_earned')
    
    fieldsets = (
        ('Attempt Data', {
            'fields': ('user', 'test', 'score', 'total_questions', 'correct_answers', 'percentage', 'passed')
        }),
        ('Time Tracking', {
            'fields': ('time_taken_seconds', 'started_at', 'completed_at')
        }),
        ('Rewards', {
            'fields': ('xp_earned',)
        }),
        ('User Answers', {
            'fields': ('user_answers',),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'test__group')