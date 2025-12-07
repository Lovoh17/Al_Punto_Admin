// src/components/Categoria/CategoriaList.jsx
import React from 'react';
import CategoriaCard from './CategoriaCard';
import Loading from '../Common/Loading';
import Error from '../Common/Error';

const CategoriaList = ({ categorias, loading, error }) => {
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <h2>Categorías ({categorias.length})</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
        padding: '1rem 0'
      }}>
        {categorias.map(categoria => (
          <CategoriaCard key={categoria.id} categoria={categoria} />
        ))}
      </div>
    </div>
  );
};

export default CategoriaList;