import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";
import { Button } from "react-bootstrap";
import { FaMicrosoft } from "react-icons/fa";

const Login: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.error("Erro durante o login popup:", e);
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div
        style={{
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
        <h2>Bem-vindo</h2>
        <p className="mb-4">Clique no botão abaixo para entrar com sua conta Microsoft.</p>
        <Button variant="primary" onClick={handleLogin}>
          <FaMicrosoft className="me-2" /> Entrar com Microsoft
        </Button>
      </div>
    </div>
  );
};

export default Login;
