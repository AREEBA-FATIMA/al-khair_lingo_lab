from django.urls import path
from . import views

urlpatterns = [
    # Progress overview and stats
    path('overview/', views.progress_overview, name='progress-overview'),
    path('recent/', views.recent_activity, name='recent-activity'),
    path('achievements/', views.achievements, name='achievements'),
    
    # Progress management
    path('save/', views.save_progress, name='save-progress'),
    path('load/', views.load_progress, name='load-progress'),
]