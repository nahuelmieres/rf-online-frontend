import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowLeft, X, Loader2 } from "lucide-react";

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          password,
          rol: "cliente" // Rol por defecto
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error en el registro");
      }

      // Registro exitoso - redirigir a login
      navigate("/login", { state: { registroExitoso: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg relative">
        {/* Botón volver */}
        <Link 
          to="/login" 
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Crear cuenta</h1>
          <h2 className="text-xl text-gray-600 dark:text-gray-300">Plataforma de Entrenamiento</h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-center gap-2">
              <X className="flex-shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Campo Nombre */}
          <div className="space-y-2">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Campo Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Botón de Registro */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Creando cuenta...
                </>
              ) : 'Registrarse'}
            </button>
          </div>
        </form>

        {/* Enlace a Login */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;