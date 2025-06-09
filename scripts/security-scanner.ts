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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

// Função para output colorido
const log = {
  info: (msg: string) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}${msg}${colors.reset}`),
  critical: (msg: string) => console.log(`${colors.magenta}${msg}${colors.reset}`),
  scan: (msg: string) => console.log(`${colors.cyan}${msg}${colors.reset}`)
};

// Interface para resultados de scan
interface ScanResult {
  file: string;
  line?: number;
  pattern: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  value?: string;
}

// Padrões de busca para credenciais sensíveis
const SECURITY_PATTERNS = [
  // Tokens específicos do projeto
  {
    pattern: /PLACEHOLDER_TOKEN/g,
    severity: 'critical' as const,
    description: 'Token de acesso Supabase hardcoded'
  },
  {
    pattern: /PLACEHOLDER_PROJECT_ID/g,
    severity: 'high' as const,
    description: 'Projeto ID Supabase hardcoded'
  },
  {
    pattern: /8G58Q~D\.hMVQ0I9X5QCeEmsXHwfq~Ealy~aVidxv/g,
    severity: 'critical' as const,
    description: 'Azure Client Secret hardcoded'
  },
  {
    pattern: /PLACEHOLDER_CLIENT_ID/g,
    severity: 'high' as const,
    description: 'Azure Client ID hardcoded'
  },
  {
    pattern: /PLACEHOLDER_TENANT_ID/g,
    severity: 'high' as const,
    description: 'Azure Tenant ID hardcoded'
  },
  {
    pattern: /PLACEHOLDER_OBJECT_ID/g,
    severity: 'high' as const,
    description: 'Azure Object ID hardcoded'
  },
  
  // Padrões genéricos
  {
    pattern: /eyJ[A-Za-z0-9+/=]{50,}/g,
    severity: 'high' as const,
    description: 'Possível JWT Token'
  },
  {
    pattern: /sbp_[A-Za-z0-9_]{40,}/g,
    severity: 'critical' as const,
    description: 'Token de acesso Supabase'
  },
  {
    pattern: /sk-[A-Za-z0-9]{48}/g,
    severity: 'critical' as const,
    description: 'Possível OpenAI API Key'
  },
  {
    pattern: /AIza[0-9A-Za-z\\-_]{35}/g,
    severity: 'high' as const,
    description: 'Google API Key'
  },
  {
    pattern: /ya29\\.[0-9A-Za-z\\-_]+/g,
    severity: 'high' as const,
    description: 'Google OAuth Token'
  },
  {
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'critical' as const,
    description: 'AWS Access Key ID'
  },
  {
    pattern: /github_pat_[A-Za-z0-9_]{82}/g,
    severity: 'critical' as const,
    description: 'GitHub Personal Access Token'
  },
  {
    pattern: /ghp_[A-Za-z0-9]{36}/g,
    severity: 'critical' as const,
    description: 'GitHub Personal Access Token'
  },
  
  // Padrões de senha
  {
    pattern: /(password|senha|pass)\s*[=:]\s*['"]\w{8,}['"]/gi,
    severity: 'medium' as const,
    description: 'Possível senha hardcoded'
  },
  {
    pattern: /(secret|secret_key)\s*[=:]\s*['"]\w{8,}['"]/gi,
    severity: 'high' as const,
    description: 'Possível secret hardcoded'
  },
  
  // URLs com credenciais
  {
    pattern: /https?:\/\/\w+:\w+@[\w.-]+/g,
    severity: 'high' as const,
    description: 'URL com credenciais embedadas'
  },
  
  // Strings de conexão
  {
    pattern: /mongodb:\/\/\w+:\w+@/g,
    severity: 'high' as const,
    description: 'String de conexão MongoDB com credenciais'
  },
  {
    pattern: /postgres:\/\/\w+:\w+@/g,
    severity: 'high' as const,
    description: 'String de conexão PostgreSQL com credenciais'
  }
];

// Função para verificar se arquivo deve ser ignorado
const shouldIgnoreFile = (filePath: string): boolean => {
  const ignorePaths = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    'backups',
    '.env.backup',
    'scripts/security-scanner.ts', // Ignorar este próprio arquivo
    'scripts/clean-hardcoded-secrets.ts' // Ignorar arquivo de limpeza
  ];
  
  return ignorePaths.some(ignored => filePath.includes(ignored));
};

// Função para escanear arquivo
const scanFile = (filePath: string): ScanResult[] => {
  const results: ScanResult[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    SECURITY_PATTERNS.forEach(({ pattern, severity, description }) => {
      let match;
      const globalPattern = new RegExp(pattern.source, pattern.flags);
      
      while ((match = globalPattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        results.push({
          file: filePath,
          line: lineNumber,
          pattern: pattern.source,
          severity,
          description,
          value: match[0].substring(0, 50) + (match[0].length > 50 ? '...' : '')
        });
      }
    });
    
  } catch (error) {
    // Ignorar arquivos que não podem ser lidos como texto
  }
  
  return results;
};

// Função para escanear diretório recursivamente
const scanDirectory = (dirPath: string): ScanResult[] => {
  let results: ScanResult[] = [];
  
  if (shouldIgnoreFile(dirPath)) {
    return results;
  }
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        results = results.concat(scanDirectory(fullPath));
      } else if (stat.isFile()) {
        results = results.concat(scanFile(fullPath));
      }
    }
  } catch (error) {
    // Ignorar diretórios que não podem ser lidos
  }
  
  return results;
};

// Função para gerar relatório
const generateReport = (results: ScanResult[]): void => {
  // Agrupar por severidade
  const grouped = {
    critical: results.filter(r => r.severity === 'critical'),
    high: results.filter(r => r.severity === 'high'),
    medium: results.filter(r => r.severity === 'medium'),
    low: results.filter(r => r.severity === 'low')
  };
  
  const total = results.length;
  
  console.log('');
  log.scan('📊 RELATÓRIO DE SEGURANÇA - HITSS');
  log.scan('=====================================');
  console.log('');
  
  // Estatísticas gerais
  log.info('📈 Estatísticas Gerais:');
  console.log(`- Total de problemas encontrados: ${total}`);
  console.log(`- Críticos: ${grouped.critical.length}`);
  console.log(`- Altos: ${grouped.high.length}`);
  console.log(`- Médios: ${grouped.medium.length}`);
  console.log(`- Baixos: ${grouped.low.length}`);
  console.log(`- Sistema: ${process.platform} ${process.arch}`);
  console.log('');
  
  // Problemas críticos
  if (grouped.critical.length > 0) {
    log.critical('🔥 PROBLEMAS CRÍTICOS:');
    grouped.critical.forEach((result, index) => {
      console.log(`${index + 1}. ${result.file}:${result.line || '?'}`);
      console.log(`   ${colors.red}${result.description}${colors.reset}`);
      console.log(`   Valor: ${colors.yellow}${result.value}${colors.reset}`);
      console.log('');
    });
  }
  
  // Problemas altos
  if (grouped.high.length > 0) {
    log.error('⚠️ PROBLEMAS ALTOS:');
    grouped.high.forEach((result, index) => {
      console.log(`${index + 1}. ${result.file}:${result.line || '?'}`);
      console.log(`   ${colors.red}${result.description}${colors.reset}`);
      console.log(`   Valor: ${colors.yellow}${result.value}${colors.reset}`);
      console.log('');
    });
  }
  
  // Problemas médios
  if (grouped.medium.length > 0) {
    log.warning('⚡ PROBLEMAS MÉDIOS:');
    grouped.medium.forEach((result, index) => {
      console.log(`${index + 1}. ${result.file}:${result.line || '?'}`);
      console.log(`   ${colors.yellow}${result.description}${colors.reset}`);
      console.log(`   Valor: ${colors.cyan}${result.value}${colors.reset}`);
      console.log('');
    });
  }
  
  // Problemas baixos
  if (grouped.low.length > 0) {
    log.info('ℹ️ PROBLEMAS BAIXOS:');
    grouped.low.forEach((result, index) => {
      console.log(`${index + 1}. ${result.file}:${result.line || '?'}`);
      console.log(`   ${colors.blue}${result.description}${colors.reset}`);
      console.log(`   Valor: ${colors.cyan}${result.value}${colors.reset}`);
      console.log('');
    });
  }
  
  // Recomendações
  console.log('');
  log.info('🛠️ RECOMENDAÇÕES:');
  
  if (grouped.critical.length > 0 || grouped.high.length > 0) {
    console.log('AÇÃO IMEDIATA NECESSÁRIA:');
    console.log('1. Revogar todas as credenciais expostas');
    console.log('2. Gerar novas credenciais');
    console.log('3. Executar limpeza: npm run security:clean');
    console.log('4. Atualizar variáveis de ambiente');
  }
  
  if (grouped.medium.length > 0) {
    console.log('AÇÕES MÉDIO PRAZO:');
    console.log('1. Revisar e corrigir possíveis senhas hardcoded');
    console.log('2. Implementar rotação de credenciais');
    console.log('3. Adicionar verificação no CI/CD');
  }
  
  if (total > 0) {
    console.log('SEMPRE:');
    console.log('1. Usar variáveis de ambiente para credenciais');
    console.log('2. Adicionar arquivos sensíveis ao .gitignore');
    console.log('3. Fazer scan regular: npm run security:scan');
    console.log('4. Educar equipe sobre boas práticas de segurança');
  }
  
  console.log('');
  
  // Status final
  if (total === 0) {
    log.success('✅ Nenhum problema de segurança encontrado!');
  } else if (grouped.critical.length > 0) {
    log.critical('🚨 CRÍTICO: Credenciais expostas encontradas!');
    process.exit(1);
  } else if (grouped.high.length > 0) {
    log.error('⚠️ ALTO: Problemas de segurança sérios encontrados!');
    process.exit(1);
  } else {
    log.warning('⚡ Problemas de segurança menores encontrados.');
  }
};

// Função para salvar relatório em arquivo
const saveReport = (results: ScanResult[]): void => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join(' ').split('.')[0];
  const reportPath = `security-report-${timestamp.replace(/\s/g, '_')}.md`;
  
  const reportContent = `# Relatório de Segurança - HITSS

**Data:** ${new Date().toLocaleString()}
**Sistema:** ${process.platform} ${process.arch}
**Node.js:** ${process.version}
**Total de problemas:** ${results.length}

## Resumo por Severidade

- 🔥 Críticos: ${results.filter(r => r.severity === 'critical').length}
- ⚠️ Altos: ${results.filter(r => r.severity === 'high').length}
- ⚡ Médios: ${results.filter(r => r.severity === 'medium').length}
- ℹ️ Baixos: ${results.filter(r => r.severity === 'low').length}

## Detalhes

${results.map((result, index) => `
### ${index + 1}. ${result.severity.toUpperCase()}: ${result.description}

**Arquivo:** \`${result.file}\`${result.line ? `\n**Linha:** ${result.line}` : ''}
**Valor encontrado:** \`${result.value}\`
**Padrão:** \`${result.pattern}\`

`).join('\n')}

## Ações Recomendadas

### Imediatas (Crítico/Alto)
1. Revogar credenciais expostas
2. Gerar novas credenciais  
3. Executar \`npm run security:clean\`
4. Atualizar variáveis de ambiente

### Médio Prazo
1. Implementar rotação automática
2. Configurar alertas de segurança
3. Adicionar verificação no CI/CD

---
*Relatório gerado automaticamente por security-scanner.ts*
`;

  fs.writeFileSync(reportPath, reportContent);
  log.info(`📄 Relatório salvo em: ${reportPath}`);
};

// Função principal
async function securityScan(): Promise<void> {
  log.scan('🔍 HITSS - Scanner de Segurança');
  log.scan('================================');
  console.log('');
  
  log.info('🔎 Escaneando arquivos em busca de credenciais sensíveis...');
  console.log('');
  
  const startTime = Date.now();
  
  // Escanear projeto
  const results = scanDirectory('.');
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log.scan(`⏱️ Scan concluído em ${duration}s`);
  
  // Gerar relatório
  generateReport(results);
  
  // Salvar relatório se houver problemas
  if (results.length > 0) {
    saveReport(results);
  }
  
  console.log('');
  log.info('🔧 Comandos úteis:');
  console.log('- Limpar credenciais: npm run security:clean');
  console.log('- Verificar limpeza: npm run security:verify');
  console.log('- Backup seguro: npm run env:backup');
  console.log('- Setup ambiente: npm run env:setup');
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  securityScan().catch(error => {
    console.error('❌ Erro durante o scan de segurança:', error);
    process.exit(1);
  });
} 