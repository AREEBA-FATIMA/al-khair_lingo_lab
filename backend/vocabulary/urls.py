from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'vocabulary', views.VocabularyViewSet)
router.register(r'progress', views.VocabularyProgressViewSet)

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Custom endpoints
    path('review/<int:vocabulary_id>/', views.review_vocabulary, name='review_vocabulary'),
    path('review-words/', views.get_review_words, name='get_review_words'),
    path('stats/', views.vocabulary_stats, name='vocabulary_stats'),
]

