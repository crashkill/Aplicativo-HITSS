# 🚀 Comandos Rápidos - Aplicativo HITSS

## ⚡ Execução da Aplicação

### 🎯 **Comando Principal (Recomendado)**
```bash
npm run dev
```
*Executa com Doppler (variáveis de ambiente necessárias)*

### 🔧 **Comandos Alternativos**
```bash
# Explicitamente com Doppler
npm run dev:doppler

# Sem Doppler (modo mock - apenas para desenvolvimento)
npm run dev:local

# Alias para o comando principal
npm start
```

## 🔍 **Verificações**

### ✅ **Verificar Doppler**
```bash
npm run doppler:check
```

### 📊 **Verificar Saúde do Sistema**
```bash
npm run system:health
```

## 🌐 **URLs**

- **Aplicação**: http://localhost:3001/Aplicativo-HITSS/
- **Dashboard**: http://localhost:3001/dashboard

## ⚠️ **Importante**

- ✅ **Recomendado**: `npm run dev` (com Doppler)
- ❌ **Evitar**: `npm run dev:local` (modo mock limitado)

### 🔑 **Primeira Configuração**
Se for a primeira vez executando:
```bash
doppler setup
npm run dev
```

## 📋 **Funcionalidades Disponíveis**

- ✅ **Dashboard Financeiro** com dados reais
- ✅ **Gestão de Colaboradores** (97 registros)
- ✅ **Análise DRE** (13.810 transações)
- ✅ **Autenticação Azure AD**
- ✅ **Integração Supabase**

---
*Última atualização: 10/06/2025 - Sistema funcionando com Doppler* 