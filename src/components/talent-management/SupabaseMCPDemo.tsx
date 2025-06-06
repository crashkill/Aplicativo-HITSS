import React, { useState } from 'react';
import { Card, Button, Alert, Badge } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';
import { SupabaseMCPRealService } from '../../lib/supabaseMCPReal';

// Definir as funções MCP como elas seriam chamadas
declare global {
  var mcp_supabase_list_projects: (params: { random_string: string }) => Promise<any>;
  var mcp_supabase_get_project: (params: { id: string }) => Promise<any>;
  var mcp_supabase_list_tables: (params: { project_id: string }) => Promise<any>;
  var mcp_supabase_execute_sql: (params: { project_id: string; query: string }) => Promise<any>;
  var mcp_supabase_apply_migration: (params: { project_id: string; name: string; query: string }) => Promise<any>;
}

interface MCPResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
  operation: string;
}

const SupabaseMCPDemo: React.FC = () => {
  const { theme } = useTheme();
  const [results, setResults] = useState<MCPResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (operation: string, success: boolean, data?: any, error?: string) => {
    const result: MCPResult = {
      operation,
      success,
      data,
      error,
      timestamp: new Date()
    };
    setResults(prev => [result, ...prev.slice(0, 9)]); // Manter apenas os 10 últimos
  };

  const testListProjects = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Tentando listar projetos via MCP...');
      
      // Tentar usar MCP real se disponível
      if (typeof (globalThis as any).mcp_supabase_list_projects === 'function') {
        const result = await (globalThis as any).mcp_supabase_list_projects({ 
          random_string: 'app_hitss_test' 
        });
        addResult('list_projects', true, result);
      } else {
        // Fallback para mock se MCP não disponível
        console.log('⚠️ MCP não disponível, usando dados mock...');
        const mockResult = {
          projects: [
            {
              id: 'pwksgdjjkryqryqrvyja',
              name: 'Aplicativo HITSS',
              status: 'ACTIVE',
              region: 'us-east-1'
            }
          ],
          note: 'Dados simulados - MCP não configurado'
        };
        addResult('list_projects', true, mockResult);
      }
    } catch (error) {
      addResult('list_projects', false, null, `Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testListTables = async () => {
    setIsLoading(true);
    try {
      const projectId = 'pwksgdjjkryqryqrvyja';
      
      // Em um ambiente real com MCP configurado:
      // const result = await mcp_supabase_list_tables({ project_id: projectId });
      
      console.log(`📋 Tentando listar tabelas do projeto ${projectId} via MCP...`);
      
      // Mock da resposta
      const mockResult = {
        tables: [
          { name: 'colaboradores', schema: 'public', columns: 25 },
          { name: 'projetos', schema: 'public', columns: 8 },
          { name: 'custos', schema: 'public', columns: 12 }
        ]
      };
      
      addResult('list_tables', true, mockResult);
    } catch (error) {
      addResult('list_tables', false, null, `Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testExecuteSQL = async () => {
    setIsLoading(true);
    try {
      const projectId = 'pwksgdjjkryqryqrvyja';
      const query = 'SELECT COUNT(*) as total_professionals FROM colaboradores';
      
      console.log(`🔍 Executando SQL via MCP: ${query}`);
      
      // Tentar usar MCP real se disponível
      if (typeof (globalThis as any).mcp_supabase_execute_sql === 'function') {
        const result = await (globalThis as any).mcp_supabase_execute_sql({ 
          project_id: projectId, 
          query 
        });
        addResult('execute_sql', true, result);
      } else {
        // Fallback para mock se MCP não disponível
        console.log('⚠️ MCP não disponível, usando dados mock...');
        const mockResult = {
          data: [{ total_professionals: 97 }],
          query_executed: query,
          execution_time: '12ms',
          note: 'Dados simulados - MCP não configurado'
        };
        addResult('execute_sql', true, mockResult);
      }
    } catch (error) {
      addResult('execute_sql', false, null, `Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testApplyMigration = async () => {
    setIsLoading(true);
    try {
      const projectId = 'pwksgdjjkryqryqrvyja';
      const migrationName = 'add_professional_skills_index';
      const migrationSQL = `
        CREATE INDEX IF NOT EXISTS idx_professionals_skills 
        ON colaboradores USING gin((
          ARRAY[javascript, python, java, react, angular, aws, azure]
        ));
      `;
      
      // Em um ambiente real com MCP configurado:
      // const result = await mcp_supabase_apply_migration({
      //   project_id: projectId,
      //   name: migrationName,
      //   query: migrationSQL
      // });
      
      console.log(`🚀 Aplicando migration '${migrationName}' via MCP...`);
      
      // Mock da resposta
      const mockResult = {
        migration_applied: migrationName,
        status: 'completed',
        changes: 'Index created successfully'
      };
      
      addResult('apply_migration', true, mockResult);
    } catch (error) {
      addResult('apply_migration', false, null, `Erro: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Novo método para testar MCP real
  const testRealMCP = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 Testando conexão com Supabase Real...');
      
      // Instanciar o serviço MCP
      const mcpService = new SupabaseMCPRealService();
      
      // Testar conexão
      const connectionTest = await mcpService.testMCPConnection();
      console.log('🔗 Resultado teste conexão:', connectionTest);
      
      addResult('test_connection', connectionTest.success, connectionTest.data, connectionTest.message);
      
      // Testar busca de profissionais
      const professionals = await mcpService.getProfessionals();
      console.log('👥 Profissionais encontrados:', professionals);
      
      addResult('get_professionals', true, { 
        count: professionals.length, 
        sample: professionals.slice(0, 2),
        mode: mcpService.getMCPStatus().mode
      });
      
      // Testar estatísticas
      const stats = await mcpService.getStats();
      console.log('📊 Estatísticas:', stats);
      
      addResult('get_stats', true, stats);
      
    } catch (error: any) {
      console.error('❌ Erro no teste Supabase Real:', error);
      addResult('test_real_error', false, null, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar banco com dados
  const initializeDatabase = async () => {
    setIsLoading(true);
    try {
      const realService = new SupabaseMCPRealService('kxippwliqglukdhatuaa');
      const result = await realService.initializeDatabase();
      
      if (result.success) {
        addResult('initialize_db', true, result, undefined);
        addResult('get_updated_data', true, { count: 'dados criados' });
      } else {
        addResult('initialize_db', false, null, result.error);
      }
    } catch (error) {
      addResult('initialize_db', false, null, error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Nova função para analisar tabelas
  const analyzeTables = async () => {
    setIsLoading(true);
    try {
      const realService = new SupabaseMCPRealService('kxippwliqglukdhatuaa');
      const result = await realService.analyzeDatabaseTables();
      
      if (result.success) {
        addResult('🔍 Análise de tabelas completa!', true, { totalTables: result.totalTables });
        addResult('📊 Total de tabelas encontradas:', true, { totalTables: result.totalTables });
        
        result.tables.forEach(table => {
          if (table.exists) {
            addResult(`✅ Tabela '${table.name}' existe - ${table.description}`, true, table.sampleData);
            if (table.sampleData) {
              addResult(`📄 Amostra de dados: ${JSON.stringify(table.sampleData, null, 2)}`, true, table.sampleData);
            }
          } else {
            addResult(`❌ Tabela '${table.name}' não encontrada: ${table.error}`, false, null, table.error);
          }
        });
      } else {
        addResult(`❌ Erro na análise: ${result.error}`, false, null, result.error);
      }
    } catch (error) {
      addResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, false, null, error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Nova função para analisar estrutura de uma tabela específica
  const analyzeTableStructure = async (tableName: string) => {
    setIsLoading(true);
    try {
      const realService = new SupabaseMCPRealService('kxippwliqglukdhatuaa');
      const result = await realService.getTableStructure(tableName);
      
      if (result.success) {
        addResult(`🏗️ Estrutura da tabela '${tableName}':`, true, result);
        result.structure.forEach(column => {
          addResult(`  📌 ${column.column}: ${column.type} (exemplo: ${column.sample})`, true, column);
        });
      } else {
        addResult(`❌ Erro ao analisar tabela '${tableName}': ${result.error}`, false, null, result.error);
      }
    } catch (error) {
      addResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, false, null, error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className={theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">🔧 Demo MCP Supabase</h5>
          <div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={clearResults}
              className="me-2"
            >
              Limpar
            </Button>
            <Badge bg={isLoading ? 'warning' : 'success'}>
              {isLoading ? 'Executando...' : 'Pronto'}
            </Badge>
          </div>
        </div>
      </Card.Header>
      
      <Card.Body>
        <Alert variant="info" className="mb-3">
          <strong>💡 Demonstração das funções MCP do Supabase</strong>
          <br />
          <small>
            Estas são simulações das funções MCP. Em produção, seria necessário configurar 
            o token de acesso do Supabase no MCP server.
          </small>
        </Alert>

        {/* Botões de teste */}
        <div className="row g-2 mb-4">
          <div className="col-md-3">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={testListProjects}
              disabled={isLoading}
              className="w-100"
            >
              📁 Listar Projetos
            </Button>
          </div>
          <div className="col-md-3">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={testListTables}
              disabled={isLoading}
              className="w-100"
            >
              📋 Listar Tabelas
            </Button>
          </div>
          <div className="col-md-3">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={testExecuteSQL}
              disabled={isLoading}
              className="w-100"
            >
              🔍 Executar SQL
            </Button>
          </div>
          <div className="col-md-3">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={testApplyMigration}
              disabled={isLoading}
              className="w-100"
            >
              🚀 Migration
            </Button>
          </div>
                     <div className="col-md-3">
             <Button 
               variant="primary" 
               size="sm" 
               onClick={testRealMCP}
               disabled={isLoading}
               className="w-100"
             >
               🔥 Testar Supabase Real
             </Button>
           </div>
           <div className="col-md-3">
             <Button 
               variant="success" 
               size="sm" 
               onClick={initializeDatabase}
               disabled={isLoading}
               className="w-100"
             >
               🏗️ Inicializar Banco
             </Button>
           </div>
           <div className="col-md-3">
             <Button 
               variant="success" 
               size="sm" 
               onClick={analyzeTables}
               disabled={isLoading}
               className="w-100"
             >
               🔍 Analisar Tabelas
             </Button>
           </div>
        </div>

        {/* Resultados */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div className="text-center text-muted py-4">
              <p>Nenhuma operação executada ainda.</p>
              <p><small>Clique nos botões acima para testar as funções MCP.</small></p>
            </div>
          ) : (
            results.map((result, index) => (
              <Card 
                key={index} 
                className={`mb-2 ${theme === 'dark' ? 'bg-secondary' : 'bg-light'}`}
                border={result.success ? 'success' : 'danger'}
              >
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <Badge bg={result.success ? 'success' : 'danger'} className="me-2">
                        {result.success ? '✅' : '❌'}
                      </Badge>
                      <strong>{result.operation}</strong>
                      <small className="d-block text-muted">
                        {result.timestamp.toLocaleTimeString()}
                      </small>
                    </div>
                    <div className="text-end">
                      {result.success && result.data && (
                        <small className="text-success">
                          {JSON.stringify(result.data).length} chars
                        </small>
                      )}
                    </div>
                  </div>
                  
                  {result.error && (
                    <Alert variant="danger" className="mt-2 mb-0 py-1">
                      <small>{result.error}</small>
                    </Alert>
                  )}
                  
                  {result.success && result.data && (
                    <details className="mt-2">
                      <summary className="text-primary" style={{ cursor: 'pointer' }}>
                        <small>Ver dados retornados</small>
                      </summary>
                      <pre className={`mt-1 p-2 rounded ${theme === 'dark' ? 'bg-dark' : 'bg-white'}`}>
                        <small>{JSON.stringify(result.data, null, 2)}</small>
                      </pre>
                    </details>
                  )}
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      </Card.Body>
      
      <Card.Footer className="text-muted">
        <small>
          🔧 Para usar o MCP real, configure: <code>SUPABASE_ACCESS_TOKEN</code> no servidor MCP
        </small>
      </Card.Footer>
    </Card>
  );
};

export default SupabaseMCPDemo; 