import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button, Card, Form, Alert, InputGroup } from "react-bootstrap";
import { FaMicrosoft, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { azureAuthService } from "../services/AzureAuthService";

const Login: React.FC = () => {
  const { loginWithAzure, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("fabricio.lima@globalhitss.com.br");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [azureLoading, setAzureLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar Azure Auth Service
  useEffect(() => {
    const initializeAzure = async () => {
      try {
        await azureAuthService.initialize();
        setIsInitialized(true);
        console.log('✅ Azure Auth Service inicializado');
      } catch (error) {
        console.error('❌ Erro ao inicializar Azure Auth Service:', error);
        setError('Erro ao inicializar autenticação Azure AD');
      }
    };

    initializeAzure();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha email e senha');
      return;
    }

    if (!isInitialized) {
      setError('Sistema de autenticação não foi inicializado');
      return;
    }

    setError("");
    setAzureLoading(true);

    try {
      console.log('🔐 Iniciando autenticação Azure AD...');
      
      // Usar o método loginWithAzure do AuthContext
      // que automaticamente lidará com MFA e Number Matching
      await loginWithAzure();
      
      console.log('✅ Login Azure completo! Redirecionando...');
      
      // Redirecionar para dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('❌ Erro no login Azure AD:', error);
      
      // Tratar diferentes tipos de erro
      if (error.errorCode === 'user_cancelled') {
        setError('Login cancelado pelo usuário');
      } else if (error.errorCode === 'consent_required') {
        setError('É necessário consentir as permissões do aplicativo');
      } else if (error.errorCode === 'interaction_required') {
        setError('Interação adicional necessária. Tente novamente.');
      } else {
        setError('Erro durante autenticação. Verifique suas credenciais.');
      }
    } finally {
      setAzureLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
           fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
         }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-4 col-lg-3">
            <Card className="shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-4">
                
                {/* Header */}
                <div className="text-center mb-4">
                  <h3 className="mb-1" style={{ color: '#5a6c7d', fontWeight: 300 }}>
                    Gestão de
                  </h3>
                  <h3 className="mb-4" style={{ color: '#5a6c7d', fontWeight: 300 }}>
                    Receita Líquida
                  </h3>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" className="mb-3">
                    <small>{error}</small>
                  </Alert>
                )}

                {/* Loading Alert */}
                {!isInitialized && (
                  <Alert variant="info" className="mb-3">
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                      <small>Inicializando autenticação...</small>
                    </div>
                  </Alert>
                )}

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  
                  {/* Email Field */}
                  <Form.Group className="mb-3">
                    <InputGroup>
                      <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: 'none' }}>
                        <FaUser className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="usuario@globalhitss.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ 
                          border: 'none',
                          borderRadius: '0 5px 5px 0',
                          backgroundColor: '#f8f9fa'
                        }}
                        disabled={azureLoading || isLoading}
                      />
                    </InputGroup>
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group className="mb-4">
                    <InputGroup>
                      <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: 'none' }}>
                        <FaLock className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ 
                          border: 'none',
                          backgroundColor: '#f8f9fa'
                        }}
                        disabled={azureLoading || isLoading}
                      />
                      <InputGroup.Text 
                        style={{ 
                          backgroundColor: '#f8f9fa', 
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '0 5px 5px 0'
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  {/* Login Button */}
                  <div className="d-grid mb-4">
                    <Button
                      type="submit"
                      variant="light"
                      size="lg"
                      disabled={azureLoading || isLoading || !isInitialized}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#5a6c7d',
                        border: 'none',
                        borderRadius: '25px',
                        fontWeight: 500,
                        padding: '12px'
                      }}
                    >
                      {azureLoading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Carregando...</span>
                          </div>
                          Autenticando...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </div>

                </Form>

                {/* Footer with Logo */}
                <div className="text-center">
                  <div className="d-flex align-items-center justify-content-center">
                    <FaMicrosoft style={{ color: '#0078d4', fontSize: '20px' }} className="me-2" />
                    <span style={{ 
                      color: '#5a6c7d', 
                      fontWeight: 'bold',
                      fontSize: '18px' 
                    }}>
                      HITSS
                    </span>
                  </div>
                  <small className="text-muted mt-2 d-block">
                    Powered by Microsoft Azure AD
                  </small>
                </div>

              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
