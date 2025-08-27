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

    // MODIFICAÇÃO: Só inicia refresh se há um usuário Firebase ativo
    // E apenas a cada 55 minutos (mais conservador para evitar quota exceeded)
    if (this.currentUser) {
      console.log('🔄 Iniciando refresh automático de token Firebase (cada 55min)');
      this.refreshInterval = setInterval(async () => {
        if (this.currentUser) {
          console.log('⏰ Executando refresh programado do token Firebase');
          await this.updateLocalStorage(this.currentUser);
        }
      }, 55 * 60 * 1000); // 55 minutos (mais conservador)
    }
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
        console.log('🔄 Forçando refresh do token Firebase...');
        const token = await this.currentUser.getIdToken(true);
        localStorage.setItem('firebase_token', token);
        console.log('✅ Token Firebase renovado com sucesso');
        return token;
      } catch (error: any) {
        console.error('❌ Erro ao forçar refresh do token:', error);
        
        // Se é erro de quota, para o refresh automático
        if (error.code === 'auth/quota-exceeded') {
          console.log('⚠️ Quota Firebase excedida - parando refresh automático');
          this.stopTokenRefresh();
        }
        return null;
      }
    }
    console.log('⚠️ Nenhum usuário Firebase ativo para renovar token');
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

  // Novo método para desabilitar Firebase quando Django JWT está disponível
  pauseFirebaseServices() {
    console.log('⏸️ Pausando serviços Firebase - Django JWT ativo');
    this.stopTokenRefresh();
  }

  // Novo método para reabilitar Firebase se necessário
  resumeFirebaseServices() {
    if (this.currentUser) {
      console.log('▶️ Resumindo serviços Firebase');
      this.startTokenRefresh();
    }
  }
}

export const firebaseTokenService = new FirebaseTokenService();
