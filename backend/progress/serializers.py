from rest_framework import serializers
from .models import LevelProgress, QuestionProgress, DailyProgress
from levels.models import Level
from groups.models import Group


class LevelProgressSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    level_number = serializers.IntegerField(source='level.level_number', read_only=True)
    accuracy_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = LevelProgress
        fields = [
            'id', 'user', 'level', 'level_name', 'level_number', 'is_completed',
            'completion_percentage', 'questions_answered', 'correct_answers',
            'wrong_answers', 'xp_earned', 'time_spent', 'attempts',
            'started_at', 'completed_at', 'last_attempted', 'daily_level_completed',
            'accuracy_percentage'
        ]
        read_only_fields = ['id', 'user']
    
    def get_accuracy_percentage(self, obj):
        return obj.get_accuracy_percentage()


class QuestionProgressSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    
    class Meta:
        model = QuestionProgress
        fields = [
            'id', 'user', 'question', 'question_text', 'question_type',
            'is_correct', 'is_answered', 'time_spent', 'attempts',
            'answered_at', 'hint_used', 'explanation_viewed'
        ]
        read_only_fields = ['id', 'user']


class DailyProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyProgress
        fields = [
            'id', 'user', 'date', 'levels_completed', 'questions_answered',
            'correct_answers', 'wrong_answers', 'xp_earned', 'time_spent',
            'streak_count', 'daily_goal_met', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user']


class ProgressSummarySerializer(serializers.Serializer):
    total_levels = serializers.IntegerField()
    completed_levels = serializers.IntegerField()
    completion_percentage = serializers.FloatField()
    total_xp = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    accuracy_percentage = serializers.FloatField()
    current_streak = serializers.IntegerField()
