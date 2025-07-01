import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Verifica el tema guardado o el preference del sistema
    return localStorage.getItem('theme') === 'dark' || 
           (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('theme'));
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  if (!usuario) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-black dark:bg-gray-900 text-white">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider text-orange-500 dark:text-orange-400">
          <Link to="/">RF Online</Link>
        </h1>

        <div className="flex items-center gap-4">
          {/* Botón Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="hidden md:flex items-center gap-1 text-sm px-3 py-1 border border-white rounded-full hover:bg-white hover:text-black transition"
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? (
              <span className="flex items-center gap-1">
                <span>☀️</span>
                <span className="hidden lg:inline">Claro</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span>🌙</span>
                <span className="hidden lg:inline">Oscuro</span>
              </span>
            )}
          </button>

          {/* Menú hamburguesa para mobile */}
          <button
            className="md:hidden"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuAbierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Navegación desktop */}
        <ul className="hidden md:flex gap-6 text-sm font-medium items-center">
          <li><Link to="/" className="hover:text-orange-500 dark:hover:text-orange-400">Inicio</Link></li>
          <li><Link to="/planes" className="hover:text-orange-500 dark:hover:text-orange-400">Planes</Link></li>
          <li><Link to="/entrenadores" className="hover:text-orange-500 dark:hover:text-orange-400">Entrenadores</Link></li>
          <li><Link to="/cuenta" className="hover:text-orange-500 dark:hover:text-orange-400">Mi cuenta</Link></li>
          <li>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>

      {/* Navegación mobile */}
      {menuAbierto && (
        <ul className="md:hidden px-4 pb-4 flex flex-col gap-2 text-sm font-medium bg-black dark:bg-gray-900">
          <li>
            <Link to="/" onClick={() => setMenuAbierto(false)} className="block py-2 hover:text-orange-500 dark:hover:text-orange-400">
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/planes" onClick={() => setMenuAbierto(false)} className="block py-2 hover:text-orange-500 dark:hover:text-orange-400">
              Planes
            </Link>
          </li>
          <li>
            <Link to="/entrenadores" onClick={() => setMenuAbierto(false)} className="block py-2 hover:text-orange-500 dark:hover:text-orange-400">
              Entrenadores
            </Link>
          </li>
          <li>
            <Link to="/cuenta" onClick={() => setMenuAbierto(false)} className="block py-2 hover:text-orange-500 dark:hover:text-orange-400">
              Mi cuenta
            </Link>
          </li>
          <li className="pt-2">
            <button
              onClick={() => {
                handleLogout();
                setMenuAbierto(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs w-full text-center"
            >
              Cerrar sesión
            </button>
          </li>
          {/* Dark Mode en mobile */}
          <li className="pt-2">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 text-sm px-3 py-1 border border-white rounded-full hover:bg-white hover:text-black w-full justify-center"
            >
              {darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
            </button>
          </li>
        </ul>
      )}
    </header>
  );
};

export default Navbar;