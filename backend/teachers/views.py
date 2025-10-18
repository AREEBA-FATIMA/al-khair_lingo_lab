from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Teacher
from .serializers import (
    TeacherSerializer, TeacherListSerializer,
    TeacherCreateSerializer, TeacherUpdateSerializer
)

# TeacherRoleViewSet removed - using current_role_title field instead
class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return TeacherListSerializer
        elif self.action == 'create':
            return TeacherCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TeacherUpdateSerializer
        return TeacherSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Teacher.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by campus
        campus = self.request.query_params.get('campus', None)
        if campus:
            queryset = queryset.filter(campus_id=campus)
        
        # Filter by assigned class
        assigned_class = self.request.query_params.get('assigned_class', None)
        if assigned_class:
            queryset = queryset.filter(assigned_class_id=assigned_class)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a teacher"""
        teacher = self.get_object()
        teacher.is_active = True
        teacher.save()
        return Response({'message': 'Teacher activated successfully'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a teacher"""
        teacher = self.get_object()
        teacher.is_active = False
        teacher.save()
        return Response({'message': 'Teacher deactivated successfully'})
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active teachers"""
        active_teachers = Teacher.objects.filter(is_active=True)
        serializer = self.get_serializer(active_teachers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def inactive(self, request):
        """Get all inactive teachers"""
        inactive_teachers = Teacher.objects.filter(is_active=False)
        serializer = self.get_serializer(inactive_teachers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def class_teachers(self, request):
        """Get all class teachers (teachers with assigned classes)"""
        class_teachers = Teacher.objects.filter(assigned_class__isnull=False)
        serializer = self.get_serializer(class_teachers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_activate(self, request):
        """Bulk activate teachers"""
        teacher_ids = request.data.get('teacher_ids', [])
        if not teacher_ids:
            return Response(
                {'error': 'No teacher IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = Teacher.objects.filter(
            id__in=teacher_ids, 
            is_active=False
        ).update(is_active=True)
        
        return Response({
            'message': f'{count} teachers activated successfully'
        })
    
    @action(detail=False, methods=['post'])
    def bulk_deactivate(self, request):
        """Bulk deactivate teachers"""
        teacher_ids = request.data.get('teacher_ids', [])
        if not teacher_ids:
            return Response(
                {'error': 'No teacher IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = Teacher.objects.filter(
            id__in=teacher_ids, 
            is_active=True
        ).update(is_active=False)
        
        return Response({
            'message': f'{count} teachers deactivated successfully'
        })