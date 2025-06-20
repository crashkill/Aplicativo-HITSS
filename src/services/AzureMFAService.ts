/**
 * Serviço de MFA (Multi-Factor Authentication) usando Azure AD
 * Integra com MCP azure-auth para funcionalidades avançadas
 */

import { PublicClientApplication } from '@azure/msal-browser';
import { msalInstance } from '../contexts/MsalProvider';

export interface MFAChallenge {
  challengeId: string;
  method: 'authenticator' | 'sms' | 'email';
  destination?: string; // telefone ou email mascarado
  expiresAt: Date;
  isRequired: boolean;
}

export interface MFAVerificationResult {
  isValid: boolean;
  token?: string;
  error?: string;
  nextStep?: MFAChallenge;
}

export class AzureMFAService {
  private readonly maxAttempts = 3;
  private readonly challengeTimeout = 300000; // 5 minutos

  /**
   * Inicia desafio MFA após login inicial
   */
  async initiateMFAChallenge(accessToken: string): Promise<MFAChallenge> {
    try {
      console.log('🔐 Iniciando desafio MFA...');
      
      // Obter informações do usuário para determinar métodos MFA disponíveis
      const userInfo = await this.getUserMFAInfo(accessToken);
      
      // Simular chamada para MCP azure-auth
      const mfaChallenge = await this.callAzureMCP('initiate-mfa', {
        userId: userInfo.id,
        preferredMethod: 'authenticator',
        fallbackMethods: ['sms', 'email']
      });

      const challenge: MFAChallenge = {
        challengeId: this.generateChallengeId(),
        method: mfaChallenge.method || 'authenticator',
        destination: mfaChallenge.destination,
        expiresAt: new Date(Date.now() + this.challengeTimeout),
        isRequired: true
      };

      console.log('📱 Desafio MFA criado:', challenge);
      return challenge;

    } catch (error) {
      console.error('❌ Erro ao iniciar MFA:', error);
      throw new Error('Falha ao iniciar autenticação de dois fatores');
    }
  }

  /**
   * Verifica código MFA fornecido pelo usuário
   */
  async verifyMFACode(challengeId: string, code: string): Promise<MFAVerificationResult> {
    try {
      console.log('🔍 Verificando código MFA:', { challengeId, code: code.substring(0, 2) + '***' });

      // Validar formato do código
      if (!this.isValidMFACode(code)) {
        return {
          isValid: false,
          error: 'Código deve ter 6 dígitos numéricos'
        };
      }

      // Verificar via MCP azure-auth
      const verificationResult = await this.callAzureMCP('verify-mfa', {
        challengeId,
        code,
        timestamp: new Date().toISOString()
      });

      if (verificationResult.isValid) {
        console.log('✅ MFA verificado com sucesso');
        return {
          isValid: true,
          token: verificationResult.mfaToken
        };
      } else {
        console.log('❌ Código MFA inválido');
        return {
          isValid: false,
          error: verificationResult.error || 'Código inválido'
        };
      }

    } catch (error) {
      console.error('❌ Erro na verificação MFA:', error);
      return {
        isValid: false,
        error: 'Erro interno na verificação'
      };
    }
  }

  /**
   * Solicita reenvio de código MFA
   */
  async resendMFACode(challengeId: string, method: 'sms' | 'email'): Promise<boolean> {
    try {
      console.log('📲 Reenviando código MFA via:', method);

      const result = await this.callAzureMCP('resend-mfa', {
        challengeId,
        method,
        timestamp: new Date().toISOString()
      });

      return result.success;

    } catch (error) {
      console.error('❌ Erro ao reenviar código:', error);
      return false;
    }
  }

  /**
   * Obtém informações MFA do usuário
   */
  private async getUserMFAInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/authentication/methods', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao obter métodos de autenticação');
      }

      const data = await response.json();
      return {
        id: data.id || 'unknown',
        methods: data.value || [],
        preferredMethod: this.getPreferredMFAMethod(data.value)
      };

    } catch (error) {
      console.error('❌ Erro ao obter métodos MFA:', error);
      // Fallback para informações básicas
      return {
        id: 'fallback-' + Date.now(),
        methods: ['authenticator'],
        preferredMethod: 'authenticator'
      };
    }
  }

  /**
   * Determina o método MFA preferido
   */
  private getPreferredMFAMethod(methods: any[]): 'authenticator' | 'sms' | 'email' {
    // Prioridade: Microsoft Authenticator > SMS > Email
    for (const method of methods) {
      if (method['@odata.type']?.includes('microsoftAuthenticatorAuthenticationMethod')) {
        return 'authenticator';
      }
    }
    
    for (const method of methods) {
      if (method['@odata.type']?.includes('phoneAuthenticationMethod')) {
        return 'sms';
      }
    }

    return 'email';
  }

  /**
   * Simula chamada para MCP azure-auth
   */
  private async callAzureMCP(action: string, params: any): Promise<any> {
    // Esta função simulará chamadas para o MCP azure-auth
    // Em produção, isso seria integrado com o MCP real
    
    console.log('🔗 Chamando MCP azure-auth:', { action, params });

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    switch (action) {
      case 'initiate-mfa':
        return {
          method: 'authenticator',
          destination: params.fallbackMethods.includes('sms') ? '+55 11 9****-1234' : 'f****@globalhitss.com.br',
          challengeId: this.generateChallengeId(),
          expiresIn: 300
        };

      case 'verify-mfa':
        // Simular verificação - aceitar códigos específicos para teste
        const validCodes = ['123456', '000000', '111111'];
        return {
          isValid: validCodes.includes(params.code),
          mfaToken: validCodes.includes(params.code) ? 'mfa_token_' + Date.now() : null,
          error: validCodes.includes(params.code) ? null : 'Código inválido ou expirado'
        };

      case 'resend-mfa':
        return {
          success: true,
          method: params.method,
          sentAt: new Date().toISOString()
        };

      default:
        return { error: 'Ação não reconhecida' };
    }
  }

  /**
   * Gera ID único para desafio MFA
   */
  private generateChallengeId(): string {
    return 'mfa_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  }

  /**
   * Valida formato do código MFA
   */
  private isValidMFACode(code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  /**
   * Verifica se MFA é obrigatório para o usuário
   */
  async isMFARequired(userEmail: string): Promise<boolean> {
    try {
      // Verificar políticas de MFA via MCP azure-auth
      const result = await this.callAzureMCP('check-mfa-policy', {
        userEmail,
        timestamp: new Date().toISOString()
      });

      return result.required || false;

    } catch (error) {
      console.error('❌ Erro ao verificar política MFA:', error);
      // Por segurança, assumir que MFA é obrigatório
      return true;
    }
  }

  /**
   * Obtém estatísticas de MFA para admin
   */
  async getMFAStats(): Promise<any> {
    try {
      return await this.callAzureMCP('get-mfa-stats', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas MFA:', error);
      return {
        totalUsers: 0,
        mfaEnabled: 0,
        mfaDisabled: 0,
        methods: {}
      };
    }
  }
}

// Instância singleton do serviço
export const azureMFAService = new AzureMFAService(); 