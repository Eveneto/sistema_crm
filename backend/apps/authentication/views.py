from rest_framework.decorators import api_view, permission_classes
from .models import EmailVerificationToken
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer
)

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
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login successful'
        })


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
