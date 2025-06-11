import React, { useState } from 'react'
import { User } from '../types/User'
import { useAuth } from '../contexts/AuthContext'
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaShieldAlt, FaMicrosoft, FaDesktop, FaClock } from 'react-icons/fa';

interface UserInfoProps {
  user?: User
}

interface InfoSectionProps {
  title: string
  icon: string
  children: React.ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
}

const InfoSection: React.FC<InfoSectionProps> = ({ 
  title, 
  icon, 
  children, 
  collapsible = true, 
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible || defaultExpanded)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
      <div 
        className={`px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between ${
          collapsible ? 'cursor-pointer hover:bg-gray-100' : ''
        }`}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        {collapsible && (
          <span className={`text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        )}
      </div>
      {isExpanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  )
}

const InfoItem: React.FC<{ label: string; value: any; type?: 'text' | 'email' | 'phone' | 'date' | 'array' }> = ({ 
  label, 
  value, 
  type = 'text' 
}) => {
  if (!value) return null

  const renderValue = () => {
    switch (type) {
      case 'email':
        return <a href={`mailto:${value}`} className="text-blue-600 hover:underline">{value}</a>
      case 'phone':
        return <a href={`tel:${value}`} className="text-blue-600 hover:underline">{value}</a>
      case 'date':
        return new Date(value).toLocaleString('pt-BR')
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value
      default:
        return value
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-100 last:border-b-0">
      <dt className="font-medium text-gray-600 mb-1 sm:mb-0 sm:w-1/3">{label}:</dt>
      <dd className="text-gray-900 sm:w-2/3">{renderValue()}</dd>
    </div>
  )
}

const UserInfo: React.FC<UserInfoProps> = ({ user: propUser }) => {
  const { user: authUser } = useAuth()
  
  // Usar usuário das props ou do contexto de autenticação
  const user = propUser || authUser
  
  if (!user) {
    return (
      <div className="text-center p-6 text-gray-500">
        <div className="text-4xl mb-3">👤</div>
        <p>Nenhum usuário logado</p>
      </div>
    )
  }

  const azureProfile = user.azureProfile

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      {/* Header com foto e informações básicas */}
      <InfoSection title="Perfil Principal" icon="👤" collapsible={false}>
        <div className="flex items-start gap-6">
          {/* Foto do perfil */}
          <div className="flex-shrink-0">
            {azureProfile?.photo?.url ? (
              <img 
                src={azureProfile.photo.url} 
                alt="Foto do perfil"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-blue-200 shadow-lg">
                <span className="text-4xl text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Informações básicas */}
          <div className="flex-grow">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
            <p className="text-xl text-gray-600 mb-2">{azureProfile?.jobTitle || 'Usuário do Sistema'}</p>
            <p className="text-lg text-gray-600 mb-4">{azureProfile?.department || azureProfile?.companyName || 'Global HITSS'}</p>
            
            <div className="flex items-center gap-3 text-sm flex-wrap mb-4">
              <span className={`px-3 py-1 rounded-full font-medium ${
                user.authType?.includes('azure') ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {user.authType?.includes('azure') ? '🔷 Azure AD' : '🔐 Local'}
              </span>
              
              {user.isAdmin && (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                  👑 Administrador Global
                </span>
              )}

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                ✅ Conectado
              </span>

              {azureProfile?.mfaEnabled && (
                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-medium">
                  🔐 MFA Ativo
                </span>
              )}
            </div>

            {azureProfile?.aboutMe && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 italic">"{azureProfile.aboutMe}"</p>
              </div>
            )}
          </div>
        </div>
      </InfoSection>

      {/* Mostrar seções expandidas para usuários Azure AD */}
      {user.authType?.includes('azure') && azureProfile ? (
        <>
          {/* Informações de contato expandidas */}
          <InfoSection title="Informações de Contato" icon="📞" defaultExpanded={true}>
            <dl className="divide-y divide-gray-100">
              <InfoItem label="Email principal" value={azureProfile?.mail} type="email" />
              <InfoItem label="Email alternativo" value={user.email !== azureProfile?.mail ? user.email : null} type="email" />
              <InfoItem label="UPN" value={azureProfile?.userPrincipalName} />
              <InfoItem label="Telefone móvel" value={azureProfile?.mobilePhone} type="phone" />
              <InfoItem label="Telefones comerciais" value={azureProfile?.businessPhones} type="array" />
              <InfoItem label="Fax" value={azureProfile?.faxNumber} type="phone" />
            </dl>
          </InfoSection>

          {/* Informações profissionais expandidas */}
          <InfoSection title="Informações Profissionais" icon="💼" defaultExpanded={true}>
            <dl className="divide-y divide-gray-100">
              <InfoItem label="Cargo" value={azureProfile?.jobTitle} />
              <InfoItem label="Departamento" value={azureProfile?.department} />
              <InfoItem label="Empresa" value={azureProfile?.companyName} />
              <InfoItem label="Divisão" value={azureProfile?.division} />
              <InfoItem label="Centro de Custo" value={azureProfile?.costCenter} />
              <InfoItem label="ID do funcionário" value={azureProfile?.employeeId} />
              <InfoItem label="Tipo de funcionário" value={azureProfile?.employeeType} />
              <InfoItem label="Localização do escritório" value={azureProfile?.officeLocation} />
              <InfoItem label="Data de contratação" value={azureProfile?.hireDate} type="date" />
              <InfoItem label="Aniversário de trabalho" value={azureProfile?.workAnniversary} type="date" />
            </dl>
          </InfoSection>

          {/* Hierarquia organizacional */}
          {(azureProfile?.manager || (azureProfile?.directReports && azureProfile.directReports.length > 0)) && (
            <InfoSection title="Hierarquia Organizacional" icon="🏢" defaultExpanded={true}>
              <div className="space-y-6">
                {azureProfile.manager && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span>👨‍💼</span> Gerente Direto
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="font-medium text-lg text-gray-900">{azureProfile.manager.displayName}</p>
                      <p className="text-gray-600 mb-2">{azureProfile.manager.jobTitle}</p>
                      <p className="text-sm text-gray-500 mb-2">{azureProfile.manager.department}</p>
                      {azureProfile.manager.mail && (
                        <a href={`mailto:${azureProfile.manager.mail}`} className="text-blue-600 hover:underline text-sm">
                          📧 {azureProfile.manager.mail}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {azureProfile.directReports && azureProfile.directReports.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span>👥</span> Subordinados Diretos ({azureProfile.directReports.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {azureProfile.directReports.map((report, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <p className="font-medium text-gray-900">{report.displayName}</p>
                          <p className="text-sm text-gray-600">{report.jobTitle}</p>
                          <p className="text-xs text-gray-500 mb-1">{report.department}</p>
                          {report.mail && (
                            <a href={`mailto:${report.mail}`} className="text-blue-600 hover:underline text-xs">
                              📧 {report.mail}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </InfoSection>
          )}

          {/* Grupos e funções */}
          <InfoSection title="Grupos e Funções" icon="🔑" defaultExpanded={true}>
            <div className="space-y-4">
              {azureProfile.roles && azureProfile.roles.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🔴 Funções Administrativas</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {azureProfile.roles.map((role, index) => (
                      <span key={index} className="px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                        👑 {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {azureProfile.memberOf && azureProfile.memberOf.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🟢 Grupos de Segurança ({azureProfile.memberOf.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {azureProfile.memberOf.map((group, index) => (
                      <span key={index} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
                        👥 {group}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </InfoSection>

          {/* Habilidades e responsabilidades */}
          {(azureProfile?.skills || azureProfile?.responsibilities) && (
            <InfoSection title="Habilidades e Responsabilidades" icon="🎯">
              <div className="space-y-4">
                {azureProfile.skills && azureProfile.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">💻 Habilidades Técnicas</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {azureProfile.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm text-center">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {azureProfile.responsibilities && azureProfile.responsibilities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">📋 Responsabilidades</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {azureProfile.responsibilities.map((resp, index) => (
                        <li key={index} className="text-sm">{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </InfoSection>
          )}

          {/* Localização e configurações */}
          <InfoSection title="Localização e Configurações" icon="🌍">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">📍 Localização</h4>
                <dl className="divide-y divide-gray-100">
                  <InfoItem label="País" value={azureProfile?.country} />
                  <InfoItem label="Estado" value={azureProfile?.state} />
                  <InfoItem label="Cidade" value={azureProfile?.city} />
                  <InfoItem label="Endereço" value={azureProfile?.streetAddress} />
                  <InfoItem label="CEP" value={azureProfile?.postalCode} />
                  <InfoItem label="Localização de uso" value={azureProfile?.usageLocation} />
                </dl>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">⚙️ Configurações</h4>
                <dl className="divide-y divide-gray-100">
                  <InfoItem label="Idioma preferido" value={azureProfile?.preferredLanguage} />
                  <InfoItem label="Conta ativa" value={azureProfile?.accountEnabled ? 'Sim' : 'Não'} />
                  <InfoItem label="MFA habilitado" value={azureProfile?.mfaEnabled ? 'Sim' : 'Não'} />
                  <InfoItem label="Métodos de autenticação" value={azureProfile?.authMethods} type="array" />
                </dl>
              </div>
            </div>
          </InfoSection>

          {/* Horário de trabalho e contatos de emergência */}
          <InfoSection title="Informações de Trabalho" icon="⏰">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {azureProfile?.workingHours && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🕐 Horário de Trabalho</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p><strong>Horário:</strong> {azureProfile.workingHours.start} - {azureProfile.workingHours.end}</p>
                    <p><strong>Fuso:</strong> {azureProfile.workingHours.timezone}</p>
                    <p><strong>Dias:</strong> {azureProfile.workingHours.workDays?.join(', ')}</p>
                  </div>
                </div>
              )}

              {azureProfile?.emergencyContacts && azureProfile.emergencyContacts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🚨 Contatos de Emergência</h4>
                  {azureProfile.emergencyContacts.map((contact, index) => (
                    <div key={index} className="bg-red-50 p-3 rounded-lg mb-2">
                      <p><strong>{contact.name}</strong></p>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                      <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline text-sm">
                        📞 {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InfoSection>

          {/* Educação e certificações */}
          {(azureProfile?.schools || azureProfile?.certifications) && (
            <InfoSection title="Educação e Certificações" icon="🎓">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {azureProfile.schools && azureProfile.schools.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">🏫 Formação Acadêmica</h4>
                    <ul className="space-y-2">
                      {azureProfile.schools.map((school, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <span className="text-blue-600">🎓</span>
                          {school}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {azureProfile.certifications && azureProfile.certifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">🏆 Certificações</h4>
                    <ul className="space-y-2">
                      {azureProfile.certifications.map((cert, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <span className="text-green-600">🏆</span>
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </InfoSection>
          )}

          {/* Projetos e interesses */}
          {(azureProfile?.pastProjects || azureProfile?.interests) && (
            <InfoSection title="Projetos e Interesses" icon="🚀">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {azureProfile.pastProjects && azureProfile.pastProjects.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">💼 Projetos Anteriores</h4>
                    <ul className="space-y-2">
                      {azureProfile.pastProjects.map((project, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-600 mt-1">📂</span>
                          <span>{project}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {azureProfile.interests && azureProfile.interests.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">🎯 Interesses</h4>
                    <div className="flex flex-wrap gap-2">
                      {azureProfile.interests.map((interest, index) => (
                        <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </InfoSection>
          )}

          {/* Licenças e aplicativos */}
          {(azureProfile?.assignedLicenses || azureProfile?.assignedPlans) && (
            <InfoSection title="Licenças e Aplicativos" icon="📱">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {azureProfile.assignedLicenses && azureProfile.assignedLicenses.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">🎫 Licenças Atribuídas</h4>
                    <div className="space-y-2">
                      {azureProfile.assignedLicenses.map((license, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
                          <span className="text-blue-600">🎫</span>
                          {license}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {azureProfile.assignedPlans && azureProfile.assignedPlans.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">📋 Planos de Serviço</h4>
                    <div className="space-y-2">
                      {azureProfile.assignedPlans.map((plan, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded">
                          <span className="text-green-600">📋</span>
                          {plan}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </InfoSection>
          )}

          {/* Informações técnicas expandidas */}
          <InfoSection title="Informações Técnicas e Auditoria" icon="🔧">
            <dl className="divide-y divide-gray-100">
              <InfoItem label="ID do Azure" value={azureProfile?.id} />
              <InfoItem label="Object ID" value={azureProfile?.objectId} />
              <InfoItem label="Immutable ID" value={azureProfile?.onPremisesImmutableId} />
              <InfoItem label="Conta criada em" value={azureProfile?.createdDateTime} type="date" />
              <InfoItem label="Última alteração de senha" value={azureProfile?.lastPasswordChangeDateTime} type="date" />
              <InfoItem label="Último login" value={azureProfile?.lastSignInDateTime} type="date" />
              <InfoItem label="Sessões válidas desde" value={azureProfile?.signInSessionsValidFromDateTime} type="date" />
              <InfoItem label="Políticas de senha" value={azureProfile?.passwordPolicies} />
              <InfoItem label="ID da sessão atual" value={user.sessionId} />
              <InfoItem label="User Agent" value={user.userAgent} />
            </dl>
          </InfoSection>

        </>
      ) : (
        /* Informações básicas para usuários locais */
        <InfoSection title="Informações da Conta" icon="📋" defaultExpanded={true}>
          <dl className="divide-y divide-gray-100">
            <InfoItem label="Email" value={user.email} type="email" />
            <InfoItem label="Nome" value={user.name} />
            <InfoItem label="Tipo de conta" value={user.authType === 'local' ? 'Conta Local' : 'Azure AD'} />
            <InfoItem label="Nível de acesso" value={user.isAdmin ? 'Administrador' : 'Usuário'} />
            <InfoItem label="Último login" value={user.loginTimestamp} type="date" />
          </dl>
        </InfoSection>
      )}

      {/* Resumo dos dados capturados */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h5 className="text-green-800 font-bold text-lg mb-3 flex items-center gap-2">
          <span>✅</span> Dados Capturados Automaticamente
        </h5>
        <div className="text-sm text-green-700">
          <p className="mb-3 font-medium">
            <strong>Sistema Azure AD:</strong> Perfil completíssimo sincronizado automaticamente
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span>👤</span> Informações pessoais
            </div>
            <div className="flex items-center gap-1">
              <span>📞</span> Dados de contato
            </div>
            <div className="flex items-center gap-1">
              <span>💼</span> Informações profissionais
            </div>
            <div className="flex items-center gap-1">
              <span>🏢</span> Hierarquia organizacional
            </div>
            <div className="flex items-center gap-1">
              <span>🔑</span> Grupos e funções
            </div>
            <div className="flex items-center gap-1">
              <span>🎯</span> Habilidades e responsabilidades
            </div>
            <div className="flex items-center gap-1">
              <span>🎓</span> Educação e certificações
            </div>
            <div className="flex items-center gap-1">
              <span>📱</span> Licenças e aplicativos
            </div>
          </div>
          {user.azureProfile && (
            <div className="mt-3 text-center">
              <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full font-bold">
                📊 {Object.keys(user.azureProfile).length}+ campos capturados
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserInfo 