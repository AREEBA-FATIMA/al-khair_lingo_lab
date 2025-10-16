from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import TestExercise, TestQuestion, TestAttempt


class TestQuestionInline(admin.TabularInline):
    model = TestQuestion
    extra = 0
    fields = ('question_order', 'question_type', 'question_text_preview', 'difficulty', 'points', 'is_active')
    readonly_fields = ('question_text_preview',)
    ordering = ('question_order',)
    
    def question_text_preview(self, obj):
        if obj.question_text:
            return obj.question_text[:50] + "..." if len(obj.question_text) > 50 else obj.question_text
        return "-"
    question_text_preview.short_description = "Question Preview"


@admin.register(TestExercise)
class TestExerciseAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'test_type', 'difficulty', 'target_level_range_display',
        'questions_count', 'pass_percentage', 'time_limit_minutes', 'is_active', 'created_at'
    )
    list_filter = ('test_type', 'difficulty', 'is_active', 'is_required', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('target_level_range_start', 'difficulty')
    inlines = [TestQuestionInline]
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'test_type', 'difficulty')
        }),
        ('Level Configuration', {
            'fields': ('target_level_range_start', 'target_level_range_end')
        }),
        ('Test Configuration', {
            'fields': ('questions_count', 'pass_percentage', 'time_limit_minutes')
        }),
        ('Rewards', {
            'fields': ('xp_reward', 'badge_name', 'badge_description')
        }),
        ('Status', {
            'fields': ('is_active', 'is_required')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def target_level_range_display(self, obj):
        return f"Levels {obj.target_level_range_start}-{obj.target_level_range_end}"
    target_level_range_display.short_description = "Target Level Range"
    
    def questions_count(self, obj):
        return obj.get_questions().count()
    questions_count.short_description = "Questions Count"


@admin.register(TestQuestion)
class TestQuestionAdmin(admin.ModelAdmin):
    list_display = (
        'question_order', 'question_type', 'question_text_preview', 
        'test', 'difficulty', 'points', 'is_active', 'created_at'
    )
    list_filter = ('question_type', 'difficulty', 'is_active', 'test', 'created_at')
    search_fields = ('question_text',)
    ordering = ('test', 'question_order')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Question Content', {
            'fields': ('test', 'question_order', 'question_type', 'question_text', 'hint', 'explanation')
        }),
        ('Answer Configuration', {
            'fields': ('options', 'correct_answer', 'audio_url', 'image_url')
        }),
        ('Settings', {
            'fields': ('difficulty', 'points', 'time_limit_seconds', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def question_text_preview(self, obj):
        if obj.question_text:
            return obj.question_text[:50] + "..." if len(obj.question_text) > 50 else obj.question_text
        return "-"
    question_text_preview.short_description = "Question Preview"


@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'test', 'status', 'score', 'percentage', 'passed', 
        'time_taken_seconds', 'started_at', 'completed_at'
    )
    list_filter = ('status', 'passed', 'test', 'started_at', 'completed_at')
    search_fields = ('user__username', 'test__name')
    ordering = ('-started_at',)
    readonly_fields = ('started_at', 'completed_at', 'xp_earned', 'badge_earned')
    
    fieldsets = (
        ('Attempt Data', {
            'fields': ('user', 'test', 'status', 'score', 'total_questions', 'correct_answers', 'percentage', 'passed')
        }),
        ('Time Tracking', {
            'fields': ('time_taken_seconds', 'started_at', 'completed_at')
        }),
        ('Rewards', {
            'fields': ('xp_earned', 'badge_earned')
        }),
        ('Feedback', {
            'fields': ('feedback', 'recommendations'),
            'classes': ('collapse',)
        }),
        ('User Answers', {
            'fields': ('user_answers',),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'test')