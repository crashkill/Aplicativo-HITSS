import { AccountInfo } from "@azure/msal-browser";
import { msalInstance } from "../contexts/MsalProvider";
import { graphEndpoints, graphScopes, cacheConfig } from "../lib/msalConfig";
import { AzureADUser } from "../types/User";

// Interface para cache de dados
interface CachedData<T> {
  data: T;
  timestamp: number;
  expiration: number;
}

class MicrosoftGraphService {
  private cache = new Map<string, CachedData<any>>();

  // Obter token de acesso para Graph API
  private async getAccessToken(scopes: string[]): Promise<string> {
    try {
      const account = msalInstance.getActiveAccount();
      if (!account) {
        throw new Error("Nenhuma conta ativa encontrada");
      }

      const response = await msalInstance.acquireTokenSilent({
        scopes,
        account,
      });

      return response.accessToken;
    } catch (error) {
      console.error("Erro ao obter token de acesso:", error);
      
      // Tentar obter token via popup se silent falhar
      const response = await msalInstance.acquireTokenPopup({
        scopes,
      });
      
      return response.accessToken;
    }
  }

  // Verificar se dados em cache são válidos
  private isCacheValid<T>(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < cached.expiration;
  }

  // Salvar dados no cache
  private setCacheData<T>(key: string, data: T, expiration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiration,
    });
  }

  // Obter dados do cache
  private getCacheData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached || !this.isCacheValid(key)) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  // Fazer requisição para Graph API
  private async graphRequest<T>(url: string, scopes: string[], cacheKey?: string): Promise<T> {
    try {
      // Verificar cache primeiro
      if (cacheKey && this.isCacheValid(cacheKey)) {
        const cachedData = this.getCacheData<T>(cacheKey);
        if (cachedData) {
          console.log(`Dados carregados do cache: ${cacheKey}`);
          return cachedData;
        }
      }

      const token = await this.getAccessToken(scopes);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição Graph API: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Salvar no cache se especificado
      if (cacheKey) {
        this.setCacheData(cacheKey, data, cacheConfig.userProfile.expiration);
      }

      return data;
    } catch (error) {
      console.error(`Erro ao fazer requisição para ${url}:`, error);
      throw error;
    }
  }

  // Obter perfil básico do usuário
  async getUserProfile(): Promise<Partial<AzureADUser>> {
    try {
      return await this.graphRequest<AzureADUser>(
        graphEndpoints.me,
        graphScopes.userProfile,
        cacheConfig.userProfile.key
      );
    } catch (error) {
      console.error("Erro ao obter perfil do usuário:", error);
      return {};
    }
  }

  // Obter perfil completo/estendido do usuário
  async getUserExtendedProfile(): Promise<Partial<AzureADUser>> {
    try {
      return await this.graphRequest<AzureADUser>(
        graphEndpoints.meExtended,
        graphScopes.userDetails,
        `${cacheConfig.userProfile.key}_extended`
      );
    } catch (error) {
      console.error("Erro ao obter perfil estendido:", error);
      return {};
    }
  }

  // Obter informações do gerente
  async getUserManager(): Promise<Partial<AzureADUser> | null> {
    try {
      return await this.graphRequest<AzureADUser>(
        graphEndpoints.manager,
        graphScopes.manager,
        cacheConfig.manager.key
      );
    } catch (error) {
      console.log("Usuário não possui gerente ou não há permissão para acessar");
      return null;
    }
  }

  // Obter foto do usuário
  async getUserPhoto(): Promise<{ url: string; metadata?: any } | null> {
    try {
      // Primeiro, obter metadados da foto
      const photoMetadata = await this.graphRequest<any>(
        graphEndpoints.photo,
        graphScopes.photo,
        `${cacheConfig.userPhoto.key}_metadata`
      );

      // Depois, obter a foto em si
      const token = await this.getAccessToken(graphScopes.photo);
      const photoResponse = await fetch(graphEndpoints.photoValue, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!photoResponse.ok) {
        throw new Error("Foto não encontrada");
      }

      const photoBlob = await photoResponse.blob();
      const photoUrl = URL.createObjectURL(photoBlob);

      return {
        url: photoUrl,
        metadata: photoMetadata,
      };
    } catch (error) {
      console.log("Usuário não possui foto de perfil ou não há permissão para acessar");
      return null;
    }
  }

  // Obter grupos do usuário
  async getUserGroups(): Promise<any[]> {
    try {
      const response = await this.graphRequest<{ value: any[] }>(
        graphEndpoints.memberOf,
        graphScopes.groups,
        cacheConfig.groups.key
      );
      return response.value || [];
    } catch (error) {
      console.error("Erro ao obter grupos do usuário:", error);
      return [];
    }
  }

  // Obter subordinados diretos
  async getDirectReports(): Promise<any[]> {
    try {
      const response = await this.graphRequest<{ value: any[] }>(
        graphEndpoints.directReports,
        graphScopes.manager,
        `${cacheConfig.manager.key}_reports`
      );
      return response.value || [];
    } catch (error) {
      console.log("Usuário não possui subordinados ou não há permissão para acessar");
      return [];
    }
  }

  // Obter informações da organização
  async getOrganizationInfo(): Promise<any> {
    try {
      const response = await this.graphRequest<{ value: any[] }>(
        graphEndpoints.organization,
        graphScopes.directory,
        "organization_info"
      );
      return response.value?.[0] || {};
    } catch (error) {
      console.error("Erro ao obter informações da organização:", error);
      return {};
    }
  }

  // Obter perfil completo do usuário (combinando todas as chamadas)
  async getCompleteUserProfile(): Promise<AzureADUser> {
    try {
      console.log("Iniciando busca do perfil completo do usuário...");

      // Executar todas as requisições em paralelo quando possível
      const [
        basicProfile,
        extendedProfile,
        manager,
        photo,
        groups,
        directReports,
        organization
      ] = await Promise.allSettled([
        this.getUserProfile(),
        this.getUserExtendedProfile(),
        this.getUserManager(),
        this.getUserPhoto(),
        this.getUserGroups(),
        this.getDirectReports(),
        this.getOrganizationInfo()
      ]);

      // Combinar todos os dados
      const completeProfile: AzureADUser = {
        // Dados básicos
        ...(basicProfile.status === "fulfilled" ? basicProfile.value : {}),
        ...(extendedProfile.status === "fulfilled" ? extendedProfile.value : {}),
        
        // Manager
        ...(manager.status === "fulfilled" && manager.value ? {
          manager: {
            id: manager.value.id,
            displayName: manager.value.displayName,
            mail: manager.value.mail,
          }
        } : {}),
        
        // Foto
        ...(photo.status === "fulfilled" && photo.value ? {
          photo: {
            url: photo.value.url,
            height: photo.value.metadata?.height,
            width: photo.value.metadata?.width,
          }
        } : {}),
        
        // Grupos
        ...(groups.status === "fulfilled" ? {
          memberOf: groups.value.map((group: any) => group.displayName || group.id),
          roles: groups.value
            .filter((group: any) => group["@odata.type"] === "#microsoft.graph.directoryRole")
            .map((role: any) => role.displayName)
        } : {}),
        
        // Informações da empresa (do objeto organization)
        ...(organization.status === "fulfilled" ? {
          companyName: organization.value.displayName || organization.value.name,
        } : {}),
      };

      console.log("Perfil completo obtido com sucesso:", completeProfile);
      return completeProfile;

    } catch (error) {
      console.error("Erro ao obter perfil completo:", error);
      throw error;
    }
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear();
    console.log("Cache do Microsoft Graph limpo");
  }

  // Limpar cache específico
  clearSpecificCache(keys: string[]): void {
    keys.forEach(key => this.cache.delete(key));
    console.log(`Cache limpo para: ${keys.join(", ")}`);
  }
}

// Instância singleton do serviço
export const microsoftGraphService = new MicrosoftGraphService();
export default microsoftGraphService; 