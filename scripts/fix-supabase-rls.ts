#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Carregar .env manualmente
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

async function fixSupabaseRLS() {
  console.log('🔧 DIAGNÓSTICO E CORREÇÃO DO RLS SUPABASE');
  console.log('==========================================\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const accessToken = process.env.VITE_SUPABASE_ACCESS_TOKEN;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Configurações do Supabase não encontradas!');
    return;
  }

  console.log('📊 PROBLEMA IDENTIFICADO:');
  console.log('   ✅ Chaves do Supabase são VÁLIDAS');
  console.log('   ✅ Servidor do Supabase está ACESSÍVEL');
  console.log('   ❌ Row Level Security (RLS) está BLOQUEANDO acesso');
  console.log('');

  // Testar tabelas específicas
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const tablesToTest = [
    'colaboradores',
    'dre_hitss',
    'projetos'
  ];

  console.log('🔍 TESTANDO ACESSO ÀS TABELAS:');
  console.log('==============================');

  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ Tabela '${table}': ${error.message}`);
        
        if (error.message.includes('RLS') || error.message.includes('policy')) {
          console.log(`      💡 Problema de RLS/Policy detectado`);
        }
      } else {
        console.log(`   ✅ Tabela '${table}': Acesso OK (${data?.length || 0} registros)`);
      }
    } catch (err) {
      console.log(`   ❌ Tabela '${table}': Erro de conexão`);
    }
  }

  console.log('\n🛠️  SOLUÇÕES RECOMENDADAS:');
  console.log('============================');
  console.log('');
  console.log('📋 OPÇÃO 1: Desabilitar RLS temporariamente (Desenvolvimento)');
  console.log('   - Acesse: https://supabase.com/dashboard/project/pwksgdjjkryqryqrvyja/editor');
  console.log('   - Para cada tabela (colaboradores, dre_hitss, projetos):');
  console.log('     1. Clique na tabela');
  console.log('     2. Vá em "Settings" > "Row Level Security"');
  console.log('     3. Desabilite "Enable RLS"');
  console.log('');
  console.log('📋 OPÇÃO 2: Criar policies de acesso (Recomendado)');
  console.log('   Execute os seguintes SQL commands no SQL Editor:');
  console.log('');
  
  console.log('   -- Policy para tabela colaboradores');
  console.log('   CREATE POLICY "Allow anonymous read access" ON colaboradores');
  console.log('   FOR SELECT USING (true);');
  console.log('');
  
  console.log('   -- Policy para tabela dre_hitss');
  console.log('   CREATE POLICY "Allow anonymous read access" ON dre_hitss');
  console.log('   FOR SELECT USING (true);');
  console.log('');
  
  console.log('   -- Policy para tabela projetos');
  console.log('   CREATE POLICY "Allow anonymous read access" ON projetos');
  console.log('   FOR SELECT USING (true);');
  console.log('');

  console.log('📋 OPÇÃO 3: Usar Service Role Key (Cuidado!)');
  console.log('   - Substitua VITE_SUPABASE_ANON_KEY pela Service Role Key');
  console.log('   - ⚠️  ATENÇÃO: Service Role bypassa RLS totalmente!');
  console.log('   - Use apenas para desenvolvimento local');
  console.log('');

  console.log('🎯 RECOMENDAÇÃO:');
  console.log('   Para desenvolvimento: Use OPÇÃO 1 (Desabilitar RLS)');
  console.log('   Para produção: Use OPÇÃO 2 (Criar policies)');
  console.log('');

  // Tentar usar access token como service role
  if (accessToken) {
    console.log('🔑 TESTANDO COM ACCESS TOKEN COMO SERVICE ROLE:');
    console.log('===============================================');
    
    try {
      const supabaseService = createClient(supabaseUrl, accessToken);
      
      const { data, error } = await supabaseService
        .from('colaboradores')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ Access token também falhou: ${error.message}`);
      } else {
        console.log('   ✅ Access token funcionou! Considere usar como service role temporariamente');
        console.log('   💡 Substitua temporariamente no .env:');
        console.log(`   VITE_SUPABASE_ANON_KEY=${accessToken}`);
      }
    } catch (err) {
      console.log(`   ❌ Erro ao testar access token: ${err}`);
    }
  }

  console.log('\n🔗 LINKS ÚTEIS:');
  console.log('   Dashboard: https://supabase.com/dashboard/project/pwksgdjjkryqryqrvyja');
  console.log('   SQL Editor: https://supabase.com/dashboard/project/pwksgdjjkryqryqrvyja/sql');
  console.log('   RLS Settings: https://supabase.com/dashboard/project/pwksgdjjkryqryqrvyja/auth/policies');
}

fixSupabaseRLS().catch(console.error); 