from django.db import models
from users.models import User

class Group(models.Model):
    """Learning groups/chapters - 8 groups (0-7) with different level counts"""
    GROUP_LEVELS = [
        (0, 20),  # Group 0: 20 levels (basic/starting)
        (1, 50),  # Group 1: 50 levels
        (2, 50),  # Group 2: 50 levels
        (3, 50),  # Group 3: 50 levels
        (4, 50),  # Group 4: 50 levels
        (5, 50),  # Group 5: 50 levels
        (6, 50),  # Group 6: 50 levels
        (7, 50),  # Group 7: 50 levels
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    group_number = models.IntegerField(unique=True)  # 0-7
    level_count = models.IntegerField(default=50)  # Number of levels in this group
    is_unlocked = models.BooleanField(default=False)
    unlock_condition = models.CharField(
        max_length=20,
        choices=[
            ('complete_previous', 'Complete Previous Group'),
            ('test_100_percent', 'Pass Test with 100%'),
            ('both', 'Both Conditions'),
        ],
        default='complete_previous'
    )
    test_questions = models.IntegerField(default=10)  # Questions in unlock test
    pass_percentage = models.IntegerField(default=100)  # Required percentage to pass
    plant_type = models.CharField(max_length=50, default="seed")  # Plant type for this group
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['group_number']

    def __str__(self):
        return f"Group {self.group_number}: {self.name}"
    
    def get_level_count(self):
        """Get the number of levels for this group"""
        if self.group_number == 0:
            return 20
        return 50

class Level(models.Model):
    """Levels within groups - Each level has exactly 6 questions"""
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='levels')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    level_number = models.IntegerField(default=1)  # 1-20 for group 0, 1-50 for others
    questions_count = models.IntegerField(default=6)  # Fixed at 6 questions per level
    xp_reward = models.IntegerField(default=10)
    is_unlocked = models.BooleanField(default=True)  # First level is always unlocked
    plant_growth_stage = models.CharField(max_length=50, default="seed")  # Plant growth stage for this level
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['group', 'level_number']
        unique_together = ('group', 'level_number')

    def __str__(self):
        return f"Group {self.group.group_number} - Level {self.level_number}: {self.name}"
    
    def get_plant_growth_stage(self):
        """Calculate plant growth stage based on level completion"""
        total_levels = self.group.get_level_count()
        progress = (self.level_number / total_levels) * 100
        
        if progress <= 20:
            return "seed"
        elif progress <= 40:
            return "sprout"
        elif progress <= 60:
            return "sapling"
        elif progress <= 80:
            return "tree"
        else:
            return "fruit_tree"

class Question(models.Model):
    """Questions within levels - Exactly 6 question types per level"""
    QUESTION_TYPE_CHOICES = [
        ('mcq', 'Multiple Choice Question'),
        ('text_to_speech', 'Text to Speech (Pronunciation)'),
        ('fill_blank', 'Fill in the Blank'),
        ('synonyms', 'Synonyms'),
        ('antonyms', 'Antonyms'),
        ('sentence_completion', 'Sentence Completion'),
    ]
    
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=30, choices=QUESTION_TYPE_CHOICES)
    options = models.JSONField(blank=True, null=True)  # For MCQ
    correct_answer = models.JSONField(blank=True, null=True)
    audio_url = models.URLField(max_length=500, blank=True, null=True)  # For text-to-speech
    image_url = models.URLField(max_length=500, blank=True, null=True)
    hint = models.TextField(blank=True)
    explanation = models.TextField(blank=True)
    difficulty = models.IntegerField(default=1)  # 1-5
    xp_value = models.IntegerField(default=2)  # XP per question
    question_order = models.IntegerField(default=1)  # 1-6 (exactly 6 questions per level)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['level', 'question_order']
        unique_together = ('level', 'question_order')

    def __str__(self):
        return f"Q{self.question_order}: {self.question_text[:50]}..."
    
    def get_question_type_display_name(self):
        """Get user-friendly question type name"""
        type_names = {
            'mcq': 'Multiple Choice',
            'text_to_speech': 'Pronunciation',
            'fill_blank': 'Fill in the Blank',
            'synonyms': 'Synonyms',
            'antonyms': 'Antonyms',
            'sentence_completion': 'Complete Sentence'
        }
        return type_names.get(self.question_type, self.question_type)


class GroupJumpTest(models.Model):
    """Test required to jump to a higher group (100% pass required)"""
    target_group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='jump_tests')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    questions = models.ManyToManyField(Question, related_name='jump_tests')
    pass_percentage = models.IntegerField(default=100)  # Must be 100%
    time_limit_minutes = models.IntegerField(default=30)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['target_group']

    def __str__(self):
        return f"Jump Test for Group {self.target_group.group_number}"

    def get_questions_count(self):
        return self.questions.count()


class GroupJumpTestAttempt(models.Model):
    """User's attempt at group jump test"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jump_test_attempts')
    jump_test = models.ForeignKey(GroupJumpTest, on_delete=models.CASCADE, related_name='attempts')
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    percentage = models.FloatField(default=0.0)
    passed = models.BooleanField(default=False)
    time_taken_seconds = models.IntegerField(default=0)
    attempted_at = models.DateTimeField(auto_now_add=True)
    answers = models.JSONField(default=dict)  # Store user's answers

    class Meta:
        ordering = ['-attempted_at']

    def __str__(self):
        return f"{self.user.username} - Group {self.jump_test.target_group.group_number} Jump Test"

    def calculate_percentage(self):
        if self.total_questions > 0:
            self.percentage = (self.score / self.total_questions) * 100
            self.passed = self.percentage >= self.jump_test.pass_percentage
        return self.percentage


class PlantGrowthStage(models.Model):
    """Plant growth stages for each group"""
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='growth_stages')
    stage_name = models.CharField(max_length=50)  # seed, sprout, sapling, tree, fruit_tree
    stage_order = models.IntegerField(default=1)
    level_range_start = models.IntegerField(default=1)
    level_range_end = models.IntegerField(default=10)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True)
    xp_required = models.IntegerField(default=0)

    class Meta:
        ordering = ['group', 'stage_order']
        unique_together = ('group', 'stage_order')

    def __str__(self):
        return f"Group {self.group.group_number} - {self.stage_name}"


class UserPlantProgress(models.Model):
    """User's plant progress for each group"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='plant_progress')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='user_plants')
    current_stage = models.CharField(max_length=50, default="seed")
    current_level = models.IntegerField(default=1)
    total_xp = models.IntegerField(default=0)
    is_wilting = models.BooleanField(default=False)  # If daily level not completed
    last_level_completed = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'group')

    def __str__(self):
        return f"{self.user.username}'s plant in Group {self.group.group_number}"

    def update_plant_stage(self):
        """Update plant stage based on level progress"""
        total_levels = self.group.get_level_count()
        progress_percentage = (self.current_level / total_levels) * 100
        
        if progress_percentage <= 20:
            self.current_stage = "seed"
        elif progress_percentage <= 40:
            self.current_stage = "sprout"
        elif progress_percentage <= 60:
            self.current_stage = "sapling"
        elif progress_percentage <= 80:
            self.current_stage = "tree"
        else:
            self.current_stage = "fruit_tree"
        
        self.save()

    def check_daily_requirement(self):
        """Check if daily level requirement is met"""
        from django.utils import timezone
        today = timezone.now().date()
        
        if self.last_level_completed:
            last_completed_date = self.last_level_completed.date()
            if last_completed_date < today:
                self.is_wilting = True
                self.save()
        else:
            self.is_wilting = True
            self.save()
