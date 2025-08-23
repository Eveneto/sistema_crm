from django.db import models
from django.conf import settings


class Company(models.Model):
    COMPANY_SIZES = [
        ('startup', 'Startup'),
        ('small', 'Small (1-50)'),
        ('medium', 'Medium (51-200)'),
        ('large', 'Large (201-1000)'),
        ('enterprise', 'Enterprise (1000+)'),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
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

    class Meta:
        db_table = 'companies'
        verbose_name_plural = 'companies'
        ordering = ['-created_at']


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
