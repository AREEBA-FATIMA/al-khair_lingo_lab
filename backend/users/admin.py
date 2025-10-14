from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'level', 'is_staff', 'is_active')
    list_filter = ('role', 'level', 'is_staff', 'is_active', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'level', 'phone_number', 'date_of_birth', 'profile_picture')}),
        ('School Info', {'fields': ('school_name', 'class_name', 'student_id')}),
        ('Progress', {'fields': ('current_streak', 'longest_streak', 'total_xp', 'lessons_completed', 'vocabulary_learned')}),
        ('Preferences', {'fields': ('daily_goal_minutes', 'notifications_enabled', 'sound_effects_enabled', 'email_notifications')}),
        ('Relations', {'fields': ('parent',)}),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'companion_type', 'companion_selected', 'target_group', 'daily_goal_levels')
    list_filter = ('companion_type', 'companion_selected', 'is_public_profile')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')