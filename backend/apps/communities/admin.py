from django.contrib import admin
from .models import Community, CommunityMember


class CommunityMemberInline(admin.TabularInline):
    model = CommunityMember
    extra = 0
    readonly_fields = ['joined_at']
    fields = ['user', 'role', 'invited_by', 'is_active', 'joined_at']


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'is_public', 'member_count', 'max_members', 'is_active', 'created_at']
    list_filter = ['is_public', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at', 'member_count']
    ordering = ['-created_at']
    inlines = [CommunityMemberInline]

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('id', 'name', 'description', 'created_by')
        }),
        ('Configurações', {
            'fields': ('is_public', 'max_members', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Estatísticas', {
            'fields': ('member_count',),
            'classes': ('collapse',)
        })
    )


@admin.register(CommunityMember)
class CommunityMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'community', 'role', 'joined_at', 'invited_by', 'is_active']
    list_filter = ['role', 'is_active', 'joined_at', 'community']
    search_fields = ['user__username', 'user__email', 'community__name']
    readonly_fields = ['joined_at']
    ordering = ['-joined_at']

    fieldsets = (
        ('Informações do Membro', {
            'fields': ('community', 'user', 'role', 'invited_by')
        }),
        ('Status', {
            'fields': ('is_active', 'joined_at')
        })
    )
