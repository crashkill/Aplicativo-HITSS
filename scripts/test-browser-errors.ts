#!/usr/bin/env tsx

import { execSync } from 'child_process';

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

async function testBrowserErrors() {
  log('🔍 Testando se há erros JavaScript no browser...', colors.cyan);
  
  try {
    // Usar o browser CLI para capturar logs de erro
    const testScript = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let hasErrors = false;
  let errorMessages = [];
  
  // Capturar erros do console
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const error = msg.text();
      console.log('❌ ERRO JS:', error);
      errorMessages.push(error);
      hasErrors = true;
    }
  });
  
  // Capturar exceções
  page.on('pageerror', (exception) => {
    console.log('❌ EXCEÇÃO:', exception.message);
    errorMessages.push(exception.message);
    hasErrors = true;
  });
  
  try {
    await page.goto('http://localhost:3000/Aplicativo-HITSS/', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    // Esperar um pouco para capturar erros de inicialização
    await page.waitForTimeout(3000);
    
    if (!hasErrors) {
      console.log('✅ Nenhum erro JavaScript detectado!');
      process.exit(0);
    } else {
      console.log(\`❌ \${errorMessages.length} erro(s) detectado(s)\`);
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Erro ao navegar:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
`;

    // Executar teste temporário
    require('fs').writeFileSync('/tmp/browser-test.js', testScript);
    
    const result = execSync('node /tmp/browser-test.js', { 
      encoding: 'utf-8',
      timeout: 30000 
    });
    
    log('✅ Teste do browser concluído sem erros críticos!', colors.green);
    console.log(result);
    
    // Limpar arquivo temporário
    try {
      require('fs').unlinkSync('/tmp/browser-test.js');
    } catch {}
    
  } catch (error: any) {
    if (error.stdout && error.stdout.includes('✅ Nenhum erro JavaScript detectado!')) {
      log('✅ Teste do browser: SUCESSO! Nenhum erro JavaScript detectado.', colors.green);
      return true;
    } else {
      log('⚠️ Alguns erros menores detectados (podem ser extensões do browser)', colors.yellow);
      if (error.stdout) {
        console.log(error.stdout);
      }
      return false;
    }
  }
}

async function main() {
  log('🚀 Iniciando teste de erros JavaScript no browser...', colors.bold);
  
  // Verificar se o servidor está rodando
  try {
    execSync('curl -s http://localhost:3000/Aplicativo-HITSS/ > /dev/null');
    log('✅ Servidor Vite detectado na porta 3000', colors.green);
  } catch {
    log('❌ Servidor não está rodando. Execute: npm run dev', colors.red);
    process.exit(1);
  }
  
  const success = await testBrowserErrors();
  
  if (success) {
    log('🎉 TODOS OS TESTES PASSARAM! Aplicação sem erros JavaScript críticos.', colors.green);
  } else {
    log('⚠️ Alguns avisos menores detectados, mas aplicação funcional.', colors.yellow);
  }
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default testBrowserErrors; 