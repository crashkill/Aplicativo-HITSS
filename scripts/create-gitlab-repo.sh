#!/bin/bash

# ===========================================
# Script para Criar Repositório GitLab
# Usando GitLab CLI (glab)
# ===========================================

set -e

# Cores para output
RED='\033[0;31m'
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

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

title() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

success() {
    echo -e "${CYAN}✅ $1${NC}"
}

# Verificar se estamos em um repositório Git
if [ ! -d ".git" ]; then
    error "Este script deve ser executado na raiz de um repositório Git"
    exit 1
fi

title "Criação de Repositório GitLab com glab CLI"

# Verificar se glab está instalado
if ! command -v glab &> /dev/null; then
    error "glab CLI não está instalado"
    echo "Instale com: brew install glab"
    exit 1
fi

# Verificar se glab está autenticado
if ! glab auth status &> /dev/null; then
    warn "glab não está autenticado. Configurando..."
    echo ""
    title "Configuração do GitLab CLI"
    echo "1. Cole a URL do GitLab da sua empresa (ex: https://gitlab.empresa.com)"
    echo "2. Crie um token em: GitLab > Preferences > Access Tokens"
    echo "3. Scopes necessários: api, read_repository, write_repository"
    echo ""
    
    glab auth login
    
    if ! glab auth status &> /dev/null; then
        error "Falha na autenticação. Tente novamente."
        exit 1
    fi
fi

success "GitLab CLI autenticado!"

# Informações do projeto
PROJECT_NAME="aplicativo-hitss"
PROJECT_DESC="Sistema HITSS - Gestão Financeira + Talentos Tecnológicos"

# Confirmar dados
echo ""
title "Configuração do Repositório"
echo "Nome: $PROJECT_NAME"
echo "Descrição: $PROJECT_DESC"
echo "Visibilidade: internal"
echo ""

read -p "Confirma a criação do repositório? (y/n): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    warn "Operação cancelada pelo usuário"
    exit 0
fi

# Criar repositório
log "Criando repositório no GitLab..."

if glab repo create "$PROJECT_NAME" \
    --description "$PROJECT_DESC" \
    --internal \
    --add-readme=false \
    --clone=false; then
    
    success "Repositório criado com sucesso!"
else
    error "Falha ao criar repositório"
    exit 1
fi

# Obter URL do repositório
GITLAB_REPO_URL=$(glab repo view "$PROJECT_NAME" --json sshUrlToRepo --jq '.sshUrlToRepo' 2>/dev/null || echo "")

if [ -z "$GITLAB_REPO_URL" ]; then
    # Fallback para HTTPS se SSH não funcionar
    GITLAB_REPO_URL=$(glab repo view "$PROJECT_NAME" --json httpUrlToRepo --jq '.httpUrlToRepo' 2>/dev/null || echo "")
fi

if [ -z "$GITLAB_REPO_URL" ]; then
    warn "Não foi possível obter URL automaticamente"
    echo "Configure manualmente com:"
    echo "git remote add gitlab <URL_DO_SEU_REPOSITORIO>"
    exit 1
fi

log "URL do repositório: $GITLAB_REPO_URL"

# Configurar remotes
log "Configurando remotes locais..."

# Remover remote gitlab se existir
if git remote | grep -q "gitlab"; then
    git remote remove gitlab
fi

# Adicionar remote do GitLab
git remote add gitlab "$GITLAB_REPO_URL"

# Configurar remote 'both' para push simultâneo
if git remote | grep -q "both"; then
    git remote remove both
fi

GITHUB_URL=$(git remote get-url origin)

git remote add both "$GITHUB_URL"
git remote set-url --add --push both "$GITHUB_URL"
git remote set-url --add --push both "$GITLAB_REPO_URL"

success "Remotes configurados!"

# Fazer push inicial
log "Fazendo push inicial para GitLab..."

if git push gitlab main; then
    success "Push inicial concluído!"
else
    error "Falha no push inicial"
    warn "Tente manualmente: git push gitlab main"
fi

echo ""
title "🎉 Repositório GitLab Configurado!"

log "Remotes configurados:"
git remote -v

echo ""
title "Comandos disponíveis:"
echo -e "${GREEN}• Push para GitHub:${NC}     git push origin main"
echo -e "${GREEN}• Push para GitLab:${NC}     git push gitlab main" 
echo -e "${GREEN}• Push para ambos:${NC}      git push both main"
echo -e "${GREEN}• Script automático:${NC}    npm run git:push-both"

echo ""
title "URLs dos repositórios:"
echo -e "${CYAN}• GitHub:${NC}  https://github.com/crashkill/Aplicativo-HITSS"
echo -e "${CYAN}• GitLab:${NC}  $(glab repo view "$PROJECT_NAME" --json webUrl --jq '.webUrl' 2>/dev/null || echo 'Verifique no GitLab')"

echo ""
success "Sistema dual repository configurado com sucesso! 🚀" 