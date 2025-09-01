from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from .views import (
    BoardViewSet, ColumnViewSet, TaskViewSet, 
    TaskCommentViewSet, TaskAttachmentViewSet
)

# Router principal para boards
router = DefaultRouter()
router.register(r'boards', BoardViewSet, basename='boards')

# Router aninhado para colunas dentro de boards
boards_router = NestedDefaultRouter(router, r'boards', lookup='board')
boards_router.register(r'columns', ColumnViewSet, basename='board-columns')

# Router aninhado para tasks dentro de colunas
columns_router = NestedDefaultRouter(boards_router, r'columns', lookup='column')
columns_router.register(r'tasks', TaskViewSet, basename='column-tasks')

# Router aninhado para comments e attachments dentro de tasks
tasks_router = NestedDefaultRouter(columns_router, r'tasks', lookup='task')
tasks_router.register(r'comments', TaskCommentViewSet, basename='task-comments')
tasks_router.register(r'attachments', TaskAttachmentViewSet, basename='task-attachments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(boards_router.urls)),
    path('', include(columns_router.urls)),
    path('', include(tasks_router.urls)),
]
