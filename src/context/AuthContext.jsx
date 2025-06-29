import React from "react";
import { createContext, useEffect, useState, useContext } from "react";
import { jwtDecode } from 'jwt-decode'; // forma correcta
// import jwtDecode from 'jwt-decode'; // forma incorrecto, no es un default export

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsuario(decoded);
      } catch (err) {
        console.error("Token inválido", err);
        localStorage.removeItem("token");
        setUsuario(null);
      }
    }

    setCargando(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUsuario(decoded);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};