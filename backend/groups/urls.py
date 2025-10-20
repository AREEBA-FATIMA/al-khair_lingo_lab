from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'admin', views.GroupViewSet)

urlpatterns = [
    # Group endpoints
    path('', views.GroupListView.as_view(), name='group-list'),
    path('<int:group_number>/', views.GroupDetailView.as_view(), name='group-detail'),
    path('<int:group_number>/levels/', views.GroupLevelsView.as_view(), name='group-levels'),
    path('<int:group_number>/unlock/', views.unlock_group, name='group-unlock'),
    path('<int:group_number>/complete/', views.complete_group, name='group-complete'),
    path('<int:group_number>/stats/', views.group_stats, name='group-stats'),
    
    # Unlock test endpoints
    path('unlock-tests/', views.GroupUnlockTestListView.as_view(), name='unlock-test-list'),
    path('unlock-tests/<int:test_id>/', views.GroupUnlockTestDetailView.as_view(), name='unlock-test-detail'),
    path('unlock-tests/<int:test_id>/start/', views.start_unlock_test, name='unlock-test-start'),
    path('unlock-tests/<int:test_id>/submit/', views.submit_unlock_test, name='unlock-test-submit'),
    path('unlock-attempts/', views.GroupUnlockTestAttemptListView.as_view(), name='unlock-attempt-list'),
    
    # Include router URLs
    path('', include(router.urls)),
]