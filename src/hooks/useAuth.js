import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const decodeJWT = (token) => {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        // Verificar expiración
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null;
        }
        return payload;
    } catch (err) {
        console.error("Error decodificando token:", err);
        return null;
    }
};

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Función para inicializar la autenticación
    const initializeAuth = () => {
        const token = localStorage.getItem("token");
        const rememberMe = localStorage.getItem("rememberMe") === "true";
        
        if (token && rememberMe) {
            const payload = decodeJWT(token);
            if (payload) {
                setUser({
                    id: payload.id,
                    email: payload.email,
                    rol: payload.rol,
                    nombre: payload.nombre
                });
                setLoading(false);
                return;
            }
        }
        setUser(null);
        setLoading(false);
    };

    // Inicializo al montar
    useEffect(() => {
        initializeAuth();
        
        // Escucho eventos de almacenamiento para sincronizar entre pestañas
        const handleStorageChange = (e) => {
            if (e.key === "token" || e.key === "rememberMe") {
                initializeAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (email, password, remember = false) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, rememberMe: remember }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || "Error en el login");
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("rememberMe", remember.toString());

            const payload = decodeJWT(data.token);
            if (!payload) throw new Error("Token inválido");

            const userData = {
                id: payload.id,
                email: payload.email,
                rol: payload.rol,
                nombre: payload.nombre
            };

            setUser(userData);
            navigate("/");
            return userData;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rememberMe");
        setUser(null);
        navigate("/login");
    };

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout
    };
};

export default useAuth;