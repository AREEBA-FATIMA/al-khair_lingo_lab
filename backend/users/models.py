from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
from django.db.models.signals import post_save
from django.dispatch import receiver


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
"""
@receiver(post_save, sender=User)
def create_student_or_teacher_profile(sender, instance, created, **kwargs):
    # Automatically create Student or Teacher profile when User is created
    if created:  # Only when user is first created
        if instance.role == 'student':
            # Create Student profile
            try:
                from students.models import Student
                from campus.models import Campus
                
                # Get default campus (C01)
                default_campus = Campus.objects.first()
                if not default_campus:
                    print("❌ No campus found! Please create a campus first.")
                    return
                
                # Generate student_id
                from django.db.models import Max
                last_student = Student.objects.filter(
                    campus=default_campus
                ).exclude(student_id__isnull=True).aggregate(
                    max_id=Max('student_id')
                )['max_id']
                
                if last_student and '-' in last_student:
                    try:
                        last_serial = int(last_student.split('-')[-1])
                    except:
                        last_serial = 0
                else:
                    last_serial = 0
                
                next_serial = last_serial + 1
                campus_code = f"C{default_campus.id:02d}"
                student_id = f"{campus_code}-M-G01-A-{next_serial:04d}"
                
                # Create Student
                student = Student.objects.create(
                    name=f"{instance.first_name} {instance.last_name}".strip(),
                    father_name="Unknown",
                    grade='1',
                    section='A',
                    campus=default_campus,
                    password=instance.password or 'student123',
                    student_id=student_id,
                    is_active=instance.is_active
                )
                
                # Update User with student_id
                instance.student_id = student_id
                instance.save()
                
                print(f"Student profile created: {student_id}")
                
            except Exception as e:
                print(f"Error creating student profile: {str(e)}")
        
        elif instance.role == 'teacher':
            # Create Teacher profile
            try:
                from teachers.models import Teacher
                from campus.models import Campus
                
                # Get default campus (C01)
                default_campus = Campus.objects.first()
                if not default_campus:
                    print("❌ No campus found! Please create a campus first.")
                    return
                
                # Generate teacher_id
                from django.db.models import Max
                last_teacher = Teacher.objects.filter(
                    campus=default_campus
                ).exclude(teacher_id__isnull=True).aggregate(
                    max_id=Max('teacher_id')
                )['max_id']
                
                if last_teacher and '-' in last_teacher:
                    try:
                        last_number = int(last_teacher.split('-')[-1])
                    except:
                        last_number = 0
                else:
                    last_number = 0
                
                next_number = last_number + 1
                campus_code = f"C{default_campus.id:02d}"
                teacher_id = f"{campus_code}-T-{next_number:03d}"
                
                # Create Teacher
                teacher = Teacher.objects.create(
                    name=f"{instance.first_name} {instance.last_name}".strip(),
                    father_name="Unknown",
                    email=instance.email or f"teacher{next_number}@school.com",
                    campus=default_campus,
                    teacher_id=teacher_id,
                    is_active=instance.is_active
                )
                
                print(f"Teacher profile created: {teacher_id}")
                
            except Exception as e:
                print(f"Error creating teacher profile: {str(e)}")
"""