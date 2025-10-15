// Authentication Component - Helpers para autenticação
class AuthComponent {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event listeners para formulários de autenticação
        // Serão configurados quando as páginas forem carregadas
    }

    // Validar dados de login
    validateLoginForm(email, password) {
        const errors = [];
        
        if (!email) {
            errors.push('Email é obrigatório');
        } else if (!isValidEmail(email)) {
            errors.push('Email inválido');
        }
        
        if (!password) {
            errors.push('Senha é obrigatória');
        } else if (password.length < 6) {
            errors.push('Senha deve ter pelo menos 6 caracteres');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Validar dados de registro
    validateRegisterForm(name, email, password, confirmPassword) {
        const errors = [];
        
        if (!name || name.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }
        
        if (!email) {
            errors.push('Email é obrigatório');
        } else if (!isValidEmail(email)) {
            errors.push('Email inválido');
        }
        
        if (!password) {
            errors.push('Senha é obrigatória');
        } else if (password.length < 6) {
            errors.push('Senha deve ter pelo menos 6 caracteres');
        }
        
        if (password !== confirmPassword) {
            errors.push('Senhas não coincidem');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Mostrar erros de validação
    showValidationErrors(errors) {
        const errorMessage = errors.join('<br>');
        showToast(errorMessage, 'error');
    }

    // Limpar formulário
    clearForm(formId) {
        $(`#${formId}`)[0].reset();
    }

    // Desabilitar/habilitar formulário durante loading
    toggleFormLoading(formId, isLoading) {
        const form = $(`#${formId}`);
        const inputs = form.find('input, button');
        
        if (isLoading) {
            inputs.prop('disabled', true);
            form.find('button[type="submit"]').html('<i class="spinner-border spinner-border-sm me-2"></i>Processando...');
        } else {
            inputs.prop('disabled', false);
            form.find('button[type="submit"]').html(form.find('button[type="submit"]').data('original-text'));
        }
    }

    // Salvar texto original do botão
    saveButtonText(buttonSelector) {
        const button = $(buttonSelector);
        button.data('original-text', button.html());
    }
}

// Instância global do componente de autenticação
window.authComponent = new AuthComponent();
