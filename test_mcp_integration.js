#!/usr/bin/env node

// Script de teste para integração MCP Supabase
const { SupabaseMCPRealService } = require('./src/lib/supabaseMCPReal');

async function testMCPIntegration() {
  console.log('🚀 Iniciando teste de integração MCP Supabase...\n');
  
  try {
    // Instanciar o serviço
    const mcpService = new SupabaseMCPRealService();
    
    console.log('📋 1. Testando conexão...');
    const connectionTest = await mcpService.testMCPConnection();
    console.log('Resultado:', connectionTest.success ? '✅' : '❌', connectionTest.message);
    console.log('Dados:', JSON.stringify(connectionTest.data, null, 2));
    
    console.log('\n👥 2. Buscando profissionais...');
    const professionals = await mcpService.getProfessionals();
    console.log(`Encontrados: ${professionals.length} profissionais`);
    
    if (professionals.length > 0) {
      console.log('Amostra:', professionals.slice(0, 2).map(p => ({
        nome: p.nome_completo,
        email: p.email,
        regime: p.regime,
        local: p.local_alocacao
      })));
    }
    
    console.log('\n📊 3. Buscando estatísticas...');
    const stats = await mcpService.getStats();
    console.log('Total profissionais:', stats.total_professionals);
    console.log('Disponíveis:', stats.available_for_sharing);
    console.log('Por expertise:', stats.by_expertise);
    
    console.log('\n🏗️ 4. Testando inicialização do banco...');
    const initResult = await mcpService.initializeDatabase();
    console.log('Resultado:', initResult.success ? '✅' : '❌', initResult.message || initResult.error);
    
    console.log('\n🔍 5. Status final do MCP...');
    const status = mcpService.getMCPStatus();
    console.log('Status:', JSON.stringify(status, null, 2));
    
    console.log('\n✅ Teste de integração concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar teste
testMCPIntegration().then(() => {
  console.log('\n🏁 Teste finalizado.');
}).catch(error => {
  console.error('💥 Erro fatal:', error);
}); 