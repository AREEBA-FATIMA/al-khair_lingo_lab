#!/usr/bin/env python
"""
Fresh System Setup Script
Creates: 1 Campus, Grades 1-10, A&B sections, Teachers, Students
"""
import os
import sys
import django
from django.contrib.auth import get_user_model

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'englishmaster.settings')
django.setup()

from campus.models import Campus
from classes.models import Grade, ClassRoom
from teachers.models import Teacher
from students.models import Student
from users.models import User

def clear_all_data():
    """Clear all existing data"""
    print("🧹 Clearing all existing data...")
    
    # Delete in reverse order to avoid foreign key constraints
    Student.objects.all().delete()
    Teacher.objects.all().delete()
    ClassRoom.objects.all().delete()
    Grade.objects.all().delete()
    Campus.objects.all().delete()
    
    # Keep superuser, delete other users
    User.objects.exclude(is_superuser=True).delete()
    
    print("✅ All data cleared!")

def create_campus():
    """Create main campus"""
    print("\n🏫 Creating campus...")
    
    campus = Campus.objects.create(
        campus_name="Main Campus",
        registration_number="MC001",
        address_full="123 Education Street, Karachi",
        city="Karachi",
        district="Karachi",
        postal_code="75000",
        campus_head_name="Dr. Ahmed Khan",
        campus_head_phone="+92-300-1234567",
        campus_head_email="ahmed.khan@maincampus.edu.pk",
        campus_type="main",
        shift_available="Morning, Afternoon",
        status="active",
        total_teachers=20,
        total_students=100,
        student_capacity=200,
        total_classrooms=20,
        avg_class_size=25,
        academic_year_start="2024-01-01",
        academic_year_end="2024-12-31",
        established_year=2020,
        instruction_language="English",
        governing_body="Education Board",
        accreditation="Accredited"
    )
    
    print(f"✅ Campus created: {campus.campus_name}")
    return campus

def create_grades_and_classes(campus):
    """Create grades 1-10 with A,B sections"""
    print("\n📚 Creating grades and classes...")
    
    grades_created = 0
    classes_created = 0
    
    for grade_num in range(1, 11):
        grade_name = f"Grade {grade_num}"
        
        # Create grade
        grade = Grade.objects.create(
            name=grade_name,
            campus=campus
        )
        grades_created += 1
        print(f"  ✅ Grade: {grade.name} - {grade.code}")
        
        # Create sections A and B
        for section in ['A', 'B']:
            classroom = ClassRoom.objects.create(
                grade=grade,
                section=section,
                shift='morning',
                capacity=25
            )
            classes_created += 1
            print(f"    ✅ Class: {grade_name} - {section} - {classroom.code}")
    
    print(f"\n📊 Summary: {grades_created} grades, {classes_created} classes created")
    return ClassRoom.objects.all()

def create_teachers(campus, classrooms):
    """Create teachers for each class"""
    print("\n👨‍🏫 Creating teachers...")
    
    teachers_created = 0
    users_created = 0
    
    for i, classroom in enumerate(classrooms, 1):
        teacher_name = f"Teacher {i}"
        teacher_email = f"teacher{i}@maincampus.edu.pk"
        
        # Create teacher profile with get_or_create
        teacher, created = Teacher.objects.get_or_create(
            email=teacher_email,
            defaults={
                'name': teacher_name,
                'father_name': f"Mr. {teacher_name} Father",
                'campus': campus,
                'is_active': True
            }
        )
        
        if created:
            teachers_created += 1
        
        # Assign teacher to classroom
        classroom.class_teacher = teacher
        classroom.save()
        
        # Create user account with get_or_create
        user, user_created = User.objects.get_or_create(
            email=teacher_email,
            defaults={
                'username': f"teacher{i}",
                'role': 'teacher',
                'first_name': teacher_name.split()[0],
                'last_name': teacher_name.split()[-1] if len(teacher_name.split()) > 1 else '',
                'is_staff': True,
                'is_active': True
            }
        )
        
        if user_created:
            user.set_password('teacher123')
            user.save()
            users_created += 1
        
        print(f"  ✅ Teacher: {teacher.name} - {teacher.teacher_id} - Class: {classroom}")
    
    print(f"\n📊 Summary: {teachers_created} teachers, {users_created} user accounts created")
    return Teacher.objects.all()

def create_students(classrooms):
    """Create 5 students per class"""
    print("\n👨‍🎓 Creating students...")
    
    students_created = 0
    users_created = 0
    
    for classroom in classrooms:
        for student_num in range(1, 6):
            student_name = f"Student {student_num}"
            student_email = f"student{classroom.grade.name.replace(' ', '')}{classroom.section}{student_num}@maincampus.edu.pk"
            
            # Create student profile
            student = Student.objects.create(
                name=student_name,
                father_name=f"Mr. {student_name} Father",
                campus=classroom.grade.campus,
                grade=classroom.grade.name,
                section=classroom.section,
                class_teacher=classroom.class_teacher,
                is_active=True
            )
            students_created += 1
            
            # Create user account
            user = User.objects.create(
                username=f"student{classroom.grade.name.replace(' ', '')}{classroom.section}{student_num}",
                email=student_email,
                role='student',
                first_name=student_name.split()[0],
                last_name=student_name.split()[-1] if len(student_name.split()) > 1 else '',
                student_id=student.student_id,
                is_active=True
            )
            user.set_password('student123')
            user.save()
            users_created += 1
            
            print(f"  ✅ Student: {student.name} - {student.student_id} - Class: {classroom}")
    
    print(f"\n📊 Summary: {students_created} students, {users_created} user accounts created")
    return Student.objects.all()

def create_sample_progress():
    """Create sample progress data for students"""
    print("\n📈 Creating sample progress data...")
    
    from progress.models import LevelProgress
    from levels.models import Level
    
    # Get some levels
    levels = Level.objects.all()[:5]  # First 5 levels
    
    if not levels.exists():
        print("⚠️  No levels found. Creating sample levels...")
        from groups.models import Group
        groups = Group.objects.all()[:2]  # First 2 groups
        
        for group in groups:
            for level_num in range(1, 4):  # 3 levels per group
                Level.objects.create(
                    group=group,
                    level_number=level_num,
                    title=f"Level {level_num}",
                    description=f"Sample level {level_num}",
                    is_active=True
                )
        
        levels = Level.objects.all()[:5]
    
    # Create progress for some students
    students = Student.objects.all()[:10]  # First 10 students
    progress_created = 0
    
    for student in students:
        user = User.objects.filter(student_id=student.student_id).first()
        if user:
            for level in levels:
                LevelProgress.objects.create(
                    user=user,
                    level=level,
                    is_completed=True,
                    completion_percentage=85.0,
                    questions_answered=6,
                    correct_answers=5,
                    xp_earned=50,
                    time_spent=300  # 5 minutes
                )
                progress_created += 1
    
    print(f"✅ Created {progress_created} progress records")

def main():
    print("🚀 Starting Fresh System Setup...")
    
    # Step 1: Clear existing data
    clear_all_data()
    
    # Step 2: Create campus
    campus = create_campus()
    
    # Step 3: Create grades and classes
    classrooms = create_grades_and_classes(campus)
    
    # Step 4: Create teachers
    teachers = create_teachers(campus, classrooms)
    
    # Step 5: Create students
    students = create_students(classrooms)
    
    # Step 6: Create sample progress
    create_sample_progress()
    
    print("\n🎉 Fresh System Setup Complete!")
    print(f"📊 Final Summary:")
    print(f"  🏫 Campus: {Campus.objects.count()}")
    print(f"  📚 Grades: {Grade.objects.count()}")
    print(f"  🏛️  Classes: {ClassRoom.objects.count()}")
    print(f"  👨‍🏫 Teachers: {Teacher.objects.count()}")
    print(f"  👨‍🎓 Students: {Student.objects.count()}")
    print(f"  👤 Users: {User.objects.count()}")
    
    print(f"\n🔑 Login Credentials:")
    print(f"  👨‍🏫 Teacher: teacher1 / teacher123")
    print(f"  👨‍🎓 Student: studentGrade1A1 / student123")
    print(f"  🔧 Superuser: admin / admin")

if __name__ == "__main__":
    main()
