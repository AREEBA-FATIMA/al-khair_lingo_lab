from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django import forms
from .models import User, LoginLog


# StudentList, TeacherList, DonorList admin classes removed - now handled in separate apps


class UserCreationForm(forms.ModelForm):
    """Custom form for creating users with role-specific fields"""
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)
    
    # Student fields
    father_name = forms.CharField(max_length=200, required=False, help_text="Father's name (for students)")
    campus = forms.ModelChoiceField(queryset=None, required=False, help_text="Campus (for students/teachers)")
    grade = forms.ChoiceField(choices=[], required=False, help_text="Grade (for students)")
    shift = forms.ChoiceField(choices=[('morning', 'Morning'), ('afternoon', 'Afternoon')], required=False, help_text="Shift (for students)")
    
    # Teacher fields
    teacher_type = forms.ChoiceField(choices=[('regular', 'Regular Teacher'), ('english_head', 'English Head')], required=False, help_text="Teacher type")
    
    # Coordinator fields
    coordinator_last_name = forms.CharField(max_length=200, required=False, help_text="Last name (for coordinators)")
    
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'role')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Import here to avoid circular imports
        from campus.models import Campus
        from classes.models import Grade
        
        # Set campus choices
        self.fields['campus'].queryset = Campus.objects.all()
        
        # Set grade choices
        grade_choices = [
            ('Nursery', 'Nursery'),
            ('KG-I', 'KG-I'),
            ('KG-II', 'KG-II'),
            ('Grade 1', 'Grade 1'),
            ('Grade 2', 'Grade 2'),
            ('Grade 3', 'Grade 3'),
            ('Grade 4', 'Grade 4'),
            ('Grade 5', 'Grade 5'),
            ('Grade 6', 'Grade 6'),
            ('Grade 7', 'Grade 7'),
            ('Grade 8', 'Grade 8'),
            ('Grade 9', 'Grade 9'),
            ('Grade 10', 'Grade 10'),
        ]
        self.fields['grade'].choices = [('', 'Select Grade')] + grade_choices
    
    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2
    
    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get('role')
        username = cleaned_data.get('username')
        
        # Check username uniqueness
        if username:
            if User.objects.filter(username=username).exists():
                raise forms.ValidationError("Username already exists. Please choose a different username.")
        
        # Role-specific validation
        if role == 'student':
            if not cleaned_data.get('campus'):
                raise forms.ValidationError("Campus is required for students")
            if not cleaned_data.get('grade'):
                raise forms.ValidationError("Grade is required for students")
            if not cleaned_data.get('father_name'):
                raise forms.ValidationError("Father's name is required for students")
            if not cleaned_data.get('shift'):
                raise forms.ValidationError("Shift is required for students")
        elif role == 'teacher':
            if not cleaned_data.get('email'):
                raise forms.ValidationError("Email is required for teachers")
            if not cleaned_data.get('campus'):
                raise forms.ValidationError("Campus is required for teachers")
            if not cleaned_data.get('teacher_type'):
                raise forms.ValidationError("Teacher type is required for teachers")
        elif role == 'english_coordinator':
            if not cleaned_data.get('email'):
                raise forms.ValidationError("Email is required for coordinators")
        elif role == 'admin':
            if not cleaned_data.get('email'):
                raise forms.ValidationError("Email is required for admins")
        
        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        
        if commit:
            user.save()
            
            # Create role-specific records
            role = user.role
            if role == 'student':
                self._create_student_record(user)
            elif role == 'teacher':
                self._create_teacher_record(user)
            elif role == 'english_coordinator':
                self._create_coordinator_record(user)
        
        return user
    
    def _create_student_record(self, user):
        """Create Student record for student users"""
        try:
            from students.models import Student
            from campus.models import Campus
            
            campus = Campus.objects.get(id=self.cleaned_data.get('campus'))
            
            Student.objects.create(
                name=f"{user.first_name} {user.last_name}".strip(),
                father_name=self.cleaned_data.get('father_name', 'Unknown'),
                grade=self.cleaned_data.get('grade', ''),
                shift=self.cleaned_data.get('shift', 'morning'),
                campus=campus,
                password=self.cleaned_data['password1'],
                is_active=user.is_active
            )
        except Exception as e:
            print(f"Error creating student record: {e}")
    
    def _create_teacher_record(self, user):
        """Create Teacher record for teacher users"""
        try:
            from teachers.models import Teacher
            from campus.models import Campus
            
            campus = Campus.objects.get(id=self.cleaned_data.get('campus'))
            
            Teacher.objects.create(
                name=f"{user.first_name} {user.last_name}".strip(),
                father_name=self.cleaned_data.get('father_name', 'Unknown'),
                email=user.email,
                campus=campus,
                shift=self.cleaned_data.get('shift', 'morning'),
                teacher_type=self.cleaned_data.get('teacher_type', 'regular'),
                password=self.cleaned_data['password1'],
                is_active=user.is_active
            )
        except Exception as e:
            print(f"Error creating teacher record: {e}")
    
    def _create_coordinator_record(self, user):
        """Create English Coordinator record for coordinator users"""
        try:
            from english_coordinator.models import EnglishCoordinator
            
            EnglishCoordinator.objects.create(
                name=f"{user.first_name} {user.last_name}".strip(),
                last_name=self.cleaned_data.get('coordinator_last_name', user.last_name),
                email=user.email,
                password=self.cleaned_data['password1'],
                is_active=user.is_active
            )
        except Exception as e:
            print(f"Error creating coordinator record: {e}")


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'id', 'email', 'username', 'first_name', 'last_name', 'role',
        'student_id', 'is_active', 'is_verified', 'created_at'
    ]
    list_filter = [
        'role', 'is_active', 'is_verified', 'created_at'
    ]
    search_fields = ['email', 'username', 'first_name', 'last_name', 'student_id', 'phone_number']
    ordering = ['-created_at']
    readonly_fields = [
        'id', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'email', 'username', 'first_name', 'last_name', 'role')
        }),
        ('Contact Information', {
            'fields': ('phone_number',),
            'classes': ('collapse',)
        }),
        ('Student Information', {
            'fields': ('student_id',),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified', 'has_changed_default_password')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        ('Basic Information', {
            'classes': ('wide',),
            'fields': ('role', 'email', 'username', 'first_name', 'last_name', 'password1', 'password2'),
            'description': 'Select user type first, then fill the required fields below'
        }),
        ('Student Information', {
            'classes': ('collapse',),
            'fields': ('father_name', 'campus', 'grade', 'shift'),
            'description': 'Required fields for students: Father\'s name, Campus, Grade, Shift'
        }),
        ('Teacher Information', {
            'classes': ('collapse',),
            'fields': ('father_name', 'campus', 'shift', 'teacher_type'),
            'description': 'Required fields for teachers: Father\'s name, Campus, Shift, Teacher type'
        }),
        ('Coordinator Information', {
            'classes': ('collapse',),
            'fields': ('coordinator_last_name',),
            'description': 'Optional fields for coordinators: Last name'
        }),
    )
    
    # Use custom form for adding users
    add_form = UserCreationForm
    
    class Media:
        js = ('admin/js/user_admin.js',)




@admin.register(LoginLog)
class LoginLogAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'login_method', 'ip_address',
        'success', 'attempted_at'
    ]
    list_filter = [
        'login_method', 'success', 'attempted_at',
        'user__role'
    ]
    search_fields = [
        'user__email', 'user__first_name', 'user__last_name', 'user__student_id',
        'ip_address', 'user_agent'
    ]
    ordering = ['-attempted_at']
    readonly_fields = ['attempted_at']
    
    fieldsets = (
        ('Login Information', {
            'fields': ('user', 'login_method', 'success')
        }),
        ('Technical Details', {
            'fields': ('ip_address', 'user_agent', 'attempted_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


# Customize admin site
admin.site.site_header = "Lingo Master Admin"
admin.site.site_title = "Lingo Master"
admin.site.index_title = "Welcome to Lingo Master Administration"