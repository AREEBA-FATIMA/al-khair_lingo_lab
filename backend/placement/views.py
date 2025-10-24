from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
from .models import PlacementTest, PlacementTestAttempt
from .serializers import PlacementTestSerializer, PlacementTestAttemptSerializer


class PlacementTestListView(generics.ListAPIView):
    """List placement tests with filtering"""
    serializer_class = PlacementTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter placement tests based on query parameters"""
        queryset = PlacementTest.objects.filter(is_active=True)
        
        # Filter by test type
        test_type = self.request.query_params.get('test_type')
        if test_type:
            queryset = queryset.filter(test_type=test_type)
        
        # Filter by difficulty level
        difficulty_level = self.request.query_params.get('difficulty_level')
        if difficulty_level:
            queryset = queryset.filter(difficulty_level=difficulty_level)
        
        # Filter by target track
        target_track = self.request.query_params.get('target_track')
        if target_track:
            queryset = queryset.filter(target_track=target_track)
        
        return queryset.order_by('difficulty_level', 'name')


class PlacementTestDetailView(generics.RetrieveAPIView):
    """Get specific placement test details"""
    queryset = PlacementTest.objects.filter(is_active=True)
    serializer_class = PlacementTestSerializer
    permission_classes = [permissions.IsAuthenticated]


class PlacementTestAttemptListView(generics.ListAPIView):
    """List user's placement test attempts"""
    serializer_class = PlacementTestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PlacementTestAttempt.objects.filter(user=self.request.user).order_by('-started_at')


class PlacementTestAttemptDetailView(generics.RetrieveAPIView):
    """Get specific placement test attempt details"""
    serializer_class = PlacementTestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PlacementTestAttempt.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_placement_test(request, test_id):
    """Start a placement test"""
    try:
        test = PlacementTest.objects.get(id=test_id, is_active=True)
        user = request.user
        
        # Check if user already has an active attempt
        active_attempt = PlacementTestAttempt.objects.filter(
            user=user,
            test=test,
            status='in_progress'
        ).first()
        
        if active_attempt:
            return Response({
                'message': 'You already have an active test attempt',
                'attempt_id': active_attempt.id,
                'test': PlacementTestSerializer(test).data
            })
        
        # Create new test attempt
        attempt = PlacementTestAttempt.objects.create(
            user=user,
            test=test,
            status='in_progress',
            started_at=timezone.now()
        )
        
        return Response({
            'message': 'Test started successfully',
            'attempt_id': attempt.id,
            'test': PlacementTestSerializer(test).data,
            'time_limit_minutes': test.time_limit_minutes
        })
        
    except PlacementTest.DoesNotExist:
        return Response(
            {'error': 'Test not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_placement_test(request, test_id):
    """Submit placement test answers"""
    try:
        test = PlacementTest.objects.get(id=test_id, is_active=True)
        user = request.user
        
        # Get the latest attempt
        try:
            attempt = PlacementTestAttempt.objects.filter(
                user=user,
                test=test,
                status='in_progress'
            ).latest('started_at')
        except PlacementTestAttempt.DoesNotExist:
            return Response({
                'error': 'No active test attempt found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get answers from request
        answers = request.data.get('answers', {})
        time_taken = request.data.get('time_taken_seconds', 0)
        
        # Calculate score (simplified - in real app, validate against actual questions)
        correct_answers = 0
        total_questions = test.questions_count
        
        # For demo purposes, assume 80% correct answers
        correct_answers = int(total_questions * 0.8)
        
        # Update attempt
        attempt.user_answers = answers
        attempt.correct_answers = correct_answers
        attempt.total_questions = total_questions
        attempt.time_taken_seconds = time_taken
        attempt.score = correct_answers
        attempt.percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        attempt.passed = attempt.percentage >= test.pass_threshold
        attempt.excellent_score = attempt.percentage >= test.excellent_threshold
        attempt.status = 'completed'
        attempt.completed_at = timezone.now()
        
        # Calculate XP earned
        if attempt.passed:
            attempt.xp_earned = test.xp_reward
            if attempt.excellent_score:
                attempt.xp_earned = int(attempt.xp_earned * 1.5)  # Bonus for excellent score
        
        attempt.save()
        
        # Handle skip logic if passed
        skip_destination = None
        if attempt.passed:
            if test.skip_to_group:
                skip_destination = f"Group {test.skip_to_group.group_number}: {test.skip_to_group.name}"
            elif test.skip_to_level:
                skip_destination = f"Level {test.skip_to_level.level_number}: {test.skip_to_level.name}"
            elif test.skip_entire_track:
                skip_destination = f"Skip to {test.target_track} track"
            
            attempt.skip_action_taken = True
            attempt.skip_destination = skip_destination
            attempt.save()
        
        return Response({
            'message': 'Test submitted successfully',
            'score': attempt.score,
            'percentage': attempt.percentage,
            'passed': attempt.passed,
            'excellent_score': attempt.excellent_score,
            'xp_earned': attempt.xp_earned,
            'skip_destination': skip_destination,
            'feedback': f"You scored {attempt.percentage:.1f}%. {'Excellent!' if attempt.excellent_score else 'Good job!' if attempt.passed else 'Keep practicing!'}"
        })
        
    except PlacementTest.DoesNotExist:
        return Response(
            {'error': 'Test not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_available_tests(request):
    """Get available placement tests for user"""
    user = request.user
    
    # Get tests based on user's current progress
    # For demo, return all tests
    tests = PlacementTest.objects.filter(is_active=True).order_by('difficulty_level')
    
    # Add attempt status for each test
    tests_with_status = []
    for test in tests:
        latest_attempt = PlacementTestAttempt.objects.filter(
            user=user,
            test=test
        ).order_by('-started_at').first()
        
        test_data = PlacementTestSerializer(test).data
        if latest_attempt:
            test_data['latest_attempt'] = {
                'status': latest_attempt.status,
                'score': latest_attempt.score,
                'percentage': latest_attempt.percentage,
                'passed': latest_attempt.passed,
                'started_at': latest_attempt.started_at,
                'completed_at': latest_attempt.completed_at
            }
        else:
            test_data['latest_attempt'] = None
        
        tests_with_status.append(test_data)
    
    return Response(tests_with_status)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def placement_stats(request):
    """Get user's placement test statistics"""
    user = request.user
    
    # Get all attempts
    attempts = PlacementTestAttempt.objects.filter(user=user)
    
    # Calculate stats
    total_attempts = attempts.count()
    passed_attempts = attempts.filter(passed=True).count()
    excellent_attempts = attempts.filter(excellent_score=True).count()
    
    # Calculate average scores
    avg_score = attempts.aggregate(avg=Avg('score'))['avg'] or 0
    avg_percentage = attempts.aggregate(avg=Avg('percentage'))['avg'] or 0
    
    # Calculate total XP earned
    total_xp = attempts.aggregate(total=Sum('xp_earned'))['total'] or 0
    
    # Get recent attempts
    recent_attempts = attempts.order_by('-started_at')[:5]
    recent_attempts_data = PlacementTestAttemptSerializer(recent_attempts, many=True).data
    
    stats = {
        'total_attempts': total_attempts,
        'passed_attempts': passed_attempts,
        'excellent_attempts': excellent_attempts,
        'pass_rate': (passed_attempts / total_attempts * 100) if total_attempts > 0 else 0,
        'average_score': round(avg_score, 2),
        'average_percentage': round(avg_percentage, 2),
        'total_xp_earned': total_xp,
        'recent_attempts': recent_attempts_data
    }
    
    return Response(stats)


class PlacementTestViewSet(ModelViewSet):
    """ViewSet for placement test management (admin only)"""
    queryset = PlacementTest.objects.all()
    serializer_class = PlacementTestSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['test_type', 'difficulty_level', 'target_track', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['difficulty_level', 'name', 'created_at']
    ordering = ['difficulty_level', 'name']


class PlacementTestAttemptViewSet(ModelViewSet):
    """ViewSet for placement test attempt management (admin only)"""
    queryset = PlacementTestAttempt.objects.all()
    serializer_class = PlacementTestAttemptSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['status', 'passed', 'excellent_score', 'user', 'test']
    search_fields = ['user__username', 'test__name']
    ordering_fields = ['started_at', 'completed_at', 'percentage']
    ordering = ['-started_at']

