import React, { use } from 'react';
// Importamos GoogleLogin en lugar de useGoogleLogin
import { GoogleLogin } from '@react-oauth/google';
import Notificacion from '../components/Notificacion';
import useAuth from '../hooks/useAuth';

const GoogleButton = ({ onSuccessLogin }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const setAuthState = useAuth().setAuthState;
    const [notificacion, setNotificacion] = React.useState({
        mostrar: false,
        tipo: '',
        mensaje: ''
    });

    const handleSuccess = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;
            if (!idToken) {
                throw new Error('No se recibió el token de Google');
            }

            const res = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json?.mensaje || 'No se pudo iniciar sesión con Google');
            }

            // Usamos setAuthState para actualizar el estado de autenticación
            setAuthState(json.usuario, json.token);

            if (onSuccessLogin) {
                onSuccessLogin(json.usuario, json.token);
            }

        } catch (error) {
            console.error('Google auth error:', error);
            setNotificacion({
                mostrar: true,
                tipo: 'error',
                mensaje: error.message || 'Error al autenticar con Google'
            });
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
            {/* Notificación de error */}
            {notificacion.mostrar && (
                <Notificacion
                    tipo={notificacion.tipo}
                    mensaje={notificacion.mensaje}
                    onClose={() => setNotificacion({ mostrar: false, tipo: '', mensaje: '' })}
                    tiempo={5000}
                />
            )}

            {/* Divisor estilizado */}
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

            {/* Usamos el componente GoogleLogin */}
            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    useOneTap={false} // Opcional, para una mejor experiencia de usuario
                    theme="outline"
                    shape="rectangular"
                    logo_alignment="center"
                />
            </div>
        </div>
    );
};

export default GoogleButton;