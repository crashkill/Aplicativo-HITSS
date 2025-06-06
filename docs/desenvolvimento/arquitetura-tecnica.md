# Arquitetura Técnica

## Visão Geral do Sistema

O App Financeiro HITSS é uma aplicação web desenvolvida para gerenciar e analisar dados financeiros de projetos. Oferece funcionalidades para visualização, análise e projeção de dados financeiros, com foco em receitas, custos e margens de projetos.

## Principais Funcionalidades

### Dashboard
- Visão consolidada dos indicadores financeiros
- Gráficos de receitas, custos e margens
- Filtros por projeto e período
- Indicadores de performance visual

### Planilhas Financeiras
- Visualização detalhada por projeto
- Dados mensais e acumulados
- Cálculo automático de margens
- Exportação de dados

### Gestão de Profissionais
- Controle e análise de custos dos profissionais por tipo (CLT, Subcontratados, Outros)
- Interface para gerenciamento de dados de profissionais
- Análise de custos por categoria

### Forecast
- Projeções financeiras
- Análise de tendências
- Comparativo com dados realizados

### Upload de Dados
- Importação de planilhas Excel
- Validação automática de dados
- Processamento em lote

### Consulta SAP
- Interface para consultas no sistema SAP
- Integração com dados externos

## Stack Tecnológico

### Frontend
- **React 18.3.1**: Biblioteca principal para construção da interface
- **TypeScript 5.7.2**: Tipagem estática
- **Vite**: Build tool e bundler
- **React Bootstrap**: Componentes de interface
- **Material-UI**: Componentes adicionais de interface
- **Chart.js**: Biblioteca para gráficos

### Banco de Dados
- **Supabase (PostgreSQL)**: Banco de dados principal
- **DexieJS (IndexedDB)**: Armazenamento local para cache

### Ferramentas de Desenvolvimento
- **Git**: Controle de versão
- **ESLint**: Linting de código
- **Prettier**: Formatação de código
- **Jest**: Testes unitários

## Requisitos do Sistema

### Hardware
- Processador: 2GHz ou superior
- Memória RAM: 4GB ou superior
- Espaço em Disco: 1GB disponível

### Software
- Navegador moderno (Chrome, Firefox, Edge)
- JavaScript habilitado
- Cookies habilitados

### Desenvolvimento
- Node.js 18.x ou superior
- npm 8.x ou superior
- Git
- VS Code (recomendado)

### Produção
- Servidor web (Nginx/Apache)
- HTTPS configurado
- Navegadores modernos

## Estrutura do Banco de Dados

### Supabase (Produção)
O sistema utiliza PostgreSQL através do Supabase para dados principais:

#### Tabela: dre_hitss
```sql
{
  id: bigint;              -- Identificador único
  data: text;              -- Data no formato M/YYYY
  natureza: text;          -- Tipo da transação
  conta_resumo: text;      -- Categoria da conta
  projeto: text;           -- Nome do projeto
  valor: numeric;          -- Valor da transação
  created_at: timestamp;   -- Data de criação
  updated_at: timestamp;   -- Data da última atualização
}
```

#### Tabela: profissionais_mcp
```sql
{
  id: bigint;              -- Identificador único
  nome: text;              -- Nome do profissional
  cargo: text;             -- Cargo/função
  tipo: text;              -- Tipo (CLT, Subcontratado, Outros)
  custo_mensal: numeric;   -- Custo mensal
  projeto: text;           -- Projeto associado
  status: text;            -- Status ativo/inativo
  created_at: timestamp;   -- Data de criação
  updated_at: timestamp;   -- Data da última atualização
}
```

### IndexedDB (Cache Local)
Utilizado para cache e operações offline através do DexieJS:

#### Tabela: Projetos
```typescript
{
  id: string;           // Identificador único do projeto
  nome: string;         // Nome do projeto
  cliente: string;      // Nome do cliente
  inicio: Date;         // Data de início
  fim: Date;           // Data de término prevista
  status: string;       // Status atual do projeto
  descricao: string;    // Descrição detalhada
  created_at: Date;     // Data de criação
  updated_at: Date;     // Data da última atualização
}
```

#### Tabela: Transacoes
```typescript
{
  id: string;           // Identificador único da transação
  projeto_id: string;   // ID do projeto relacionado
  tipo: string;         // Tipo (Receita, Custo, Desoneração)
  valor: number;        // Valor da transação
  data: Date;          // Data da transação
  descricao: string;    // Descrição da transação
  categoria: string;    // Categoria da transação
  created_at: Date;     // Data de criação
  updated_at: Date;     // Data da última atualização
}
```

### Índices de Performance
- `dre_hitss.data` (para consultas por período)
- `dre_hitss.natureza` (para filtros por tipo)
- `dre_hitss.projeto` (para filtros por projeto)
- `profissionais_mcp.tipo` (para filtros por tipo de profissional)
- `profissionais_mcp.projeto` (para filtros por projeto)

## Operações Principais

### Consultas Comuns
- Busca de transações por projeto
- Filtro por período
- Agregações por tipo de transação
- Cálculos de totais e médias

### Operações de Escrita
- Inserção de novas transações
- Atualização de valores
- Exclusão lógica de registros
- Bulk operations para importação

## Considerações de Performance
- Uso de índices compostos para consultas frequentes
- Paginação de resultados grandes
- Cache de consultas comuns
- Lazy loading de dados relacionados
- Bulk operations para operações em lote

## Migrations e Versionamento
O sistema utiliza migrations para controle de versão do banco de dados:
- Scripts SQL organizados em `/migrations`
- Sistema de execução via CLI (`npm run migrate`)
- Controle de versão automatizado
- Rollback capabilities

## Segurança
- Validação de entrada em todas as operações
- Sanitização de dados
- Uso de queries parametrizadas
- Controle de acesso baseado em contexto de autenticação
- Rate limiting para operações críticas 