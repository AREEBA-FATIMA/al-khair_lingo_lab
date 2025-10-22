from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnglishCoordinatorViewSet

# Create router for English Coordinator
router = DefaultRouter()
router.register(r'coordinators', EnglishCoordinatorViewSet, basename='english-coordinator')

app_name = 'english_coordinator'

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Additional custom endpoints
    path('coordinators/my-profile/', EnglishCoordinatorViewSet.as_view({'get': 'my_profile'}), name='my-profile'),
    path('coordinators/my-teachers/', EnglishCoordinatorViewSet.as_view({'get': 'my_teachers'}), name='my-teachers'),
    path('coordinators/assign-teacher/', EnglishCoordinatorViewSet.as_view({'post': 'assign_teacher'}), name='assign-teacher'),
    path('coordinators/student-progress/', EnglishCoordinatorViewSet.as_view({'get': 'student_progress'}), name='student-progress'),
    path('coordinators/grade-performance/', EnglishCoordinatorViewSet.as_view({'get': 'grade_performance'}), name='grade-performance'),
    path('coordinators/dashboard/', EnglishCoordinatorViewSet.as_view({'get': 'dashboard'}), name='dashboard'),
]
