from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from groups.models import Group, Level, Question, PlantGrowthStage
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
            PlantGrowthStage.objects.all().delete()

        self.stdout.write('Creating groups and levels...')
        
        # Group data with different level counts
        groups_data = [
            {
                'group_number': 0,
                'name': 'Basic English (Shuruati Angrezi)',
                'description': 'Basic level for complete beginners',
                'level_count': 20,
                'plant_type': 'basic_seed',
                'unlock_condition': 'complete_previous'
            },
            {
                'group_number': 1,
                'name': 'Elementary English (Buniyadi Angrezi)',
                'description': 'Elementary level English learning',
                'level_count': 50,
                'plant_type': 'flower_seed',
                'unlock_condition': 'test_100_percent'
            },
            {
                'group_number': 2,
                'name': 'Pre-Intermediate (Pehle Darje Ka)',
                'description': 'Pre-intermediate level English',
                'level_count': 50,
                'plant_type': 'herb_seed',
                'unlock_condition': 'test_100_percent'
            },
            {
                'group_number': 3,
                'name': 'Intermediate (Darmiyani Darje)',
                'description': 'Intermediate level English',
                'level_count': 50,
                'plant_type': 'vegetable_seed',
                'unlock_condition': 'test_100_percent'
            },
            {
                'group_number': 4,
                'name': 'Upper-Intermediate (Ooncha Darje)',
                'description': 'Upper-intermediate level English',
                'level_count': 50,
                'plant_type': 'fruit_seed',
                'unlock_condition': 'test_100_percent'
            },
            {
                'group_number': 5,
                'name': 'Advanced (Aala Darje)',
                'description': 'Advanced level English',
                'level_count': 50,
                'plant_type': 'tree_seed',
                'unlock_condition': 'test_100_percent'
            },
            {
                'group_number': 6,
                'name': 'Expert (Mahir)',
                'description': 'Expert level English',
                'level_count': 50,
                'plant_type': 'exotic_seed',
                'unlock_condition': 'test_100_percent'
            },
            {
                'group_number': 7,
                'name': 'Master (Ustaad)',
                'description': 'Master level English',
                'level_count': 50,
                'plant_type': 'legendary_seed',
                'unlock_condition': 'test_100_percent'
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

            # Create levels for this group
            level_count = group.get_level_count()
            for level_num in range(1, level_count + 1):
                level, created = Level.objects.get_or_create(
                    group=group,
                    level_number=level_num,
                    defaults={
                        'name': f'Level {level_num}',
                        'description': f'Level {level_num} of {group.name}',
                        'questions_count': 6,
                        'xp_reward': 10 + (level_num * 2),
                        'is_unlocked': level_num == 1,  # Only first level unlocked initially
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
        stages = [
            {'stage_name': 'seed', 'stage_order': 1, 'level_range_start': 1, 'level_range_end': 4},
            {'stage_name': 'sprout', 'stage_order': 2, 'level_range_start': 5, 'level_range_end': 8},
            {'stage_name': 'sapling', 'stage_order': 3, 'level_range_start': 9, 'level_range_end': 12},
            {'stage_name': 'tree', 'stage_order': 4, 'level_range_start': 13, 'level_range_end': 16},
            {'stage_name': 'fruit_tree', 'stage_order': 5, 'level_range_start': 17, 'level_range_end': 20},
        ]
        
        # Adjust ranges based on group level count
        level_count = group.get_level_count()
        if level_count == 50:
            # For 50-level groups, adjust ranges
            stages = [
                {'stage_name': 'seed', 'stage_order': 1, 'level_range_start': 1, 'level_range_end': 10},
                {'stage_name': 'sprout', 'stage_order': 2, 'level_range_start': 11, 'level_range_end': 20},
                {'stage_name': 'sapling', 'stage_order': 3, 'level_range_start': 21, 'level_range_end': 30},
                {'stage_name': 'tree', 'stage_order': 4, 'level_range_start': 31, 'level_range_end': 40},
                {'stage_name': 'fruit_tree', 'stage_order': 5, 'level_range_start': 41, 'level_range_end': 50},
            ]

        for stage_data in stages:
            PlantGrowthStage.objects.get_or_create(
                group=group,
                stage_order=stage_data['stage_order'],
                defaults={
                    'stage_name': stage_data['stage_name'],
                    'level_range_start': stage_data['level_range_start'],
                    'level_range_end': stage_data['level_range_end'],
                    'description': f'{stage_data["stage_name"].title()} stage for {group.name}',
                    'xp_required': stage_data['level_range_start'] * 10,
                }
            )
