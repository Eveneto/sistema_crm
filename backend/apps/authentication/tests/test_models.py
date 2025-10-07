"""
Testes para o modelo UserProfile do sistema de autenticação.

Cobre:
- Criação e validação de perfis de usuário
- Relacionamento com User model
- Validações de campos
- Métodos do modelo
- Edge cases e cenários de erro
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from apps.authentication.models import UserProfile
from apps.companies.models import Company


class UserProfileModelTest(TestCase):
    """Testes para o modelo UserProfile."""

    def setUp(self):
        """Configuração inicial para os testes."""
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'testpass123'
        }
        self.user = User.objects.create_user(**self.user_data)
        
        # Criar uma empresa para usar nos testes
        self.company = Company.objects.create(
            name='Test Company',
            email='company@test.com'
        )

    def test_create_user_profile_with_valid_data(self):
        """Teste de criação de perfil de usuário com dados válidos."""
        profile_data = {
            'user': self.user,
            'phone': '+5511999999999',
            'company': self.company,
            'role': 'sales',
            'firebase_uid': 'firebase_test_123'
        }
        
        profile = UserProfile.objects.create(**profile_data)
        
        self.assertEqual(profile.user, self.user)
        self.assertEqual(profile.phone, '+5511999999999')
        self.assertEqual(profile.company, self.company)
        self.assertEqual(profile.role, 'sales')
        self.assertEqual(profile.firebase_uid, 'firebase_test_123')
        self.assertIsNotNone(profile.created_at)
        self.assertIsNotNone(profile.updated_at)

    def test_user_profile_str_method(self):
        """Teste do método __str__ do UserProfile."""
        profile = UserProfile.objects.create(
            user=self.user,
            phone='+5511999999999'
        )
        
        expected_str = f"Test User (user)"  # Baseado na implementação real
        self.assertEqual(str(profile), expected_str)

    def test_user_profile_one_to_one_relationship(self):
        """Teste da relação OneToOne com User."""
        profile = UserProfile.objects.create(
            user=self.user,
            phone='+5511999999999'
        )
        
        # Verifica se o perfil está acessível via user.profile (não userprofile)
        self.assertEqual(self.user.profile, profile)
        
        # Verifica se não é possível criar outro perfil para o mesmo usuário
        with self.assertRaises(IntegrityError):
            UserProfile.objects.create(
                user=self.user,
                phone='+5511888888888'
            )

    def test_user_profile_optional_fields(self):
        """Teste de criação com campos opcionais."""
        # Criação apenas com usuário (campos opcionais vazios)
        profile = UserProfile.objects.create(user=self.user)
        
        self.assertEqual(profile.user, self.user)
        self.assertIsNone(profile.phone)  # phone pode ser None
        self.assertIsNone(profile.company)  # company pode ser None
        self.assertEqual(profile.role, 'user')  # role tem default

    def test_user_profile_phone_validation(self):
        """Teste de validação do campo telefone."""
        # Teste com telefone válido
        profile = UserProfile.objects.create(
            user=self.user,
            phone='+5511999999999'
        )
        self.assertEqual(profile.phone, '+5511999999999')
        
        # Teste com telefone vazio (deve ser permitido)
        user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com'
        )
        profile2 = UserProfile.objects.create(
            user=user2,
            phone=None
        )
        self.assertIsNone(profile2.phone)

    def test_user_profile_company_foreign_key(self):
        """Teste do relacionamento ForeignKey com Company."""
        profile = UserProfile.objects.create(
            user=self.user,
            company=self.company
        )
        self.assertEqual(profile.company, self.company)
        self.assertEqual(profile.company.name, 'Test Company')

    def test_user_profile_role_choices(self):
        """Teste das escolhas do campo role."""
        valid_roles = ['admin', 'manager', 'sales', 'user']
        
        for role in valid_roles:
            user = User.objects.create_user(
                username=f'user_{role}',
                email=f'{role}@example.com'
            )
            profile = UserProfile.objects.create(
                user=user,
                role=role
            )
            self.assertEqual(profile.role, role)

    def test_user_profile_default_values(self):
        """Teste dos valores padrão dos campos."""
        profile = UserProfile.objects.create(user=self.user)
        
        self.assertEqual(profile.role, 'user')
        self.assertEqual(profile.timezone, 'UTC')
        self.assertEqual(profile.language, 'pt-BR')
        self.assertEqual(profile.theme, 'light')
        self.assertTrue(profile.is_active)

    def test_user_profile_auto_timestamps(self):
        """Teste dos timestamps automáticos."""
        profile = UserProfile.objects.create(
            user=self.user,
            phone='+5511999999999'
        )
        
        # Verifica se created_at e updated_at foram definidos
        self.assertIsNotNone(profile.created_at)
        self.assertIsNotNone(profile.updated_at)
        
        # Verifica se são aproximadamente iguais na criação
        time_diff = abs((profile.updated_at - profile.created_at).total_seconds())
        self.assertLess(time_diff, 1)  # Diferença menor que 1 segundo

    def test_user_profile_update_timestamp(self):
        """Teste se updated_at é atualizado nas modificações."""
        profile = UserProfile.objects.create(
            user=self.user,
            phone='+5511999999999'
        )
        
        original_updated_at = profile.updated_at
        
        # Pequena pausa para garantir diferença no timestamp
        import time
        time.sleep(0.01)
        
        # Atualiza o perfil
        profile.role = 'manager'
        profile.save()
        
        # Verifica se updated_at foi modificado
        self.assertGreater(profile.updated_at, original_updated_at)

    def test_user_deletion_cascades_to_profile(self):
        """Teste se a exclusão do usuário remove o perfil."""
        profile = UserProfile.objects.create(
            user=self.user,
            phone='+5511999999999'
        )
        
        profile_id = profile.id
        
        # Remove o usuário
        self.user.delete()
        
        # Verifica se o perfil foi removido
        with self.assertRaises(UserProfile.DoesNotExist):
            UserProfile.objects.get(id=profile_id)

    def test_user_profile_fields_blank_allowed(self):
        """Teste se campos podem ser deixados em branco."""
        profile = UserProfile.objects.create(
            user=self.user,
            phone=None,  # phone pode ser None
            company=None,  # company pode ser None
            firebase_uid=None  # firebase_uid pode ser None
        )
        
        # Força a validação do modelo
        profile.full_clean()
        
        self.assertIsNone(profile.phone)
        self.assertIsNone(profile.company)
        self.assertIsNone(profile.firebase_uid)

    def test_user_profile_properties(self):
        """Teste das propriedades do modelo."""
        # Teste com admin
        admin_profile = UserProfile.objects.create(
            user=self.user,
            role='admin'
        )
        
        self.assertTrue(admin_profile.is_admin)
        self.assertTrue(admin_profile.is_manager)
        self.assertEqual(admin_profile.display_name, 'Test User')
        
        # Teste com usuário comum
        user2 = User.objects.create_user(
            username='commonuser',
            email='common@example.com'
        )
        common_profile = UserProfile.objects.create(
            user=user2,
            role='user'
        )
        
        self.assertFalse(common_profile.is_admin)
        self.assertFalse(common_profile.is_manager)

    def test_multiple_users_with_profiles(self):
        """Teste de criação de múltiplos usuários com perfis."""
        users_data = [
            {'username': 'user1', 'email': 'user1@test.com'},
            {'username': 'user2', 'email': 'user2@test.com'},
            {'username': 'user3', 'email': 'user3@test.com'},
        ]
        
        profiles = []
        for i, user_data in enumerate(users_data):
            user = User.objects.create_user(**user_data)
            profile = UserProfile.objects.create(
                user=user,
                phone=f'+551199999999{i}',
                company=self.company,
                role='sales'
            )
            profiles.append(profile)
        
        # Verifica se todos os perfis foram criados
        self.assertEqual(len(profiles), 3)
        self.assertEqual(UserProfile.objects.count(), 3)  # 3 novos perfis
        
        # Verifica dados específicos
        for i, profile in enumerate(profiles):
            self.assertEqual(profile.company, self.company)
            self.assertEqual(profile.role, 'sales')

    def test_firebase_uid_unique_constraint(self):
        """Teste da constraint unique do firebase_uid."""
        firebase_uid = 'unique_firebase_uid_123'
        
        # Cria primeiro perfil com firebase_uid
        profile1 = UserProfile.objects.create(
            user=self.user,
            firebase_uid=firebase_uid
        )
        
        # Tenta criar segundo perfil com mesmo firebase_uid
        user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com'
        )
        
        with self.assertRaises(IntegrityError):
            UserProfile.objects.create(
                user=user2,
                firebase_uid=firebase_uid
            )
