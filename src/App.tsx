import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Config from './pages/Config'
import Forecast from './pages/Forecast'
import PlanilhasFinanceiras from './pages/PlanilhasFinanceiras'

import GestaoProfissionais from './pages/GestaoProfissionais'
import ConsultaSAP from './pages/ConsultaSAP'
import Layout from './components/Layout'
import { useEffect } from 'react'
import { useIsAuthenticated } from "@azure/msal-react";

// Componente para rotas protegidas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redireciona para a página de login, salvando a localização atual
    // para que possamos enviar o usuário de volta para lá depois do login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
}

// Componente para garantir que o tema seja aplicado ao body
export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // As classes de cor do body serão herdadas ou definidas por bg-background
  }, [theme])

  return <>{children}</>
}

function App() {
  const { user } = useAuth(); // Mantemos o useAuth por enquanto, se necessário
  const isAuthenticated = useIsAuthenticated();

  return (
    <ThemeProvider>
      <ThemeWrapper>
        <div data-testid="app-container" className="min-h-screen transition-colors duration-300 bg-background text-foreground">
          <Routes>
            {/* Se o usuário NÃO estiver autenticado pelo MSAL, mostre apenas a página de login */}
            {!isAuthenticated && <Route path="*" element={<Login />} />}

            {/* Se o usuário ESTIVER autenticado, renderize as rotas protegidas */}
            {isAuthenticated && (
              <>
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/planilhas"
                  element={
                    <PrivateRoute>
                      <PlanilhasFinanceiras />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/forecast"
                  element={
                    <PrivateRoute>
                      <Forecast />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/gestao-profissionais"
                  element={
                    <PrivateRoute>
                      <GestaoProfissionais />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <PrivateRoute>
                      <Upload />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/consulta-sap"
                  element={
                    <PrivateRoute>
                      <ConsultaSAP />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/config"
                  element={
                    <PrivateRoute>
                      <Config />
                    </PrivateRoute>
                  }
                />
                {/* Redirecionamento da raiz */}
                <Route 
                  path="/" 
                  element={<Navigate to="/dashboard" replace />} 
                />
                {/* Fallback para qualquer outra rota */}
                <Route 
                  path="*" 
                  element={<Navigate to="/dashboard" replace />} 
                />
              </>
            )}
          </Routes>
        </div>
      </ThemeWrapper>
    </ThemeProvider>
  )
}

export default App;
