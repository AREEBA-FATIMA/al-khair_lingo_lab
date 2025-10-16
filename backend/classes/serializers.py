from rest_framework import serializers
from .models import Level, Grade, ClassRoom


class LevelSerializer(serializers.ModelSerializer):
    """Serializer for Level model"""
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    
    class Meta:
        model = Level
        fields = '__all__'
        read_only_fields = ['code', 'created_at']
    
    def create(self, validated_data):
        """Create a new level"""
        level = Level.objects.create(**validated_data)
        return level
    
    def update(self, instance, validated_data):
        """Update an existing level"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class GradeSerializer(serializers.ModelSerializer):
    """Serializer for Grade model"""
    level_name = serializers.CharField(source='level.name', read_only=True)
    campus_name = serializers.CharField(source='level.campus.campus_name', read_only=True)
    
    class Meta:
        model = Grade
        fields = '__all__'
        read_only_fields = ['code', 'created_at']
    
    def create(self, validated_data):
        """Create a new grade"""
        grade = Grade.objects.create(**validated_data)
        return grade
    
    def update(self, instance, validated_data):
        """Update an existing grade"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ClassRoomSerializer(serializers.ModelSerializer):
    """Serializer for ClassRoom model"""
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    level_name = serializers.CharField(source='grade.level.name', read_only=True)
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    class_teacher_name = serializers.CharField(source='class_teacher.full_name', read_only=True)
    
    class Meta:
        model = ClassRoom
        fields = '__all__'
        read_only_fields = ['code', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create a new classroom"""
        classroom = ClassRoom.objects.create(**validated_data)
        return classroom
    
    def update(self, instance, validated_data):
        """Update an existing classroom"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ClassRoomListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing classrooms"""
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    level_name = serializers.CharField(source='grade.level.name', read_only=True)
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    class_teacher_name = serializers.CharField(source='class_teacher.full_name', read_only=True)
    
    class Meta:
        model = ClassRoom
        fields = [
            'id', 'grade', 'grade_name', 'section', 'shift', 
            'class_teacher', 'class_teacher_name', 'capacity', 
            'campus_name', 'level_name', 'code', 'created_at'
        ]


class ClassRoomDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for classroom details"""
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    level_name = serializers.CharField(source='grade.level.name', read_only=True)
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    class_teacher_name = serializers.CharField(source='class_teacher.full_name', read_only=True)
    students_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ClassRoom
        fields = '__all__'
        read_only_fields = ['code', 'created_at', 'updated_at']
    
    def get_students_count(self, obj):
        """Get count of students in this classroom"""
        try:
            from students.models import Student
            return Student.objects.filter(classroom=obj).count()
        except:
            return 0


class ClassRoomCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new classrooms"""
    
    class Meta:
        model = ClassRoom
        exclude = ['code', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Validate classroom data"""
        grade = attrs.get('grade')
        section = attrs.get('section')
        shift = attrs.get('shift')
        
        # Check for duplicate classroom
        if ClassRoom.objects.filter(
            grade=grade, 
            section=section, 
            shift=shift
        ).exists():
            raise serializers.ValidationError(
                f"Classroom {grade.name} - {section} ({shift}) already exists."
            )
        
        return attrs


class ClassRoomUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating classrooms"""
    
    class Meta:
        model = ClassRoom
        exclude = ['code', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Validate classroom data"""
        grade = attrs.get('grade', self.instance.grade)
        section = attrs.get('section', self.instance.section)
        shift = attrs.get('shift', self.instance.shift)
        
        # Check for duplicate classroom (excluding current instance)
        if ClassRoom.objects.filter(
            grade=grade, 
            section=section, 
            shift=shift
        ).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError(
                f"Classroom {grade.name} - {section} ({shift}) already exists."
            )
        
        return attrs
