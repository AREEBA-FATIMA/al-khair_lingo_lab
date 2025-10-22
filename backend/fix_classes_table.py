#!/usr/bin/env python
"""
Fix classes_grade table by adding missing columns
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'englishmaster.settings')
django.setup()

from django.db import connection

def fix_classes_table():
    """Add missing columns to classes_grade table"""
    cursor = connection.cursor()
    
    try:
        # Check if shift column exists
        cursor.execute("PRAGMA table_info(classes_grade)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'shift' not in columns:
            print("Adding shift column...")
            cursor.execute('ALTER TABLE classes_grade ADD COLUMN shift varchar(20) DEFAULT "morning"')
            print("Shift column added")
        else:
            print("Shift column already exists")
            
        if 'english_teacher_id' not in columns:
            print("Adding english_teacher_id column...")
            cursor.execute('ALTER TABLE classes_grade ADD COLUMN english_teacher_id INTEGER')
            print("English teacher ID column added")
        else:
            print("English teacher ID column already exists")
            
        # Commit changes
        connection.commit()
        print("Database updated successfully")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        connection.rollback()

if __name__ == '__main__':
    fix_classes_table()
