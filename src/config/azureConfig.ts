import { LogLevel } from '@azure/msal-browser';

// Credenciais Azure AD fornecidas
const AZURE_CLIENT_ID = 'bd89001b-064b-4f28-a1c4-988422e013bb';
const AZURE_TENANT_ID = 'd6c7d4eb-ad17-46c8-a404-f6a92cbead96';

// Configuração para Azure AD usando MSAL
export const msalConfig = {
  auth: {
    clientId: AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
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