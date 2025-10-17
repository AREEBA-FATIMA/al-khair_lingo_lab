from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q, Sum, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import LevelProgress, QuestionProgress, DailyProgress
from .serializers import LevelProgressSerializer, QuestionProgressSerializer, DailyProgressSerializer
from levels.models import Level
from groups.models import Group
from plants.models import UserPlant, PlantStage

class ProgressOverviewView(generics.GenericAPIView):
    """Progress overview with real data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get user's level progress
        level_progress = LevelProgress.objects.filter(user=user)
        
        # Calculate statistics
        total_levels = Level.objects.filter(is_active=True).count()
        completed_levels = level_progress.filter(is_completed=True).count()
        total_xp = level_progress.aggregate(total=Sum('xp_earned'))['total'] or 0
        total_questions = level_progress.aggregate(total=Sum('questions_answered'))['total'] or 0
        correct_answers = level_progress.aggregate(total=Sum('correct_answers'))['total'] or 0
        
        # Calculate accuracy
        accuracy = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        
        # Get current streak
        today = timezone.now().date()
        streak = 0
        current_date = today
        
        while True:
            daily_progress = DailyProgress.objects.filter(
                user=user, 
                date=current_date,
                levels_completed__gt=0
            ).first()
            
            if daily_progress:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        # Get recent activity
        recent_progress = level_progress.order_by('-last_attempted')[:5]
        
        return Response({
            'overview': {
                'total_levels': total_levels,
                'completed_levels': completed_levels,
                'completion_percentage': (completed_levels / total_levels * 100) if total_levels > 0 else 0,
                'total_xp': total_xp,
                'total_questions': total_questions,
                'accuracy_percentage': round(accuracy, 1),
                'current_streak': streak,
            },
            'recent_activity': LevelProgressSerializer(recent_progress, many=True).data
        })

class ProgressSummaryView(generics.GenericAPIView):
    """Progress summary"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({'message': 'Progress summary endpoint'})

class GroupProgressListView(generics.ListAPIView):
    """Group progress list"""
    serializer_class = None
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GroupProgress.objects.filter(user=self.request.user)

class GroupProgressDetailView(generics.RetrieveAPIView):
    """Group progress detail"""
    serializer_class = None
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GroupProgress.objects.filter(user=self.request.user)

class LevelProgressListView(generics.ListAPIView):
    """Level progress list"""
    serializer_class = None
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LevelProgress.objects.filter(user=self.request.user)

class LevelProgressDetailView(generics.RetrieveAPIView):
    """Level progress detail"""
    serializer_class = None
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LevelProgress.objects.filter(user=self.request.user)

class DailyProgressListView(generics.ListAPIView):
    """Daily progress list"""
    serializer_class = None
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DailyProgress.objects.filter(user=self.request.user)

class TodayProgressView(generics.GenericAPIView):
    """Today's progress"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({'message': 'Today progress endpoint'})

class WeeklyProgressView(generics.GenericAPIView):
    """Weekly progress"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({'message': 'Weekly progress endpoint'})

class MonthlyProgressView(generics.GenericAPIView):
    """Monthly progress"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({'message': 'Monthly progress endpoint'})

class StreakAnalyticsView(generics.GenericAPIView):
    """Streak analytics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({'message': 'Streak analytics endpoint'})

class PerformanceAnalyticsView(generics.GenericAPIView):
    """Performance analytics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({'message': 'Performance analytics endpoint'})

class LevelProgressViewSet(ModelViewSet):
    """Level progress viewset"""
    queryset = LevelProgress.objects.all()
    serializer_class = LevelProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LevelProgress.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LevelCompletionView(generics.GenericAPIView):
    """Submit level completion with answers"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        level_id = request.data.get('level_id')
        answers = request.data.get('answers', [])  # List of question answers
        
        try:
            level = Level.objects.get(id=level_id)
        except Level.DoesNotExist:
            return Response({'error': 'Level not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get or create level progress
        level_progress, created = LevelProgress.objects.get_or_create(
            user=user,
            level=level,
            defaults={'attempts': 0}
        )
        
        # Update progress
        level_progress.attempts += 1
        level_progress.questions_answered = len(answers)
        
        # Calculate correct answers
        correct_count = 0
        total_xp = 0
        
        for answer_data in answers:
            question_id = answer_data.get('question_id')
            user_answer = answer_data.get('answer')
            time_spent = answer_data.get('time_spent', 0)
            
            try:
                question = level.questions.get(id=question_id)
                
                # Check if answer is correct
                is_correct = self.check_answer(question, user_answer)
                
                if is_correct:
                    correct_count += 1
                    total_xp += question.xp_value
                
                # Create or update question progress
                question_progress, _ = QuestionProgress.objects.get_or_create(
                    user=user,
                    question=question,
                    defaults={'attempts': 0}
                )
                
                question_progress.attempts += 1
                question_progress.is_answered = True
                question_progress.is_correct = is_correct
                question_progress.time_spent = time_spent
                question_progress.answered_at = timezone.now()
                question_progress.save()
                
            except Exception as e:
                print(f"Error processing question {question_id}: {e}")
                continue
        
        # Update level progress
        level_progress.correct_answers = correct_count
        level_progress.wrong_answers = len(answers) - correct_count
        level_progress.xp_earned += total_xp
        level_progress.update_completion_percentage()
        
        # Update daily progress
        today = timezone.now().date()
        daily_progress, _ = DailyProgress.objects.get_or_create(
            user=user,
            date=today,
            defaults={
                'levels_completed': 0,
                'questions_answered': 0,
                'correct_answers': 0,
                'wrong_answers': 0,
                'xp_earned': 0,
                'time_spent': 0,
                'streak_count': 0,
                'daily_goal_met': False
            }
        )
        
        if level_progress.is_completed:
            daily_progress.levels_completed += 1
        
        daily_progress.questions_answered += len(answers)
        daily_progress.correct_answers += correct_count
        daily_progress.wrong_answers += (len(answers) - correct_count)
        daily_progress.xp_earned += total_xp
        daily_progress.save()
        
        # Update plant growth
        self.update_plant_growth(user, total_xp)
        
        return Response({
            'message': 'Level progress updated successfully',
            'level_progress': LevelProgressSerializer(level_progress).data,
            'correct_answers': correct_count,
            'total_questions': len(answers),
            'xp_earned': total_xp,
            'is_completed': level_progress.is_completed
        })
    
    def check_answer(self, question, user_answer):
        """Check if user answer is correct"""
        correct_answer = question.correct_answer
        
        if question.question_type == 'mcq':
            return str(user_answer).strip().lower() == str(correct_answer).strip().lower()
        elif question.question_type == 'fill_blank':
            return str(user_answer).strip().lower() == str(correct_answer).strip().lower()
        elif question.question_type == 'text_to_speech':
            # For now, always return True for speech questions
            return True
        else:
            # For other types, simple string comparison
            return str(user_answer).strip().lower() == str(correct_answer).strip().lower()
    
    def update_plant_growth(self, user, xp_earned):
        """Update user's plant growth based on XP earned"""
        try:
            # Get user's active plant
            user_plant = UserPlant.objects.filter(user=user, is_active=True).first()
            
            if not user_plant:
                # Create a default plant if user doesn't have one
                from plants.models import PlantType
                default_plant_type = PlantType.objects.filter(is_active=True).first()
                if default_plant_type:
                    user_plant = UserPlant.objects.create(
                        user=user,
                        plant_type=default_plant_type,
                        current_stage=PlantStage.objects.filter(
                            plant_type=default_plant_type,
                            stage_order=1
                        ).first(),
                        is_active=True
                    )
                else:
                    return  # No plant types available
            
            # Add XP to plant
            user_plant.total_xp += xp_earned
            user_plant.save()
            
            # Check if plant can grow to next stage
            current_stage = user_plant.current_stage
            if current_stage:
                next_stage = PlantStage.objects.filter(
                    plant_type=user_plant.plant_type,
                    stage_order=current_stage.stage_order + 1
                ).first()
                
                if next_stage and user_plant.total_xp >= next_stage.xp_required:
                    user_plant.current_stage = next_stage
                    user_plant.current_stage_number = next_stage.stage_order
                    user_plant.last_growth_at = timezone.now()
                    user_plant.save()
                    
                    # Log growth event
                    print(f"Plant grew to stage {next_stage.stage_name} for user {user.username}")
            
        except Exception as e:
            print(f"Error updating plant growth: {e}")


class DailyProgressViewSet(ModelViewSet):
    """Daily progress viewset"""
    queryset = DailyProgress.objects.all()
    serializer_class = DailyProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DailyProgress.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)