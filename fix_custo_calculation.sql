-- ============================================
-- CORREÇÃO DO CÁLCULO DE CUSTO - REGRA ESPECÍFICA
-- ============================================
-- Aplicar filtro relatorio = 'Realizado' em todas as functions

-- REMOVER FUNCTIONS EXISTENTES
DROP FUNCTION IF EXISTS get_dashboard_summary(integer);
DROP FUNCTION IF EXISTS get_dashboard_summary_filtered(integer, text[]);
DROP FUNCTION IF EXISTS get_estatisticas_gerais();

-- 1. DASHBOARD SUMMARY (CORRIGIDO)
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_ano INTEGER)
RETURNS TABLE(
  ano INTEGER,
  total_receita DECIMAL,
  total_custo DECIMAL,
  total_projetos BIGINT,
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
      AND relatorio = 'Realizado'  -- REGRA CRÍTICA: Apenas registros Realizados
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

-- 2. DASHBOARD SUMMARY FILTRADO (CORRIGIDO)
CREATE OR REPLACE FUNCTION get_dashboard_summary_filtered(p_ano INTEGER, p_projetos TEXT[])
RETURNS TABLE(
  ano INTEGER,
  total_receita DECIMAL,
  total_custo DECIMAL,
  total_projetos BIGINT,
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
      AND relatorio = 'Realizado'  -- REGRA CRÍTICA: Apenas registros Realizados
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

-- 3. ESTATÍSTICAS GERAIS (CORRIGIDO)
CREATE OR REPLACE FUNCTION get_estatisticas_gerais()
RETURNS TABLE(
  total_registros BIGINT,
  total_receitas BIGINT,
  total_despesas BIGINT,
  soma_receitas DECIMAL,
  soma_despesas DECIMAL,
  saldo_liquido DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN natureza = 'RECEITA' THEN 1 END),
    COUNT(CASE WHEN natureza = 'CUSTO' THEN 1 END),
    COALESCE(SUM(CASE WHEN natureza = 'RECEITA' THEN valor ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN natureza = 'CUSTO' THEN ABS(valor) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN natureza = 'RECEITA' THEN valor ELSE -ABS(valor) END), 0)
  FROM dre_hitss
  WHERE relatorio = 'Realizado';  -- REGRA CRÍTICA: Apenas registros Realizados
END;
$$;

-- TESTE AS FUNCTIONS
SELECT * FROM get_dashboard_summary(2024);
SELECT * FROM get_estatisticas_gerais(); 