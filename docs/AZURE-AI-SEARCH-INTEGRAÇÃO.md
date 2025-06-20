# 🔍 Azure AI Search - Integração HITSS

**Data:** 06/01/2025  
**Status:** Documentação para implementação futura  
**Prioridade:** Média/Alta  

---

## 📋 Visão Geral

O **Azure AI Search** é um serviço de busca inteligente que pode revolucionar as capacidades de pesquisa e análise de dados no sistema HITSS. Esta documentação serve como guia completo para implementação futura.

### 🎯 **Definição**
Azure AI Search (ex-Azure Cognitive Search) é um Search-as-a-Service que adiciona **capacidades de busca inteligente alimentada por IA** aos aplicativos, permitindo busca semântica, processamento de linguagem natural e análise automatizada de documentos.

---

## 🧠 Capacidades Principais

### **Busca Inteligente**
- **Processamento de linguagem natural** - Entende intenção da busca
- **Busca semântica** - Encontra por significado, não apenas palavras-chave
- **Busca vetorial** - Utiliza embeddings para precisão
- **Autocomplete e sugestões** - Interface moderna

### **Tipos de Dados Suportados**
```
✅ Documentos (PDF, Word, Excel, PowerPoint)
✅ Textos estruturados (JSON, CSV)
✅ Imagens (OCR para extração de texto)
✅ Bancos de dados (SQL Server, Cosmos DB, Supabase)
✅ Armazenamento (Azure Blob, Data Lake)
✅ APIs e feeds de dados
```

### **IA Integrada**
- Extração de entidades (pessoas, lugares, organizações)
- Análise de sentimentos
- Detecção de idioma
- Extração de frases-chave
- OCR (reconhecimento de texto em imagens)
- Tradução de texto

---

## 🎯 Casos de Uso Específicos para HITSS

### **1. Dashboard Financeiro Inteligente**
```typescript
// Exemplo de implementação futura
const searchFinancialInsights = async (query: string) => {
  // Consultas naturais como:
  // "Mostre a performance de vendas do último trimestre"
  // "Quais foram os maiores gastos em 2024?"
  // "Identifique tendências de crescimento"
  
  return await azureSearch.search(query, {
    index: 'financial-data',
    semanticConfiguration: 'financial-semantic'
  });
}
```

**Benefícios:**
- Busca natural em dados financeiros
- Insights automáticos de tendências
- Alertas inteligentes de anomalias
- Geração automática de relatórios executivos

### **2. Gestão de Profissionais Avançada**
```typescript
// Busca inteligente de profissionais
const searchProfessionals = async (query: string) => {
  // Consultas como:
  // "Desenvolvedores React com mais de 3 anos"
  // "Quem tem experiência em projetos financeiros?"
  // "Profissionais disponíveis para alocação"
  
  return await azureSearch.search(query, {
    index: 'professionals',
    searchMode: 'all',
    queryType: 'semantic'
  });
}
```

**Benefícios:**
- Matching inteligente profissional-projeto
- Extração automática de habilidades de currículos
- Análise de disponibilidade e competências
- Sugestões de desenvolvimento de carreira

### **3. Análise de Documentos DRE**
```typescript
// Processamento inteligente de planilhas
const analyzeDREDocument = async (document: File) => {
  // Funcionalidades:
  // - Extração automática de números importantes
  // - Detecção de tendências e padrões
  // - Alertas de problemas financeiros
  // - Comparação automática entre períodos
  
  return await azureSearch.analyzeDocument(document, {
    skillset: 'financial-analysis',
    outputFields: ['revenue', 'expenses', 'trends', 'alerts']
  });
}
```

**Benefícios:**
- Processamento automático de planilhas complexas
- Detecção de padrões financeiros
- Geração de resumos executivos
- Alertas proativos de problemas

---

## 🔌 Integração com Infraestrutura Atual

### **Aproveitando MCP Azure-Auth**
O sistema já possui o MCP azure-auth configurado com as credenciais corretas:

```json
// Configuração atual no mcp.json
"azure-auth": {
  "env": {
    "AZURE_CLIENT_ID": "bd89001b-064b-4f28-a1c4-988422e013bb",
    "AZURE_TENANT_ID": "d6c7d4eb-ad17-46c8-a404-f6a92cbead96",
    "AZURE_REGION": "brazilsouth"
  }
}
```

### **Service Layer Proposta**
```typescript
// src/services/azureSearchService.ts
export class AzureSearchService {
  private searchClient: SearchClient;
  private searchAdminClient: SearchIndexClient;
  
  constructor() {
    const credential = new DefaultAzureCredential();
    const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
    
    this.searchClient = new SearchClient(endpoint, 'hitss-index', credential);
    this.searchAdminClient = new SearchIndexClient(endpoint, credential);
  }
  
  // Busca híbrida (texto + vetorial)
  async hybridSearch(query: string, filters?: SearchOptions) {
    return await this.searchClient.search(query, {
      searchMode: 'all',
      queryType: 'semantic',
      semanticConfiguration: 'default',
      vectorQueries: [{
        vector: await this.generateEmbedding(query),
        fields: ['content_vector'],
        kind: 'vector'
      }],
      ...filters
    });
  }
  
  // Análise de documentos
  async analyzeDocument(content: string, type: 'financial' | 'professional') {
    const skillsetName = type === 'financial' ? 'financial-analysis' : 'professional-analysis';
    
    return await this.searchAdminClient.runIndexer(skillsetName, {
      document: content,
      extractionMode: 'intelligent'
    });
  }
  
  // Busca semântica específica para profissionais
  async searchProfessionals(query: string, skills?: string[], availability?: boolean) {
    const filter = this.buildProfessionalFilter(skills, availability);
    
    return await this.searchClient.search(query, {
      filter,
      searchFields: ['nome_completo', 'habilidades', 'experiencia', 'projetos'],
      select: ['id', 'nome_completo', 'email', 'habilidades', 'disponibilidade', 'score'],
      orderBy: ['search.score() desc'],
      top: 20
    });
  }
  
  // Busca em dados financeiros
  async searchFinancialData(query: string, period?: string, type?: string) {
    const filter = this.buildFinancialFilter(period, type);
    
    return await this.searchClient.search(query, {
      filter,
      searchFields: ['descricao', 'categoria', 'subcategoria', 'observacoes'],
      select: ['*'],
      facets: ['categoria', 'mes', 'ano'],
      queryType: 'semantic',
      semanticConfiguration: 'financial-semantic'
    });
  }
  
  private buildProfessionalFilter(skills?: string[], availability?: boolean): string {
    const filters = [];
    
    if (skills && skills.length > 0) {
      const skillsFilter = skills.map(skill => `habilidades/any(h: h eq '${skill}')`).join(' or ');
      filters.push(`(${skillsFilter})`);
    }
    
    if (availability !== undefined) {
      filters.push(`disponivel eq ${availability}`);
    }
    
    return filters.join(' and ');
  }
  
  private buildFinancialFilter(period?: string, type?: string): string {
    const filters = [];
    
    if (period) {
      // Ex: "2024-Q1", "2024-01", "2024"
      if (period.includes('Q')) {
        const [year, quarter] = period.split('-Q');
        const months = this.getQuarterMonths(parseInt(quarter));
        filters.push(`ano eq ${year} and mes in (${months.join(',')})`);
      } else if (period.includes('-')) {
        const [year, month] = period.split('-');
        filters.push(`ano eq ${year} and mes eq ${month}`);
      } else {
        filters.push(`ano eq ${period}`);
      }
    }
    
    if (type) {
      filters.push(`categoria eq '${type}'`);
    }
    
    return filters.join(' and ');
  }
  
  private getQuarterMonths(quarter: number): number[] {
    const quarters = {
      1: [1, 2, 3],
      2: [4, 5, 6],
      3: [7, 8, 9],
      4: [10, 11, 12]
    };
    return quarters[quarter] || [];
  }
  
  private async generateEmbedding(text: string): Promise<number[]> {
    // Integrar com Azure OpenAI para gerar embeddings
    const response = await fetch(process.env.AZURE_OPENAI_ENDPOINT + '/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getAzureToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002'
      })
    });
    
    const data = await response.json();
    return data.data[0].embedding;
  }
  
  private async getAzureToken(): Promise<string> {
    // Usar credenciais do MCP azure-auth
    const credential = new DefaultAzureCredential();
    const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');
    return tokenResponse.token;
  }
}
```

### **Integração com Componentes Existentes**

#### **Dashboard - Busca Inteligente**
```typescript
// src/components/Dashboard/IntelligentSearch.tsx
export const IntelligentSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const searchService = new AzureSearchService();
  
  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchResults = await searchService.hybridSearch(searchQuery);
      setResults(searchResults.results);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="intelligent-search">
      <SearchInput 
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        placeholder="Ex: 'Mostre a performance financeira do último trimestre'"
      />
      
      {loading && <SearchLoading />}
      
      <SearchResults 
        results={results}
        onResultClick={(result) => handleResultClick(result)}
      />
      
      <SearchSuggestions 
        suggestions={[
          "Profissionais disponíveis para projetos React",
          "Gastos com infraestrutura em 2024",
          "Tendências de receita nos últimos 6 meses"
        ]}
      />
    </div>
  );
};
```

#### **Gestão de Profissionais - Busca Semântica**
```typescript
// src/pages/Professionals/ProfessionalSearch.tsx
export const ProfessionalSearch: React.FC = () => {
  const searchService = new AzureSearchService();
  
  const handleSkillBasedSearch = async (query: string) => {
    const results = await searchService.searchProfessionals(query);
    
    return results.map(result => ({
      ...result,
      relevanceScore: result['@search.score'],
      matchedSkills: result['@search.highlights']?.habilidades || [],
      availability: result.disponivel
    }));
  };
  
  return (
    <ProfessionalSearchInterface onSearch={handleSkillBasedSearch} />
  );
};
```

---

## 📊 Estrutura de Índices Proposta

### **1. Índice de Profissionais**
```json
{
  "name": "professionals-index",
  "fields": [
    {"name": "id", "type": "Edm.String", "key": true},
    {"name": "nome_completo", "type": "Edm.String", "searchable": true},
    {"name": "email", "type": "Edm.String", "filterable": true},
    {"name": "habilidades", "type": "Collection(Edm.String)", "searchable": true, "facetable": true},
    {"name": "experiencia_anos", "type": "Edm.Int32", "filterable": true, "sortable": true},
    {"name": "regime", "type": "Edm.String", "filterable": true, "facetable": true},
    {"name": "local_alocacao", "type": "Edm.String", "filterable": true, "facetable": true},
    {"name": "disponivel", "type": "Edm.Boolean", "filterable": true},
    {"name": "projetos_recentes", "type": "Edm.String", "searchable": true},
    {"name": "certificacoes", "type": "Collection(Edm.String)", "searchable": true},
    {"name": "profile_vector", "type": "Collection(Edm.Single)", "searchable": true, "vectorSearchDimensions": 1536}
  ],
  "semanticSearch": {
    "configurations": [
      {
        "name": "professional-semantic",
        "prioritizedFields": {
          "titleField": {"fieldName": "nome_completo"},
          "prioritizedContentFields": [
            {"fieldName": "habilidades"},
            {"fieldName": "projetos_recentes"}
          ],
          "prioritizedKeywordsFields": [
            {"fieldName": "certificacoes"}
          ]
        }
      }
    ]
  }
}
```

### **2. Índice Financeiro**
```json
{
  "name": "financial-index",
  "fields": [
    {"name": "id", "type": "Edm.String", "key": true},
    {"name": "descricao", "type": "Edm.String", "searchable": true},
    {"name": "categoria", "type": "Edm.String", "filterable": true, "facetable": true},
    {"name": "subcategoria", "type": "Edm.String", "filterable": true, "facetable": true},
    {"name": "valor", "type": "Edm.Double", "filterable": true, "sortable": true},
    {"name": "mes", "type": "Edm.Int32", "filterable": true, "facetable": true},
    {"name": "ano", "type": "Edm.Int32", "filterable": true, "facetable": true},
    {"name": "observacoes", "type": "Edm.String", "searchable": true},
    {"name": "tags", "type": "Collection(Edm.String)", "searchable": true, "facetable": true},
    {"name": "content_vector", "type": "Collection(Edm.Single)", "searchable": true, "vectorSearchDimensions": 1536}
  ],
  "semanticSearch": {
    "configurations": [
      {
        "name": "financial-semantic",
        "prioritizedFields": {
          "titleField": {"fieldName": "descricao"},
          "prioritizedContentFields": [
            {"fieldName": "observacoes"},
            {"fieldName": "categoria"}
          ],
          "prioritizedKeywordsFields": [
            {"fieldName": "tags"}
          ]
        }
      }
    ]
  }
}
```

---

## 💰 Considerações de Custo

### **Tiers de Pricing**
```
🆓 Free Tier: 
   - 50MB storage
   - 10.000 documentos
   - 3 índices
   - Ideal para: Desenvolvimento e testes

💰 Basic Tier ($250/mês):
   - 2GB storage
   - 15 unidades de busca
   - Escalabilidade limitada
   - Ideal para: Produção inicial

🚀 Standard Tier ($1000+/mês):
   - Storage escalável
   - Alto throughput
   - Réplicas e partições
   - Ideal para: Produção completa
```

### **Estimativa para HITSS**
- **Dados atuais**: ~97 profissionais + ~14k registros DRE
- **Projeção**: ~100MB de dados indexados
- **Recomendação inicial**: **Basic Tier** seria suficiente
- **Upgrade futuro**: Standard quando houver >50k documentos

---

## 🚀 Roadmap de Implementação

### **Fase 1: Setup Básico (1-2 semanas)**
1. Criar recurso Azure AI Search
2. Configurar índices básicos
3. Implementar indexadores para Supabase
4. Testes de conectividade

### **Fase 2: Integração Frontend (2-3 semanas)**
1. Criar service layer
2. Implementar busca básica no Dashboard
3. Adicionar busca de profissionais
4. Interface de busca unificada

### **Fase 3: IA Avançada (3-4 semanas)**
1. Configurar semantic search
2. Implementar busca vetorial
3. Análise automática de documentos
4. Dashboards de insights

### **Fase 4: Otimização (1-2 semanas)**
1. Fine-tuning de relevância
2. Cache e performance
3. Monitoramento e alertas
4. Documentação final

---

## 🔧 Configurações Técnicas

### **Variáveis de Ambiente Necessárias**
```bash
# .env (via Doppler no futuro)
AZURE_SEARCH_ENDPOINT=https://hitss-search.search.windows.net
AZURE_SEARCH_ADMIN_KEY=<admin-key>
AZURE_SEARCH_QUERY_KEY=<query-key>
AZURE_OPENAI_ENDPOINT=<endpoint-embeddings>
AZURE_OPENAI_KEY=<openai-key>
```

### **Dependências NPM**
```json
{
  "@azure/search-documents": "^12.0.0",
  "@azure/identity": "^4.0.0",
  "@azure/openai": "^1.0.0"
}
```

---

## 📚 Recursos de Referência

### **Documentação Oficial**
- [Azure AI Search Overview](https://docs.microsoft.com/azure/search/)
- [Semantic Search](https://docs.microsoft.com/azure/search/semantic-search-overview)
- [Vector Search](https://docs.microsoft.com/azure/search/vector-search-overview)

### **SDKs e Bibliotecas**
- [@azure/search-documents](https://www.npmjs.com/package/@azure/search-documents)
- [REST API Reference](https://docs.microsoft.com/rest/api/searchservice/)

### **Exemplos e Tutoriais**
- [JavaScript Quickstart](https://docs.microsoft.com/azure/search/search-get-started-javascript)
- [Semantic Search Examples](https://github.com/Azure-Samples/azure-search-javascript-samples)

---

## ✅ Checklist para Implementação Futura

### **Pré-requisitos**
- [ ] Recurso Azure AI Search criado
- [ ] Permissões configuradas no Azure AD
- [ ] Conexão com Supabase estabelecida
- [ ] Chaves e endpoints configurados

### **Desenvolvimento**
- [ ] Service layer implementada
- [ ] Índices criados e configurados
- [ ] Indexadores funcionando
- [ ] Interface de busca desenvolvida

### **Testes**
- [ ] Busca básica funcionando
- [ ] Busca semântica testada
- [ ] Performance adequada
- [ ] Relevância dos resultados validada

### **Deploy**
- [ ] Variáveis de produção configuradas
- [ ] Monitoramento implementado
- [ ] Documentação atualizada
- [ ] Treinamento de usuários realizado

---

**Documento criado por:** Vibe Coding Assistant  
**Última atualização:** 06/01/2025  
**Próxima revisão:** Quando iniciar implementação  
**Status:** 📋 Documentado para implementação futura 