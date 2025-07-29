import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Loader2, Lock, Mail, X, Dumbbell } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password, rememberMe);
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
      window.location.reload(); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="w-full max-w-md mx-auto border-2 border-black dark:border-gray-600 p-6 md:p-8 bg-white dark:bg-black shadow-hard">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
              <Dumbbell className="h-6 w-6 text-white dark:text-black" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">RF ONLINE</h1>
          <h2 className="text-lg md:text-xl font-medium">PLATAFORMA DE ENTRENAMIENTO</h2>
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
                autoComplete="email"
              />
            </div>
          </div>

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
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 border-2 border-black dark:border-gray-600 rounded-none focus:ring-0"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm md:text-base">
                RECORDARME
              </label>
            </div>

            <a href="#" className="text-sm md:text-base font-bold hover:underline whitespace-nowrap">
              ¿OLVIDASTE CONTRASEÑA?
            </a>
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
                  INICIANDO...
                </>
              ) : 'INICIAR SESIÓN'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-base">
          <p>¿NO TIENES CUENTA?{' '}
            <a href="/registro" className="font-bold hover:underline">
              REGÍSTRATE
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;