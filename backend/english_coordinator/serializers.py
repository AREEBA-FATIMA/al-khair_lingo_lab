from rest_framework import serializers
from .models import EnglishCoordinator
from users.models import User
from campus.models import Campus
from teachers.models import Teacher
from students.models import Student


class EnglishCoordinatorSerializer(serializers.ModelSerializer):
    """Serializer for English Coordinator"""
    
    class Meta:
        model = EnglishCoordinator
        fields = [
            'id', 'name', 'father_name', 'email', 'password', 'coordinator_id',
            'supervises_all_grades', 'can_assign_teachers', 'can_view_all_progress', 
            'can_manage_content', 'can_reassign_teachers', 'is_active', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'coordinator_id', 'created_at', 'updated_at']


class EnglishCoordinatorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating English Coordinator"""
    
    class Meta:
        model = EnglishCoordinator
        fields = [
            'name', 'father_name', 'email', 'password',
            'supervises_all_grades', 'can_assign_teachers', 'can_view_all_progress',
            'can_manage_content', 'can_reassign_teachers'
        ]


class TeacherAssignmentSerializer(serializers.Serializer):
    """Serializer for teacher assignment operations"""
    
    teacher_id = serializers.IntegerField()
    grade_id = serializers.IntegerField()
    
    def validate_teacher_id(self, value):
        try:
            teacher = Teacher.objects.get(id=value)
            return value
        except Teacher.DoesNotExist:
            raise serializers.ValidationError("Teacher not found")
    
    def validate_grade_id(self, value):
        try:
            from classes.models import Grade
            grade = Grade.objects.get(id=value)
            return value
        except:
            raise serializers.ValidationError("Grade not found")


class StudentProgressSerializer(serializers.Serializer):
    """Serializer for student progress data"""
    
    student_id = serializers.CharField()
    student_name = serializers.CharField()
    grade = serializers.CharField()
    shift = serializers.CharField()
    teacher_name = serializers.CharField()
    total_completions = serializers.IntegerField()
    last_activity = serializers.DateTimeField()


class GradePerformanceSerializer(serializers.Serializer):
    """Serializer for grade performance data"""
    
    grade_name = serializers.CharField()
    grade_code = serializers.CharField()
    shift = serializers.CharField()
    english_teacher = serializers.CharField()
    total_students = serializers.IntegerField()
    active_students = serializers.IntegerField()
    total_completions = serializers.IntegerField()
    completion_rate = serializers.FloatField()


class CoordinatorDashboardSerializer(serializers.Serializer):
    """Serializer for coordinator dashboard data"""
    
    total_teachers = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_grades = serializers.IntegerField()
    total_completions = serializers.IntegerField()
    grade_performance = GradePerformanceSerializer(many=True)
    recent_activity = serializers.ListField(child=serializers.DictField())
