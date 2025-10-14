from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from groups.models import Group, Level, Question

class Command(BaseCommand):
    help = 'Create content creator user and setup'

    def handle(self, *args, **options):
        # Create content creator user
        username = 'content_creator'
        email = 'creator@lingo.com'
        password = 'creator123'
        
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_staff=True,
                is_superuser=False
            )
            self.stdout.write(self.style.SUCCESS(f'Created content creator user: {username}'))
            self.stdout.write(f'Password: {password}')
        else:
            self.stdout.write(f'Content creator user already exists: {username}')
        
        # Create sample questions for demonstration
        self.create_sample_questions()
        
        self.stdout.write(self.style.SUCCESS('Content creator setup complete!'))
        self.stdout.write('Login at: http://127.0.0.1:8000/admin')
        self.stdout.write(f'Username: {username}')
        self.stdout.write(f'Password: {password}')

    def create_sample_questions(self):
        """Create sample questions for content creator to see format"""
        
        # Get Group 0, Level 1
        try:
            group = Group.objects.get(group_number=0)
            level = Level.objects.get(group=group, level_number=1)
            
            # Clear existing questions
            Question.objects.filter(level=level).delete()
            
            # Create sample questions
            sample_questions = [
                {
                    'question_text': 'What is the capital of Pakistan?',
                    'question_type': 'mcq',
                    'options': ['Islamabad', 'Karachi', 'Lahore', 'Peshawar'],
                    'correct_answer': 'Islamabad',
                    'explanation': 'Islamabad is the capital city of Pakistan.',
                    'difficulty': 'easy',
                    'xp_value': 10,
                    'question_order': 1
                },
                {
                    'question_text': 'Pronounce the word "Hello"',
                    'question_type': 'text_to_speech',
                    'options': [],
                    'correct_answer': 'Hello',
                    'explanation': 'The word "Hello" is pronounced as "huh-loh".',
                    'difficulty': 'easy',
                    'xp_value': 15,
                    'question_order': 2
                },
                {
                    'question_text': 'Complete: "I ___ to school every day."',
                    'question_type': 'fill_blank',
                    'options': ['go', 'goes', 'going', 'went'],
                    'correct_answer': 'go',
                    'explanation': 'The correct answer is "go" because the subject "I" takes the base form of the verb.',
                    'difficulty': 'easy',
                    'xp_value': 10,
                    'question_order': 3
                }
            ]
            
            for q_data in sample_questions:
                Question.objects.create(level=level, **q_data)
            
            self.stdout.write(f'Created {len(sample_questions)} sample questions for {group.name}, Level {level.level_number}')
            
        except (Group.DoesNotExist, Level.DoesNotExist):
            self.stdout.write(self.style.ERROR('Group 0 or Level 1 not found. Run setup_groups first.'))
