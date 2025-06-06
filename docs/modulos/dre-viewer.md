# 📊 Módulo DRE Viewer - Documentação

## Visão Geral

O **Módulo DRE Viewer** é responsável por visualizar e analisar os dados financeiros da DRE (Demonstração de Resultado do Exercício) importados no Supabase, fornecendo dashboards interativos e análises em tempo real.

## 🎯 Funcionalidades Principais

### 1. **Visualização de Estatísticas**
- ✅ Cards informativos com resumo financeiro
- ✅ Receitas, despesas e saldo líquido
- ✅ Contadores de registros por tipo
- ✅ Formatação monetária brasileira

### 2. **Gráficos Interativos**
- ✅ Gráfico de barras (Receitas vs Despesas vs Saldo)
- ✅ Gráfico de pizza (Distribuição receitas/despesas)
- ✅ Cores dinâmicas baseadas em performance
- ✅ Tooltips com valores formatados

### 3. **Tabela de Registros**
- ✅ Visualização dos últimos 100 registros
- ✅ Filtros por tipo (receita/despesa)
- ✅ Ordenação por valor e data
- ✅ Badges coloridos para classificação
- ✅ Modo expansível (mostrar/ocultar)

### 4. **Integração em Tempo Real**
- ✅ Carregamento automático de dados
- ✅ Retry automático em caso de erro
- ✅ Loading states e feedback visual
- ✅ Atualização dinâmica

## 🏗️ Arquitetura

### Componentes Principais

```
src/
├── components/
│   └── dre/
│       └── DREViewer.tsx             # Componente principal de visualização
├── services/
│   └── dreSupabaseService.ts         # Serviço de dados (dependência)
└── pages/
    └── Dashboard.tsx                 # Integração no dashboard
```

### Dependências Externas

```json
{
  "chart.js": "^4.4.7",
  "react-chartjs-2": "^5.2.0",
  "react-bootstrap": "^2.10.7"
}
```

## 📊 Interface de Dados

### Interface DREStats

```typescript
interface DREStats {
  totalRecords: number     // Total de registros na tabela
  totalReceitas: number    // Quantidade de registros de receita
  totalDespesas: number    // Quantidade de registros de despesa
  somaReceitas: number     // Soma total das receitas
  somaDespesas: number     // Soma total das despesas
  saldoLiquido: number     // Diferença entre receitas e despesas
}
```

### Interface DRERecord

```typescript
interface DRERecord {
  id?: number
  upload_batch_id: string
  file_name: string
  uploaded_at?: string
  tipo: 'receita' | 'despesa'
  natureza: 'RECEITA' | 'CUSTO'
  descricao: string
  valor: number
  data: string
  categoria: string
  lancamento: number
  projeto?: string
  periodo: string
  denominacao_conta?: string
  conta_resumo?: string
  linha_negocio?: string
  relatorio?: string
  raw_data?: any
}
```

## 🎨 Componentes Visuais

### 1. Cards de Estatísticas

```jsx
// Card de Receitas (Verde)
<Card className="h-100 border-success">
  <Card.Body className="text-center">
    <h3 className="text-success">💰</h3>
    <h5>Receitas</h5>
    <h4 className="text-success">{formatCurrency(stats.somaReceitas)}</h4>
    <small className="text-muted">{stats.totalReceitas} registros</small>
  </Card.Body>
</Card>
```

### 2. Gráficos Chart.js

```jsx
// Gráfico de Barras
<Bar 
  data={barData} 
  options={{
    responsive: true,
    plugins: {
      legend: { position: 'top' },
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
```

### 3. Tabela Responsiva

```jsx
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
        {/* ... outras colunas */}
      </tr>
    ))}
  </tbody>
</Table>
```

## 🔧 Funcionalidades Técnicas

### Carregamento de Dados

```typescript
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
    setRecords(recordsResult.slice(0, 100)) // Limitar para performance
    
  } catch (err) {
    console.error('Erro ao carregar dados DRE:', err)
    setError(`Erro ao carregar dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
  } finally {
    setLoading(false)
  }
}
```

### Formatação de Valores

```typescript
// Formatação monetária brasileira
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Formatação de datas
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}
```

### Preparação de Dados para Gráficos

```typescript
const prepareChartData = () => {
  if (!stats) return null

  // Gráfico de Barras - Receitas vs Despesas vs Saldo
  const barData = {
    labels: ['Receitas', 'Despesas', 'Saldo Líquido'],
    datasets: [{
      label: 'Valores (R$)',
      data: [
        stats.somaReceitas, 
        Math.abs(stats.somaDespesas), 
        stats.saldoLiquido
      ],
      backgroundColor: [
        'rgba(40, 167, 69, 0.8)',   // Verde para receitas
        'rgba(220, 53, 69, 0.8)',   // Vermelho para despesas
        stats.saldoLiquido >= 0 
          ? 'rgba(40, 167, 69, 0.8)'  // Verde para saldo positivo
          : 'rgba(220, 53, 69, 0.8)'  // Vermelho para saldo negativo
      ]
    }]
  }

  // Gráfico de Pizza - Distribuição
  const doughnutData = {
    labels: ['Receitas', 'Despesas'],
    datasets: [{
      data: [stats.somaReceitas, Math.abs(stats.somaDespesas)],
      backgroundColor: [
        'rgba(40, 167, 69, 0.8)',
        'rgba(220, 53, 69, 0.8)'
      ]
    }]
  }

  return { barData, doughnutData }
}
```

## 🎯 Estados do Componente

### Estados de Loading

```jsx
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
```

### Estados de Erro

```jsx
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
```

### Estado Vazio

```jsx
if (!stats || stats.totalRecords === 0) {
  return (
    <Alert variant="info">
      <Alert.Heading>📊 Dados DRE não encontrados</Alert.Heading>
      <p>Nenhum dado foi encontrado na tabela DRE-HITSS.</p>
      <p>Faça o upload de uma planilha DRE para começar a análise.</p>
    </Alert>
  )
}
```

## 📱 Responsividade

### Layout Responsivo

```jsx
{/* Cards de Estatísticas - 4 colunas em desktop, stack em mobile */}
<Row className="mb-4">
  <Col md={3}>
    <Card className="h-100 border-success">
      {/* Card de Receitas */}
    </Card>
  </Col>
  <Col md={3}>
    <Card className="h-100 border-danger">
      {/* Card de Despesas */}
    </Card>
  </Col>
  {/* ... */}
</Row>

{/* Gráficos - 8/4 em desktop, stack em mobile */}
<Row className="mb-4">
  <Col md={8}>
    <Card>
      {/* Gráfico de Barras */}
    </Card>
  </Col>
  <Col md={4}>
    <Card>
      {/* Gráfico de Pizza */}
    </Card>
  </Col>
</Row>
```

### Tabela Responsiva

```jsx
<div className="table-responsive">
  <Table striped bordered hover size="sm">
    {/* Conteúdo da tabela */}
  </Table>
</div>
```

## 🎨 Customização de Cores

### Cores por Tipo de Dados

```typescript
const colorScheme = {
  receitas: {
    primary: 'rgba(40, 167, 69, 0.8)',    // Verde
    border: 'rgba(40, 167, 69, 1)',
    text: 'text-success'
  },
  despesas: {
    primary: 'rgba(220, 53, 69, 0.8)',    // Vermelho
    border: 'rgba(220, 53, 69, 1)',
    text: 'text-danger'
  },
  saldoPositivo: {
    primary: 'rgba(40, 167, 69, 0.8)',    // Verde
    text: 'text-success'
  },
  saldoNegativo: {
    primary: 'rgba(220, 53, 69, 0.8)',    // Vermelho
    text: 'text-warning'
  }
}
```

## 🔄 Integração com Dashboard

### Importação no Dashboard

```typescript
// src/pages/Dashboard.tsx
import DREViewer from '../components/dre/DREViewer'

// Uso no componente
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
```

## 📈 Performance e Otimização

### Limitações de Performance

```typescript
// Limitar registros para performance
setRecords(recordsResult.slice(0, 100)) // Apenas 100 registros
```

### Carregamento Paralelo

```typescript
// Carregar dados em paralelo
const [statsResult, recordsResult] = await Promise.all([
  dreSupabaseService.getStatistics(),
  dreSupabaseService.getAllRecords()
])
```

### Lazy Loading de Detalhes

```typescript
// Tabela expansível para economizar renderização inicial
const [showDetails, setShowDetails] = useState(false)

{showDetails && (
  <Card.Body>
    {/* Conteúdo da tabela apenas quando expandida */}
  </Card.Body>
)}
```

## 🧪 Tratamento de Erros

### Tipos de Erro Comuns

1. **Conexão com Supabase**
   ```typescript
   catch (err) {
     console.error('Erro ao carregar dados DRE:', err)
     setError(`Erro ao carregar dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
   }
   ```

2. **Dados inválidos**
   ```typescript
   if (!stats || stats.totalRecords === 0) {
     // Exibir estado vazio
   }
   ```

3. **Timeout de carregamento**
   ```typescript
   finally {
     setLoading(false) // Sempre limpar loading state
   }
   ```

## 🔮 Melhorias Futuras

### Funcionalidades Planejadas

1. **📊 Filtros Avançados**
   - Filtro por período
   - Filtro por projeto
   - Filtro por tipo de conta

2. **📈 Gráficos Adicionais**
   - Gráfico de linha temporal
   - Gráfico de tendências
   - Análise de sazonalidade

3. **📱 Exportação**
   - Export para Excel
   - Export para PDF
   - Compartilhamento de relatórios

4. **🔔 Alertas Inteligentes**
   - Notificações de desvios
   - Alertas de metas
   - Indicadores de performance

## 💡 Exemplos de Uso

### Uso Básico

```jsx
import DREViewer from '../components/dre/DREViewer'

function MinhaPagina() {
  return (
    <Container>
      <h1>Análise Financeira</h1>
      <DREViewer />
    </Container>
  )
}
```

### Uso com Wrapper Customizado

```jsx
function DashboardFinanceiro() {
  return (
    <div className="dashboard-financeiro">
      <Card>
        <Card.Header>
          <h3>📊 DRE - Demonstração de Resultado</h3>
        </Card.Header>
        <Card.Body>
          <DREViewer />
        </Card.Body>
      </Card>
    </div>
  )
}
```

## 📞 Suporte e Manutenção

### Debugging

```typescript
// Logs estruturados para debugging
console.log('Carregando dados DRE:', {
  statsLoaded: !!stats,
  recordsCount: records.length,
  hasError: !!error,
  isLoading: loading
})
```

### Métricas de Performance

- **Tempo de carregamento**: < 2 segundos
- **Responsividade**: Compatível com mobile
- **Acessibilidade**: WCAG 2.1 AA

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Dependências**: DRESupabaseService v1.0.0 