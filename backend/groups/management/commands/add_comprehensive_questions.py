from django.core.management.base import BaseCommand
from groups.models import Group, Level, Question

class Command(BaseCommand):
    help = 'Add comprehensive sample questions to all levels'

    def handle(self, *args, **options):
        # Get all groups
        groups = Group.objects.all()
        
        for group in groups:
            self.stdout.write(f'Adding questions for {group.name}...')
            
            # Get all levels for this group
            levels = Level.objects.filter(group=group)
            
            for level in levels:
                self.add_questions_for_level(level)
        
        self.stdout.write(
            self.style.SUCCESS('Successfully added comprehensive questions to all levels!')
        )

    def add_questions_for_level(self, level):
        """Add 6 questions (one of each type) to a level"""
        
        # Clear existing questions for this level
        Question.objects.filter(level=level).delete()
        
        # Question templates based on level difficulty
        difficulty = self.get_difficulty_for_level(level)
        
        questions_data = [
            {
                'question_text': self.get_mcq_question(level, difficulty),
                'question_type': 'mcq',
                'options': self.get_mcq_options(level, difficulty),
                'correct_answer': self.get_mcq_correct_answer(level, difficulty),
                'explanation': self.get_mcq_explanation(level, difficulty),
                'difficulty': difficulty,
                'xp_value': self.get_xp_value(difficulty),
                'question_order': 1
            },
            {
                'question_text': self.get_pronunciation_question(level, difficulty),
                'question_type': 'text_to_speech',
                'options': [],
                'correct_answer': self.get_pronunciation_correct_answer(level, difficulty),
                'explanation': self.get_pronunciation_explanation(level, difficulty),
                'difficulty': difficulty,
                'xp_value': self.get_xp_value(difficulty) + 5,
                'question_order': 2
            },
            {
                'question_text': self.get_fill_blank_question(level, difficulty),
                'question_type': 'fill_blank',
                'options': self.get_fill_blank_options(level, difficulty),
                'correct_answer': self.get_fill_blank_correct_answer(level, difficulty),
                'explanation': self.get_fill_blank_explanation(level, difficulty),
                'difficulty': difficulty,
                'xp_value': self.get_xp_value(difficulty),
                'question_order': 3
            },
            {
                'question_text': self.get_synonym_question(level, difficulty),
                'question_type': 'synonyms',
                'options': self.get_synonym_options(level, difficulty),
                'correct_answer': self.get_synonym_correct_answer(level, difficulty),
                'explanation': self.get_synonym_explanation(level, difficulty),
                'difficulty': difficulty,
                'xp_value': self.get_xp_value(difficulty),
                'question_order': 4
            },
            {
                'question_text': self.get_antonym_question(level, difficulty),
                'question_type': 'antonyms',
                'options': self.get_antonym_options(level, difficulty),
                'correct_answer': self.get_antonym_correct_answer(level, difficulty),
                'explanation': self.get_antonym_explanation(level, difficulty),
                'difficulty': difficulty,
                'xp_value': self.get_xp_value(difficulty),
                'question_order': 5
            },
            {
                'question_text': self.get_sentence_completion_question(level, difficulty),
                'question_type': 'sentence_completion',
                'options': self.get_sentence_completion_options(level, difficulty),
                'correct_answer': self.get_sentence_completion_correct_answer(level, difficulty),
                'explanation': self.get_sentence_completion_explanation(level, difficulty),
                'difficulty': difficulty,
                'xp_value': self.get_xp_value(difficulty),
                'question_order': 6
            }
        ]
        
        for q_data in questions_data:
            Question.objects.create(level=level, **q_data)

    def get_difficulty_for_level(self, level):
        """Determine difficulty based on group and level number"""
        if level.group.group_number == 0:
            return 1  # Easy
        elif level.group.group_number <= 3:
            return 2  # Medium
        else:
            return 3  # Hard

    def get_xp_value(self, difficulty):
        """Get XP value based on difficulty"""
        return {1: 10, 2: 15, 3: 20}[difficulty]

    def get_mcq_question(self, level, difficulty):
        """Generate MCQ question based on level"""
        if level.group.group_number == 0:
            return "What is the capital of Pakistan?"
        elif level.group.group_number == 1:
            return "Which word means 'very happy'?"
        else:
            return "What is the meaning of 'serendipity'?"

    def get_mcq_options(self, level, difficulty):
        """Generate MCQ options"""
        if level.group.group_number == 0:
            return ['Islamabad', 'Karachi', 'Lahore', 'Peshawar']
        elif level.group.group_number == 1:
            return ['sad', 'ecstatic', 'angry', 'tired']
        else:
            return ['bad luck', 'good fortune', 'coincidence', 'misfortune']

    def get_mcq_correct_answer(self, level, difficulty):
        """Get correct MCQ answer"""
        if level.group.group_number == 0:
            return 'Islamabad'
        elif level.group.group_number == 1:
            return 'ecstatic'
        else:
            return 'good fortune'

    def get_mcq_explanation(self, level, difficulty):
        """Get MCQ explanation"""
        if level.group.group_number == 0:
            return 'Islamabad is the capital city of Pakistan.'
        elif level.group.group_number == 1:
            return 'Ecstatic means extremely happy or excited.'
        else:
            return 'Serendipity means the occurrence of happy or beneficial events by chance.'

    def get_pronunciation_question(self, level, difficulty):
        """Generate pronunciation question"""
        if level.group.group_number == 0:
            return 'Pronounce the word "Hello"'
        elif level.group.group_number == 1:
            return 'Pronounce the word "Beautiful"'
        else:
            return 'Pronounce the word "Entrepreneur"'

    def get_pronunciation_correct_answer(self, level, difficulty):
        """Get correct pronunciation"""
        if level.group.group_number == 0:
            return 'Hello'
        elif level.group.group_number == 1:
            return 'Beautiful'
        else:
            return 'Entrepreneur'

    def get_pronunciation_explanation(self, level, difficulty):
        """Get pronunciation explanation"""
        if level.group.group_number == 0:
            return 'The word "Hello" is pronounced as "huh-loh".'
        elif level.group.group_number == 1:
            return 'The word "Beautiful" is pronounced as "byoo-ti-ful".'
        else:
            return 'The word "Entrepreneur" is pronounced as "ahn-truh-pruh-nur".'

    def get_fill_blank_question(self, level, difficulty):
        """Generate fill-in-blank question"""
        if level.group.group_number == 0:
            return 'Complete: "I ___ to school every day."'
        elif level.group.group_number == 1:
            return 'Complete: "She has been ___ for three hours."'
        else:
            return 'Complete: "The project was ___ by the team."'

    def get_fill_blank_options(self, level, difficulty):
        """Generate fill-in-blank options"""
        if level.group.group_number == 0:
            return ['go', 'goes', 'going', 'went']
        elif level.group.group_number == 1:
            return ['studying', 'studied', 'study', 'studies']
        else:
            return ['completed', 'completing', 'complete', 'completes']

    def get_fill_blank_correct_answer(self, level, difficulty):
        """Get correct fill-in-blank answer"""
        if level.group.group_number == 0:
            return 'go'
        elif level.group.group_number == 1:
            return 'studying'
        else:
            return 'completed'

    def get_fill_blank_explanation(self, level, difficulty):
        """Get fill-in-blank explanation"""
        if level.group.group_number == 0:
            return 'The correct answer is "go" because the subject "I" takes the base form of the verb.'
        elif level.group.group_number == 1:
            return 'The correct answer is "studying" because it uses present perfect continuous tense.'
        else:
            return 'The correct answer is "completed" because it uses past tense passive voice.'

    def get_synonym_question(self, level, difficulty):
        """Generate synonym question"""
        if level.group.group_number == 0:
            return 'What is a synonym for "happy"?'
        elif level.group.group_number == 1:
            return 'What is a synonym for "intelligent"?'
        else:
            return 'What is a synonym for "meticulous"?'

    def get_synonym_options(self, level, difficulty):
        """Generate synonym options"""
        if level.group.group_number == 0:
            return ['sad', 'joyful', 'angry', 'tired']
        elif level.group.group_number == 1:
            return ['stupid', 'clever', 'lazy', 'slow']
        else:
            return ['careless', 'thorough', 'quick', 'simple']

    def get_synonym_correct_answer(self, level, difficulty):
        """Get correct synonym answer"""
        if level.group.group_number == 0:
            return 'joyful'
        elif level.group.group_number == 1:
            return 'clever'
        else:
            return 'thorough'

    def get_synonym_explanation(self, level, difficulty):
        """Get synonym explanation"""
        if level.group.group_number == 0:
            return 'Joyful means the same as happy - feeling or showing pleasure.'
        elif level.group.group_number == 1:
            return 'Clever means the same as intelligent - having or showing quick intelligence.'
        else:
            return 'Thorough means the same as meticulous - showing great attention to detail.'

    def get_antonym_question(self, level, difficulty):
        """Generate antonym question"""
        if level.group.group_number == 0:
            return 'What is an antonym for "big"?'
        elif level.group.group_number == 1:
            return 'What is an antonym for "success"?'
        else:
            return 'What is an antonym for "benevolent"?'

    def get_antonym_options(self, level, difficulty):
        """Generate antonym options"""
        if level.group.group_number == 0:
            return ['large', 'small', 'huge', 'giant']
        elif level.group.group_number == 1:
            return ['victory', 'failure', 'achievement', 'accomplishment']
        else:
            return ['kind', 'cruel', 'generous', 'helpful']

    def get_antonym_correct_answer(self, level, difficulty):
        """Get correct antonym answer"""
        if level.group.group_number == 0:
            return 'small'
        elif level.group.group_number == 1:
            return 'failure'
        else:
            return 'cruel'

    def get_antonym_explanation(self, level, difficulty):
        """Get antonym explanation"""
        if level.group.group_number == 0:
            return 'Small is the opposite of big.'
        elif level.group.group_number == 1:
            return 'Failure is the opposite of success.'
        else:
            return 'Cruel is the opposite of benevolent (kind and generous).'

    def get_sentence_completion_question(self, level, difficulty):
        """Generate sentence completion question"""
        if level.group.group_number == 0:
            return 'Complete: "The sun ___ in the east."'
        elif level.group.group_number == 1:
            return 'Complete: "If I ___ you, I would help."'
        else:
            return 'Complete: "The proposal was ___ by the committee."'

    def get_sentence_completion_options(self, level, difficulty):
        """Generate sentence completion options"""
        if level.group.group_number == 0:
            return ['rises', 'rise', 'rising', 'rose']
        elif level.group.group_number == 1:
            return ['am', 'was', 'were', 'be']
        else:
            return ['accepted', 'accepting', 'accept', 'accepts']

    def get_sentence_completion_correct_answer(self, level, difficulty):
        """Get correct sentence completion answer"""
        if level.group.group_number == 0:
            return 'rises'
        elif level.group.group_number == 1:
            return 'were'
        else:
            return 'accepted'

    def get_sentence_completion_explanation(self, level, difficulty):
        """Get sentence completion explanation"""
        if level.group.group_number == 0:
            return 'The sun rises in the east. This is a general truth, so we use present simple tense.'
        elif level.group.group_number == 1:
            return 'The correct answer is "were" because it uses second conditional (if + past simple).'
        else:
            return 'The correct answer is "accepted" because it uses past tense passive voice.'
