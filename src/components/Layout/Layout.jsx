// src/components/Layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import Navbar from './Navbar';

const Layout = () => {
  const { isAdmin, isClient } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Mostrar navbar según el rol */}
      {isAdmin && <Navbar />}
      {isClient && <Navbar />}
      
      {/* Contenido principal */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;