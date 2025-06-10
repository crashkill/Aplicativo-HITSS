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

async function investigateTables() {
  console.log('🔍 INVESTIGANDO TABELAS DO SUPABASE');
  console.log('==================================\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Configurações do Supabase não encontradas!');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Lista de tabelas que o código tenta acessar
  const expectedTables = [
    'colaboradores',
    'dre_hitss', 
    'projetos',
    'transactions',
    'projects'
  ];

  console.log('📊 TESTANDO TABELAS ESPERADAS:');
  console.log('===============================');

  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`   ❌ Tabela '${table}': NÃO EXISTE`);
        } else if (error.message.includes('Invalid API key')) {
          console.log(`   ⚠️  Tabela '${table}': Existe mas sem permissão`);
        } else {
          console.log(`   ❌ Tabela '${table}': ${error.message}`);
        }
      } else {
        console.log(`   ✅ Tabela '${table}': Existe e acessível (${data?.length || 0} registros testados)`);
      }
    } catch (err) {
      console.log(`   ❌ Tabela '${table}': Erro de conexão: ${err}`);
    }
  }

  console.log('\n🔍 TENTANDO DESCOBRIR TABELAS EXISTENTES:');
  console.log('==========================================');
  
  // Tentar algumas variações de nomes comuns
  const possibleTableNames = [
    'project',
    'projects', 
    'projeto',
    'projetos',
    'dre',
    'dre_data',
    'financial_data',
    'colaborador',
    'colaboradores',
    'employee',
    'employees',
    'user',
    'users',
    'transaction',
    'transactions'
  ];

  const existingTables = [];
  
  for (const tableName of possibleTableNames) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('count', { count: 'exact', head: true });

      if (!error || !error.message.includes('does not exist')) {
        existingTables.push(tableName);
        console.log(`   ✅ Encontrada: '${tableName}'`);
      }
    } catch (err) {
      // Ignorar erros, apenas tentando descobrir tabelas
    }
  }

  console.log(`\n📋 RESUMO: ${existingTables.length} tabelas encontradas`);
  if (existingTables.length > 0) {
    console.log('   Tabelas confirmadas:', existingTables.join(', '));
  } else {
    console.log('   ⚠️  Nenhuma tabela encontrada - pode ser problema de permissões');
  }

  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('===================');
  console.log('1. Verificar no dashboard do Supabase quais tabelas existem');
  console.log('2. Ajustar o código para usar os nomes corretos das tabelas');
  console.log('3. Criar as tabelas faltantes se necessário');
  console.log('');
  console.log('🔗 Dashboard: https://supabase.com/dashboard/project/pwksgdjjkryqryqrvyja/editor');
}

investigateTables().catch(console.error); 