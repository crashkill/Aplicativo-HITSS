import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Professional } from '../types/talent/Professional';

// Interface para resposta do MCP Supabase
interface SupabaseResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    details?: string;
  };
}

// Hook para buscar profissionais via MCP
export const useProfessionalsMCP = () => {
  return useQuery({
    queryKey: ['professionals-mcp'],
    queryFn: async (): Promise<Professional[]> => {
      try {
        // Aqui usaríamos o MCP do Supabase
        // Como exemplo, vou simular a estrutura
        const response = await fetch('/api/supabase-mcp/professionals', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar profissionais via MCP');
        }

        const result: SupabaseResponse<Professional[]> = await response.json();
        
        if (result.error) {
          throw new Error(result.error.message);
        }

        return result.data || [];
      } catch (error) {
        console.error('Erro no MCP Supabase:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para criar profissional via MCP
export const useCreateProfessionalMCP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (professional: Omit<Professional, 'id' | 'created_at'>): Promise<Professional> => {
      try {
        const response = await fetch('/api/supabase-mcp/professionals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(professional),
        });

        if (!response.ok) {
          throw new Error('Erro ao criar profissional via MCP');
        }

        const result: SupabaseResponse<Professional> = await response.json();
        
        if (result.error) {
          throw new Error(result.error.message);
        }

        return result.data!;
      } catch (error) {
        console.error('Erro ao criar profissional via MCP:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalida e recarrega a lista de profissionais
      queryClient.invalidateQueries({ queryKey: ['professionals-mcp'] });
    },
  });
};

// Hook para atualizar profissional via MCP
export const useUpdateProfessionalMCP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Professional> 
    }): Promise<Professional> => {
      try {
        const response = await fetch(`/api/supabase-mcp/professionals/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar profissional via MCP');
        }

        const result: SupabaseResponse<Professional> = await response.json();
        
        if (result.error) {
          throw new Error(result.error.message);
        }

        return result.data!;
      } catch (error) {
        console.error('Erro ao atualizar profissional via MCP:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals-mcp'] });
    },
  });
};

// Hook para deletar profissional via MCP
export const useDeleteProfessionalMCP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        const response = await fetch(`/api/supabase-mcp/professionals/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao deletar profissional via MCP');
        }

        const result: SupabaseResponse = await response.json();
        
        if (result.error) {
          throw new Error(result.error.message);
        }
      } catch (error) {
        console.error('Erro ao deletar profissional via MCP:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals-mcp'] });
    },
  });
};

// Hook para estatísticas via MCP
export const useProfessionalsStatsMCP = () => {
  return useQuery({
    queryKey: ['professionals-stats-mcp'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/supabase-mcp/professionals/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar estatísticas via MCP');
        }

        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error.message);
        }

        return result.data;
      } catch (error) {
        console.error('Erro ao buscar estatísticas via MCP:', error);
        throw error;
      }
    },
    refetchInterval: 60000, // Atualiza a cada minuto
  });
};

// Função utilitária para executar SQL customizado via MCP
export const executeCustomQuery = async (query: string) => {
  try {
    const response = await fetch('/api/supabase-mcp/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Erro ao executar query customizada via MCP');
    }

    const result: SupabaseResponse = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  } catch (error) {
    console.error('Erro ao executar query via MCP:', error);
    throw error;
  }
}; 