from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


class Student(models.Model):
    # --- Basic Information ---
    name = models.CharField(max_length=200, help_text="Student's full name")
    father_name = models.CharField(max_length=200, default="Unknown", help_text="Father's name")
    
    # --- Academic Details ---
    GRADE_CHOICES = [
        ('nursery', 'Nursery'),
        ('kg1', 'KG-1'),
        ('kg2', 'KG-2'),
        ('1', 'Grade 1'),
        ('2', 'Grade 2'),
        ('3', 'Grade 3'),
        ('4', 'Grade 4'),
        ('5', 'Grade 5'),
        ('6', 'Grade 6'),
        ('7', 'Grade 7'),
        ('8', 'Grade 8'),
        ('9', 'Grade 9'),
        ('10', 'Grade 10'),
        ('11', 'Grade 11'),
        ('12', 'Grade 12'),
    ]
    
    SECTION_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
        ('E', 'E'),
    ]
    
    grade = models.CharField(max_length=10, choices=GRADE_CHOICES, default='1', help_text="Student's grade")
    section = models.CharField(max_length=1, choices=SECTION_CHOICES, default='A', help_text="Student's section")
    
    # --- Campus and Class Teacher ---
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
        help_text="Class teacher (auto-assigned based on grade and section)"
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
        # Generate student ID if not provided
        if not self.student_id or self.student_id == "TEMP-ID":
            try:
                # Get campus code (C01, C02, etc.)
                campus_code = f"C{self.campus.id:02d}" if self.campus else "C01"
                
                # Default to morning shift
                shift_code = "M"
                
                # Get grade code
                grade_code = self.grade.replace('grade', '').replace('kg', 'KG').upper()
                if grade_code == 'NURSERY':
                    grade_code = 'NUR'
                elif grade_code == 'KG-1':
                    grade_code = 'KG1'
                elif grade_code == 'KG-2':
                    grade_code = 'KG2'
                elif grade_code.isdigit():
                    grade_code = f"G{grade_code.zfill(2)}"
                
                # Get section code
                section_code = self.section
                
                # Get next serial number for this combination
                from django.db.models import Max
                last_student = Student.objects.filter(
                    campus=self.campus,
                    grade=self.grade,
                    section=self.section
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
                
                # Generate student ID: C01-M-G01-A-0001
                self.student_id = f"{campus_code}-{shift_code}-{grade_code}-{section_code}-{next_serial:04d}"
                
            except Exception as e:
                print(f"Error generating student ID: {str(e)}")
                # Fallback ID
                self.student_id = f"C01-M-{self.pk or 0:04d}"
        
        # Save the student first
        super().save(*args, **kwargs)
        
        # Create or update User account for student
        self._create_or_update_user_account()
        
        # Auto-assign class teacher based on grade and section
        if not self.class_teacher and self.campus:
            try:
                from classes.models import ClassRoom
                classroom = ClassRoom.objects.filter(
                    grade__name__icontains=self.grade,
                    section=self.section,
                    grade__campus=self.campus
                ).first()
                
                if classroom and classroom.class_teacher:
                    self.class_teacher = classroom.class_teacher
            except Exception as e:
                print(f"Error auto-assigning class teacher: {str(e)}")
    
    def _create_or_update_user_account(self):
        """Create or update User account for student"""
        try:
            from users.models import User
            
            # Create username from student_id
            username = f"student_{self.student_id}"
            
            # Create or update user
            user, created = User.objects.get_or_create(
                student_id=self.student_id,
                defaults={
                    'username': username,
                    'first_name': self.name.split()[0] if self.name else '',
                    'last_name': ' '.join(self.name.split()[1:]) if len(self.name.split()) > 1 else '',
                    'role': 'student',
                    'is_active': self.is_active,
                    'is_verified': True,  # Students are auto-verified
                }
            )
            
            if not created:
                # Update existing user
                user.username = username
                user.first_name = self.name.split()[0] if self.name else ''
                user.last_name = ' '.join(self.name.split()[1:]) if len(self.name.split()) > 1 else ''
                user.is_active = self.is_active
                user.save()
            
            print(f"User account {'created' if created else 'updated'} for student {self.student_id}")
            
        except Exception as e:
            print(f"Error creating/updating user account for student {self.student_id}: {str(e)}")

    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
        ordering = ['-created_at']
        unique_together = ['campus', 'grade', 'section', 'student_id']