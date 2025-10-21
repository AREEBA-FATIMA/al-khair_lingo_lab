from rest_framework import serializers
from .models import Teacher


class TeacherSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    assigned_class_name = serializers.CharField(source='assigned_class.__str__', read_only=True)
    
    class Meta:
        model = Teacher
        fields = [
            'id', 'name', 'father_name', 'shift', 'assigned_class', 'assigned_class_name',
            'campus', 'campus_name', 'email', 'teacher_id', 'is_active', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['teacher_id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create a new teacher"""
        teacher = Teacher.objects.create(**validated_data)
        return teacher
    
    def update(self, instance, validated_data):
        """Update an existing teacher"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class TeacherListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing teachers"""
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    assigned_class_name = serializers.CharField(source='assigned_class.__str__', read_only=True)
    
    class Meta:
        model = Teacher
        fields = [
            'id', 'name', 'father_name', 'shift', 'assigned_class_name', 
            'campus_name', 'email', 'teacher_id', 'is_active', 'created_at'
        ]


class TeacherCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new teachers"""
    class Meta:
        model = Teacher
        fields = [
            'name', 'father_name', 'shift', 'assigned_class', 'campus', 'email'
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if Teacher.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value


class TeacherUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating teachers"""
    class Meta:
        model = Teacher
        fields = [
            'name', 'father_name', 'shift', 'assigned_class', 'campus', 'email', 'is_active'
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if Teacher.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
