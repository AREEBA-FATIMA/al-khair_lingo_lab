from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'admin/levels', views.LevelViewSet, basename='admin-level')
router.register(r'admin/questions', views.QuestionViewSet, basename='admin-question')

urlpatterns = [
    # Public API endpoints
    path('', views.LevelListView.as_view(), name='level-list'),
    path('<int:level_number>/', views.LevelDetailView.as_view(), name='level-detail'),
    path('<int:level_number>/questions/', views.LevelQuestionsView.as_view(), name='level-questions'),
    path('questions/<int:pk>/', views.QuestionDetailView.as_view(), name='question-detail'),
    
    # User-specific endpoints
    path('submit-answer/', views.submit_answer, name='submit-answer'),
    path('complete-level/', views.complete_level, name='complete-level'),
    path('completions/', views.LevelCompletionListView.as_view(), name='level-completion-list'),
    path('completions/<int:pk>/', views.LevelCompletionDetailView.as_view(), name='level-completion-detail'),
    path('stats/', views.level_stats, name='level-stats'),
    path('next-level/', views.get_next_level, name='next-level'),
    path('test-levels/', views.get_test_levels, name='test-levels'),
    
    # Admin endpoints
    path('', include(router.urls)),
]
