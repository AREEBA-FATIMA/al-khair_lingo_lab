from django.contrib import admin
from .models import Teacher

# TeacherRole admin removed - using current_role_title field instead
@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'father_name', 'shift', 'campus', 
        'email', 'teacher_id', 'is_active', 'created_at'
    ]
    list_filter = [
        'is_active', 'shift', 'campus', 'created_at'
    ]
    search_fields = [
        'name', 'father_name', 'email', 'teacher_id'
    ]
    readonly_fields = ['teacher_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name', 'father_name', 'shift'
            )
        }),
        ('Campus Assignment', {
            'fields': (
                'campus',
            )
        }),
        ('Contact Information', {
            'fields': (
                'email', 'password'
            )
        }),
        ('System Information', {
            'fields': (
                'teacher_id', 'is_active', 'created_at', 'updated_at'
            )
        }),
    )
    
    actions = ['activate_teachers', 'deactivate_teachers']
    
    def activate_teachers(self, request, queryset):
        """Activate selected teachers"""
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} teachers activated successfully.')
    activate_teachers.short_description = "Activate selected teachers"
    
    def deactivate_teachers(self, request, queryset):
        """Deactivate selected teachers"""
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} teachers deactivated successfully.')
    deactivate_teachers.short_description = "Deactivate selected teachers"
    