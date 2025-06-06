import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { db } from '../db/database';
import type { Transacao } from '../db/database';
import FilterPanel from '../components/FilterPanel';
import EditableCell from '../components/EditableCell';
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
      
      projetoParaAtualizar.dados[mes].mensal[campo] = novoValor;
      
      const { receita, custo, desoneracao } = projetoParaAtualizar.dados[mes].mensal;
      projetoParaAtualizar.dados[mes].mensal.margem = (receita + desoneracao) - custo;
      
      // Recalcula o acumulado para o projeto inteiro
      let accReceita = 0, accCusto = 0, accDesoneracao = 0;
      for (let m = 1; m <= 12; m++) {
        const mesData = projetoParaAtualizar.dados[m];
        if (mesData) {
          accReceita += mesData.mensal.receita;
          accCusto += mesData.mensal.custo;
          accDesoneracao += mesData.mensal.desoneracao;
          mesData.acumulado = {
            receita: accReceita,
            custo: accCusto,
            desoneracao: accDesoneracao,
            margem: (accReceita + accDesoneracao) - accCusto
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
      dadosFormatados[projeto].dados[item.mes] = {
        mensal: {
          receita: Number(item.receita || 0),
          custo: Number(item.custo || 0),
          desoneracao: Number(item.desoneracao || 0),
          margem: 0 // Será calculado depois
        },
        acumulado: { receita: 0, custo: 0, desoneracao: 0, margem: 0 } // Será calculado depois
      };
    });
  
    Object.values(dadosFormatados).forEach(proj => {
      let acumulado = { receita: 0, custo: 0, desoneracao: 0, margem: 0 };
      for (let i = 1; i <= 12; i++) {
        if (!proj.dados[i]) {
          proj.dados[i] = {
            mensal: { receita: 0, custo: 0, desoneracao: 0, margem: 0 },
            acumulado: { ...acumulado } // Mantém o acumulado do mês anterior
          };
        } else {
          const mensal = proj.dados[i].mensal;
          mensal.margem = (mensal.receita + mensal.desoneracao) - mensal.custo;
          
          acumulado.receita += mensal.receita;
          acumulado.custo += mensal.custo;
          acumulado.desoneracao += mensal.desoneracao;
          acumulado.margem = (acumulado.receita + acumulado.desoneracao) - acumulado.custo;
          
          proj.dados[i].acumulado = { ...acumulado };
        }
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
                              const dadosMes = dadosProjeto.dados[mes] || {
                                mensal: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                                acumulado: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                              };
                              return (
                                <React.Fragment key={mes}>
                                  <td className="text-center" style={{ color: '#198754' }}>
                                    <EditableCell
                                      initialValue={dadosMes.mensal.receita}
                                      isEditable={mes > lastDataMonth}
                                      onSave={(novoValor) =>
                                        handleCellUpdate(dadosProjeto.projeto, mes, 'receita', novoValor)
                                      }
                                    />
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
                              const dadosMes = dadosProjeto.dados[mes] || {
                                mensal: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                                acumulado: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                              };
                              return (
                                <React.Fragment key={mes}>
                                  <td className="text-center" style={{ color: '#0dcaf0' }}>
                                    <EditableCell
                                      initialValue={dadosMes.mensal.desoneracao}
                                      isEditable={mes > lastDataMonth}
                                      onSave={(novoValor) =>
                                        handleCellUpdate(dadosProjeto.projeto, mes, 'desoneracao', novoValor)
                                      }
                                    />
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
                              const dadosMes = dadosProjeto.dados[mes] || {
                                mensal: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                                acumulado: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                              };
                              return (
                                <React.Fragment key={mes}>
                                  <td className="text-center" style={{ color: '#dc3545' }}>
                                    <EditableCell
                                      initialValue={dadosMes.mensal.custo}
                                      isEditable={mes > lastDataMonth}
                                      onSave={(novoValor) =>
                                        handleCellUpdate(dadosProjeto.projeto, mes, 'custo', novoValor)
                                      }
                                    />
                                  </td>
                                  <td className="text-center" style={{ color: '#dc3545' }}>
                                    {formatCurrency(Math.abs(dadosMes.acumulado.custo))}
                                  </td>
                                </React.Fragment>
                              );
                            })}
                          </tr>
                          <tr>
                            <td>Margem</td>
                            {meses.map((_, index) => {
                              const mes = index + 1;
                              const dadosMes = dadosProjeto.dados[mes] || {
                                mensal: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                                acumulado: { receita: 0, desoneracao: 0, custo: 0, margem: 0 },
                              };

                              // Lógica de cálculo do app-financeiro
                              const custoAjustadoMensal = Math.abs(dadosMes.mensal.custo) - dadosMes.mensal.desoneracao;
                              const margemMensal = dadosMes.mensal.receita > 0 ? (1 - (custoAjustadoMensal / dadosMes.mensal.receita)) : 0;
                              
                              const custoAjustadoAcumulado = Math.abs(dadosMes.acumulado.custo) - dadosMes.acumulado.desoneracao;
                              const margemAcumulada = dadosMes.acumulado.receita > 0 ? (1 - (custoAjustadoAcumulado / dadosMes.acumulado.receita)) : 0;

                              return (
                                <React.Fragment key={mes}>
                                  <td className="text-center" style={{ 
                                    color: margemMensal >= 0.07 ? '#28a745' : '#dc3545',
                                    fontWeight: 'bold'
                                  }}>
                                    {formatPercent(margemMensal)}
                                  </td>
                                  <td className="text-center" style={{ 
                                    color: margemAcumulada >= 0.07 ? '#28a745' : '#dc3545',
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
          ))}
        </>
      )}
    </Container>
  );
};

export default PlanilhasFinanceiras;
