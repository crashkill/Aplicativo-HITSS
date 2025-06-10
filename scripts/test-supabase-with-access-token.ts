#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';

async function testSupabaseWithAccessToken() {
  console.log('🔍 TESTE SUPABASE COM ACCESS TOKEN');
  console.log('==================================\n');

  // Carregar variáveis de ambiente
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const accessToken = process.env.VITE_SUPABASE_ACCESS_TOKEN;
  
  console.log('📋 Configurações carregadas:');
  console.log(`   URL: ${supabaseUrl ? '✅ Configurada' : '❌ Não encontrada'}`);
  console.log(`   Access Token: ${accessToken ? '✅ Configurada (' + accessToken.substring(0, 15) + '...)' : '❌ Não encontrada'}`);
  console.log('');

  if (!supabaseUrl || !accessToken) {
    console.error('❌ Configurações do Supabase não encontradas!');
    return;
  }

  // Criar cliente com access token como service role
  const supabase = createClient(supabaseUrl, accessToken);
  
  console.log('🔗 Testando conexões com Access Token...\n');

  // Teste 1: Verificar tabela colaboradores
  try {
    console.log('👥 Teste 1: Contando colaboradores...');
    const { count, error } = await supabase
      .from('colaboradores')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    } else {
      console.log(`   ✅ Sucesso: ${count} colaboradores encontrados`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error}`);
  }

  // Teste 2: Verificar tabela dre_hitss
  try {
    console.log('💰 Teste 2: Contando registros DRE...');
    const { count, error } = await supabase
      .from('dre_hitss')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    } else {
      console.log(`   ✅ Sucesso: ${count} registros DRE encontrados`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error}`);
  }

  // Teste 3: Listar algumas entradas de colaboradores
  try {
    console.log('📋 Teste 3: Listando primeiros 5 colaboradores...');
    const { data, error } = await supabase
      .from('colaboradores')
      .select('id, nome_completo, email')
      .limit(5);
    
    if (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    } else {
      console.log(`   ✅ Sucesso: ${data?.length || 0} colaboradores listados`);
      if (data && data.length > 0) {
        data.forEach((col, index) => {
          console.log(`     ${index + 1}. ${col.nome_completo || 'Nome não informado'} (${col.email || 'Email não informado'})`);
        });
      }
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error}`);
  }

  // Teste 4: Verificar funções RPC disponíveis
  try {
    console.log('⚙️ Teste 4: Testando função RPC dashboard...');
    const { data, error } = await supabase
      .rpc('get_dashboard_summary');
    
    if (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('   ℹ️  A função RPC get_dashboard_summary não existe ou não foi criada');
      }
    } else {
      console.log(`   ✅ Sucesso: Função RPC executada`);
      console.log(`   📊 Dados retornados:`, data);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error}`);
  }

  console.log('\n🏁 CONCLUSÃO');
  console.log('=============');
  console.log('Se os testes passaram com Access Token:');
  console.log('  ✅ O problema é com a chave anônima (RLS ou permissões)');
  console.log('  🔧 Considere usar modo de desenvolvimento com Access Token');
  console.log('  ⚠️  Em produção, configure RLS adequadamente');
}

// Carregar .env manualmente se necessário
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
}

testSupabaseWithAccessToken().catch(console.error); 