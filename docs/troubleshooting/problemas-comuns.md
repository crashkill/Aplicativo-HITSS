# 🚨 Troubleshooting - Problemas Comuns

## 🎯 Guia de Resolução Rápida

Esta seção centraliza as soluções para os problemas mais comuns do Aplicativo HITSS.

---

## 🔧 Problemas de Instalação

### **❌ Erro: "npm install falha"**
```bash
# Solução 1: Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Solução 2: Usar versão Node.js compatível
nvm install 18
nvm use 18
npm install

# Solução 3: Usar yarn como alternativa
yarn install
```

### **❌ Erro: "Dependências não encontradas"**
```bash
# Instalar dependências faltantes
npm install @supabase/supabase-js
npm install xlsx react-dropzone
npm install framer-motion
npm install recharts
```

---

## 🌐 Problemas de Execução

### **❌ Erro: "Port 3000 is in use"**
```bash
# Solução: Aplicação já inicia na porta 3001
npm run dev
# Acesse: http://localhost:3001

# Ou mate processos na porta 3000
lsof -ti:3000 | xargs kill -9
```

### **❌ Erro: "Cannot read properties of undefined"**
```bash
# Verifique arquivo .env
cp env.example .env
# Configure as variáveis obrigatórias
```

---

## 🔒 Problemas de Autenticação

### **❌ Login não funciona**
**Credenciais corretas:**
- **Usuário**: `admin`
- **Senha**: `admin`

**Se ainda não funcionar:**
1. Limpe localStorage: `localStorage.clear()`
2. Recarregue a página
3. Tente novamente

### **❌ Redirecionamento após login**
**Solução:**
1. Faça logout
2. Limpe cache do browser
3. Acesse novamente: `http://localhost:3001`

---

## 📊 Problemas Financeiros (DRE)

### **❌ Upload DRE falha**
**Verificações:**
1. ✅ Arquivo Excel válido (.xlsx, .xls, .csv)
2. ✅ Dados têm coluna "Relatorio" = "Realizado"
3. ✅ Valores são numéricos
4. ✅ Período no formato "M/YYYY" (ex: 6/2019)

**Solução:**
```bash
# 1. Verificar tabela existe
npm run migrate

# 2. Limpar dados anteriores se necessário
npx tsx scripts/clean-dre-table.ts

# 3. Testar upload
npm run dev
# Acesse Upload e teste
```

### **❌ Erro: "invalid input syntax for type date"**
**Status:** ✅ **RESOLVIDO**
- Campo `data` alterado de `DATE` para `TEXT`
- Aceita formato "M/YYYY" diretamente

### **❌ DRE Viewer vazio**
1. Verifique se upload foi bem-sucedido
2. Confirme dados na tabela `dre_hitss`
3. Recarregue a página

---

## 👥 Problemas de Gestão de Profissionais

### **❌ Dados não carregam**
**Verificações:**
1. ✅ Conexão Supabase funcionando
2. ✅ Tabela `colaboradores` existe
3. ✅ RLS (Row Level Security) configurado

**Solução:**
```bash
# Verificar MCP Demo
# Gestão de Profissionais > Analytics > MCP Demo
# Teste: "Listar Tabelas"
```

### **❌ Filtros não funcionam**
1. Limpe filtros aplicados
2. Recarregue componente
3. Verifique console para erros

---

## 🔗 Problemas de Conexão Supabase

### **❌ Erro: "Failed to fetch"**
**Verificar configuração:**
```env
# .env
VITE_SUPABASE_URL=https://[SEU_PROJETO_ID].supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

**Testar conexão:**
```bash
# Via MCP Demo
# Gestão de Profissionais > Analytics > MCP Demo
# Clique em "Listar Projetos"
```

### **❌ RLS Policy Error**
**Projeto configurado:**
- ✅ ID: `[SEU_PROJETO_ID]`
- ✅ Nome: Profissionais-HITSS
- ✅ Status: ATIVO

---

## 🎨 Problemas de Interface

### **❌ Tema não muda**
1. Verifique toggle no sidebar
2. Limpe localStorage: `localStorage.removeItem('theme')`
3. Recarregue página

### **❌ Sidebar não aparece**
1. Faça login novamente
2. Verifique se tela é muito pequena
3. Teste responsividade

### **❌ Gráficos não carregam**
```bash
# Verificar dependências
npm list recharts
npm list chart.js

# Reinstalar se necessário
npm install recharts chart.js
```

---

## 🧪 Problemas de Desenvolvimento

### **❌ Erro TypeScript**
```bash
# Verificar tipos
npm run type-check

# Instalar tipos faltantes
npm install @types/node
npm install @types/react
```

### **❌ Erro de Build**
```bash
# Build limpo
npm run build

# Se falhar, verificar:
# 1. Imports corretos
# 2. Tipos TypeScript
# 3. Dependências instaladas
```

### **❌ Hot Reload não funciona**
```bash
# Reiniciar servidor
npm run dev

# Verificar arquivo vite.config.ts
# Confirmar porta correta
```

---

## 🔧 Comandos de Diagnóstico

### **Verificação Completa do Sistema**
```bash
# 1. Verificar Node.js
node --version  # Deve ser 18+

# 2. Verificar dependências
npm list --depth=0

# 3. Executar migrations
npm run migrate

# 4. Testar aplicação
npm run dev

# 5. Verificar logs
# Console do browser para erros JavaScript
```

### **Reset Completo (Último Recurso)**
```bash
# 1. Limpar tudo
rm -rf node_modules package-lock.json .next dist

# 2. Reinstalar
npm install

# 3. Recriar .env
cp env.example .env
# Configure suas chaves

# 4. Executar migrations
npm run migrate

# 5. Iniciar clean
npm run dev
```

---

## 📞 Quando Buscar Ajuda

### **🚨 Problemas Urgentes**
- Sistema não inicia: Siga "Reset Completo"
- Dados perdidos: Verifique backups Supabase
- Erro crítico: Documente erro completo

### **💡 Problemas Menores**
- Interface estranha: Limpe cache do browser
- Performance lenta: Verifique console de erros
- Funcionalidade nova: Consulte esta documentação

### **📧 Documentar Problemas**
**Incluir sempre:**
1. ❌ Erro exato (screenshot + texto)
2. 🔧 Passos para reproduzir
3. 🌐 Browser e versão
4. 💻 Sistema operacional
5. 📋 Versão Node.js (`node --version`)

---

## ✅ Status dos Problemas Conhecidos

### **🎉 Resolvidos**
- ✅ Campo `data` tipo DATE → TEXT *(2024-01-15)*
- ✅ SAPGuiService browser errors *(2024-01-15)*
- ✅ Upload DRE formato M/YYYY *(2024-01-15)*
- ✅ Migrations CLI funcionando *(2024-01-15)*

### **🚧 Monitorando**
- ⚠️ Interface MCP CORS limitations
- ⚠️ React Router v7 warnings (não crítico)
- ⚠️ Multiple GoTrueClient instances (não crítico)

### **📋 Melhorias Planejadas**
- 📱 PWA para uso offline
- 🔔 Notificações push
- 📊 Dashboard analytics avançados

---

**💡 Dica Final**: Mantenha sempre o sistema atualizado com `git pull` e `npm install` após atualizações! 