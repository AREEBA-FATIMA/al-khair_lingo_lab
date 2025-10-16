from rest_framework import serializers
from .models import PlantType, PlantStage, UserPlant, PlantCareLog


class PlantStageSerializer(serializers.ModelSerializer):
    """Serializer for plant stages"""
    
    class Meta:
        model = PlantStage
        fields = [
            'id', 'stage_name', 'stage_order', 'image_url', 'description',
            'xp_required', 'levels_required', 'xp_reward', 'badge_name',
            'is_active'
        ]
        read_only_fields = ['id']


class PlantTypeSerializer(serializers.ModelSerializer):
    """Serializer for plant types"""
    stages = PlantStageSerializer(many=True, read_only=True)
    
    class Meta:
        model = PlantType
        fields = [
            'id', 'name', 'description', 'image_url', 'max_stages',
            'xp_per_stage', 'has_flowers', 'has_fruits', 'seasonal_changes',
            'is_active', 'stages'
        ]
        read_only_fields = ['id']


class UserPlantSerializer(serializers.ModelSerializer):
    """Serializer for user plants"""
    plant_type_name = serializers.CharField(source='plant_type.name', read_only=True)
    current_stage_name = serializers.CharField(source='current_stage.get_stage_name_display', read_only=True)
    growth_progress = serializers.FloatField(source='get_growth_progress', read_only=True)
    next_stage_requirements = serializers.SerializerMethodField()
    
    class Meta:
        model = UserPlant
        fields = [
            'id', 'plant_type', 'plant_type_name', 'current_stage',
            'current_stage_name', 'current_level', 'total_xp',
            'levels_completed', 'is_healthy', 'is_wilting', 'health_points',
            'last_care_date', 'daily_care_streak', 'max_care_streak',
            'has_flowers', 'has_fruits', 'seasonal_theme',
            'growth_progress', 'next_stage_requirements',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_next_stage_requirements(self, obj):
        """Get next stage requirements"""
        return obj.get_next_stage_requirements()


class UserPlantCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating user plants"""
    
    class Meta:
        model = UserPlant
        fields = ['plant_type']
    
    def create(self, validated_data):
        """Create user plant with initial stage"""
        user = self.context['request'].user
        plant_type = validated_data['plant_type']
        
        # Get first stage
        first_stage = PlantStage.objects.filter(
            plant_type=plant_type,
            stage_order=1,
            is_active=True
        ).first()
        
        if not first_stage:
            raise serializers.ValidationError("No initial stage found for this plant type")
        
        # Create user plant
        user_plant = UserPlant.objects.create(
            user=user,
            plant_type=plant_type,
            current_stage=first_stage
        )
        
        return user_plant


class PlantCareLogSerializer(serializers.ModelSerializer):
    """Serializer for plant care logs"""
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = PlantCareLog
        fields = [
            'id', 'action', 'action_display', 'description',
            'health_change', 'xp_earned', 'performed_at'
        ]
        read_only_fields = ['id', 'performed_at']


class PlantCareLogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating plant care logs"""
    
    class Meta:
        model = PlantCareLog
        fields = ['action', 'description']
    
    def create(self, validated_data):
        """Create plant care log with automatic effects"""
        user = self.context['request'].user
        action = validated_data['action']
        
        # Get user's plant
        try:
            user_plant = UserPlant.objects.get(user=user)
        except UserPlant.DoesNotExist:
            raise serializers.ValidationError("User does not have a plant")
        
        # Calculate effects based on action
        health_change = 0
        xp_earned = 0
        
        if action == 'water':
            health_change = 10
            xp_earned = 5
        elif action == 'fertilize':
            health_change = 15
            xp_earned = 10
        elif action == 'prune':
            health_change = 5
            xp_earned = 3
        elif action == 'repot':
            health_change = 20
            xp_earned = 15
        elif action == 'check':
            health_change = 2
            xp_earned = 1
        elif action == 'play':
            health_change = 3
            xp_earned = 2
        
        # Create care log
        care_log = PlantCareLog.objects.create(
            user_plant=user_plant,
            action=action,
            description=validated_data.get('description', ''),
            health_change=health_change,
            xp_earned=xp_earned
        )
        
        # Update plant health
        user_plant.health_points = min(100, user_plant.health_points + health_change)
        user_plant.total_xp += xp_earned
        user_plant.care_plant()
        
        return care_log


class PlantStatsSerializer(serializers.Serializer):
    """Serializer for plant statistics"""
    plant_type = serializers.CharField()
    current_stage = serializers.CharField()
    growth_progress = serializers.FloatField()
    total_xp = serializers.IntegerField()
    levels_completed = serializers.IntegerField()
    health_points = serializers.IntegerField()
    daily_care_streak = serializers.IntegerField()
    max_care_streak = serializers.IntegerField()
    is_healthy = serializers.BooleanField()
    has_flowers = serializers.BooleanField()
    has_fruits = serializers.BooleanField()
    days_since_last_care = serializers.IntegerField()
    next_stage_requirements = serializers.DictField()
