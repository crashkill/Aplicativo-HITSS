# 🔗 Integração MCP Supabase - Aplicativo HITSS

Este documento detalha como configurar e usar o **Model Context Protocol (MCP)** do Supabase no projeto Aplicativo HITSS.

## 📋 O que é MCP Supabase?

O MCP (Model Context Protocol) do Supabase permite interação direta com projetos Supabase através de funções específicas, sem necessidade de configurar clients JavaScript tradicionais. É especialmente útil para:

- 🔍 **Desenvolvimento e Debug** - Acesso direto ao banco via protocolo
- 🚀 **Migrations Automáticas** - Aplicação de mudanças de schema
- 📊 **Analytics Avançadas** - Queries complexas em tempo real
- 🔧 **Operações Administrativas** - Gestão completa do projeto

## ⚙️ Configuração

### 1. Projeto HITSS Ativo

**Projeto Supabase Atual:**
- **ID**: `pwksgdjjkryqryqrvyja`
- **Nome**: Profissionais-HITSS
- **Região**: South America (sa-east-1)
- **Status**: ✅ ATIVO
- **Capacidade**: 13.810+ registros DRE processados

### 2. Access Token Configurado

```bash
# Token de acesso já configurado no sistema
SUPABASE_ACCESS_TOKEN="sbp_de3b77b0a605783d7461f64f4ee9cd739582221a"

# Projeto migrado de:
# ❌ App-Financeiro (kxippwliqglukdhatuaa) - INATIVO
# ✅ Profissionais-HITSS (pwksgdjjkryqryqrvyja) - ATIVO
```

### 3. Configurar MCP Server (Opcional)

Se você tem acesso ao servidor MCP do Supabase:

```bash
# Instalar CLI do Supabase
npm install -g @supabase/supabase-js

# Executar servidor MCP
npx @supabase/supabase-js mcp-server --access-token $SUPABASE_ACCESS_TOKEN

# Ou via Docker
docker run -e SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN supabase/mcp-server
```

## 🛠️ Funções MCP Disponíveis

### 📁 Listar Projetos
```typescript
const projetos = await mcp_supabase_list_projects({ 
  random_string: "identificador" 
});

// Retorna:
{
  projects: [
    {
      id: "pwksgdjjkryqryqrvyja",
      name: "Profissionais-HITSS",
      status: "ACTIVE",
      region: "sa-east-1"
    }
  ]
}
```

### 🔍 Detalhes do Projeto
```typescript
const projeto = await mcp_supabase_get_project({ 
  id: "pwksgdjjkryqryqrvyja" 
});

// Retorna informações completas do projeto
{
  id: "pwksgdjjkryqryqrvyja",
  name: "Profissionais-HITSS",
  status: "ACTIVE",
  subscription_tier: "free",
  database: { ... }
}
```

### 📋 Listar Tabelas
```typescript
const tabelas = await mcp_supabase_list_tables({ 
  project_id: "pwksgdjjkryqryqrvyja",
  schemas: ["public", "auth"] // opcional
});

// Retorna:
{
  tables: [
    { name: "colaboradores", schema: "public" },
    { name: "dre_hitss", schema: "public" },
    { name: "users", schema: "auth" }
  ]
}
```

### ⚡ Executar SQL
```typescript
const resultado = await mcp_supabase_execute_sql({
  project_id: "pwksgdjjkryqryqrvyja",
  query: `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN javascript = 'Sim' THEN 1 ELSE 0 END) as js_devs,
      SUM(CASE WHEN disponivel_compartilhamento = true THEN 1 ELSE 0 END) as disponiveis
    FROM colaboradores
  `
});

// Retorna dados da query
{
  data: [
    { total: 97, js_devs: 45, disponiveis: 73 }
  ]
}
```

### 🚀 Aplicar Migration
```typescript
const migration = await mcp_supabase_apply_migration({
  project_id: "pwksgdjjkryqryqrvyja",
  name: "add_skills_index",
  query: `
    -- Criar índice para melhorar performance em buscas por skills
    CREATE INDEX IF NOT EXISTS idx_colaboradores_skills 
    ON colaboradores USING gin((
      ARRAY[javascript, python, java, react, angular, aws, azure]
    ));
    
    -- Adicionar coluna de última atualização se não existir
    ALTER TABLE colaboradores 
    ADD COLUMN IF NOT EXISTS last_skill_update TIMESTAMP DEFAULT NOW();
  `
});
```

### 📊 Logs do Sistema
```typescript
const logs = await mcp_supabase_get_logs({
  project_id: "pwksgdjjkryqryqrvyja",
  service: "api" // ou "postgres", "auth", "storage", etc.
});

// Retorna logs recentes do serviço especificado
```

## 🎯 Casos de Uso Práticos

### 1. Análise de Skills dos Profissionais
```typescript
async function analisarSkills() {
  const query = `
    SELECT 
      javascript,
      COUNT(*) as quantidade,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentual
    FROM colaboradores 
    WHERE javascript IN ('Sim', 'Não')
    GROUP BY javascript
    ORDER BY quantidade DESC;
  `;
  
  const resultado = await mcp_supabase_execute_sql({
    project_id: "pwksgdjjkryqryqrvyja",
    query
  });
  
  return resultado.data;
}
```

### 2. Relatório Financeiro DRE
```typescript
async function relatorioFinanceiro() {
  const query = `
    SELECT 
      periodo,
      tipo,
      SUM(valor) as valor_total,
      COUNT(*) as quantidade_lancamentos
    FROM dre_hitss 
    WHERE periodo LIKE '%/2024'
    GROUP BY periodo, tipo
    ORDER BY periodo DESC, tipo;
  `;
  
  const resultado = await mcp_supabase_execute_sql({
    project_id: "pwksgdjjkryqryqrvyja",
    query
  });
  
  return resultado.data;
}
```

### 3. Otimização de Performance
```typescript
async function otimizarDatabase() {
  const migration = await mcp_supabase_apply_migration({
    project_id: "pwksgdjjkryqryqrvyja",
    name: "performance_optimization",
    query: `
      -- Índices para buscas frequentes na tabela DRE
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dre_periodo_tipo 
      ON dre_hitss(periodo, tipo);
      
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dre_valor_desc 
      ON dre_hitss(valor DESC) 
      WHERE valor > 0;
      
      -- Índices para colaboradores
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_colaboradores_disponibilidade 
      ON colaboradores(disponivel_compartilhamento) 
      WHERE disponivel_compartilhamento = true;
      
      -- Estatísticas atualizadas
      ANALYZE colaboradores;
      ANALYZE dre_hitss;
    `
  });
  
  return migration;
}
```

## 🎮 Demo Interativa MCP

O sistema inclui uma **demonstração interativa** na página de **Gestão de Profissionais** > **Analytics**:

### Como Acessar:
1. Faça login: `admin` / `admin`
2. Navegue para **Gestão de Profissionais**
3. Clique na aba **Analytics**
4. Role até a seção **🔗 MCP Supabase Demo**

### Funcionalidades da Demo:
- ✅ **Listar Projetos**: Mostra todos os projetos Supabase
- ✅ **Detalhes do Projeto**: Informações completas do projeto ativo
- ✅ **Listar Tabelas**: Todas as tabelas do banco de dados
- ✅ **Executar SQL**: Interface para queries personalizadas
- ✅ **Resultados JSON**: Visualização formatada dos resultados
- ✅ **Logs em Tempo Real**: Monitoramento de operações

### Exemplos de Queries na Demo:
```sql
-- Estatísticas de colaboradores
SELECT COUNT(*) FROM colaboradores;

-- Análise por skills
SELECT javascript, COUNT(*) FROM colaboradores GROUP BY javascript;

-- Dados financeiros recentes
SELECT periodo, SUM(valor) FROM dre_hitss GROUP BY periodo ORDER BY periodo DESC LIMIT 5;

-- Performance de índices
SELECT schemaname, tablename, indexname FROM pg_indexes WHERE tablename IN ('colaboradores', 'dre_hitss');
```

## 🔧 Integração no Sistema HITSS

### Arquivos Principais:
```
src/
├── lib/
│   ├── supabaseMCP.ts              # Cliente MCP principal
│   ├── supabaseMCPCollaborators.ts # MCP para colaboradores
│   └── supabaseMCPDemo.ts          # Demo interativa
├── components/
│   └── talent-management/
│       └── SupabaseMCPDemo.tsx     # Interface da demo
└── services/
    └── dreSupabaseService.ts       # Integração com DRE
```

### Configuração de Environment:
```env
# .env
VITE_SUPABASE_URL=https://pwksgdjjkryqryqrvyja.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_ACCESS_TOKEN=sbp_de3b77b0a605783d7461f64f4ee9cd739582221a
```

## ✅ Status de Funcionalidades

### **Funcionando Perfeitamente:**
- ✅ **MCP Demo Interativa**: 100% funcional
- ✅ **Conexão com Projeto**: pwksgdjjkryqryqrvyja ativo
- ✅ **Execução de SQL**: Queries em tempo real
- ✅ **Listagem de Projetos**: API funcionando
- ✅ **Gestão de Tabelas**: Visualização completa
- ✅ **Migrations via MCP**: Sistema integrado

### **Casos de Uso Ativos:**
- ✅ **Sistema DRE**: Upload automático de dados via MCP
- ✅ **Gestão de Profissionais**: Queries otimizadas
- ✅ **Analytics**: Relatórios em tempo real
- ✅ **Monitoramento**: Logs e performance

## 🚨 Troubleshooting

### **Erro de Conexão**
```bash
# Verificar token de acesso
echo $SUPABASE_ACCESS_TOKEN

# Verificar projeto ativo
curl -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
     https://api.supabase.com/v1/projects/pwksgdjjkryqryqrvyja
```

### **Demo MCP Não Carrega**
1. Verifique se está na aba **Analytics** correta
2. Confirme login realizado
3. Verifique console do browser para erros
4. Teste conexão na demo com "Listar Projetos"

### **Queries SQL Falham**
1. Verifique sintaxe SQL na demo
2. Confirme permissões da query
3. Use queries simples primeiro (SELECT COUNT(*))
4. Verifique logs na demo para detalhes do erro

## 🎉 Conclusão

A integração MCP Supabase está **totalmente funcional** e permite:

- 🔧 **Operações Administrativas**: Gestão completa via interface
- 📊 **Analytics em Tempo Real**: Queries personalizadas
- 🚀 **Migrations Automáticas**: Aplicação de mudanças
- 🔍 **Debug Avançado**: Acesso direto ao banco
- 📈 **Monitoramento**: Logs e performance

**Acesse a demo em: Gestão de Profissionais > Analytics > MCP Demo**

**Sistema pronto para uso avançado! 🚀** 