import React from 'react';
import { useNavigate } from 'react-router-dom';

const EnDesarrolloEmoji = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          fontSize: '80px',
          marginBottom: '20px'
        }}>
          🚧
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#000000',
          marginBottom: '16px'
        }}>
          Página en Desarrollo
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#666666',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Esta sección está actualmente en construcción. 
          Estamos trabajando para traerte nuevas funcionalidades pronto.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: '32px'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px',
              background: '#F5F5F5',
              color: '#000000',
              border: '1px solid #E0E0E0',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ← Volver
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              background: '#000000',
              color: '#FFFFFF',
              border: '1px solid #000000',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnDesarrolloEmoji;