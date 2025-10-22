from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import EnglishCoordinator


@admin.register(EnglishCoordinator)
class EnglishCoordinatorAdmin(admin.ModelAdmin):
    """Admin interface for English Coordinator"""
    
    list_display = [
        'name', 'coordinator_id', 'email',
        'supervises_all_grades', 'can_assign_teachers', 'is_active',
        'supervised_teachers_count', 'supervised_students_count'
    ]
    
    list_filter = [
        'supervises_all_grades', 'can_assign_teachers',
        'can_view_all_progress', 'can_manage_content', 'is_active',
        'created_at'
    ]
    
    search_fields = [
        'name', 'father_name', 'email', 'coordinator_id'
    ]
    
    readonly_fields = ['coordinator_id', 'created_at', 'updated_at', 'supervised_teachers_list']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'father_name', 'email', 'password', 'is_active')
        }),
        ('System Information', {
            'fields': ('coordinator_id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': (
                'supervises_all_grades', 'can_assign_teachers',
                'can_view_all_progress', 'can_manage_content',
                'can_reassign_teachers'
            )
        }),
        ('Supervised Teachers', {
            'fields': ('supervised_teachers_list',),
            'classes': ('collapse',)
        }),
    )
    
    def supervised_teachers_count(self, obj):
        """Count of supervised teachers"""
        count = obj.get_supervised_teachers().count()
        if count > 0:
            url = reverse('admin:teachers_teacher_changelist') + f'?english_coordinator__id__exact={obj.id}'
            return format_html('<a href="{}">{} teachers</a>', url, count)
        return '0 teachers'
    supervised_teachers_count.short_description = 'Supervised Teachers'
    
    def supervised_students_count(self, obj):
        """Count of supervised students"""
        count = obj.get_supervised_students().count()
        return f"{count} students"
    supervised_students_count.short_description = 'Supervised Students'
    
    def supervised_teachers_list(self, obj):
        """Display list of supervised teachers"""
        teachers = obj.get_supervised_teachers()
        if not teachers.exists():
            return "No teachers assigned yet"
        
        teacher_list = []
        for teacher in teachers:
            # Get assigned grades
            grades = teacher.english_teacher_grades.all()
            grade_names = [grade.name for grade in grades]
            grade_info = f" ({', '.join(grade_names)})" if grade_names else " (No grades assigned)"
            
            teacher_list.append(f"• {teacher.name} - {teacher.teacher_id}{grade_info}")
        
        return mark_safe('<br>'.join(teacher_list))
    supervised_teachers_list.short_description = 'Teachers List'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).prefetch_related(
            'supervised_teachers__english_teacher_grades'
        )
    
    def save_model(self, request, obj, form, change):
        """Custom save logic"""
        super().save_model(request, obj, form, change)
        
        # Log the action
        action = "updated" if change else "created"
        self.message_user(
            request,
            f"English Coordinator {obj.name} ({obj.coordinator_id}) {action} successfully."
        )
    
    def delete_model(self, request, obj):
        """Custom delete logic"""
        coordinator_name = obj.name
        coordinator_id = obj.coordinator_id
        super().delete_model(request, obj)
        self.message_user(
            request,
            f"English Coordinator {coordinator_name} ({coordinator_id}) deleted successfully."
        )
    
    actions = ['activate_coordinators', 'deactivate_coordinators']
    
    def activate_coordinators(self, request, queryset):
        """Activate selected coordinators"""
        updated = queryset.update(is_active=True)
        self.message_user(
            request,
            f"{updated} English Coordinator(s) activated successfully."
        )
    activate_coordinators.short_description = "Activate selected coordinators"
    
    def deactivate_coordinators(self, request, queryset):
        """Deactivate selected coordinators"""
        updated = queryset.update(is_active=False)
        self.message_user(
            request,
            f"{updated} English Coordinator(s) deactivated successfully."
        )
    deactivate_coordinators.short_description = "Deactivate selected coordinators"


# Customize admin site header
admin.site.site_header = "English Master Admin"
admin.site.site_title = "English Master Admin"
admin.site.index_title = "Welcome to English Master Administration"