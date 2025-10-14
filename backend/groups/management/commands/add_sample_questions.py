from django.core.management.base import BaseCommand
from groups.models import Group, Level, Question

class Command(BaseCommand):
    help = 'Add sample questions to levels'

    def handle(self, *args, **options):
        # Sample questions for Group 0, Level 1
        group_0 = Group.objects.get(group_number=0)
        level_1 = Level.objects.get(group=group_0, level_number=1)
        
        questions_data = [
            {
                'question_text': 'What is the capital of Pakistan?',
                'question_type': 'mcq',
                'options': ['Islamabad', 'Karachi', 'Lahore', 'Peshawar'],
                'correct_answer': 'Islamabad',
                'explanation': 'Islamabad is the capital city of Pakistan.',
                'difficulty': 1,
                'xp_value': 10,
                'question_order': 1
            },
            {
                'question_text': 'Pronounce the word "Hello"',
                'question_type': 'text_to_speech',
                'options': [],
                'correct_answer': 'Hello',
                'explanation': 'The word "Hello" is pronounced as "huh-loh".',
                'difficulty': 1,
                'xp_value': 15,
                'question_order': 2
            },
            {
                'question_text': 'Complete the sentence: "I ___ to school every day."',
                'question_type': 'fill_blank',
                'options': ['go', 'goes', 'going', 'went'],
                'correct_answer': 'go',
                'explanation': 'The correct answer is "go" because the subject "I" takes the base form of the verb.',
                'difficulty': 1,
                'xp_value': 10,
                'question_order': 3
            },
            {
                'question_text': 'What is a synonym for "happy"?',
                'question_type': 'synonyms',
                'options': ['sad', 'joyful', 'angry', 'tired'],
                'correct_answer': 'joyful',
                'explanation': 'Joyful means the same as happy - feeling or showing pleasure.',
                'difficulty': 1,
                'xp_value': 12,
                'question_order': 4
            },
            {
                'question_text': 'What is an antonym for "big"?',
                'question_type': 'antonyms',
                'options': ['large', 'small', 'huge', 'giant'],
                'correct_answer': 'small',
                'explanation': 'Small is the opposite of big.',
                'difficulty': 1,
                'xp_value': 12,
                'question_order': 5
            },
            {
                'question_text': 'Complete the sentence: "The sun ___ in the east."',
                'question_type': 'sentence_completion',
                'options': ['rises', 'rise', 'rising', 'rose'],
                'correct_answer': 'rises',
                'explanation': 'The sun rises in the east. This is a general truth, so we use present simple tense.',
                'difficulty': 1,
                'xp_value': 10,
                'question_order': 6
            }
        ]
        
        for q_data in questions_data:
            Question.objects.create(level=level_1, **q_data)
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully added {len(questions_data)} questions to {group_0.name}, Level {level_1.level_number}')
        )
