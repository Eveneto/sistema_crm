from rest_framework.decorators import api_view, permission_classes
from .models import EmailVerificationToken
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
# from django_ratelimit.decorators import ratelimit
# from django.utils.decorators import method_decorator
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer
)
from .firebase_service import FirebaseService

# View para verificação de e-mail
@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):
    from django.utils import timezone
    try:
        token_obj = EmailVerificationToken.objects.filter(token=token, used=False).first()
        if not token_obj:
            return Response({'error': 'Token inválido ou já utilizado.'}, status=status.HTTP_400_BAD_REQUEST)
        if token_obj.expires_at < timezone.now():
            return Response({'error': 'Token expirado.'}, status=status.HTTP_400_BAD_REQUEST)
        user = token_obj.user
        user.is_active = True
        user.save()
        token_obj.used = True
        token_obj.save()
        return Response({'message': 'E-mail verificado com sucesso! Sua conta está ativa.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# @method_decorator(ratelimit(key='ip', rate='3/m', method='POST', block=True), name='create')
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        from datetime import timedelta, datetime
        from django.utils import timezone
        from .models import EmailVerificationToken
        from .email_utils import send_verification_email

        print('[DEBUG][REGISTER] Dados recebidos:', request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.is_active = False
        user.save()
        print(f'[DEBUG][REGISTER] Usuário criado: {user.username}, ativo? {user.is_active}')

        # Gerar token de verificação
        expires_at = timezone.now() + timedelta(hours=24)
        token_obj = EmailVerificationToken.objects.create(user=user, expires_at=expires_at)
        print(f'[DEBUG][REGISTER] Token de verificação gerado: {token_obj.token}')

        # Enviar e-mail de verificação
        send_verification_email(user, token_obj.token)
        print(f'[DEBUG][REGISTER] E-mail de verificação enviado para: {user.email}')

        # Não retorna token JWT para usuários inativos
        response_data = {
            'user': UserSerializer(user).data,
            'message': 'Cadastro realizado! Verifique seu e-mail para ativar a conta.'
        }
        print('[DEBUG][REGISTER] Resposta enviada:', response_data)
        return Response(response_data, status=status.HTTP_201_CREATED)


# @method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='post')
class LoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        print(f"[DEBUG][LOGIN] Payload recebido: {request.data}")
        data = request.data.copy()
        if 'username' in data and 'username_or_email' not in data:
            data['username_or_email'] = data['username']
        if 'email' in data and 'username_or_email' not in data:
            data['username_or_email'] = data['email']
        print(f"[DEBUG][LOGIN] Tentando autenticar com: username_or_email={data.get('username_or_email')}, password={data.get('password')}")
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            print(f"[DEBUG][LOGIN] Erro na validação: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.validated_data['user']
        print(f"[DEBUG][LOGIN] Usuário autenticado: {user.username}, ativo? {user.is_active}")
        if not user.is_active:
            print(f"[DEBUG][LOGIN] Usuário não está ativo!")
            return Response({'error': 'Conta não ativada. Verifique seu e-mail.'}, status=status.HTTP_403_FORBIDDEN)
        refresh = RefreshToken.for_user(user)
        print(f"[DEBUG][LOGIN] Login bem-sucedido para: {user.username}")
        
        # Criar resposta com dados do usuário
        response_data = {
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        }
        
        response = Response(response_data)
        
        # Configurar cookies HttpOnly para tokens (SEGURANÇA MÁXIMA)
        # Access token (1 hora)
        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            max_age=3600,  # 1 hora
            httponly=True,  # Não acessível via JavaScript
            secure=not settings.DEBUG,  # HTTPS apenas em produção
            samesite='Lax',  # Proteção CSRF
            path='/'
        )
        
        # Refresh token (7 dias)
        response.set_cookie(
            'refresh_token',
            str(refresh),
            max_age=7*24*3600,  # 7 dias
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            path='/'
        )
        
        return response


# @method_decorator(ratelimit(key='ip', rate='10/m', method='POST', block=True), name='post')
class GoogleLoginView(generics.GenericAPIView):
    """
    Login via Google usando Firebase como ponte
    Firebase é usado APENAS para obter token Google, depois descartado
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        firebase_token = request.data.get('firebase_token')
        
        if not firebase_token:
            return Response(
                {'error': 'Token Firebase é obrigatório'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar token Firebase (APENAS UMA VEZ)
        firebase_user_data, error = FirebaseService.verify_firebase_token(firebase_token)
        
        if error:
            return Response(
                {'error': f'Token Firebase inválido: {error}'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Criar/buscar usuário Django baseado nos dados do Google
        user, error = FirebaseService.get_or_create_user_from_firebase(firebase_user_data)
        
        if error:
            return Response(
                {'error': f'Erro ao criar usuário: {error}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Gerar tokens Django JWT
        refresh = RefreshToken.for_user(user)
        
        print(f"[DEBUG][GOOGLE_LOGIN] Login Google bem-sucedido para: {user.email}")
        
        # Resposta apenas com dados do usuário (SEM TOKENS)
        response_data = {
            'user': UserSerializer(user).data,
            'message': 'Login Google realizado com sucesso'
        }
        
        response = Response(response_data)
        
        # Configurar cookies HttpOnly seguros
        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            max_age=60 * 60,  # 1 hora
            httponly=True,
            secure=False,  # False para desenvolvimento, True para produção
            samesite='Lax'
        )
        
        response.set_cookie(
            'refresh_token',
            str(refresh),
            max_age=60 * 60 * 24 * 7,  # 7 dias
            httponly=True,
            secure=False,  # False para desenvolvimento, True para produção
            samesite='Lax'
        )
        
        return response


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        response = Response({'message': 'Logout realizado com sucesso'})
        
        # Limpar cookies HttpOnly
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        
        print(f"[DEBUG][LOGOUT] Logout realizado para usuário: {request.user.email if request.user.is_authenticated else 'Anônimo'}")
        
        return response


class TokenRefreshView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Tentar pegar refresh token do cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token não encontrado'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)
            
            response = Response({'message': 'Token renovado com sucesso'})
            
            # Atualizar cookie de access token
            response.set_cookie(
                'access_token',
                new_access_token,
                max_age=60 * 60,  # 1 hora
                httponly=True,
                secure=False,  # False para desenvolvimento
                samesite='Lax'
            )
            
            return response
            
        except Exception as e:
            return Response(
                {'error': 'Refresh token inválido'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class FirebaseTokenValidationView(generics.GenericAPIView):
    """
    View para validar tokens Firebase e retornar token JWT do Django
    """
    permission_classes = [AllowAny]

    def post(self, request):
        firebase_token = request.data.get('firebase_token')
        
        if not firebase_token:
            return Response({
                'error': 'Token Firebase é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Valida token Firebase
        firebase_user_data, error = FirebaseService.verify_firebase_token(firebase_token)
        
        if error:
            return Response({
                'error': error
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Busca ou cria usuário Django
        user, error = FirebaseService.get_or_create_user_from_firebase(firebase_user_data)
        
        if error:
            return Response({
                'error': error
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Gera tokens JWT Django
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Token Firebase validado com sucesso',
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'firebase_data': firebase_user_data
        }, status=status.HTTP_200_OK)


@csrf_exempt
@require_http_methods(["GET", "HEAD"])
def health_check(request):
    """Endpoint de health check para monitoramento"""
    return JsonResponse({
        'status': 'healthy',
        'debug': settings.DEBUG,
        'environment': 'development' if settings.DEBUG else 'production'
    })
