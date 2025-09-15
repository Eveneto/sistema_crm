# from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AbstractUser, User
from django.db import models
import uuid

class EmailVerificationToken(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verification_tokens')
	token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)
	expires_at = models.DateTimeField()
	used = models.BooleanField(default=False)

	def __str__(self):
		return f"Token for {self.user.email} ({self.token})"

	class Meta:
		db_table = 'email_verification_tokens'
		verbose_name = 'Email Verification Token'
		verbose_name_plural = 'Email Verification Tokens'

# Profile model para estender User sem modificar AUTH_USER_MODEL
class UserProfile(models.Model):
    """Extended user profile for CRM system"""
    
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('sales', 'Sales Representative'),
        ('user', 'Regular User'),
    ]
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    
    # Firebase integration
    firebase_uid = models.CharField(
        max_length=255, 
        unique=True, 
        null=True, 
        blank=True,
        help_text="Firebase User ID for authentication"
    )
    
    # Profile information
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # Role and permissions
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='user'
    )
    
    # Company association
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees'
    )
    
    # Preferences
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='pt-BR')
    theme = models.CharField(
        max_length=20,
        choices=[('light', 'Light'), ('dark', 'Dark')],
        default='light'
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.role})"
    
    @property
    def display_name(self):
        """Return user's display name"""
        return self.user.get_full_name() or self.user.username
    
    @property
    def is_admin(self):
        """Check if user is admin"""
        return self.role == 'admin'
    
    @property
    def is_manager(self):
        """Check if user is manager or admin"""
        return self.role in ['admin', 'manager']
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        ordering = ['-created_at']

# TODO: Custom User model para implementação futura
# Descomentado quando ready para migração completa
"""
class CustomUser(AbstractUser):
    '''
    Custom User model - comentado para implementação gradual
    Para usar: descomentar e atualizar AUTH_USER_MODEL nas settings
    '''
    
    # Firebase integration
    firebase_uid = models.CharField(
        max_length=255, 
        unique=True, 
        null=True, 
        blank=True
    )
    
    # Additional fields
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('sales', 'Sales Representative'),
        ('user', 'Regular User'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='user'
    )
    
    # Company association
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='custom_employees'
    )
    
    # Preferences
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='pt-BR')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'custom_users'
        verbose_name = 'Custom User'
        verbose_name_plural = 'Custom Users'
"""
