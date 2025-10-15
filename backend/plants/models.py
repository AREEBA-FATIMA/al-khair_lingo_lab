from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from users.models import User


class PlantType(models.Model):
    """
    Different types of plants users can choose from
    """
    name = models.CharField(max_length=100, unique=True, help_text="Plant type name")
    description = models.TextField(blank=True, help_text="Plant description")
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text="Plant image URL")
    
    # Growth Configuration
    max_stages = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(3), MaxValueValidator(10)],
        help_text="Maximum growth stages"
    )
    xp_per_stage = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(10)],
        help_text="XP required per growth stage"
    )
    
    # Special Features
    has_flowers = models.BooleanField(default=False, help_text="Does this plant have flowers?")
    has_fruits = models.BooleanField(default=False, help_text="Does this plant have fruits?")
    seasonal_changes = models.BooleanField(default=False, help_text="Does this plant change with seasons?")
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is this plant type available?")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Plant Type'
        verbose_name_plural = 'Plant Types'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.name


class PlantStage(models.Model):
    """
    Growth stages for plants
    """
    STAGE_CHOICES = [
        ('seed', 'Seed'),
        ('sprout', 'Sprout'),
        ('sapling', 'Sapling'),
        ('tree', 'Tree'),
        ('flowering', 'Flowering'),
        ('fruiting', 'Fruiting'),
        ('mature', 'Mature'),
    ]
    
    plant_type = models.ForeignKey(
        PlantType,
        on_delete=models.CASCADE,
        related_name='stages',
        help_text="Plant type this stage belongs to"
    )
    stage_name = models.CharField(
        max_length=20,
        choices=STAGE_CHOICES,
        help_text="Stage name"
    )
    stage_order = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Order of this stage"
    )
    
    # Visual Configuration
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Stage image URL"
    )
    description = models.TextField(blank=True, help_text="Stage description")
    
    # Requirements
    xp_required = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="XP required to reach this stage"
    )
    levels_required = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Levels required to reach this stage"
    )
    
    # Rewards
    xp_reward = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="XP reward for reaching this stage"
    )
    badge_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Badge name for reaching this stage"
    )
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is this stage active?")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['plant_type', 'stage_order']
        unique_together = ('plant_type', 'stage_order')
        verbose_name = 'Plant Stage'
        verbose_name_plural = 'Plant Stages'
        indexes = [
            models.Index(fields=['plant_type', 'stage_order']),
            models.Index(fields=['stage_name']),
        ]
    
    def __str__(self):
        return f"{self.plant_type.name} - {self.get_stage_name_display()}"


class UserPlant(models.Model):
    """
    User's plant progress and status
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='plant',
        help_text="User who owns this plant"
    )
    plant_type = models.ForeignKey(
        PlantType,
        on_delete=models.CASCADE,
        related_name='user_plants',
        help_text="Type of plant"
    )
    
    # Current Status
    current_stage = models.ForeignKey(
        PlantStage,
        on_delete=models.CASCADE,
        related_name='user_plants',
        help_text="Current growth stage"
    )
    current_level = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Current level user is on"
    )
    
    # Progress Tracking
    total_xp = models.PositiveIntegerField(
        default=0,
        help_text="Total XP earned for this plant"
    )
    levels_completed = models.PositiveIntegerField(
        default=0,
        help_text="Total levels completed"
    )
    
    # Health Status
    is_healthy = models.BooleanField(default=True, help_text="Is plant healthy?")
    is_wilting = models.BooleanField(default=False, help_text="Is plant wilting?")
    health_points = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Plant health points (0-100)"
    )
    
    # Daily Care
    last_care_date = models.DateField(
        null=True,
        blank=True,
        help_text="Last date plant was cared for"
    )
    daily_care_streak = models.PositiveIntegerField(
        default=0,
        help_text="Consecutive days of care"
    )
    max_care_streak = models.PositiveIntegerField(
        default=0,
        help_text="Maximum care streak achieved"
    )
    
    # Special Features
    has_flowers = models.BooleanField(default=False, help_text="Does plant have flowers?")
    has_fruits = models.BooleanField(default=False, help_text="Does plant have fruits?")
    seasonal_theme = models.CharField(
        max_length=20,
        blank=True,
        help_text="Current seasonal theme"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_updated = models.DateTimeField(auto_now=True, help_text="Last time plant was updated")
    
    class Meta:
        verbose_name = 'User Plant'
        verbose_name_plural = 'User Plants'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['plant_type']),
            models.Index(fields=['current_stage']),
            models.Index(fields=['is_healthy']),
            models.Index(fields=['last_care_date']),
        ]
    
    def __str__(self):
        return f"{self.user.username}'s {self.plant_type.name} ({self.current_stage.get_stage_name_display()})"
    
    def update_progress(self, level_completed=False, xp_earned=0):
        """Update plant progress"""
        if level_completed:
            self.levels_completed += 1
            self.current_level += 1
        
        if xp_earned > 0:
            self.total_xp += xp_earned
        
        # Check for stage advancement
        self.check_stage_advancement()
        
        # Update health
        self.update_health()
        
        self.save()
    
    def check_stage_advancement(self):
        """Check if plant should advance to next stage"""
        next_stage = PlantStage.objects.filter(
            plant_type=self.plant_type,
            stage_order__gt=self.current_stage.stage_order,
            is_active=True
        ).order_by('stage_order').first()
        
        if next_stage:
            # Check if requirements are met
            if (self.total_xp >= next_stage.xp_required and 
                self.levels_completed >= next_stage.levels_required):
                self.current_stage = next_stage
                self.has_flowers = next_stage.stage_name in ['flowering', 'fruiting', 'mature']
                self.has_fruits = next_stage.stage_name in ['fruiting', 'mature']
    
    def update_health(self):
        """Update plant health based on daily care"""
        today = timezone.now().date()
        
        if self.last_care_date:
            days_since_care = (today - self.last_care_date).days
            
            if days_since_care == 1:
                # Plant was cared for yesterday, maintain streak
                self.daily_care_streak += 1
                self.max_care_streak = max(self.max_care_streak, self.daily_care_streak)
                self.health_points = min(100, self.health_points + 10)
                self.is_wilting = False
            elif days_since_care == 0:
                # Plant was cared for today, no change
                pass
            else:
                # Plant wasn't cared for, health decreases
                self.daily_care_streak = 0
                self.health_points = max(0, self.health_points - (days_since_care * 5))
                self.is_wilting = self.health_points < 50
        else:
            # First time, set as cared for
            self.last_care_date = today
            self.daily_care_streak = 1
        
        self.is_healthy = self.health_points >= 70
    
    def care_plant(self):
        """User cares for the plant"""
        today = timezone.now().date()
        self.last_care_date = today
        self.health_points = min(100, self.health_points + 20)
        self.is_wilting = False
        self.is_healthy = True
        self.save()
    
    def get_growth_progress(self):
        """Get growth progress percentage"""
        total_stages = PlantStage.objects.filter(
            plant_type=self.plant_type,
            is_active=True
        ).count()
        
        current_stage_order = self.current_stage.stage_order
        return (current_stage_order / total_stages) * 100 if total_stages > 0 else 0
    
    def get_next_stage_requirements(self):
        """Get requirements for next stage"""
        next_stage = PlantStage.objects.filter(
            plant_type=self.plant_type,
            stage_order__gt=self.current_stage.stage_order,
            is_active=True
        ).order_by('stage_order').first()
        
        if next_stage:
            return {
                'stage_name': next_stage.get_stage_name_display(),
                'xp_required': next_stage.xp_required,
                'levels_required': next_stage.levels_required,
                'xp_progress': min(100, (self.total_xp / next_stage.xp_required) * 100) if next_stage.xp_required > 0 else 100,
                'levels_progress': min(100, (self.levels_completed / next_stage.levels_required) * 100) if next_stage.levels_required > 0 else 100,
            }
        return None


class PlantCareLog(models.Model):
    """
    Log of plant care activities
    """
    CARE_ACTIONS = [
        ('water', 'Watered'),
        ('fertilize', 'Fertilized'),
        ('prune', 'Pruned'),
        ('repot', 'Repotted'),
        ('check', 'Health Check'),
        ('play', 'Played with Plant'),
    ]
    
    user_plant = models.ForeignKey(
        UserPlant,
        on_delete=models.CASCADE,
        related_name='care_logs'
    )
    action = models.CharField(
        max_length=20,
        choices=CARE_ACTIONS,
        help_text="Care action performed"
    )
    description = models.TextField(blank=True, help_text="Care description")
    
    # Effects
    health_change = models.IntegerField(
        default=0,
        help_text="Health points change"
    )
    xp_earned = models.PositiveIntegerField(
        default=0,
        help_text="XP earned from this action"
    )
    
    # Metadata
    performed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-performed_at']
        verbose_name = 'Plant Care Log'
        verbose_name_plural = 'Plant Care Logs'
        indexes = [
            models.Index(fields=['user_plant', 'performed_at']),
            models.Index(fields=['action']),
        ]
    
    def __str__(self):
        return f"{self.user_plant.user.username} - {self.get_action_display()} at {self.performed_at}"