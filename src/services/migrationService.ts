import { supabase } from './supabaseClient';

interface Migration {
  id: string;
  name: string;
  description: string;
  sql: string;
  executedAt?: string;
}

export class MigrationService {
  private static instance: MigrationService;
  private projectId: string;

  private constructor() {
    this.projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'pwksgdjjkryqryqrvyja'; // ID do projeto ativo
  }

  static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  /**
   * Criar tabela de controle de migrations se não existir
   */
  async initializeMigrationTable(): Promise<boolean> {
    try {
      const createMigrationTableSQL = `
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id SERIAL PRIMARY KEY,
          migration_id VARCHAR(255) UNIQUE NOT NULL,
          migration_name TEXT NOT NULL,
          description TEXT,
          executed_at TIMESTAMP DEFAULT NOW(),
          checksum TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Índice para performance
        CREATE INDEX IF NOT EXISTS idx_schema_migrations_id ON schema_migrations(migration_id);
        
        -- Comentário da tabela
        COMMENT ON TABLE schema_migrations IS 'Controle de migrations executadas no banco de dados';
      `;

      const response = await fetch(`https://api.supabase.com/v1/projects/${this.projectId}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: createMigrationTableSQL })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Erro ao criar tabela de migrations:', error);
        return false;
      }

      console.log('✅ Tabela schema_migrations inicializada com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar tabela de migrations:', error);
      return false;
    }
  }

  /**
   * Verificar quais migrations já foram executadas
   */
  async getExecutedMigrations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('schema_migrations')
        .select('migration_id')
        .order('executed_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar migrations executadas:', error);
        return [];
      }

      return data?.map(row => row.migration_id) || [];
    } catch (error) {
      console.error('❌ Erro ao buscar migrations executadas:', error);
      return [];
    }
  }

  /**
   * Executar uma migration específica
   */
  async executeMigration(migration: Migration): Promise<boolean> {
    try {
      console.log(`🚀 Executando migration: ${migration.id} - ${migration.name}`);

      // Executar SQL da migration
      const response = await fetch(`https://api.supabase.com/v1/projects/${this.projectId}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: migration.sql })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`❌ Erro ao executar migration ${migration.id}:`, error);
        return false;
      }

      // Registrar migration como executada
      const { error: insertError } = await supabase
        .from('schema_migrations')
        .insert([{
          migration_id: migration.id,
          migration_name: migration.name,
          description: migration.description,
          checksum: this.generateChecksum(migration.sql)
        }]);

      if (insertError) {
        console.error(`❌ Erro ao registrar migration ${migration.id}:`, insertError);
        return false;
      }

      console.log(`✅ Migration ${migration.id} executada com sucesso!`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao executar migration ${migration.id}:`, error);
      return false;
    }
  }

  /**
   * Executar todas as migrations pendentes
   */
  async runMigrations(): Promise<{ success: boolean; executed: string[]; failed: string[] }> {
    console.log('🔄 Iniciando execução de migrations...');
    
    const result = {
      success: true,
      executed: [] as string[],
      failed: [] as string[]
    };

    try {
      // Inicializar tabela de controle
      const tableInitialized = await this.initializeMigrationTable();
      if (!tableInitialized) {
        result.success = false;
        return result;
      }

      // Buscar migrations já executadas
      const executedMigrations = await this.getExecutedMigrations();
      console.log('📋 Migrations já executadas:', executedMigrations);

      // Definir migrations disponíveis
      const availableMigrations = await this.getAvailableMigrations();
      
      // Filtrar migrations pendentes
      const pendingMigrations = availableMigrations.filter(
        migration => !executedMigrations.includes(migration.id)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ Todas as migrations já estão atualizadas!');
        return result;
      }

      console.log(`🔄 Executando ${pendingMigrations.length} migration(s) pendente(s)...`);

      // Executar migrations pendentes
      for (const migration of pendingMigrations) {
        const success = await this.executeMigration(migration);
        
        if (success) {
          result.executed.push(migration.id);
        } else {
          result.failed.push(migration.id);
          result.success = false;
        }
      }

      if (result.success) {
        console.log('🎉 Todas as migrations foram executadas com sucesso!');
      } else {
        console.log('⚠️ Algumas migrations falharam:', result.failed);
      }

      return result;
    } catch (error) {
      console.error('❌ Erro geral na execução de migrations:', error);
      result.success = false;
      return result;
    }
  }

  /**
   * Obter lista de migrations disponíveis
   */
  private async getAvailableMigrations(): Promise<Migration[]> {
    // Por enquanto, vamos carregar a migration hardcoded
    // Em produção, isso seria carregado de arquivos ou repositório
    
    const migration001SQL = `
-- Migration: 001_create_dre_hitss_table
-- Criar tabela principal DRE-HITSS
CREATE TABLE IF NOT EXISTS dre_hitss (
  id SERIAL PRIMARY KEY,
  upload_batch_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  
  -- Campos financeiros principais
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  natureza VARCHAR(20) NOT NULL CHECK (natureza IN ('RECEITA', 'CUSTO')),
  descricao TEXT NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  lancamento DECIMAL(15,2) NOT NULL,
  data DATE NOT NULL,
  
  -- Categorização e organização
  categoria TEXT,
  observacao TEXT,
  projeto TEXT,
  periodo VARCHAR(10),
  
  -- Campos específicos do sistema HITSS
  denominacao_conta TEXT,
  conta_resumo TEXT,
  linha_negocio TEXT,
  relatorio TEXT,
  
  -- Metadados
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_dre_hitss_batch ON dre_hitss(upload_batch_id);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_periodo ON dre_hitss(periodo);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_projeto ON dre_hitss(projeto);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_tipo ON dre_hitss(tipo);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_natureza ON dre_hitss(natureza);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_conta_resumo ON dre_hitss(conta_resumo);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_data ON dre_hitss(data);
CREATE INDEX IF NOT EXISTS idx_dre_hitss_valor ON dre_hitss(valor) WHERE valor <> 0;

-- Criar índice composto para consultas financeiras frequentes
CREATE INDEX IF NOT EXISTS idx_dre_hitss_financeiro ON dre_hitss(tipo, natureza, periodo, projeto);

-- Configurar Row Level Security (RLS)
ALTER TABLE dre_hitss ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações
CREATE POLICY "Permitir todas operações DRE" ON dre_hitss FOR ALL USING (true);

-- Comentários nas colunas para documentação
COMMENT ON TABLE dre_hitss IS 'Tabela para armazenar dados de DRE (Demonstrativo de Resultado do Exercício) do sistema HITSS';
COMMENT ON COLUMN dre_hitss.upload_batch_id IS 'UUID único para cada lote de importação';
COMMENT ON COLUMN dre_hitss.tipo IS 'Tipo do lançamento: receita ou despesa';
COMMENT ON COLUMN dre_hitss.natureza IS 'Natureza contábil: RECEITA ou CUSTO';
COMMENT ON COLUMN dre_hitss.valor IS 'Valor principal do lançamento';
COMMENT ON COLUMN dre_hitss.lancamento IS 'Valor do lançamento contábil';
COMMENT ON COLUMN dre_hitss.periodo IS 'Período no formato M/YYYY ou YYYY-MM';
COMMENT ON COLUMN dre_hitss.raw_data IS 'Dados brutos originais do Excel em formato JSON';
    `;

    return [
      {
        id: '001_create_dre_hitss_table',
        name: 'Criar tabela DRE-HITSS',
        description: 'Criar tabela principal para armazenar dados de DRE com índices e políticas de segurança',
        sql: migration001SQL
      }
    ];
  }

  /**
   * Gerar checksum para verificar integridade da migration
   */
  private generateChecksum(sql: string): string {
    // Implementação simples de hash
    let hash = 0;
    for (let i = 0; i < sql.length; i++) {
      const char = sql.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Status das migrations
   */
  async getMigrationStatus(): Promise<{
    initialized: boolean;
    executed: string[];
    pending: string[];
    total: number;
  }> {
    try {
      const availableMigrations = await this.getAvailableMigrations();
      const executedMigrations = await this.getExecutedMigrations();
      
      const pendingMigrations = availableMigrations
        .filter(m => !executedMigrations.includes(m.id))
        .map(m => m.id);

      return {
        initialized: true,
        executed: executedMigrations,
        pending: pendingMigrations,
        total: availableMigrations.length
      };
    } catch (error) {
      console.error('❌ Erro ao obter status das migrations:', error);
      return {
        initialized: false,
        executed: [],
        pending: [],
        total: 0
      };
    }
  }
}

export const migrationService = MigrationService.getInstance(); 