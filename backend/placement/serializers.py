from rest_framework import serializers
from .models import PlacementTest, PlacementTestAttempt


class PlacementTestSerializer(serializers.ModelSerializer):
    """Serializer for PlacementTest model"""
    
    class Meta:
        model = PlacementTest
        fields = [
            'id', 'name', 'description', 'test_type', 'difficulty_level',
            'target_track', 'questions_count', 'pass_threshold',
            'excellent_threshold', 'time_limit_minutes', 'xp_reward',
            'skip_to_group', 'skip_to_level', 'skip_entire_track',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PlacementTestAttemptSerializer(serializers.ModelSerializer):
    """Serializer for PlacementTestAttempt model"""
    test = PlacementTestSerializer(read_only=True)
    test_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = PlacementTestAttempt
        fields = [
            'id', 'test', 'test_id', 'status', 'started_at', 'completed_at',
            'time_taken_seconds', 'score', 'percentage', 'passed',
            'excellent_score', 'xp_earned', 'skip_action_taken',
            'skip_destination', 'user_answers', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PlacementTestSubmissionSerializer(serializers.Serializer):
    """Serializer for placement test submission"""
    answers = serializers.DictField()
    time_taken_seconds = serializers.IntegerField()


class PlacementTestStatsSerializer(serializers.Serializer):
    """Serializer for placement test statistics"""
    total_attempts = serializers.IntegerField()
    passed_attempts = serializers.IntegerField()
    excellent_attempts = serializers.IntegerField()
    pass_rate = serializers.FloatField()
    average_score = serializers.FloatField()
    average_percentage = serializers.FloatField()
    total_xp_earned = serializers.IntegerField()
    recent_attempts = PlacementTestAttemptSerializer(many=True)

