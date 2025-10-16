from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ['student_code', 'created_at', 'updated_at', 'deleted_at']
    
    def create(self, validated_data):
        """Create a new student"""
        student = Student.objects.create(**validated_data)
        return student
    
    def update(self, instance, validated_data):
        """Update an existing student"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class StudentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing students"""
    class Meta:
        model = Student
        fields = [
            'id', 'name', 'student_id', 'student_code', 'current_grade', 
            'current_state', 'is_deleted', 'created_at'
        ]


class StudentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for student details"""
    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ['student_code', 'created_at', 'updated_at', 'deleted_at']


class StudentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new students"""
    class Meta:
        model = Student
        exclude = ['student_code', 'is_deleted', 'deleted_at', 'created_at', 'updated_at']
    
    def validate_student_id(self, value):
        """Validate student ID uniqueness"""
        if value and Student.objects.filter(student_id=value).exists():
            raise serializers.ValidationError("Student ID already exists.")
        return value


class StudentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating students"""
    class Meta:
        model = Student
        exclude = ['student_code', 'is_deleted', 'deleted_at', 'created_at', 'updated_at']
    
    def validate_student_id(self, value):
        """Validate student ID uniqueness"""
        if value and Student.objects.filter(student_id=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Student ID already exists.")
        return value
