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
    address = models.TextField(help_text="Full address", blank=True, null=True)
    city = models.CharField(max_length=100, help_text="City name", blank=True, null=True)
    
    # Contact
    phone = models.CharField(max_length=20, help_text="Primary phone number", blank=True, null=True)
    email = models.EmailField(help_text="Official email address", blank=True, null=True)
    
    # Administration
    head_name = models.CharField(max_length=255, help_text="Campus head name", blank=True, null=True)
    
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