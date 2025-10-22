from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from users.models import User


class Vocabulary(models.Model):
    """
    Vocabulary words with Oxford 3000 integration
    Each word has comprehensive learning data
    """
    DIFFICULTY_LEVEL_CHOICES = [
        ('A1', 'A1 - Beginner'),
        ('A2', 'A2 - Elementary'),
        ('B1', 'B1 - Intermediate'),
        ('B2', 'B2 - Upper Intermediate'),
        ('C1', 'C1 - Advanced'),
        ('C2', 'C2 - Proficiency'),
    ]
    
    PART_OF_SPEECH_CHOICES = [
        ('noun', 'Noun'),
        ('verb', 'Verb'),
        ('adjective', 'Adjective'),
        ('adverb', 'Adverb'),
        ('pronoun', 'Pronoun'),
        ('preposition', 'Preposition'),
        ('conjunction', 'Conjunction'),
        ('interjection', 'Interjection'),
        ('determiner', 'Determiner'),
        ('auxiliary', 'Auxiliary Verb'),
    ]
    
    # Basic Information
    word = models.CharField(
        max_length=100,
        unique=True,
        help_text="English word"
    )
    translation_urdu = models.CharField(
        max_length=200,
        help_text="Urdu translation"
    )
    pronunciation = models.CharField(
        max_length=100,
        blank=True,
        help_text="Phonetic pronunciation (IPA or simple)"
    )
    
    # Oxford 3000 Integration
    oxford_rank = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(3000)],
        help_text="Oxford 3000 word frequency rank (1-3000)"
    )
    is_oxford_3000 = models.BooleanField(
        default=False,
        help_text="Is this word in Oxford 3000 list?"
    )
    
    # Learning Classification
    difficulty_level = models.CharField(
        max_length=2,
        choices=DIFFICULTY_LEVEL_CHOICES,
        default='A1',
        help_text="CEFR difficulty level"
    )
    part_of_speech = models.CharField(
        max_length=20,
        choices=PART_OF_SPEECH_CHOICES,
        help_text="Grammatical category"
    )
    
    # Learning Content
    definition = models.TextField(
        help_text="English definition"
    )
    definition_urdu = models.TextField(
        blank=True,
        help_text="Urdu definition"
    )
    example_sentence = models.TextField(
        help_text="Example sentence in English"
    )
    example_sentence_urdu = models.TextField(
        blank=True,
        help_text="Example sentence in Urdu"
    )
    
    # Multimedia
    audio_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Audio pronunciation URL"
    )
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Visual representation URL"
    )
    
    # Learning Support
    synonyms = models.JSONField(
        default=list,
        blank=True,
        help_text="List of synonyms"
    )
    antonyms = models.JSONField(
        default=list,
        blank=True,
        help_text="List of antonyms"
    )
    related_words = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=True,
        help_text="Related vocabulary words"
    )
    
    # Usage Context
    common_phrases = models.JSONField(
        default=list,
        blank=True,
        help_text="Common phrases using this word"
    )
    collocations = models.JSONField(
        default=list,
        blank=True,
        help_text="Common word combinations"
    )
    
    # Learning Analytics
    difficulty_score = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(1.0), MaxValueValidator(10.0)],
        help_text="Subjective difficulty score (1.0-10.0)"
    )
    learning_frequency = models.PositiveIntegerField(
        default=0,
        help_text="How often this word appears in lessons"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is this word active?")
    is_essential = models.BooleanField(
        default=False,
        help_text="Is this an essential word for basic communication?"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_vocabulary'
    )
    
    class Meta:
        ordering = ['oxford_rank', 'word']
        verbose_name = 'Vocabulary Word'
        verbose_name_plural = 'Vocabulary Words'
        indexes = [
            models.Index(fields=['oxford_rank']),
            models.Index(fields=['difficulty_level']),
            models.Index(fields=['part_of_speech']),
            models.Index(fields=['is_oxford_3000']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.word} ({self.translation_urdu})"


class VocabularyProgress(models.Model):
    """
    Track user's progress with vocabulary words
    Implements spaced repetition algorithm
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='vocabulary_progress'
    )
    vocabulary = models.ForeignKey(
        Vocabulary,
        on_delete=models.CASCADE,
        related_name='user_progress'
    )
    
    # Learning Progress
    is_learned = models.BooleanField(default=False, help_text="Has user learned this word?")
    mastery_level = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text="Mastery level (0-5, 5 = perfect mastery)"
    )
    
    # Spaced Repetition Data
    next_review_date = models.DateTimeField(
        default=timezone.now,
        help_text="When to review this word next"
    )
    review_interval_days = models.PositiveIntegerField(
        default=1,
        help_text="Days between reviews"
    )
    review_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of times reviewed"
    )
    correct_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of correct answers"
    )
    incorrect_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of incorrect answers"
    )
    
    # Learning Analytics
    first_learned_at = models.DateTimeField(null=True, blank=True)
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    average_response_time = models.FloatField(
        default=0.0,
        help_text="Average time to answer (seconds)"
    )
    
    # Difficulty Tracking
    personal_difficulty = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(0.1), MaxValueValidator(10.0)],
        help_text="Personal difficulty for this user"
    )
    
    class Meta:
        unique_together = ('user', 'vocabulary')
        ordering = ['next_review_date']
        verbose_name = 'Vocabulary Progress'
        verbose_name_plural = 'Vocabulary Progress'
        indexes = [
            models.Index(fields=['user', 'vocabulary']),
            models.Index(fields=['next_review_date']),
            models.Index(fields=['mastery_level']),
            models.Index(fields=['is_learned']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.vocabulary.word} (Level {self.mastery_level})"

