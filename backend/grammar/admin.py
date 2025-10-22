from django.contrib import admin
from .models import GrammarRule, GrammarProgress


@admin.register(GrammarRule)
class GrammarRuleAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'short_name', 'difficulty_level', 'category',
        'is_active', 'is_essential'
    ]
    list_filter = [
        'difficulty_level', 'category', 'is_active', 'is_essential'
    ]
    search_fields = ['name', 'description']
    ordering = ['difficulty_level', 'category', 'name']


@admin.register(GrammarProgress)
class GrammarProgressAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'grammar_rule', 'mastery_level', 'is_learned',
        'practice_count', 'correct_count', 'last_practiced_at'
    ]
    list_filter = [
        'is_learned', 'mastery_level', 'grammar_rule__difficulty_level'
    ]
    search_fields = ['user__username', 'grammar_rule__name']
    ordering = ['-last_practiced_at']

