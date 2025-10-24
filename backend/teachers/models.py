from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password, check_password


class Teacher(models.Model):
    # --- Basic Information ---
    name = models.CharField(max_length=200, default="Unknown Teacher", help_text="Teacher's full name")
    father_name = models.CharField(max_length=200, default="Unknown", help_text="Father's name")
    
    # --- Shift Information ---
    SHIFT_CHOICES = [
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
    ]
    
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='morning', help_text="Teacher's shift (Morning/Afternoon)")
    
    # --- Academic Assignment ---
    # Teachers are not assigned to specific classes
    # They are just added with basic info and can be assigned to grades later
    
    # English Coordinator relationship
    english_coordinator = models.ForeignKey(
        'english_coordinator.EnglishCoordinator',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervised_teachers',
        help_text="English Coordinator supervising this teacher"
    )
    
    # Teacher type
    TEACHER_TYPE_CHOICES = [
        ('regular', 'Regular Teacher'),
        ('english_head', 'English Head'),
    ]
    teacher_type = models.CharField(
        max_length=20,
        choices=TEACHER_TYPE_CHOICES,
        default='regular',
        help_text="Type of teacher"
    )
    
    # --- Campus ---
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='teachers',
        help_text="Campus where teacher works"
    )
    
    # --- Contact ---
    email = models.EmailField(unique=True, help_text="Teacher's email address")
    
    # --- Authentication ---
    password = models.CharField(max_length=128, default="password123", help_text="Teacher's password")
    
    # --- Auto-generated ID ---
    teacher_id = models.CharField(
        max_length=20, 
        unique=True, 
        editable=False,
        default="TEMP-TEACHER-ID",
        help_text="Auto-generated teacher ID"
    )
    
    # --- System Fields ---
    is_active = models.BooleanField(default=True, help_text="Is teacher active?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Hash password if it's plain text (for new teachers or password changes)
        if self.password and not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        
        # Generate teacher ID if not provided
        if not self.teacher_id or self.teacher_id == "TEMP-TEACHER-ID":
            try:
                # Get campus code (C01, C02, etc.)
                campus_code = f"C{self.campus.id:02d}" if self.campus else "C01"
                
                # Get shift code
                shift_code = 'M' if self.shift == 'morning' else 'A'
                
                # Get current year
                from datetime import datetime
                year = str(datetime.now().year)[-2:]
                
                # Get next teacher number for this campus and shift
                from django.db.models import Max
                last_teacher = Teacher.objects.filter(
                    campus=self.campus,
                    shift=self.shift
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
                
                # Generate teacher ID: C01-M-T-001
                self.teacher_id = f"{campus_code}-{shift_code}-T-{next_number:03d}"
                
            except Exception as e:
                print(f"Error generating teacher ID: {str(e)}")
                # Fallback ID
                self.teacher_id = f"C01-T-{self.pk or 0:03d}"

        super().save(*args, **kwargs)
        
        # Create or update User account for teacher
        self._create_or_update_user_account()

    def check_password(self, raw_password):
        """Check if raw password matches hashed password"""
        return check_password(raw_password, self.password)
    
    def set_password(self, raw_password):
        """Set password in hashed form"""
        self.password = make_password(raw_password)

    def _create_or_update_user_account(self):
        """Create or update User account for teacher"""
        try:
            from users.models import User
            
            # Create username from email
            username = f"teacher_{self.email.split('@')[0]}"
            
            # Create or update user
            user, created = User.objects.get_or_create(
                email=self.email,
                defaults={
                    'username': username,
                    'first_name': self.name.split()[0] if self.name else '',
                    'last_name': ' '.join(self.name.split()[1:]) if len(self.name.split()) > 1 else '',
                    'role': 'teacher',
                    'is_active': self.is_active,
                    'is_verified': True,  # Teachers are auto-verified
                }
            )
            
            if not created:
                # Update existing user
                user.username = username
                user.first_name = self.name.split()[0] if self.name else ''
                user.last_name = ' '.join(self.name.split()[1:]) if len(self.name.split()) > 1 else ''
                user.is_active = self.is_active
                user.save()
            
            print(f"User account {'created' if created else 'updated'} for teacher {self.email}")
            
        except Exception as e:
            print(f"Error creating/updating user account for teacher {self.email}: {str(e)}")

    def __str__(self):
        return f"{self.name} ({self.teacher_id or 'No ID'})"

    class Meta:
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"
        ordering = ['-created_at']


# Signal to delete User account when Teacher is deleted
@receiver(post_delete, sender=Teacher)
def delete_teacher_user_account(sender, instance, **kwargs):
    """Delete User account when Teacher is deleted"""
    try:
        from users.models import User
        user = User.objects.filter(email=instance.email).first()
        if user:
            user.delete()
            print(f"User account deleted for teacher {instance.email}")
    except Exception as e:
        print(f"Error deleting user account for teacher {instance.email}: {str(e)}")