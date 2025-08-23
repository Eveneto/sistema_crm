from django.urls import path
from .views import RegisterView, LoginView, LogoutView, UserProfileView, verify_email

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('verify-email/<uuid:token>/', verify_email, name='verify_email'),
]
