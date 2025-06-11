import { LogLevel } from '@azure/msal-browser';

// Credenciais Azure AD do Doppler
const AZURE_CLIENT_ID = import.meta.env.VITE_AZURE_CLIENT_ID || 'bd89001b-064b-4f28-a1c4-988422e013bb';
const AZURE_TENANT_ID = import.meta.env.VITE_AZURE_TENANT_ID || 'd6c7d4eb-ad17-46c8-a404-f6a92cbead96';

// URLs de redirecionamento configuradas
const getRedirectUri = () => {
  const baseUrl = window.location.origin;
  // Para desenvolvimento local na porta 3001
  if (baseUrl.includes('localhost:3001')) {
    return 'http://localhost:3001/Aplicativo-HITSS/';
  }
  return baseUrl;
};

// Configuração para Azure AD usando MSAL
export const msalConfig = {
  auth: {
    clientId: AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: getRedirectUri(),
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage' as const, // Mais seguro
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error('MSAL Error:', message);
            return;
          case LogLevel.Info:
            console.info('MSAL Info:', message);
            return;
          case LogLevel.Verbose:
            console.debug('MSAL Verbose:', message);
            return;
          case LogLevel.Warning:
            console.warn('MSAL Warning:', message);
            return;
          default:
            return;
        }
      },
    },
  },
};

// Scopes necessários para autenticação
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};

// Scopes para chamadas específicas à API
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  scopes: ['User.Read'],
};

// Verificar se Azure está configurado
export const isAzureConfigured = () => {
  return !!(AZURE_CLIENT_ID && AZURE_TENANT_ID);
};

// Helper para verificar configuração
export const getAzureConfig = () => {
  return {
    clientId: AZURE_CLIENT_ID,
    tenantId: AZURE_TENANT_ID,
    configured: isAzureConfigured(),
  };
}; 