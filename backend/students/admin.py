from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'student_id', 'student_code', 'current_grade', 
        'current_state', 'is_deleted', 'created_at'
    ]
    list_filter = [
        'current_state', 'is_deleted', 'gender', 'current_grade', 
        'enrollment_year', 'created_at'
    ]
    search_fields = [
        'name', 'student_id', 'student_code', 'gr_no', 
        'father_name', 'mother_name', 'emergency_contact'
    ]
    readonly_fields = ['student_code', 'created_at', 'updated_at', 'deleted_at']
    
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'photo', 'name', 'gender', 'dob', 'place_of_birth', 
                'religion', 'mother_tongue'
            )
        }),
        ('Contact Details', {
            'fields': (
                'emergency_contact', 'address', 'father_name', 'father_cnic', 
                'father_contact', 'father_occupation', 'mother_name', 
                'mother_cnic', 'mother_status', 'mother_contact', 
                'mother_occupation', 'guardian_name', 'guardian_cnic', 
                'guardian_occupation'
            )
        }),
        ('Academic Information', {
            'fields': (
                'current_state', 'campus', 'current_grade', 'section', 
                'last_class_passed', 'last_school_name', 'gr_no'
            )
        }),
        ('ID Information', {
            'fields': (
                'student_id', 'student_code', 'enrollment_year', 
                'student_number', 'shift'
            )
        }),
        ('Financial Information', {
            'fields': (
                'zakat_status', 'family_income', 'house_owned', 'rent_amount'
            )
        }),
        ('System Information', {
            'fields': (
                'is_draft', 'is_deleted', 'deleted_at', 'created_at', 'updated_at'
            )
        }),
    )
    
    actions = ['soft_delete_students', 'restore_students', 'hard_delete_students']
    
    def soft_delete_students(self, request, queryset):
        """Soft delete selected students"""
        count = 0
        for student in queryset:
            if not student.is_deleted:
                student.soft_delete()
                count += 1
        self.message_user(request, f'{count} students soft deleted successfully.')
    soft_delete_students.short_description = "Soft delete selected students"
    
    def restore_students(self, request, queryset):
        """Restore soft deleted students"""
        count = 0
        for student in queryset:
            if student.is_deleted:
                student.restore()
                count += 1
        self.message_user(request, f'{count} students restored successfully.')
    restore_students.short_description = "Restore selected students"
    
    def hard_delete_students(self, request, queryset):
        """Permanently delete selected students"""
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'{count} students permanently deleted.')
    hard_delete_students.short_description = "Permanently delete selected students"