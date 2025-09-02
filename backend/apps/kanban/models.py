from django.db import models
from django.contrib.auth.models import User
from apps.companies.models import Company
import uuid


class Board(models.Model):
    """Kanban Board - represents a sales pipeline"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='boards')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_boards')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ['position', 'created_at']
        unique_together = ['company', 'name']

    def __str__(self):
        return f"{self.name} - {self.company.name}"


class Column(models.Model):
    """Kanban Columns - represents stages in the sales pipeline"""
    COLUMN_COLORS = [
        ('#e6f3ff', 'Azul Claro'),
        ('#fff2e6', 'Laranja Claro'),
        ('#e6ffe6', 'Verde Claro'),
        ('#ffe6e6', 'Vermelho Claro'),
        ('#f3e6ff', 'Roxo Claro'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='columns')
    position = models.IntegerField(default=0)
    color = models.CharField(max_length=7, default='#e6f3ff', help_text="Cor em formato hex (#ffffff)")
    max_tasks = models.IntegerField(null=True, blank=True, help_text="Limite de tasks (opcional)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position']
        unique_together = ['board', 'name']

    def __str__(self):
        return f"{self.name} - {self.board.name}"

    @property
    def task_count(self):
        return self.tasks.filter(is_active=True).count()


class Task(models.Model):
    """Kanban Tasks - individual tasks within a column"""
    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]

    STATUS_CHOICES = [
        ('active', 'Ativa'),
        ('completed', 'Concluída'),
        ('archived', 'Arquivada'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    due_date = models.DateTimeField(null=True, blank=True)
    position = models.IntegerField(default=0)
    labels = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position', 'created_at']

    def __str__(self):
        return f"{self.title} - {self.column.name}"


class TaskComment(models.Model):
    """Comments on tasks"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user.email} on {self.task.title}"


class TaskAttachment(models.Model):
    """Attachments for tasks"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    firebase_path = models.TextField()  # Caminho no Firebase Storage
    filename = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    content_type = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.filename} - {self.task.title}"
