import { collaboratorsService } from '../lib/supabaseCollaboratorsService';

async function testCollaboratorsService() {
  console.log('🚀 Iniciando teste do serviço de colaboradores...\n');
  
  try {
    // 1. Testar conexão
    console.log('📡 1. Testando conexão...');
    const connectionTest = await collaboratorsService.testConnection();
    console.log(`Resultado: ${connectionTest.success ? '✅' : '❌'} ${connectionTest.message}`);
    if (connectionTest.data) {
      console.log(`Dados: ${JSON.stringify(connectionTest.data)}`);
    }
    
    if (!connectionTest.success) {
      console.log('❌ Falha na conexão. Abortando testes.');
      return;
    }
    
    console.log('\n👥 2. Buscando todos os colaboradores...');
    const allCollaborators = await collaboratorsService.getAllCollaborators();
    console.log(`✅ Encontrados: ${allCollaborators.length} colaboradores`);
    
    if (allCollaborators.length > 0) {
      const sample = allCollaborators.slice(0, 3);
      console.log('📋 Amostra dos primeiros colaboradores:');
      sample.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.nome_completo || 'N/A'} (${c.email || 'N/A'}) - ${c.regime || 'N/A'} - ${c.local_alocacao || 'N/A'}`);
      });
    }
    
    console.log('\n📊 3. Buscando estatísticas...');
    const stats = await collaboratorsService.getCollaboratorStats();
    console.log(`✅ Estatísticas calculadas:`);
    console.log(`  • Total: ${stats.total}`);
    console.log(`  • Disponíveis: ${stats.availableForSharing}`);
    console.log(`  • CLT: ${stats.cltCount}`);
    console.log(`  • PJ: ${stats.pjCount}`);
    console.log(`  • Localizações: ${Object.keys(stats.locationStats).length}`);
    
    if (Object.keys(stats.locationStats).length > 0) {
      console.log('  • Distribuição por localização:');
      Object.entries(stats.locationStats).forEach(([location, count]) => {
        console.log(`    - ${location}: ${count}`);
      });
    }
    
    console.log('\n🎯 4. Buscando colaboradores disponíveis...');
    const availableCollaborators = await collaboratorsService.getAvailableCollaborators();
    console.log(`✅ Colaboradores disponíveis: ${availableCollaborators.length}`);
    
    console.log('\n📈 5. Testando distribuição de skills...');
    const skillDistribution = await collaboratorsService.getSkillProficiencyDistribution();
    console.log(`✅ Skills encontradas: ${skillDistribution.length} entradas`);
    
    if (skillDistribution.length > 0) {
      console.log('🔍 Top 5 skills por popularidade:');
      const skillSummary: { [skill: string]: number } = {};
      skillDistribution.forEach(entry => {
        if (entry.proficiency_level !== 'Sem conhecimento') {
          skillSummary[entry.skill_name] = (skillSummary[entry.skill_name] || 0) + entry.professional_count;
        }
      });
      
      const topSkills = Object.entries(skillSummary)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
        
      topSkills.forEach(([skill, count], i) => {
        console.log(`  ${i + 1}. ${skill}: ${count} profissionais`);
      });
    }
    
    console.log('\n✅ Teste do serviço de colaboradores concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    console.error('Stack:', (error as Error).stack);
  }
}

// Exportar para usar em outros contextos
export { testCollaboratorsService };

// Se executado diretamente
if (typeof window === 'undefined') {
  testCollaboratorsService().then(() => {
    console.log('\n🏁 Teste finalizado.');
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
  });
} 