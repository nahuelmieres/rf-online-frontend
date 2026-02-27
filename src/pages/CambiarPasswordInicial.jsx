import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Lock, Mail, X, Key, Dumbbell } from 'lucide-react';
import SmartLink from '../components/SmartLink/SmartLink';

const CambiarPasswordInicial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [passwordTemporal, setPasswordTemporal] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones
    if (nuevaPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/cambiar-password-inicial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          passwordTemporal,
          nuevaPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al cambiar contraseña");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
        <div className="w-full max-w-md mx-auto border-2 border-green-500 dark:border-green-400 p-6 md:p-8 bg-white dark:bg-black shadow-hard">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 dark:bg-green-400 p-3 border-2 border-green-500 dark:border-green-400">
                <Key className="h-6 w-6 text-white dark:text-black" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
              ¡CONTRASEÑA ACTUALIZADA!
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login en unos segundos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="w-full max-w-md mx-auto border-2 border-black dark:border-gray-600 p-6 md:p-8 bg-white dark:bg-black shadow-hard">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
              <Key className="h-6 w-6 text-white dark:text-black" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            CAMBIAR CONTRASEÑA
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Ingresa tu contraseña temporal y crea una nueva contraseña segura
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="border-2 border-red-500 bg-red-100 dark:bg-black px-4 py-3 flex items-center gap-3">
              <X className="flex-shrink-0 text-red-500" size={20} />
              <span className="font-medium">{error}</span>
            </div>
          )}

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
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="passwordTemporal" className="block text-base md:text-lg font-bold">
              CONTRASEÑA TEMPORAL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="passwordTemporal"
                type="text"
                placeholder="CONTRASEÑA TEMPORAL"
                className="pl-10 w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-base focus:outline-none uppercase"
                value={passwordTemporal}
                onChange={(e) => setPasswordTemporal(e.target.value.toUpperCase())}
                required
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Esta contraseña te fue proporcionada por el administrador
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="nuevaPassword" className="block text-base md:text-lg font-bold">
              NUEVA CONTRASEÑA
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="nuevaPassword"
                type="password"
                placeholder="••••••••"
                className="pl-10 w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-base focus:outline-none"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmarPassword" className="block text-base md:text-lg font-bold">
              CONFIRMAR NUEVA CONTRASEÑA
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="confirmarPassword"
                type="password"
                placeholder="••••••••"
                className="pl-10 w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-base focus:outline-none"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                minLength={8}
                required
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
                  CAMBIANDO CONTRASEÑA...
                </>
              ) : 'CAMBIAR CONTRASEÑA'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-base">
          <SmartLink to="/login" className="font-bold hover:underline">
            VOLVER AL LOGIN
          </SmartLink>
        </div>
      </div>
    </div>
  );
};

export default CambiarPasswordInicial;