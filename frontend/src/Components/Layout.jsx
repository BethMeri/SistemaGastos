/* frontend/src/Components/Layout.jsx */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet /> {/* Renderiza automáticamente el Dashboard o el Perfil */}
      </main>
    </div>
  );
}