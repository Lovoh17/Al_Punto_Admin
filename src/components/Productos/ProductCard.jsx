// src/components/Productos/ProductCard.jsx
import React, { useState } from 'react';

const ProductCard = ({ producto, onEdit, onDelete, onToggleDisponibilidad }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = () => {
    if (showConfirm) {
      onDelete(producto.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div 
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
        ...(!producto.disponible ? styles.cardNoDisponible : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge de estado */}
      <div style={styles.badgeContainer}>
        <div style={{
          ...styles.badge,
          ...(producto.disponible ? styles.badgeDisponible : styles.badgeNoDisponible)
        }}>
          {producto.disponible ? '✓ Disponible' : '✗ No disponible'}
        </div>
        {producto.destacado && (
          <div style={styles.badgeDestacado}>
            ⭐ Destacado
          </div>
        )}
      </div>

      {/* Imagen del producto */}
      <div style={styles.imageContainer}>
        {producto.imagen ? (
          <img 
            src={producto.imagen} 
            alt={producto.nombre}
            style={styles.image}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentElement.style.display = 'flex';
            }}
          />
        ) : (
          <div style={styles.imagePlaceholder}>
            <span style={styles.placeholderIcon}>🍽️</span>
            <span style={styles.placeholderText}>Sin imagen</span>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div style={styles.content}>
        <h3 style={styles.name}>{producto.nombre}</h3>
        <p style={styles.description}>{producto.descripcion || 'Sin descripción'}</p>
        
        <div style={styles.details}>
          <div style={styles.category}>
            <span style={styles.categoryLabel}>Categoría:</span>
            <span style={styles.categoryValue}>{producto.categoria_nombre || 'General'}</span>
          </div>
          <div style={styles.priceContainer}>
            <span style={styles.priceLabel}>Precio:</span>
            <span style={styles.price}>S/ {parseFloat(producto.precio).toFixed(2)}</span>
          </div>
        </div>

        {/* Acciones */}
        <div style={styles.actions}>
          <button
            onClick={() => onToggleDisponibilidad(producto.id, !producto.disponible)}
            style={{
              ...styles.button,
              ...styles.buttonToggle,
              ...(!producto.disponible ? styles.buttonActivar : {})
            }}
          >
            {producto.disponible ? 'Desactivar' : 'Activar'}
          </button>
          
          <button
            onClick={() => onEdit(producto)}
            style={{
              ...styles.button,
              ...styles.buttonEdit
            }}
          >
            Editar
          </button>
          
          {showConfirm ? (
            <div style={styles.confirmDelete}>
              <span style={styles.confirmText}>¿Eliminar?</span>
              <button
                onClick={handleDelete}
                style={{
                  ...styles.button,
                  ...styles.buttonDeleteConfirm
                }}
              >
                Sí
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  ...styles.button,
                  ...styles.buttonCancel
                }}
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              style={{
                ...styles.button,
                ...styles.buttonDelete
              }}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const colors = {
  primary: '#2c5aa0',
  primaryLight: '#3a6bc5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  dangerLight: '#fca5a5',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

const styles = {
  card: {
    backgroundColor: colors.gray[50],
    border: `1px solid ${colors.gray[200]}`,
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    borderColor: colors.primary
  },
  cardNoDisponible: {
    opacity: 0.8,
    backgroundColor: colors.gray[100]
  },
  badgeContainer: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    zIndex: 1
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.3px'
  },
  badgeDisponible: {
    backgroundColor: colors.success + '20',
    color: colors.success,
    border: `1px solid ${colors.success}40`
  },
  badgeNoDisponible: {
    backgroundColor: colors.gray[300],
    color: colors.gray[600],
    border: `1px solid ${colors.gray[400]}`
  },
  badgeDestacado: {
    backgroundColor: colors.warning + '20',
    color: colors.warning,
    border: `1px solid ${colors.warning}40`,
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.3px'
  },
  imageContainer: {
    height: '180px',
    backgroundColor: colors.gray[100],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  imagePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: colors.gray[400]
  },
  placeholderIcon: {
    fontSize: '48px',
    opacity: 0.5
  },
  placeholderText: {
    fontSize: '14px',
    fontWeight: '500'
  },
  content: {
    padding: '20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  name: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.gray[800],
    margin: '0 0 8px 0',
    lineHeight: '1.3'
  },
  description: {
    fontSize: '14px',
    color: colors.gray[600],
    margin: '0 0 16px 0',
    lineHeight: '1.5',
    flex: 1
  },
  details: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  category: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  categoryLabel: {
    fontSize: '12px',
    color: colors.gray[500],
    fontWeight: '500'
  },
  categoryValue: {
    fontSize: '13px',
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: colors.primary + '10',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  priceLabel: {
    fontSize: '12px',
    color: colors.gray[500],
    fontWeight: '500'
  },
  price: {
    fontSize: '20px',
    color: colors.gray[900],
    fontWeight: '700'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
    textAlign: 'center'
  },
  buttonToggle: {
    backgroundColor: colors.gray[200],
    color: colors.gray[700]
  },
  buttonActivar: {
    backgroundColor: colors.success + '20',
    color: colors.success,
    border: `1px solid ${colors.success}40`
  },
  buttonEdit: {
    backgroundColor: colors.primary + '10',
    color: colors.primary,
    border: `1px solid ${colors.primary}30`
  },
  buttonDelete: {
    backgroundColor: colors.danger + '10',
    color: colors.danger,
    border: `1px solid ${colors.danger}30`
  },
  buttonDeleteConfirm: {
    backgroundColor: colors.danger,
    color: 'white',
    minWidth: '40px'
  },
  buttonCancel: {
    backgroundColor: colors.gray[300],
    color: colors.gray[700],
    minWidth: '40px'
  },
  confirmDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flex: 1
  },
  confirmText: {
    fontSize: '12px',
    color: colors.gray[600],
    fontWeight: '500',
    marginRight: '4px'
  }
};

export default ProductCard;