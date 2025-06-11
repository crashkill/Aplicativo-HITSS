import { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        console.log(`MSAL ${level}: ${message}`);
      },
      piiLoggingEnabled: false,
    },
  },
};

// Scopes expandidos para obter informações completas do usuário
export const loginRequest: PopupRequest = {
  scopes: [
    "openid",
    "profile", 
    "email",
    "User.Read",
    "User.ReadBasic.All",
    "Directory.Read.All", // Para informações do diretório
    "People.Read", // Para informações de contatos
    "Calendars.Read", // Para informações de calendário se necessário
    "Files.Read", // Para acessar arquivos se necessário
    "Sites.Read.All", // Para SharePoint se necessário
    "Group.Read.All", // Para informações de grupos
    "Directory.AccessAsUser.All" // Para acesso completo ao diretório
  ],
  prompt: "select_account",
};

// Scopes específicos para Microsoft Graph API
export const graphScopes = {
  userProfile: ["User.Read"],
  userDetails: ["User.Read", "User.ReadBasic.All"],
  directory: ["Directory.Read.All"],
  manager: ["User.Read.All"],
  photo: ["User.Read"],
  groups: ["Group.Read.All"],
  calendar: ["Calendars.Read"],
  files: ["Files.Read"],
  sites: ["Sites.Read.All"]
};

// URLs da Microsoft Graph API
export const graphEndpoints = {
  me: "https://graph.microsoft.com/v1.0/me",
  meExtended: "https://graph.microsoft.com/v1.0/me?$select=id,userPrincipalName,displayName,givenName,surname,mail,mailNickname,jobTitle,department,companyName,officeLocation,employeeId,mobilePhone,businessPhones,faxNumber,country,city,state,streetAddress,postalCode,usageLocation,preferredLanguage,accountEnabled,aboutMe,birthday,hireDate,interests,skills,schools,pastProjects,createdDateTime,lastPasswordChangeDateTime",
  manager: "https://graph.microsoft.com/v1.0/me/manager",
  photo: "https://graph.microsoft.com/v1.0/me/photo",
  photoValue: "https://graph.microsoft.com/v1.0/me/photo/$value",
  memberOf: "https://graph.microsoft.com/v1.0/me/memberOf",
  directReports: "https://graph.microsoft.com/v1.0/me/directReports",
  organization: "https://graph.microsoft.com/v1.0/organization"
};

// Configurações de cache para diferentes tipos de dados
export const cacheConfig = {
  userProfile: {
    key: "azure_user_profile",
    expiration: 1000 * 60 * 60 * 24, // 24 horas
  },
  userPhoto: {
    key: "azure_user_photo", 
    expiration: 1000 * 60 * 60 * 24 * 7, // 7 dias
  },
  groups: {
    key: "azure_user_groups",
    expiration: 1000 * 60 * 60 * 4, // 4 horas
  },
  manager: {
    key: "azure_user_manager",
    expiration: 1000 * 60 * 60 * 24, // 24 horas
  }
}; 