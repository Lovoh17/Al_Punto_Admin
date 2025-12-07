// src/hooks/useCategorias.js
import { useState, useEffect } from 'react';
import { categoriaService } from '../services/api';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await categoriaService.getAll();
      setCategorias(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return { categorias, loading, error, refetch: fetchCategorias };
};