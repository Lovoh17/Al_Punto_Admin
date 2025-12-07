// src/pages/CategoriasPage.jsx
import React from 'react';
import { useCategorias } from '../Hooks/useCategorias';
import CategoriaList from '../components/Categoria/CategoriaList';

const CategoriasPage = () => {
  const { categorias, loading, error } = useCategorias();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Gestión de Categorías</h1>
      <CategoriaList 
        categorias={categorias} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default CategoriasPage;