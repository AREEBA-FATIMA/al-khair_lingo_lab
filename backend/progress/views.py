from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Avg
from .models import LevelProgress
from levels.models import Level, Question
from groups.models import Group, GroupProgress
from .serializers import LevelProgressSerializer, ProgressOverviewSerializer, RecentActivitySerializer, AchievementSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def progress_overview(request):
    """Get user's overall progress overview"""
    user = request.user
    
    # Get user's actual progress
    total_levels = Level.objects.filter(is_active=True).count()
    user_progress = LevelProgress.objects.filter(user=user)
    completed_levels = user_progress.filter(is_completed=True).count()
    total_xp = user_progress.aggregate(total=Sum('xp_earned'))['total'] or 0
    
    # Calculate streaks based on days with at least one completed level
    # Get unique local dates where user completed any level
    completed_qs = user_progress.filter(is_completed=True, completed_at__isnull=False)
    dates = list(
        completed_qs.order_by().values_list('completed_at', flat=True)
    )
    unique_days = set()
    for dt in dates:
        # normalize to date in user's timezone
        local_dt = timezone.localtime(dt)
        unique_days.add(local_dt.date())

    # Compute current streak ending today (or yesterday if no completion today)
    today = timezone.localdate()
    current_streak = 0
    # If user didn't complete anything today but did yesterday, allow streak to count back from yesterday
    start_day = today if today in unique_days else (today - timedelta(days=1) if (today - timedelta(days=1)) in unique_days else None)
    if start_day:
        d = start_day
        while d in unique_days:
            current_streak += 1
            d = d - timedelta(days=1)

    # Compute longest streak across all days
    longest_streak = 0
    if unique_days:
        sorted_days = sorted(unique_days)
        streak = 1
        for i in range(1, len(sorted_days)):
            prev_day = sorted_days[i - 1]
            day = sorted_days[i]
            if day == prev_day + timedelta(days=1):
                streak += 1
            else:
                longest_streak = max(longest_streak, streak)
                streak = 1
        longest_streak = max(longest_streak, streak)
    average_score = user_progress.aggregate(avg=Avg('completion_percentage'))['avg'] or 0
    time_spent_minutes = user_progress.aggregate(total=Sum('time_spent'))['total'] or 0
    total_groups_completed = 0  # TODO: Implement group completion tracking
    
    # Calculate overall completion percentage
    total_possible_xp = total_levels * 10  # Assuming 10 XP per level
    completion_percentage = (total_xp / total_possible_xp * 100) if total_possible_xp > 0 else 0
    
    # Determine plant stage
    plant_stage = "Seed"
    if completion_percentage >= 80:
        plant_stage = "Fruit Tree"
    elif completion_percentage >= 60:
        plant_stage = "Tree"
    elif completion_percentage >= 40:
        plant_stage = "Sapling"
    elif completion_percentage >= 20:
        plant_stage = "Sprout"
    
    # Default current level
    current_level = user_progress.order_by('-level__level_number').first().level.level_number + 1 if completed_levels > 0 else 1
    
    overview = {
        'total_xp': total_xp,
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        # Hearts: without per-attempt failure storage on backend, keep 5 as default.
        'hearts': 5,
        'daily_goal': 50, # Default daily goal
        'total_levels_completed': completed_levels,
        'total_groups_completed': total_groups_completed,
        'average_score': round(average_score, 2),
        'time_spent_minutes': time_spent_minutes,
        'current_level': current_level,
        'plant_stage': plant_stage,
        'completion_percentage': round(completion_percentage, 2)
    }
    
    serializer = ProgressOverviewSerializer(overview)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_progress(request):
    """Save level completion progress"""
    user = request.user
    level_id = request.data.get('level_id')
    score = request.data.get('score', 0)
    total = request.data.get('total', 6)
    xp_earned = request.data.get('xp_earned', 0)
    passed = request.data.get('passed', False)
    time_spent = request.data.get('time_spent', 0)
            
    if not level_id:
        return Response(
            {'error': 'level_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        level = Level.objects.get(id=level_id, is_active=True)
    except Level.DoesNotExist:
        return Response(
            {'error': 'Level not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Calculate completion percentage
    completion_percentage = (score / total * 100) if total > 0 else 0
    
    # Create or update level progress
    level_progress, created = LevelProgress.objects.get_or_create(
        user=user,
        level=level,
        defaults={
            'is_completed': passed,
            'completion_percentage': completion_percentage,
            'questions_answered': total,
            'correct_answers': score,
            'xp_earned': xp_earned if passed else 0,
            'time_spent': time_spent,
            'completed_at': timezone.now() if passed else None
        }
    )
    
    if not created:
        # Update existing progress
        level_progress.is_completed = passed
        level_progress.completion_percentage = completion_percentage
        level_progress.questions_answered = total
        level_progress.correct_answers = score
        level_progress.xp_earned = xp_earned if passed else 0
        level_progress.time_spent = time_spent
        if passed:
            level_progress.completed_at = timezone.now()
        level_progress.save()
    
    return Response({
        'success': True,
        'message': 'Progress saved successfully',
        'level_id': level_id,
        'score': score,
        'total': total,
        'passed': passed,
        'xp_earned': xp_earned,
        'completion_percentage': completion_percentage
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def load_progress(request):
    """Load user's progress for specific levels"""
    user = request.user
    level_ids = request.GET.getlist('level_ids')
    
    if not level_ids:
        return Response({'error': 'level_ids parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    level_progress = LevelProgress.objects.filter(user=user, level_id__in=level_ids)
    serializer = LevelProgressSerializer(level_progress, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_activity(request):
    """Get user's recent learning activity"""
    user = request.user
    
    # Get recent completed levels
    recent_levels = LevelProgress.objects.filter(
        user=user,
        is_completed=True
    ).order_by('-completed_at')[:10]
    
    activities = []
    for progress in recent_levels:
        activities.append({
            'type': 'level_completed',
            'level_name': progress.level.name,
            'level_number': progress.level.level_number,
            'xp_earned': progress.xp_earned,
            'completion_percentage': progress.completion_percentage,
            'completed_at': progress.completed_at
        })
    
    serializer = RecentActivitySerializer(activities, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def achievements(request):
    """Get user's achievements"""
    user = request.user
    
    # Calculate achievements based on progress
    achievements = []
    
    # Level completion achievements
    completed_levels = LevelProgress.objects.filter(user=user, is_completed=True).count()
    if completed_levels >= 1:
        achievements.append({
            'id': 'first_level',
            'name': 'First Steps',
            'description': 'Complete your first level',
            'icon': '🎯',
            'earned_at': timezone.now()
        })
    
    if completed_levels >= 10:
        achievements.append({
            'id': 'level_10',
            'name': 'Getting Started',
            'description': 'Complete 10 levels',
            'icon': '🌟',
            'earned_at': timezone.now()
        })
    
    if completed_levels >= 50:
        achievements.append({
            'id': 'level_50',
            'name': 'Halfway There',
            'description': 'Complete 50 levels',
            'icon': '🏆',
            'earned_at': timezone.now()
        })
    
    # XP achievements
    total_xp = LevelProgress.objects.filter(user=user).aggregate(total=Sum('xp_earned'))['total'] or 0
    if total_xp >= 100:
        achievements.append({
            'id': 'xp_100',
            'name': 'XP Collector',
            'description': 'Earn 100 XP',
            'icon': '⚡',
            'earned_at': timezone.now()
        })
    
    if total_xp >= 500:
        achievements.append({
            'id': 'xp_500',
            'name': 'XP Master',
            'description': 'Earn 500 XP',
            'icon': '🔥',
            'earned_at': timezone.now()
        })
    
    serializer = AchievementSerializer(achievements, many=True)
    return Response(serializer.data)