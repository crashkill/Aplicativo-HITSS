# 🔐 Scripts de Configuração - Aplicativo HITSS

Este diretório contém scripts para gerenciar as configurações do ambiente de forma segura através de um repositório privado no GitHub.

## 📋 **Scripts Disponíveis**

### 1. 📥 **Setup de Configurações**
```bash
# Via npm
npm run env:setup

# Direto
./scripts/setup-env.sh
```
**Funcionalidade:**
- Baixa automaticamente o arquivo `.env` do repositório privado
- Faz backup do `.env` atual (se existir)
- Instala o GitHub CLI se necessário
- Reinicia o servidor de desenvolvimento automaticamente

### 2. 📤 **Upload de Configurações**
```bash
# Via npm
npm run env:upload

# Direto
./scripts/upload-env.sh
```
**Funcionalidade:**
- Envia o arquivo `.env` atual para o repositório privado
- Faz confirmação antes do upload
- Atualiza o arquivo existente ou cria um novo
- Mostra resumo das configurações enviadas

### 3. 📋 **Backup Local**
```bash
# Via npm
npm run env:backup

# Direto
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
```

## 🏗️ **Configuração Inicial**

### 1. **Criar Repositório Privado**
1. Acesse [GitHub](https://github.com/new)
2. Crie um repositório chamado `hitss-config` (privado)
3. Crie a estrutura de pastas:
   ```
   hitss-config/
   ├── environments/
   │   └── aplicativo-hitss/
   │       └── .env
   └── README.md
   ```

### 2. **Configurar GitHub CLI**
```bash
# Instalar GitHub CLI (se não tiver)
brew install gh

# Fazer login
gh auth login
```

### 3. **Primeiro Upload**
```bash
# Configure seu .env local primeiro, depois:
npm run env:upload
```

## 🔒 **Segurança**

### ✅ **Boas Práticas Aplicadas:**
- ✅ Repositório **privado** no GitHub
- ✅ Autenticação via GitHub CLI
- ✅ Backup automático antes de sobrescrever
- ✅ Não exibe valores sensíveis no terminal
- ✅ Codificação base64 para transferência

### ⚠️ **Cuidados Importantes:**
- 🔐 **Nunca commitar** o arquivo `.env` no repositório principal
- 🔒 **Manter repositório de configuração privado**
- 👥 **Compartilhar acesso** apenas com desenvolvedores autorizados
- 🔄 **Fazer backup** antes de grandes mudanças

## 📁 **Estrutura do Repositório de Configuração**

```
hitss-config/ (Repositório PRIVADO)
├── environments/
│   ├── aplicativo-hitss/
│   │   ├── .env                    # Produção
│   │   ├── .env.development        # Desenvolvimento
│   │   └── .env.staging           # Homologação
│   ├── outro-projeto/
│   │   └── .env
│   └── ...
├── docs/
│   └── configuracao.md
└── README.md
```

## 🚀 **Comandos Úteis**

```bash
# Setup completo para novo ambiente
npm run env:setup

# Salvar configurações atuais
npm run env:upload

# Fazer backup local
npm run env:backup

# Ver configurações carregadas (sem valores)
grep -E "^[A-Z_]+" .env | cut -d'=' -f1
```

## 🔧 **Personalização**

Para usar com seus próprios repositórios, edite os arquivos de script e altere:

```bash
# Em scripts/setup-env.sh e scripts/upload-env.sh
PRIVATE_REPO="SEU_USUARIO/SEU_REPO_PRIVADO"
ENV_FILE_PATH="caminho/para/seu/.env"
```

## 📞 **Suporte**

Em caso de problemas:

1. **Verificar autenticação:** `gh auth status`
2. **Verificar repositório:** `gh repo view SEU_REPO_PRIVADO`
3. **Verificar arquivo:** `gh api repos/SEU_REPO_PRIVADO/contents/caminho/.env`

## 🔐 Scripts de Segurança

### `clean-hardcoded-secrets.sh`
**Função:** Remove credenciais hardcoded do código fonte

```bash
./scripts/clean-hardcoded-secrets.sh
```

**O que faz:**
- 🔒 Remove tokens do Supabase hardcoded
- 🆔 Substitui projeto IDs por variáveis de ambiente  
- 📚 Limpa documentação com placeholders seguros
- 💾 Cria backup antes das alterações
- ✅ Executa verificação automática
- 📦 Atualiza package.json com scripts de segurança

**Arquivos afetados:**
- `scripts/fix-data-column.ts`
- `src/services/migrationService.ts`
- `src/components/talent-management/SupabaseMCPDemo.tsx`
- `src/lib/supabaseMCP.ts`
- `src/lib/supabaseMCPReal.ts`
- `src/scripts/testSupabaseMCP.ts`
- Documentação (.md files)

### `verify-no-secrets.sh`
**Função:** Verifica se ainda existem credenciais hardcoded

```bash
./scripts/verify-no-secrets.sh
```

**Verificações:**
- 🔍 Busca por tokens específicos do Supabase
- 🆔 Procura por projeto IDs hardcoded
- ✅ Confirma limpeza bem-sucedida

## ☁️ Scripts de Backup

### `upload-env.sh`
**Função:** Faz backup das configurações para repositório privado seguro

```bash
./scripts/upload-env.sh
```

**O que faz:**
- 📤 Upload do .env para GitHub privado
- 📊 Gera relatório de credenciais sensíveis
- 📋 Cria changelog automático
- 🔍 Identifica arquivos com credenciais expostas
- ⚠️ Lista ações de segurança necessárias

**Relatórios gerados:**
- `configs/security/sensitive-data-report.md`
- `configs/docs/CHANGELOG.md`

### `setup-env.sh`
**Função:** Baixa configurações do repositório privado

```bash
./scripts/setup-env.sh
```

**O que faz:**
- 📥 Download do .env do repositório privado
- ✅ Valida integridade das configurações
- 🔧 Configura ambiente local

## 🗄️ Scripts de Banco de Dados

### `run-migrations.ts`
**Função:** Executa migrações do banco de dados

```bash
npm run migrate
```

### `clean-dre-table.ts`
**Função:** Limpa dados da tabela DRE

```bash
npm run clean:dre
```

### `fix-data-column.ts`
**Função:** Corrige estrutura de colunas (⚠️ Agora sem credenciais hardcoded)

```bash
npm run fix:data
```

## 📦 Scripts NPM Configurados

### Segurança
```bash
npm run security:clean    # Limpa credenciais hardcoded
npm run security:verify   # Verifica segurança
npm run security:backup   # Backup de configurações
```

### Ambiente
```bash
npm run env:setup    # Baixa configurações
npm run env:upload   # Faz upload de configurações
npm run env:backup   # Backup (alias para security:backup)
```

### Banco de Dados
```bash
npm run migrate      # Executa migrações
npm run clean:dre    # Limpa tabela DRE
npm run fix:data     # Corrige colunas
```

## 🛡️ Práticas de Segurança

### ✅ Boas Práticas Implementadas:
1. **Backup automático** antes de qualquer alteração
2. **Verificação automática** após limpeza
3. **Relatórios de segurança** detalhados
4. **Substituição segura** de credenciais por variáveis de ambiente
5. **Documentação limpa** com placeholders
6. **Scripts de validação** automática

### ⚠️ Importante:
- Sempre execute `security:verify` após mudanças
- Faça backup regular com `security:backup`
- Revogue tokens antigos após limpeza
- Mantenha o `.env` fora do controle de versão

## 🔧 Estrutura de Backup

```
backups/
├── before-cleanup-YYYYMMDD-HHMMSS/
│   ├── scripts/
│   │   └── fix-data-column.ts
│   └── src/
│       ├── services/migrationService.ts
│       └── lib/
└── configs/ (no repositório privado)
    ├── env/.env
    ├── security/sensitive-data-report.md
    └── docs/CHANGELOG.md
```

## 📞 Suporte

Para problemas com os scripts:
1. Verifique os logs de execução
2. Consulte o backup mais recente
3. Execute `security:verify` para diagnóstico
4. Revise o relatório de segurança

---

**⚠️ NUNCA commit credenciais hardcoded no código!**
**✅ Sempre use variáveis de ambiente para dados sensíveis.**

⚡ **Desenvolvido para facilitar o gerenciamento seguro de configurações entre ambientes!**

# 📂 Scripts do Aplicativo HITSS (Cross-Platform)

Este diretório contém scripts utilitários **multiplataforma** para gerenciamento do projeto HITSS.

## 🖥️ Compatibilidade

✅ **Windows** 10/11  
✅ **macOS** (Intel/Apple Silicon)  
✅ **Linux** (Ubuntu/Debian/CentOS)  
✅ **Node.js** 16+ (TypeScript/tsx)

## 🔐 Scripts de Segurança

### `security-scanner.ts`
**Função:** Escaneia todo o projeto em busca de credenciais sensíveis

```bash
npm run security:scan
```

**O que faz:**
- 🔍 Escaneia 15+ padrões de credenciais sensíveis
- 📊 Relatório detalhado por severidade (Crítico/Alto/Médio/Baixo)
- 🎯 Detecta tokens específicos do projeto (Supabase, Azure)
- 📁 Ignora automaticamente node_modules, .git, backups
- 💾 Salva relatório em arquivo markdown
- ⚡ Execução rápida e eficiente
- 🌍 Funciona em qualquer plataforma

**Padrões detectados:**
- Tokens Supabase (sbp_*, JWT)
- Credenciais Azure (Client Secret, IDs)
- GitHub Personal Access Tokens
- AWS Access Keys
- Google API Keys
- URLs com credenciais
- Senhas hardcoded
- Strings de conexão de banco

### `clean-hardcoded-secrets.ts`
**Função:** Remove credenciais hardcoded do código fonte automaticamente

```bash
npm run security:clean
```

**O que faz:**
- 🔒 Remove tokens do Supabase hardcoded
- 🆔 Substitui projeto IDs por variáveis de ambiente  
- 📚 Limpa documentação com placeholders seguros
- 💾 Cria backup antes das alterações
- ✅ Executa verificação automática
- 📦 Atualiza package.json com scripts de segurança
- 🌐 Script de verificação cross-platform

**Arquivos afetados:**
- `scripts/fix-data-column.ts`
- `src/services/migrationService.ts`
- `src/components/talent-management/SupabaseMCPDemo.tsx`
- `src/lib/supabaseMCP.ts`
- `src/lib/supabaseMCPReal.ts`
- `src/scripts/testSupabaseMCP.ts`
- `README.md` e arquivos de documentação

### `verify-no-secrets.ts`
**Função:** Verifica se há credenciais hardcoded no código

```bash
npm run security:verify
```

**O que faz:**
- ✅ Verifica ausência de tokens específicos
- 🔍 Busca em arquivos fonte (.ts, .tsx, .js, .jsx)
- 📂 Ignora backups e node_modules
- 🎯 Detecta uso incorreto de variáveis de ambiente
- 🌍 Comandos cross-platform (findstr/grep)

## 🔧 Scripts de Configuração

### `setup-env.ts`
**Função:** Baixa configurações do repositório seguro

```bash
npm run env:setup
```

**O que faz:**
- 📥 Clona repositório privado de configurações
- 📄 Copia arquivo .env para o projeto
- 🔍 Verifica integridade das configurações
- ⚠️ Mostra alertas de segurança se disponíveis
- 🚫 Atualiza .gitignore com entradas de segurança
- 💾 Faz backup do .env existente
- 🌍 Input interativo cross-platform

**Estrutura do repositório:**
```
hitss-config/
├── configs/
│   ├── env/
│   │   └── .env
│   ├── docs/
│   │   └── CHANGELOG.md
│   └── security/
│       └── sensitive-data-report.md
```

### `upload-env.ts`
**Função:** Faz backup das configurações para repositório seguro

```bash
npm run env:upload
npm run env:backup  # Alias
```

**O que faz:**
- ☁️ Upload seguro para GitHub privado
- 📊 Relatório completo de credenciais identificadas
- 📋 Changelog automático com estatísticas
- 🔍 Identificação de arquivos com credenciais hardcoded
- ⚠️ Alertas de segurança críticos
- 🌐 Configuração Git automática cross-platform

## 📦 Comandos npm Disponíveis

### Principais (Recomendados)
```bash
npm run security:scan     # Scanner completo de segurança
npm run security:clean    # Limpar credenciais hardcoded
npm run security:verify   # Verificar ausência de credenciais
npm run env:setup         # Baixar configurações
npm run env:upload        # Upload/backup de configurações
```

### Aliases (Compatibilidade)
```bash
npm run clean:secrets     # = security:clean
npm run verify:secrets    # = security:verify
npm run setup:env         # = env:setup
npm run upload:env        # = env:upload
npm run env:backup        # = env:upload
```

## 🚀 Fluxo de Trabalho Recomendado

### 1. Setup Inicial (Novo desenvolvedor)
```bash
npm run env:setup         # Baixar configurações
npm run security:scan     # Verificar estado da segurança
npm run dev              # Testar aplicação
```

### 2. Desenvolvimento Regular
```bash
npm run security:scan     # Antes de commit
git add .
git commit -m "feat: nova funcionalidade"
npm run env:upload        # Backup periódico
```

### 3. Limpeza de Segurança (Se necessário)
```bash
npm run security:scan     # Identificar problemas
npm run security:clean    # Limpar automaticamente
npm run security:verify   # Confirmar limpeza
npm run env:upload        # Backup pós-limpeza
```

### 4. Emergência (Credenciais expostas)
```bash
npm run security:scan     # Identificar exposição
# Revogar credenciais no Supabase/Azure
npm run security:clean    # Limpar código
npm run env:setup         # Baixar novas credenciais
npm run security:verify   # Confirmar segurança
```

## 🛡️ Recursos de Segurança

### ✅ **Detecção Automática**
- 15+ padrões de credenciais sensíveis
- Tokens específicos do projeto HITSS
- APIs conhecidas (Google, AWS, GitHub)
- Strings de conexão de banco de dados
- URLs com credenciais embedadas

### ✅ **Proteção Cross-Platform**
- Scripts TypeScript nativos
- Comandos específicos por SO (findstr/grep)
- Paths compatíveis (Windows/Unix)
- Cores de terminal universais
- Input interativo multiplataforma

### ✅ **Backup Seguro**
- Repositório GitHub privado
- Estrutura organizada de configurações
- Relatórios detalhados de segurança
- Changelog automático
- Controle de versão das credenciais

### ✅ **Prevenção**
- .gitignore automaticamente atualizado
- Verificação antes de commits
- Alertas de credenciais hardcoded
- Scripts de limpeza automática
- Documentação de boas práticas

## 📊 Estatísticas e Relatórios

Os scripts geram relatórios detalhados incluindo:

- **Contagem de problemas** por severidade
- **Localização exata** (arquivo:linha) 
- **Tipo de credencial** detectada
- **Valor exposto** (truncado por segurança)
- **Recomendações** específicas de correção
- **Compatibilidade** do sistema operacional
- **Timestamps** para auditoria

## 🔗 Integração com CI/CD

Para adicionar verificação automática no pipeline:

```yaml
# GitHub Actions
- name: Security Scan
  run: |
    npm install
    npm run security:scan
  
# GitLab CI
security_scan:
  script:
    - npm install  
    - npm run security:scan
```

## ⚠️ Avisos Importantes

1. **Nunca commitar** arquivos .env
2. **Sempre revogar** credenciais expostas
3. **Executar scan** antes de cada push
4. **Manter backups** em repositório privado
5. **Educar equipe** sobre boas práticas
6. **Usar variáveis de ambiente** sempre
7. **Verificar relatórios** de segurança regularmente

## 🆘 Solução de Problemas

### Erro: "Command not found" (Windows)
```bash
# Instalar tsx globalmente
npm install -g tsx

# Ou usar via npx
npx tsx scripts/security-scanner.ts
```

### Erro: "Permission denied" (Unix)
```bash
# Dar permissão de execução
chmod +x scripts/*.ts

# Ou usar via npm
npm run security:scan
```

### Erro: "Git not configured"
```bash
# Configurar Git automaticamente
npm run env:upload  # Script configura automaticamente

# Ou manual
git config --global user.email "seu@email.com"
git config --global user.name "Seu Nome"
```

---

**🖥️ COMPATIBILIDADE TOTAL:** Windows, macOS, Linux  
**🔧 TECNOLOGIA:** TypeScript + Node.js  
**🛡️ SEGURANÇA:** Scanner automático + Backup seguro  
**📦 FACILIDADE:** Comandos npm simples 