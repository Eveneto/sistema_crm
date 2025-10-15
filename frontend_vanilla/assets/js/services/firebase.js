// Firebase Configuration e Auth Service
const firebaseConfig = {
    // TODO: Substitua pelas suas configurações reais do Firebase
    // Para teste, use configurações temporárias ou as mesmas do projeto React
    apiKey: "AIzaSyDemo-Key-Replace-With-Yours",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com", 
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo-app-id"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Firebase Auth Service
class FirebaseAuthService {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.setupAuthStateChanged();
    }

    // Configurar listener para mudanças de estado de autenticação
    setupAuthStateChanged() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                this.token = await user.getIdToken();
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('user', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                }));
                
                // Se estiver na página de login, redirecionar para dashboard
                if (window.location.hash === '#login' || window.location.hash === '') {
                    window.location.hash = '#dashboard';
                    window.app.loadPage('dashboard');
                }
                
                this.updateUIWithUser(user);
            } else {
                this.currentUser = null;
                this.token = null;
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                
                // Se não estiver na página de login, redirecionar
                if (window.location.hash !== '#login') {
                    window.location.hash = '#login';
                    window.app.loadPage('login');
                }
            }
        });
    }

    // Login com email e senha
    async login(email, password) {
        try {
            showLoading(true);
            const result = await auth.signInWithEmailAndPassword(email, password);
            showToast('Login realizado com sucesso!', 'success');
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Erro no login:', error);
            let message = 'Erro ao fazer login';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'Usuário não encontrado';
                    break;
                case 'auth/wrong-password':
                    message = 'Senha incorreta';
                    break;
                case 'auth/invalid-email':
                    message = 'Email inválido';
                    break;
                case 'auth/too-many-requests':
                    message = 'Muitas tentativas. Tente novamente mais tarde';
                    break;
                default:
                    message = error.message;
            }
            
            showToast(message, 'error');
            return { success: false, error: message };
        } finally {
            showLoading(false);
        }
    }

    // Registro com email e senha
    async register(email, password, displayName) {
        try {
            showLoading(true);
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            // Atualizar perfil com nome
            if (displayName) {
                await result.user.updateProfile({
                    displayName: displayName
                });
            }
            
            showToast('Conta criada com sucesso!', 'success');
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Erro no registro:', error);
            let message = 'Erro ao criar conta';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'Email já está em uso';
                    break;
                case 'auth/weak-password':
                    message = 'Senha muito fraca';
                    break;
                case 'auth/invalid-email':
                    message = 'Email inválido';
                    break;
                default:
                    message = error.message;
            }
            
            showToast(message, 'error');
            return { success: false, error: message };
        } finally {
            showLoading(false);
        }
    }

    // Logout
    async logout() {
        try {
            await auth.signOut();
            showToast('Logout realizado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro no logout:', error);
            showToast('Erro ao fazer logout', 'error');
        }
    }

    // Obter token atual
    async getCurrentToken() {
        if (this.currentUser) {
            return await this.currentUser.getIdToken();
        }
        return null;
    }

    // Verificar se está autenticado
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Atualizar UI com dados do usuário
    updateUIWithUser(user) {
        if (user) {
            const userName = user.displayName || user.email || 'Usuário';
            $('#user-name').text(userName);
        }
    }

    // Resetar senha
    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            showToast('Email de recuperação enviado!', 'success');
            return { success: true };
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            showToast('Erro ao enviar email de recuperação', 'error');
            return { success: false, error: error.message };
        }
    }
}

// Instância global do serviço de autenticação
window.firebaseAuth = new FirebaseAuthService();
