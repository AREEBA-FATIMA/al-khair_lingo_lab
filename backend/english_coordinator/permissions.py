from rest_framework.permissions import BasePermission


class IsEnglishCoordinator(BasePermission):
    """
    Permission for English Coordinator role only
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'english_coordinator'
        )


class IsEnglishCoordinatorOrAdmin(BasePermission):
    """
    Permission for English Coordinator or Admin
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['english_coordinator', 'admin']
        )


class IsEnglishCoordinatorOrTeacher(BasePermission):
    """
    Permission for English Coordinator or Teacher
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['english_coordinator', 'teacher']
        )


class CanManageTeachers(BasePermission):
    """
    Permission to manage teachers (English Coordinator or Admin)
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.user.role == 'admin':
            return True
        
        if request.user.role == 'english_coordinator':
            # Check if coordinator has permission to assign teachers
            try:
                from .models import EnglishCoordinator
                coordinator_profile = EnglishCoordinator.objects.get(email=request.user.email)
                return coordinator_profile.can_assign_teachers
            except:
                return False
        
        return False


class CanViewAllProgress(BasePermission):
    """
    Permission to view all student progress (English Coordinator or Admin)
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.user.role == 'admin':
            return True
        
        if request.user.role == 'english_coordinator':
            # Check if coordinator has permission to view all progress
            try:
                from .models import EnglishCoordinator
                coordinator_profile = EnglishCoordinator.objects.get(email=request.user.email)
                return coordinator_profile.can_view_all_progress
            except:
                return False
        
        return False


class CanManageContent(BasePermission):
    """
    Permission to manage learning content (English Coordinator or Admin)
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.user.role == 'admin':
            return True
        
        if request.user.role == 'english_coordinator':
            # Check if coordinator has permission to manage content
            try:
                from .models import EnglishCoordinator
                coordinator_profile = EnglishCoordinator.objects.get(email=request.user.email)
                return coordinator_profile.can_manage_content
            except:
                return False
        
        return False


class CampusBasedAccess(BasePermission):
    """
    Permission based on campus access for English Coordinator
    """
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        
        if request.user.role == 'english_coordinator':
            try:
                from .models import EnglishCoordinator
                coordinator_profile = EnglishCoordinator.objects.get(email=request.user.email)
                # Check if object belongs to coordinator's campus
                if hasattr(obj, 'campus'):
                    return obj.campus == coordinator_profile.campus
                elif hasattr(obj, 'student_id'):
                    # For student objects, check via student_id
                    from students.models import Student
                    try:
                        student = Student.objects.get(student_id=obj.student_id)
                        return student.campus == coordinator_profile.campus
                    except Student.DoesNotExist:
                        return False
                return False
            except:
                return False
        
        return False
