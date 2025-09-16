import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

class AuthSyncService {
  private storageKey = 'auth_logout_event';

  constructor() {
    this.setupStorageListener();
  }

  // Escuta mudanças no localStorage para sincronizar logout entre abas
  private setupStorageListener() {
    window.addEventListener('storage', (event) => {
      // Se o evento foi um logout em outra aba
      if (event.key === this.storageKey && event.newValue === 'logout') {
        // Executa logout nesta aba também
        store.dispatch(logout());
        
        // Limpa o evento após processar
        setTimeout(() => {
          localStorage.removeItem(this.storageKey);
        }, 100);
      }
    });

    // Escuta quando a aba fica visível novamente (usuário volta para a aba)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkAuthStatus();
      }
    });

    // Escuta quando a janela ganha foco
    window.addEventListener('focus', () => {
      this.checkAuthStatus();
    });
  }

  // Verifica se ainda está autenticado quando a aba fica ativa
  private checkAuthStatus() {
    // COM COOKIES HTTP-ONLY: Não verificamos tokens no localStorage
    // Os cookies são gerenciados automaticamente pelo navegador
    
    // Apenas verificar se há evento de logout em outra aba
    const logoutEvent = localStorage.getItem(this.storageKey);
    if (logoutEvent === 'logout') {
      const currentState = store.getState().auth;
      if (currentState.isAuthenticated) {
        console.log('🔄 Logout detectado em outra aba, sincronizando...');
        store.dispatch(logout());
      }
    }
    
    // NÃO fazer verificação de tokens, pois usamos cookies HTTP-Only
    // que são gerenciados automaticamente pelo navegador
  }

  // Inicia logout global em todas as abas
  triggerGlobalLogout() {
    // Sinaliza para outras abas
    localStorage.setItem(this.storageKey, 'logout');
    
    // Executa logout na aba atual
    store.dispatch(logout());
    
    // Limpa o evento após um curto delay
    setTimeout(() => {
      localStorage.removeItem(this.storageKey);
    }, 100);
  }

  // Limpa todos os dados de autenticação
  clearAllAuthData() {
    // Limpar tokens específicos
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    
    // Limpar possíveis dados de usuário em cache
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    localStorage.removeItem('userProfile');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('userProfile');
    
    // Limpar dados específicos do CRM
    localStorage.removeItem('companies');
    localStorage.removeItem('kanbanData');
    localStorage.removeItem('dashboardData');
    sessionStorage.removeItem('companies');
    sessionStorage.removeItem('kanbanData');
    sessionStorage.removeItem('dashboardData');
    
    // Limpar qualquer dado de autenticação temporário
    localStorage.removeItem('auth_state');
    localStorage.removeItem('temp_auth');
    sessionStorage.removeItem('auth_state');
    sessionStorage.removeItem('temp_auth');
    
    // Limpar dados do Firebase se existirem
    localStorage.removeItem('firebase:authUser');
    localStorage.removeItem('firebase:host');
    sessionStorage.removeItem('firebase:authUser');
    sessionStorage.removeItem('firebase:host');
    
    console.log('🧹 Todos os dados de autenticação foram limpos');
  }
}

export const authSyncService = new AuthSyncService();
