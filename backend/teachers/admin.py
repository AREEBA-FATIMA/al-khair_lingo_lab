from django.contrib import admin
from .models import Teacher

# TeacherRole admin removed - using current_role_title field instead
@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'teacher_code', 'teacher_id', 'email', 
        'current_campus', 'shift', 'is_currently_active', 'date_created'
    ]
    list_filter = [
        'is_currently_active', 'gender', 'marital_status', 'shift', 
        'current_campus', 'save_status', 'date_created'
    ]
    search_fields = [
        'full_name', 'email', 'teacher_code', 'teacher_id', 
        'contact_number', 'cnic', 'current_role_title'
    ]
    readonly_fields = ['teacher_code', 'teacher_id', 'date_created', 'date_updated']
    
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'full_name', 'dob', 'gender', 'contact_number', 'email', 
                'cnic', 'permanent_address', 'current_address', 'marital_status'
            )
        }),
        ('Education Information', {
            'fields': (
                'education_level', 'institution_name', 'year_of_passing', 
                'education_subjects', 'education_grade', 'additional_education_level', 
                'additional_institution_name', 'additional_year_of_passing', 
                'additional_education_subjects', 'additional_education_grade'
            )
        }),
        ('Experience Information', {
            'fields': (
                'previous_institution_name', 'previous_position', 
                'experience_from_date', 'experience_to_date', 
                'experience_subjects_classes_taught', 'previous_responsibilities', 
                'total_experience_years', 'additional_institution_name_exp', 
                'additional_position', 'additional_experience_from_date', 
                'additional_experience_to_date', 'additional_experience_subjects_classes', 
                'additional_responsibilities'
            )
        }),
        ('Current Role Information', {
            'fields': (
                'joining_date', 'current_role_title', 'current_campus', 
                'shift', 'current_subjects', 'current_classes_taught', 
                'current_extra_responsibilities', 'role_start_date', 
                'role_end_date', 'is_currently_active'
            )
        }),
        ('Class Teacher Information', {
            'fields': (
                'is_class_teacher', 'assigned_classroom'
            )
        }),
        ('System Information', {
            'fields': (
                'teacher_code', 'teacher_id', 'save_status', 
                'date_created', 'date_updated'
            )
        }),
    )
    
    actions = ['activate_teachers', 'deactivate_teachers', 'mark_as_final']
    
    def activate_teachers(self, request, queryset):
        """Activate selected teachers"""
        count = queryset.update(is_currently_active=True)
        self.message_user(request, f'{count} teachers activated successfully.')
    activate_teachers.short_description = "Activate selected teachers"
    
    def deactivate_teachers(self, request, queryset):
        """Deactivate selected teachers"""
        count = queryset.update(is_currently_active=False)
        self.message_user(request, f'{count} teachers deactivated successfully.')
    deactivate_teachers.short_description = "Deactivate selected teachers"
    
    def mark_as_final(self, request, queryset):
        """Mark selected teachers as final"""
        count = queryset.update(save_status='final')
        self.message_user(request, f'{count} teachers marked as final successfully.')
    mark_as_final.short_description = "Mark selected teachers as final"