from rest_framework import serializers
from .models import Vocabulary, VocabularyProgress


class VocabularySerializer(serializers.ModelSerializer):
    """Serializer for Vocabulary model"""
    
    class Meta:
        model = Vocabulary
        fields = [
            'id', 'word', 'translation_urdu', 'pronunciation', 'oxford_rank',
            'is_oxford_3000', 'difficulty_level', 'part_of_speech', 'definition',
            'definition_urdu', 'example_sentence', 'example_sentence_urdu',
            'audio_url', 'image_url', 'synonyms', 'antonyms', 'common_phrases',
            'collocations', 'difficulty_score', 'learning_frequency', 'is_active',
            'is_essential', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class VocabularyProgressSerializer(serializers.ModelSerializer):
    """Serializer for VocabularyProgress model"""
    vocabulary = VocabularySerializer(read_only=True)
    vocabulary_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = VocabularyProgress
        fields = [
            'id', 'vocabulary', 'vocabulary_id', 'is_learned', 'mastery_level',
            'next_review_date', 'review_interval_days', 'review_count',
            'correct_count', 'incorrect_count', 'first_learned_at',
            'last_reviewed_at', 'average_response_time', 'personal_difficulty',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class VocabularyReviewSerializer(serializers.Serializer):
    """Serializer for vocabulary review data"""
    vocabulary_id = serializers.IntegerField()
    is_correct = serializers.BooleanField()
    response_time = serializers.FloatField(default=0)
    user_answer = serializers.CharField(required=False)


class VocabularyStatsSerializer(serializers.Serializer):
    """Serializer for vocabulary statistics"""
    total_words = serializers.IntegerField()
    learned_words = serializers.IntegerField()
    words_in_progress = serializers.IntegerField()
    words_to_review = serializers.IntegerField()
    mastery_distribution = serializers.DictField()
    average_response_time = serializers.FloatField()
    accuracy = serializers.FloatField()
    learning_progress = serializers.FloatField()

