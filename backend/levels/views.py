from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
from .models import Level, Question, LevelCompletion
from .serializers import (
    LevelSerializer, QuestionSerializer, LevelCompletionSerializer,
    LevelCompletionCreateSerializer, LevelStatsSerializer
)
from cache_utils import cache_level_data, cache_api_response


class LevelListView(generics.ListAPIView):
    """List all levels with pagination and filtering"""
    queryset = Level.objects.filter(is_active=True).prefetch_related('questions')
    serializer_class = LevelSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter levels based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Filter by test level
        is_test_level = self.request.query_params.get('is_test_level')
        if is_test_level is not None:
            queryset = queryset.filter(is_test_level=is_test_level.lower() == 'true')
        
        # Filter by unlocked status
        is_unlocked = self.request.query_params.get('is_unlocked')
        if is_unlocked is not None:
            queryset = queryset.filter(is_unlocked=is_unlocked.lower() == 'true')
        
        return queryset


class LevelDetailView(generics.RetrieveAPIView):
    """Get specific level details"""
    queryset = Level.objects.filter(is_active=True).prefetch_related('questions')
    serializer_class = LevelSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'level_number'


class LevelQuestionsView(generics.ListAPIView):
    """Get questions for a specific level"""
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        level_number = self.kwargs['level_number']
        try:
            level = Level.objects.get(level_number=level_number, is_active=True)
            return level.questions.filter(is_active=True).order_by('question_order')
        except Level.DoesNotExist:
            return Question.objects.none()


class QuestionDetailView(generics.RetrieveAPIView):
    """Get specific question details"""
    queryset = Question.objects.filter(is_active=True)
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_answer(request):
    """Submit answer for a question"""
    question_id = request.data.get('question_id')
    user_answer = request.data.get('answer')
    
    if not question_id or not user_answer:
        return Response(
            {'error': 'question_id and answer are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        question = Question.objects.get(id=question_id, is_active=True)
        is_correct = question.validate_answer(user_answer)
        
        # Track question progress
        from progress.models import QuestionProgress
        question_progress, created = QuestionProgress.objects.get_or_create(
            user=request.user,
            question=question,
            defaults={
                'is_answered': True,
                'is_correct': is_correct,
                'user_answer': user_answer,
                'xp_earned': question.xp_value if is_correct else 0,
                'attempts': 1
            }
        )
        
        if not created:
            # Update existing progress
            question_progress.is_answered = True
            question_progress.is_correct = is_correct
            question_progress.user_answer = user_answer
            question_progress.attempts += 1
            question_progress.xp_earned = question.xp_value if is_correct else 0
            question_progress.save()
        
        # Update user's total XP if answer is correct
        if is_correct:
            user = request.user
            user.total_xp += question.xp_value
            user.save()
        
        return Response({
            'is_correct': is_correct,
            'correct_answer': question.correct_answer,
            'explanation': question.explanation,
            'xp_earned': question.xp_value if is_correct else 0,
            'attempts': question_progress.attempts,
            'hint': question.hint if not is_correct else None
        })
    except Question.DoesNotExist:
        return Response(
            {'error': 'Question not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_level(request):
    """Complete a level and record progress"""
    serializer = LevelCompletionCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        completion = serializer.save()
        
        # Update user's total XP
        user = request.user
        user.total_xp += completion.xp_earned
        user.save()
        
        # Update LevelProgress for this user and level
        from progress.models import LevelProgress
        level_progress, created = LevelProgress.objects.get_or_create(
            user=user,
            level=completion.level,
            defaults={
                'is_completed': completion.passed,
                'completion_percentage': completion.percentage,
                'questions_answered': completion.total_questions,
                'correct_answers': completion.correct_answers,
                'xp_earned': completion.xp_earned,
                'time_spent': completion.time_taken_seconds,
                'completed_at': completion.completed_at,
                'daily_level_completed': completion.passed
            }
        )
        
        if not created:
            # Update existing progress
            level_progress.is_completed = completion.passed
            level_progress.completion_percentage = completion.percentage
            level_progress.questions_answered = completion.total_questions
            level_progress.correct_answers = completion.correct_answers
            level_progress.xp_earned = completion.xp_earned
            level_progress.time_spent = completion.time_taken_seconds
            level_progress.completed_at = completion.completed_at
            level_progress.daily_level_completed = completion.passed
            level_progress.save()
        
        # Update group progress
        from groups.models import GroupProgress
        group = completion.level.group
        group_progress, created = GroupProgress.objects.get_or_create(
            user=user,
            group=group
        )
        
        if completion.passed:
            group_progress.levels_completed += 1
            group_progress.total_xp_earned += completion.xp_earned
            group_progress.time_spent_minutes += completion.time_taken_seconds // 60
            group_progress.last_accessed_at = timezone.now()
            
            # Calculate group completion percentage
            total_levels_in_group = group.levels.count()
            if total_levels_in_group > 0:
                group_progress.completion_percentage = (group_progress.levels_completed / total_levels_in_group) * 100
                
                # Check if group is completed (80% or more)
                if group_progress.completion_percentage >= 80 and not group_progress.is_completed:
                    group_progress.complete_group()
                    
                    # Unlock next group
                    next_group = group.get_next_group()
                    if next_group:
                        next_group_progress, _ = GroupProgress.objects.get_or_create(
                            user=user,
                            group=next_group
                        )
                        next_group_progress.unlock_group()
            
            group_progress.save()
        
        # Update daily progress
        from progress.models import DailyProgress
        today = timezone.now().date()
        daily_progress, created = DailyProgress.objects.get_or_create(
            user=user,
            date=today,
            defaults={
                'levels_completed': 1 if completion.passed else 0,
                'questions_answered': completion.total_questions,
                'correct_answers': completion.correct_answers,
                'xp_earned': completion.xp_earned,
                'time_spent': completion.time_taken_seconds // 60,
                'streak_maintained': True
            }
        )
        
        if not created and completion.passed:
            daily_progress.levels_completed += 1
            daily_progress.questions_answered += completion.total_questions
            daily_progress.correct_answers += completion.correct_answers
            daily_progress.xp_earned += completion.xp_earned
            daily_progress.time_spent += completion.time_taken_seconds // 60
            daily_progress.save()
        
        return Response({
            'success': True,
            'message': 'Level completed successfully',
            'completion': LevelCompletionSerializer(completion).data,
            'xp_earned': completion.xp_earned,
            'passed': completion.passed,
            'group_completed': group_progress.is_completed if completion.passed else False,
            'next_group_unlocked': next_group is not None if completion.passed and group_progress.is_completed else False
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LevelCompletionListView(generics.ListAPIView):
    """List user's level completions"""
    serializer_class = LevelCompletionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return LevelCompletion.objects.filter(user=self.request.user).order_by('-completed_at')


class LevelCompletionDetailView(generics.RetrieveAPIView):
    """Get specific level completion details"""
    serializer_class = LevelCompletionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return LevelCompletion.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@cache_level_data(timeout=600)  # 10 minutes cache
def level_stats(request):
    """Get user's level statistics"""
    user = request.user
    
    # Get completions
    completions = LevelCompletion.objects.filter(user=user)
    
    # Calculate stats
    total_levels = Level.objects.filter(is_active=True).count()
    completed_levels = completions.count()
    test_levels_completed = completions.filter(is_test_level=True).count()
    total_xp_earned = completions.aggregate(total=Sum('xp_earned'))['total'] or 0
    average_score = completions.aggregate(avg=Avg('percentage'))['avg'] or 0
    
    # Calculate streaks
    completions_by_date = completions.order_by('completed_at')
    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    last_date = None
    
    for completion in completions_by_date:
        completion_date = completion.completed_at.date()
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
        'total_levels': total_levels,
        'completed_levels': completed_levels,
        'test_levels_completed': test_levels_completed,
        'total_xp_earned': total_xp_earned,
        'average_score': round(average_score, 2),
        'current_streak': current_streak,
        'longest_streak': longest_streak
    }
    
    serializer = LevelStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@cache_api_response(timeout=300, key_prefix='next_level')  # 5 minutes cache
def get_next_level(request):
    """Get next level for user"""
    user = request.user
    
    # Get user's highest completed level
    last_completion = LevelCompletion.objects.filter(
        user=user,
        passed=True
    ).order_by('-level__level_number').first()
    
    if last_completion:
        next_level = last_completion.level.get_next_level()
    else:
        # User hasn't completed any levels, get first level
        next_level = Level.objects.filter(
            is_active=True,
            is_unlocked=True
        ).order_by('level_number').first()
    
    if next_level:
        serializer = LevelSerializer(next_level)
        return Response(serializer.data)
    else:
        return Response(
            {'message': 'No more levels available'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@cache_level_data(timeout=1800)  # 30 minutes cache
def get_test_levels(request):
    """Get test levels (every 10th level)"""
    test_levels = Level.objects.filter(
        is_active=True,
        is_test_level=True
    ).order_by('level_number')
    
    serializer = LevelSerializer(test_levels, many=True)
    return Response(serializer.data)


class LevelViewSet(ModelViewSet):
    """ViewSet for level management (admin only)"""
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['difficulty', 'is_test_level', 'is_unlocked', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['level_number', 'difficulty', 'created_at']
    ordering = ['level_number']


class QuestionViewSet(ModelViewSet):
    """ViewSet for question management (admin only)"""
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['question_type', 'difficulty', 'is_active', 'level']
    search_fields = ['question_text']
    ordering_fields = ['question_order', 'difficulty', 'created_at']
    ordering = ['level', 'question_order']