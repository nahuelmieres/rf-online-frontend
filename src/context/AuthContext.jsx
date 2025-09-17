import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import useSecureStorage from '@/hooks/useSecureStorage';
import { App as CapacitorApp } from '@capacitor/app';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { getItem, setItem, removeItem } = useSecureStorage();
  const [user, setUser] = useState(null);     // { id, email, rol, nombre, planPersonalizado }
  const [loading, setLoading] = useState(true);

  const buildUserFromToken = (token) => {
    try {
      const payload = jwtDecode(token);
      if (payload?.exp && payload.exp * 1000 < Date.now()) return null;
      return {
        id: payload.id || payload._id || payload.sub || payload.userId,
        email: payload.email,
        rol: payload.rol || payload.role || 'cliente',
        nombre: payload.nombre,
        planPersonalizado: payload.planPersonalizado || null,
      };
    } catch {
      return null;
    }
  };

  const initializeAuth = async () => {
    setLoading(true);
    try {
      const token = await getItem('token');          // string puro
      // Fuente de verdad: si hay token válido, hay user.
      if (token) {
        setUser(buildUserFromToken(token));
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    // addListener retorna Promise<PluginListenerHandle>
    let appStateListener;
    (async () => {
      try {
        appStateListener = await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
          if (isActive) initializeAuth();
        });
      } catch {
        // noop
      }
    })();

    const onStorage = (e) => {
      if (['token', 'rememberMe', 'usuario'].includes(e.key)) {
        initializeAuth();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (appStateListener && typeof appStateListener.remove === 'function') {
        appStateListener.remove();
      }
      window.removeEventListener('storage', onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- acciones ---
  const login = async (email, password, remember = false) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe: remember }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.mensaje || 'Error en el login');
      }
      const data = await res.json();

      await setItem('token', data.token);          // ← string puro
      await setItem('rememberMe', !!remember);
      await setItem('usuario', data.usuario || null);

      const u = buildUserFromToken(data.token);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  // para flujos donde ya tenés un token (SSO, Google, etc.)
  const setAuthState = async (token, remember = true) => {
    setLoading(true);
    try {
      await setItem('token', token);
      await setItem('rememberMe', !!remember);
      setUser(buildUserFromToken(token));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await removeItem('token');
      await removeItem('rememberMe');
      await removeItem('usuario');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refresh = initializeAuth;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        setAuthState,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de <AuthProvider>');
  return ctx;
}