from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from users.models import User
from groups.models import Group
from levels.models import Level


class PlacementTest(models.Model):
    """
    Placement tests to determine user's starting level
    Allows smart students to skip ahead in the learning path
    """
    TEST_TYPE_CHOICES = [
        ('beginner_exit', 'Beginner Track Exit Test'),
        ('intermediate_exit', 'Intermediate Track Exit Test'),
        ('advanced_exit', 'Advanced Track Exit Test'),
        ('initial_placement', 'Initial Placement Test'),
        ('level_skip', 'Level Skip Test'),
    ]
    
    DIFFICULTY_LEVEL_CHOICES = [
        ('A1', 'A1 - Beginner'),
        ('A2', 'A2 - Elementary'),
        ('B1', 'B1 - Intermediate'),
        ('B2', 'B2 - Upper Intermediate'),
        ('C1', 'C1 - Advanced'),
        ('C2', 'C2 - Proficiency'),
    ]
    
    # Basic Information
    name = models.CharField(
        max_length=255,
        help_text="Test name (e.g., 'Beginner Track Completion Test')"
    )
    description = models.TextField(
        blank=True,
        help_text="Test description and purpose"
    )
    test_type = models.CharField(
        max_length=30,
        choices=TEST_TYPE_CHOICES,
        help_text="Type of placement test"
    )
    
    # Test Configuration
    difficulty_level = models.CharField(
        max_length=2,
        choices=DIFFICULTY_LEVEL_CHOICES,
        help_text="Target difficulty level for this test"
    )
    questions_count = models.PositiveIntegerField(
        default=20,
        validators=[MinValueValidator(5), MaxValueValidator(50)],
        help_text="Number of questions in the test"
    )
    time_limit_minutes = models.PositiveIntegerField(
        default=30,
        validators=[MinValueValidator(5), MaxValueValidator(120)],
        help_text="Time limit in minutes"
    )
    
    # Passing Criteria
    pass_threshold = models.PositiveIntegerField(
        default=90,
        validators=[MinValueValidator(50), MaxValueValidator(100)],
        help_text="Required percentage to pass (50-100)"
    )
    excellent_threshold = models.PositiveIntegerField(
        default=95,
        validators=[MinValueValidator(70), MaxValueValidator(100)],
        help_text="Excellent score threshold for special rewards"
    )
    
    # Skip Logic
    skip_to_group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='placement_tests_unlock',
        help_text="Group to unlock if test is passed"
    )
    skip_to_level = models.ForeignKey(
        Level,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='placement_tests_unlock',
        help_text="Specific level to skip to if test is passed"
    )
    skip_entire_track = models.BooleanField(
        default=False,
        help_text="Skip entire track if passed (for major placement tests)"
    )
    
    # Content Coverage
    covers_groups = models.ManyToManyField(
        Group,
        blank=True,
        related_name='placement_tests_cover',
        help_text="Groups that this test covers"
    )
    covers_levels = models.ManyToManyField(
        Level,
        blank=True,
        related_name='placement_tests_cover',
        help_text="Specific levels that this test covers"
    )
    
    # Question Selection
    question_selection_strategy = models.CharField(
        max_length=30,
        choices=[
            ('random', 'Random Selection'),
            ('difficulty_balanced', 'Difficulty Balanced'),
            ('comprehensive', 'Comprehensive Coverage'),
            ('adaptive', 'Adaptive Selection'),
        ],
        default='difficulty_balanced',
        help_text="Strategy for selecting questions"
    )
    
    # Rewards
    xp_reward = models.PositiveIntegerField(
        default=100,
        help_text="XP reward for passing the test"
    )
    badge_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Badge name for passing the test"
    )
    badge_description = models.TextField(
        blank=True,
        help_text="Badge description"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is test active?")
    is_required = models.BooleanField(
        default=False,
        help_text="Is this test required to proceed?"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_placement_tests'
    )
    
    class Meta:
        ordering = ['test_type', 'difficulty_level']
        verbose_name = 'Placement Test'
        verbose_name_plural = 'Placement Tests'
        indexes = [
            models.Index(fields=['test_type']),
            models.Index(fields=['difficulty_level']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.test_type})"


class PlacementTestAttempt(models.Model):
    """
    User's attempt at a placement test
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
        related_name='placement_test_attempts'
    )
    test = models.ForeignKey(
        PlacementTest,
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
    score = models.PositiveIntegerField(default=0, help_text="Score achieved")
    total_questions = models.PositiveIntegerField(default=0, help_text="Total questions")
    correct_answers = models.PositiveIntegerField(default=0, help_text="Correct answers")
    percentage = models.FloatField(default=0.0, help_text="Percentage score")
    
    # Results
    passed = models.BooleanField(default=False, help_text="Did user pass the test?")
    excellent_score = models.BooleanField(default=False, help_text="Did user get excellent score?")
    
    # Time Tracking
    time_taken_seconds = models.PositiveIntegerField(default=0, help_text="Time taken in seconds")
    started_at = models.DateTimeField(auto_now_add=True, help_text="When test was started")
    completed_at = models.DateTimeField(null=True, blank=True, help_text="When test was completed")
    
    # Rewards Earned
    xp_earned = models.PositiveIntegerField(default=0, help_text="XP earned")
    badge_earned = models.BooleanField(default=False, help_text="Did user earn badge?")
    
    # Skip Actions
    skip_action_taken = models.BooleanField(default=False, help_text="Was skip action taken?")
    skip_destination = models.CharField(
        max_length=255,
        blank=True,
        help_text="Where user was skipped to"
    )
    
    # User Answers
    user_answers = models.JSONField(
        default=dict,
        help_text="User's answers for each question"
    )
    
    # Feedback
    feedback = models.TextField(blank=True, help_text="Test feedback")
    recommendations = models.TextField(blank=True, help_text="Study recommendations")
    
    # Analytics
    question_breakdown = models.JSONField(
        default=dict,
        help_text="Breakdown of performance by question type/topic"
    )
    weak_areas = models.JSONField(
        default=list,
        help_text="Areas where user struggled"
    )
    
    class Meta:
        ordering = ['-started_at']
        verbose_name = 'Placement Test Attempt'
        verbose_name_plural = 'Placement Test Attempts'
        indexes = [
            models.Index(fields=['user', 'test']),
            models.Index(fields=['started_at']),
            models.Index(fields=['status']),
            models.Index(fields=['passed']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.test.name} ({self.status})"

