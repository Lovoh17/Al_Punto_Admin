// src/hooks/useAuth.js
import { useState } from 'react';
import { usuarioService } from '../services/api.js';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [useAuth] Iniciando login con:', { email });
      
      // Hacer petición al backend
      const response = await usuarioService.login({ email, password });
      
      console.log('📦 [useAuth] Respuesta completa:', response);
      console.log('📦 [useAuth] response.data:', response.data);
      
      // ✅ ACCEDER CORRECTAMENTE A LA ESTRUCTURA DE RESPUESTA
      // Axios devuelve: response.data
      // Tu backend devuelve: { success, data: { token, usuario, redireccion }, message }
      const { success, data, message } = response.data;
      
      console.log('✅ [useAuth] Success:', success);
      console.log('✅ [useAuth] Data:', data);
      console.log('✅ [useAuth] Message:', message);
      
      if (!success) {
        throw new Error(message || 'Error en el login');
      }
      
      // Verificar que vengan los datos necesarios
      if (!data?.token || !data?.usuario) {
        console.error('❌ [useAuth] Estructura inválida:', data);
        throw new Error('Respuesta inválida del servidor: falta token o usuario');
      }
      
      console.log('💾 [useAuth] Guardando en localStorage...');
      console.log('  - Token:', data.token.substring(0, 20) + '...');
      console.log('  - Usuario:', data.usuario);
      console.log('  - Redirección:', data.redireccion);
      
      // ✅ Guardar en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      if (data.redireccion) {
        localStorage.setItem('redireccion', data.redireccion);
      }
      
      setUser(data.usuario);
      
      console.log('✅ [useAuth] Login exitoso');
      console.log('🎯 [useAuth] Redirigiendo a:', data.redireccion || '/dashboard');
      
      // ✅ REDIRIGIR SEGÚN EL ROL
      setTimeout(() => {
        const rutaDestino = data.redireccion || '/dashboard';
        console.log('🔄 [useAuth] Ejecutando redirección a:', rutaDestino);
        window.location.href = rutaDestino;
      }, 500);
      
      return data;
      
    } catch (err) {
      console.error('❌ [useAuth] Error en login:', err);
      console.error('❌ [useAuth] Error response:', err.response);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (err.response) {
        // Error del servidor (4xx, 5xx)
        errorMessage = err.response.data?.error || 
                      err.response.data?.message || 
                      err.response.data?.mensaje ||
                      `Error del servidor: ${err.response.status}`;
      } else if (err.request) {
        // No hubo respuesta del servidor
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else if (err.message) {
        // Errores de validación o lógica
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [useAuth] Iniciando registro con:', userData.email);
      
      const response = await usuarioService.registro(userData);
      const { success, data, message } = response.data;
      
      if (!success) {
        throw new Error(message || 'Error en el registro');
      }
      
      // Si el registro devuelve token (auto-login)
      if (data?.token && data?.usuario) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        if (data.redireccion) {
          localStorage.setItem('redireccion', data.redireccion);
        }
        setUser(data.usuario);
        
        // Redirigir después del registro
        setTimeout(() => {
          window.location.href = data.redireccion || '/dashboard';
        }, 500);
      }
      
      return data;
      
    } catch (err) {
      console.error('❌ [useAuth] Error en registro:', err);
      
      let errorMessage = 'Error al registrarse';
      
      if (err.response) {
        errorMessage = err.response.data?.error || 
                      err.response.data?.message ||
                      'Error en el registro';
      } else if (err.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      console.log('👋 [useAuth] Cerrando sesión...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('redireccion');
      setUser(null);
      setError(null);
      
      console.log('✅ [useAuth] Sesión cerrada');
      window.location.href = '/login';
    } catch (err) {
      console.error('❌ [useAuth] Error en logout:', err);
    }
  };

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const redireccion = localStorage.getItem('redireccion');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        setUser(user);
        return { isAuthenticated: true, user, redireccion };
      }
      
      return { isAuthenticated: false };
    } catch (err) {
      console.error('❌ [useAuth] Error verificando autenticación:', err);
      logout();
      return { isAuthenticated: false };
    }
  };

  const getCurrentUser = () => {
    if (user) {
      return user;
    }
    
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        return parsedUser;
      }
    } catch (err) {
      console.error('❌ [useAuth] Error obteniendo usuario actual:', err);
    }
    
    return null;
  };

  const getRedireccion = () => {
    return localStorage.getItem('redireccion') || '/dashboard';
  };

  const updateUser = (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      console.error('❌ [useAuth] Error actualizando usuario:', err);
    }
  };

  return { 
    login, 
    register, 
    logout, 
    checkAuth, 
    getCurrentUser,
    getRedireccion,
    updateUser,
    user,
    loading, 
    error,
    setError // Para limpiar errores manualmente
  };
};