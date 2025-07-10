import { useState, useEffect } from "react";

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

    // Inicializo la autenticación al cargar el componente
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        const payload = decodeJWT(token);
        if (!payload?.id) {
            localStorage.removeItem("token");
            setLoading(false);
            return;
        }

        // Verifico posible token expirado
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            setLoading(false);
            return;
        }

        setUser({
            id: payload.id,
            email: payload.email,
            rol: payload.rol,
            nombre: payload.nombre
        });
        setLoading(false);

    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || "Error en el login");
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            
            const payload = decodeJWT(data.token);
            const userData = {
                id: payload.id,
                email: payload.email,
                rol: payload.rol,
                nombre: payload.nombre
            };
            
            setUser(userData);
            return userData;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return { 
        user, 
        loading,
        error,
        isAuthenticated: !!user,
        login, 
        logout 
    };
};

export default useAuth;