from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password, check_password
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


class Student(models.Model):
    # --- Basic Information ---
    name = models.CharField(max_length=200, help_text="Student's full name")
    father_name = models.CharField(max_length=200, default="Unknown", help_text="Father's name")
    
    # --- Academic Details ---
    # Static shift choices for code generation only
    SHIFT_CHOICES = [
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
    ]
    
    # Static grade choices
    GRADE_CHOICES = [
        ('Nursery', 'Nursery'),
        ('KG-I', 'KG-I'),
        ('KG-II', 'KG-II'),
        ('Grade 1', 'Grade 1'),
        ('Grade 2', 'Grade 2'),
        ('Grade 3', 'Grade 3'),
        ('Grade 4', 'Grade 4'),
        ('Grade 5', 'Grade 5'),
        ('Grade 6', 'Grade 6'),
        ('Grade 7', 'Grade 7'),
        ('Grade 8', 'Grade 8'),
        ('Grade 9', 'Grade 9'),
        ('Grade 10', 'Grade 10'),
    ]
    
    # Static choices - no dynamic fields
    grade = models.CharField(max_length=50, choices=GRADE_CHOICES, help_text="Student's grade")
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='morning', help_text="Student's shift (Morning/Afternoon)", blank=True, null=True)
    
    # --- Campus and Class Assignment ---
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='students',
        help_text="Campus where student is enrolled"
    )
    
    class_teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_students',
        help_text="Class teacher (auto-assigned from campus and grade)"
    )
    
    # --- Authentication ---
    password = models.CharField(max_length=128, help_text="Student's password")
    
    # --- Auto-generated ID ---
    student_id = models.CharField(
        max_length=20, 
        unique=True, 
        editable=False,
        default="TEMP-ID",
        help_text="Auto-generated student ID (C01-M-grade-section-serial)"
    )
    
    # --- System Fields ---
    is_active = models.BooleanField(default=True, help_text="Is student active?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.student_id or 'No ID'})"
    
    def save(self, *args, **kwargs):
        # Hash password if it's plain text (for new students or password changes)
        if self.password and not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        
        # Generate student ID if not provided
        if not self.student_id or self.student_id == "TEMP-ID":
            try:
                # Get campus code (C01, C02, etc.)
                campus_code = self.campus.campus_code if self.campus else "C01"
                
                # Get shift code
                shift_code = self.shift[0].upper() if self.shift else 'M'  # M for morning, A for afternoon
                
                # Get grade code from static grade field
                grade_code = self.grade.replace('Grade', '').replace('grade', '').strip()
                if grade_code.lower() == 'nursery':
                    grade_code = 'NUR'
                elif 'kg' in grade_code.lower():
                    grade_code = grade_code.upper()
                elif grade_code.isdigit():
                    grade_code = f"G{grade_code.zfill(2)}"
                else:
                    grade_code = f"G{grade_code.zfill(2)}"
                
                # Get next serial number for this combination
                from django.db.models import Max
                last_student = Student.objects.filter(
                    campus=self.campus,
                    grade=self.grade,
                    shift=self.shift
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
                
                # Generate student ID: C01-M-G01-0001 (no section)
                self.student_id = f"{campus_code}-{shift_code}-{grade_code}-{next_serial:04d}"
                
            except Exception as e:
                print(f"Error generating student ID: {str(e)}")
                # Fallback ID
                self.student_id = f"C01-M-{self.pk or 0:04d}"
        
        # Save the student first
        super().save(*args, **kwargs)
    
    def check_password(self, raw_password):
        """Check if raw password matches hashed password"""
        return check_password(raw_password, self.password)
    
    def set_password(self, raw_password):
        """Set password in hashed form"""
        self.password = make_password(raw_password)
    
    def _assign_english_teacher(self):
        """Auto-assign English teacher based on campus and grade"""
        try:
            from classes.models import Grade
            
            # Find matching grade in the same campus
            grade_obj = Grade.objects.filter(
                campus=self.campus,
                name=self.grade,
                shift=self.shift
            ).first()
            
            if grade_obj and grade_obj.english_teacher:
                # Assign the English teacher from the grade
                self.class_teacher = grade_obj.english_teacher
                # Don't save here to avoid transaction conflicts
                print(f"Assigned English teacher {grade_obj.english_teacher.name} to student {self.student_id}")
            else:
                print(f"No English teacher assigned to {self.grade} in {self.campus.campus_name} ({self.shift})")
                print(f"Please assign an English teacher to this grade first.")
                
        except Exception as e:
            print(f"Error assigning English teacher: {str(e)}")
    
    def _create_or_update_user_account(self):
        """Create or update User account for student"""
        try:
            from users.models import User
            
            # Create username from student_id
            username = f"student_{self.student_id}"
            
            # Create or update user with flag to prevent signal loop
            user_data = {
                'username': username,
                'first_name': self.name.split()[0] if self.name else '',
                'last_name': ' '.join(self.name.split()[1:]) if len(self.name.split()) > 1 else '',
                'role': 'student',
                'is_active': self.is_active,
                'is_verified': True,  # Students are auto-verified
                'student_id': self.student_id,  # Add student_id field
                'password': self.password,  # Add password field
            }
            
            user, created = User.objects.get_or_create(
                student_id=self.student_id,
                defaults=user_data
            )
            
            if not created:
                # Update existing user - don't save to avoid transaction conflicts
                user.username = username
                user.first_name = self.name.split()[0] if self.name else ''
                user.last_name = ' '.join(self.name.split()[1:]) if len(self.name.split()) > 1 else ''
                user.is_active = self.is_active
                # user.save()  # Commented out to avoid transaction conflicts
            
            print(f"User account {'created' if created else 'updated'} for student {self.student_id}")
            
        except Exception as e:
            print(f"Error creating/updating user account for student {self.student_id}: {str(e)}")

    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
        ordering = ['-created_at']
        unique_together = ['campus', 'grade', 'shift', 'student_id']


# Signal to handle post-save operations for Student
@receiver(post_save, sender=Student)
def handle_student_post_save(sender, instance, created, **kwargs):
    """Handle post-save operations for Student"""
    try:
        # Auto-assign English teacher based on campus and grade
        if not instance.class_teacher:
            instance._assign_english_teacher()
            if instance.class_teacher:
                # Save the teacher assignment
                Student.objects.filter(pk=instance.pk).update(class_teacher=instance.class_teacher)
        
        # Create User account when Student is created
        if created:
            instance._create_or_update_user_account()
    except Exception as e:
        print(f"Error in post_save signal for student {instance.student_id}: {str(e)}")

# Signal to delete User account when Student is deleted
@receiver(post_delete, sender=Student)
def delete_student_user_account(sender, instance, **kwargs):
    """Delete User account when Student is deleted"""
    try:
        from users.models import User
        user = User.objects.filter(student_id=instance.student_id).first()
        if user:
            user.delete()
            print(f"User account deleted for student {instance.student_id}")
    except Exception as e:
        print(f"Error deleting user account for student {instance.student_id}: {str(e)}")