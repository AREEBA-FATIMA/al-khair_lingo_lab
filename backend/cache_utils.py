"""
Caching Utilities for API Performance Optimization
Provides decorators and utilities for caching API responses
"""

from functools import wraps
from django.core.cache import cache
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
import hashlib
import json
from typing import Any, Optional, Callable


def cache_api_response(timeout: int = 300, key_prefix: str = 'api', vary_on_user: bool = True):
    """
    Decorator to cache API responses
    
    Args:
        timeout: Cache timeout in seconds (default: 5 minutes)
        key_prefix: Prefix for cache key
        vary_on_user: Whether to vary cache based on user
    """
    def decorator(view_func: Callable) -> Callable:
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Generate cache key
            cache_key_parts = [key_prefix, view_func.__name__]
            
            if vary_on_user and hasattr(request, 'user') and request.user.is_authenticated:
                cache_key_parts.append(f"user_{request.user.id}")
            
            # Add request parameters to cache key
            if request.method == 'GET':
                params = request.GET.dict()
                if params:
                    params_str = json.dumps(params, sort_keys=True)
                    cache_key_parts.append(hashlib.md5(params_str.encode()).hexdigest()[:8])
            
            cache_key = '_'.join(cache_key_parts)
            
            # Try to get from cache
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                # Reconstruct DRF Response from cached data
                from rest_framework.response import Response
                return Response(
                    data=cached_data['data'],
                    status=cached_data['status_code'],
                    content_type=cached_data['content_type']
                )
            
            # Execute view function
            response = view_func(request, *args, **kwargs)
            
            # Cache successful responses - only cache the data, not the response object
            if hasattr(response, 'status_code') and response.status_code == 200:
                # Extract data from DRF Response for caching
                if hasattr(response, 'data'):
                    cache_data = {
                        'data': response.data,
                        'status_code': response.status_code,
                        'content_type': response.get('Content-Type', 'application/json')
                    }
                    cache.set(cache_key, cache_data, timeout)
            
            return response
        
        return wrapper
    return decorator


def cache_model_data(model_class, timeout: int = 600, key_prefix: Optional[str] = None):
    """
    Decorator to cache model data queries
    
    Args:
        model_class: Django model class
        timeout: Cache timeout in seconds (default: 10 minutes)
        key_prefix: Prefix for cache key
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            prefix = key_prefix or model_class.__name__.lower()
            cache_key = f"{prefix}_{func.__name__}_{hashlib.md5(str(args).encode() + str(kwargs).encode()).hexdigest()[:8]}"
            
            # Try to get from cache
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return cached_data
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Cache result
            cache.set(cache_key, result, timeout)
            
            return result
        
        return wrapper
    return decorator


class CacheManager:
    """Centralized cache management"""
    
    @staticmethod
    def get_user_progress_cache_key(user_id: int, group_id: Optional[int] = None) -> str:
        """Generate cache key for user progress data"""
        if group_id:
            return f"user_progress_{user_id}_group_{group_id}"
        return f"user_progress_{user_id}"
    
    @staticmethod
    def get_group_data_cache_key(group_id: int) -> str:
        """Generate cache key for group data"""
        return f"group_data_{group_id}"
    
    @staticmethod
    def get_level_data_cache_key(level_id: int) -> str:
        """Generate cache key for level data"""
        return f"level_data_{level_id}"
    
    @staticmethod
    def get_analytics_cache_key(user_id: int, analytics_type: str, days: int = 30) -> str:
        """Generate cache key for analytics data"""
        return f"analytics_{analytics_type}_user_{user_id}_days_{days}"
    
    @staticmethod
    def invalidate_user_cache(user_id: int):
        """Invalidate all cache entries for a user"""
        # This is a simplified version - in production, you'd want to track cache keys
        cache_patterns = [
            f"user_progress_{user_id}",
            f"analytics_*_user_{user_id}_*",
            f"api_*_user_{user_id}_*"
        ]
        
        for pattern in cache_patterns:
            # Note: This is a simplified approach. In production with Redis,
            # you'd use cache.delete_many() with pattern matching
            try:
                cache.delete(pattern)
            except:
                pass
    
    @staticmethod
    def invalidate_group_cache(group_id: int):
        """Invalidate cache entries for a group"""
        cache_keys = [
            f"group_data_{group_id}",
            f"level_data_*"  # All levels in this group
        ]
        
        for key in cache_keys:
            try:
                cache.delete(key)
            except:
                pass
    
    @staticmethod
    def clear_all_cache():
        """Clear all cache entries"""
        cache.clear()


# Cache decorators for specific use cases
def cache_user_progress(timeout: int = 300):
    """Cache user progress data"""
    return cache_api_response(timeout=timeout, key_prefix='user_progress')


def cache_group_data(timeout: int = 600):
    """Cache group data (longer timeout as it changes less frequently)"""
    return cache_api_response(timeout=timeout, key_prefix='group_data')


def cache_analytics(timeout: int = 900):
    """Cache analytics data (15 minutes timeout)"""
    return cache_api_response(timeout=timeout, key_prefix='analytics')


def cache_level_data(timeout: int = 1800):
    """Cache level data (30 minutes timeout - very stable)"""
    return cache_api_response(timeout=timeout, key_prefix='level_data')


# Utility functions for cache management
def warm_up_cache():
    """Warm up frequently accessed cache entries"""
    from groups.models import Group
    from levels.models import Level
    
    # Cache all groups
    groups = Group.objects.filter(is_active=True)
    for group in groups:
        cache_key = CacheManager.get_group_data_cache_key(group.id)
        cache.set(cache_key, {
            'id': group.id,
            'name': group.name,
            'group_number': group.group_number,
            'difficulty': group.difficulty,
            'description': group.description
        }, 1800)
    
    # Cache all levels
    levels = Level.objects.filter(is_active=True)
    for level in levels:
        cache_key = CacheManager.get_level_data_cache_key(level.id)
        cache.set(cache_key, {
            'id': level.id,
            'level_number': level.level_number,
            'name': level.name,
            'difficulty': level.difficulty,
            'xp_reward': level.xp_reward,
            'is_test_level': level.is_test_level
        }, 1800)


def get_cache_stats():
    """Get cache statistics"""
    try:
        # This would work with Redis
        if hasattr(cache, '_cache') and hasattr(cache._cache, 'info'):
            return cache._cache.info()
        else:
            return {'status': 'cache_stats_not_available'}
    except:
        return {'status': 'cache_stats_error'}
