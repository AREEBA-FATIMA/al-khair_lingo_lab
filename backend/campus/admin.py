from django.contrib import admin
from .models import Campus


@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = [
        'campus_name', 'campus_code', 'campus_id', 'city', 
        'campus_type', 'status', 'total_students', 'total_teachers'
    ]
    list_filter = [
        'status', 'campus_type', 'city', 'shift_available',
        'library_available', 'sports_facility', 'created_at'
    ]
    search_fields = [
        'campus_name', 'campus_code', 'campus_id', 'city',
        'campus_head_name', 'official_email'
    ]
    readonly_fields = [
        'campus_id', 'total_rooms', 'total_washrooms', 'student_washrooms',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'campus_id', 'campus_code', 'campus_name', 'campus_type',
                'governing_body', 'accreditation', 'instruction_language'
            )
        }),
        ('Academic Information', {
            'fields': (
                'academic_year_start', 'academic_year_end', 'established_year',
                'registration_number', 'shift_available', 'grades_available'
            )
        }),
        ('Location', {
            'fields': (
                'address_full', 'postal_code', 'city', 'district'
            )
        }),
        ('Contact Information', {
            'fields': (
                'primary_phone', 'secondary_phone', 'official_email'
            )
        }),
        ('Administration', {
            'fields': (
                'campus_head_name', 'campus_head_phone', 'campus_head_email'
            )
        }),
        ('Staff Statistics', {
            'fields': (
                'total_staff_members', 'total_teachers', 'male_teachers', 'female_teachers',
                'total_maids', 'total_coordinators', 'total_guards', 'other_staff'
            ),
            'classes': ('collapse',)
        }),
        ('Student Statistics', {
            'fields': (
                'total_students', 'male_students', 'female_students', 'student_capacity',
                'morning_students', 'afternoon_students', 'avg_class_size'
            ),
            'classes': ('collapse',)
        }),
        ('Infrastructure', {
            'fields': (
                'total_classrooms', 'total_offices', 'num_computer_labs', 'num_science_labs',
                'library_available', 'power_backup', 'internet_available', 'teacher_transport',
                'canteen_facility', 'meal_program'
            ),
            'classes': ('collapse',)
        }),
        ('Washrooms', {
            'fields': (
                'staff_washrooms', 'male_staff_washrooms', 'female_staff_washrooms',
                'male_student_washrooms', 'female_student_washrooms'
            ),
            'classes': ('collapse',)
        }),
        ('Sports & Recreation', {
            'fields': (
                'sports_facility', 'sports_available'
            ),
            'classes': ('collapse',)
        }),
        ('Status & System', {
            'fields': (
                'status', 'is_draft', 'created_at', 'updated_at'
            )
        }),
    )
    
    actions = ['activate_campuses', 'deactivate_campuses', 'mark_as_final']
    
    def activate_campuses(self, request, queryset):
        """Activate selected campuses"""
        count = queryset.update(status='active')
        self.message_user(request, f'{count} campuses activated successfully.')
    activate_campuses.short_description = "Activate selected campuses"
    
    def deactivate_campuses(self, request, queryset):
        """Deactivate selected campuses"""
        count = queryset.update(status='inactive')
        self.message_user(request, f'{count} campuses deactivated successfully.')
    deactivate_campuses.short_description = "Deactivate selected campuses"
    
    def mark_as_final(self, request, queryset):
        """Mark selected campuses as final (not draft)"""
        count = queryset.update(is_draft=False)
        self.message_user(request, f'{count} campuses marked as final successfully.')
    mark_as_final.short_description = "Mark selected campuses as final"