// src/hooks/useMisPedidos.js
import { useState, useEffect, useCallback } from 'react';
import { pedidoService } from '../services/api';
import { useAuth } from '../AuthContext';

export const useMisPedidos = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Cargar pedidos del usuario
  const cargarPedidos = useCallback(async () => {
    if (!user?.id) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando pedidos del usuario:', user.id);
      
      const response = await pedidoService.getByCliente(user.id);
      
      console.log('📦 Respuesta del servidor:', response.data);
      
      // Manejar diferentes estructuras de respuesta
      let pedidosData = [];
      
      if (response.data.success && response.data.data) {
        pedidosData = response.data.data;
      } else if (Array.isArray(response.data)) {
        pedidosData = response.data;
      } else if (response.data.pedidos) {
        pedidosData = response.data.pedidos;
      }
      
      // Asegurarse de que sea un array
      const pedidosArray = Array.isArray(pedidosData) ? pedidosData : [];
      
      // Ordenar por fecha (más recientes primero)
      const pedidosOrdenados = pedidosArray.sort((a, b) => 
        new Date(b.fecha_pedido) - new Date(a.fecha_pedido)
      );
      
      setPedidos(pedidosOrdenados);
      console.log('✅ Pedidos cargados:', pedidosOrdenados.length);
      
    } catch (err) {
      console.error('❌ Error cargando pedidos:', err);
      
      let errorMessage = 'No se pudieron cargar los pedidos';
      
      if (err.response) {
        errorMessage = err.response.data?.error || 
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
  }, [user]);

  // Cancelar pedido
  const cancelarPedido = async (pedidoId) => {
    try {
      console.log('🚫 Cancelando pedido:', pedidoId);
      
      await pedidoService.cancelar(pedidoId);
      
      console.log('✅ Pedido cancelado exitosamente');
      
      // Recargar pedidos
      await cargarPedidos();
      
      return { success: true };
      
    } catch (err) {
      console.error('❌ Error cancelando pedido:', err);
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          'No se pudo cancelar el pedido';
      
      return { success: false, error: errorMessage };
    }
  };

  // Obtener detalles de un pedido
  const obtenerDetallePedido = async (pedidoId) => {
    try {
      console.log('🔍 Obteniendo detalle del pedido:', pedidoId);
      
      const response = await pedidoService.getById(pedidoId);
      
      const detalle = response.data.data || response.data;
      
      console.log('📦 Detalle obtenido:', detalle);
      
      return { success: true, data: detalle };
      
    } catch (err) {
      console.error('❌ Error obteniendo detalle:', err);
      
      const errorMessage = err.response?.data?.error || 
                          'No se pudo obtener el detalle del pedido';
      
      return { success: false, error: errorMessage };
    }
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroEstado === 'todos') return true;
    return pedido.estado === filtroEstado;
  });

  // Estadísticas
  const estadisticas = {
    total: pedidos.length,
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    enPreparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
    listos: pedidos.filter(p => p.estado === 'listo').length,
    entregados: pedidos.filter(p => p.estado === 'entregado').length,
    cancelados: pedidos.filter(p => p.estado === 'cancelado').length,
    totalGastado: pedidos
      .filter(p => p.estado === 'entregado')
      .reduce((sum, p) => sum + parseFloat(p.total || 0), 0)
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  return {
    pedidos,
    pedidosFiltrados,
    loading,
    error,
    filtroEstado,
    setFiltroEstado,
    estadisticas,
    cargarPedidos,
    cancelarPedido,
    obtenerDetallePedido
  };
};