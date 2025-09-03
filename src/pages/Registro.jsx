import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowLeft, X, Loader2, Dumbbell } from "lucide-react";
import GoogleButton from '../components/GoogleButton';
import SmartLink from '../components/SmartLink/SmartLink';

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aceptaTerminos, setTerminos] = useState(false);
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
          rol: "cliente",
          aceptaTerminos,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error en el registro");
      }

      navigate("/login", { state: { registroExitoso: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (user, token) => {
    // Aquí puedes manejar el inicio de sesión exitoso con Google
    //console.log("Usuario autenticado con Google:", user);
    //console.log("Token JWT:", token);
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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">CREAR CUENTA</h1>
          <h2 className="text-lg md:text-xl font-medium">PLATAFORMA DE ENTRENAMIENTO</h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            ÚNETE A NUESTRA COMUNIDAD Y COMIENZA TU VIAJE DE SUPERACIÓN HOY MISMO,
            LOS PRIMEROS 14 DÍAS VAN POR NUESTRA CUENTA.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="border-2 border-red-500 bg-red-100 dark:bg-black px-4 py-3 flex items-center gap-3">
              <X className="flex-shrink-0 text-red-500" size={20} />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Campo Nombre */}
          <div className="space-y-2">
            <label htmlFor="nombre" className="block text-base md:text-lg font-bold">
              NOMBRE COMPLETO
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="nombre"
                type="text"
                placeholder="TU NOMBRE"
                className="pl-10 w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-base focus:outline-none"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          </div>

          {/* Campo Email */}
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
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-base md:text-lg font-bold">
              CONTRASEÑA
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10 w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-base focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>

          {/* Checkbox para aceptar terminos y condiciones */}
          <div className="flex items-center space-x-2">
            <input
              id="terminos"
              type="checkbox"
              className="h-5 w-5 border-2 border-black dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              onChange={(e) => setTerminos(e.target.checked)}
              checked={aceptaTerminos}
            />
            <label htmlFor="terminos" className="text-sm md:text-base">
              Acepto los <SmartLink to="/terminos" target="_blank" className="text-blue-600 hover:underline">términos y condiciones</SmartLink>
            </label>
          </div>

          {/* Botón de Registro */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black text-base md:text-lg font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  CREANDO CUENTA...
                </>
              ) : 'REGISTRARSE'}
            </button>
          </div>
        </form>

        {/* Botón de Google personalizado */}
        <GoogleButton onSuccessLogin={handleGoogleSuccess} />

        {/* Enlace a Login */}
        <div className="mt-6 text-center text-base">
          <p>¿YA TIENES UNA CUENTA?{' '}
            <SmartLink to="/login" className="font-bold hover:underline">
              INICIA SESIÓN
            </SmartLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;