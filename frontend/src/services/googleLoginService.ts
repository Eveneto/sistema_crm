import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import api from './api';

class GoogleLoginService {
  /**
   * Login com Google - Firebase usado APENAS como ponte
   * Fluxo: Google → Firebase Token → Exchange por Django JWT → Firebase logout
   */
  async loginWithGoogle(): Promise<{ user: any; message: string }> {
    try {
      console.log('🚀 Iniciando login Google...');
      
      // 1. Login via Firebase/Google
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('✅ Firebase Google login sucesso:', user.email);
      
      // 2. Obter token Firebase (apenas temporário)
      const firebaseToken = await user.getIdToken();
      
      console.log('🔄 Trocando Firebase token por Django JWT...');
      
      // 3. Exchange Firebase token por Django JWT (em cookies)
      const response = await api.post('/api/auth/google-login/', {
        firebase_token: firebaseToken
      });
      
      console.log('✅ Django JWT obtido e salvo em cookies');
      
      // 4. LIMPAR Firebase session (não precisamos mais)
      await auth.signOut();
      console.log('🧹 Firebase session limpa');
      
      // 5. Limpar qualquer token Firebase do localStorage
      localStorage.removeItem('firebase_token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_photo');
      
      console.log('✅ Login Google completo!');
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erro no login Google:', error);
      
      // Limpar Firebase em caso de erro
      try {
        await auth.signOut();
        localStorage.removeItem('firebase_token');
      } catch (cleanupError) {
        console.warn('⚠️ Erro ao limpar Firebase:', cleanupError);
      }
      
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Erro no login com Google'
      );
    }
  }
}

export const googleLoginService = new GoogleLoginService();
export default googleLoginService;
