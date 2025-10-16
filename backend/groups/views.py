from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q, Avg, Count, Sum, Max
from django.utils import timezone
from .models import Group, GroupProgress, GroupUnlockTest, GroupUnlockTestAttempt
from .serializers import (
    GroupSerializer, GroupProgressSerializer, GroupUnlockTestSerializer,
    GroupUnlockTestAttemptSerializer, GroupUnlockTestAttemptCreateSerializer,
    GroupStatsSerializer
)


class GroupListView(generics.ListAPIView):
    """List all groups"""
    queryset = Group.objects.filter(is_active=True)
    serializer_class = GroupSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Filter groups based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Filter by unlocked status
        is_unlocked = self.request.query_params.get('is_unlocked')
        if is_unlocked is not None:
            queryset = queryset.filter(is_unlocked=is_unlocked.lower() == 'true')
        
        return queryset


class GroupDetailView(generics.RetrieveAPIView):
    """Get specific group details"""
    queryset = Group.objects.filter(is_active=True)
    serializer_class = GroupSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'group_number'


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_groups(request):
    """Get groups with user's progress"""
    user = request.user
    
    # Get all groups
    groups = Group.objects.filter(is_active=True).order_by('group_number')
    
    # Get user's progress for each group
    group_progress = GroupProgress.objects.filter(user=user)
    progress_dict = {gp.group.id: gp for gp in group_progress}
    
    # Serialize groups with progress
    group_data = []
    for group in groups:
        group_serializer = GroupSerializer(group)
        group_info = group_serializer.data
        
        # Add progress info
        if group.id in progress_dict:
            progress_serializer = GroupProgressSerializer(progress_dict[group.id])
            group_info['progress'] = progress_serializer.data
        else:
            group_info['progress'] = {
                'is_unlocked': group.is_unlocked,
                'is_completed': False,
                'completion_percentage': 0.0,
                'levels_completed': 0,
                'total_xp_earned': 0
            }
        
        group_data.append(group_info)
    
    return Response(group_data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unlock_group(request, group_id):
    """Unlock a group for user"""
    try:
        group = Group.objects.get(id=group_id, is_active=True)
    except Group.DoesNotExist:
        return Response(
            {'error': 'Group not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if group is already unlocked
    group_progress, created = GroupProgress.objects.get_or_create(
        user=request.user,
        group=group
    )
    
    if group_progress.is_unlocked:
        return Response(
            {'message': 'Group is already unlocked'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check unlock conditions
    if group.unlock_condition == 'complete_previous':
        # Check if previous group is completed
        prev_group = group.get_previous_group()
        if prev_group:
            prev_progress = GroupProgress.objects.filter(
                user=request.user,
                group=prev_group
            ).first()
            if not prev_progress or not prev_progress.is_completed:
                return Response(
                    {'error': 'Previous group must be completed first'},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
    # Unlock the group
    group_progress.unlock_group()
    
    return Response(
        GroupProgressSerializer(group_progress).data,
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_group(request, group_id):
    """Mark group as completed"""
    try:
        group = Group.objects.get(id=group_id, is_active=True)
    except Group.DoesNotExist:
        return Response(
            {'error': 'Group not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get or create group progress
    group_progress, created = GroupProgress.objects.get_or_create(
        user=request.user,
        group=group
    )
    
    if not group_progress.is_unlocked:
        return Response(
            {'error': 'Group must be unlocked first'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if group_progress.is_completed:
        return Response(
            {'message': 'Group is already completed'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Complete the group
    group_progress.complete_group()
    
    # Update user's total XP
    user = request.user
    user.total_xp += group.xp_reward
    user.save()
    
    return Response(
        GroupProgressSerializer(group_progress).data,
        status=status.HTTP_200_OK
    )


class GroupUnlockTestListView(generics.ListAPIView):
    """List group unlock tests"""
    queryset = GroupUnlockTest.objects.filter(is_active=True)
    serializer_class = GroupUnlockTestSerializer
    permission_classes = [permissions.AllowAny]


class GroupUnlockTestDetailView(generics.RetrieveAPIView):
    """Get specific group unlock test details"""
    queryset = GroupUnlockTest.objects.filter(is_active=True)
    serializer_class = GroupUnlockTestSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_unlock_test(request, test_id):
    """Start a group unlock test"""
    try:
        test = GroupUnlockTest.objects.get(id=test_id, is_active=True)
    except GroupUnlockTest.DoesNotExist:
        return Response(
            {'error': 'Test not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user already has an incomplete attempt
    existing_attempt = GroupUnlockTestAttempt.objects.filter(
        user=request.user,
        test=test,
        completed_at__isnull=True
    ).first()
    
    if existing_attempt:
        return Response(
            {'error': 'You already have an incomplete attempt for this test'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create new attempt
    attempt = GroupUnlockTestAttempt.objects.create(
        user=request.user,
        test=test
    )
    
    serializer = GroupUnlockTestAttemptSerializer(attempt)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_unlock_test(request, test_id):
    """Submit group unlock test answers"""
    try:
        test = GroupUnlockTest.objects.get(id=test_id, is_active=True)
    except GroupUnlockTest.DoesNotExist:
        return Response(
            {'error': 'Test not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get or create attempt
    attempt = GroupUnlockTestAttempt.objects.filter(
        user=request.user,
        test=test,
        completed_at__isnull=True
    ).first()
    
    if not attempt:
        return Response(
            {'error': 'No active attempt found for this test'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create serializer with data
    serializer = GroupUnlockTestAttemptCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        # Complete the attempt
        attempt.complete_test()
        
        # Update user's total XP
        user = request.user
        user.total_xp += attempt.xp_earned
        user.save()
        
        return Response(
            GroupUnlockTestAttemptSerializer(attempt).data,
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupUnlockTestAttemptListView(generics.ListAPIView):
    """List user's group unlock test attempts"""
    serializer_class = GroupUnlockTestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return GroupUnlockTestAttempt.objects.filter(user=self.request.user).order_by('-started_at')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def group_stats(request):
    """Get user's group statistics"""
    user = request.user
    
    # Get group progress
    group_progress = GroupProgress.objects.filter(user=user)
    
    # Calculate stats
    total_groups = Group.objects.filter(is_active=True).count()
    unlocked_groups = group_progress.filter(is_unlocked=True).count()
    completed_groups = group_progress.filter(is_completed=True).count()
    total_xp_earned = group_progress.aggregate(total=Sum('total_xp_earned'))['total'] or 0
    badges_earned = group_progress.filter(is_completed=True).exclude(group__badge_name='').count()
    average_completion = group_progress.aggregate(avg=Avg('completion_percentage'))['avg'] or 0
    
    # Get current group
    current_group = group_progress.filter(
        is_unlocked=True,
        is_completed=False
    ).order_by('group__group_number').first()
    
    current_group_number = current_group.group.group_number if current_group else None
    
    # Get next group requirements
    next_group_requirements = {}
    if current_group:
        next_group = current_group.group.get_next_group()
        if next_group:
            next_group_requirements = {
                'group_number': next_group.group_number,
                'group_name': next_group.name,
                'unlock_condition': next_group.unlock_condition,
                'required_level': next_group.required_level
            }
    
    stats = {
        'total_groups': total_groups,
        'unlocked_groups': unlocked_groups,
        'completed_groups': completed_groups,
        'total_xp_earned': total_xp_earned,
        'badges_earned': badges_earned,
        'average_completion_percentage': round(average_completion, 2),
        'current_group': current_group_number,
        'next_group_requirements': next_group_requirements
    }
    
    serializer = GroupStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_group_recommendations(request):
    """Get group recommendations for user"""
    user = request.user
    
    # Get user's completed groups
    completed_groups = GroupProgress.objects.filter(
        user=user,
        is_completed=True
    ).values_list('group_id', flat=True)
    
    # Get available groups (not completed)
    available_groups = Group.objects.filter(
        is_active=True
    ).exclude(id__in=completed_groups).order_by('difficulty', 'group_number')
    
    serializer = GroupSerializer(available_groups[:5], many=True)  # Top 5 recommendations
    return Response(serializer.data)


class GroupViewSet(ModelViewSet):
    """ViewSet for group management (admin only)"""
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['difficulty', 'is_unlocked', 'is_active', 'unlock_condition']
    search_fields = ['name', 'description']
    ordering_fields = ['group_number', 'difficulty', 'created_at']
    ordering = ['group_number']


class GroupProgressViewSet(ModelViewSet):
    """ViewSet for group progress management (admin only)"""
    queryset = GroupProgress.objects.all()
    serializer_class = GroupProgressSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['is_unlocked', 'is_completed', 'group', 'user']
    search_fields = ['user__username', 'group__name']
    ordering_fields = ['created_at', 'completion_percentage', 'total_xp_earned']
    ordering = ['-created_at']


class GroupUnlockTestViewSet(ModelViewSet):
    """ViewSet for group unlock test management (admin only)"""
    queryset = GroupUnlockTest.objects.all()
    serializer_class = GroupUnlockTestSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['is_active', 'group']
    search_fields = ['name', 'description']
    ordering_fields = ['group__group_number', 'created_at']
    ordering = ['group__group_number']


class GroupUnlockTestAttemptViewSet(ModelViewSet):
    """ViewSet for group unlock test attempt management (admin only)"""
    queryset = GroupUnlockTestAttempt.objects.all()
    serializer_class = GroupUnlockTestAttemptSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['passed', 'test', 'user']
    search_fields = ['user__username', 'test__name']
    ordering_fields = ['started_at', 'percentage', 'score']
    ordering = ['-started_at']
