#!/usr/bin/env tsx

/**
 * 🔐 Script de Verificação de Segredos Doppler
 * 
 * Verifica se todas as variáveis de ambiente necessárias 
 * estão configuradas no Doppler corretamente.
 */

import { execSync } from 'child_process';

interface SecretCheck {
  name: string;
  required: boolean;
  category: string;
  description: string;
  expectedFormat?: string;
}

const REQUIRED_SECRETS: SecretCheck[] = [
  // Azure AD (Autenticação)
  {
    name: 'VITE_AZURE_CLIENT_ID',
    required: true,
    category: '🔐 Azure AD',
    description: 'Client ID para autenticação Azure AD (frontend)',
    expectedFormat: 'UUID (bd89001b-...)'
  },
  {
    name: 'VITE_AZURE_TENANT_ID',
    required: true,
    category: '🔐 Azure AD',
    description: 'Tenant ID para autenticação Azure AD (frontend)',
    expectedFormat: 'UUID (d6c7d4eb-...)'
  },
  {
    name: 'AZURE_CLIENT_ID',
    required: true,
    category: '🔐 Azure AD',
    description: 'Client ID para operações backend Azure',
    expectedFormat: 'UUID (deve ser igual ao VITE_AZURE_CLIENT_ID)'
  },
  {
    name: 'AZURE_TENANT_ID',
    required: true,
    category: '🔐 Azure AD',
    description: 'Tenant ID para operações backend Azure',
    expectedFormat: 'UUID (deve ser igual ao VITE_AZURE_TENANT_ID)'
  },
  {
    name: 'AZURE_CLIENT_SECRET',
    required: true,
    category: '🔐 Azure AD',
    description: 'Secret para autenticação Azure AD',
    expectedFormat: 'String longa (começando com caracteres alfanuméricos)'
  },
  {
    name: 'AZURE_OBJECT_ID',
    required: false,
    category: '🔐 Azure AD',
    description: 'Object ID da aplicação Azure',
    expectedFormat: 'UUID'
  },
  {
    name: 'AZURE_REGION',
    required: false,
    category: '🔐 Azure AD',
    description: 'Região do Azure',
    expectedFormat: 'brazilsouth'
  },
  {
    name: 'AZURE_SECRET_ID',
    required: false,
    category: '🔐 Azure AD',
    description: 'ID do secret no Azure',
    expectedFormat: 'UUID'
  },

  // Supabase (Banco de Dados)
  {
    name: 'VITE_SUPABASE_URL',
    required: true,
    category: '🗄️ Supabase',
    description: 'URL da instância Supabase',
    expectedFormat: 'https://[project-id].supabase.co'
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    category: '🗄️ Supabase',
    description: 'Chave pública Supabase',
    expectedFormat: 'JWT Token (eyJhbGciOi...)'
  },
  {
    name: 'VITE_SUPABASE_PROJECT_ID',
    required: true,
    category: '🗄️ Supabase',
    description: 'ID do projeto Supabase',
    expectedFormat: 'String (pwksgdjjkryqryqrvyja)'
  },
  {
    name: 'SUPABASE_ACCESS_TOKEN',
    required: true,
    category: '🗄️ Supabase',
    description: 'Token de acesso para APIs administrativas',
    expectedFormat: 'sbp_... token'
  },

  // Stripe (Pagamentos)
  {
    name: 'STRIPE_KEY',
    required: true,
    category: '💳 Stripe',
    description: 'Chave secreta do Stripe',
    expectedFormat: 'sk_live_... ou sk_test_...'
  },

  // IA APIs
  {
    name: 'VITE_GROQ_API_KEY',
    required: false,
    category: '🤖 IA APIs',
    description: 'Chave API do Groq',
    expectedFormat: 'gsk_...'
  },
  {
    name: 'VITE_TOGETHER_API_KEY',
    required: true,
    category: '🤖 IA APIs',
    description: 'Chave API do Together AI',
    expectedFormat: 'String hexadecimal longa'
  },

  // Funcionalidades
  {
    name: 'VITE_MCP_ENABLED',
    required: false,
    category: '⚙️ Funcionalidades',
    description: 'Habilitar MCP (Model Context Protocol)',
    expectedFormat: 'true ou false'
  }
];

interface VerificationResult {
  name: string;
  status: 'OK' | 'MISSING' | 'INVALID' | 'PLACEHOLDER';
  value?: string;
  maskedValue?: string;
  issue?: string;
  category: string;
  required: boolean;
}

function maskSecret(value: string): string {
  if (value.length <= 8) return '*'.repeat(value.length);
  
  const start = value.substring(0, 4);
  const end = value.substring(value.length - 4);
  const middle = '*'.repeat(Math.max(value.length - 8, 3));
  
  return `${start}${middle}${end}`;
}

function validateSecret(secret: SecretCheck, value: string | undefined): VerificationResult {
  const result: VerificationResult = {
    name: secret.name,
    status: 'OK',
    value,
    category: secret.category,
    required: secret.required
  };

  if (!value || value.trim() === '') {
    result.status = 'MISSING';
    result.issue = 'Variável não definida ou vazia';
    return result;
  }

  result.maskedValue = maskSecret(value);

  // Verificar placeholders conhecidos
  const placeholders = [
    'sua_groq_key_aqui',
    'your_key_here',
    'placeholder',
    'TODO',
    'CHANGE_ME'
  ];

  if (placeholders.some(placeholder => 
    value.toLowerCase().includes(placeholder.toLowerCase())
  )) {
    result.status = 'PLACEHOLDER';
    result.issue = 'Contém valor placeholder, não é uma chave real';
    return result;
  }

  // Validações específicas por formato
  if (secret.expectedFormat) {
    if (secret.expectedFormat.includes('UUID')) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        result.status = 'INVALID';
        result.issue = 'Formato UUID inválido';
      }
    }

    if (secret.expectedFormat.includes('JWT')) {
      if (!value.startsWith('eyJ')) {
        result.status = 'INVALID';
        result.issue = 'Formato JWT inválido';
      }
    }

    if (secret.expectedFormat.includes('https://')) {
      if (!value.startsWith('https://')) {
        result.status = 'INVALID';
        result.issue = 'URL deve começar com https://';
      }
    }

    if (secret.expectedFormat.includes('gsk_')) {
      if (!value.startsWith('gsk_')) {
        result.status = 'INVALID';
        result.issue = 'Chave Groq deve começar com gsk_';
      }
    }

    if (secret.expectedFormat.includes('sk_')) {
      if (!value.startsWith('sk_')) {
        result.status = 'INVALID';
        result.issue = 'Chave Stripe deve começar com sk_';
      }
    }

    if (secret.expectedFormat.includes('sbp_')) {
      if (!value.startsWith('sbp_')) {
        result.status = 'INVALID';
        result.issue = 'Token Supabase deve começar com sbp_';
      }
    }
  }

  return result;
}

function getDopplerSecrets(): Record<string, string> {
  try {
    console.log('🔍 Obtendo segredos do Doppler...\n');
    
    // Executar doppler run -- env para obter todas as variáveis
    const output = execSync('doppler run -- env', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const secrets: Record<string, string> = {};
    
    output.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        secrets[key] = value;
      }
    });

    return secrets;
  } catch (error) {
    console.error('❌ Erro ao obter segredos do Doppler:', error);
    process.exit(1);
  }
}

function printResults(results: VerificationResult[]) {
  console.log('📊 RELATÓRIO DE VERIFICAÇÃO DE SEGREDOS\n');
  console.log('='.repeat(70) + '\n');

  const categories = [...new Set(results.map(r => r.category))];
  
  let totalOK = 0;
  let totalIssues = 0;
  let criticalIssues = 0;

  categories.forEach(category => {
    console.log(`\n${category}`);
    console.log('-'.repeat(category.length + 4));

    const categoryResults = results.filter(r => r.category === category);
    
    categoryResults.forEach(result => {
      const icon = result.status === 'OK' ? '✅' : 
                   result.status === 'MISSING' ? '❌' : 
                   result.status === 'PLACEHOLDER' ? '🔄' : '⚠️';
      
      const status = result.status === 'OK' ? 'OK' :
                     result.status === 'MISSING' ? 'FALTANDO' :
                     result.status === 'PLACEHOLDER' ? 'PLACEHOLDER' : 'INVÁLIDO';

      console.log(`${icon} ${result.name}`);
      console.log(`   Status: ${status}`);
      
      if (result.maskedValue) {
        console.log(`   Valor: ${result.maskedValue}`);
      }
      
      if (result.issue) {
        console.log(`   ⚠️  Problema: ${result.issue}`);
      }
      
      if (result.required) {
        console.log(`   🔥 OBRIGATÓRIO`);
        if (result.status !== 'OK') {
          criticalIssues++;
        }
      }
      
      console.log('');

      if (result.status === 'OK') {
        totalOK++;
      } else {
        totalIssues++;
      }
    });
  });

  console.log('\n' + '='.repeat(70));
  console.log('\n📈 RESUMO FINAL:');
  console.log(`✅ Configurados corretamente: ${totalOK}`);
  console.log(`⚠️  Com problemas: ${totalIssues}`);
  console.log(`🔥 Problemas críticos: ${criticalIssues}`);

  if (criticalIssues > 0) {
    console.log('\n🚨 AÇÃO NECESSÁRIA:');
    console.log('Execute os comandos no arquivo CONFIGURACAO-DOPPLER-SEGREDOS.md');
    process.exit(1);
  } else {
    console.log('\n🎉 Todos os segredos obrigatórios estão configurados!');
  }
}

function main() {
  console.log('🔐 VERIFICADOR DE SEGREDOS DOPPLER - Aplicativo HITSS');
  console.log('='.repeat(60) + '\n');

  const dopplerSecrets = getDopplerSecrets();
  const results: VerificationResult[] = [];

  REQUIRED_SECRETS.forEach(secret => {
    const result = validateSecret(secret, dopplerSecrets[secret.name]);
    results.push(result);
  });

  printResults(results);
}

if (require.main === module) {
  main();
} 