// src/hooks/useProductos.js
import { useState, useEffect } from 'react';
import { productoService, categoriaService } from '../services/api';

export const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriasLoading, setCategoriasLoading] = useState(true);
  const [productosLoading, setProductosLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos
  const fetchProductos = async () => {
    try {
      setProductosLoading(true);
      const response = await productoService.getAll();
      setProductos(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar productos');
    } finally {
      setProductosLoading(false);
    }
  };

  // Cargar categorías activas
  const fetchCategorias = async () => {
    try {
      setCategoriasLoading(true);
      const response = await categoriaService.getAll();
      // Filtrar solo categorías activas si la API lo soporta
      const categoriasData = response.data.data || response.data;
      // Si la API no tiene filtro de activo, puedes hacerlo aquí
      const categoriasActivas = categoriasData.filter(cat => cat.activo !== false);
      setCategorias(categoriasActivas);
    } catch (err) {
      console.error('Error cargando categorías:', err);
      // Si falla, al menos mostrar un array vacío
      setCategorias([]);
    } finally {
      setCategoriasLoading(false);
    }
  };

  // Crear producto
  const crearProducto = async (productoData) => {
    try {
      const response = await productoService.create(productoData);
      await fetchProductos();
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al crear producto' 
      };
    }
  };

  // Actualizar producto
  const actualizarProducto = async (id, productoData) => {
    try {
      const response = await productoService.update(id, productoData);
      await fetchProductos();
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al actualizar producto' 
      };
    }
  };

  // Eliminar producto
  const eliminarProducto = async (id) => {
    try {
      await productoService.delete(id);
      await fetchProductos();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al eliminar producto' 
      };
    }
  };

  // Cambiar disponibilidad
  const toggleDisponibilidad = async (id, disponible) => {
    try {
      const response = await productoService.update(id, { disponible });
      await fetchProductos();
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al cambiar disponibilidad' 
      };
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      await Promise.all([
        fetchProductos(),
        fetchCategorias()
      ]);
    };
    
    cargarDatos();
  }, []);

  const loading = productosLoading || categoriasLoading;

  return { 
    productos, 
    categorias,
    loading, 
    error, 
    refetchProductos: fetchProductos,
    refetchCategorias: fetchCategorias,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    toggleDisponibilidad
  };
};