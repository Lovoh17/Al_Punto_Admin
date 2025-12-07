// src/Hooks/usePedidos.js
import { useState, useEffect } from 'react';
import { pedidoService, pedidosProductosService } from '../services/api';

export const usePedidos = (filtros = {}) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pedidoService.getAll();
      setPedidos(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar pedidos');
      console.error('Error fetching pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para obtener detalle completo del pedido con productos
  const obtenerDetallePedido = async (pedidoId) => {
    try {
      // Obtener información básica del pedido
      const pedidoResponse = await pedidoService.getById(pedidoId);
      const pedidoData = pedidoResponse.data.data || pedidoResponse.data;
      
      // Obtener productos del pedido
      const productosResponse = await pedidosProductosService.obtenerProductosPedido(pedidoId);
      const productosData = productosResponse.data.data || productosResponse.data;
      
      return { 
        success: true, 
        data: {
          ...pedidoData,
          productos: productosData.data || productosData,
          estadisticas: productosData.estadisticas,
          resumen_por_categoria: productosData.resumen_por_categoria
        }
      };
    } catch (err) {
      console.error('Error al cargar detalle del pedido:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al cargar detalle del pedido' 
      };
    }
  };

  const crearPedido = async (pedidoData) => {
    try {
      const response = await pedidoService.crear(pedidoData);
      await fetchPedidos(); // Recargar lista
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al crear pedido' 
      };
    }
  };

  const actualizarPedido = async (id, pedidoData) => {
    try {
      const response = await pedidoService.update(id, pedidoData);
      await fetchPedidos(); // Recargar lista
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al actualizar pedido' 
      };
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      const response = await pedidoService.cambiarEstado(id, estado);
      await fetchPedidos(); // Recargar lista
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al cambiar estado' 
      };
    }
  };

  const cancelarPedido = async (id) => {
    try {
      const response = await pedidoService.cancelar(id);
      await fetchPedidos(); // Recargar lista
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al cancelar pedido' 
      };
    }
  };

  const eliminarPedido = async (id) => {
    try {
      await pedidoService.delete(id);
      await fetchPedidos(); // Recargar lista
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al eliminar pedido' 
      };
    }
  };

  // Obtener estadísticas generales
  const obtenerEstadisticas = async () => {
    try {
      const response = await pedidoService.getEstadisticas();
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al obtener estadísticas' 
      };
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  return { 
    pedidos, 
    loading, 
    error, 
    refetch: fetchPedidos,
    obtenerDetallePedido,
    obtenerEstadisticas,
    crearPedido,
    actualizarPedido,
    cambiarEstado,
    cancelarPedido,
    eliminarPedido
  };
};