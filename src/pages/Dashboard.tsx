import { useEffect, useState } from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { ProjectCharts } from '../components/ProjectCharts'
import FilterPanel from '../components/FilterPanel'
import { collaboratorsService } from '../lib/supabaseCollaboratorsService'
import DREViewer from '../components/dre/DREViewer'
import { dreSupabaseViews, DashboardSummary, MetadadosProjeto } from '../services/dreSupabaseViews'
import { db } from '../db/database'
import type { Transacao } from '../db/database'

const Dashboard = () => {
  // Estados para dados processados pelo Supabase (regras de negócio centralizadas)
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [metadata, setMetadata] = useState<MetadadosProjeto | null>(null)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [loading, setLoading] = useState(true)

  // Estados para transações (para o gráfico)
  const [allTransactions, setAllTransactions] = useState<Transacao[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transacao[]>([])

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

  // Carregar todas as transações
  useEffect(() => {
    const carregarTransacoes = async () => {
      try {
        const transacoes = await db.transacoes.toArray()
        setAllTransactions(transacoes)
        console.log('✅ Transações carregadas:', transacoes.length)
      } catch (error) {
        console.error('❌ Erro ao carregar transações:', error)
      }
    }

    carregarTransacoes()
  }, [])

  // Filtrar transações quando ano/projetos mudam
  useEffect(() => {
    const filtered = allTransactions.filter(transaction => {
      if (!transaction.periodo) return false
      
      const [mes, ano] = transaction.periodo.split('/')
      const transactionYear = parseInt(ano)
      
      const yearMatch = transactionYear === selectedYear
      const projectMatch = selectedProjects.length === 0 || 
        selectedProjects.some(proj => transaction.descricao?.includes(proj))
      
      return yearMatch && projectMatch
    })
    
    setFilteredTransactions(filtered)
    console.log(`✅ Transações filtradas: ${filtered.length} para ano ${selectedYear}`)
  }, [selectedProjects, selectedYear, allTransactions])

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

      {/* Seção de Estatísticas dos Colaboradores */}
      <Row className="mb-4">
        <Col>
          <h3 className="mb-3">👥 Gestão de Talentos</h3>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100 bg-card text-card-foreground border border-border">
            <Card.Body className="text-center">
              <div className="mb-2">
                <span style={{ fontSize: '2rem' }}>👨‍💼</span>
              </div>
              <Card.Title className="h4 text-primary">
                {loadingCollaborators ? '...' : collaboratorStats.total}
              </Card.Title>
              <Card.Text className="text-muted">
                Total de Colaboradores
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 bg-card text-card-foreground border border-border">
            <Card.Body className="text-center">
              <div className="mb-2">
                <span style={{ fontSize: '2rem' }}>✅</span>
              </div>
              <Card.Title className="h4 text-success">
                {loadingCollaborators ? '...' : collaboratorStats.available}
              </Card.Title>
              <Card.Text className="text-muted">
                Disponíveis para Compartilhamento
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 bg-card text-card-foreground border border-border">
            <Card.Body className="text-center">
              <div className="mb-2">
                <span style={{ fontSize: '2rem' }}>🏢</span>
              </div>
              <Card.Title className="h4 text-info">
                {loadingCollaborators ? '...' : collaboratorStats.clt}
              </Card.Title>
              <Card.Text className="text-muted">
                Colaboradores CLT
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 bg-card text-card-foreground border border-border">
            <Card.Body className="text-center">
              <div className="mb-2">
                <span style={{ fontSize: '2rem' }}>💼</span>
              </div>
              <Card.Title className="h4 text-warning">
                {loadingCollaborators ? '...' : collaboratorStats.pj}
              </Card.Title>
              <Card.Text className="text-muted">
                Colaboradores PJ
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Seção de Dados DRE do Supabase */}
      <Row className="mb-4">
        <Col>
          <h3 className="mb-3">📊 Dados DRE - Supabase</h3>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <DREViewer />
        </Col>
      </Row>

      <Row>
        <Col className="mb-4">
          <Card className="shadow bg-card text-card-foreground border border-border">
            <Card.Body>
              <ProjectCharts transactions={filteredTransactions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Dashboard
