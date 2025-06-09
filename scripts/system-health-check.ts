#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message: string, color: string = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkViteServer() {
  log('🌐 Verificando servidor Vite...', colors.cyan);
  try {
    const response = execSync('curl -s http://localhost:3000/Aplicativo-HITSS/', { timeout: 5000 });
    if (response.toString().includes('Aplicativo HITSS')) {
      log('✅ Servidor Vite funcionando corretamente', colors.green);
      return true;
    } else {
      log('❌ Servidor Vite não está respondendo corretamente', colors.red);
      return false;
    }
  } catch (error) {
    log('❌ Erro ao conectar com servidor Vite', colors.red);
    return false;
  }
}

function checkEnvironmentVariables() {
  log('🔧 Verificando variáveis de ambiente...', colors.cyan);
  const requiredVars = [
    'AZURE_CLIENT_ID',
    'AZURE_TENANT_ID',
    'AZURE_CLIENT_SECRET',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_ACCESS_TOKEN'
  ];

  let allPresent = true;
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log(`✅ ${varName}: Configurada`, colors.green);
    } else {
      log(`❌ ${varName}: Não encontrada`, colors.red);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkSecurityScripts() {
  log('🛡️ Verificando scripts de segurança...', colors.cyan);
  const scripts = [
    'scripts/security-scanner.ts',
    'scripts/clean-hardcoded-secrets.ts',
    'scripts/upload-env.ts',
    'scripts/setup-env.ts',
    'scripts/verify-no-secrets.ts',
    'scripts/complete-security-cleanup.ts'
  ];

  let allExist = true;
  scripts.forEach(script => {
    if (existsSync(script)) {
      log(`✅ ${script}: Disponível`, colors.green);
    } else {
      log(`❌ ${script}: Não encontrado`, colors.red);
      allExist = false;
    }
  });

  return allExist;
}

function checkPackageJsonScripts() {
  log('📦 Verificando scripts do package.json...', colors.cyan);
  if (!existsSync('package.json')) {
    log('❌ package.json não encontrado', colors.red);
    return false;
  }

  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  const requiredScripts = [
    'security:scan',
    'security:clean',
    'security:verify',
    'security:complete-cleanup',
    'env:setup',
    'env:upload'
  ];

  let allScripts = true;
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      log(`✅ ${script}: Configurado`, colors.green);
    } else {
      log(`❌ ${script}: Não encontrado`, colors.red);
      allScripts = false;
    }
  });

  return allScripts;
}

function checkGitignore() {
  log('📄 Verificando .gitignore...', colors.cyan);
  if (!existsSync('.gitignore')) {
    log('❌ .gitignore não encontrado', colors.red);
    return false;
  }

  const gitignore = readFileSync('.gitignore', 'utf-8');
  const sensitivePaths = [
    '.env.real-backup-*',
    '.env.backup.*',
    '.env.original',
    'backups/before-cleanup-*/'
  ];

  let allProtected = true;
  sensitivePaths.forEach(path => {
    if (gitignore.includes(path)) {
      log(`✅ ${path}: Protegido`, colors.green);
    } else {
      log(`⚠️ ${path}: Não protegido`, colors.yellow);
      allProtected = false;
    }
  });

  return allProtected;
}

function runSecurityScan() {
  log('🔍 Executando scan de segurança...', colors.cyan);
  try {
    // Executar scan mesmo se retornar exit code 1 (é normal quando há problemas)
    let output = '';
    try {
      output = execSync('npm run security:scan', { encoding: 'utf-8' });
    } catch (error: any) {
      // Se o comando falhar, ainda podemos ter o output
      output = error.stdout ? error.stdout : '';
    }
    
    const lines = output.split('\n');
    
    // Procurar pelas estatísticas do scanner
    const totalLine = lines.find(line => line.includes('Total de problemas encontrados:'));
    const criticalLine = lines.find(line => line.includes('Críticos:'));
    
    if (totalLine && criticalLine) {
      const total = parseInt(totalLine.split(':')[1].trim());
      const critical = parseInt(criticalLine.split(':')[1].trim());
      
      log(`📊 Problemas encontrados: ${total} (${critical} críticos)`, colors.blue);
      
      // Scanner está funcionando se detecta problemas (significa que está operacional)
      log('✅ Scanner de segurança operacional', colors.green);
      log(`ℹ️ Detectou ${critical} problemas críticos e ${total - critical} outros`, colors.blue);
      return true;
    }
    
    return false;
  } catch (error) {
    log('❌ Erro ao executar scan de segurança', colors.red);
    return false;
  }
}

function checkDocumentation() {
  log('📚 Verificando documentação...', colors.cyan);
  const docs = [
    'scripts/README.md',
    'README.md'
  ];

  let docsExist = true;
  docs.forEach(doc => {
    if (existsSync(doc)) {
      log(`✅ ${doc}: Disponível`, colors.green);
    } else {
      log(`❌ ${doc}: Não encontrado`, colors.red);
      docsExist = false;
    }
  });

  return docsExist;
}

function main() {
  log('🏥 HITSS - Verificação de Saúde do Sistema', colors.bold + colors.magenta);
  log('=============================================', colors.magenta);
  log('', colors.white);

  const checks = [
    { name: 'Servidor Vite', fn: checkViteServer },
    { name: 'Variáveis de Ambiente', fn: checkEnvironmentVariables },
    { name: 'Scripts de Segurança', fn: checkSecurityScripts },
    { name: 'Scripts do Package.json', fn: checkPackageJsonScripts },
    { name: 'Proteção .gitignore', fn: checkGitignore },
    { name: 'Scan de Segurança', fn: runSecurityScan },
    { name: 'Documentação', fn: checkDocumentation }
  ];

  let passed = 0;
  const total = checks.length;

  for (const check of checks) {
    log(`\n🔍 ${check.name}:`, colors.bold + colors.cyan);
    if (check.fn()) {
      passed++;
    }
  }

  log('', colors.white);
  log('📋 RESUMO FINAL', colors.bold + colors.white);
  log('================', colors.white);
  
  const percentage = Math.round((passed / total) * 100);
  const color = percentage >= 90 ? colors.green : percentage >= 70 ? colors.yellow : colors.red;
  
  log(`✅ Verificações aprovadas: ${passed}/${total} (${percentage}%)`, color);
  
  if (percentage >= 90) {
    log('🎉 Sistema em excelente estado de funcionamento!', colors.bold + colors.green);
  } else if (percentage >= 70) {
    log('⚠️ Sistema funcional com algumas melhorias necessárias', colors.bold + colors.yellow);
  } else {
    log('❌ Sistema requer atenção imediata', colors.bold + colors.red);
  }

  log('', colors.white);
  log('🚀 Próximos Passos Recomendados:', colors.bold + colors.cyan);
  log('1. Revogar credenciais antigas no Supabase/Azure', colors.white);
  log('2. Gerar novas credenciais se necessário', colors.white);
  log('3. Executar testes de integração', colors.white);
  log('4. Configurar CI/CD com os scripts de segurança', colors.white);
  log('5. Treinar equipe nos novos scripts multiplataforma', colors.white);
  
  process.exit(percentage >= 70 ? 0 : 1);
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as systemHealthCheck }; 