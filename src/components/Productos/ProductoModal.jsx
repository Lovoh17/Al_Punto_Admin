// src/components/Productos/ProductoModal.jsx
import React, { useState, useEffect } from 'react';

const ProductoModal = ({ 
  producto, 
  categorias, 
  onClose, 
  onSave,
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria_id: '',
    disponible: true,
    destacado: false,
    imagen: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio: producto.precio || '',
        categoria_id: producto.categoria_id || '',
        disponible: producto.disponible !== undefined ? producto.disponible : true,
        destacado: producto.destacado || false,
        imagen: producto.imagen || ''
      });
    }
  }, [producto]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.precio) {
      newErrors.precio = 'El precio es requerido';
    } else if (isNaN(formData.precio) || parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser un número positivo';
    }
    
    if (formData.categoria_id && isNaN(formData.categoria_id)) {
      newErrors.categoria_id = 'Categoría inválida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const productoData = {
        ...formData,
        precio: parseFloat(formData.precio)
      };
      
      onSave(productoData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            {/* Nombre */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.nombre ? styles.inputError : {})
                }}
                placeholder="Nombre del producto"
              />
              {errors.nombre && <span style={styles.errorText}>{errors.nombre}</span>}
            </div>

            {/* Precio */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Precio *</label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                step="0.01"
                min="0"
                style={{
                  ...styles.input,
                  ...(errors.precio ? styles.inputError : {})
                }}
                placeholder="0.00"
              />
              {errors.precio && <span style={styles.errorText}>{errors.precio}</span>}
            </div>

            {/* Categoría */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Categoría</label>
              <select
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* URL de imagen */}
            <div style={styles.formGroup}>
              <label style={styles.label}>URL de Imagen</label>
              <input
                type="text"
                name="imagen"
                value={formData.imagen}
                onChange={handleChange}
                style={styles.input}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            {/* Descripción */}
            <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
              <label style={styles.label}>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                style={styles.textarea}
                rows="3"
                placeholder="Descripción del producto..."
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="disponible"
                checked={formData.disponible}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span>Producto disponible</span>
            </label>
            
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="destacado"
                checked={formData.destacado}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span>Producto destacado</span>
            </label>
          </div>

          {/* Vista previa de imagen */}
          {formData.imagen && (
            <div style={styles.imagePreview}>
              <label style={styles.label}>Vista previa:</label>
              <div style={styles.previewContainer}>
                <img 
                  src={formData.imagen} 
                  alt="Vista previa" 
                  style={styles.previewImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={styles.previewPlaceholder}>
                  <span>Imagen no disponible</span>
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div style={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={styles.saveButton}
            >
              {isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const colors = {
  primary: '#2c5aa0',
  primaryLight: '#3a6bc5',
  background: '#ffffff',
  border: '#e5e7eb',
  text: '#374151',
  error: '#ef4444'
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: `1px solid ${colors.border}`
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text,
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: colors.text,
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  form: {
    padding: '24px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '24px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text
  },
  input: {
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s'
  },
  inputError: {
    borderColor: colors.error
  },
  errorText: {
    fontSize: '12px',
    color: colors.error,
    marginTop: '4px'
  },
  select: {
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: colors.background
  },
  textarea: {
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '80px'
  },
  checkboxGroup: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: colors.text,
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  imagePreview: {
    marginBottom: '24px'
  },
  previewContainer: {
    marginTop: '8px',
    width: '100%',
    height: '150px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  previewPlaceholder: {
    display: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
    color: colors.text
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '24px',
    borderTop: `1px solid ${colors.border}`
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  saveButton: {
    padding: '10px 24px',
    backgroundColor: colors.primary,
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

export default ProductoModal;