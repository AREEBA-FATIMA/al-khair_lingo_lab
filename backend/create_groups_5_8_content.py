#!/usr/bin/env python
"""
Create Groups 5-8 content for Beginner Track
Based on the Duolingo-style content structure
"""

import os
import sys
import django
import random
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'englishmaster.settings')
django.setup()

from levels.models import Level, Question
from groups.models import Group
from vocabulary.models import Vocabulary
from grammar.models import GrammarRule

def create_groups_5_8():
    """Create Groups 5-8 with proper content structure"""
    print("Creating Groups 5-8 content...")
    
    # Group 5: Home & School (25 levels, 150 questions)
    group5 = create_group(5, "Home & School", "Objects + Places + Prepositions", "home_school", 101, 125)
    
    # Group 6: Actions & Verbs (25 levels, 150 questions)  
    group6 = create_group(6, "Actions & Verbs", "Common action verbs + Present Continuous", "actions_verbs", 126, 150)
    
    # Group 7: Time & Days (25 levels, 150 questions)
    group7 = create_group(7, "Time & Days", "Time concepts + Days/Months + Question words", "time_days", 151, 175)
    
    # Group 8: Question Words & Review (25 levels, 150 questions)
    group8 = create_group(8, "Question Words & Review", "All question words + Beginner track revision", "question_words", 176, 200)
    
    print("Groups 5-8 content creation completed!")
    return [group5, group6, group7, group8]

def create_group(group_number, name, description, topic_category, start_level, end_level):
    """Create a group with levels and questions"""
    print(f"\nCreating Group {group_number}: {name}")
    
    # Create or get group
    group, created = Group.objects.get_or_create(
        group_number=group_number,
        defaults={
            'name': name,
            'description': description,
            'topic_category': topic_category,
            'track': 'beginner',
            'difficulty': 1,
            'is_active': True,
            'oxford_word_range_start': (group_number - 1) * 50 + 1,
            'oxford_word_range_end': group_number * 50,
            'grammar_focus': get_grammar_focus_for_group(group_number)
        }
    )
    
    if created:
        print(f"  Created group: {name}")
    else:
        print(f"  Group already exists: {name}")
    
    # Create levels for this group
    levels_created = 0
    for level_num in range(start_level, end_level + 1):
        level = create_level(group, level_num, topic_category)
        if level:
            levels_created += 1
    
    print(f"  Created {levels_created} levels for Group {group_number}")
    
    return group

def create_level(group, level_number, topic_category):
    """Create a level with questions"""
    try:
        # Calculate local level number within group
        local_level = ((level_number - 1) % 25) + 1
        
        # Get learning objectives based on group and level
        learning_objectives = get_learning_objectives(group.group_number, local_level)
        vocabulary_words = get_vocabulary_words(group.group_number, local_level)
        grammar_points = get_grammar_points(group.group_number, local_level)
        
        level, created = Level.objects.get_or_create(
            level_number=level_number,
            defaults={
                'group': group,
                'name': f"Level {local_level}",
                'description': f"Learn {topic_category.replace('_', ' ')} - Level {local_level}",
                'difficulty': 1,
                'difficulty_score': 1.0 + (local_level - 1) * 0.2,
                'xp_reward': 10,
                'is_active': True,
                'learning_objectives': learning_objectives,
                'vocabulary_words': vocabulary_words,
                'grammar_points': grammar_points
            }
        )
        
        if created:
            # Create 6 questions for this level
            create_questions_for_level(level, group, local_level)
            print(f"    Created Level {level_number} with 6 questions")
        
        return level
        
    except Exception as e:
        print(f"    Error creating Level {level_number}: {str(e)}")
        return None

def create_questions_for_level(level, group, local_level):
    """Create 6 questions for a level"""
    question_types = ['mcq', 'fill_blank', 'image_matching', 'pronunciation', 'mcq', 'fill_blank']
    
    for i, question_type in enumerate(question_types):
        try:
            question_data = generate_question_data(level, group, question_type, i + 1, local_level)
            
            question = Question.objects.create(
                level=level,
                question_text=question_data['question_text'],
                question_type=question_type,
                options=question_data.get('options', {}),
                correct_answer=question_data['correct_answer'],
                explanation=question_data.get('explanation', ''),
                hint=question_data.get('hint', ''),
                xp_value=question_data.get('xp_value', 10),
                question_order=i + 1,
                difficulty=level.difficulty,
                is_active=True,
                vocabulary_tested=question_data.get('vocabulary_tested', ''),
                grammar_tested=question_data.get('grammar_tested', ''),
                cognitive_level=question_data.get('cognitive_level', 'remember'),
                distractor_analysis=question_data.get('distractor_analysis', {})
            )
            
        except Exception as e:
            print(f"      Error creating question {i+1}: {str(e)}")
            continue

def get_learning_objectives(group_number, local_level):
    """Get learning objectives for a group and level"""
    objectives = {
        5: [  # Home & School
            "Learn home objects vocabulary",
            "Understand prepositions (in, on, under)",
            "Practice school-related words",
            "Use 'There is/There are' correctly"
        ],
        6: [  # Actions & Verbs
            "Master common action verbs",
            "Learn Present Continuous tense",
            "Practice daily activities vocabulary",
            "Use action verbs in sentences"
        ],
        7: [  # Time & Days
            "Learn time expressions",
            "Master days of the week",
            "Understand months and seasons",
            "Practice question words (What, When, Where)"
        ],
        8: [  # Question Words & Review
            "Master all question words",
            "Review beginner vocabulary",
            "Practice question formation",
            "Prepare for placement test"
        ]
    }
    return objectives.get(group_number, ["Learn new vocabulary", "Practice grammar"])

def get_vocabulary_words(group_number, local_level):
    """Get vocabulary words for a group and level"""
    vocabularies = {
        5: [  # Home & School
            "house", "room", "door", "window", "table", "chair", "bed", "book", "pen", "pencil",
            "bag", "toy", "TV", "phone", "school", "class", "teacher", "student", "friend", "desk",
            "board", "paper", "read", "write", "learn", "study"
        ],
        6: [  # Actions & Verbs
            "go", "come", "walk", "run", "sit", "stand", "sleep", "wake", "open", "close",
            "give", "take", "put", "make", "see", "look", "hear", "listen", "speak", "talk",
            "eat", "drink", "play", "work", "study", "read", "write", "draw", "paint", "sing"
        ],
        7: [  # Time & Days
            "today", "tomorrow", "yesterday", "morning", "afternoon", "evening", "night", "day",
            "week", "month", "year", "hour", "minute", "now", "later", "monday", "tuesday",
            "wednesday", "thursday", "friday", "saturday", "sunday", "january", "february"
        ],
        8: [  # Question Words & Review
            "what", "where", "when", "who", "why", "how", "which", "whose", "whom", "whichever",
            "whatever", "wherever", "whenever", "whoever", "however", "review", "practice", "test"
        ]
    }
    return vocabularies.get(group_number, ["word1", "word2", "word3"])

def get_grammar_points(group_number, local_level):
    """Get grammar points for a group and level"""
    grammar_points = {
        5: [  # Home & School
            "Prepositions (in, on, under, next to)",
            "There is / There are",
            "Articles (a, an, the)",
            "Plural nouns"
        ],
        6: [  # Actions & Verbs
            "Present Continuous (I am walking)",
            "Action verbs",
            "Adverbs of frequency",
            "Can / Can't for ability"
        ],
        7: [  # Time & Days
            "Question words (What, When, Where)",
            "Time expressions",
            "Prepositions of time (at, in, on)",
            "Present Simple for routines"
        ],
        8: [  # Question Words & Review
            "All question words",
            "Question formation",
            "Review of all tenses",
            "Mixed grammar review"
        ]
    }
    return grammar_points.get(group_number, ["Basic grammar"])

def get_grammar_focus_for_group(group_number):
    """Get grammar focus for a group"""
    focuses = {
        5: ["prepositions", "there_is_are", "articles"],
        6: ["present_continuous", "action_verbs", "can_cant"],
        7: ["question_words", "time_expressions", "prepositions_time"],
        8: ["question_formation", "mixed_grammar", "review"]
    }
    return focuses.get(group_number, ["basic_grammar"])

def generate_question_data(level, group, question_type, question_order, local_level):
    """Generate question data based on group and level"""
    
    if group.group_number == 5:  # Home & School
        return generate_home_school_question(level, group, question_type, local_level)
    elif group.group_number == 6:  # Actions & Verbs
        return generate_actions_verbs_question(level, group, question_type, local_level)
    elif group.group_number == 7:  # Time & Days
        return generate_time_days_question(level, group, question_type, local_level)
    elif group.group_number == 8:  # Question Words & Review
        return generate_question_words_question(level, group, question_type, local_level)
    else:
        return generate_default_question(level, group, question_type)

def generate_home_school_question(level, group, question_type, local_level):
    """Generate questions for Home & School group"""
    
    home_objects = ['house', 'room', 'door', 'window', 'table', 'chair', 'bed', 'book', 'pen', 'pencil']
    school_objects = ['school', 'class', 'teacher', 'student', 'friend', 'desk', 'board', 'paper']
    prepositions = ['in', 'on', 'under', 'next to', 'behind', 'in front of']
    
    if question_type == 'mcq':
        if local_level <= 15:  # Home objects
            correct_word = random.choice(home_objects)
            wrong_words = random.sample([w for w in home_objects if w != correct_word], 3)
            
            return {
                'question_text': f"Where do you sleep?",
                'options': {
                    'A': 'bed',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'bed',
                'explanation': "You sleep in a bed.",
                'hint': "Think about where you sleep at night.",
                'xp_value': 10,
                'vocabulary_tested': 'home_objects',
                'cognitive_level': 'remember'
            }
        else:  # School objects
            correct_word = random.choice(school_objects)
            wrong_words = random.sample([w for w in school_objects if w != correct_word], 3)
            
            return {
                'question_text': f"Who teaches you in school?",
                'options': {
                    'A': 'teacher',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'teacher',
                'explanation': "A teacher teaches you in school.",
                'hint': "Think about who helps you learn in school.",
                'xp_value': 10,
                'vocabulary_tested': 'school_objects',
                'cognitive_level': 'remember'
            }
    
    elif question_type == 'fill_blank':
        if local_level <= 15:  # Home objects
            return {
                'question_text': "I sleep in my ___.",
                'correct_answer': 'bed',
                'explanation': "I sleep in my bed.",
                'hint': "Think about where you sleep.",
                'xp_value': 10,
                'vocabulary_tested': 'home_objects',
                'cognitive_level': 'remember'
            }
        else:  # School objects
            return {
                'question_text': "The ___ writes on the board.",
                'correct_answer': 'teacher',
                'explanation': "The teacher writes on the board.",
                'hint': "Think about who writes on the board in class.",
                'xp_value': 10,
                'vocabulary_tested': 'school_objects',
                'cognitive_level': 'remember'
            }
    
    elif question_type == 'image_matching':
        object_word = random.choice(home_objects + school_objects)
        return {
            'question_text': f"Match the image to '{object_word}'.",
            'correct_answer': object_word,
            'explanation': f"The image shows {object_word}.",
            'hint': "Look at the object in the image.",
            'xp_value': 10,
            'vocabulary_tested': 'home_school_objects',
            'cognitive_level': 'remember'
        }
    
    elif question_type == 'pronunciation':
        object_word = random.choice(home_objects + school_objects)
        return {
            'question_text': f"Listen and choose '{object_word}'.",
            'correct_answer': object_word,
            'explanation': f"The correct word is '{object_word}'.",
            'hint': "Listen to the pronunciation carefully.",
            'xp_value': 10,
            'vocabulary_tested': 'home_school_objects',
            'cognitive_level': 'remember'
        }
    
    else:  # Default MCQ
        return generate_default_question(level, group, question_type)

def generate_actions_verbs_question(level, group, question_type, local_level):
    """Generate questions for Actions & Verbs group"""
    
    action_verbs = ['go', 'come', 'walk', 'run', 'sit', 'stand', 'sleep', 'wake', 'open', 'close']
    daily_actions = ['eat', 'drink', 'play', 'work', 'study', 'read', 'write', 'draw', 'paint', 'sing']
    
    if question_type == 'mcq':
        if local_level <= 15:  # Basic actions
            correct_word = random.choice(action_verbs)
            wrong_words = random.sample([w for w in action_verbs if w != correct_word], 3)
            
            return {
                'question_text': f"What do you do when you are tired?",
                'options': {
                    'A': 'sleep',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'sleep',
                'explanation': "When you are tired, you sleep.",
                'hint': "Think about what you do when you need rest.",
                'xp_value': 10,
                'vocabulary_tested': 'action_verbs',
                'cognitive_level': 'remember'
            }
        else:  # Daily actions
            correct_word = random.choice(daily_actions)
            wrong_words = random.sample([w for w in daily_actions if w != correct_word], 3)
            
            return {
                'question_text': f"What do you do with a book?",
                'options': {
                    'A': 'read',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'read',
                'explanation': "You read a book.",
                'hint': "Think about what you do with books.",
                'xp_value': 10,
                'vocabulary_tested': 'daily_actions',
                'cognitive_level': 'remember'
            }
    
    elif question_type == 'fill_blank':
        if local_level <= 15:  # Basic actions
            return {
                'question_text': "I ___ when I am tired.",
                'correct_answer': 'sleep',
                'explanation': "I sleep when I am tired.",
                'hint': "Think about what you do when you need rest.",
                'xp_value': 10,
                'vocabulary_tested': 'action_verbs',
                'cognitive_level': 'remember'
            }
        else:  # Daily actions
            return {
                'question_text': "I ___ books every day.",
                'correct_answer': 'read',
                'explanation': "I read books every day.",
                'hint': "Think about what you do with books.",
                'xp_value': 10,
                'vocabulary_tested': 'daily_actions',
                'cognitive_level': 'remember'
            }
    
    elif question_type == 'image_matching':
        action_word = random.choice(action_verbs + daily_actions)
        return {
            'question_text': f"Match the image to '{action_word}'.",
            'correct_answer': action_word,
            'explanation': f"The image shows someone {action_word}ing.",
            'hint': "Look at the action in the image.",
            'xp_value': 10,
            'vocabulary_tested': 'action_verbs',
            'cognitive_level': 'remember'
        }
    
    elif question_type == 'pronunciation':
        action_word = random.choice(action_verbs + daily_actions)
        return {
            'question_text': f"Listen and choose '{action_word}'.",
            'correct_answer': action_word,
            'explanation': f"The correct word is '{action_word}'.",
            'hint': "Listen to the pronunciation carefully.",
            'xp_value': 10,
            'vocabulary_tested': 'action_verbs',
            'cognitive_level': 'remember'
        }
    
    else:  # Default MCQ
        return generate_default_question(level, group, question_type)

def generate_time_days_question(level, group, question_type, local_level):
    """Generate questions for Time & Days group"""
    
    time_words = ['today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening', 'night']
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    question_words = ['what', 'where', 'when', 'who', 'why', 'how', 'which']
    
    if question_type == 'mcq':
        if local_level <= 15:  # Time words
            correct_word = random.choice(time_words)
            wrong_words = random.sample([w for w in time_words if w != correct_word], 3)
            
            return {
                'question_text': f"What do we call the time after 12 PM?",
                'options': {
                    'A': 'afternoon',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'afternoon',
                'explanation': "The time after 12 PM is called afternoon.",
                'hint': "Think about what we call the time after lunch.",
                'xp_value': 10,
                'vocabulary_tested': 'time_words',
                'cognitive_level': 'remember'
            }
        else:  # Days and question words
            correct_word = random.choice(days)
            wrong_words = random.sample([w for w in days if w != correct_word], 3)
            
            return {
                'question_text': f"What day comes after Monday?",
                'options': {
                    'A': 'tuesday',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'tuesday',
                'explanation': "Tuesday comes after Monday.",
                'hint': "Think about the order of days in a week.",
                'xp_value': 10,
                'vocabulary_tested': 'days',
                'cognitive_level': 'remember'
            }
    
    elif question_type == 'fill_blank':
        if local_level <= 15:  # Time words
            return {
                'question_text': "The time after 12 PM is called ___.",
                'correct_answer': 'afternoon',
                'explanation': "The time after 12 PM is called afternoon.",
                'hint': "Think about what we call the time after lunch.",
                'xp_value': 10,
                'vocabulary_tested': 'time_words',
                'cognitive_level': 'remember'
            }
        else:  # Days
            return {
                'question_text': "___ comes after Monday.",
                'correct_answer': 'tuesday',
                'explanation': "Tuesday comes after Monday.",
                'hint': "Think about the order of days in a week.",
                'xp_value': 10,
                'vocabulary_tested': 'days',
                'cognitive_level': 'remember'
            }
    
    elif question_type == 'image_matching':
        time_word = random.choice(time_words + days)
        return {
            'question_text': f"Match the image to '{time_word}'.",
            'correct_answer': time_word,
            'explanation': f"The image shows {time_word}.",
            'hint': "Look at the time or day shown in the image.",
            'xp_value': 10,
            'vocabulary_tested': 'time_days',
            'cognitive_level': 'remember'
        }
    
    elif question_type == 'pronunciation':
        time_word = random.choice(time_words + days)
        return {
            'question_text': f"Listen and choose '{time_word}'.",
            'correct_answer': time_word,
            'explanation': f"The correct word is '{time_word}'.",
            'hint': "Listen to the pronunciation carefully.",
            'xp_value': 10,
            'vocabulary_tested': 'time_days',
            'cognitive_level': 'remember'
        }
    
    else:  # Default MCQ
        return generate_default_question(level, group, question_type)

def generate_question_words_question(level, group, question_type, local_level):
    """Generate questions for Question Words & Review group"""
    
    question_words = ['what', 'where', 'when', 'who', 'why', 'how', 'which']
    review_words = ['apple', 'book', 'cat', 'dog', 'house', 'tree', 'water', 'sun', 'moon', 'star']
    
    if question_type == 'mcq':
        if local_level <= 15:  # Question words
            correct_word = random.choice(question_words)
            wrong_words = random.sample([w for w in question_words if w != correct_word], 3)
            
            return {
                'question_text': f"___ is your name?",
                'options': {
                    'A': 'what',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'what',
                'explanation': "What is your name? is the correct question.",
                'hint': "Think about which question word asks for information.",
                'xp_value': 10,
                'vocabulary_tested': 'question_words',
                'cognitive_level': 'understand'
            }
        else:  # Review words
            correct_word = random.choice(review_words)
            wrong_words = random.sample([w for w in review_words if w != correct_word], 3)
            
            return {
                'question_text': f"Which word is a fruit?",
                'options': {
                    'A': 'apple',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'apple',
                'explanation': "Apple is a fruit.",
                'hint': "Think about which word is a type of fruit.",
                'xp_value': 10,
                'vocabulary_tested': 'review_words',
                'cognitive_level': 'remember'
            }
    
    elif question_type == 'fill_blank':
        if local_level <= 15:  # Question words
            return {
                'question_text': "___ is your name?",
                'correct_answer': 'what',
                'explanation': "What is your name? is the correct question.",
                'hint': "Think about which question word asks for information.",
                'xp_value': 10,
                'vocabulary_tested': 'question_words',
                'cognitive_level': 'understand'
            }
        else:  # Review words
            return {
                'question_text': "An ___ is a fruit.",
                'correct_answer': 'apple',
                'explanation': "An apple is a fruit.",
                'hint': "Think about which word is a type of fruit.",
                'xp_value': 10,
                'vocabulary_tested': 'review_words',
                'cognitive_level': 'remember'
            }
    
    elif question_type == 'image_matching':
        word = random.choice(question_words + review_words)
        return {
            'question_text': f"Match the image to '{word}'.",
            'correct_answer': word,
            'explanation': f"The image shows {word}.",
            'hint': "Look at the image carefully.",
            'xp_value': 10,
            'vocabulary_tested': 'question_words_review',
            'cognitive_level': 'remember'
        }
    
    elif question_type == 'pronunciation':
        word = random.choice(question_words + review_words)
        return {
            'question_text': f"Listen and choose '{word}'.",
            'correct_answer': word,
            'explanation': f"The correct word is '{word}'.",
            'hint': "Listen to the pronunciation carefully.",
            'xp_value': 10,
            'vocabulary_tested': 'question_words_review',
            'cognitive_level': 'remember'
        }
    
    else:  # Default MCQ
        return generate_default_question(level, group, question_type)

def generate_default_question(level, group, question_type):
    """Generate default question"""
    return {
        'question_text': f"What is the correct answer?",
        'options': {
            'A': 'Option A',
            'B': 'Option B',
            'C': 'Option C',
            'D': 'Option D'
        },
        'correct_answer': 'Option A',
        'explanation': "This is the correct answer.",
        'hint': "Think carefully.",
        'xp_value': 10,
        'vocabulary_tested': 'general',
        'cognitive_level': 'remember'
    }

def main():
    """Main function to create Groups 5-8 content"""
    print("Starting Groups 5-8 content creation...")
    
    try:
        groups = create_groups_5_8()
        
        print(f"\nGroups 5-8 content creation completed!")
        print(f"Created groups: {len(groups)}")
        
        # Verify content was created
        total_levels = Level.objects.filter(group__group_number__in=[5,6,7,8]).count()
        total_questions = Question.objects.filter(level__group__group_number__in=[5,6,7,8]).count()
        
        print(f"Total levels created: {total_levels}")
        print(f"Total questions created: {total_questions}")
        
    except Exception as e:
        print(f"Error creating Groups 5-8 content: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()

