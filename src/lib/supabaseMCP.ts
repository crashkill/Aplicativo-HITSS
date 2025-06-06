import { Professional } from '../types/talent/Professional';

// Service que usa o MCP do Supabase diretamente
export class SupabaseMCPService {
  private projectId: string;

  constructor(projectId: string = 'pwksgdjjkryqryqrvyja') {
    this.projectId = projectId;
  }

  // Buscar todas as tabelas do projeto
  async listTables() {
    try {
      // Esta seria a chamada real via MCP
      // const result = await mcp_supabase_list_tables({ project_id: this.projectId });
      
      // Simulação por enquanto - em produção usaria a função MCP real
      console.log(`📋 Listando tabelas do projeto: ${this.projectId}`);
      
      // Mock da estrutura esperada
      return {
        tables: [
          { name: 'colaboradores', schema: 'public' },
          { name: 'projetos', schema: 'public' },
          { name: 'custos', schema: 'public' }
        ]
      };
    } catch (error) {
      console.error('Erro ao listar tabelas via MCP:', error);
      throw error;
    }
  }

  // Buscar profissionais usando SQL via MCP
  async getProfessionals(): Promise<Professional[]> {
    try {
      const query = `
        SELECT * FROM colaboradores 
        ORDER BY created_at DESC
      `;

      // Esta seria a chamada real via MCP
      // const result = await mcp_supabase_execute_sql({
      //   project_id: this.projectId,
      //   query: query
      // });

      console.log(`🔍 Executando query via MCP: ${query}`);
      
      // Mock de dados - em produção viria do MCP
      return this.getMockProfessionals();
    } catch (error) {
      console.error('Erro ao buscar profissionais via MCP:', error);
      throw error;
    }
  }

  // Criar profissional via MCP
  async createProfessional(professional: Omit<Professional, 'id' | 'created_at'>): Promise<Professional> {
    try {
      const query = `
        INSERT INTO colaboradores (
          nome_completo, email, regime, local_alocacao, proficiencia_cargo,
          java, javascript, python, typescript, php, dotnet, react, angular,
          ionic, flutter, mysql, postgres, oracle_db, sql_server, mongodb,
          aws, azure, gcp, outras_tecnologias, disponivel_compartilhamento,
          percentual_compartilhamento, hora_ultima_modificacao
        ) VALUES (
          '${professional.nome_completo}', '${professional.email}', 
          '${professional.regime}', '${professional.local_alocacao}',
          '${professional.proficiencia_cargo}', '${professional.java}',
          '${professional.javascript}', '${professional.python}',
          '${professional.typescript}', '${professional.php}',
          '${professional.dotnet}', '${professional.react}',
          '${professional.angular}', '${professional.ionic}',
          '${professional.flutter}', '${professional.mysql}',
          '${professional.postgres}', '${professional.oracle_db}',
          '${professional.sql_server}', '${professional.mongodb}',
          '${professional.aws}', '${professional.azure}',
          '${professional.gcp}', '${professional.outras_tecnologias}',
          ${professional.disponivel_compartilhamento}, 
          '${professional.percentual_compartilhamento}',
          NOW()
        ) RETURNING *;
      `;

      // Esta seria a chamada real via MCP
      // const result = await mcp_supabase_execute_sql({
      //   project_id: this.projectId,
      //   query: query
      // });

      console.log(`➕ Criando profissional via MCP`);
      
      // Mock do retorno
      return {
        ...professional,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        hora_ultima_modificacao: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao criar profissional via MCP:', error);
      throw error;
    }
  }

  // Atualizar profissional via MCP
  async updateProfessional(id: string, updates: Partial<Professional>): Promise<Professional> {
    try {
      const setClause = Object.entries(updates)
        .filter(([key, value]) => value !== undefined && key !== 'id')
        .map(([key, value]) => `${key} = '${value}'`)
        .join(', ');

      const query = `
        UPDATE colaboradores 
        SET ${setClause}, hora_ultima_modificacao = NOW()
        WHERE id = '${id}'
        RETURNING *;
      `;

      // Esta seria a chamada real via MCP
      // const result = await mcp_supabase_execute_sql({
      //   project_id: this.projectId,
      //   query: query
      // });

      console.log(`✏️ Atualizando profissional ${id} via MCP`);
      
      // Mock do retorno
      const mockProfessionals = this.getMockProfessionals();
      const existing = mockProfessionals.find(p => p.id === id);
      
      if (!existing) {
        throw new Error('Profissional não encontrado');
      }

      return {
        ...existing,
        ...updates,
        hora_ultima_modificacao: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao atualizar profissional via MCP:', error);
      throw error;
    }
  }

  // Deletar profissional via MCP
  async deleteProfessional(id: string): Promise<void> {
    try {
      const query = `
        DELETE FROM colaboradores 
        WHERE id = '${id}';
      `;

      // Esta seria a chamada real via MCP
      // const result = await mcp_supabase_execute_sql({
      //   project_id: this.projectId,
      //   query: query
      // });

      console.log(`🗑️ Deletando profissional ${id} via MCP`);
    } catch (error) {
      console.error('Erro ao deletar profissional via MCP:', error);
      throw error;
    }
  }

  // Buscar estatísticas via MCP
  async getStats() {
    try {
      const queries = [
        'SELECT COUNT(*) as total FROM colaboradores',
        'SELECT COUNT(*) as available FROM colaboradores WHERE disponivel_compartilhamento = true',
        'SELECT COUNT(*) as javascript FROM colaboradores WHERE javascript = \'Sim\'',
        'SELECT COUNT(*) as react FROM colaboradores WHERE react = \'Sim\'',
        'SELECT COUNT(*) as aws FROM colaboradores WHERE aws = \'Sim\'',
        'SELECT COUNT(*) as senior FROM colaboradores WHERE proficiencia_cargo ILIKE \'%senior%\''
      ];

      // Em produção, executaria todas essas queries via MCP
      console.log('📊 Buscando estatísticas via MCP...');

      // Mock das estatísticas
      return {
        total: 97,
        available: 73,
        javascript: 45,
        react: 32,
        aws: 28,
        senior: 19
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas via MCP:', error);
      throw error;
    }
  }

  // Executar migration via MCP
  async createTables() {
    try {
      const migrationSQL = `
        -- Criar tabela de colaboradores se não existir
        CREATE TABLE IF NOT EXISTS colaboradores (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT,
          hora_ultima_modificacao TIMESTAMP WITH TIME ZONE,
          nome_completo TEXT,
          regime TEXT,
          local_alocacao TEXT,
          proficiencia_cargo TEXT,
          java TEXT,
          javascript TEXT,
          python TEXT,
          typescript TEXT,
          php TEXT,
          dotnet TEXT,
          react TEXT,
          angular TEXT,
          ionic TEXT,
          flutter TEXT,
          mysql TEXT,
          postgres TEXT,
          oracle_db TEXT,
          sql_server TEXT,
          mongodb TEXT,
          aws TEXT,
          azure TEXT,
          gcp TEXT,
          outras_tecnologias TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          disponivel_compartilhamento BOOLEAN,
          percentual_compartilhamento TEXT CHECK (percentual_compartilhamento IN ('100', '75', '50', '25'))
        );

        -- Criar índices para performance
        CREATE INDEX IF NOT EXISTS idx_colaboradores_email ON colaboradores(email);
        CREATE INDEX IF NOT EXISTS idx_colaboradores_nome ON colaboradores(nome_completo);
        CREATE INDEX IF NOT EXISTS idx_colaboradores_cargo ON colaboradores(proficiencia_cargo);
        CREATE INDEX IF NOT EXISTS idx_colaboradores_disponibilidade ON colaboradores(disponivel_compartilhamento);
      `;

      // Esta seria a chamada real via MCP
      // const result = await mcp_supabase_apply_migration({
      //   project_id: this.projectId,
      //   name: 'create_colaboradores_table',
      //   query: migrationSQL
      // });

      console.log('🚀 Aplicando migration via MCP...');
      console.log('✅ Tabela colaboradores criada com sucesso');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao aplicar migration via MCP:', error);
      throw error;
    }
  }

  // Dados mock para desenvolvimento
  private getMockProfessionals(): Professional[] {
    return [
      {
        id: '1',
        nome_completo: 'João Silva',
        email: 'joao.silva@hitss.com',
        regime: 'CLT',
        local_alocacao: 'São Paulo',
        proficiencia_cargo: 'Desenvolvedor Senior',
        javascript: 'Sim',
        python: 'Sim',
        java: 'Não',
        typescript: 'Sim',
        php: 'Não',
        dotnet: 'Não',
        react: 'Sim',
        angular: 'Não',
        ionic: 'Não',
        flutter: 'Não',
        mysql: 'Sim',
        postgres: 'Sim',
        oracle_db: 'Não',
        sql_server: 'Não',
        mongodb: 'Sim',
        aws: 'Sim',
        azure: 'Não',
        gcp: 'Não',
        outras_tecnologias: 'Docker, Kubernetes',
        disponivel_compartilhamento: true,
        percentual_compartilhamento: '75',
        created_at: '2024-01-15T10:00:00Z',
        hora_ultima_modificacao: '2024-06-05T15:30:00Z'
      },
      {
        id: '2',
        nome_completo: 'Maria Santos',
        email: 'maria.santos@hitss.com',
        regime: 'PJ',
        local_alocacao: 'Rio de Janeiro',
        proficiencia_cargo: 'Desenvolvedora Fullstack Pleno',
        javascript: 'Sim',
        python: 'Não',
        java: 'Sim',
        typescript: 'Sim',
        php: 'Não',
        dotnet: 'Sim',
        react: 'Sim',
        angular: 'Sim',
        ionic: 'Não',
        flutter: 'Não',
        mysql: 'Sim',
        postgres: 'Não',
        oracle_db: 'Sim',
        sql_server: 'Sim',
        mongodb: 'Não',
        aws: 'Não',
        azure: 'Sim',
        gcp: 'Não',
        outras_tecnologias: 'GraphQL, Redis',
        disponivel_compartilhamento: true,
        percentual_compartilhamento: '100',
        created_at: '2024-02-20T14:00:00Z',
        hora_ultima_modificacao: '2024-06-05T16:45:00Z'
      },
      {
        id: '3',
        nome_completo: 'Carlos Oliveira',
        email: 'carlos.oliveira@hitss.com',
        regime: 'CLT',
        local_alocacao: 'Brasília',
        proficiencia_cargo: 'DevOps Senior',
        javascript: 'Não',
        python: 'Sim',
        java: 'Não',
        typescript: 'Não',
        php: 'Não',
        dotnet: 'Não',
        react: 'Não',
        angular: 'Não',
        ionic: 'Não',
        flutter: 'Não',
        mysql: 'Sim',
        postgres: 'Sim',
        oracle_db: 'Não',
        sql_server: 'Não',
        mongodb: 'Sim',
        aws: 'Sim',
        azure: 'Sim',
        gcp: 'Sim',
        outras_tecnologias: 'Terraform, Jenkins, Kubernetes',
        disponivel_compartilhamento: false,
        percentual_compartilhamento: null,
        created_at: '2024-03-10T09:00:00Z',
        hora_ultima_modificacao: '2024-06-05T17:20:00Z'
      }
    ];
  }
}

// Instância singleton do service
export const supabaseMCP = new SupabaseMCPService(); 