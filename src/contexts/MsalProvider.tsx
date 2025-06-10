import React from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication, EventType, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig } from '../config/azureConfig';

// Criar instância MSAL fora do componente para evitar re-instanciação
const msalInstance = new PublicClientApplication(msalConfig);

// Configurar conta ativa se não houver uma
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
  msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

// Listener para eventos de login
msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult;
    const account = payload.account;
    msalInstance.setActiveAccount(account);
  }
});

interface CustomMsalProviderProps {
  children: React.ReactNode;
}

export const CustomMsalProvider: React.FC<CustomMsalProviderProps> = ({ children }) => {
  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
};

export { msalInstance }; 