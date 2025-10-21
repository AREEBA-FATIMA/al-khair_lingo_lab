from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Grade
from .serializers import GradeSerializer


class GradeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing grades"""
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter grades based on query parameters"""
        queryset = Grade.objects.all()
        
        # Filter by campus
        campus = self.request.query_params.get('campus', None)
        if campus:
            queryset = queryset.filter(campus__id=campus)
        
        # Filter by shift
        shift = self.request.query_params.get('shift', None)
        if shift:
            queryset = queryset.filter(shift=shift)
        
        return queryset.order_by('name')
    
    @action(detail=True, methods=['post'])
    def assign_teacher(self, request, pk=None):
        """Assign English teacher to grade"""
        grade = self.get_object()
        teacher_id = request.data.get('teacher_id')
        
        if not teacher_id:
            return Response(
                {'error': 'teacher_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from teachers.models import Teacher
            teacher = Teacher.objects.get(id=teacher_id)
            
            # Check if teacher is already assigned to another grade
            existing_grade = Grade.objects.filter(
                english_teacher=teacher
            ).exclude(pk=grade.pk).first()
            
            if existing_grade:
                return Response(
                    {'error': f'Teacher is already assigned to {existing_grade}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            grade.english_teacher = teacher
            grade.save()
            
            return Response({
                'message': f'Teacher {teacher.name} assigned to {grade}',
                'grade': GradeSerializer(grade).data
            })
            
        except Teacher.DoesNotExist:
            return Response(
                {'error': 'Teacher not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def unassign_teacher(self, request, pk=None):
        """Unassign teacher from grade"""
        grade = self.get_object()
        
        if not grade.english_teacher:
            return Response(
                {'error': 'No teacher assigned to this grade'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        teacher_name = grade.english_teacher.name
        grade.english_teacher = None
        grade.save()
        
        return Response({
            'message': f'Teacher {teacher_name} unassigned from {grade}',
            'grade': GradeSerializer(grade).data
        })
    
    @action(detail=False, methods=['get'])
    def available_teachers(self, request):
        """Get teachers available for assignment"""
        from teachers.models import Teacher
        
        # Get teachers not assigned to any grade
        assigned_teacher_ids = Grade.objects.filter(
            english_teacher__isnull=False
        ).values_list('english_teacher_id', flat=True)
        
        available_teachers = Teacher.objects.exclude(
            id__in=assigned_teacher_ids
        ).filter(is_active=True)
        
        from teachers.serializers import TeacherListSerializer
        return Response(TeacherListSerializer(available_teachers, many=True).data)