#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

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

function createCleanEnv() {
  log('🧹 Criando arquivo .env limpo com placeholders...', colors.cyan);
  
  const cleanEnvContent = `# Configurações Azure para MCP
AZURE_CLIENT_ID=your_azure_client_id_here
AZURE_TENANT_ID=your_azure_tenant_id_here
AZURE_CLIENT_SECRET=your_azure_client_secret_here
AZURE_OBJECT_ID=your_azure_object_id_here
AZURE_SECRET_ID=your_azure_secret_id_here

# Configurações regionais
AZURE_REGION=brazilsouth
LOCALE=pt-BR
TIMEZONE=America/Sao_Paulo

# Outras configurações do projeto
NODE_ENV=development

# 🔒 CONFIGURAÇÕES OBRIGATÓRIAS (Supabase)
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_ACCESS_TOKEN=your_supabase_access_token_here

VITE_SUPABASE_PROJECT_ID=your_project_id_here
`;

  writeFileSync('.env', cleanEnvContent);
  log('✅ Arquivo .env limpo criado!', colors.green);
}

function cleanScripts() {
  log('🔧 Limpando scripts de segurança...', colors.cyan);
  
  const scriptsToClean = [
    'scripts/clean-hardcoded-secrets.ts',
    'scripts/security-scanner.ts',
    'scripts/upload-env.ts',
    'scripts/verify-no-secrets.ts'
  ];

  const replacements = [
    { from: /EXAMPLE_TOKEN_HERE/g, to: 'PLACEHOLDER_TOKEN' },
    { from: /YOUR_PROJECT_ID/g, to: 'PLACEHOLDER_PROJECT_ID' },
    { from: /YOUR_AZURE_CLIENT_ID/g, to: 'PLACEHOLDER_CLIENT_ID' },
    { from: /YOUR_AZURE_TENANT_ID/g, to: 'PLACEHOLDER_TENANT_ID' },
    { from: /YOUR_AZURE_CLIENT_SECRET/g, to: 'PLACEHOLDER_CLIENT_SECRET' },
    { from: /YOUR_AZURE_OBJECT_ID/g, to: 'PLACEHOLDER_OBJECT_ID' }
  ];

  scriptsToClean.forEach(scriptPath => {
    if (existsSync(scriptPath)) {
      let content = readFileSync(scriptPath, 'utf-8');
      
      replacements.forEach(({ from, to }) => {
        content = content.replace(from, to);
      });
      
      writeFileSync(scriptPath, content);
      log(`✅ Limpo: ${scriptPath}`, colors.green);
    }
  });
}

function removeBackupFiles() {
  log('🗑️ Removendo arquivos de backup com credenciais...', colors.yellow);
  
  try {
    const backupFiles = ['.env.backup.20250609_190327', '.env.original'];
    
    backupFiles.forEach(file => {
      if (existsSync(file)) {
        execSync(`rm "${file}"`);
        log(`✅ Removido: ${file}`, colors.green);
      }
    });
  } catch (error) {
    log(`⚠️ Erro ao remover backups: ${error}`, colors.yellow);
  }
}

function updateGitignore() {
  log('📝 Atualizando .gitignore...', colors.cyan);
  
  const gitignoreAdditions = `
# 🔒 Arquivos sensíveis (Credenciais)
.env.real-backup-*
.env.backup.*
.env.original
.env.production
.env.staging
*.key
*.pem
credentials.json
config.json
secrets/
private/

# 🛡️ Backups de segurança
backups/before-cleanup-*/
`;

  let gitignoreContent = '';
  if (existsSync('.gitignore')) {
    gitignoreContent = readFileSync('.gitignore', 'utf-8');
  }

  if (!gitignoreContent.includes('# 🔒 Arquivos sensíveis')) {
    writeFileSync('.gitignore', gitignoreContent + gitignoreAdditions);
    log('✅ .gitignore atualizado!', colors.green);
  } else {
    log('ℹ️ .gitignore já está atualizado', colors.blue);
  }
}

function main() {
  log('🛡️ HITSS - Limpeza Completa de Segurança', colors.bold + colors.magenta);
  log('============================================', colors.magenta);

  try {
    createCleanEnv();
    cleanScripts();
    removeBackupFiles();
    updateGitignore();

    log('', colors.white);
    log('🎉 Limpeza completa de segurança concluída!', colors.bold + colors.green);
    log('', colors.white);
    log('📋 Próximos passos:', colors.bold + colors.cyan);
    log('1. Execute: npm run security:scan (deve mostrar 0 problemas críticos)', colors.white);
    log('2. Restaure suas credenciais reais no .env para desenvolvimento', colors.white);
    log('3. Revogue as credenciais antigas no Supabase/Azure Dashboard', colors.white);
    log('4. Gere novas credenciais se necessário', colors.white);
    log('5. Faça commit: git add . && git commit -m "🔐 Complete security cleanup"', colors.white);
    log('', colors.white);
    log('⚠️ IMPORTANTE: Use o arquivo .env.real-backup-* para recuperar suas credenciais!', colors.bold + colors.yellow);

  } catch (error) {
    log(`❌ Erro durante a limpeza: ${error}`, colors.red);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as completeSecurityCleanup }; 