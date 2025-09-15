from django.db import models
from django.conf import settings
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
import re


def validate_cnpj(cnpj):
    """Validate CNPJ format and check digits"""
    if not cnpj:
        return
    
    # Remove non-numeric characters
    cnpj = re.sub(r'[^\d]', '', cnpj)
    
    if len(cnpj) != 14:
        raise ValidationError('CNPJ deve ter 14 dígitos')
    
    # Basic CNPJ validation algorithm
    def calc_digit(cnpj, weights):
        total = sum(int(cnpj[i]) * weights[i] for i in range(len(weights)))
        remainder = total % 11
        return 0 if remainder < 2 else 11 - remainder
    
    weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    
    digit1 = calc_digit(cnpj, weights1)
    digit2 = calc_digit(cnpj, weights2)
    
    if cnpj[-2:] != f"{digit1}{digit2}":
        raise ValidationError('CNPJ inválido')


class Company(models.Model):
    COMPANY_SIZES = [
        ('startup', 'Startup'),
        ('small', 'Small (1-50)'),
        ('medium', 'Medium (51-200)'),
        ('large', 'Large (201-1000)'),
        ('enterprise', 'Enterprise (1000+)'),
    ]

    name = models.CharField(
        max_length=255,
        help_text="Nome da empresa",
        db_index=True  # Index for search performance
    )
    
    # CNPJ with validation
    cnpj = models.CharField(
        max_length=18,  # Format: XX.XXX.XXX/XXXX-XX
        blank=True,
        null=True,
        unique=True,
        validators=[validate_cnpj],
        help_text="CNPJ da empresa (formato: XX.XXX.XXX/XXXX-XX)"
    )
    
    email = models.EmailField(
        blank=True, 
        null=True,
        help_text="Email principal da empresa"
    )
    
    phone = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Telefone deve estar no formato: '+999999999'. Até 15 dígitos."
            )
        ]
    )
    
    website = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    size = models.CharField(
        max_length=20,
        choices=COMPANY_SIZES,
        blank=True,
        null=True
    )
    address = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Status fields
    is_active = models.BooleanField(default=True)
    is_client = models.BooleanField(
        default=False,
        help_text="Marca se a empresa é cliente ativo"
    )
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_companies'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    def clean(self):
        """Custom validation"""
        super().clean()
        
        # Validate CNPJ if provided
        if self.cnpj:
            validate_cnpj(self.cnpj)
    
    @property
    def formatted_cnpj(self):
        """Return formatted CNPJ"""
        if not self.cnpj:
            return None
        cnpj = re.sub(r'[^\d]', '', self.cnpj)
        if len(cnpj) == 14:
            return f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:14]}"
        return self.cnpj
    
    @property
    def contact_count(self):
        """Return number of contacts"""
        return self.contacts.count()
    
    class Meta:
        db_table = 'companies'
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['cnpj']),
            models.Index(fields=['is_active', 'is_client']),
            models.Index(fields=['created_at']),
        ]


class CompanyContact(models.Model):
    """Additional contacts for a company"""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='contacts'
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.company.name}"

    class Meta:
        db_table = 'company_contacts'
