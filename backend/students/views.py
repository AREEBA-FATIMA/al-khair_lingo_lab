from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Student
from .serializers import (
    StudentSerializer, StudentListSerializer,
    StudentCreateSerializer, StudentUpdateSerializer
)


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