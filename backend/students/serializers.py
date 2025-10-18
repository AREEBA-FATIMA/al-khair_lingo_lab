from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    class_teacher_name = serializers.CharField(source='class_teacher.name', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'name', 'father_name', 'grade', 'section', 
            'campus', 'campus_name', 'class_teacher', 'class_teacher_name',
            'password', 'student_id', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['student_id', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
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
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    class_teacher_name = serializers.CharField(source='class_teacher.name', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'name', 'father_name', 'grade', 'section', 
            'campus_name', 'class_teacher_name', 'student_id', 
            'is_active', 'created_at'
        ]


class StudentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new students"""
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Student
        fields = [
            'name', 'father_name', 'grade', 'section', 'campus', 
            'class_teacher', 'password', 'confirm_password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'confirm_password': {'write_only': True}
        }
    
    def validate(self, data):
        """Validate password confirmation"""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        return data
    
    def create(self, validated_data):
        """Create a new student"""
        validated_data.pop('confirm_password')
        student = Student.objects.create(**validated_data)
        return student


class StudentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating students"""
    class Meta:
        model = Student
        fields = [
            'name', 'father_name', 'grade', 'section', 'campus', 
            'class_teacher', 'password', 'is_active'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }
