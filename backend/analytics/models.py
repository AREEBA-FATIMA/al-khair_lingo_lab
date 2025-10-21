from django.db import models
from django.contrib.auth import get_user_model
from campus.models import Campus
from classes.models import Grade, ClassRoom
from teachers.models import Teacher
from students.models import Student
from progress.models import LevelProgress
from levels.models import Level
from groups.models import Group

User = get_user_model()

class OverallAnalytics(models.Model):
    """Overall system analytics - updated daily"""
    
    # Primary Info
    id = models.AutoField(primary_key=True)
    date = models.DateField(unique=True, auto_now_add=True)
    
    # Campus Overview
    total_campuses = models.PositiveIntegerField(default=0)
    total_grades = models.PositiveIntegerField(default=0)
    total_classes = models.PositiveIntegerField(default=0)
    
    # User Statistics
    total_users = models.PositiveIntegerField(default=0)
    total_teachers = models.PositiveIntegerField(default=0)
    total_students = models.PositiveIntegerField(default=0)
    active_users_today = models.PositiveIntegerField(default=0)
    
    # Learning Progress
    total_levels = models.PositiveIntegerField(default=0)
    total_groups = models.PositiveIntegerField(default=0)
    levels_completed_today = models.PositiveIntegerField(default=0)
    total_levels_completed = models.PositiveIntegerField(default=0)
    
    # Performance Metrics
    average_completion_rate = models.FloatField(default=0.0)
    average_xp_per_student = models.FloatField(default=0.0)
    average_streak = models.FloatField(default=0.0)
    total_xp_earned = models.PositiveIntegerField(default=0)
    
    # Engagement Metrics
    students_with_streak = models.PositiveIntegerField(default=0)
    students_active_this_week = models.PositiveIntegerField(default=0)
    students_active_this_month = models.PositiveIntegerField(default=0)
    
    # Top Performers
    top_student_xp = models.PositiveIntegerField(default=0)
    top_student_streak = models.PositiveIntegerField(default=0)
    top_class_completion = models.FloatField(default=0.0)
    
    # System Health
    system_uptime_percentage = models.FloatField(default=100.0)
    average_response_time = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Overall Analytics"
        verbose_name_plural = "Overall Analytics"
        ordering = ['-date']
    
    def __str__(self):
        return f"Analytics - {self.date}"

class CampusAnalytics(models.Model):
    """Campus-specific analytics"""
    
    id = models.AutoField(primary_key=True)
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE, related_name='analytics')
    date = models.DateField(auto_now_add=True)
    
    # Campus Stats
    total_teachers = models.PositiveIntegerField(default=0)
    total_students = models.PositiveIntegerField(default=0)
    total_classes = models.PositiveIntegerField(default=0)
    
    # Performance
    average_class_completion = models.FloatField(default=0.0)
    total_xp_earned = models.PositiveIntegerField(default=0)
    levels_completed_today = models.PositiveIntegerField(default=0)
    
    # Engagement
    active_students_today = models.PositiveIntegerField(default=0)
    active_students_this_week = models.PositiveIntegerField(default=0)
    students_with_streak = models.PositiveIntegerField(default=0)
    
    # Top Performers
    top_student_name = models.CharField(max_length=100, blank=True)
    top_student_xp = models.PositiveIntegerField(default=0)
    top_class_name = models.CharField(max_length=100, blank=True)
    top_class_completion = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Campus Analytics"
        verbose_name_plural = "Campus Analytics"
        unique_together = ['campus', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.campus.campus_name} - {self.date}"

class TeacherAnalytics(models.Model):
    """Teacher-specific analytics"""
    
    id = models.AutoField(primary_key=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='analytics')
    date = models.DateField(auto_now_add=True)
    
    # Class Info
    assigned_class = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, null=True, blank=True)
    total_students = models.PositiveIntegerField(default=0)
    
    # Performance Metrics
    students_completed_levels = models.PositiveIntegerField(default=0)
    total_levels_completed = models.PositiveIntegerField(default=0)
    average_completion_rate = models.FloatField(default=0.0)
    average_xp_per_student = models.FloatField(default=0.0)
    
    # Student Engagement
    active_students_today = models.PositiveIntegerField(default=0)
    students_with_streak = models.PositiveIntegerField(default=0)
    average_streak = models.FloatField(default=0.0)
    
    # Top Performers
    top_student_name = models.CharField(max_length=100, blank=True)
    top_student_xp = models.PositiveIntegerField(default=0)
    struggling_students = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Teacher Analytics"
        verbose_name_plural = "Teacher Analytics"
        unique_together = ['teacher', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.teacher.name} - {self.date}"

class StudentAnalytics(models.Model):
    """Student-specific analytics"""
    
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='analytics')
    date = models.DateField(auto_now_add=True)
    
    # Progress Stats
    levels_completed = models.PositiveIntegerField(default=0)
    total_xp_earned = models.PositiveIntegerField(default=0)
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    
    # Performance
    average_score = models.FloatField(default=0.0)
    total_time_spent = models.PositiveIntegerField(default=0)  # in minutes
    questions_answered = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    
    # Engagement
    days_active_this_week = models.PositiveIntegerField(default=0)
    days_active_this_month = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Rankings
    class_rank = models.PositiveIntegerField(default=0)
    campus_rank = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Student Analytics"
        verbose_name_plural = "Student Analytics"
        unique_together = ['student', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.student.name} - {self.date}"

class ClassAnalytics(models.Model):
    """Class-specific analytics"""
    
    id = models.AutoField(primary_key=True)
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='analytics')
    date = models.DateField(auto_now_add=True)
    
    # Class Stats
    total_students = models.PositiveIntegerField(default=0)
    active_students_today = models.PositiveIntegerField(default=0)
    active_students_this_week = models.PositiveIntegerField(default=0)
    
    # Performance
    total_levels_completed = models.PositiveIntegerField(default=0)
    average_completion_rate = models.FloatField(default=0.0)
    total_xp_earned = models.PositiveIntegerField(default=0)
    average_xp_per_student = models.FloatField(default=0.0)
    
    # Engagement
    students_with_streak = models.PositiveIntegerField(default=0)
    average_streak = models.FloatField(default=0.0)
    
    # Top Performers
    top_student_name = models.CharField(max_length=100, blank=True)
    top_student_xp = models.PositiveIntegerField(default=0)
    struggling_students = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Class Analytics"
        verbose_name_plural = "Class Analytics"
        unique_together = ['classroom', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.classroom} - {self.date}"

class PerformanceTrend(models.Model):
    """Track performance trends over time"""
    
    TREND_TYPE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    id = models.AutoField(primary_key=True)
    trend_type = models.CharField(max_length=10, choices=TREND_TYPE_CHOICES)
    date = models.DateField()
    
    # Overall Trends
    total_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    levels_completed = models.PositiveIntegerField(default=0)
    total_xp_earned = models.PositiveIntegerField(default=0)
    
    # Performance Trends
    average_completion_rate = models.FloatField(default=0.0)
    average_xp_per_user = models.FloatField(default=0.0)
    average_streak = models.FloatField(default=0.0)
    
    # Engagement Trends
    new_users = models.PositiveIntegerField(default=0)
    returning_users = models.PositiveIntegerField(default=0)
    churn_rate = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Performance Trend"
        verbose_name_plural = "Performance Trends"
        unique_together = ['trend_type', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.trend_type.title()} Trend - {self.date}"
