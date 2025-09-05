#!/usr/bin/env python
"""
Script para resetar senha de superuser do Django
Execute: python reset_admin_password.py
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, '/home/dev_pc/Documentos/crm_freela/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_backend.settings')
django.setup()

from django.contrib.auth.models import User

def reset_password():
    username = input("Digite o username do superuser (admin, dev_pc, ou supertester): ")
    new_password = input("Digite a nova senha: ")
    
    try:
        user = User.objects.get(username=username, is_superuser=True)
        user.set_password(new_password)
        user.save()
        print(f"✅ Senha do usuário '{username}' resetada com sucesso!")
        print(f"🔑 Agora você pode fazer login com:")
        print(f"   Username: {username}")
        print(f"   Senha: {new_password}")
        print(f"🌐 URL: http://localhost:8000/admin/")
    except User.DoesNotExist:
        print(f"❌ Usuário '{username}' não encontrado ou não é superuser.")
        print("Usuários disponíveis: admin, dev_pc, supertester")

if __name__ == "__main__":
    reset_password()
