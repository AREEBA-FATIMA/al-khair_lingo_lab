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
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


# StudentList, TeacherList, DonorList models removed - now handled in separate apps


class User(AbstractUser):
    """
    Custom User model with role-based access control
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
        ('donor', 'Donor'),
    ]
    
    # Override default fields
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, default='temp_user')
    
    # Custom fields
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    has_changed_default_password = models.BooleanField(default=False)
    
    # Student-specific fields
    student_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    
    # System fields
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']
    
    # Custom manager
    objects = UserManager()
    
    class Meta:
        db_table = 'users_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['student_id']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    def get_role_display(self):
        return dict(self.ROLE_CHOICES).get(self.role, self.role)
    
    def get_display_name(self):
        """Get display name for the user"""
        return self.get_full_name() or self.email
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_teacher(self):
        return self.role == 'teacher'
    
    def is_student(self):
        return self.role == 'student'
    
    def is_donor(self):
        return self.role == 'donor'
    
    def can_login_with_password(self):
        """Check if user can login with password"""
        return self.role in ['admin', 'teacher']
    
    def can_login_with_student_id(self):
        """Check if user can login with student ID"""
        return self.role == 'student' and self.student_id




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
    failure_reason = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Reason for login failure"
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