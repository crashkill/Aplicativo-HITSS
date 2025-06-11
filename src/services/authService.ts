import { supabase } from './supabaseClient'
import { User, AuthResponse, AzureADUser } from '../types/User'
import { msalInstance } from '../contexts/MsalProvider'
import { loginRequest } from '../lib/msalConfig'
import { microsoftGraphService } from './microsoftGraphService'

interface LoginCredentials {
  email: string
  password: string
}

// Cache de usuários para melhorar performance
const userCache = new Map<string, { user: User; timestamp: number }>()
const CACHE_DURATION = 1000 * 60 * 15 // 15 minutos

class AuthService {
  private currentUser: User | null = null

  // Gerar ID de sessão único
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Obter informações da sessão
  private getSessionInfo() {
    return {
      sessionId: this.generateSessionId(),
      loginTimestamp: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress: 'unknown', // Seria obtido do servidor
      userAgent: navigator.userAgent,
    }
  }

  // Login com Azure AD (método expandido)
  async loginWithAzure(): Promise<AuthResponse> {
    try {
      console.log('Iniciando login com Azure AD...')
      
      // 1. Autenticar com Azure AD
      const loginResponse = await msalInstance.loginPopup(loginRequest)
      console.log('Login Azure AD bem-sucedido:', loginResponse)

      // 2. Definir conta ativa
      msalInstance.setActiveAccount(loginResponse.account)

      // 3. Obter perfil completo do Microsoft Graph
      console.log('Buscando perfil completo do usuário...')
      const azureProfile = await microsoftGraphService.getCompleteUserProfile()
      
      // 4. Criar objeto User expandido
      const sessionInfo = this.getSessionInfo()
      const user: User = {
        // Campos básicos (compatibilidade)
        email: azureProfile.mail || azureProfile.userPrincipalName || loginResponse.account.username,
        name: azureProfile.displayName || loginResponse.account.name || 'Usuário Azure',
        isAdmin: await this.checkAdminStatus(azureProfile),
        authType: 'azure-popup',
        
        // Perfil completo do Azure
        azureProfile,
        
        // Metadados da sessão
        ...sessionInfo,
      }

      // 5. Salvar no cache
      userCache.set(user.email, { user, timestamp: Date.now() })
      this.currentUser = user

      // 6. Salvar/atualizar no Supabase
      await this.syncUserWithSupabase(user)

      console.log('Login completo realizado com sucesso:', user)

      return {
        user,
        accessToken: loginResponse.accessToken,
        expiresIn: loginResponse.expiresOn ? 
          Math.floor((loginResponse.expiresOn.getTime() - Date.now()) / 1000) : 
          3600,
        tokenType: 'Bearer',
        scopes: loginResponse.scopes,
      }

    } catch (error) {
      console.error('Erro no login Azure AD:', error)
      throw new Error('Falha na autenticação com Azure AD: ' + (error as Error).message)
    }
  }

  // Verificar se usuário é admin baseado no perfil do Azure
  private async checkAdminStatus(azureProfile: AzureADUser): Promise<boolean> {
    try {
      // Verificar por roles do Azure AD
      if (azureProfile.roles?.some(role => 
        role.toLowerCase().includes('admin') || 
        role.toLowerCase().includes('administrator') ||
        role.toLowerCase().includes('global')
      )) {
        return true
      }

      // Verificar por grupos específicos
      if (azureProfile.memberOf?.some(group => 
        group.toLowerCase().includes('admin') ||
        group.toLowerCase().includes('administrator') ||
        group.toLowerCase().includes('manager')
      )) {
        return true
      }

      // Verificar por job title
      if (azureProfile.jobTitle?.toLowerCase().includes('admin') ||
          azureProfile.jobTitle?.toLowerCase().includes('manager') ||
          azureProfile.jobTitle?.toLowerCase().includes('director')) {
        return true
      }

      // Verificar na base local do Supabase
      const { data } = await supabase
        .from('colaboradores')
        .select('is_admin')
        .eq('email', azureProfile.mail || azureProfile.userPrincipalName)
        .single()

      return data?.is_admin || false

    } catch (error) {
      console.error('Erro ao verificar status de admin:', error)
      return false
    }
  }

  // Sincronizar usuário com Supabase
  private async syncUserWithSupabase(user: User): Promise<void> {
    try {
      const collaboratorData = {
        email: user.email,
        nome: user.name,
        is_admin: user.isAdmin,
        auth_type: user.authType,
        azure_id: user.azureProfile?.id,
        display_name: user.azureProfile?.displayName,
        job_title: user.azureProfile?.jobTitle,
        department: user.azureProfile?.department,
        company_name: user.azureProfile?.companyName,
        office_location: user.azureProfile?.officeLocation,
        mobile_phone: user.azureProfile?.mobilePhone,
        business_phones: user.azureProfile?.businessPhones,
        country: user.azureProfile?.country,
        city: user.azureProfile?.city,
        state: user.azureProfile?.state,
        preferred_language: user.azureProfile?.preferredLanguage,
        manager_id: user.azureProfile?.manager?.id,
        manager_name: user.azureProfile?.manager?.displayName,
        member_of: user.azureProfile?.memberOf,
        roles: user.azureProfile?.roles,
        last_login: new Date().toISOString(),
        session_id: user.sessionId,
        user_agent: user.userAgent,
      }

      // Tentar atualizar ou inserir
      const { error } = await supabase
        .from('colaboradores')
        .upsert(collaboratorData, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Erro ao sincronizar usuário com Supabase:', error)
      } else {
        console.log('Usuário sincronizado com Supabase com sucesso')
      }

    } catch (error) {
      console.error('Erro na sincronização com Supabase:', error)
    }
  }

  // Login tradicional com email/senha
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Verificar cache primeiro
      const cached = userCache.get(credentials.email)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        this.currentUser = cached.user
        return { user: cached.user }
      }

      // Buscar no Supabase
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('email', credentials.email)
        .eq('senha', credentials.password) // Em produção, usar hash
        .single()

      if (error || !data) {
        throw new Error('Credenciais inválidas')
      }

      const sessionInfo = this.getSessionInfo()
      const user: User = {
        email: data.email,
        name: data.nome,
        isAdmin: data.is_admin || false,
        authType: 'local',
        ...sessionInfo,
      }

      // Salvar no cache
      userCache.set(user.email, { user, timestamp: Date.now() })
      this.currentUser = user

      // Atualizar last_login
      await supabase
        .from('colaboradores')
        .update({ 
          last_login: new Date().toISOString(),
          session_id: user.sessionId 
        })
        .eq('email', user.email)

      return { user }

    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  // Obter usuário atual
  getCurrentUser(): User | null {
    return this.currentUser
  }

  // Logout
  async logout(): Promise<void> {
    try {
      if (this.currentUser?.authType?.includes('azure')) {
        // Logout do Azure AD
        await msalInstance.logoutPopup()
        
        // Limpar cache do Microsoft Graph
        microsoftGraphService.clearCache()
      }

      // Limpar dados locais
      if (this.currentUser) {
        userCache.delete(this.currentUser.email)
      }
      
      this.currentUser = null
      
      // Limpar localStorage
      localStorage.removeItem('currentUser')
      
      console.log('Logout realizado com sucesso')

    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    }
  }

  // Verificar se usuário está autenticado
  isAuthenticated(): boolean {
    if (this.currentUser?.authType?.includes('azure')) {
      // Para Azure, verificar se há conta ativa
      const account = msalInstance.getActiveAccount()
      return !!account
    }
    
    return !!this.currentUser
  }

  // Refresh do perfil do usuário (buscar dados atualizados)
  async refreshUserProfile(): Promise<User | null> {
    try {
      if (!this.currentUser) {
        return null
      }

      if (this.currentUser.authType?.includes('azure')) {
        // Refresh do perfil Azure
        const azureProfile = await microsoftGraphService.getCompleteUserProfile()
        
        const updatedUser: User = {
          ...this.currentUser,
          azureProfile,
          lastActivity: new Date().toISOString(),
        }

        // Atualizar cache
        userCache.set(updatedUser.email, { user: updatedUser, timestamp: Date.now() })
        this.currentUser = updatedUser

        // Sincronizar com Supabase
        await this.syncUserWithSupabase(updatedUser)

        return updatedUser
      }

      return this.currentUser

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return this.currentUser
    }
  }

  // Obter permissões do usuário
  async getUserPermissions(user: User): Promise<any> {
    try {
      // Lógica para determinar permissões baseado no perfil
      const permissions = {
        canViewFinancials: user.isAdmin || user.azureProfile?.department?.toLowerCase().includes('finance'),
        canManageUsers: user.isAdmin,
        canUploadFiles: true,
        canViewReports: user.isAdmin || user.azureProfile?.jobTitle?.toLowerCase().includes('manager'),
        canManageProjects: user.isAdmin || user.azureProfile?.jobTitle?.toLowerCase().includes('manager'),
        canConfigureSystem: user.isAdmin,
        departmentAccess: user.azureProfile?.department ? [user.azureProfile.department] : [],
        projectAccess: [], // Implementar lógica específica
      }

      return permissions

    } catch (error) {
      console.error('Erro ao obter permissões:', error)
      return {}
    }
  }

  // Limpar cache
  clearCache(): void {
    userCache.clear()
  }
}

// Instância singleton
export const authService = new AuthService()
export default authService 