import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { db } from '../db/database';
import type { Transacao } from '../db/database';
import FilterPanel from '../components/FilterPanel';
import EditableCell from '../components/EditableCell';
import SimpleDataGrid from '../components/SimpleDataGrid';
import { dreSupabaseViews, MetadadosProjeto } from '../services/dreSupabaseViews';

interface DadosMes {
  receita: number;
  desoneracao: number;
  custo: number;
  margem: number;
}

interface DadosProjeto {
  projeto: string;
  dados: { [key: string]: { mensal: DadosMes; acumulado: DadosMes } };
}

const PlanilhasFinanceiras: React.FC = () => {
  const [dados, setDados] = useState<DadosProjeto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState<MetadadosProjeto | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [meses] = useState(['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']);
  const [lastDataMonth, setLastDataMonth] = useState(0);

  // Carregar metadados (projetos e anos disponíveis) do Supabase
  useEffect(() => {
    const carregarMetadados = async () => {
      try {
        const metadados = await dreSupabaseViews.getMetadados();
        setMetadata(metadados);
        if (metadados?.anos_disponiveis?.length > 0) {
          setSelectedYear(metadados.anos_disponiveis[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar metadados:', error);
      }
    };

    carregarMetadados();
  }, []);

  // Função para atualizar os dados da célula e recalcular
  const handleCellUpdate = (projeto: string, mes: number, campo: keyof Omit<DadosMes, 'margem'>, novoValor: number) => {
    setDados(currentDados => {
      const novosDados = JSON.parse(JSON.stringify(currentDados));
      const projetoParaAtualizar = novosDados.find(p => p.projeto === projeto);

      if (!projetoParaAtualizar) return novosDados;

      // Garante que o objeto para o mês exista
      if (!projetoParaAtualizar.dados[mes]) {
        projetoParaAtualizar.dados[mes] = {
          mensal: { receita: 0, custo: 0, desoneracao: 0, margem: 0 },
          acumulado: { receita: 0, custo: 0, desoneracao: 0, margem: 0 },
        };
      }
      
      // Garante que valores sejam sempre positivos, exceto custo que pode ser negativo
      let valorParaSalvar = Math.abs(novoValor);
      if (campo === 'custo') {
        valorParaSalvar = -Math.abs(novoValor); // Custo sempre negativo
      }
      
      projetoParaAtualizar.dados[mes].mensal[campo] = valorParaSalvar;
      
      // Nova regra: Se for receita, recalcula desoneração automaticamente
      if (campo === 'receita') {
        projetoParaAtualizar.dados[mes].mensal.desoneracao = novoValor * 0.0387;
      }
      
      const { receita, custo, desoneracao } = projetoParaAtualizar.dados[mes].mensal;
      
      // Cálculo da margem: (Receita - |Custo|) / Receita * 100
      const custoAbsoluto = Math.abs(custo);
      const margemValor = receita > 0 ? ((receita - custoAbsoluto) / receita) * 100 : 0;
      projetoParaAtualizar.dados[mes].mensal.margem = margemValor;
      
      // Recalcula o acumulado para o projeto inteiro
      let accReceita = 0, accCusto = 0, accDesoneracao = 0;
      for (let m = 1; m <= 12; m++) {
        const mesData = projetoParaAtualizar.dados[m];
        if (mesData) {
          accReceita += Math.abs(mesData.mensal.receita);
          accCusto += Math.abs(mesData.mensal.custo);
          accDesoneracao += Math.abs(mesData.mensal.desoneracao);
          
          // Cálculo da margem acumulada
          const margemAcumulada = accReceita > 0 ? ((accReceita - accCusto) / accReceita) * 100 : 0;
          
          mesData.acumulado = {
            receita: accReceita,
            custo: accCusto,
            desoneracao: accDesoneracao,
            margem: margemAcumulada
          };
        }
      }
      return novosDados;
    });
  };

  // Carregar e processar dados financeiros do Supabase
  useEffect(() => {
    const carregarDadosFinanceiros = async () => {
      if (!selectedYear || !metadata) return;

      setIsLoading(true);
      try {
        const projetosParaBuscar =
          selectedProjects.length > 0 ? selectedProjects : metadata.projetos_lista;

        const dadosCrus = await dreSupabaseViews.getPlanilhas(selectedYear, projetosParaBuscar);

        const ultimoMes = dadosCrus.reduce((maxMes, item) => {
          const temDados =
            Number(item.receita) > 0 || Number(item.custo) > 0 || Number(item.desoneracao) > 0;
          return temDados && item.mes > maxMes ? item.mes : maxMes;
        }, 0);
        setLastDataMonth(ultimoMes);

        const dadosProcessados = processarDadosDaPlanilha(dadosCrus, projetosParaBuscar);
        setDados(dadosProcessados);
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
        setDados([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (metadata) {
      carregarDadosFinanceiros();
    }
  }, [selectedYear, selectedProjects, metadata]);

  // Função para transformar dados da API para o formato do componente
  const processarDadosDaPlanilha = (dadosCrus: any[], projetos: string[]): DadosProjeto[] => {
    const dadosFormatados: { [key: string]: DadosProjeto } = {};
  
    projetos.forEach(p => {
      dadosFormatados[p] = { projeto: p, dados: {} };
    });
  
    dadosCrus.forEach(item => {
      const projeto = item.projeto;
      if (!dadosFormatados[projeto]) {
        dadosFormatados[projeto] = { projeto: projeto, dados: {} };
      }
      
      const receita = Math.abs(Number(item.receita || 0));
      const custo = -Math.abs(Number(item.custo || 0)); // Custo sempre negativo
      const desoneracao = receita * 0.0387; // Nova regra: Receita * 0.0387
      
      dadosFormatados[projeto].dados[item.mes] = {
        mensal: {
          receita: receita,
          custo: custo,
          desoneracao: desoneracao,
          margem: 0 // Será calculado depois
        },
        acumulado: { receita: 0, custo: 0, desoneracao: 0, margem: 0 } // Será calculado depois
      };
    });
  
    Object.values(dadosFormatados).forEach(proj => {
      let acumulado = { receita: 0, custo: 0, desoneracao: 0, margem: 0 };
      for (let i = 1; i <= 12; i++) {
        // Primeiro, garante que o mês existe (mesmo que vazio)
        if (!proj.dados[i]) {
          proj.dados[i] = {
            mensal: { receita: 0, custo: 0, desoneracao: 0, margem: 0 },
            acumulado: { receita: 0, custo: 0, desoneracao: 0, margem: 0 }
          };
        }

        // Lógica de Propagação do app-financeiro: Se a receita for zero E não for janeiro
        if (proj.dados[i].mensal.receita === 0 && i > 1) {
          // Buscar último mês com dados
          for (let mesAnterior = i - 1; mesAnterior >= 1; mesAnterior--) {
            const dadosMesAnterior = proj.dados[mesAnterior]?.mensal;
            if (dadosMesAnterior && dadosMesAnterior.receita > 0) {
              proj.dados[i].mensal.receita = dadosMesAnterior.receita;
              // Recalcula desoneração com nova regra
              proj.dados[i].mensal.desoneracao = dadosMesAnterior.receita * 0.0387;
              proj.dados[i].mensal.custo = dadosMesAnterior.custo;
              break;
            }
          }
        }

        const mensal = proj.dados[i].mensal;
        // Nova fórmula de margem: (Receita - |Custo|) / Receita * 100
        const custoAbsoluto = Math.abs(mensal.custo);
        mensal.margem = mensal.receita > 0 ? ((mensal.receita - custoAbsoluto) / mensal.receita) * 100 : 0;
        
        acumulado.receita += Math.abs(mensal.receita);
        acumulado.custo += Math.abs(mensal.custo);
        acumulado.desoneracao += Math.abs(mensal.desoneracao);
        
        // Nova fórmula de margem acumulada: (Receita Acum - Custo Acum) / Receita Acum * 100
        acumulado.margem = acumulado.receita > 0 ? ((acumulado.receita - acumulado.custo) / acumulado.receita) * 100 : 0;
        
        // Log debug para margem acumulada no mês 1 
        if (i === 1) {
          console.log(`Debug Margem Acumulada Mês ${i} - Projeto ${proj.projeto}:`, {
            receitaAcumulada: acumulado.receita,
            custoAcumulado: acumulado.custo,
            desoneracaoAcumulada: acumulado.desoneracao,
            margemAcumuladaCalculada: acumulado.margem
          });
        }
        
        proj.dados[i].acumulado = { ...acumulado };
      }
    });
  
    return Object.values(dadosFormatados);
  };



  return (
    <Container fluid>
      <Row>
        <Col>
          <h1 className="mb-2">Planilhas Financeiras</h1>
          <p className="text-muted mb-4">Análise detalhada de receitas, custos e margens por projeto</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <FilterPanel
            projects={metadata?.projetos_lista || []}
            selectedProjects={selectedProjects}
            years={metadata?.anos_disponiveis || []}
            selectedYear={selectedYear}
            onProjectChange={setSelectedProjects}
            onYearChange={setSelectedYear}
          />
        </Col>
      </Row>

      {isLoading ? (
        <Row>
          <Col>
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          </Col>
        </Row>
      ) : (
        <>
          {dados.map(dadosProjeto => (
            <Row key={dadosProjeto.projeto} className="mb-4">
              <Col>
                                  <SimpleDataGrid
                    dadosProjeto={dadosProjeto}
                    meses={meses}
                    selectedYear={selectedYear}
                    lastDataMonth={lastDataMonth}
                    onCellUpdate={handleCellUpdate}
                    formatCurrency={formatCurrency}
                    formatPercent={formatPercent}
                  />
              </Col>
            </Row>
          ))}
        </>
      )}
    </Container>
  );
};

export default PlanilhasFinanceiras;
