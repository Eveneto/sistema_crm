from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from .models import Company, CompanyContact
from .serializers import (
    CompanySerializer, 
    CompanyListSerializer,
    CompanyDetailSerializer,
    CompanyCreateSerializer,
    CompanyContactSerializer
)


class CompanyViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de empresas
    
    Endpoints disponíveis:
    - GET /api/companies/ - Lista todas as empresas
    - POST /api/companies/ - Cria nova empresa
    - GET /api/companies/{id}/ - Detalhe de uma empresa
    - PUT /api/companies/{id}/ - Atualiza empresa completa
    - PATCH /api/companies/{id}/ - Atualiza empresa parcial
    - DELETE /api/companies/{id}/ - Remove empresa
    - GET /api/companies/statistics/ - Estatísticas das empresas
    - GET /api/companies/{id}/contacts/ - Lista contatos da empresa
    - POST /api/companies/{id}/add_contact/ - Adiciona contato à empresa
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['industry', 'size', 'is_active', 'is_client']
    search_fields = ['name', 'email', 'website', 'industry', 'cnpj']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Otimizar queries com select_related"""
        return Company.objects.select_related('created_by').prefetch_related('contacts')

    def get_serializer_class(self):
        """Retorna serializer apropriado para cada ação"""
        if self.action == 'list':
            return CompanyListSerializer
        elif self.action == 'create':
            return CompanyCreateSerializer
        elif self.action == 'retrieve':
            return CompanyDetailSerializer
        else:
            return CompanySerializer

    def perform_create(self, serializer):
        """Salvar empresa com usuário atual como criador"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    @method_decorator(cache_page(60 * 5))  # Cache por 5 minutos
    def statistics(self, request):
        """
        Endpoint para estatísticas das empresas
        GET /api/companies/statistics/
        """
        cache_key = f'companies_stats_{request.user.id}'
        stats = cache.get(cache_key)
        
        if not stats:
            total_companies = Company.objects.count()
            active_companies = Company.objects.filter(is_active=True).count()
            clients = Company.objects.filter(is_client=True).count()
            
            # Estatísticas por tamanho
            size_stats = (
                Company.objects
                .values('size')
                .annotate(count=Count('size'))
                .order_by('-count')
            )
            
            # Estatísticas por indústria
            industry_stats = (
                Company.objects
                .exclude(industry__isnull=True)
                .exclude(industry='')
                .values('industry')
                .annotate(count=Count('industry'))
                .order_by('-count')[:10]  # Top 10
            )
            
            stats = {
                'total_companies': total_companies,
                'active_companies': active_companies,
                'clients': clients,
                'inactive_companies': total_companies - active_companies,
                'size_distribution': list(size_stats),
                'top_industries': list(industry_stats),
                'conversion_rate': round((clients / total_companies * 100), 2) if total_companies > 0 else 0
            }
            
            # Cache por 5 minutos
            cache.set(cache_key, stats, 60 * 5)
        
        return Response(stats)

    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """
        Lista contatos de uma empresa
        GET /api/companies/{id}/contacts/
        """
        company = self.get_object()
        contacts = company.contacts.all()
        serializer = CompanyContactSerializer(contacts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_contact(self, request, pk=None):
        """
        Adiciona contato a uma empresa
        POST /api/companies/{id}/add_contact/
        """
        company = self.get_object()
        serializer = CompanyContactSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(company=company)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Busca avançada de empresas
        GET /api/companies/search/?q=termo&industry=tech&size=small
        """
        query = request.query_params.get('q', '')
        industry = request.query_params.get('industry', '')
        size = request.query_params.get('size', '')
        is_client = request.query_params.get('is_client', '')
        
        queryset = self.get_queryset()
        
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(email__icontains=query) |
                Q(website__icontains=query) |
                Q(industry__icontains=query) |
                Q(cnpj__icontains=query)
            )
        
        if industry:
            queryset = queryset.filter(industry__icontains=industry)
        
        if size:
            queryset = queryset.filter(size=size)
        
        if is_client:
            queryset = queryset.filter(is_client=is_client.lower() == 'true')
        
        # Paginação
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CompanyListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = CompanyListSerializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete - marca como inativo ao invés de deletar
        """
        company = self.get_object()
        company.is_active = False
        company.save()
        
        return Response(
            {'message': 'Empresa marcada como inativa'}, 
            status=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        """Override create para logging"""
        print(f'[DEBUG][CompanyViewSet][create] Dados recebidos: {request.data}')
        response = super().create(request, *args, **kwargs)
        
        # Limpar cache de estatísticas após criação
        cache_key = f'companies_stats_{request.user.id}'
        cache.delete(cache_key)
        
        return response

    def get_queryset(self):
        """Filtrar empresas por usuário se necessário"""
        queryset = Company.objects.select_related('created_by').prefetch_related('contacts')
        
        # Opção: filtrar apenas empresas criadas pelo usuário atual
        # Comentado para permitir ver todas as empresas
        # queryset = queryset.filter(created_by=self.request.user)
        
        return queryset

    def update(self, request, *args, **kwargs):
        """Override update para retornar objeto completo"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        # Retorna o objeto completo usando CompanySerializer
        return Response(CompanySerializer(instance, context={'request': request}).data)

    def partial_update(self, request, *args, **kwargs):
        """Override partial_update para retornar objeto completo"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Define o usuário atual como criador da empresa"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Busca avançada de empresas
        
        Parâmetros:
        - q: termo de busca
        - industry: filtro por setor
        - size: filtro por tamanho
        """
        q = request.query_params.get('q', '')
        industry = request.query_params.get('industry', '')
        size = request.query_params.get('size', '')
        
        queryset = self.get_queryset()
        
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q) |
                Q(email__icontains=q) |
                Q(website__icontains=q) |
                Q(industry__icontains=q) |
                Q(notes__icontains=q)
            )
        
        if industry:
            queryset = queryset.filter(industry__icontains=industry)
        
        if size:
            queryset = queryset.filter(size=size)
        
        # Limitar resultados
        queryset = queryset[:50]
        
        serializer = CompanyListSerializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count(),
            'search_term': q
        })

    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """Lista todos os contatos de uma empresa"""
        company = self.get_object()
        contacts = company.contacts.all()
        serializer = CompanyContactSerializer(contacts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_contact(self, request, pk=None):
        """Adiciona um novo contato à empresa"""
        company = self.get_object()
        serializer = CompanyContactSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(company=company)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas das empresas"""
        queryset = self.get_queryset()
        
        stats = {
            'total_companies': queryset.count(),
            'by_size': {},
            'by_industry': {},
            'recent_companies': queryset[:5].count()
        }
        
        # Estatísticas por tamanho
        for size_key, size_label in Company.COMPANY_SIZES:
            count = queryset.filter(size=size_key).count()
            if count > 0:
                stats['by_size'][size_key] = {'label': size_label, 'count': count}
        
        # Top 5 indústrias
        industries = queryset.values_list('industry', flat=True).distinct()
        for industry in industries[:5]:
            if industry:
                count = queryset.filter(industry=industry).count()
                stats['by_industry'][industry] = count
        
        return Response(stats)


class CompanyContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de contatos de empresas
    """
    queryset = CompanyContact.objects.all()
    serializer_class = CompanyContactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'position']

    def get_queryset(self):
        """Filtrar contatos por empresa se especificado"""
        queryset = CompanyContact.objects.select_related('company')
        company_id = self.request.query_params.get('company')
        
        if company_id:
            queryset = queryset.filter(company_id=company_id)
            
        return queryset

    def perform_create(self, serializer):
        """Garantir que apenas um contato seja marcado como primário por empresa"""
        is_primary = serializer.validated_data.get('is_primary', False)
        company = serializer.validated_data.get('company')
        
        if is_primary and company:
            # Remove is_primary de outros contatos da mesma empresa
            CompanyContact.objects.filter(
                company=company, 
                is_primary=True
            ).update(is_primary=False)
        
        serializer.save()
