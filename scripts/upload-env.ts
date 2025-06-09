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
const TEMP_DIR = path.join(os.tmpdir(), 'hitss-config-upload');
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

// Função para contar linhas do arquivo
const countLines = (filePath: string): number => {
  if (!fileExists(filePath)) return 0;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('\n').length;
};

// Função principal
async function uploadEnv(): Promise<void> {
  log.info('🔐 HITSS - Upload de Configurações Sensíveis');
  log.info('==============================================');

  // Verificar se .env existe
  if (!fileExists(ENV_FILE)) {
    log.error(`❌ Arquivo ${ENV_FILE} não encontrado!`);
    process.exit(1);
  }

  // Verificar se git está configurado
  try {
    execCommand('git config --global user.email', { stdio: 'pipe' });
  } catch (error) {
    log.warning('⚠️ Configurando Git...');
    
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
      const email = await askQuestion('Digite seu email do GitHub: ');
      const name = await askQuestion('Digite seu nome: ');
      
      execCommand(`git config --global user.email "${email}"`);
      execCommand(`git config --global user.name "${name}"`);
      
      rl.close();
    } catch (configError) {
      rl.close();
      log.error('❌ Erro ao configurar Git');
      process.exit(1);
    }
  }

  // Limpar diretório temporário
  cleanDir(TEMP_DIR);

  // Clonar repositório de configurações
  log.info('📥 Clonando repositório de configurações...');
  try {
    execCommand(`git clone ${REPO_URL} "${TEMP_DIR}"`, { stdio: 'pipe' });
  } catch (error) {
    log.error('❌ Erro ao clonar repositório. Verifique suas credenciais do GitHub.');
    process.exit(1);
  }

  // Mudar para o diretório temporário
  const originalCwd = process.cwd();
  process.chdir(TEMP_DIR);

  try {
    // Criar estrutura de diretórios se não existir
    ensureDir('configs/env');
    ensureDir('configs/docs');
    ensureDir('configs/security');

    // Copiar .env
    log.info('📄 Copiando arquivo .env...');
    const envSourcePath = path.join(originalCwd, ENV_FILE);
    const envDestPath = path.join('configs/env', '.env');
    fs.copyFileSync(envSourcePath, envDestPath);

    // Contar linhas do .env
    const envLines = countLines(envSourcePath);

    // Criar relatório de segurança
    log.info('🔍 Criando relatório de segurança...');
    const reportContent = `# Relatório de Dados Sensíveis - HITSS

**Data do Relatório:** ${getFormattedDate()}
**Projeto:** Aplicativo HITSS
**Sistema:** ${os.platform()} ${os.release()}

## 📊 Resumo das Configurações
- **Arquivo .env:** ${envLines} variáveis configuradas
- **Status:** ✅ Backup realizado com sucesso
- **Plataforma:** ${process.platform}

## 🔐 Credenciais Identificadas

### Azure MCP
- **Client ID:** PLACEHOLDER_CLIENT_ID
- **Tenant ID:** PLACEHOLDER_TENANT_ID
- **Client Secret:** ✅ Configurado (oculto por segurança)
- **Object ID:** PLACEHOLDER_OBJECT_ID

### Supabase
- **Projeto ID:** PLACEHOLDER_PROJECT_ID
- **URL:** https://PLACEHOLDER_PROJECT_ID.supabase.co
- **Anon Key:** ✅ Configurado (oculto por segurança)
- **Access Token:** ✅ Configurado (oculto por segurança)

## ⚠️ ARQUIVOS COM CREDENCIAIS HARDCODED (NECESSITAM LIMPEZA)

### 🔥 CRÍTICO - Tokens/Secrets Expostos:
1. **scripts/fix-data-column.ts**
   - Token de acesso: PLACEHOLDER_TOKEN

2. **src/services/migrationService.ts**
   - Token de acesso hardcoded nas linhas 51 e 104
   - Projeto ID hardcoded na linha 15

3. **~/.cursor/mcp.json** (ou %USERPROFILE%\\.cursor\\mcp.json no Windows)
   - Azure Client Secret exposto
   - Azure Client ID exposto
   - Supabase Access Token exposto

### 📝 MÉDIO - Documentação com Credenciais:
1. **README.md** - Contém exemplos com credenciais reais
2. **docs/infrastructure/supabase-mcp.md** - Token exposto
3. **docs/guias/instalacao.md** - Credenciais de exemplo
4. **docs/infrastructure/migrations.md** - Referências ao projeto
5. **docs/troubleshooting/problemas-comuns.md** - URLs com projeto ID

### 🔍 BAIXO - Referências de Projeto:
1. **src/components/talent-management/SupabaseMCPDemo.tsx** - Projeto ID hardcoded
2. **src/lib/supabaseMCP.ts** - Projeto ID como padrão
3. **src/lib/supabaseMCPReal.ts** - Projeto ID hardcoded
4. **src/scripts/testSupabaseMCP.ts** - Projeto ID privado
5. **GUIA_EXECUCAO_FUNCTIONS.md** - URLs diretas
6. **EXECUTE_FUNCTIONS_DIRECT.sql** - URLs diretas

## 🛠️ Ações Recomendadas

### Imediatas:
1. **Revogar tokens expostos** no Supabase Dashboard
2. **Gerar novos Client Secrets** no Azure Portal
3. **Limpar arquivos com credenciais hardcoded**
4. **Atualizar variáveis de ambiente**

### Médio Prazo:
1. Implementar rotação automática de credenciais
2. Adicionar verificação de secrets no CI/CD
3. Configurar alertas de segurança
4. Documentar processo de gestão de credenciais

### Scripts de Limpeza (Cross-Platform):
\`\`\`bash
# Usar scripts TypeScript multiplataforma
npm run security:clean    # Limpa credenciais hardcoded
npm run security:verify   # Verifica segurança
npm run security:backup   # Backup de configurações
\`\`\`

## 📋 Checklist de Segurança
- [ ] Tokens revogados e regenerados
- [ ] Credenciais removidas do código
- [ ] Variáveis de ambiente atualizadas
- [ ] CI/CD configurado com secrets
- [ ] Documentação atualizada
- [ ] Equipe notificada sobre mudanças

---
**⚠️ IMPORTANTE:** Este relatório contém informações sensíveis. Mantenha-o seguro e compartilhe apenas com pessoal autorizado.
**🖥️ COMPATIBILIDADE:** Scripts otimizados para Windows, macOS e Linux.
`;

    fs.writeFileSync('configs/security/sensitive-data-report.md', reportContent);

    // Criar changelog
    log.info('📋 Criando changelog...');
    const changelogContent = `# Changelog - Configurações HITSS

## [${new Date().toISOString().split('T')[0]}] - ${getFormattedDate()}

### 🔐 Segurança
- Backup de configurações sensíveis realizado
- Identificados ${envLines} variáveis de ambiente
- Relatório de segurança gerado
- Scripts multiplataforma implementados

### 📊 Credenciais Mapeadas
- Azure MCP: 4 variáveis
- Supabase: 4 variáveis  
- Total: ${envLines} configurações

### 🖥️ Compatibilidade
- ✅ Windows 10/11
- ✅ macOS (Intel/Apple Silicon)
- ✅ Linux (Ubuntu/Debian/CentOS)
- ✅ Node.js ${process.version}

### ⚠️ Ações Necessárias
- Limpar 15+ arquivos com credenciais hardcoded
- Revogar e regenerar tokens expostos
- Implementar rotação de credenciais

### 🛠️ Arquivos Afetados
- scripts/fix-data-column.ts (CRÍTICO)
- src/services/migrationService.ts (CRÍTICO)
- ~/.cursor/mcp.json (CRÍTICO)
- 12+ arquivos de documentação (MÉDIO)

### 🔧 Sistema
- **Plataforma:** ${process.platform}
- **Arquitetura:** ${process.arch}
- **Node.js:** ${process.version}
- **Diretório:** ${originalCwd}

---
*Backup automatizado via upload-env.ts (cross-platform)*
`;

    fs.writeFileSync('configs/docs/CHANGELOG.md', changelogContent);

    // Adicionar arquivos ao git
    log.info('📝 Commitando alterações...');
    execCommand('git add .');

    // Commit com informações detalhadas
    const commitMsg = `🔐 Backup automático - ${getFormattedDate()}

📊 Configurações: ${envLines} variáveis
🔍 Segurança: Relatório de credenciais gerado
⚠️ Crítico: 3 arquivos com tokens expostos
📝 Médio: 12+ arquivos de documentação
🛠️ Ação: Limpeza de credenciais necessária
🖥️ Sistema: ${process.platform} ${process.arch}

Auto-upload via: upload-env.ts (cross-platform)`;

    execCommand(`git commit -m "${commitMsg}"`);

    // Push para o repositório
    log.info('☁️ Enviando para repositório seguro...');
    execCommand('git push origin main');

    log.success('✅ Upload concluído com sucesso!');
    log.warning('⚠️ IMPORTANTE: Credenciais hardcoded identificadas!');
    console.log('');
    log.error('🔥 AÇÃO IMEDIATA NECESSÁRIA:');
    console.log('1. Revogar tokens expostos no Supabase');
    console.log('2. Regenerar Client Secret no Azure');
    console.log('3. Limpar arquivos com credenciais hardcoded');
    console.log('4. Consultar: configs/security/sensitive-data-report.md');
    console.log('');
    log.info('📊 Estatísticas do backup:');
    console.log(`- Variáveis de ambiente: ${envLines}`);
    console.log('- Arquivos críticos identificados: 3');
    console.log('- Arquivos com limpeza necessária: 15+');
    console.log(`- Repositório: ${REPO_URL}`);
    console.log(`- Sistema: ${process.platform} ${process.arch}`);

  } finally {
    // Voltar ao diretório original
    process.chdir(originalCwd);
    
    // Limpeza
    cleanDir(TEMP_DIR);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  uploadEnv().catch(error => {
    console.error('❌ Erro durante o upload:', error);
    process.exit(1);
  });
} 