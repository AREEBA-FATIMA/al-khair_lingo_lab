from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Level, Grade, ClassRoom
from .serializers import (
    LevelSerializer, GradeSerializer, ClassRoomSerializer,
    ClassRoomListSerializer, ClassRoomDetailSerializer,
    ClassRoomCreateSerializer, ClassRoomUpdateSerializer
)


class LevelViewSet(viewsets.ModelViewSet):
    """ViewSet for managing levels"""
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter levels based on query parameters"""
        queryset = Level.objects.all()
        
        # Filter by campus
        campus = self.request.query_params.get('campus', None)
        if campus:
            queryset = queryset.filter(campus__id=campus)
        
        return queryset.order_by('name')
    
    @action(detail=False, methods=['get'])
    def by_campus(self, request):
        """Get levels by campus"""
        campus_id = request.query_params.get('campus_id', None)
        if not campus_id:
            return Response(
                {'error': 'campus_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        levels = Level.objects.filter(campus__id=campus_id)
        serializer = self.get_serializer(levels, many=True)
        return Response(serializer.data)


class GradeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing grades"""
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter grades based on query parameters"""
        queryset = Grade.objects.all()
        
        # Filter by level
        level = self.request.query_params.get('level', None)
        if level:
            queryset = queryset.filter(level__id=level)
        
        # Filter by campus
        campus = self.request.query_params.get('campus', None)
        if campus:
            queryset = queryset.filter(level__campus__id=campus)
        
        return queryset.order_by('name')
    
    @action(detail=False, methods=['get'])
    def by_level(self, request):
        """Get grades by level"""
        level_id = request.query_params.get('level_id', None)
        if not level_id:
            return Response(
                {'error': 'level_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        grades = Grade.objects.filter(level__id=level_id)
        serializer = self.get_serializer(grades, many=True)
        return Response(serializer.data)


class ClassRoomViewSet(viewsets.ModelViewSet):
    """ViewSet for managing classrooms"""
    queryset = ClassRoom.objects.all()
    serializer_class = ClassRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ClassRoomListSerializer
        elif self.action == 'retrieve':
            return ClassRoomDetailSerializer
        elif self.action == 'create':
            return ClassRoomCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ClassRoomUpdateSerializer
        return ClassRoomSerializer
    
    def get_queryset(self):
        """Filter classrooms based on query parameters"""
        queryset = ClassRoom.objects.all()
        
        # Filter by grade
        grade = self.request.query_params.get('grade', None)
        if grade:
            queryset = queryset.filter(grade__id=grade)
        
        # Filter by level
        level = self.request.query_params.get('level', None)
        if level:
            queryset = queryset.filter(grade__level__id=level)
        
        # Filter by campus
        campus = self.request.query_params.get('campus', None)
        if campus:
            queryset = queryset.filter(grade__level__campus__id=campus)
        
        # Filter by shift
        shift = self.request.query_params.get('shift', None)
        if shift:
            queryset = queryset.filter(shift=shift)
        
        # Filter by teacher
        teacher = self.request.query_params.get('teacher', None)
        if teacher:
            queryset = queryset.filter(class_teacher__id=teacher)
        
        return queryset.order_by('grade__name', 'section')
    
    @action(detail=True, methods=['post'])
    def assign_teacher(self, request, pk=None):
        """Assign teacher to classroom"""
        classroom = self.get_object()
        teacher_id = request.data.get('teacher_id')
        
        if not teacher_id:
            return Response(
                {'error': 'teacher_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from teachers.models import Teacher
            teacher = Teacher.objects.get(id=teacher_id)
            classroom.class_teacher = teacher
            classroom.save()
            
            return Response({
                'message': f'Teacher {teacher.full_name} assigned to {classroom}'
            })
        except Teacher.DoesNotExist:
            return Response(
                {'error': 'Teacher not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def unassign_teacher(self, request, pk=None):
        """Unassign teacher from classroom"""
        classroom = self.get_object()
        classroom.class_teacher = None
        classroom.save()
        
        return Response({
            'message': f'Teacher unassigned from {classroom}'
        })
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get students in this classroom"""
        classroom = self.get_object()
        
        try:
            from students.models import Student
            students = Student.objects.filter(classroom=classroom)
            
            from students.serializers import StudentListSerializer
            serializer = StudentListSerializer(students, many=True)
            return Response(serializer.data)
        except ImportError:
            return Response(
                {'error': 'Students app not available'}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
    
    @action(detail=False, methods=['get'])
    def by_teacher(self, request):
        """Get classrooms by teacher"""
        teacher_id = request.query_params.get('teacher_id', None)
        if not teacher_id:
            return Response(
                {'error': 'teacher_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        classrooms = ClassRoom.objects.filter(class_teacher__id=teacher_id)
        serializer = self.get_serializer(classrooms, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_campus(self, request):
        """Get classrooms by campus"""
        campus_id = request.query_params.get('campus_id', None)
        if not campus_id:
            return Response(
                {'error': 'campus_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        classrooms = ClassRoom.objects.filter(grade__level__campus__id=campus_id)
        serializer = self.get_serializer(classrooms, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available_for_teacher(self, request):
        """Get classrooms available for teacher assignment"""
        teacher_id = request.query_params.get('teacher_id', None)
        if not teacher_id:
            return Response(
                {'error': 'teacher_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from teachers.models import Teacher
            teacher = Teacher.objects.get(id=teacher_id)
            
            # Get classrooms in same campus as teacher
            classrooms = ClassRoom.objects.filter(
                grade__level__campus=teacher.current_campus,
                class_teacher__isnull=True
            )
            
            serializer = self.get_serializer(classrooms, many=True)
            return Response(serializer.data)
        except Teacher.DoesNotExist:
            return Response(
                {'error': 'Teacher not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )