from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'admin/exercises', views.TestExerciseViewSet, basename='admin-test-exercise')
router.register(r'admin/questions', views.TestQuestionViewSet, basename='admin-test-question')
router.register(r'admin/attempts', views.TestAttemptViewSet, basename='admin-test-attempt')

urlpatterns = [
    # Public API endpoints
    path('', views.TestExerciseListView.as_view(), name='test-exercise-list'),
    path('<int:pk>/', views.TestExerciseDetailView.as_view(), name='test-exercise-detail'),
    path('<int:test_id>/questions/', views.TestQuestionListView.as_view(), name='test-question-list'),
    
    # User-specific endpoints
    path('<int:test_id>/start/', views.start_test, name='start-test'),
    path('<int:test_id>/submit/', views.submit_test, name='submit-test'),
    path('attempts/', views.TestAttemptListView.as_view(), name='test-attempt-list'),
    path('attempts/<int:pk>/', views.TestAttemptDetailView.as_view(), name='test-attempt-detail'),
    path('stats/', views.test_stats, name='test-stats'),
    path('available/', views.get_available_tests, name='available-tests'),
    path('recommendations/', views.get_test_recommendations, name='test-recommendations'),
    
    # Admin endpoints
    path('', include(router.urls)),
]
