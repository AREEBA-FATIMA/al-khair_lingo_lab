from rest_framework import serializers
from .models import GrammarRule, GrammarProgress


class GrammarRuleSerializer(serializers.ModelSerializer):
    """Serializer for GrammarRule model"""
    
    class Meta:
        model = GrammarRule
        fields = [
            'id', 'name', 'short_name', 'description', 'difficulty_level',
            'category', 'rules', 'examples', 'negative_examples',
            'common_mistakes', 'mistake_explanations', 'when_to_use',
            'when_not_to_use', 'signal_words', 'practice_difficulty',
            'question_types', 'explanation_video_url', 'audio_examples',
            'learning_frequency', 'mastery_difficulty', 'is_active',
            'is_essential', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class GrammarProgressSerializer(serializers.ModelSerializer):
    """Serializer for GrammarProgress model"""
    grammar_rule = GrammarRuleSerializer(read_only=True)
    grammar_rule_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = GrammarProgress
        fields = [
            'id', 'grammar_rule', 'grammar_rule_id', 'is_learned',
            'mastery_level', 'practice_count', 'correct_count',
            'incorrect_count', 'first_learned_at', 'last_practiced_at',
            'average_response_time', 'personal_difficulty',
            'mistake_patterns', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class GrammarPracticeSerializer(serializers.Serializer):
    """Serializer for grammar practice data"""
    grammar_rule_id = serializers.IntegerField()
    is_correct = serializers.BooleanField()
    response_time = serializers.FloatField(default=0)
    user_answer = serializers.CharField(required=False)


class GrammarStatsSerializer(serializers.Serializer):
    """Serializer for grammar statistics"""
    total_rules = serializers.IntegerField()
    learned_rules = serializers.IntegerField()
    rules_in_progress = serializers.IntegerField()
    mastery_distribution = serializers.DictField()
    difficulty_distribution = serializers.DictField()
    average_response_time = serializers.FloatField()
    accuracy = serializers.FloatField()
    learning_progress = serializers.FloatField()

