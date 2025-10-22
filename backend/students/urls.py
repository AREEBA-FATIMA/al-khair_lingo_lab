from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, student_registration

router = DefaultRouter()
router.register(r'students', StudentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', student_registration, name='student-registration'),
]
