from django.apps import AppConfig


class CommunitiesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.communities'
    verbose_name = 'Communities'

    def ready(self):
        """
        Carrega os signals quando o app estiver pronto
        """
        # Importar signals se houver
        # import apps.communities.signals
        pass
