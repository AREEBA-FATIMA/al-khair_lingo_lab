from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
from .models import Group, GroupProgress, GroupUnlockTest, GroupUnlockTestAttempt
from .serializers import (
    GroupSerializer, GroupProgressSerializer, GroupUnlockTestSerializer,
    GroupUnlockTestAttemptSerializer, GroupStatsSerializer
)
from levels.serializers import LevelSerializer
from cache_utils import cache_group_data, cache_api_response


class GroupListView(generics.ListAPIView):
    """List all groups with user progress"""
    serializer_class = GroupSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow any for testing
    
    def get_queryset(self):
        """Get groups with user progress"""
        groups = Group.objects.filter(is_active=True).order_by('group_number')
        
        # Add default progress for each group (for non-authenticated users)
        for group in groups:
            group.completion_percentage = 0
            group.levels_completed = 0
            group.total_levels = group.levels.count()
            group.xp_earned = 0
            group.is_unlocked = group.group_number <= 1  # First group unlocked by default
        
        return groups


class GroupDetailView(generics.RetrieveAPIView):
    """Get specific group details with progress"""
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'group_number'
    
    def get_queryset(self):
        return Group.objects.filter(is_active=True)


class GroupLevelsView(generics.ListAPIView):
    """Get all levels in a group with user progress"""
    serializer_class = LevelSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow any for testing
    
    def get_queryset(self):
        group_number = self.kwargs['group_number']
        
        try:
            group = Group.objects.get(group_number=group_number, is_active=True)
            levels = group.levels.filter(is_active=True).order_by('level_number')
            
            # Add default progress for each level (for non-authenticated users)
            for level in levels:
                level.completion_percentage = 0
                level.is_completed = False
                level.score = 0
                level.attempts = 0
                level.time_spent = 0
                level.is_unlocked = level.level_number <= 1  # First level unlocked by default
            
            return levels
        except Group.DoesNotExist:
            return []


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unlock_group(request, group_number):
    """Unlock a group for user"""
    try:
        group = Group.objects.get(group_number=group_number, is_active=True)
        user = request.user
        
        # Check if user is eligible to unlock this group
        if group.group_number == 1:
            # First group is always unlocked
            progress, created = GroupProgress.objects.get_or_create(
                user=user,
                group=group,
                defaults={'is_unlocked': True, 'unlocked_at': timezone.now()}
            )
            if not created:
                progress.unlock_group()
            
            return Response({
                'message': 'Group unlocked successfully',
                'group': GroupSerializer(group).data
            })
        
        # Check if previous group is completed
        previous_group = Group.objects.filter(
            group_number=group_number - 1,
            is_active=True
        ).first()
        
        if previous_group:
            try:
                prev_progress = GroupProgress.objects.get(user=user, group=previous_group)
                if not prev_progress.is_completed:
                    return Response({
                        'error': 'Complete previous group first'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except GroupProgress.DoesNotExist:
                return Response({
                    'error': 'Complete previous group first'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Unlock the group
        progress, created = GroupProgress.objects.get_or_create(
            user=user,
            group=group,
            defaults={'is_unlocked': True, 'unlocked_at': timezone.now()}
        )
        if not created:
            progress.unlock_group()
        
        return Response({
            'message': 'Group unlocked successfully',
            'group': GroupSerializer(group).data
        })
        
    except Group.DoesNotExist:
        return Response(
            {'error': 'Group not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_group(request, group_number):
    """Mark group as completed"""
    try:
        group = Group.objects.get(group_number=group_number, is_active=True)
        user = request.user
        
        progress, created = GroupProgress.objects.get_or_create(
            user=user,
            group=group
        )
        
        # Calculate completion percentage
        total_levels = group.levels.count()
        completed_levels = progress.levels_completed
        
        if total_levels > 0:
            completion_percentage = (completed_levels / total_levels) * 100
        else:
            completion_percentage = 0
        
        # Mark as completed if 80% or more levels are done
        if completion_percentage >= 80:
            progress.complete_group()
            
            # Unlock next group
            next_group = Group.objects.filter(
                group_number=group_number + 1,
                is_active=True
            ).first()
            
            if next_group:
                next_progress, _ = GroupProgress.objects.get_or_create(
                    user=user,
                    group=next_group
                )
                next_progress.unlock_group()
            
            return Response({
                'message': 'Group completed successfully',
                'completion_percentage': completion_percentage,
                'next_group_unlocked': next_group is not None
            })
        else:
            return Response({
                'error': f'Complete {80 - completion_percentage:.1f}% more levels to finish group'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Group.DoesNotExist:
        return Response(
            {'error': 'Group not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@cache_group_data(timeout=300)  # 5 minutes cache
def group_stats(request, group_number):
    """Get group statistics for user"""
    try:
        group = Group.objects.get(group_number=group_number, is_active=True)
        user = request.user
        
        try:
            progress = GroupProgress.objects.get(user=user, group=group)
        except GroupProgress.DoesNotExist:
            progress = GroupProgress.objects.create(user=user, group=group)
        
        stats = {
            'group': GroupSerializer(group).data,
            'progress': GroupProgressSerializer(progress).data,
            'total_levels': group.levels.count(),
            'completed_levels': progress.levels_completed,
            'completion_percentage': progress.completion_percentage,
            'is_unlocked': progress.is_unlocked,
            'is_completed': progress.is_completed,
            'total_xp_earned': progress.total_xp_earned,
            'time_spent_minutes': progress.time_spent_minutes
        }
        
        return Response(stats)
        
    except Group.DoesNotExist:
        return Response(
            {'error': 'Group not found'},
            status=status.HTTP_404_NOT_FOUND
        )


class GroupUnlockTestListView(generics.ListAPIView):
    """List available unlock tests"""
    serializer_class = GroupUnlockTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return GroupUnlockTest.objects.filter(is_active=True)


class GroupUnlockTestDetailView(generics.RetrieveAPIView):
    """Get specific unlock test details"""
    serializer_class = GroupUnlockTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return GroupUnlockTest.objects.filter(is_active=True)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_unlock_test(request, test_id):
    """Start an unlock test"""
    try:
        test = GroupUnlockTest.objects.get(id=test_id, is_active=True)
        user = request.user
        
        # Check if user is eligible for this test
        if not test.group.is_eligible_for_level(user.current_level or 1):
            return Response({
                'error': 'You are not eligible for this test'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create test attempt
        attempt = GroupUnlockTestAttempt.objects.create(
            user=user,
            test=test,
            started_at=timezone.now()
        )
        
        return Response({
            'message': 'Test started successfully',
            'attempt_id': attempt.id,
            'test': GroupUnlockTestSerializer(test).data
        })
        
    except GroupUnlockTest.DoesNotExist:
        return Response(
            {'error': 'Test not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_unlock_test(request, test_id):
    """Submit unlock test answers"""
    try:
        test = GroupUnlockTest.objects.get(id=test_id, is_active=True)
        user = request.user
        
        # Get the latest attempt
        try:
            attempt = GroupUnlockTestAttempt.objects.filter(
                user=user,
                test=test,
                completed_at__isnull=True
            ).latest('started_at')
        except GroupUnlockTestAttempt.DoesNotExist:
            return Response({
                'error': 'No active test attempt found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Process answers
        answers = request.data.get('answers', {})
        correct_answers = 0
        total_questions = test.questions_count
        
        # Calculate score (simplified - in real app, you'd check against actual questions)
        for question_id, answer in answers.items():
            # This is a simplified scoring - replace with actual question validation
            if answer:  # Assuming any non-empty answer is correct for demo
                correct_answers += 1
        
        # Update attempt
        attempt.user_answers = answers
        attempt.correct_answers = correct_answers
        attempt.total_questions = total_questions
        attempt.time_taken_seconds = int((timezone.now() - attempt.started_at).total_seconds())
        attempt.complete_test()
        
        # Update group progress if passed
        if attempt.passed:
            group_progress, _ = GroupProgress.objects.get_or_create(
                user=user,
                group=test.group
            )
            group_progress.record_unlock_test_attempt(
                attempt.percentage,
                attempt.passed
            )
        
        return Response({
            'message': 'Test submitted successfully',
            'score': attempt.percentage,
            'passed': attempt.passed,
            'xp_earned': attempt.xp_earned
        })
        
    except GroupUnlockTest.DoesNotExist:
        return Response(
            {'error': 'Test not found'},
            status=status.HTTP_404_NOT_FOUND
        )


class GroupUnlockTestAttemptListView(generics.ListAPIView):
    """List user's unlock test attempts"""
    serializer_class = GroupUnlockTestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return GroupUnlockTestAttempt.objects.filter(
            user=self.request.user
        ).order_by('-started_at')


class GroupViewSet(ModelViewSet):
    """ViewSet for group management (admin only)"""
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['difficulty', 'is_unlocked', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['group_number', 'difficulty', 'created_at']
    ordering = ['group_number']