import * as fs from 'fs';
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
      command = `findstr /s /m "${searchText}" "${directory}\*.*"`;
    } else {
      const excludeArgs = excludeDirs.map(dir => `--exclude-dir=${dir}`).join(' ');
      command = `grep -r "${searchText}" ${directory} ${excludeArgs}`;
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
      const files = execSync(`find ${dir} -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"`, { encoding: 'utf8' }).trim().split('\n');
      
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
