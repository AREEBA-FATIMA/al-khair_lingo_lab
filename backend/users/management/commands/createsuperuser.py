from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.core.exceptions import ValidationError
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a superuser with email (admin role)'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username')
        parser.add_argument('--email', type=str, help='Email address')
        parser.add_argument('--role', type=str, choices=['admin', 'teacher', 'student'], default='admin', help='User role')
        parser.add_argument('--noinput', action='store_true', help='Skip interactive prompts')

    def handle(self, *args, **options):
        username = options.get('username')
        email = options.get('email')
        role = options.get('role', 'admin')
        noinput = options.get('noinput', False)

        if not noinput:
            # Interactive mode
            if not username:
                username = input('Username: ')
            if not email and role != 'student':
                email = input('Email: ')
            if role == 'admin' or role == 'teacher':
                if not email:
                    email = input('Email: ')
            
            password = input('Password: ')
            password_confirm = input('Password (again): ')
            
            if password != password_confirm:
                self.stdout.write(
                    self.style.ERROR('Error: Your passwords didn\'t match.')
                )
                return
            
            first_name = input('First name: ') or ''
            last_name = input('Last name: ') or ''
        else:
            # Non-interactive mode
            if not username:
                self.stdout.write(
                    self.style.ERROR('Username is required in non-interactive mode.')
                )
                return
            if role != 'student' and not email:
                self.stdout.write(
                    self.style.ERROR('Email is required for admin and teacher roles.')
                )
                return
            password = 'admin123'  # Default password
            first_name = 'Test'
            last_name = 'User'

        try:
            with transaction.atomic():
                if role == 'admin':
                    user = User.objects.create_superuser(
                        email=email,
                        password=password,
                        username=username,
                        first_name=first_name,
                        last_name=last_name
                    )
                elif role == 'teacher':
                    user = User.objects.create_teacher_user(
                        email=email,
                        password=password,
                        username=username,
                        first_name=first_name,
                        last_name=last_name
                    )
                elif role == 'student':
                    user = User.objects.create_student_user(
                        username=username,
                        password=password,
                        first_name=first_name,
                        last_name=last_name
                    )
                
                self.stdout.write(
                    self.style.SUCCESS(f'{role.title()} user created successfully: {user.username}')
                )
        except ValidationError as e:
            self.stdout.write(
                self.style.ERROR(f'Validation error: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating user: {e}')
            )

