# 🎯 Aplicativo HITSS - Sistema Consolidado

[![Status](https://img.shields.io/badge/Status-Produção-green.svg)](https://github.com/crashkill/aplicativo-hitss)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.49.8-green.svg)](https://supabase.io/)

Sistema consolidado HITSS que integra **Gestão Financeira** e **Gestão de Talentos Tecnológicos** em uma plataforma única e moderna.

---

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp env.example .env
# Configure suas chaves Supabase no .env

# Executar migrations
npm run migrate

# Iniciar aplicação
npm run dev
```

**Acesse:** http://localhost:3001
**Login:** admin / admin

---

## 📚 Documentação Completa

### 🎯 **Para Iniciantes**
- 📖 **[Guia de Instalação](./docs/guias/instalacao.md)** - Como instalar do zero
- 🔧 **[Configuração](./docs/guias/configuracao-ambiente.md)** - Configurar o ambiente
- 🎯 **[Primeiros Passos](./docs/guias/primeiros-passos.md)** - Como usar o sistema

### 📋 **Documentação Centralizada**
- 📚 **[Índice Completo](./docs/README.md)** - Toda a documentação organizada
- 🚨 **[Troubleshooting](./docs/troubleshooting/problemas-comuns.md)** - Resolver problemas
- 🔧 **[Migrations](./docs/infrastructure/migrations.md)** - Sistema de banco de dados
- 🔗 **[MCP Supabase](./docs/infrastructure/supabase-mcp.md)** - Integração avançada

---

## 🎯 Funcionalidades Principais

### 💰 **Módulo Financeiro**
- **Upload DRE** - Importação de dados Excel/CSV ✅
- **Visualização** - Dashboard com gráficos interativos ✅
- **Analytics** - Estatísticas e relatórios em tempo real ✅
- **Migrations** - Sistema profissional de banco de dados ✅

### 👥 **Módulo de Talentos**
- **Gestão de Profissionais** - CRUD completo de colaboradores ✅
- **Sistema IA** - Chat inteligente com múltiplas APIs ✅
- **MCP Integration** - Operações avançadas via Model Context Protocol ✅
- **Analytics** - Insights sobre skills e disponibilidade ✅

### 🎨 **Interface Moderna**
- **Temas** - Dark/Light mode com persistência ✅
- **Responsivo** - Mobile-first design ✅
- **3D Effects** - Background WebGL opcional ✅
- **Performance** - Otimizado para velocidade ✅

---

## 🛠️ Stack Tecnológica

### **Core**
- **React** 18.3.1 + **TypeScript** 5.7.2
- **Vite** 5.0.8 + **SWC**
- **TailwindCSS** 3.4.17
- **Framer Motion** + **Three.js**

### **Backend & Dados**
- **Supabase** (PostgreSQL + Auth + Storage)
- **MCP Integration** (Model Context Protocol)
- **Real-time subscriptions**

### **IA & Analytics**
- **Sistema IA Multi-API** (Groq, Together.xyz, Llama)
- **Recharts** + **Chart.js**
- **React Query** (TanStack)

---

## ⚙️ Configuração

### **Variáveis Obrigatórias**
```env
# Supabase
VITE_SUPABASE_URL=https://pwksgdjjkryqryqrvyja.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# MCP (para migrations)
SUPABASE_ACCESS_TOKEN=sbp_de3b77b0a605783d7461f64f4ee9cd739582221a
```

### **APIs Opcionais (Melhoram Performance)**
```env
# Groq (ultra rápido)
VITE_GROQ_API_KEY=sua_groq_key

# Together.xyz (Llama 3.3 premium)
VITE_TOGETHER_API_KEY=sua_together_key
```

---

## 🚦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev            # Servidor desenvolvimento (porta 3001)
npm run build          # Build produção
npm run preview        # Preview do build

# Banco de Dados
npm run migrate        # ✅ Executar migrations
npx tsx scripts/clean-dre-table.ts  # Limpar dados DRE

# Deploy
./scripts/setup-github-pages.sh     # 🚀 Configurar GitHub Pages
# Deploy automático via GitHub Actions

# Qualidade de Código
npm run lint           # ESLint
npm run type-check     # TypeScript
npm run format         # Prettier
```

---

## 🚀 Deploy & CI/CD

### **GitHub Pages (Recomendado)**
```bash
# 1. Configurar deploy automaticamente
./scripts/setup-github-pages.sh

# 2. Deploy automático a cada push para main/master
git push origin main

# 3. Acessar aplicação
# https://<seu-usuario>.github.io/Aplicativo-HITSS/
```

**Recursos:**
- ✅ Deploy automático via GitHub Actions
- ✅ SSL gratuito (HTTPS)
- ✅ CDN global
- ✅ Monitoramento de performance
- ✅ Testes automáticos pós-deploy

**Configuração necessária:**
1. **Secrets** no GitHub (Supabase URL + Key)
2. **GitHub Pages** ativado no repositório
3. **Permissions** para GitHub Actions

📚 **Guia detalhado:** [GitHub Actions Setup](./docs/infrastructure/github-actions-setup.md)

---

## 🏗️ Arquitetura

```
src/
├── components/        # Componentes React
│   ├── dre/          # Módulo financeiro
│   ├── talent-management/  # Gestão de talentos
│   └── ui/           # Componentes base
├── pages/            # Páginas principais
├── services/         # APIs e serviços
├── lib/              # Utilitários e IA
└── types/            # Tipos TypeScript

docs/                 # 📚 Documentação centralizada
migrations/           # Scripts SQL
scripts/              # Scripts auxiliares
```

---

## ✅ Status Atual

### **🎉 Funcionando Perfeitamente**
- ✅ Sistema DRE (Upload + Viewer + Analytics)
- ✅ Migrations CLI (`npm run migrate`)
- ✅ MCP Supabase Integration + Demo
- ✅ Gestão de Profissionais
- ✅ Sistema de Temas
- ✅ Autenticação
- ✅ **GitHub Pages Deploy** - CI/CD automatizado
- ✅ Todas as funcionalidades principais

### **🚧 Em Desenvolvimento**
- Analytics avançados
- Sistema IA completo
- PWA features

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| 📄 **Arquivos TS/TSX** | 103+ arquivos |
| 📝 **Linhas de Código** | 14.777+ linhas |
| 🧩 **Componentes React** | 45+ componentes |
| 📊 **Tabelas Supabase** | 3 principais |
| 🔗 **APIs Integradas** | 5+ serviços |

---

## 🚨 Problemas Comuns

### **❌ Login não funciona**
**Credenciais:** admin / admin

### **❌ Upload DRE falha**
```bash
npm run migrate  # Criar tabelas necessárias
```

### **❌ Aplicação não inicia**
```bash
# Reset completo
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**📚 Para problemas detalhados:** [Troubleshooting](./docs/troubleshooting/problemas-comuns.md)

---

## 🔗 Links Úteis

- 🌐 **Aplicação Local**: http://localhost:3001
- 🚀 **GitHub Pages**: `https://<seu-usuario>.github.io/Aplicativo-HITSS/`
- 🗄️ **Supabase Dashboard**: [Projeto HITSS](https://supabase.com/dashboard/project/pwksgdjjkryqryqrvyja)
- 📚 **Documentação**: [docs/README.md](./docs/README.md)
- 🔧 **Migrations**: [docs/infrastructure/migrations.md](./docs/infrastructure/migrations.md)
- ⚙️ **GitHub Actions**: [Setup Guide](./docs/infrastructure/github-actions-setup.md)

---

## 📞 Suporte

### **🚨 Problemas Urgentes**
1. Consulte: [Troubleshooting](./docs/troubleshooting/problemas-comuns.md)
2. Verifique: Node.js 18+ instalado
3. Execute: `npm run migrate`

### **📚 Documentação**
- **Para iniciantes**: [Guia de Instalação](./docs/guias/instalacao.md)
- **Para desenvolvedores**: [Documentação Completa](./docs/README.md)
- **Para problemas**: [Troubleshooting](./docs/troubleshooting/problemas-comuns.md)

---

## 🎉 Atualizações Recentes

### **2024-01-15** - Sistema Totalmente Funcional
- ✅ **Migrations**: CLI funcionando, tabela `dre_hitss` criada
- ✅ **Upload DRE**: Campo `data` corrigido, aceita formato M/YYYY
- ✅ **Browser Errors**: `SAPGuiService.ts` corrigido
- ✅ **Documentação**: Centralizada em `/docs`

### **2024-01-14** - MCP Integration
- ✅ **MCP Demo**: Interface funcionando na página Analytics
- ✅ **Supabase**: Projeto migrado para `pwksgdjjkryqryqrvyja`
- ✅ **APIs**: Integração completa funcionando

---

**🎯 Sistema HITSS - Transformando gestão em resultados!**

**Documentação completa disponível em:** [docs/README.md](./docs/README.md)
