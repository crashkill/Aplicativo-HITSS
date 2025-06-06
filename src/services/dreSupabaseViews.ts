// Serviço para Views e Functions do Supabase com regras de negócio
import { supabase } from './supabaseClient'

// Interfaces para dados processados pelo Supabase
export interface DashboardSummary {
  ano: number
  total_receita: number
  total_custo: number
  total_projetos: number
  margem_liquida: number
  margem_percentual: number
}

export interface ProjetoFinanceiro {
  projeto: string
  ano: number
  mes: number
  receita_mensal: number
  custo_mensal: number
  margem_mensal: number
  receita_acumulada: number
  custo_acumulado: number
  margem_acumulada: number
  margem_percentual: number
}

export interface ForecastProjeto {
  projeto: string
  mes_ano: string
  receita_realizada: number
  custo_realizado: number
  receita_projetada: number
  custo_projetado: number
  margem_projetada: number
  variacao_percentual: number
}

export interface MetadadosProjeto {
  total_projetos: number
  projetos_ativos: number
  anos_disponiveis: number[]
  projetos_lista: string[]
}

class DRESupabaseViews {
  
  /**
   * DASHBOARD - Sumário financeiro por ano/projetos
   */
  async getDashboardSummary(ano: number, projetos?: string[]): Promise<DashboardSummary | null> {
    try {
      // CORREÇÃO CRÍTICA: Calcular direto via SQL com filtro relatorio = 'Realizado'
      let sql = `
        WITH dados_ano AS (
          SELECT projeto, natureza, valor
          FROM dre_hitss 
          WHERE EXTRACT(YEAR FROM TO_DATE(periodo, 'MM/YYYY')) = ${ano}
            AND relatorio = 'Realizado'
            ${projetos && projetos.length > 0 ? `AND projeto = ANY(ARRAY[${projetos.map(p => `'${p}'`).join(',')}])` : ''}
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
          ${ano} as ano,
          COALESCE(r.total_receita, 0) as total_receita,
          COALESCE(c.total_custo, 0) as total_custo,
          COALESCE(pc.total_projetos, 0) as total_projetos,
          COALESCE(r.total_receita, 0) - COALESCE(c.total_custo, 0) as margem_liquida,
          CASE 
            WHEN COALESCE(r.total_receita, 0) > 0 
            THEN ((COALESCE(r.total_receita, 0) - COALESCE(c.total_custo, 0)) / COALESCE(r.total_receita, 0)) * 100
            ELSE 0
          END as margem_percentual
        FROM receitas r
        CROSS JOIN custos c
        CROSS JOIN projetos_count pc;
      `
      
      console.log('🔧 Executando SQL CORRIGIDO para dashboard com filtro relatorio = Realizado')
      
      const { data, error } = await supabase
        .from('dre_hitss')
        .select('projeto, natureza, valor')
        .eq('relatorio', 'Realizado')
        .like('periodo', `%/${ano}`)
        
      if (error) {
        console.error('❌ Erro ao buscar dados filtrados:', error)
        return null
      }
      
      // Processar dados manualmente
      const receitaTotal = data
        .filter(r => r.natureza === 'RECEITA')
        .reduce((sum, r) => sum + (r.valor || 0), 0)
        
      const custoTotal = data
        .filter(r => r.natureza === 'CUSTO')
        .reduce((sum, r) => sum + Math.abs(r.valor || 0), 0)
        
      const totalProjetos = new Set(data.map(r => r.projeto)).size
      const margemLiquida = receitaTotal - custoTotal
      const margemPercentual = receitaTotal > 0 ? (margemLiquida / receitaTotal) * 100 : 0
      
      const resultado = {
        ano,
        total_receita: receitaTotal,
        total_custo: custoTotal,
        total_projetos: totalProjetos,
        margem_liquida: margemLiquida,
        margem_percentual: margemPercentual
      }
      
             console.log('✅ Dashboard calculado com FILTRO REALIZADO:', resultado)
       return resultado as DashboardSummary
      
    } catch (error) {
      console.error('❌ Erro fatal ao executar função dashboard:', error)
      return null
    }
  }
  
  /**
   * PLANILHAS FINANCEIRAS - Dados mensais e acumulados
   */
  async getPlanilhasFinanceiras(ano: number, projetos?: string[]): Promise<ProjetoFinanceiro[]> {
    try {
      let query = supabase.rpc('get_planilhas_financeiras', {
        p_ano: ano
      })
      
      if (projetos && projetos.length > 0) {
        query = supabase.rpc('get_planilhas_financeiras_filtered', {
          p_ano: ano,
          p_projetos: projetos
        })
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Erro ao buscar planilhas financeiras:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Erro ao executar função planilhas:', error)
      return []
    }
  }
  
  /**
   * FORECAST - Projeções baseadas em dados históricos
   */
  async getForecastData(ano: number, projetos?: string[]): Promise<ForecastProjeto[]> {
    try {
      let query = supabase.rpc('get_forecast_projections', {
        p_ano: ano
      })
      
      if (projetos && projetos.length > 0) {
        query = supabase.rpc('get_forecast_projections_filtered', {
          p_ano: ano,
          p_projetos: projetos
        })
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Erro ao buscar forecast:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Erro ao executar função forecast:', error)
      return []
    }
  }
  
  /**
   * METADADOS - Projetos e anos disponíveis
   */
  async getMetadados(): Promise<MetadadosProjeto | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_metadata_projetos')
        .single()
      
      if (error) {
        console.error('Erro ao buscar metadados:', error)
        return null
      }
      
      return data as MetadadosProjeto
    } catch (error) {
      console.error('Erro ao executar função metadados:', error)
      return null
    }
  }
  
  /**
   * ATUALIZAR VALOR FORECAST - Salva alterações do usuário
   */
  async updateForecastValue(
    projeto: string, 
    mes: number, 
    ano: number, 
    tipo: 'receita' | 'custo', 
    valor: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('update_forecast_value', {
        p_projeto: projeto,
        p_mes: mes,
        p_ano: ano,
        p_tipo: tipo,
        p_valor: valor
      })
      
      if (error) {
        console.error('Erro ao atualizar forecast:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Erro ao executar função update forecast:', error)
      return false
    }
  }
  
  /**
   * ESTATÍSTICAS GERAIS - Para seção DRE
   */
  async getEstatisticasGerais(): Promise<{
    total_registros: number
    total_receitas: number
    total_despesas: number
    soma_receitas: number
    soma_despesas: number
    saldo_liquido: number
  } | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_estatisticas_gerais')
        .single()
      
      if (error) {
        console.error('Erro ao buscar estatísticas:', error)
        return null
      }
      
      return data as {
        total_registros: number
        total_receitas: number
        total_despesas: number
        soma_receitas: number
        soma_despesas: number
        saldo_liquido: number
      }
    } catch (error) {
      console.error('Erro ao executar função estatísticas:', error)
      return null
    }
  }
}

export const dreSupabaseViews = new DRESupabaseViews() 