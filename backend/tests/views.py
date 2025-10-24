from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q, Avg, Count, Sum, Max
from django.utils import timezone
from .models import TestExercise, TestQuestion, TestAttempt
from .serializers import (
    TestExerciseSerializer, TestQuestionSerializer, TestAttemptSerializer,
    TestAttemptCreateSerializer, TestStatsSerializer
)


class TestExerciseListView(generics.ListAPIView):
    """List all test exercises"""
    queryset = TestExercise.objects.filter(is_active=True)
    serializer_class = TestExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter tests based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by test type
        test_type = self.request.query_params.get('test_type')
        if test_type:
            queryset = queryset.filter(test_type=test_type)
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Filter by level range
        level = self.request.query_params.get('level')
        if level:
            try:
                level_num = int(level)
                queryset = queryset.filter(
                    target_level_range_start__lte=level_num,
                    target_level_range_end__gte=level_num
                )
            except ValueError:
                pass
        
        return queryset


class TestExerciseDetailView(generics.RetrieveAPIView):
    """Get specific test exercise details"""
    queryset = TestExercise.objects.filter(is_active=True)
    serializer_class = TestExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]


class TestQuestionListView(generics.ListAPIView):
    """Get questions for a specific test"""
    serializer_class = TestQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        test_id = self.kwargs['test_id']
        try:
            test = TestExercise.objects.get(id=test_id, is_active=True)
            return test.get_questions()
        except TestExercise.DoesNotExist:
            return TestQuestion.objects.none()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_test(request, test_id):
    """Start a test attempt"""
    try:
        test = TestExercise.objects.get(id=test_id, is_active=True)
    except TestExercise.DoesNotExist:
        return Response(
            {'error': 'Test not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user already has an incomplete attempt
    existing_attempt = TestAttempt.objects.filter(
        user=request.user,
        test=test,
        status='in_progress'
    ).first()
    
    if existing_attempt:
        return Response(
            {'error': 'You already have an incomplete attempt for this test'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create new attempt
    attempt = TestAttempt.objects.create(
        user=request.user,
        test=test,
        status='in_progress'
    )
    
    serializer = TestAttemptSerializer(attempt)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_test(request, test_id):
    """Submit test answers and complete attempt"""
    try:
        test = TestExercise.objects.get(id=test_id, is_active=True)
    except TestExercise.DoesNotExist:
        return Response(
            {'error': 'Test not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get or create attempt
    attempt, created = TestAttempt.objects.get_or_create(
        user=request.user,
        test=test,
        status='in_progress',
        defaults={'started_at': timezone.now()}
    )
    
    if not created and attempt.status != 'in_progress':
        return Response(
            {'error': 'No active attempt found for this test'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create serializer with data
    serializer = TestAttemptCreateSerializer(
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
            TestAttemptSerializer(attempt).data,
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TestAttemptListView(generics.ListAPIView):
    """List user's test attempts"""
    serializer_class = TestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TestAttempt.objects.filter(user=self.request.user).order_by('-started_at')


class TestAttemptDetailView(generics.RetrieveAPIView):
    """Get specific test attempt details"""
    serializer_class = TestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TestAttempt.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def test_stats(request):
    """Get user's test statistics"""
    user = request.user
    
    # Get attempts
    attempts = TestAttempt.objects.filter(user=user)
    
    # Calculate stats
    total_tests_attempted = attempts.count()
    tests_passed = attempts.filter(passed=True).count()
    tests_failed = attempts.filter(passed=False).count()
    average_score = attempts.aggregate(avg=Avg('percentage'))['avg'] or 0
    total_xp_earned = attempts.aggregate(total=Sum('xp_earned'))['total'] or 0
    badges_earned = attempts.filter(badge_earned=True).count()
    best_score = attempts.aggregate(best=Max('percentage'))['best'] or 0
    
    # Calculate streaks
    passed_attempts = attempts.filter(passed=True).order_by('completed_at')
    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    last_date = None
    
    for attempt in passed_attempts:
        if attempt.completed_at:
            completion_date = attempt.completed_at.date()
            if last_date is None:
                temp_streak = 1
            elif (completion_date - last_date).days == 1:
                temp_streak += 1
            else:
                longest_streak = max(longest_streak, temp_streak)
                temp_streak = 1
            last_date = completion_date
    
    longest_streak = max(longest_streak, temp_streak)
    current_streak = temp_streak if last_date == timezone.now().date() else 0
    
    stats = {
        'total_tests_attempted': total_tests_attempted,
        'tests_passed': tests_passed,
        'tests_failed': tests_failed,
        'average_score': round(average_score, 2),
        'total_xp_earned': total_xp_earned,
        'badges_earned': badges_earned,
        'best_score': round(best_score, 2),
        'current_streak': current_streak,
        'longest_streak': longest_streak
    }
    
    serializer = TestStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_available_tests(request):
    """Get tests available for user based on their level"""
    user = request.user
    
    # Get user's current level (simplified - in real app, get from level completions)
    # For now, we'll return all tests
    tests = TestExercise.objects.filter(is_active=True).order_by('target_level_range_start')
    
    serializer = TestExerciseSerializer(tests, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_test_recommendations(request):
    """Get test recommendations for user"""
    user = request.user
    
    # Get user's completed tests
    completed_tests = TestAttempt.objects.filter(
        user=user,
        passed=True
    ).values_list('test_id', flat=True)
    
    # Get available tests (not completed)
    available_tests = TestExercise.objects.filter(
        is_active=True
    ).exclude(id__in=completed_tests).order_by('difficulty', 'target_level_range_start')
    
    serializer = TestExerciseSerializer(available_tests[:5], many=True)  # Top 5 recommendations
    return Response(serializer.data)


class TestExerciseViewSet(ModelViewSet):
    """ViewSet for test exercise management (admin only)"""
    queryset = TestExercise.objects.all()
    serializer_class = TestExerciseSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['test_type', 'difficulty', 'is_active', 'is_required']
    search_fields = ['name', 'description']
    ordering_fields = ['target_level_range_start', 'difficulty', 'created_at']
    ordering = ['target_level_range_start', 'difficulty']


class TestQuestionViewSet(ModelViewSet):
    """ViewSet for test question management (admin only)"""
    queryset = TestQuestion.objects.all()
    serializer_class = TestQuestionSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['question_type', 'difficulty', 'is_active', 'test']
    search_fields = ['question_text']
    ordering_fields = ['question_order', 'difficulty', 'created_at']
    ordering = ['test', 'question_order']


class TestAttemptViewSet(ModelViewSet):
    """ViewSet for test attempt management (admin only)"""
    queryset = TestAttempt.objects.all()
    serializer_class = TestAttemptSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['status', 'passed', 'test', 'user']
    search_fields = ['user__username', 'test__name']
    ordering_fields = ['started_at', 'percentage', 'score']
    ordering = ['-started_at']