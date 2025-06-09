import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  BarController
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Chart } from 'react-chartjs-2'
import { supabase } from '../services/supabaseClient'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

interface MonthData {
  receita: number
  custo: number
  percentual: number
  margem: number
}

interface ProjectChartsProps {
  transactions?: any[] // Mantém compatibilidade mas não usa mais
  selectedYear?: number
  selectedProjects?: string[]
}

export function ProjectCharts({ transactions, selectedYear = 2024, selectedProjects = [] }: ProjectChartsProps) {
  const [monthlyData, setMonthlyData] = useState<Map<string, MonthData>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarDadosMensais = async () => {
      try {
        setLoading(true)
        console.log(`📊 Carregando dados do gráfico para ano=${selectedYear}, projetos=[${selectedProjects.join(', ')}]`)

        // Inicializar todos os meses do ano
        const monthMap = new Map<string, MonthData>()
        for (let mes = 1; mes <= 12; mes++) {
          monthMap.set(`${mes}`, { receita: 0, custo: 0, percentual: 0, margem: 0 })
        }

        // Buscar dados diretamente (função RPC sql não está disponível)
        await buscarDadosDirecta(monthMap, selectedYear, selectedProjects)

        // Calcular margens
        monthMap.forEach((data) => {
          data.margem = data.receita > 0 ? (data.receita - data.custo) / data.receita : 0
        })

        setMonthlyData(monthMap)
        
        // Log detalhado dos dados mensais
        console.log('✅ Dados do gráfico processados por mês:')
        monthMap.forEach((data, mes) => {
          console.log(`  Mês ${mes}: Receita=${data.receita.toFixed(2)}, Custo=${data.custo.toFixed(2)}`)
        })

      } catch (error) {
        console.error('❌ Erro ao carregar dados do gráfico:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarDadosMensais()
  }, [selectedYear, selectedProjects])

  // Função fallback para buscar dados diretamente
  const buscarDadosDirecta = async (monthMap: Map<string, MonthData>, year: number, projects: string[]) => {
    try {
      // Buscar TODOS os dados sem limit
      let query = supabase
        .from('dre_hitss')
        .select('periodo, natureza, lancamento')
        .eq('relatorio', 'Realizado')
        .like('periodo', `%/${year}`)
        .not('lancamento', 'is', null)

      // Aplicar filtro de projetos se selecionados
      if (projects.length > 0) {
        query = query.in('projeto', projects)
      }

      // Buscar todos os dados em lotes
      let allData: any[] = []
      let page = 0
      const pageSize = 1000
      
      while (true) {
        const { data: transacoes, error } = await query
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) {
          console.error('❌ Erro ao buscar transações:', error)
          break
        }

        if (!transacoes || transacoes.length === 0) break

        allData = [...allData, ...transacoes]
        console.log(`📄 Lote ${page + 1}: ${transacoes.length} registros carregados (total: ${allData.length})`)
        
        if (transacoes.length < pageSize) break
        page++
      }

      console.log(`✅ Total carregado: ${allData.length} transações para processamento`)

      // Processar todas as transações
      allData.forEach((transacao) => {
        if (!transacao.periodo) return
        
        const [mes] = transacao.periodo.split('/')
        const data = monthMap.get(mes)
        
        if (data) {
          const valor = parseFloat(transacao.lancamento) || 0
          
          if (transacao.natureza === 'RECEITA') {
            data.receita += valor
          } else if (transacao.natureza === 'CUSTO') {
            data.custo += valor // Mantém o sinal original como no IndexedDB
          }
        }
      })
      
    } catch (error) {
      console.error('❌ Erro no fallback:', error)
    }
  }

  // Formatar valor em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      signDisplay: 'never'
    }).format(Math.abs(value))
  }

  // Formatar mês para exibição
  const formatMonth = (mes: string) => {
    const data = new Date(2000, parseInt(mes) - 1, 1)
    return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(data)
  }

  const labels = Array.from(monthlyData.keys()).map(formatMonth)

  const datasets = [
    {
      label: 'Custo',
      data: Array.from(monthlyData.values()).map(d => d.custo),
      backgroundColor: 'rgba(255, 99, 132, 0.7)', // Rosa suave
      stack: 'Stack 0',
      type: 'bar' as const,
      order: 2,
    },
    {
      label: 'Receita',
      data: Array.from(monthlyData.values()).map(d => d.receita),
      backgroundColor: 'rgba(75, 192, 192, 0.7)', // Verde água suave
      stack: 'Stack 0',
      type: 'bar' as const,
      order: 3,
    }
  ]

  const getThemeColor = (lightColor: string, darkColor: string): string => {
    if (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return darkColor;
    }
    return lightColor;
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      datalabels: {
        display: true,
        align: 'center' as const,
        anchor: 'center' as const,
        rotation: 270,
        formatter: (value: number) => formatCurrency(value),
        color: '#fff',
        font: {
          weight: 'bold' as const,
        },
      },
      title: {
        display: true,
        text: `Análise Financeira por Mês - ${selectedYear}`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: 20,
        color: getThemeColor('rgb(55, 65, 81)', '#f9fafb'),
      },
      legend: {
        position: 'top' as const,
        labels: {
          color: getThemeColor('rgb(71, 85, 105)', '#f9fafb'),
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
          color: getThemeColor('rgba(209, 213, 219, 0.5)', 'rgba(55, 65, 81, 0.5)')
        },
        ticks: {
          color: getThemeColor('rgb(71, 85, 105)', 'rgb(148, 163, 184)')
        }
      },
      y: {
        stacked: true,
        grid: {
          display: false,
          color: getThemeColor('rgba(209, 213, 219, 0.5)', 'rgba(55, 65, 81, 0.5)')
        },
        ticks: {
          callback: (value: any) => `R$ ${value}`,
          color: getThemeColor('rgb(71, 85, 105)', 'rgb(148, 163, 184)')
        }
      }
    },
  };

  const chartData = {
    labels,
    datasets: datasets.map(ds => ({
      ...ds,
      datalabels: {
        display: true,
        align: 'center' as const,
        anchor: 'center' as const,
        rotation: 270,
        formatter: (value: number) => formatCurrency(value),
        color: '#fff',
        font: {
          weight: 'bold' as const,
        },
      },
    })),
  };

  if (loading) {
    return (
      <div style={{ height: '600px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>🔄 Carregando dados do gráfico...</div>
      </div>
    )
  }

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <Chart type='bar' options={options} data={chartData} />
    </div>
  )
}
