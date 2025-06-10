#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';

async function testSupabaseConnection() {
  console.log('🔍 TESTE DE CONEXÃO SUPABASE');
  console.log('============================\n');

  // Carregar variáveis de ambiente
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('📋 Configurações carregadas:');
  console.log(`   URL: ${supabaseUrl ? '✅ Configurada' : '❌ Não encontrada'}`);
  console.log(`   Key: ${supabaseKey ? '✅ Configurada (' + supabaseKey.substring(0, 20) + '...)' : '❌ Não encontrada'}`);
  console.log('');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Configurações do Supabase não encontradas!');
    return;
  }

  // Criar cliente
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔗 Testando conexões...\n');

  // Teste 1: Verificar tabelas disponíveis
  try {
    console.log('📊 Teste 1: Listando tabelas...');
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    } else {
      console.log(`   ✅ Sucesso: ${tables?.length || 0} tabelas encontradas`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error}`);
  }

  // Teste 2: Verificar tabela colaboradores
  try {
    console.log('👥 Teste 2: Testando tabela colaboradores...');
    const { data, error } = await supabase
      .from('colaboradores')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    } else {
      console.log(`   ✅ Sucesso: Tabela acessível`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error}`);
  }

  // Teste 3: Verificar tabela dre_hitss
  try {
    console.log('💰 Teste 3: Testando tabela dre_hitss...');
    const { data, error } = await supabase
      .from('dre_hitss')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    } else {
      console.log(`   ✅ Sucesso: Tabela acessível`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error}`);
  }

  // Teste 4: Verificar funções RPC
  try {
    console.log('⚙️ Teste 4: Testando funções RPC...');
    const { data, error } = await supabase
      .rpc('get_dashboard_summary');
    
    if (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    } else {
      console.log(`   ✅ Sucesso: Função RPC acessível`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error}`);
  }

  console.log('\n🏁 RESUMO DOS TESTES');
  console.log('===================');
  console.log('Se todos os testes passaram, as credenciais estão corretas.');
  console.log('Se houve erros, pode ser necessário:');
  console.log('  1. Verificar RLS (Row Level Security) das tabelas');
  console.log('  2. Verificar permissões da chave anônima');
  console.log('  3. Verificar se as tabelas existem no banco');
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

testSupabaseConnection().catch(console.error); 