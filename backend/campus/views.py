from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Campus
from .serializers import (
    CampusSerializer, CampusListSerializer, CampusDetailSerializer,
    CampusCreateSerializer, CampusUpdateSerializer
)


class CampusViewSet(viewsets.ModelViewSet):
    """ViewSet for managing campuses"""
    queryset = Campus.objects.all()
    serializer_class = CampusSerializer
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return CampusListSerializer
        elif self.action == 'retrieve':
            return CampusDetailSerializer
        elif self.action == 'create':
            return CampusCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CampusUpdateSerializer
        return CampusSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Campus.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by campus type
        campus_type = self.request.query_params.get('campus_type', None)
        if campus_type:
            queryset = queryset.filter(campus_type=campus_type)
        
        # Filter by city
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filter by shift
        shift = self.request.query_params.get('shift', None)
        if shift:
            queryset = queryset.filter(shift_available=shift)
        
        # Filter by draft status
        show_draft = self.request.query_params.get('show_draft', 'false').lower() == 'true'
        if not show_draft:
            queryset = queryset.filter(is_draft=False)
        
        return queryset.order_by('campus_name')
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a campus"""
        campus = self.get_object()
        campus.status = 'active'
        campus.save()
        return Response({'message': 'Campus activated successfully'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a campus"""
        campus = self.get_object()
        campus.status = 'inactive'
        campus.save()
        return Response({'message': 'Campus deactivated successfully'})
    
    @action(detail=True, methods=['post'])
    def mark_as_final(self, request, pk=None):
        """Mark campus as final (not draft)"""
        campus = self.get_object()
        campus.is_draft = False
        campus.save()
        return Response({'message': 'Campus marked as final successfully'})
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active campuses"""
        active_campuses = Campus.objects.filter(status='active', is_draft=False)
        serializer = self.get_serializer(active_campuses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def inactive(self, request):
        """Get all inactive campuses"""
        inactive_campuses = Campus.objects.filter(status='inactive')
        serializer = self.get_serializer(inactive_campuses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def draft(self, request):
        """Get all draft campuses"""
        draft_campuses = Campus.objects.filter(is_draft=True)
        serializer = self.get_serializer(draft_campuses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def final(self, request):
        """Get all final campuses"""
        final_campuses = Campus.objects.filter(is_draft=False)
        serializer = self.get_serializer(final_campuses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_city(self, request):
        """Get campuses grouped by city"""
        city = request.query_params.get('city', None)
        if not city:
            return Response({'error': 'City parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        campuses = Campus.objects.filter(city__icontains=city)
        serializer = self.get_serializer(campuses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_activate(self, request):
        """Bulk activate campuses"""
        campus_ids = request.data.get('campus_ids', [])
        if not campus_ids:
            return Response(
                {'error': 'No campus IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = Campus.objects.filter(
            id__in=campus_ids, 
            status='inactive'
        ).update(status='active')
        
        return Response({
            'message': f'{count} campuses activated successfully'
        })
    
    @action(detail=False, methods=['post'])
    def bulk_deactivate(self, request):
        """Bulk deactivate campuses"""
        campus_ids = request.data.get('campus_ids', [])
        if not campus_ids:
            return Response(
                {'error': 'No campus IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = Campus.objects.filter(
            id__in=campus_ids, 
            status='active'
        ).update(status='inactive')
        
        return Response({
            'message': f'{count} campuses deactivated successfully'
        })
    
    @action(detail=False, methods=['post'])
    def bulk_mark_final(self, request):
        """Bulk mark campuses as final"""
        campus_ids = request.data.get('campus_ids', [])
        if not campus_ids:
            return Response(
                {'error': 'No campus IDs provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = Campus.objects.filter(
            id__in=campus_ids, 
            is_draft=True
        ).update(is_draft=False)
        
        return Response({
            'message': f'{count} campuses marked as final successfully'
        })