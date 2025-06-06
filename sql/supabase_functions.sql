-- =============================================================================
-- FUNCTIONS DO SUPABASE PARA REGRAS DE NEGÓCIO
-- =============================================================================
-- Este arquivo contém todas as regras de negócio implementadas no Supabase
-- Evita processamento no frontend e centraliza lógica no backend

-- -----------------------------------------------------------------------------
-- 1. DASHBOARD SUMMARY - Resumo financeiro por ano
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 2. DASHBOARD SUMMARY FILTRADO - Por projetos específicos
-- -----------------------------------------------------------------------------
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
      EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY'))::INTEGER as ano_dados,
      projeto,
      natureza,
      conta_resumo,
      valor
    FROM dre_hitss 
    WHERE EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY')) = p_ano
      AND projeto = ANY(p_projetos)
  ),
  receitas AS (
    SELECT 
      SUM(valor) as total_receita
    FROM dados_ano 
    WHERE natureza = 'RECEITA'
  ),
  custos AS (
    SELECT 
      SUM(ABS(valor)) as total_custo
    FROM dados_ano 
    WHERE natureza = 'CUSTO'
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

-- -----------------------------------------------------------------------------
-- 3. PLANILHAS FINANCEIRAS - Dados mensais e acumulados
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_planilhas_financeiras(p_ano INTEGER)
RETURNS TABLE(
  projeto TEXT,
  ano INTEGER,
  mes INTEGER,
  receita_mensal DECIMAL,
  custo_mensal DECIMAL,
  margem_mensal DECIMAL,
  receita_acumulada DECIMAL,
  custo_acumulado DECIMAL,
  margem_acumulada DECIMAL,
  margem_percentual DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH dados_mensais AS (
    SELECT 
      projeto,
      EXTRACT(MONTH FROM TO_DATE(periodo, 'MM/YYYY'))::INTEGER as mes,
      SUM(CASE WHEN natureza = 'RECEITA' THEN valor ELSE 0 END) as receita_mes,
      SUM(CASE WHEN natureza = 'CUSTO' THEN ABS(valor) ELSE 0 END) as custo_mes
    FROM dre_hitss 
    WHERE EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY')) = p_ano
    GROUP BY projeto, EXTRACT(MONTH FROM TO_DATE(periodo, 'MM/YYYY'))
  ),
  dados_acumulados AS (
    SELECT 
      projeto,
      mes,
      receita_mes,
      custo_mes,
      receita_mes - custo_mes as margem_mes,
      SUM(receita_mes) OVER (PARTITION BY projeto ORDER BY mes) as receita_acum,
      SUM(custo_mes) OVER (PARTITION BY projeto ORDER BY mes) as custo_acum
    FROM dados_mensais
  )
  SELECT 
    dm.projeto,
    p_ano,
    dm.mes,
    dm.receita_mes,
    dm.custo_mes,
    dm.margem_mes,
    dm.receita_acum,
    dm.custo_acum,
    dm.receita_acum - dm.custo_acum,
    CASE 
      WHEN dm.receita_acum > 0 
      THEN ((dm.receita_acum - dm.custo_acum) / dm.receita_acum) * 100
      ELSE 0
    END
  FROM dados_acumulados dm
  ORDER BY dm.projeto, dm.mes;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. PLANILHAS FINANCEIRAS FILTRADAS - Por projetos específicos
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_planilhas_financeiras_filtered(p_ano INTEGER, p_projetos TEXT[])
RETURNS TABLE(
  projeto TEXT,
  ano INTEGER,
  mes INTEGER,
  receita_mensal DECIMAL,
  custo_mensal DECIMAL,
  margem_mensal DECIMAL,
  receita_acumulada DECIMAL,
  custo_acumulado DECIMAL,
  margem_acumulada DECIMAL,
  margem_percentual DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH dados_mensais AS (
    SELECT 
      projeto,
      EXTRACT(MONTH FROM TO_DATE(periodo, 'MM/YYYY'))::INTEGER as mes,
      SUM(CASE WHEN natureza = 'RECEITA' THEN valor ELSE 0 END) as receita_mes,
      SUM(CASE WHEN natureza = 'CUSTO' THEN ABS(valor) ELSE 0 END) as custo_mes
    FROM dre_hitss 
    WHERE EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY')) = p_ano
      AND projeto = ANY(p_projetos)
    GROUP BY projeto, EXTRACT(MONTH FROM TO_DATE(periodo, 'MM/YYYY'))
  ),
  dados_acumulados AS (
    SELECT 
      projeto,
      mes,
      receita_mes,
      custo_mes,
      receita_mes - custo_mes as margem_mes,
      SUM(receita_mes) OVER (PARTITION BY projeto ORDER BY mes) as receita_acum,
      SUM(custo_mes) OVER (PARTITION BY projeto ORDER BY mes) as custo_acum
    FROM dados_mensais
  )
  SELECT 
    dm.projeto,
    p_ano,
    dm.mes,
    dm.receita_mes,
    dm.custo_mes,
    dm.margem_mes,
    dm.receita_acum,
    dm.custo_acum,
    dm.receita_acum - dm.custo_acum,
    CASE 
      WHEN dm.receita_acum > 0 
      THEN ((dm.receita_acum - dm.custo_acum) / dm.receita_acum) * 100
      ELSE 0
    END
  FROM dados_acumulados dm
  ORDER BY dm.projeto, dm.mes;
END;
$$;

-- -----------------------------------------------------------------------------
-- 5. FORECAST PROJECTIONS - Projeções baseadas em dados históricos
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_forecast_projections(p_ano INTEGER)
RETURNS TABLE(
  projeto TEXT,
  mes_ano TEXT,
  receita_realizada DECIMAL,
  custo_realizado DECIMAL,
  receita_projetada DECIMAL,
  custo_projetado DECIMAL,
  margem_projetada DECIMAL,
  variacao_percentual DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH dados_historicos AS (
    SELECT 
      projeto,
      TO_CHAR(TO_DATE(periodo, 'MM/YYYY'), 'Mon/YY') as mes_ano_fmt,
      EXTRACT(MONTH FROM TO_DATE(periodo, 'MM/YYYY'))::INTEGER as mes,
      SUM(CASE WHEN natureza = 'RECEITA' THEN valor ELSE 0 END) as receita,
      SUM(CASE WHEN natureza = 'CUSTO' THEN ABS(valor) ELSE 0 END) as custo
    FROM dre_hitss 
    WHERE EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY')) = p_ano
    GROUP BY projeto, periodo, EXTRACT(MONTH FROM TO_DATE(periodo, 'MM/YYYY'))
  ),
  projecoes AS (
    SELECT 
      projeto,
      mes_ano_fmt,
      receita,
      custo,
      -- Projeção: média móvel dos últimos 3 meses válidos
      AVG(receita) OVER (
        PARTITION BY projeto 
        ORDER BY mes 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
      ) as receita_proj,
      AVG(custo) OVER (
        PARTITION BY projeto 
        ORDER BY mes 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
      ) as custo_proj
    FROM dados_historicos
  )
  SELECT 
    p.projeto,
    p.mes_ano_fmt,
    p.receita,
    p.custo,
    p.receita_proj,
    p.custo_proj,
    p.receita_proj - p.custo_proj,
    CASE 
      WHEN p.receita > 0 
      THEN ((p.receita_proj - p.receita) / p.receita) * 100
      ELSE 0
    END
  FROM projecoes p
  ORDER BY p.projeto, p.mes_ano_fmt;
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. FORECAST PROJECTIONS FILTRADAS - Por projetos específicos
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_forecast_projections_filtered(p_ano INTEGER, p_projetos TEXT[])
RETURNS TABLE(
  projeto TEXT,
  mes_ano TEXT,
  receita_realizada DECIMAL,
  custo_realizado DECIMAL,
  receita_projetada DECIMAL,
  custo_projetado DECIMAL,
  margem_projetada DECIMAL,
  variacao_percentual DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH dados_historicos AS (
    SELECT 
      projeto,
      TO_CHAR(TO_DATE(periodo, 'MM/YYYY'), 'Mon/YY') as mes_ano_fmt,
      EXTRACT(MONTH FROM TO_DATE(periodo, 'MM/YYYY'))::INTEGER as mes,
      SUM(CASE WHEN natureza = 'RECEITA' THEN valor ELSE 0 END) as receita,
      SUM(CASE WHEN natureza = 'CUSTO' THEN ABS(valor) ELSE 0 END) as custo
    FROM dre_hitss 
    WHERE EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY')) = p_ano
      AND projeto = ANY(p_projetos)
    GROUP BY projeto, periodo, EXTRACT(MONTH FROM TO_DATE(periodo, 'MM/YYYY'))
  ),
  projecoes AS (
    SELECT 
      projeto,
      mes_ano_fmt,
      receita,
      custo,
      AVG(receita) OVER (
        PARTITION BY projeto 
        ORDER BY mes 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
      ) as receita_proj,
      AVG(custo) OVER (
        PARTITION BY projeto 
        ORDER BY mes 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
      ) as custo_proj
    FROM dados_historicos
  )
  SELECT 
    p.projeto,
    p.mes_ano_fmt,
    p.receita,
    p.custo,
    p.receita_proj,
    p.custo_proj,
    p.receita_proj - p.custo_proj,
    CASE 
      WHEN p.receita > 0 
      THEN ((p.receita_proj - p.receita) / p.receita) * 100
      ELSE 0
    END
  FROM projecoes p
  ORDER BY p.projeto, p.mes_ano_fmt;
END;
$$;

-- -----------------------------------------------------------------------------
-- 7. METADATA PROJETOS - Informações gerais sobre projetos e anos
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 8. ESTATÍSTICAS GERAIS - Para visualização DRE
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 9. UPDATE FORECAST VALUE - Atualizar valores projetados
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_forecast_value(
  p_projeto TEXT,
  p_mes INTEGER,
  p_ano INTEGER,
  p_tipo TEXT,
  p_valor DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  periodo_fmt TEXT;
  conta_resumo_valor TEXT;
  natureza_valor TEXT;
BEGIN
  -- Formatar período
  periodo_fmt := LPAD(p_mes::TEXT, 2, '0') || '/' || p_ano::TEXT;
  
  -- Definir conta e natureza baseado no tipo
  IF p_tipo = 'receita' THEN
    conta_resumo_valor := 'Receita Projetada';
    natureza_valor := 'RECEITA';
  ELSE
    conta_resumo_valor := 'Custo Projetado';
    natureza_valor := 'CUSTO';
    p_valor := -ABS(p_valor); -- Custos são negativos
  END IF;
  
  -- Inserir ou atualizar registro
  INSERT INTO dre_hitss (
    projeto, 
    periodo, 
    conta_resumo, 
    natureza, 
    valor,
    created_at,
    updated_at
  )
  VALUES (
    p_projeto,
    periodo_fmt,
    conta_resumo_valor,
    natureza_valor,
    p_valor,
    NOW(),
    NOW()
  )
  ON CONFLICT (projeto, periodo, conta_resumo) 
  DO UPDATE SET 
    valor = p_valor,
    updated_at = NOW();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- =============================================================================
-- COMENTÁRIOS DE EXECUÇÃO
-- =============================================================================
-- Para executar este arquivo no Supabase:
-- 1. Acesse o painel do Supabase > SQL Editor
-- 2. Cole este conteúdo e execute
-- 3. Verifique se todas as functions foram criadas sem erro
-- 4. Teste uma chamada: SELECT * FROM get_dashboard_summary(2024);
-- ============================================================================= 