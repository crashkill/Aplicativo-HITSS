import React, { useEffect, useState } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication, EventType, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, isAzureConfigured } from '../config/azureConfig';

// Criar instância MSAL fora do componente para evitar re-instanciação
const msalInstance = new PublicClientApplication(msalConfig);

// Inicializar MSAL de forma assíncrona
let isInitialized = false;

const initializeMsal = async (): Promise<void> => {
  if (isInitialized) return;
  
  try {
    console.log('Inicializando MSAL...');
    await msalInstance.initialize();
    isInitialized = true;
    console.log('MSAL inicializado com sucesso');

    // Configurar conta ativa se não houver uma
    if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
      msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
      console.log('Conta ativa configurada:', msalInstance.getActiveAccount()?.username);
    }

    // Listener para eventos de login
    msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        const account = payload.account;
        msalInstance.setActiveAccount(account);
        console.log('Login bem-sucedido, conta ativa definida:', account.username);
      }
    });

  } catch (error) {
    console.error('Erro ao inicializar MSAL:', error);
    isInitialized = false;
  }
};

interface CustomMsalProviderProps {
  children: React.ReactNode;
}

export const CustomMsalProvider: React.FC<CustomMsalProviderProps> = ({ children }) => {
  const [isMsalInitialized, setIsMsalInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // Verificar se Azure está configurado
      if (!isAzureConfigured()) {
        console.warn('Azure AD não está configurado. Algumas funcionalidades estarão limitadas.');
        setInitError('Azure AD não configurado');
        setIsMsalInitialized(true); // Permitir que a aplicação continue
        return;
      }

      try {
        await initializeMsal();
        setIsMsalInitialized(true);
        setInitError(null);
      } catch (error) {
        console.error('Falha na inicialização do MSAL:', error);
        setInitError('Falha na inicialização do Azure AD');
        setIsMsalInitialized(true); // Permitir que a aplicação continue mesmo com erro
      }
    };

    init();
  }, []);

  // Mostrar loading enquanto inicializa
  if (!isMsalInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>🔄 Inicializando Azure AD...</div>
        <small style={{ color: '#666' }}>Configurando autenticação Microsoft</small>
      </div>
    );
  }

  // Se houver erro mas ainda assim inicializou, mostrar aviso
  if (initError) {
    console.warn('MSAL Provider continuando com limitações:', initError);
  }

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
};

// Função para verificar se MSAL está pronto
export const isMsalReady = (): boolean => {
  return isInitialized;
};

// Função para obter informações de debug
export const getMsalDebugInfo = () => {
  return {
    isInitialized,
    isConfigured: isAzureConfigured(),
    activeAccount: msalInstance.getActiveAccount(),
    allAccounts: msalInstance.getAllAccounts(),
    config: {
      clientId: msalConfig.auth.clientId,
      authority: msalConfig.auth.authority,
      redirectUri: msalConfig.auth.redirectUri,
    }
  };
};

export { msalInstance }; 