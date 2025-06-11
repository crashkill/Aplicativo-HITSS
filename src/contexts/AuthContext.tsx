import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types/User';
import { authService } from '../services/authService';
import { microsoftGraphService } from '../services/microsoftGraphService';
import { msalInstance, isMsalReady, getMsalDebugInfo } from './MsalProvider';
import { loginRequest } from '../lib/msalConfig';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithAzure: () => Promise<void>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar aplicação
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Inicializando aplicação...');
        
        // Debug localStorage
        const storedUser = localStorage.getItem('user');
        const storedAzureUser = localStorage.getItem('azure_user');
        const forceLogin = sessionStorage.getItem('force_login');
        
        console.log('🔍 Debug localStorage:', {
          storedUser: storedUser ? 'existe' : 'null',
          storedAzureUser: storedAzureUser ? 'existe' : 'null',
          forceLogin: forceLogin ? 'sim' : 'não'
        });
        
        // Verificar se há sessão válida existente apenas no primeiro carregamento
        // (não limpar durante o uso normal da aplicação)
        const hasValidSession = (storedUser || storedAzureUser) && !forceLogin;
        
        console.log('🔍 hasValidSession:', hasValidSession);
        
        if (!hasValidSession) {
          console.log('🔄 Limpando sessões antigas...');
          localStorage.removeItem('user');
          localStorage.removeItem('azure_user');
        }
        
        // Se MSAL estiver disponível, verificar se há conta ativa
        if (isMsalReady()) {
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0 && hasValidSession) {
            console.log('🔍 Tentando restaurar sessão Azure AD...');
            msalInstance.setActiveAccount(accounts[0]);
            
            try {
              // Tentar restaurar sessão Azure
              const storedAzureUser = localStorage.getItem('azure_user');
              if (storedAzureUser) {
                const azureUser = JSON.parse(storedAzureUser);
                setUser(azureUser);
                console.log('✅ Sessão Azure restaurada:', azureUser.name);
                return;
              }
            } catch (error) {
              console.warn('⚠️ Erro ao restaurar sessão Azure:', error);
            }
          }
        }
        
        // Verificar localStorage para usuários locais ou Azure
        if (hasValidSession) {
          const storedUser = localStorage.getItem('user');
          const storedAzureUser = localStorage.getItem('azure_user');
          
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              console.log('✅ Usuário local restaurado:', userData.name);
              return;
            } catch (e) {
              console.error("❌ Erro ao restaurar usuário local:", e);
              localStorage.removeItem('user');
            }
          }
          
          if (storedAzureUser) {
            try {
              const azureData = JSON.parse(storedAzureUser);
              setUser(azureData);
              console.log('✅ Usuário Azure restaurado:', azureData.name);
              return;
            } catch (e) {
              console.error("❌ Erro ao restaurar usuário Azure:", e);
              localStorage.removeItem('azure_user');
            }
          }
        }
        
        // Se chegou aqui, direcionar para login
        setUser(null);
        console.log('✅ Aplicação inicializada - direcionando para login');
        
        // Limpar flag de força login para próximas inicializações
        sessionStorage.removeItem('force_login');
        
      } catch (error) {
        console.error('❌ Erro na inicialização da aplicação:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Função para verificar status de admin
  const checkAdminStatus = async (azureProfile: any): Promise<boolean> => {
    // Verificar por roles do Azure AD
    if (azureProfile.roles?.some((role: string) => 
      role.toLowerCase().includes('admin') || 
      role.toLowerCase().includes('administrator') ||
      role.toLowerCase().includes('global')
    )) {
      return true;
    }

    // Verificar por grupos específicos
    if (azureProfile.memberOf?.some((group: string) => 
      group.toLowerCase().includes('admin') ||
      group.toLowerCase().includes('administrator') ||
      group.toLowerCase().includes('manager')
    )) {
      return true;
    }

    // Verificar por job title
    if (azureProfile.jobTitle?.toLowerCase().includes('admin') ||
        azureProfile.jobTitle?.toLowerCase().includes('manager') ||
        azureProfile.jobTitle?.toLowerCase().includes('director')) {
      return true;
    }

    // Verificar emails específicos conhecidos
    const adminEmails = ['fabricio.lima@globalhitss.com.br', 'admin@'];
    if (adminEmails.some(adminEmail => 
      azureProfile.mail?.toLowerCase().includes(adminEmail) ||
      azureProfile.userPrincipalName?.toLowerCase().includes(adminEmail)
    )) {
      return true;
    }

    return false;
  };

  // Função para sincronizar com Supabase
  const syncUserWithSupabase = async (user: User): Promise<void> => {
    try {
      // Esta funcionalidade será implementada quando a migração da tabela for executada
      console.log('Sincronização com Supabase será implementada após migração da tabela');
    } catch (error) {
      console.error('Erro na sincronização com Supabase:', error);
    }
  };

  // Login tradicional
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Login tradicional admin
      if ((email.toLowerCase() === 'admin' || email === 'Administrador') && password.toLowerCase() === 'admin') {
        const userData: User = { 
          email, 
          name: 'Administrador',
          isAdmin: true,
          authType: 'local',
          loginTimestamp: new Date().toISOString(),
          sessionId: `${Date.now()}-admin`,
          userAgent: navigator.userAgent,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } 
      // Login Azure AD simulado (para compatibilidade)
      else if (password === 'azure_authenticated') {
        // Busca dados do Azure user se disponível
        const azureUserData = localStorage.getItem('azure_user');
        if (azureUserData) {
          const azureUser = JSON.parse(azureUserData) as User;
          const userData: User = {
            ...azureUser,
            authType: 'azure',
            loginTimestamp: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          throw new Error('Dados do usuário Azure não encontrados');
        }
      }
      // Login para usuários válidos (demo)
      else if (email.includes('@') && password.length >= 4) {
        const userData: User = {
          email,
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          isAdmin: email.toLowerCase().includes('admin') || 
                  email.toLowerCase().includes('fabricio') ||
                  email.toLowerCase().includes('manager'),
          authType: 'local',
          loginTimestamp: new Date().toISOString(),
          sessionId: `${Date.now()}-local`,
          userAgent: navigator.userAgent,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } 
      else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login com Azure AD expandido
  const loginWithAzure = async () => {
    setIsLoading(true);
    try {
      console.log('Iniciando login Azure AD expandido...');
      
      // Verificar se MSAL está pronto
      if (!isMsalReady()) {
        throw new Error('Azure AD não está inicializado. Aguarde alguns segundos e tente novamente.');
      }

      // Debug info
      const debugInfo = getMsalDebugInfo();
      console.log('MSAL Debug Info:', debugInfo);
      
      // 1. Autenticar com Azure AD
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      console.log('Login Azure AD bem-sucedido:', loginResponse);

      // 2. Definir conta ativa
      msalInstance.setActiveAccount(loginResponse.account);

      // 3. Buscar perfil completo do Microsoft Graph
      console.log('Buscando perfil completo do usuário...');
      const azureProfile = await microsoftGraphService.getCompleteUserProfile();
      
      // 4. Criar objeto User expandido
      const sessionInfo = {
        sessionId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        loginTimestamp: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        ipAddress: 'unknown',
        userAgent: navigator.userAgent,
      };

      const userData: User = {
        email: azureProfile.mail || azureProfile.userPrincipalName || loginResponse.account.username,
        name: azureProfile.displayName || loginResponse.account.name || 'Usuário Azure',
        isAdmin: await checkAdminStatus(azureProfile),
        authType: 'azure-popup',
        azureProfile,
        ...sessionInfo,
      };

      // 5. Definir usuário e limpar localStorage local
      setUser(userData);
      localStorage.removeItem('user'); // Azure AD não usa localStorage
      
      // 6. Sincronizar com Supabase
      await syncUserWithSupabase(userData);

      console.log('Login Azure AD expandido concluído:', userData);

    } catch (error) {
      console.error('Erro no login Azure AD:', error);
      
      // Mensagem de erro mais amigável
      if (error instanceof Error) {
        if (error.message.includes('uninitialized_public_client_application')) {
          throw new Error('Azure AD não foi inicializado corretamente. Recarregue a página e tente novamente.');
        } else if (error.message.includes('popup_window_error')) {
          throw new Error('Popup foi bloqueado ou fechado. Permita popups e tente novamente.');
        } else if (error.message.includes('user_cancelled')) {
          throw new Error('Login cancelado pelo usuário.');
        }
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh do perfil do usuário
  const refreshUserProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (user.authType?.includes('azure') && isMsalReady()) {
        console.log('Atualizando perfil Azure...');
        const azureProfile = await microsoftGraphService.getCompleteUserProfile();
        
        const updatedUser: User = {
          ...user,
          azureProfile,
          lastActivity: new Date().toISOString(),
        };

        setUser(updatedUser);
        await syncUserWithSupabase(updatedUser);
        console.log('Perfil Azure atualizado:', updatedUser);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setIsLoading(true);
    try {
      // Logout do Azure AD se aplicável
      if (user?.authType?.includes('azure') && isMsalReady()) {
        msalInstance.logoutPopup().catch(console.error);
        microsoftGraphService.clearCache();
      }

      // Limpar dados locais
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('azure_user');
      
      // Marcar para forçar novo login na próxima inicialização
      sessionStorage.setItem('force_login', 'true');
      
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin: user?.isAdmin || false,
      isLoading,
      login,
      loginWithAzure,
      logout,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
