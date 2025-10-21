from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'father_name', 'grade', 'shift', 'campus', 
        'class_teacher', 'student_id', 'is_active', 'created_at'
    ]
    list_filter = [
        'is_active', 'grade', 'shift', 'campus', 'created_at'
    ]
    search_fields = [
        'name', 'father_name', 'student_id'
    ]
    readonly_fields = ['student_id', 'class_teacher', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name', 'father_name'
            )
        }),
        ('Academic Information', {
            'fields': (
                'grade', 'shift', 'campus', 'class_teacher'
            )
        }),
        ('Authentication', {
            'fields': (
                'password',
            )
        }),
        ('System Information', {
            'fields': (
                'student_id', 'is_active', 'created_at', 'updated_at'
            )
        }),
    )
    
    actions = ['activate_students', 'deactivate_students']
    
    def activate_students(self, request, queryset):
        """Activate selected students"""
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} students activated successfully.')
    activate_students.short_description = "Activate selected students"
    
    def deactivate_students(self, request, queryset):
        """Deactivate selected students"""
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} students deactivated successfully.')
    deactivate_students.short_description = "Deactivate selected students"