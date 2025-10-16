from django.db import models

# Choices
GENDER_CHOICES = [
    ("male", "Male"),
    ("female", "Female"),
    ("other", "Other"),
]

MARITAL_STATUS_CHOICES = [
    ("single", "Single"),
    ("married", "Married"),
    ("divorced", "Divorced"),
    ("widowed", "Widowed"),
]

SAVE_STATUS_CHOICES = [
    ("draft", "Draft"),
    ("final", "Final"),
]


# TeacherRole model removed - using current_role_title field in Teacher model instead
class Teacher(models.Model):
    # Personal Information
    full_name = models.CharField(max_length=150)
    dob = models.DateField(verbose_name="Date of Birth")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    permanent_address = models.TextField()
    current_address = models.TextField(blank=True, null=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, blank=True, null=True)
    cnic = models.CharField(max_length=15, unique=True, blank=True, null=True)

    # Education Information
    education_level = models.CharField(max_length=100, blank=True, null=True)
    institution_name = models.CharField(max_length=200, blank=True, null=True)
    year_of_passing = models.IntegerField(blank=True, null=True)
    education_subjects = models.CharField(max_length=200, blank=True, null=True)
    education_grade = models.CharField(max_length=50, blank=True, null=True)
    
    # Additional Education Fields
    additional_education_level = models.CharField(max_length=100, blank=True, null=True)
    additional_institution_name = models.CharField(max_length=200, blank=True, null=True)
    additional_year_of_passing = models.IntegerField(blank=True, null=True)
    additional_education_subjects = models.CharField(max_length=200, blank=True, null=True)
    additional_education_grade = models.CharField(max_length=50, blank=True, null=True)
    
    # Experience Information
    previous_institution_name = models.CharField(max_length=200, blank=True, null=True)
    previous_position = models.CharField(max_length=150, blank=True, null=True)
    experience_from_date = models.DateField(blank=True, null=True)
    experience_to_date = models.DateField(blank=True, null=True)
    experience_subjects_classes_taught = models.CharField(max_length=200, blank=True, null=True)
    previous_responsibilities = models.TextField(blank=True, null=True)
    total_experience_years = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    # Additional Experience Fields
    additional_institution_name_exp = models.CharField(max_length=200, blank=True, null=True)
    additional_position = models.CharField(max_length=150, blank=True, null=True)
    additional_experience_from_date = models.DateField(blank=True, null=True)
    additional_experience_to_date = models.DateField(blank=True, null=True)
    additional_experience_subjects_classes = models.CharField(max_length=200, blank=True, null=True)
    additional_responsibilities = models.TextField(blank=True, null=True)
    
    # Current Role Information
    joining_date = models.DateField(blank=True, null=True)
    current_role_title = models.CharField(max_length=150, blank=True, null=True)
    current_campus = models.CharField(max_length=200, blank=True, null=True)
    
    # Shift Information
    shift = models.CharField(
        max_length=20, 
        choices=[
            ('morning', 'Morning'),
            ('afternoon', 'Afternoon'),
            ('evening', 'Evening'),
        ],
        default='morning',
        help_text="Teacher's working shift"
    )
    
    current_subjects = models.CharField(max_length=200, blank=True, null=True)
    current_classes_taught = models.CharField(max_length=200, blank=True, null=True)
    current_extra_responsibilities = models.TextField(blank=True, null=True)
    role_start_date = models.DateField(blank=True, null=True)
    role_end_date = models.DateField(blank=True, null=True)
    is_currently_active = models.BooleanField(default=True)
    
    # Auto Generated Fields
    teacher_id = models.CharField(max_length=20, unique=True, editable=False, null=True, blank=True)
    teacher_code = models.CharField(max_length=20, unique=True, editable=False, null=True, blank=True)
    
    # System Fields
    save_status = models.CharField(max_length=10, choices=SAVE_STATUS_CHOICES, default="draft")
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    
    # Class Teacher Information
    is_class_teacher = models.BooleanField(default=False, help_text="Is this teacher a class teacher?")
    assigned_classroom = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_teacher',
        help_text="Classroom assigned to this class teacher"
    )
    
    def save(self, *args, **kwargs):
        # Auto-generate teacher_code if not provided
        if not self.teacher_code and self.current_campus:
            try:
                # Get campus number from current_campus (should be a Campus object)
                if hasattr(self.current_campus, 'id'):
                    campus_number = f"C{self.current_campus.id:02d}"
                else:
                    # Fallback if current_campus is a string
                    campus_number = "C01"
                
                # Use teacher's shift field
                shift = self.shift if self.shift else 'morning'
                shift_code = shift[:1].upper()  # M for morning, A for afternoon
                
                # Get year from joining date or current year
                if self.joining_date:
                    year = str(self.joining_date.year)[-2:]  # Last 2 digits
                else:
                    year = "25"  # 2025
                
                # Generate teacher code: C01-M-25-0194
                # Get next teacher number for this campus and shift
                from django.db.models import Max
                last_teacher = Teacher.objects.filter(
                    current_campus=self.current_campus,
                    shift=shift
                ).exclude(teacher_code__isnull=True).aggregate(
                    max_code=Max('teacher_code')
                )['max_code']
                
                if last_teacher and '-' in last_teacher:
                    try:
                        last_number = int(last_teacher.split('-')[-1])
                    except:
                        last_number = 0
                else:
                    last_number = 0
                
                next_number = last_number + 1
                self.teacher_code = f"{campus_number}-{shift_code}-{year}-{next_number:04d}"
                
            except Exception as e:
                print(f"Error generating teacher code: {str(e)}")
                # Fallback code
                self.teacher_code = f"C01-M-25-{self.pk or 0:04d}"
        
        # Auto-set class teacher status when classroom is assigned
        if self.assigned_classroom and not self.is_class_teacher:
            self.is_class_teacher = True
        elif not self.assigned_classroom and self.is_class_teacher:
            self.is_class_teacher = False
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.teacher_code or 'No Code'})"

    class Meta:
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"
        ordering = ['-date_created']