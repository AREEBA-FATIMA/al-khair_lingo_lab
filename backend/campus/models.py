from django.db import models


class Campus(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("closed", "Closed"),
    ]

    CAMPUS_TYPE_CHOICES = [
        ("main", "Main"),
        ("branch", "Branch"),
    ]

    # Basic Information
    campus_name = models.CharField(max_length=255, help_text="Campus name")
    campus_code = models.CharField(max_length=50, unique=True, help_text="Campus code (e.g., C01, C02)")
    campus_type = models.CharField(max_length=20, choices=CAMPUS_TYPE_CHOICES, default="main")
    
    # Location
    address = models.TextField(help_text="Full address", default="Not specified")
    city = models.CharField(max_length=100, help_text="City name", default="Not specified")
    
    # Contact
    phone = models.CharField(max_length=20, help_text="Primary phone number", default="000-000-0000")
    email = models.EmailField(help_text="Official email address", default="campus@example.com")
    
    # Administration
    head_name = models.CharField(max_length=255, help_text="Campus head name", default="Not specified")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    # System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.campus_name} ({self.campus_code})"

    class Meta:
        verbose_name = "Campus"
        verbose_name_plural = "Campuses"
        ordering = ['campus_name']
        indexes = [
            models.Index(fields=['campus_code']),
            models.Index(fields=['city']),
            models.Index(fields=['status']),
        ]