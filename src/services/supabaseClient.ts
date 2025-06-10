import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL and Anon Key are required. Using mock mode for development.');
}

// Criar cliente Supabase (mesmo que as credenciais estejam inválidas para evitar erros de inicialização)
export const supabase = createClient(
  supabaseUrl || 'https://mock.supabase.co', 
  supabaseAnonKey || 'mock-key'
);

// Função para verificar se o Supabase está funcionando
export async function isSupabaseConnected(): Promise<boolean> {
  try {
    const { error } = await supabase.from('colaboradores').select('count', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
}

// Mock de dados para desenvolvimento quando Supabase não estiver disponível
export const mockData = {
  colaboradores: [
    {
      id: '1',
      nome_completo: 'João Silva',
      email: 'joao.silva@hitss.com',
      regime: 'CLT',
      local_alocacao: 'São Paulo',
      proficiencia_cargo: 'Senior Developer',
      javascript: 'Sim',
      react: 'Sim',
      typescript: 'Sim',
      aws: 'Sim',
      disponivel_compartilhamento: true,
      percentual_compartilhamento: '50%',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2', 
      nome_completo: 'Maria Santos',
      email: 'maria.santos@hitss.com',
      regime: 'CLT',
      local_alocacao: 'Rio de Janeiro',
      proficiencia_cargo: 'Full Stack Developer',
      javascript: 'Sim',
      react: 'Sim',
      python: 'Sim',
      aws: 'Sim',
      disponivel_compartilhamento: true,
      percentual_compartilhamento: '30%',
      created_at: '2024-01-02T00:00:00.000Z'
    }
  ],
  dre_hitss: [
    {
      id: '1',
      periodo: '01/2025',
      natureza: 'Receita',
      lancamento: 'Projeto A',
      valor: 100000,
      tipo: 'receita',
      relatorio: 'Realizado'
    },
    {
      id: '2',
      periodo: '01/2025', 
      natureza: 'Custo',
      lancamento: 'Salários',
      valor: 60000,
      tipo: 'despesa',
      relatorio: 'Realizado'
    }
  ],
  stats: {
    colaboradores: {
      total: 97,
      disponivel_compartilhamento: 73,
      javascript_proficient: 45,
      react_proficient: 32,
      aws_proficient: 28,
      senior_level: 19
    },
    dashboard: {
      receita_total: 2500000,
      custo_total: 1800000,
      margem: 700000,
      projetos_ativos: 12
    }
  }
};

console.log('🔧 Supabase Client configurado');
console.log(`📊 URL: ${supabaseUrl ? '✅ Configurada' : '❌ Usando mock'}`);
console.log(`🔑 Key: ${supabaseAnonKey ? '✅ Configurada' : '❌ Usando mock'}`);
