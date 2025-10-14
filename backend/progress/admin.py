from django.contrib import admin
from .models import GroupProgress, LevelProgress, QuestionProgress, DailyProgress

@admin.register(GroupProgress)
class GroupProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'is_completed', 'completion_percentage', 'levels_completed', 'total_xp_earned')
    list_filter = ('is_completed', 'group', 'started_at')
    search_fields = ('user__username', 'group__name')
    ordering = ('-started_at',)

@admin.register(LevelProgress)
class LevelProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'level', 'is_completed', 'completion_percentage', 'questions_answered', 'correct_answers', 'xp_earned')
    list_filter = ('is_completed', 'level__group', 'started_at')
    search_fields = ('user__username', 'level__name')
    ordering = ('-started_at',)

@admin.register(QuestionProgress)
class QuestionProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'question', 'is_answered', 'is_correct', 'attempts', 'xp_earned')
    list_filter = ('is_answered', 'is_correct', 'question__level__group')
    search_fields = ('user__username', 'question__question_text')
    ordering = ('-answered_at',)

@admin.register(DailyProgress)
class DailyProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'levels_completed', 'questions_answered', 'xp_earned', 'streak_maintained')
    list_filter = ('date', 'streak_maintained')
    search_fields = ('user__username',)
    ordering = ('-date',)