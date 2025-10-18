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
    
    # Include router URLs
    path('', include(router.urls)),
]
