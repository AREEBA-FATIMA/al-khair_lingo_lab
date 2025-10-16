from rest_framework import serializers
from .models import Teacher

# TeacherRole serializer removed - using current_role_title field instead
class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'
        read_only_fields = ['teacher_code', 'teacher_id', 'date_created', 'date_updated']
    
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
    class Meta:
        model = Teacher
        fields = [
            'id', 'full_name', 'teacher_code', 'teacher_id', 'email', 
            'current_campus', 'shift', 'is_currently_active', 'date_created'
        ]


class TeacherDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for teacher details"""
    class Meta:
        model = Teacher
        fields = '__all__'
        read_only_fields = ['teacher_code', 'teacher_id', 'date_created', 'date_updated']


class TeacherCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new teachers"""
    class Meta:
        model = Teacher
        exclude = ['teacher_id', 'date_created', 'date_updated']
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if Teacher.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    def validate_cnic(self, value):
        """Validate CNIC uniqueness"""
        if value and Teacher.objects.filter(cnic=value).exists():
            raise serializers.ValidationError("CNIC already exists.")
        return value


class TeacherUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating teachers"""
    class Meta:
        model = Teacher
        exclude = ['teacher_id', 'date_created', 'date_updated']
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if Teacher.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    def validate_cnic(self, value):
        """Validate CNIC uniqueness"""
        if value and Teacher.objects.filter(cnic=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("CNIC already exists.")
        return value
