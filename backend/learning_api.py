"""
Unified Learning API Router
Consolidates all learning-related endpoints under /api/learning/
"""

from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone

# Import existing views
from groups.views import (
    GroupListView, GroupDetailView, GroupLevelsView,
    unlock_group, complete_group, group_stats,
    GroupUnlockTestListView, GroupUnlockTestDetailView,
    start_unlock_test, submit_unlock_test, GroupUnlockTestAttemptListView
)
from levels.views import (
    LevelDetailView, LevelQuestionsView, submit_answer,
    complete_level, get_next_level, get_test_levels,
    LevelCompletionListView, LevelCompletionDetailView, level_stats
)
from progress.views import (
    progress_overview, save_progress, load_progress,
    recent_activity, achievements
)
from plants.views import (
    get_user_plant, create_user_plant, care_plant,
    plant_stats, update_plant_progress, get_plant_recommendations,
    get_plant_achievements
)


# ===== UNIFIED LEARNING API ENDPOINTS =====

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def learning_dashboard(request):
    """Main learning dashboard with user's groups and progress"""
    user = request.user
    
    # Get user's groups with progress
    from groups.models import Group, GroupProgress
    groups = Group.objects.filter(is_active=True).order_by('group_number')
    
    groups_data = []
    for group in groups:
        try:
            group_progress = GroupProgress.objects.get(user=user, group=group)
            progress_data = {
                'is_unlocked': group_progress.is_unlocked,
                'is_completed': group_progress.is_completed,
                'completion_percentage': group_progress.completion_percentage,
                'levels_completed': group_progress.levels_completed,
                'total_xp_earned': group_progress.total_xp_earned,
                'time_spent_minutes': group_progress.time_spent_minutes,
                'last_accessed_at': group_progress.last_accessed_at
            }
        except GroupProgress.DoesNotExist:
            progress_data = {
                'is_unlocked': group.group_number == 0,  # Group 0 is unlocked by default
                'is_completed': False,
                'completion_percentage': 0.0,
                'levels_completed': 0,
                'total_xp_earned': 0,
                'time_spent_minutes': 0,
                'last_accessed_at': None
            }
        
        groups_data.append({
            'id': group.id,
            'group_number': group.group_number,
            'name': group.name,
            'description': group.description,
            'difficulty': group.difficulty,
            'total_levels': group.levels.count(),
            'progress': progress_data
        })
    
    # Get overall progress
    from progress.views import progress_overview
    progress_response = progress_overview(request)
    overall_progress = progress_response.data if hasattr(progress_response, 'data') else {}
    
    return Response({
        'groups': groups_data,
        'overall_progress': overall_progress,
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'total_xp': user.total_xp
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_groups(request):
    """Get user's groups with progress - alias for groups list"""
    return GroupListView.as_view()(request)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def learning_stats(request):
    """Get comprehensive learning statistics"""
    user = request.user
    
    # Get progress overview
    progress_response = progress_overview(request)
    progress_data = progress_response.data if hasattr(progress_response, 'data') else {}
    
    # Get group statistics
    from groups.models import GroupProgress
    group_stats_data = GroupProgress.objects.filter(user=user).aggregate(
        total_groups_started=Count('id'),
        total_groups_completed=Count('id', filter=Q(is_completed=True)),
        total_xp_earned=Sum('total_xp_earned'),
        total_time_spent=Sum('time_spent_minutes')
    )
    
    # Get level statistics
    from progress.models import LevelProgress
    level_stats_data = LevelProgress.objects.filter(user=user).aggregate(
        total_levels_attempted=Count('id'),
        total_levels_completed=Count('id', filter=Q(is_completed=True)),
        average_accuracy=Avg('completion_percentage'),
        total_attempts=Sum('attempts')
    )
    
    # Get plant statistics
    try:
        from plants.models import UserPlant
        user_plant = UserPlant.objects.get(user=user)
        plant_data = {
            'current_stage': user_plant.current_stage.get_stage_name_display(),
            'health_points': user_plant.health_points,
            'is_healthy': user_plant.is_healthy,
            'daily_care_streak': user_plant.daily_care_streak,
            'max_care_streak': user_plant.max_care_streak
        }
    except:
        plant_data = None
    
    return Response({
        'progress_overview': progress_data,
        'group_statistics': group_stats_data,
        'level_statistics': level_stats_data,
        'plant_status': plant_data,
        'generated_at': timezone.now()
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def learning_recommendations(request):
    """Get personalized learning recommendations"""
    user = request.user
    
    recommendations = []
    
    # Get user's progress
    from progress.models import LevelProgress, DailyProgress
    from groups.models import GroupProgress
    
    # Check daily goal
    today = timezone.now().date()
    today_progress = DailyProgress.objects.filter(user=user, date=today).first()
    if not today_progress or today_progress.levels_completed == 0:
        recommendations.append({
            'type': 'daily_goal',
            'priority': 'high',
            'title': 'Complete Your Daily Goal',
            'message': 'Complete at least one level today to maintain your streak!',
            'action': 'start_level',
            'icon': '🎯'
        })
    
    # Check plant health
    try:
        from plants.models import UserPlant
        user_plant = UserPlant.objects.get(user=user)
        if user_plant.health_points < 50:
            recommendations.append({
                'type': 'plant_care',
                'priority': 'high',
                'title': 'Your Plant Needs Care',
                'message': 'Your plant is wilting! Water it to improve its health.',
                'action': 'care_plant',
                'icon': '🌱'
            })
    except:
        pass
    
    # Check group progress
    incomplete_groups = GroupProgress.objects.filter(
        user=user,
        is_unlocked=True,
        is_completed=False
    ).order_by('group__group_number')
    
    if incomplete_groups.exists():
        next_group = incomplete_groups.first()
        recommendations.append({
            'type': 'group_progress',
            'priority': 'medium',
            'title': f'Continue {next_group.group.name}',
            'message': f'You\'re {next_group.completion_percentage:.1f}% complete with this group.',
            'action': 'continue_group',
            'group_id': next_group.group.id,
            'icon': '📚'
        })
    
    # Check streak maintenance
    streak_data = progress_overview(request)
    if hasattr(streak_data, 'data') and streak_data.data.get('current_streak', 0) > 0:
        recommendations.append({
            'type': 'streak_maintenance',
            'priority': 'low',
            'title': f'Maintain Your {streak_data.data["current_streak"]}-Day Streak',
            'message': 'Keep up the great work! Your learning streak is impressive.',
            'action': 'continue_learning',
            'icon': '🔥'
        })
    
    return Response({
        'recommendations': recommendations,
        'total_recommendations': len(recommendations),
        'generated_at': timezone.now()
    })


# ===== URL PATTERNS =====

urlpatterns = [
    # Main learning dashboard
    path('', learning_dashboard, name='learning-dashboard'),
    
    # Groups
    path('groups/', my_groups, name='learning-groups'),
    path('groups/<int:group_number>/', GroupDetailView.as_view(), name='learning-group-detail'),
    path('groups/<int:group_number>/levels/', GroupLevelsView.as_view(), name='learning-group-levels'),
    path('groups/<int:group_number>/unlock/', unlock_group, name='learning-group-unlock'),
    path('groups/<int:group_number>/complete/', complete_group, name='learning-group-complete'),
    path('groups/<int:group_number>/stats/', group_stats, name='learning-group-stats'),
    
    # Levels within groups
    path('groups/<int:group_number>/levels/<int:level_number>/', LevelDetailView.as_view(), name='learning-level-detail'),
    path('groups/<int:group_number>/levels/<int:level_number>/questions/', LevelQuestionsView.as_view(), name='learning-level-questions'),
    path('groups/<int:group_number>/levels/<int:level_number>/complete/', complete_level, name='learning-level-complete'),
    
    # Questions
    path('questions/submit-answer/', submit_answer, name='learning-submit-answer'),
    
    # User Progress
    path('my-progress/', LevelCompletionListView.as_view(), name='learning-my-progress'),
    path('my-progress/<int:pk>/', LevelCompletionDetailView.as_view(), name='learning-my-progress-detail'),
    path('my-stats/', level_stats, name='learning-my-stats'),
    path('next-level/', get_next_level, name='learning-next-level'),
    path('test-levels/', get_test_levels, name='learning-test-levels'),
    
    # Unlock Tests
    path('unlock-tests/', GroupUnlockTestListView.as_view(), name='learning-unlock-tests'),
    path('unlock-tests/<int:test_id>/', GroupUnlockTestDetailView.as_view(), name='learning-unlock-test-detail'),
    path('unlock-tests/<int:test_id>/start/', start_unlock_test, name='learning-unlock-test-start'),
    path('unlock-tests/<int:test_id>/submit/', submit_unlock_test, name='learning-unlock-test-submit'),
    path('unlock-attempts/', GroupUnlockTestAttemptListView.as_view(), name='learning-unlock-attempts'),
    
    # Statistics and Recommendations
    path('stats/', learning_stats, name='learning-stats'),
    path('recommendations/', learning_recommendations, name='learning-recommendations'),
    
    # Plant System
    path('my-plant/', get_user_plant, name='learning-my-plant'),
    path('plant/create/', create_user_plant, name='learning-plant-create'),
    path('plant/care/', care_plant, name='learning-plant-care'),
    path('plant/stats/', plant_stats, name='learning-plant-stats'),
    path('plant/update-progress/', update_plant_progress, name='learning-plant-update-progress'),
    path('plant/recommendations/', get_plant_recommendations, name='learning-plant-recommendations'),
    path('plant/achievements/', get_plant_achievements, name='learning-plant-achievements'),
]
