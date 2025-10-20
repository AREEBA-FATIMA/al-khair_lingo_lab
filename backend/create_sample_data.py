#!/usr/bin/env python3
"""
Script to create sample groups and levels for the Duolingo-style app
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'englishmaster.settings')
django.setup()

from groups.models import Group
from levels.models import Level, Question

def create_groups():
    """Create 8 groups"""
    print("Creating groups...")
    
    groups_data = [
        {'group_number': 0, 'name': 'Beginner', 'description': 'Start your English journey', 'difficulty': 1},
        {'group_number': 1, 'name': 'Elementary', 'description': 'Basic English skills', 'difficulty': 1},
        {'group_number': 2, 'name': 'Pre-Intermediate', 'description': 'Building confidence', 'difficulty': 2},
        {'group_number': 3, 'name': 'Intermediate', 'description': 'Developing fluency', 'difficulty': 3},
        {'group_number': 4, 'name': 'Upper Intermediate', 'description': 'Advanced communication', 'difficulty': 4},
        {'group_number': 5, 'name': 'Advanced', 'description': 'Master level English', 'difficulty': 5},
        {'group_number': 6, 'name': 'Expert', 'description': 'Professional English', 'difficulty': 5},
        {'group_number': 7, 'name': 'Master', 'description': 'Native-like proficiency', 'difficulty': 5}
    ]
    
    for group_data in groups_data:
        group, created = Group.objects.get_or_create(
            group_number=group_data['group_number'],
            defaults=group_data
        )
        if created:
            print(f'✅ Created Group {group.group_number}: {group.name}')
        else:
            print(f'⚠️  Group {group.group_number} already exists')

def create_levels():
    """Create levels for all groups"""
    print("\nCreating levels...")
    
    groups = Group.objects.filter(is_active=True).order_by('group_number')
    current_level = 1
    
    for group in groups:
        if group.group_number == 0:
            # Group 0 has 20 levels
            level_count = 20
        else:
            # Other groups have 50 levels each
            level_count = 50
        
        print(f'Creating {level_count} levels for Group {group.group_number}: {group.name}')
        
        for i in range(level_count):
            level_number = current_level + i
            is_test_level = (i + 1) % 10 == 0  # Every 10th level is a test
            
            level, created = Level.objects.get_or_create(
                level_number=level_number,
                defaults={
                    'name': f"Level {level_number}",
                    'description': f"Level {level_number} of {group.name}",
                    'group': group,
                    'difficulty': group.difficulty,
                    'xp_reward': 10 + (i * 2),  # Increasing XP reward
                    'is_active': True,
                    'is_unlocked': True,
                    'is_test_level': is_test_level,
                    'test_questions_count': 10 if is_test_level else 0,
                    'test_pass_percentage': 80 if is_test_level else 0,
                    'test_time_limit_minutes': 15 if is_test_level else 0
                }
            )
            
            if created:
                # Create 6 questions for regular levels, 10 for test levels
                question_count = 10 if is_test_level else 6
                
                for j in range(question_count):
                    Question.objects.get_or_create(
                        level=level,
                        question_order=j+1,
                        defaults={
                            'question_text': f"What is the correct answer for question {j+1} in level {level_number}?",
                            'question_type': 'mcq',
                            'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                            'correct_answer': 'Option A',
                            'hint': f"Hint for question {j+1}",
                            'explanation': f"Explanation for question {j+1}",
                            'difficulty': group.difficulty,
                            'xp_value': 2,
                            'time_limit_seconds': 30,
                            'is_active': True
                        }
                    )
                
                if (i + 1) % 10 == 0:
                    print(f'  ✅ Created Level {level_number} (Test Level) with {question_count} questions')
                else:
                    print(f'  ✅ Created Level {level_number} with {question_count} questions')
            else:
                print(f'  ⚠️  Level {level_number} already exists')
        
        current_level += level_count

def main():
    """Main function to create all sample data"""
    print("🌱 Creating sample data for Duolingo-style app...")
    
    try:
        create_groups()
        create_levels()
        
        print(f"\n🎉 Sample data creation completed!")
        print(f"📊 Total Groups: {Group.objects.count()}")
        print(f"📊 Total Levels: {Level.objects.count()}")
        print(f"📊 Total Questions: {Question.objects.count()}")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        return False
    
    return True

if __name__ == '__main__':
    main()
