from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'group-progress', views.GroupProgressViewSet)
router.register(r'level-progress', views.LevelProgressViewSet)
router.register(r'daily-progress', views.DailyProgressViewSet)

urlpatterns = [
    # Progress Overview
    path('overview/', views.ProgressOverviewView.as_view(), name='progress-overview'),
    path('summary/', views.ProgressSummaryView.as_view(), name='progress-summary'),
    
    # Group Progress
    path('groups/', views.GroupProgressListView.as_view(), name='group-progress-list'),
    path('groups/<int:pk>/', views.GroupProgressDetailView.as_view(), name='group-progress-detail'),
    
    # Level Progress
    path('levels/', views.LevelProgressListView.as_view(), name='level-progress-list'),
    path('levels/<int:pk>/', views.LevelProgressDetailView.as_view(), name='level-progress-detail'),
    
    # Daily Progress
    path('daily/', views.DailyProgressListView.as_view(), name='daily-progress-list'),
    path('daily/today/', views.TodayProgressView.as_view(), name='today-progress'),
    path('daily/weekly/', views.WeeklyProgressView.as_view(), name='weekly-progress'),
    path('daily/monthly/', views.MonthlyProgressView.as_view(), name='monthly-progress'),
    
    # Analytics
    path('analytics/streaks/', views.StreakAnalyticsView.as_view(), name='streak-analytics'),
    path('analytics/performance/', views.PerformanceAnalyticsView.as_view(), name='performance-analytics'),
    
    # Router URLs
    path('', include(router.urls)),
]