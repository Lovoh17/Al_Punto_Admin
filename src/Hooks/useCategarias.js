// src/Hooks/useCategorias.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { categoriaService } from '../services/api';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Cargar categorías desde el backend
  const cargarCategorias = useCallback(async () => {
    try {
      console.log('🔄 Cargando categorías...');
      setLoading(true);
      setError(null);
      
      const response = await categoriaService.getAll();
      console.log('📥 Respuesta de API (categorías):', response);
      console.log('📊 Datos recibidos:', response.data);
      
      if (response && response.data) {
        // Manejar múltiples formatos de respuesta del backend
        let categoriasData;
        
        if (response.data.success && response.data.data) {
          // Formato: { success: true, data: [...] }
          categoriasData = response.data.data;
          console.log('📋 Usando formato success/data:', categoriasData);
        } else if (Array.isArray(response.data)) {
          // Formato: [...]
          categoriasData = response.data;
          console.log('📋 Usando formato array directo:', categoriasData);
        } else if (response.data.categorias) {
          // Formato: { categorias: [...] }
          categoriasData = response.data.categorias;
          console.log('📋 Usando formato categorias:', categoriasData);
        } else {
          console.log('⚠️ Formato de respuesta no reconocido:', response.data);
          categoriasData = [];
        }
        
        // Verificar que sea un array
        if (Array.isArray(categoriasData)) {
          console.log(`✅ Categorías cargadas: ${categoriasData.length} elementos`);
          setCategorias(categoriasData);
        } else {
          console.error('❌ Error: categoriasData no es un array:', categoriasData);
          setCategorias([]);
        }
      } else {
        console.error('❌ Respuesta inválida de la API:', response);
        setCategorias([]);
      }
    } catch (err) {
      console.error('❌ Error al cargar categorías:', err);
      console.error('📄 Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Error al cargar categorías';
      
      setError(errorMessage);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear categoría
  const crearCategoria = useCallback(async (categoriaData) => {
    try {
      console.log('📝 Creando categoría con datos:', categoriaData);
      const response = await categoriaService.create(categoriaData);
      console.log('✅ Respuesta de creación:', response.data);
      
      if (response && response.data) {
        // Recargar categorías después de crear
        await cargarCategorias();
        
        return { 
          success: true, 
          mensaje: 'Categoría creada exitosamente',
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        error: 'No se pudo crear la categoría: respuesta vacía' 
      };
    } catch (err) {
      console.error('❌ Error al crear categoría:', err);
      console.error('📄 Detalles:', err.response?.data);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Error al crear categoría';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [cargarCategorias]);

  // Actualizar categoría
  const actualizarCategoria = useCallback(async (id, categoriaData) => {
    try {
      console.log(`📝 Actualizando categoría ID ${id}:`, categoriaData);
      const response = await categoriaService.update(id, categoriaData);
      console.log('✅ Respuesta de actualización:', response.data);
      
      if (response && response.data) {
        // Recargar categorías después de actualizar
        await cargarCategorias();
        
        return { 
          success: true, 
          mensaje: 'Categoría actualizada exitosamente',
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        error: 'No se pudo actualizar la categoría: respuesta vacía' 
      };
    } catch (err) {
      console.error('❌ Error al actualizar categoría:', err);
      console.error('📄 Detalles:', err.response?.data);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Error al actualizar categoría';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [cargarCategorias]);

  // Eliminar categoría
  const eliminarCategoria = useCallback(async (id) => {
    try {
      console.log(`🗑️ Eliminando categoría ID ${id}`);
      const response = await categoriaService.delete(id);
      console.log('✅ Respuesta de eliminación:', response.data);
      
      // Recargar categorías después de eliminar
      await cargarCategorias();
      
      return { 
        success: true, 
        mensaje: 'Categoría eliminada exitosamente' 
      };
    } catch (err) {
      console.error('❌ Error al eliminar categoría:', err);
      console.error('📄 Detalles:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      // Mensajes de error específicos
      let errorMessage;
      if (err.response?.status === 400) {
        errorMessage = 'No se puede eliminar una categoría con productos asociados';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else {
        errorMessage = err.message || 'Error al eliminar categoría';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [cargarCategorias]);

  // Cambiar estado de categoría - VERSIÓN CORREGIDA
const cambiarEstadoCategoria = useCallback(async (id, activo) => {
  try {
    console.log(`🔄 Cambiando estado de categoría ID ${id} a:`, activo ? 'activa' : 'inactiva');
    
    // PRIMERO: Obtener la categoría actual
    console.log(`📥 Obteniendo categoría ID ${id} para actualizar estado...`);
    const categoriaResponse = await categoriaService.getById(id);
    
    if (!categoriaResponse.data || !categoriaResponse.data.data) {
      return { 
        success: false, 
        error: 'No se pudo obtener la información de la categoría' 
      };
    }
    
    const categoriaActual = categoriaResponse.data.data;
    console.log('📋 Categoría actual:', categoriaActual);
    
    // Preparar datos para actualizar (incluir todos los campos obligatorios)
    const datosActualizados = {
      nombre: categoriaActual.nombre, // Campo obligatorio
      descripcion: categoriaActual.descripcion || '', // Incluir descripción
      activo: activo // Cambiar solo el estado
    };
    
    console.log(`📤 Enviando datos actualizados para ID ${id}:`, datosActualizados);
    const response = await categoriaService.update(id, datosActualizados);
    console.log('✅ Respuesta de cambio de estado:', response.data);
    
    if (response && response.data) {
      // Recargar categorías después de cambiar estado
      await cargarCategorias();
      
      return { 
        success: true, 
        mensaje: `Categoría ${activo ? 'activada' : 'desactivada'} exitosamente` 
      };
    }
    
    return { 
      success: false, 
      error: 'No se pudo cambiar el estado: respuesta vacía' 
    };
  } catch (err) {
    console.error('❌ Error al cambiar estado:', err);
    console.error('📄 Detalles del error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    
    const errorMessage = err.response?.data?.message 
      || err.response?.data?.error 
      || err.message 
      || 'Error al cambiar estado';
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}, [cargarCategorias]);

  // Filtrar categorías
  const categoriasFiltradas = useMemo(() => {
    console.log('🔍 Aplicando filtros a categorías:', {
      totalCategorias: categorias.length,
      busqueda,
      filtroEstado
    });
    
    let resultado = [...categorias];

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().trim();
      resultado = resultado.filter(categoria => {
        const matchNombre = categoria.nombre?.toLowerCase().includes(term) || false;
        const matchDescripcion = categoria.descripcion?.toLowerCase().includes(term) || false;
        return matchNombre || matchDescripcion;
      });
      
      console.log(`🔍 Después de búsqueda "${busqueda}": ${resultado.length} categorías`);
    }

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(categoria => {
        // Manejar diferentes formatos de activo
        const esActiva = categoria.activo === true || categoria.activo === 1 || categoria.activo === 'true';
        
        if (filtroEstado === 'activas') {
          return esActiva;
        } else if (filtroEstado === 'inactivas') {
          return !esActiva;
        }
        
        return true;
      });
      
      console.log(`🔍 Después de filtro de estado "${filtroEstado}": ${resultado.length} categorías`);
    }

    // Ordenar: activas primero, luego por nombre
    resultado.sort((a, b) => {
      const aActiva = a.activo === true || a.activo === 1 || a.activo === 'true';
      const bActiva = b.activo === true || b.activo === 1 || b.activo === 'true';
      
      if (aActiva !== bActiva) {
        return aActiva ? -1 : 1;
      }
      
      return (a.nombre || '').localeCompare(b.nombre || '');
    });

    console.log(`✅ Filtrado completado: ${resultado.length} categorías después de aplicar filtros`);
    return resultado;
  }, [categorias, busqueda, filtroEstado]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    console.log('📊 Calculando estadísticas...');
    
    const total = categorias.length;
    const activas = categorias.filter(c => 
      c.activo === true || c.activo === 1 || c.activo === 'true'
    ).length;
    const inactivas = total - activas;
    
    const conProductos = categorias.filter(c => 
      (c.total_productos || 0) > 0
    ).length;
    
    const sinProductos = total - conProductos;
    
    const totalProductos = categorias.reduce((sum, c) => 
      sum + (c.total_productos || 0), 0
    );

    const estadisticasResult = {
      total,
      activas,
      inactivas,
      conProductos,
      sinProductos,
      totalProductos
    };
    
    console.log('📊 Estadísticas calculadas:', estadisticasResult);
    return estadisticasResult;
  }, [categorias]);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    console.log('🧹 Limpiando filtros...');
    setBusqueda('');
    setFiltroEstado('todos');
  }, []);

  // Cargar categorías al montar el componente
  useEffect(() => {
    console.log('🚀 useCategorias hook montado');
    cargarCategorias();
    
    // Cleanup function
    return () => {
      console.log('🧹 useCategorias hook desmontado');
    };
  }, [cargarCategorias]);

  // Log cuando las funciones están disponibles
  useEffect(() => {
    console.log('✅ Funciones CRUD disponibles:', {
      cargarCategorias: typeof cargarCategorias === 'function',
      crearCategoria: typeof crearCategoria === 'function',
      actualizarCategoria: typeof actualizarCategoria === 'function',
      eliminarCategoria: typeof eliminarCategoria === 'function',
      cambiarEstadoCategoria: typeof cambiarEstadoCategoria === 'function',
      clearFilters: typeof clearFilters === 'function'
    });
  }, [cargarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria, cambiarEstadoCategoria, clearFilters]);

  // Retornar todas las funciones y estados
  const hookResult = {
    // Datos
    categorias: categoriasFiltradas,
    categoriasOriginales: categorias,
    loading,
    error,
    estadisticas,
    
    // Filtros
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    
    // Métodos CRUD
    cargarCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    cambiarEstadoCategoria,
    
    // Utilidades
    clearFilters
  };

  console.log('📤 useCategorias hook retornando:', Object.keys(hookResult));
  return hookResult;
};