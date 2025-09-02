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
      console.log('🔐 Token válido até:', new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString());
    } catch (error) {
      console.error('❌ Erro ao atualizar token Firebase:', error);
      localStorage.removeItem('firebase_token');
    }
  }

  // Método público para forçar renovação do token
  async refreshToken(): Promise<string | null> {
    if (!this.currentUser) {
      console.warn('⚠️ Usuário não autenticado, não é possível renovar token');
      return null;
    }

    try {
      console.log('🔄 Forçando renovação do token Firebase...');
      
      // Limpar token corrompido do localStorage primeiro
      localStorage.removeItem('firebase_token');
      
      // Forçar renovação completa com cache bypass
      const token = await this.currentUser.getIdToken(true);
      
      if (!token) {
        throw new Error('Token renovado está vazio');
      }
      
      // Salvar novo token
      localStorage.setItem('firebase_token', token);
      console.log('✅ Token Firebase renovado manualmente com sucesso');
      console.log('🔐 Novo token length:', token.length);
      
      return token;
    } catch (error: any) {
      console.error('❌ Erro ao renovar token Firebase:', error);
      
      // Se é erro de quota, parar refresh automático
      if (error.code === 'auth/quota-exceeded') {
        console.log('⚠️ Quota Firebase excedida - pausando serviços');
        this.stopTokenRefresh();
      }
      
      // Limpar token corrompido
      localStorage.removeItem('firebase_token');
      return null;
    }
  }

  // Método para limpar completamente o estado de autenticação
  clearAuthState() {
    console.log('🧹 Limpando estado de autenticação Firebase');
    this.stopTokenRefresh();
    this.clearLocalStorage();
  }

  private clearLocalStorage() {
    localStorage.removeItem('firebase_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_photo');
  }

  private startTokenRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    if (this.currentUser) {
      console.log('🔄 Iniciando refresh automático de token Firebase (cada 55min)');
      this.refreshInterval = setInterval(async () => {
        if (this.currentUser) {
          console.log('⏰ Executando refresh programado do token Firebase');
          await this.updateLocalStorage(this.currentUser);
        }
      }, 55 * 60 * 1000);
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
    return false;
  }

  pauseFirebaseServices() {
    console.log('⏸️ Pausando serviços Firebase - Django JWT ativo');
    this.stopTokenRefresh();
  }

  resumeFirebaseServices() {
    if (this.currentUser) {
      console.log('▶️ Resumindo serviços Firebase');
      this.startTokenRefresh();
    }
  }
}

export const firebaseTokenService = new FirebaseTokenService();
