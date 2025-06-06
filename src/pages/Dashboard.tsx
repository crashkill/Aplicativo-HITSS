import { useEffect, useState } from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { ProjectCharts } from '../components/ProjectCharts'
import FilterPanel from '../components/FilterPanel'
import { collaboratorsService } from '../lib/supabaseCollaboratorsService'
import DREViewer from '../components/dre/DREViewer'
import { dreSupabaseViews, DashboardSummary, MetadadosProjeto } from '../services/dreSupabaseViews'

const Dashboard = () => {
  // Estados para dados processados pelo Supabase (regras de negócio centralizadas)
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [metadata, setMetadata] = useState<MetadadosProjeto | null>(null)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [loading, setLoading] = useState(true)

  // Estados para dados dos colaboradores
  const [collaboratorStats, setCollaboratorStats] = useState({
    total: 0,
    available: 0,
    clt: 0,
    pj: 0
  })
  const [loadingCollaborators, setLoadingCollaborators] = useState(true)

  // Carregar metadados (projetos e anos disponíveis)
  useEffect(() => {
    const carregarMetadados = async () => {
      try {
        console.log('🔄 Carregando metadados do Supabase...')
        const metadados = await dreSupabaseViews.getMetadados()
        setMetadata(metadados)
        console.log('✅ Metadados carregados:', metadados)
      } catch (error) {
        console.error('❌ Erro ao carregar metadados:', error)
      }
    }

    carregarMetadados()
  }, [])

  // Carregar dados financeiros quando ano/projetos mudam
  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        setLoading(true)
        console.log(`🔄 Carregando dashboard para ano=${selectedYear}, projetos=[${selectedProjects.join(', ')}]`)
        
        const dados = await dreSupabaseViews.getDashboardSummary(
          selectedYear, 
          selectedProjects.length > 0 ? selectedProjects : undefined
        )
        
        setDashboardData(dados)
        console.log('✅ Dashboard carregado:', dados)
      } catch (error) {
        console.error('❌ Erro ao carregar dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarDashboard()
  }, [selectedYear, selectedProjects])

  // Carregar dados dos colaboradores
  useEffect(() => {
    const loadCollaboratorStats = async () => {
      try {
        setLoadingCollaborators(true)
        const stats = await collaboratorsService.getCollaboratorStats()
        setCollaboratorStats({
          total: stats.total,
          available: stats.availableForSharing,
          clt: stats.cltCount,
          pj: stats.pjCount
        })
      } catch (error) {
        console.error('Erro ao carregar estatísticas dos colaboradores:', error)
      } finally {
        setLoadingCollaborators(false)
      }
    }

    loadCollaboratorStats()
  }, [])

  // Valores para exibição (dados processados pelo Supabase)
  const receita = dashboardData?.total_receita || 0
  const custo = dashboardData?.total_custo || 0
  const margem = dashboardData?.margem_liquida || 0
  const totalProjetos = dashboardData?.total_projetos || 0

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Dashboard</h1>
          {loading && <div className="text-muted">🔄 Carregando dados financeiros...</div>}
        </Col>
      </Row>

      <FilterPanel
        projects={metadata?.projetos_lista || []}
        selectedProjects={selectedProjects}
        years={metadata?.anos_disponiveis || []}
        selectedYear={selectedYear}
        onProjectChange={setSelectedProjects}
        onYearChange={setSelectedYear}
      />

      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100 bg-card text-card-foreground border border-border">
            <Card.Body>
              <Card.Title>Receita Total</Card.Title>
              <Card.Text className="h2 text-success dark:text-green-400">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(receita)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="h-100 bg-card text-card-foreground border border-border">
            <Card.Body>
              <Card.Title>Custo Total</Card.Title>
              <Card.Text className="h2 text-danger dark:text-red-400">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(custo)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100 bg-card text-card-foreground border border-border">
            <Card.Body>
              <Card.Title>Margem Líquida</Card.Title>
              <Card.Text className={`h2 ${margem >= 0 ? 'text-success dark:text-green-400' : 'text-danger dark:text-red-400'}`}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(margem)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="h-100 bg-card text-card-foreground border border-border">
            <Card.Body>
              <Card.Title>Total de Projetos</Card.Title>
              <Card.Text className="h2 text-primary dark:text-blue-400">
                {totalProjetos}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="h-100 bg-card text-card-foreground border border-border">
            <Card.Header>
              <Card.Title>Estatísticas dos Colaboradores</Card.Title>
            </Card.Header>
            <Card.Body>
              {loadingCollaborators ? (
                <p>Carregando dados dos colaboradores...</p>
              ) : (
                <Row>
                  <Col md={6}>
                    <div className="text-center">
                      <div className="h4 text-primary">{collaboratorStats.total}</div>
                      <div className="text-muted">Total</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-center">
                      <div className="h4 text-success">{collaboratorStats.available}</div>
                      <div className="text-muted">Disponíveis</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-center">
                      <div className="h4 text-info">{collaboratorStats.clt}</div>
                      <div className="text-muted">CLT</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-center">
                      <div className="h4 text-warning">{collaboratorStats.pj}</div>
                      <div className="text-muted">PJ</div>
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="h-100 bg-card text-card-foreground border border-border">
            <Card.Header>
              <Card.Title>Performance Financeira</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Margem %:</span>
                  <span className={dashboardData?.margem_percentual && dashboardData.margem_percentual >= 0 ? 'text-success' : 'text-danger'}>
                    {dashboardData?.margem_percentual?.toFixed(1) || '0.0'}%
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Ano Selecionado:</span>
                  <span className="text-primary">{selectedYear}</span>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Projetos Filtrados:</span>
                  <span className="text-info">
                    {selectedProjects.length === 0 ? 'Todos' : selectedProjects.length}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col className="mb-4">
          <ProjectCharts transactions={[]} />
        </Col>
      </Row>

      <Row>
        <Col>
          <DREViewer />
        </Col>
      </Row>
    </Container>
  )
}

export default Dashboard
