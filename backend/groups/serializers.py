from rest_framework import serializers
from .models import Group, GroupProgress, GroupUnlockTest, GroupUnlockTestAttempt


class GroupSerializer(serializers.ModelSerializer):
    """Serializer for groups"""
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    unlock_condition_display = serializers.CharField(source='get_unlock_condition_display', read_only=True)
    next_group = serializers.SerializerMethodField()
    previous_group = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = [
            'id', 'name', 'description', 'group_number', 'difficulty',
            'difficulty_display', 'is_unlocked', 'unlock_condition',
            'unlock_condition_display', 'required_level', 'test_questions',
            'pass_percentage', 'xp_reward', 'badge_name', 'badge_description',
            'is_active', 'next_group', 'previous_group',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_next_group(self, obj):
        """Get next group info"""
        next_group = obj.get_next_group()
        if next_group:
            return {
                'id': next_group.id,
                'group_number': next_group.group_number,
                'name': next_group.name,
                'is_unlocked': next_group.is_unlocked
            }
        return None
    
    def get_previous_group(self, obj):
        """Get previous group info"""
        prev_group = obj.get_previous_group()
        if prev_group:
            return {
                'id': prev_group.id,
                'group_number': prev_group.group_number,
                'name': prev_group.name,
                'is_unlocked': prev_group.is_unlocked
            }
        return None


class GroupProgressSerializer(serializers.ModelSerializer):
    """Serializer for group progress"""
    group_name = serializers.CharField(source='group.name', read_only=True)
    group_number = serializers.IntegerField(source='group.group_number', read_only=True)
    
    class Meta:
        model = GroupProgress
        fields = [
            'id', 'group', 'group_name', 'group_number', 'is_unlocked',
            'is_completed', 'completion_percentage', 'levels_completed',
            'total_xp_earned', 'time_spent_minutes', 'unlock_test_passed',
            'unlock_test_attempts', 'best_unlock_test_score', 'unlocked_at',
            'completed_at', 'last_accessed_at'
        ]
        read_only_fields = ['id', 'unlocked_at', 'completed_at']


class GroupUnlockTestSerializer(serializers.ModelSerializer):
    """Serializer for group unlock tests"""
    group_name = serializers.CharField(source='group.name', read_only=True)
    group_number = serializers.IntegerField(source='group.group_number', read_only=True)
    
    class Meta:
        model = GroupUnlockTest
        fields = [
            'id', 'group', 'group_name', 'group_number', 'name', 'description',
            'questions_count', 'pass_percentage', 'time_limit_minutes',
            'xp_reward', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GroupUnlockTestAttemptSerializer(serializers.ModelSerializer):
    """Serializer for group unlock test attempts"""
    test_name = serializers.CharField(source='test.name', read_only=True)
    group_name = serializers.CharField(source='test.group.name', read_only=True)
    group_number = serializers.IntegerField(source='test.group.group_number', read_only=True)
    
    class Meta:
        model = GroupUnlockTestAttempt
        fields = [
            'id', 'test', 'test_name', 'group_name', 'group_number',
            'score', 'total_questions', 'correct_answers', 'percentage',
            'passed', 'time_taken_seconds', 'started_at', 'completed_at',
            'xp_earned', 'user_answers'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'xp_earned']


class GroupUnlockTestAttemptCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating group unlock test attempts"""
    
    class Meta:
        model = GroupUnlockTestAttempt
        fields = [
            'test', 'user_answers', 'time_taken_seconds'
        ]
    
    def create(self, validated_data):
        """Create test attempt with automatic calculations"""
        user = self.context['request'].user
        test = validated_data['test']
        user_answers = validated_data['user_answers']
        
        # Calculate score (simplified - in real app, you'd validate against actual questions)
        correct_answers = 0
        total_questions = test.questions_count
        
        # This is a placeholder - in real implementation, you'd validate each answer
        for question_id, answer in user_answers.items():
            if answer:  # Simple validation
                correct_answers += 1
        
        # Calculate percentage
        percentage = 0
        if total_questions > 0:
            percentage = (correct_answers / total_questions) * 100
        
        # Check if passed
        passed = percentage >= test.pass_percentage
        
        # Calculate XP earned
        xp_earned = 0
        if passed:
            xp_earned = test.xp_reward
        
        # Create attempt
        attempt = GroupUnlockTestAttempt.objects.create(
            user=user,
            test=test,
            score=correct_answers,
            total_questions=total_questions,
            correct_answers=correct_answers,
            percentage=percentage,
            passed=passed,
            time_taken_seconds=validated_data['time_taken_seconds'],
            xp_earned=xp_earned,
            user_answers=user_answers
        )
        
        # Update group progress if passed
        if passed:
            group_progress, created = GroupProgress.objects.get_or_create(
                user=user,
                group=test.group
            )
            group_progress.record_unlock_test_attempt(percentage, passed)
        
        return attempt


class GroupStatsSerializer(serializers.Serializer):
    """Serializer for group statistics"""
    total_groups = serializers.IntegerField()
    unlocked_groups = serializers.IntegerField()
    completed_groups = serializers.IntegerField()
    total_xp_earned = serializers.IntegerField()
    badges_earned = serializers.IntegerField()
    average_completion_percentage = serializers.FloatField()
    current_group = serializers.IntegerField()
    next_group_requirements = serializers.DictField()