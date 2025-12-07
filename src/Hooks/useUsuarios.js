// src/hooks/useUsuarios.js
import { useState, useEffect, useCallback } from 'react';
import { usuarioService } from '../services/api';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticasApi, setEstadisticasApi] = useState(null);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Cargar todos los usuarios
  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando usuarios...');
      
      const response = await usuarioService.getAll();
      
      console.log('📦 Respuesta del servidor:', response);
      
      // Manejar diferentes estructuras de respuesta
      let usuariosData = [];
      
      if (response.data?.exito && response.data?.datos) {
        usuariosData = response.data.datos;
      } else if (response.data?.success && response.data?.data) {
        usuariosData = response.data.data;
      } else if (Array.isArray(response.data)) {
        usuariosData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        usuariosData = response.data.data;
      } else {
        console.warn('⚠️ Estructura de respuesta inesperada:', response.data);
      }
      
      const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];
      
      console.log('📊 Usuarios procesados:', usuariosArray);
      
      // Ordenar por fecha de creación (más recientes primero)
      const usuariosOrdenados = usuariosArray.sort((a, b) => {
        const fechaA = a.created_at || a.createdAt || a.fecha_registro;
        const fechaB = b.created_at || b.createdAt || b.fecha_registro;
        return new Date(fechaB || 0) - new Date(fechaA || 0);
      });
      
      setUsuarios(usuariosOrdenados);
      console.log('✅ Usuarios cargados:', usuariosOrdenados.length);
      
    } catch (err) {
      console.error('❌ Error al cargar usuarios:', err);
      
      let errorMessage = 'No se pudieron cargar los usuarios';
      
      if (err.response) {
        errorMessage = err.response.data?.mensaje || 
                      err.response.data?.message || 
                      `Error del servidor: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    try {
      console.log('📊 Cargando estadísticas desde API...');
      
      const response = await usuarioService.getEstadisticas();
      
      console.log('📈 Respuesta de estadísticas:', response.data);
      
      let stats = {};
      
      if (response.data?.datos) {
        stats = response.data.datos;
      } else if (response.data?.data) {
        stats = response.data.data;
      } else if (response.data) {
        stats = response.data;
      }
      
      setEstadisticasApi(stats);
      console.log('✅ Estadísticas API cargadas:', stats);
      
    } catch (err) {
      console.error('⚠️ Error al cargar estadísticas desde API:', err);
      // Si falla la API, usaremos las calculadas
      setEstadisticasApi(null);
    }
  }, []);

  // CREAR USUARIO (mantener igual)
  const crearUsuario = async (datosUsuario) => {
    try {
      console.log('➕ Creando usuario:', datosUsuario);
      
      const response = await usuarioService.create(datosUsuario);
      
      console.log('✅ Usuario creado:', response.data);
      
      // Recargar lista
      await cargarUsuarios();
      await cargarEstadisticas();
      
      return { 
        success: true, 
        mensaje: 'Usuario creado exitosamente',
        data: response.data 
      };
      
    } catch (err) {
      console.error('❌ Error al crear usuario:', err);
      
      const errorMessage = err.response?.data?.mensaje || 
                          err.response?.data?.message || 
                          'No se pudo crear el usuario';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // ACTUALIZAR USUARIO (mantener igual)
  const actualizarUsuario = async (id, datosUsuario) => {
    try {
      console.log('✏️ Actualizando usuario:', id, datosUsuario);
      
      // Si no hay contraseña, no la enviamos
      const dataActualizar = { ...datosUsuario };
      if (!dataActualizar.password || dataActualizar.password === '') {
        delete dataActualizar.password;
      }
      
      const response = await usuarioService.update(id, dataActualizar);
      
      console.log('✅ Usuario actualizado:', response.data);
      
      // Recargar lista
      await cargarUsuarios();
      await cargarEstadisticas();
      
      return { 
        success: true, 
        mensaje: 'Usuario actualizado exitosamente',
        data: response.data 
      };
      
    } catch (err) {
      console.error('❌ Error al actualizar usuario:', err);
      
      const errorMessage = err.response?.data?.mensaje || 
                          err.response?.data?.message || 
                          'No se pudo actualizar el usuario';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // CAMBIAR ESTADO (optimizado)
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      console.log('🔄 Cambiando estado del usuario:', id, 'a', nuevoEstado);
      
      await usuarioService.cambiarEstado(id, nuevoEstado);
      
      console.log('✅ Estado cambiado exitosamente');
      
      // Actualizar en el estado local
      setUsuarios(prev => prev.map(u => 
        u.id === id ? { ...u, activo: nuevoEstado } : u
      ));
      
      // Recargar estadísticas
      await cargarEstadisticas();
      
      return { 
        success: true, 
        mensaje: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente` 
      };
      
    } catch (err) {
      console.error('❌ Error al cambiar estado:', err);
      
      const errorMessage = err.response?.data?.mensaje || 
                          'No se pudo cambiar el estado';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // CAMBIAR ROL (optimizado)
  const cambiarRol = async (id, nuevoRol) => {
    try {
      console.log('👤 Cambiando rol del usuario:', id, 'a', nuevoRol);
      
      await usuarioService.cambiarRol(id, nuevoRol);
      
      console.log('✅ Rol cambiado exitosamente');
      
      // Actualizar en el estado local
      setUsuarios(prev => prev.map(u => 
        u.id === id ? { ...u, rol: nuevoRol } : u
      ));
      
      // Recargar estadísticas
      await cargarEstadisticas();
      
      return { 
        success: true, 
        mensaje: `Rol cambiado a ${nuevoRol} exitosamente` 
      };
      
    } catch (err) {
      console.error('❌ Error al cambiar rol:', err);
      
      const errorMessage = err.response?.data?.mensaje || 
                          'No se pudo cambiar el rol';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // ELIMINAR USUARIO (optimizado)
  const eliminarUsuario = async (id) => {
    try {
      console.log('🗑️ Eliminando usuario:', id);
      
      await usuarioService.delete(id);
      
      console.log('✅ Usuario eliminado exitosamente');
      
      // Eliminar del estado local
      setUsuarios(prev => prev.filter(u => u.id !== id));
      
      // Recargar estadísticas
      await cargarEstadisticas();
      
      return { 
        success: true, 
        mensaje: 'Usuario eliminado exitosamente' 
      };
      
    } catch (err) {
      console.error('❌ Error al eliminar usuario:', err);
      
      const errorMessage = err.response?.data?.mensaje || 
                          err.response?.data?.message || 
                          'No se pudo eliminar el usuario';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    // Filtro de búsqueda
    const coincideBusqueda = 
      (usuario.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || false) ||
      (usuario.email?.toLowerCase().includes(busqueda.toLowerCase()) || false) ||
      (usuario.telefono?.includes(busqueda) || false);
    
    // Filtro de rol
    const coincideRol = filtroRol === 'todos' || usuario.rol === filtroRol;
    
    // Filtro de estado
    const coincideEstado = filtroEstado === 'todos' || 
                          (filtroEstado === 'activo' ? usuario.activo : !usuario.activo);
    
    return coincideBusqueda && coincideRol && coincideEstado;
  });

  // 🎯 ESTADÍSTICAS CALCULADAS (MEJORADO)
  const calcularEstadisticas = () => {
    console.log('📊 Calculando estadísticas de', usuarios.length, 'usuarios');
    
    const stats = {
      total: usuarios.length,
      activos: usuarios.filter(u => u.activo === true).length,
      inactivos: usuarios.filter(u => u.activo === false).length,
      administradores: usuarios.filter(u => u.rol === 'administrador' || u.rol === 'admin').length,
      clientes: usuarios.filter(u => u.rol === 'cliente' || u.rol === 'usuario').length,
      registrosHoy: usuarios.filter(u => {
        const fecha = new Date(u.created_at || u.createdAt || u.fecha_registro || 0);
        const hoy = new Date();
        return fecha.toDateString() === hoy.toDateString();
      }).length,
      registrosSemana: usuarios.filter(u => {
        const fecha = new Date(u.created_at || u.createdAt || u.fecha_registro || 0);
        const hoy = new Date();
        const hace7dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        return fecha >= hace7dias;
      }).length
    };
    
    console.log('📈 Estadísticas calculadas:', stats);
    return stats;
  };

  // 🎯 COMBINAR ESTADÍSTICAS: API + CALCULADAS
  const estadisticasCombinadas = () => {
    const calculadas = calcularEstadisticas();
    
    // Si tenemos estadísticas de la API, las combinamos
    if (estadisticasApi) {
      return {
        total: estadisticasApi.total_usuarios || calculadas.total,
        activos: estadisticasApi.usuarios_activos || estadisticasApi.activos || calculadas.activos,
        inactivos: estadisticasApi.usuarios_inactivos || estadisticasApi.inactivos || calculadas.inactivos,
        administradores: estadisticasApi.total_admins || estadisticasApi.administradores || calculadas.administradores,
        clientes: estadisticasApi.total_usuarios ? 
                 (estadisticasApi.total_usuarios - (estadisticasApi.total_admins || 0)) : 
                 calculadas.clientes,
        registrosHoy: estadisticasApi.registros_hoy || calculadas.registrosHoy,
        registrosSemana: estadisticasApi.registros_semana || calculadas.registrosSemana
      };
    }
    
    // Si no hay API, devolvemos solo las calculadas
    return calculadas;
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarUsuarios();
    cargarEstadisticas();
  }, [cargarUsuarios, cargarEstadisticas]);

  return {
    // Estado
    usuarios,
    usuariosFiltrados,
    loading,
    error,
    estadisticas: estadisticasCombinadas(),
    
    // Filtros
    busqueda,
    setBusqueda,
    filtroRol,
    setFiltroRol,
    filtroEstado,
    setFiltroEstado,
    
    // Acciones
    cargarUsuarios,
    crearUsuario,
    actualizarUsuario,
    cambiarEstado,
    cambiarRol,
    eliminarUsuario
  };
};