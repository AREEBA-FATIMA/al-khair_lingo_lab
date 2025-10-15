from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'admin/types', views.PlantTypeViewSet, basename='admin-plant-type')
router.register(r'admin/stages', views.PlantStageViewSet, basename='admin-plant-stage')
router.register(r'admin/user-plants', views.UserPlantViewSet, basename='admin-user-plant')
router.register(r'admin/care-logs', views.PlantCareLogViewSet, basename='admin-plant-care-log')

urlpatterns = [
    # Public API endpoints
    path('types/', views.PlantTypeListView.as_view(), name='plant-type-list'),
    path('types/<int:pk>/', views.PlantTypeDetailView.as_view(), name='plant-type-detail'),
    path('types/<int:plant_type_id>/stages/', views.PlantStageListView.as_view(), name='plant-stage-list'),
    
    # User-specific endpoints
    path('my-plant/', views.get_user_plant, name='user-plant'),
    path('create/', views.create_user_plant, name='create-user-plant'),
    path('care/', views.care_plant, name='care-plant'),
    path('care-logs/', views.PlantCareLogListView.as_view(), name='plant-care-log-list'),
    path('stats/', views.plant_stats, name='plant-stats'),
    path('update-progress/', views.update_plant_progress, name='update-plant-progress'),
    path('recommendations/', views.get_plant_recommendations, name='plant-recommendations'),
    path('achievements/', views.get_plant_achievements, name='plant-achievements'),
    
    # Admin endpoints
    path('', include(router.urls)),
]
