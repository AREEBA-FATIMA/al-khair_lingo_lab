from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'admin/groups', views.GroupViewSet, basename='admin-group')
router.register(r'admin/progress', views.GroupProgressViewSet, basename='admin-group-progress')
router.register(r'admin/unlock-tests', views.GroupUnlockTestViewSet, basename='admin-group-unlock-test')
router.register(r'admin/unlock-attempts', views.GroupUnlockTestAttemptViewSet, basename='admin-group-unlock-attempt')

urlpatterns = [
    # Public API endpoints
    path('', views.GroupListView.as_view(), name='group-list'),
    path('<int:group_number>/', views.GroupDetailView.as_view(), name='group-detail'),
    path('unlock-tests/', views.GroupUnlockTestListView.as_view(), name='group-unlock-test-list'),
    path('unlock-tests/<int:pk>/', views.GroupUnlockTestDetailView.as_view(), name='group-unlock-test-detail'),
    
    # User-specific endpoints
    path('my-groups/', views.get_user_groups, name='user-groups'),
    path('<int:group_id>/unlock/', views.unlock_group, name='unlock-group'),
    path('<int:group_id>/complete/', views.complete_group, name='complete-group'),
    path('unlock-tests/<int:test_id>/start/', views.start_unlock_test, name='start-unlock-test'),
    path('unlock-tests/<int:test_id>/submit/', views.submit_unlock_test, name='submit-unlock-test'),
    path('unlock-attempts/', views.GroupUnlockTestAttemptListView.as_view(), name='group-unlock-attempt-list'),
    path('stats/', views.group_stats, name='group-stats'),
    path('recommendations/', views.get_group_recommendations, name='group-recommendations'),
    
    # Admin endpoints
    path('', include(router.urls)),
]