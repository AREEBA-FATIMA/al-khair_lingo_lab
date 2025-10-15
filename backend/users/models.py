from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator


class UserManager(BaseUserManager):
    """Custom user manager for our User model"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user"""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'admin')
        extra_fields.setdefault('is_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class StudentList(models.Model):
    """Pre-defined list of students who can register"""
    student_id = models.CharField(
        max_length=20,
        unique=True,
        validators=[RegexValidator(
            regex=r'^[A-Z0-9]+$',
            message='Student ID must contain only uppercase letters and numbers'
        )],
        help_text="Unique student ID (e.g., STU001, 2024A001)"
    )
    full_name = models.CharField(max_length=255, help_text="Student's full name")
    email = models.EmailField(blank=True, null=True, help_text="Optional email")
    class_name = models.CharField(max_length=100, blank=True, help_text="Class/Grade")
    school_name = models.CharField(max_length=255, blank=True, help_text="School name")
    is_active = models.BooleanField(default=True, help_text="Is student active?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['student_id']
        verbose_name = 'Student List'
        verbose_name_plural = 'Student List'
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.student_id} - {self.full_name}"


class TeacherList(models.Model):
    """Pre-defined list of teachers who can register"""
    email = models.EmailField(unique=True, help_text="Teacher's email address")
    full_name = models.CharField(max_length=255, help_text="Teacher's full name")
    subject = models.CharField(max_length=100, blank=True, help_text="Subject taught")
    department = models.CharField(max_length=100, blank=True, help_text="Department")
    school_name = models.CharField(max_length=255, blank=True, help_text="School name")
    is_active = models.BooleanField(default=True, help_text="Is teacher active?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['email']
        verbose_name = 'Teacher List'
        verbose_name_plural = 'Teacher List'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.email} - {self.full_name}"


class DonorList(models.Model):
    """Pre-defined list of donors who can register"""
    email = models.EmailField(unique=True, help_text="Donor's email address")
    full_name = models.CharField(max_length=255, help_text="Donor's full name")
    organization = models.CharField(max_length=255, blank=True, help_text="Organization name")
    contact_number = models.CharField(max_length=20, blank=True, help_text="Contact number")
    is_active = models.BooleanField(default=True, help_text="Is donor active?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['email']
        verbose_name = 'Donor List'
        verbose_name_plural = 'Donor List'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.email} - {self.full_name}"


class User(AbstractUser):
    """
    Custom User model with 4 types: student, teacher, admin, donor
    """
    USER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
        ('donor', 'Donor'),
    ]
    
    # Basic Information
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='student',
        help_text="Type of user"
    )
    
    # Student-specific fields
    student_id = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        unique=True,
        help_text="Student ID (for students only)"
    )
    student_list_entry = models.ForeignKey(
        StudentList,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='registered_student',
        help_text="Reference to student list entry"
    )
    
    # Teacher-specific fields
    teacher_list_entry = models.ForeignKey(
        TeacherList,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='registered_teacher',
        help_text="Reference to teacher list entry"
    )
    
    # Donor-specific fields
    donor_list_entry = models.ForeignKey(
        DonorList,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='registered_donor',
        help_text="Reference to donor list entry"
    )
    
    # Profile Information
    full_name = models.CharField(max_length=255, default="Unknown User", help_text="Full name")
    phone_number = models.CharField(max_length=15, blank=True, help_text="Phone number")
    profile_picture = models.ImageField(
        upload_to='profiles/',
        blank=True,
        null=True,
        help_text="Profile picture"
    )
    
    # Learning Progress (for students)
    current_streak = models.PositiveIntegerField(default=0, help_text="Current learning streak")
    longest_streak = models.PositiveIntegerField(default=0, help_text="Longest learning streak")
    total_xp = models.PositiveIntegerField(default=0, help_text="Total XP earned")
    lessons_completed = models.PositiveIntegerField(default=0, help_text="Lessons completed")
    vocabulary_learned = models.PositiveIntegerField(default=0, help_text="Vocabulary learned")
    
    # Preferences
    daily_goal_minutes = models.PositiveIntegerField(default=15, help_text="Daily goal in minutes")
    notifications_enabled = models.BooleanField(default=True, help_text="Enable notifications")
    sound_effects_enabled = models.BooleanField(default=True, help_text="Enable sound effects")
    email_notifications = models.BooleanField(default=True, help_text="Enable email notifications")
    
    # Profile Information (moved from UserProfile)
    bio = models.TextField(blank=True, max_length=500, help_text="User bio")
    native_language = models.CharField(max_length=50, default='urdu', help_text="Native language")
    learning_style = models.CharField(max_length=50, blank=True, help_text="Learning style preference")
    target_level = models.PositiveIntegerField(default=10, help_text="Target level to achieve")
    is_public_profile = models.BooleanField(default=False, help_text="Make profile public")
    
    # Status
    is_verified = models.BooleanField(default=False, help_text="Is user verified?")
    is_active = models.BooleanField(default=True, help_text="Is user active?")
    
    # Timestamps
    last_active = models.DateTimeField(default=timezone.now, help_text="Last active time")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Remove default username field and use email as primary identifier
    username = None
    email = models.EmailField(unique=True, help_text="Email address")
    
    # Custom manager
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_type', 'full_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['user_type']),
            models.Index(fields=['student_id']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        if self.user_type == 'student':
            return f"Student: {self.student_id} - {self.full_name}"
        return f"{self.get_user_type_display()}: {self.email} - {self.full_name}"
    
    def get_display_name(self):
        """Get display name for the user"""
        return self.full_name or self.email
    
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
        if self.user_type != 'student':
            return 0
        
        # Simple level calculation based on XP
        current_level = (self.total_xp // 100) + 1
        current_level_xp = self.total_xp % 100
        next_level_xp = 100
        
        progress = (current_level_xp / next_level_xp) * 100
        return min(100, max(0, progress))
    
    def can_login_with_password(self):
        """Check if user can login with password"""
        return self.user_type in ['admin', 'teacher', 'donor']
    
    def can_login_with_student_id(self):
        """Check if user can login with student ID"""
        return self.user_type == 'student' and self.student_id




class LoginLog(models.Model):
    """
    Track user login attempts and methods
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='login_logs'
    )
    login_method = models.CharField(
        max_length=20,
        choices=[
            ('student_id', 'Student ID'),
            ('email', 'Email'),
        ],
        help_text="Method used for login"
    )
    ip_address = models.GenericIPAddressField(
        blank=True,
        null=True,
        help_text="IP address of login"
    )
    user_agent = models.TextField(
        blank=True,
        help_text="User agent string"
    )
    success = models.BooleanField(
        default=True,
        help_text="Was login successful?"
    )
    attempted_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When login was attempted"
    )
    
    class Meta:
        ordering = ['-attempted_at']
        verbose_name = 'Login Log'
        verbose_name_plural = 'Login Logs'
        indexes = [
            models.Index(fields=['user', 'attempted_at']),
            models.Index(fields=['login_method']),
            models.Index(fields=['success']),
        ]
    
    def __str__(self):
        status = "Success" if self.success else "Failed"
        return f"{self.user.get_display_name()} - {self.login_method} - {status}"