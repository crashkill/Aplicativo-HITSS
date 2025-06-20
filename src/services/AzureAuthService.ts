import { 
  PublicClientApplication, 
  Configuration, 
  AccountInfo,
  AuthenticationResult,
  SilentRequest,
  PopupRequest,
  RedirectRequest
} from "@azure/msal-browser";

// Configuração do MSAL usando endpoint "common" para evitar problemas de tenant
const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "",
    authority: "https://login.microsoftonline.com/common", // Usar endpoint comum
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin + "/Aplicativo-HITSS",
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        console.log(`[MSAL] ${message}`);
      },
      piiLoggingEnabled: false
    }
  }
};

// Usar apenas escopo "openid" - o mínimo possível
const loginRequest: PopupRequest = {
  scopes: ["openid"], // Apenas o essencial para autenticação
  prompt: "select_account"
};

const redirectRequest: RedirectRequest = {
  scopes: ["openid"], // Apenas o essencial para autenticação
  prompt: "select_account"
};

class AzureAuthService {
  private msalInstance: PublicClientApplication;
  private isInitialized = false;

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔧 Inicializando MSAL com endpoint COMMON...');
      await this.msalInstance.initialize();
      
      // Handle redirect response se estiver retornando de redirect
      const response = await this.msalInstance.handleRedirectPromise();
      if (response) {
        console.log('✅ Redirect response recebida:', response);
      }
      
      this.isInitialized = true;
      console.log('✅ MSAL inicializado com sucesso');
      
      // Log da configuração para debug
      console.log('📋 Configuração MSAL:', {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID?.substring(0, 8) + '...',
        authority: msalConfig.auth.authority,
        redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
        scopes: 'Apenas OpenID'
      });

    } catch (error) {
      console.error('❌ Erro ao inicializar MSAL:', error);
      throw new Error(`Falha na inicialização do MSAL: ${error}`);
    }
  }

  async loginPopup(): Promise<AuthenticationResult> {
    if (!this.isInitialized) {
      throw new Error('MSAL não foi inicializado. Chame initialize() primeiro.');
    }

    try {
      console.log('🔐 Iniciando login popup com escopo MÍNIMO...');
      console.log('📋 Escopos solicitados:', loginRequest.scopes);
      
      const response = await this.msalInstance.loginPopup(loginRequest);
      
      console.log('✅ Login popup bem-sucedido:', {
        account: response.account?.username,
        scopes: response.scopes,
        tokenType: response.tokenType
      });
      
      return response;
      
    } catch (error: any) {
      console.error('❌ Erro no login popup:', error);
      
      // Tratar erros específicos
      if (error.errorCode === 'user_cancelled') {
        throw new Error('Login cancelado pelo usuário');
      } else if (error.errorCode === 'popup_window_error') {
        throw new Error('Erro na janela popup. Tente usar redirect.');
      } else if (error.errorCode === 'consent_required') {
        throw new Error('Consentimento necessário. Verifique configuração do app Azure AD.');
      } else {
        throw new Error(`Erro no login: ${error.message || error.errorCode || 'Erro desconhecido'}`);
      }
    }
  }

  async loginRedirect(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('MSAL não foi inicializado. Chame initialize() primeiro.');
    }

    try {
      console.log('🔐 Iniciando login redirect com escopo MÍNIMO...');
      console.log('📋 Escopos solicitados:', redirectRequest.scopes);
      
      await this.msalInstance.loginRedirect(redirectRequest);
      
    } catch (error: any) {
      console.error('❌ Erro no login redirect:', error);
      throw new Error(`Erro no login redirect: ${error.message || error.errorCode || 'Erro desconhecido'}`);
    }
  }

  async acquireTokenSilent(scopes: string[] = ["openid"]): Promise<AuthenticationResult> {
    if (!this.isInitialized) {
      throw new Error('MSAL não foi inicializado');
    }

    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('Nenhuma conta encontrada. Faça login primeiro.');
    }

    const silentRequest: SilentRequest = {
      scopes: scopes,
      account: accounts[0]
    };

    try {
      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      console.log('✅ Token adquirido silenciosamente');
      return response;
    } catch (error) {
      console.warn('⚠️ Token silencioso falhou, necessário interação:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<any> {
    // Usar apenas dados do token ID, sem chamar Graph API
    const account = this.getCurrentAccount();
    if (!account) {
      throw new Error('Nenhuma conta encontrada');
    }

    console.log('✅ Perfil do usuário obtido do token:', account);
    
    // Retornar dados básicos do token sem chamar Graph API
    return {
      email: account.username,
      name: account.name || account.username?.split('@')[0],
      isAdmin: account.username?.toLowerCase() === 'fabricio.lima@globalhitss.com.br',
      authType: 'azure' as const,
      loginTimestamp: new Date().toISOString(),
      sessionId: `${Date.now()}-azure`,
      userAgent: navigator.userAgent,
      azureProfile: {
        id: account.localAccountId,
        displayName: account.name,
        mail: account.username,
        userPrincipalName: account.username
      }
    };
  }

  async logout(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await this.msalInstance.logoutPopup({
          account: accounts[0],
          mainWindowRedirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI
        });
      }
      console.log('✅ Logout realizado');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      throw error;
    }
  }

  getCurrentAccount(): AccountInfo | null {
    if (!this.isInitialized) return null;
    
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentAccount() !== null;
  }
}

export const azureAuthService = new AzureAuthService(); 