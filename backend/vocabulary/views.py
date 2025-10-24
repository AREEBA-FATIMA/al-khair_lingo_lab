from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
from .models import Vocabulary, VocabularyProgress
from .serializers import VocabularySerializer, VocabularyProgressSerializer


class VocabularyListView(generics.ListAPIView):
    """List vocabulary words with filtering"""
    serializer_class = VocabularySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter vocabulary based on query parameters"""
        queryset = Vocabulary.objects.filter(is_active=True)
        
        # Filter by difficulty level
        difficulty_level = self.request.query_params.get('difficulty_level')
        if difficulty_level:
            queryset = queryset.filter(difficulty_level=difficulty_level)
        
        # Filter by part of speech
        part_of_speech = self.request.query_params.get('part_of_speech')
        if part_of_speech:
            queryset = queryset.filter(part_of_speech=part_of_speech)
        
        # Filter by Oxford 3000
        is_oxford_3000 = self.request.query_params.get('is_oxford_3000')
        if is_oxford_3000 is not None:
            queryset = queryset.filter(is_oxford_3000=is_oxford_3000.lower() == 'true')
        
        # Filter by Oxford rank range
        oxford_rank_start = self.request.query_params.get('oxford_rank_start')
        oxford_rank_end = self.request.query_params.get('oxford_rank_end')
        if oxford_rank_start:
            queryset = queryset.filter(oxford_rank__gte=oxford_rank_start)
        if oxford_rank_end:
            queryset = queryset.filter(oxford_rank__lte=oxford_rank_end)
        
        # Search by word or translation
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(word__icontains=search) | 
                Q(translation_urdu__icontains=search) |
                Q(definition__icontains=search)
            )
        
        return queryset.order_by('oxford_rank', 'word')


class VocabularyDetailView(generics.RetrieveAPIView):
    """Get specific vocabulary word details"""
    queryset = Vocabulary.objects.filter(is_active=True)
    serializer_class = VocabularySerializer
    permission_classes = [permissions.IsAuthenticated]


class VocabularyProgressListView(generics.ListAPIView):
    """List user's vocabulary progress"""
    serializer_class = VocabularyProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return VocabularyProgress.objects.filter(user=self.request.user).order_by('-next_review_date')


class VocabularyProgressDetailView(generics.RetrieveUpdateAPIView):
    """Get or update specific vocabulary progress"""
    serializer_class = VocabularyProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return VocabularyProgress.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def review_vocabulary(request, vocabulary_id):
    """Review a vocabulary word (for spaced repetition)"""
    try:
        vocabulary = Vocabulary.objects.get(id=vocabulary_id, is_active=True)
        user = request.user
        
        # Get or create progress
        progress, created = VocabularyProgress.objects.get_or_create(
            user=user,
            vocabulary=vocabulary,
            defaults={
                'is_learned': False,
                'mastery_level': 0,
                'next_review_date': timezone.now(),
                'review_interval_days': 1
            }
        )
        
        # Get review data from request
        is_correct = request.data.get('is_correct', False)
        response_time = request.data.get('response_time', 0)
        
        # Update progress
        progress.review_count += 1
        progress.last_reviewed_at = timezone.now()
        
        if is_correct:
            progress.correct_count += 1
            progress.mastery_level = min(5, progress.mastery_level + 1)
            
            # Update review interval (spaced repetition)
            if progress.mastery_level >= 3:
                progress.review_interval_days = min(30, progress.review_interval_days * 2)
            else:
                progress.review_interval_days = min(7, progress.review_interval_days + 1)
        else:
            progress.incorrect_count += 1
            progress.mastery_level = max(0, progress.mastery_level - 1)
            progress.review_interval_days = 1
        
        # Update average response time
        if response_time > 0:
            if progress.average_response_time == 0:
                progress.average_response_time = response_time
            else:
                progress.average_response_time = (progress.average_response_time + response_time) / 2
        
        # Set next review date
        progress.next_review_date = timezone.now() + timezone.timedelta(days=progress.review_interval_days)
        
        # Mark as learned if mastery level is high enough
        if progress.mastery_level >= 3 and not progress.is_learned:
            progress.is_learned = True
            progress.first_learned_at = timezone.now()
        
        progress.save()
        
        return Response({
            'success': True,
            'mastery_level': progress.mastery_level,
            'is_learned': progress.is_learned,
            'next_review_date': progress.next_review_date,
            'review_interval_days': progress.review_interval_days
        })
        
    except Vocabulary.DoesNotExist:
        return Response(
            {'error': 'Vocabulary word not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_review_words(request):
    """Get words that need review (spaced repetition)"""
    user = request.user
    limit = int(request.query_params.get('limit', 20))
    
    # Get words that need review
    review_words = VocabularyProgress.objects.filter(
        user=user,
        next_review_date__lte=timezone.now()
    ).order_by('next_review_date')[:limit]
    
    # If not enough words, get some new words
    if review_words.count() < limit:
        learned_word_ids = VocabularyProgress.objects.filter(
            user=user,
            is_learned=True
        ).values_list('vocabulary_id', flat=True)
        
        new_words = Vocabulary.objects.filter(
            is_active=True,
            difficulty_level__in=['A1', 'A2']  # Start with basic words
        ).exclude(id__in=learned_word_ids).order_by('oxford_rank')[:limit - review_words.count()]
        
        # Create progress entries for new words
        for word in new_words:
            VocabularyProgress.objects.get_or_create(
                user=user,
                vocabulary=word,
                defaults={
                    'is_learned': False,
                    'mastery_level': 0,
                    'next_review_date': timezone.now(),
                    'review_interval_days': 1
                }
            )
    
    # Get all words for review (including newly created ones)
    all_review_words = VocabularyProgress.objects.filter(
        user=user,
        next_review_date__lte=timezone.now()
    ).order_by('next_review_date')[:limit]
    
    serializer = VocabularyProgressSerializer(all_review_words, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vocabulary_stats(request):
    """Get user's vocabulary statistics"""
    user = request.user
    
    # Get progress data
    progress = VocabularyProgress.objects.filter(user=user)
    
    # Calculate stats
    total_words = Vocabulary.objects.filter(is_active=True).count()
    learned_words = progress.filter(is_learned=True).count()
    words_in_progress = progress.filter(is_learned=False, mastery_level__gt=0).count()
    words_to_review = progress.filter(next_review_date__lte=timezone.now()).count()
    
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
    total_reviews = progress.aggregate(total=Sum('review_count'))['total'] or 0
    correct_reviews = progress.aggregate(total=Sum('correct_count'))['total'] or 0
    accuracy = (correct_reviews / total_reviews * 100) if total_reviews > 0 else 0
    
    stats = {
        'total_words': total_words,
        'learned_words': learned_words,
        'words_in_progress': words_in_progress,
        'words_to_review': words_to_review,
        'mastery_distribution': mastery_distribution,
        'average_response_time': round(avg_response_time, 2),
        'accuracy': round(accuracy, 2),
        'learning_progress': round((learned_words / total_words * 100), 2) if total_words > 0 else 0
    }
    
    return Response(stats)


class VocabularyViewSet(ModelViewSet):
    """ViewSet for vocabulary management (admin only)"""
    queryset = Vocabulary.objects.all()
    serializer_class = VocabularySerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['difficulty_level', 'part_of_speech', 'is_oxford_3000', 'is_active']
    search_fields = ['word', 'translation_urdu', 'definition']
    ordering_fields = ['oxford_rank', 'difficulty_level', 'created_at']
    ordering = ['oxford_rank']


class VocabularyProgressViewSet(ModelViewSet):
    """ViewSet for vocabulary progress management (admin only)"""
    queryset = VocabularyProgress.objects.all()
    serializer_class = VocabularyProgressSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['is_learned', 'mastery_level', 'user']
    search_fields = ['user__username', 'vocabulary__word']
    ordering_fields = ['next_review_date', 'mastery_level', 'created_at']
    ordering = ['-next_review_date']

