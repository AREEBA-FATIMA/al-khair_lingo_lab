from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'grammar-rules', views.GrammarRuleViewSet)
router.register(r'progress', views.GrammarProgressViewSet)

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Custom endpoints
    path('practice/<int:grammar_rule_id>/', views.practice_grammar, name='practice_grammar'),
    path('practice-rules/', views.get_practice_rules, name='get_practice_rules'),
    path('stats/', views.grammar_stats, name='grammar_stats'),
]

