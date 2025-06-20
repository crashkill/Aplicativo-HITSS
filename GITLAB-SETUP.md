# 🦊 Configuração GitLab da Empresa

Este documento detalha como configurar o repositório no GitLab da sua empresa para trabalhar em conjunto com o GitHub.

## 🎯 Objetivo

Configurar um **sistema dual repository** onde:
- **GitHub**: Repositório principal para desenvolvimento
- **GitLab da empresa**: Mirror corporativo para compliance/backup

## 📋 Pré-requisitos

- [ ] Acesso ao GitLab da empresa
- [ ] Permissões para criar repositórios
- [ ] Git configurado localmente
- [ ] SSH keys ou tokens de acesso configurados

## 🚀 Passo a Passo

### 1. Criar Repositório no GitLab

1. **Acesse o GitLab da empresa**
   ```
   https://gitlab.sua-empresa.com
   ```

2. **Criar novo projeto**
   - Clique em "**New Project**"
   - Selecione "**Create blank project**"

3. **Configurar projeto**
   ```
   Nome do projeto: aplicativo-hitss
   Descrição: Sistema HITSS - Gestão Financeira + Talentos Tecnológicos
   Visibilidade: Internal (ou conforme política da empresa)
   ```

4. **NÃO inicializar com README** (já temos conteúdo)

### 2. Configurar SSH/HTTPS

#### Opção A: SSH (Recomendado)
```bash
# Gerar chave SSH se não tiver
ssh-keygen -t rsa -b 4096 -C "seu.email@empresa.com"

# Adicionar chave ao ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

# Copiar chave pública
cat ~/.ssh/id_rsa.pub
```

Adicione a chave no GitLab: **Profile Settings > SSH Keys**

#### Opção B: HTTPS com Token
1. Vá em **Profile Settings > Access Tokens**
2. Crie token com escopo `read_repository` e `write_repository`
3. Salve o token com segurança

### 3. Configurar Repositório Local

Execute o script de configuração:

```bash
npm run git:setup-dual
```

Ou manualmente:

```bash
# Adicionar remote do GitLab
git remote add gitlab git@gitlab.sua-empresa.com:seu-grupo/aplicativo-hitss.git

# Configurar push simultâneo
git remote add both git@github.com:crashkill/Aplicativo-HITSS.git
git remote set-url --add --push both git@gitlab.sua-empresa.com:seu-grupo/aplicativo-hitss.git
```

### 4. Primeiro Push para GitLab

```bash
# Push inicial
git push gitlab main

# Ou usar nosso script
npm run git:push-both
```

## 🔧 Scripts Disponíveis

### Configuração Inicial
```bash
npm run git:setup-dual    # Configurar dual repository
```

### Operações Diárias
```bash
npm run git:status        # Ver status dos repositórios
npm run git:push-both     # Push para GitHub + GitLab
```

### Comandos Git Diretos
```bash
# Push apenas GitHub
git push origin main

# Push apenas GitLab  
git push gitlab main

# Push simultâneo
git push both main

# Pull (sempre do GitHub como principal)
git pull origin main
```

## 🏗️ Estrutura de Branches

Sugerimos manter a mesma estrutura em ambos os repositórios:

```
main           # Branch principal (produção)
├── develop    # Branch de desenvolvimento  
├── feature/*  # Features em desenvolvimento
└── hotfix/*   # Correções urgentes
```

### Workflow Recomendado

1. **Desenvolvimento**: Trabalhar em `feature/*` branches
2. **Review**: Merge para `develop` 
3. **Staging**: Deploy de `develop` para ambiente de teste
4. **Produção**: Merge de `develop` para `main`
5. **Sync**: Push para ambos os repositórios

## 🔐 Configurações de Segurança

### GitLab CI/CD Variables

Configure as seguintes variáveis no GitLab:

```bash
# Navegue para: Project Settings > CI/CD > Variables

SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_KEY=[MASKED]
AZURE_CLIENT_ID=seu_client_id
AZURE_TENANT_ID=seu_tenant_id
DOPPLER_TOKEN=[MASKED]
```

### Proteção de Branches

1. Vá em **Project Settings > Repository > Protected Branches**
2. Proteja a branch `main`:
   - **Push**: Only maintainers
   - **Merge**: Only maintainers
   - **Force push**: Disabled

### Webhooks (Opcional)

Configure webhooks para sincronização automática:
- **URL**: `https://api.github.com/repos/crashkill/Aplicativo-HITSS/dispatches`
- **Events**: Push events, Merge request events

## 🚀 CI/CD Pipeline

Crie `.gitlab-ci.yml` no root do projeto:

```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:${NODE_VERSION}
  before_script:
    - npm ci
  script:
    - npm run lint
    - npm run type-check
    - npm run test
  only:
    - merge_requests
    - main
    - develop

build:
  stage: build
  image: node:${NODE_VERSION}
  before_script:
    - npm ci
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour
  only:
    - main
    - develop

deploy_staging:
  stage: deploy
  script:
    - echo "Deploy para staging"
  environment:
    name: staging
    url: https://staging.aplicativo-hitss.com
  only:
    - develop

deploy_production:
  stage: deploy
  script:
    - echo "Deploy para produção"
  environment:
    name: production
    url: https://aplicativo-hitss.com
  only:
    - main
  when: manual
```

## 📊 Monitoramento

### Webhooks para Slack/Teams

Configure notificações para:
- ✅ Push bem-sucedido
- ❌ Build falhando
- 🔀 Merge requests
- 🚀 Deploys

### Métricas

O GitLab oferece métricas integradas:
- **Analytics > Repository**: Commits, contribuidores
- **Analytics > CI/CD**: Build times, success rate
- **Analytics > Value Stream**: Lead time, cycle time

## 🔄 Sincronização Contínua

### Agenda Diária

1. **Manhã**: `git pull origin main` (atualizar do GitHub)
2. **Durante desenvolvimento**: Commits locais frequentes
3. **Fim do dia**: `npm run git:push-both` (sincronizar ambos)

### Resolução de Conflitos

Se houver conflitos entre repositórios:

```bash
# 1. Atualizar do GitHub (principal)
git pull origin main

# 2. Resolver conflitos se houver
git mergetool

# 3. Fazer commit da resolução
git commit -m "fix: resolve merge conflicts"

# 4. Push para ambos
npm run git:push-both
```

## 📞 Suporte

Para problemas de configuração:

- **Técnico**: #hitss-tech-support
- **GitLab Admin**: admin-gitlab@empresa.com
- **Documentação**: Este arquivo (GITLAB-SETUP.md)

---

## ✅ Checklist Final

- [ ] Repositório criado no GitLab
- [ ] SSH/Token configurado
- [ ] Remotes configurados localmente
- [ ] Primeiro push realizado
- [ ] CI/CD configurado
- [ ] Branches protegidas
- [ ] Equipe adicionada ao projeto
- [ ] Webhooks configurados (opcional)

**🎉 Parabéns! Seu sistema dual repository está configurado!** 