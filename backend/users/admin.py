from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    User, StudentList, TeacherList, DonorList, LoginLog
)


@admin.register(StudentList)
class StudentListAdmin(admin.ModelAdmin):
    list_display = [
        'student_id', 'full_name', 'email', 'class_name',
        'school_name', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'class_name', 'school_name', 'created_at']
    search_fields = ['student_id', 'full_name', 'email', 'school_name']
    ordering = ['student_id']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('student_id', 'full_name', 'email')
        }),
        ('School Information', {
            'fields': ('class_name', 'school_name')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TeacherList)
class TeacherListAdmin(admin.ModelAdmin):
    list_display = [
        'email', 'full_name', 'subject', 'department',
        'school_name', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'subject', 'department', 'school_name', 'created_at']
    search_fields = ['email', 'full_name', 'subject', 'department', 'school_name']
    ordering = ['email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('email', 'full_name')
        }),
        ('Professional Information', {
            'fields': ('subject', 'department', 'school_name')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DonorList)
class DonorListAdmin(admin.ModelAdmin):
    list_display = [
        'email', 'full_name', 'organization',
        'contact_number', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'organization', 'created_at']
    search_fields = ['email', 'full_name', 'organization']
    ordering = ['email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('email', 'full_name', 'contact_number')
        }),
        ('Organization', {
            'fields': ('organization',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )




@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'id', 'email', 'full_name', 'user_type', 'student_id',
        'is_active', 'is_verified', 'total_xp', 'current_streak',
        'last_active', 'created_at'
    ]
    list_filter = [
        'user_type', 'is_active', 'is_verified', 'created_at',
        'last_active', 'notifications_enabled'
    ]
    search_fields = ['email', 'full_name', 'student_id', 'phone_number']
    ordering = ['-created_at']
    readonly_fields = [
        'id', 'last_active', 'created_at', 'updated_at',
        'total_xp', 'current_streak', 'longest_streak',
        'lessons_completed', 'vocabulary_learned'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'email', 'user_type', 'full_name', 'phone_number')
        }),
        ('Student Information', {
            'fields': ('student_id', 'student_list_entry'),
            'classes': ('collapse',)
        }),
        ('Teacher Information', {
            'fields': ('teacher_list_entry',),
            'classes': ('collapse',)
        }),
        ('Donor Information', {
            'fields': ('donor_list_entry',),
            'classes': ('collapse',)
        }),
        ('Learning Progress', {
            'fields': (
                'total_xp', 'current_streak', 'longest_streak',
                'lessons_completed', 'vocabulary_learned'
            ),
            'classes': ('collapse',)
        }),
        ('Preferences', {
            'fields': (
                'daily_goal_minutes', 'notifications_enabled',
                'sound_effects_enabled', 'email_notifications'
            ),
            'classes': ('collapse',)
        }),
        ('Profile Information', {
            'fields': (
                'bio', 'native_language', 'learning_style',
                'target_level', 'is_public_profile'
            ),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('last_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        ('Basic Information', {
            'classes': ('wide',),
            'fields': ('email', 'user_type', 'full_name', 'password1', 'password2'),
        }),
    )
    
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student_list_entry', 'teacher_list_entry', 'donor_list_entry'
        )




@admin.register(LoginLog)
class LoginLogAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'login_method', 'ip_address',
        'success', 'attempted_at'
    ]
    list_filter = [
        'login_method', 'success', 'attempted_at',
        'user__user_type'
    ]
    search_fields = [
        'user__email', 'user__full_name', 'user__student_id',
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