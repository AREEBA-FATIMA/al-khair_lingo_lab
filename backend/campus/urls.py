from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampusViewSet

router = DefaultRouter()
router.register(r'campuses', CampusViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
