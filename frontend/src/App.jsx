/* frontend/src/App.jsx */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Pages/Auth';
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';
import Layout from './Components/Layout';
import Statistics from './Pages/Statistics';

export default function App() {
  // Verificamos si el usuario ya estaba autenticado en la memoria del navegador
  const [autenticado, setAutenticado] = useState(() => {
    return localStorage.getItem('isAutenticado') === 'true';
  });

  const handleLoginSuccess = () => {
    localStorage.setItem('isAutenticado', 'true');
    setAutenticado(true);
  };

  return (
    <Router>
      <Routes>
        {/* Ruta de Autenticación / Login */}
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

        {/* Rutas Protegidas envueltas en el Layout (Incluyen la Navbar automáticamente) */}
        <Route 
          element={
            autenticado ? (
              <Layout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/estadisticas" element={<Statistics />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}