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

  if (location.pathname === '/login' || location.pathname === '/registro') return null;

  const esAdmin = user?.rol === 'admin';
  const esCoach = user?.rol === 'coach';
  const mostrarGestion = esAdmin || esCoach;

  const NavItem = ({ to, icon, text, onClick, children }) => (
    <div className="border-b-2 border-black dark:border-gray-600 last:border-0">
      <Link 
        to={to} 
        onClick={onClick}
        className="flex items-center gap-4 py-5 px-6 text-xl hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
      >
        {icon}
        <span>{text}</span>
        {children && <span className="ml-auto">▼</span>}
      </Link>
      {children && (
        <div className="bg-white dark:bg-black">
          {children}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <header className="bg-white dark:bg-black border-b-2 border-black dark:border-gray-600 h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div className="bg-gray-300 dark:bg-gray-700 h-8 w-40 animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-300 dark:bg-gray-700 w-8 h-8 animate-pulse"></div>
            <div className="bg-gray-300 dark:bg-gray-700 w-8 h-8 animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white dark:bg-black border-b-2 border-black dark:border-gray-600 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold tracking-tight">
          <Link to="/" className="flex items-center gap-3 hover:text-primary-light dark:hover:text-primary-dark transition-colors">
            <Dumbbell className="w-6 h-6" />
            <span>RF ONLINE</span>
          </Link>
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 border-2 border-transparent hover:border-black dark:hover:border-gray-600 transition-all"
            aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="p-2"
          >
            {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Menú fullscreen */}
      {menuAbierto && user && (
        <div className="fixed inset-0 bg-white dark:bg-black z-40 pt-16 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 pb-10">
            <NavItem to="/" icon={<Home size={24} />} text="INICIO" onClick={() => setMenuAbierto(false)} />
            <NavItem to="/planes" icon={<Dumbbell size={24} />} text="MI PLAN" onClick={() => setMenuAbierto(false)} />
            <NavItem to="/entrenadores" icon={<Users size={24} />} text="ENTRENADORES" onClick={() => setMenuAbierto(false)} />
            
            {mostrarGestion && (
              <>
                <div 
                  className="border-b-2 border-black dark:border-gray-600 py-5 px-6 flex items-center gap-4 cursor-pointer text-xl"
                  onClick={() => setSubmenuAbierto(!submenuAbierto)}
                >
                  <Settings size={24} />
                  <span>GESTIÓN</span>
                  <span className="ml-auto">▼</span>
                </div>
                
                {submenuAbierto && (
                  <div className="bg-gray-100 dark:bg-gray-900">
                    {esAdmin && (
                      <NavItem 
                        to="/gestion/usuarios" 
                        icon={<UserCog size={20} />} 
                        text="ADMINISTRAR USUARIOS" 
                        onClick={() => setMenuAbierto(false)} 
                      />
                    )}
                    <NavItem 
                      to="/gestion/planificaciones" 
                      icon={<ClipboardList size={20} />} 
                      text="ASIGNAR PLANIFICACIONES" 
                      onClick={() => setMenuAbierto(false)} 
                    />
                  </div>
                )}
              </>
            )}

            <NavItem to="/cuenta" icon={<UserCircle size={24} />} text="MI CUENTA" onClick={() => setMenuAbierto(false)} />
            
            <div className="mt-8 px-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-white shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-xl"
              >
                <LogOut size={20} />
                <span>CERRAR SESIÓN</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;