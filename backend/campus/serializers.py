from rest_framework import serializers
from .models import Campus


class CampusSerializer(serializers.ModelSerializer):
    """Serializer for Campus model"""
    
    class Meta:
        model = Campus
        fields = '__all__'
        read_only_fields = [
            'campus_id', 'total_rooms', 'total_washrooms', 'student_washrooms',
            'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """Create a new campus"""
        campus = Campus.objects.create(**validated_data)
        return campus
    
    def update(self, instance, validated_data):
        """Update an existing campus"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class CampusListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing campuses"""
    
    class Meta:
        model = Campus
        fields = [
            'id', 'campus_name', 'campus_code', 'campus_id', 'city',
            'campus_type', 'status', 'total_students', 'total_teachers',
            'shift_available', 'created_at'
        ]


class CampusDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for campus details"""
    
    class Meta:
        model = Campus
        fields = '__all__'
        read_only_fields = [
            'campus_id', 'total_rooms', 'total_washrooms', 'student_washrooms',
            'created_at', 'updated_at'
        ]


class CampusCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new campuses"""
    
    class Meta:
        model = Campus
        exclude = [
            'campus_id', 'total_rooms', 'total_washrooms', 'student_washrooms',
            'created_at', 'updated_at'
        ]
    
    def validate_campus_code(self, value):
        """Validate campus code uniqueness"""
        if Campus.objects.filter(campus_code=value).exists():
            raise serializers.ValidationError("Campus code already exists.")
        return value
    
    def validate_official_email(self, value):
        """Validate official email uniqueness"""
        if Campus.objects.filter(official_email=value).exists():
            raise serializers.ValidationError("Official email already exists.")
        return value


class CampusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating campuses"""
    
    class Meta:
        model = Campus
        exclude = [
            'campus_id', 'total_rooms', 'total_washrooms', 'student_washrooms',
            'created_at', 'updated_at'
        ]
    
    def validate_campus_code(self, value):
        """Validate campus code uniqueness"""
        if Campus.objects.filter(campus_code=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Campus code already exists.")
        return value
    
    def validate_official_email(self, value):
        """Validate official email uniqueness"""
        if Campus.objects.filter(official_email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Official email already exists.")
        return value
