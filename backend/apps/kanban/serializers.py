from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Board, Column, Task, TaskComment, TaskAttachment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']

class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    download_url = serializers.CharField(read_only=True)
    
    class Meta:
        model = TaskAttachment
        fields = ['id', 'firebase_path', 'filename', 'file_size', 'content_type', 
                 'uploaded_by', 'uploaded_at', 'download_url']

class TaskCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'content', 'user', 'created_at', 'updated_at']

class TaskListSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()
    attachments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'status', 'due_date', 
            'assigned_to', 'position', 'labels', 'created_at', 'updated_at',
            'comments_count', 'attachments_count'
        ]

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_attachments_count(self, obj):
        return obj.attachments.count()

class TaskDetailSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'status', 'due_date',
            'assigned_to', 'created_by', 'position', 'labels', 'created_at', 
            'updated_at', 'comments', 'attachments'
        ]

class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'priority', 'status', 'due_date',
            'assigned_to_id', 'labels'
        ]

    def validate_assigned_to_id(self, value):
        if value and not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("Usuário não encontrado")
        return value

    def update(self, instance, validated_data):
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        if assigned_to_id:
            instance.assigned_to_id = assigned_to_id
        return super().update(instance, validated_data)

class ColumnSerializer(serializers.ModelSerializer):
    tasks = TaskListSerializer(many=True, read_only=True)
    task_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Column
        fields = ['id', 'name', 'position', 'color', 'max_tasks', 'task_count', 'tasks']

class ColumnCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Column
        fields = ['name', 'color', 'max_tasks']

class BoardListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    columns_count = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Board
        fields = [
            'id', 'name', 'description', 'created_by', 'created_at', 
            'updated_at', 'position', 'columns_count', 'tasks_count'
        ]

    def get_columns_count(self, obj):
        return obj.columns.count()

    def get_tasks_count(self, obj):
        return Task.objects.filter(column__board=obj, is_active=True).count()

class BoardDetailSerializer(serializers.ModelSerializer):
    columns = ColumnSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Board
        fields = [
            'id', 'name', 'description', 'created_by', 'created_at',
            'updated_at', 'position', 'columns'
        ]

class BoardCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['name', 'description']