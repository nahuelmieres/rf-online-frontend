import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import useSecureStorage from '@/hooks/useSecureStorage';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { getItem, setItem, removeItem } = useSecureStorage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isNative = Capacitor.isNativePlatform();

  const buildUserFromToken = (token) => {
    try {
      // Verificar si es un token válido
      if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        console.error('Token inválido:', token);
        return null;
      }

      const payload = jwtDecode(token);

      // Verificar expiración
      if (payload?.exp && payload.exp * 1000 < Date.now()) {
        return null;
      }

      return {
        id: payload.id || payload._id || payload.sub || payload.userId,
        email: payload.email,
        rol: payload.rol || payload.role || 'cliente',
        nombre: payload.nombre,
        planPersonalizado: payload.planPersonalizado || null,
      };
    } catch (error) {
      console.error('Error decodificando token:', error, 'Token:', token);
      return null;
    }
  };

  const initializeAuth = async () => {
    setLoading(true);
    try {
      const token = await getItem('token');

      if (token) {
        const userData = buildUserFromToken(token);

        if (userData) {
          setUser(userData);
        } else {
          // Token inválido o expirado - limpiar
          await logout();
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    let appStateListener;

    // Configurar listener de estado de la app (solo nativo)
    if (isNative) {
      (async () => {
        try {
          appStateListener = await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
              initializeAuth();
            }
          });
        } catch (error) {
          console.error('Error setting up app state listener:', error);
        }
      })();
    }

    // Configurar listener de storage (solo web)
    let storageListener = null;
    if (!isNative && typeof window !== 'undefined') {
      const onStorage = (e) => {
        if (['token', 'rememberMe', 'usuario'].includes(e.key)) {
          initializeAuth();
        }
      };
      window.addEventListener('storage', onStorage);
      storageListener = onStorage;
    }

    return () => {
      // Cleanup listeners
      if (appStateListener && typeof appStateListener.remove === 'function') {
        appStateListener.remove();
      }

      if (storageListener && !isNative && typeof window !== 'undefined') {
        window.removeEventListener('storage', storageListener);
      }
    };
  }, [isNative]);

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
      await setItem('token', data.token);
      await setItem('rememberMe', !!remember);
      await setItem('usuario', data.usuario || null);

      const u = buildUserFromToken(data.token);
      setUser(u);
      return u;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setAuthState = async (token, remember = true) => {
    setLoading(true);
    try {
      // Validación robusta del token
      if (!token) {
        throw new Error('Token es null o undefined');
      }

      if (typeof token !== 'string') {
        throw new Error(`Token debe ser string, recibido: ${typeof token}`);
      }

      if (token.length < 10) {
        throw new Error(`Token demasiado corto: ${token.length} caracteres`);
      }

      await setItem('token', token);
      await setItem('rememberMe', !!remember);

      const userData = buildUserFromToken(token);
      if (!userData) {
        throw new Error('Token inválido o expirado');
      }

      setUser(userData);
    } catch (error) {
      console.error('❌ setAuthState error:', error);
      // Limpiar token inválido
      await removeItem('token');
      await removeItem('rememberMe');
      throw error;
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
    } catch (error) {
      console.error('Logout error:', error);
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