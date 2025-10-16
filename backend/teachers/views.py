from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Teacher
from .serializers import (
    TeacherSerializer, TeacherListSerializer, TeacherDetailSerializer,
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
        elif self.action == 'retrieve':
            return TeacherDetailSerializer
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
            queryset = queryset.filter(is_currently_active=is_active.lower() == 'true')
        
        # Filter by shift
        shift = self.request.query_params.get('shift', None)
        if shift:
            queryset = queryset.filter(shift=shift)
        
        # Filter by campus
        campus = self.request.query_params.get('campus', None)
        if campus:
            queryset = queryset.filter(current_campus__icontains=campus)
        
        # Filter by class teacher status
        is_class_teacher = self.request.query_params.get('is_class_teacher', None)
        if is_class_teacher is not None:
            queryset = queryset.filter(is_class_teacher=is_class_teacher.lower() == 'true')
        
        # Filter by save status
        save_status = self.request.query_params.get('save_status', None)
        if save_status:
            queryset = queryset.filter(save_status=save_status)
        
        return queryset.order_by('-date_created')
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a teacher"""
        teacher = self.get_object()
        teacher.is_currently_active = True
        teacher.save()
        return Response({'message': 'Teacher activated successfully'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a teacher"""
        teacher = self.get_object()
        teacher.is_currently_active = False
        teacher.save()
        return Response({'message': 'Teacher deactivated successfully'})
    
    @action(detail=True, methods=['post'])
    def mark_as_final(self, request, pk=None):
        """Mark teacher as final"""
        teacher = self.get_object()
        teacher.save_status = 'final'
        teacher.save()
        return Response({'message': 'Teacher marked as final successfully'})
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active teachers"""
        active_teachers = Teacher.objects.filter(is_currently_active=True)
        serializer = self.get_serializer(active_teachers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def inactive(self, request):
        """Get all inactive teachers"""
        inactive_teachers = Teacher.objects.filter(is_currently_active=False)
        serializer = self.get_serializer(inactive_teachers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def class_teachers(self, request):
        """Get all class teachers"""
        class_teachers = Teacher.objects.filter(is_class_teacher=True)
        serializer = self.get_serializer(class_teachers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def draft(self, request):
        """Get all draft teachers"""
        draft_teachers = Teacher.objects.filter(save_status='draft')
        serializer = self.get_serializer(draft_teachers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def final(self, request):
        """Get all final teachers"""
        final_teachers = Teacher.objects.filter(save_status='final')
        serializer = self.get_serializer(final_teachers, many=True)
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
            is_currently_active=False
        ).update(is_currently_active=True)
        
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
            is_currently_active=True
        ).update(is_currently_active=False)
        
        return Response({
            'message': f'{count} teachers deactivated successfully'
        })
    
    @action(detail=False, methods=['post'])
    def bulk_mark_final(self, request):
        """Bulk mark teachers as final"""
        teacher_ids = request.data.get('teacher_ids', [])
        if not teacher_ids:
            return Response(
                {'error': 'No teacher IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = Teacher.objects.filter(
            id__in=teacher_ids, 
            save_status='draft'
        ).update(save_status='final')
        
        return Response({
            'message': f'{count} teachers marked as final successfully'
        })