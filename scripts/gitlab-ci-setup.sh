#!/bin/bash

# ===========================================
# Script para Configurar CI/CD GitLab
# ===========================================

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

title() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

success() {
    echo -e "${CYAN}✅ $1${NC}"
}

title "Configuração CI/CD GitLab - Sistema HITSS"

# Pegar informações do projeto
PROJECT_NAME="fabricio.lima/aplicativo-hitss"
log "Projeto: $PROJECT_NAME"

# Configurar variáveis de CI/CD
title "Configurando Variáveis de CI/CD"

# Variáveis que precisam ser configuradas no GitLab
log "📋 Variáveis necessárias:"
echo "  • DOPPLER_TOKEN - Token do Doppler para secrets"
echo "  • SUPABASE_URL - URL do Supabase"
echo "  • SUPABASE_ANON_KEY - Chave anônima do Supabase"
echo "  • AZURE_CLIENT_ID - Client ID do Azure AD"
echo "  • AZURE_TENANT_ID - Tenant ID do Azure AD"
echo "  • DEPLOY_SSH_KEY - Chave SSH para deploy"
echo "  • STAGING_SERVER - Servidor de staging"
echo "  • PRODUCTION_SERVER - Servidor de produção"

# Comandos para configurar variáveis (devem ser executados manualmente)
title "Comandos para Configurar Variáveis (Execute Manualmente)"

echo ""
warn "📝 Execute estes comandos no GitLab da Global HITSS:"
echo ""
echo "1. Acesse: https://gitlab.globalhitss.com.br/fabricio.lima/aplicativo-hitss/-/settings/ci_cd"
echo "2. Expanda a seção 'Variables'"
echo "3. Adicione estas variáveis:"
echo ""

# Listar variáveis necessárias
echo "   • DOPPLER_TOKEN (Protected, Masked)"
echo "     Valor: [Token do Doppler]"
echo ""
echo "   • SUPABASE_URL (Protected)"
echo "     Valor: https://pwksgdjjkryqryqrvyja.supabase.co"
echo ""
echo "   • SUPABASE_ANON_KEY (Protected, Masked)"
echo "     Valor: [Chave do Supabase]"
echo ""
echo "   • AZURE_CLIENT_ID (Protected)"
echo "     Valor: [Client ID do Azure AD]"
echo ""
echo "   • AZURE_TENANT_ID (Protected)"
echo "     Valor: [Tenant ID do Azure AD]"
echo ""

# Pipeline será disparado automaticamente
title "Status do Pipeline"
log "O pipeline será disparado automaticamente no próximo push para o GitLab"

# Instruções finais
title "Próximos Passos"

echo "1. 🔐 Configure as variáveis no GitLab (URLs acima)"
echo "2. 🚀 Faça um push para disparar o pipeline:"
echo "   git push gitlab main"
echo "3. 📊 Monitore o pipeline em:"
echo "   https://gitlab.globalhitss.com.br/fabricio.lima/aplicativo-hitss/-/pipelines"
echo "4. 🎯 Acesse a aplicação após deploy:"
echo "   - Staging: https://staging-hitss.globalhitss.com.br"
echo "   - Produção: https://hitss.globalhitss.com.br"

echo ""
title "Documentação Completa"
echo "📖 Leia a documentação completa em:"
echo "   docs/infrastructure/gitlab-pipeline-complete.md"

success "Script de configuração concluído!" 