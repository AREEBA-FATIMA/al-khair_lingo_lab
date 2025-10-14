from django.contrib import admin
from .models import (
    Group, Level, Question, GroupJumpTest, GroupJumpTestAttempt, 
    PlantGrowthStage, UserPlantProgress
)

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'group_number', 'level_count', 'is_unlocked', 'unlock_condition', 'plant_type')
    list_filter = ('is_unlocked', 'unlock_condition', 'plant_type', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('group_number',)

@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ('name', 'group', 'level_number', 'questions_count', 'xp_reward', 'is_unlocked', 'plant_growth_stage')
    list_filter = ('group', 'is_unlocked', 'plant_growth_stage', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('group', 'level_number')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'level', 'question_type', 'difficulty', 'xp_value', 'question_order')
    list_filter = ('question_type', 'difficulty', 'level__group')
    search_fields = ('question_text',)
    ordering = ('level', 'question_order')

@admin.register(GroupJumpTest)
class GroupJumpTestAdmin(admin.ModelAdmin):
    list_display = ('name', 'target_group', 'pass_percentage', 'time_limit_minutes', 'is_active')
    list_filter = ('target_group', 'is_active', 'created_at')
    search_fields = ('name', 'description')

@admin.register(GroupJumpTestAttempt)
class GroupJumpTestAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'jump_test', 'score', 'percentage', 'passed', 'attempted_at')
    list_filter = ('passed', 'jump_test__target_group', 'attempted_at')
    search_fields = ('user__username',)

@admin.register(PlantGrowthStage)
class PlantGrowthStageAdmin(admin.ModelAdmin):
    list_display = ('group', 'stage_name', 'stage_order', 'level_range_start', 'level_range_end')
    list_filter = ('group', 'stage_name')
    ordering = ('group', 'stage_order')

@admin.register(UserPlantProgress)
class UserPlantProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'current_stage', 'current_level', 'is_wilting', 'last_level_completed')
    list_filter = ('group', 'current_stage', 'is_wilting', 'created_at')
    search_fields = ('user__username',)
