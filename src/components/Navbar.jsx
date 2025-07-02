import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Menu, X, Home, Dumbbell, Users, UserCircle, LogOut } from 'lucide-react';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!usuario) return null;

  // Componente auxiliar para items de navegación
  const NavItem = ({ to, icon, text }) => (
    <li>
      <Link to={to} className="flex items-center gap-1.5 hover:text-primary-light dark:hover:text-primary-dark transition">
        {icon}
        <span>{text}</span>
      </Link>
    </li>
  );

  // Componente auxiliar para items mobile
  const MobileNavItem = ({ to, icon, text, onClick }) => (
    <li className="border-b border-gray-700 last:border-0">
      <Link 
        to={to} 
        onClick={onClick}
        className="flex items-center gap-2 py-3 px-2 hover:text-primary-light dark:hover:text-primary-dark"
      >
        {icon}
        <span>{text}</span>
      </Link>
    </li>
  );

  return (
    <header className="bg-gym-black dark:bg-gray-850 border-b border-gray-200 dark:border-gray-700">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider text-gym-orange dark:text-primary-dark">
          <Link to="/" className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            <span>RF Online</span>
          </Link>
        </h1>

        <div className="flex items-center gap-4">
          {/* Botón Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400" />
            )}
          </button>

          {/* Menú hamburguesa */}
          <button
            className="md:hidden p-1"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Navegación desktop */}
        <ul className="hidden md:flex gap-6 items-center">
          <NavItem to="/" icon={<Home size={18} />} text="Inicio" />
          <NavItem to="/planes" icon={<Dumbbell size={18} />} text="Mi Plan" />
          <NavItem to="/entrenadores" icon={<Users size={18} />} text="Entrenadores" />
          <NavItem to="/cuenta" icon={<UserCircle size={18} />} text="Mi cuenta" />
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Menú mobile */}
      {menuAbierto && (
        <div className="md:hidden px-4 pb-4 bg-gym-black dark:bg-gray-850 border-t border-gray-700">
          <MobileNavItem 
            to="/" 
            icon={<Home size={18} />} 
            text="Inicio" 
            onClick={() => setMenuAbierto(false)} 
          />
          <MobileNavItem 
            to="/planes" 
            icon={<Dumbbell size={18} />} 
            text="Planes" 
            onClick={() => setMenuAbierto(false)} 
          />
          <MobileNavItem 
            to="/entrenadores" 
            icon={<Users size={18} />} 
            text="Entrenadores" 
            onClick={() => setMenuAbierto(false)} 
          />
          <MobileNavItem 
            to="/cuenta" 
            icon={<UserCircle size={18} />} 
            text="Mi cuenta" 
            onClick={() => setMenuAbierto(false)} 
          />
          <li className="mt-2 pt-2 border-t border-gray-700">
            <button
              onClick={() => {
                handleLogout();
                setMenuAbierto(false);
              }}
              className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </li>
        </div>
      )}
    </header>
  );
};

export default Navbar;