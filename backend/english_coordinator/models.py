from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password, check_password


class EnglishCoordinator(models.Model):
    """
    English Coordinator model - Independent like Teacher model
    """
    # --- Basic Information ---
    name = models.CharField(max_length=200, default="Unknown Coordinator", help_text="Coordinator's full name")
    last_name = models.CharField(max_length=200, default="Unknown", help_text="Coordinator's last name")
    
    # --- Contact ---
    email = models.EmailField(unique=True, default="temp@coordinator.com", help_text="Coordinator's email address")
    
    # --- Authentication ---
    password = models.CharField(max_length=128, default="password123", help_text="Coordinator's password")
    
    # --- Auto-generated ID ---
    coordinator_id = models.CharField(
        max_length=20, 
        unique=True, 
        editable=False,
        default="TEMP-COORDINATOR-ID",
        help_text="Auto-generated coordinator ID"
    )
    
    # --- Supervision scope ---
    supervises_all_grades = models.BooleanField(
        default=True,
        help_text="Can supervise all grades in campus"
    )
    
    # --- Permissions ---
    can_assign_teachers = models.BooleanField(
        default=True,
        help_text="Can assign teachers to grades"
    )
    
    can_view_all_progress = models.BooleanField(
        default=True,
        help_text="Can view all student progress"
    )
    
    can_manage_content = models.BooleanField(
        default=True,
        help_text="Can manage English learning content"
    )
    
    can_reassign_teachers = models.BooleanField(
        default=True,
        help_text="Can reassign teachers between grades"
    )
    
    # --- System Fields ---
    is_active = models.BooleanField(default=True, help_text="Is coordinator active?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Hash password if it's plain text (for new coordinators or password changes)
        if self.password and not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        
        # Generate coordinator ID if not provided
        if not self.coordinator_id or self.coordinator_id == "TEMP-COORDINATOR-ID":
            try:
                # Get next coordinator number
                from django.db.models import Max
                last_coordinator = EnglishCoordinator.objects.exclude(
                    coordinator_id__isnull=True
                ).aggregate(
                    max_id=Max('coordinator_id')
                )['max_id']
                
                if last_coordinator and '-' in last_coordinator:
                    try:
                        last_number = int(last_coordinator.split('-')[-1])
                    except:
                        last_number = 0
                else:
                    last_number = 0
                
                next_number = last_number + 1
                
                # Generate coordinator ID: EC-001
                self.coordinator_id = f"EC-{next_number:03d}"
                
            except Exception as e:
                print(f"Error generating coordinator ID: {str(e)}")
                # Fallback ID
                self.coordinator_id = f"EC-{self.pk or 0:03d}"

        super().save(*args, **kwargs)
        
        # Create or update User account for coordinator
        self._create_or_update_user_account()

    def check_password(self, raw_password):
        """Check if raw password matches hashed password"""
        return check_password(raw_password, self.password)
    
    def set_password(self, raw_password):
        """Set password in hashed form"""
        self.password = make_password(raw_password)

    def _create_or_update_user_account(self):
        """Create or update User account for coordinator"""
        try:
            from users.models import User
            
            # Create username from email
            username = f"coordinator_{self.email.split('@')[0]}"
            
            # Create or update user
            user, created = User.objects.get_or_create(
                email=self.email,
                defaults={
                    'username': username,
                    'first_name': self.name.split()[0] if self.name else '',
                    'last_name': ' '.join(self.name.split()[1:]) if len(self.name.split()) > 1 else '',
                    'role': 'english_coordinator',
                    'is_active': self.is_active,
                    'is_verified': True,  # Coordinators are auto-verified
                }
            )
            
            if not created:
                # Update existing user
                user.username = username
                user.first_name = self.name.split()[0] if self.name else ''
                user.last_name = ' '.join(self.name.split()[1:]) if len(self.name.split()) > 1 else ''
                user.is_active = self.is_active
                user.save()
            
            print(f"User account {'created' if created else 'updated'} for coordinator {self.email}")
            
        except Exception as e:
            print(f"Error creating/updating user account for coordinator {self.email}: {str(e)}")

    def __str__(self):
        return f"{self.name} ({self.coordinator_id or 'No ID'})"
    
    def get_supervised_teachers(self):
        """Get all teachers supervised by this coordinator"""
        from teachers.models import Teacher
        return Teacher.objects.filter(english_coordinator=self)
    
    def get_supervised_students(self):
        """Get all students supervised by this coordinator"""
        from students.models import Student
        # Get all students from teachers supervised by this coordinator
        supervised_teachers = self.get_supervised_teachers()
        return Student.objects.filter(class_teacher__in=supervised_teachers)
    
    def get_grade_performance(self):
        """Get performance data for grades supervised by this coordinator"""
        from classes.models import Grade
        from students.models import Student
        from progress.models import LevelCompletion
        
        # Get grades from supervised teachers
        supervised_teachers = self.get_supervised_teachers()
        grades = Grade.objects.filter(english_teacher__in=supervised_teachers)
        
        performance_data = []
        for grade in grades:
            students = Student.objects.filter(
                grade=grade.name,
                shift=grade.shift,
                class_teacher__in=supervised_teachers
            )
            
            # Get completion data for students in this grade
            student_ids = students.values_list('student_id', flat=True)
            completions = LevelCompletion.objects.filter(
                student_id__in=student_ids
            )
            
            performance_data.append({
                'grade': grade,
                'total_students': students.count(),
                'active_students': students.filter(is_active=True).count(),
                'total_completions': completions.count(),
                'english_teacher': grade.english_teacher,
            })
        
        return performance_data
    
    class Meta:
        verbose_name = "English Coordinator"
        verbose_name_plural = "English Coordinators"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['coordinator_id']),
        ]


# Signal to delete User account when EnglishCoordinator is deleted
@receiver(post_delete, sender=EnglishCoordinator)
def delete_coordinator_user_account(sender, instance, **kwargs):
    """Delete User account when EnglishCoordinator is deleted"""
    try:
        from users.models import User
        user = User.objects.filter(email=instance.email).first()
        if user:
            user.delete()
            print(f"User account deleted for coordinator {instance.email}")
    except Exception as e:
        print(f"Error deleting user account for coordinator {instance.email}: {str(e)}")