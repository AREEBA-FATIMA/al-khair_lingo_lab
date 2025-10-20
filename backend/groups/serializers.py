from rest_framework import serializers
from .models import Group, GroupProgress, GroupUnlockTest, GroupUnlockTestAttempt


class GroupSerializer(serializers.ModelSerializer):
    """Serializer for Group model"""
    completion_percentage = serializers.SerializerMethodField()
    levels_completed = serializers.SerializerMethodField()
    total_levels = serializers.SerializerMethodField()
    xp_earned = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = [
            'id', 'group_number', 'name', 'description', 'difficulty',
            'is_unlocked', 'unlock_condition', 'required_level',
            'test_questions', 'pass_percentage', 'xp_reward',
            'badge_name', 'badge_description', 'is_active',
            'completion_percentage', 'levels_completed', 'total_levels',
            'xp_earned'
        ]
    
    def get_completion_percentage(self, obj):
        """Get completion percentage from context or default to 0"""
        return getattr(obj, 'completion_percentage', 0)
    
    def get_levels_completed(self, obj):
        """Get levels completed from context or default to 0"""
        return getattr(obj, 'levels_completed', 0)
    
    def get_total_levels(self, obj):
        """Get total levels from context or count from related levels"""
        return getattr(obj, 'total_levels', obj.levels.count())
    
    def get_xp_earned(self, obj):
        """Get XP earned from context or default to 0"""
        return getattr(obj, 'xp_earned', 0)
    
    def get_is_unlocked(self, obj):
        """Get unlock status from context or default to False"""
        return getattr(obj, 'is_unlocked', False)


class GroupProgressSerializer(serializers.ModelSerializer):
    """Serializer for GroupProgress model"""
    
    class Meta:
        model = GroupProgress
        fields = [
            'id', 'is_unlocked', 'is_completed', 'completion_percentage',
            'levels_completed', 'total_xp_earned', 'time_spent_minutes',
            'unlock_test_passed', 'unlock_test_attempts', 'best_unlock_test_score',
            'unlocked_at', 'completed_at', 'last_accessed_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GroupUnlockTestSerializer(serializers.ModelSerializer):
    """Serializer for GroupUnlockTest model"""
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = GroupUnlockTest
        fields = [
            'id', 'group', 'group_name', 'name', 'description',
            'questions_count', 'pass_percentage', 'time_limit_minutes',
            'xp_reward', 'is_active'
        ]


class GroupUnlockTestAttemptSerializer(serializers.ModelSerializer):
    """Serializer for GroupUnlockTestAttempt model"""
    test_name = serializers.CharField(source='test.name', read_only=True)
    group_name = serializers.CharField(source='test.group.name', read_only=True)
    
    class Meta:
        model = GroupUnlockTestAttempt
        fields = [
            'id', 'test', 'test_name', 'group_name', 'score', 'total_questions',
            'correct_answers', 'percentage', 'passed', 'time_taken_seconds',
            'started_at', 'completed_at', 'xp_earned', 'user_answers'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GroupStatsSerializer(serializers.Serializer):
    """Serializer for group statistics"""
    group = GroupSerializer()
    progress = GroupProgressSerializer()
    total_levels = serializers.IntegerField()
    completed_levels = serializers.IntegerField()
    completion_percentage = serializers.FloatField()
    is_unlocked = serializers.BooleanField()
    is_completed = serializers.BooleanField()
    total_xp_earned = serializers.IntegerField()
    time_spent_minutes = serializers.IntegerField()