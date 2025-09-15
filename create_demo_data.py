#!/usr/bin/env python
"""
Script para popular o banco de dados com dados realistas para demonstração do CRM
"""
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Configurar Django
sys.path.append('/home/dev_pc/Documentos/crm_freela/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_backend.settings')
django.setup()

from django.contrib.auth.models import User
from apps.companies.models import Company
from apps.kanban.models import Board, Column, Task
from apps.communities.models import Community, CommunityMember
from apps.chat.models import ChatRoom, ChatRoomMember, ChatMessage

def create_demo_users():
    """Criar usuários de demonstração"""
    print("🧑‍💼 Criando usuários de demonstração...")
    
    users_data = [
        {'username': 'admin', 'email': 'admin@crm.com', 'first_name': 'Admin', 'last_name': 'Sistema', 'is_staff': True, 'is_superuser': True},
        {'username': 'joao.silva', 'email': 'joao@crm.com', 'first_name': 'João', 'last_name': 'Silva'},
        {'username': 'maria.santos', 'email': 'maria@crm.com', 'first_name': 'Maria', 'last_name': 'Santos'},
        {'username': 'pedro.costa', 'email': 'pedro@crm.com', 'first_name': 'Pedro', 'last_name': 'Costa'},
        {'username': 'ana.rodrigues', 'email': 'ana@crm.com', 'first_name': 'Ana', 'last_name': 'Rodrigues'},
        {'username': 'carlos.oliveira', 'email': 'carlos@crm.com', 'first_name': 'Carlos', 'last_name': 'Oliveira'},
        {'username': 'lucia.pereira', 'email': 'lucia@crm.com', 'first_name': 'Lúcia', 'last_name': 'Pereira'},
        {'username': 'rafael.lima', 'email': 'rafael@crm.com', 'first_name': 'Rafael', 'last_name': 'Lima'},
    ]
    
    created_users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'is_staff': user_data.get('is_staff', False),
                'is_superuser': user_data.get('is_superuser', False),
            }
        )
        if created:
            user.set_password('123456')  # Senha padrão para demo
            user.save()
            print(f"  ✅ Usuário criado: {user.first_name} {user.last_name}")
        else:
            print(f"  ℹ️  Usuário já existe: {user.first_name} {user.last_name}")
        created_users.append(user)
    
    return created_users

def create_demo_companies():
    """Criar empresas de demonstração"""
    print("🏢 Criando empresas de demonstração...")
    
    companies_data = [
        {
            'name': 'TechStart Solutions',
            'email': 'contato@techstart.com',
            'phone': '(11) 99999-0001',
            'address': 'Av. Paulista, 1000, São Paulo - SP, 01310-100',
            'website': 'https://techstart.com',
            'industry': 'Tecnologia',
            'size': 'startup',
            'notes': 'Empresa especializada em soluções tecnológicas inovadoras para startups.'
        },
        {
            'name': 'Global Marketing Group',
            'email': 'info@globalmarketing.com',
            'phone': '(11) 99999-0002',
            'address': 'Rua Augusta, 2500, São Paulo - SP, 01412-100',
            'website': 'https://globalmarketing.com',
            'industry': 'Marketing',
            'size': 'medium',
            'notes': 'Agência de marketing digital com foco em resultados mensuráveis.'
        },
        {
            'name': 'Innovation Labs Brasil',
            'email': 'contato@innovationlabs.com.br',
            'phone': '(21) 99999-0003',
            'address': 'Av. Copacabana, 500, Rio de Janeiro - RJ, 22070-000',
            'website': 'https://innovationlabs.com.br',
            'industry': 'Pesquisa e Desenvolvimento',
            'size': 'small',
            'notes': 'Laboratório de inovação focado em pesquisa e desenvolvimento.'
        },
        {
            'name': 'Digital Dynamics Corp',
            'email': 'hello@digitaldynamics.com',
            'phone': '(11) 99999-0004',
            'address': 'Rua Faria Lima, 3000, São Paulo - SP, 04538-132',
            'website': 'https://digitaldynamics.com',
            'industry': 'Consultoria',
            'size': 'large',
            'notes': 'Consultoria em transformação digital para grandes empresas.'
        },
        {
            'name': 'Green Energy Solutions',
            'email': 'contato@greenenergy.com.br',
            'phone': '(31) 99999-0005',
            'address': 'Av. Afonso Pena, 1500, Belo Horizonte - MG, 30130-000',
            'website': 'https://greenenergy.com.br',
            'industry': 'Energia',
            'size': 'medium',
            'notes': 'Especialista em soluções de energia renovável e sustentabilidade.'
        },
        {
            'name': 'FinTech Brasil Ltda',
            'email': 'info@fintechbrasil.com',
            'phone': '(11) 99999-0006',
            'address': 'Av. Brigadeiro Faria Lima, 4000, São Paulo - SP, 04538-132',
            'website': 'https://fintechbrasil.com',
            'industry': 'Fintech',
            'size': 'startup',
            'notes': 'Startup de tecnologia financeira com soluções de pagamento.'
        },
        {
            'name': 'E-Commerce Masters',
            'email': 'vendas@ecommercemasters.com',
            'phone': '(47) 99999-0007',
            'address': 'Rua XV de Novembro, 800, Blumenau - SC, 89010-000',
            'website': 'https://ecommercemasters.com',
            'industry': 'E-commerce',
            'size': 'small',
            'notes': 'Plataforma completa para criação e gestão de lojas online.'
        },
        {
            'name': 'Cloud Computing Pro',
            'email': 'contato@cloudpro.com.br',
            'phone': '(51) 99999-0008',
            'address': 'Av. Ipiranga, 2000, Porto Alegre - RS, 90160-000',
            'website': 'https://cloudpro.com.br',
            'industry': 'Cloud Computing',
            'size': 'medium',
            'notes': 'Serviços de infraestrutura em nuvem e migração de sistemas.'
        }
    ]
    
    created_companies = []
    admin_user = User.objects.filter(username='admin').first()
    
    for company_data in companies_data:
        company, created = Company.objects.get_or_create(
            name=company_data['name'],
            defaults={
                **company_data,
                'created_by': admin_user
            }
        )
        if created:
            print(f"  ✅ Empresa criada: {company.name}")
        else:
            print(f"  ℹ️  Empresa já existe: {company.name}")
        created_companies.append(company)
    
    return created_companies

def create_demo_kanban(companies, users):
    """Criar boards e tasks de demonstração"""
    print("📋 Criando boards e tasks de demonstração...")
    
    admin_user = users[0]  # Admin
    
    created_boards = []
    for company in companies[:5]:  # Criar boards para as primeiras 5 empresas
        board, created = Board.objects.get_or_create(
            name=f"Pipeline {company.name}",
            company=company,
            defaults={
                'description': f'Pipeline de vendas para {company.name}',
                'created_by': admin_user
            }
        )
        if created:
            print(f"  ✅ Board criado: {board.name}")
            
            # Criar colunas padrão se não existirem
            columns_data = [
                {'name': 'Prospecção', 'position': 0, 'color': '#ff4d4f'},
                {'name': 'Contato Inicial', 'position': 1, 'color': '#faad14'},
                {'name': 'Proposta', 'position': 2, 'color': '#1890ff'},
                {'name': 'Negociação', 'position': 3, 'color': '#722ed1'},
                {'name': 'Fechado', 'position': 4, 'color': '#52c41a'},
            ]
            
            for col_data in columns_data:
                column, col_created = Column.objects.get_or_create(
                    board=board,
                    name=col_data['name'],
                    defaults={
                        'position': col_data['position'],
                        'color': col_data['color']
                    }
                )
                if col_created:
                    print(f"    ✅ Coluna criada: {column.name}")
            
            # Criar algumas tasks de exemplo
            columns = board.columns.all()
            task_titles = [
                'Reunião de apresentação',
                'Envio de proposta comercial',
                'Análise de necessidades',
                'Demo do sistema',
                'Negociação de valores',
                'Contrato em análise',
                'Implementação do projeto'
            ]
            
            for i, title in enumerate(task_titles[:4]):  # 4 tasks por board
                column = columns[i % len(columns)]
                from django.utils import timezone
                task, task_created = Task.objects.get_or_create(
                    title=title,
                    column=column,
                    defaults={
                        'description': f'Task relacionada ao pipeline de {company.name}',
                        'assigned_to': random.choice(users[1:4]),  # Usuários aleatórios
                        'created_by': admin_user,  # Campo obrigatório
                        'priority': random.choice(['low', 'medium', 'high']),
                        'due_date': timezone.now() + timedelta(days=random.randint(1, 30))
                    }
                )
                if task_created:
                    print(f"    ✅ Task criada: {task.title}")
        
        created_boards.append(board)
    
    return created_boards

def create_demo_communities(users):
    """Criar comunidades de demonstração"""
    print("🏘️ Criando comunidades de demonstração...")
    
    communities_data = [
        {
            'name': 'Equipe de Vendas',
            'description': 'Comunidade da equipe de vendas para discussões e alinhamentos',
            'is_public': True,
            'max_members': 50
        },
        {
            'name': 'Desenvolvimento',
            'description': 'Comunidade dos desenvolvedores para discussões técnicas',
            'is_public': False,
            'max_members': 20
        },
        {
            'name': 'Marketing Digital',
            'description': 'Estratégias e campanhas de marketing digital',
            'is_public': True,
            'max_members': 30
        },
        {
            'name': 'Suporte ao Cliente',
            'description': 'Equipe de atendimento e suporte aos clientes',
            'is_public': True,
            'max_members': 25
        },
        {
            'name': 'Gerência',
            'description': 'Discussões estratégicas da gerência',
            'is_public': False,
            'max_members': 10
        }
    ]
    
    admin_user = users[0]
    created_communities = []
    
    for comm_data in communities_data:
        community, created = Community.objects.get_or_create(
            name=comm_data['name'],
            defaults={
                'description': comm_data['description'],
                'created_by': admin_user,
                'is_public': comm_data['is_public'],
                'max_members': comm_data['max_members']
            }
        )
        if created:
            print(f"  ✅ Comunidade criada: {community.name}")
            
            # Adicionar membros aleatórios
            members_to_add = random.sample(users, min(len(users), random.randint(3, 7)))
            for user in members_to_add:
                role = 'admin' if user == admin_user else random.choice(['member', 'moderator'])
                member, member_created = CommunityMember.objects.get_or_create(
                    community=community,
                    user=user,
                    defaults={'role': role}
                )
                if member_created:
                    print(f"    ✅ Membro adicionado: {user.first_name} ({role})")
        
        created_communities.append(community)
    
    return created_communities

def create_demo_chat_messages(communities, users):
    """Criar mensagens de chat de demonstração"""
    print("💬 Criando mensagens de chat de demonstração...")
    
    sample_messages = [
        "Boa tarde pessoal! Como estão os projetos?",
        "Consegui fechar mais um deal hoje! 🎉",
        "Alguém pode me ajudar com a proposta do cliente X?",
        "Reunião amanhã às 14h, não esqueçam!",
        "Parabéns pelo excelente trabalho na última apresentação!",
        "Vamos organizar uma reunião para alinhar a estratégia",
        "O cliente ficou muito interessado no nosso produto",
        "Preciso de apoio da equipe técnica para esta demanda",
        "Ótima ideia! Vamos implementar isso",
        "Finalizei a documentação, já podem revisar"
    ]
    
    for community in communities:
        # Verificar se já existe chat room para esta comunidade
        chat_room = getattr(community, 'chat_room', None)
        if not chat_room:
            chat_room = ChatRoom.objects.create(
                name=f"Chat {community.name}",
                room_type='community',
                community=community,
                created_by=community.created_by
            )
            print(f"  ✅ Chat room criado: {chat_room.name}")
        
        # Adicionar membros da comunidade ao chat
        community_members = community.members.all()
        for member in community_members:
            chat_member, created = ChatRoomMember.objects.get_or_create(
                room=chat_room,
                user=member.user,
                defaults={'role': member.role}
            )
        
        # Criar mensagens de exemplo
        for i in range(random.randint(5, 10)):
            sender = random.choice([m.user for m in community_members])
            message_content = random.choice(sample_messages)
            
            message = ChatMessage.objects.create(
                room=chat_room,
                sender=sender,
                content=message_content,
                created_at=datetime.now() - timedelta(
                    hours=random.randint(1, 72),
                    minutes=random.randint(0, 59)
                )
            )
            print(f"    ✅ Mensagem criada por {sender.first_name}")

def main():
    """Função principal para executar toda a criação de dados demo"""
    print("🚀 Iniciando criação de dados de demonstração para CRM...")
    print("=" * 60)
    
    try:
        # 1. Criar usuários
        users = create_demo_users()
        print(f"✅ {len(users)} usuários processados")
        
        # 2. Criar empresas
        companies = create_demo_companies()
        print(f"✅ {len(companies)} empresas processadas")
        
        # 3. Criar boards e tasks kanban
        boards = create_demo_kanban(companies, users)
        print(f"✅ {len(boards)} boards processados")
        
        # 4. Criar comunidades
        communities = create_demo_communities(users)
        print(f"✅ {len(communities)} comunidades processadas")
        
        # 5. Criar mensagens de chat
        create_demo_chat_messages(communities, users)
        print("✅ Mensagens de chat criadas")
        
        print("=" * 60)
        print("🎉 DADOS DE DEMONSTRAÇÃO CRIADOS COM SUCESSO!")
        print()
        print("📊 RESUMO:")
        print(f"   👥 Usuários: {User.objects.count()}")
        print(f"   🏢 Empresas: {Company.objects.count()}")
        print(f"   📋 Boards: {Board.objects.count()}")
        print(f"   ✅ Tasks: {Task.objects.count()}")
        print(f"   🏘️ Comunidades: {Community.objects.count()}")
        print(f"   💬 Mensagens: {ChatMessage.objects.count()}")
        print()
        print("🔑 LOGIN DEMO:")
        print("   Usuário: admin")
        print("   Senha: 123456")
        print()
        print("🎬 Sistema pronto para apresentação!")
        
    except Exception as e:
        print(f"❌ Erro durante a criação dos dados: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
