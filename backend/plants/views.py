from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q, Avg, Count, Sum, Max
from django.utils import timezone
from .models import PlantType, PlantStage, UserPlant, PlantCareLog
from .serializers import (
    PlantTypeSerializer, PlantStageSerializer, UserPlantSerializer,
    UserPlantCreateSerializer, PlantCareLogSerializer, PlantCareLogCreateSerializer,
    PlantStatsSerializer
)


class PlantTypeListView(generics.ListAPIView):
    """List all available plant types"""
    queryset = PlantType.objects.filter(is_active=True)
    serializer_class = PlantTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class PlantTypeDetailView(generics.RetrieveAPIView):
    """Get specific plant type details"""
    queryset = PlantType.objects.filter(is_active=True)
    serializer_class = PlantTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class PlantStageListView(generics.ListAPIView):
    """List plant stages for a specific plant type"""
    serializer_class = PlantStageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        plant_type_id = self.kwargs['plant_type_id']
        return PlantStage.objects.filter(
            plant_type_id=plant_type_id,
            is_active=True
        ).order_by('stage_order')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_plant(request):
    """Get user's current plant"""
    try:
        user_plant = UserPlant.objects.get(user=request.user)
        serializer = UserPlantSerializer(user_plant)
        return Response(serializer.data)
    except UserPlant.DoesNotExist:
        return Response(
            {'message': 'User does not have a plant yet'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_user_plant(request):
    """Create a new plant for user"""
    # Check if user already has a plant
    if UserPlant.objects.filter(user=request.user).exists():
        return Response(
            {'error': 'User already has a plant'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = UserPlantCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user_plant = serializer.save()
        
        # Update user's total XP
        user = request.user
        user.total_xp += 10  # Initial XP for creating plant
        user.save()
        
        return Response(
            UserPlantSerializer(user_plant).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def care_plant(request):
    """Care for user's plant"""
    try:
        user_plant = UserPlant.objects.get(user=request.user)
    except UserPlant.DoesNotExist:
        return Response(
            {'error': 'User does not have a plant'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = PlantCareLogCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        care_log = serializer.save()
        
        # Update user's total XP
        user = request.user
        user.total_xp += care_log.xp_earned
        user.save()
        
        return Response(
            PlantCareLogSerializer(care_log).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlantCareLogListView(generics.ListAPIView):
    """List user's plant care logs"""
    serializer_class = PlantCareLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            user_plant = UserPlant.objects.get(user=self.request.user)
            return PlantCareLog.objects.filter(user_plant=user_plant).order_by('-performed_at')
        except UserPlant.DoesNotExist:
            return PlantCareLog.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def plant_stats(request):
    """Get user's plant statistics"""
    try:
        user_plant = UserPlant.objects.get(user=request.user)
    except UserPlant.DoesNotExist:
        return Response(
            {'error': 'User does not have a plant'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Calculate days since last care
    days_since_last_care = 0
    if user_plant.last_care_date:
        days_since_last_care = (timezone.now().date() - user_plant.last_care_date).days
    
    stats = {
        'plant_type': user_plant.plant_type.name,
        'current_stage': user_plant.current_stage.get_stage_name_display(),
        'growth_progress': user_plant.get_growth_progress(),
        'total_xp': user_plant.total_xp,
        'levels_completed': user_plant.levels_completed,
        'health_points': user_plant.health_points,
        'daily_care_streak': user_plant.daily_care_streak,
        'max_care_streak': user_plant.max_care_streak,
        'is_healthy': user_plant.is_healthy,
        'has_flowers': user_plant.has_flowers,
        'has_fruits': user_plant.has_fruits,
        'days_since_last_care': days_since_last_care,
        'next_stage_requirements': user_plant.get_next_stage_requirements()
    }
    
    serializer = PlantStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_plant_progress(request):
    """Update plant progress (called when level is completed)"""
    try:
        user_plant = UserPlant.objects.get(user=request.user)
    except UserPlant.DoesNotExist:
        return Response(
            {'error': 'User does not have a plant'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    levels_completed = request.data.get('levels_completed', 0)
    xp_earned = request.data.get('xp_earned', 0)
    time_spent = request.data.get('time_spent', 0)
    
    # Update plant progress
    user_plant.update_progress(
        levels_completed=levels_completed,
        xp_earned=xp_earned,
        time_spent=time_spent
    )
    
    serializer = UserPlantSerializer(user_plant)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_plant_recommendations(request):
    """Get plant care recommendations"""
    try:
        user_plant = UserPlant.objects.get(user=request.user)
    except UserPlant.DoesNotExist:
        return Response(
            {'error': 'User does not have a plant'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    recommendations = []
    
    # Health recommendations
    if user_plant.health_points < 50:
        recommendations.append({
            'type': 'health',
            'message': 'Your plant is wilting! Water it to improve its health.',
            'action': 'water',
            'priority': 'high'
        })
    elif user_plant.health_points < 70:
        recommendations.append({
            'type': 'health',
            'message': 'Your plant needs some care. Consider watering or fertilizing.',
            'action': 'fertilize',
            'priority': 'medium'
        })
    
    # Growth recommendations
    next_requirements = user_plant.get_next_stage_requirements()
    if next_requirements:
        if next_requirements['xp_progress'] < 50:
            recommendations.append({
                'type': 'growth',
                'message': f'Complete more levels to reach {next_requirements["stage_name"]} stage.',
                'action': 'complete_levels',
                'priority': 'medium'
            })
    
    # Care streak recommendations
    if user_plant.daily_care_streak == 0:
        recommendations.append({
            'type': 'care',
            'message': 'Start a daily care streak to keep your plant healthy!',
            'action': 'care',
            'priority': 'high'
        })
    elif user_plant.daily_care_streak >= 7:
        recommendations.append({
            'type': 'care',
            'message': f'Great job! You have a {user_plant.daily_care_streak}-day care streak!',
            'action': 'continue_care',
            'priority': 'low'
        })
    
    return Response({
        'recommendations': recommendations,
        'plant_status': UserPlantSerializer(user_plant).data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_plant_achievements(request):
    """Get plant-related achievements"""
    try:
        user_plant = UserPlant.objects.get(user=request.user)
    except UserPlant.DoesNotExist:
        return Response(
            {'error': 'User does not have a plant'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    achievements = []
    
    # Growth achievements
    if user_plant.current_stage.stage_name == 'mature':
        achievements.append({
            'name': 'Plant Master',
            'description': 'Reached the mature stage',
            'icon': '🌳',
            'earned': True
        })
    elif user_plant.current_stage.stage_name == 'fruiting':
        achievements.append({
            'name': 'Fruit Bearer',
            'description': 'Your plant is bearing fruits!',
            'icon': '🍎',
            'earned': True
        })
    elif user_plant.current_stage.stage_name == 'flowering':
        achievements.append({
            'name': 'Flower Power',
            'description': 'Your plant is flowering!',
            'icon': '🌸',
            'earned': True
        })
    
    # Care achievements
    if user_plant.max_care_streak >= 30:
        achievements.append({
            'name': 'Dedicated Gardener',
            'description': '30-day care streak',
            'icon': '🏆',
            'earned': True
        })
    elif user_plant.max_care_streak >= 7:
        achievements.append({
            'name': 'Consistent Care',
            'description': '7-day care streak',
            'icon': '⭐',
            'earned': True
        })
    
    # Health achievements
    if user_plant.health_points == 100:
        achievements.append({
            'name': 'Perfect Health',
            'description': 'Plant at perfect health',
            'icon': '💚',
            'earned': True
        })
    
    return Response({
        'achievements': achievements,
        'total_earned': len([a for a in achievements if a['earned']])
    })


class PlantTypeViewSet(ModelViewSet):
    """ViewSet for plant type management (admin only)"""
    queryset = PlantType.objects.all()
    serializer_class = PlantTypeSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['is_active', 'has_flowers', 'has_fruits', 'seasonal_changes']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'max_stages', 'xp_per_stage']
    ordering = ['name']


class PlantStageViewSet(ModelViewSet):
    """ViewSet for plant stage management (admin only)"""
    queryset = PlantStage.objects.all()
    serializer_class = PlantStageSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['plant_type', 'stage_name', 'is_active']
    search_fields = ['description']
    ordering_fields = ['stage_order', 'xp_required', 'levels_required']
    ordering = ['plant_type', 'stage_order']


class UserPlantViewSet(ModelViewSet):
    """ViewSet for user plant management (admin only)"""
    queryset = UserPlant.objects.all()
    serializer_class = UserPlantSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['plant_type', 'current_stage', 'is_healthy', 'is_wilting']
    search_fields = ['user__username']
    ordering_fields = ['created_at', 'total_xp', 'health_points']
    ordering = ['-created_at']


class PlantCareLogViewSet(ModelViewSet):
    """ViewSet for plant care log management (admin only)"""
    queryset = PlantCareLog.objects.all()
    serializer_class = PlantCareLogSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['action', 'user_plant', 'user_plant__user']
    search_fields = ['description', 'user_plant__user__username']
    ordering_fields = ['performed_at', 'xp_earned']
    ordering = ['-performed_at']