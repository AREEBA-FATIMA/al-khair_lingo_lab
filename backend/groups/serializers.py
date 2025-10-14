from rest_framework import serializers
from .models import Group, Level, Question, GroupJumpTest, GroupJumpTestAttempt, PlantGrowthStage, UserPlantProgress

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'options', 'correct_answer', 
                 'explanation', 'difficulty', 'xp_value', 'question_order']

class LevelSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Level
        fields = ['id', 'name', 'description', 'level_number', 'questions_count', 
                 'xp_reward', 'is_unlocked', 'plant_growth_stage', 'questions']

class GroupSerializer(serializers.ModelSerializer):
    levels = LevelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'group_number', 'level_count', 
                 'plant_type', 'is_unlocked', 'unlock_condition', 'levels']

class GroupJumpTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupJumpTest
        fields = ['id', 'name', 'description', 'target_group', 'pass_percentage', 
                 'time_limit_minutes', 'is_active']

class GroupJumpTestAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupJumpTestAttempt
        fields = ['id', 'jump_test', 'score', 'percentage', 'passed', 'attempted_at']

class PlantGrowthStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantGrowthStage
        fields = ['id', 'group', 'stage_name', 'stage_order', 'level_range_start', 
                 'level_range_end', 'description', 'emoji', 'color']

class UserPlantProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPlantProgress
        fields = ['id', 'group', 'current_stage', 'current_level', 'is_wilting', 
                 'last_level_completed', 'created_at', 'updated_at']
