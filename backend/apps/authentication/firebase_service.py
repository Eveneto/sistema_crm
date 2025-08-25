import firebase_admin
from firebase_admin import auth, credentials
import json
import os
from django.conf import settings
from django.contrib.auth.models import User


class FirebaseService:
    _initialized = False
    
    @classmethod
    def initialize(cls):
        if cls._initialized:
            return
            
        try:
            # Procura pelo arquivo de credenciais Firebase
            cred_file = None
            
            # Verifica na raiz do projeto
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            possible_files = [
                'client_secret_254673637981-c6ura6ghq8ut7s6uosoa1oisisubsi5c.apps.googleusercontent.com.json',
                'firebase-credentials.json',
                'service-account.json'
            ]
            
            for filename in possible_files:
                filepath = os.path.join(project_root, filename)
                if os.path.exists(filepath):
                    cred_file = filepath
                    break
            
            if not cred_file:
                print("⚠️ Arquivo de credenciais Firebase não encontrado")
                return
                
            # Inicializa Firebase Admin
            cred = credentials.Certificate(cred_file)
            firebase_admin.initialize_app(cred)
            cls._initialized = True
            print("✅ Firebase Admin inicializado com sucesso")
            
        except Exception as e:
            print(f"❌ Erro ao inicializar Firebase Admin: {e}")

    @classmethod
    def verify_firebase_token(cls, token):
        """
        Verifica token Firebase e retorna dados do usuário
        """
        if not cls._initialized:
            cls.initialize()
            
        try:
            # Verifica token Firebase
            decoded_token = auth.verify_id_token(token)
            
            # Extrai informações do usuário
            user_data = {
                'uid': decoded_token.get('uid'),
                'email': decoded_token.get('email'),
                'name': decoded_token.get('name'),
                'picture': decoded_token.get('picture'),
                'email_verified': decoded_token.get('email_verified', False)
            }
            
            return user_data, None
            
        except auth.ExpiredIdTokenError:
            return None, "Token expirado"
        except auth.InvalidIdTokenError:
            return None, "Token inválido"
        except Exception as e:
            return None, f"Erro na validação: {str(e)}"

    @classmethod
    def get_or_create_user_from_firebase(cls, firebase_user_data):
        """
        Busca ou cria usuário Django baseado em dados do Firebase
        """
        try:
            email = firebase_user_data.get('email')
            if not email:
                return None, "Email não encontrado nos dados do Firebase"
            
            # Busca usuário existente
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': firebase_user_data.get('name', '').split(' ')[0] if firebase_user_data.get('name') else '',
                    'last_name': ' '.join(firebase_user_data.get('name', '').split(' ')[1:]) if firebase_user_data.get('name') else '',
                    'is_active': True
                }
            )
            
            return user, None
            
        except Exception as e:
            return None, f"Erro ao criar/buscar usuário: {str(e)}"


# Inicializar Firebase no carregamento do módulo
FirebaseService.initialize()
