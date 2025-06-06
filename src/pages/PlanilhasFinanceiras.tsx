import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { db } from '../db/database';
import type { Transacao } from '../db/database';
import FilterPanel from '../components/FilterPanel';
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

  // Carregar e processar dados financeiros do Supabase
  useEffect(() => {
    const carregarDadosFinanceiros = async () => {
      if (!selectedYear || !metadata) return;

      setIsLoading(true);
      try {
        const projetosParaBuscar = selectedProjects.length > 0 ? selectedProjects : metadata.projetos_lista;
        
        console.log('Buscando dados da planilha para:', { selectedYear, projetos: projetosParaBuscar });
        const dadosCrus = await dreSupabaseViews.getPlanilhas(selectedYear, projetosParaBuscar);
        
        const dadosProcessados = processarDadosDaPlanilha(dadosCrus, projetosParaBuscar);
        setDados(dadosProcessados);

      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
        setDados([]); // Limpa os dados em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    carregarDadosFinanceiros();
  }, [selectedYear, selectedProjects, metadata]);

  // Função para transformar dados da API para o formato do componente
  const processarDadosDaPlanilha = (dadosCrus: any[], projetos: string[]): DadosProjeto[] => {
    const dadosAgrupados: { [key: string]: any } = {};

    // Inicializa a estrutura para todos os projetos selecionados
    projetos.forEach(p => {
      dadosAgrupados[p] = {};
      meses.forEach((_, index) => {
        const mesNum = index + 1;
        dadosAgrupados[p][`${mesNum}/${selectedYear}`] = {
          mensal: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
          acumulado: { receita: 0, desoneracao: 0, custo: 0, margem: 0 }
        };
      });
    });

    // Preenche com os dados da API
    dadosCrus.forEach(item => {
      if (dadosAgrupados[item.projeto]) {
        dadosAgrupados[item.projeto][`${item.mes}/${selectedYear}`].mensal = {
          receita: Number(item.receita),
          desoneracao: Number(item.desoneracao),
          custo: Number(item.custo), // Custo já vem como negativo ou zero
          margem: 0, // Será calculado depois
        };
      }
    });

    // Calcula acumulados e margens
    return projetos.map(p => {
      let acumulado: DadosMes = { receita: 0, desoneracao: 0, custo: 0, margem: 0 };
      
      meses.forEach((_, index) => {
        const mesNum = index + 1;
        const chave = `${mesNum}/${selectedYear}`;
        const dadosMes = dadosAgrupados[p][chave].mensal;

        // Propagação de dados do último mês preenchido
        if (dadosMes.receita === 0 && dadosMes.custo === 0 && mesNum > 1) {
            const ultimoMesComDados = dadosAgrupados[p][`${mesNum - 1}/${selectedYear}`]?.mensal;
            if (ultimoMesComDados) {
                dadosMes.receita = ultimoMesComDados.receita;
                dadosMes.custo = ultimoMesComDados.custo;
                dadosMes.desoneracao = ultimoMesComDados.desoneracao;
            }
        }
        
        acumulado.receita += dadosMes.receita;
        acumulado.custo += dadosMes.custo;
        acumulado.desoneracao += dadosMes.desoneracao;

        // Recalcula margem mensal
        const custoAjustadoMensal = Math.abs(dadosMes.custo) - dadosMes.desoneracao;
        dadosMes.margem = dadosMes.receita > 0 ? (1 - (custoAjustadoMensal / dadosMes.receita)) * 100 : 0;

        // Recalcula margem acumulada
        const custoAjustadoAcumulado = Math.abs(acumulado.custo) - acumulado.desoneracao;
        acumulado.margem = acumulado.receita > 0 ? (1 - (custoAjustadoAcumulado / acumulado.receita)) * 100 : 0;

        dadosAgrupados[p][chave].acumulado = { ...acumulado };
      });
      
      return { projeto: p, dados: dadosAgrupados[p] };
    });
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
        dados.map(dadosProjeto => (
          <Row key={dadosProjeto.projeto} className="mb-4">
            <Col>
              <Card className="shadow">
                <Card.Header>
                  <h5 className="mb-0">{dadosProjeto.projeto}</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                      <thead>
                        <tr>
                          <th>Item</th>
                          {meses.map((mes, index) => (
                            <React.Fragment key={mes}>
                              <th colSpan={2} className="text-center">
                                {mes}/{selectedYear.toString().slice(-2)}
                              </th>
                            </React.Fragment>
                          ))}
                        </tr>
                        <tr>
                          <th></th>
                          {meses.map(mes => (
                            <React.Fragment key={mes}>
                              <th className="text-center">Mensal</th>
                              <th className="text-center">Acumulado</th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Receita</td>
                          {meses.map((_, index) => {
                            const mes = index + 1;
                            const chave = `${mes}/${selectedYear}`;
                            const dadosMes = dadosProjeto.dados[chave] || {
                              mensal: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                              acumulado: { receita: 0, desoneracao: 0, custo: 0, margem: 0 }
                            };
                            return (
                              <React.Fragment key={mes}>
                                <td className="text-center" style={{ color: '#198754' }}>
                                  {formatCurrency(dadosMes.mensal.receita)}
                                </td>
                                <td className="text-center" style={{ color: '#198754' }}>
                                  {formatCurrency(dadosMes.acumulado.receita)}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                        <tr>
                          <td>Desoneração</td>
                          {meses.map((_, index) => {
                            const mes = index + 1;
                            const chave = `${mes}/${selectedYear}`;
                            const dadosMes = dadosProjeto.dados[chave] || {
                              mensal: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                              acumulado: { receita: 0, desoneracao: 0, custo: 0, margem: 0 }
                            };
                            return (
                              <React.Fragment key={mes}>
                                <td className="text-center" style={{ color: '#0dcaf0' }}>
                                  {formatCurrency(dadosMes.mensal.desoneracao)}
                                </td>
                                <td className="text-center" style={{ color: '#0dcaf0' }}>
                                  {formatCurrency(dadosMes.acumulado.desoneracao)}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                        <tr>
                          <td>Custo</td>
                          {meses.map((_, index) => {
                            const mes = index + 1;
                            const chave = `${mes}/${selectedYear}`;
                            const dadosMes = dadosProjeto.dados[chave] || {
                              mensal: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                              acumulado: { receita: 0, desoneracao: 0, custo: 0, margem: 0 }
                            };
                            return (
                              <React.Fragment key={mes}>
                                <td className="text-center" style={{ color: '#dc3545' }}>
                                  {formatCurrency(dadosMes.mensal.custo)}
                                </td>
                                <td className="text-center" style={{ color: '#dc3545' }}>
                                  {formatCurrency(dadosMes.acumulado.custo)}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                        <tr>
                          <td>Margem</td>
                          {meses.map((_, index) => {
                            const mes = index + 1;
                            const chave = `${mes}/${selectedYear}`;
                            const dadosMes = dadosProjeto.dados[chave] || {
                              mensal: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                              acumulado: { receita: 0, desoneracao: 0, custo: 0, margem: 0 }
                            };
                            const margemMensal = dadosMes.mensal.margem;
                            const margemAcumulada = dadosMes.acumulado.margem;
                            return (
                              <React.Fragment key={mes}>
                                <td className="text-center" style={{ 
                                  color: margemMensal >= 7 ? '#28a745' : '#dc3545',
                                  fontWeight: 'bold'
                                }}>
                                  {formatPercent(margemMensal)}
                                </td>
                                <td className="text-center" style={{ 
                                  color: margemAcumulada >= 7 ? '#28a745' : '#dc3545',
                                  fontWeight: 'bold'
                                }}>
                                  {formatPercent(margemAcumulada)}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ))
      )}
    </Container>
  );
};

export default PlanilhasFinanceiras;
