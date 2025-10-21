"""
Bulk Content Import/Export Management Commands
Provides tools for content creators to manage large amounts of content efficiently
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
import csv
import json
import os
from pathlib import Path

# Import models
from groups.models import Group
from levels.models import Level, Question
from plants.models import PlantType, PlantStage


class Command(BaseCommand):
    help = 'Bulk import/export content for the learning platform'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            choices=['import', 'export', 'validate'],
            help='Action to perform: import, export, or validate content'
        )
        parser.add_argument(
            '--file',
            type=str,
            help='File path for import/export'
        )
        parser.add_argument(
            '--type',
            choices=['questions', 'levels', 'groups', 'plants'],
            help='Type of content to process'
        )
        parser.add_argument(
            '--format',
            choices=['csv', 'json'],
            default='csv',
            help='File format (default: csv)'
        )
        parser.add_argument(
            '--group-id',
            type=int,
            help='Group ID for level/question operations'
        )
        parser.add_argument(
            '--validate-only',
            action='store_true',
            help='Only validate content without importing'
        )

    def handle(self, *args, **options):
        action = options['action']
        file_path = options['file']
        content_type = options['type']
        file_format = options['format']
        group_id = options['group_id']
        validate_only = options['validate_only']

        if action == 'import':
            self.import_content(file_path, content_type, file_format, group_id, validate_only)
        elif action == 'export':
            self.export_content(file_path, content_type, file_format, group_id)
        elif action == 'validate':
            self.validate_content(file_path, content_type, file_format)

    def import_content(self, file_path, content_type, file_format, group_id, validate_only):
        """Import content from file"""
        if not file_path or not os.path.exists(file_path):
            raise CommandError(f"File not found: {file_path}")

        self.stdout.write(f"Importing {content_type} from {file_path}...")

        if content_type == 'questions':
            self.import_questions(file_path, file_format, group_id, validate_only)
        elif content_type == 'levels':
            self.import_levels(file_path, file_format, group_id, validate_only)
        elif content_type == 'groups':
            self.import_groups(file_path, file_format, validate_only)
        elif content_type == 'plants':
            self.import_plants(file_path, file_format, validate_only)

    def import_questions(self, file_path, file_format, group_id, validate_only):
        """Import questions from file"""
        if not group_id:
            raise CommandError("Group ID is required for question import")

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            raise CommandError(f"Group with ID {group_id} not found")

        questions_data = self.read_file(file_path, file_format)
        
        if validate_only:
            self.validate_questions_data(questions_data)
            self.stdout.write(self.style.SUCCESS(f"Validation successful: {len(questions_data)} questions"))
            return

        created_count = 0
        updated_count = 0
        errors = []

        with transaction.atomic():
            for i, question_data in enumerate(questions_data):
                try:
                    # Get or create level
                    level_number = question_data.get('level_number')
                    if not level_number:
                        errors.append(f"Row {i+1}: Missing level_number")
                        continue

                    level, created = Level.objects.get_or_create(
                        group=group,
                        level_number=level_number,
                        defaults={
                            'name': f"Level {level_number}",
                            'description': f"Level {level_number} of {group.name}",
                            'difficulty': question_data.get('difficulty', 1),
                            'xp_reward': question_data.get('xp_reward', 10),
                            'is_active': True
                        }
                    )

                    # Create question
                    question, created = Question.objects.get_or_create(
                        level=level,
                        question_order=question_data.get('question_order'),
                        defaults={
                            'question_text': question_data.get('question_text'),
                            'question_type': question_data.get('question_type', 'mcq'),
                            'options': json.loads(question_data.get('options', '[]')),
                            'correct_answer': question_data.get('correct_answer'),
                            'hint': question_data.get('hint', ''),
                            'explanation': question_data.get('explanation', ''),
                            'difficulty': question_data.get('difficulty', 1),
                            'xp_value': question_data.get('xp_value', 2),
                            'time_limit_seconds': question_data.get('time_limit_seconds', 60),
                            'is_active': True
                        }
                    )

                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

                except Exception as e:
                    errors.append(f"Row {i+1}: {str(e)}")

        self.stdout.write(self.style.SUCCESS(
            f"Import completed: {created_count} created, {updated_count} updated"
        ))
        
        if errors:
            self.stdout.write(self.style.WARNING(f"Errors: {len(errors)}"))
            for error in errors[:10]:  # Show first 10 errors
                self.stdout.write(f"  - {error}")

    def import_levels(self, file_path, file_format, group_id, validate_only):
        """Import levels from file"""
        if not group_id:
            raise CommandError("Group ID is required for level import")

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            raise CommandError(f"Group with ID {group_id} not found")

        levels_data = self.read_file(file_path, file_format)
        
        if validate_only:
            self.validate_levels_data(levels_data)
            self.stdout.write(self.style.SUCCESS(f"Validation successful: {len(levels_data)} levels"))
            return

        created_count = 0
        updated_count = 0
        errors = []

        with transaction.atomic():
            for i, level_data in enumerate(levels_data):
                try:
                    level, created = Level.objects.get_or_create(
                        group=group,
                        level_number=level_data.get('level_number'),
                        defaults={
                            'name': level_data.get('name', f"Level {level_data.get('level_number')}"),
                            'description': level_data.get('description', ''),
                            'difficulty': level_data.get('difficulty', 1),
                            'xp_reward': level_data.get('xp_reward', 10),
                            'is_test_level': level_data.get('is_test_level', False),
                            'test_questions_count': level_data.get('test_questions_count', 0),
                            'test_pass_percentage': level_data.get('test_pass_percentage', 80),
                            'test_time_limit_minutes': level_data.get('test_time_limit_minutes', 30),
                            'is_active': True
                        }
                    )

                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

                except Exception as e:
                    errors.append(f"Row {i+1}: {str(e)}")

        self.stdout.write(self.style.SUCCESS(
            f"Import completed: {created_count} created, {updated_count} updated"
        ))

    def import_groups(self, file_path, file_format, validate_only):
        """Import groups from file"""
        groups_data = self.read_file(file_path, file_format)
        
        if validate_only:
            self.validate_groups_data(groups_data)
            self.stdout.write(self.style.SUCCESS(f"Validation successful: {len(groups_data)} groups"))
            return

        created_count = 0
        updated_count = 0
        errors = []

        with transaction.atomic():
            for i, group_data in enumerate(groups_data):
                try:
                    group, created = Group.objects.get_or_create(
                        group_number=group_data.get('group_number'),
                        defaults={
                            'name': group_data.get('name'),
                            'description': group_data.get('description', ''),
                            'difficulty': group_data.get('difficulty', 1),
                            'is_active': True
                        }
                    )

                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

                except Exception as e:
                    errors.append(f"Row {i+1}: {str(e)}")

        self.stdout.write(self.style.SUCCESS(
            f"Import completed: {created_count} created, {updated_count} updated"
        ))

    def import_plants(self, file_path, file_format, validate_only):
        """Import plant types and stages from file"""
        plants_data = self.read_file(file_path, file_format)
        
        if validate_only:
            self.validate_plants_data(plants_data)
            self.stdout.write(self.style.SUCCESS(f"Validation successful: {len(plants_data)} plant entries"))
            return

        created_count = 0
        updated_count = 0
        errors = []

        with transaction.atomic():
            for i, plant_data in enumerate(plants_data):
                try:
                    if plant_data.get('type') == 'plant_type':
                        plant_type, created = PlantType.objects.get_or_create(
                            name=plant_data.get('name'),
                            defaults={
                                'description': plant_data.get('description', ''),
                                'max_stages': plant_data.get('max_stages', 5),
                                'xp_per_stage': plant_data.get('xp_per_stage', 100),
                                'has_flowers': plant_data.get('has_flowers', False),
                                'has_fruits': plant_data.get('has_fruits', False),
                                'seasonal_changes': plant_data.get('seasonal_changes', False),
                                'is_active': True
                            }
                        )
                        
                        if created:
                            created_count += 1
                        else:
                            updated_count += 1
                    
                    elif plant_data.get('type') == 'plant_stage':
                        try:
                            plant_type = PlantType.objects.get(name=plant_data.get('plant_type_name'))
                        except PlantType.DoesNotExist:
                            errors.append(f"Row {i+1}: Plant type '{plant_data.get('plant_type_name')}' not found")
                            continue
                        
                        plant_stage, created = PlantStage.objects.get_or_create(
                            plant_type=plant_type,
                            stage_order=plant_data.get('stage_order'),
                            defaults={
                                'stage_name': plant_data.get('stage_name'),
                                'description': plant_data.get('description', ''),
                                'xp_required': plant_data.get('xp_required', 0),
                                'levels_required': plant_data.get('levels_required', 0),
                                'xp_reward': plant_data.get('xp_reward', 0),
                                'badge_name': plant_data.get('badge_name', ''),
                                'is_active': True
                            }
                        )
                        
                        if created:
                            created_count += 1
                        else:
                            updated_count += 1

                except Exception as e:
                    errors.append(f"Row {i+1}: {str(e)}")

        self.stdout.write(self.style.SUCCESS(
            f"Import completed: {created_count} created, {updated_count} updated"
        ))

    def export_content(self, file_path, content_type, file_format, group_id):
        """Export content to file"""
        if not file_path:
            file_path = f"export_{content_type}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{file_format}"

        self.stdout.write(f"Exporting {content_type} to {file_path}...")

        if content_type == 'questions':
            self.export_questions(file_path, file_format, group_id)
        elif content_type == 'levels':
            self.export_levels(file_path, file_format, group_id)
        elif content_type == 'groups':
            self.export_groups(file_path, file_format)
        elif content_type == 'plants':
            self.export_plants(file_path, file_format)

        self.stdout.write(self.style.SUCCESS(f"Export completed: {file_path}"))

    def export_questions(self, file_path, file_format, group_id):
        """Export questions to file"""
        if group_id:
            questions = Question.objects.filter(level__group_id=group_id, is_active=True)
        else:
            questions = Question.objects.filter(is_active=True)

        questions_data = []
        for question in questions:
            questions_data.append({
                'group_id': question.level.group.id,
                'group_name': question.level.group.name,
                'level_number': question.level.level_number,
                'level_name': question.level.name,
                'question_order': question.question_order,
                'question_text': question.question_text,
                'question_type': question.question_type,
                'options': json.dumps(question.options),
                'correct_answer': question.correct_answer,
                'hint': question.hint,
                'explanation': question.explanation,
                'difficulty': question.difficulty,
                'xp_value': question.xp_value,
                'time_limit_seconds': question.time_limit_seconds
            })

        self.write_file(file_path, file_format, questions_data)

    def export_levels(self, file_path, file_format, group_id):
        """Export levels to file"""
        if group_id:
            levels = Level.objects.filter(group_id=group_id, is_active=True)
        else:
            levels = Level.objects.filter(is_active=True)

        levels_data = []
        for level in levels:
            levels_data.append({
                'group_id': level.group.id,
                'group_name': level.group.name,
                'level_number': level.level_number,
                'name': level.name,
                'description': level.description,
                'difficulty': level.difficulty,
                'xp_reward': level.xp_reward,
                'is_test_level': level.is_test_level,
                'test_questions_count': level.test_questions_count,
                'test_pass_percentage': level.test_pass_percentage,
                'test_time_limit_minutes': level.test_time_limit_minutes,
                'questions_count': level.questions.count()
            })

        self.write_file(file_path, file_format, levels_data)

    def export_groups(self, file_path, file_format):
        """Export groups to file"""
        groups = Group.objects.filter(is_active=True)

        groups_data = []
        for group in groups:
            groups_data.append({
                'group_number': group.group_number,
                'name': group.name,
                'description': group.description,
                'difficulty': group.difficulty,
                'levels_count': group.levels.count(),
                'total_questions': sum(level.questions.count() for level in group.levels.all())
            })

        self.write_file(file_path, file_format, groups_data)

    def export_plants(self, file_path, file_format):
        """Export plant types and stages to file"""
        plants_data = []

        # Export plant types
        for plant_type in PlantType.objects.filter(is_active=True):
            plants_data.append({
                'type': 'plant_type',
                'name': plant_type.name,
                'description': plant_type.description,
                'max_stages': plant_type.max_stages,
                'xp_per_stage': plant_type.xp_per_stage,
                'has_flowers': plant_type.has_flowers,
                'has_fruits': plant_type.has_fruits,
                'seasonal_changes': plant_type.seasonal_changes
            })

        # Export plant stages
        for plant_stage in PlantStage.objects.filter(is_active=True):
            plants_data.append({
                'type': 'plant_stage',
                'plant_type_name': plant_stage.plant_type.name,
                'stage_order': plant_stage.stage_order,
                'stage_name': plant_stage.stage_name,
                'description': plant_stage.description,
                'xp_required': plant_stage.xp_required,
                'levels_required': plant_stage.levels_required,
                'xp_reward': plant_stage.xp_reward,
                'badge_name': plant_stage.badge_name
            })

        self.write_file(file_path, file_format, plants_data)

    def validate_content(self, file_path, content_type, file_format):
        """Validate content without importing"""
        self.stdout.write(f"Validating {content_type} in {file_path}...")
        self.import_content(file_path, content_type, file_format, None, validate_only=True)

    def read_file(self, file_path, file_format):
        """Read data from file"""
        if file_format == 'csv':
            with open(file_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                return list(reader)
        elif file_format == 'json':
            with open(file_path, 'r', encoding='utf-8') as file:
                return json.load(file)

    def write_file(self, file_path, file_format, data):
        """Write data to file"""
        if file_format == 'csv':
            if data:
                with open(file_path, 'w', newline='', encoding='utf-8') as file:
                    writer = csv.DictWriter(file, fieldnames=data[0].keys())
                    writer.writeheader()
                    writer.writerows(data)
        elif file_format == 'json':
            with open(file_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2, ensure_ascii=False)

    def validate_questions_data(self, questions_data):
        """Validate questions data"""
        required_fields = ['level_number', 'question_text', 'question_type', 'correct_answer']
        
        for i, question in enumerate(questions_data):
            for field in required_fields:
                if field not in question or not question[field]:
                    raise CommandError(f"Row {i+1}: Missing required field '{field}'")

    def validate_levels_data(self, levels_data):
        """Validate levels data"""
        required_fields = ['level_number', 'name']
        
        for i, level in enumerate(levels_data):
            for field in required_fields:
                if field not in level or not level[field]:
                    raise CommandError(f"Row {i+1}: Missing required field '{field}'")

    def validate_groups_data(self, groups_data):
        """Validate groups data"""
        required_fields = ['group_number', 'name']
        
        for i, group in enumerate(groups_data):
            for field in required_fields:
                if field not in group or not group[field]:
                    raise CommandError(f"Row {i+1}: Missing required field '{field}'")

    def validate_plants_data(self, plants_data):
        """Validate plants data"""
        for i, plant in enumerate(plants_data):
            if plant.get('type') == 'plant_type':
                required_fields = ['name']
            elif plant.get('type') == 'plant_stage':
                required_fields = ['plant_type_name', 'stage_order', 'stage_name']
            else:
                raise CommandError(f"Row {i+1}: Invalid type '{plant.get('type')}'")
            
            for field in required_fields:
                if field not in plant or not plant[field]:
                    raise CommandError(f"Row {i+1}: Missing required field '{field}'")
