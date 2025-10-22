from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
import secrets
import string


class UserManager(BaseUserManager):
    """Custom user manager for our User model"""
    
    def create_user(self, email=None, password=None, **extra_fields):
        """Create and return a regular user"""
        # For students, email is optional
        if email:
            email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        
        # Display user info after creation
        print(f"\nUser created successfully!")
        print(f"   Username: {user.username}")
        print(f"   Role: {user.get_role_display()}")
        if user.email:
            print(f"   Email: {user.email}")
        if user.student_id:
            print(f"   Student ID: {user.student_id}")
        print(f"   Login with: {'Email' if user.email else 'Student ID' if user.student_id else 'Username'}")
        print()
        
        return user
    
    def create_superuser(self, email=None, password=None, **extra_fields):
        """Create and return a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        # For superuser (admin), email is optional
        if email:
            email = self.normalize_email(email)
        
        return self.create_user(email, password, **extra_fields)
    
    def create_student_user(self, username, password=None, **extra_fields):
        """Create a student user (no email required)"""
        extra_fields.setdefault('role', 'student')
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email=None, password=password, username=username, **extra_fields)
    
    def create_teacher_user(self, email, password=None, **extra_fields):
        """Create a teacher user (email required)"""
        extra_fields.setdefault('role', 'teacher')
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, password, **extra_fields)
    
    def create_english_coordinator_user(self, email, password=None, **extra_fields):
        """Create an English Coordinator user (email required)"""
        extra_fields.setdefault('role', 'english_coordinator')
        extra_fields.setdefault('is_verified', True)
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
        ('english_coordinator', 'English Coordinator'),
    ]
    
    # Override default fields
    email = models.EmailField(unique=True, blank=True, null=True)
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
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['role']
    
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
    
    def is_english_coordinator(self):
        return self.role == 'english_coordinator'
    
    def can_login_with_password(self):
        """Check if user can login with password"""
        return self.role in ['admin', 'teacher', 'english_coordinator']
    
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
            ('student_name', 'Student Name'),
            ('student_username', 'Student Username'),
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


# DISABLED: This signal causes infinite loop with Student/Teacher models
# Student and Teacher models now handle User creation themselves


class PasswordResetToken(models.Model):
    """Model for managing password reset tokens"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens',
        help_text="User requesting password reset"
    )
    
    token = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique reset token"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When token was created"
    )
    
    expires_at = models.DateTimeField(
        help_text="When token expires"
    )
    
    used = models.BooleanField(
        default=False,
        help_text="Whether token has been used"
    )
    
    used_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When token was used"
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of reset request"
    )
    
    user_agent = models.TextField(
        blank=True,
        help_text="User agent string"
    )
    
    class Meta:
        verbose_name = "Password Reset Token"
        verbose_name_plural = "Password Reset Tokens"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['used']),
        ]
    
    def __str__(self):
        return f"Reset token for {self.user.email} - {'Used' if self.used else 'Active'}"
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = self.generate_token()
        
        if not self.expires_at:
            # Token expires in 1 hour
            self.expires_at = timezone.now() + timezone.timedelta(hours=1)
        
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_token():
        """Generate a secure random token"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(64))
    
    def is_valid(self):
        """Check if token is valid (not used and not expired)"""
        return not self.used and timezone.now() < self.expires_at
    
    def mark_as_used(self):
        """Mark token as used"""
        self.used = True
        self.used_at = timezone.now()
        self.save()
    
    @classmethod
    def create_for_user(cls, user, ip_address=None, user_agent=None):
        """Create a new reset token for user"""
        # Invalidate existing tokens for this user
        cls.objects.filter(user=user, used=False).update(used=True)
        
        # Create new token
        return cls.objects.create(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    @classmethod
    def get_valid_token(cls, token):
        """Get a valid token by token string"""
        try:
            reset_token = cls.objects.get(token=token)
            if reset_token.is_valid():
                return reset_token
        except cls.DoesNotExist:
            pass
        return None


class PasswordChangeLog(models.Model):
    """Model for logging password changes"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_change_logs',
        help_text="User who changed password"
    )
    
    changed_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When password was changed"
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of password change"
    )
    
    user_agent = models.TextField(
        blank=True,
        help_text="User agent string"
    )
    
    change_type = models.CharField(
        max_length=20,
        choices=[
            ('reset', 'Password Reset'),
            ('change', 'Password Change'),
            ('admin_reset', 'Admin Reset'),
        ],
        default='change',
        help_text="Type of password change"
    )
    
    class Meta:
        verbose_name = "Password Change Log"
        verbose_name_plural = "Password Change Logs"
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['user', 'changed_at']),
            models.Index(fields=['change_type']),
        ]
    
    def __str__(self):
        return f"Password {self.change_type} for {self.user.email} at {self.changed_at}"