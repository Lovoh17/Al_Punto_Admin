// src/components/CategoriaList.jsx
import React from 'react';
import { useCategorias } from '../Hooks/useCategorias';

const CategoriaList = () => {
  const { categorias, loading, error } = useCategorias(true);

  if (loading) return <div>Cargando categorías...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="categoria-list">
      <h2>Categorías</h2>
      {categorias.map(categoria => (
        <div key={categoria.id} className="categoria-item">
          <h3>{categoria.nombre}</h3>
          <p>{categoria.descripcion}</p>
          <span className={`status ${categoria.activo ? 'activo' : 'inactivo'}`}>
            {categoria.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CategoriaList;