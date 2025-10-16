from django.contrib import admin
from .models import Level, Grade, ClassRoom


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'code', 'campus'
    ]
    list_filter = ['campus']
    search_fields = ['name', 'code', 'campus__campus_name']
    readonly_fields = ['code']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'campus')
        }),
    )


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'code', 'level', 'campus_name'
    ]
    list_filter = ['level__campus', 'level']
    search_fields = ['name', 'code', 'level__name', 'level__campus__campus_name']
    readonly_fields = ['code']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'level')
        }),
    )
    
    def campus_name(self, obj):
        return obj.level.campus.campus_name if obj.level and obj.level.campus else "N/A"
    campus_name.short_description = "Campus"


@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = [
        'grade', 'section', 'shift', 'class_teacher', 'capacity', 
        'campus_name', 'code'
    ]
    list_filter = [
        'grade__level__campus', 'grade__level', 'grade', 'shift'
    ]
    search_fields = [
        'grade__name', 'section', 'class_teacher__full_name', 
        'code', 'grade__level__campus__campus_name'
    ]
    readonly_fields = ['code']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('grade', 'section', 'shift', 'capacity')
        }),
        ('Class Teacher Assignment', {
            'fields': ('class_teacher',)
        }),
        ('System Information', {
            'fields': ('code',),
            'classes': ('collapse',)
        }),
    )
    
    def campus_name(self, obj):
        return obj.campus.campus_name if obj.campus else "N/A"
    campus_name.short_description = "Campus"
    
    actions = ['assign_teacher', 'unassign_teacher']
    
    def assign_teacher(self, request, queryset):
        """Assign teacher to selected classrooms"""
        # This would need a custom form to select teacher
        self.message_user(request, 'Use individual classroom edit to assign teachers.')
    assign_teacher.short_description = "Assign teacher to selected classrooms"
    
    def unassign_teacher(self, request, queryset):
        """Unassign teacher from selected classrooms"""
        count = queryset.update(class_teacher=None)
        self.message_user(request, f'{count} classrooms unassigned from teachers.')
    unassign_teacher.short_description = "Unassign teacher from selected classrooms"