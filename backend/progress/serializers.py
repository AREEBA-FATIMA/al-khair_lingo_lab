from rest_framework import serializers
from .models import UserProgress, LessonCompletion, StudySession, LearningAnalytics


class UserProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    exercise_title = serializers.CharField(source='exercise.title', read_only=True)
    accuracy = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProgress
        fields = [
            'id', 'user', 'lesson', 'lesson_title', 'exercise', 'exercise_title',
            'is_completed', 'is_started', 'completion_percentage', 'score',
            'max_score', 'attempts', 'time_spent', 'correct_answers', 'wrong_answers',
            'skipped_questions', 'mistakes', 'learned_concepts', 'weak_areas',
            'started_at', 'completed_at', 'last_attempted', 'accuracy'
        ]
        read_only_fields = ['id', 'user']
    
    def get_accuracy(self, obj):
        return obj.get_accuracy()


class LessonCompletionSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_level = serializers.CharField(source='lesson.level', read_only=True)
    
    class Meta:
        model = LessonCompletion
        fields = [
            'id', 'user', 'lesson', 'lesson_title', 'lesson_level', 'is_completed',
            'completion_percentage', 'total_score', 'max_possible_score',
            'average_score', 'total_time_spent', 'sessions_count',
            'concepts_mastered', 'areas_for_improvement', 'started_at',
            'completed_at', 'last_accessed'
        ]
        read_only_fields = ['id', 'user']


class StudySessionSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_level = serializers.CharField(source='lesson.level', read_only=True)
    
    class Meta:
        model = StudySession
        fields = [
            'id', 'user', 'lesson', 'lesson_title', 'lesson_level', 'session_type',
            'duration_minutes', 'exercises_completed', 'total_exercises',
            'score_achieved', 'max_possible_score', 'focus_level',
            'difficulty_perceived', 'enjoyment_level', 'notes', 'teacher_feedback',
            'started_at', 'ended_at'
        ]
        read_only_fields = ['id', 'user', 'started_at']


class LearningAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningAnalytics
        fields = [
            'id', 'user', 'date', 'lessons_completed', 'exercises_completed',
            'time_spent_minutes', 'xp_earned', 'average_score', 'accuracy_percentage',
            'streak_maintained', 'preferred_time_of_day', 'most_productive_hour',
            'favorite_exercise_type', 'grammar_weakness', 'vocabulary_weakness',
            'pronunciation_weakness', 'listening_weakness'
        ]
        read_only_fields = ['id', 'user']


class ProgressSummarySerializer(serializers.Serializer):
    total_lessons_completed = serializers.IntegerField()
    total_exercises_completed = serializers.IntegerField()
    total_time_spent = serializers.IntegerField()
    total_xp_earned = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    average_score = serializers.FloatField()
    accuracy_percentage = serializers.FloatField()
    level_progress = serializers.FloatField()
    weak_areas = serializers.ListField(child=serializers.CharField())
    strong_areas = serializers.ListField(child=serializers.CharField())


class WeeklyProgressSerializer(serializers.Serializer):
    week_start = serializers.DateField()
    week_end = serializers.DateField()
    lessons_completed = serializers.IntegerField()
    exercises_completed = serializers.IntegerField()
    time_spent_minutes = serializers.IntegerField()
    xp_earned = serializers.IntegerField()
    average_score = serializers.FloatField()
    streak_maintained = serializers.BooleanField()
    daily_activity = serializers.ListField(
        child=serializers.DictField()
    )


class ProgressFilterSerializer(serializers.Serializer):
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    lesson_level = serializers.CharField(required=False)
    lesson_category = serializers.CharField(required=False)
    is_completed = serializers.BooleanField(required=False)
    session_type = serializers.CharField(required=False)
