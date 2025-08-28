import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

@pytest.mark.django_db
def test_create_company():
    User = get_user_model()
    user = User.objects.create_user(username='test', password='test123')
    client = APIClient()
    client.force_authenticate(user=user)
    data = {'name': 'Empresa Teste', 'website': 'empresa.com'}
    response = client.post('/api/companies/companies/', data)
    assert response.status_code == 201
    assert response.data['name'] == 'Empresa Teste'
