from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# Removed non-existent viewsets

urlpatterns = [
    # Groups
    path('', views.GroupListView.as_view(), name='group-list'),
    path('<int:pk>/', views.GroupDetailView.as_view(), name='group-detail'),
    path('<int:group_id>/levels/', views.GroupLevelsView.as_view(), name='group-levels'),
    
    # Levels
    path('levels/<int:pk>/', views.LevelDetailView.as_view(), name='level-detail'),
    path('<int:group_id>/levels/<int:level_id>/questions/', views.LevelQuestionsView.as_view(), name='level-questions'),
    
    # Questions
    path('questions/submit-answer/', views.submit_answer, name='submit-answer'),
    
    # Router URLs
    path('', include(router.urls)),
]
