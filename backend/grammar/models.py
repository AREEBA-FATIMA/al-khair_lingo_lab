from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from users.models import User


class GrammarRule(models.Model):
    """
    Grammar rules with comprehensive learning support
    Each rule has examples, common mistakes, and practice exercises
    """
    DIFFICULTY_LEVEL_CHOICES = [
        ('A1', 'A1 - Beginner'),
        ('A2', 'A2 - Elementary'),
        ('B1', 'B1 - Intermediate'),
        ('B2', 'B2 - Upper Intermediate'),
        ('C1', 'C1 - Advanced'),
        ('C2', 'C2 - Proficiency'),
    ]
    
    GRAMMAR_CATEGORY_CHOICES = [
        ('tenses', 'Tenses'),
        ('articles', 'Articles'),
        ('pronouns', 'Pronouns'),
        ('prepositions', 'Prepositions'),
        ('conjunctions', 'Conjunctions'),
        ('modals', 'Modal Verbs'),
        ('conditionals', 'Conditionals'),
        ('passive_voice', 'Passive Voice'),
        ('reported_speech', 'Reported Speech'),
        ('comparatives', 'Comparatives & Superlatives'),
        ('gerunds_infinitives', 'Gerunds & Infinitives'),
        ('relative_clauses', 'Relative Clauses'),
        ('subjunctive', 'Subjunctive Mood'),
        ('inversion', 'Inversion'),
        ('phrasal_verbs', 'Phrasal Verbs'),
        ('other', 'Other'),
    ]
    
    # Basic Information
    name = models.CharField(
        max_length=255,
        unique=True,
        help_text="Grammar rule name (e.g., 'Present Simple')"
    )
    short_name = models.CharField(
        max_length=100,
        help_text="Short name for display (e.g., 'Present Simple')"
    )
    description = models.TextField(
        help_text="Brief description of the grammar rule"
    )
    
    # Classification
    difficulty_level = models.CharField(
        max_length=2,
        choices=DIFFICULTY_LEVEL_CHOICES,
        default='A1',
        help_text="CEFR difficulty level"
    )
    category = models.CharField(
        max_length=30,
        choices=GRAMMAR_CATEGORY_CHOICES,
        help_text="Grammar category"
    )
    
    # Learning Content
    rules = models.JSONField(
        default=list,
        help_text="List of grammar rules and explanations"
    )
    examples = models.JSONField(
        default=list,
        help_text="List of example sentences"
    )
    negative_examples = models.JSONField(
        default=list,
        blank=True,
        help_text="List of incorrect examples"
    )
    
    # Common Mistakes
    common_mistakes = models.JSONField(
        default=list,
        blank=True,
        help_text="Common mistakes students make with this rule"
    )
    mistake_explanations = models.JSONField(
        default=list,
        blank=True,
        help_text="Explanations for why mistakes are wrong"
    )
    
    # Usage Context
    when_to_use = models.TextField(
        blank=True,
        help_text="When to use this grammar rule"
    )
    when_not_to_use = models.TextField(
        blank=True,
        help_text="When NOT to use this grammar rule"
    )
    signal_words = models.JSONField(
        default=list,
        blank=True,
        help_text="Signal words that indicate this grammar rule"
    )
    
    # Learning Support
    related_rules = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=True,
        help_text="Related grammar rules"
    )
    prerequisite_rules = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        related_name='dependent_rules',
        help_text="Rules that should be learned before this one"
    )
    
    # Practice Configuration
    practice_difficulty = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(1.0), MaxValueValidator(10.0)],
        help_text="Practice difficulty score (1.0-10.0)"
    )
    question_types = models.JSONField(
        default=list,
        help_text="Question types that can test this rule"
    )
    
    # Multimedia
    explanation_video_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Video explanation URL"
    )
    audio_examples = models.JSONField(
        default=list,
        blank=True,
        help_text="Audio URLs for example sentences"
    )
    
    # Learning Analytics
    learning_frequency = models.PositiveIntegerField(
        default=0,
        help_text="How often this rule appears in lessons"
    )
    mastery_difficulty = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(1.0), MaxValueValidator(10.0)],
        help_text="How difficult it is to master this rule"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is this rule active?")
    is_essential = models.BooleanField(
        default=False,
        help_text="Is this an essential grammar rule?"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_grammar_rules'
    )
    
    class Meta:
        ordering = ['difficulty_level', 'category', 'name']
        verbose_name = 'Grammar Rule'
        verbose_name_plural = 'Grammar Rules'
        indexes = [
            models.Index(fields=['difficulty_level']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_essential']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.difficulty_level})"


class GrammarProgress(models.Model):
    """
    Track user's progress with grammar rules
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='grammar_progress'
    )
    grammar_rule = models.ForeignKey(
        GrammarRule,
        on_delete=models.CASCADE,
        related_name='user_progress'
    )
    
    # Learning Progress
    is_learned = models.BooleanField(default=False, help_text="Has user learned this rule?")
    mastery_level = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text="Mastery level (0-5, 5 = perfect mastery)"
    )
    
    # Practice Data
    practice_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of times practiced"
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
    last_practiced_at = models.DateTimeField(null=True, blank=True)
    average_response_time = models.FloatField(
        default=0.0,
        help_text="Average time to answer (seconds)"
    )
    
    # Personal Difficulty
    personal_difficulty = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(0.1), MaxValueValidator(10.0)],
        help_text="Personal difficulty for this user"
    )
    
    # Common Mistakes Tracking
    mistake_patterns = models.JSONField(
        default=dict,
        blank=True,
        help_text="Track specific mistake patterns for this user"
    )
    
    class Meta:
        unique_together = ('user', 'grammar_rule')
        ordering = ['-last_practiced_at']
        verbose_name = 'Grammar Progress'
        verbose_name_plural = 'Grammar Progress'
        indexes = [
            models.Index(fields=['user', 'grammar_rule']),
            models.Index(fields=['mastery_level']),
            models.Index(fields=['is_learned']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.grammar_rule.name} (Level {self.mastery_level})"

