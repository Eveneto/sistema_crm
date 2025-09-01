from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Max
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
import logging

from .models import Board, Column, Task, TaskComment, TaskAttachment
from .serializers import (
    BoardListSerializer, BoardDetailSerializer, BoardCreateUpdateSerializer,
    ColumnSerializer, ColumnCreateUpdateSerializer,
    TaskListSerializer, TaskDetailSerializer, TaskCreateUpdateSerializer,
    TaskCommentSerializer, TaskAttachmentSerializer
)
from .filters import TaskFilter, BoardFilter

logger = logging.getLogger(__name__)

class BoardViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = BoardFilter
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        """Retorna boards ativos. Por enquanto permite acesso a todos os boards para usuários autenticados."""
        return Board.objects.filter(
            is_active=True
        ).select_related('created_by', 'company').prefetch_related('columns')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BoardListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BoardCreateUpdateSerializer
        return BoardDetailSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        user_company = getattr(user, 'company', None)
        if not user_company:
            from apps.companies.models import Company
            user_company = Company.objects.first()
        
        board = serializer.save(
            company=user_company,
            created_by=user
        )
        
        # Criar colunas padrão
        default_columns = [
            {'name': 'A Fazer', 'position': 0, 'color': '#e6f3ff'},
            {'name': 'Em Progresso', 'position': 1, 'color': '#fff2e6'},
            {'name': 'Concluído', 'position': 2, 'color': '#e6ffe6'},
        ]
        
        for col_data in default_columns:
            Column.objects.create(board=board, **col_data)
        
        logger.info(f"Board criado: {board.name} com colunas padrão")

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        board = self.get_object()
        stats = {
            'total_tasks': Task.objects.filter(column__board=board, is_active=True).count(),
            'tasks_by_priority': dict(
                Task.objects.filter(
                    column__board=board, is_active=True
                ).values('priority').annotate(count=Count('id')).values_list('priority', 'count')
            ),
            'tasks_by_column': list(
                board.columns.annotate(
                    task_count=Count('tasks', filter=Q(tasks__is_active=True))
                ).values('name', 'task_count')
            ),
            'overdue_tasks': Task.objects.filter(
                column__board=board,
                is_active=True,
                due_date__lt=timezone.now()
            ).count()
        }
        return Response(stats)

class ColumnViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        board_id = self.kwargs.get('board_pk')
        if board_id:
            return Column.objects.filter(
                board_id=board_id
            ).prefetch_related('tasks__assigned_to', 'tasks__created_by')
        return Column.objects.none()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ColumnCreateUpdateSerializer
        return ColumnSerializer
    
    def perform_create(self, serializer):
        board = get_object_or_404(Board, id=self.kwargs['board_pk'])
        # Auto-increment position
        last_position = board.columns.aggregate(max_pos=Max('position'))['max_pos'] or -1
        serializer.save(board=board, position=last_position + 1)

    @action(detail=False, methods=['patch'])
    def reorder(self, request, board_pk=None):
        """Reordena colunas via drag & drop"""
        column_orders = request.data.get('column_orders', [])
        
        for order_data in column_orders:
            Column.objects.filter(
                id=order_data['id'],
                board_id=board_pk
            ).update(position=order_data['position'])
        
        logger.info(f"Colunas reordenadas no board {board_pk}")
        return Response({'status': 'success'})

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority', 'position']
    ordering = ['position', 'created_at']
    
    def get_queryset(self):
        column_id = self.kwargs.get('column_pk')
        if column_id:
            return Task.objects.filter(
                column_id=column_id,
                is_active=True
            ).select_related('assigned_to', 'created_by', 'column__board').prefetch_related(
                'comments__user', 'attachments'
            )
        return Task.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskDetailSerializer
    
    def perform_create(self, serializer):
        column = get_object_or_404(Column, id=self.kwargs['column_pk'])
        
        # Validar limite de tasks por coluna
        if column.max_tasks and column.task_count >= column.max_tasks:
            raise ValidationError(f"Coluna '{column.name}' atingiu o limite de {column.max_tasks} tasks")
        
        # Auto-increment position
        last_position = column.tasks.filter(is_active=True).aggregate(
            max_pos=Max('position')
        )['max_pos'] or -1
        
        task = serializer.save(
            column=column,
            created_by=self.request.user,
            position=last_position + 1
        )
        
        logger.info(f"Task criada: {task.title} na coluna {column.name}")

    @action(detail=True, methods=['patch'])
    def move(self, request, column_pk=None, pk=None):
        """Move task entre colunas (drag & drop)"""
        task = self.get_object()
        new_column_id = request.data.get('column_id')
        new_position = request.data.get('position', 0)
        
        if not new_column_id:
            return Response({'error': 'column_id é obrigatório'}, status=400)
        
        new_column = get_object_or_404(Column, id=new_column_id)
        
        # Validar se a nova coluna pertence ao mesmo board
        if new_column.board != task.column.board:
            return Response({'error': 'Colunas devem pertencer ao mesmo board'}, status=400)
        
        # Validar limite da nova coluna
        if (new_column.max_tasks and 
            new_column.task_count >= new_column.max_tasks and 
            task.column != new_column):
            return Response(
                {'error': f'Coluna "{new_column.name}" atingiu o limite de {new_column.max_tasks} tasks'}, 
                status=400
            )
        
        # Atualizar task
        old_column_id = task.column.id
        task.column = new_column
        task.position = new_position
        task.save()
        
        # Reorganizar posições nas colunas afetadas
        self._reorder_tasks_in_column(old_column_id)
        self._reorder_tasks_in_column(new_column_id)
        
        logger.info(f"Task {task.title} movida para coluna {new_column.name}")
        return Response(TaskListSerializer(task).data)

    def _reorder_tasks_in_column(self, column_id):
        """Reorganiza posições das tasks em uma coluna"""
        tasks = Task.objects.filter(column_id=column_id, is_active=True).order_by('position', 'created_at')
        for index, task in enumerate(tasks):
            if task.position != index:
                task.position = index
                task.save(update_fields=['position'])

    @action(detail=True, methods=['patch'])
    def archive(self, request, column_pk=None, pk=None):
        """Arquiva uma task"""
        task = self.get_object()
        task.is_active = False
        task.status = 'archived'
        task.save()
        return Response({'status': 'archived'})

class TaskCommentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskCommentSerializer
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_pk')
        return TaskComment.objects.filter(task_id=task_id).select_related('user')
    
    def perform_create(self, serializer):
        task = get_object_or_404(Task, id=self.kwargs['task_pk'])
        serializer.save(task=task, user=self.request.user)

class TaskAttachmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskAttachmentSerializer
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_pk')
        return TaskAttachment.objects.filter(task_id=task_id).select_related('uploaded_by')
    
    def perform_create(self, serializer):
        task = get_object_or_404(Task, id=self.kwargs['task_pk'])
        serializer.save(task=task, uploaded_by=self.request.user)