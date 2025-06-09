import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as os from 'os';

// Cores para output (compatível com Windows e Unix)
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Função para output colorido
const log = {
  info: (msg: string) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}${msg}${colors.reset}`)
};

// Configurações
const REPO_URL = 'https://github.com/crashkill/hitss-config.git';
const TEMP_DIR = path.join(os.tmpdir(), 'hitss-config-setup');
const ENV_FILE = '.env';

// Função para executar comandos cross-platform
const execCommand = (command: string, options: any = {}): string => {
  try {
    return execSync(command, { encoding: 'utf8', ...options });
  } catch (error: any) {
    throw new Error(`Comando falhou: ${command}\n${error.message}`);
  }
};

// Função para verificar se arquivo existe
const fileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

// Função para criar diretório recursivamente
const ensureDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Função para limpar diretório
const cleanDir = (dirPath: string): void => {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

// Função para obter data formatada
const getFormattedDate = (): string => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T').join(' ').split('.')[0];
};

// Função principal
async function setupEnv(): Promise<void> {
  log.info('🔧 HITSS - Setup de Configurações');
  log.info('===================================');

  // Verificar se .env já existe
  if (fileExists(ENV_FILE)) {
    log.warning(`⚠️ Arquivo ${ENV_FILE} já existe!`);
    
    // No Node.js, usamos readline para input cross-platform
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = (question: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(question, (answer) => {
          resolve(answer);
        });
      });
    };

    try {
      const overwrite = await askQuestion('Deseja sobrescrever? (s/N): ');
      rl.close();
      
      if (overwrite.toLowerCase() !== 's' && overwrite.toLowerCase() !== 'sim') {
        log.info('Operação cancelada pelo usuário.');
        return;
      }

      // Fazer backup do .env atual
      const backupPath = `.env.backup.${Date.now()}`;
      fs.copyFileSync(ENV_FILE, backupPath);
      log.info(`📄 Backup criado: ${backupPath}`);
      
    } catch (error) {
      rl.close();
      log.error('❌ Erro ao ler entrada do usuário');
      process.exit(1);
    }
  }

  // Limpar diretório temporário
  cleanDir(TEMP_DIR);

  // Clonar repositório de configurações
  log.info('📥 Baixando configurações do repositório seguro...');
  try {
    execCommand(`git clone ${REPO_URL} "${TEMP_DIR}"`, { stdio: 'pipe' });
  } catch (error) {
    log.error('❌ Erro ao clonar repositório. Verifique suas credenciais do GitHub.');
    process.exit(1);
  }

  // Verificar se o arquivo .env existe no repositório
  const remoteEnvPath = path.join(TEMP_DIR, 'configs', 'env', '.env');
  if (!fileExists(remoteEnvPath)) {
    log.error('❌ Arquivo .env não encontrado no repositório remoto!');
    cleanDir(TEMP_DIR);
    process.exit(1);
  }

  // Copiar .env do repositório
  log.info('📄 Copiando configurações...');
  fs.copyFileSync(remoteEnvPath, ENV_FILE);

  // Verificar integridade do arquivo
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  log.success(`✅ Arquivo ${ENV_FILE} configurado com ${lines.length} variáveis!`);

  // Verificar se há relatórios de segurança disponíveis
  const securityReportPath = path.join(TEMP_DIR, 'configs', 'security', 'sensitive-data-report.md');
  if (fileExists(securityReportPath)) {
    log.info('📋 Relatório de segurança disponível:');
    
    const reportContent = fs.readFileSync(securityReportPath, 'utf8');
    const criticalSection = reportContent.match(/### 🔥 CRÍTICO[\s\S]*?### 📝 MÉDIO/);
    
    if (criticalSection) {
      console.log('\n' + colors.red + '🔥 ARQUIVOS CRÍTICOS IDENTIFICADOS:' + colors.reset);
      const criticalLines = criticalSection[0].split('\n').slice(1, -1);
      criticalLines.forEach(line => {
        if (line.trim() && !line.includes('###')) {
          console.log(colors.yellow + line + colors.reset);
        }
      });
    }
  }

  // Verificar configurações principais
  log.info('🔍 Verificando configurações principais...');
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'AZURE_CLIENT_ID',
    'AZURE_CLIENT_SECRET',
    'AZURE_TENANT_ID'
  ];

  let missingVars: string[] = [];
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    log.warning('⚠️ Variáveis em falta:');
    missingVars.forEach(varName => {
      console.log(`  - ${varName}`);
    });
  } else {
    log.success('✅ Todas as variáveis principais estão configuradas!');
  }

  // Criar ou atualizar .gitignore
  log.info('🚫 Atualizando .gitignore...');
  const gitignorePath = '.gitignore';
  const gitignoreAdditions = [
    '',
    '# Configurações sensíveis',
    '.env',
    '.env.local',
    '.env.*.local',
    '.env.backup.*',
    '',
    '# Arquivos de segurança',
    'configs/',
    'sensitive-data-report.md',
    '',
    '# MCP Configuration (pode conter credenciais)',
    '~/.cursor/mcp.json',
    'mcp.json',
    '',
    '# Backups temporários',
    'backups/',
    '*.backup.*'
  ];

  let gitignoreContent = '';
  if (fileExists(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }

  // Adicionar entradas se não existirem
  const entriesToAdd = gitignoreAdditions.filter(entry => 
    entry === '' || !gitignoreContent.includes(entry)
  );

  if (entriesToAdd.length > 0) {
    fs.appendFileSync(gitignorePath, '\n' + entriesToAdd.join('\n'));
    log.success('✅ .gitignore atualizado com entradas de segurança!');
  }

  // Limpeza
  cleanDir(TEMP_DIR);

  // Relatório final
  console.log('');
  log.success('🎉 Setup concluído com sucesso!');
  console.log('');
  log.info('📊 Resumo:');
  console.log(`- ✅ ${lines.length} variáveis de ambiente configuradas`);
  console.log(`- ✅ Arquivo ${ENV_FILE} criado/atualizado`);
  console.log('- ✅ .gitignore atualizado com entradas de segurança');
  console.log(`- ✅ Sistema: ${process.platform} ${process.arch}`);
  
  if (missingVars.length > 0) {
    console.log(`- ⚠️ ${missingVars.length} variáveis podem precisar de atenção`);
  }

  console.log('');
  log.info('🚀 Próximos passos:');
  console.log('1. Verificar configurações: cat .env (Unix) ou type .env (Windows)');
  console.log('2. Testar aplicação: npm run dev');
  console.log('3. Verificar segurança: npm run security:verify');
  
  if (fileExists(path.join(TEMP_DIR, 'configs', 'security', 'sensitive-data-report.md'))) {
    console.log('4. Revisar relatório de segurança no repositório');
  }

  console.log('');
  log.warning('⚠️ IMPORTANTE:');
  console.log('- Não commitar o arquivo .env');
  console.log('- Verificar se há credenciais hardcoded no código');
  console.log('- Manter o backup em local seguro');
  console.log('- Revogar credenciais antigas se necessário');
  
  console.log('');
  log.info('🛠️ Comandos úteis (cross-platform):');
  console.log('- Backup: npm run env:backup');
  console.log('- Upload: npm run env:upload');
  console.log('- Limpeza: npm run security:clean');
  console.log('- Verificação: npm run security:verify');
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupEnv().catch(error => {
    console.error('❌ Erro durante o setup:', error);
    process.exit(1);
  });
} 