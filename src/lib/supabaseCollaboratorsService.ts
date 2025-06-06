import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

const TABLE_NAME = 'colaboradores';

// Interface baseada no talent-sphere-registry
export interface Collaborator {
  id: string;
  email: string | null;
  hora_ultima_modificacao: string | null;
  nome_completo: string | null;
  regime: string | null;
  local_alocacao: string | null;
  proficiencia_cargo: string | null;
  java: string | null;
  javascript: string | null;
  python: string | null;
  typescript: string | null;
  php: string | null;
  dotnet: string | null;
  react: string | null;
  angular: string | null;
  ionic: string | null;
  flutter: string | null;
  mysql: string | null;
  postgres: string | null;
  oracle_db: string | null;
  sql_server: string | null;
  mongodb: string | null;
  aws: string | null;
  azure: string | null;
  gcp: string | null;
  outras_tecnologias: string | null;
  created_at: string | null;
  disponivel_compartilhamento: boolean | null;
  percentual_compartilhamento: '100' | '75' | '50' | '25' | null;
}

// Interface para dados de proficiência de skills
interface SkillProficiencyEntry {
  skill_name: string;
  proficiency_level: string;
  professional_count: number;
}

// Interface para contagem de tipos de contrato
interface ContractTypeCount {
  tipo_contrato: string;
  quantidade: number;
}

// Interface para estatísticas detalhadas
interface CollaboratorStats {
  total: number;
  availableForSharing: number;
  cltCount: number;
  pjCount: number;
  skillStats: SkillProficiencyEntry[];
  locationStats: { [location: string]: number };
}

export class SupabaseCollaboratorsService {
  private supabaseClient: SupabaseClient;

  constructor() {
    this.supabaseClient = supabase;
  }

  // Buscar todos os colaboradores
  async getAllCollaborators(): Promise<Collaborator[]> {
    try {
      console.log('🔍 Buscando colaboradores do Supabase...');
      
      const { data, error } = await this.supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar colaboradores:', error);
        throw new Error(`Erro ao buscar colaboradores: ${error.message}`);
      }

      console.log(`✅ ${data?.length || 0} colaboradores encontrados`);
      return data || [];
    } catch (error) {
      console.error('❌ Erro na busca de colaboradores:', error);
      throw error;
    }
  }

  // Buscar colaborador por ID
  async getCollaboratorById(id: string): Promise<Collaborator | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Não encontrado
        }
        throw new Error(`Erro ao buscar colaborador: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar colaborador por ID:', error);
      throw error;
    }
  }

  // Buscar colaboradores por skill e proficiência
  async getCollaboratorsBySkillAndProficiency(skillName: string, proficiencyLevel: string): Promise<Collaborator[]> {
    try {
      const { data, error } = await this.supabaseClient.rpc('get_professionals_by_skill_and_proficiency', {
        target_skill_name: skillName,
        target_proficiency_level: proficiencyLevel,
      });

      if (error) {
        throw new Error(`Erro ao buscar colaboradores por skill: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar colaboradores por skill:', error);
      throw error;
    }
  }

  // Buscar distribuição de proficiência de skills
  async getSkillProficiencyDistribution(): Promise<SkillProficiencyEntry[]> {
    try {
      const { data, error } = await this.supabaseClient.rpc('get_skill_proficiency_distribution');

      if (error) {
        throw new Error(`Erro ao buscar distribuição de skills: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar distribuição de skills:', error);
      throw error;
    }
  }

  // Buscar contagem de tipos de contrato
  async getContractTypeCounts(): Promise<ContractTypeCount[]> {
    try {
      const { data, error } = await this.supabaseClient.rpc('get_contract_types_count');

      if (error) {
        throw new Error(`Erro ao buscar tipos de contrato: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar tipos de contrato:', error);
      throw error;
    }
  }

  // Buscar estatísticas completas
  async getCollaboratorStats(): Promise<CollaboratorStats> {
    try {
      console.log('📊 Buscando estatísticas dos colaboradores...');

      // Buscar dados em paralelo
      const [
        collaborators,
        skillDistribution,
        contractTypes
      ] = await Promise.all([
        this.getAllCollaborators(),
        this.getSkillProficiencyDistribution(),
        this.getContractTypeCounts()
      ]);

      // Calcular estatísticas
      const total = collaborators.length;
      const availableForSharing = collaborators.filter(c => c.disponivel_compartilhamento === true).length;
      
      // Contar CLT vs PJ
      let cltCount = 0;
      let pjCount = 0;
      contractTypes.forEach(ct => {
        if (ct.tipo_contrato === 'CLT') cltCount = ct.quantidade;
        if (ct.tipo_contrato === 'PJ') pjCount = ct.quantidade;
      });

      // Calcular estatísticas de localização
      const locationStats: { [location: string]: number } = {};
      collaborators.forEach(c => {
        if (c.local_alocacao) {
          locationStats[c.local_alocacao] = (locationStats[c.local_alocacao] || 0) + 1;
        }
      });

      const stats: CollaboratorStats = {
        total,
        availableForSharing,
        cltCount,
        pjCount,
        skillStats: skillDistribution,
        locationStats
      };

      console.log('✅ Estatísticas calculadas:', {
        total: stats.total,
        availableForSharing: stats.availableForSharing,
        cltCount: stats.cltCount,
        pjCount: stats.pjCount,
        locations: Object.keys(stats.locationStats).length
      });

      return stats;
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      throw error;
    }
  }

  // Buscar colaboradores disponíveis para compartilhamento
  async getAvailableCollaborators(): Promise<Collaborator[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .eq('disponivel_compartilhamento', true)
        .order('nome_completo');

      if (error) {
        throw new Error(`Erro ao buscar colaboradores disponíveis: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar colaboradores disponíveis:', error);
      throw error;
    }
  }

  // Buscar colaboradores por localização
  async getCollaboratorsByLocation(location: string): Promise<Collaborator[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .eq('local_alocacao', location)
        .order('nome_completo');

      if (error) {
        throw new Error(`Erro ao buscar colaboradores por localização: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar colaboradores por localização:', error);
      throw error;
    }
  }

  // Buscar colaboradores por regime de contrato
  async getCollaboratorsByRegime(regime: string): Promise<Collaborator[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .eq('regime', regime)
        .order('nome_completo');

      if (error) {
        throw new Error(`Erro ao buscar colaboradores por regime: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar colaboradores por regime:', error);
      throw error;
    }
  }

  // Testar conexão
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const { count, error } = await this.supabaseClient
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      if (error) {
        return {
          success: false,
          message: `Erro de conexão: ${error.message}`
        };
      }

      return {
        success: true,
        message: `Conexão estabelecida! ${count} colaboradores encontrados.`,
        data: { count }
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao testar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }
}

// Instância singleton
export const collaboratorsService = new SupabaseCollaboratorsService(); 