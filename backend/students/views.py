from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Student
from .serializers import (
    StudentSerializer, StudentListSerializer,
    StudentCreateSerializer, StudentUpdateSerializer
)

User = get_user_model()


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return StudentListSerializer
        elif self.action == 'create':
            return StudentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StudentUpdateSerializer
        return StudentSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Student.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by grade
        grade = self.request.query_params.get('grade', None)
        if grade:
            queryset = queryset.filter(grade=grade)
        
        # Filter by section
        section = self.request.query_params.get('section', None)
        if section:
            queryset = queryset.filter(section=section)
        
        # Filter by campus
        campus = self.request.query_params.get('campus', None)
        if campus:
            queryset = queryset.filter(campus_id=campus)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a student"""
        student = self.get_object()
        student.is_active = False
        student.save()
        return Response({'message': 'Student deactivated successfully'})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a student"""
        student = self.get_object()
        student.is_active = True
        student.save()
        return Response({'message': 'Student activated successfully'})
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active students"""
        active_students = Student.objects.filter(is_active=True)
        serializer = self.get_serializer(active_students, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def inactive(self, request):
        """Get all inactive students"""
        inactive_students = Student.objects.filter(is_active=False)
        serializer = self.get_serializer(inactive_students, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_deactivate(self, request):
        """Bulk deactivate students"""
        student_ids = request.data.get('student_ids', [])
        if not student_ids:
            return Response(
                {'error': 'No student IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        students = Student.objects.filter(id__in=student_ids, is_active=True)
        count = 0
        for student in students:
            student.is_active = False
            student.save()
            count += 1
        
        return Response({
            'message': f'{count} students deactivated successfully'
        })
    
    @action(detail=False, methods=['post'])
    def bulk_activate(self, request):
        """Bulk activate students"""
        student_ids = request.data.get('student_ids', [])
        if not student_ids:
            return Response(
                {'error': 'No student IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        students = Student.objects.filter(id__in=student_ids, is_active=False)
        count = 0
        for student in students:
            student.is_active = True
            student.save()
            count += 1
        
        return Response({
            'message': f'{count} students activated successfully'
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def student_registration(request):
    """Create student and associated user account"""
    try:
        data = request.data
        print(f"DEBUG - Student registration data: {data}")
        
        # Extract student data
        student_data = {
            'name': f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
            'father_name': data.get('father_name', 'Unknown'),
            'grade': data.get('grade', ''),
            'shift': data.get('shift', 'morning'),
            'campus': data.get('campus'),
            'password': data.get('password'),
            'confirm_password': data.get('password_confirm'),
        }
        
        # Extract user data
        user_data = {
            'username': data.get('username'),
            'email': data.get('email'),
            'password': data.get('password'),
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            'father_name': data.get('father_name'),
            'campus': data.get('campus'),
            'grade': data.get('grade'),
            'shift': data.get('shift'),
        }
        
        print(f"DEBUG - Student data: {student_data}")
        print(f"DEBUG - User data: {user_data}")
        
        # Check if username already exists
        if User.objects.filter(username=user_data['username']).exists():
            return Response({
                'success': False,
                'error': 'Username already exists. Please choose a different username.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists
        if User.objects.filter(email=user_data['email']).exists():
            return Response({
                'success': False,
                'error': 'Email already exists. Please use a different email.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create Student first - system will auto-create user account
        student_serializer = StudentCreateSerializer(data=student_data)
        if student_serializer.is_valid():
            student = student_serializer.save()
            print(f"DEBUG - Student created: {student.student_id}")
            
            return Response({
                'success': True,
                'message': 'Student created successfully. User account will be created automatically by the system.',
                'student_id': student.student_id
            }, status=status.HTTP_201_CREATED)
        else:
            print(f"DEBUG - Student validation failed: {student_serializer.errors}")
            print(f"DEBUG - Student data that failed: {student_data}")
            return Response({
                'success': False,
                'error': 'Student validation failed',
                'details': student_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"DEBUG - Student registration error: {str(e)}")
        return Response({
            'success': False,
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)