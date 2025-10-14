from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('parent', 'Parent'),
        ('admin', 'Admin'),
    ]
    
    LEVEL_CHOICES = [
        ('A1', 'A1 - Beginner'),
        ('A2', 'A2 - Elementary'),
        ('B1', 'B1 - Intermediate'),
        ('B2', 'B2 - Upper Intermediate'),
        ('C1', 'C1 - Advanced'),
        ('C2', 'C2 - Proficient'),
    ]
    
    # Basic Information
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    level = models.CharField(max_length=2, choices=LEVEL_CHOICES, default='A1')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    # School Information (for students)
    school_name = models.CharField(max_length=200, blank=True, null=True)
    class_name = models.CharField(max_length=50, blank=True, null=True)
    student_id = models.CharField(max_length=50, blank=True, null=True)
    
    # Learning Progress
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    total_xp = models.PositiveIntegerField(default=0)
    lessons_completed = models.PositiveIntegerField(default=0)
    vocabulary_learned = models.PositiveIntegerField(default=0)
    
    # Preferences
    daily_goal_minutes = models.PositiveIntegerField(default=15)
    notifications_enabled = models.BooleanField(default=True)
    sound_effects_enabled = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    
    # Timestamps
    last_active = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Parent-Child Relationship
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='children')
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def update_streak(self):
        """Update user's streak based on last activity"""
        today = timezone.now().date()
        if self.last_active.date() == today:
            return
        
        yesterday = today - timezone.timedelta(days=1)
        if self.last_active.date() == yesterday:
            self.current_streak += 1
        else:
            self.current_streak = 1
        
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        
        self.last_active = timezone.now()
        self.save()
    
    def add_xp(self, points):
        """Add XP points to user"""
        self.total_xp += points
        self.save()
    
    def get_level_progress(self):
        """Calculate progress towards next level"""
        level_xp_requirements = {
            'A1': 0, 'A2': 1000, 'B1': 2500, 'B2': 5000, 'C1': 8000, 'C2': 12000
        }
        levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        current_index = levels.index(self.level)
        
        if current_index == len(levels) - 1:  # C2 level
            return 100
        
        current_requirement = level_xp_requirements[self.level]
        next_requirement = level_xp_requirements[levels[current_index + 1]]
        
        progress = ((self.total_xp - current_requirement) / (next_requirement - current_requirement)) * 100
        return min(100, max(0, progress))


class UserProfile(models.Model):
    """
    Extended user profile information for Group-Based Learning System
    """
    COMPANION_CHOICES = [
        ('pet', 'Pet'),
        ('plant', 'Plant'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Companion System
    companion_type = models.CharField(max_length=10, choices=COMPANION_CHOICES, default='pet')
    companion_selected = models.BooleanField(default=False)
    
    # Group-Based Progress
    current_group_id = models.IntegerField(null=True, blank=True)
    current_level_id = models.IntegerField(null=True, blank=True)
    
    # Learning Preferences
    preferred_learning_time = models.TimeField(blank=True, null=True)
    learning_style = models.CharField(max_length=50, blank=True, null=True)
    native_language = models.CharField(max_length=50, default='urdu')
    
    # Goals
    target_group = models.IntegerField(default=10)  # Target group number
    target_date = models.DateField(blank=True, null=True)
    daily_goal_levels = models.IntegerField(default=1)  # Levels per day
    
    # Statistics
    total_study_time = models.PositiveIntegerField(default=0)  # in minutes
    average_session_time = models.PositiveIntegerField(default=0)  # in minutes
    favorite_exercise_type = models.CharField(max_length=50, blank=True, null=True)
    
    # Social Features
    bio = models.TextField(blank=True, null=True, max_length=500)
    is_public_profile = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.username}'s Profile"