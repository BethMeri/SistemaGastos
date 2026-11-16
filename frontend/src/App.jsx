/* frontend/src/App.jsx */
import React, { useState } from 'react';
import Dashboard from './Pages/Dashboard';
import Auth from './Pages/Auth'; // Nota el './' corregido

export default function App() {
  // Estado para controlar si el usuario ya inició sesión
  // (Por defecto en false para mostrar el Login primero)
  const [autenticado, setAutenticado] = useState(false);

  return (
    <div>
      {autenticado ? (
        /* Si está autenticado, mostramos el panel principal */
        <Dashboard />
      ) : (
        /* Si no está autenticado, mostramos la pantalla de Login/Registro */
        <Auth onLoginSuccess={() => setAutenticado(true)} />
      )}
    </div>
  );
}