#!/bin/bash

# ===========================================
# Script de Status Dual Repository
# ===========================================

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

# Verificar se estamos em um repositório Git
if [ ! -d ".git" ]; then
    error "Este script deve ser executado na raiz de um repositório Git"
    exit 1
fi

title "Status dos Repositórios - GitHub + GitLab"

# Informações básicas
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
log "Branch atual: $CURRENT_BRANCH"

echo ""

# Status do working directory
title "Status do Working Directory"
git status --short

echo ""

# Remotes configurados
title "Remotes Configurados"
git remote -v

echo ""

# Verificar commits não sincronizados
title "Análise de Sincronização"

# Verificar diferenças com GitHub
if git remote | grep -q "origin"; then
    log "Verificando diferenças com GitHub (origin)..."
    git fetch origin &>/dev/null || warn "Não foi possível fazer fetch do GitHub"
    
    AHEAD=$(git rev-list --count origin/$CURRENT_BRANCH..$CURRENT_BRANCH 2>/dev/null || echo "0")
    BEHIND=$(git rev-list --count $CURRENT_BRANCH..origin/$CURRENT_BRANCH 2>/dev/null || echo "0")
    
    if [ "$AHEAD" -gt 0 ]; then
        warn "📤 Você tem $AHEAD commit(s) à frente do GitHub"
    fi
    
    if [ "$BEHIND" -gt 0 ]; then
        warn "📥 Você está $BEHIND commit(s) atrás do GitHub"
    fi
    
    if [ "$AHEAD" -eq 0 ] && [ "$BEHIND" -eq 0 ]; then
        log "✅ Sincronizado com GitHub"
    fi
else
    error "Remote 'origin' (GitHub) não encontrado"
fi

echo ""

# Verificar diferenças com GitLab
if git remote | grep -q "gitlab"; then
    log "Verificando diferenças com GitLab..."
    git fetch gitlab &>/dev/null || warn "Não foi possível fazer fetch do GitLab"
    
    AHEAD_GL=$(git rev-list --count gitlab/$CURRENT_BRANCH..$CURRENT_BRANCH 2>/dev/null || echo "0")
    BEHIND_GL=$(git rev-list --count $CURRENT_BRANCH..gitlab/$CURRENT_BRANCH 2>/dev/null || echo "0")
    
    if [ "$AHEAD_GL" -gt 0 ]; then
        warn "📤 Você tem $AHEAD_GL commit(s) à frente do GitLab"
    fi
    
    if [ "$BEHIND_GL" -gt 0 ]; then
        warn "📥 Você está $BEHIND_GL commit(s) atrás do GitLab"
    fi
    
    if [ "$AHEAD_GL" -eq 0 ] && [ "$BEHIND_GL" -eq 0 ]; then
        log "✅ Sincronizado com GitLab"
    fi
else
    warn "Remote 'gitlab' não encontrado. Configure com scripts/dual-repo-setup.sh"
fi

echo ""

# Últimos commits
title "Últimos 5 Commits"
git log --oneline -5

echo ""

# Recomendações
title "Recomendações"

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    warn "🔄 Há mudanças não commitadas. Considere fazer commit."
fi

# Verificar se precisa fazer push
if [ "$AHEAD" -gt 0 ] || [ "$AHEAD_GL" -gt 0 ]; then
    warn "📤 Execute './scripts/push-both.sh' para sincronizar ambos os repositórios"
fi

# Verificar se precisa fazer pull
if [ "$BEHIND" -gt 0 ]; then
    warn "📥 Execute 'git pull origin $CURRENT_BRANCH' para atualizar do GitHub"
fi

echo ""
log "✅ Análise de status concluída!" 