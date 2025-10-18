from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import LoginLog
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class MultiMethodAuthBackend(ModelBackend):
    """
    Custom authentication backend supporting:
    - Student ID login for students (no password)
    - Email + password login for teachers and admins
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate user based on login method
        """
        if not username:
            return None
        
        # Try student ID login first (no password required)
        if self._is_student_id_format(username):
            return self._authenticate_student(username, request)
        
        # Try student name login (no password required)
        if self._is_student_name_login(username, password):
            user = self._authenticate_student_by_name(username, request)
            if user:
                return user
        
        # Try student username login (no password required)
        if self._is_student_username_login(username, password):
            return self._authenticate_student_by_username(username, request)
        
        # Try email + password login for teachers and admins
        if password:
            return self._authenticate_email_password(username, password, request)
        
        return None
    
    def _is_student_id_format(self, username):
        """
        Check if username looks like a student ID
        """
        import re
        # Student ID pattern: C01-M-G01-A-0001 (Campus-Shift-Grade-Section-Serial)
        return bool(re.match(r'^C\d{2}-M-[A-Z0-9]+-[A-Z]-\d{4}$', username.upper()))
    
    def _is_student_name_login(self, username, password):
        """
        Check if this is a student name login (no password provided)
        """
        return not password and username and not self._is_student_id_format(username)
    
    def _is_student_username_login(self, username, password):
        """
        Check if this is a student username login (no password provided)
        """
        return not password and username and not self._is_student_id_format(username)
    
    def _authenticate_student_by_name(self, name, request):
        """
        Authenticate student using name (no password required)
        """
        try:
            # Find student user by name
            user = User.objects.get(
                first_name__icontains=name,
                role='student',
                is_active=True
            )
            
            self._log_login_attempt(user, 'student_name', request, True)
            return user
                
        except User.DoesNotExist:
            # Try with full name
            try:
                user = User.objects.get(
                    Q(first_name__icontains=name) | Q(last_name__icontains=name),
                    role='student',
                    is_active=True
                )
                
                self._log_login_attempt(user, 'student_name', request, True)
                return user
            except User.DoesNotExist:
                # Log failed attempt
                if request:
                    self._log_failed_attempt(name, 'student_name', request)
                return None
    
    def _authenticate_student_by_username(self, username, request):
        """
        Authenticate student using username (no password required)
        """
        try:
            # Find student user by username
            user = User.objects.get(
                username=username,
                role='student',
                is_active=True
            )
            
            self._log_login_attempt(user, 'student_username', request, True)
            return user
                
        except User.DoesNotExist:
            # Log failed attempt
            if request:
                self._log_failed_attempt(username, 'student_username', request)
            return None
    
    def _authenticate_student(self, student_id, request):
        """
        Authenticate student using student ID (no password required)
        """
        try:
            # Find student user by student_id
            user = User.objects.get(
                student_id=student_id.upper(),
                role='student',
                is_active=True
            )
            
            self._log_login_attempt(user, 'student_id', request, True)
            return user
                
        except User.DoesNotExist:
            # Log failed attempt
            if request:
                self._log_failed_attempt(student_id, 'student_id', request)
            return None
    
    def _authenticate_email_password(self, email, password, request):
        """
        Authenticate teacher or admin using email and password
        """
        try:
            # Find user by email
            user = User.objects.get(
                email=email,
                role__in=['teacher', 'admin'],
                is_active=True
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
    
    def _log_login_attempt(self, user, login_method, request, success):
        """
        Log login attempt
        """
        try:
            LoginLog.objects.create(
                user=user,
                login_method=login_method,
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                success=success
            )
        except Exception as e:
            logger.error(f"Failed to log login attempt: {e}")
    
    def _log_failed_attempt(self, identifier, login_method, request):
        """
        Log failed login attempt
        """
        try:
            LoginLog.objects.create(
                user=None,
                login_method=login_method,
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                success=False,
                failure_reason=f"User not found: {identifier}"
            )
        except Exception as e:
            logger.error(f"Failed to log failed attempt: {e}")
    
    def _get_client_ip(self, request):
        """
        Get client IP address from request
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# Registration backends removed - now handled in separate apps