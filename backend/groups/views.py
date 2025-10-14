from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q
from .models import Group, Level, Question, GroupJumpTest, GroupJumpTestAttempt, PlantGrowthStage, UserPlantProgress
from .serializers import GroupSerializer, LevelSerializer, QuestionSerializer, GroupJumpTestSerializer, GroupJumpTestAttemptSerializer, PlantGrowthStageSerializer, UserPlantProgressSerializer

class GroupListView(generics.ListAPIView):
    """List all groups with real data"""
    queryset = Group.objects.all().prefetch_related('levels__questions')
    serializer_class = GroupSerializer
    permission_classes = [AllowAny]  # Allow public access for now

class GroupDetailView(generics.RetrieveAPIView):
    """Get group details with levels and questions"""
    queryset = Group.objects.all().prefetch_related('levels__questions')
    serializer_class = GroupSerializer
    permission_classes = [AllowAny]

class GroupLevelsView(generics.ListAPIView):
    """Get levels for a specific group"""
    serializer_class = LevelSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        group_id = self.kwargs['group_id']
        return Level.objects.filter(group_id=group_id).prefetch_related('questions')

class LevelDetailView(generics.RetrieveAPIView):
    """Get specific level with questions"""
    serializer_class = LevelSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Level.objects.all().prefetch_related('questions')

class LevelQuestionsView(generics.ListAPIView):
    """Get questions for a specific level"""
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        level_id = self.kwargs['level_id']
        return Question.objects.filter(level_id=level_id).order_by('question_order')

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_answer(request):
    """Submit answer for a question"""
    question_id = request.data.get('question_id')
    user_answer = request.data.get('answer')
    
    try:
        question = Question.objects.get(id=question_id)
        is_correct = question.correct_answer.lower() == user_answer.lower()
        
        return Response({
            'is_correct': is_correct,
            'correct_answer': question.correct_answer,
            'explanation': question.explanation,
            'xp_earned': question.xp_value if is_correct else 0
        })
    except Question.DoesNotExist:
        return Response({'error': 'Question not found'}, status=404)

class GroupTestView(generics.GenericAPIView):
    """Group unlock test"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        return Response({'message': f'Group {pk} test endpoint'})

class LevelDetailView(generics.RetrieveAPIView):
    """Get level details"""
    queryset = Level.objects.all()
    serializer_class = None
    permission_classes = [IsAuthenticated]

class LevelQuestionsView(generics.ListAPIView):
    """Get questions for a specific level"""
    serializer_class = None
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        level_id = self.kwargs['pk']
        return Question.objects.filter(level_id=level_id)

class StartLevelView(generics.GenericAPIView):
    """Start a level"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        return Response({'message': f'Start level {pk} endpoint'})

class CompleteLevelView(generics.GenericAPIView):
    """Complete a level"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        return Response({'message': f'Complete level {pk} endpoint'})

class AnswerQuestionView(generics.GenericAPIView):
    """Answer a question"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        return Response({'message': f'Answer question {pk} endpoint'})

class QuestionHintView(generics.GenericAPIView):
    """Get question hint"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        return Response({'message': f'Question {pk} hint endpoint'})

class GroupViewSet(ModelViewSet):
    """Group viewset"""
    queryset = Group.objects.all()
    serializer_class = None
    permission_classes = [IsAuthenticated]

class LevelViewSet(ModelViewSet):
    """Level viewset"""
    queryset = Level.objects.all()
    serializer_class = None
    permission_classes = [IsAuthenticated]

class QuestionViewSet(ModelViewSet):
    """Question viewset"""
    queryset = Question.objects.all()
    serializer_class = None
    permission_classes = [IsAuthenticated]
