# Cálculos Financeiros e Regras de Negócio

## Visão Geral

O sistema HITSS utiliza valores mensais fixos para garantir consistência nos cálculos financeiros. Este documento detalha as regras de cálculo, processamento e validação dos dados financeiros.

## Regras para Receita e Custos

### Valores Mensais Fixos
- **Receita mensal fixa**: R$ 79.372,04
- **Desoneração mensal fixa**: R$ 3.785,63
- **Custo mensal fixo**: R$ -71.578,23

### Regras para Receita
- Receitas são sempre mantidas como valores positivos
- Apenas receitas do tipo "Receita Devengada" são consideradas
- Valor fixo mensal: R$ 79.372,04
- Acumulado preserva a soma dos valores mensais

### Regras para Custos
- Custos são sempre mantidos como valores negativos no sistema
- São considerados três tipos principais de custos:
  - **CLT** - Custos com funcionários CLT (cor: #36A2EB)
  - **Subcontratados** - Custos com profissionais terceirizados (cor: #FF9F40)
  - **Outros** - Demais custos relacionados (cor: #4BC0C0)
- O valor absoluto do custo só é utilizado no momento do cálculo da margem
- Custos acumulados preservam o sinal negativo na soma

### Regras para Desoneração
- Valor fixo mensal: R$ 3.785,63
- Aplicada como redução no cálculo do custo ajustado
- Sempre mantida como valor positivo

## Validação de Custos

### Tipos de Custo Válidos
```typescript
// Função de validação de custos
const isCustoValido = (contaResumo: string) => {
  const normalizado = contaResumo.toLowerCase().trim();
  return (
    normalizado.includes('clt') ||
    normalizado.includes('outros') ||
    normalizado.includes('subcontratados')
  );
};
```

## Cálculo de Margem

### Fórmula da Margem
```typescript
// 1. Custo ajustado = |Custo| - Desoneração
// 2. Margem = (1 - (Custo ajustado / Receita)) * 100

// Exemplo 1: Margem Positiva
const exemplo1 = {
  custo: -100000,        // Custo sempre negativo
  desoneracao: 10000,    // Desoneração sempre positiva
  receita: 150000        // Receita sempre positiva
};
const custoAjustado1 = Math.abs(exemplo1.custo) - exemplo1.desoneracao;  // 90000
const margem1 = (1 - (custoAjustado1 / exemplo1.receita)) * 100;        // 40%

// Exemplo 2: Margem Negativa
const exemplo2 = {
  custo: -120000,        // Custo maior que receita
  desoneracao: 5000,
  receita: 100000
};
const custoAjustado2 = Math.abs(exemplo2.custo) - exemplo2.desoneracao;  // 115000
const margem2 = (1 - (custoAjustado2 / exemplo2.receita)) * 100;        // -15%
```

## Processamento de Valores

### Processamento Mensal
```typescript
// Exemplo de processamento mensal
const processarTransacoesMes = (mes: number, ano: number): DadosMes => {
  const dadosMes: DadosMes = {
    receita: 79372.04,    // Valor fixo da receita mensal
    desoneracao: 3785.63, // Valor fixo da desoneração
    custo: -71578.23,     // Valor fixo do custo (negativo)
    margem: 0
  };

  // Cálculo da margem
  const custoAjustado = Math.abs(dadosMes.custo) - dadosMes.desoneracao;
  dadosMes.margem = (1 - (custoAjustado / dadosMes.receita)) * 100;

  return dadosMes;
};
```

### Cálculo Acumulado
```typescript
// Exemplo de cálculo acumulado
const calcularAcumulado = (dadosMes: DadosMes, acumulado: DadosMes) => {
  acumulado.receita += dadosMes.receita;
  acumulado.desoneracao += dadosMes.desoneracao;
  acumulado.custo += dadosMes.custo;

  const custoAjustadoAcumulado = Math.abs(acumulado.custo) - acumulado.desoneracao;
  acumulado.margem = (1 - (custoAjustadoAcumulado / acumulado.receita)) * 100;
};
```

### Processamento de Custos
```typescript
// Exemplo completo de processamento
// 1. Recebimento e validação da transação
if (transacao.natureza === 'CUSTO' && isCustoValido(transacao.contaResumo)) {
  // Mantém o valor negativo original
  const valorProcessado = -Math.abs(transacao.valor);
  
  // Armazena no banco mantendo o sinal negativo
  await salvarTransacao({
    ...transacao,
    valor: valorProcessado
  });
}
```

## Regras de Exibição

### Cores por Tipo
- **Receitas**: Verde (#008000)
- **Custos**: Vermelho (#FF0000)
- **Desoneração**: Azul (#0000FF)
- **Margem Positiva**: Verde (#008000)
- **Margem Negativa**: Vermelho (#FF0000)

### Formatação de Valores
- **Valores monetários**: R$ #.###,## (duas casas decimais)
- **Percentuais**: ##,##% (duas casas decimais)
- **Sinais**: Mantidos conforme regra de cada tipo

### Totalizadores
- **Mensal**: Soma dos valores do mês
- **Acumulado**: Soma progressiva até o mês atual
- **Média**: Total acumulado dividido pelo número de meses

## Validação de Valores

### Verificações Mensais Obrigatórias
✅ **Receita mensal** = R$ 79.372,04  
✅ **Desoneração mensal** = R$ 3.785,63  
✅ **Custo mensal** = R$ -71.578,23  
✅ **Acumulados** = Soma dos valores mensais até o mês atual  

### Alertas de Inconsistência
⚠️ **Atenção**: Se um custo aparecer como positivo em qualquer mês, isso indica um problema no processamento dos dados.

⚠️ **Tratamento de Sinais**: Os custos são mantidos como valores negativos durante todo o processamento para garantir a integridade dos dados. O valor absoluto (Math.abs) é aplicado apenas no momento do cálculo da margem.

## Tipos de Dados

### Interface DadosMes
```typescript
interface DadosMes {
  receita: number;      // Sempre positivo
  desoneracao: number;  // Sempre positivo  
  custo: number;        // Sempre negativo
  margem: number;       // Pode ser positivo ou negativo
}
```

### Interface Transacao
```typescript
interface Transacao {
  id: string;
  natureza: 'RECEITA' | 'CUSTO' | 'DESONERACAO';
  contaResumo: string;
  valor: number;        // Negativo para custos, positivo para receitas
  data: string;         // Formato M/YYYY
  projeto: string;
}
```

## Considerações de Performance

### Otimizações Implementadas
- Cache de cálculos de margem
- Processamento em lote para grandes volumes
- Índices otimizados para consultas por período
- Validação prévia antes do processamento

### Monitoramento
- Log de inconsistências nos cálculos
- Alertas para valores fora do padrão esperado
- Métricas de performance dos cálculos
- Auditoria de alterações nos valores fixos 