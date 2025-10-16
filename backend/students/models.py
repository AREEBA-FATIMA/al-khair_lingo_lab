from django.db import models
from django.utils import timezone


class StudentManager(models.Manager):
    """Custom manager to exclude soft deleted students by default"""
    
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def with_deleted(self):
        """Return all students including soft deleted ones"""
        return super().get_queryset()
    
    def only_deleted(self):
        """Return only soft deleted students"""
        return super().get_queryset().filter(is_deleted=True)


class Student(models.Model):
    # Custom manager
    objects = StudentManager()
    
    # --- Personal Details ---
    photo = models.ImageField(upload_to="students/photos/", null=True, blank=True)
    name = models.CharField(max_length=200)
    gender = models.CharField(
        max_length=10,
        choices=(("male", "Male"), ("female", "Female")),
        null=True,
        blank=True
    )
    dob = models.DateField(null=True, blank=True)
    place_of_birth = models.CharField(max_length=200, null=True, blank=True)
    religion = models.CharField(max_length=100, null=True, blank=True)
    mother_tongue = models.CharField(max_length=100, null=True, blank=True)

    # --- Contact Details ---
    emergency_contact = models.CharField(max_length=20, null=True, blank=True)
    father_name = models.CharField(max_length=200, null=True, blank=True)
    father_cnic = models.CharField(max_length=20, null=True, blank=True)
    father_contact = models.CharField(max_length=20, null=True, blank=True)
    father_occupation = models.CharField(max_length=200, null=True, blank=True)

    guardian_name = models.CharField(max_length=200, null=True, blank=True)
    guardian_cnic = models.CharField(max_length=20, null=True, blank=True)
    guardian_occupation = models.CharField(max_length=200, null=True, blank=True)

    mother_name = models.CharField(max_length=200, null=True, blank=True)
    mother_cnic = models.CharField(max_length=20, null=True, blank=True)
    mother_status = models.CharField(
        max_length=20,
        choices=(("widowed", "Widowed"), ("divorced", "Divorced"), ("married", "Married")),
        null=True,
        blank=True
    )
    mother_contact = models.CharField(max_length=20, null=True, blank=True)
    mother_occupation = models.CharField(max_length=200, null=True, blank=True)

    zakat_status = models.CharField(
        max_length=20,
        choices=(("applicable", "Applicable"), ("not_applicable", "Not Applicable")),
        null=True,
        blank=True
    )

    address = models.TextField(null=True, blank=True)
    family_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    house_owned = models.BooleanField(default=False)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # --- Academic Details ---
    current_state = models.CharField(
        max_length=20,
        choices=(
            ("active", "Active"),
            ("inactive", "Inactive"),
        ),
        default="active"
    )

    # Campus and classroom info (you can adjust these based on your needs)
    campus = models.CharField(max_length=200, null=True, blank=True)
    classroom = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        help_text="Classroom where student is enrolled"
    )
    current_grade = models.CharField(max_length=50, null=True, blank=True)
    section = models.CharField(max_length=10, null=True, blank=True)
    last_class_passed = models.CharField(max_length=50, null=True, blank=True)
    last_school_name = models.CharField(max_length=200, null=True, blank=True)
    gr_no = models.CharField(max_length=50, null=True, blank=True, unique=False)

    # --- ID Generation Fields ---
    student_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    student_code = models.CharField(max_length=20, unique=True, editable=False, null=True, blank=True)
    enrollment_year = models.IntegerField(null=True, blank=True)
    student_number = models.IntegerField(null=True, blank=True)
    shift = models.CharField(max_length=10, null=True, blank=True)

    # --- System Fields ---
    is_draft = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.student_code or self.student_id or self.gr_no or 'No ID'})"
    
    def soft_delete(self):
        """Soft delete the student"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.current_state = "inactive"
        self.save()
    
    def restore(self):
        """Restore a soft deleted student"""
        self.is_deleted = False
        self.deleted_at = None
        self.current_state = "active"
        self.save()
    
    def hard_delete(self):
        """Permanently delete the student from database"""
        super().delete()

    def save(self, *args, **kwargs):
        # Generate student code if not provided
        if not self.student_code and self.enrollment_year:
            try:
                # Simple student code generation
                year = str(self.enrollment_year)[-2:]
                if self.student_number:
                    self.student_code = f"ST{year}{self.student_number:04d}"
            except Exception as e:
                print(f"Error generating student code: {str(e)}")

        # Generate student ID if not provided
        if not self.student_id and all([self.campus, self.shift, self.enrollment_year, self.student_number]):
            try:
                campus_code = self.campus[:3].upper() if self.campus else "CMP"
                shift_code = self.shift[:1].upper() if self.shift else "M"
                year = str(self.enrollment_year)[-2:]
                self.student_id = f"{campus_code}{shift_code}{year}{self.student_number:04d}"
            except Exception as e:
                print(f"Error generating student ID: {str(e)}")

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
        ordering = ['-created_at']