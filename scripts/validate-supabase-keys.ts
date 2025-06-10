#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import { URL } from 'url';

// Carregar .env manualmente
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

async function validateSupabaseKeys() {
  console.log('🔍 VALIDAÇÃO COMPLETA DAS CHAVES SUPABASE');
  console.log('==========================================\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const accessToken = process.env.VITE_SUPABASE_ACCESS_TOKEN;
  const projectId = process.env.VITE_SUPABASE_PROJECT_ID;

  console.log('📋 Configurações encontradas:');
  console.log(`   URL: ${supabaseUrl || '❌ Não configurada'}`);
  console.log(`   Project ID: ${projectId || '❌ Não configurado'}`);
  console.log(`   Anon Key: ${supabaseAnonKey ? '✅ Configurada (' + supabaseAnonKey.substring(0, 20) + '...)' : '❌ Não configurada'}`);
  console.log(`   Access Token: ${accessToken ? '✅ Configurada (' + accessToken.substring(0, 15) + '...)' : '❌ Não configurada'}`);
  console.log('');

  if (!supabaseUrl || !projectId) {
    console.error('❌ URL e Project ID são obrigatórios!');
    return;
  }

  // Teste 1: Verificar se a URL é válida
  console.log('🌐 Teste 1: Validando URL do projeto...');
  try {
    const url = new URL(supabaseUrl);
    const expectedDomain = `${projectId}.supabase.co`;
    
    if (url.hostname === expectedDomain) {
      console.log(`   ✅ URL válida: ${url.hostname}`);
    } else {
      console.log(`   ⚠️  URL não corresponde ao projeto: esperado ${expectedDomain}, encontrado ${url.hostname}`);
    }
  } catch (error) {
    console.log(`   ❌ URL inválida: ${error}`);
  }

  // Teste 2: Verificar conectividade HTTP básica
  console.log('🔗 Teste 2: Testando conectividade básica...');
  try {
    const url = new URL('/rest/v1/', supabaseUrl);
    const response = await fetch(url.toString());
    console.log(`   📡 Status HTTP: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log('   ✅ Servidor Supabase acessível');
    } else if (response.status === 401) {
      console.log('   ⚠️  Servidor acessível mas retorna 401 (problema de autenticação)');
    } else {
      console.log(`   ❌ Servidor retornou status inesperado: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conectividade: ${error}`);
  }

  // Teste 3: Validar formato da chave anônima
  if (supabaseAnonKey) {
    console.log('🔐 Teste 3: Validando formato da chave anônima...');
    try {
      // Decodificar JWT para verificar se é válido
      const parts = supabaseAnonKey.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        console.log(`   ✅ JWT válido`);
        console.log(`   📊 Dados do token:`);
        console.log(`      - Emissor: ${payload.iss || 'N/A'}`);
        console.log(`      - Projeto: ${payload.ref || 'N/A'}`);
        console.log(`      - Role: ${payload.role || 'N/A'}`);
        console.log(`      - Emitido em: ${payload.iat ? new Date(payload.iat * 1000).toISOString() : 'N/A'}`);
        console.log(`      - Expira em: ${payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A'}`);
        
        // Verificar se expirou
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.log(`   ❌ Token EXPIRADO!`);
        } else {
          console.log(`   ✅ Token dentro da validade`);
        }
        
        // Verificar se o projeto corresponde
        if (payload.ref === projectId) {
          console.log(`   ✅ Token corresponde ao projeto`);
        } else {
          console.log(`   ⚠️  Token projeto (${payload.ref}) não corresponde ao configurado (${projectId})`);
        }
      } else {
        console.log(`   ❌ Formato JWT inválido`);
      }
    } catch (error) {
      console.log(`   ❌ Erro ao decodificar JWT: ${error}`);
    }
  }

  // Teste 4: Testar chave com cliente Supabase
  if (supabaseAnonKey) {
    console.log('🔧 Teste 4: Testando chave com cliente Supabase...');
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Tentar uma operação simples
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log(`   ❌ Erro na autenticação: ${error.message}`);
      } else {
        console.log(`   ✅ Cliente Supabase inicializado com sucesso`);
      }
    } catch (error) {
      console.log(`   ❌ Erro ao criar cliente: ${error}`);
    }
  }

  // Teste 5: Testar access token se disponível
  if (accessToken) {
    console.log('🛡️  Teste 5: Validando access token...');
    try {
      if (accessToken.startsWith('sbp_')) {
        console.log('   ✅ Formato de access token válido');
        
        // Testar com requisição direta
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`   📡 Status com access token: ${response.status}`);
        if (response.status === 200) {
          console.log('   ✅ Access token válido');
        } else {
          console.log('   ❌ Access token inválido ou sem permissões');
        }
      } else {
        console.log('   ⚠️  Formato de access token não reconhecido');
      }
    } catch (error) {
      console.log(`   ❌ Erro ao testar access token: ${error}`);
    }
  }

  console.log('\n🏁 RESUMO DA VALIDAÇÃO');
  console.log('=======================');
  console.log('✅ = Funcionando corretamente');
  console.log('⚠️  = Problema detectado, mas não crítico');
  console.log('❌ = Erro crítico que precisa ser corrigido');
  console.log('');
  console.log('💡 Próximos passos sugeridos:');
  console.log('   1. Se todos os testes passaram mas ainda há erro 401:');
  console.log('      - Verificar Row Level Security (RLS) das tabelas');
  console.log('      - Verificar permissões da role anon no Supabase');
  console.log('   2. Se o token expirou:');
  console.log('      - Gerar nova anon key no dashboard do Supabase');
  console.log('   3. Se o projeto não corresponde:');
  console.log('      - Verificar se está usando as credenciais do projeto correto');
}

validateSupabaseKeys().catch(console.error); 