# 🔑 Configuração Azure AD - URLs de Redirecionamento

**Data:** 10/06/2025  
**Status:** 🚧 EM CONFIGURAÇÃO  
**Porta Fixa:** 3001  

---

## 🎯 URLs de Redirecionamento Necessárias

### **✅ Para Desenvolvimento Local (Porta 3001)**
```
http://localhost:3001/Aplicativo-HITSS/
```

### **✅ Para Produção/Deploy**
```
https://seu-dominio.com/Aplicativo-HITSS/
https://crashkill.github.io/Aplicativo-HITSS/
```

### **🔧 URLs de Teste/Desenvolvimento**
```
http://localhost:3001/
https://localhost:3001/
http://127.0.0.1:3001/Aplicativo-HITSS/
```

---

## 📋 Configuração no Azure Portal

### **1. Acesse o Azure Portal**
- URL: https://portal.azure.com
- Navegue para: **Azure Active Directory** → **App registrations**
- Selecione a aplicação: **Sistema HITSS**

### **2. Configurar Authentication**
- Vá para a aba **Authentication**
- Na seção **Web** → **Redirect URIs**
- Adicione as URLs necessárias:

```
✅ http://localhost:3001/Aplicativo-HITSS/
✅ https://localhost:3001/Aplicativo-HITSS/
✅ http://localhost:3001/
✅ https://seu-dominio-producao.com/Aplicativo-HITSS/
```

### **3. Configurações Específicas**

#### **Platform configurations:**
- **Type:** Web
- **Redirect URIs:** Conforme listado acima
- **Front-channel logout URL:** `http://localhost:3001/Aplicativo-HITSS/`

#### **Implicit grant and hybrid flows:**
- ✅ **Access tokens** (for implicit flows)
- ✅ **ID tokens** (for implicit and hybrid flows)

#### **Advanced settings:**
- **Allow public client flows:** No
- **Treat application as a public client:** No

---

## 🔧 Configuração no Código

### **azureConfig.ts Atualizado**
```typescript
// URLs de redirecionamento configuradas
const getRedirectUri = () => {
  const baseUrl = window.location.origin;
  // Para desenvolvimento local na porta 3001
  if (baseUrl.includes('localhost:3001')) {
    return 'http://localhost:3001/Aplicativo-HITSS/';
  }
  return baseUrl;
};

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: getRedirectUri(),
    navigateToLoginRequestUrl: false,
  },
  // ... resto da configuração
};
```

### **Variáveis do Doppler Utilizadas**
```bash
VITE_AZURE_CLIENT_ID=bd89001b-064b-4f28-a1c4-988422e013bb
VITE_AZURE_TENANT_ID=d6c7d4eb-ad17-46c8-a404-f6a92cbead96
```

---

## 🧪 Teste da Configuração

### **1. Verificar Variáveis**
```bash
doppler run -- node -e "
console.log('Client ID:', process.env.VITE_AZURE_CLIENT_ID);
console.log('Tenant ID:', process.env.VITE_AZURE_TENANT_ID);
"
```

### **2. Iniciar Aplicação**
```bash
npm run dev:doppler
```

### **3. Testar Login Azure**
1. Acesse: http://localhost:3001/Aplicativo-HITSS/
2. Clique em **Login com Azure AD**
3. Deve redirecionar para Microsoft Login
4. Após login, deve retornar para a aplicação

---

## 🔍 Troubleshooting

### **Erro: "Redirect URI Mismatch"**
- ✅ Verificar se a URL exata está configurada no Azure
- ✅ Confirmar que inclui `/Aplicativo-HITSS/` no final
- ✅ Verificar protocolo (http vs https)

### **Erro: "Invalid Client ID"**
```bash
# Verificar se as variáveis estão sendo carregadas
doppler secrets | grep AZURE
```

### **Erro: "Popup Blocked"**
- Habilitar popups para localhost:3001
- Configurar browser para permitir popups

### **Erro: "Authority not found"**
- Verificar VITE_AZURE_TENANT_ID
- Confirmar se o tenant está ativo

---

## 📊 Status das Configurações

### **✅ Concluído**
- [x] Porta 3001 fixada no Vite
- [x] Doppler com variáveis Azure AD
- [x] azureConfig.ts atualizado
- [x] authConfig.ts atualizado
- [x] URLs de redirecionamento mapeadas

### **🚧 Em Andamento**
- [ ] URLs configuradas no Azure Portal
- [ ] Teste de login completo
- [ ] Validação de redirect

### **📋 Próximos Passos**
1. **Salvar configurações** no Azure Portal
2. **Testar login** na aplicação
3. **Validar redirect** após autenticação
4. **Configurar logout** Azure AD
5. **Implementar roles/permissions**

---

## 📞 URLs de Referência

### **Azure Portal**
- **App Registrations:** https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
- **Authentication Config:** Navegar para a app → Authentication

### **Documentação Microsoft**
- **MSAL React:** https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-react
- **Redirect URIs:** https://docs.microsoft.com/en-us/azure/active-directory/develop/reply-url

### **Aplicação Local**
- **URL Desenvolvimento:** http://localhost:3001/Aplicativo-HITSS/
- **Dashboard Doppler:** https://dashboard.doppler.com/

---

**Configuração realizada por:** Vibe Coding Assistant  
**Data:** 10/06/2025  
**Status:** Aguardando confirmação das URLs no Azure Portal 