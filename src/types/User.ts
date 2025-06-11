// Tipos para o usuário e informações do Azure AD
export interface AzureADUser {
  // IDs e identificadores
  id?: string;
  objectId?: string;
  onPremisesImmutableId?: string;
  userPrincipalName?: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  mailNickname?: string;
  
  // Informações profissionais expandidas
  jobTitle?: string;
  department?: string;
  companyName?: string;
  division?: string;
  costCenter?: string;
  officeLocation?: string;
  employeeId?: string;
  employeeType?: string;
  
  // Contato expandido
  mobilePhone?: string;
  businessPhones?: string[];
  faxNumber?: string;
  
  // Localização expandida
  country?: string;
  city?: string;
  state?: string;
  streetAddress?: string;
  postalCode?: string;
  usageLocation?: string;
  
  // Configurações e preferências
  preferredLanguage?: string;
  accountEnabled?: boolean;
  passwordPolicies?: string;
  
  // Informações pessoais expandidas
  aboutMe?: string;
  birthday?: string;
  hireDate?: string;
  workAnniversary?: string;
  interests?: string[];
  skills?: string[];
  responsibilities?: string[];
  schools?: string[];
  pastProjects?: string[];
  certifications?: string[];
  
  // Hierarquia organizacional expandida
  manager?: {
    id?: string;
    displayName?: string;
    mail?: string;
    jobTitle?: string;
    department?: string;
  };
  
  // Subordinados diretos
  directReports?: Array<{
    id?: string;
    displayName?: string;
    mail?: string;
    jobTitle?: string;
    department?: string;
  }>;
  
  // Foto do perfil expandida
  photo?: {
    id?: string;
    height?: number;
    width?: number;
    url?: string;
    contentType?: string;
  };
  
  // Grupos e roles expandidos
  memberOf?: string[];
  roles?: string[];
  
  // Timestamps expandidos
  createdDateTime?: string;
  lastPasswordChangeDateTime?: string;
  lastSignInDateTime?: string;
  signInSessionsValidFromDateTime?: string;
  
  // Configurações de autenticação expandidas
  authMethods?: string[];
  mfaEnabled?: boolean;
  
  // Contatos de emergência
  emergencyContacts?: Array<{
    name?: string;
    relationship?: string;
    phone?: string;
  }>;
  
  // Configurações de trabalho
  workingHours?: {
    start?: string;
    end?: string;
    timezone?: string;
    workDays?: string[];
  };
  
  // Licenças e aplicativos
  assignedLicenses?: string[];
  assignedPlans?: string[];
}

export interface User {
  // Campos básicos (compatibilidade)
  email: string;
  name: string;
  isAdmin: boolean;
  authType?: 'local' | 'azure' | 'azure-popup';
  
  // Campos expandidos do Azure AD
  azureProfile?: AzureADUser;
  
  // Metadados da sessão
  loginTimestamp?: string;
  lastActivity?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scopes?: string[];
}

export interface UserPermissions {
  canViewFinancials: boolean;
  canManageUsers: boolean;
  canUploadFiles: boolean;
  canViewReports: boolean;
  canManageProjects: boolean;
  canConfigureSystem: boolean;
  departmentAccess: string[];
  projectAccess: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
  };
  dashboard: {
    defaultView: string;
    widgetsConfig: any[];
  };
} 