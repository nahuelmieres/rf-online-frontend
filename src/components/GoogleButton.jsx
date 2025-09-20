// src/components/GoogleButton.jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import Notificacion from '../components/Notificacion';
import useAuth from '@/hooks/useAuth';

const GoogleButton = ({ onSuccessLogin }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { setAuthState } = useAuth();

    const [notificacion, setNotificacion] = React.useState({
        mostrar: false,
        tipo: '',
        mensaje: ''
    });

    const handleSuccess = async (credentialResponse) => {
        try {
            const idToken = credentialResponse?.credential;
            if (!idToken) throw new Error('No se recibió el token de Google');

            // DEBUG aud:
            const dbg = JSON.parse(atob(idToken.split('.')[1]));
            console.log('[GSI] aud=', dbg.aud, 'iss=', dbg.iss);

            const res = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            });

            const json = await res.json().catch(() => null);
            if (!res.ok) throw new Error(json?.mensaje || 'No se pudo iniciar sesión con Google');

            const { token, usuario } = json || {};
            if (!token) throw new Error('El servidor no devolvió un token');

            await setAuthState(token, true);
            onSuccessLogin?.(usuario, token);
        } catch (error) {
            console.error('Google auth error:', error);
            setNotificacion({ mostrar: true, tipo: 'error', mensaje: error.message || 'Error al autenticar con Google' });
        }
    };


    const handleError = (error) => {
        console.error('Google login error:', error);
        setNotificacion({
            mostrar: true,
            tipo: 'error',
            mensaje: 'El inicio de sesión con Google falló o fue cancelado.'
        });
    };

    return (
        <div className="w-full">
            {notificacion.mostrar && (
                <Notificacion
                    tipo={notificacion.tipo}
                    mensaje={notificacion.mensaje}
                    onClose={() => setNotificacion({ mostrar: false, tipo: '', mensaje: '' })}
                    tiempo={5000}
                />
            )}

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-black dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-4 bg-white dark:bg-black text-black dark:text-white text-sm font-bold">
                        O INGRESA CON
                    </span>
                </div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    useOneTap={false}
                    theme="outline"
                    shape="rectangular"
                    logo_alignment="center"
                />
            </div>
        </div>
    );
};

export default GoogleButton;