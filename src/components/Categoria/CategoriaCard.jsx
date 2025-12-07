// src/components/Categoria/CategoriaCard.jsx
import React from 'react';

const CategoriaCard = ({ categoria }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      margin: '0.5rem',
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
        {categoria.nombre}
      </h3>
      <p style={{ 
        margin: '0 0 0.5rem 0', 
        color: '#666',
        fontSize: '0.9rem'
      }}>
        {categoria.descripcion}
      </p>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.8rem',
          background: categoria.activo ? '#d4edda' : '#f8d7da',
          color: categoria.activo ? '#155724' : '#721c24'
        }}>
          {categoria.activo ? 'Activo' : 'Inactivo'}
        </span>
        <small style={{ color: '#999' }}>
          ID: {categoria.id}
        </small>
      </div>
    </div>
  );
};

export default CategoriaCard;