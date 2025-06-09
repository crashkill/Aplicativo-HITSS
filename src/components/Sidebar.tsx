import { useState } from 'react'
import { Nav } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { Squash as Hamburger } from 'hamburger-react'
import {
  UilAnalytics,
  UilFileAlt,
  UilChartGrowth,
  UilCloudUpload,
  UilSetting,

  UilBars,
  UilAngleRight,
  UilUsersAlt,
  UilDatabase
} from '@iconscout/react-unicons'
import { useConfig } from '../contexts/ConfigContext'
import ThemeToggle from './ui/ThemeToggle'

// Wrappers para os ícones com propriedades explícitas e fallbacks
const Analytics = ({ size = 20, color = 'currentColor', ...props }) => {
  try {
    return <UilAnalytics size={size} color={color} {...props} />
  } catch (error) {
    return <span style={{ fontSize: '16px' }}>📊</span>
  }
}

const FileAlt = ({ size = 20, color = 'currentColor', ...props }) => {
  try {
    return <UilFileAlt size={size} color={color} {...props} />
  } catch (error) {
    return <span style={{ fontSize: '16px' }}>📄</span>
  }
}

const ChartGrowth = ({ size = 20, color = 'currentColor', ...props }) => {
  try {
    return <UilChartGrowth size={size} color={color} {...props} />
  } catch (error) {
    return <span style={{ fontSize: '16px' }}>📈</span>
  }
}

const CloudUpload = ({ size = 20, color = 'currentColor', ...props }) => {
  try {
    return <UilCloudUpload size={size} color={color} {...props} />
  } catch (error) {
    return <span style={{ fontSize: '16px' }}>☁️</span>
  }
}

const Setting = ({ size = 20, color = 'currentColor', ...props }) => {
  try {
    return <UilSetting size={size} color={color} {...props} />
  } catch (error) {
    return <span style={{ fontSize: '16px' }}>⚙️</span>
  }
}

const People = ({ size = 20, color = 'currentColor', ...props }) => {
  try {
    return <UilUsersAlt size={size} color={color} {...props} />
  } catch (error) {
    return <span style={{ fontSize: '16px' }}>👥</span>
  }
}

const Database = ({ size = 20, color = 'currentColor', ...props }) => {
  try {
    return <UilDatabase size={size} color={color} {...props} />
  } catch (error) {
    return <span style={{ fontSize: '16px' }}>🗄️</span>
  }
}

interface MenuIconProps {
  icon: React.ReactNode;
  color: string;
  isActive?: boolean;
  size?: number;
}

const MenuIcon = ({ 
  icon, 
  color, 
  isActive = false, 
  size = 24 
}: MenuIconProps): JSX.Element => {
  return (
    <div 
      className="sidebar-menu-icon"
      style={{ 
        color: isActive ? '#0d6efd' : color,
        transition: 'color 0.3s ease'
      }}
    >
      {icon}
    </div>
  )
}

const Sidebar = () => {
  const location = useLocation()
  const { config } = useConfig()
  const [isOpen, setIsOpen] = useState(true)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const sidebarWidth = isOpen ? '250px' : '80px'
  const menuItemClass = isOpen ? 'd-flex align-items-center' : 'd-flex justify-content-center'
  const textClass = isOpen ? 'ms-2' : 'd-none'

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Analytics size={20} color="currentColor" />,
      path: '/dashboard',
      color: '#2196f3'
    },
    {
      text: 'Planilhas Financeiras',
      icon: <FileAlt size={20} color="currentColor" />,
      path: '/planilhas',
      color: '#4caf50'
    },
    {
      text: 'Forecast',
      icon: <ChartGrowth size={20} color="currentColor" />,
      path: '/forecast',
      color: '#9c27b0'
    },
    {
      text: 'Gestão de Profissionais',
      icon: <People size={20} color="currentColor" />,
      path: '/gestao-profissionais',
      color: '#e91e63'
    },
    {
      text: 'Upload',
      icon: <CloudUpload size={20} color="currentColor" />,
      path: '/upload',
      color: '#ff9800'
    },
    {
      text: 'Consulta SAP',
      icon: <Database size={20} color="currentColor" />,
      path: '/consulta-sap',
      color: '#00bcd4'
    },
    {
      text: 'Configurações',
      icon: <Setting size={20} color="currentColor" />,
      path: '/config',
      color: '#607d8b'
    }
  ];

  return (
    <div 
      className="bg-gray-50 dark:bg-slate-800 shadow-sm" 
      style={{ 
        width: sidebarWidth, 
        minHeight: '100vh', 
        position: 'fixed',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        zIndex: 1000
      }}
    >
      <div className="p-3">
        <div className="d-flex align-items-center justify-content-between mb-4">
          {isOpen && <h5 className="mb-0 text-slate-700 dark:text-slate-300">Menu</h5>}
          <div style={{ 
            color: '#6c757d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px'
          }}>
            <Hamburger 
              toggled={isOpen} 
              toggle={setIsOpen}
              size={22}
              duration={0.5}
              easing="ease-in-out"
              distance="lg"
              color="currentColor"
              rounded
            />
          </div>
        </div>
        <Nav className="flex-column">
          {menuItems.map((menuItem, index) => (
            <Nav.Item key={index}>
              <Link
                to={menuItem.path}
                className={`nav-link py-2 ${menuItemClass} ${
                  isActive(menuItem.path) 
                    ? 'active bg-blue-100 dark:bg-blue-500 dark:bg-opacity-20 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
                style={{
                  borderRadius: '8px',
                  margin: '2px 0',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
              >
                <MenuIcon 
                  icon={menuItem.icon}
                  color={menuItem.color}
                  isActive={isActive(menuItem.path)}
                />
                <span className={textClass}>{menuItem.text}</span>
              </Link>
            </Nav.Item>
          ))}
        </Nav>
        
        {/* Footer do Sidebar com ThemeToggle e informações do usuário */}
        <div className="position-absolute bottom-0 start-0 p-3 w-100" style={{ paddingBottom: '20px' }}>
          {/* ThemeToggle sempre visível */}
          <div className={`d-flex justify-content-center ${isOpen && config.userImage ? 'mb-3' : 'mb-0'}`}>
            <ThemeToggle className={isOpen ? '' : 'scale-75'} />
          </div>
          
          {/* Informações do usuário (apenas quando sidebar expandido) */}
          {isOpen && config.userImage && (
            <div className="d-flex align-items-center">
              <img 
                src={config.userImage} 
                alt="User" 
                className="rounded-circle"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              />
              <span className="ms-2 text-slate-700 dark:text-slate-300">{config.userName || 'Usuário'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
