import React, { useRef } from 'react'
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap'
import { useConfig } from '../contexts/ConfigContext'
import { useAuth } from '../contexts/AuthContext'
import { FaCamera, FaUser, FaInfoCircle, FaMicrosoft } from 'react-icons/fa'
import { MigrationStatus } from '../components/system/MigrationStatus'
import UserInfo from '../components/UserInfo'

const Config = () => {
  const { config, updateConfig, uploadUserImage } = useConfig()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        await uploadUserImage(file)
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error)
      }
    }
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ userName: event.target.value })
  }

  return (
    <Container fluid className="py-3">
      <Row className="mb-4">
        <Col>
          <h1>
            <FaUser className="me-2 text-primary" />
            Configurações do Sistema
          </h1>
          <p className="text-muted">Gerencie suas configurações e visualize informações do perfil</p>
        </Col>
      </Row>

      {/* Informações do Usuário Logado - Perfil Completo */}
      {user && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">
                  <FaMicrosoft className="me-2" />
                  Perfil do Usuário - {user.name}
                  {user.isAdmin && (
                    <span className="badge bg-warning text-dark ms-2">
                      👑 ADMINISTRADOR
                    </span>
                  )}
                  {user.authType?.includes('azure') && (
                    <span className="badge bg-success ms-2">
                      ✅ Azure AD Conectado
                    </span>
                  )}
                </h4>
                <small className="opacity-75">
                  Dados capturados automaticamente do Azure AD
                </small>
              </Card.Header>
              <Card.Body className="p-0">
                <UserInfo user={user} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Aviso se não há usuário logado */}
      {!user && (
        <Row className="mb-4">
          <Col>
            <Card className="text-center">
              <Card.Header>
                <h4 className="mb-0">
                  <FaInfoCircle className="me-2 text-warning" />
                  Perfil do Usuário
                </h4>
              </Card.Header>
              <Card.Body>
                <div className="py-4">
                  <FaUser size={48} className="text-muted mb-3" />
                  <p className="text-muted mb-3">
                    Faça login para ver as informações completas do seu perfil
                  </p>
                  <p className="text-info">
                    💡 <strong>Dica:</strong> Use suas credenciais Azure AD para login automático
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h4 className="mb-0">Configurações Locais</h4>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <div 
                  className="position-relative d-inline-block"
                  style={{ cursor: 'pointer' }}
                  onClick={handleImageClick}
                >
                  {config.userImage ? (
                    <img
                      src={config.userImage}
                      alt="User"
                      className="rounded-circle"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                      style={{ width: '150px', height: '150px' }}
                    >
                      <FaCamera size={40} className="text-muted" />
                    </div>
                  )}
                  <div 
                    className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2"
                    style={{ transform: 'translate(20%, 20%)' }}
                  >
                    <FaCamera color="white" size={16} />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nome do Usuário</Form.Label>
                  <Form.Control
                    type="text"
                    value={config.userName}
                    onChange={handleNameChange}
                    placeholder="Digite seu nome"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Formato de Data</Form.Label>
                  <Form.Select 
                    value={config.dateFormat}
                    onChange={(e) => updateConfig({ dateFormat: e.target.value })}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="notifications"
                    label="Notificações"
                    checked={config.notifications}
                    onChange={(e) => updateConfig({ notifications: e.target.checked })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="darkMode"
                    label="Modo Escuro"
                    checked={config.darkMode}
                    onChange={(e) => updateConfig({ darkMode: e.target.checked })}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary">
                    Salvar Alterações
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Informações de Debug */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h4 className="mb-0">Informações do Sistema</h4>
            </Card.Header>
            <Card.Body>
              <div className="small">
                <strong>Status da Sessão:</strong>
                <div className="mt-2 mb-3">
                  {user ? (
                    <div className="alert alert-success py-2 mb-0">
                      ✅ <strong>Logado:</strong> {user.name} ({user.email})
                    </div>
                  ) : (
                    <div className="alert alert-warning py-2 mb-0">
                      ⚠️ <strong>Não autenticado</strong>
                    </div>
                  )}
                </div>

                {user && (
                  <>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <div className="border rounded p-2 text-center">
                          <small className="text-muted d-block">Tipo de Auth</small>
                          <strong className="text-primary">{user.authType}</strong>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded p-2 text-center">
                          <small className="text-muted d-block">Permissão</small>
                          <strong className={user.isAdmin ? "text-danger" : "text-success"}>
                            {user.isAdmin ? 'Administrador' : 'Usuário'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <small><strong>Último Login:</strong></small>
                      <div className="text-muted">
                        {user.loginTimestamp ? new Date(user.loginTimestamp).toLocaleString('pt-BR') : 'N/A'}
                      </div>
                    </div>

                    <div className="mb-3">
                      <small><strong>ID da Sessão:</strong></small>
                      <div className="text-muted small">
                        <code>{user.sessionId}</code>
                      </div>
                    </div>

                    {user.azureProfile && (
                      <div className="alert alert-info py-2">
                        <small>
                          <strong>📊 Azure AD:</strong> Dados completos carregados
                          <br />
                          <strong>Campos:</strong> {Object.keys(user.azureProfile).length} propriedades
                        </small>
                      </div>
                    )}
                  </>
                )}

                <hr />
                <div className="mb-2">
                  <small><strong>Configurações Locais:</strong></small>
                </div>
                <pre className="small bg-light p-2 rounded" style={{ fontSize: '10px' }}>
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Seção de Migrations */}
      <Row className="mt-4">
        <Col>
          <MigrationStatus />
        </Col>
      </Row>
    </Container>
  )
}

export default Config
