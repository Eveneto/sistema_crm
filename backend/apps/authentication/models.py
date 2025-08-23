# from django.contrib.auth.models import AbstractUser
from django.db import models

from django.contrib.auth.models import User
import uuid

class EmailVerificationToken(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verification_tokens')
	token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)
	expires_at = models.DateTimeField()
	used = models.BooleanField(default=False)

	def __str__(self):
		return f"Token for {self.user.email} ({self.token})"

# TODO: Implementar User customizado depois
# class User(AbstractUser):
#     """Custom User model extending Django's AbstractUser"""
#     phone = models.CharField(max_length=20, blank=True, null=True)
#     avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
#     
#     ROLE_CHOICES = [
#         ('admin', 'Admin'),
#         ('manager', 'Manager'),
#         ('user', 'User'),
#     ]
#     
#     role = models.CharField(
#         max_length=20,
#         choices=ROLE_CHOICES,
#         default='user'
#     )
#     
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     
#     def __str__(self):
#         return f"{self.first_name} {self.last_name}" if self.first_name else self.username
