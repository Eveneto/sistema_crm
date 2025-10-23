#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# 📧 CONFIGURADOR DE EMAIL - Django CRM System (VERSÃO CORRIGIDA)
# ════════════════════════════════════════════════════════════════════════════
#
# Script interativo para configurar SendGrid ou Gmail
#
# Uso: ./configure_email.sh
#

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ─────────────────────────────────────────────────────────────────────────────
# FUNÇÕES AUXILIARES
# ─────────────────────────────────────────────────────────────────────────────

print_header() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  📧 CONFIGURADOR DE EMAIL - CRM System           ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}➜${NC} $1\n"
}

# ─────────────────────────────────────────────────────────────────────────────
# FUNÇÃO: CONFIGURAR SENDGRID
# ─────────────────────────────────────────────────────────────────────────────

configure_sendgrid() {
    print_header
    print_step "CONFIGURAÇÃO SENDGRID"
    
    echo -e "${YELLOW}Você já tem uma conta SendGrid?${NC}"
    echo "1) Sim, tenho a API Key"
    echo "2) Não, quero abrir agora"
    echo ""
    read -p "Escolha: " SENDGRID_CHOICE
    
    if [ "$SENDGRID_CHOICE" = "2" ]; then
        print_warning "Passos para criar conta:"
        echo ""
        echo "  1. Acesse: https://sendgrid.com/pt-br/"
        echo "  2. Clique em 'Começar grátis'"
        echo "  3. Preencha os dados"
        echo "  4. Confirme seu email"
        echo "  5. Vá para Settings → API Keys"
        echo "  6. Clique em 'Create API Key'"
        echo "  7. Nome: CRM-Django"
        echo "  8. Permissão: Mail Send"
        echo "  9. Copie a chave: SG.xxxxx..."
        echo ""
        read -p "Pressione ENTER quando tiver a API Key..."
    fi
    
    # Coletar dados
    print_step "INSIRA SUAS CREDENCIAIS SENDGRID"
    
    read -p "SendGrid API Key (SG.xxxxx...): " SENDGRID_API_KEY
    
    if [ -z "$SENDGRID_API_KEY" ]; then
        print_error "API Key não pode estar vazia!"
        return 1
    fi
    
    read -p "Email para enviar (seu_email@dominio.com): " FROM_EMAIL
    
    if [ -z "$FROM_EMAIL" ]; then
        print_error "Email não pode estar vazio!"
        return 1
    fi
    
    # Atualizar .env
    print_step "Atualizando arquivo .env..."
    
    # Backup
    cp backend/.env backend/.env.backup.$(date +%s)
    print_success "Backup criado"
    
    # Usar sed para atualizar
    if [ -f "backend/.env" ]; then
        sed -i "s|EMAIL_BACKEND=.*|EMAIL_BACKEND=sendgrid_django.SendgridBackend|g" backend/.env
        sed -i "s|DEFAULT_FROM_EMAIL=.*|DEFAULT_FROM_EMAIL=$FROM_EMAIL|g" backend/.env
        
        # Adicionar SENDGRID_API_KEY se não existir
        if grep -q "SENDGRID_API_KEY" backend/.env; then
            sed -i "s|SENDGRID_API_KEY=.*|SENDGRID_API_KEY=$SENDGRID_API_KEY|g" backend/.env
        else
            echo "SENDGRID_API_KEY=$SENDGRID_API_KEY" >> backend/.env
        fi
        
        print_success ".env atualizado com sucesso"
    fi
    
    # Instalar sendgrid-django
    print_step "Instalando sendgrid-django..."
    cd backend
    pip install -q sendgrid-django 2>/dev/null
    cd ..
    print_success "sendgrid-django instalado"
    
    # Resumo
    print_header
    echo -e "${GREEN}✅ SENDGRID CONFIGURADO COM SUCESSO!${NC}\n"
    echo "Configuração:"
    echo "  Backend: sendgrid_django.SendgridBackend"
    echo "  Email: $FROM_EMAIL"
    echo "  API Key: ${SENDGRID_API_KEY:0:15}..."
    echo ""
    
    # Próximos passos
    echo -e "${CYAN}Próximos passos:${NC}"
    echo ""
    echo "1. Reiniciar o backend:"
    echo "   Ctrl+C (no terminal do backend)"
    echo "   cd backend && python manage.py runserver"
    echo ""
    echo "2. Testar email:"
    echo "   python manage.py shell"
    echo "   >>> from django.core.mail import send_mail"
    echo "   >>> send_mail('Test', 'Test', '$FROM_EMAIL', ['$FROM_EMAIL'])"
    echo "   >>> exit()"
    echo ""
    
    read -p "Pressione ENTER para voltar ao menu..."
    return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# FUNÇÃO: CONFIGURAR GMAIL
# ─────────────────────────────────────────────────────────────────────────────

configure_gmail() {
    print_header
    print_step "CONFIGURAÇÃO GMAIL"
    
    echo -e "${YELLOW}Você já tem uma app-specific password do Gmail?${NC}"
    echo "1) Sim, tenho a senha"
    echo "2) Não, preciso gerar"
    echo ""
    read -p "Escolha: " GMAIL_CHOICE
    
    if [ "$GMAIL_CHOICE" = "2" ]; then
        print_warning "Passos para gerar app-specific password:"
        echo ""
        echo "  1. Verifique se 2FA está ativado:"
        echo "     - Acesse: https://myaccount.google.com/security"
        echo "     - Procure 'Verificação em duas etapas'"
        echo ""
        echo "  2. Gere app-specific password:"
        echo "     - Acesse: https://myaccount.google.com/apppasswords"
        echo "     - Aplicativo: Mail"
        echo "     - Dispositivo: Windows Computer (ou seu SO)"
        echo "     - Copie a senha de 16 caracteres (SEM ESPAÇOS)"
        echo ""
        read -p "Pressione ENTER quando tiver a senha..."
    fi
    
    # Coletar dados
    print_step "INSIRA SUAS CREDENCIAIS GMAIL"
    
    read -p "Email Gmail (seu_email@gmail.com): " GMAIL_EMAIL
    
    if [ -z "$GMAIL_EMAIL" ]; then
        print_error "Email não pode estar vazio!"
        return 1
    fi
    
    read -sp "App-specific password (16 chars, SEM ESPAÇOS): " GMAIL_PASSWORD
    echo ""
    
    if [ ${#GMAIL_PASSWORD} -ne 16 ]; then
        print_error "Senha deve ter exatamente 16 caracteres!"
        return 1
    fi
    
    # Atualizar .env
    print_step "Atualizando arquivo .env..."
    
    # Backup
    cp backend/.env backend/.env.backup.$(date +%s)
    print_success "Backup criado"
    
    # Usar sed para atualizar
    if [ -f "backend/.env" ]; then
        sed -i "s|EMAIL_BACKEND=.*|EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend|g" backend/.env
        sed -i "s|EMAIL_HOST=.*|EMAIL_HOST=smtp.gmail.com|g" backend/.env
        sed -i "s|EMAIL_PORT=.*|EMAIL_PORT=587|g" backend/.env
        sed -i "s|EMAIL_HOST_USER=.*|EMAIL_HOST_USER=$GMAIL_EMAIL|g" backend/.env
        sed -i "s|EMAIL_HOST_PASSWORD=.*|EMAIL_HOST_PASSWORD=$GMAIL_PASSWORD|g" backend/.env
        sed -i "s|DEFAULT_FROM_EMAIL=.*|DEFAULT_FROM_EMAIL=$GMAIL_EMAIL|g" backend/.env
        sed -i "s|EMAIL_USE_TLS=.*|EMAIL_USE_TLS=True|g" backend/.env
        
        print_success ".env atualizado com sucesso"
    fi
    
    # Resumo
    print_header
    echo -e "${GREEN}✅ GMAIL CONFIGURADO COM SUCESSO!${NC}\n"
    echo "Configuração:"
    echo "  Backend: django.core.mail.backends.smtp.EmailBackend"
    echo "  Host: smtp.gmail.com"
    echo "  Porta: 587"
    echo "  Email: $GMAIL_EMAIL"
    echo "  Senha: ****${GMAIL_PASSWORD: -4}"
    echo "  TLS: Ativado"
    echo ""
    
    # Próximos passos
    echo -e "${CYAN}Próximos passos:${NC}"
    echo ""
    echo "1. Reiniciar o backend:"
    echo "   Ctrl+C (no terminal do backend)"
    echo "   cd backend && python manage.py runserver"
    echo ""
    echo "2. Testar email:"
    echo "   python manage.py shell"
    echo "   >>> from django.core.mail import send_mail"
    echo "   >>> send_mail('Test', 'Test', '$GMAIL_EMAIL', ['$GMAIL_EMAIL'])"
    echo "   >>> exit()"
    echo ""
    
    read -p "Pressione ENTER para voltar ao menu..."
    return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# VERIFICAÇÕES INICIAIS
# ─────────────────────────────────────────────────────────────────────────────

print_header

if [ ! -f "backend/.env" ]; then
    print_error "Arquivo backend/.env não encontrado!"
    echo "Execute do diretório raiz do projeto"
    exit 1
fi

print_success "Arquivo .env encontrado"

# ─────────────────────────────────────────────────────────────────────────────
# MENU PRINCIPAL
# ─────────────────────────────────────────────────────────────────────────────

while true; do
    print_step "ESCOLHA SEU PROVEDOR DE EMAIL"

    echo "1) SendGrid (RECOMENDADO - Produção)"
    echo "   └─ 100 emails/dia grátis"
    echo "   └─ Dashboard completo"
    echo "   └─ Rastreamento de aberturas/cliques"
    echo ""
    echo "2) Gmail (FÁCIL - Desenvolvimento)"
    echo "   └─ 500 emails/dia com app-specific password"
    echo "   └─ Setup rápido (3 minutos)"
    echo "   └─ Ideal para testes"
    echo ""
    echo "3) Sair"
    echo ""

    read -p "Escolha uma opção (1, 2 ou 3): " CHOICE

    case $CHOICE in
        1)
            configure_sendgrid
            if [ $? -eq 0 ]; then
                echo ""
                print_success "Configuração SendGrid concluída!"
                read -p "Pressione ENTER para sair..."
                exit 0
            fi
            ;;
        2)
            configure_gmail
            if [ $? -eq 0 ]; then
                echo ""
                print_success "Configuração Gmail concluída!"
                read -p "Pressione ENTER para sair..."
                exit 0
            fi
            ;;
        3)
            print_warning "Saindo..."
            exit 0
            ;;
        *)
            print_error "Opção inválida!"
            sleep 1
            ;;
    esac
done
