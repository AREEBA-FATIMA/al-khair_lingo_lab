from django.db import models


class Teacher(models.Model):
    # --- Basic Information ---
    name = models.CharField(max_length=200, default="Unknown Teacher", help_text="Teacher's full name")
    father_name = models.CharField(max_length=200, default="Unknown", help_text="Father's name")
    
    # --- Academic Assignment ---
    assigned_class = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_teacher',
        help_text="Class assigned as class teacher"
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
        # Generate teacher ID if not provided
        if not self.teacher_id or self.teacher_id == "TEMP-TEACHER-ID":
            try:
                # Get campus code (C01, C02, etc.)
                campus_code = f"C{self.campus.id:02d}" if self.campus else "C01"
                
                # Default to morning shift
                shift_code = "M"
                
                # Get current year
                from datetime import datetime
                year = str(datetime.now().year)[-2:]
                
                # Get next teacher number for this campus
                from django.db.models import Max
                last_teacher = Teacher.objects.filter(
                    campus=self.campus
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
                
                # Generate teacher ID: C01-T-001
                self.teacher_id = f"{campus_code}-T-{next_number:03d}"
                
            except Exception as e:
                print(f"Error generating teacher ID: {str(e)}")
                # Fallback ID
                self.teacher_id = f"C01-T-{self.pk or 0:03d}"

        super().save(*args, **kwargs)
        
        # Create or update User account for teacher
        self._create_or_update_user_account()

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