import { Professional } from '../../types/talent/Professional';

export interface AIResponse {
  message: string;
  provider: 'groq' | 'together' | 'llama-free' | 'offline';
  timestamp: Date;
  responseTime?: number;
}

export interface AIProvider {
  name: string;
  isAvailable: () => Promise<boolean>;
  generateResponse: (query: string, context: string) => Promise<string>;
  maxTokens?: number;
  model?: string;
}

// Sistema de IA offline como fallback
class OfflineAI implements AIProvider {
  name = 'offline';
  
  async isAvailable(): Promise<boolean> {
    return true; // Sempre disponível
  }

  async generateResponse(query: string, context: string): Promise<string> {
    const lowerQuery = query.toLowerCase();
    
    // Análises específicas baseadas em palavras-chave
    if (lowerQuery.includes('quantos') || lowerQuery.includes('total')) {
      const lines = context.split('\n').filter(line => line.trim());
      return `Com base nos dados disponíveis, encontrei ${lines.length} registros de profissionais. Posso ajudar você a filtrar ou analisar informações específicas sobre essas pessoas.`;
    }
    
    if (lowerQuery.includes('react') || lowerQuery.includes('javascript') || lowerQuery.includes('typescript')) {
      return `Vejo que você está interessado em profissionais de desenvolvimento frontend/fullstack. Posso ajudar a filtrar por tecnologias específicas como React, JavaScript, TypeScript e outras. Que tipo de análise você gostaria de fazer?`;
    }
    
    if (lowerQuery.includes('senior') || lowerQuery.includes('junior') || lowerQuery.includes('pleno')) {
      return `Para análise de senioridade, posso verificar os níveis de proficiência dos colaboradores. Você gostaria de ver a distribuição por nível ou encontrar profissionais específicos?`;
    }
    
    if (lowerQuery.includes('aws') || lowerQuery.includes('azure') || lowerQuery.includes('cloud')) {
      return `Para profissionais de cloud computing, posso filtrar por AWS, Azure, GCP e outras tecnologias de nuvem. Você tem alguma preferência específica de provider?`;
    }
    
    if (lowerQuery.includes('disponível') || lowerQuery.includes('compartilhamento')) {
      return `Posso ajudar a identificar profissionais disponíveis para compartilhamento entre projetos. Você gostaria de ver por percentual de disponibilidade ou localização?`;
    }
    
    // Resposta padrão
    return `Estou aqui para ajudar com análises do banco de talentos! Posso fornecer informações sobre:

• Quantidade de profissionais por tecnologia
• Distribuição por senioridade e regime de trabalho  
• Disponibilidade para compartilhamento
• Localização e alocação atual
• Análises específicas por filtros

O que você gostaria de saber?`;
  }
}

// Llama 3.3 70B gratuito da Together.xyz
class LlamaFreeAI implements AIProvider {
  name = 'llama-free';
  model = 'meta-llama/Llama-3.3-70B-Instruct-Turbo';
  
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('https://api.together.xyz/v1/models', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(query: string, context: string): Promise<string> {
    const prompt = `Você é um assistente especializado em análise de dados de profissionais de TI da HITSS.

DADOS DOS PROFISSIONAIS:
${context}

PERGUNTA DO USUÁRIO: ${query}

Instruções:
1. Analise os dados fornecidos
2. Responda de forma clara e objetiva
3. Use dados específicos quando possível
4. Sugira análises ou filtros relevantes
5. Mantenha um tom profissional e útil

Resposta:`;

    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Não foi possível gerar uma resposta.';
    } catch (error) {
      throw new Error(`Erro na API Together.xyz: ${error}`);
    }
  }
}

// Groq API
class GroqAI implements AIProvider {
  name = 'groq';
  model = 'llama-3.3-70b-versatile';
  
  private getApiKey(): string | null {
    return import.meta.env.VITE_GROQ_API_KEY || null;
  }
  
  async isAvailable(): Promise<boolean> {
    const apiKey = this.getApiKey();
    if (!apiKey) return false;
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(query: string, context: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('API key não configurada');

    const prompt = `Você é um assistente de IA especializado em gestão de talentos tecnológicos da HITSS.

DADOS DISPONÍVEIS:
${context}

PERGUNTA: ${query}

Forneça uma análise clara e acionável baseada nos dados.`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Não foi possível gerar uma resposta.';
    } catch (error) {
      throw new Error(`Erro na API Groq: ${error}`);
    }
  }
}

// Together.xyz Premium
class TogetherAI implements AIProvider {
  name = 'together';
  model = 'meta-llama/Llama-3.3-70B-Instruct-Turbo';
  
  private getApiKey(): string | null {
    return import.meta.env.VITE_TOGETHER_API_KEY || null;
  }
  
  async isAvailable(): Promise<boolean> {
    const apiKey = this.getApiKey();
    if (!apiKey) return false;
    
    try {
      const response = await fetch('https://api.together.xyz/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(query: string, context: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('API key não configurada');

    const prompt = `Você é um assistente especializado em análise de talentos tecnológicos para a HITSS.

CONTEXTO DOS PROFISSIONAIS:
${context}

PERGUNTA: ${query}

Forneça insights valiosos e sugestões práticas baseadas nos dados.`;

    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Não foi possível gerar uma resposta.';
    } catch (error) {
      throw new Error(`Erro na API Together.xyz: ${error}`);
    }
  }
}

// Sistema inteligente que testa e usa a melhor opção disponível
class SmartAI {
  private providers: AIProvider[] = [
    new GroqAI(),        // Mais rápido (200-500ms)
    new TogetherAI(),    // Premium com API key
    new LlamaFreeAI(),   // Gratuito sem API key
    new OfflineAI()      // Sempre disponível
  ];

  async generateResponse(query: string, professionals: Professional[]): Promise<AIResponse> {
    const startTime = Date.now();
    
    // Preparar contexto dos profissionais
    const context = this.prepareContext(professionals);
    
    // Testar providers em ordem de preferência
    for (const provider of this.providers) {
      try {
        console.log(`🤖 Testando provider: ${provider.name}`);
        
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          console.log(`❌ ${provider.name} não disponível`);
          continue;
        }

        console.log(`✅ ${provider.name} disponível, gerando resposta...`);
        const message = await provider.generateResponse(query, context);
        const responseTime = Date.now() - startTime;
        
        console.log(`🎉 Resposta gerada via ${provider.name} em ${responseTime}ms`);
        
        return {
          message,
          provider: provider.name as any,
          timestamp: new Date(),
          responseTime
        };
        
      } catch (error) {
        console.log(`❌ Erro no ${provider.name}:`, error);
        continue;
      }
    }
    
    // Se chegou até aqui, algo deu muito errado
    throw new Error('Nenhum provider de IA disponível');
  }

  private prepareContext(professionals: Professional[]): string {
    if (!professionals.length) {
      return 'Nenhum profissional encontrado na base de dados.';
    }

    const summary = `Total de profissionais: ${professionals.length}

Principais tecnologias:
${this.getTechStats(professionals)}

Distribuição por senioridade:
${this.getSeniorityStats(professionals)}

Disponibilidade para compartilhamento:
${this.getAvailabilityStats(professionals)}`;

    return summary;
  }

  private getTechStats(professionals: Professional[]): string {
    const techs = ['javascript', 'python', 'java', 'react', 'angular', 'aws', 'azure'];
    const stats = techs.map(tech => {
      const count = professionals.filter(p => 
        p[tech as keyof Professional] === 'Sim' || 
        p[tech as keyof Professional] === 'Avançado' ||
        p[tech as keyof Professional] === 'Intermediário'
      ).length;
      return `- ${tech}: ${count} profissionais`;
    }).filter(stat => !stat.includes(': 0'));

    return stats.join('\n');
  }

  private getSeniorityStats(professionals: Professional[]): string {
    const levels = ['Junior', 'Pleno', 'Senior', 'Especialista'];
    return levels.map(level => {
      const count = professionals.filter(p => 
        p.proficiencia_cargo?.toLowerCase().includes(level.toLowerCase())
      ).length;
      return `- ${level}: ${count} profissionais`;
    }).filter(stat => !stat.includes(': 0')).join('\n');
  }

  private getAvailabilityStats(professionals: Professional[]): string {
    const available = professionals.filter(p => p.disponivel_compartilhamento).length;
    const percentages = ['100', '75', '50', '25'];
    
    let stats = `- Disponíveis: ${available} de ${professionals.length}\n`;
    
    percentages.forEach(percent => {
      const count = professionals.filter(p => 
        p.percentual_compartilhamento === percent
      ).length;
      if (count > 0) {
        stats += `- ${percent}%: ${count} profissionais\n`;
      }
    });

    return stats;
  }
}

// Instância singleton
export const smartAI = new SmartAI();

// Hook para uso em componentes React
export const useSmartAI = () => {
  const generateResponse = async (query: string, professionals: Professional[]): Promise<AIResponse> => {
    return await smartAI.generateResponse(query, professionals);
  };

  return { generateResponse };
}; 