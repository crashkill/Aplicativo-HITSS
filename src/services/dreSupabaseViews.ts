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
      let query = supabase.rpc('get_dashboard_summary', { 
        p_ano: ano 
      })
      
      if (projetos && projetos.length > 0) {
        query = supabase.rpc('get_dashboard_summary_filtered', {
          p_ano: ano,
          p_projetos: projetos
        })
      }
      
      const { data, error } = await query.single()
      
      if (error) {
        console.error('Erro ao buscar sumário dashboard:', error)
        return null
      }
      
      return data as DashboardSummary
    } catch (error) {
      console.error('Erro ao executar função dashboard:', error)
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

  /**
   * Busca os dados agregados para a planilha financeira.
   * @param ano - O ano para filtrar os dados.
   * @param projetos - Uma lista opcional de projetos para filtrar. Se vazia, busca todos.
   * @returns Uma lista de registros da planilha, agregados por projeto e mês.
   */
  async getPlanilhas(ano: number, projetos: string[]): Promise<any[]> { // A tipagem será mais específica no componente
    const { data, error } = await supabase.rpc('get_financial_spreadsheet', {
      p_ano: ano,
      // Se a lista de projetos estiver vazia, passamos NULL para a função SQL buscar todos
      p_projetos: projetos.length > 0 ? projetos : null,
    });

    if (error) {
      console.error('Erro ao chamar get_financial_spreadsheet:', error);
      throw error;
    }

    console.log('Dados recebidos da planilha financeira:', data);
    return data || [];
  }
}

export const dreSupabaseViews = new DRESupabaseViews() 