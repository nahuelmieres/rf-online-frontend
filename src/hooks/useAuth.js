import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

// Almacenamiento global del estado de autenticación
let globalUser = null;
let globalListeners = [];

const notifyListeners = () => {
    globalListeners.forEach(listener => listener(globalUser));
};

export const useAuth = () => {
    const [user, setUser] = useState(globalUser);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Registrar listener
        globalListeners.push(setUser);
        
        // Limpiar al desmontar
        return () => {
            globalListeners = globalListeners.filter(l => l !== setUser);
        };
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const rememberMe = localStorage.getItem("rememberMe") === "true";

        if (storedToken && rememberMe) {
            const payload = decodeJWT(storedToken);
            
            if (payload && payload.exp * 1000 > Date.now()) {
                const userData = {
                    id: payload.id,
                    email: payload.email,
                    rol: payload.rol,
                    nombre: payload.nombre
                };
                globalUser = userData;
                notifyListeners();
            } else {
                localStorage.removeItem("token");
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
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

            globalUser = userData;
            notifyListeners();
            navigate("/");
            return userData;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rememberMe");
        globalUser = null;
        notifyListeners();
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