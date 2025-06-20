# 🏢 Aplicativo HITSS

> Sistema consolidado de Gestão Financeira e Talentos Tecnológicos

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Azure AD](https://img.shields.io/badge/Auth-Azure%20AD-0078D4.svg)](https://azure.microsoft.com/services/active-directory/)

## 📋 Sobre o Projeto

O **Aplicativo HITSS** é uma solução completa para gestão empresarial que integra:

- 💰 **Gestão Financeira**: DRE, receitas, despesas e projeções
- 👥 **Gestão de Talentos**: Profissionais e colaboradores tecnológicos  
- 📊 **Dashboards Analíticos**: Visualizações interativas e KPIs
- 🔐 **Autenticação Segura**: Azure AD com MFA
- 🤖 **IA Integrada**: Azure AI Search para insights inteligentes

## 🚀 Funcionalidades Principais

### 💼 Gestão Financeira
- **Upload DRE**: Importação automática de planilhas Excel
- **Análise de Receitas/Despesas**: Categorização e filtros avançados
- **Projeções Financeiras**: Forecasts baseados em dados históricos
- **Dashboards Executivos**: Métricas de margem, rentabilidade e performance

### 👨‍💼 Gestão de Profissionais  
- **Banco de Talentos**: Cadastro completo de profissionais
- **Análise de Custos**: Cálculos de CLT, subcontratados e terceirizados
- **Perfis Tecnológicos**: Skills, experiências e competências
- **Relatórios de Alocação**: Distribuição de recursos por projeto

### 🔍 Inteligência Artificial
- **Chat IA**: Assistant para consultas e análises
- **Search Semântico**: Busca inteligente em documentos e dados
- **Insights Automatizados**: Análises preditivas e recomendações

### 🔒 Segurança e Compliance
- **Azure AD**: Single Sign-On empresarial
- **MFA**: Autenticação multifator obrigatória
- **RLS**: Row Level Security no banco de dados
- **Auditoria**: Logs de acesso e operações

## 🏗️ Arquitetura Técnica

```
Frontend (React + TypeScript)
├── 🎨 UI/UX: Tailwind CSS + Radix UI
├── 📊 Charts: Chart.js + Recharts  
├── 🗂️ Estado: React Query + Context API
└── 🛡️ Auth: MSAL (Microsoft Authentication Library)

Backend (Supabase)
├── 🗄️ Database: PostgreSQL com RLS
├── 🔑 Auth: Azure AD Integration
├── ⚡ Edge Functions: Processamento serverless
└── 📁 Storage: Upload seguro de arquivos

Integrações
├── 🤖 Azure AI Search: Busca semântica
├── 📈 Azure Analytics: Métricas e insights
├── 🔐 Doppler: Gerenciamento seguro de secrets
└── 🚀 GitHub Actions: CI/CD automatizado
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Styling utility-first
- **React Router** - Roteamento SPA
- **React Query** - Gerenciamento de estado servidor

### Backend & Infraestrutura  
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados relacional
- **Azure AD** - Autenticação empresarial
- **Doppler** - Gerenciamento de variáveis seguras
- **GitHub Actions** - CI/CD

### Bibliotecas Especiais
- **@azure/msal-react** - Autenticação Microsoft
- **@supabase/supabase-js** - Cliente Supabase
- **xlsx** - Processamento de planilhas
- **recharts** - Gráficos interativos
- **three.js** - Elementos 3D

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou pnpm
- Doppler CLI configurado
- Acesso ao Azure AD da empresa

### 1. Clone e instale dependências
```bash
git clone <repository-url>
cd aplicativo-hitss
npm install
```

### 2. Configure o Doppler (obrigatório)
```bash
# Configure o Doppler com as credenciais do projeto
doppler login
doppler setup

# Verifique se está funcionando
npm run doppler:check
```

### 3. Configure as variáveis de ambiente
```bash
# Faça upload das variáveis para o Doppler
npm run env:setup

# Verifique a configuração
npm run verify:doppler
```

### 4. Execute o projeto
```bash
# Desenvolvimento (com Doppler)
npm run dev

# Ou localmente (sem Doppler)
npm run dev:local
```

## 🔧 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Executa com Doppler
npm run dev:local    # Executa localmente
npm run build        # Build de produção
npm run preview      # Preview do build
```

### Testes
```bash
npm run test         # Executa testes
npm run test:watch   # Modo watch
npm run lint         # Linting do código
npm run type-check   # Verificação de tipos
```

### Segurança
```bash
npm run security:clean    # Remove secrets hardcoded
npm run security:verify   # Verifica vazamentos
npm run verify:doppler    # Valida configuração Doppler
```

### Sistema
```bash
npm run system:health     # Health check geral
npm run browser:health    # Testa funcionamento no browser
```

## 🔐 Configuração de Segurança

### Azure AD
1. Configure redirect URIs no Azure Portal
2. Defina scopes de API adequados  
3. Configure MFA obrigatório
4. Estabeleça políticas de acesso condicional

### Supabase
1. Configure RLS (Row Level Security)
2. Defina políticas de acesso por usuário
3. Configure backup automático
4. Monitore logs de acesso

### Doppler
1. Configure projeto e ambientes
2. Segregue secrets por environment
3. Configure rotação automática de chaves
4. Monitore acessos aos secrets

## 📊 Uso do Sistema

### 1. Autenticação
- Acesse a aplicação
- Faça login com credenciais Azure AD
- Complete a autenticação MFA
- Aguarde redirecionamento para dashboard

### 2. Upload de DRE
- Navegue para "Upload"
- Selecione arquivo Excel com dados DRE
- Confirme mapeamento de colunas
- Aguarde processamento e validação

### 3. Análise Financeira
- Acesse "Dashboard Financeiro"
- Configure filtros de período/projeto
- Explore gráficos interativos
- Exporte relatórios personalizados

### 4. Gestão de Profissionais
- Vá para "Gestão de Profissionais"
- Faça upload de dados de colaboradores
- Analise custos e alocações
- Gere relatórios de recursos

## 🏃‍♂️ Deploy e CI/CD

### GitHub Actions
O projeto usa workflows automatizados para:
- ✅ Build e testes automáticos
- 🔍 Análise de segurança
- 🚀 Deploy para ambientes
- 📊 Métricas de qualidade

### Ambientes
- **Development**: Deploy automático na branch `develop`
- **Staging**: Deploy manual para testes
- **Production**: Deploy via release tags

## 🐛 Troubleshooting

### Problemas Comuns

**Erro 401 no Supabase**
```bash
npm run verify:doppler
npm run security:verify
```

**Falha na autenticação Azure**
- Verifique configuração no Azure Portal
- Confirme redirect URIs
- Valide escopos de API

**Build falhando**
```bash
npm run type-check
npm run lint:fix
```

## 📈 Roadmap

### Versão 1.1 (Q2 2024)
- [ ] Integração SAP GUI completa
- [ ] Relatórios PDF automatizados  
- [ ] API REST pública
- [ ] Mobile app (React Native)

### Versão 1.2 (Q3 2024)
- [ ] Machine Learning para projeções
- [ ] Integração Power BI
- [ ] Workflow de aprovações
- [ ] Notificações em tempo real

## 🤝 Contribuição

### Estrutura de Branches
- `main` - Produção
- `develop` - Desenvolvimento
- `feature/*` - Novas funcionalidades
- `hotfix/*` - Correções urgentes

### Padrões de Commit
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação  
style: mudanças de formatação
refactor: refatoração de código
test: adiciona ou corrige testes
```

## 📝 Licença

Este projeto é propriedade da empresa e está sob licença proprietária.

## 👥 Equipe

- **Desenvolvimento**: Equipe HITSS Tech
- **Product Owner**: [Nome do PO]
- **Tech Lead**: [Nome do Tech Lead]
- **DevOps**: [Nome do DevOps]

## 📞 Suporte

Para suporte técnico:
- 📧 Email: suporte.hitss@empresa.com
- 💬 Slack: #hitss-tech-support
- 📋 Issues: [GitLab Issues]

---

⚡ **Powered by**: React + TypeScript + Supabase + Azure AD