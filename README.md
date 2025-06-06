# 🎯 Aplicativo HITSS - Sistema Consolidado

[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow.svg)](https://github.com/crashkill/aplicativo-hitss)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.49.8-green.svg)](https://supabase.io/)

Sistema consolidado HITSS que integra **Gestão Financeira** e **Gestão de Talentos Tecnológicos** em uma plataforma única e moderna.

## 🚀 Funcionalidades Principais

### 💰 Módulo Financeiro
- **Dashboard Financeiro** - Visão geral com indicadores em tempo real
- **Planilhas Financeiras** - Visualização de receitas e despesas
- **Forecast** - Projeções e previsões financeiras com gráficos interativos
- **Upload de Dados** - Importação via arquivos Excel
- **Relatórios Customizados** - Análises detalhadas por período e projeto

### 🎯 Módulo de Talentos (Baseado no Talent Sphere Registry)
- **Dashboard de Talentos** - Overview completo dos profissionais
- **Gestão de Profissionais** - Cadastro e gerenciamento de colaboradores
- **Sistema IA Avançado** - Chat inteligente com múltiplas APIs (Groq, Together.xyz, Llama 3.3)
- **Análises Inteligentes** - Insights automáticos sobre skills e disponibilidade
- **Background WebGL** - Interface moderna com efeitos 3D
- **Filtros Avançados** - Por tecnologias, senioridade, disponibilidade

## 🛠️ Stack Tecnológica

### Core
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS + React Bootstrap
- **Animações:** Framer Motion
- **3D/WebGL:** Three.js + React Three Fiber

### Backend & Dados
- **Database:** Supabase (PostgreSQL)
- **API:** REST + Real-time subscriptions
- **Cache:** React Query (TanStack Query)
- **Storage:** Supabase Storage

### IA & Analytics
- **IA Principal:** Sistema inteligente com fallback automático
  - 🚀 **Groq** - Ultra rápido (200-500ms)
  - 🔥 **Together.xyz** - Llama 3.3 70B premium
  - 🆓 **Llama Free** - Sem API key necessária
  - 💾 **Offline** - Análise local sempre disponível
- **Gráficos:** Recharts + Chart.js
- **Visualização:** React virtualization

### Desenvolvimento
- **Build:** Vite + SWC
- **Testes:** Jest + Testing Library
- **Lint:** ESLint + TypeScript ESLint
- **Deploy:** GitHub Actions + Netlify

## ⚙️ Configuração e Instalação

### Pré-requisitos
```bash
# Node.js 18+
nvm install 18
nvm use 18

# Gerenciador de pacotes
npm install -g pnpm@8
```

### Instalação
```bash
# Clonar o repositório
git clone https://github.com/crashkill/aplicativo-hitss.git
cd aplicativo-hitss

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

### Variáveis de Ambiente

#### 🔒 Obrigatórias (Supabase)
```bash
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

#### 🤖 Opcionais (IA - Sistema inteligente funciona sem elas)
```bash
# Para velocidade insana (Groq)
VITE_GROQ_API_KEY=sua_groq_key

# Para recursos premium (Together.xyz)
VITE_TOGETHER_API_KEY=sua_together_key
```

### 🔗 MCP Supabase (Model Context Protocol)

O sistema inclui suporte completo para **MCP Supabase**, permitindo operações avançadas de banco de dados via protocolo MCP:

#### Configuração do MCP:
```bash
# Configurar token de acesso Supabase
export SUPABASE_ACCESS_TOKEN="sb-projeto-token-aqui"

# Executar servidor MCP (se disponível)
npx @supabase/supabase-js mcp-server --access-token $SUPABASE_ACCESS_TOKEN
```

#### 🛠️ Funcionalidades MCP Disponíveis:
- **📁 Projetos:** `mcp_supabase_list_projects` - Lista todos os projetos
- **🔍 Detalhes:** `mcp_supabase_get_project` - Detalhes específicos do projeto
- **📋 Tabelas:** `mcp_supabase_list_tables` - Lista tabelas e esquemas
- **⚡ SQL:** `mcp_supabase_execute_sql` - Execução direta de queries
- **🚀 Migrations:** `mcp_supabase_apply_migration` - Aplicar mudanças no schema
- **📊 Logs:** `mcp_supabase_get_logs` - Logs em tempo real do sistema

#### 💡 Demo Interativa:
O sistema inclui um **componente de demonstração** na aba **Analytics** da página de Gestão de Profissionais que permite:
- ✅ Testar todas as funções MCP em tempo real
- 📋 Ver exemplos de queries e migrations
- 🔍 Análise de resultados com formatação JSON
- ⚡ Execução de operações de banco de dados

```typescript
// Exemplo de uso das funções MCP
await mcp_supabase_execute_sql({
  project_id: 'pwksgdjjkryqryqrvyja',
  query: 'SELECT COUNT(*) FROM colaboradores WHERE javascript = \'Sim\''
});
```

## 🚦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev            # Servidor de desenvolvimento
npm run build          # Build de produção
npm run preview        # Preview do build

# Qualidade de Código
npm run lint           # ESLint
npm run type-check     # Verificação TypeScript
npm run format         # Prettier

# Testes
npm test              # Executar testes
npm run test:watch    # Testes em modo watch
npm run test:coverage # Cobertura de testes
```

## 🏗️ Arquitetura do Sistema

```
src/
├── components/
│   ├── talent-management/     # Componentes de gestão de talentos
│   │   ├── WebGLBackground.tsx   # Background 3D
│   │   └── AIChat.tsx           # Chat IA integrado
│   ├── gestao-profissionais/  # Componentes específicos
│   ├── ui/                    # Componentes base (shadcn/ui)
│   └── Layout/                # Layouts do sistema
├── pages/
│   ├── Dashboard.tsx          # Dashboard financeiro
│   ├── GestaoProfissionais.tsx # Gestão de talentos
│   ├── Forecast.tsx           # Previsões financeiras
│   └── ...                    # Outras páginas
├── lib/
│   └── ai/                    # Sistema de IA
│       └── smartai.ts         # IA inteligente com fallback
├── types/
│   ├── talent/                # Tipos de gestão de talentos
│   └── ...                    # Outros tipos
├── contexts/
│   ├── AuthContext.tsx        # Autenticação
│   └── ThemeContext.tsx       # Tema dark/light
└── hooks/                     # Hooks customizados
```

## 🎨 Sistema de Temas

O aplicativo suporta **tema claro e escuro** com transições suaves:

- 🌙 **Dark Mode** - Interface escura para trabalho prolongado
- ☀️ **Light Mode** - Interface clara para máxima legibilidade
- 🎨 **Transições** - Mudanças suaves entre temas
- 💾 **Persistência** - Preferência salva no localStorage

## 🤖 Sistema IA Inteligente

### Como Funciona:
1. **🆓 Gratuito sempre:** Llama 3.3 70B via Together.xyz (sem API key)
2. **⚡ Ultra rápido:** Groq para respostas em 200-500ms (opcional)
3. **🔥 Premium:** Together.xyz com API key para recursos avançados
4. **💾 Offline:** Análise local como último recurso

### Capacidades:
- 📊 Análise de dados de profissionais
- 🔍 Filtros inteligentes por skills
- 📈 Insights sobre disponibilidade
- 💡 Sugestões de otimização de equipes
- 🎯 Recomendações de alocação

## 📊 Integrações

### Supabase Features Utilizadas:
- ✅ **Database** - PostgreSQL para dados estruturados
- ✅ **Real-time** - Updates automáticos via websockets
- ✅ **Auth** - Sistema de autenticação completo
- ✅ **Storage** - Upload de arquivos e documentos
- ✅ **Edge Functions** - Processamento serverless

### APIs de IA:
- 🚀 **Groq** - LLaMA inference ultra-rápida
- 🔥 **Together.xyz** - Modelos premium e gratuitos
- 💾 **Local** - Processamento offline inteligente

## 🔒 Segurança

- 🔐 **Autenticação JWT** via Supabase
- 🛡️ **Row Level Security** no banco de dados
- 🔒 **Variáveis de ambiente** para credenciais
- 🚫 **Rate limiting** nas APIs de IA
- 📝 **Logs de auditoria** para ações críticas

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
# Aplicação disponível em http://localhost:5173
```

### Produção (Netlify)
```bash
npm run build
# Deploy automático via GitHub Actions
```

## 📈 Performance

### Métricas Alvo:
- ⚡ **First Contentful Paint** < 1.5s
- 🎯 **Largest Contentful Paint** < 2.5s
- 📱 **Mobile Performance Score** > 90
- 🖥️ **Desktop Performance Score** > 95

### Otimizações:
- 📦 **Code Splitting** automático
- 🗜️ **Tree Shaking** para bundles menores
- 💾 **Caching** inteligente com React Query
- 🖼️ **Lazy Loading** de imagens e componentes

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📝 Changelog

### v1.0.0 (Atual)
- ✅ Integração completa dos módulos financeiro e talentos
- ✅ Sistema IA inteligente com múltiplos providers
- ✅ Interface moderna com WebGL e animações
- ✅ Tema dark/light dinâmico
- ✅ Dashboard unificado
- ✅ Autenticação e segurança

## 📞 Suporte

- 📧 **Email:** suporte@hitss.com
- 📚 **Documentação:** [Wiki do Projeto](./docs/)
- 🐛 **Issues:** [GitHub Issues](https://github.com/crashkill/aplicativo-hitss/issues)

---

**Desenvolvido com ❤️ para a HITSS - Telefônica**

*Sistema consolidado que une gestão financeira e de talentos em uma plataforma moderna e inteligente.*
