#!/bin/bash

# ===========================================
# Script para Push Dual Repository
# ===========================================

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Verificar se há mudanças pendentes
if ! git diff-index --quiet HEAD --; then
    warn "Há mudanças não commitadas. Você quer continuar? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pegar branch atual
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

title "Push para GitHub + GitLab - Branch: $CURRENT_BRANCH"

# Verificar se os remotes existem
if ! git remote | grep -q "origin"; then
    error "Remote 'origin' (GitHub) não encontrado"
    exit 1
fi

if ! git remote | grep -q "gitlab"; then
    error "Remote 'gitlab' não encontrado. Execute scripts/dual-repo-setup.sh primeiro"
    exit 1
fi

# Push para GitHub
log "📤 Fazendo push para GitHub..."
if git push origin "$CURRENT_BRANCH"; then
    log "✅ Push para GitHub concluído"
else
    error "❌ Falha no push para GitHub"
    exit 1
fi

# Push para GitLab
log "📤 Fazendo push para GitLab..."
if git push gitlab "$CURRENT_BRANCH"; then
    log "✅ Push para GitLab concluído"
else
    error "❌ Falha no push para GitLab"
    warn "Continuando... GitHub já foi atualizado"
fi

echo ""
title "🎉 Push Dual Repository Concluído!"

log "Branch '$CURRENT_BRANCH' sincronizada em:"
echo "  • GitHub: https://github.com/crashkill/Aplicativo-HITSS"
echo "  • GitLab: [URL da sua empresa]"

echo ""
log "💡 Dica: Use 'git push both $CURRENT_BRANCH' para push simultâneo" 