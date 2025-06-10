#!/usr/bin/env npx tsx

import { writeFileSync } from 'fs';
import path from 'path';

const envContent = `# 🔒 CONFIGURAÇÕES OBRIGATÓRIAS (Supabase)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_SUPABASE_PROJECT_ID=seu_projeto_id
VITE_SUPABASE_ACCESS_TOKEN=seu_access_token_aqui

# 🔧 Configurações Azure para MCP (Avançado)
AZURE_CLIENT_ID=seu_client_id_aqui
AZURE_TENANT_ID=seu_tenant_id_aqui
AZURE_CLIENT_SECRET=seu_client_secret_aqui
AZURE_OBJECT_ID=seu_object_id_aqui
AZURE_SECRET_ID=seu_secret_id_aqui

# 🌍 Configurações regionais
AZURE_REGION=brazilsouth
LOCALE=pt-BR
TIMEZONE=America/Sao_Paulo

# 🚀 Ambiente de desenvolvimento
NODE_ENV=development
`;

console.log('🔧 Corrigindo arquivo .env...');

try {
  const envPath = path.join(process.cwd(), '.env');
  writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Arquivo .env corrigido com sucesso!');
  console.log('📋 Configurações aplicadas:');
  console.log('   - Template criado para configuração');
  console.log('   - Substitua os valores pelos seus próprios');
  console.log('   - Organizado por categorias');
  console.log('');
  console.log('🔄 Configure suas credenciais antes de usar...');
} catch (error) {
  console.error('❌ Erro ao corrigir .env:', error);
  process.exit(1);
} 