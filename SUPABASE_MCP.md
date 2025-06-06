# 🔗 Guia Completo: MCP Supabase

Este documento detalha como configurar e usar o **Model Context Protocol (MCP)** do Supabase no projeto Aplicativo HITSS.

## 📋 O que é MCP Supabase?

O MCP (Model Context Protocol) do Supabase permite interação direta com projetos Supabase através de funções específicas, sem necessidade de configurar clients JavaScript tradicionais. É especialmente útil para:

- 🔍 **Desenvolvimento e Debug** - Acesso direto ao banco via protocolo
- 🚀 **Migrations Automáticas** - Aplicação de mudanças de schema
- 📊 **Analytics Avançadas** - Queries complexas em tempo real
- 🔧 **Operações Administrativas** - Gestão completa do projeto

## ⚙️ Configuração

### 1. Obter Token de Acesso

Primeiro, você precisa de um token de acesso Supabase:

```bash
# 1. Acesse https://supabase.com/dashboard
# 2. Vá em Settings > API
# 3. Copie o "service_role" key ou gere um access token
# 4. Configure a variável de ambiente:

export SUPABASE_ACCESS_TOKEN="sb-seu-projeto-token-aqui"
```

### 2. Configurar MCP Server (Opcional)

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
      name: "Aplicativo HITSS",
      status: "ACTIVE",
      region: "us-east-1"
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
  name: "Aplicativo HITSS",
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
    { name: "projetos", schema: "public" },
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

### 2. Otimização de Performance
```typescript
async function otimizarDatabase() {
  const migration = await mcp_supabase_apply_migration({
    project_id: "pwksgdjjkryqryqrvyja",
    name: "performance_optimization",
    query: `
      -- Índices para buscas frequentes
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_colaboradores_email 
      ON colaboradores(email);
      
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_colaboradores_disponibilidade 
      ON colaboradores(disponivel_compartilhamento) 
      WHERE disponivel_compartilhamento = true;
      
      -- Estatísticas atualizadas
      ANALYZE colaboradores;
    `
  });
  
  return migration;
}
```

### 3. Relatório de Disponibilidade
```typescript
async function relatorioDisponibilidade() {
  const query = `
    WITH stats AS (
      SELECT 
        COUNT(*) as total_profissionais,
        COUNT(*) FILTER (WHERE disponivel_compartilhamento = true) as disponiveis,
        COUNT(*) FILTER (WHERE percentual_compartilhamento = '100') as tempo_integral,
        COUNT(*) FILTER (WHERE percentual_compartilhamento = '75') as meio_periodo,
        COUNT(*) FILTER (WHERE local_alocacao = 'São Paulo') as sp,
        COUNT(*) FILTER (WHERE local_alocacao = 'Rio de Janeiro') as rj
      FROM colaboradores
    )
    SELECT 
      *,
      ROUND(disponiveis * 100.0 / total_profissionais, 2) as perc_disponiveis,
      ROUND(tempo_integral * 100.0 / total_profissionais, 2) as perc_integral
    FROM stats;
  `;
  
  return await mcp_supabase_execute_sql({
    project_id: "pwksgdjjkryqryqrvyja",
    query
  });
}
```

## 💡 Demo Interativa no Sistema

O Aplicativo HITSS inclui um **componente de demonstração** que permite testar todas essas funções:

### Localização:
- **Página:** Gestão de Profissionais
- **Aba:** Analytics
- **Componente:** "Demo MCP Supabase"

### Funcionalidades da Demo:
- ✅ **Testes em tempo real** de todas as funções MCP
- 📋 **Histórico de operações** com timestamps
- 🔍 **Visualização JSON** dos resultados
- ⚡ **Execução de queries customizadas**
- 🚀 **Aplicação de migrations de exemplo**

### Uso da Demo:
1. Acesse a página **Gestão de Profissionais**
2. Clique na aba **Analytics**
3. Role até o componente **"Demo MCP Supabase"**
4. Teste as diferentes funções com os botões disponíveis
5. Visualize os resultados em tempo real

## 🔒 Segurança e Boas Práticas

### ⚠️ Cuidados Importantes:
- **NUNCA** commite tokens de acesso no código
- Use variáveis de ambiente para credenciais
- Aplique **rate limiting** em operações pesadas
- Valide **todas as queries** antes da execução
- Monitore **logs de auditoria** regularmente

### 🛡️ Validação de Queries:
```typescript
function validarQuery(query: string): boolean {
  // Prevenir operações perigosas
  const operacoesPerigosas = [
    'DROP TABLE',
    'TRUNCATE',
    'DELETE FROM',
    'ALTER TABLE',
    'DROP INDEX'
  ];
  
  const queryUpper = query.toUpperCase();
  return !operacoesPerigosas.some(op => queryUpper.includes(op));
}
```

## 🚨 Troubleshooting

### Erro: "Unauthorized"
```bash
# Verificar se o token está configurado
echo $SUPABASE_ACCESS_TOKEN

# Reconfigurar se necessário
export SUPABASE_ACCESS_TOKEN="seu-token-aqui"
```

### Erro: "Project not found"
```typescript
// Verificar se o project_id está correto
const projetos = await mcp_supabase_list_projects({ random_string: "test" });
console.log(projetos); // Ver IDs disponíveis
```

### Erro: "Table does not exist"
```typescript
// Listar tabelas disponíveis primeiro
const tabelas = await mcp_supabase_list_tables({ 
  project_id: "seu-project-id" 
});
console.log(tabelas);
```

## 📚 Recursos Adicionais

- 📖 [Documentação oficial Supabase](https://supabase.com/docs)
- 🔗 [MCP Protocol Specification](https://modelcontextprotocol.io/)
- 🛠️ [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- 🎯 [SQL Best Practices](https://supabase.com/docs/guides/database)

---

## 🤝 Contribuindo

Se você encontrar problemas ou quiser melhorar esta documentação:

1. Abra uma issue descrevendo o problema
2. Proponha melhorias via pull request
3. Compartilhe casos de uso interessantes
4. Documente novas funcionalidades MCP descobertas

**💡 Dica:** O MCP Supabase está em constante evolução. Verifique regularmente por novas funcionalidades e melhores práticas! 