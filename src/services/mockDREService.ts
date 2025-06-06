import { DRERecord } from './dreSupabaseService';

interface DREStats {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  totalRegistros: number;
}

export class MockDREService {
  private static instance: MockDREService;
  private data: DRERecord[] = [];

  private constructor() {}

  static getInstance(): MockDREService {
    if (!MockDREService.instance) {
      MockDREService.instance = new MockDREService();
    }
    return MockDREService.instance;
  }

  async createTable(): Promise<void> {
    console.log('🔧 Mock: Tabela DRE simulada criada');
    return Promise.resolve();
  }

  async clearTable(): Promise<void> {
    console.log('🧹 Mock: Limpando dados simulados');
    this.data = [];
    return Promise.resolve();
  }

  async importExcelData(file: File): Promise<{ success: boolean; message: string; recordsImported: number }> {
    console.log('📊 Mock: Simulando importação de', file.name);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Criar dados mock
    const mockRecords: DRERecord[] = Array.from({ length: 150 }, (_, i) => ({
      id: i + 1,
      upload_batch_id: 'mock-batch-' + Date.now(),
      file_name: file.name,
      uploaded_at: new Date().toISOString(),
      tipo: i % 2 === 0 ? 'receita' : 'despesa',
      natureza: i % 2 === 0 ? 'RECEITA' : 'CUSTO',
      descricao: `Descrição do item ${i + 1} - ${i % 2 === 0 ? 'Receita' : 'Despesa'} de consultoria`,
      valor: Math.random() * 100000,
      lancamento: Math.random() * 100000,
      data: new Date().toISOString().split('T')[0],
      categoria: `Categoria ${Math.floor(i / 10) + 1}`,
      projeto: `Projeto ${String.fromCharCode(65 + (i % 5))}`,
      periodo: '2024-01',
      denominacao_conta: `Conta ${i + 1}`,
      conta_resumo: `Resumo ${i + 1}`,
      linha_negocio: 'Consultoria TI',
      relatorio: 'DRE Mensal',
      raw_data: {}
    }));

    this.data = mockRecords;
    
    return {
      success: true,
      message: `✅ Mock: ${mockRecords.length} registros simulados com sucesso!`,
      recordsImported: mockRecords.length
    };
  }

  async getStatistics(): Promise<DREStats> {
    const receitas = this.data.filter(r => r.tipo === 'receita');
    const despesas = this.data.filter(r => r.tipo === 'despesa');
    
    const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = despesas.reduce((sum, r) => sum + r.valor, 0);
    
    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido: totalReceitas - totalDespesas,
      totalRegistros: this.data.length
    };
  }

  async getAllRecords(limit: number = 100): Promise<DRERecord[]> {
    return this.data.slice(0, limit);
  }

  async getRecordsByPeriod(periodo: string): Promise<DRERecord[]> {
    return this.data.filter(r => r.periodo === periodo);
  }

  async getRecordsByProject(projeto: string): Promise<DRERecord[]> {
    return this.data.filter(r => r.projeto === projeto);
  }
}

export const mockDREService = MockDREService.getInstance(); 