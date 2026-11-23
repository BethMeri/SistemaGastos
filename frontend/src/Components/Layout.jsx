/* frontend/src/Components/Layout.jsx */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout({ onLogout }) {
  return (
    <div className="app-layout">
      <Navbar onLogout={onLogout} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}