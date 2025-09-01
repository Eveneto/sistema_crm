import logging
from django.contrib.auth.models import User
from django.conf import settings
from firebase_admin import auth, credentials
import firebase_admin
import os

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self._app = None
    
    def initialize(self):
        """Inicializa Firebase Admin SDK"""
        if self._app:
            return

        try:
            # Prefer Django settings, then env var for credentials path
            cred_path = getattr(settings, 'FIREBASE_CREDENTIALS_PATH', None)
            if not cred_path:
                cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')

            # Fallback: procurar no diretório do projeto (ou cwd)
            project_root = os.getenv('PROJECT_ROOT', os.getcwd())
            if not cred_path:
                for file in os.listdir(project_root):
                    if file.startswith('client_secret_254673637981-') or file.startswith('crm-system-ff0eb-'):
                        cred_path = os.path.join(project_root, file)
                        break

            if not cred_path or not os.path.exists(cred_path):
                raise FileNotFoundError("Arquivo de credenciais Firebase não encontrado. Defina FIREBASE_CREDENTIALS_PATH ou coloque o arquivo no diretório do projeto.")

            cred = credentials.Certificate(cred_path)

            # Evitar múltiplas inicializações do SDK
            try:
                # Tenta obter app existente
                self._app = firebase_admin.get_app()
                logger.info("Firebase Admin já estava inicializado, usando app existente.")
            except ValueError:
                # Não havia app inicializado ainda
                self._app = firebase_admin.initialize_app(cred)
                logger.info("✅ Firebase Admin inicializado com sucesso")
        except Exception as e:
            logger.error(f"❌ Erro na inicialização Firebase: {e}")
            raise
    
    def verify_token(self, token):
        """Verifica token Firebase e retorna dados do usuário"""
        try:
            # Garantir inicialização antes de verificar
            self.initialize()
            decoded_token = auth.verify_id_token(token)
            logger.info(f"Token verificado para: {decoded_token.get('email')}")
            return decoded_token
        except Exception as e:
            logger.error(f"Erro na verificação do token: {e}")
            raise
    
    def create_or_update_user(self, firebase_user):
        """Cria ou atualiza usuário Django baseado no Firebase user"""
        try:
            email = firebase_user.get('email')
            if not email:
                raise ValueError("Email não encontrado no token Firebase")
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': firebase_user.get('uid'),
                    'first_name': firebase_user.get('name', '').split(' ')[0] if firebase_user.get('name') else '',
                    'last_name': ' '.join(firebase_user.get('name', '').split(' ')[1:]) if firebase_user.get('name') else '',
                    'is_active': True,
                    'is_staff': False,  # NÃO conceder is_staff por padrão
                }
            )
            
            if created:
                logger.info(f"✅ Novo usuário criado: {user.email}")
            else:
                logger.info(f"🔄 Usuário existente atualizado: {user.email}")
            
            return user
        except Exception as e:
            logger.error(f"Erro ao criar/atualizar usuário: {e}")
            raise
