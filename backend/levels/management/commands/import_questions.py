"""
Django management command to import questions from CSV/JSON files
Usage: python manage.py import_questions --file questions.csv --level 1
"""

import csv
import json
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from levels.models import Level, Question


class Command(BaseCommand):
    help = 'Import questions from CSV or JSON file'

    def add_arguments(self, parser):
        parser.add_argument('--file', type=str, help='Path to the questions file (CSV or JSON)')
        parser.add_argument('--level', type=int, help='Level ID to assign questions to')
        parser.add_argument('--format', type=str, choices=['csv', 'json'], default='csv', help='File format')
        parser.add_argument('--dry-run', action='store_true', help='Show what would be imported without saving')

    def handle(self, *args, **options):
        file_path = options['file']
        level_id = options['level']
        file_format = options['format']
        dry_run = options['dry_run']

        if not file_path or not level_id:
            raise CommandError('Both --file and --level are required')

        try:
            level = Level.objects.get(id=level_id)
        except Level.DoesNotExist:
            raise CommandError(f'Level with ID {level_id} does not exist')

        self.stdout.write(f'Importing questions to Level: {level.name} (ID: {level.id})')

        if file_format == 'csv':
            questions_data = self.parse_csv(file_path)
        else:
            questions_data = self.parse_json(file_path)

        if dry_run:
            self.stdout.write(f'DRY RUN: Would import {len(questions_data)} questions')
            for i, q in enumerate(questions_data[:3]):  # Show first 3
                self.stdout.write(f'  {i+1}. {q["question_text"][:50]}...')
            return

        imported_count = 0
        with transaction.atomic():
            for question_data in questions_data:
                try:
                    question = Question.objects.create(
                        level=level,
                        question_order=question_data.get('question_order', 1),
                        question_type=question_data.get('question_type', 'mcq'),
                        question_text=question_data['question_text'],
                        options=question_data.get('options', ''),
                        correct_answer=question_data['correct_answer'],
                        hint=question_data.get('hint', ''),
                        explanation=question_data.get('explanation', ''),
                        difficulty=question_data.get('difficulty', 1),
                        xp_value=question_data.get('xp_value', 10),
                        time_limit_seconds=question_data.get('time_limit_seconds', 0),
                        audio_url=question_data.get('audio_url', ''),
                        image_url=question_data.get('image_url', ''),
                        is_active=True
                    )
                    imported_count += 1
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error importing question: {question_data.get("question_text", "Unknown")[:50]}... - {str(e)}')
                    )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully imported {imported_count} questions to Level: {level.name}')
        )

    def parse_csv(self, file_path):
        """Parse CSV file and return list of question dictionaries"""
        questions = []
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    # Clean and validate data
                    question_data = {
                        'question_order': int(row.get('question_order', 1)),
                        'question_type': row.get('question_type', 'mcq'),
                        'question_text': row['question_text'].strip(),
                        'options': row.get('options', '').strip(),
                        'correct_answer': row['correct_answer'].strip(),
                        'hint': row.get('hint', '').strip(),
                        'explanation': row.get('explanation', '').strip(),
                        'difficulty': int(row.get('difficulty', 1)),
                        'xp_value': int(row.get('xp_value', 10)),
                        'time_limit_seconds': int(row.get('time_limit_seconds', 0)),
                        'audio_url': row.get('audio_url', '').strip(),
                        'image_url': row.get('image_url', '').strip(),
                    }
                    questions.append(question_data)
        except FileNotFoundError:
            raise CommandError(f'File not found: {file_path}')
        except Exception as e:
            raise CommandError(f'Error reading CSV file: {str(e)}')

        return questions

    def parse_json(self, file_path):
        """Parse JSON file and return list of question dictionaries"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict) and 'questions' in data:
                    return data['questions']
                else:
                    raise CommandError('JSON file must contain a list of questions or an object with "questions" key')
        except FileNotFoundError:
            raise CommandError(f'File not found: {file_path}')
        except json.JSONDecodeError as e:
            raise CommandError(f'Invalid JSON file: {str(e)}')
        except Exception as e:
            raise CommandError(f'Error reading JSON file: {str(e)}')
