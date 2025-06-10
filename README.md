# 🏢 HITSS - Sistema de Gestão Empresarial

> Aplicação web completa para gestão financeira, controle de profissionais e análise de dados empresariais.

## 🚀 Tecnologias Utilizadas

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Styling:** Tailwind CSS + Lucide Icons
- **Charts:** Recharts para visualização de dados
- **State Management:** React Hooks + Context API

## 📋 Funcionalidades

### 🏠 Dashboard
- Visão geral financeira com métricas em tempo real
- Gráficos de receitas, despesas e lucratividade
- Estatísticas de colaboradores e projetos
- Indicadores de performance mensal

### 📊 Planilhas Financeiras
- Upload e processamento de planilhas Excel/CSV
- Análise automática de dados financeiros
- Relatórios detalhados de DRE (Demonstração do Resultado do Exercício)
- Histórico de transações

### 📈 Forecast
- Projeções financeiras baseadas em dados históricos
- Gráficos interativos de tendências
- Cenários otimista, realista e pessimista
- Análise de sazonalidade

### 👥 Gestão de Profissionais
- Cadastro completo de colaboradores
- Controle de cargos, salários e benefícios
- Histórico de alterações
- Relatórios de custos com pessoal

### 📁 Upload de Dados
- Interface drag-and-drop para arquivos
- Validação automática de formatos
- Processamento em lote
- Feedback visual do progresso

### 🔍 Consulta SAP
- Integração com sistemas SAP
- Consultas em tempo real
- Sincronização de dados
- Relatórios customizados

### ⚙️ Configurações
- Gerenciamento de usuários e permissões
- Configurações de backup
- Preferências do sistema
- Logs de auditoria

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/aplicativo-hitss.git
cd aplicativo-hitss
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
VITE_SUPABASE_ACCESS_TOKEN=seu_token_de_acesso
```

### 4. Execute as migrations (primeira vez)
```bash
npm run migrate
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🗄️ Estrutura do Banco de Dados

### Tabela `colaboradores`
- Informações pessoais e profissionais
- Cargos, salários e benefícios
- Histórico de alterações

### Tabela `dre_hitss`
- Dados financeiros mensais
- Receitas, despesas e resultados
- Categorização por centro de custo
- Análise de lucratividade

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
├── pages/              # Páginas da aplicação
├── services/           # Serviços e integrações
├── hooks/              # Custom hooks
├── types/              # Definições TypeScript
├── utils/              # Funções utilitárias
└── styles/             # Estilos globais

migrations/             # Scripts SQL para banco de dados
scripts/               # Scripts de automação
public/               # Arquivos estáticos
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build           # Build para produção
npm run preview         # Preview do build

# Banco de dados
npm run migrate         # Executa migrations
npm run test-db        # Testa conexão com banco

# Utilitários
npm run lint           # Verifica código
npm run type-check     # Verificação de tipos
```

## 🔐 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) configurado
- Validação de entrada em todas as APIs
- Sanitização de dados
- Controle de permissões por usuário

## 🚨 Troubleshooting

### Erro 401 - Invalid API Key
Se você encontrar erros de autenticação:

1. Verifique se as chaves no `.env` estão corretas
2. Confirme se o projeto Supabase está ativo
3. Execute o script de teste: `npm run test-db`
4. Se necessário, regenere as chaves no dashboard do Supabase

### Problemas de Migração
Para problemas com banco de dados:

1. Verifique a conectividade: `npm run test-db`
2. Execute migrations manualmente: `npm run migrate`
3. Verifique logs no console do Supabase

## 📈 Performance

- Lazy loading de componentes
- Otimização de imagens
- Cache de dados com React Query
- Bundle splitting automático
- Compressão de assets

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Email: suporte@hitss.com
- Issues: [GitHub Issues](https://github.com/seu-usuario/aplicativo-hitss/issues)
- Documentação: [Wiki do Projeto](https://github.com/seu-usuario/aplicativo-hitss/wiki)

---

**Desenvolvido com ❤️ pela equipe HITSS**

---

## 🎯 Aplicativo HITSS - Sistema Consolidado

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
VITE_SUPABASE_URL=https://[SEU_PROJETO_ID].supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# MCP (para migrations)
SUPABASE_ACCESS_TOKEN=[SEU_SUPABASE_ACCESS_TOKEN]
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

## 📊 Regras de Negócio Importantes

### Cálculo de Margem em Planilhas Financeiras

**⚠️ REGRA CRÍTICA**: Não dividir margem por 100 antes de `formatPercent`

- A função `formatPercent` já divide por 100 internamente
- A margem deve ser passada diretamente (ex: 11.9 para 11.9%)
- **Erro comum**: `formatPercent(margem / 100)` → resulta em 0,1% ao invés de 11,9%
- **Correto**: `formatPercent(margem)` → exibe 11,9% corretamente

**Fórmula da Margem**:
```typescript
const custoAjustado = Math.abs(custo) - desoneracao;
const margem = receita > 0 ? (1 - (custoAjustado / receita)) * 100 : 0;
```

**Propagação de Dados**: Se `receita === 0` e `mês > 1`, copiar valores do último mês com dados.

### Histórico de Correções Críticas

**2025-01-16**: 
- ✅ **Correção Dashboard**: Custos negativos sendo somados como positivos (SQL `ABS()` aplicado incorretamente)
- ✅ **Correção Planilhas**: Margem exibindo 0,1% ao invés de 11,9% (divisão dupla por 100)
- ✅ **Alinhamento**: Comportamento idêntico ao app-financeiro de referência

---

## 🔗 Links Úteis

- 🌐 **Aplicação Local**: http://localhost:3001
- 🚀 **GitHub Pages**: `https://<seu-usuario>.github.io/Aplicativo-HITSS/`
- 🗄️ **Supabase Dashboard**: [Projeto HITSS](https://supabase.com/dashboard/project/[SEU_PROJETO_ID])
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
- ✅ **Supabase**: Projeto migrado para `[SEU_PROJETO_ID]`
- ✅ **APIs**: Integração completa funcionando

---

**🎯 Sistema HITSS - Transformando gestão em resultados!**

**Documentação completa disponível em:** [docs/README.md](./docs/README.md)

---

## Adicionar documentação sobre como executar o projeto em ambiente de desenvolvimento e produção.
- Detalhar as variáveis de ambiente necessárias no arquivo `.env`.

**Contribuindo**

---

## Histórico de Decisões e Soluções

Esta seção documenta decisões de arquitetura e soluções para problemas específicos encontrados durante o desenvolvimento, servindo como um guia para futuras manutenções.

### Correção do Cálculo de Custo e Receita no Dashboard (Outubro de 2023)

- **Problema:** O dashboard principal exibia um valor de "Custo Total" incorreto, muitas vezes maior que a "Receita Total". A investigação inicial mostrou que os cálculos estavam sendo feitos de forma genérica, sem aplicar as regras de negócio específicas da empresa.

- **Investigação:**
    1.  A primeira hipótese foi a falta de um filtro `relatorio = 'Realizado'`, mas isso se provou incorreto.
    2.  A análise de uma aplicação de referência (`app-financeiro`) revelou a lógica correta de cálculo, que era processada no frontend.
    3.  A lógica correta não estava replicada no backend (Supabase), onde as funções SQL simplesmente somavam todos os valores de `natureza = 'CUSTO'` e `natureza = 'RECEITA'`. O erro principal era que alguns custos eram registrados como positivos, e a função `ABS()` era aplicada a cada linha *antes* da soma, inflando o total.

- **Solução Implementada:**
    1.  **Centralização no Backend:** A lógica de negócio para cálculo de receita e custo foi movida do frontend para as funções SQL no Supabase, garantindo uma única fonte da verdade.
    2.  **Novas Regras de Negócio no SQL:** As funções `get_dashboard_summary` e `get_dashboard_summary_filtered` foram reescritas para aplicar filtros específicos no campo `conta_resumo`:
        - **Receita Total:** Passou a ser a soma de `valor` onde a `conta_resumo` é `'RECEITA DEVENGADA'` ou `'DESONERAÇÃO DA FOLHA'`.
        - **Custo Total:** Passou a ser a soma de `valor` onde a `conta_resumo` contém as palavras `'CLT'`, `'SUBCONTRATADOS'` ou `'OUTROS'`. A busca é feita com `ILIKE` para ser insensível a maiúsculas/minúsculas.
    3.  **Cálculo da Margem:** A soma dos custos é feita com seus valores originais (negativos). A função `ABS()` é aplicada apenas no `total_custo` final que é retornado, para fins de exibição. A margem é calculada corretamente somando a receita com o custo (negativo).
    4.  **Ajustes no Frontend:** O código do `Dashboard.tsx` foi limpo, removendo lógicas de cálculo duplicadas e corrigindo o caminho de importação do `supabaseClient` para `src/services/supabaseClient.ts`.

- **Como Executar a Correção:** O arquivo `EXECUTE_FUNCTIONS_DIRECT.sql` contém o script final que deve ser executado diretamente no Editor SQL do Supabase para atualizar as funções.

---

## 📊 Regras de Negócio Importantes

### Cálculo de Margem em Planilhas Financeiras

**⚠️ REGRA CRÍTICA**: Não dividir margem por 100 antes de `formatPercent`

- A função `formatPercent` já divide por 100 internamente
- A margem deve ser passada diretamente (ex: 11.9 para 11.9%)
- **Erro comum**: `formatPercent(margem / 100)` → resulta em 0,1% ao invés de 11,9%
- **Correto**: `formatPercent(margem)` → exibe 11,9% corretamente

**Fórmula da Margem**:
```typescript
const custoAjustado = Math.abs(custo) - desoneracao;
const margem = receita > 0 ? (1 - (custoAjustado / receita)) * 100 : 0;
```

**Propagação de Dados**: Se `receita === 0` e `mês > 1`, copiar valores do último mês com dados.

### Histórico de Correções Críticas

**2025-01-16**: 
- ✅ **Correção Dashboard**: Custos negativos sendo somados como positivos (SQL `ABS()` aplicado incorretamente)
- ✅ **Correção Planilhas**: Margem exibindo 0,1% ao invés de 11,9% (divisão dupla por 100)
- ✅ **Alinhamento**: Comportamento idêntico ao app-financeiro de referência

---

## 📊 Deploy e Produção
