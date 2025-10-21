from django.contrib import admin
from .models import Grade


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'code', 'campus', 'shift', 'english_teacher'
    ]
    list_filter = ['campus', 'shift', 'english_teacher']
    search_fields = ['name', 'code', 'campus__campus_name', 'english_teacher__name']
    readonly_fields = ['code']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'campus', 'shift')
        }),
        ('Teacher Assignment', {
            'fields': ('english_teacher',),
            'description': 'Select English teacher for this grade from dropdown or search by name'
        }),
    )
    
    actions = ['assign_teacher', 'unassign_teacher']
    
    def assign_teacher(self, request, queryset):
        """Assign teacher to selected grades"""
        # This would need a custom form to select teacher
        self.message_user(request, 'Use individual grade edit to assign teachers.')
    assign_teacher.short_description = "Assign teacher to selected grades"
    
    def unassign_teacher(self, request, queryset):
        """Unassign teacher from selected grades"""
        count = queryset.update(english_teacher=None)
        self.message_user(request, f'{count} grades unassigned from teachers.')
    unassign_teacher.short_description = "Unassign teacher from selected grades"