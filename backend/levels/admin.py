from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Level, Question, LevelCompletion


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    fields = ('question_order', 'question_type', 'question_text_preview', 'difficulty', 'xp_value', 'is_active')
    readonly_fields = ('question_text_preview',)
    ordering = ('question_order',)
    
    def question_text_preview(self, obj):
        if obj.question_text:
            return obj.question_text[:50] + "..." if len(obj.question_text) > 50 else obj.question_text
        return "-"
    question_text_preview.short_description = "Question Preview"


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = (
        'level_number', 'name', 'difficulty', 'is_test_level', 
        'is_unlocked', 'is_active', 'questions_count', 'xp_reward', 'created_at'
    )
    list_filter = ('difficulty', 'is_test_level', 'is_unlocked', 'is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('level_number',)
    inlines = [QuestionInline]
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('level_number', 'name', 'description', 'difficulty')
        }),
        ('Configuration', {
            'fields': ('is_test_level', 'test_questions_count', 'test_pass_percentage', 'test_time_limit_minutes')
        }),
        ('Rewards & Status', {
            'fields': ('xp_reward', 'is_unlocked', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def questions_count(self, obj):
        return obj.get_questions_count()
    questions_count.short_description = "Questions Count"


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = (
        'question_order', 'question_type', 'question_text_preview', 
        'level', 'difficulty', 'xp_value', 'is_active', 'created_at'
    )
    list_filter = ('question_type', 'difficulty', 'is_active', 'level', 'created_at')
    search_fields = ('question_text',)
    ordering = ('level', 'question_order')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Question Content', {
            'fields': ('level', 'question_order', 'question_type', 'question_text', 'hint', 'explanation')
        }),
        ('Answer Configuration', {
            'fields': ('options', 'correct_answer', 'audio_url', 'image_url')
        }),
        ('Settings', {
            'fields': ('difficulty', 'xp_value', 'time_limit_seconds', 'is_active')
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


@admin.register(LevelCompletion)
class LevelCompletionAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'level', 'score', 'percentage', 'passed', 
        'is_test_level', 'time_taken_seconds', 'completed_at'
    )
    list_filter = ('passed', 'is_test_level', 'completed_at', 'level')
    search_fields = ('user__username', 'level__name')
    ordering = ('-completed_at',)
    readonly_fields = ('completed_at', 'xp_earned')
    
    fieldsets = (
        ('Completion Data', {
            'fields': ('user', 'level', 'score', 'total_questions', 'correct_answers', 'percentage', 'passed')
        }),
        ('Test Information', {
            'fields': ('is_test_level', 'time_taken_seconds', 'started_at', 'completed_at')
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
        return super().get_queryset(request).select_related('user', 'level')