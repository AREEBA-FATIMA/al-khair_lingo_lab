from django.contrib import admin
from .models import Vocabulary, VocabularyProgress


@admin.register(Vocabulary)
class VocabularyAdmin(admin.ModelAdmin):
    list_display = [
        'word', 'translation_urdu', 'difficulty_level', 'part_of_speech',
        'oxford_rank', 'is_oxford_3000', 'is_active'
    ]
    list_filter = [
        'difficulty_level', 'part_of_speech', 'is_oxford_3000',
        'is_active', 'is_essential'
    ]
    search_fields = ['word', 'translation_urdu', 'definition']
    ordering = ['oxford_rank', 'word']


@admin.register(VocabularyProgress)
class VocabularyProgressAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'vocabulary', 'mastery_level', 'is_learned',
        'next_review_date', 'review_count', 'correct_count'
    ]
    list_filter = [
        'is_learned', 'mastery_level', 'vocabulary__difficulty_level'
    ]
    search_fields = ['user__username', 'vocabulary__word']
    ordering = ['next_review_date']

