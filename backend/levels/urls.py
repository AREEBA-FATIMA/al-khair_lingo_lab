from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'admin/levels', views.LevelViewSet, basename='admin-level')
router.register(r'admin/questions', views.QuestionViewSet, basename='admin-question')

urlpatterns = [
    # ===== ADMIN/MANAGEMENT ENDPOINTS =====
    # These are for admin users to manage levels and questions
    
    # Level management
    path('admin/levels/', views.LevelListView.as_view(), name='admin-level-list'),
    path('admin/levels/<int:level_number>/', views.LevelDetailView.as_view(), name='admin-level-detail'),
    path('admin/levels/<int:level_number>/questions/', views.LevelQuestionsView.as_view(), name='admin-level-questions'),
    
    # Question management
    path('admin/questions/<int:pk>/', views.QuestionDetailView.as_view(), name='admin-question-detail'),
    
    # User progress management (admin view)
    path('admin/completions/', views.LevelCompletionListView.as_view(), name='admin-level-completion-list'),
    path('admin/completions/<int:pk>/', views.LevelCompletionDetailView.as_view(), name='admin-level-completion-detail'),
    path('admin/stats/', views.level_stats, name='admin-level-stats'),
    
    # ===== USER ENDPOINTS =====
    # These are for regular users to access levels and questions
    
    # Level access
    path('levels/', views.LevelListView.as_view(), name='level-list'),
    path('levels/<int:level_number>/', views.LevelDetailView.as_view(), name='level-detail'),
    path('levels/<int:level_number>/questions/', views.LevelQuestionsView.as_view(), name='level-questions'),
    
    # Level completion and answer submission
    path('submit-answer/', views.submit_answer, name='submit-answer'),
    path('complete-level/', views.complete_level, name='complete-level'),
    path('next-level/', views.get_next_level, name='next-level'),
    path('test-levels/', views.get_test_levels, name='test-levels'),
    
    # User level completions
    path('completions/', views.LevelCompletionListView.as_view(), name='level-completion-list'),
    path('completions/<int:pk>/', views.LevelCompletionDetailView.as_view(), name='level-completion-detail'),
    path('stats/', views.level_stats, name='level-stats'),
    
    # Include router URLs
    path('', include(router.urls)),
]
