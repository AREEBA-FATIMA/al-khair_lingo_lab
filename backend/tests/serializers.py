from rest_framework import serializers
from .models import TestExercise, TestQuestion, TestAttempt


class TestQuestionSerializer(serializers.ModelSerializer):
    """Serializer for test questions"""
    question_type_display = serializers.CharField(source='get_question_type_display_name', read_only=True)
    
    class Meta:
        model = TestQuestion
        fields = [
            'id', 'question_text', 'question_type', 'question_type_display',
            'options', 'correct_answer', 'audio_url', 'image_url',
            'hint', 'explanation', 'difficulty', 'points',
            'question_order', 'time_limit_seconds', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TestExerciseSerializer(serializers.ModelSerializer):
    """Serializer for test exercises"""
    questions = TestQuestionSerializer(many=True, read_only=True)
    questions_count = serializers.IntegerField(source='get_questions.count', read_only=True)
    
    class Meta:
        model = TestExercise
        fields = [
            'id', 'name', 'description', 'test_type', 'target_level_range_start',
            'target_level_range_end', 'difficulty', 'questions_count',
            'pass_percentage', 'time_limit_minutes', 'xp_reward',
            'badge_name', 'badge_description', 'is_active', 'is_required',
            'questions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TestAttemptSerializer(serializers.ModelSerializer):
    """Serializer for test attempts"""
    test_name = serializers.CharField(source='test.name', read_only=True)
    test_type = serializers.CharField(source='test.test_type', read_only=True)
    
    class Meta:
        model = TestAttempt
        fields = [
            'id', 'test', 'test_name', 'test_type', 'status', 'score',
            'total_questions', 'correct_answers', 'percentage', 'passed',
            'time_taken_seconds', 'started_at', 'completed_at',
            'xp_earned', 'badge_earned', 'user_answers',
            'feedback', 'recommendations'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'xp_earned', 'badge_earned']


class TestAttemptCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating test attempts"""
    
    class Meta:
        model = TestAttempt
        fields = [
            'test', 'user_answers', 'time_taken_seconds'
        ]
    
    def create(self, validated_data):
        """Create test attempt with automatic calculations"""
        user = self.context['request'].user
        test = validated_data['test']
        user_answers = validated_data['user_answers']
        
        # Calculate score
        questions = test.get_questions()
        correct_answers = 0
        total_questions = questions.count()
        
        for question in questions:
            if str(question.id) in user_answers:
                user_answer = user_answers[str(question.id)]
                if question.validate_answer(user_answer):
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
        attempt = TestAttempt.objects.create(
            user=user,
            test=test,
            score=correct_answers,
            total_questions=total_questions,
            correct_answers=correct_answers,
            percentage=percentage,
            passed=passed,
            time_taken_seconds=validated_data['time_taken_seconds'],
            xp_earned=xp_earned,
            badge_earned=passed and bool(test.badge_name),
            user_answers=user_answers,
            status='completed'
        )
        
        return attempt


class TestStatsSerializer(serializers.Serializer):
    """Serializer for test statistics"""
    total_tests_attempted = serializers.IntegerField()
    tests_passed = serializers.IntegerField()
    tests_failed = serializers.IntegerField()
    average_score = serializers.FloatField()
    total_xp_earned = serializers.IntegerField()
    badges_earned = serializers.IntegerField()
    best_score = serializers.FloatField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
