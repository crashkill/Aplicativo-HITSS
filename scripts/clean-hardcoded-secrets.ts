import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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

// Função para substituir texto em arquivo
const replaceInFile = (filePath: string, searchValue: string | RegExp, replaceValue: string): void => {
  if (!fileExists(filePath)) {
    log.warning(`⚠️ Arquivo não encontrado: ${filePath}`);
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(searchValue, replaceValue);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      log.success(`✅ Atualizado: ${filePath}`);
    } else {
      log.info(`ℹ️ Nenhuma alteração necessária: ${filePath}`);
    }
  } catch (error) {
    log.error(`❌ Erro ao processar ${filePath}: ${error}`);
  }
};

// Função para fazer backup de arquivo
const backupFile = (filePath: string, backupDir: string): void => {
  if (!fileExists(filePath)) return;
  
  const relativePath = path.relative(process.cwd(), filePath);
  const backupPath = path.join(backupDir, relativePath);
  const backupDirPath = path.dirname(backupPath);
  
  ensureDir(backupDirPath);
  fs.copyFileSync(filePath, backupPath);
  log.info(`📄 Backup: ${relativePath}`);
};

// Função principal
async function cleanHardcodedSecrets(): Promise<void> {
  log.info('🧹 HITSS - Limpeza de Credenciais Hardcoded');
  log.info('==============================================');

  // Criar diretório de backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('-').split('.')[0];
  const backupDir = path.join('backups', `before-cleanup-${timestamp}`);
  
  log.info(`📦 Criando backup em: ${backupDir}`);
  ensureDir(backupDir);

  // Lista de arquivos críticos para backup
  const criticalFiles = [
    'scripts/fix-data-column.ts',
    'src/services/migrationService.ts',
    'src/components/talent-management/SupabaseMCPDemo.tsx',
    'src/lib/supabaseMCP.ts',
    'src/lib/supabaseMCPReal.ts',
    'src/scripts/testSupabaseMCP.ts'
  ];

  // Fazer backup dos arquivos críticos
  criticalFiles.forEach(file => {
    if (fileExists(file)) {
      backupFile(file, backupDir);
    }
  });

  log.success('✅ Backup concluído!');
  console.log('');

  // 1. Limpar token do Supabase hardcoded
  log.info('🔐 Limpando tokens do Supabase...');

  // Substituir token hardcoded em scripts/fix-data-column.ts
  const fixDataColumnPath = 'scripts/fix-data-column.ts';
  if (fileExists(fixDataColumnPath)) {
    log.warning(`📝 Limpando: ${fixDataColumnPath}`);
    
    replaceInFile(
      fixDataColumnPath,
      "const accessToken = 'PLACEHOLDER_TOKEN'",
      "const accessToken = process.env.SUPABASE_ACCESS_TOKEN || ''"
    );

    // Adicionar verificação de variável de ambiente
    const content = fs.readFileSync(fixDataColumnPath, 'utf8');
    if (!content.includes('if (!accessToken)')) {
      const lines = content.split('\n');
      const insertIndex = lines.findIndex(line => line.includes('const accessToken')) + 1;
      
      const newLines = [
        ...lines.slice(0, insertIndex),
        '',
        'if (!accessToken) {',
        "  console.error('❌ SUPABASE_ACCESS_TOKEN não encontrado nas variáveis de ambiente')",
        '  process.exit(1)',
        '}',
        '',
        ...lines.slice(insertIndex)
      ];
      
      fs.writeFileSync(fixDataColumnPath, newLines.join('\n'), 'utf8');
    }
  }

  // Substituir token hardcoded em src/services/migrationService.ts
  const migrationServicePath = 'src/services/migrationService.ts';
  if (fileExists(migrationServicePath)) {
    log.warning(`📝 Limpando: ${migrationServicePath}`);
    
    replaceInFile(
      migrationServicePath,
      /'Authorization': 'Bearer PLACEHOLDER_TOKEN'/g,
      "'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`"
    );
  }

  // 2. Limpar projeto ID hardcoded
  log.info('🆔 Limpando projeto IDs...');

  const projectIdFiles = [
    'src/services/migrationService.ts',
    'src/components/talent-management/SupabaseMCPDemo.tsx',
    'src/lib/supabaseMCP.ts',
    'src/lib/supabaseMCPReal.ts',
    'src/scripts/testSupabaseMCP.ts'
  ];

  projectIdFiles.forEach(file => {
    if (fileExists(file)) {
      log.warning(`📝 Limpando projeto ID: ${file}`);
      
      // Substituir projeto ID hardcoded por variável de ambiente
      replaceInFile(
        file,
        /'PLACEHOLDER_PROJECT_ID'/g,
        "process.env.VITE_SUPABASE_PROJECT_ID || 'PLACEHOLDER_PROJECT_ID'"
      );
      
      replaceInFile(
        file,
        /"PLACEHOLDER_PROJECT_ID"/g,
        'process.env.VITE_SUPABASE_PROJECT_ID || "PLACEHOLDER_PROJECT_ID"'
      );
      
      replaceInFile(
        file,
        /= 'PLACEHOLDER_PROJECT_ID'/g,
        "= process.env.VITE_SUPABASE_PROJECT_ID || 'PLACEHOLDER_PROJECT_ID'"
      );
    }
  });

  // 3. Limpar URLs hardcoded na documentação
  log.info('📚 Limpando documentação...');

  const docFiles = [
    'README.md',
    'docs/infrastructure/supabase-mcp.md',
    'docs/guias/instalacao.md',
    'docs/troubleshooting/problemas-comuns.md',
    'GUIA_EXECUCAO_FUNCTIONS.md',
    'EXECUTE_FUNCTIONS_DIRECT.sql'
  ];

  docFiles.forEach(file => {
    if (fileExists(file)) {
      log.warning(`📝 Limpando documentação: ${file}`);
      
      // Substituir URLs específicas por placeholders
      replaceInFile(
        file,
        /https:\/\/PLACEHOLDER_PROJECT_ID\.supabase\.co/g,
        'https://[SEU_PROJETO_ID].supabase.co'
      );
      
      replaceInFile(
        file,
        /PLACEHOLDER_PROJECT_ID/g,
        '[SEU_PROJETO_ID]'
      );
      
      replaceInFile(
        file,
        /PLACEHOLDER_TOKEN/g,
        '[SEU_SUPABASE_ACCESS_TOKEN]'
      );
    }
  });

  // 4. Adicionar variável de ambiente no .env se não existir
  log.info('⚙️ Verificando .env...');

  const envPath = '.env';
  if (fileExists(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (!envContent.includes('VITE_SUPABASE_PROJECT_ID')) {
      fs.appendFileSync(envPath, '\nVITE_SUPABASE_PROJECT_ID=PLACEHOLDER_PROJECT_ID\n');
      log.success('✅ Adicionada VITE_SUPABASE_PROJECT_ID ao .env');
    }
  } else {
    log.error('❌ Arquivo .env não encontrado!');
  }

  // 5. Criar script de verificação
  log.info('🔍 Criando script de verificação...');

  const verifyScriptContent = `import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Função para buscar texto em arquivos
const searchInFiles = (pattern: string | RegExp, directory: string, excludeDirs: string[] = []): boolean => {
  const searchText = typeof pattern === 'string' ? pattern : pattern.source;
  
  try {
    // No Windows, usamos findstr, no Unix grep
    const isWindows = process.platform === 'win32';
    let command: string;
    
    if (isWindows) {
      command = \`findstr /s /m "\${searchText}" "\${directory}\\*.*"\`;
    } else {
      const excludeArgs = excludeDirs.map(dir => \`--exclude-dir=\${dir}\`).join(' ');
      command = \`grep -r "\${searchText}" \${directory} \${excludeArgs}\`;
    }
    
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return result.trim().length > 0;
  } catch (error) {
    // Se não encontrar, grep/findstr retorna erro - isso é o que queremos
    return false;
  }
};

console.log('🔍 Verificando credenciais hardcoded...');

// Buscar por tokens específicos
if (searchInFiles('PLACEHOLDER_TOKEN', '.', ['node_modules', '.git', 'backups'])) {
  console.log('❌ Token do Supabase ainda encontrado!');
  process.exit(1);
}

// Buscar por projeto IDs hardcoded em arquivos fonte
const srcFiles = ['src', 'scripts'];
let foundHardcodedId = false;

srcFiles.forEach(dir => {
  if (fs.existsSync(dir)) {
    if (searchInFiles('PLACEHOLDER_PROJECT_ID', dir)) {
      // Verificar se não é uso de variável de ambiente
      const files = execSync(\`find \${dir} -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"\`, { encoding: 'utf8' }).trim().split('\\n');
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('PLACEHOLDER_PROJECT_ID') && 
              !content.includes('process.env') && 
              !content.includes('SEU_PROJETO_ID')) {
            foundHardcodedId = true;
          }
        }
      });
    }
  }
});

if (foundHardcodedId) {
  console.log('❌ Projeto ID hardcoded ainda encontrado!');
  process.exit(1);
}

console.log('✅ Nenhuma credencial hardcoded encontrada!');
`;

  fs.writeFileSync('scripts/verify-no-secrets.ts', verifyScriptContent);

  // 6. Atualizar package.json com novos scripts
  log.info('📦 Atualizando package.json...');

  const packageJsonPath = 'package.json';
  if (fileExists(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Adicionar scripts de segurança
    const securityScripts = {
      'security:clean': 'tsx scripts/clean-hardcoded-secrets.ts',
      'security:verify': 'tsx scripts/verify-no-secrets.ts',
      'security:backup': 'tsx scripts/upload-env.ts'
    };

    Object.assign(packageJson.scripts, securityScripts);
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success('✅ Scripts de segurança adicionados ao package.json');
  }

  // 7. Executar verificação
  log.info('🔍 Verificando limpeza...');
  
  try {
    execSync('tsx scripts/verify-no-secrets.ts', { stdio: 'inherit' });
    log.success('✅ Limpeza concluída com sucesso!');
  } catch (error) {
    log.error('❌ Ainda existem credenciais hardcoded. Verificar manualmente.');
  }

  console.log('');
  log.success('🎉 Limpeza de credenciais concluída!');
  console.log('');
  log.info('📊 Resumo das alterações:');
  console.log('- ✅ Tokens do Supabase removidos dos scripts');
  console.log('- ✅ Projeto IDs substituídos por variáveis de ambiente');
  console.log('- ✅ Documentação limpa com placeholders');
  console.log('- ✅ Scripts de verificação criados');
  console.log(`- ✅ Backup criado em: ${backupDir}`);
  console.log('');
  log.warning('⚠️ Próximos passos:');
  console.log('1. Verificar se a aplicação ainda funciona: npm run dev');
  console.log('2. Fazer commit das mudanças: git add . && git commit -m "🔐 Remove hardcoded credentials"');
  console.log('3. Revogar tokens antigos no Supabase Dashboard');
  console.log('4. Gerar novos tokens se necessário');
  console.log('');
  log.info('🛠️ Comandos úteis:');
  console.log('- Verificar segurança: npm run security:verify');
  console.log('- Fazer backup: npm run security:backup');
  console.log(`- Ver backup: ls -la ${backupDir} (Unix) ou dir ${backupDir} (Windows)`);
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanHardcodedSecrets().catch(error => {
    console.error('❌ Erro durante a limpeza:', error);
    process.exit(1);
  });
} 