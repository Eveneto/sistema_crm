from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Company, CompanyContact
from .serializers import (
    CompanySerializer, 
    CompanyListSerializer,
    CompanyCreateUpdateSerializer,
    CompanyContactSerializer
)


class CompanyViewSet(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        print(f'[DEBUG][ViewSet][create] Dados recebidos: {request.data}')
        return super().create(request, *args, **kwargs)
    """
    ViewSet para gerenciamento de empresas
    
    Endpoints disponíveis:
    - GET /api/companies/ - Lista todas as empresas
    - POST /api/companies/ - Cria nova empresa
    - GET /api/companies/{id}/ - Detalhe de uma empresa
    - PUT /api/companies/{id}/ - Atualiza empresa completa
    - PATCH /api/companies/{id}/ - Atualiza empresa parcial
    - DELETE /api/companies/{id}/ - Remove empresa
    - GET /api/companies/search/?q=termo - Busca empresas
    - GET /api/companies/{id}/contacts/ - Lista contatos da empresa
    - POST /api/companies/{id}/add_contact/ - Adiciona contato à empresa
    """
    queryset = Company.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['industry', 'size']
    search_fields = ['name', 'email', 'website', 'industry']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Retorna serializer apropriado para cada ação"""
        if self.action == 'list':
            return CompanyListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            # Para create/update, usar serializer correto para entrada
            return CompanyCreateUpdateSerializer
        else:
            # Para retrieve, usar CompanySerializer que inclui campos extras
            return CompanySerializer

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
