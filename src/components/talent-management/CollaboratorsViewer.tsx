import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Table, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { collaboratorsService, Collaborator } from '../../lib/supabaseCollaboratorsService';
// import { useTheme } from '../../hooks/useTheme';

interface CollaboratorsViewerProps {
  title?: string;
  showActions?: boolean;
  limit?: number;
}

const CollaboratorsViewer: React.FC<CollaboratorsViewerProps> = ({ 
  title = "👥 Colaboradores do Supabase",
  showActions = true,
  limit
}) => {
  // const theme = 'light'; // Removido tema por enquanto
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'available' | 'clt' | 'pj'>('all');

  // Buscar colaboradores
  const fetchCollaborators = async (filter: string = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      let data: Collaborator[] = [];
      
      switch (filter) {
        case 'available':
          data = await collaboratorsService.getAvailableCollaborators();
          break;
        case 'clt':
          data = await collaboratorsService.getCollaboratorsByRegime('CLT');
          break;
        case 'pj':
          data = await collaboratorsService.getCollaboratorsByRegime('PJ');
          break;
        default:
          data = await collaboratorsService.getAllCollaborators();
          break;
      }
      
      // Aplicar limite se especificado
      if (limit) {
        data = data.slice(0, limit);
      }
      
      setCollaborators(data);
      
      // Buscar estatísticas se for visualização completa
      if (!limit) {
        const statsData = await collaboratorsService.getCollaboratorStats();
        setStats(statsData);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar colaboradores');
      console.error('Erro ao buscar colaboradores:', err);
    } finally {
      setLoading(false);
    }
  };

  // Testar conexão
  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await collaboratorsService.testConnection();
      if (result.success) {
        alert(`✅ ${result.message}`);
        await fetchCollaborators();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (err) {
      alert(`❌ Erro na conexão: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Formatar nome
  const formatName = (name: string | null) => {
    if (!name) return 'N/A';
    return name
      .toLowerCase()
      .split(' ')
      .map(word => {
        const minusculeWords = ['de', 'da', 'do', 'das', 'dos', 'e'];
        if (minusculeWords.includes(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  // Obter badge de regime
  const getRegimeBadge = (regime: string | null) => {
    if (!regime) return <Badge bg="secondary">N/A</Badge>;
    return (
      <Badge bg={regime === 'CLT' ? 'primary' : 'success'}>
        {regime}
      </Badge>
    );
  };

  // Obter badge de disponibilidade
  const getAvailabilityBadge = (available: boolean | null) => {
    if (available === null) return <Badge bg="secondary">N/A</Badge>;
    return (
      <Badge bg={available ? 'success' : 'warning'}>
        {available ? 'Disponível' : 'Indisponível'}
      </Badge>
    );
  };

  // Obter principais skills
  const getMainSkills = (collaborator: Collaborator) => {
    const skills = [];
    const skillFields = ['javascript', 'python', 'java', 'react', 'angular', 'aws', 'azure'];
    
    skillFields.forEach(field => {
      const value = collaborator[field as keyof Collaborator] as string;
      if (value && value !== 'Sem conhecimento') {
        skills.push(`${field.charAt(0).toUpperCase() + field.slice(1)} (${value})`);
      }
    });
    
    return skills.length > 0 ? skills.slice(0, 3).join(', ') : 'Sem skills informadas';
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const handleFilterChange = (filter: 'all' | 'available' | 'clt' | 'pj') => {
    setSelectedFilter(filter);
    fetchCollaborators(filter);
  };

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{title}</h5>
          <div>
            {showActions && (
              <>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={testConnection}
                  disabled={loading}
                  className="me-2"
                >
                  🔗 Testar Conexão
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => fetchCollaborators(selectedFilter)}
                  disabled={loading}
                >
                  🔄 Atualizar
                </Button>
              </>
            )}
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Estatísticas resumidas */}
        {stats && (
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center bg-light">
                <Card.Body>
                  <h4 className="text-primary">{stats.total}</h4>
                  <small>Total de Colaboradores</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-light">
                <Card.Body>
                  <h4 className="text-success">{stats.availableForSharing}</h4>
                  <small>Disponíveis</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-light">
                <Card.Body>
                  <h4 className="text-info">{stats.cltCount}</h4>
                  <small>CLT</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center bg-light">
                <Card.Body>
                  <h4 className="text-warning">{stats.pjCount}</h4>
                  <small>PJ</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Filtros */}
        {showActions && (
          <div className="mb-3">
            <Button
              variant={selectedFilter === 'all' ? 'primary' : 'outline-primary'}
              size="sm"
              className="me-2"
              onClick={() => handleFilterChange('all')}
            >
              Todos
            </Button>
            <Button
              variant={selectedFilter === 'available' ? 'success' : 'outline-success'}
              size="sm"
              className="me-2"
              onClick={() => handleFilterChange('available')}
            >
              Disponíveis
            </Button>
            <Button
              variant={selectedFilter === 'clt' ? 'info' : 'outline-info'}
              size="sm"
              className="me-2"
              onClick={() => handleFilterChange('clt')}
            >
              CLT
            </Button>
            <Button
              variant={selectedFilter === 'pj' ? 'warning' : 'outline-warning'}
              size="sm"
              onClick={() => handleFilterChange('pj')}
            >
              PJ
            </Button>
          </div>
        )}

        {/* Status de carregamento */}
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Carregando colaboradores...</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <Alert variant="danger">
            <strong>Erro:</strong> {error}
          </Alert>
        )}

        {/* Tabela de colaboradores */}
        {!loading && !error && collaborators.length > 0 && (
          <div style={{ maxHeight: limit ? '400px' : '600px', overflowY: 'auto' }}>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Localização</th>
                  <th>Regime</th>
                  <th>Disponibilidade</th>
                  <th>Principais Skills</th>
                </tr>
              </thead>
              <tbody>
                {collaborators.map((collaborator, index) => (
                  <tr key={collaborator.id || index}>
                    <td>
                                             <div>
                         <strong>{formatName(collaborator.nome_completo)}</strong>
                         {collaborator.proficiencia_cargo && (
                           <>
                             <br />
                             <small className="text-muted">{collaborator.proficiencia_cargo}</small>
                           </>
                         )}
                       </div>
                    </td>
                    <td>{collaborator.email || 'N/A'}</td>
                    <td>{collaborator.local_alocacao || 'N/A'}</td>
                    <td>{getRegimeBadge(collaborator.regime)}</td>
                                         <td>
                       <div>
                         {getAvailabilityBadge(collaborator.disponivel_compartilhamento)}
                         {collaborator.percentual_compartilhamento && (
                           <>
                             <br />
                             <small className="text-muted">{collaborator.percentual_compartilhamento}%</small>
                           </>
                         )}
                       </div>
                     </td>
                    <td>
                      <small>{getMainSkills(collaborator)}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Estado vazio */}
        {!loading && !error && collaborators.length === 0 && (
          <div className="text-center py-4">
            <p className="text-muted">
              {selectedFilter === 'all' 
                ? 'Nenhum colaborador encontrado' 
                : `Nenhum colaborador encontrado com o filtro: ${selectedFilter}`
              }
            </p>
            <Button variant="primary" onClick={() => fetchCollaborators('all')}>
              Buscar Todos
            </Button>
          </div>
        )}

        {/* Informações adicionais */}
        {collaborators.length > 0 && (
          <div className="mt-3">
            <small className="text-muted">
              Exibindo {collaborators.length} colaborador{collaborators.length !== 1 ? 'es' : ''}
              {limit && ` (limitado a ${limit})`}
              {selectedFilter !== 'all' && ` • Filtro: ${selectedFilter}`}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default CollaboratorsViewer; 