import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, Loader2, Dumbbell } from "lucide-react";
import Notificacion from "../components/Notificacion";

const ResetPassword = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    tipo: "",
    titulo: "",
    mensaje: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token || !email) {
      setNotificacion({
        mostrar: true,
        tipo: "error",
        titulo: "Enlace inválido",
        mensaje: "Faltan parámetros en el enlace. Por favor solicita un nuevo enlace."
      });
      return;
    }

    if (password.length < 8) {
      setNotificacion({
        mostrar: true,
        tipo: "warning",
        titulo: "Contraseña débil",
        mensaje: "La contraseña debe tener al menos 8 caracteres."
      });
      return;
    }

    if (password !== password2) {
      setNotificacion({
        mostrar: true,
        tipo: "warning",
        titulo: "No coinciden",
        mensaje: "Las contraseñas ingresadas no coinciden."
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || "No se pudo restablecer la contraseña");
      }

      setNotificacion({
        mostrar: true,
        tipo: "success",
        titulo: "¡Contraseña actualizada!",
        mensaje: "Tu contraseña ha sido cambiada correctamente. Redirigiendo al login..."
      });

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setNotificacion({
        mostrar: true,
        tipo: "error",
        titulo: "Error",
        mensaje: err.message || "Ocurrió un error al actualizar la contraseña"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="w-full max-w-md mx-auto border-2 border-black dark:border-gray-600 p-6 md:p-8 bg-white dark:bg-black shadow-hard">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
              <Dumbbell className="h-6 w-6 text-white dark:text-black" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">NUEVA CONTRASEÑA</h1>
          <h2 className="text-lg md:text-xl font-medium">PLATAFORMA DE ENTRENAMIENTO</h2>
        </div>

        {!token || !email ? (
          <div className="text-center">
            <p className="mb-4">Enlace inválido o incompleto.</p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="px-4 py-2 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              SOLICITAR NUEVO ENLACE
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-base md:text-lg font-bold">
                NUEVA CONTRASEÑA
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  type={showPass1 ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className="pl-10 w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-base focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass1(!showPass1)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPass1 ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password2" className="block text-base md:text-lg font-bold">
                REPETIR CONTRASEÑA
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password2"
                  type={showPass2 ? "text" : "password"}
                  placeholder="Repetir contraseña"
                  className="pl-10 w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-base focus:outline-none"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass2(!showPass2)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPass2 ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
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
                    ACTUALIZANDO...
                  </>
                ) : 'ACTUALIZAR CONTRASEÑA'}
              </button>
            </div>
          </form>
        )}

        {/* Notificación */}
        {notificacion.mostrar && (
          <Notificacion
            tipo={notificacion.tipo}
            titulo={notificacion.titulo}
            mensaje={notificacion.mensaje}
            onClose={() => setNotificacion(prev => ({ ...prev, mostrar: false }))}
            tiempo={5000}
          />
        )}
      </div>
    </div>
  );
};

export default ResetPassword;