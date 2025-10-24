from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    class_teacher_name = serializers.CharField(source='class_teacher.name', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'name', 'father_name', 'grade', 'shift',
            'campus', 'campus_name', 'class_teacher', 'class_teacher_name',
            'password', 'student_id', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['student_id', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        """Create a new student"""
        student = Student.objects.create(**validated_data)
        return student
    
    def update(self, instance, validated_data):
        """Update an existing student"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class StudentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing students"""
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    class_teacher_name = serializers.CharField(source='class_teacher.name', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'name', 'father_name', 'grade', 'shift',
            'campus_name', 'class_teacher_name', 'student_id', 
            'is_active', 'created_at'
        ]


class StudentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new students"""
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Student
        fields = [
            'name', 'father_name', 'grade', 'shift', 'campus', 
            'password', 'confirm_password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'confirm_password': {'write_only': True}
        }
    
    def validate(self, data):
        """Validate password confirmation"""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        return data
    
    def create(self, validated_data):
        """Create a new student"""
        validated_data.pop('confirm_password')
        
        # Use Django ORM to trigger signals properly
        # Temporarily disable authentication backend to avoid request issues
        from django.conf import settings
        original_backends = settings.AUTHENTICATION_BACKENDS
        settings.AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']
        
        try:
            # Handle campus_id if passed instead of campus object
            if 'campus_id' in validated_data:
                from campus.models import Campus
                campus_id = validated_data.pop('campus_id')
                validated_data['campus'] = Campus.objects.get(id=campus_id)
            
            # Create student using ORM - this will trigger post_save signal
            student = Student.objects.create(**validated_data)
            return student
        finally:
            # Restore original authentication backends
            settings.AUTHENTICATION_BACKENDS = original_backends
    
    def _generate_student_id(self, campus_id, grade, shift):
        """Generate student ID"""
        try:
            from django.db import connection
            
            # Get campus code
            with connection.cursor() as cursor:
                cursor.execute("SELECT campus_code FROM campus_campus WHERE id = %s", [campus_id])
                campus_result = cursor.fetchone()
                campus_code = campus_result[0] if campus_result else "C01"
            
            # Get shift code
            shift_code = shift[0].upper() if shift else 'M'
            
            # Get grade code
            grade_code = grade.replace('Grade', '').replace('grade', '').strip()
            if grade_code.lower() == 'nursery':
                grade_code = 'NUR'
            elif 'kg' in grade_code.lower():
                grade_code = grade_code.upper()
            elif grade_code.isdigit():
                grade_code = f"G{grade_code.zfill(2)}"
            else:
                grade_code = f"G{grade_code.zfill(2)}"
            
            # Get next serial number
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT MAX(student_id) FROM students_student 
                    WHERE campus_id = %s AND grade = %s AND shift = %s
                """, [campus_id, grade, shift])
                result = cursor.fetchone()
                last_student_id = result[0] if result[0] else None
                
                if last_student_id and '-' in last_student_id:
                    try:
                        last_serial = int(last_student_id.split('-')[-1])
                    except:
                        last_serial = 0
                else:
                    last_serial = 0
                
                next_serial = last_serial + 1
                
                # Generate student ID: C01-M-G01-0001
                return f"{campus_code}-{shift_code}-{grade_code}-{next_serial:04d}"
                
        except Exception as e:
            print(f"Error generating student ID: {str(e)}")
            return f"C01-M-G01-0001"


class StudentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating students"""
    class Meta:
        model = Student
        fields = [
            'name', 'father_name', 'grade', 'shift', 'campus', 
            'class_teacher', 'password', 'is_active'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }
