from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
from .models import GrammarRule, GrammarProgress
from .serializers import GrammarRuleSerializer, GrammarProgressSerializer


class GrammarRuleListView(generics.ListAPIView):
    """List grammar rules with filtering"""
    serializer_class = GrammarRuleSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Filter grammar rules based on query parameters"""
        queryset = GrammarRule.objects.filter(is_active=True)
        
        # Filter by difficulty level
        difficulty_level = self.request.query_params.get('difficulty_level')
        if difficulty_level:
            queryset = queryset.filter(difficulty_level=difficulty_level)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by essential rules
        is_essential = self.request.query_params.get('is_essential')
        if is_essential is not None:
            queryset = queryset.filter(is_essential=is_essential.lower() == 'true')
        
        # Search by name or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(rule_text__icontains=search)
            )
        
        return queryset.order_by('difficulty_level', 'name')


class GrammarRuleDetailView(generics.RetrieveAPIView):
    """Get specific grammar rule details"""
    queryset = GrammarRule.objects.filter(is_active=True)
    serializer_class = GrammarRuleSerializer
    permission_classes = [permissions.AllowAny]


class GrammarProgressListView(generics.ListAPIView):
    """List user's grammar progress"""
    serializer_class = GrammarProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return GrammarProgress.objects.filter(user=self.request.user).order_by('-last_practiced_at')


class GrammarProgressDetailView(generics.RetrieveUpdateAPIView):
    """Get or update specific grammar progress"""
    serializer_class = GrammarProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return GrammarProgress.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def practice_grammar(request, grammar_rule_id):
    """Practice a grammar rule"""
    try:
        grammar_rule = GrammarRule.objects.get(id=grammar_rule_id, is_active=True)
        user = request.user
        
        # Get or create progress
        progress, created = GrammarProgress.objects.get_or_create(
            user=user,
            grammar_rule=grammar_rule,
            defaults={
                'is_learned': False,
                'mastery_level': 0,
                'practice_count': 0,
                'correct_count': 0,
                'incorrect_count': 0
            }
        )
        
        # Get practice data from request
        is_correct = request.data.get('is_correct', False)
        response_time = request.data.get('response_time', 0)
        user_answer = request.data.get('user_answer', '')
        
        # Update progress
        progress.practice_count += 1
        progress.last_practiced_at = timezone.now()
        
        if is_correct:
            progress.correct_count += 1
            progress.mastery_level = min(5, progress.mastery_level + 1)
        else:
            progress.incorrect_count += 1
            progress.mastery_level = max(0, progress.mastery_level - 1)
        
        # Update average response time
        if response_time > 0:
            if progress.average_response_time == 0:
                progress.average_response_time = response_time
            else:
                progress.average_response_time = (progress.average_response_time + response_time) / 2
        
        # Update personal difficulty
        if not is_correct:
            progress.personal_difficulty = min(10.0, progress.personal_difficulty + 0.5)
        else:
            progress.personal_difficulty = max(1.0, progress.personal_difficulty - 0.1)
        
        # Mark as learned if mastery level is high enough
        if progress.mastery_level >= 4 and not progress.is_learned:
            progress.is_learned = True
            progress.first_learned_at = timezone.now()
        
        # Update mistake patterns
        if not is_correct and user_answer:
            mistake_key = f"mistake_{user_answer[:20]}"  # Truncate for key
            progress.mistake_patterns[mistake_key] = progress.mistake_patterns.get(mistake_key, 0) + 1
        
        progress.save()
        
        return Response({
            'success': True,
            'mastery_level': progress.mastery_level,
            'is_learned': progress.is_learned,
            'practice_count': progress.practice_count,
            'accuracy': (progress.correct_count / progress.practice_count * 100) if progress.practice_count > 0 else 0,
            'personal_difficulty': progress.personal_difficulty
        })
        
    except GrammarRule.DoesNotExist:
        return Response(
            {'error': 'Grammar rule not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_practice_rules(request):
    """Get grammar rules for practice"""
    user = request.user
    difficulty_level = request.query_params.get('difficulty_level', 'A1')
    limit = int(request.query_params.get('limit', 10))
    
    # Get rules that need practice
    practice_rules = GrammarRule.objects.filter(
        is_active=True,
        difficulty_level=difficulty_level
    ).order_by('difficulty_level', 'name')[:limit]
    
    # Add progress data for each rule
    rules_with_progress = []
    for rule in practice_rules:
        try:
            progress = GrammarProgress.objects.get(user=user, grammar_rule=rule)
            rule.progress_data = {
                'is_learned': progress.is_learned,
                'mastery_level': progress.mastery_level,
                'practice_count': progress.practice_count,
                'accuracy': (progress.correct_count / progress.practice_count * 100) if progress.practice_count > 0 else 0,
                'personal_difficulty': progress.personal_difficulty
            }
        except GrammarProgress.DoesNotExist:
            rule.progress_data = {
                'is_learned': False,
                'mastery_level': 0,
                'practice_count': 0,
                'accuracy': 0,
                'personal_difficulty': 1.0
            }
        
        rules_with_progress.append(rule)
    
    serializer = GrammarRuleSerializer(rules_with_progress, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def grammar_stats(request):
    """Get user's grammar statistics"""
    user = request.user
    
    # Get progress data
    progress = GrammarProgress.objects.filter(user=user)
    
    # Calculate stats
    total_rules = GrammarRule.objects.filter(is_active=True).count()
    learned_rules = progress.filter(is_learned=True).count()
    rules_in_progress = progress.filter(is_learned=False, mastery_level__gt=0).count()
    
    # Calculate mastery distribution
    mastery_distribution = {}
    for level in range(6):
        count = progress.filter(mastery_level=level).count()
        mastery_distribution[f'level_{level}'] = count
    
    # Calculate average response time
    avg_response_time = progress.filter(average_response_time__gt=0).aggregate(
        avg=Avg('average_response_time')
    )['avg'] or 0
    
    # Calculate accuracy
    total_practices = progress.aggregate(total=Sum('practice_count'))['total'] or 0
    correct_practices = progress.aggregate(total=Sum('correct_count'))['total'] or 0
    accuracy = (correct_practices / total_practices * 100) if total_practices > 0 else 0
    
    # Calculate difficulty distribution
    difficulty_distribution = {}
    for level in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
        count = progress.filter(grammar_rule__difficulty_level=level).count()
        difficulty_distribution[level] = count
    
    stats = {
        'total_rules': total_rules,
        'learned_rules': learned_rules,
        'rules_in_progress': rules_in_progress,
        'mastery_distribution': mastery_distribution,
        'difficulty_distribution': difficulty_distribution,
        'average_response_time': round(avg_response_time, 2),
        'accuracy': round(accuracy, 2),
        'learning_progress': round((learned_rules / total_rules * 100), 2) if total_rules > 0 else 0
    }
    
    return Response(stats)


class GrammarRuleViewSet(ModelViewSet):
    """ViewSet for grammar rule management (admin only)"""
    queryset = GrammarRule.objects.all()
    serializer_class = GrammarRuleSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['difficulty_level', 'category', 'is_essential', 'is_active']
    search_fields = ['name', 'description', 'rule_text']
    ordering_fields = ['difficulty_level', 'name', 'created_at']
    ordering = ['difficulty_level', 'name']


class GrammarProgressViewSet(ModelViewSet):
    """ViewSet for grammar progress management (admin only)"""
    queryset = GrammarProgress.objects.all()
    serializer_class = GrammarProgressSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['is_learned', 'mastery_level', 'user']
    search_fields = ['user__username', 'grammar_rule__name']
    ordering_fields = ['last_practiced_at', 'mastery_level', 'created_at']
    ordering = ['-last_practiced_at']

