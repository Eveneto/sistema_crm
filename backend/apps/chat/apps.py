from django.apps import AppConfig


class ChatConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.chat'
    verbose_name = 'Chat'
    
    def ready(self):
        """
        Executado quando a app é inicializada
        Pode ser usado para registrar signals, etc.
        """
        # Importar signals quando necessário
        import apps.chat.signals
