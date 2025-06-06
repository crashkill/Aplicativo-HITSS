# 📖 Guia de Instalação - Aplicativo HITSS

## 🎯 Visão Geral

Este guia completo te levará desde zero até ter o **Aplicativo HITSS** funcionando localmente em seu ambiente de desenvolvimento.

---

## 📋 Pré-requisitos

### **1. Sistema Operacional**
- ✅ **macOS** 10.15+ (recomendado)
- ✅ **Windows** 10/11 com WSL2
- ✅ **Linux** Ubuntu 18.04+

### **2. Node.js (Obrigatório)**
```bash
# Versão recomendada: 18 LTS
node --version  # Deve retornar v18.x.x

# Instalar via nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### **3. Git**
```bash
git --version  # Verificar se está instalado
```

### **4. Editor de Código (Opcional)**
- **VS Code** (recomendado) com extensões:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense

---

## 🚀 Instalação Passo a Passo

### **Passo 1: Clonar o Repositório**
```bash
# Clone o projeto
git clone https://github.com/crashkill/aplicativo-hitss.git

# Entre no diretório
cd aplicativo-hitss

# Verificar se está na branch correta
git branch
# Deve mostrar: * main ou * master
```

### **Passo 2: Instalar Dependências**
```bash
# Opção 1: npm (padrão)
npm install

# Opção 2: yarn (alternativa)
yarn install

# Opção 3: pnpm (mais rápido)
pnpm install
```

**⏱️ Tempo estimado:** 2-5 minutos (dependendo da conexão)

### **Passo 3: Configurar Variáveis de Ambiente**
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar arquivo .env
nano .env  # ou code .env no VS Code
```

**Configuração mínima (obrigatória):**
```env
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://pwksgdjjkryqryqrvyja.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# MCP Access Token (para migrations)
SUPABASE_ACCESS_TOKEN=sbp_de3b77b0a605783d7461f64f4ee9cd739582221a
```

### **Passo 4: Executar Migrations**
```bash
# Criar tabelas necessárias no Supabase
npm run migrate

# Deve mostrar:
# ✅ Migration 001: Tabela dre_hitss criada
# ✅ Migration 002: Tipo coluna data corrigido
```

### **Passo 5: Iniciar Aplicação**
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Aguardar mensagem:
# VITE v5.4.19  ready in xxx ms
# Local:   http://localhost:3001/
```

### **Passo 6: Verificar Instalação**
1. **Abra o browser:** `http://localhost:3001`
2. **Faça login:**
   - **Usuário:** `admin`
   - **Senha:** `admin`
3. **Verifique módulos:**
   - Dashboard ✅
   - Upload DRE ✅
   - Gestão de Profissionais ✅
   - Configurações ✅

---

## 🔧 Configurações Opcionais

### **APIs de IA (Melhoram Performance)**

```env
# Groq (ultra rápido)
VITE_GROQ_API_KEY=sua_groq_key

# Together.xyz (Llama 3.3 premium)
VITE_TOGETHER_API_KEY=sua_together_key
```

**Como obter:**
1. **Groq**: [console.groq.com](https://console.groq.com)
2. **Together**: [api.together.xyz](https://api.together.xyz)

### **Configurações de Desenvolvimento**

```env
# Debug mode
VITE_DEBUG=true

# Environment
NODE_ENV=development

# Port override (se necessário)
PORT=3001
```

---

## 📦 Scripts Disponíveis

### **Desenvolvimento**
```bash
npm run dev          # Servidor desenvolvimento (porta 3001)
npm run build        # Build para produção
npm run preview      # Preview do build
```

### **Banco de Dados**
```bash
npm run migrate      # Executar migrations
npm run clean-db     # Limpar tabela DRE (cuidado!)
```

### **Qualidade de Código**
```bash
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run format       # Prettier
```

### **Testes**
```bash
npm test             # Executar testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Coverage
```

---

## 🗂️ Estrutura do Projeto

```
aplicativo-hitss/
├── 📁 src/                    # Código fonte
│   ├── 📁 components/         # Componentes React
│   ├── 📁 pages/             # Páginas principais
│   ├── 📁 services/          # Serviços e APIs
│   ├── 📁 lib/               # Utilitários
│   └── 📁 types/             # Tipos TypeScript
├── 📁 docs/                   # Documentação
├── 📁 migrations/             # Scripts SQL
├── 📁 scripts/                # Scripts auxiliares
├── 📁 public/                 # Arquivos estáticos
├── 📋 package.json           # Dependências
├── 📋 .env                   # Variáveis de ambiente
└── 📋 README.md              # Documentação principal
```

---

## 🚨 Resolução de Problemas

### **❌ "npm install" falha**
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **❌ "Port 3000 is in use"**
```bash
# A aplicação já usa porta 3001 por padrão
# Acesse: http://localhost:3001
```

### **❌ Migrations falham**
```bash
# Verificar credenciais Supabase no .env
# Tentar executar manualmente:
npx tsx scripts/run-migrations.ts
```

### **❌ Login não funciona**
**Credenciais corretas:**
- Usuário: `admin`
- Senha: `admin`

### **❌ Página branca**
1. Verifique console do browser (F12)
2. Confirme que server está rodando
3. Teste: `curl http://localhost:3001`

---

## ✅ Verificação Final

### **Checklist de Funcionamento**
- [ ] ✅ Aplicação inicia sem erros
- [ ] ✅ Login funciona (admin/admin)
- [ ] ✅ Dashboard carrega
- [ ] ✅ Upload DRE disponível
- [ ] ✅ Gestão Profissionais funciona
- [ ] ✅ MCP Demo responde (Analytics)
- [ ] ✅ Temas claro/escuro funcionam

### **Testes Funcionais**
```bash
# 1. Testar upload DRE
# Acesse Upload > Arraste arquivo Excel DRE

# 2. Testar MCP
# Gestão Profissionais > Analytics > MCP Demo > "Listar Projetos"

# 3. Testar tema
# Clique no toggle tema no sidebar
```

---

## 🎉 Próximos Passos

1. **📚 Leia a documentação:** [docs/README.md](../README.md)
2. **🔧 Configure funcionalidades:** [Configuração](./configuracao-ambiente.md)
3. **🎯 Primeiros passos:** [Guia de uso](./primeiros-passos.md)
4. **🚨 Problemas?** [Troubleshooting](../troubleshooting/problemas-comuns.md)

---

## 📞 Suporte

**🚨 Problemas de instalação?**
1. Verifique [troubleshooting](../troubleshooting/problemas-comuns.md)
2. Confirme pré-requisitos (Node.js 18+)
3. Teste "reset completo" da documentação

**✅ Instalação bem-sucedida!**
- Sistema pronto para uso
- Todas as funcionalidades disponíveis
- Documentação completa em `/docs`

---

**🎯 Sistema HITSS instalado e funcionando! Próximo: Configuração avançada.** 