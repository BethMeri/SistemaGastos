/* frontend/src/App.jsx */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Pages/Auth';
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';

export default function App() {
  // Verificamos si el usuario ya estaba autenticado en la memoria del navegador
  const [autenticado, setAutenticado] = useState(() => {
    return localStorage.getItem('isAutenticado') === 'true';
  });

  // Cada vez que cambie el estado, lo guardamos en localStorage
  const handleLoginSuccess = () => {
    localStorage.setItem('isAutenticado', 'true');
    setAutenticado(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAutenticado');
    setAutenticado(false);
  };

  return (
    <Router>
      <Routes>
        {/* Ruta de Autenticación */}
        <Route 
          path="/login" 
          element={
            autenticado ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Auth onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Ruta del Dashboard Principal */}
        <Route 
          path="/dashboard" 
          element={
            autenticado ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Ruta de Perfil de Usuario */}
        <Route 
          path="/perfil" 
          element={
            autenticado ? (
              <Profile />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}