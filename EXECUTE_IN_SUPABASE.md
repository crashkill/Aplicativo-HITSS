# 🗄️ **EXECUÇÃO DE FUNCTIONS NO SUPABASE**

## 📋 **INSTRUÇÕES DE CONFIGURAÇÃO**

### **1. Acessar o Supabase SQL Editor**
1. Entre no painel do Supabase
2. Vá em **SQL Editor**
3. Crie uma nova query

### **2. Executar as Functions (Cole e Execute)**

```sql
-- =============================================================================
-- FUNCTIONS DO SUPABASE PARA REGRAS DE NEGÓCIO
-- =============================================================================

-- 1. DASHBOARD SUMMARY - Resumo financeiro por ano
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_ano INTEGER)
RETURNS TABLE(
  ano INTEGER,
  total_receita DECIMAL,
  total_custo DECIMAL,
  total_projetos INTEGER,
  margem_liquida DECIMAL,
  margem_percentual DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH dados_ano AS (
    SELECT 
      projeto,
      natureza,
      valor
    FROM dre_hitss 
    WHERE EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY')) = p_ano
  ),
  receitas AS (
    SELECT SUM(valor) as total_receita
    FROM dados_ano WHERE natureza = 'RECEITA'
  ),
  custos AS (
    SELECT SUM(ABS(valor)) as total_custo
    FROM dados_ano WHERE natureza = 'CUSTO'
  ),
  projetos_count AS (
    SELECT COUNT(DISTINCT projeto) as total_projetos
    FROM dados_ano
  )
  SELECT 
    p_ano,
    COALESCE(r.total_receita, 0),
    COALESCE(c.total_custo, 0),
    COALESCE(pc.total_projetos, 0),
    COALESCE(r.total_receita, 0) - COALESCE(c.total_custo, 0),
    CASE 
      WHEN COALESCE(r.total_receita, 0) > 0 
      THEN ((COALESCE(r.total_receita, 0) - COALESCE(c.total_custo, 0)) / COALESCE(r.total_receita, 0)) * 100
      ELSE 0
    END
  FROM receitas r
  CROSS JOIN custos c
  CROSS JOIN projetos_count pc;
END;
$$;

-- 2. DASHBOARD SUMMARY FILTRADO - Por projetos específicos
CREATE OR REPLACE FUNCTION get_dashboard_summary_filtered(p_ano INTEGER, p_projetos TEXT[])
RETURNS TABLE(
  ano INTEGER,
  total_receita DECIMAL,
  total_custo DECIMAL,
  total_projetos INTEGER,
  margem_liquida DECIMAL,
  margem_percentual DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH dados_ano AS (
    SELECT 
      projeto,
      natureza,
      valor
    FROM dre_hitss 
    WHERE EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY')) = p_ano
      AND projeto = ANY(p_projetos)
  ),
  receitas AS (
    SELECT SUM(valor) as total_receita
    FROM dados_ano WHERE natureza = 'RECEITA'
  ),
  custos AS (
    SELECT SUM(ABS(valor)) as total_custo
    FROM dados_ano WHERE natureza = 'CUSTO'
  ),
  projetos_count AS (
    SELECT COUNT(DISTINCT projeto) as total_projetos
    FROM dados_ano
  )
  SELECT 
    p_ano,
    COALESCE(r.total_receita, 0),
    COALESCE(c.total_custo, 0),
    COALESCE(pc.total_projetos, 0),
    COALESCE(r.total_receita, 0) - COALESCE(c.total_custo, 0),
    CASE 
      WHEN COALESCE(r.total_receita, 0) > 0 
      THEN ((COALESCE(r.total_receita, 0) - COALESCE(c.total_custo, 0)) / COALESCE(r.total_receita, 0)) * 100
      ELSE 0
    END
  FROM receitas r
  CROSS JOIN custos c
  CROSS JOIN projetos_count pc;
END;
$$;

-- 3. METADATA PROJETOS - Informações gerais
CREATE OR REPLACE FUNCTION get_metadata_projetos()
RETURNS TABLE(
  total_projetos INTEGER,
  projetos_ativos INTEGER,
  anos_disponiveis INTEGER[],
  projetos_lista TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(DISTINCT projeto) as total_proj,
      COUNT(DISTINCT projeto) as ativos_proj,
      ARRAY_AGG(DISTINCT EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY'))::INTEGER ORDER BY EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY'))::INTEGER DESC) as anos,
      ARRAY_AGG(DISTINCT projeto ORDER BY projeto) as projetos
    FROM dre_hitss
    WHERE projeto IS NOT NULL AND projeto != ''
  )
  SELECT 
    s.total_proj,
    s.ativos_proj,
    s.anos,
    s.projetos
  FROM stats s;
END;
$$;

-- 4. ESTATÍSTICAS GERAIS
CREATE OR REPLACE FUNCTION get_estatisticas_gerais()
RETURNS TABLE(
  total_registros INTEGER,
  total_receitas INTEGER,
  total_despesas INTEGER,
  soma_receitas DECIMAL,
  soma_despesas DECIMAL,
  saldo_liquido DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN natureza = 'RECEITA' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN natureza = 'CUSTO' THEN 1 END)::INTEGER,
    COALESCE(SUM(CASE WHEN natureza = 'RECEITA' THEN valor ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN natureza = 'CUSTO' THEN ABS(valor) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN natureza = 'RECEITA' THEN valor ELSE -ABS(valor) END), 0)
  FROM dre_hitss;
END;
$$;
```

### **3. Testar as Functions**

Após executar as functions, teste:

```sql
-- Teste 1: Dashboard para 2024
SELECT * FROM get_dashboard_summary(2024);

-- Teste 2: Metadados
SELECT * FROM get_metadata_projetos();

-- Teste 3: Estatísticas
SELECT * FROM get_estatisticas_gerais();
```

### **4. Verificar Resultados**

✅ **Esperado:**
- Dashboard deve retornar receitas, custos e margens calculadas
- Metadados deve retornar lista de projetos e anos
- Estatísticas deve retornar contadores gerais

## 🎯 **RESULTADO ESPERADO**

Com essas functions, o Dashboard vai:

1. **Buscar dados processados** diretamente do Supabase
2. **Eliminar cálculos** no frontend
3. **Garantir consistência** entre local e produção
4. **Centralizar regras de negócio** no backend

## 🚀 **PRÓXIMOS PASSOS**

Após executar no Supabase:
1. Teste o aplicativo local
2. Verify o console (deve mostrar dados carregados)
3. Deploy para produção
4. Confirme que todos os ambientes exibem os mesmos valores

---

> **⚠️ IMPORTANTE:** Execute todas as functions de uma vez no SQL Editor do Supabase! 