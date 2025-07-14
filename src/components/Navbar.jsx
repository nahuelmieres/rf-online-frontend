import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sun, Moon, Menu, X, Home, Dumbbell, Users, UserCircle, LogOut, Settings, UserCog, ClipboardList } from 'lucide-react';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
           (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [submenuAbierto, setSubmenuAbierto] = useState(false);
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

  useEffect(() => {
    // Cerrar menú al cambiar de ruta
    setMenuAbierto(false);
    setSubmenuAbierto(false);
  }, [location]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    setMenuAbierto(false);
  };

  // No mostrar en rutas públicas
  if (location.pathname === '/login' || location.pathname === '/registro') return null;

  const esAdmin = user?.rol === 'admin';
  const esCoach = user?.rol === 'coach';
  const mostrarGestion = esAdmin || esCoach;

  const NavItem = ({ to, icon, text, children }) => (
    <li className="relative group">
      <Link 
        to={to} 
        className={`flex items-center gap-1.5 text-gray-100 hover:text-primary-light dark:text-gray-300 dark:hover:text-primary-dark transition ${!to ? 'cursor-default' : ''}`}
      >
        {icon}
        <span>{text}</span>
        {children && <span className="ml-1">▼</span>}
      </Link>
      {children && (
        <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          {children}
        </div>
      )}
    </li>
  );

  const MobileNavItem = ({ to, icon, text, onClick, children }) => (
    <div className="border-b border-gray-700 last:border-0">
      <Link 
        to={to} 
        onClick={onClick}
        className="flex items-center gap-2 py-3 px-2 text-gray-100 hover:text-primary-light dark:text-gray-300 dark:hover:text-primary-dark"
      >
        {icon}
        <span>{text}</span>
      </Link>
      {children && <div className="pl-6">{children}</div>}
    </div>
  );

  if (loading) {
    return (
      <header className="bg-gray-800 dark:bg-gray-850 border-b border-gray-700 h-16">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center h-full">
          <div className="bg-gray-700 dark:bg-gray-700 h-6 w-32 animate-pulse rounded"></div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-700 dark:bg-gray-700 rounded-full w-8 h-8 animate-pulse"></div>
            <div className="bg-gray-700 dark:bg-gray-700 rounded w-8 h-8 animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gray-800 dark:bg-gray-850 border-b border-gray-700">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider text-orange-500 dark:text-orange-400">
          <Link to="/" className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            <span>RF Online</span>
          </Link>
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-700 transition"
            aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-blue-400" />}
          </button>

          <button
            className="md:hidden p-1 text-gray-100 dark:text-gray-300"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {user && (
          <ul className="hidden md:flex gap-6 items-center">
            <NavItem to="/" icon={<Home size={18} />} text="Inicio" />
            <NavItem to="/planes" icon={<Dumbbell size={18} />} text="Mi Plan" />
            <NavItem to="/entrenadores" icon={<Users size={18} />} text="Entrenadores" />
            
            {mostrarGestion && (
              <NavItem icon={<Settings size={18} />} text="Gestión">
                <div className="py-1">
                  {esAdmin && (
                    <Link 
                      to="/gestion/usuarios" 
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setMenuAbierto(false)}
                    >
                      <div className="flex items-center gap-2">
                        <UserCog size={16} />
                        <span>Administrar Usuarios</span>
                      </div>
                    </Link>
                  )}
                  <Link 
                    to="/gestion/planificaciones" 
                    className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMenuAbierto(false)}
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardList size={16} />
                      <span>Asignar Planificaciones</span>
                    </div>
                  </Link>
                </div>
              </NavItem>
            )}

            <NavItem to="/cuenta" icon={<UserCircle size={18} />} text="Mi cuenta" />
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-white transition-colors"
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </li>
          </ul>
        )}
      </nav>

      {menuAbierto && user && (
        <div className="md:hidden px-4 pb-4 bg-gray-800 dark:bg-gray-850 border-t border-gray-700">
          <MobileNavItem to="/" icon={<Home size={18} />} text="Inicio" onClick={() => setMenuAbierto(false)} />
          <MobileNavItem to="/planes" icon={<Dumbbell size={18} />} text="Planes" onClick={() => setMenuAbierto(false)} />
          <MobileNavItem to="/entrenadores" icon={<Users size={18} />} text="Entrenadores" onClick={() => setMenuAbierto(false)} />
          
          {mostrarGestion && (
            <>
              <div 
                className="border-b border-gray-700 py-3 px-2 flex items-center gap-2 cursor-pointer"
                onClick={() => setSubmenuAbierto(!submenuAbierto)}
              >
                <Settings size={18} />
                <span>Gestión</span>
              </div>
              
              {submenuAbierto && (
                <div className="pl-6">
                  {esAdmin && (
                    <MobileNavItem 
                      to="/gestion/usuarios" 
                      icon={<UserCog size={16} />} 
                      text="Administrar Usuarios" 
                      onClick={() => setMenuAbierto(false)} 
                    />
                  )}
                  <MobileNavItem 
                    to="/gestion/planificaciones" 
                    icon={<ClipboardList size={16} />} 
                    text="Asignar Planificaciones" 
                    onClick={() => setMenuAbierto(false)} 
                  />
                </div>
              )}
            </>
          )}

          <MobileNavItem to="/cuenta" icon={<UserCircle size={18} />} text="Mi cuenta" onClick={() => setMenuAbierto(false)} />
          <div className="mt-2 pt-2 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;