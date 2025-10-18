from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a user with specified role'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username')
        parser.add_argument('--email', type=str, help='Email address')
        parser.add_argument('--role', type=str, choices=['admin', 'teacher', 'student'], help='User role')
        parser.add_argument('--password', type=str, help='Password')
        parser.add_argument('--first-name', type=str, help='First name')
        parser.add_argument('--last-name', type=str, help='Last name')

    def handle(self, *args, **options):
        role = options['role']
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name'] or ''
        last_name = options['last_name'] or ''

        try:
            if role == 'admin':
                if not email:
                    self.stdout.write(
                        self.style.ERROR('Email is required for admin users')
                    )
                    return
                
                user = User.objects.create_superuser(
                    email=email,
                    password=password,
                    username=username,
                    first_name=first_name,
                    last_name=last_name
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Admin user created: {user.username}')
                )

            elif role == 'teacher':
                if not email:
                    self.stdout.write(
                        self.style.ERROR('Email is required for teacher users')
                    )
                    return
                
                user = User.objects.create_teacher_user(
                    email=email,
                    password=password,
                    username=username,
                    first_name=first_name,
                    last_name=last_name
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Teacher user created: {user.username}')
                )

            elif role == 'student':
                if not username:
                    self.stdout.write(
                        self.style.ERROR('Username is required for student users')
                    )
                    return
                
                user = User.objects.create_student_user(
                    username=username,
                    password=password,
                    first_name=first_name,
                    last_name=last_name
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Student user created: {user.username}')
                )

        except ValidationError as e:
            self.stdout.write(
                self.style.ERROR(f'Validation error: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating user: {e}')
            )
