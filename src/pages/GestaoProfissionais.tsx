import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import WebGLBackground from '../components/talent-management/WebGLBackground';
import AIChat from '../components/talent-management/AIChat';
import SupabaseMCPDemo from '../components/talent-management/SupabaseMCPDemo';
import MCPActivationGuide from '../components/talent-management/MCPActivationGuide';
import { useQuery } from '@tanstack/react-query';
import CollaboratorsViewer from '../components/talent-management/CollaboratorsViewer';
import { collaboratorsService, Collaborator } from '../lib/supabaseCollaboratorsService';

// Componente de estatísticas
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-100"
    >
      <Card className={`h-100 ${theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}>
        <Card.Body className="d-flex align-items-center">
          <div className={`rounded-circle p-3 me-3`} style={{ backgroundColor: `${color}20` }}>
            <span style={{ fontSize: '2rem', color }}>{icon}</span>
          </div>
          <div>
            <h3 className="mb-0" style={{ color }}>{value}</h3>
            <p className={`mb-0 ${theme === 'dark' ? 'text-light' : 'text-muted'}`}>{title}</p>
            {subtitle && (
              <small className={theme === 'dark' ? 'text-muted' : 'text-secondary'}>{subtitle}</small>
            )}
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

// Componente de tabela de profissionais
interface ProfessionalsTableProps {
  professionals: Collaborator[];
  searchTerm: string;
}

const ProfessionalsTable: React.FC<ProfessionalsTableProps> = ({ professionals, searchTerm }) => {
  const { theme } = useTheme();
  
  const filteredProfessionals = professionals.filter(p => 
    p.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.proficiencia_cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.local_alocacao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSkillsText = (professional: Collaborator): string => {
    const skills = [];
    if (professional.javascript && professional.javascript !== 'Sem conhecimento') {
      skills.push(`JavaScript (${professional.javascript})`);
    }
    if (professional.python && professional.python !== 'Sem conhecimento') {
      skills.push(`Python (${professional.python})`);
    }
    if (professional.java && professional.java !== 'Sem conhecimento') {
      skills.push(`Java (${professional.java})`);
    }
    if (professional.react && professional.react !== 'Sem conhecimento') {
      skills.push(`React (${professional.react})`);
    }
    if (professional.angular && professional.angular !== 'Sem conhecimento') {
      skills.push(`Angular (${professional.angular})`);
    }
    if (professional.aws && professional.aws !== 'Sem conhecimento') {
      skills.push(`AWS (${professional.aws})`);
    }
    if (professional.azure && professional.azure !== 'Sem conhecimento') {
      skills.push(`Azure (${professional.azure})`);
    }
    
    return skills.slice(0, 3).join(', ') + (skills.length > 3 ? '...' : '');
  };

  return (
    <Card className={theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}>
      <Card.Header>
        <h5 className="mb-0">
          📋 Profissionais Cadastrados ({filteredProfessionals.length})
        </h5>
      </Card.Header>
      <Card.Body className="p-0">
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className={`table table-hover mb-0 ${theme === 'dark' ? 'table-dark' : ''}`}>
            <thead className={theme === 'dark' ? 'table-dark' : 'table-light'}>
              <tr>
                <th>Nome</th>
                <th>Cargo</th>
                <th>Local</th>
                <th>Skills</th>
                <th>Disponibilidade</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessionals.map((professional) => (
                <motion.tr
                  key={professional.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: theme === 'dark' ? '#374151' : '#f8f9fa' }}
                >
                  <td>
                    <div>
                      <strong>{professional.nome_completo || 'N/A'}</strong>
                      <br />
                      <small className={theme === 'dark' ? 'text-muted' : 'text-secondary'}>
                        {professional.email || 'Email não informado'}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-primary">
                      {professional.proficiencia_cargo || 'N/A'}
                    </span>
                    <br />
                    <small>{professional.regime || 'N/A'}</small>
                  </td>
                  <td>{professional.local_alocacao || 'N/A'}</td>
                  <td>
                    <small>{getSkillsText(professional) || 'Não informado'}</small>
                  </td>
                  <td>
                    {professional.disponivel_compartilhamento ? (
                      <span className="badge bg-success">
                        {professional.percentual_compartilhamento || '100'}% disponível
                      </span>
                    ) : (
                      <span className="badge bg-warning">Não disponível</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card.Body>
    </Card>
  );
};

// Componente principal
const GestaoProfissionais: React.FC = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Query para buscar colaboradores reais do Supabase
  const { data: professionals = [], isLoading, error } = useQuery({
    queryKey: ['collaborators-real'],
    queryFn: async (): Promise<Collaborator[]> => {
      try {
        return await collaboratorsService.getAllCollaborators();
      } catch (error) {
        console.error('Erro ao buscar colaboradores:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  // Calcular estatísticas
  const stats = {
    total: professionals.length,
    available: professionals.filter(p => p.disponivel_compartilhamento === true).length,
    javascript: professionals.filter(p => p.javascript && p.javascript !== 'Sem conhecimento').length,
    react: professionals.filter(p => p.react && p.react !== 'Sem conhecimento').length,
    aws: professionals.filter(p => p.aws && p.aws !== 'Sem conhecimento').length,
    senior: professionals.filter(p => 
      p.proficiencia_cargo?.toLowerCase().includes('sênior') || 
      p.proficiencia_cargo?.toLowerCase().includes('senior')
    ).length,
  };

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando dados dos profissionais...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erro ao carregar dados</h4>
          <p>Não foi possível conectar com o banco de dados dos profissionais.</p>
          <p className="mb-0">Erro: {(error as Error).message}</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="position-relative min-vh-100">
      {/* Background WebGL */}
      <WebGLBackground />
      
      <Container fluid className="py-4 position-relative" style={{ zIndex: 10 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <Row className="align-items-center">
            <Col>
              <h1 className={`mb-2 ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>
                🎯 Gestão de Talentos HITSS
              </h1>
              <p className={theme === 'dark' ? 'text-light' : 'text-muted'}>
                Sistema avançado de gestão de profissionais com IA integrada
              </p>
            </Col>
          </Row>
        </motion.div>

        {/* Tabs de navegação */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'dashboard')}
          className="mb-4"
        >
          <Tab eventKey="dashboard" title="📊 Dashboard">
            {/* Cards de estatísticas */}
            <Row className="mb-4">
              <Col md={3} className="mb-3">
                <StatsCard
                  title="Total de Profissionais"
                  value={stats.total}
                  icon="👥"
                  color="#4F46E5"
                  subtitle="Cadastrados no sistema"
                />
              </Col>
              <Col md={3} className="mb-3">
                <StatsCard
                  title="Disponíveis"
                  value={stats.available}
                  icon="✅"
                  color="#059669"
                  subtitle="Para compartilhamento"
                />
              </Col>
              <Col md={3} className="mb-3">
                <StatsCard
                  title="JavaScript/React"
                  value={`${stats.javascript}/${stats.react}`}
                  icon="⚛️"
                  color="#F59E0B"
                  subtitle="Frontend developers"
                />
              </Col>
              <Col md={3} className="mb-3">
                <StatsCard
                  title="Seniores"
                  value={stats.senior}
                  icon="🎖️"
                  color="#DC2626"
                  subtitle="Profissionais experientes"
                />
              </Col>
            </Row>

            {/* Filtros de busca */}
            <Row className="mb-4">
              <Col md={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="input-group">
                    <span className="input-group-text">🔍</span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por nome, cargo ou localização..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="professionals" title="👨‍💻 Profissionais">
            {/* Tabela de profissionais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ProfessionalsTable 
                professionals={professionals} 
                searchTerm={searchTerm}
              />
            </motion.div>
          </Tab>

                     <Tab eventKey="analytics" title="📈 Analytics">
             <Row>
               <Col md={6}>
                 <Card className={theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}>
                   <Card.Header>
                     <h5 className="mb-0">📊 Distribuição por Skills</h5>
                   </Card.Header>
                   <Card.Body>
                     <div className="mb-3">
                       <div className="d-flex justify-content-between">
                         <span>JavaScript</span>
                         <span>{stats.javascript}</span>
                       </div>
                       <div className="progress mb-2">
                         <div 
                           className="progress-bar bg-warning" 
                           style={{ width: `${(stats.javascript / stats.total) * 100}%` }}
                         ></div>
                       </div>
                     </div>
                     
                     <div className="mb-3">
                       <div className="d-flex justify-content-between">
                         <span>React</span>
                         <span>{stats.react}</span>
                       </div>
                       <div className="progress mb-2">
                         <div 
                           className="progress-bar bg-info" 
                           style={{ width: `${(stats.react / stats.total) * 100}%` }}
                         ></div>
                       </div>
                     </div>

                     <div className="mb-3">
                       <div className="d-flex justify-content-between">
                         <span>AWS</span>
                         <span>{stats.aws}</span>
                       </div>
                       <div className="progress mb-2">
                         <div 
                           className="progress-bar bg-success" 
                           style={{ width: `${(stats.aws / stats.total) * 100}%` }}
                         ></div>
                       </div>
                     </div>
                   </Card.Body>
                 </Card>
               </Col>
               
               <Col md={6}>
                 <Card className={theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}>
                   <Card.Header>
                     <h5 className="mb-0">🎯 Insights Rápidos</h5>
                   </Card.Header>
                   <Card.Body>
                     <ul className="list-unstyled">
                       <li className="mb-2">
                         💡 <strong>{((stats.available / stats.total) * 100).toFixed(1)}%</strong> dos profissionais estão disponíveis para compartilhamento
                       </li>
                       <li className="mb-2">
                         🚀 <strong>{((stats.react / stats.total) * 100).toFixed(1)}%</strong> têm conhecimento em React
                       </li>
                       <li className="mb-2">
                         ☁️ <strong>{((stats.aws / stats.total) * 100).toFixed(1)}%</strong> têm experiência com AWS
                       </li>
                       <li className="mb-2">
                         🎖️ <strong>{((stats.senior / stats.total) * 100).toFixed(1)}%</strong> são profissionais seniores
                       </li>
                     </ul>
                   </Card.Body>
                 </Card>
               </Col>
             </Row>

             {/* Status e Guia MCP */}
             <Row className="mt-4">
               <Col md={12}>
                 <MCPActivationGuide />
               </Col>
             </Row>

             {/* Nova seção para dados reais do Supabase */}
             <Row className="mb-4">
               <Col md={12}>
                 <CollaboratorsViewer 
                   title="📊 Colaboradores Reais do Supabase"
                   showActions={true}
                 />
               </Col>
             </Row>

             {/* Versão resumida para comparação */}
             <Row className="mb-4">
               <Col md={6}>
                 <CollaboratorsViewer 
                   title="📋 Últimos 10 Colaboradores"
                   showActions={false}
                   limit={10}
                 />
               </Col>
               <Col md={6}>
                 <SupabaseMCPDemo />
               </Col>
             </Row>
           </Tab>
        </Tabs>

        {/* Mostrar tabela na aba dashboard também */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ProfessionalsTable 
              professionals={professionals.slice(0, 10)} 
              searchTerm={searchTerm}
            />
            {professionals.length > 10 && (
              <div className="text-center mt-3">
                <Button 
                  variant="outline-primary" 
                  onClick={() => setActiveTab('professionals')}
                >
                  Ver todos os {professionals.length} profissionais
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </Container>

      {/* Chat de IA */}
      <AIChat professionals={professionals} />
    </div>
  );
};

export default GestaoProfissionais;