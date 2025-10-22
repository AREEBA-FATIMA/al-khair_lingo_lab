from django.core.management.base import BaseCommand
from levels.models import Level, Question

class Command(BaseCommand):
    help = 'Create real English questions for all levels'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing questions and create new ones',
        )

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write('Deleting existing questions...')
            Question.objects.all().delete()

        self.stdout.write('Creating real English questions...')
        
        # Get all levels
        levels = Level.objects.all().order_by('level_number')
        
        for level in levels:
            self.stdout.write(f'Creating questions for Level {level.level_number}: {level.name}')
            
            # Create 6 real questions for each level
            questions_data = self._get_real_questions_for_level(level)
            
            for q_num, question_data in enumerate(questions_data, 1):
                question, created = Question.objects.get_or_create(
                    level=level,
                    question_order=q_num,
                    defaults=question_data
                )
                
                if created:
                    self.stdout.write(f'  Created Question {q_num}: {question_data["question_text"][:50]}...')

        self.stdout.write(
            self.style.SUCCESS('Successfully created all real questions!')
        )

    def _get_real_questions_for_level(self, level):
        """Get real questions based on level difficulty"""
        group_num = level.group.group_number
        
        if group_num == 0:  # Basic English
            return self._get_basic_questions()
        elif group_num == 1:  # Elementary
            return self._get_elementary_questions()
        elif group_num == 2:  # Pre-Intermediate
            return self._get_pre_intermediate_questions()
        elif group_num == 3:  # Intermediate
            return self._get_intermediate_questions()
        elif group_num == 4:  # Upper-Intermediate
            return self._get_upper_intermediate_questions()
        elif group_num == 5:  # Advanced
            return self._get_advanced_questions()
        elif group_num == 6:  # Expert
            return self._get_expert_questions()
        else:  # Master
            return self._get_master_questions()

    def _get_basic_questions(self):
        """Basic English questions"""
        return [
            {
                'question_text': 'What is the capital of Pakistan?',
                'question_type': 'mcq',
                'options': {
                    'A': 'Karachi',
                    'B': 'Lahore', 
                    'C': 'Islamabad',
                    'D': 'Rawalpindi'
                },
                'correct_answer': 'C',
                'hint': 'It is the federal capital',
                'explanation': 'Islamabad is the capital city of Pakistan',
                'difficulty': 1,
                'xp_value': 5,
            },
            {
                'question_text': 'Complete: "Hello, how ___ you?"',
                'question_type': 'fill_blank',
                'options': None,
                'correct_answer': 'are',
                'hint': 'Use the correct form of "be" verb',
                'explanation': 'We use "are" with "you" in present tense',
                'difficulty': 1,
                'xp_value': 5,
            },
            {
                'question_text': 'What is the opposite of "big"?',
                'question_type': 'antonyms',
                'options': None,
                'correct_answer': 'small',
                'hint': 'Think of size opposites',
                'explanation': 'Small is the opposite of big',
                'difficulty': 1,
                'xp_value': 5,
            },
            {
                'question_text': 'What is a synonym for "happy"?',
                'question_type': 'synonyms',
                'options': None,
                'correct_answer': 'joyful',
                'hint': 'Think of words with similar meaning',
                'explanation': 'Joyful means the same as happy',
                'difficulty': 1,
                'xp_value': 5,
            },
            {
                'question_text': 'Complete: "I ___ to school every day."',
                'question_type': 'sentence_completion',
                'options': None,
                'correct_answer': 'go',
                'hint': 'Use present simple tense',
                'explanation': 'We use "go" for regular actions',
                'difficulty': 1,
                'xp_value': 5,
            },
            {
                'question_text': 'Pronounce: "Hello"',
                'question_type': 'text_to_speech',
                'options': None,
                'correct_answer': 'Hello',
                'hint': 'Say the word clearly',
                'explanation': 'Hello is a common greeting',
                'difficulty': 1,
                'xp_value': 5,
            }
        ]

    def _get_elementary_questions(self):
        """Elementary English questions"""
        return [
            {
                'question_text': 'Which sentence is correct?',
                'question_type': 'mcq',
                'options': {
                    'A': 'She go to school',
                    'B': 'She goes to school', 
                    'C': 'She going to school',
                    'D': 'She went to school'
                },
                'correct_answer': 'B',
                'hint': 'Use correct present simple form',
                'explanation': 'Third person singular takes -s',
                'difficulty': 2,
                'xp_value': 7,
            },
            {
                'question_text': 'Complete: "I have ___ apple."',
                'question_type': 'fill_blank',
                'options': None,
                'correct_answer': 'an',
                'hint': 'Use correct article',
                'explanation': 'Use "an" before vowel sounds',
                'difficulty': 2,
                'xp_value': 7,
            },
            {
                'question_text': 'What is the opposite of "expensive"?',
                'question_type': 'antonyms',
                'options': None,
                'correct_answer': 'cheap',
                'hint': 'Think of price opposites',
                'explanation': 'Cheap is the opposite of expensive',
                'difficulty': 2,
                'xp_value': 7,
            },
            {
                'question_text': 'What is a synonym for "beautiful"?',
                'question_type': 'synonyms',
                'options': None,
                'correct_answer': 'pretty',
                'hint': 'Think of words meaning attractive',
                'explanation': 'Pretty means the same as beautiful',
                'difficulty': 2,
                'xp_value': 7,
            },
            {
                'question_text': 'Complete: "She ___ her homework yesterday."',
                'question_type': 'sentence_completion',
                'options': None,
                'correct_answer': 'did',
                'hint': 'Use past tense',
                'explanation': 'Did is the past form of do',
                'difficulty': 2,
                'xp_value': 7,
            },
            {
                'question_text': 'Pronounce: "Beautiful"',
                'question_type': 'text_to_speech',
                'options': None,
                'correct_answer': 'Beautiful',
                'hint': 'Say the word clearly',
                'explanation': 'Beautiful means very attractive',
                'difficulty': 2,
                'xp_value': 7,
            }
        ]

    def _get_pre_intermediate_questions(self):
        """Pre-Intermediate English questions"""
        return [
            {
                'question_text': 'Choose the correct conditional:',
                'question_type': 'mcq',
                'options': {
                    'A': 'If I will go, I will see him',
                    'B': 'If I go, I will see him', 
                    'C': 'If I went, I will see him',
                    'D': 'If I go, I would see him'
                },
                'correct_answer': 'B',
                'hint': 'First conditional structure',
                'explanation': 'First conditional: If + present, will + base form',
                'difficulty': 3,
                'xp_value': 10,
            },
            {
                'question_text': 'Complete: "I wish I ___ taller."',
                'question_type': 'fill_blank',
                'options': None,
                'correct_answer': 'were',
                'hint': 'Use subjunctive mood',
                'explanation': 'Use "were" in wishes about present',
                'difficulty': 3,
                'xp_value': 10,
            },
            {
                'question_text': 'What is the opposite of "generous"?',
                'question_type': 'antonyms',
                'options': None,
                'correct_answer': 'selfish',
                'hint': 'Think of character opposites',
                'explanation': 'Selfish is the opposite of generous',
                'difficulty': 3,
                'xp_value': 10,
            },
            {
                'question_text': 'What is a synonym for "intelligent"?',
                'question_type': 'synonyms',
                'options': None,
                'correct_answer': 'smart',
                'hint': 'Think of words meaning clever',
                'explanation': 'Smart means the same as intelligent',
                'difficulty': 3,
                'xp_value': 10,
            },
            {
                'question_text': 'Complete: "By next year, I ___ finished my studies."',
                'question_type': 'sentence_completion',
                'options': None,
                'correct_answer': 'will have',
                'hint': 'Use future perfect tense',
                'explanation': 'Future perfect: will have + past participle',
                'difficulty': 3,
                'xp_value': 10,
            },
            {
                'question_text': 'Pronounce: "Pronunciation"',
                'question_type': 'text_to_speech',
                'options': None,
                'correct_answer': 'Pronunciation',
                'hint': 'Say the word clearly',
                'explanation': 'Pronunciation means how to say words',
                'difficulty': 3,
                'xp_value': 10,
            }
        ]

    def _get_intermediate_questions(self):
        """Intermediate English questions"""
        return [
            {
                'question_text': 'Choose the correct passive voice:',
                'question_type': 'mcq',
                'options': {
                    'A': 'The book was wrote by him',
                    'B': 'The book was written by him', 
                    'C': 'The book was write by him',
                    'D': 'The book was writing by him'
                },
                'correct_answer': 'B',
                'hint': 'Use past participle in passive',
                'explanation': 'Passive voice: was/were + past participle',
                'difficulty': 4,
                'xp_value': 12,
            },
            {
                'question_text': 'Complete: "Had I known, I ___ differently."',
                'question_type': 'fill_blank',
                'options': None,
                'correct_answer': 'would have acted',
                'hint': 'Use third conditional',
                'explanation': 'Third conditional: had + past participle, would have + past participle',
                'difficulty': 4,
                'xp_value': 12,
            },
            {
                'question_text': 'What is the opposite of "ambiguous"?',
                'question_type': 'antonyms',
                'options': None,
                'correct_answer': 'clear',
                'hint': 'Think of clarity opposites',
                'explanation': 'Clear is the opposite of ambiguous',
                'difficulty': 4,
                'xp_value': 12,
            },
            {
                'question_text': 'What is a synonym for "meticulous"?',
                'question_type': 'synonyms',
                'options': None,
                'correct_answer': 'careful',
                'hint': 'Think of words meaning thorough',
                'explanation': 'Careful means the same as meticulous',
                'difficulty': 4,
                'xp_value': 12,
            },
            {
                'question_text': 'Complete: "The project ___ by the team last month."',
                'question_type': 'sentence_completion',
                'options': None,
                'correct_answer': 'was completed',
                'hint': 'Use passive voice',
                'explanation': 'Passive voice: was + past participle',
                'difficulty': 4,
                'xp_value': 12,
            },
            {
                'question_text': 'Pronounce: "Entrepreneur"',
                'question_type': 'text_to_speech',
                'options': None,
                'correct_answer': 'Entrepreneur',
                'hint': 'Say the word clearly',
                'explanation': 'Entrepreneur means business owner',
                'difficulty': 4,
                'xp_value': 12,
            }
        ]

    def _get_upper_intermediate_questions(self):
        """Upper-Intermediate English questions"""
        return [
            {
                'question_text': 'Choose the correct reported speech:',
                'question_type': 'mcq',
                'options': {
                    'A': 'He said he will come',
                    'B': 'He said he would come', 
                    'C': 'He said he comes',
                    'D': 'He said he came'
                },
                'correct_answer': 'B',
                'hint': 'Use past tense in reported speech',
                'explanation': 'Reported speech: will becomes would',
                'difficulty': 5,
                'xp_value': 15,
            },
            {
                'question_text': 'Complete: "Not only ___ he late, but he also forgot his homework."',
                'question_type': 'fill_blank',
                'options': None,
                'correct_answer': 'was',
                'hint': 'Use inversion with "not only"',
                'explanation': 'Not only + auxiliary + subject + verb',
                'difficulty': 5,
                'xp_value': 15,
            },
            {
                'question_text': 'What is the opposite of "ubiquitous"?',
                'question_type': 'antonyms',
                'options': None,
                'correct_answer': 'rare',
                'hint': 'Think of frequency opposites',
                'explanation': 'Rare is the opposite of ubiquitous',
                'difficulty': 5,
                'xp_value': 15,
            },
            {
                'question_text': 'What is a synonym for "perspicacious"?',
                'question_type': 'synonyms',
                'options': None,
                'correct_answer': 'perceptive',
                'hint': 'Think of words meaning insightful',
                'explanation': 'Perceptive means the same as perspicacious',
                'difficulty': 5,
                'xp_value': 15,
            },
            {
                'question_text': 'Complete: "Had it not been for your help, I ___ succeeded."',
                'question_type': 'sentence_completion',
                'options': None,
                'correct_answer': 'would not have',
                'hint': 'Use third conditional',
                'explanation': 'Third conditional: would not have + past participle',
                'difficulty': 5,
                'xp_value': 15,
            },
            {
                'question_text': 'Pronounce: "Sophisticated"',
                'question_type': 'text_to_speech',
                'options': None,
                'correct_answer': 'Sophisticated',
                'hint': 'Say the word clearly',
                'explanation': 'Sophisticated means complex and refined',
                'difficulty': 5,
                'xp_value': 15,
            }
        ]

    def _get_advanced_questions(self):
        """Advanced English questions"""
        return [
            {
                'question_text': 'Choose the correct subjunctive:',
                'question_type': 'mcq',
                'options': {
                    'A': 'I suggest that he goes',
                    'B': 'I suggest that he go', 
                    'C': 'I suggest that he going',
                    'D': 'I suggest that he went'
                },
                'correct_answer': 'B',
                'hint': 'Use base form in subjunctive',
                'explanation': 'Subjunctive: suggest that + base form',
                'difficulty': 6,
                'xp_value': 18,
            },
            {
                'question_text': 'Complete: "So ___ was the storm that we had to stay inside."',
                'question_type': 'fill_blank',
                'options': None,
                'correct_answer': 'severe',
                'hint': 'Use "so + adjective + that" structure',
                'explanation': 'So + adjective + that = such a strong effect',
                'difficulty': 6,
                'xp_value': 18,
            },
            {
                'question_text': 'What is the opposite of "ephemeral"?',
                'question_type': 'antonyms',
                'options': None,
                'correct_answer': 'permanent',
                'hint': 'Think of duration opposites',
                'explanation': 'Permanent is the opposite of ephemeral',
                'difficulty': 6,
                'xp_value': 18,
            },
            {
                'question_text': 'What is a synonym for "ubiquitous"?',
                'question_type': 'synonyms',
                'options': None,
                'correct_answer': 'omnipresent',
                'hint': 'Think of words meaning everywhere',
                'explanation': 'Omnipresent means the same as ubiquitous',
                'difficulty': 6,
                'xp_value': 18,
            },
            {
                'question_text': 'Complete: "Were I ___ you, I would reconsider."',
                'question_type': 'sentence_completion',
                'options': None,
                'correct_answer': 'in',
                'hint': 'Use inversion with "were"',
                'explanation': 'Were I in your position = If I were in your position',
                'difficulty': 6,
                'xp_value': 18,
            },
            {
                'question_text': 'Pronounce: "Conscientious"',
                'question_type': 'text_to_speech',
                'options': None,
                'correct_answer': 'Conscientious',
                'hint': 'Say the word clearly',
                'explanation': 'Conscientious means careful and thorough',
                'difficulty': 6,
                'xp_value': 18,
            }
        ]

    def _get_expert_questions(self):
        """Expert English questions"""
        return [
            {
                'question_text': 'Choose the correct gerund usage:',
                'question_type': 'mcq',
                'options': {
                    'A': 'I am looking forward to see you',
                    'B': 'I am looking forward to seeing you', 
                    'C': 'I am looking forward to saw you',
                    'D': 'I am looking forward to seen you'
                },
                'correct_answer': 'B',
                'hint': 'Use gerund after "to" in phrasal verbs',
                'explanation': 'Look forward to + gerund (not infinitive)',
                'difficulty': 7,
                'xp_value': 20,
            },
            {
                'question_text': 'Complete: "Such ___ the complexity that few understood it."',
                'question_type': 'fill_blank',
                'options': None,
                'correct_answer': 'was',
                'hint': 'Use inversion with "such"',
                'explanation': 'Such + noun + was + that clause',
                'difficulty': 7,
                'xp_value': 20,
            },
            {
                'question_text': 'What is the opposite of "perspicacious"?',
                'question_type': 'antonyms',
                'options': None,
                'correct_answer': 'obtuse',
                'hint': 'Think of intelligence opposites',
                'explanation': 'Obtuse is the opposite of perspicacious',
                'difficulty': 7,
                'xp_value': 20,
            },
            {
                'question_text': 'What is a synonym for "ephemeral"?',
                'question_type': 'synonyms',
                'options': None,
                'correct_answer': 'transient',
                'hint': 'Think of words meaning temporary',
                'explanation': 'Transient means the same as ephemeral',
                'difficulty': 7,
                'xp_value': 20,
            },
            {
                'question_text': 'Complete: "Had I but known, I ___ differently."',
                'question_type': 'sentence_completion',
                'options': None,
                'correct_answer': 'would have acted',
                'hint': 'Use third conditional with "but"',
                'explanation': 'Had I but known = If only I had known',
                'difficulty': 7,
                'xp_value': 20,
            },
            {
                'question_text': 'Pronounce: "Serendipitous"',
                'question_type': 'text_to_speech',
                'options': None,
                'correct_answer': 'Serendipitous',
                'hint': 'Say the word clearly',
                'explanation': 'Serendipitous means fortunate coincidence',
                'difficulty': 7,
                'xp_value': 20,
            }
        ]

    def _get_master_questions(self):
        """Master English questions"""
        return [
            {
                'question_text': 'Choose the correct literary device:',
                'question_type': 'mcq',
                'options': {
                    'A': 'The wind whispered secrets',
                    'B': 'The wind blew loudly', 
                    'C': 'The wind was strong',
                    'D': 'The wind moved the trees'
                },
                'correct_answer': 'A',
                'hint': 'Look for personification',
                'explanation': 'Personification gives human qualities to non-human things',
                'difficulty': 8,
                'xp_value': 25,
            },
            {
                'question_text': 'Complete: "Not until ___ the truth did I understand."',
                'question_type': 'fill_blank',
                'options': None,
                'correct_answer': 'I heard',
                'hint': 'Use inversion with "not until"',
                'explanation': 'Not until + subject + verb + did + subject + verb',
                'difficulty': 8,
                'xp_value': 25,
            },
            {
                'question_text': 'What is the opposite of "serendipitous"?',
                'question_type': 'antonyms',
                'options': None,
                'correct_answer': 'deliberate',
                'hint': 'Think of intention opposites',
                'explanation': 'Deliberate is the opposite of serendipitous',
                'difficulty': 8,
                'xp_value': 25,
            },
            {
                'question_text': 'What is a synonym for "perspicacious"?',
                'question_type': 'synonyms',
                'options': None,
                'correct_answer': 'astute',
                'hint': 'Think of words meaning shrewd',
                'explanation': 'Astute means the same as perspicacious',
                'difficulty': 8,
                'xp_value': 25,
            },
            {
                'question_text': 'Complete: "So ___ was the performance that the audience was spellbound."',
                'question_type': 'sentence_completion',
                'options': None,
                'correct_answer': 'mesmerizing',
                'hint': 'Use "so + adjective + that" structure',
                'explanation': 'So + adjective + that = such a strong effect',
                'difficulty': 8,
                'xp_value': 25,
            },
            {
                'question_text': 'Pronounce: "Perspicacious"',
                'question_type': 'text_to_speech',
                'options': None,
                'correct_answer': 'Perspicacious',
                'hint': 'Say the word clearly',
                'explanation': 'Perspicacious means having keen insight',
                'difficulty': 8,
                'xp_value': 25,
            }
        ]
