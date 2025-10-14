from django.db import models
from django.utils import timezone
from users.models import User
from groups.models import Group, Level, Question

class GroupProgress(models.Model):
    """User's progress through groups"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_progress')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='user_progress')
    is_completed = models.BooleanField(default=False)
    completion_percentage = models.FloatField(default=0.0)
    total_xp_earned = models.IntegerField(default=0)
    levels_completed = models.IntegerField(default=0)
    total_levels = models.IntegerField(default=50)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)
    daily_streak = models.IntegerField(default=0)  # Consecutive days with level completion
    last_daily_level = models.DateTimeField(null=True, blank=True)  # Last time daily level was completed

    class Meta:
        unique_together = ('user', 'group')
        verbose_name_plural = "Group Progress"

    def __str__(self):
        return f"{self.user.username} - Group {self.group.group_number}"

    def update_completion_percentage(self):
        """Update completion percentage based on levels completed"""
        if self.total_levels > 0:
            self.completion_percentage = (self.levels_completed / self.total_levels) * 100
            if self.completion_percentage >= 100:
                self.is_completed = True
                self.completed_at = timezone.now()
            self.save()

    def check_daily_requirement(self):
        """Check if daily level requirement is met"""
        from django.utils import timezone
        today = timezone.now().date()
        
        if self.last_daily_level:
            last_level_date = self.last_daily_level.date()
            if last_level_date == today:
                return True  # Already completed today
            elif last_level_date == today - timezone.timedelta(days=1):
                self.daily_streak += 1
            else:
                self.daily_streak = 0
        else:
            self.daily_streak = 0
        
        self.save()
        return False

class LevelProgress(models.Model):
    """User's progress through levels - Each level has 6 questions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='level_progress')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='user_progress')
    is_completed = models.BooleanField(default=False)
    completion_percentage = models.FloatField(default=0.0)
    questions_answered = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    wrong_answers = models.IntegerField(default=0)
    xp_earned = models.IntegerField(default=0)
    time_spent = models.IntegerField(default=0)  # in seconds
    attempts = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_attempted = models.DateTimeField(auto_now=True)
    daily_level_completed = models.BooleanField(default=False)  # If this level counts as daily requirement

    class Meta:
        unique_together = ('user', 'level')
        verbose_name_plural = "Level Progress"

    def __str__(self):
        return f"{self.user.username} - Group {self.level.group.group_number} Level {self.level.level_number}"

    def update_completion_percentage(self):
        """Update completion percentage based on questions answered"""
        total_questions = 6  # Fixed 6 questions per level
        if total_questions > 0:
            self.completion_percentage = (self.questions_answered / total_questions) * 100
            if self.completion_percentage >= 100:
                self.is_completed = True
                self.completed_at = timezone.now()
                self.daily_level_completed = True
            self.save()

    def get_accuracy_percentage(self):
        """Get accuracy percentage for this level"""
        if self.questions_answered > 0:
            return (self.correct_answers / self.questions_answered) * 100
        return 0.0

class QuestionProgress(models.Model):
    """User's progress on individual questions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='question_progress')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='user_progress')
    is_answered = models.BooleanField(default=False)
    is_correct = models.BooleanField(default=False)
    user_answer = models.JSONField(blank=True, null=True)
    time_spent = models.IntegerField(default=0)  # in seconds
    attempts = models.IntegerField(default=0)
    xp_earned = models.IntegerField(default=0)
    answered_at = models.DateTimeField(auto_now=True)
    first_attempted = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'question')
        verbose_name_plural = "Question Progress"

    def __str__(self):
        return f"{self.user.username} - Q{self.question.order}"

class DailyProgress(models.Model):
    """Daily progress tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_progress')
    date = models.DateField(auto_now_add=True)
    levels_completed = models.IntegerField(default=0)
    questions_answered = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    xp_earned = models.IntegerField(default=0)
    time_spent = models.IntegerField(default=0)  # in minutes
    streak_maintained = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'date')
        verbose_name_plural = "Daily Progress"

    def __str__(self):
        return f"{self.user.username} - {self.date}"