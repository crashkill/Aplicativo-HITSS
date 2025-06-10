# 🔐 Integração Azure Active Directory - Sistema HITSS

## 📋 Visão Geral

Esta documentação detalha como integrar o Sistema HITSS com Azure Active Directory (Azure AD) para autenticação corporativa usando Microsoft Authentication Library (MSAL) for React.

---

## 🎯 O que Foi Implementado

### ✅ **Tela de Login Moderna**
- **Design moderno** com gradientes e animações Framer Motion
- **Seletor de método**: Login Local vs Azure AD
- **Suporte a temas**: Dark/Light mode
- **Interface responsiva** e acessível
- **Estados de loading** e feedback visual

### ✅ **Arquitetura de Autenticação**
- **AuthContext expandido** para suportar múltiplos métodos
- **Configuração Azure** centralizada em `/src/config/azureConfig.ts`
- **Variáveis de ambiente** para configuração segura
- **Fallback para login local** quando Azure não estiver configurado

---

## 🏗️ Estrutura Implementada

```
src/
├── config/
│   └── azureConfig.ts          # Configuração MSAL Azure
├── contexts/
│   └── AuthContext.tsx         # Context expandido com Azure
├── pages/
│   └── Login.tsx               # Nova tela de login moderna
└── ...
```

---

## 🚀 Como Configurar Azure AD

### **1. Registro da Aplicação no Azure**

1. **Acesse o Azure Portal**: https://portal.azure.com
2. **Navegue para Azure Active Directory** > **App registrations**
3. **Clique em "New registration"**
4. **Configure:**
   - **Name**: `Sistema HITSS`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: `Single-page application` - `http://localhost:3000`

### **2. Configurar Redirect URIs**

Na aba **Authentication**:
```
- http://localhost:3000
- http://localhost:3000/redirect
- https://seu-dominio.github.io/Aplicativo-HITSS/
```

### **3. Configurar API Permissions**

Na aba **API permissions**:
1. **Add a permission** > **Microsoft Graph**
2. **Delegated permissions**:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
3. **Grant admin consent**

### **4. Obter Configurações**

Copie da aba **Overview**:
- **Application (client) ID** → `VITE_AZURE_CLIENT_ID`
- **Directory (tenant) ID** → `VITE_AZURE_TENANT_ID`

---

## ⚙️ Configuração do Sistema

### **1. Variáveis de Ambiente**

Adicione ao seu `.env`:
```env
# Azure AD Configuration
VITE_AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_AZURE_TENANT_ID=yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
```

### **2. Instalar Dependências MSAL**

```bash
npm install @azure/msal-browser @azure/msal-react
```

### **3. Arquivos de Configuração**

**`src/config/azureConfig.ts`**:
```typescript
import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  // ... mais configurações
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};
```

---

## 🔧 Implementação Completa

### **1. Provider MSAL (para implementar)**

```typescript
// src/contexts/MsalProvider.tsx
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/azureConfig';

const msalInstance = new PublicClientApplication(msalConfig);

export const CustomMsalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
};
```

### **2. Implementar Login Azure**

```typescript
// No AuthContext.tsx
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/azureConfig';

const loginWithAzure = async () => {
  const { instance } = useMsal();
  
  try {
    const response = await instance.loginPopup(loginRequest);
    
    const userData: User = {
      email: response.account.username,
      name: response.account.name || response.account.username,
      isAdmin: true, // ou lógica baseada em roles
      authMethod: 'azure',
      azureProfile: {
        displayName: response.account.name,
        // ... mais dados do perfil
      }
    };
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Erro no login Azure:', error);
    throw error;
  }
};
```

---

## 📊 Estado Atual da Implementação

### ✅ **Implementado**
- [x] Tela de login moderna com seletor Azure/Local
- [x] AuthContext expandido para suportar Azure
- [x] Configuração Azure centralizada
- [x] Variáveis de ambiente documentadas
- [x] Estrutura para MSAL preparada

### 🚧 **Próximos Passos**
- [ ] Instalar dependências MSAL: `@azure/msal-browser` e `@azure/msal-react`
- [ ] Implementar MsalProvider no App.tsx
- [ ] Conectar loginWithAzure ao MSAL
- [ ] Implementar logout Azure
- [ ] Testes de integração

---

## 🎨 Funcionalidades da Tela de Login

### **Interface Moderna**
- **Gradientes** responsivos ao tema
- **Animações Framer Motion**
- **Logo HITSS** centralizado
- **Seletor visual** entre métodos de login

### **Login Local**
- **Formulário tradicional** com validação
- **Credenciais**: admin / admin
- **Estados de erro** e loading

### **Login Azure**
- **Botão Microsoft** com logo oficial
- **Feedback visual** durante autenticação
- **Informações contextuais**

---

## 🔒 Segurança

### **Boas Práticas Implementadas**
- **sessionStorage** para tokens (mais seguro)
- **Variáveis de ambiente** para configurações
- **Logout completo** quando necessário
- **Validação de configuração** antes de usar Azure

### **Configurações de Segurança**
```typescript
cache: {
  cacheLocation: 'sessionStorage', // Mais seguro que localStorage
  storeAuthStateInCookie: false,   // Evita cookies
}
```

---

## 🧪 Como Testar

### **1. Desenvolvimento Local**
```bash
# 1. Configure as variáveis de ambiente
cp env.example .env
# Edite .env com suas credenciais Azure

# 2. Instale dependências MSAL
npm install @azure/msal-browser @azure/msal-react

# 3. Execute o projeto
npm run dev

# 4. Acesse: http://localhost:3000
# 5. Teste ambos os métodos de login
```

### **2. Teste sem Azure**
- Sistema **detecta automaticamente** se Azure está configurado
- **Fallback gracioso** para login local
- **Mensagens informativas** sobre configuração

---

## 📋 Checklist de Implementação

### **Configuração Azure Portal**
- [ ] App registration criado
- [ ] Redirect URIs configurados
- [ ] API permissions concedidas
- [ ] Client ID e Tenant ID copiados

### **Configuração Sistema**
- [ ] Variáveis de ambiente definidas
- [ ] Dependências MSAL instaladas
- [ ] MsalProvider implementado
- [ ] Login Azure funcional

### **Teste e Validação**
- [ ] Login local funcionando
- [ ] Login Azure funcionando
- [ ] Logout de ambos métodos
- [ ] Temas dark/light aplicados
- [ ] Interface responsiva

---

## 🚨 Troubleshooting

### **Erro: "Azure AD não configurado"**
- Verifique se `VITE_AZURE_CLIENT_ID` e `VITE_AZURE_TENANT_ID` estão definidos
- Reinicie o servidor de desenvolvimento após mudar .env

### **Erro: "MSAL modules not found"**
```bash
npm install @azure/msal-browser @azure/msal-react
```

### **Erro de Redirect URI**
- Verifique se o URI no Azure Portal corresponde exatamente ao usado
- Adicione todos os ambientes (dev, prod)

### **Erro de Permissions**
- Verifique se as permissões foram concedidas
- Admin consent pode ser necessário

---

## 🔗 Recursos Úteis

### **Documentação Microsoft**
- [MSAL React Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-react)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [MSAL.js Configuration](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications)

### **Exemplos de Código**
- [MSAL React Samples](https://github.com/Azure-Samples/ms-identity-javascript-react-tutorial)
- [Azure AD B2C Samples](https://github.com/Azure-Samples/ms-identity-b2c-javascript-spa)

---

## 📈 Próximas Melhorias

### **Funcionalidades Avançadas**
- [ ] **SSO** entre aplicações
- [ ] **Conditional Access** support
- [ ] **Multi-factor Authentication**
- [ ] **Group-based access control**

### **UX/UI**
- [ ] **Remember me** functionality
- [ ] **Profile dropdown** com dados Azure
- [ ] **Company branding** no login
- [ ] **Automatic theme** based on company settings

---

**Status**: ✅ Estrutura implementada, pronta para conectar MSAL
**Última atualização**: Janeiro 2025
**Responsável**: Sistema HITSS Team 