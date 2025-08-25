import { auth } from '../firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

class FirebaseTokenService {
  private refreshInterval: NodeJS.Timeout | null = null;
  private currentUser: User | null = null;

  init() {
    // Monitora mudanças no estado de autenticação
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.startTokenRefresh();
        this.updateLocalStorage(user);
      } else {
        this.stopTokenRefresh();
        this.clearLocalStorage();
      }
    });
  }

  private async updateLocalStorage(user: User) {
    try {
      const token = await user.getIdToken(true); // Force refresh
      localStorage.setItem('firebase_token', token);
      localStorage.setItem('user_email', user.email || '');
      localStorage.setItem('user_name', user.displayName || '');
      localStorage.setItem('user_photo', user.photoURL || '');
      
      console.log('🔄 Token Firebase atualizado:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Erro ao atualizar token Firebase:', error);
    }
  }

  private clearLocalStorage() {
    localStorage.removeItem('firebase_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_photo');
  }

  private startTokenRefresh() {
    // Limpa intervalo anterior se existir
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Atualiza token a cada 50 minutos (tokens Firebase expiram em 1h)
    this.refreshInterval = setInterval(async () => {
      if (this.currentUser) {
        await this.updateLocalStorage(this.currentUser);
      }
    }, 50 * 60 * 1000); // 50 minutos
  }

  private stopTokenRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async forceRefreshToken(): Promise<string | null> {
    if (this.currentUser) {
      try {
        const token = await this.currentUser.getIdToken(true);
        localStorage.setItem('firebase_token', token);
        return token;
      } catch (error) {
        console.error('❌ Erro ao forçar refresh do token:', error);
        return null;
      }
    }
    return null;
  }

  getCurrentToken(): string | null {
    return localStorage.getItem('firebase_token');
  }

  isTokenExpiringSoon(): boolean {
    // Implementar lógica para verificar se token expira em breve
    // Por enquanto, sempre retorna false
    return false;
  }
}

export const firebaseTokenService = new FirebaseTokenService();
