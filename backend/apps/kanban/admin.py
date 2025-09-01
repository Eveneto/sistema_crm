from django.contrib import admin
from .models import Board, Column, Task, TaskComment, TaskAttachment

@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'created_by', 'created_at', 'is_active']
    list_filter = ['company', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['company', 'position', 'name']

@admin.register(Column)
class ColumnAdmin(admin.ModelAdmin):
    list_display = ['name', 'board', 'position', 'color', 'task_count']
    list_filter = ['board__company', 'color']
    search_fields = ['name', 'board__name']
    readonly_fields = ['id', 'task_count']
    ordering = ['board', 'position']

class TaskCommentInline(admin.TabularInline):
    model = TaskComment
    extra = 0
    readonly_fields = ['created_at', 'updated_at']

class TaskAttachmentInline(admin.TabularInline):
    model = TaskAttachment
    extra = 0
    readonly_fields = ['uploaded_at']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'column', 'assigned_to', 'priority', 'status', 'due_date', 'created_at']
    list_filter = ['priority', 'status', 'column__board__company', 'is_active']
    search_fields = ['title', 'description', 'assigned_to__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [TaskCommentInline, TaskAttachmentInline]
    ordering = ['column', 'position']

@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'content_preview', 'created_at']
    list_filter = ['created_at', 'task__column__board']
    search_fields = ['content', 'task__title', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'

@admin.register(TaskAttachment)
class TaskAttachmentAdmin(admin.ModelAdmin):
    list_display = ['filename', 'task', 'uploaded_by', 'file_size', 'uploaded_at']
    list_filter = ['content_type', 'uploaded_at']
    search_fields = ['filename', 'task__title', 'uploaded_by__email']
    readonly_fields = ['id', 'uploaded_at']