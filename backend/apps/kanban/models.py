from django.db import models
from django.conf import settings


class Board(models.Model):
    """Kanban Board - represents a sales pipeline"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_default = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_boards'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'kanban_boards'
        ordering = ['-created_at']


class Stage(models.Model):
    """Kanban Stages - columns in the board"""
    STAGE_TYPES = [
        ('lead', 'Lead'),
        ('qualified', 'Qualified'),
        ('proposal', 'Proposal'),
        ('negotiation', 'Negotiation'),
        ('closed_won', 'Closed Won'),
        ('closed_lost', 'Closed Lost'),
    ]

    board = models.ForeignKey(
        Board,
        on_delete=models.CASCADE,
        related_name='stages'
    )
    name = models.CharField(max_length=100)
    stage_type = models.CharField(max_length=20, choices=STAGE_TYPES)
    order = models.IntegerField(default=0)
    color = models.CharField(max_length=7, default='#1890ff')  # Hex color
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.board.name} - {self.name}"

    class Meta:
        db_table = 'kanban_stages'
        ordering = ['board', 'order']


class Lead(models.Model):
    """Kanban Cards - individual leads/opportunities"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Relationships
    stage = models.ForeignKey(
        Stage,
        on_delete=models.CASCADE,
        related_name='leads'
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='leads'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_leads'
    )
    
    # Lead details
    value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateField(null=True, blank=True)
    
    # Metadata
    order = models.IntegerField(default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_leads'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.company.name}"

    class Meta:
        db_table = 'kanban_leads'
        ordering = ['stage', 'order', '-created_at']


class Activity(models.Model):
    """Activity log for lead movements and updates"""
    ACTION_TYPES = [
        ('created', 'Created'),
        ('moved', 'Moved'),
        ('updated', 'Updated'),
        ('assigned', 'Assigned'),
        ('comment', 'Comment Added'),
    ]

    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    description = models.TextField()
    old_stage = models.ForeignKey(
        Stage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='old_activities'
    )
    new_stage = models.ForeignKey(
        Stage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='new_activities'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lead.title} - {self.action_type}"

    class Meta:
        db_table = 'kanban_activities'
        ordering = ['-created_at']
