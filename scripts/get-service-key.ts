#!/usr/bin/env npx tsx

console.log('🔑 COMO OBTER A SERVICE ROLE KEY DO SUPABASE');
console.log('===========================================\n');

console.log('📋 PASSOS PARA RESOLVER O PROBLEMA:');
console.log('1. Acesse: https://supabase.com/dashboard/project/pwksgdjjkryqryqrvyja/settings/api');
console.log('2. Na seção "Project API keys"');
console.log('3. Copie a "service_role" key (não a anon key)');
console.log('4. Cole essa chave no arquivo .env como VITE_SUPABASE_ANON_KEY');
console.log('');

console.log('⚠️  IMPORTANTE:');
console.log('   - A Service Role Key bypassa TODAS as políticas de segurança');
console.log('   - Use apenas para desenvolvimento local');
console.log('   - NUNCA faça commit desta chave para repositórios públicos');
console.log('');

console.log('🔧 ALTERNATIVA: Usar variável de ambiente separada');
console.log('   - Adicione no .env: VITE_SUPABASE_SERVICE_KEY=<sua_service_key>');
console.log('   - Modifique o código para usar esta chave quando necessário');
console.log('');

console.log('🌐 LINKS DIRETOS:');
console.log('   API Settings: https://supabase.com/dashboard/project/pwksgdjjkryqryqrvyja/settings/api');
console.log('   Database: https://supabase.com/dashboard/project/pwksgdjjkryqryqrvyja/editor');
console.log('   SQL Editor: https://supabase.com/dashboard/project/pwksgdjjkryqryqrvyja/sql');
console.log('');

// Verificar se já existe service key no env
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  let hasServiceKey = false;
  lines.forEach(line => {
    if (line.includes('SERVICE') && line.includes('KEY')) {
      hasServiceKey = true;
    }
  });
  
  if (hasServiceKey) {
    console.log('✅ Service key encontrada no .env');
  } else {
    console.log('❌ Service key não encontrada no .env');
    console.log('💡 Adicione uma linha como: VITE_SUPABASE_SERVICE_KEY=eyJ...');
  }
} 