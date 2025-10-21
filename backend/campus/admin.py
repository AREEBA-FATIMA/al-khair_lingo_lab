from django.contrib import admin
from .models import Campus


@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = [
        'campus_name', 'campus_code', 'city', 'campus_type', 'status', 'head_name'
    ]
    list_filter = [
        'status', 'campus_type', 'city', 'created_at'
    ]
    search_fields = [
        'campus_name', 'campus_code', 'city', 'head_name', 'email'
    ]
    readonly_fields = [
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'campus_name', 'campus_code', 'campus_type'
            )
        }),
        ('Location', {
            'fields': (
                'address', 'city'
            )
        }),
        ('Contact Information', {
            'fields': (
                'phone', 'email'
            )
        }),
        ('Administration', {
            'fields': (
                'head_name',
            )
        }),
        ('Status & System', {
            'fields': (
                'status', 'created_at', 'updated_at'
            )
        }),
    )
    
    actions = ['activate_campuses', 'deactivate_campuses']
    
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