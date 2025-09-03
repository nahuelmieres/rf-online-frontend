import React, { useState } from "react";
import { Mail, Loader2, ArrowLeft, Dumbbell } from "lucide-react";
import Notificacion from "../components/Notificacion";
import SmartLink from "../components/SmartLink/SmartLink";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    tipo: "",
    mensaje: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Llamada a la API para recuperar contraseña
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      // Mostramos notificación de éxito (siempre el mismo mensaje por seguridad)
      setNotificacion({
        mostrar: true,
        tipo: "success",
        mensaje: "Si el correo existe, te enviamos un enlace para restablecer tu contraseña"
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensaje || "Error al enviar el email de recuperación");
      }

      // Limpiamos el formulario
      setEmail("");
    } catch (err) {
      setNotificacion({
        mostrar: true,
        tipo: "error",
        mensaje: err.message || "Error al procesar la solicitud"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="w-full max-w-md mx-auto border-2 border-black dark:border-gray-600 p-6 md:p-8 bg-white dark:bg-black shadow-hard relative">
        {/* Botón volver */}
        <SmartLink 
          to="/login" 
          className="absolute top-6 left-6 text-black dark:text-white hover:text-primary-light dark:hover:text-primary-dark"
        >
          <ArrowLeft size={24} />
        </SmartLink>

        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
              <Dumbbell className="h-6 w-6 text-white dark:text-black" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">RECUPERAR CONTRASEÑA</h1>
          <h2 className="text-lg md:text-xl font-medium">PLATAFORMA DE ENTRENAMIENTO</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-base md:text-lg font-bold">
              CORREO ELECTRÓNICO
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="TU@EMAIL.COM"
                className="pl-10 w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-base focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black text-base md:text-lg font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  ENVIANDO...
                </>
              ) : 'ENVIAR ENLACE'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-base">
          <p>¿NO TIENES CUENTA?{' '}
            <SmartLink to="/registro" className="font-bold hover:underline">
              REGÍSTRATE
            </SmartLink>
          </p>
        </div>

        {/* Notificación */}
        {notificacion.mostrar && (
          <Notificacion
            tipo={notificacion.tipo}
            mensaje={notificacion.mensaje}
            onClose={() => setNotificacion(prev => ({ ...prev, mostrar: false }))}
            tiempo={5000}
          />
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;