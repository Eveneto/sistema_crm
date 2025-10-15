// Main Application File
class CRMApp {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Inicializando CRM Sistema...');
            
            // Aguardar DOM estar pronto
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            this.showInitializationError();
        }
    }

    async start() {
        try {
            // Verificar se serviços estão disponíveis
            this.checkServices();
            
            // Inicializar componentes
            this.initializeComponents();
            
            // Carregar páginas adicionais
            this.loadPageModules();
            
            // Verificar conectividade com backend
            await this.checkBackendConnection();
            
            // Marcar como inicializada
            this.isInitialized = true;
            
            console.log('✅ CRM Sistema inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro durante inicialização:', error);
            showToast('Erro ao inicializar sistema', 'error');
        }
    }

    checkServices() {
        // Verificar se jQuery está carregado
        if (typeof $ === 'undefined') {
            throw new Error('jQuery não foi carregado');
        }
        
        // Verificar se Bootstrap está carregado
        if (typeof bootstrap === 'undefined') {
            throw new Error('Bootstrap não foi carregado');
        }
        
        // Verificar se Firebase está carregado
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase não foi carregado');
        }
        
        // Verificar se Chart.js está carregado
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js não foi carregado');
        }
        
        console.log('✅ Todos os serviços necessários estão carregados');
    }

    initializeComponents() {
        // Configurar Chart.js defaults
        Chart.defaults.font.family = "'Segoe UI', 'Roboto', sans-serif";
        Chart.defaults.color = '#6c757d';
        Chart.defaults.borderColor = '#dee2e6';
        Chart.defaults.backgroundColor = 'rgba(13, 110, 253, 0.1)';
        
        // Configurar jQuery AJAX defaults
        $.ajaxSetup({
            timeout: 30000, // 30 segundos
            cache: false,
            error: function(xhr, status, error) {
                if (status === 'timeout') {
                    showToast('Tempo limite da requisição excedido', 'error');
                } else if (xhr.status === 0) {
                    showToast('Erro de conexão com o servidor', 'error');
                } else {
                    console.error('Erro AJAX:', error);
                }
            }
        });
        
        // Progress bar para requisições AJAX
        $(document).ajaxStart(() => showLoading(true));
        $(document).ajaxStop(() => showLoading(false));
        
        console.log('✅ Componentes inicializados');
    }

    loadPageModules() {
        // As páginas são carregadas dinamicamente quando necessário
        // Aqui podemos pré-carregar módulos críticos se necessário
        
        console.log('✅ Módulos de páginas configurados');
    }

    async checkBackendConnection() {
        try {
            showLoading(true);
            const health = await window.api.healthCheck();
            
            if (health && health.status !== 'error') {
                console.log('✅ Conexão com backend estabelecida');
                this.showConnectionStatus(true);
            } else {
                console.warn('⚠️ Backend respondeu mas com status de erro');
                this.showConnectionStatus(false);
            }
            
        } catch (error) {
            console.warn('⚠️ Não foi possível conectar com o backend:', error);
            this.showConnectionStatus(false);
            
            // Não bloquear a aplicação se o backend estiver fora
            // showToast('Backend temporariamente indisponível', 'warning');
        } finally {
            showLoading(false);
        }
    }

    showConnectionStatus(isConnected) {
        const statusHtml = isConnected 
            ? '<small class="text-success"><i class="bi bi-circle-fill"></i> Online</small>'
            : '<small class="text-warning"><i class="bi bi-circle-fill"></i> Offline</small>';
        
        $('.navbar-brand').append(` ${statusHtml}`);
    }

    showInitializationError() {
        $('body').html(`
            <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
                <div class="text-center">
                    <i class="bi bi-exclamation-triangle text-danger" style="font-size: 4rem;"></i>
                    <h3 class="mt-3">Erro de Inicialização</h3>
                    <p class="text-muted">Houve um problema ao carregar o sistema.</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        Tentar Novamente
                    </button>
                </div>
            </div>
        `);
    }

    // Métodos utilitários
    getCurrentUser() {
        return this.currentUser;
    }

    setCurrentUser(user) {
        this.currentUser = user;
    }

    isAppInitialized() {
        return this.isInitialized;
    }
}

// Inicializar aplicação quando o script for carregado
window.app = new CRMApp();

// Configurações globais
window.addEventListener('error', (event) => {
    console.error('Erro global capturado:', event.error);
    showToast('Ocorreu um erro inesperado', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejeitada não tratada:', event.reason);
    showToast('Erro de processamento', 'error');
});

// Debug helpers (apenas em desenvolvimento)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DEBUG = {
        app: () => window.app,
        api: () => window.api,
        auth: () => window.firebaseAuth,
        navigation: () => window.navigation,
        showLoading: (show) => showLoading(show),
        showToast: (msg, type) => showToast(msg, type)
    };
    
    console.log('🔧 Modo de desenvolvimento ativo. Use window.DEBUG para acessar utilitários.');
}
