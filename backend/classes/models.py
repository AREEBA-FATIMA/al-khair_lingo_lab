from django.db import models
from django.utils.crypto import get_random_string
from django.core.exceptions import ValidationError
from django.db.models import Q

# Teacher model assumed in 'teachers' app
TEACHER_MODEL = "teachers.Teacher"

# ----------------------
class Grade(models.Model):
    """
    Grade with English teacher assignment (e.g., Grade 1, Grade 2)
    """
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=25, unique=True, blank=True, null=True, editable=False)
    
    # Campus connection
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='grades',
        help_text="Campus this grade belongs to"
    )
    
    # Shift information
    shift = models.CharField(
        max_length=20,
        choices=[
            ('morning', 'Morning'),
            ('afternoon', 'Afternoon'),
        ],
        default='morning',
        help_text="Shift for this grade",
        blank=True,
        null=True
    )
    
    # English teacher assignment
    english_teacher = models.ForeignKey(
        'teachers.Teacher', 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='english_teacher_grades',
        help_text="English teacher for this grade"
    )

    def save(self, *args, **kwargs):
        if not self.code:
            # Generate campus code: C01, C02, C03, etc.
            if self.campus:
                campus_code = self.campus.campus_code
            else:
                campus_code = "C01"  # Default fallback
            
            # Grade mapping
            grade_name = self.name.replace("Grade", "").strip()
            
            # Try to extract number from grade name
            import re
            numbers = re.findall(r'\d+', grade_name)
            if numbers:
                grade_num = numbers[0].zfill(2)  # Pad with zero if needed
            else:
                # If no number found, try to extract from name patterns
                if "nursery" in grade_name.lower():
                    grade_num = "00"
                elif "kg" in grade_name.lower():
                    # Extract KG number
                    kg_match = re.search(r'kg[-\s]*(\d+)', grade_name.lower())
                    if kg_match:
                        grade_num = f"0{kg_match.group(1)}"
                    else:
                        grade_num = "01"
                else:
                    grade_num = "01"
            
            # Generate grade code: C01-G00, C01-G01, C01-G02
            self.code = f"{campus_code}-G{grade_num}"
            
            # Ensure uniqueness
            original_code = self.code
            suffix = 1
            while Grade.objects.filter(code=self.code).exists():
                self.code = f"{original_code}-{suffix:02d}"
                suffix += 1
        
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ("campus", "name", "shift")
        verbose_name = "Grade"
        verbose_name_plural = "Grades"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.campus.campus_name})"

# ClassRoom model removed - using Grade model directly