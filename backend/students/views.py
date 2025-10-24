from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
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
        
        # Check if email already exists (only if email is provided)
        if user_data.get('email') and User.objects.filter(email=user_data['email']).exists():
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
        
        # Get campus object
        try:
            campus = Campus.objects.get(id=student_data['campus'])
        except Campus.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Invalid campus selected'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate student ID
        student_id = _generate_student_id(student_data['campus'], student_data['grade'], student_data['shift'])
        
        # Temporarily disable post_save signal to avoid duplicate user creation
        from django.db.models.signals import post_save
        from students.models import Student, handle_student_post_save
        
        # Disconnect the signal
        post_save.disconnect(handle_student_post_save, sender=Student)
        
        try:
            # Create Student first
            student = Student.objects.create(
                name=student_data['name'],
                father_name=student_data['father_name'],
                grade=student_data['grade'],
                shift=student_data['shift'],
                campus=campus,
                password=student_data['password'],  # Will be hashed in save()
                student_id=student_id,
                is_active=True
            )
            
            # Create User account manually
            username = f"student_{student_id}"
            user = User.objects.create_user(
                username=username,
                first_name=student_data['name'].split()[0] if student_data['name'] else '',
                last_name=' '.join(student_data['name'].split()[1:]) if len(student_data['name'].split()) > 1 else '',
                email=user_data.get('email', ''),
                password=student_data['password'],
                role='student',
                is_active=True,
                is_verified=True,
                student_id=student_id
            )
        finally:
            # Reconnect the signal
            post_save.connect(handle_student_post_save, sender=Student)
        
        print(f"DEBUG - Student and User created: {student_id}")
        
        return Response({
            'success': True,
            'message': 'Student created successfully. User account created automatically.',
            'student_id': student_id
        }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        print(f"DEBUG - Student registration error: {str(e)}")
        return Response({
            'success': False,
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def unified_registration(request):
    """Unified registration for all user types - Only students allowed for public registration"""
    try:
        data = request.data
        user_role = data.get('role', 'student')
        print(f"DEBUG - Unified registration data: {data}")
        print(f"DEBUG - User role: {user_role}")
        
        # SECURITY: Only allow student registration for public users
        # Teachers, Coordinators, and Admins must be created by existing admins
        if user_role not in ['student']:
            return Response({
                'success': False,
                'error': 'Only student registration is allowed. For teacher, coordinator, or admin accounts, please contact the administrator.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Validate required fields based on role
        if user_role == 'student':
            return student_registration(request)
        else:
            return Response({
                'success': False,
                'error': 'Invalid user role'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"DEBUG - Unified registration error: {str(e)}")
        return Response({
            'success': False,
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def teacher_registration(request):
    """Create teacher and associated user account"""
    try:
        data = request.data
        print(f"DEBUG - Teacher registration data: {data}")
        
        # Check if username already exists
        if User.objects.filter(username=data.get('username')).exists():
            return Response({
                'success': False,
                'error': 'Username already exists. Please choose a different username.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists
        if User.objects.filter(email=data.get('email')).exists():
            return Response({
                'success': False,
                'error': 'Email already exists. Please use a different email.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create Teacher first - system will auto-create user account
        from teachers.models import Teacher
        from campus.models import Campus
        
        campus = Campus.objects.get(id=data.get('campus'))
        
        teacher_data = {
            'name': f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
            'father_name': data.get('father_name', 'Unknown'),
            'email': data.get('email'),
            'campus': campus,
            'shift': data.get('shift', 'morning'),
            'teacher_type': data.get('teacher_type', 'regular'),
            'password': data.get('password'),
        }
        
        teacher = Teacher.objects.create(**teacher_data)
        print(f"DEBUG - Teacher created: {teacher.teacher_id}")
        
        return Response({
            'success': True,
            'message': 'Teacher created successfully. User account will be created automatically by the system.',
            'teacher_id': teacher.teacher_id
        }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        print(f"DEBUG - Teacher registration error: {str(e)}")
        return Response({
            'success': False,
            'error': f'Teacher registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def coordinator_registration(request):
    """Create English Coordinator and associated user account"""
    try:
        data = request.data
        print(f"DEBUG - Coordinator registration data: {data}")
        
        # Check if username already exists
        if User.objects.filter(username=data.get('username')).exists():
            return Response({
                'success': False,
                'error': 'Username already exists. Please choose a different username.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists
        if User.objects.filter(email=data.get('email')).exists():
            return Response({
                'success': False,
                'error': 'Email already exists. Please use a different email.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create English Coordinator first - system will auto-create user account
        from english_coordinator.models import EnglishCoordinator
        
        coordinator_data = {
            'name': f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
            'last_name': data.get('coordinator_last_name', data.get('last_name', '')),
            'email': data.get('email'),
            'password': data.get('password'),
        }
        
        coordinator = EnglishCoordinator.objects.create(**coordinator_data)
        print(f"DEBUG - Coordinator created: {coordinator.coordinator_id}")
        
        return Response({
            'success': True,
            'message': 'English Coordinator created successfully. User account will be created automatically by the system.',
            'coordinator_id': coordinator.coordinator_id
        }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        print(f"DEBUG - Coordinator registration error: {str(e)}")
        return Response({
            'success': False,
            'error': f'Coordinator registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_registration(request):
    """Create admin user account"""
    try:
        data = request.data
        print(f"DEBUG - Admin registration data: {data}")
        
        # Check if username already exists
        if User.objects.filter(username=data.get('username')).exists():
            return Response({
                'success': False,
                'error': 'Username already exists. Please choose a different username.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists
        if User.objects.filter(email=data.get('email')).exists():
            return Response({
                'success': False,
                'error': 'Email already exists. Please use a different email.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create User directly for admin
        user_data = {
            'username': data.get('username'),
            'email': data.get('email'),
            'password': data.get('password'),
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            'role': 'admin',
            'is_verified': True,
            'is_staff': True,
            'is_superuser': True,
        }
        
        user = User.objects.create_user(**user_data)
        print(f"DEBUG - Admin user created: {user.username}")
        
        return Response({
            'success': True,
            'message': 'Admin user created successfully.',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        print(f"DEBUG - Admin registration error: {str(e)}")
        return Response({
            'success': False,
            'error': f'Admin registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _generate_student_id(campus_id, grade, shift):
    """Generate student ID"""
    try:
        from campus.models import Campus
        from django.db.models import Max
        
        # Get campus code
        try:
            campus = Campus.objects.get(id=campus_id)
            campus_code = campus.campus_code
        except Campus.DoesNotExist:
            campus_code = "C01"
        
        # Get shift code
        shift_code = shift[0].upper() if shift else 'M'
        
        # Get grade code
        grade_code = grade.replace('Grade', '').replace('grade', '').strip()
        if grade_code.lower() == 'nursery':
            grade_code = 'NUR'
        elif 'kg' in grade_code.lower():
            grade_code = grade_code.upper()
        elif grade_code.isdigit():
            grade_code = f"G{grade_code.zfill(2)}"
        else:
            grade_code = f"G{grade_code.zfill(2)}"
        
        # Get next serial number
        last_student = Student.objects.filter(
            campus_id=campus_id,
            grade=grade,
            shift=shift
        ).aggregate(max_id=Max('student_id'))['max_id']
        
        if last_student and '-' in last_student:
            try:
                last_serial = int(last_student.split('-')[-1])
            except:
                last_serial = 0
        else:
            last_serial = 0
        
        next_serial = last_serial + 1
        
        # Generate student ID: C01-M-G01-0001
        return f"{campus_code}-{shift_code}-{grade_code}-{next_serial:04d}"
            
    except Exception as e:
        print(f"Error generating student ID: {str(e)}")
        return f"C01-M-G01-0001"