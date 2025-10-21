from django.core.management.base import BaseCommand
from groups.models import Group
from levels.models import Level, Question


class Command(BaseCommand):
    help = 'Create sample levels and questions for testing'

    def handle(self, *args, **options):
        # Get all groups
        groups = Group.objects.all().order_by('group_number')
        
        if not groups.exists():
            self.stdout.write(
                self.style.ERROR('No groups found! Please create groups first using: python manage.py create_sample_groups')
            )
            return

        created_levels = 0
        created_questions = 0

        for group in groups:
            self.stdout.write(f'Creating levels for Group {group.group_number}: {group.name}')
            
            # Determine number of levels based on group
            if group.group_number == 0:
                # Basic group has 20 levels
                num_levels = 20
            else:
                # Other groups have 50 levels each
                num_levels = 50
            
            # Create levels for this group
            for level_num in range(1, num_levels + 1):
                # Calculate global level number
                global_level_num = level_num
                if group.group_number > 0:
                    # Add levels from previous groups
                    global_level_num += sum([20 if g.group_number == 0 else 50 for g in groups if g.group_number < group.group_number])
                
                # Determine if this is a test level (every 10th level)
                is_test_level = level_num % 10 == 0
                
                level, created = Level.objects.get_or_create(
                    level_number=global_level_num,
                    defaults={
                        'group': group,
                        'name': f'Level {level_num}',
                        'description': f'Level {level_num} of {group.name} - Practice your English skills',
                        'difficulty': group.difficulty,
                        'xp_reward': 10 if not is_test_level else 50,
                        'is_test_level': is_test_level,
                        'test_questions_count': 10 if is_test_level else 6,
                        'test_pass_percentage': 80 if is_test_level else 60,
                        'test_time_limit_minutes': 15 if is_test_level else 10,
                        'is_active': True,
                        'is_unlocked': True
                    }
                )
                
                if created:
                    created_levels += 1
                    self.stdout.write(f'  Created Level {global_level_num}: {level.name}')
                    
                    # Create questions for this level
                    questions_created = self.create_questions_for_level(level)
                    created_questions += questions_created
                else:
                    self.stdout.write(f'  Level {global_level_num} already exists, skipping...')

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSummary:\n'
                f'Created: {created_levels} levels\n'
                f'Created: {created_questions} questions\n'
                f'Total levels in database: {Level.objects.count()}'
            )
        )

    def create_questions_for_level(self, level):
        """Create sample questions for a level"""
        questions_created = 0
        
        # Determine number of questions based on level type
        if level.is_test_level:
            num_questions = level.test_questions_count
        else:
            num_questions = 6
        
        # Sample question types
        question_types = [
            'mcq', 'fill_blank', 'synonyms', 'antonyms', 
            'sentence_completion', 'grammar'
        ]
        
        # Sample questions data
        sample_questions = [
            {
                'mcq': {
                    'question_text': 'What is the meaning of "beautiful"?',
                    'options': ['Ugly', 'Pretty', 'Bad', 'Small'],
                    'correct_answer': 'Pretty'
                }
            },
            {
                'fill_blank': {
                    'question_text': 'The cat is _____ the table.',
                    'correct_answer': 'on'
                }
            },
            {
                'synonyms': {
                    'question_text': 'What is a synonym for "happy"?',
                    'correct_answer': 'joyful'
                }
            },
            {
                'antonyms': {
                    'question_text': 'What is the opposite of "big"?',
                    'correct_answer': 'small'
                }
            },
            {
                'sentence_completion': {
                    'question_text': 'Complete: "I _____ to school every day."',
                    'correct_answer': 'go'
                }
            },
            {
                'grammar': {
                    'question_text': 'Choose the correct form: "She _____ a book."',
                    'options': ['read', 'reads', 'reading', 'readed'],
                    'correct_answer': 'reads'
                }
            }
        ]
        
        # Create questions
        for i in range(num_questions):
            question_type = question_types[i % len(question_types)]
            question_data = sample_questions[i % len(sample_questions)][question_type]
            
            question, created = Question.objects.get_or_create(
                level=level,
                question_order=i + 1,
                defaults={
                    'question_text': question_data['question_text'],
                    'question_type': question_type,
                    'options': question_data.get('options'),
                    'correct_answer': question_data['correct_answer'],
                    'hint': f'Hint for question {i + 1}',
                    'explanation': f'Explanation for question {i + 1}',
                    'difficulty': level.difficulty,
                    'xp_value': 2,
                    'time_limit_seconds': 30,
                    'is_active': True
                }
            )
            
            if created:
                questions_created += 1
        
        return questions_created

