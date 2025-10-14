from django.core.management.base import BaseCommand
from groups.models import Group, Level, Question
import random

class Command(BaseCommand):
    help = 'Generate bulk questions for all levels'

    def add_arguments(self, parser):
        parser.add_argument('--group', type=int, help='Specific group number (0-7)')
        parser.add_argument('--level', type=int, help='Specific level number')
        parser.add_argument('--count', type=int, default=6, help='Number of questions per level')
        parser.add_argument('--clear', action='store_true', help='Clear existing questions before generating')

    def handle(self, *args, **options):
        group_number = options.get('group')
        level_number = options.get('level')
        count = options.get('count', 6)
        clear_existing = options.get('clear', False)

        if group_number is not None:
            groups = [Group.objects.get(group_number=group_number)]
        else:
            groups = Group.objects.all()

        total_questions = 0

        for group in groups:
            self.stdout.write(f'Generating questions for {group.name}...')
            
            if level_number is not None:
                levels = [Level.objects.get(group=group, level_number=level_number)]
            else:
                levels = Level.objects.filter(group=group)

            for level in levels:
                if clear_existing:
                    Question.objects.filter(level=level).delete()
                
                questions_created = self.generate_questions_for_level(level, count)
                total_questions += questions_created
                
                self.stdout.write(f'  Level {level.level_number}: {questions_created} questions created')

        self.stdout.write(self.style.SUCCESS(f'Successfully generated {total_questions} questions!'))

    def generate_questions_for_level(self, level, count):
        """Generate questions for a specific level"""
        questions_created = 0
        
        # Question templates based on difficulty
        difficulty = self.get_difficulty_for_level(level)
        
        # Generate different types of questions
        question_types = ['mcq', 'text_to_speech', 'fill_blank', 'synonyms', 'antonyms', 'sentence_completion']
        
        for i in range(count):
            question_type = question_types[i % len(question_types)]
            
            question_data = self.generate_question_data(level, question_type, difficulty, i + 1)
            
            if question_data:
                Question.objects.create(level=level, **question_data)
                questions_created += 1
        
        return questions_created

    def get_difficulty_for_level(self, level):
        """Determine difficulty based on group and level number"""
        if level.group.group_number == 0:
            return 'easy'
        elif level.group.group_number <= 3:
            return 'medium'
        else:
            return 'hard'

    def generate_question_data(self, level, question_type, difficulty, order):
        """Generate question data based on type and difficulty"""
        
        if question_type == 'mcq':
            return self.generate_mcq_question(level, difficulty, order)
        elif question_type == 'text_to_speech':
            return self.generate_pronunciation_question(level, difficulty, order)
        elif question_type == 'fill_blank':
            return self.generate_fill_blank_question(level, difficulty, order)
        elif question_type == 'synonyms':
            return self.generate_synonym_question(level, difficulty, order)
        elif question_type == 'antonyms':
            return self.generate_antonym_question(level, difficulty, order)
        elif question_type == 'sentence_completion':
            return self.generate_sentence_completion_question(level, difficulty, order)
        
        return None

    def generate_mcq_question(self, level, difficulty, order):
        """Generate MCQ question"""
        questions = {
            'easy': [
                {
                    'text': 'What is the capital of Pakistan?',
                    'options': ['Islamabad', 'Karachi', 'Lahore', 'Peshawar'],
                    'correct': 'Islamabad',
                    'explanation': 'Islamabad is the capital city of Pakistan.'
                },
                {
                    'text': 'Which color is not a primary color?',
                    'options': ['Red', 'Blue', 'Green', 'Yellow'],
                    'correct': 'Green',
                    'explanation': 'Primary colors are Red, Blue, and Yellow. Green is a secondary color.'
                }
            ],
            'medium': [
                {
                    'text': 'What is the meaning of "serendipity"?',
                    'options': ['Bad luck', 'Good fortune', 'Coincidence', 'Misfortune'],
                    'correct': 'Good fortune',
                    'explanation': 'Serendipity means the occurrence of happy or beneficial events by chance.'
                }
            ],
            'hard': [
                {
                    'text': 'What is the meaning of "ubiquitous"?',
                    'options': ['Rare', 'Everywhere', 'Expensive', 'Difficult'],
                    'correct': 'Everywhere',
                    'explanation': 'Ubiquitous means present, appearing, or found everywhere.'
                }
            ]
        }
        
        q = random.choice(questions[difficulty])
        return {
            'question_text': q['text'],
            'question_type': 'mcq',
            'options': q['options'],
            'correct_answer': q['correct'],
            'explanation': q['explanation'],
            'difficulty': difficulty,
            'xp_value': self.get_xp_value(difficulty),
            'question_order': order
        }

    def generate_pronunciation_question(self, level, difficulty, order):
        """Generate pronunciation question"""
        words = {
            'easy': ['Hello', 'World', 'Good', 'Morning', 'Thank'],
            'medium': ['Beautiful', 'Important', 'Different', 'Interesting', 'Wonderful'],
            'hard': ['Entrepreneur', 'Pronunciation', 'Consciousness', 'Sophisticated', 'Extraordinary']
        }
        
        word = random.choice(words[difficulty])
        return {
            'question_text': f'Pronounce the word "{word}"',
            'question_type': 'text_to_speech',
            'options': [],
            'correct_answer': word,
            'explanation': f'The word "{word}" should be pronounced clearly and correctly.',
            'difficulty': difficulty,
            'xp_value': self.get_xp_value(difficulty) + 5,
            'question_order': order
        }

    def generate_fill_blank_question(self, level, difficulty, order):
        """Generate fill-in-blank question"""
        sentences = {
            'easy': [
                {
                    'text': 'I ___ to school every day.',
                    'options': ['go', 'goes', 'going', 'went'],
                    'correct': 'go',
                    'explanation': 'The correct answer is "go" because the subject "I" takes the base form of the verb.'
                }
            ],
            'medium': [
                {
                    'text': 'She has been ___ for three hours.',
                    'options': ['studying', 'studied', 'study', 'studies'],
                    'correct': 'studying',
                    'explanation': 'The correct answer is "studying" because it uses present perfect continuous tense.'
                }
            ],
            'hard': [
                {
                    'text': 'The project was ___ by the team.',
                    'options': ['completed', 'completing', 'complete', 'completes'],
                    'correct': 'completed',
                    'explanation': 'The correct answer is "completed" because it uses past tense passive voice.'
                }
            ]
        }
        
        s = random.choice(sentences[difficulty])
        return {
            'question_text': f'Complete: "{s["text"]}"',
            'question_type': 'fill_blank',
            'options': s['options'],
            'correct_answer': s['correct'],
            'explanation': s['explanation'],
            'difficulty': difficulty,
            'xp_value': self.get_xp_value(difficulty),
            'question_order': order
        }

    def generate_synonym_question(self, level, difficulty, order):
        """Generate synonym question"""
        synonyms = {
            'easy': [
                {
                    'word': 'happy',
                    'options': ['sad', 'joyful', 'angry', 'tired'],
                    'correct': 'joyful',
                    'explanation': 'Joyful means the same as happy - feeling or showing pleasure.'
                }
            ],
            'medium': [
                {
                    'word': 'intelligent',
                    'options': ['stupid', 'clever', 'lazy', 'slow'],
                    'correct': 'clever',
                    'explanation': 'Clever means the same as intelligent - having or showing quick intelligence.'
                }
            ],
            'hard': [
                {
                    'word': 'meticulous',
                    'options': ['careless', 'thorough', 'quick', 'simple'],
                    'correct': 'thorough',
                    'explanation': 'Thorough means the same as meticulous - showing great attention to detail.'
                }
            ]
        }
        
        s = random.choice(synonyms[difficulty])
        return {
            'question_text': f'What is a synonym for "{s["word"]}"?',
            'question_type': 'synonyms',
            'options': s['options'],
            'correct_answer': s['correct'],
            'explanation': s['explanation'],
            'difficulty': difficulty,
            'xp_value': self.get_xp_value(difficulty),
            'question_order': order
        }

    def generate_antonym_question(self, level, difficulty, order):
        """Generate antonym question"""
        antonyms = {
            'easy': [
                {
                    'word': 'big',
                    'options': ['large', 'small', 'huge', 'giant'],
                    'correct': 'small',
                    'explanation': 'Small is the opposite of big.'
                }
            ],
            'medium': [
                {
                    'word': 'success',
                    'options': ['victory', 'failure', 'achievement', 'accomplishment'],
                    'correct': 'failure',
                    'explanation': 'Failure is the opposite of success.'
                }
            ],
            'hard': [
                {
                    'word': 'benevolent',
                    'options': ['kind', 'cruel', 'generous', 'helpful'],
                    'correct': 'cruel',
                    'explanation': 'Cruel is the opposite of benevolent (kind and generous).'
                }
            ]
        }
        
        a = random.choice(antonyms[difficulty])
        return {
            'question_text': f'What is an antonym for "{a["word"]}"?',
            'question_type': 'antonyms',
            'options': a['options'],
            'correct_answer': a['correct'],
            'explanation': a['explanation'],
            'difficulty': difficulty,
            'xp_value': self.get_xp_value(difficulty),
            'question_order': order
        }

    def generate_sentence_completion_question(self, level, difficulty, order):
        """Generate sentence completion question"""
        sentences = {
            'easy': [
                {
                    'text': 'The sun ___ in the east.',
                    'options': ['rises', 'rise', 'rising', 'rose'],
                    'correct': 'rises',
                    'explanation': 'The sun rises in the east. This is a general truth, so we use present simple tense.'
                }
            ],
            'medium': [
                {
                    'text': 'If I ___ you, I would help.',
                    'options': ['am', 'was', 'were', 'be'],
                    'correct': 'were',
                    'explanation': 'The correct answer is "were" because it uses second conditional (if + past simple).'
                }
            ],
            'hard': [
                {
                    'text': 'The proposal was ___ by the committee.',
                    'options': ['accepted', 'accepting', 'accept', 'accepts'],
                    'correct': 'accepted',
                    'explanation': 'The correct answer is "accepted" because it uses past tense passive voice.'
                }
            ]
        }
        
        s = random.choice(sentences[difficulty])
        return {
            'question_text': f'Complete: "{s["text"]}"',
            'question_type': 'sentence_completion',
            'options': s['options'],
            'correct_answer': s['correct'],
            'explanation': s['explanation'],
            'difficulty': difficulty,
            'xp_value': self.get_xp_value(difficulty),
            'question_order': order
        }

    def get_xp_value(self, difficulty):
        """Get XP value based on difficulty"""
        return {'easy': 10, 'medium': 15, 'hard': 20}[difficulty]
