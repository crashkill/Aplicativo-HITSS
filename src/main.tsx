import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./config/authConfig";
import { AuthProvider } from './contexts/AuthContext'
import { ConfigProvider } from './contexts/ConfigContext'
import { ThemeProvider } from './contexts/ThemeContext'
import App from './App'

// Styles
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import './styles/custom.css'

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Ensure the root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  const root = document.createElement('div')
  root.id = 'root'
  document.body.appendChild(root)
}

/**
 * Cria uma instância do PublicClientApplication que será passada para o MsalProvider.
 * Esta instância não deve ser recriada a cada renderização.
 */
const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <MsalProvider instance={msalInstance}>
          <ThemeProvider>
            <AuthProvider>
              <ConfigProvider>
                <App />
              </ConfigProvider>
            </AuthProvider>
          </ThemeProvider>
        </MsalProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
