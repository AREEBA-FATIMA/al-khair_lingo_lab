from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import StudentList, TeacherList, DonorList, LoginLog
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class MultiMethodAuthBackend(ModelBackend):
    """
    Custom authentication backend that supports:
    - Student ID login for students
    - Email + password login for teachers, donors, admins
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate user based on login method
        """
        if not username or not password:
            return None
        
        # Try student ID login first
        if self._is_student_id_format(username):
            return self._authenticate_student(username, password, request)
        
        # Try email login for teachers, donors, admins
        return self._authenticate_email(username, password, request)
    
    def _is_student_id_format(self, username):
        """
        Check if username looks like a student ID
        """
        import re
        # Student ID pattern: letters and numbers, usually uppercase
        return bool(re.match(r'^[A-Z0-9]+$', username.upper()))
    
    def _authenticate_student(self, student_id, password, request):
        """
        Authenticate student using student ID
        """
        try:
            # Find student in student list
            student_entry = StudentList.objects.get(
                student_id=student_id.upper(),
                is_active=True
            )
            
            # Check if student is already registered
            user = User.objects.get(
                student_id=student_id.upper(),
                user_type='student',
                is_active=True
            )
            
            # For students, password is not required (or can be simple)
            # You can implement a simple password check here if needed
            if self._check_student_password(password):
                self._log_login_attempt(user, 'student_id', request, True)
                return user
            else:
                self._log_login_attempt(user, 'student_id', request, False)
                return None
                
        except (StudentList.DoesNotExist, User.DoesNotExist):
            # Log failed attempt
            if request:
                self._log_failed_attempt(student_id, 'student_id', request)
            return None
    
    def _authenticate_email(self, email, password, request):
        """
        Authenticate teacher, donor, or admin using email and password
        """
        try:
            # Find user by email
            user = User.objects.get(
                email__iexact=email,
                is_active=True,
                user_type__in=['teacher', 'donor', 'admin']
            )
            
            # Check password
            if user.check_password(password):
                self._log_login_attempt(user, 'email', request, True)
                return user
            else:
                self._log_login_attempt(user, 'email', request, False)
                return None
                
        except User.DoesNotExist:
            # Log failed attempt
            if request:
                self._log_failed_attempt(email, 'email', request)
            return None
    
    def _check_student_password(self, password):
        """
        Check student password (can be simple or based on student ID)
        """
        # Simple implementation - you can customize this
        # For now, any password works for students
        return len(password) >= 4
    
    def _log_login_attempt(self, user, method, request, success):
        """
        Log login attempt
        """
        try:
            LoginLog.objects.create(
                user=user,
                login_method=method,
                ip_address=self._get_client_ip(request),
                user_agent=self._get_user_agent(request),
                success=success
            )
        except Exception as e:
            logger.error(f"Failed to log login attempt: {e}")
    
    def _log_failed_attempt(self, identifier, method, request):
        """
        Log failed login attempt
        """
        try:
            # Create a temporary user object for logging
            LoginLog.objects.create(
                user=None,  # No user for failed attempts
                login_method=method,
                ip_address=self._get_client_ip(request),
                user_agent=self._get_user_agent(request),
                success=False
            )
        except Exception as e:
            logger.error(f"Failed to log failed attempt: {e}")
    
    def _get_client_ip(self, request):
        """
        Get client IP address
        """
        if not request:
            return None
        
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _get_user_agent(self, request):
        """
        Get user agent string
        """
        if not request:
            return None
        return request.META.get('HTTP_USER_AGENT', '')
    
    def get_user(self, user_id):
        """
        Get user by ID
        """
        try:
            return User.objects.get(pk=user_id, is_active=True)
        except User.DoesNotExist:
            return None


class StudentRegistrationBackend:
    """
    Backend for student registration process
    """
    
    @staticmethod
    def can_register_student(student_id):
        """
        Check if student can register
        """
        try:
            student_entry = StudentList.objects.get(
                student_id=student_id.upper(),
                is_active=True
            )
            # Check if already registered
            if User.objects.filter(
                student_id=student_id.upper(),
                user_type='student'
            ).exists():
                return False, "Student already registered"
            return True, "Can register"
        except StudentList.DoesNotExist:
            return False, "Student ID not found in student list"
    
    @staticmethod
    def register_student(student_id, full_name, email=None, password=None):
        """
        Register a new student
        """
        can_register, message = StudentRegistrationBackend.can_register_student(student_id)
        if not can_register:
            return None, message
        
        try:
            student_entry = StudentList.objects.get(
                student_id=student_id.upper(),
                is_active=True
            )
            
            # Create user
            user = User.objects.create_user(
                email=email or f"{student_id.lower()}@student.local",
                password=password or "student123",  # Default password
                user_type='student',
                student_id=student_id.upper(),
                student_list_entry=student_entry,
                full_name=full_name or student_entry.full_name,
                is_verified=True
            )
            
            # User profile fields are now part of User model
            
            return user, "Student registered successfully"
            
        except Exception as e:
            return None, f"Registration failed: {str(e)}"


class TeacherRegistrationBackend:
    """
    Backend for teacher registration process
    """
    
    @staticmethod
    def can_register_teacher(email):
        """
        Check if teacher can register
        """
        try:
            teacher_entry = TeacherList.objects.get(
                email__iexact=email,
                is_active=True
            )
            # Check if already registered
            if User.objects.filter(
                email__iexact=email,
                user_type='teacher'
            ).exists():
                return False, "Teacher already registered"
            return True, "Can register"
        except TeacherList.DoesNotExist:
            return False, "Email not found in teacher list"
    
    @staticmethod
    def register_teacher(email, password="teacher123"):
        """
        Register a new teacher
        """
        can_register, message = TeacherRegistrationBackend.can_register_teacher(email)
        if not can_register:
            return None, message
        
        try:
            teacher_entry = TeacherList.objects.get(
                email__iexact=email,
                is_active=True
            )
            
            # Create user
            user = User.objects.create_user(
                email=email,
                password=password,
                user_type='teacher',
                teacher_list_entry=teacher_entry,
                full_name=teacher_entry.full_name,
                is_verified=True
            )
            
            # User profile fields are now part of User model
            
            return user, "Teacher registered successfully"
            
        except Exception as e:
            return None, f"Registration failed: {str(e)}"


class DonorRegistrationBackend:
    """
    Backend for donor registration process
    """
    
    @staticmethod
    def can_register_donor(email):
        """
        Check if donor can register
        """
        try:
            donor_entry = DonorList.objects.get(
                email__iexact=email,
                is_active=True
            )
            # Check if already registered
            if User.objects.filter(
                email__iexact=email,
                user_type='donor'
            ).exists():
                return False, "Donor already registered"
            return True, "Can register"
        except DonorList.DoesNotExist:
            return False, "Email not found in donor list"
    
    @staticmethod
    def register_donor(email, password="donor123"):
        """
        Register a new donor
        """
        can_register, message = DonorRegistrationBackend.can_register_donor(email)
        if not can_register:
            return None, message
        
        try:
            donor_entry = DonorList.objects.get(
                email__iexact=email,
                is_active=True
            )
            
            # Create user
            user = User.objects.create_user(
                email=email,
                password=password,
                user_type='donor',
                donor_list_entry=donor_entry,
                full_name=donor_entry.full_name,
                is_verified=True
            )
            
            # User profile fields are now part of User model
            
            return user, "Donor registered successfully"
            
        except Exception as e:
            return None, f"Registration failed: {str(e)}"
