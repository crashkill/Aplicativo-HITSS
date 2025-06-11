import { Configuration, PopupRequest } from "@azure/msal-browser";

// Configuração das URLs de redirecionamento
const getRedirectUri = () => {
  const baseUrl = window.location.origin;
  // Para desenvolvimento local na porta 3001
  if (baseUrl.includes('localhost:3001')) {
    return 'http://localhost:3001/Aplicativo-HITSS/';
  }
  return baseUrl + '/';
};

// Valida se as variáveis de ambiente essenciais estão definidas
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;

if (!clientId) {
  console.warn("VITE_AZURE_CLIENT_ID não está definida nas variáveis de ambiente.");
}
if (!tenantId) {
  console.warn("VITE_AZURE_TENANT_ID não está definida nas variáveis de ambiente.");
}

/**
 * Configuração da instância MSAL.
 * Esta configuração é usada para inicializar o PublicClientApplication.
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId || 'bd89001b-064b-4f28-a1c4-988422e013bb',
    authority: `https://login.microsoftonline.com/${tenantId || 'd6c7d4eb-ad17-46c8-a404-f6a92cbead96'}`,
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: getRedirectUri(),
  },
  cache: {
    cacheLocation: "sessionStorage", // 'sessionStorage' ou 'localStorage'
    storeAuthStateInCookie: false,
  },
};

/**
 * Escopos que a aplicação precisa para acessar a API do Microsoft Graph.
 * "User.Read" é o escopo básico para ler o perfil do usuário logado.
 */
export const loginRequest: PopupRequest = {
  scopes: ["User.Read"],
}; 