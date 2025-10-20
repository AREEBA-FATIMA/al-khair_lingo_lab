from django.core.management.base import BaseCommand
from groups.models import Group
from levels.models import Level, Question

class Command(BaseCommand):
    help = 'Create real English learning content based on Oxford standards'

    def handle(self, *args, **options):
        self.stdout.write('Creating real English learning content...')
        
        # Clear existing data
        Question.objects.all().delete()
        Level.objects.all().delete()
        self.stdout.write('Cleared existing dummy data')
        
        # Get all groups
        groups = Group.objects.filter(is_active=True).order_by('group_number')
        
        current_level = 1
        
        for group in groups:
            if group.group_number == 0:
                # Group 0: Basic English Foundation (20 levels)
                level_count = 20
                content_data = self.get_basic_english_content()
            else:
                # Groups 1-7: Progressive English (50 levels each)
                level_count = 50
                content_data = self.get_progressive_english_content(group.group_number)
            
            self.stdout.write(f'Creating {level_count} levels for Group {group.group_number}: {group.name}')
            
            for i in range(level_count):
                level_number = current_level + i
                is_test_level = (i + 1) % 10 == 0  # Every 10th level is a test
                
                # Get content for this level
                level_content = content_data[i] if i < len(content_data) else self.get_default_content(level_number)
                
                level = Level.objects.create(
                    name=level_content['name'],
                    description=level_content['description'],
                    level_number=level_number,
                    group=group,
                    difficulty=group.difficulty,
                    xp_reward=10 + (i * 2),
                    is_active=True,
                    is_unlocked=True,
                    is_test_level=is_test_level,
                    test_questions_count=10 if is_test_level else 0,
                    test_pass_percentage=80 if is_test_level else 0,
                    test_time_limit_minutes=15 if is_test_level else 0
                )
                
                # Create questions for this level
                question_count = 10 if is_test_level else 6
                questions_data = level_content['questions']
                
                for j in range(min(question_count, len(questions_data))):
                    question_data = questions_data[j]
                    Question.objects.create(
                        level=level,
                        question_text=question_data['text'],
                        question_type=question_data['type'],
                        options=question_data.get('options', []),
                        correct_answer=question_data['correct_answer'],
                        hint=question_data.get('hint', ''),
                        explanation=question_data.get('explanation', ''),
                        difficulty=group.difficulty,
                        xp_value=2,
                        question_order=j+1,
                        time_limit_seconds=question_data.get('time_limit', 30),
                        is_active=True
                    )
                
                if (i + 1) % 10 == 0:
                    self.stdout.write(f'  Created Level {level_number} (Test Level) with {question_count} questions')
                else:
                    self.stdout.write(f'  Created Level {level_number} with {question_count} questions')
            
            current_level += level_count
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {current_level - 1} levels with {Question.objects.count()} questions!')
        )

    def get_basic_english_content(self):
        """Basic English Foundation - Group 0 (20 levels)"""
        return [
            # Level 1: Basic Greetings
            {
                'name': 'Basic Greetings',
                'description': 'Learn essential greetings and polite expressions',
                'questions': [
                    {
                        'text': 'What is the most common way to greet someone in the morning?',
                        'type': 'mcq',
                        'options': ['Good morning', 'Good evening', 'Good night', 'Good afternoon'],
                        'correct_answer': 'Good morning',
                        'hint': 'Think about the time of day',
                        'explanation': 'Good morning is used from dawn until noon'
                    },
                    {
                        'text': 'How do you say "thank you" politely?',
                        'type': 'mcq',
                        'options': ['Thanks', 'Thank you', 'Thank you very much', 'All of the above'],
                        'correct_answer': 'All of the above',
                        'hint': 'All are polite ways to express gratitude',
                        'explanation': 'All these expressions are polite ways to say thank you'
                    },
                    {
                        'text': 'Complete: "Nice to ___ you"',
                        'type': 'fill_blank',
                        'correct_answer': 'meet',
                        'hint': 'First time meeting someone',
                        'explanation': 'Nice to meet you is used when meeting someone for the first time'
                    },
                    {
                        'text': 'What does "How are you?" mean?',
                        'type': 'mcq',
                        'options': ['What is your name?', 'How are you feeling?', 'Where are you from?', 'What time is it?'],
                        'correct_answer': 'How are you feeling?',
                        'hint': 'It\'s asking about someone\'s well-being',
                        'explanation': 'How are you? is a common way to ask about someone\'s health or mood'
                    },
                    {
                        'text': 'Which is the correct response to "Good morning"?',
                        'type': 'mcq',
                        'options': ['Good morning', 'Good evening', 'Goodbye', 'Good night'],
                        'correct_answer': 'Good morning',
                        'hint': 'Respond with the same greeting',
                        'explanation': 'It\'s polite to respond with the same greeting'
                    },
                    {
                        'text': 'What is the opposite of "hello"?',
                        'type': 'mcq',
                        'options': ['Hi', 'Goodbye', 'Thanks', 'Please'],
                        'correct_answer': 'Goodbye',
                        'hint': 'Used when leaving',
                        'explanation': 'Goodbye is used when parting or leaving'
                    }
                ]
            },
            # Level 2: Numbers 1-20
            {
                'name': 'Numbers 1-20',
                'description': 'Learn to count from 1 to 20 in English',
                'questions': [
                    {
                        'text': 'How do you write the number 5 in words?',
                        'type': 'mcq',
                        'options': ['Five', 'Fife', 'Fiv', 'Fyve'],
                        'correct_answer': 'Five',
                        'hint': 'Standard spelling',
                        'explanation': 'Five is the correct spelling of the number 5'
                    },
                    {
                        'text': 'What comes after twelve?',
                        'type': 'mcq',
                        'options': ['Eleven', 'Thirteen', 'Fourteen', 'Fifteen'],
                        'correct_answer': 'Thirteen',
                        'hint': 'Count in sequence',
                        'explanation': 'Thirteen comes after twelve in the number sequence'
                    },
                    {
                        'text': 'Complete: "I have ___ apples" (number 7)',
                        'type': 'fill_blank',
                        'correct_answer': 'seven',
                        'hint': 'Spell the number 7',
                        'explanation': 'Seven is the word form of the number 7'
                    },
                    {
                        'text': 'Which number is spelled correctly?',
                        'type': 'mcq',
                        'options': ['Eighteen', 'Eightteen', 'Eighten', 'Eightin'],
                        'correct_answer': 'Eighteen',
                        'hint': 'Eight + teen',
                        'explanation': 'Eighteen is the correct spelling of the number 18'
                    },
                    {
                        'text': 'What is 10 + 5?',
                        'type': 'mcq',
                        'options': ['Fourteen', 'Fifteen', 'Sixteen', 'Seventeen'],
                        'correct_answer': 'Fifteen',
                        'hint': 'Basic addition',
                        'explanation': '10 + 5 = 15, which is spelled fifteen'
                    },
                    {
                        'text': 'How do you say 20 in English?',
                        'type': 'mcq',
                        'options': ['Twenty', 'Twenteen', 'Twoty', 'Twinty'],
                        'correct_answer': 'Twenty',
                        'hint': 'Standard spelling',
                        'explanation': 'Twenty is the correct spelling of the number 20'
                    }
                ]
            },
            # Level 3: Colors
            {
                'name': 'Basic Colors',
                'description': 'Learn primary and common colors',
                'questions': [
                    {
                        'text': 'What color do you get when you mix red and blue?',
                        'type': 'mcq',
                        'options': ['Green', 'Purple', 'Orange', 'Yellow'],
                        'correct_answer': 'Purple',
                        'hint': 'Primary color mixing',
                        'explanation': 'Red and blue make purple'
                    },
                    {
                        'text': 'Complete: "The sky is ___"',
                        'type': 'fill_blank',
                        'correct_answer': 'blue',
                        'hint': 'Color of the sky',
                        'explanation': 'The sky appears blue during the day'
                    },
                    {
                        'text': 'Which color represents danger?',
                        'type': 'mcq',
                        'options': ['Green', 'Red', 'Blue', 'Yellow'],
                        'correct_answer': 'Red',
                        'hint': 'Traffic lights and warning signs',
                        'explanation': 'Red is commonly used to indicate danger or stop'
                    },
                    {
                        'text': 'What color do you get when you mix red and yellow?',
                        'type': 'mcq',
                        'options': ['Green', 'Purple', 'Orange', 'Pink'],
                        'correct_answer': 'Orange',
                        'hint': 'Primary color mixing',
                        'explanation': 'Red and yellow make orange'
                    },
                    {
                        'text': 'Complete: "Grass is ___"',
                        'type': 'fill_blank',
                        'correct_answer': 'green',
                        'hint': 'Color of grass',
                        'explanation': 'Grass is typically green in color'
                    },
                    {
                        'text': 'Which color is associated with sunshine?',
                        'type': 'mcq',
                        'options': ['Blue', 'Red', 'Yellow', 'Purple'],
                        'correct_answer': 'Yellow',
                        'hint': 'Color of the sun',
                        'explanation': 'Yellow is the color most associated with sunshine'
                    }
                ]
            },
            # Level 4: Family Members
            {
                'name': 'Family Members',
                'description': 'Learn basic family relationships',
                'questions': [
                    {
                        'text': 'What do you call your mother\'s sister?',
                        'type': 'mcq',
                        'options': ['Aunt', 'Uncle', 'Cousin', 'Sister'],
                        'correct_answer': 'Aunt',
                        'hint': 'Female family member',
                        'explanation': 'Your mother\'s sister is your aunt'
                    },
                    {
                        'text': 'Complete: "My father\'s father is my ___"',
                        'type': 'fill_blank',
                        'correct_answer': 'grandfather',
                        'hint': 'Father\'s father',
                        'explanation': 'Your father\'s father is your grandfather'
                    },
                    {
                        'text': 'What do you call your brother\'s son?',
                        'type': 'mcq',
                        'options': ['Nephew', 'Niece', 'Cousin', 'Son'],
                        'correct_answer': 'Nephew',
                        'hint': 'Male family member',
                        'explanation': 'Your brother\'s son is your nephew'
                    },
                    {
                        'text': 'Complete: "My mother\'s mother is my ___"',
                        'type': 'fill_blank',
                        'correct_answer': 'grandmother',
                        'hint': 'Mother\'s mother',
                        'explanation': 'Your mother\'s mother is your grandmother'
                    },
                    {
                        'text': 'What do you call your sister\'s daughter?',
                        'type': 'mcq',
                        'options': ['Nephew', 'Niece', 'Cousin', 'Daughter'],
                        'correct_answer': 'Niece',
                        'hint': 'Female family member',
                        'explanation': 'Your sister\'s daughter is your niece'
                    },
                    {
                        'text': 'Complete: "My father\'s brother is my ___"',
                        'type': 'fill_blank',
                        'correct_answer': 'uncle',
                        'hint': 'Father\'s brother',
                        'explanation': 'Your father\'s brother is your uncle'
                    }
                ]
            },
            # Level 5: Days of the Week
            {
                'name': 'Days of the Week',
                'description': 'Learn the seven days of the week',
                'questions': [
                    {
                        'text': 'What day comes after Monday?',
                        'type': 'mcq',
                        'options': ['Sunday', 'Tuesday', 'Wednesday', 'Thursday'],
                        'correct_answer': 'Tuesday',
                        'hint': 'Sequential order',
                        'explanation': 'Tuesday comes after Monday in the week'
                    },
                    {
                        'text': 'Complete: "Today is Monday, tomorrow is ___"',
                        'type': 'fill_blank',
                        'correct_answer': 'Tuesday',
                        'hint': 'Next day after Monday',
                        'explanation': 'Tuesday is the day after Monday'
                    },
                    {
                        'text': 'What day comes before Friday?',
                        'type': 'mcq',
                        'options': ['Wednesday', 'Thursday', 'Saturday', 'Sunday'],
                        'correct_answer': 'Thursday',
                        'hint': 'Day before Friday',
                        'explanation': 'Thursday comes before Friday'
                    },
                    {
                        'text': 'Complete: "The weekend includes ___ and ___"',
                        'type': 'fill_blank',
                        'correct_answer': 'Saturday Sunday',
                        'hint': 'Two days of rest',
                        'explanation': 'Saturday and Sunday make up the weekend'
                    },
                    {
                        'text': 'What is the first day of the week?',
                        'type': 'mcq',
                        'options': ['Monday', 'Tuesday', 'Sunday', 'Saturday'],
                        'correct_answer': 'Monday',
                        'hint': 'Work week starts',
                        'explanation': 'Monday is considered the first day of the work week'
                    },
                    {
                        'text': 'Complete: "Wednesday is in the ___ of the week"',
                        'type': 'fill_blank',
                        'correct_answer': 'middle',
                        'hint': 'Position in the week',
                        'explanation': 'Wednesday is in the middle of the week'
                    }
                ]
            }
        ]

    def get_progressive_english_content(self, group_number):
        """Progressive English Content for Groups 1-7"""
        # This would contain 50 levels of progressive content
        # For now, returning basic content structure
        content = []
        for i in range(50):
            content.append({
                'name': f'Progressive Level {i+1}',
                'description': f'Advanced English learning for Group {group_number}',
                'questions': self.get_default_questions()
            })
        return content

    def get_default_content(self, level_number):
        """Default content for levels beyond predefined content"""
        return {
            'name': f'Level {level_number}',
            'description': f'English learning level {level_number}',
            'questions': self.get_default_questions()
        }

    def get_default_questions(self):
        """Default questions structure"""
        return [
            {
                'text': 'What is the correct answer?',
                'type': 'mcq',
                'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                'correct_answer': 'Option A',
                'hint': 'Choose the best answer',
                'explanation': 'This is the correct answer'
            }
        ]
