from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from users.models import User


class Group(models.Model):
    """
    Learning groups/chapters - Independent from levels
    Groups are now just categories for organizing content
    """
    DIFFICULTY_CHOICES = [
        (1, 'Beginner'),
        (2, 'Elementary'),
        (3, 'Intermediate'),
        (4, 'Upper Intermediate'),
        (5, 'Advanced'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=255, help_text="Group name")
    description = models.TextField(blank=True, help_text="Group description")
    group_number = models.PositiveIntegerField(
        unique=True,
        validators=[MinValueValidator(1)],
        help_text="Sequential group number"
    )
    
    # Configuration
    difficulty = models.PositiveIntegerField(
        choices=DIFFICULTY_CHOICES,
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Group difficulty level"
    )
    
    # Unlock Configuration
    is_unlocked = models.BooleanField(default=False, help_text="Is group unlocked?")
    unlock_condition = models.CharField(
        max_length=20,
        choices=[
            ('complete_previous', 'Complete Previous Group'),
            ('test_100_percent', 'Pass Test with 100%'),
            ('both', 'Both Conditions'),
            ('level_requirement', 'Complete Specific Level'),
        ],
        default='complete_previous',
        help_text="Condition to unlock this group"
    )
    required_level = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
        help_text="Required level to unlock (if level_requirement)"
    )
    
    # Test Configuration (for group unlock)
    test_questions = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(5), MaxValueValidator(20)],
        help_text="Questions in unlock test"
    )
    pass_percentage = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(50), MaxValueValidator(100)],
        help_text="Required percentage to pass unlock test"
    )
    
    # Rewards
    xp_reward = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(1)],
        help_text="XP reward for completing group"
    )
    badge_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Badge name for completing group"
    )
    badge_description = models.TextField(
        blank=True,
        help_text="Badge description"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is group active?")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_groups'
    )
    
    class Meta:
        ordering = ['group_number']
        verbose_name = 'Group'
        verbose_name_plural = 'Groups'
        indexes = [
            models.Index(fields=['group_number']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['is_unlocked']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"Group {self.group_number}: {self.name}"
    
    def get_next_group(self):
        """Get the next group"""
        try:
            return Group.objects.filter(
                group_number__gt=self.group_number,
                is_active=True
            ).order_by('group_number').first()
        except Group.DoesNotExist:
            return None
    
    def get_previous_group(self):
        """Get the previous group"""
        try:
            return Group.objects.filter(
                group_number__lt=self.group_number,
                is_active=True
            ).order_by('-group_number').first()
        except Group.DoesNotExist:
            return None


class GroupProgress(models.Model):
    """
    Track user's progress through groups
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='group_progress'
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='user_progress'
    )
    
    # Progress Data
    is_unlocked = models.BooleanField(default=False, help_text="Is group unlocked for user?")
    is_completed = models.BooleanField(default=False, help_text="Is group completed?")
    completion_percentage = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Completion percentage"
    )
    
    # Statistics
    levels_completed = models.PositiveIntegerField(default=0, help_text="Levels completed in this group")
    total_xp_earned = models.PositiveIntegerField(default=0, help_text="Total XP earned in this group")
    time_spent_minutes = models.PositiveIntegerField(default=0, help_text="Time spent in this group (minutes)")
    
    # Test Results
    unlock_test_passed = models.BooleanField(default=False, help_text="Did user pass unlock test?")
    unlock_test_attempts = models.PositiveIntegerField(default=0, help_text="Number of unlock test attempts")
    best_unlock_test_score = models.FloatField(default=0.0, help_text="Best unlock test score")
    
    # Timestamps
    unlocked_at = models.DateTimeField(null=True, blank=True, help_text="When group was unlocked")
    completed_at = models.DateTimeField(null=True, blank=True, help_text="When group was completed")
    last_accessed_at = models.DateTimeField(null=True, blank=True, help_text="Last time group was accessed")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'group')
        ordering = ['group__group_number']
        verbose_name = 'Group Progress'
        verbose_name_plural = 'Group Progress'
        indexes = [
            models.Index(fields=['user', 'group']),
            models.Index(fields=['is_completed']),
            models.Index(fields=['completion_percentage']),
            models.Index(fields=['unlocked_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - Group {self.group.group_number} ({'Completed' if self.is_completed else 'In Progress'})"
    
    def unlock_group(self):
        """Unlock group for user"""
        self.is_unlocked = True
        self.unlocked_at = timezone.now()
        self.save()
    
    def complete_group(self):
        """Mark group as completed"""
        self.is_completed = True
        self.completion_percentage = 100.0
        self.completed_at = timezone.now()
        self.save()
    
    def update_progress(self, levels_completed=0, xp_earned=0, time_spent=0):
        """Update group progress"""
        if levels_completed > 0:
            self.levels_completed += levels_completed
        
        if xp_earned > 0:
            self.total_xp_earned += xp_earned
        
        if time_spent > 0:
            self.time_spent_minutes += time_spent
        
        self.last_accessed_at = timezone.now()
        self.save()
    
    def record_unlock_test_attempt(self, score, passed=False):
        """Record unlock test attempt"""
        self.unlock_test_attempts += 1
        self.best_unlock_test_score = max(self.best_unlock_test_score, score)
        
        if passed:
            self.unlock_test_passed = True
            self.unlock_group()
        
        self.save()


class GroupUnlockTest(models.Model):
    """
    Tests required to unlock groups
    """
    group = models.OneToOneField(
        Group,
        on_delete=models.CASCADE,
        related_name='unlock_test',
        help_text="Group this test unlocks"
    )
    
    # Test Configuration
    name = models.CharField(max_length=255, help_text="Test name")
    description = models.TextField(blank=True, help_text="Test description")
    
    # Questions (will be linked to levels app questions)
    questions_count = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(5), MaxValueValidator(20)],
        help_text="Number of questions in test"
    )
    pass_percentage = models.PositiveIntegerField(
        default=100,
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
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is test active?")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_unlock_tests'
    )
    
    class Meta:
        verbose_name = 'Group Unlock Test'
        verbose_name_plural = 'Group Unlock Tests'
        indexes = [
            models.Index(fields=['group']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"Unlock Test for Group {self.group.group_number}: {self.name}"


class GroupUnlockTestAttempt(models.Model):
    """
    User's attempt at group unlock test
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='unlock_test_attempts'
    )
    test = models.ForeignKey(
        GroupUnlockTest,
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    
    # Attempt Data
    score = models.PositiveIntegerField(default=0, help_text="Score achieved")
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
    
    # User Answers
    user_answers = models.JSONField(
        default=dict,
        help_text="User's answers for each question"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-started_at']
        verbose_name = 'Group Unlock Test Attempt'
        verbose_name_plural = 'Group Unlock Test Attempts'
        indexes = [
            models.Index(fields=['user', 'test']),
            models.Index(fields=['started_at']),
            models.Index(fields=['passed']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - Group {self.test.group.group_number} Unlock Test ({'Passed' if self.passed else 'Failed'})"
    
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
        self.completed_at = timezone.now()
        self.percentage = self.calculate_percentage()
        self.passed = self.check_pass_status()
        
        if self.passed:
            self.xp_earned = self.test.xp_reward
        
        self.save()
    
    def save(self, *args, **kwargs):
        """Override save to calculate percentage and pass status"""
        if self.completed_at:
            self.percentage = self.calculate_percentage()
            self.passed = self.check_pass_status()
        super().save(*args, **kwargs)