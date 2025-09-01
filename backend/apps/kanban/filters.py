import django_filters
from django_filters import rest_framework as filters
from django.contrib.auth.models import User
from .models import Task, Board, Column

class TaskFilter(filters.FilterSet):
    assigned_to = filters.ModelChoiceFilter(queryset=User.objects.all())
    priority = filters.ChoiceFilter(choices=Task.PRIORITY_CHOICES)
    status = filters.ChoiceFilter(choices=Task.STATUS_CHOICES)
    due_date_from = filters.DateTimeFilter(field_name='due_date', lookup_expr='gte')
    due_date_to = filters.DateTimeFilter(field_name='due_date', lookup_expr='lte')
    labels = filters.CharFilter(method='filter_labels')
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Task
        fields = ['assigned_to', 'priority', 'status', 'labels']

    def filter_labels(self, queryset, name, value):
        """Filtra por labels usando JSONField"""
        if value:
            return queryset.filter(labels__contains=[value])
        return queryset

class BoardFilter(filters.FilterSet):
    created_by = filters.ModelChoiceFilter(queryset=User.objects.all())
    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Board
        fields = ['created_by']