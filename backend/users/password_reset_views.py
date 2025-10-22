from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import PasswordResetToken, PasswordChangeLog

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request password reset for a user
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal if email exists or not for security
        return Response(
            {'message': 'If the email exists, a reset link has been sent'},
            status=status.HTTP_200_OK
        )
    
    # Create reset token
    reset_token = PasswordResetToken.create_for_user(
        user=user,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )
    
    # Send reset email (in production, use proper email service)
    reset_url = f"http://127.0.0.1:3000/reset-password?token={reset_token.token}"
    
    try:
        send_mail(
            subject='Password Reset Request',
            message=f'''
            You requested a password reset for your account.
            
            Click the link below to reset your password:
            {reset_url}
            
            This link will expire in 1 hour.
            
            If you didn't request this, please ignore this email.
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return Response(
            {'message': 'Password reset link sent to your email'},
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {'error': 'Failed to send reset email'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password using token
    """
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not token or not new_password:
        return Response(
            {'error': 'Token and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate token
    reset_token = PasswordResetToken.get_valid_token(token)
    if not reset_token:
        return Response(
            {'error': 'Invalid or expired token'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate password strength
    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters long'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Reset password
    user = reset_token.user
    user.set_password(new_password)
    user.save()
    
    # Mark token as used
    reset_token.mark_as_used()
    
    # Log password change
    PasswordChangeLog.objects.create(
        user=user,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        change_type='reset'
    )
    
    return Response(
        {'message': 'Password reset successfully'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def change_password(request):
    """
    Change password for authenticated user
    """
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response(
            {'error': 'Current password and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify current password
    if not request.user.check_password(current_password):
        return Response(
            {'error': 'Current password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate new password strength
    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters long'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Change password
    request.user.set_password(new_password)
    request.user.save()
    
    # Log password change
    PasswordChangeLog.objects.create(
        user=request.user,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        change_type='change'
    )
    
    return Response(
        {'message': 'Password changed successfully'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def admin_reset_password(request):
    """
    Admin reset password for any user
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    user_id = request.data.get('user_id')
    new_password = request.data.get('new_password')
    
    if not user_id or not new_password:
        return Response(
            {'error': 'User ID and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Validate password strength
    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters long'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Reset password
    user.set_password(new_password)
    user.save()
    
    # Log password change
    PasswordChangeLog.objects.create(
        user=user,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        change_type='admin_reset'
    )
    
    return Response(
        {'message': f'Password reset successfully for {user.email}'},
        status=status.HTTP_200_OK
    )
