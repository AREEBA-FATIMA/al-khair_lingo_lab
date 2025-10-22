#!/usr/bin/env python
"""
Create 600 questions for Groups 1-4 (6 questions per level, 100 levels total)
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

def create_questions_for_groups():
    """Create 600 questions for Groups 1-4"""
    print("Creating 600 questions for Groups 1-4...")
    
    # Get groups 1-4
    groups = Group.objects.filter(group_number__in=[1, 2, 3, 4]).order_by('group_number')
    
    total_questions_created = 0
    
    for group in groups:
        print(f"\nCreating questions for Group {group.group_number}: {group.name}")
        
        # Get levels for this group
        levels = Level.objects.filter(group=group).order_by('level_number')
        
        for level in levels:
            print(f"  Creating questions for Level {level.level_number}...")
            
            # Create 6 questions per level
            questions_created = create_questions_for_level(level, group)
            total_questions_created += questions_created
            
            print(f"    Created {questions_created} questions")
    
    print(f"\nTotal questions created: {total_questions_created}")
    return total_questions_created

def create_questions_for_level(level, group):
    """Create 6 questions for a specific level"""
    questions_created = 0
    
    # Define question types for each group
    question_types = get_question_types_for_group(group.group_number)
    
    for i, question_type in enumerate(question_types):
        try:
            question_data = generate_question_data(level, group, question_type, i + 1)
            
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
            
            questions_created += 1
            
        except Exception as e:
            print(f"    Error creating question {i+1}: {str(e)}")
            continue
    
    return questions_created

def get_question_types_for_group(group_number):
    """Get question types for each group"""
    if group_number == 1:  # Foundation - Alphabet, Numbers, Colors
        return ['mcq', 'fill_blank', 'image_matching', 'pronunciation', 'mcq', 'fill_blank']
    elif group_number == 2:  # Family & Body
        return ['mcq', 'fill_blank', 'image_matching', 'pronunciation', 'mcq', 'fill_blank']
    elif group_number == 3:  # Animals & Nature
        return ['mcq', 'fill_blank', 'image_matching', 'pronunciation', 'mcq', 'fill_blank']
    elif group_number == 4:  # Food & Drinks
        return ['mcq', 'fill_blank', 'image_matching', 'pronunciation', 'mcq', 'fill_blank']
    else:
        return ['mcq', 'fill_blank', 'image_matching', 'pronunciation', 'mcq', 'fill_blank']

def generate_question_data(level, group, question_type, question_order):
    """Generate question data based on level, group, and question type"""
    
    # Get vocabulary and grammar for this level
    vocabulary_words = level.vocabulary_words or []
    grammar_points = level.grammar_points or []
    
    if question_type == 'mcq':
        return generate_mcq_question(level, group, vocabulary_words, grammar_points)
    elif question_type == 'fill_blank':
        return generate_fill_blank_question(level, group, vocabulary_words, grammar_points)
    elif question_type == 'image_matching':
        return generate_image_matching_question(level, group, vocabulary_words)
    elif question_type == 'pronunciation':
        return generate_pronunciation_question(level, group, vocabulary_words)
    else:
        return generate_mcq_question(level, group, vocabulary_words, grammar_points)

def generate_mcq_question(level, group, vocabulary_words, grammar_points):
    """Generate multiple choice question"""
    
    # Group-specific content
    if group.group_number == 1:  # Foundation
        if level.level_number <= 5:  # Alphabet
            letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
            correct_letter = random.choice(letters)
            wrong_letters = random.sample([l for l in letters if l != correct_letter], 3)
            
            return {
                'question_text': f"What letter comes after '{correct_letter}'?",
                'options': {
                    'A': chr(ord(correct_letter) + 1) if ord(correct_letter) < 90 else 'A',
                    'B': wrong_letters[0],
                    'C': wrong_letters[1],
                    'D': wrong_letters[2]
                },
                'correct_answer': chr(ord(correct_letter) + 1) if ord(correct_letter) < 90 else 'A',
                'explanation': f"The letter after '{correct_letter}' is '{chr(ord(correct_letter) + 1) if ord(correct_letter) < 90 else 'A'}' in the English alphabet.",
                'hint': "Think about the order of letters in the alphabet.",
                'xp_value': 10,
                'vocabulary_tested': 'alphabet',
                'cognitive_level': 'remember'
            }
        
        elif level.level_number <= 10:  # Numbers
            numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
            correct_num = random.choice(numbers)
            wrong_nums = random.sample([n for n in numbers if n != correct_num], 3)
            
            return {
                'question_text': f"What is the number '{correct_num}' in English?",
                'options': {
                    'A': number_to_word(correct_num),
                    'B': number_to_word(wrong_nums[0]),
                    'C': number_to_word(wrong_nums[1]),
                    'D': number_to_word(wrong_nums[2])
                },
                'correct_answer': number_to_word(correct_num),
                'explanation': f"The number '{correct_num}' is written as '{number_to_word(correct_num)}' in English.",
                'hint': "Remember the English words for numbers.",
                'xp_value': 10,
                'vocabulary_tested': 'numbers',
                'cognitive_level': 'remember'
            }
        
        elif level.level_number <= 15:  # Colors
            colors = ['red', 'blue', 'yellow', 'green', 'black', 'white', 'brown', 'orange', 'pink', 'purple']
            correct_color = random.choice(colors)
            wrong_colors = random.sample([c for c in colors if c != correct_color], 3)
            
            return {
                'question_text': f"What color is the sun?",
                'options': {
                    'A': 'yellow',
                    'B': wrong_colors[0],
                    'C': wrong_colors[1],
                    'D': wrong_colors[2]
                },
                'correct_answer': 'yellow',
                'explanation': "The sun is yellow in color.",
                'hint': "Think about what color you see when you look at the sun.",
                'xp_value': 10,
                'vocabulary_tested': 'colors',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 2:  # Family & Body
        family_words = ['mother', 'father', 'sister', 'brother', 'baby', 'family', 'grandmother', 'grandfather']
        body_words = ['head', 'face', 'eyes', 'nose', 'mouth', 'ears', 'arms', 'hands', 'legs', 'feet']
        
        if level.level_number <= 35:  # Family
            correct_word = random.choice(family_words)
            wrong_words = random.sample([w for w in family_words if w != correct_word], 3)
            
            return {
                'question_text': f"Who is your father's mother?",
                'options': {
                    'A': 'grandmother',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'grandmother',
                'explanation': "Your father's mother is your grandmother.",
                'hint': "Think about family relationships.",
                'xp_value': 10,
                'vocabulary_tested': 'family',
                'cognitive_level': 'understand'
            }
        
        else:  # Body parts
            correct_word = random.choice(body_words)
            wrong_words = random.sample([w for w in body_words if w != correct_word], 3)
            
            return {
                'question_text': f"Which part of your body do you use to see?",
                'options': {
                    'A': 'eyes',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'eyes',
                'explanation': "You use your eyes to see.",
                'hint': "Think about which body part helps you see things.",
                'xp_value': 10,
                'vocabulary_tested': 'body',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 3:  # Animals & Nature
        animals = ['cat', 'dog', 'bird', 'fish', 'cow', 'hen', 'horse', 'sheep', 'goat', 'lion', 'tiger', 'elephant', 'monkey', 'bear', 'rabbit']
        nature_words = ['sun', 'moon', 'star', 'tree', 'flower', 'water', 'rain', 'wind', 'hot', 'cold', 'sunny', 'rainy', 'cloudy']
        
        if level.level_number <= 65:  # Animals
            correct_word = random.choice(animals)
            wrong_words = random.sample([w for w in animals if w != correct_word], 3)
            
            return {
                'question_text': f"Which animal says 'meow'?",
                'options': {
                    'A': 'cat',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'cat',
                'explanation': "A cat says 'meow'.",
                'hint': "Think about the sound a cat makes.",
                'xp_value': 10,
                'vocabulary_tested': 'animals',
                'cognitive_level': 'remember'
            }
        
        else:  # Nature
            correct_word = random.choice(nature_words)
            wrong_words = random.sample([w for w in nature_words if w != correct_word], 3)
            
            return {
                'question_text': f"What do we call water falling from the sky?",
                'options': {
                    'A': 'rain',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'rain',
                'explanation': "Water falling from the sky is called rain.",
                'hint': "Think about what happens when it's wet outside.",
                'xp_value': 10,
                'vocabulary_tested': 'nature',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 4:  # Food & Drinks
        foods = ['bread', 'rice', 'egg', 'milk', 'water', 'apple', 'banana', 'orange', 'mango', 'carrot', 'tomato', 'potato', 'chicken', 'fish', 'meat']
        meals = ['breakfast', 'lunch', 'dinner', 'hungry', 'thirsty', 'eat', 'drink']
        
        if level.level_number <= 90:  # Foods
            correct_word = random.choice(foods)
            wrong_words = random.sample([w for w in foods if w != correct_word], 3)
            
            return {
                'question_text': f"Which food is red and round?",
                'options': {
                    'A': 'tomato',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'tomato',
                'explanation': "A tomato is red and round.",
                'hint': "Think about a red, round vegetable.",
                'xp_value': 10,
                'vocabulary_tested': 'food',
                'cognitive_level': 'remember'
            }
        
        else:  # Meals
            correct_word = random.choice(meals)
            wrong_words = random.sample([w for w in meals if w != correct_word], 3)
            
            return {
                'question_text': f"What do we call the first meal of the day?",
                'options': {
                    'A': 'breakfast',
                    'B': wrong_words[0],
                    'C': wrong_words[1],
                    'D': wrong_words[2]
                },
                'correct_answer': 'breakfast',
                'explanation': "The first meal of the day is called breakfast.",
                'hint': "Think about what you eat in the morning.",
                'xp_value': 10,
                'vocabulary_tested': 'meals',
                'cognitive_level': 'remember'
            }
    
    # Default fallback
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

def generate_fill_blank_question(level, group, vocabulary_words, grammar_points):
    """Generate fill in the blank question"""
    
    if group.group_number == 1:  # Foundation
        if level.level_number <= 5:  # Alphabet
            return {
                'question_text': "The letter 'A' comes before the letter '___'.",
                'correct_answer': 'B',
                'explanation': "The letter 'A' comes before the letter 'B' in the alphabet.",
                'hint': "Think about the order of letters in the alphabet.",
                'xp_value': 10,
                'vocabulary_tested': 'alphabet',
                'cognitive_level': 'remember'
            }
        
        elif level.level_number <= 10:  # Numbers
            num = random.randint(1, 20)
            return {
                'question_text': f"The number {num} is written as '___' in English.",
                'correct_answer': number_to_word(num),
                'explanation': f"The number {num} is written as '{number_to_word(num)}' in English.",
                'hint': "Remember the English words for numbers.",
                'xp_value': 10,
                'vocabulary_tested': 'numbers',
                'cognitive_level': 'remember'
            }
        
        elif level.level_number <= 15:  # Colors
            return {
                'question_text': "The sky is ___ in color.",
                'correct_answer': 'blue',
                'explanation': "The sky is blue in color.",
                'hint': "Think about the color of the sky on a clear day.",
                'xp_value': 10,
                'vocabulary_tested': 'colors',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 2:  # Family & Body
        if level.level_number <= 35:  # Family
            return {
                'question_text': "My father's father is my ___.",
                'correct_answer': 'grandfather',
                'explanation': "My father's father is my grandfather.",
                'hint': "Think about family relationships.",
                'xp_value': 10,
                'vocabulary_tested': 'family',
                'cognitive_level': 'understand'
            }
        
        else:  # Body parts
            return {
                'question_text': "I use my ___ to see.",
                'correct_answer': 'eyes',
                'explanation': "I use my eyes to see.",
                'hint': "Think about which body part helps you see.",
                'xp_value': 10,
                'vocabulary_tested': 'body',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 3:  # Animals & Nature
        if level.level_number <= 65:  # Animals
            return {
                'question_text': "A ___ says 'meow'.",
                'correct_answer': 'cat',
                'explanation': "A cat says 'meow'.",
                'hint': "Think about which animal makes this sound.",
                'xp_value': 10,
                'vocabulary_tested': 'animals',
                'cognitive_level': 'remember'
            }
        
        else:  # Nature
            return {
                'question_text': "Water falling from the sky is called ___.",
                'correct_answer': 'rain',
                'explanation': "Water falling from the sky is called rain.",
                'hint': "Think about what happens when it's wet outside.",
                'xp_value': 10,
                'vocabulary_tested': 'nature',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 4:  # Food & Drinks
        if level.level_number <= 90:  # Foods
            return {
                'question_text': "A ___ is red and round.",
                'correct_answer': 'tomato',
                'explanation': "A tomato is red and round.",
                'hint': "Think about a red, round vegetable.",
                'xp_value': 10,
                'vocabulary_tested': 'food',
                'cognitive_level': 'remember'
            }
        
        else:  # Meals
            return {
                'question_text': "The first meal of the day is called ___.",
                'correct_answer': 'breakfast',
                'explanation': "The first meal of the day is called breakfast.",
                'hint': "Think about what you eat in the morning.",
                'xp_value': 10,
                'vocabulary_tested': 'meals',
                'cognitive_level': 'remember'
            }
    
    # Default fallback
    return {
        'question_text': "Fill in the blank: This is a ___ question.",
        'correct_answer': 'sample',
        'explanation': "This is a sample question.",
        'hint': "Think about the context.",
        'xp_value': 10,
        'vocabulary_tested': 'general',
        'cognitive_level': 'remember'
    }

def generate_image_matching_question(level, group, vocabulary_words):
    """Generate image matching question"""
    
    if group.group_number == 1:  # Foundation
        if level.level_number <= 5:  # Alphabet
            letter = random.choice(['A', 'B', 'C', 'D', 'E'])
            return {
                'question_text': f"Match the image to the letter '{letter}'.",
                'correct_answer': letter,
                'explanation': f"The image shows the letter '{letter}'.",
                'hint': "Look at the shape of the letter in the image.",
                'xp_value': 10,
                'vocabulary_tested': 'alphabet',
                'cognitive_level': 'remember'
            }
        
        elif level.level_number <= 10:  # Numbers
            num = random.randint(1, 10)
            return {
                'question_text': f"Match the image to the number {num}.",
                'correct_answer': number_to_word(num),
                'explanation': f"The image shows the number {num} which is '{number_to_word(num)}' in English.",
                'hint': "Count the objects in the image.",
                'xp_value': 10,
                'vocabulary_tested': 'numbers',
                'cognitive_level': 'remember'
            }
        
        elif level.level_number <= 15:  # Colors
            color = random.choice(['red', 'blue', 'yellow', 'green'])
            return {
                'question_text': f"Match the image to the color '{color}'.",
                'correct_answer': color,
                'explanation': f"The image shows the color '{color}'.",
                'hint': "Look at the color of the object in the image.",
                'xp_value': 10,
                'vocabulary_tested': 'colors',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 2:  # Family & Body
        if level.level_number <= 35:  # Family
            family_member = random.choice(['mother', 'father', 'sister', 'brother'])
            return {
                'question_text': f"Match the image to '{family_member}'.",
                'correct_answer': family_member,
                'explanation': f"The image shows a {family_member}.",
                'hint': "Look at the person in the image and their relationship.",
                'xp_value': 10,
                'vocabulary_tested': 'family',
                'cognitive_level': 'remember'
            }
        
        else:  # Body parts
            body_part = random.choice(['head', 'eyes', 'nose', 'mouth', 'hands', 'feet'])
            return {
                'question_text': f"Match the image to '{body_part}'.",
                'correct_answer': body_part,
                'explanation': f"The image shows {body_part}.",
                'hint': "Look at the body part shown in the image.",
                'xp_value': 10,
                'vocabulary_tested': 'body',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 3:  # Animals & Nature
        if level.level_number <= 65:  # Animals
            animal = random.choice(['cat', 'dog', 'bird', 'fish', 'cow', 'horse'])
            return {
                'question_text': f"Match the image to '{animal}'.",
                'correct_answer': animal,
                'explanation': f"The image shows a {animal}.",
                'hint': "Look at the animal in the image.",
                'xp_value': 10,
                'vocabulary_tested': 'animals',
                'cognitive_level': 'remember'
            }
        
        else:  # Nature
            nature_item = random.choice(['sun', 'moon', 'tree', 'flower', 'water'])
            return {
                'question_text': f"Match the image to '{nature_item}'.",
                'correct_answer': nature_item,
                'explanation': f"The image shows {nature_item}.",
                'hint': "Look at the natural object in the image.",
                'xp_value': 10,
                'vocabulary_tested': 'nature',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 4:  # Food & Drinks
        if level.level_number <= 90:  # Foods
            food = random.choice(['apple', 'banana', 'bread', 'milk', 'rice', 'egg'])
            return {
                'question_text': f"Match the image to '{food}'.",
                'correct_answer': food,
                'explanation': f"The image shows {food}.",
                'hint': "Look at the food item in the image.",
                'xp_value': 10,
                'vocabulary_tested': 'food',
                'cognitive_level': 'remember'
            }
        
        else:  # Meals
            meal = random.choice(['breakfast', 'lunch', 'dinner'])
            return {
                'question_text': f"Match the image to '{meal}'.",
                'correct_answer': meal,
                'explanation': f"The image shows {meal}.",
                'hint': "Look at the meal time shown in the image.",
                'xp_value': 10,
                'vocabulary_tested': 'meals',
                'cognitive_level': 'remember'
            }
    
    # Default fallback
    return {
        'question_text': "Match the image to the correct word.",
        'correct_answer': 'sample',
        'explanation': "The image shows a sample item.",
        'hint': "Look at the image carefully.",
        'xp_value': 10,
        'vocabulary_tested': 'general',
        'cognitive_level': 'remember'
    }

def generate_pronunciation_question(level, group, vocabulary_words):
    """Generate pronunciation question"""
    
    if group.group_number == 1:  # Foundation
        if level.level_number <= 5:  # Alphabet
            letter = random.choice(['A', 'B', 'C', 'D', 'E'])
            return {
                'question_text': f"Listen and choose the correct letter: '{letter}'.",
                'correct_answer': letter,
                'explanation': f"The correct letter is '{letter}'.",
                'hint': "Listen carefully to the pronunciation.",
                'xp_value': 10,
                'vocabulary_tested': 'alphabet',
                'cognitive_level': 'remember'
            }
        
        elif level.level_number <= 10:  # Numbers
            num = random.randint(1, 10)
            return {
                'question_text': f"Listen and choose the correct number: {num}.",
                'correct_answer': number_to_word(num),
                'explanation': f"The correct number is {num} which is '{number_to_word(num)}' in English.",
                'hint': "Listen to the pronunciation of the number.",
                'xp_value': 10,
                'vocabulary_tested': 'numbers',
                'cognitive_level': 'remember'
            }
        
        elif level.level_number <= 15:  # Colors
            color = random.choice(['red', 'blue', 'yellow', 'green'])
            return {
                'question_text': f"Listen and choose the correct color: '{color}'.",
                'correct_answer': color,
                'explanation': f"The correct color is '{color}'.",
                'hint': "Listen to the pronunciation of the color.",
                'xp_value': 10,
                'vocabulary_tested': 'colors',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 2:  # Family & Body
        if level.level_number <= 35:  # Family
            family_member = random.choice(['mother', 'father', 'sister', 'brother'])
            return {
                'question_text': f"Listen and choose the correct family member: '{family_member}'.",
                'correct_answer': family_member,
                'explanation': f"The correct family member is '{family_member}'.",
                'hint': "Listen to the pronunciation of the family member.",
                'xp_value': 10,
                'vocabulary_tested': 'family',
                'cognitive_level': 'remember'
            }
        
        else:  # Body parts
            body_part = random.choice(['head', 'eyes', 'nose', 'mouth', 'hands', 'feet'])
            return {
                'question_text': f"Listen and choose the correct body part: '{body_part}'.",
                'correct_answer': body_part,
                'explanation': f"The correct body part is '{body_part}'.",
                'hint': "Listen to the pronunciation of the body part.",
                'xp_value': 10,
                'vocabulary_tested': 'body',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 3:  # Animals & Nature
        if level.level_number <= 65:  # Animals
            animal = random.choice(['cat', 'dog', 'bird', 'fish', 'cow', 'horse'])
            return {
                'question_text': f"Listen and choose the correct animal: '{animal}'.",
                'correct_answer': animal,
                'explanation': f"The correct animal is '{animal}'.",
                'hint': "Listen to the pronunciation of the animal.",
                'xp_value': 10,
                'vocabulary_tested': 'animals',
                'cognitive_level': 'remember'
            }
        
        else:  # Nature
            nature_item = random.choice(['sun', 'moon', 'tree', 'flower', 'water'])
            return {
                'question_text': f"Listen and choose the correct nature item: '{nature_item}'.",
                'correct_answer': nature_item,
                'explanation': f"The correct nature item is '{nature_item}'.",
                'hint': "Listen to the pronunciation of the nature item.",
                'xp_value': 10,
                'vocabulary_tested': 'nature',
                'cognitive_level': 'remember'
            }
    
    elif group.group_number == 4:  # Food & Drinks
        if level.level_number <= 90:  # Foods
            food = random.choice(['apple', 'banana', 'bread', 'milk', 'rice', 'egg'])
            return {
                'question_text': f"Listen and choose the correct food: '{food}'.",
                'correct_answer': food,
                'explanation': f"The correct food is '{food}'.",
                'hint': "Listen to the pronunciation of the food.",
                'xp_value': 10,
                'vocabulary_tested': 'food',
                'cognitive_level': 'remember'
            }
        
        else:  # Meals
            meal = random.choice(['breakfast', 'lunch', 'dinner'])
            return {
                'question_text': f"Listen and choose the correct meal: '{meal}'.",
                'correct_answer': meal,
                'explanation': f"The correct meal is '{meal}'.",
                'hint': "Listen to the pronunciation of the meal.",
                'xp_value': 10,
                'vocabulary_tested': 'meals',
                'cognitive_level': 'remember'
            }
    
    # Default fallback
    return {
        'question_text': "Listen and choose the correct answer.",
        'correct_answer': 'sample',
        'explanation': "The correct answer is sample.",
        'hint': "Listen carefully to the pronunciation.",
        'xp_value': 10,
        'vocabulary_tested': 'general',
        'cognitive_level': 'remember'
    }

def number_to_word(num):
    """Convert number to word"""
    number_words = {
        1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
        6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
        11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen',
        16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty'
    }
    return number_words.get(num, str(num))

def main():
    """Main function to create questions"""
    print("Starting question creation for Groups 1-4...")
    
    try:
        total_questions = create_questions_for_groups()
        print(f"\nQuestion creation completed!")
        print(f"Total questions created: {total_questions}")
        
        # Verify questions were created
        total_questions_in_db = Question.objects.filter(level__group__group_number__in=[1,2,3,4]).count()
        print(f"Total questions in database: {total_questions_in_db}")
        
    except Exception as e:
        print(f"Error creating questions: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()

