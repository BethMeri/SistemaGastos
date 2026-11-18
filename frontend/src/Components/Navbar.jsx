/* frontend/src/Components/Navbar.jsx */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [nombre, setNombre] = useState('Bethmeriugu');
  const [avatarFoto, setAvatarFoto] = useState('');
  
  // Estado para el Modo Oscuro / Claro
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedName) setNombre(storedName);
    if (storedAvatar) setAvatarFoto(storedAvatar);
  }, [location]);

  // Efecto para aplicar el tema en el documento HTML y guardarlo
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAutenticado');
    navigate('/login');
  };

  return (
    <header className="navbar-clean-header">
      <div className="navbar-clean-container">
        
        {/* Logo y Marca */}
        <div className="navbar-brand-group" onClick={() => navigate('/dashboard')}>
          <div className="navbar-brand-icon">💳</div>
          <span className="navbar-brand-text">SistemaGastos</span>
        </div>

        {/* Pestañas de Navegación Centrales */}
        <nav className="navbar-center-tabs">
          <Link 
            to="/dashboard" 
            className={`nav-tab-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <span>📊</span> Dashboard
          </Link>
          
          {/* 👇 ¡Aquí está integrada la nueva pestaña de Estadísticas! */}
          <Link 
            to="/estadisticas" 
            className={`nav-tab-item ${location.pathname === '/estadisticas' ? 'active' : ''}`}
          >
            <span>📈</span> Estadísticas
          </Link>

          <Link 
            to="/perfil" 
            className={`nav-tab-item ${location.pathname === '/perfil' ? 'active' : ''}`}
          >
            <span>👤</span> Mi Perfil
          </Link>
        </nav>

        {/* Sección Derecha: Botón de Tema, Usuario y Salida */}
        <div className="navbar-right-group">
          
          {/* Botón para alternar Modo Claro / Oscuro */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn" 
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <div className="navbar-user-pill" onClick={() => navigate('/perfil')} title="Ver Perfil">
            <div className="navbar-user-avatar">
              {avatarFoto ? (
                <img src={avatarFoto} alt="Avatar" />
              ) : (
                <span>{nombre.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="navbar-user-name">{nombre}</span>
          </div>

          <button onClick={handleLogout} className="navbar-logout-btn" title="Cerrar Sesión">
            <span>Salir</span>
            <span>🚪</span>
          </button>
        </div>

      </div>
    </header>
  );
}