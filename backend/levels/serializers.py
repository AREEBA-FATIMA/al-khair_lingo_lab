from rest_framework import serializers
from .models import Level, Question, LevelCompletion


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for questions"""
    question_type_display = serializers.CharField(source='get_question_type_display_name', read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'question_type_display',
            'options', 'correct_answer', 'audio_url', 'image_url',
            'hint', 'explanation', 'difficulty', 'xp_value',
            'question_order', 'time_limit_seconds', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LevelSerializer(serializers.ModelSerializer):
    """Serializer for levels"""
    questions = QuestionSerializer(many=True, read_only=True)
    questions_count = serializers.IntegerField(source='get_questions_count', read_only=True)
    next_level = serializers.SerializerMethodField()
    previous_level = serializers.SerializerMethodField()
    
    class Meta:
        model = Level
        fields = [
            'id', 'name', 'description', 'level_number', 'difficulty',
            'xp_reward', 'is_active', 'is_unlocked', 'is_test_level',
            'test_questions_count', 'test_pass_percentage', 'test_time_limit_minutes',
            'questions_count', 'questions', 'next_level', 'previous_level',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_next_level(self, obj):
        """Get next level info"""
        next_level = obj.get_next_level()
        if next_level:
            return {
                'id': next_level.id,
                'level_number': next_level.level_number,
                'name': next_level.name,
                'is_unlocked': next_level.is_unlocked
            }
        return None
    
    def get_previous_level(self, obj):
        """Get previous level info"""
        prev_level = obj.get_previous_level()
        if prev_level:
            return {
                'id': prev_level.id,
                'level_number': prev_level.level_number,
                'name': prev_level.name,
                'is_unlocked': prev_level.is_unlocked
            }
        return None


class LevelCompletionSerializer(serializers.ModelSerializer):
    """Serializer for level completions"""
    level_name = serializers.CharField(source='level.name', read_only=True)
    level_number = serializers.IntegerField(source='level.level_number', read_only=True)
    
    class Meta:
        model = LevelCompletion
        fields = [
            'id', 'level', 'level_name', 'level_number', 'score',
            'total_questions', 'correct_answers', 'percentage', 'passed',
            'is_test_level', 'time_taken_seconds', 'started_at', 'completed_at',
            'xp_earned', 'user_answers'
        ]
        read_only_fields = ['id', 'completed_at', 'xp_earned']


class LevelCompletionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating level completions"""
    
    class Meta:
        model = LevelCompletion
        fields = [
            'level', 'score', 'total_questions', 'correct_answers',
            'time_taken_seconds', 'started_at', 'user_answers'
        ]
    
    def create(self, validated_data):
        """Create level completion with automatic calculations"""
        user = self.context['request'].user
        level = validated_data['level']
        
        # Calculate percentage
        percentage = 0
        if validated_data['total_questions'] > 0:
            percentage = (validated_data['correct_answers'] / validated_data['total_questions']) * 100
        
        # Check if passed
        if level.is_test_level:
            passed = percentage >= level.test_pass_percentage
        else:
            passed = percentage >= 60  # 60% for regular levels
        
        # Calculate XP earned
        xp_earned = 0
        if passed:
            xp_earned = level.xp_reward
        
        # Create completion
        completion = LevelCompletion.objects.create(
            user=user,
            level=level,
            score=validated_data['score'],
            total_questions=validated_data['total_questions'],
            correct_answers=validated_data['correct_answers'],
            percentage=percentage,
            passed=passed,
            is_test_level=level.is_test_level,
            time_taken_seconds=validated_data['time_taken_seconds'],
            started_at=validated_data['started_at'],
            xp_earned=xp_earned,
            user_answers=validated_data['user_answers']
        )
        
        return completion


class LevelStatsSerializer(serializers.Serializer):
    """Serializer for level statistics"""
    total_levels = serializers.IntegerField()
    completed_levels = serializers.IntegerField()
    test_levels_completed = serializers.IntegerField()
    total_xp_earned = serializers.IntegerField()
    average_score = serializers.FloatField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
