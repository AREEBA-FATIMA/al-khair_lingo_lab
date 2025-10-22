from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from users.models import User


class Level(models.Model):
    """
    Independent Level model - No dependency on Groups
    Each level is self-contained with exactly 6 questions
    """
    DIFFICULTY_CHOICES = [
        (1, 'Beginner'),
        (2, 'Elementary'),
        (3, 'Intermediate'),
        (4, 'Upper Intermediate'),
        (5, 'Advanced'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=255, help_text="Level name")
    description = models.TextField(blank=True, help_text="Level description")
    level_number = models.PositiveIntegerField(
        unique=True,
        validators=[MinValueValidator(1)],
        help_text="Sequential level number (1, 2, 3...)"
    )
    
    # Group relationship
    group = models.ForeignKey(
        'groups.Group',
        on_delete=models.CASCADE,
        related_name='levels',
        help_text="Group this level belongs to"
    )
    
    # Configuration
    difficulty = models.PositiveIntegerField(
        choices=DIFFICULTY_CHOICES,
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Difficulty level (1-5)"
    )
    difficulty_score = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(1.0), MaxValueValidator(10.0)],
        help_text="Detailed difficulty score (1.0-10.0)"
    )
    xp_reward = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(1)],
        help_text="XP points awarded for completing this level"
    )
    
    # Learning Content
    learning_objectives = models.JSONField(
        default=list,
        blank=True,
        help_text="List of learning objectives for this level"
    )
    vocabulary_words = models.JSONField(
        default=list,
        blank=True,
        help_text="List of vocabulary words taught in this level"
    )
    grammar_points = models.JSONField(
        default=list,
        blank=True,
        help_text="List of grammar points covered in this level"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is this level active?")
    is_unlocked = models.BooleanField(default=True, help_text="Is this level unlocked?")
    
    # Test Configuration (for every 10th level)
    is_test_level = models.BooleanField(
        default=False,
        help_text="Is this a test level (every 10th level)?"
    )
    test_questions_count = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(5), MaxValueValidator(20)],
        help_text="Number of questions in test (only for test levels)"
    )
    test_pass_percentage = models.PositiveIntegerField(
        default=80,
        validators=[MinValueValidator(50), MaxValueValidator(100)],
        help_text="Required percentage to pass test"
    )
    test_time_limit_minutes = models.PositiveIntegerField(
        default=15,
        validators=[MinValueValidator(5), MaxValueValidator(60)],
        help_text="Time limit for test in minutes"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_levels'
    )
    
    class Meta:
        ordering = ['level_number']
        verbose_name = 'Level'
        verbose_name_plural = 'Levels'
        indexes = [
            models.Index(fields=['level_number']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_test_level']),
        ]
    
    def __str__(self):
        return f"Level {self.level_number}"
    
    def save(self, *args, **kwargs):
        """Auto-set test level for every 10th level"""
        if self.level_number % 10 == 0:
            self.is_test_level = True
        super().save(*args, **kwargs)
    
    def get_questions_count(self):
        """Get number of questions in this level"""
        if self.is_test_level:
            return self.test_questions_count
        return 6  # Regular levels have exactly 6 questions
    
    def get_next_level(self):
        """Get the next level"""
        try:
            return Level.objects.filter(
                level_number__gt=self.level_number,
                is_active=True
            ).order_by('level_number').first()
        except Level.DoesNotExist:
            return None
    
    def get_previous_level(self):
        """Get the previous level"""
        try:
            return Level.objects.filter(
                level_number__lt=self.level_number,
                is_active=True
            ).order_by('-level_number').first()
        except Level.DoesNotExist:
            return None


class Question(models.Model):
    """
    Questions within levels - Exactly 6 questions per regular level
    Variable questions for test levels
    """
    QUESTION_TYPE_CHOICES = [
        ('mcq', 'Multiple Choice Question'),
        ('text_to_speech', 'Text to Speech (Pronunciation)'),
        ('fill_blank', 'Fill in the Blank'),
        ('synonyms', 'Synonyms'),
        ('antonyms', 'Antonyms'),
        ('sentence_completion', 'Sentence Completion'),
        ('listening', 'Listening Comprehension'),
        ('reading', 'Reading Comprehension'),
        ('writing', 'Writing Exercise'),
        ('grammar', 'Grammar Exercise'),
    ]
    
    # Basic Information
    level = models.ForeignKey(
        Level,
        on_delete=models.CASCADE,
        related_name='questions',
        help_text="Level this question belongs to"
    )
    question_text = models.TextField(help_text="The question text")
    question_type = models.CharField(
        max_length=30,
        choices=QUESTION_TYPE_CHOICES,
        help_text="Type of question"
    )
    
    # Answer Configuration
    options = models.JSONField(
        blank=True,
        null=True,
        help_text="Options for MCQ questions (list of strings)"
    )
    correct_answer = models.JSONField(
        blank=True,
        null=True,
        help_text="Correct answer(s) - can be string or list"
    )
    
    # Media
    audio_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Audio file URL for listening questions"
    )
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Image URL for visual questions"
    )
    
    # Help and Explanation
    hint = models.TextField(
        blank=True,
        help_text="Hint for the question"
    )
    explanation = models.TextField(
        blank=True,
        help_text="Explanation of the correct answer"
    )
    
    # Learning Context
    vocabulary_tested = models.CharField(
        max_length=100,
        blank=True,
        help_text="Vocabulary word being tested"
    )
    grammar_tested = models.CharField(
        max_length=100,
        blank=True,
        help_text="Grammar rule being tested"
    )
    cognitive_level = models.CharField(
        max_length=20,
        choices=[
            ('remember', 'Remember'),
            ('understand', 'Understand'),
            ('apply', 'Apply'),
            ('analyze', 'Analyze'),
            ('evaluate', 'Evaluate'),
            ('create', 'Create'),
        ],
        default='remember',
        help_text="Cognitive level of this question"
    )
    distractor_analysis = models.JSONField(
        default=dict,
        blank=True,
        help_text="Analysis of why wrong answers are wrong"
    )
    
    # Configuration
    difficulty = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Question difficulty (1-5)"
    )
    xp_value = models.PositiveIntegerField(
        default=2,
        validators=[MinValueValidator(1)],
        help_text="XP points for correct answer"
    )
    question_order = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Order of question in level"
    )
    
    # Time Configuration
    time_limit_seconds = models.PositiveIntegerField(
        default=30,
        validators=[MinValueValidator(5), MaxValueValidator(300)],
        help_text="Time limit for this question in seconds"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is this question active?")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_questions'
    )
    
    class Meta:
        ordering = ['level', 'question_order']
        unique_together = ('level', 'question_order')
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
        indexes = [
            models.Index(fields=['level', 'question_order']),
            models.Index(fields=['question_type']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"Q{self.question_order}: {self.question_text[:50]}..."
    
    def get_question_type_display_name(self):
        """Get user-friendly question type name"""
        type_names = {
            'mcq': 'Multiple Choice',
            'text_to_speech': 'Pronunciation',
            'fill_blank': 'Fill in the Blank',
            'synonyms': 'Synonyms',
            'antonyms': 'Antonyms',
            'sentence_completion': 'Complete Sentence',
            'listening': 'Listening',
            'reading': 'Reading',
            'writing': 'Writing',
            'grammar': 'Grammar',
        }
        return type_names.get(self.question_type, self.question_type)
    
    def validate_answer(self, user_answer):
        """Validate user's answer based on question type"""
        if not self.correct_answer or not user_answer:
            return False
        
        user_answer = str(user_answer).strip()
        correct_answer = self.correct_answer
        
        # Handle different question types
        if self.question_type == 'mcq':
            # Multiple choice - exact match
            return user_answer.lower() == str(correct_answer).lower()
        
        elif self.question_type == 'fill_blank':
            # Fill in the blank - case insensitive, handle multiple correct answers
            if isinstance(correct_answer, list):
                return user_answer.lower() in [ans.lower().strip() for ans in correct_answer]
            else:
                return user_answer.lower() == str(correct_answer).lower()
        
        elif self.question_type == 'synonyms':
            # Synonyms - check if user answer is in synonyms list
            if isinstance(correct_answer, list):
                return user_answer.lower() in [ans.lower().strip() for ans in correct_answer]
            else:
                return user_answer.lower() == str(correct_answer).lower()
        
        elif self.question_type == 'antonyms':
            # Antonyms - check if user answer is in antonyms list
            if isinstance(correct_answer, list):
                return user_answer.lower() in [ans.lower().strip() for ans in correct_answer]
            else:
                return user_answer.lower() == str(correct_answer).lower()
        
        elif self.question_type == 'sentence_completion':
            # Sentence completion - check word order
            if isinstance(correct_answer, list):
                # Compare word by word (case insensitive)
                user_words = [word.lower().strip() for word in user_answer.split()]
                correct_words = [word.lower().strip() for word in correct_answer]
                return user_words == correct_words
            else:
                # Compare as strings
                return user_answer.lower() == str(correct_answer).lower()
        
        elif self.question_type == 'text_to_speech':
            # Text to speech - for now, accept any non-empty answer
            # In future, integrate with speech recognition
            return len(user_answer) > 0
        
        elif self.question_type == 'listening':
            # Listening comprehension - similar to MCQ
            return user_answer.lower() == str(correct_answer).lower()
        
        elif self.question_type == 'reading':
            # Reading comprehension - similar to MCQ
            return user_answer.lower() == str(correct_answer).lower()
        
        elif self.question_type == 'writing':
            # Writing exercise - for now, accept any non-empty answer
            # In future, implement more sophisticated checking
            return len(user_answer) > 10  # Minimum length requirement
        
        elif self.question_type == 'grammar':
            # Grammar exercise - similar to fill in blank
            if isinstance(correct_answer, list):
                return user_answer.lower() in [ans.lower().strip() for ans in correct_answer]
            else:
                return user_answer.lower() == str(correct_answer).lower()
        
        else:
            # Default validation - case insensitive string comparison
            if isinstance(correct_answer, list):
                return user_answer.lower() in [ans.lower().strip() for ans in correct_answer]
            else:
                return user_answer.lower() == str(correct_answer).lower()


class LevelCompletion(models.Model):
    """
    Track user's completion of levels
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='level_completions'
    )
    level = models.ForeignKey(
        Level,
        on_delete=models.CASCADE,
        related_name='completions'
    )
    
    # Completion Data
    score = models.PositiveIntegerField(default=0, help_text="Score achieved")
    total_questions = models.PositiveIntegerField(default=0, help_text="Total questions attempted")
    correct_answers = models.PositiveIntegerField(default=0, help_text="Correct answers")
    percentage = models.FloatField(default=0.0, help_text="Percentage score")
    
    # Status
    passed = models.BooleanField(default=False, help_text="Did user pass the level?")
    is_test_level = models.BooleanField(default=False, help_text="Was this a test level?")
    
    # Time Tracking
    time_taken_seconds = models.PositiveIntegerField(default=0, help_text="Time taken in seconds")
    started_at = models.DateTimeField(help_text="When level was started")
    completed_at = models.DateTimeField(auto_now_add=True, help_text="When level was completed")
    
    # XP and Rewards
    xp_earned = models.PositiveIntegerField(default=0, help_text="XP earned from this level")
    
    # User Answers (for review)
    user_answers = models.JSONField(
        default=dict,
        help_text="User's answers for each question"
    )
    
    class Meta:
        unique_together = ('user', 'level')
        ordering = ['-completed_at']
        verbose_name = 'Level Completion'
        verbose_name_plural = 'Level Completions'
        indexes = [
            models.Index(fields=['user', 'level']),
            models.Index(fields=['completed_at']),
            models.Index(fields=['passed']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - Level {self.level.level_number} ({'Passed' if self.passed else 'Failed'})"
    
    def calculate_percentage(self):
        """Calculate percentage score"""
        if self.total_questions > 0:
            self.percentage = (self.correct_answers / self.total_questions) * 100
            return self.percentage
        return 0.0
    
    def check_pass_status(self):
        """Check if user passed the level"""
        if self.is_test_level:
            self.passed = self.percentage >= self.level.test_pass_percentage
        else:
            self.passed = self.percentage >= 60  # 60% for regular levels
        return self.passed
    
    def save(self, *args, **kwargs):
        """Override save to calculate percentage and pass status"""
        self.percentage = self.calculate_percentage()
        self.passed = self.check_pass_status()
        super().save(*args, **kwargs)