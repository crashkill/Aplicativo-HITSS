# APIs e Serviços

## Visão Geral

O sistema HITSS possui uma arquitetura baseada em serviços que encapsulam a lógica de negócio e operações de dados. Este documento descreve todos os serviços disponíveis e suas funcionalidades.

## Serviços de Dados

### ProjetoService
Gerenciamento de projetos no sistema.

#### Métodos Disponíveis
- `getProjetos(): Promise<Projeto[]>` - Lista todos os projetos
- `getProjetoPorId(id: string): Promise<Projeto>` - Busca projeto por ID
- `criarProjeto(projeto: Projeto): Promise<string>` - Cria novo projeto
- `atualizarProjeto(projeto: Projeto): Promise<void>` - Atualiza projeto existente
- `deletarProjeto(id: string): Promise<void>` - Remove projeto

#### Exemplo de Uso
```typescript
import { ProjetoService } from '@/services/ProjetoService';

// Listar todos os projetos
const projetos = await ProjetoService.getProjetos();

// Criar novo projeto
const novoProjeto: Projeto = {
  nome: 'Projeto HITSS 2024',
  cliente: 'Cliente ABC',
  inicio: new Date('2024-01-01'),
  fim: new Date('2024-12-31'),
  status: 'Ativo',
  descricao: 'Projeto de modernização'
};
const id = await ProjetoService.criarProjeto(novoProjeto);
```

### TransacaoService
Gerenciamento de transações financeiras.

#### Métodos Disponíveis
- `getTransacoes(filtros: FiltroTransacao): Promise<Transacao[]>` - Lista transações com filtros
- `getTransacaoPorId(id: string): Promise<Transacao>` - Busca transação por ID
- `criarTransacao(transacao: Transacao): Promise<string>` - Cria nova transação
- `atualizarTransacao(transacao: Transacao): Promise<void>` - Atualiza transação
- `deletarTransacao(id: string): Promise<void>` - Remove transação

#### Exemplo de Uso
```typescript
import { TransacaoService } from '@/services/TransacaoService';

// Buscar transações por filtro
const filtros: FiltroTransacao = {
  projeto_id: 'proj-123',
  data_inicio: new Date('2024-01-01'),
  data_fim: new Date('2024-12-31'),
  tipo: 'RECEITA'
};
const transacoes = await TransacaoService.getTransacoes(filtros);
```

## Serviços de Cálculo

### CalculoFinanceiroService
Serviço responsável por cálculos financeiros e de margem.

#### Métodos Disponíveis
- `calcularTotaisPorProjeto(projetoId: string): Promise<TotaisProjeto>` - Calcula totais do projeto
- `calcularMargens(transacoes: Transacao[]): Promise<Margens>` - Calcula margens
- `calcularIndicadores(dados: DadosFinanceiros): Promise<Indicadores>` - Calcula indicadores

#### Exemplo de Uso
```typescript
import { CalculoFinanceiroService } from '@/services/CalculoFinanceiroService';

// Calcular totais de um projeto
const totais = await CalculoFinanceiroService.calcularTotaisPorProjeto('proj-123');

console.log(`Receita Total: ${totais.receita}`);
console.log(`Custo Total: ${totais.custo}`);
console.log(`Margem: ${totais.margem}%`);
```

### ProjecaoService
Serviço para projeções e análises futuras.

#### Métodos Disponíveis
- `projetarReceitas(dados: DadosProjecao): Promise<ProjecaoReceitas>` - Projeta receitas futuras
- `projetarCustos(dados: DadosProjecao): Promise<ProjecaoCustos>` - Projeta custos futuros
- `calcularTendencias(historico: DadosHistoricos): Promise<Tendencias>` - Calcula tendências

#### Exemplo de Uso
```typescript
import { ProjecaoService } from '@/services/ProjecaoService';

// Projetar receitas para os próximos 6 meses
const dadosProjecao: DadosProjecao = {
  periodo: 6,
  base_historica: historico_12_meses,
  ajustes: { crescimento: 0.05 }
};
const projecao = await ProjecaoService.projetarReceitas(dadosProjecao);
```

## Serviços de Importação

### ImportacaoService
Gerenciamento de importação de dados de planilhas.

#### Métodos Disponíveis
- `importarPlanilha(arquivo: File): Promise<ResultadoImportacao>` - Importa planilha Excel
- `validarDados(dados: DadosImportacao): Promise<ResultadoValidacao>` - Valida dados importados
- `processarDados(dados: DadosValidados): Promise<void>` - Processa dados validados

#### Exemplo de Uso
```typescript
import { ImportacaoService } from '@/services/ImportacaoService';

// Importar planilha DRE
const arquivo = event.target.files[0];
const resultado = await ImportacaoService.importarPlanilha(arquivo);

if (resultado.sucesso) {
  console.log(`${resultado.registros_processados} registros importados`);
} else {
  console.error('Erros na importação:', resultado.erros);
}
```

### ExportacaoService
Geração de relatórios e exportação de dados.

#### Métodos Disponíveis
- `exportarPlanilha(filtros: FiltrosExportacao): Promise<File>` - Exporta dados para Excel
- `gerarRelatorio(params: ParametrosRelatorio): Promise<Relatorio>` - Gera relatório

#### Exemplo de Uso
```typescript
import { ExportacaoService } from '@/services/ExportacaoService';

// Exportar dados financeiros
const filtros: FiltrosExportacao = {
  projeto: 'HITSS-2024',
  periodo: { inicio: '2024-01', fim: '2024-12' },
  formato: 'xlsx'
};
const arquivo = await ExportacaoService.exportarPlanilha(filtros);

// Download do arquivo
const url = URL.createObjectURL(arquivo);
const a = document.createElement('a');
a.href = url;
a.download = 'relatorio-financeiro.xlsx';
a.click();
```

## Serviços de Utilidade

### FormatadorService
Formatação de dados para exibição.

#### Métodos Disponíveis
- `formatarMoeda(valor: number): string` - Formata valores monetários
- `formatarData(data: Date): string` - Formata datas
- `formatarPorcentagem(valor: number): string` - Formata percentuais

#### Exemplo de Uso
```typescript
import { FormatadorService } from '@/services/FormatadorService';

const valor = 79372.04;
const data = new Date();
const percentual = 15.5;

console.log(FormatadorService.formatarMoeda(valor));        // "R$ 79.372,04"
console.log(FormatadorService.formatarData(data));          // "15/01/2024"
console.log(FormatadorService.formatarPorcentagem(percentual)); // "15,50%"
```

### ValidadorService
Validação de dados de entrada.

#### Métodos Disponíveis
- `validarTransacao(transacao: Transacao): ResultadoValidacao` - Valida dados de transação
- `validarProjeto(projeto: Projeto): ResultadoValidacao` - Valida dados de projeto
- `validarDadosImportacao(dados: any): ResultadoValidacao` - Valida dados de importação

#### Exemplo de Uso
```typescript
import { ValidadorService } from '@/services/ValidadorService';

const transacao: Transacao = {
  natureza: 'RECEITA',
  valor: 1000,
  data: '1/2024',
  projeto: 'HITSS'
};

const resultado = ValidadorService.validarTransacao(transacao);
if (!resultado.valido) {
  console.error('Erros de validação:', resultado.erros);
}
```

## Serviços Específicos do Sistema

### DRESupabaseService
Serviço específico para manipulação de dados DRE no Supabase.

#### Funcionalidades
- Conexão com banco Supabase
- Operações CRUD para tabela `dre_hitss`
- Validação de dados financeiros
- Processamento de uploads em lote

### SAPGuiService
Integração com sistema SAP (sem dependências Node.js).

#### Funcionalidades
- Interface web para consultas SAP
- Formatação de dados SAP
- Cache de consultas

### MCPService
Integração com MCP (Model Context Protocol).

#### Funcionalidades
- Demonstrações de funcionalidades MCP
- Interface de teste para APIs
- Exemplos de integração

## Tratamento de Erros

### Tipos de Erro Padronizados
Todos os serviços implementam tratamento padronizado de erros:

#### ValidationError
```typescript
class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

#### DatabaseError
```typescript
class DatabaseError extends Error {
  constructor(
    public operation: string,
    public originalError: Error
  ) {
    super(`Database error in ${operation}: ${originalError.message}`);
    this.name = 'DatabaseError';
  }
}
```

#### ProcessingError
```typescript
class ProcessingError extends Error {
  constructor(
    public step: string,
    public data: any
  ) {
    super(`Processing error in step: ${step}`);
    this.name = 'ProcessingError';
  }
}
```

#### ImportError
```typescript
class ImportError extends Error {
  constructor(
    public line: number,
    public field: string,
    public value: any
  ) {
    super(`Import error at line ${line}, field ${field}: invalid value ${value}`);
    this.name = 'ImportError';
  }
}
```

#### AppError
```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### Exemplo de Tratamento
```typescript
try {
  const resultado = await TransacaoService.criarTransacao(transacao);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Campo inválido: ${error.field} - ${error.message}`);
  } else if (error instanceof DatabaseError) {
    console.error(`Erro no banco de dados: ${error.operation}`);
  } else {
    console.error('Erro não tratado:', error);
  }
}
```

## Interfaces Principais

### Projeto
```typescript
interface Projeto {
  id: string;
  nome: string;
  cliente: string;
  inicio: Date;
  fim: Date;
  status: string;
  descricao: string;
  created_at: Date;
  updated_at: Date;
}
```

### Transacao
```typescript
interface Transacao {
  id: string;
  projeto_id: string;
  tipo: 'RECEITA' | 'CUSTO' | 'DESONERACAO';
  valor: number;
  data: Date;
  descricao: string;
  categoria: string;
  created_at: Date;
  updated_at: Date;
}
```

### ResultadoValidacao
```typescript
interface ResultadoValidacao {
  valido: boolean;
  erros: string[];
  warnings: string[];
}
```

### TotaisProjeto
```typescript
interface TotaisProjeto {
  receita: number;
  custo: number;
  desoneracao: number;
  margem: number;
  periodo: {
    inicio: Date;
    fim: Date;
  };
}
``` 