from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import PlantType, PlantStage, UserPlant, PlantCareLog


class PlantStageInline(admin.TabularInline):
    model = PlantStage
    extra = 0
    fields = ('stage_order', 'stage_name', 'xp_required', 'levels_required', 'xp_reward', 'is_active')
    ordering = ('stage_order',)


@admin.register(PlantType)
class PlantTypeAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'max_stages', 'xp_per_stage', 'has_flowers', 
        'has_fruits', 'seasonal_changes', 'is_active', 'created_at'
    )
    list_filter = ('has_flowers', 'has_fruits', 'seasonal_changes', 'is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)
    inlines = [PlantStageInline]
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'image_url')
        }),
        ('Growth Configuration', {
            'fields': ('max_stages', 'xp_per_stage')
        }),
        ('Special Features', {
            'fields': ('has_flowers', 'has_fruits', 'seasonal_changes')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(PlantStage)
class PlantStageAdmin(admin.ModelAdmin):
    list_display = (
        'plant_type', 'stage_order', 'stage_name', 'xp_required', 
        'levels_required', 'xp_reward', 'is_active', 'created_at'
    )
    list_filter = ('stage_name', 'is_active', 'plant_type', 'created_at')
    search_fields = ('description', 'plant_type__name')
    ordering = ('plant_type', 'stage_order')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Stage Information', {
            'fields': ('plant_type', 'stage_order', 'stage_name', 'description', 'image_url')
        }),
        ('Requirements', {
            'fields': ('xp_required', 'levels_required')
        }),
        ('Rewards', {
            'fields': ('xp_reward', 'badge_name')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(UserPlant)
class UserPlantAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'plant_type', 'current_stage', 'current_level', 
        'total_xp', 'health_points', 'is_healthy', 'is_wilting', 'created_at'
    )
    list_filter = ('plant_type', 'current_stage', 'is_healthy', 'is_wilting', 'created_at')
    search_fields = ('user__username', 'plant_type__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'last_updated')
    
    fieldsets = (
        ('Plant Information', {
            'fields': ('user', 'plant_type', 'current_stage', 'current_level')
        }),
        ('Progress Tracking', {
            'fields': ('total_xp', 'levels_completed')
        }),
        ('Health Status', {
            'fields': ('is_healthy', 'is_wilting', 'health_points')
        }),
        ('Daily Care', {
            'fields': ('last_care_date', 'daily_care_streak', 'max_care_streak')
        }),
        ('Special Features', {
            'fields': ('has_flowers', 'has_fruits', 'seasonal_theme')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_updated'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'plant_type', 'current_stage')


@admin.register(PlantCareLog)
class PlantCareLogAdmin(admin.ModelAdmin):
    list_display = (
        'user_plant', 'action', 'health_change', 'xp_earned', 'performed_at'
    )
    list_filter = ('action', 'performed_at', 'user_plant__plant_type')
    search_fields = ('user_plant__user__username', 'description')
    ordering = ('-performed_at',)
    readonly_fields = ('performed_at',)
    
    fieldsets = (
        ('Care Information', {
            'fields': ('user_plant', 'action', 'description')
        }),
        ('Effects', {
            'fields': ('health_change', 'xp_earned')
        }),
        ('Timestamp', {
            'fields': ('performed_at',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user_plant__user', 'user_plant__plant_type')