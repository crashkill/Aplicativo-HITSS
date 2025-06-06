import { supabase } from './supabaseClient'

// Interface para os dados da DRE
export interface DRERecord {
  id?: number
  upload_batch_id: string
  file_name: string
  uploaded_at?: string
  tipo: 'receita' | 'despesa'
  natureza: 'RECEITA' | 'CUSTO'
  descricao: string
  valor: number
  data: string
  categoria: string
  observacao?: string
  lancamento: number
  projeto?: string
  periodo: string // Formato: "M/YYYY"
  denominacao_conta?: string
  conta_resumo?: string
  linha_negocio?: string
  relatorio?: string
  raw_data?: any // Dados brutos do Excel para referência
}

// Interface para o resultado da importação
export interface ImportResult {
  success: boolean
  count: number
  batchId: string
  errors?: string[]
}

export class DRESupabaseService {
  private tableName = 'dre_hitss'

  /**
   * Verifica se a tabela DRE-HITSS existe e executa migrations se necessário
   */
  async createTableIfNotExists(): Promise<boolean> {
    try {
      // Primeiro, tentar verificar se a tabela existe
      const { data, error } = await supabase
        .from(this.tableName)
        .select('count')
        .limit(1)

      if (error && error.code === '42P01') {
        // Tabela não existe, executar migrations
        console.log('🔄 Tabela DRE-HITSS não encontrada. Executando migrations...')
        
        const { migrationService } = await import('./migrationService')
        const migrationResult = await migrationService.runMigrations()
        
        if (migrationResult.success) {
          console.log('✅ Migrations executadas com sucesso!')
          console.log('📋 Migrations aplicadas:', migrationResult.executed)
          return true
        } else {
          console.error('❌ Falha na execução de migrations:', migrationResult.failed)
          return false
        }
      }

      if (!error) {
        console.log('✅ Tabela DRE-HITSS já existe e está acessível!')
        return true
      }

      console.error('Erro inesperado ao verificar tabela:', error)
      return false
    } catch (error) {
      console.error('Erro ao verificar/criar tabela:', error)
      return false
    }
  }

  /**
   * Limpa todos os dados da tabela DRE-HITSS
   */
  async clearTable(): Promise<boolean> {
    try {
      // Primeiro verificar se existem dados
      const { count, error: countError } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Erro ao verificar tabela:', countError)
        return false
      }

      if (count === 0) {
        console.log('📊 Tabela DRE-HITSS já está vazia, nada para limpar.')
        return true
      }

      console.log(`🧹 Limpando ${count} registros da tabela DRE-HITSS...`)
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .neq('id', 0) // Deleta todos os registros

      if (error) {
        console.error('Erro ao limpar tabela:', error)
        return false
      }

      console.log('✅ Tabela DRE-HITSS limpa com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao limpar tabela:', error)
      return false
    }
  }

  /**
   * Converte dados do Excel para o formato da DRE
   */
  private processExcelData(dados: any[], fileName: string, batchId: string): DRERecord[] {
    console.log('Processando dados do Excel:', dados.length, 'registros')
    
    // Filtrar apenas os registros "Realizado"
    const dadosFiltrados = dados.filter(item => {
      const isRealizado = item.Relatorio === 'Realizado'
      const temLancamento = item.Lancamento !== null && item.Lancamento !== undefined && item.Lancamento !== ''
      return isRealizado && temLancamento
    })

    console.log('Registros filtrados (Realizado):', dadosFiltrados.length)

    return dadosFiltrados.map(item => {
      // Garantir que a natureza seja RECEITA ou CUSTO
      const natureza = String(item.Natureza || '').toUpperCase() === 'RECEITA' ? 'RECEITA' : 'CUSTO'

      // Converter o valor do lançamento para número
      const valorFinal = this.converterParaNumero(item.Lancamento)

      // Normalizar contaResumo
      let contaResumo = String(item.ContaResumo || '').toUpperCase().trim()
      
      // Verificar se é receita devengada
      if (contaResumo.includes('RECEITA') && contaResumo.includes('DEVENGADA')) {
        contaResumo = 'RECEITA DEVENGADA'
      }
      // Verificar se é desoneração da folha
      else if (contaResumo.includes('DESONERAÇÃO') || contaResumo.includes('DESONERACAO')) {
        contaResumo = 'DESONERAÇÃO DA FOLHA'
      }
      // Mapear variações conhecidas
      else if (contaResumo.includes('CLT')) {
        contaResumo = 'CLT'
      } else if (contaResumo.includes('SUBCONTRATADO') || contaResumo.includes('SUB-CONTRATADO')) {
        contaResumo = 'SUBCONTRATADOS'
      } else if (contaResumo !== 'OUTROS') {
        contaResumo = 'OUTROS'
      }

      const record: DRERecord = {
        upload_batch_id: batchId,
        file_name: fileName,
        tipo: natureza === 'RECEITA' ? 'receita' : 'despesa',
        natureza,
        descricao: String(item.Projeto || ''),
        valor: valorFinal,
        data: item.Periodo || new Date().toISOString().split('T')[0],
        categoria: String(item.LinhaNegocio || 'Outros'),
        lancamento: valorFinal,
        periodo: String(item.Periodo || ''),
        denominacao_conta: String(item.DenominacaoConta || ''),
        conta_resumo: contaResumo,
        linha_negocio: String(item.LinhaNegocio || ''),
        relatorio: String(item.Relatorio || ''),
        projeto: String(item.Projeto || ''),
        raw_data: item // Manter dados brutos para referência
      }

      return record
    })
  }

  /**
   * Função auxiliar para converter valor para número
   */
  private converterParaNumero(valor: any): number {
    if (typeof valor === 'number') return valor
    if (!valor) return 0

    // Converter para string e limpar
    let str = String(valor)
      .replace(/[^\d,.-]/g, '') // Remove tudo exceto números, vírgula, ponto e hífen
      .trim()

    // Trata formato brasileiro (ex: 1.234,56)
    if (str.includes(',')) {
      // Se tem vírgula, assume formato BR
      str = str.replace(/\./g, '').replace(',', '.')
    }

    const num = parseFloat(str)
    return isNaN(num) ? 0 : num
  }

  /**
   * Importa dados do Excel para o Supabase
   */
  async importExcelData(dados: any[], fileName: string): Promise<ImportResult> {
    try {
      // Gerar ID único para este batch de upload
      const batchId = crypto.randomUUID()
      
      console.log(`Iniciando importação - Batch ID: ${batchId}`)

      // Processar dados do Excel
      const records = this.processExcelData(dados, fileName, batchId)

      if (records.length === 0) {
        return {
          success: false,
          count: 0,
          batchId,
          errors: ['Nenhum registro válido encontrado no arquivo']
        }
      }

      // Limpar tabela antes de importar novos dados
      const clearSuccess = await this.clearTable()
      if (!clearSuccess) {
        return {
          success: false,
          count: 0,
          batchId,
          errors: ['Erro ao limpar dados anteriores']
        }
      }

      // Inserir dados em lotes para evitar timeouts
      const BATCH_SIZE = 500
      const errors: string[] = []
      let totalInserted = 0

      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE)
        
        const { data, error } = await supabase
          .from(this.tableName)
          .insert(batch)

        if (error) {
          console.error(`Erro no lote ${Math.floor(i / BATCH_SIZE) + 1}:`, error)
          errors.push(`Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`)
        } else {
          totalInserted += batch.length
          console.log(`Lote ${Math.floor(i / BATCH_SIZE) + 1} inserido: ${batch.length} registros`)
        }
      }

      return {
        success: errors.length === 0,
        count: totalInserted,
        batchId,
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      console.error('Erro na importação:', error)
      return {
        success: false,
        count: 0,
        batchId: '',
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      }
    }
  }

  /**
   * Busca todos os registros da DRE
   */
  async getAllRecords(): Promise<DRERecord[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar registros:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar registros:', error)
      return []
    }
  }

  /**
   * Busca estatísticas dos dados
   */
  async getStatistics() {
    try {
      // Total de registros
      const { count: totalRecords } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })

      // Receitas
      const { count: totalReceitas } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('tipo', 'receita')

      // Despesas
      const { count: totalDespesas } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('tipo', 'despesa')

      // Soma de valores usando query personalizada
      const { data: somaReceitas } = await supabase
        .from(this.tableName)
        .select('valor')
        .eq('tipo', 'receita')

      const { data: somaDespesas } = await supabase
        .from(this.tableName)
        .select('valor')
        .eq('tipo', 'despesa')

      // Calcular soma manualmente
      const somaReceitasCalculada = somaReceitas?.reduce((sum, item) => sum + (item.valor || 0), 0) || 0
      const somaDespesasCalculada = somaDespesas?.reduce((sum, item) => sum + (item.valor || 0), 0) || 0

      return {
        totalRecords: totalRecords || 0,
        totalReceitas: totalReceitas || 0,
        totalDespesas: totalDespesas || 0,
        somaReceitas: somaReceitasCalculada,
        somaDespesas: somaDespesasCalculada,
        saldoLiquido: somaReceitasCalculada - somaDespesasCalculada
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return {
        totalRecords: 0,
        totalReceitas: 0,
        totalDespesas: 0,
        somaReceitas: 0,
        somaDespesas: 0,
        saldoLiquido: 0
      }
    }
  }

  /**
   * Busca dados por período
   */
  async getRecordsByPeriod(periodo: string): Promise<DRERecord[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('periodo', periodo)
        .order('valor', { ascending: false })

      if (error) {
        console.error('Erro ao buscar por período:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar por período:', error)
      return []
    }
  }

  /**
   * Busca dados por projeto
   */
  async getRecordsByProject(projeto: string): Promise<DRERecord[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('projeto', projeto)
        .order('valor', { ascending: false })

      if (error) {
        console.error('Erro ao buscar por projeto:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar por projeto:', error)
      return []
    }
  }
}

// Instância singleton do serviço
export const dreSupabaseService = new DRESupabaseService() 