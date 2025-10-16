from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.db.models import Q
from django.core.paginator import Paginator
from django.utils import timezone
from .models import (
    User, StudentList, TeacherList, DonorList, LoginLog
)
from .authentication import (
    StudentRegistrationBackend, TeacherRegistrationBackend, DonorRegistrationBackend
)
from .serializers import (
    UserSerializer, StudentListSerializer,
    TeacherListSerializer, DonorListSerializer, StudentLoginSerializer,
    EmailLoginSerializer, StudentRegistrationSerializer,
    TeacherRegistrationSerializer, DonorRegistrationSerializer,
    PasswordChangeSerializer, UserUpdateSerializer, LoginLogSerializer,
    UserStatsSerializer
)
from .authentication import MultiMethodAuthBackend
import logging

logger = logging.getLogger(__name__)


class StudentLoginView(APIView):
    """Student login using student ID"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = StudentLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Update last active
            user.last_active = timezone.now()
            user.save()
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class EmailLoginView(APIView):
    """Email login for teachers, donors, admins"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = EmailLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Update last active
            user.last_active = timezone.now()
            user.save()
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class StudentRegistrationView(APIView):
    """Student registration"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = StudentRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            return Response({
                'success': True,
                'message': 'Student registered successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class TeacherRegistrationView(APIView):
    """Teacher registration"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = TeacherRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            return Response({
                'success': True,
                'message': 'Teacher registered successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class DonorRegistrationView(APIView):
    """Donor registration"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = DonorRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            return Response({
                'success': True,
                'message': 'Donor registered successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """Get and update user profile"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user profile"""
        user = request.user
        
        return Response({
            'success': True,
            'user': UserSerializer(user).data
        })
    
    def put(self, request):
        """Update user profile"""
        user = request.user
        
        # Update user information
        user_serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'user': UserSerializer(user).data
        })


class PasswordChangeView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Password changed successfully'
            })
        
        return Response({
            'success': False,
            'message': 'Password change failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserStatsView(APIView):
    """Get user statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        stats = UserStatsSerializer(user).data
        
        # Add additional stats
        stats['level_progress'] = user.get_level_progress()
        stats['current_level'] = (user.total_xp // 100) + 1
        stats['next_level_xp'] = 100 - (user.total_xp % 100)
        
        return Response({
            'success': True,
            'stats': stats
        })


class StudentListView(generics.ListAPIView):
    """List all students (admin only)"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        if not request.user.user_type == 'admin':
            return User.objects.none()
        return User.objects.filter(user_type='student', is_active=True)


class TeacherListView(generics.ListAPIView):
    """List all teachers (admin only)"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        if not request.user.user_type == 'admin':
            return User.objects.none()
        return User.objects.filter(user_type='teacher', is_active=True)


class DonorListView(generics.ListAPIView):
    """List all donors (admin only)"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        if not request.user.user_type == 'admin':
            return User.objects.none()
        return User.objects.filter(user_type='donor', is_active=True)


class StudentListManagementView(APIView):
    """Manage student list (admin only)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get student list"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        students = StudentList.objects.all()
        serializer = StudentListSerializer(students, many=True)
        
        return Response({
            'success': True,
            'students': serializer.data
        })
    
    def post(self, request):
        """Add student to list"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = StudentListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Student added to list',
                'student': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Failed to add student',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class TeacherListManagementView(APIView):
    """Manage teacher list (admin only)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get teacher list"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        teachers = TeacherList.objects.all()
        serializer = TeacherListSerializer(teachers, many=True)
        
        return Response({
            'success': True,
            'teachers': serializer.data
        })
    
    def post(self, request):
        """Add teacher to list"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TeacherListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Teacher added to list',
                'teacher': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Failed to add teacher',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class DonorListManagementView(APIView):
    """Manage donor list (admin only)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get donor list"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        donors = DonorList.objects.all()
        serializer = DonorListSerializer(donors, many=True)
        
        return Response({
            'success': True,
            'donors': serializer.data
        })
    
    def post(self, request):
        """Add donor to list"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = DonorListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Donor added to list',
                'donor': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Failed to add donor',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginLogsView(APIView):
    """View login logs (admin only)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get login logs"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        logs = LoginLog.objects.all().order_by('-attempted_at')[:100]
        serializer = LoginLogSerializer(logs, many=True)
        
        return Response({
            'success': True,
            'logs': serializer.data
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout user"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'success': True,
            'message': 'Logout successful'
        })
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Logout failed',
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_auth(request):
    """Check if user is authenticated"""
    return Response({
        'success': True,
        'authenticated': True,
        'user': UserSerializer(request.user).data
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def check_student_id(request):
    """Check if student ID exists in student list"""
    student_id = request.data.get('student_id', '').upper()
    
    try:
        student = StudentList.objects.get(student_id=student_id, is_active=True)
        is_registered = User.objects.filter(
            student_id=student_id,
            user_type='student'
        ).exists()
        
        return Response({
            'success': True,
            'exists': True,
            'is_registered': is_registered,
            'student_name': student.full_name
        })
    except StudentList.DoesNotExist:
        return Response({
            'success': True,
            'exists': False,
            'is_registered': False
        })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def check_email(request):
    """Check if email exists in teacher/donor list"""
    email = request.data.get('email', '').lower()
    
    # Check teacher list
    try:
        teacher = TeacherList.objects.get(email__iexact=email, is_active=True)
        is_registered = User.objects.filter(
            email__iexact=email,
            user_type='teacher'
        ).exists()
        
        return Response({
            'success': True,
            'exists': True,
            'user_type': 'teacher',
            'is_registered': is_registered,
            'name': teacher.full_name
        })
    except TeacherList.DoesNotExist:
        pass
    
    # Check donor list
    try:
        donor = DonorList.objects.get(email__iexact=email, is_active=True)
        is_registered = User.objects.filter(
            email__iexact=email,
            user_type='donor'
        ).exists()
        
        return Response({
            'success': True,
            'exists': True,
            'user_type': 'donor',
            'is_registered': is_registered,
            'name': donor.full_name
        })
    except DonorList.DoesNotExist:
        pass
    
    return Response({
        'success': True,
        'exists': False,
        'is_registered': False
    })