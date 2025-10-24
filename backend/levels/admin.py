from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.forms import ModelForm, Textarea, TextInput
from django import forms
from .models import Level, Question, LevelCompletion


class QuestionForm(ModelForm):
    """Enhanced form for question creation with better validation"""
    
    class Meta:
        model = Question
        fields = '__all__'
        widgets = {
            'question_text': Textarea(attrs={'rows': 4, 'cols': 80}),
            'hint': Textarea(attrs={'rows': 2, 'cols': 80}),
            'explanation': Textarea(attrs={'rows': 3, 'cols': 80}),
            'options': Textarea(attrs={'rows': 6, 'cols': 80, 'placeholder': 'Enter options separated by new lines\nOption A\nOption B\nOption C\nOption D'}),
            'correct_answer': TextInput(attrs={'size': 50}),
        }
    
    def clean_options(self):
        """Validate options format"""
        options = self.cleaned_data.get('options')
        if options:
            # Split by newlines and clean
            option_list = [opt.strip() for opt in options.split('\n') if opt.strip()]
            if len(option_list) < 2:
                raise forms.ValidationError("At least 2 options are required")
            return options
        return options
    
    def clean(self):
        """Cross-field validation"""
        cleaned_data = super().clean()
        question_type = cleaned_data.get('question_type')
        options = cleaned_data.get('options')
        correct_answer = cleaned_data.get('correct_answer')
        
        # Validate MCQ questions
        if question_type == 'mcq' and options and correct_answer:
            option_list = [opt.strip() for opt in options.split('\n') if opt.strip()]
            if correct_answer not in option_list:
                raise forms.ValidationError("Correct answer must be one of the provided options")
        
        return cleaned_data


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
    form = QuestionForm
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
            'fields': ('level', 'question_order', 'question_type', 'question_text', 'hint', 'explanation'),
            'description': 'Enter the question text and provide helpful hints and explanations for students.'
        }),
        ('Answer Configuration', {
            'fields': ('options', 'correct_answer', 'audio_url', 'image_url'),
            'description': 'For MCQ: Enter options separated by new lines. For other types: Enter the correct answer.'
        }),
        ('Settings', {
            'fields': ('difficulty', 'xp_value', 'time_limit_seconds', 'is_active'),
            'description': 'Configure difficulty level, XP reward, and time limit for this question.'
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
    
    def get_form(self, request, obj=None, **kwargs):
        """Add help text and improve form layout"""
        form = super().get_form(request, obj, **kwargs)
        
        # Add help text to fields
        form.base_fields['question_text'].help_text = "Enter the question text that students will see."
        form.base_fields['options'].help_text = "For MCQ questions: Enter each option on a new line. For other question types, leave empty."
        form.base_fields['correct_answer'].help_text = "Enter the correct answer. For MCQ, this should match one of the options exactly."
        form.base_fields['hint'].help_text = "Optional hint to help students if they get the question wrong."
        form.base_fields['explanation'].help_text = "Explanation shown to students after they answer (correct or incorrect)."
        form.base_fields['xp_value'].help_text = "XP points awarded for correct answer (typically 10-50 points)."
        form.base_fields['time_limit_seconds'].help_text = "Time limit in seconds (0 = no limit)."
        
        return form


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