import { Configuration, PopupRequest } from "@azure/msal-browser";

// Valida se as variáveis de ambiente essenciais estão definidas
if (!import.meta.env.VITE_AZURE_CLIENT_ID) {
  throw new Error("VITE_AZURE_CLIENT_ID não está definida nas variáveis de ambiente.");
}
if (!import.meta.env.VITE_AZURE_TENANT_ID) {
  throw new Error("VITE_AZURE_TENANT_ID não está definida nas variáveis de ambiente.");
}

/**
 * Configuração da instância MSAL.
 * Esta configuração é usada para inicializar o PublicClientApplication.
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: "/", // A URL para onde o usuário será redirecionado após o login
    postLogoutRedirectUri: "/", // A URL para onde o usuário será redirecionado após o logout
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