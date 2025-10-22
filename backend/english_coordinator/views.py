from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import EnglishCoordinator
from .serializers import (
    EnglishCoordinatorSerializer,
    EnglishCoordinatorCreateSerializer,
    TeacherAssignmentSerializer,
    StudentProgressSerializer,
    GradePerformanceSerializer,
    CoordinatorDashboardSerializer
)
from .permissions import (
    IsEnglishCoordinator,
    IsEnglishCoordinatorOrAdmin,
    CanManageTeachers,
    CanViewAllProgress,
    CampusBasedAccess
)
from teachers.models import Teacher
from students.models import Student
from classes.models import Grade


class EnglishCoordinatorViewSet(viewsets.ModelViewSet):
    """ViewSet for English Coordinator operations"""
    
    queryset = EnglishCoordinator.objects.all()
    permission_classes = [IsAuthenticated, IsEnglishCoordinatorOrAdmin]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EnglishCoordinatorCreateSerializer
        return EnglishCoordinatorSerializer
    
    def get_queryset(self):
        """Filter coordinators based on user role"""
        if self.request.user.role == 'admin':
            return EnglishCoordinator.objects.all()
        elif self.request.user.role == 'english_coordinator':
            return EnglishCoordinator.objects.filter(email=self.request.user.email)
        return EnglishCoordinator.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current coordinator's profile"""
        if request.user.role != 'english_coordinator':
            return Response(
                {'error': 'Only English Coordinators can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            coordinator = EnglishCoordinator.objects.get(email=request.user.email)
            serializer = EnglishCoordinatorSerializer(coordinator)
            return Response(serializer.data)
        except EnglishCoordinator.DoesNotExist:
            return Response(
                {'error': 'English Coordinator profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def my_teachers(self, request):
        """Get all teachers supervised by this coordinator"""
        if request.user.role != 'english_coordinator':
            return Response(
                {'error': 'Only English Coordinators can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            coordinator = EnglishCoordinator.objects.get(email=request.user.email)
            teachers = coordinator.get_supervised_teachers()
            
            teacher_data = []
            for teacher in teachers:
                teacher_data.append({
                    'id': teacher.id,
                    'name': teacher.name,
                    'email': teacher.email,
                    'teacher_id': teacher.teacher_id,
                    'shift': teacher.shift,
                    'is_active': teacher.is_active,
                    'assigned_grades': list(teacher.english_teacher_grades.values_list('name', flat=True)),
                    'total_students': teacher.assigned_students.count(),
                })
            
            return Response({
                'coordinator': coordinator.name,
                'coordinator_id': coordinator.coordinator_id,
                'teachers': teacher_data,
                'total_teachers': len(teacher_data)
            })
            
        except EnglishCoordinator.DoesNotExist:
            return Response(
                {'error': 'English Coordinator profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def assign_teacher(self, request):
        """Assign teacher to specific grade"""
        if not CanManageTeachers().has_permission(request, self):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TeacherAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            teacher_id = serializer.validated_data['teacher_id']
            grade_id = serializer.validated_data['grade_id']
            
            try:
                teacher = Teacher.objects.get(id=teacher_id)
                grade = Grade.objects.get(id=grade_id)
                
                # Check if coordinator can manage this teacher
                if request.user.role == 'english_coordinator':
                    coordinator = EnglishCoordinator.objects.get(email=request.user.email)
                    # Check if teacher is already supervised by this coordinator
                    if teacher.english_coordinator != coordinator:
                        return Response(
                            {'error': 'Cannot assign teacher not supervised by this coordinator'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                
                # Check if teacher is already assigned to another grade
                existing_grade = Grade.objects.filter(
                    english_teacher=teacher
                ).exclude(id=grade_id).first()
                
                if existing_grade:
                    return Response(
                        {'error': f'Teacher is already assigned to {existing_grade.name}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Assign teacher to grade
                grade.english_teacher = teacher
                grade.save()
                
                # Assign coordinator to teacher if not already assigned
                if request.user.role == 'english_coordinator':
                    coordinator = EnglishCoordinator.objects.get(email=request.user.email)
                    teacher.english_coordinator = coordinator
                    teacher.save()
                
                return Response({
                    'message': f'Teacher {teacher.name} assigned to {grade.name}',
                    'teacher': {
                        'id': teacher.id,
                        'name': teacher.name,
                        'teacher_id': teacher.teacher_id
                    },
                    'grade': {
                        'id': grade.id,
                        'name': grade.name,
                        'code': grade.code
                    }
                })
                
            except Teacher.DoesNotExist:
                return Response(
                    {'error': 'Teacher not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Grade.DoesNotExist:
                return Response(
                    {'error': 'Grade not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def student_progress(self, request):
        """Get student progress summary"""
        if not CanViewAllProgress().has_permission(request, self):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            if request.user.role == 'english_coordinator':
                coordinator = EnglishCoordinator.objects.get(email=request.user.email)
                students = coordinator.get_supervised_students()
            else:
                # Admin can see all students
                students = Student.objects.all()
            
            progress_data = []
            for student in students:
                # Get completion data
                from progress.models import LevelCompletion
                completions = LevelCompletion.objects.filter(student_id=student.student_id)
                
                progress_data.append({
                    'student_id': student.student_id,
                    'student_name': student.name,
                    'grade': student.grade,
                    'shift': student.shift,
                    'teacher_name': student.class_teacher.name if student.class_teacher else 'Not Assigned',
                    'total_completions': completions.count(),
                    'last_activity': completions.order_by('-completed_at').first().completed_at if completions.exists() else None,
                    'is_active': student.is_active
                })
            
            return Response({
                'total_students': len(progress_data),
                'active_students': len([s for s in progress_data if s['is_active']]),
                'students': progress_data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def grade_performance(self, request):
        """Get grade-wise performance data"""
        if not CanViewAllProgress().has_permission(request, self):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            if request.user.role == 'english_coordinator':
                coordinator = EnglishCoordinator.objects.get(email=request.user.email)
                performance_data = coordinator.get_grade_performance()
            else:
                # Admin can see all grades
                grades = Grade.objects.all()
                performance_data = []
                for grade in grades:
                    students = Student.objects.filter(
                        campus=grade.campus,
                        grade=grade.name,
                        shift=grade.shift
                    )
                    
                    student_ids = students.values_list('student_id', flat=True)
                    from progress.models import LevelCompletion
                    completions = LevelCompletion.objects.filter(student_id__in=student_ids)
                    
                    performance_data.append({
                        'grade': grade,
                        'total_students': students.count(),
                        'active_students': students.filter(is_active=True).count(),
                        'total_completions': completions.count(),
                        'english_teacher': grade.english_teacher,
                    })
            
            # Format response
            formatted_data = []
            for data in performance_data:
                grade = data['grade']
                completion_rate = 0
                if data['total_students'] > 0:
                    completion_rate = (data['total_completions'] / data['total_students']) * 100
                
                formatted_data.append({
                    'grade_name': grade.name,
                    'grade_code': grade.code,
                    'shift': grade.shift,
                    'english_teacher': grade.english_teacher.name if grade.english_teacher else 'Not Assigned',
                    'total_students': data['total_students'],
                    'active_students': data['active_students'],
                    'total_completions': data['total_completions'],
                    'completion_rate': round(completion_rate, 2)
                })
            
            return Response({
                'total_grades': len(formatted_data),
                'grades': formatted_data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get coordinator dashboard data"""
        if request.user.role != 'english_coordinator':
            return Response(
                {'error': 'Only English Coordinators can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            coordinator = EnglishCoordinator.objects.get(email=request.user.email)
            
            # Get basic counts
            teachers = coordinator.get_supervised_teachers()
            students = coordinator.get_supervised_students()
            grades = Grade.objects.filter(campus=coordinator.campus)
            
            # Get completion data
            student_ids = students.values_list('student_id', flat=True)
            from progress.models import LevelCompletion
            completions = LevelCompletion.objects.filter(student_id__in=student_ids)
            
            # Get grade performance
            grade_performance = coordinator.get_grade_performance()
            formatted_grades = []
            for data in grade_performance:
                grade = data['grade']
                completion_rate = 0
                if data['total_students'] > 0:
                    completion_rate = (data['total_completions'] / data['total_students']) * 100
                
                formatted_grades.append({
                    'grade_name': grade.name,
                    'grade_code': grade.code,
                    'shift': grade.shift,
                    'english_teacher': grade.english_teacher.name if grade.english_teacher else 'Not Assigned',
                    'total_students': data['total_students'],
                    'active_students': data['active_students'],
                    'total_completions': data['total_completions'],
                    'completion_rate': round(completion_rate, 2)
                })
            
            # Get recent activity (last 7 days)
            week_ago = timezone.now() - timedelta(days=7)
            recent_completions = completions.filter(completed_at__gte=week_ago)
            
            recent_activity = []
            for completion in recent_completions.order_by('-completed_at')[:10]:
                recent_activity.append({
                    'student_id': completion.student_id,
                    'level_name': completion.level.name if completion.level else 'Unknown',
                    'completed_at': completion.completed_at,
                    'xp_earned': completion.xp_earned
                })
            
            dashboard_data = {
                'total_teachers': teachers.count(),
                'total_students': students.count(),
                'total_grades': grades.count(),
                'total_completions': completions.count(),
                'grade_performance': formatted_grades,
                'recent_activity': recent_activity
            }
            
            serializer = CoordinatorDashboardSerializer(dashboard_data)
            return Response(serializer.data)
            
        except EnglishCoordinator.DoesNotExist:
            return Response(
                {'error': 'English Coordinator profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )