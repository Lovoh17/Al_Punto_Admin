// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import MenuDiasPage from './pages/MenuDiasPage'
import ProductosPage from './pages/ProductosPage';
import UsuariosPage from './pages/GestionUsuarios';
import PedidosPage from './pages/PedidosPage';
import CategoriasPage from './pages/CategoriasPage';
import Login from './components/Login';
import ProdccionPage from './pages/Producction'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />
          

          
            <Route element={<Layout />}>
              <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />
              <Route path="/Menu-Dias" element={<MenuDiasPage />} />
              <Route path="/Usuarios" element={<UsuariosPage />} />
              <Route path="/pedidos" element={<PedidosPage />} />
              <Route path="/Produccion" element={<ProdccionPage />} />
            </Route>
          

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;