from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Student
from .serializers import (
    StudentSerializer, StudentListSerializer, StudentDetailSerializer,
    StudentCreateSerializer, StudentUpdateSerializer
)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return StudentListSerializer
        elif self.action == 'retrieve':
            return StudentDetailSerializer
        elif self.action == 'create':
            return StudentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StudentUpdateSerializer
        return StudentSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Student.objects.all()
        
        # Filter by current state
        current_state = self.request.query_params.get('current_state', None)
        if current_state:
            queryset = queryset.filter(current_state=current_state)
        
        # Filter by grade
        grade = self.request.query_params.get('grade', None)
        if grade:
            queryset = queryset.filter(current_grade=grade)
        
        # Filter by campus
        campus = self.request.query_params.get('campus', None)
        if campus:
            queryset = queryset.filter(campus__icontains=campus)
        
        # Filter by deleted status
        show_deleted = self.request.query_params.get('show_deleted', 'false').lower() == 'true'
        if not show_deleted:
            queryset = queryset.filter(is_deleted=False)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        """Soft delete a student"""
        student = self.get_object()
        student.soft_delete()
        return Response({'message': 'Student soft deleted successfully'})
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft deleted student"""
        student = self.get_object()
        if not student.is_deleted:
            return Response(
                {'error': 'Student is not deleted'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        student.restore()
        return Response({'message': 'Student restored successfully'})
    
    @action(detail=False, methods=['get'])
    def deleted(self, request):
        """Get all soft deleted students"""
        deleted_students = Student.objects.filter(is_deleted=True)
        serializer = self.get_serializer(deleted_students, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active students"""
        active_students = Student.objects.filter(
            current_state='active', 
            is_deleted=False
        )
        serializer = self.get_serializer(active_students, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def inactive(self, request):
        """Get all inactive students"""
        inactive_students = Student.objects.filter(
            current_state='inactive', 
            is_deleted=False
        )
        serializer = self.get_serializer(inactive_students, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_soft_delete(self, request):
        """Bulk soft delete students"""
        student_ids = request.data.get('student_ids', [])
        if not student_ids:
            return Response(
                {'error': 'No student IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        students = Student.objects.filter(id__in=student_ids, is_deleted=False)
        count = 0
        for student in students:
            student.soft_delete()
            count += 1
        
        return Response({
            'message': f'{count} students soft deleted successfully'
        })
    
    @action(detail=False, methods=['post'])
    def bulk_restore(self, request):
        """Bulk restore students"""
        student_ids = request.data.get('student_ids', [])
        if not student_ids:
            return Response(
                {'error': 'No student IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        students = Student.objects.filter(id__in=student_ids, is_deleted=True)
        count = 0
        for student in students:
            student.restore()
            count += 1
        
        return Response({
            'message': f'{count} students restored successfully'
        })