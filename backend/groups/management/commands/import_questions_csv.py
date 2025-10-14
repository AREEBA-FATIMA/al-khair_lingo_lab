import csv
import os
from django.core.management.base import BaseCommand
from groups.models import Group, Level, Question

class Command(BaseCommand):
    help = 'Import questions from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to CSV file')
        parser.add_argument('--group', type=int, help='Group number (0-7)')
        parser.add_argument('--level', type=int, help='Level number')
        parser.add_argument('--clear', action='store_true', help='Clear existing questions before import')

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        group_number = options.get('group')
        level_number = options.get('level')
        clear_existing = options.get('clear', False)

        if not os.path.exists(csv_file):
            self.stdout.write(self.style.ERROR(f'CSV file not found: {csv_file}'))
            return

        try:
            with open(csv_file, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                
                for row in reader:
                    # Get group and level
                    if group_number is not None:
                        group = Group.objects.get(group_number=group_number)
                    else:
                        group = Group.objects.get(group_number=int(row['group_number']))
                    
                    if level_number is not None:
                        level = Level.objects.get(group=group, level_number=level_number)
                    else:
                        level = Level.objects.get(group=group, level_number=int(row['level_number']))
                    
                    # Clear existing questions if requested
                    if clear_existing:
                        Question.objects.filter(level=level).delete()
                    
                    # Parse options (comma separated)
                    options_list = []
                    if row.get('options'):
                        options_list = [opt.strip() for opt in row['options'].split(',')]
                    
                    # Create question
                    question = Question.objects.create(
                        level=level,
                        question_text=row['question_text'],
                        question_type=row['question_type'],
                        options=options_list,
                        correct_answer=row['correct_answer'],
                        explanation=row.get('explanation', ''),
                        difficulty=row.get('difficulty', 'easy'),
                        xp_value=int(row.get('xp_value', 10)),
                        question_order=int(row.get('question_order', 1))
                    )
                    
                    self.stdout.write(f'Created question: {question.question_text[:50]}...')
            
            self.stdout.write(self.style.SUCCESS('Successfully imported questions from CSV!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing questions: {str(e)}'))
