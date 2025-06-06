#!/bin/bash

# 🚀 Script de Configuração GitHub Pages - HITSS
# Este script automatiza a configuração inicial do GitHub Pages

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de output
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Header
echo "🚀 Configuração GitHub Pages - Sistema HITSS"
echo "============================================="
echo

# Verificar se está em um repositório Git
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    error "Este não é um repositório Git válido!"
    exit 1
fi

# Verificar se tem GitHub CLI instalado
if ! command -v gh &> /dev/null; then
    warning "GitHub CLI não encontrado. Instalando..."
    
    # Detectar OS e instalar gh CLI
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install gh
        else
            error "Homebrew não encontrado. Instale manualmente: https://cli.github.com"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update
        sudo apt install gh
    else
        error "SO não suportado. Instale GitHub CLI manualmente: https://cli.github.com"
        exit 1
    fi
    
    success "GitHub CLI instalado com sucesso!"
fi

# Verificar autenticação
if ! gh auth status &> /dev/null; then
    warning "GitHub CLI não está autenticado. Fazendo login..."
    gh auth login
    success "Autenticação concluída!"
fi

# Obter informações do repositório
REPO_OWNER=$(git remote get-url origin | sed -n 's#.*/\([^/]*\)/\([^/]*\)\.git#\1#p')
REPO_NAME=$(git remote get-url origin | sed -n 's#.*/\([^/]*\)/\([^/]*\)\.git#\2#p')

if [[ -z "$REPO_OWNER" || -z "$REPO_NAME" ]]; then
    error "Não foi possível determinar owner/repo do remote origin"
    exit 1
fi

info "Repositório detectado: $REPO_OWNER/$REPO_NAME"

# 1. Verificar se GitHub Pages está habilitado
info "Verificando configuração do GitHub Pages..."

PAGES_STATUS=$(gh api repos/$REPO_OWNER/$REPO_NAME/pages --silent 2>/dev/null || echo "disabled")

if [[ "$PAGES_STATUS" == "disabled" ]]; then
    warning "GitHub Pages não está habilitado. Configurando..."
    
    # Tentar habilitar GitHub Pages via API
    gh api --method POST repos/$REPO_OWNER/$REPO_NAME/pages \
        --field source[source]="gh-pages" \
        --field source[path]="/" \
        --silent 2>/dev/null || {
        
        warning "Não foi possível habilitar via API. Configure manualmente:"
        echo "1. Acesse: https://github.com/$REPO_OWNER/$REPO_NAME/settings/pages"
        echo "2. Em 'Source', selecione 'GitHub Actions'"
        echo "3. Salve as configurações"
        echo
        read -p "Pressione Enter após configurar GitHub Pages manualmente..."
    }
else
    success "GitHub Pages já está habilitado!"
fi

# 2. Verificar secrets necessários
info "Verificando secrets do repositório..."

# Lista de secrets obrigatórios
REQUIRED_SECRETS=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
MISSING_SECRETS=()

for secret in "${REQUIRED_SECRETS[@]}"; do
    if ! gh secret list --repo $REPO_OWNER/$REPO_NAME | grep -q "^$secret"; then
        MISSING_SECRETS+=("$secret")
    fi
done

if [[ ${#MISSING_SECRETS[@]} -gt 0 ]]; then
    warning "Secrets obrigatórios não encontrados:"
    for secret in "${MISSING_SECRETS[@]}"; do
        echo "  - $secret"
    done
    echo
    warning "Configure os secrets manualmente:"
    echo "1. Acesse: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
    echo "2. Clique em 'New repository secret'"
    echo "3. Adicione cada secret listado acima"
    echo
    
    # Oferecer configuração interativa
    read -p "Deseja configurar os secrets agora? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for secret in "${MISSING_SECRETS[@]}"; do
            echo -n "Digite o valor para $secret: "
            read -s SECRET_VALUE
            echo
            gh secret set $secret --body "$SECRET_VALUE" --repo $REPO_OWNER/$REPO_NAME
            success "Secret $secret configurado!"
        done
    fi
else
    success "Todos os secrets obrigatórios estão configurados!"
fi

# 3. Verificar workflow file
info "Verificando arquivo de workflow..."

WORKFLOW_FILE=".github/workflows/ci-cd.yml"

if [[ ! -f "$WORKFLOW_FILE" ]]; then
    error "Arquivo de workflow não encontrado: $WORKFLOW_FILE"
    exit 1
fi

success "Arquivo de workflow encontrado!"

# 4. Teste de build local
info "Testando build local..."

if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
else
    error "Nenhum package manager encontrado (npm/pnpm)"
    exit 1
fi

info "Instalando dependências com $PACKAGE_MANAGER..."
$PACKAGE_MANAGER install

info "Executando build de teste..."
$PACKAGE_MANAGER run build

if [[ $? -eq 0 ]]; then
    success "Build local executado com sucesso!"
else
    error "Build local falhou. Verifique os erros antes de fazer deploy."
    exit 1
fi

# 5. Criar primeiro commit/push se necessário
CURRENT_BRANCH=$(git branch --show-current)
info "Branch atual: $CURRENT_BRANCH"

if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    warning "Você não está na branch principal (main/master)"
    read -p "Deseja fazer checkout para main? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if git show-ref --verify --quiet refs/heads/main; then
            git checkout main
        elif git show-ref --verify --quiet refs/heads/master; then
            git checkout master
        else
            error "Nem 'main' nem 'master' existem"
            exit 1
        fi
    fi
fi

# 6. Trigger inicial do workflow
info "Verificando se há mudanças para commit..."

if [[ -n $(git status --porcelain) ]]; then
    warning "Há mudanças não commitadas"
    read -p "Deseja fazer commit e push para triggerar o deploy? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "🚀 Setup GitHub Pages deployment"
        git push origin $(git branch --show-current)
        success "Changes pushed! Deploy será iniciado automaticamente."
    fi
else
    # Fazer um push vazio para triggerar workflow
    warning "Nenhuma mudança detectada. Fazendo push vazio para triggerar deploy..."
    git commit --allow-empty -m "🚀 Trigger initial GitHub Pages deployment"
    git push origin $(git branch --show-current)
    success "Push realizado! Deploy será iniciado automaticamente."
fi

# 7. Informações finais
echo
echo "🎉 Configuração Concluída!"
echo "========================"
echo
success "GitHub Pages configurado com sucesso!"
echo
info "Próximos passos:"
echo "1. 🔍 Monitore o workflow: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo "2. 🌐 Seu site estará disponível em: https://$REPO_OWNER.github.io/$REPO_NAME/"
echo "3. ⏱️ O primeiro deploy pode levar alguns minutos"
echo "4. 📊 Verifique as métricas de performance após o deploy"
echo
info "URLs úteis:"
echo "- GitHub Pages: https://github.com/$REPO_OWNER/$REPO_NAME/settings/pages"
echo "- Secrets: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
echo "- Actions: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo
warning "Lembre-se:"
echo "- Configurar secrets é obrigatório para o build funcionar"
echo "- O site pode levar até 10 minutos para estar disponível após o primeiro deploy"
echo "- Monitore os logs de deploy para identificar possíveis problemas"
echo

success "Setup completo! 🚀" 