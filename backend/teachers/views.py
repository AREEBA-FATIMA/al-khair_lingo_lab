from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta
from .models import Teacher
from students.models import Student
from progress.models import LevelProgress
from levels.models import Level
from classes.models import Grade
from campus.models import Campus


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def teacher_dashboard(request):
    """Get teacher dashboard overview with class analytics"""
    user = request.user
    
    # Check if user is a teacher
    if user.role != 'teacher':
        return Response({'error': 'Access denied. Teacher role required.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get teacher profile
        teacher = Teacher.objects.get(email=user.email)
    except Teacher.DoesNotExist:
        return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get assigned classroom
    try:
        assigned_classroom = teacher.assigned_classroom_teacher
    except Teacher.assigned_classroom_teacher.RelatedObjectDoesNotExist:
        return Response({'error': 'No classroom assigned to this teacher'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get students in assigned class
    students = Student.objects.filter(
        campus=teacher.campus,
        grade=assigned_classroom.grade.name,
        section=assigned_classroom.section,
        class_teacher=teacher
    )
    
    # Calculate class statistics
    total_students = students.count()
    active_students = students.filter(is_active=True).count()
    
    # Get student progress data
    student_progress = []
    for student in students:
        # Get user account for student
        try:
            student_user = user.__class__.objects.get(student_id=student.student_id)
            
            # Get progress data
            progress_data = LevelProgress.objects.filter(user=student_user)
            completed_levels = progress_data.filter(is_completed=True).count()
            total_xp = progress_data.aggregate(total=Sum('xp_earned'))['total'] or 0
            average_score = progress_data.aggregate(avg=Avg('completion_percentage'))['avg'] or 0
            
            # Calculate streak
            completed_dates = progress_data.filter(
                is_completed=True, 
                completed_at__isnull=False
            ).values_list('completed_at', flat=True)
            
            unique_days = set()
            for dt in completed_dates:
                local_dt = timezone.localtime(dt)
                unique_days.add(local_dt.date())
            
            # Calculate current streak
            today = timezone.localdate()
            current_streak = 0
            start_day = today if today in unique_days else (today - timedelta(days=1) if (today - timedelta(days=1)) in unique_days else None)
            if start_day:
                d = start_day
                while d in unique_days:
                    current_streak += 1
                    d = d - timedelta(days=1)
            
            student_progress.append({
                'student_id': student.student_id,
                'name': student.name,
                'father_name': student.father_name,
                'grade': student.grade,
                'section': student.section,
                'completed_levels': completed_levels,
                'total_xp': total_xp,
                'average_score': round(average_score, 2),
                'current_streak': current_streak,
                'is_active': student.is_active,
                'last_activity': progress_data.order_by('-completed_at').first().completed_at if progress_data.exists() else None
            })
            
        except Exception as e:
            print(f"Error processing student {student.student_id}: {str(e)}")
            continue
    
    # Calculate class averages
    if student_progress:
        class_avg_score = sum(s['average_score'] for s in student_progress) / len(student_progress)
        class_avg_xp = sum(s['total_xp'] for s in student_progress) / len(student_progress)
        class_avg_levels = sum(s['completed_levels'] for s in student_progress) / len(student_progress)
        class_avg_streak = sum(s['current_streak'] for s in student_progress) / len(student_progress)
    else:
        class_avg_score = 0
        class_avg_xp = 0
        class_avg_levels = 0
        class_avg_streak = 0
    
    # Get recent activity (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    recent_activity = LevelProgress.objects.filter(
        user__student_id__in=[s['student_id'] for s in student_progress],
        completed_at__gte=week_ago,
        is_completed=True
    ).order_by('-completed_at')[:20]
    
    recent_activities = []
    for activity in recent_activity:
        recent_activities.append({
            'student_name': activity.user.get_full_name() or activity.user.username,
            'level_name': activity.level.name,
            'level_number': activity.level.level_number,
            'xp_earned': activity.xp_earned,
            'score': activity.completion_percentage,
            'completed_at': activity.completed_at
        })
    
    # Prepare dashboard data
    dashboard_data = {
        'teacher_info': {
            'name': teacher.name,
            'teacher_id': teacher.teacher_id,
            'campus': teacher.campus.campus_name,
            'assigned_class': f"{assigned_classroom.grade.name} - {assigned_classroom.section}",
            'shift': assigned_classroom.shift
        },
        'class_overview': {
            'total_students': total_students,
            'active_students': active_students,
            'class_average_score': round(class_avg_score, 2),
            'class_average_xp': round(class_avg_xp, 2),
            'class_average_levels': round(class_avg_levels, 2),
            'class_average_streak': round(class_avg_streak, 2)
        },
        'student_progress': student_progress,
        'recent_activity': recent_activities
    }
    
    return Response(dashboard_data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_detail(request, student_id):
    """Get detailed progress for a specific student"""
    user = request.user
    
    if user.role != 'teacher':
        return Response({'error': 'Access denied. Teacher role required.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get teacher profile
        teacher = Teacher.objects.get(email=user.email)
        
        # Get student
        student = Student.objects.get(student_id=student_id, class_teacher=teacher)
        
        # Get student user account
        student_user = user.__class__.objects.get(student_id=student_id)
        
        # Get detailed progress
        progress_data = LevelProgress.objects.filter(user=student_user).order_by('-completed_at')
        
        # Calculate detailed statistics
        completed_levels = progress_data.filter(is_completed=True)
        total_levels = Level.objects.filter(is_active=True).count()
        
        # Group progress by groups
        group_progress = {}
        for progress in completed_levels:
            group_number = progress.level.group.group_number
            if group_number not in group_progress:
                group_progress[group_number] = {
                    'group_number': group_number,
                    'group_name': progress.level.group.name,
                    'levels_completed': 0,
                    'total_xp': 0,
                    'average_score': 0
                }
            group_progress[group_number]['levels_completed'] += 1
            group_progress[group_number]['total_xp'] += progress.xp_earned
        
        # Calculate average scores per group
        for group_num in group_progress:
            group_levels = completed_levels.filter(level__group__group_number=group_num)
            if group_levels.exists():
                avg_score = group_levels.aggregate(avg=Avg('completion_percentage'))['avg'] or 0
                group_progress[group_num]['average_score'] = round(avg_score, 2)
        
        # Get recent activity
        recent_activities = []
        for progress in progress_data[:10]:
            recent_activities.append({
                'level_name': progress.level.name,
                'level_number': progress.level.level_number,
                'group_name': progress.level.group.name,
                'score': progress.completion_percentage,
                'xp_earned': progress.xp_earned,
                'completed_at': progress.completed_at,
                'time_spent': progress.time_spent
            })
        
        # Calculate overall stats
        total_xp = progress_data.aggregate(total=Sum('xp_earned'))['total'] or 0
        overall_avg_score = progress_data.aggregate(avg=Avg('completion_percentage'))['avg'] or 0
        
        # Calculate streak
        completed_dates = progress_data.filter(
            is_completed=True, 
            completed_at__isnull=False
        ).values_list('completed_at', flat=True)
        
        unique_days = set()
        for dt in completed_dates:
            local_dt = timezone.localtime(dt)
            unique_days.add(local_dt.date())
        
        today = timezone.localdate()
        current_streak = 0
        start_day = today if today in unique_days else (today - timedelta(days=1) if (today - timedelta(days=1)) in unique_days else None)
        if start_day:
            d = start_day
            while d in unique_days:
                current_streak += 1
                d = d - timedelta(days=1)
        
        student_detail_data = {
            'student_info': {
                'student_id': student.student_id,
                'name': student.name,
                'father_name': student.father_name,
                'grade': student.grade,
                'section': student.section,
                'campus': student.campus.campus_name
            },
            'overall_stats': {
                'total_levels_completed': completed_levels.count(),
                'total_levels_available': total_levels,
                'completion_percentage': round((completed_levels.count() / total_levels * 100) if total_levels > 0 else 0, 2),
                'total_xp': total_xp,
                'average_score': round(overall_avg_score, 2),
                'current_streak': current_streak
            },
            'group_progress': list(group_progress.values()),
            'recent_activity': recent_activities
        }
        
        return Response(student_detail_data)
        
    except Student.DoesNotExist:
        return Response({'error': 'Student not found or not assigned to this teacher'}, status=status.HTTP_404_NOT_FOUND)
    except Teacher.DoesNotExist:
        return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error retrieving student data: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def class_analytics(request):
    """Get detailed analytics for teacher's class"""
    user = request.user
    
    if user.role != 'teacher':
        return Response({'error': 'Access denied. Teacher role required.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get teacher profile
        teacher = Teacher.objects.get(email=user.email)
        assigned_classroom = teacher.assigned_classroom_teacher
        
        if not assigned_classroom:
            return Response({'error': 'No classroom assigned to this teacher'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get students in assigned class
        students = Student.objects.filter(
            campus=teacher.campus,
            grade=assigned_classroom.grade.name,
            section=assigned_classroom.section,
            class_teacher=teacher
        )
        
        # Get all student user accounts
        student_users = user.__class__.objects.filter(
            student_id__in=[s.student_id for s in students]
        )
        
        # Calculate analytics by time periods
        now = timezone.now()
        today = now.date()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # Today's activity
        today_activity = LevelProgress.objects.filter(
            user__in=student_users,
            completed_at__date=today,
            is_completed=True
        )
        
        # This week's activity
        week_activity = LevelProgress.objects.filter(
            user__in=student_users,
            completed_at__gte=week_ago,
            is_completed=True
        )
        
        # This month's activity
        month_activity = LevelProgress.objects.filter(
            user__in=student_users,
            completed_at__gte=month_ago,
            is_completed=True
        )
        
        # Calculate analytics
        analytics_data = {
            'time_periods': {
                'today': {
                    'levels_completed': today_activity.count(),
                    'total_xp': today_activity.aggregate(total=Sum('xp_earned'))['total'] or 0,
                    'average_score': round(today_activity.aggregate(avg=Avg('completion_percentage'))['avg'] or 0, 2),
                    'active_students': today_activity.values('user').distinct().count()
                },
                'this_week': {
                    'levels_completed': week_activity.count(),
                    'total_xp': week_activity.aggregate(total=Sum('xp_earned'))['total'] or 0,
                    'average_score': round(week_activity.aggregate(avg=Avg('completion_percentage'))['avg'] or 0, 2),
                    'active_students': week_activity.values('user').distinct().count()
                },
                'this_month': {
                    'levels_completed': month_activity.count(),
                    'total_xp': month_activity.aggregate(total=Sum('xp_earned'))['total'] or 0,
                    'average_score': round(month_activity.aggregate(avg=Avg('completion_percentage'))['avg'] or 0, 2),
                    'active_students': month_activity.values('user').distinct().count()
                }
            },
            'top_performers': [],
            'needs_attention': []
        }
        
        # Get top performers (students with highest XP)
        top_students = []
        for student_user in student_users:
            student_progress = LevelProgress.objects.filter(user=student_user)
            total_xp = student_progress.aggregate(total=Sum('xp_earned'))['total'] or 0
            completed_levels = student_progress.filter(is_completed=True).count()
            
            if total_xp > 0:
                top_students.append({
                    'student_id': student_user.student_id,
                    'name': student_user.get_full_name() or student_user.username,
                    'total_xp': total_xp,
                    'completed_levels': completed_levels
                })
        
        # Sort by XP and get top 5
        top_students.sort(key=lambda x: x['total_xp'], reverse=True)
        analytics_data['top_performers'] = top_students[:5]
        
        # Get students who need attention (low activity)
        low_activity_students = []
        for student_user in student_users:
            recent_activity = LevelProgress.objects.filter(
                user=student_user,
                completed_at__gte=week_ago,
                is_completed=True
            ).count()
            
            if recent_activity < 2:  # Less than 2 levels completed this week
                student_progress = LevelProgress.objects.filter(user=student_user)
                total_xp = student_progress.aggregate(total=Sum('xp_earned'))['total'] or 0
                
                low_activity_students.append({
                    'student_id': student_user.student_id,
                    'name': student_user.get_full_name() or student_user.username,
                    'recent_activity': recent_activity,
                    'total_xp': total_xp
                })
        
        analytics_data['needs_attention'] = low_activity_students[:5]
        
        return Response(analytics_data)
        
    except Teacher.DoesNotExist:
        return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error retrieving analytics: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)