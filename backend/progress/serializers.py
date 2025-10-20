from rest_framework import serializers
from .models import LevelProgress


class LevelProgressSerializer(serializers.ModelSerializer):
    """Serializer for LevelProgress model"""
    level_name = serializers.CharField(source='level.name', read_only=True)
    level_number = serializers.IntegerField(source='level.level_number', read_only=True)
    group_name = serializers.CharField(source='level.group.name', read_only=True)
    accuracy_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = LevelProgress
        fields = [
            'id', 'level', 'level_name', 'level_number', 'group_name',
            'is_completed', 'completion_percentage', 'questions_answered',
            'correct_answers', 'wrong_answers', 'xp_earned', 'time_spent',
            'attempts', 'started_at', 'completed_at', 'last_attempted',
            'daily_level_completed', 'accuracy_percentage'
        ]
        read_only_fields = ['id', 'started_at', 'last_attempted']
    
    def get_accuracy_percentage(self, obj):
        """Calculate accuracy percentage"""
        return obj.get_accuracy_percentage()


class ProgressOverviewSerializer(serializers.Serializer):
    """Serializer for progress overview"""
    total_xp = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    hearts = serializers.IntegerField()
    daily_goal = serializers.IntegerField()
    total_levels_completed = serializers.IntegerField()
    total_groups_completed = serializers.IntegerField()
    average_score = serializers.FloatField()
    time_spent_minutes = serializers.IntegerField()
    current_level = serializers.IntegerField()
    plant_stage = serializers.CharField()
    completion_percentage = serializers.FloatField()


class RecentActivitySerializer(serializers.Serializer):
    """Serializer for recent activity"""
    id = serializers.IntegerField()
    type = serializers.CharField()
    level_name = serializers.CharField()
    xp_earned = serializers.IntegerField()
    completed_at = serializers.DateTimeField()
    score = serializers.FloatField()


class AchievementSerializer(serializers.Serializer):
    """Serializer for achievements"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField()
    icon = serializers.CharField()
    unlocked = serializers.BooleanField()
    unlocked_at = serializers.DateTimeField(allow_null=True)