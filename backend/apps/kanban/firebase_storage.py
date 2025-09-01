import logging
from firebase_admin import storage
from django.conf import settings
import uuid
import mimetypes
import os

logger = logging.getLogger(__name__)

class FirebaseStorageService:
    def __init__(self):
        self.bucket = storage.bucket()
    
    def upload_task_attachment(self, file_data, filename, task_id, user_id):
        """
        Upload arquivo para Firebase Storage
        """
        try:
            # Gerar path único
            file_extension = os.path.splitext(filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            firebase_path = f"kanban/tasks/{task_id}/attachments/{unique_filename}"
            
            # Upload para Firebase
            blob = self.bucket.blob(firebase_path)
            content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
            
            blob.upload_from_string(
                file_data,
                content_type=content_type
            )
            
            # Tornar arquivo público (opcional, dependendo da segurança desejada)
            # blob.make_public()
            
            logger.info(f"Arquivo {filename} enviado para Firebase Storage: {firebase_path}")
            
            return {
                'firebase_path': firebase_path,
                'filename': filename,
                'file_size': len(file_data),
                'content_type': content_type
            }
            
        except Exception as e:
            logger.error(f"Erro ao fazer upload para Firebase Storage: {e}")
            raise
    
    def get_download_url(self, firebase_path):
        """
        Gera URL de download temporária
        """
        try:
            blob = self.bucket.blob(firebase_path)
            # URL válida por 1 hora
            return blob.generate_signed_url(expiration=3600)
        except Exception as e:
            logger.error(f"Erro ao gerar URL de download: {e}")
            return None
    
    def delete_file(self, firebase_path):
        """
        Remove arquivo do Firebase Storage
        """
        try:
            blob = self.bucket.blob(firebase_path)
            blob.delete()
            logger.info(f"Arquivo removido do Firebase Storage: {firebase_path}")
            return True
        except Exception as e:
            logger.error(f"Erro ao remover arquivo: {e}")
            return False