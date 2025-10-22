from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'placement-tests', views.PlacementTestViewSet)
router.register(r'attempts', views.PlacementTestAttemptViewSet)

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Custom endpoints
    path('start/<int:test_id>/', views.start_placement_test, name='start_placement_test'),
    path('submit/<int:test_id>/', views.submit_placement_test, name='submit_placement_test'),
    path('available/', views.get_available_tests, name='get_available_tests'),
    path('stats/', views.placement_stats, name='placement_stats'),
]

