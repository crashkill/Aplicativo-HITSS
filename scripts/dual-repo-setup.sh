#!/bin/bash

# ===========================================
# Script de Configuração Dual Repository
# GitHub + GitLab da Empresa
# ===========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Verificar se estamos em um repositório Git
if [ ! -d ".git" ]; then
    error "Este script deve ser executado na raiz de um repositório Git"
    exit 1
fi

title "Configuração Dual Repository - GitHub + GitLab"

# Mostrar configuração atual
log "Configuração atual dos remotes:"
git remote -v

echo ""

# Configurar remote GitLab da empresa
log "Configurando remote GitLab da empresa..."

# Pegar token do Doppler
GITLAB_TOKEN=$(doppler secrets get GITLAB_TOKEN --plain 2>/dev/null || echo "")
GITLAB_URL=$(doppler secrets get GITLAB_URL --plain 2>/dev/null || echo "")

if [ -z "$GITLAB_TOKEN" ] || [ -z "$GITLAB_URL" ]; then
    error "Token ou URL do GitLab não encontrados no Doppler"
    log "Execute: doppler secrets set GITLAB_TOKEN=seu_token"
    log "Execute: doppler secrets set GITLAB_URL=https://gitlab.globalhitss.com.br"
    exit 1
fi

# Extrair hostname da URL
GITLAB_HOST=$(echo "$GITLAB_URL" | sed 's|https://||' | sed 's|http://||' | sed 's|/.*||')

# Configurar URL com token para autenticação
GITLAB_REMOTE_URL="https://oauth2:${GITLAB_TOKEN}@${GITLAB_HOST}/fabricio.lima/aplicativo-hitss.git"

# Remover remote gitlab se existir
git remote remove gitlab 2>/dev/null || true

# Adicionar remote do GitLab
git remote add gitlab "$GITLAB_REMOTE_URL"

log "Remote GitLab configurado: ${GITLAB_HOST}"

# Configurar remote 'both' para push simultâneo
log "Configurando remote 'both' para push simultâneo..."
if git remote | grep -q "both"; then
    git remote remove both
fi

# Pegar URL do GitHub
GITHUB_URL=$(git remote get-url origin)

# Criar remote 'both' que faz push para ambos
git remote add both "$GITHUB_URL"
git remote set-url --add --push both "$GITHUB_URL"
git remote set-url --add --push both "$GITLAB_URL"

echo ""
title "Configuração Finalizada!"

log "Remotes configurados:"
git remote -v

echo ""
title "Como usar:"
echo -e "${GREEN}Para fazer push apenas para GitHub:${NC}"
echo "  git push origin main"
echo ""
echo -e "${GREEN}Para fazer push apenas para GitLab:${NC}"
echo "  git push gitlab main"
echo ""
echo -e "${GREEN}Para fazer push para AMBOS simultaneamente:${NC}"
echo "  git push both main"
echo ""
echo -e "${GREEN}Para fazer pull (sempre do GitHub):${NC}"
echo "  git pull origin main"

echo ""
title "Scripts Adicionais Criados:"
echo "  • scripts/push-both.sh - Push para ambos os repositórios"
echo "  • scripts/sync-repos.sh - Sincronizar repositórios"
echo "  • scripts/repo-status.sh - Status dos repositórios"

echo ""
log "✅ Configuração dual repository concluída com sucesso!" 