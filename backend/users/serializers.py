from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import (
    User, StudentList, TeacherList, DonorList, LoginLog
)
from .authentication import (
    StudentRegistrationBackend, TeacherRegistrationBackend, DonorRegistrationBackend
)


class StudentListSerializer(serializers.ModelSerializer):
    """Serializer for student list entries"""
    
    class Meta:
        model = StudentList
        fields = [
            'id', 'student_id', 'full_name', 'email', 'class_name',
            'school_name', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TeacherListSerializer(serializers.ModelSerializer):
    """Serializer for teacher list entries"""
    
    class Meta:
        model = TeacherList
        fields = [
            'id', 'email', 'full_name', 'subject', 'department',
            'school_name', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DonorListSerializer(serializers.ModelSerializer):
    """Serializer for donor list entries"""
    
    class Meta:
        model = DonorList
        fields = [
            'id', 'email', 'full_name', 'organization', 'contact_number',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']




class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model"""
    student_list_entry = StudentListSerializer(read_only=True)
    teacher_list_entry = TeacherListSerializer(read_only=True)
    donor_list_entry = DonorListSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'user_type', 'email', 'student_id', 'full_name',
            'phone_number', 'profile_picture', 'current_streak',
            'longest_streak', 'total_xp', 'lessons_completed',
            'vocabulary_learned', 'daily_goal_minutes',
            'notifications_enabled', 'sound_effects_enabled',
            'email_notifications', 'bio', 'native_language',
            'learning_style', 'target_level', 'is_public_profile',
            'is_verified', 'is_active', 'last_active', 'created_at', 'updated_at',
            'student_list_entry', 'teacher_list_entry', 'donor_list_entry'
        ]
        read_only_fields = [
            'id', 'user_type', 'student_id', 'current_streak',
            'longest_streak', 'total_xp', 'lessons_completed',
            'vocabulary_learned', 'is_verified', 'last_active',
            'created_at', 'updated_at', 'student_list_entry',
            'teacher_list_entry', 'donor_list_entry'
        ]
    
    def get_display_name(self, obj):
        return obj.get_display_name()
    
    def get_level_progress(self, obj):
        return obj.get_level_progress()


class StudentLoginSerializer(serializers.Serializer):
    """Serializer for student login"""
    student_id = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, required=False)
    
    def validate_student_id(self, value):
        """Validate student ID format"""
        import re
        if not re.match(r'^[A-Z0-9]+$', value.upper()):
            raise serializers.ValidationError("Invalid student ID format")
        return value.upper()
    
    def validate(self, attrs):
        """Validate login credentials"""
        student_id = attrs.get('student_id')
        password = attrs.get('password', '')
        
        # Check if student exists in student list
        try:
            student_entry = StudentList.objects.get(
                student_id=student_id,
                is_active=True
            )
        except StudentList.DoesNotExist:
            raise serializers.ValidationError("Student ID not found")
        
        # Check if student is registered
        try:
            user = User.objects.get(
                student_id=student_id,
                user_type='student',
                is_active=True
            )
        except User.DoesNotExist:
            raise serializers.ValidationError("Student not registered")
        
        # Simple password validation for students
        if len(password) < 4:
            raise serializers.ValidationError("Password must be at least 4 characters")
        
        attrs['user'] = user
        return attrs


class EmailLoginSerializer(serializers.Serializer):
    """Serializer for email login (teachers, donors, admins)"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validate login credentials"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        # Authenticate user
        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )
        
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        if not user.is_active:
            raise serializers.ValidationError("Account is deactivated")
        
        if user.user_type not in ['teacher', 'donor', 'admin']:
            raise serializers.ValidationError("Invalid user type for email login")
        
        attrs['user'] = user
        return attrs


class StudentRegistrationSerializer(serializers.Serializer):
    """Serializer for student registration"""
    student_id = serializers.CharField(max_length=20)
    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False)
    
    def validate_student_id(self, value):
        """Validate student ID format"""
        import re
        if not re.match(r'^[A-Z0-9]+$', value.upper()):
            raise serializers.ValidationError("Invalid student ID format")
        return value.upper()
    
    def validate(self, attrs):
        """Validate registration data"""
        student_id = attrs.get('student_id')
        email = attrs.get('email')
        
        # Check if student can register
        can_register, message = StudentRegistrationBackend.can_register_student(student_id)
        if not can_register:
            raise serializers.ValidationError(message)
        
        # Check email uniqueness if provided
        if email and User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Email already exists")
        
        return attrs
    
    def create(self, validated_data):
        """Create new student user"""
        student_id = validated_data['student_id']
        full_name = validated_data['full_name']
        email = validated_data.get('email')
        password = validated_data.get('password')
        
        user, message = StudentRegistrationBackend.register_student(
            student_id, full_name, email, password
        )
        
        if not user:
            raise serializers.ValidationError(message)
        
        return user


class TeacherRegistrationSerializer(serializers.Serializer):
    """Serializer for teacher registration"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False)
    
    def validate_email(self, value):
        """Validate email"""
        return value.lower()
    
    def validate(self, attrs):
        """Validate registration data"""
        email = attrs.get('email')
        
        # Check if teacher can register
        can_register, message = TeacherRegistrationBackend.can_register_teacher(email)
        if not can_register:
            raise serializers.ValidationError(message)
        
        return attrs
    
    def create(self, validated_data):
        """Create new teacher user"""
        email = validated_data['email']
        password = validated_data.get('password')
        
        user, message = TeacherRegistrationBackend.register_teacher(email, password)
        
        if not user:
            raise serializers.ValidationError(message)
        
        return user


class DonorRegistrationSerializer(serializers.Serializer):
    """Serializer for donor registration"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False)
    
    def validate_email(self, value):
        """Validate email"""
        return value.lower()
    
    def validate(self, attrs):
        """Validate registration data"""
        email = attrs.get('email')
        
        # Check if donor can register
        can_register, message = DonorRegistrationBackend.can_register_donor(email)
        if not can_register:
            raise serializers.ValidationError(message)
        
        return attrs
    
    def create(self, validated_data):
        """Create new donor user"""
        email = validated_data['email']
        password = validated_data.get('password')
        
        user, message = DonorRegistrationBackend.register_donor(email, password)
        
        if not user:
            raise serializers.ValidationError(message)
        
        return user


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
    
    def validate_new_password(self, value):
        """Validate new password"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate(self, attrs):
        """Validate password change data"""
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')
        
        if new_password != confirm_password:
            raise serializers.ValidationError("Passwords do not match")
        
        return attrs
    
    def save(self):
        """Change user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user information"""
    
    class Meta:
        model = User
        fields = [
            'full_name', 'phone_number', 'profile_picture',
            'daily_goal_minutes', 'notifications_enabled',
            'sound_effects_enabled', 'email_notifications',
            'bio', 'native_language', 'learning_style',
            'target_level', 'is_public_profile'
        ]
    
    def validate_daily_goal_minutes(self, value):
        """Validate daily goal"""
        if value < 1 or value > 480:  # 1 minute to 8 hours
            raise serializers.ValidationError("Daily goal must be between 1 and 480 minutes")
        return value


class LoginLogSerializer(serializers.ModelSerializer):
    """Serializer for login logs"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = LoginLog
        fields = [
            'id', 'user', 'login_method', 'ip_address',
            'user_agent', 'success', 'attempted_at'
        ]
        read_only_fields = ['id', 'attempted_at']


class UserStatsSerializer(serializers.ModelSerializer):
    """Serializer for user statistics"""
    level_progress = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'user_type', 'display_name', 'total_xp',
            'current_streak', 'longest_streak', 'lessons_completed',
            'vocabulary_learned', 'level_progress', 'last_active'
        ]
    
    def get_level_progress(self, obj):
        return obj.get_level_progress()
    
    def get_display_name(self, obj):
        return obj.get_display_name()