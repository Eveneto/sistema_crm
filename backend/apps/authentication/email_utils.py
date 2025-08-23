import os
from django.core.mail import send_mail
from django.conf import settings

def send_verification_email(user, token):
    verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}/"
    subject = "Verifique seu e-mail para ativar sua conta"
    message = f"Olá {user.username},\n\nPor favor, clique no link abaixo para verificar seu e-mail e ativar sua conta:\n{verification_url}\n\nSe você não se cadastrou, ignore este e-mail."
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    send_mail(subject, message, from_email, recipient_list)
