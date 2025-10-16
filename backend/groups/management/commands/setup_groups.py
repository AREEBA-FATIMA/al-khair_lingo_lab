from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from groups.models import Group
from levels.models import Level, Question
from plants.models import PlantStage
from users.models import User

User = get_user_model()

class Command(BaseCommand):
    help = 'Setup 8 groups (0-7) with appropriate levels and questions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset existing groups and create new ones',
        )

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write('Resetting existing groups...')
            Group.objects.all().delete()
            Level.objects.all().delete()
            Question.objects.all().delete()
            PlantStage.objects.all().delete()

        self.stdout.write('Creating groups and levels...')
        
        # Group data
        groups_data = [
            {
                'group_number': 0,
                'name': 'Basic English',
                'description': 'Basic level for complete beginners',
                'unlock_condition': 'complete_previous',
                'is_unlocked': True  # Only Group 0 unlocked initially
            },
            {
                'group_number': 1,
                'name': 'Elementary English',
                'description': 'Elementary level English learning',
                'unlock_condition': 'test_100_percent',
                'is_unlocked': False  # Locked initially
            },
            {
                'group_number': 2,
                'name': 'Pre-Intermediate',
                'description': 'Pre-intermediate level English',
                'unlock_condition': 'test_100_percent',
                'is_unlocked': False  # Locked initially
            },
            {
                'group_number': 3,
                'name': 'Intermediate',
                'description': 'Intermediate level English',
                'unlock_condition': 'test_100_percent',
                'is_unlocked': False  # Locked initially
            },
            {
                'group_number': 4,
                'name': 'Upper-Intermediate',
                'description': 'Upper-intermediate level English',
                'unlock_condition': 'test_100_percent',
                'is_unlocked': False  # Locked initially
            },
            {
                'group_number': 5,
                'name': 'Advanced',
                'description': 'Advanced level English',
                'unlock_condition': 'test_100_percent',
                'is_unlocked': False  # Locked initially
            },
            {
                'group_number': 6,
                'name': 'Expert ',
                'description': 'Expert level English',
                'unlock_condition': 'test_100_percent',
                'is_unlocked': False  # Locked initially
            },
            {
                'group_number': 7,
                'name': 'Master ',
                'description': 'Master level English',
                'unlock_condition': 'test_100_percent',
                'is_unlocked': False  # Locked initially
            },
        ]

        # Create groups
        for group_data in groups_data:
            group, created = Group.objects.get_or_create(
                group_number=group_data['group_number'],
                defaults=group_data
            )
            
            if created:
                self.stdout.write(f'Created Group {group.group_number}: {group.name}')
            else:
                self.stdout.write(f'Group {group.group_number} already exists')

            # Create levels for this group (fixed 20 levels per group)
            level_count = 20
            for level_num in range(1, level_count + 1):
                # Calculate global level number
                global_level_num = (group.group_number * level_count) + level_num
                
                level, created = Level.objects.get_or_create(
                    level_number=global_level_num,
                    defaults={
                        'name': f'{group.name} - Level {level_num}',
                        'description': f'Level {level_num} of {group.name}',
                        'xp_reward': 10 + (level_num * 2),
                        'is_unlocked': level_num == 1,  # Only first level unlocked initially
                        'is_test_level': level_num % 10 == 0,  # Every 10th level is a test
                    }
                )
                
                if created:
                    self.stdout.write(f'  Created Level {level_num}')

                # Create 6 questions for each level
                question_types = [
                    'mcq', 'text_to_speech', 'fill_blank', 
                    'synonyms', 'antonyms', 'sentence_completion'
                ]
                
                for q_num in range(1, 7):
                    question_type = question_types[q_num - 1]
                    question, created = Question.objects.get_or_create(
                        level=level,
                        question_order=q_num,
                        defaults={
                            'question_text': f'Sample {question_type.replace("_", " ").title()} question for Level {level_num}',
                            'question_type': question_type,
                            'options': self._get_sample_options(question_type),
                            'correct_answer': self._get_sample_correct_answer(question_type),
                            'hint': f'Hint for {question_type} question',
                            'explanation': f'Explanation for {question_type} question',
                            'difficulty': min(5, (level_num // 10) + 1),
                            'xp_value': 2,
                        }
                    )
                    
                    if created:
                        self.stdout.write(f'    Created Question {q_num} ({question_type})')

            # Create plant growth stages for this group
            self._create_plant_growth_stages(group)

        self.stdout.write(
            self.style.SUCCESS('Successfully created all groups, levels, and questions!')
        )

    def _get_sample_options(self, question_type):
        """Get sample options for different question types"""
        if question_type == 'mcq':
            return {
                'A': 'Option A',
                'B': 'Option B', 
                'C': 'Option C',
                'D': 'Option D'
            }
        return None

    def _get_sample_correct_answer(self, question_type):
        """Get sample correct answer for different question types"""
        if question_type == 'mcq':
            return 'A'
        elif question_type == 'text_to_speech':
            return 'Hello World'
        elif question_type == 'fill_blank':
            return 'blank_word'
        elif question_type in ['synonyms', 'antonyms']:
            return 'correct_word'
        elif question_type == 'sentence_completion':
            return 'completed_sentence'
        return 'sample_answer'

    def _create_plant_growth_stages(self, group):
        """Create plant growth stages for a group"""
        # Create a plant type for this group first
        from plants.models import PlantType
        plant_type, created = PlantType.objects.get_or_create(
            name=f"{group.name} Plant",
            defaults={
                'description': f"Plant type for {group.name}",
                'max_stages': 5,
                'xp_per_stage': 100,
                'is_active': True,
            }
        )
        
        stages = [
            {'stage_name': 'seed', 'stage_order': 1},
            {'stage_name': 'sprout', 'stage_order': 2},
            {'stage_name': 'sapling', 'stage_order': 3},
            {'stage_name': 'tree', 'stage_order': 4},
            {'stage_name': 'flowering', 'stage_order': 5},
        ]

        for stage_data in stages:
            PlantStage.objects.get_or_create(
                plant_type=plant_type,
                stage_order=stage_data['stage_order'],
                defaults={
                    'stage_name': stage_data['stage_name'],
                }
            )
