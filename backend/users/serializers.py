from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'preferred_learning_time', 'learning_style', 'native_language',
            'target_level', 'target_date', 'total_study_time', 'average_session_time',
            'favorite_exercise_type', 'bio', 'is_public_profile'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'role', 'level', 'phone_number', 'date_of_birth', 'school_name', 'class_name',
            'student_id', 'parent', 'profile'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        profile_data = validated_data.pop('profile', None)
        
        user = User.objects.create_user(**validated_data)
        
        if profile_data:
            UserProfile.objects.create(user=user, **profile_data)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password.')


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    level_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 'level',
            'phone_number', 'date_of_birth', 'profile_picture', 'school_name',
            'class_name', 'student_id', 'current_streak', 'longest_streak',
            'total_xp', 'lessons_completed', 'vocabulary_learned', 'daily_goal_minutes',
            'notifications_enabled', 'sound_effects_enabled', 'email_notifications',
            'last_active', 'created_at', 'profile', 'level_progress'
        ]
        read_only_fields = ['id', 'created_at', 'last_active']
    
    def get_level_progress(self, obj):
        return obj.get_level_progress()


class UserUpdateSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'date_of_birth',
            'profile_picture', 'school_name', 'class_name', 'student_id',
            'daily_goal_minutes', 'notifications_enabled', 'sound_effects_enabled',
            'email_notifications', 'profile'
        ]
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if profile_data:
            profile, created = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class UserStatsSerializer(serializers.ModelSerializer):
    level_progress = serializers.SerializerMethodField()
    recent_achievements = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'total_xp', 'current_streak', 'longest_streak', 'lessons_completed',
            'vocabulary_learned', 'level', 'level_progress', 'recent_achievements'
        ]
    
    def get_level_progress(self, obj):
        return obj.get_level_progress()
    
    def get_recent_achievements(self, obj):
        # This would need to be implemented based on your achievement system
        return []
