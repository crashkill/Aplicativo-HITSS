import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Badge, Alert, Spinner, Button } from 'react-bootstrap'
import { dreSupabaseService, DRERecord } from '../../services/dreSupabaseService'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface DREStats {
  totalRecords: number
  totalReceitas: number
  totalDespesas: number
  somaReceitas: number
  somaDespesas: number
  saldoLiquido: number
}

const DREViewer: React.FC = () => {
  const [records, setRecords] = useState<DRERecord[]>([])
  const [stats, setStats] = useState<DREStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadDREData()
  }, [])

  const loadDREData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Carregar estatísticas e registros em paralelo
      const [statsResult, recordsResult] = await Promise.all([
        dreSupabaseService.getStatistics(),
        dreSupabaseService.getAllRecords()
      ])
      
      setStats(statsResult)
      setRecords(recordsResult.slice(0, 100)) // Limitar a 100 registros para performance
      
    } catch (err) {
      console.error('Erro ao carregar dados DRE:', err)
      setError(`Erro ao carregar dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Preparar dados para gráficos
  const prepareChartData = () => {
    if (!stats) return null

    // Gráfico de Receitas vs Despesas
    const barData = {
      labels: ['Receitas', 'Despesas', 'Saldo Líquido'],
      datasets: [
        {
          label: 'Valores (R$)',
          data: [stats.somaReceitas, Math.abs(stats.somaDespesas), stats.saldoLiquido],
          backgroundColor: [
            'rgba(40, 167, 69, 0.8)',   // Verde para receitas
            'rgba(220, 53, 69, 0.8)',   // Vermelho para despesas
            stats.saldoLiquido >= 0 ? 'rgba(40, 167, 69, 0.8)' : 'rgba(220, 53, 69, 0.8)'
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(220, 53, 69, 1)',
            stats.saldoLiquido >= 0 ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)'
          ],
          borderWidth: 1
        }
      ]
    }

    // Gráfico de distribuição
    const doughnutData = {
      labels: ['Receitas', 'Despesas'],
      datasets: [
        {
          data: [stats.somaReceitas, Math.abs(stats.somaDespesas)],
          backgroundColor: [
            'rgba(40, 167, 69, 0.8)',
            'rgba(220, 53, 69, 0.8)'
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(220, 53, 69, 1)'
          ],
          borderWidth: 2
        }
      ]
    }

    return { barData, doughnutData }
  }

  const chartData = prepareChartData()

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <p>Carregando dados DRE do Supabase...</p>
        </Card.Body>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>❌ Erro ao carregar dados</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={loadDREData}>
          🔄 Tentar novamente
        </Button>
      </Alert>
    )
  }

  if (!stats || stats.totalRecords === 0) {
    return (
      <Alert variant="info">
        <Alert.Heading>📊 Dados DRE não encontrados</Alert.Heading>
        <p>Nenhum dado foi encontrado na tabela DRE-HITSS.</p>
        <p>Faça o upload de uma planilha DRE para começar a análise.</p>
      </Alert>
    )
  }

  return (
    <div>
      {/* Cards de Estatísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100 border-success">
            <Card.Body className="text-center">
              <h3 className="text-success">💰</h3>
              <h5>Receitas</h5>
              <h4 className="text-success">{formatCurrency(stats.somaReceitas)}</h4>
              <small className="text-muted">{stats.totalReceitas} registros</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-danger">
            <Card.Body className="text-center">
              <h3 className="text-danger">💸</h3>
              <h5>Despesas</h5>
              <h4 className="text-danger">{formatCurrency(Math.abs(stats.somaDespesas))}</h4>
              <small className="text-muted">{stats.totalDespesas} registros</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={`h-100 ${stats.saldoLiquido >= 0 ? 'border-success' : 'border-warning'}`}>
            <Card.Body className="text-center">
              <h3>{stats.saldoLiquido >= 0 ? '📈' : '📉'}</h3>
              <h5>Saldo Líquido</h5>
              <h4 className={stats.saldoLiquido >= 0 ? 'text-success' : 'text-warning'}>
                {formatCurrency(stats.saldoLiquido)}
              </h4>
              <small className="text-muted">
                {stats.saldoLiquido >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-info">
            <Card.Body className="text-center">
              <h3 className="text-info">📊</h3>
              <h5>Total de Registros</h5>
              <h4 className="text-info">{stats.totalRecords.toLocaleString('pt-BR')}</h4>
              <small className="text-muted">na tabela DRE-HITSS</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      {chartData && (
        <Row className="mb-4">
          <Col md={8}>
            <Card>
              <Card.Header>
                <h5>📊 Análise Financeira</h5>
              </Card.Header>
              <Card.Body>
                <Bar 
                  data={chartData.barData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Receitas vs Despesas vs Saldo Líquido'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrency(Number(value))
                          }
                        }
                      }
                    }
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Header>
                <h5>🥧 Distribuição</h5>
              </Card.Header>
              <Card.Body>
                <Doughnut 
                  data={chartData.doughnutData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const value = context.parsed
                            return context.label + ': ' + formatCurrency(value)
                          }
                        }
                      }
                    }
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Detalhes dos Registros */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>📋 Registros DRE (Últimos 100)</h5>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '🔼 Ocultar' : '🔽 Mostrar'} Detalhes
          </Button>
        </Card.Header>
        {showDetails && (
          <Card.Body>
            <div className="table-responsive">
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Período</th>
                    <th>Projeto</th>
                    <th>Conta Resumo</th>
                    <th>Upload</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.id || index}>
                      <td>
                        <Badge bg={record.tipo === 'receita' ? 'success' : 'danger'}>
                          {record.tipo === 'receita' ? '💰' : '💸'} {record.tipo}
                        </Badge>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '200px' }}>
                        {record.descricao}
                      </td>
                      <td className={record.tipo === 'receita' ? 'text-success' : 'text-danger'}>
                        <strong>{formatCurrency(record.valor)}</strong>
                      </td>
                      <td>{record.periodo}</td>
                      <td className="text-truncate" style={{ maxWidth: '150px' }}>
                        {record.projeto || '-'}
                      </td>
                      <td>
                        <Badge bg="secondary" className="small">
                          {record.conta_resumo || '-'}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {record.uploaded_at ? formatDate(record.uploaded_at) : '-'}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {records.length === 100 && (
              <Alert variant="info" className="mt-3">
                <small>
                  ℹ️ Mostrando apenas os primeiros 100 registros. 
                  Total na base: {stats.totalRecords.toLocaleString('pt-BR')} registros.
                </small>
              </Alert>
            )}
          </Card.Body>
        )}
      </Card>
    </div>
  )
}

export default DREViewer 