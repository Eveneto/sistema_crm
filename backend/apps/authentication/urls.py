from django.urls import path
from .views import RegisterView, LoginView, GoogleLoginView, LogoutView, TokenRefreshView, UserProfileView, verify_email, FirebaseTokenValidationView, health_check

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('verify-email/<uuid:token>/', verify_email, name='verify_email'),
    path('firebase-validate/', FirebaseTokenValidationView.as_view(), name='firebase_validate'),
    path('health/', health_check, name='health_check'),
]
