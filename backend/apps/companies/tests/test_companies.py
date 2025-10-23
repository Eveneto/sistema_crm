from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from rest_framework import status


class CompanyTest(APITestCase):
    """Testes para a API de empresas."""

    def setUp(self):
        """Configuração inicial para os testes."""
        self.client = APIClient()
        self.company_url = '/api/companies/companies/'

        # Criar usuário de teste
        User = get_user_model()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_create_company(self):
        """Teste de criação de empresa."""
        self.client.force_authenticate(user=self.user)
        data = {
            'name': 'Empresa Teste',
            'website': 'https://empresa.com'
        }
        response = self.client.post(self.company_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Empresa Teste')
