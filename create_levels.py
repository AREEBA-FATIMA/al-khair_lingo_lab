#!/usr/bin/env python3
"""
Script to create levels for all groups
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'englishmaster.settings')
django.setup()

from groups.models import Group
from levels.models import Level, Question

def create_levels_for_group(group, start_level, count):
    """Create levels for a specific group"""
    print(f"Creating {count} levels for Group {group.group_number}: {group.name}")
    
    for i in range(count):
        level_number = start_level + i
        is_test_level = (i + 1) % 10 == 0  # Every 10th level is a test
        
        level = Level.objects.create(
            name=f"Level {level_number}",
            description=f"Level {level_number} of {group.name}",
            level_number=level_number,
            group=group,
            difficulty=group.difficulty,
            xp_reward=10 + (i * 2),  # Increasing XP reward
            is_active=True,
            is_unlocked=True,
            is_test_level=is_test_level,
            test_questions_count=10 if is_test_level else 0,
            test_pass_percentage=80 if is_test_level else 0,
            test_time_limit_minutes=15 if is_test_level else 0
        )
        
        # Create 6 questions for regular levels, 10 for test levels
        question_count = 10 if is_test_level else 6
        
        for j in range(question_count):
            Question.objects.create(
                level=level,
                question_text=f"What is the correct answer for question {j+1} in level {level_number}?",
                question_type='mcq',
                options=['Option A', 'Option B', 'Option C', 'Option D'],
                correct_answer='Option A',
                hint=f"Hint for question {j+1}",
                explanation=f"Explanation for question {j+1}",
                difficulty=group.difficulty,
                xp_value=2,
                question_order=j+1,
                time_limit_seconds=30,
                is_active=True
            )
        
        print(f"  Created Level {level_number} with {question_count} questions")

def main():
    """Main function to create all levels"""
    print("Starting level creation...")
    
    # Get all groups
    groups = Group.objects.filter(is_active=True).order_by('group_number')
    
    current_level = 1
    
    for group in groups:
        if group.group_number == 0:
            # Group 0 has 20 levels
            create_levels_for_group(group, current_level, 20)
            current_level += 20
        else:
            # Other groups have 50 levels each
            create_levels_for_group(group, current_level, 50)
            current_level += 50
    
    print(f"\nLevel creation completed! Total levels created: {current_level - 1}")
    print(f"Total questions created: {Question.objects.count()}")

if __name__ == "__main__":
    main()
