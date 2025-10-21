from rest_framework import serializers
from .models import Grade


class GradeSerializer(serializers.ModelSerializer):
    """Serializer for Grade model"""
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    english_teacher_name = serializers.CharField(source='english_teacher.name', read_only=True)
    
    class Meta:
        model = Grade
        fields = '__all__'
        read_only_fields = ['code']
    
    def create(self, validated_data):
        """Create a new grade"""
        grade = Grade.objects.create(**validated_data)
        return grade
    
    def update(self, instance, validated_data):
        """Update an existing grade"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance