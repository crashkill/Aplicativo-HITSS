import React, { useState } from 'react';
import { Card, Button, Alert, Badge, Modal } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';

const MCPActivationGuide: React.FC = () => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const mcpEnabled = import.meta.env.VITE_MCP_ENABLED === 'true';
  const hasMCPFunctions = typeof (globalThis as any).mcp_supabase_list_projects === 'function';

  const getStatus = () => {
    if (mcpEnabled && hasMCPFunctions) {
      return { status: 'active', text: 'MCP Ativo', variant: 'success' };
    } else if (mcpEnabled) {
      return { status: 'configured', text: 'MCP Configurado', variant: 'warning' };
    } else {
      return { status: 'inactive', text: 'MCP Inativo', variant: 'danger' };
    }
  };

  const statusInfo = getStatus();

  return (
    <>
      <Card className={theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">🔧 Status MCP Supabase</h5>
            <div className="d-flex align-items-center gap-2">
              <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>
              <Button 
                variant="outline-info" 
                size="sm" 
                onClick={() => setShowModal(true)}
              >
                📖 Guia
              </Button>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          {statusInfo.status === 'active' && (
            <Alert variant="success">
              <strong>✅ MCP Supabase Ativo!</strong>
              <br />
              As funções MCP estão disponíveis e podem ser usadas para operações diretas com o banco de dados.
            </Alert>
          )}

          {statusInfo.status === 'configured' && (
            <Alert variant="warning">
              <strong>⚠️ MCP Configurado mas Não Disponível</strong>
              <br />
              O MCP está habilitado no .env, mas as funções não estão disponíveis. 
              Verifique se o ambiente MCP está rodando.
            </Alert>
          )}

          {statusInfo.status === 'inactive' && (
            <Alert variant="info">
              <strong>💡 MCP Não Configurado</strong>
              <br />
              O sistema está usando dados mock. Para ativar o MCP real, 
              configure as variáveis de ambiente conforme o guia.
            </Alert>
          )}

          <div className="row g-3">
            <div className="col-md-6">
              <h6>📋 Checklist de Configuração:</h6>
              <ul className="list-unstyled">
                <li>
                  {mcpEnabled ? '✅' : '❌'} VITE_MCP_ENABLED configurado
                </li>
                <li>
                  {hasMCPFunctions ? '✅' : '❌'} Funções MCP disponíveis
                </li>
                <li>
                  {import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'} URL Supabase configurada
                </li>
                <li>
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'} Chave Supabase configurada
                </li>
              </ul>
            </div>
            
            <div className="col-md-6">
              <h6>🎯 Funcionalidades MCP:</h6>
              <ul className="list-unstyled">
                <li>📊 Queries SQL diretas</li>
                <li>🚀 Migrations automáticas</li>
                <li>📋 Gestão de tabelas</li>
                <li>📈 Analytics em tempo real</li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Modal com guia completo */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-white' : ''}>
          <Modal.Title>🚀 Guia de Ativação MCP Supabase</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === 'dark' ? 'bg-dark text-white' : ''}>
          <h5>📋 Passo a Passo para Ativar o MCP:</h5>
          
          <div className="mb-4">
            <h6>1. 🔑 Configurar Token de Acesso</h6>
            <Alert variant="warning">
              <strong>Primeiro, obtenha o token de acesso do Supabase:</strong>
              <ol className="mt-2 mb-0">
                <li>Acesse <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">https://supabase.com/dashboard</a></li>
                <li>Vá em <strong>Settings → API</strong></li>
                <li>Copie o <strong>service_role</strong> key</li>
                <li>Configure no ambiente MCP (não no .env da aplicação)</li>
              </ol>
            </Alert>
          </div>

          <div className="mb-4">
            <h6>2. ⚙️ Configurar Variáveis no .env</h6>
            <pre className={`p-3 rounded ${theme === 'dark' ? 'bg-secondary' : 'bg-light'}`}>
{`# Habilitar MCP na aplicação
VITE_MCP_ENABLED=true

# URLs do Supabase (já configuradas)
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui`}
            </pre>
          </div>

          <div className="mb-4">
            <h6>3. 🚀 Configurar MCP Server</h6>
            <Alert variant="info">
              <strong>Configure o servidor MCP (separadamente):</strong>
              <pre className="mt-2 mb-0">
{`# Configure o token no ambiente MCP
export SUPABASE_ACCESS_TOKEN="sb-seu-token-aqui"

# Inicie o servidor MCP (se disponível)
npx @supabase/supabase-js mcp-server`}
              </pre>
            </Alert>
          </div>

          <div className="mb-4">
            <h6>4. 🔄 Reiniciar Aplicação</h6>
            <p>Após configurar as variáveis, reinicie a aplicação com:</p>
            <pre className={`p-2 rounded ${theme === 'dark' ? 'bg-secondary' : 'bg-light'}`}>
              npm run dev
            </pre>
          </div>

          <Alert variant="success">
            <strong>✅ Após a configuração:</strong>
            <ul className="mt-2 mb-0">
              <li>O sistema usará dados reais do banco Supabase</li>
              <li>As operações CRUD serão executadas via MCP</li>
              <li>Migrations poderão ser aplicadas diretamente</li>
              <li>Analytics em tempo real estarão disponíveis</li>
            </ul>
          </Alert>

          <Alert variant="warning">
            <strong>⚠️ Modo Atual (Mock):</strong>
            <br />
            Enquanto o MCP não estiver configurado, o sistema funciona perfeitamente 
            com dados simulados para demonstração e desenvolvimento.
          </Alert>
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark' : ''}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowModal(false);
              window.open('https://supabase.com/docs/guides/api', '_blank');
            }}
          >
            📖 Docs Supabase
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MCPActivationGuide; 