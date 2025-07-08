import React, { useState, useEffect } from "react";

// Decodifico token JWT (para persistencia)
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (err) {
        console.error("Error decodificando token:", err);
        return null;
    }
};

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verifico autenticación al cargar la página
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const payload = decodeJWT(token);
            if (payload?.id) {
                // Recupero datos básicos del token (evita llamar a api/usuarios/perfil)
                setUser({
                    id: payload.id,
                    email: payload.email,
                    rol: payload.rol,
                    nombre: payload.nombre // Añadido para compatibilidad
                });
                setIsAuthenticated(true);
            }
        }
        setLoading(false);
    }, []);

    // Función de login
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || "Error en el login");
            }

            // Guardo token y datos del usuario
            localStorage.setItem("token", data.token);
            const payload = decodeJWT(data.token);
            
            const userData = {
                id: payload.id,
                email: payload.email,
                rol: payload.rol,
                nombre: payload.nombre
            };
            
            setUser(userData);
            setIsAuthenticated(true);
            setLoading(false);
            
            return userData;

        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
    };

    return { 
        user, 
        loading, 
        error, 
        isAuthenticated, // Añadido
        login, 
        logout 
    };
};

export default useAuth;