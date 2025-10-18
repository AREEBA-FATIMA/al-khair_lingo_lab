from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, LoginLog


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model"""
    
    class Meta:
        model = User
        fields = [
            'id', 'role', 'email', 'username', 'first_name', 'last_name',
            'phone_number', 'student_id', 'is_verified', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'is_verified', 'created_at', 'updated_at'
        ]
    
    def get_display_name(self, obj):
        return obj.get_full_name()


class StudentLoginSerializer(serializers.Serializer):
    """Serializer for student login (Student ID only)"""
    student_id = serializers.CharField(max_length=20)
    
    def validate_student_id(self, value):
        """Validate student ID format"""
        import re
        # Student ID pattern: C01-M-G01-A-0001 (Campus-Shift-Grade-Section-Serial)
        if not re.match(r'^C\d{2}-M-[A-Z0-9]+-[A-Z]-\d{4}$', value.upper()):
            raise serializers.ValidationError("Invalid student ID format. Expected format: C01-M-G01-A-0001")
        return value.upper()
    
    def validate(self, attrs):
        """Validate login credentials"""
        student_id = attrs.get('student_id')
        
        if student_id:
            user = authenticate(
                request=self.context.get('request'),
                username=student_id,
                password=None  # No password for students
            )
            
            if not user:
                raise serializers.ValidationError("Invalid student ID")
            
            if not user.is_active:
                raise serializers.ValidationError("Student account is disabled")
            
            if user.role != 'student':
                raise serializers.ValidationError("Access denied. Student access required.")
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError("Student ID is required")


class TeacherAdminLoginSerializer(serializers.Serializer):
    """Serializer for teacher/admin login (Email + Password)"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validate login credentials"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError("Invalid credentials")
            
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            
            if user.role not in ['teacher', 'admin']:
                raise serializers.ValidationError("Access denied. Teacher/Admin access required.")
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError("Must include email and password")


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for admin user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'full_name', 'phone_number', 'password', 'password_confirm',
            'bio', 'is_public_profile', 'notifications_enabled', 'email_notifications'
        ]
    
    def validate(self, attrs):
        """Validate registration data"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        """Create new admin user"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Force user_type to admin
        validated_data['user_type'] = 'admin'
        validated_data['is_verified'] = True  # Auto-verify admin users
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating admin user"""
    
    class Meta:
        model = User
        fields = [
            'full_name', 'phone_number', 'profile_picture', 'bio', 
            'is_public_profile', 'notifications_enabled', 'email_notifications'
        ]


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
    
    def validate(self, attrs):
        """Validate password change data"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def save(self):
        """Save new password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class LoginLogSerializer(serializers.ModelSerializer):
    """Serializer for login logs"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_display_name', read_only=True)
    
    class Meta:
        model = LoginLog
        fields = [
            'id', 'user', 'user_email', 'user_name', 'login_method',
            'ip_address', 'user_agent', 'success', 'failure_reason',
            'attempted_at'
        ]
        read_only_fields = ['id', 'attempted_at']