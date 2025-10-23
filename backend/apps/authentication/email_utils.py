import os
import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def send_verification_email(user, token):
    """Enviar email de verificação para o usuário"""
    try:
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}/"
        subject = "Verifique seu e-mail para ativar sua conta"
        message = f"Olá {user.username},\n\nPor favor, clique no link abaixo para verificar seu e-mail e ativar sua conta:\n{verification_url}\n\nSe você não se cadastrou, ignore este e-mail."
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user.email]
        
        # Validar configuração de email
        if not from_email or from_email == '':
            logger.error("❌ DEFAULT_FROM_EMAIL não está configurado. Verifique o arquivo .env")
            raise ValueError("Email não configurado. Contate o administrador.")
        
        send_mail(subject, message, from_email, recipient_list)
        logger.info(f"✅ Email de verificação enviado para: {user.email}")
        
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email de verificação: {str(e)}")
        # Em produção, você pode re-lançar a exceção
        # Por enquanto, apenas logamos o erro
        raise

