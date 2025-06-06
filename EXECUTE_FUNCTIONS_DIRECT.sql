-- ============================================
-- EXECUTE ESTE SCRIPT DIRETAMENTE NO SUPABASE
-- ============================================
-- Acesse: https://supabase.com/dashboard/project/pwksgdjjkryqryqrvyja/sql
-- Cole este código no SQL Editor e execute

-- ============================================
-- PRIMEIRO: REMOVER FUNCTIONS EXISTENTES
-- ============================================
DROP FUNCTION IF EXISTS get_dashboard_summary(integer);
DROP FUNCTION IF EXISTS get_dashboard_summary_filtered(integer, text[]);
DROP FUNCTION IF EXISTS get_metadata_projetos();
DROP FUNCTION IF EXISTS get_estatisticas_gerais();

-- ============================================
-- SEGUNDO: RECRIAR COM TIPOS CORRETOS
-- ============================================

-- 1. FUNCTION: Dashboard Summary (por ano, com regras de negócio)
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
  WITH dados_base AS (
    SELECT 
      projeto,
      natureza,
      conta_resumo,
      valor
    FROM dre_hitss 
    WHERE EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY')) = p_ano
  ),
  receitas AS (
    SELECT SUM(valor) as total_receita
    FROM dados_base 
    WHERE 
      (natureza = 'RECEITA' AND conta_resumo = 'RECEITA DEVENGADA')
      OR
      (conta_resumo = 'DESONERAÇÃO DA FOLHA')
  ),
  custos AS (
    SELECT SUM(valor) as total_custo
    FROM dados_base 
    WHERE natureza = 'CUSTO' 
      AND (
        conta_resumo ILIKE '%CLT%' OR
        conta_resumo ILIKE '%SUBCONTRATADOS%' OR
        conta_resumo ILIKE '%OUTROS%'
      )
  ),
  projetos_count AS (
    SELECT COUNT(DISTINCT projeto) as total_projetos
    FROM dados_base
  )
  SELECT 
    p_ano,
    COALESCE(r.total_receita, 0),
    ABS(COALESCE(c.total_custo, 0)), -- Custo como valor positivo
    COALESCE(pc.total_projetos, 0),
    COALESCE(r.total_receita, 0) + COALESCE(c.total_custo, 0), -- Margem (receita + custo negativo)
    CASE 
      WHEN COALESCE(r.total_receita, 0) > 0 
      THEN ((COALESCE(r.total_receita, 0) + COALESCE(c.total_custo, 0)) / COALESCE(r.total_receita, 0)) * 100
      ELSE 0
    END
  FROM receitas r
  CROSS JOIN custos c
  CROSS JOIN projetos_count pc;
END;
$$;

-- 2. FUNCTION: Dashboard Summary Filtrado (por projetos, com regras de negócio)
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
  WITH dados_base AS (
    SELECT 
      projeto,
      natureza,
      conta_resumo,
      valor
    FROM dre_hitss 
    WHERE EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY')) = p_ano
      AND projeto = ANY(p_projetos)
  ),
  receitas AS (
    SELECT SUM(valor) as total_receita
    FROM dados_base 
    WHERE 
      (natureza = 'RECEITA' AND conta_resumo = 'RECEITA DEVENGADA')
      OR
      (conta_resumo = 'DESONERAÇÃO DA FOLHA')
  ),
  custos AS (
    SELECT SUM(valor) as total_custo
    FROM dados_base 
    WHERE natureza = 'CUSTO'
      AND (
        conta_resumo ILIKE '%CLT%' OR
        conta_resumo ILIKE '%SUBCONTRATADOS%' OR
        conta_resumo ILIKE '%OUTROS%'
      )
  ),
  projetos_count AS (
    SELECT COUNT(DISTINCT projeto) as total_projetos
    FROM dados_base
  )
  SELECT 
    p_ano,
    COALESCE(r.total_receita, 0),
    ABS(COALESCE(c.total_custo, 0)), -- Custo como valor positivo
    COALESCE(pc.total_projetos, 0),
    COALESCE(r.total_receita, 0) + COALESCE(c.total_custo, 0), -- Margem (receita + custo negativo)
    CASE 
      WHEN COALESCE(r.total_receita, 0) > 0 
      THEN ((COALESCE(r.total_receita, 0) + COALESCE(c.total_custo, 0)) / COALESCE(r.total_receita, 0)) * 100
      ELSE 0
    END
  FROM receitas r
  CROSS JOIN custos c
  CROSS JOIN projetos_count pc;
END;
$$;

-- 3. FUNCTION: Metadata Projetos
CREATE OR REPLACE FUNCTION get_metadata_projetos()
RETURNS TABLE(
  total_projetos BIGINT,
  projetos_ativos BIGINT,
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

-- 4. FUNCTION: Estatísticas Gerais
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
    ABS(COALESCE(SUM(CASE WHEN natureza = 'CUSTO' THEN valor ELSE 0 END), 0)),
    COALESCE(SUM(valor), 0)
  FROM dre_hitss;
END;
$$;

-- ============================================
-- TESTE AS FUNCTIONS APÓS EXECUTAR:
-- ============================================

-- Teste 1: Dashboard 2024
-- SELECT * FROM get_dashboard_summary(2024);

-- Teste 2: Metadata
-- SELECT * FROM get_metadata_projetos();

-- Teste 3: Estatísticas Gerais
-- SELECT * FROM get_estatisticas_gerais(); 