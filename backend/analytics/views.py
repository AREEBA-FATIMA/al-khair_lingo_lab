from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    OverallAnalytics, CampusAnalytics, TeacherAnalytics, 
    StudentAnalytics, ClassAnalytics, PerformanceTrend
)
from campus.models import Campus
from teachers.models import Teacher
from students.models import Student
from classes.models import ClassRoom
from progress.models import LevelProgress
from users.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overall_analytics(request):
    """Get overall system analytics"""
    try:
        # Get latest analytics or create new one
        analytics, created = OverallAnalytics.objects.get_or_create(
            date=timezone.now().date(),
            defaults={
                'total_campuses': Campus.objects.count(),
                'total_grades': 10,  # Fixed for our system
                'total_classes': ClassRoom.objects.count(),
                'total_users': User.objects.count(),
                'total_teachers': User.objects.filter(role='teacher').count(),
                'total_students': User.objects.filter(role='student').count(),
                'active_users_today': User.objects.filter(
                    last_login__date=timezone.now().date()
                ).count(),
                'total_levels': 370,  # Fixed for our system
                'total_groups': 8,   # Fixed for our system
                'levels_completed_today': LevelProgress.objects.filter(
                    completed_at__date=timezone.now().date()
                ).count(),
                'total_levels_completed': LevelProgress.objects.filter(
                    is_completed=True
                ).count(),
                'average_completion_rate': LevelProgress.objects.aggregate(
                    avg=Avg('completion_percentage')
                )['avg'] or 0.0,
                'average_xp_per_student': LevelProgress.objects.aggregate(
                    avg=Avg('xp_earned')
                )['avg'] or 0.0,
                'total_xp_earned': LevelProgress.objects.aggregate(
                    total=Sum('xp_earned')
                )['total'] or 0,
            }
        )
        
        return Response({
            'success': True,
            'data': {
                'date': analytics.date,
                'campus_overview': {
                    'total_campuses': analytics.total_campuses,
                    'total_grades': analytics.total_grades,
                    'total_classes': analytics.total_classes,
                },
                'user_statistics': {
                    'total_users': analytics.total_users,
                    'total_teachers': analytics.total_teachers,
                    'total_students': analytics.total_students,
                    'active_users_today': analytics.active_users_today,
                },
                'learning_progress': {
                    'total_levels': analytics.total_levels,
                    'total_groups': analytics.total_groups,
                    'levels_completed_today': analytics.levels_completed_today,
                    'total_levels_completed': analytics.total_levels_completed,
                },
                'performance_metrics': {
                    'average_completion_rate': round(analytics.average_completion_rate, 2),
                    'average_xp_per_student': round(analytics.average_xp_per_student, 2),
                    'total_xp_earned': analytics.total_xp_earned,
                },
                'engagement_metrics': {
                    'students_with_streak': analytics.students_with_streak,
                    'students_active_this_week': analytics.students_active_this_week,
                    'students_active_this_month': analytics.students_active_this_month,
                },
                'top_performers': {
                    'top_student_xp': analytics.top_student_xp,
                    'top_student_streak': analytics.top_student_streak,
                    'top_class_completion': round(analytics.top_class_completion, 2),
                }
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def campus_analytics(request):
    """Get campus-specific analytics"""
    try:
        campuses = Campus.objects.all()
        campus_data = []
        
        for campus in campuses:
            analytics, created = CampusAnalytics.objects.get_or_create(
                campus=campus,
                date=timezone.now().date(),
                defaults={
                    'total_teachers': Teacher.objects.filter(campus=campus).count(),
                    'total_students': Student.objects.filter(campus=campus).count(),
                    'total_classes': ClassRoom.objects.filter(grade__campus=campus).count(),
                    'active_students_today': Student.objects.filter(
                        campus=campus
                    ).count(),  # Simplified - just count all students
                    'total_xp_earned': 0,  # Simplified
                }
            )
            
            campus_data.append({
                'campus_id': campus.id,
                'campus_name': campus.campus_name,
                'total_teachers': analytics.total_teachers,
                'total_students': analytics.total_students,
                'total_classes': analytics.total_classes,
                'active_students_today': analytics.active_students_today,
                'total_xp_earned': analytics.total_xp_earned,
                'average_class_completion': round(analytics.average_class_completion, 2),
            })
        
        return Response({
            'success': True,
            'data': campus_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_analytics(request):
    """Get teacher-specific analytics"""
    try:
        teachers = Teacher.objects.all()
        teacher_data = []
        
        for teacher in teachers:
            analytics, created = TeacherAnalytics.objects.get_or_create(
                teacher=teacher,
                date=timezone.now().date(),
                defaults={
                    'total_students': Student.objects.filter(class_teacher=teacher).count(),
                    'students_completed_levels': 0,  # Simplified
                    'active_students_today': Student.objects.filter(class_teacher=teacher).count(),
                }
            )
            
            teacher_data.append({
                'teacher_id': teacher.id,
                'teacher_name': teacher.name,
                'teacher_code': teacher.teacher_id,
                'assigned_class': str(analytics.assigned_class) if analytics.assigned_class else None,
                'total_students': analytics.total_students,
                'students_completed_levels': analytics.students_completed_levels,
                'active_students_today': analytics.active_students_today,
                'average_completion_rate': round(analytics.average_completion_rate, 2),
                'average_xp_per_student': round(analytics.average_xp_per_student, 2),
                'top_student_name': analytics.top_student_name,
                'top_student_xp': analytics.top_student_xp,
                'struggling_students': analytics.struggling_students,
            })
        
        return Response({
            'success': True,
            'data': teacher_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def class_analytics(request):
    """Get class-specific analytics"""
    try:
        classes = ClassRoom.objects.all()
        class_data = []
        
        for classroom in classes:
            analytics, created = ClassAnalytics.objects.get_or_create(
                classroom=classroom,
                date=timezone.now().date(),
                defaults={
                    'total_students': 0,  # Simplified
                    'active_students_today': 0,  # Simplified
                    'total_levels_completed': 0,  # Simplified
                    'total_xp_earned': 0,  # Simplified
                }
            )
            
            class_data.append({
                'class_id': classroom.id,
                'class_name': str(classroom),
                'class_code': classroom.code,
                'grade': classroom.grade.name,
                'section': classroom.section,
                'class_teacher': classroom.class_teacher.name if classroom.class_teacher else None,
                'total_students': analytics.total_students,
                'active_students_today': analytics.active_students_today,
                'active_students_this_week': analytics.active_students_this_week,
                'total_levels_completed': analytics.total_levels_completed,
                'average_completion_rate': round(analytics.average_completion_rate, 2),
                'total_xp_earned': analytics.total_xp_earned,
                'average_xp_per_student': round(analytics.average_xp_per_student, 2),
                'students_with_streak': analytics.students_with_streak,
                'average_streak': round(analytics.average_streak, 2),
                'top_student_name': analytics.top_student_name,
                'top_student_xp': analytics.top_student_xp,
                'struggling_students': analytics.struggling_students,
            })
        
        return Response({
            'success': True,
            'data': class_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_analytics(request):
    """Get student-specific analytics"""
    try:
        students = Student.objects.all()[:50]  # Limit to first 50 for performance
        student_data = []
        
        for student in students:
            analytics, created = StudentAnalytics.objects.get_or_create(
                student=student,
                date=timezone.now().date(),
                defaults={
                    'levels_completed': LevelProgress.objects.filter(
                        user__student=student,
                        is_completed=True
                    ).count(),
                    'total_xp_earned': LevelProgress.objects.filter(
                        user__student=student
                    ).aggregate(total=Sum('xp_earned'))['total'] or 0,
                    'questions_answered': LevelProgress.objects.filter(
                        user__student=student
                    ).aggregate(total=Sum('questions_answered'))['total'] or 0,
                    'correct_answers': LevelProgress.objects.filter(
                        user__student=student
                    ).aggregate(total=Sum('correct_answers'))['total'] or 0,
                }
            )
            
            student_data.append({
                'student_id': student.id,
                'student_name': student.name,
                'student_code': student.student_id,
                'grade': student.grade,
                'section': student.section,
                'class_teacher': student.class_teacher.name if student.class_teacher else None,
                'levels_completed': analytics.levels_completed,
                'total_xp_earned': analytics.total_xp_earned,
                'current_streak': analytics.current_streak,
                'longest_streak': analytics.longest_streak,
                'average_score': round(analytics.average_score, 2),
                'total_time_spent': analytics.total_time_spent,
                'questions_answered': analytics.questions_answered,
                'correct_answers': analytics.correct_answers,
                'days_active_this_week': analytics.days_active_this_week,
                'days_active_this_month': analytics.days_active_this_month,
                'class_rank': analytics.class_rank,
                'campus_rank': analytics.campus_rank,
            })
        
        return Response({
            'success': True,
            'data': student_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def performance_trends(request):
    """Get performance trends over time"""
    try:
        trend_type = request.GET.get('type', 'daily')
        days = int(request.GET.get('days', 30))
        
        start_date = timezone.now().date() - timedelta(days=days)
        
        trends = PerformanceTrend.objects.filter(
            trend_type=trend_type,
            date__gte=start_date
        ).order_by('date')
        
        trend_data = []
        for trend in trends:
            trend_data.append({
                'date': trend.date,
                'total_users': trend.total_users,
                'active_users': trend.active_users,
                'levels_completed': trend.levels_completed,
                'total_xp_earned': trend.total_xp_earned,
                'average_completion_rate': round(trend.average_completion_rate, 2),
                'average_xp_per_user': round(trend.average_xp_per_user, 2),
                'average_streak': round(trend.average_streak, 2),
                'new_users': trend.new_users,
                'returning_users': trend.returning_users,
                'churn_rate': round(trend.churn_rate, 2),
            })
        
        return Response({
            'success': True,
            'data': {
                'trend_type': trend_type,
                'period_days': days,
                'trends': trend_data
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """Get comprehensive dashboard summary"""
    try:
        # Overall stats
        total_users = User.objects.count()
        total_teachers = User.objects.filter(role='teacher').count()
        total_students = User.objects.filter(role='student').count()
        
        # Today's activity
        today = timezone.now().date()
        active_today = User.objects.filter(last_login__date=today).count()
        levels_completed_today = LevelProgress.objects.filter(completed_at__date=today).count()
        
        # Performance metrics
        total_xp = LevelProgress.objects.aggregate(total=Sum('xp_earned'))['total'] or 0
        avg_completion = LevelProgress.objects.aggregate(avg=Avg('completion_percentage'))['avg'] or 0
        
        # Top performers (simplified)
        top_student = Student.objects.first()  # Simple approach
        top_class = ClassRoom.objects.first()   # Simple approach
        
        return Response({
            'success': True,
            'data': {
                'overview': {
                    'total_users': total_users,
                    'total_teachers': total_teachers,
                    'total_students': total_students,
                    'active_today': active_today,
                },
                'today_activity': {
                    'levels_completed_today': levels_completed_today,
                    'active_users_today': active_today,
                },
                'performance': {
                    'total_xp_earned': total_xp,
                    'average_completion_rate': round(avg_completion, 2),
                },
                'top_performers': {
                    'top_student': {
                        'name': top_student.name if top_student else 'N/A',
                        'xp': 0,  # Simplified
                    },
                    'top_class': {
                        'name': str(top_class) if top_class else 'N/A',
                        'completion_rate': 0,  # Simplified
                    }
                }
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
