// Navigation System
class NavigationSystem {
    constructor() {
        this.currentPage = null;
        this.pages = new Map();
        this.setupEventListeners();
        this.setupRouting();
    }

    // Registrar uma página
    registerPage(name, loadFunction) {
        this.pages.set(name, loadFunction);
    }

    // Setup dos event listeners
    setupEventListeners() {
        // Navigation links
        $(document).on('click', 'a[data-page]', (e) => {
            e.preventDefault();
            const page = $(e.target).data('page');
            this.navigateTo(page);
        });

        // Logout button
        $('#logout-btn').on('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Mobile sidebar toggle
        $('.navbar-toggler').on('click', () => {
            const sidebar = new bootstrap.Offcanvas($('#sidebar')[0]);
            sidebar.show();
        });

        // Update active nav item
        $(document).on('click', '.sidebar-nav .nav-link', function() {
            $('.sidebar-nav .nav-link').removeClass('active');
            $(this).addClass('active');
        });
    }

    // Setup do sistema de rotas
    setupRouting() {
        // Handle browser back/forward
        $(window).on('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash && this.pages.has(hash)) {
                this.loadPage(hash, false);
            }
        });

        // Load initial page
        const initialHash = window.location.hash.substring(1) || 'dashboard';
        this.navigateTo(initialHash);
    }

    // Navegar para uma página
    navigateTo(pageName, updateHash = true) {
        if (updateHash) {
            window.location.hash = pageName;
        }
        this.loadPage(pageName);
    }

    // Carregar página
    async loadPage(pageName, updateActiveNav = true) {
        if (!this.pages.has(pageName)) {
            console.error(`Página '${pageName}' não encontrada`);
            this.showErrorPage();
            return;
        }

        try {
            showLoading(true);
            
            // Update active navigation
            if (updateActiveNav) {
                this.updateActiveNavigation(pageName);
            }

            // Load page content
            const pageLoader = this.pages.get(pageName);
            await pageLoader();
            
            this.currentPage = pageName;
            
            // Hide mobile sidebar after navigation
            const sidebar = bootstrap.Offcanvas.getInstance($('#sidebar')[0]);
            if (sidebar) {
                sidebar.hide();
            }

        } catch (error) {
            console.error(`Erro ao carregar página '${pageName}':`, error);
            this.showErrorPage();
        } finally {
            showLoading(false);
        }
    }

    // Atualizar navegação ativa
    updateActiveNavigation(pageName) {
        $('.sidebar-nav .nav-link').removeClass('active');
        $(`.sidebar-nav .nav-link[data-page="${pageName}"]`).addClass('active');
    }

    // Mostrar página de erro
    showErrorPage() {
        $('#page-content').html(`
            <div class="container-fluid py-5">
                <div class="row justify-content-center">
                    <div class="col-md-6 text-center">
                        <div class="card">
                            <div class="card-body py-5">
                                <i class="bi bi-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
                                <h3 class="mt-3">Erro ao carregar página</h3>
                                <p class="text-muted">Houve um problema ao carregar o conteúdo.</p>
                                <button class="btn btn-primary" onclick="window.location.reload()">
                                    Recarregar Página
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    // Logout
    async logout() {
        showConfirmModal(
            'Confirmar Logout',
            'Tem certeza que deseja sair do sistema?',
            async () => {
                await window.firebaseAuth.logout();
            }
        );
    }

    // Obter página atual
    getCurrentPage() {
        return this.currentPage;
    }
}

// Page Loaders
const PageLoaders = {
    // Login Page
    async login() {
        $('#page-content').html(`
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <i class="bi bi-building"></i>
                            <h2>CRM Sistema</h2>
                            <p>Faça login para continuar</p>
                        </div>
                        
                        <form id="login-form" class="auth-form">
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" class="form-control" id="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="password">Senha</label>
                                <input type="password" class="form-control" id="password" required>
                            </div>
                            
                            <button type="submit" class="btn-auth">
                                <i class="bi bi-box-arrow-in-right"></i>
                                Entrar
                            </button>
                        </form>
                        
                        <div class="auth-footer">
                            <p>Não tem conta? <a href="#register" data-page="register">Cadastre-se</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `);

        // Login form handler
        $('#login-form').on('submit', async (e) => {
            e.preventDefault();
            const email = $('#email').val();
            const password = $('#password').val();
            
            const result = await window.firebaseAuth.login(email, password);
            if (result.success) {
                // Redirecionamento é feito automaticamente pelo Firebase auth state change
            }
        });
    },

    // Register Page
    async register() {
        $('#page-content').html(`
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <i class="bi bi-person-plus"></i>
                            <h2>Criar Conta</h2>
                            <p>Cadastre-se no sistema</p>
                        </div>
                        
                        <form id="register-form" class="auth-form">
                            <div class="form-group">
                                <label for="name">Nome Completo</label>
                                <input type="text" class="form-control" id="name" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" class="form-control" id="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="password">Senha</label>
                                <input type="password" class="form-control" id="password" required minlength="6">
                            </div>
                            
                            <div class="form-group">
                                <label for="confirmPassword">Confirmar Senha</label>
                                <input type="password" class="form-control" id="confirmPassword" required>
                            </div>
                            
                            <button type="submit" class="btn-auth">
                                <i class="bi bi-person-plus"></i>
                                Cadastrar
                            </button>
                        </form>
                        
                        <div class="auth-footer">
                            <p>Já tem conta? <a href="#login" data-page="login">Faça login</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `);

        // Register form handler
        $('#register-form').on('submit', async (e) => {
            e.preventDefault();
            const name = $('#name').val();
            const email = $('#email').val();
            const password = $('#password').val();
            const confirmPassword = $('#confirmPassword').val();
            
            if (password !== confirmPassword) {
                showToast('As senhas não coincidem', 'error');
                return;
            }
            
            const result = await window.firebaseAuth.register(email, password, name);
            if (result.success) {
                // Redirecionamento é feito automaticamente pelo Firebase auth state change
            }
        });
    }
};

// Instância global do sistema de navegação
window.navigation = new NavigationSystem();

// Registrar páginas
window.navigation.registerPage('login', PageLoaders.login);
window.navigation.registerPage('register', PageLoaders.register);
