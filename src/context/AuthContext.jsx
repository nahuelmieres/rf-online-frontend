import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom'; // AGREGAR
import useSecureStorage from '@/hooks/useSecureStorage';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { getItem, setItem, removeItem } = useSecureStorage();
  const navigate = useNavigate(); // AGREGAR
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const isNative = Capacitor.isNativePlatform();

  const buildUserFromToken = (token) => {
    try {
      if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        console.error('Token inválido:', token);
        return null;
      }

      const payload = jwtDecode(token);

      if (payload?.exp && payload.exp * 1000 < Date.now()) {
        return null;
      }

      return {
        id: payload.id || payload._id || payload.sub || payload.userId,
        email: payload.email,
        rol: payload.rol || payload.role || 'cliente',
        nombre: payload.nombre,
        planPersonalizado: payload.planPersonalizado || null,
        sessionToken: payload.sessionToken
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  };

  // Verificar suscripción activa
  const checkSubscription = async (token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pagos/suscripcion/estado`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setHasActiveSubscription(data.hasActiveSubscription);
        setSubscriptionDetails(data.plan ? {
          plan: data.plan,
          currentPeriodEnd: data.currentPeriodEnd,
          provider: data.provider
        } : null);
        return data.hasActiveSubscription;
      }

      setHasActiveSubscription(false);
      setSubscriptionDetails(null);
      return false;
    } catch (error) {
      console.error('Error verificando suscripción:', error);
      setHasActiveSubscription(false);
      setSubscriptionDetails(null);
      return false;
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

          // Verificar suscripción solo para clientes
          if (userData.rol === 'cliente') {
            const hasSubscription = await checkSubscription(token);
            
            // NUEVO: Redirigir a /suscripcion si no tiene suscripción
            if (!hasSubscription && window.location.pathname !== '/suscripcion') {
              navigate('/suscripcion', { replace: true });
            }
          } else {
            setHasActiveSubscription(true);
          }
        } else {
          await logout();
        }
      } else {
        setUser(null);
        setHasActiveSubscription(false);
        setSubscriptionDetails(null);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
      setHasActiveSubscription(false);
      setSubscriptionDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    let appStateListener;

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

      // Verificar suscripción
      if (u.rol === 'cliente') {
        const hasSubscription = await checkSubscription(data.token);
        
        // NUEVO: Redirigir a /suscripcion si no tiene suscripción
        if (!hasSubscription) {
          navigate('/suscripcion', { replace: true });
        }
      } else {
        setHasActiveSubscription(true);
      }

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
      if (!token) throw new Error('Token es null o undefined');
      if (typeof token !== 'string') throw new Error(`Token debe ser string, recibido: ${typeof token}`);
      if (token.length < 10) throw new Error(`Token demasiado corto: ${token.length} caracteres`);

      await setItem('token', token);
      await setItem('rememberMe', !!remember);

      const userData = buildUserFromToken(token);
      if (!userData) throw new Error('Token inválido o expirado');

      setUser(userData);

      // Verificar suscripción
      if (userData.rol === 'cliente') {
        await checkSubscription(token);
      } else {
        setHasActiveSubscription(true);
      }
    } catch (error) {
      console.error('❌ setAuthState error:', error);
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
      const token = await getItem('token');
      if (token) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.warn('Error al cerrar sesión en servidor:', error);
        }
      }

      await removeItem('token');
      await removeItem('rememberMe');
      await removeItem('usuario');
      setUser(null);
      setHasActiveSubscription(false);
      setSubscriptionDetails(null);
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
        hasActiveSubscription,
        subscriptionDetails,
        loading,
        login,
        logout,
        setAuthState,
        refresh,
        checkSubscription
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