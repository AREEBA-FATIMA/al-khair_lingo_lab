from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from levels import views as level_views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'admin/groups', views.GroupViewSet, basename='admin-group')
router.register(r'admin/progress', views.GroupProgressViewSet, basename='admin-group-progress')
router.register(r'admin/unlock-tests', views.GroupUnlockTestViewSet, basename='admin-group-unlock-test')
router.register(r'admin/unlock-attempts', views.GroupUnlockTestAttemptViewSet, basename='admin-group-unlock-attempt')

urlpatterns = [
    # ===== MAIN LEARNING API ENDPOINTS =====
    
    # Groups (Main learning units)
    path('', views.GroupListView.as_view(), name='group-list'),
    path('<int:group_number>/', views.GroupDetailView.as_view(), name='group-detail'),
    path('my-groups/', views.get_user_groups, name='user-groups'),
    path('stats/', views.group_stats, name='group-stats'),
    path('recommendations/', views.get_group_recommendations, name='group-recommendations'),
    
    # Group actions
    path('<int:group_id>/unlock/', views.unlock_group, name='unlock-group'),
    path('<int:group_id>/complete/', views.complete_group, name='complete-group'),
    
    # ===== LEVELS WITHIN GROUPS =====
    path('<int:group_id>/levels/', views.get_group_levels, name='group-levels'),
    path('<int:group_id>/levels/<int:level_number>/', views.get_group_level_detail, name='group-level-detail'),
    path('<int:group_id>/levels/<int:level_number>/questions/', level_views.LevelQuestionsView.as_view(), name='group-level-questions'),
    path('<int:group_id>/levels/<int:level_number>/complete/', level_views.complete_level, name='complete-group-level'),
    
    # ===== QUESTIONS =====
    path('questions/<int:pk>/', level_views.QuestionDetailView.as_view(), name='question-detail'),
    path('questions/submit-answer/', level_views.submit_answer, name='submit-answer'),
    
    # ===== USER PROGRESS =====
    path('my-progress/', level_views.LevelCompletionListView.as_view(), name='my-level-completions'),
    path('my-progress/<int:pk>/', level_views.LevelCompletionDetailView.as_view(), name='my-level-completion-detail'),
    path('my-stats/', level_views.level_stats, name='my-level-stats'),
    path('next-level/', level_views.get_next_level, name='next-level'),
    path('test-levels/', level_views.get_test_levels, name='test-levels'),
    
    # ===== UNLOCK TESTS =====
    path('unlock-tests/', views.GroupUnlockTestListView.as_view(), name='group-unlock-test-list'),
    path('unlock-tests/<int:pk>/', views.GroupUnlockTestDetailView.as_view(), name='group-unlock-test-detail'),
    path('unlock-tests/<int:test_id>/start/', views.start_unlock_test, name='start-unlock-test'),
    path('unlock-tests/<int:test_id>/submit/', views.submit_unlock_test, name='submit-unlock-test'),
    path('unlock-attempts/', views.GroupUnlockTestAttemptListView.as_view(), name='group-unlock-attempt-list'),
    
    # ===== ADMIN ENDPOINTS =====
    path('', include(router.urls)),
]