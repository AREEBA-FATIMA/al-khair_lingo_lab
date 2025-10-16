from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import User, LoginLog


# StudentList, TeacherList, DonorList admin classes removed - now handled in separate apps




@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'id', 'email', 'username', 'first_name', 'last_name', 'role',
        'student_id', 'is_active', 'is_verified', 'created_at'
    ]
    list_filter = [
        'role', 'is_active', 'is_verified', 'created_at'
    ]
    search_fields = ['email', 'username', 'first_name', 'last_name', 'student_id', 'phone_number']
    ordering = ['-created_at']
    readonly_fields = [
        'id', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'email', 'username', 'first_name', 'last_name', 'role')
        }),
        ('Contact Information', {
            'fields': ('phone_number',),
            'classes': ('collapse',)
        }),
        ('Student Information', {
            'fields': ('student_id',),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified', 'has_changed_default_password')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        ('Basic Information', {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )




@admin.register(LoginLog)
class LoginLogAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'login_method', 'ip_address',
        'success', 'attempted_at'
    ]
    list_filter = [
        'login_method', 'success', 'attempted_at',
        'user__role'
    ]
    search_fields = [
        'user__email', 'user__first_name', 'user__last_name', 'user__student_id',
        'ip_address', 'user_agent'
    ]
    ordering = ['-attempted_at']
    readonly_fields = ['attempted_at']
    
    fieldsets = (
        ('Login Information', {
            'fields': ('user', 'login_method', 'success')
        }),
        ('Technical Details', {
            'fields': ('ip_address', 'user_agent', 'attempted_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


# Customize admin site
admin.site.site_header = "Lingo Master Admin"
admin.site.site_title = "Lingo Master"
admin.site.index_title = "Welcome to Lingo Master Administration"