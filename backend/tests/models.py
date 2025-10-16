from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from users.models import User
from levels.models import Level, Question


class TestExercise(models.Model):
    """
    Test exercises that appear after every 10 levels
    These are comprehensive tests covering multiple topics
    """
    DIFFICULTY_CHOICES = [
        (1, 'Beginner'),
        (2, 'Elementary'),
        (3, 'Intermediate'),
        (4, 'Upper Intermediate'),
        (5, 'Advanced'),
    ]
    
    TEST_TYPE_CHOICES = [
        ('comprehensive', 'Comprehensive Test'),
        ('grammar', 'Grammar Test'),
        ('vocabulary', 'Vocabulary Test'),
        ('listening', 'Listening Test'),
        ('reading', 'Reading Test'),
        ('writing', 'Writing Test'),
        ('speaking', 'Speaking Test'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=255, help_text="Test name")
    description = models.TextField(blank=True, help_text="Test description")
    test_type = models.CharField(
        max_length=20,
        choices=TEST_TYPE_CHOICES,
        default='comprehensive',
        help_text="Type of test"
    )
    
    # Level Configuration
    target_level_range_start = models.PositiveIntegerField(
        default=1,
        help_text="Starting level for this test"
    )
    target_level_range_end = models.PositiveIntegerField(
        default=10,
        help_text="Ending level for this test"
    )
    
    # Test Configuration
    difficulty = models.PositiveIntegerField(
        choices=DIFFICULTY_CHOICES,
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Test difficulty level"
    )
    questions_count = models.PositiveIntegerField(
        default=20,
        validators=[MinValueValidator(5), MaxValueValidator(50)],
        help_text="Number of questions in test"
    )
    pass_percentage = models.PositiveIntegerField(
        default=80,
        validators=[MinValueValidator(50), MaxValueValidator(100)],
        help_text="Required percentage to pass"
    )
    time_limit_minutes = models.PositiveIntegerField(
        default=30,
        validators=[MinValueValidator(5), MaxValueValidator(120)],
        help_text="Time limit in minutes"
    )
    
    # Rewards
    xp_reward = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(1)],
        help_text="XP reward for passing test"
    )
    badge_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Badge name for passing test"
    )
    badge_description = models.TextField(
        blank=True,
        help_text="Badge description"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is test active?")
    is_required = models.BooleanField(default=True, help_text="Is test required to proceed?")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_tests'
    )
    
    class Meta:
        ordering = ['target_level_range_start', 'difficulty']
        verbose_name = 'Test Exercise'
        verbose_name_plural = 'Test Exercises'
        indexes = [
            models.Index(fields=['target_level_range_start']),
            models.Index(fields=['test_type']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} (Levels {self.target_level_range_start}-{self.target_level_range_end})"
    
    def get_questions(self):
        """Get questions for this test"""
        return self.questions.all().order_by('question_order')
    
    def is_eligible_for_level(self, level_number):
        """Check if test is eligible for given level"""
        return (self.target_level_range_start <= level_number <= self.target_level_range_end)


class TestQuestion(models.Model):
    """
    Questions specifically for test exercises
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
        ('essay', 'Essay Writing'),
        ('speaking', 'Speaking Exercise'),
    ]
    
    # Basic Information
    test = models.ForeignKey(
        TestExercise,
        on_delete=models.CASCADE,
        related_name='questions',
        help_text="Test this question belongs to"
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
        help_text="Options for MCQ questions"
    )
    correct_answer = models.JSONField(
        blank=True,
        null=True,
        help_text="Correct answer(s)"
    )
    
    # Media
    audio_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Audio file URL"
    )
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Image URL"
    )
    
    # Help and Explanation
    hint = models.TextField(blank=True, help_text="Hint for the question")
    explanation = models.TextField(blank=True, help_text="Explanation of correct answer")
    
    # Configuration
    difficulty = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Question difficulty"
    )
    points = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Points for correct answer"
    )
    question_order = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Order of question in test"
    )
    
    # Time Configuration
    time_limit_seconds = models.PositiveIntegerField(
        default=60,
        validators=[MinValueValidator(10), MaxValueValidator(600)],
        help_text="Time limit in seconds"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is question active?")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_test_questions'
    )
    
    class Meta:
        ordering = ['test', 'question_order']
        unique_together = ('test', 'question_order')
        verbose_name = 'Test Question'
        verbose_name_plural = 'Test Questions'
        indexes = [
            models.Index(fields=['test', 'question_order']),
            models.Index(fields=['question_type']),
            models.Index(fields=['difficulty']),
        ]
    
    def __str__(self):
        return f"Q{self.question_order}: {self.question_text[:50]}..."
    
    def validate_answer(self, user_answer):
        """Validate user's answer"""
        if not self.correct_answer:
            return False
        
        if isinstance(self.correct_answer, list):
            return user_answer.lower().strip() in [ans.lower().strip() for ans in self.correct_answer]
        else:
            return user_answer.lower().strip() == str(self.correct_answer).lower().strip()


class TestAttempt(models.Model):
    """
    User's attempt at a test exercise
    """
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
        ('timeout', 'Timeout'),
    ]
    
    # Basic Information
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='test_attempts'
    )
    test = models.ForeignKey(
        TestExercise,
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    
    # Attempt Data
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='in_progress',
        help_text="Status of the attempt"
    )
    score = models.PositiveIntegerField(default=0, help_text="Total score achieved")
    total_questions = models.PositiveIntegerField(default=0, help_text="Total questions")
    correct_answers = models.PositiveIntegerField(default=0, help_text="Correct answers")
    percentage = models.FloatField(default=0.0, help_text="Percentage score")
    
    # Status
    passed = models.BooleanField(default=False, help_text="Did user pass the test?")
    
    # Time Tracking
    time_taken_seconds = models.PositiveIntegerField(default=0, help_text="Time taken in seconds")
    started_at = models.DateTimeField(auto_now_add=True, help_text="When test was started")
    completed_at = models.DateTimeField(null=True, blank=True, help_text="When test was completed")
    
    # Rewards
    xp_earned = models.PositiveIntegerField(default=0, help_text="XP earned")
    badge_earned = models.BooleanField(default=False, help_text="Did user earn badge?")
    
    # User Answers
    user_answers = models.JSONField(
        default=dict,
        help_text="User's answers for each question"
    )
    
    # Feedback
    feedback = models.TextField(blank=True, help_text="Test feedback")
    recommendations = models.TextField(blank=True, help_text="Study recommendations")
    
    class Meta:
        ordering = ['-started_at']
        verbose_name = 'Test Attempt'
        verbose_name_plural = 'Test Attempts'
        indexes = [
            models.Index(fields=['user', 'test']),
            models.Index(fields=['started_at']),
            models.Index(fields=['status']),
            models.Index(fields=['passed']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.test.name} ({self.status})"
    
    def calculate_percentage(self):
        """Calculate percentage score"""
        if self.total_questions > 0:
            self.percentage = (self.correct_answers / self.total_questions) * 100
            return self.percentage
        return 0.0
    
    def check_pass_status(self):
        """Check if user passed the test"""
        self.passed = self.percentage >= self.test.pass_percentage
        return self.passed
    
    def complete_test(self):
        """Mark test as completed"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.percentage = self.calculate_percentage()
        self.passed = self.check_pass_status()
        
        if self.passed:
            self.xp_earned = self.test.xp_reward
            self.badge_earned = bool(self.test.badge_name)
        
        self.save()
    
    def save(self, *args, **kwargs):
        """Override save to calculate percentage and pass status"""
        if self.status == 'completed':
            self.percentage = self.calculate_percentage()
            self.passed = self.check_pass_status()
        super().save(*args, **kwargs)