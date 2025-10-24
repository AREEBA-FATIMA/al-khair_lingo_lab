from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import OverallAnalytics, PerformanceTrend, CampusAnalytics, ClassAnalytics, StudentAnalytics, TeacherAnalytics
from campus.models import Campus
from teachers.models import Teacher
from students.models import Student
from classes.models import Grade
from progress.models import LevelProgress
from users.models import User
from levels.models import Level
from groups.models import Group
from cache_utils import cache_analytics, cache_api_response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@cache_analytics(timeout=900)  # 15 minutes cache
def overall_analytics(request):
    """Get overall system analytics"""
    try:
        # Get latest analytics or create new one
        analytics, created = OverallAnalytics.objects.get_or_create(
            date=timezone.now().date(),
            defaults={
                'total_users': User.objects.count(),
                'total_teachers': User.objects.filter(role='teacher').count(),
                'total_students': User.objects.filter(role='student').count(),
                'active_users_today': User.objects.filter(last_login__date=timezone.now().date()).count(),
                'total_levels': Level.objects.count(),  # Real level count
                'total_groups': Group.objects.count(),  # Real group count
                'levels_completed_today': LevelProgress.objects.filter(completed_at__date=timezone.now().date()).count(),
                'total_levels_completed': LevelProgress.objects.filter(is_completed=True).count(),
                'average_completion_rate': LevelProgress.objects.aggregate(avg=Avg('completion_percentage'))['avg'] or 0.0,
                'average_xp_per_student': LevelProgress.objects.values('user').annotate(total_xp=Sum('xp_earned')).aggregate(avg=Avg('total_xp'))['avg'] or 0.0,
                'total_xp_earned': LevelProgress.objects.aggregate(total=Sum('xp_earned'))['total'] or 0,
                'students_with_streak': User.objects.filter(role='student').distinct().count(),
                'students_active_this_week': User.objects.filter(role='student', last_login__gte=timezone.now() - timedelta(days=7)).distinct().count(),
                'students_active_this_month': User.objects.filter(role='student', last_login__gte=timezone.now() - timedelta(days=30)).distinct().count(),
                'top_student_xp': 0,  # Simplified for now
                'top_student_streak': 0,  # Simplified for now
                'top_class_completion': 0.0,  # Simplified for now
            }
        )
        
        return Response({
            'success': True,
            'data': {
                'date': analytics.date,
                'total_users': analytics.total_users,
                'total_teachers': analytics.total_teachers,
                'total_students': analytics.total_students,
                'active_users_today': analytics.active_users_today,
                'total_levels': analytics.total_levels,
                'total_groups': analytics.total_groups,
                'levels_completed_today': analytics.levels_completed_today,
                'total_levels_completed': analytics.total_levels_completed,
                'average_completion_rate': round(analytics.average_completion_rate, 2),
                'average_xp_per_student': round(analytics.average_xp_per_student, 2),
                'total_xp_earned': analytics.total_xp_earned,
                'students_with_streak': analytics.students_with_streak,
                'students_active_this_week': analytics.students_active_this_week,
                'students_active_this_month': analytics.students_active_this_month,
                'top_student_xp': analytics.top_student_xp,
                'top_student_streak': analytics.top_student_streak,
                'top_class_completion': round(analytics.top_class_completion, 2),
                'created_at': analytics.created_at,
                'updated_at': analytics.updated_at,
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@cache_analytics(timeout=600)  # 10 minutes cache
def dashboard_summary(request):
    """Get dashboard summary with key metrics"""
    try:
        # Get overall stats
        total_users = User.objects.count()
        total_teachers = User.objects.filter(role='teacher').count()
        total_students = User.objects.filter(role='student').count()
        total_campuses = Campus.objects.count()
        total_classes = Grade.objects.count()
        
        # Get today's activity
        today = timezone.now().date()
        active_users_today = User.objects.filter(last_login__date=today).count()
        levels_completed_today = LevelProgress.objects.filter(completed_at__date=today).count()
        
        return Response({
            'success': True,
            'data': {
                'overview': {
                    'total_users': total_users,
                    'total_teachers': total_teachers,
                    'total_students': total_students,
                    'total_campuses': total_campuses,
                    'total_classes': total_classes,
                },
                'today_activity': {
                    'active_users': active_users_today,
                    'levels_completed': levels_completed_today,
                },
                'last_updated': timezone.now().isoformat(),
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@cache_analytics(timeout=1200)  # 20 minutes cache
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
                    'total_classes': Grade.objects.filter(campus=campus).count(),
                    'active_students_today': Student.objects.filter(
                        campus=campus
                    ).count(),  # Simplified - just count all students
                    'total_xp_earned': 0,  # Simplified
                    'average_class_completion': 0.0,  # Simplified
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
@cache_analytics(timeout=1200)  # 20 minutes cache
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
                    'total_students': Student.objects.filter(class_room__grade__english_teacher=teacher).count(),
                    'students_completed_levels': 0,  # Simplified
                    'active_students_today': 0,  # Simplified
                    'average_completion_rate': 0.0,  # Simplified
                    'average_xp_per_student': 0.0,  # Simplified
                    'top_student_name': None,  # Simplified
                    'top_student_xp': 0,  # Simplified
                    'struggling_students': 0,  # Simplified
                }
            )
            
            teacher_data.append({
                'teacher_id': teacher.id,
                'teacher_name': teacher.name,
                'campus': teacher.campus.campus_name,
                'total_students': analytics.total_students,
                'students_completed_levels': analytics.students_completed_levels,
                'active_students_today': analytics.active_students_today,
                'average_completion_rate': round(analytics.average_completion_rate, 2),
                'average_xp_per_student': round(analytics.average_xp_per_student, 2),
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
@cache_analytics(timeout=1200)  # 20 minutes cache
def class_analytics(request):
    """Get class-specific analytics"""
    try:
        grades = Grade.objects.all()
        class_data = []
        
        for grade in grades:
            analytics, created = ClassAnalytics.objects.get_or_create(
                grade=grade,
                date=timezone.now().date(),
                defaults={
                    'total_students': Student.objects.filter(class_room__grade=grade).count(),
                    'active_students_today': 0,  # Simplified
                    'active_students_this_week': 0,  # Simplified
                    'total_levels_completed': 0,  # Simplified
                    'average_completion_rate': 0.0,  # Simplified
                    'total_xp_earned': 0,  # Simplified
                    'average_xp_per_student': 0.0,  # Simplified
                    'students_with_streak': 0,  # Simplified
                    'average_streak': 0.0,  # Simplified
                    'top_student_name': None,  # Simplified
                    'top_student_xp': 0,  # Simplified
                    'struggling_students': 0,  # Simplified
                }
            )
            
            class_data.append({
                'class_id': grade.id,
                'class_name': grade.name,
                'grade': grade.name,
                'section': grade.shift,
                'campus': grade.campus.campus_name,
                'total_students': analytics.total_students,
                'active_students_today': analytics.active_students_today,
                'total_levels_completed': analytics.total_levels_completed,
                'average_completion_rate': round(analytics.average_completion_rate, 2),
                'total_xp_earned': analytics.total_xp_earned,
                'average_xp_per_student': round(analytics.average_xp_per_student, 2),
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
@cache_analytics(timeout=1200)  # 20 minutes cache
def student_analytics(request):
    """Get student-specific analytics"""
    try:
        students = Student.objects.all()
        student_data = []
        
        for student in students:
            analytics, created = StudentAnalytics.objects.get_or_create(
                student=student,
                date=timezone.now().date(),
                defaults={
                    'levels_completed': 0,  # Simplified
                    'xp_earned': 0,  # Simplified
                    'current_streak': 0,  # Simplified
                    'longest_streak': 0,  # Simplified
                    'average_score': 0.0,  # Simplified
                    'time_spent_learning': 0,  # Simplified
                }
            )
            
            student_data.append({
                'student_id': student.id,
                'student_name': student.name,
                'class': f"{student.class_room.grade.grade_number}-{student.class_room.section}",
                'campus': student.campus.campus_name,
                'levels_completed': analytics.levels_completed,
                'xp_earned': analytics.xp_earned,
                'current_streak': analytics.current_streak,
                'longest_streak': analytics.longest_streak,
                'average_score': round(analytics.average_score, 2),
                'time_spent_learning': analytics.time_spent_learning,
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
@cache_analytics(timeout=1800)  # 30 minutes cache
def performance_trend(request):
    """Get performance trends over time"""
    try:
        # Get last 30 days of performance trends
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        trends = PerformanceTrend.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('date')
        
        trend_data = []
        for trend in trends:
            trend_data.append({
                'date': trend.date,
                'total_xp_earned': trend.total_xp_earned,
                'levels_completed': trend.levels_completed,
                'active_users': trend.active_users,
                'new_registrations': trend.new_registrations,
            })
        
        return Response({
            'success': True,
            'data': trend_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
@cache_api_response(timeout=1800, key_prefix='campus_list')  # 30 minutes cache
def campus_list(request):
    """Get list of all campuses with basic info"""
    try:
        campuses = Campus.objects.all()
        campus_data = []
        
        for campus in campuses:
            # Get basic stats for each campus
            total_teachers = Teacher.objects.filter(campus=campus).count()
            total_students = Student.objects.filter(campus=campus).count()
            total_classes = Grade.objects.filter(campus=campus).count()
            
            campus_data.append({
                'id': campus.id,
                'campus_name': campus.campus_name,
                'city': campus.city,
                'total_teachers': total_teachers,
                'total_students': total_students,
                'total_classes': total_classes,
                'established_year': getattr(campus, 'established_year', None),
                'instruction_language': getattr(campus, 'instruction_language', None),
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
@cache_analytics(timeout=1200)  # 20 minutes cache
def teachers_list(request):
    """Get list of all teachers with performance metrics"""
    try:
        teachers = Teacher.objects.all()
        teacher_data = []
        
        for teacher in teachers:
            # Get basic stats for each teacher
            total_students = Student.objects.filter(class_room__grade__english_teacher=teacher).count()
            classes_taught = Grade.objects.filter(english_teacher=teacher).count()
            
            teacher_data.append({
                'id': teacher.id,
                'name': teacher.name,
                'teacher_id': teacher.teacher_id,
                'email': teacher.email,
                'phone': teacher.phone,
                'subject': teacher.subject,
                'experience_years': teacher.experience_years,
                'campus': teacher.campus.campus_name,
                'total_students': total_students,
                'classes_taught': classes_taught,
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
@permission_classes([AllowAny])
@cache_api_response(timeout=1200, key_prefix='classes_list')  # 20 minutes cache
def classes_list(request):
    """Get list of all classes with progress metrics"""
    try:
        grades = Grade.objects.all()
        class_data = []
        
        for grade in grades:
            # Get basic stats for each grade
            total_students = Student.objects.filter(grade=grade.name).count()
            english_teacher = grade.english_teacher.name if grade.english_teacher else 'Not Assigned'
            
            class_data.append({
                'id': grade.id,
                'code': grade.code,
                'name': grade.name,
                'grade': grade.name,  # This will be "Grade 1", "Grade 2", etc.
                'section': grade.shift,
                'campus': grade.campus.campus_name,
                'class_teacher': english_teacher,
                'total_students': total_students,
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
@permission_classes([AllowAny])
def overall_stats(request):
    """Get overall stats for donor dashboard"""
    try:
        # Get real data from database
        total_users = User.objects.count()
        total_teachers = User.objects.filter(role='teacher').count()
        total_students = User.objects.filter(role='student').count()
        total_levels = Level.objects.count()
        total_groups = Group.objects.count()
        
        # Today's activity
        today = timezone.now().date()
        active_users_today = User.objects.filter(last_login__date=today).count()
        levels_completed_today = LevelProgress.objects.filter(completed_at__date=today).count()
        
        # Total completed levels
        total_levels_completed = LevelProgress.objects.filter(is_completed=True).count()
        
        # XP calculations
        total_xp_earned = LevelProgress.objects.aggregate(total=Sum('xp_earned'))['total'] or 0
        avg_xp_per_student = LevelProgress.objects.values('user').annotate(
            total_xp=Sum('xp_earned')
        ).aggregate(avg=Avg('total_xp'))['avg'] or 0
        
        # Completion rate
        avg_completion_rate = LevelProgress.objects.aggregate(
            avg=Avg('completion_percentage')
        )['avg'] or 0
        
        # Student activity
        students_active_this_week = User.objects.filter(
            role='student', 
            last_login__gte=timezone.now() - timedelta(days=7)
        ).distinct().count()
        
        students_active_this_month = User.objects.filter(
            role='student', 
            last_login__gte=timezone.now() - timedelta(days=30)
        ).distinct().count()
        
        return Response({
            'date': timezone.now().isoformat(),
            'total_users': total_users,
            'total_teachers': total_teachers,
            'total_students': total_students,
            'active_users_today': active_users_today,
            'total_levels': total_levels,
            'total_groups': total_groups,
            'levels_completed_today': levels_completed_today,
            'total_levels_completed': total_levels_completed,
            'average_completion_rate': round(avg_completion_rate, 2),
            'average_xp_per_student': round(avg_xp_per_student, 2),
            'total_xp_earned': total_xp_earned,
            'students_with_streak': total_students,  # Simplified
            'students_active_this_week': students_active_this_week,
            'students_active_this_month': students_active_this_month,
            'top_student_xp': 0,  # Will be calculated later
            'top_student_streak': 0,  # Will be calculated later
            'top_class_completion': 0.0,  # Will be calculated later
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def campus_data(request):
    """Get campus data for donor dashboard"""
    try:
        campuses = Campus.objects.all()
        campus_data = []
        
        for campus in campuses:
            total_teachers = Teacher.objects.filter(campus=campus).count()
            total_students = Student.objects.filter(campus=campus).count()
            total_classes = Grade.objects.filter(campus=campus).count()
            
            # Calculate XP earned by students in this campus
            campus_xp = LevelProgress.objects.filter(
                user__student__campus=campus
            ).aggregate(total=Sum('xp_earned'))['total'] or 0
            
            # Calculate average completion rate
            avg_completion = LevelProgress.objects.filter(
                user__student__campus=campus
            ).aggregate(avg=Avg('completion_percentage'))['avg'] or 0
            
            campus_data.append({
                'campus_id': campus.id,
                'campus_name': campus.campus_name,
                'total_teachers': total_teachers,
                'total_students': total_students,
                'total_classes': total_classes,
                'active_students_today': total_students,  # Simplified
                'total_xp_earned': campus_xp,
                'average_class_completion': round(avg_completion, 2),
            })
        
        return Response(campus_data)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def teacher_performance(request):
    """Get teacher performance data"""
    try:
        teachers = Teacher.objects.all()
        teacher_data = []
        
        for teacher in teachers:
            # Get students taught by this teacher
            students_taught = Student.objects.filter(
                class_room__grade__english_teacher=teacher
            )
            total_students = students_taught.count()
            
            # Calculate completion rate
            completed_levels = LevelProgress.objects.filter(
                user__student__in=students_taught,
                is_completed=True
            ).count()
            
            # Calculate average XP per student
            avg_xp = LevelProgress.objects.filter(
                user__student__in=students_taught
            ).values('user').annotate(
                total_xp=Sum('xp_earned')
            ).aggregate(avg=Avg('total_xp'))['avg'] or 0
            
            # Get assigned class
            assigned_class = Grade.objects.filter(english_teacher=teacher).first()
            class_name = f"{assigned_class.name} {assigned_class.shift}" if assigned_class else "No Class Assigned"
            
            teacher_data.append({
                'teacher_id': teacher.id,
                'teacher_name': teacher.name,
                'teacher_code': teacher.teacher_id,
                'assigned_class': class_name,
                'total_students': total_students,
                'students_completed_levels': completed_levels,
                'active_students_today': total_students,  # Simplified
                'average_completion_rate': round((completed_levels / total_students * 100) if total_students > 0 else 0, 2),
                'average_xp_per_student': round(avg_xp, 2),
                'top_student_name': 'N/A',  # Will be calculated later
                'top_student_xp': 0,  # Will be calculated later
                'struggling_students': 0,  # Will be calculated later
            })
        
        return Response(teacher_data)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def student_performance(request):
    """Get student performance data"""
    try:
        students = Student.objects.all()
        student_data = []
        
        for student in students:
            # Get user associated with student
            user = User.objects.filter(student=student).first()
            if not user:
                continue
                
            # Get progress data
            progress_data = LevelProgress.objects.filter(user=user)
            
            # Calculate metrics
            levels_completed = progress_data.filter(is_completed=True).count()
            total_xp = progress_data.aggregate(total=Sum('xp_earned'))['total'] or 0
            
            # Get class info
            class_name = f"{student.class_room.grade.name} {student.class_room.section}" if student.class_room else "No Class"
            
            # Calculate completion rate (simplified)
            completion_rate = (levels_completed / 10 * 100) if levels_completed > 0 else 0  # Assuming 10 levels per grade
            
            student_data.append({
                'student_id': student.id,
                'student_name': student.name,
                'student_code': student.student_id,
                'class_name': class_name,
                'campus_name': student.campus.campus_name,
                'total_xp': total_xp,
                'levels_completed': levels_completed,
                'current_streak': 0,  # Will be calculated later
                'longest_streak': 0,  # Will be calculated later
                'last_active': user.last_login.isoformat() if user.last_login else timezone.now().isoformat(),
                'completion_rate': round(completion_rate, 2),
                'rank': 0,  # Will be calculated later
                'teacher_name': student.class_room.grade.english_teacher.name if student.class_room and student.class_room.grade.english_teacher else 'No Teacher',
            })
        
        # Sort by XP and assign ranks
        student_data.sort(key=lambda x: x['total_xp'], reverse=True)
        for i, student in enumerate(student_data):
            student['rank'] = i + 1
        
        return Response(student_data)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def daily_activity(request):
    """Get daily activity data for charts"""
    try:
        # Generate last 7 days of data
        daily_data = []
        for i in range(7):
            date = timezone.now().date() - timedelta(days=6-i)
            
            # Count active students for this day
            active_students = User.objects.filter(
                role='student',
                last_login__date=date
            ).count()
            
            # Count levels completed on this day
            levels_completed = LevelProgress.objects.filter(
                completed_at__date=date
            ).count()
            
            # Calculate XP earned on this day
            xp_earned = LevelProgress.objects.filter(
                completed_at__date=date
            ).aggregate(total=Sum('xp_earned'))['total'] or 0
            
            # Count login attempts
            login_count = User.objects.filter(
                last_login__date=date
            ).count()
            
            daily_data.append({
                'day': date.strftime('%a'),  # Mon, Tue, etc.
                'active_students': active_students,
                'levels_completed': levels_completed,
                'xp_earned': xp_earned,
                'login_count': login_count,
            })
        
        return Response(daily_data)
        
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

        students = Student.objects.all()

        student_data = []

        

        for student in students:

            analytics, created = StudentAnalytics.objects.get_or_create(

                student=student,

                date=timezone.now().date(),

                defaults={

                    'levels_completed': 0,  # Simplified

                    'xp_earned': 0,  # Simplified

                    'current_streak': 0,  # Simplified

                    'longest_streak': 0,  # Simplified

                    'average_score': 0.0,  # Simplified

                    'time_spent_learning': 0,  # Simplified

                }

            )

            

            student_data.append({

                'student_id': student.id,

                'student_name': student.name,

                'class': f"{student.class_room.grade.grade_number}-{student.class_room.section}",

                'campus': student.campus.campus_name,

                'levels_completed': analytics.levels_completed,

                'xp_earned': analytics.xp_earned,

                'current_streak': analytics.current_streak,

                'longest_streak': analytics.longest_streak,

                'average_score': round(analytics.average_score, 2),

                'time_spent_learning': analytics.time_spent_learning,

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

def performance_trend(request):

    """Get performance trends over time"""

    try:

        # Get last 30 days of performance trends

        end_date = timezone.now().date()

        start_date = end_date - timedelta(days=30)

        

        trends = PerformanceTrend.objects.filter(

            date__range=[start_date, end_date]

        ).order_by('date')

        

        trend_data = []

        for trend in trends:

            trend_data.append({

                'date': trend.date,

                'total_xp_earned': trend.total_xp_earned,

                'levels_completed': trend.levels_completed,

                'active_users': trend.active_users,

                'new_registrations': trend.new_registrations,

            })

        

        return Response({

            'success': True,

            'data': trend_data

        })

        

    except Exception as e:

        return Response({

            'success': False,

            'error': str(e)

        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])

@permission_classes([AllowAny])

def campus_list(request):

    """Get list of all campuses with basic info"""

    try:

        campuses = Campus.objects.all()

        campus_data = []

        

        for campus in campuses:

            # Get basic stats for each campus

            total_teachers = Teacher.objects.filter(campus=campus).count()

            total_students = Student.objects.filter(campus=campus).count()

            total_classes = Grade.objects.filter(campus=campus).count()

            

            campus_data.append({

                'id': campus.id,

                'campus_name': campus.campus_name,

                'city': campus.city,

                'total_teachers': total_teachers,

                'total_students': total_students,

                'total_classes': total_classes,

                'established_year': getattr(campus, 'established_year', None),

                'instruction_language': getattr(campus, 'instruction_language', None),

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

def teachers_list(request):

    """Get list of all teachers with performance metrics"""

    try:

        teachers = Teacher.objects.all()

        teacher_data = []

        

        for teacher in teachers:

            # Get basic stats for each teacher

            total_students = Student.objects.filter(class_room__grade__english_teacher=teacher).count()

            classes_taught = Grade.objects.filter(english_teacher=teacher).count()

            

            teacher_data.append({

                'id': teacher.id,

                'name': teacher.name,

                'teacher_id': teacher.teacher_id,

                'email': teacher.email,

                'phone': teacher.phone,

                'subject': teacher.subject,

                'experience_years': teacher.experience_years,

                'campus': teacher.campus.campus_name,

                'total_students': total_students,

                'classes_taught': classes_taught,

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

@permission_classes([AllowAny])

def classes_list(request):

    """Get list of all classes with progress metrics"""

    try:

        grades = Grade.objects.all()

        class_data = []

        

        for grade in grades:

            # Get basic stats for each grade

            total_students = Student.objects.filter(grade=grade.name).count()

            english_teacher = grade.english_teacher.name if grade.english_teacher else 'Not Assigned'

            

            class_data.append({

                'id': grade.id,

                'code': grade.code,

                'name': grade.name,

                'grade': grade.name,  # This will be "Grade 1", "Grade 2", etc.

                'section': grade.shift,

                'campus': grade.campus.campus_name,

                'class_teacher': english_teacher,

                'total_students': total_students,

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
