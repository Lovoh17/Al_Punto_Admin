import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaCalendarAlt, 
  FaUtensils, 
  FaPlus, 
  FaSearch, 
  FaToggleOn, 
  FaToggleOff, 
  FaSave,
  FaUndo
} from 'react-icons/fa';

const ModalMenu = ({ 
  isOpen, 
  onClose, 
  menu, 
  onSubmit, 
  productosDisponibles = [],
  loading 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    fecha: '',
    descripcion: '',
    activo: true,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');

  useEffect(() => {
    if (menu && isOpen) {
      setFormData({
        nombre: menu.nombre || '',
        fecha: menu.fecha ? menu.fecha.split('T')[0] : '',
        descripcion: menu.descripcion || '',
        activo: menu.activo !== undefined ? menu.activo : true,
      });
      
      if (menu.productos && Array.isArray(menu.productos) && menu.productos.length > 0) {
        setSelectedProductos(menu.productos);
      } else {
        setSelectedProductos([]);
      }
    } else if (isOpen) {
      setFormData({
        nombre: '',
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        activo: true,
      });
      setSelectedProductos([]);
      setSearchTerm('');
      setFiltroCategoria('');
    }
  }, [menu, isOpen]);

  if (!isOpen) return null;

  const productosFiltrados = productosDisponibles.filter(producto => {
    if (!producto) return false;
    
    const matchesSearch = searchTerm === '' || 
      (producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filtroCategoria || 
      producto.categoria_nombre === filtroCategoria;
    
    return matchesSearch && matchesCategory;
  });

  const categoriasUnicas = [...new Set(productosDisponibles
    .filter(p => p && p.categoria_nombre)
    .map(p => p.categoria_nombre))];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectProducto = (producto) => {
    if (!producto || !producto.id) return;
    
    const alreadySelected = selectedProductos.some(p => p.id === producto.id);
    
    if (alreadySelected) {
      setSelectedProductos(prev => prev.filter(p => p.id !== producto.id));
    } else {
      setSelectedProductos(prev => [...prev, {
        ...producto,
        producto_id: producto.id,
        disponible: true,
        precio_especial: null,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        imagen: producto.imagen,
        categoria_nombre: producto.categoria_nombre
      }]);
    }
  };

  const handleRemoveProducto = (productoId) => {
    setSelectedProductos(prev => prev.filter(p => p.id !== productoId));
  };

  const handleToggleDisponibilidad = (productoId) => {
    setSelectedProductos(prev => prev.map(p => 
      p.id === productoId ? { 
        ...p, 
        disponible: !p.disponible 
      } : p
    ));
  };

  const handleChangePrecioEspecial = (productoId, precio) => {
    const precioNum = precio === '' ? null : parseFloat(precio);
    setSelectedProductos(prev => prev.map(p => 
      p.id === productoId ? { 
        ...p, 
        precio_especial: precioNum 
      } : p
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const menuData = {
      ...formData,
      productos: selectedProductos.map(p => ({
        producto_id: p.id,
        disponible: p.disponible !== false,
        precio_especial: p.precio_especial || null
      }))
    };

    onSubmit(menuData);
  };

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.')) {
      onClose();
    }
  };

  const renderSelectedProducts = () => {
    if (selectedProductos.length === 0) {
      return (
        <div style={styles.emptySelectedProducts}>
          <div style={styles.emptySelectedIcon}>
            <FaUtensils />
          </div>
          <p style={styles.emptySelectedText}>
            No hay productos seleccionados
          </p>
          <p style={styles.emptySelectedHint}>
            Selecciona productos de la lista de abajo
          </p>
        </div>
      );
    }

    return (
      <div style={styles.selectedProductsGrid}>
        {selectedProductos.map((producto, index) => (
          <div key={`selected-${producto.id}-${index}`} style={styles.selectedProductCard}>
            <div style={styles.selectedProductHeader}>
              <div style={styles.selectedProductImage}>
                {producto.imagen ? (
                  <img 
                    src={producto.imagen} 
                    alt={producto.nombre}
                    style={styles.selectedProductImg}
                  />
                ) : (
                  <div style={styles.selectedProductPlaceholder}>
                    <FaUtensils />
                  </div>
                )}
              </div>
              
              <div style={styles.selectedProductInfo}>
                <div style={styles.selectedProductNameRow}>
                  <h5 style={styles.selectedProductName}>
                    {producto.nombre || 'Producto sin nombre'}
                  </h5>
                  <span style={styles.selectedProductOriginalPrice}>
                    ${producto.precio ? parseFloat(producto.precio).toFixed(2) : '0.00'}
                  </span>
                </div>
                
                <p style={styles.selectedProductDescripcion}>
                  {producto.descripcion || 'Sin descripción'}
                </p>
              </div>
            </div>
            
            <div style={styles.selectedProductActions}>
              <div style={styles.availabilityContainer}>
                <label style={styles.availabilityLabel}>
                  Disponible
                </label>
                <button
                  type="button"
                  onClick={() => handleToggleDisponibilidad(producto.id)}
                  style={{
                    ...styles.toggleButton,
                    backgroundColor: producto.disponible !== false ? colors.success : colors.danger
                  }}
                >
                  {producto.disponible !== false ? (
                    <FaToggleOn style={styles.toggleIcon} />
                  ) : (
                    <FaToggleOff style={styles.toggleIcon} />
                  )}
                  <span style={styles.toggleText}>
                    {producto.disponible !== false ? 'Sí' : 'No'}
                  </span>
                </button>
              </div>
              
              <div style={styles.priceContainer}>
                <label style={styles.priceLabel}>
                  Precio especial
                </label>
                <input
                  type="number"
                  placeholder="Igual al original"
                  value={producto.precio_especial || ''}
                  onChange={(e) => handleChangePrecioEspecial(producto.id, e.target.value)}
                  style={styles.precioEspecialInput}
                  min="0"
                  step="0.01"
                />
                {producto.precio_especial && (
                  <div style={styles.priceComparison}>
                    <span style={styles.originalPrice}>
                      Original: ${producto.precio ? parseFloat(producto.precio).toFixed(2) : '0.00'}
                    </span>
                    <span style={styles.specialPrice}>
                      Especial: ${parseFloat(producto.precio_especial).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => handleRemoveProducto(producto.id)}
                style={styles.removeSelectedButton}
                title="Quitar producto"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header con botón de cerrar */}
        <div style={styles.modalHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}>
              {menu ? '✏️' : '➕'}
            </div>
            <div>
              <h3 style={styles.modalTitle}>
                {menu ? 'Editar Menú' : 'Crear Nuevo Menú'}
              </h3>
              <p style={styles.modalSubtitle}>
                {menu ? 'Modifica los detalles del menú seleccionado' : 'Completa la información para crear un nuevo menú'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={styles.closeButton} 
            type="button"
            title="Cerrar"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>
            {/* Información básica */}
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <h4 style={styles.sectionTitle}>
                  <FaCalendarAlt style={styles.sectionIcon} />
                  Información del Menú
                </h4>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <span style={styles.required}>*</span> Nombre del Menú
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Ej: Menú del Viernes Especial"
                    required
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <span style={styles.required}>*</span> Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  style={styles.textarea}
                  placeholder="Describe el menú especial del día..."
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    style={styles.checkbox}
                    disabled={loading}
                  />
                  <span style={styles.checkboxText}>Menú activo</span>
                </label>
                <small style={styles.helperText}>
                  Solo los menús activos estarán disponibles para los clientes
                </small>
              </div>
            </div>

            {/* Sección de Productos Seleccionados */}
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <h4 style={styles.sectionTitle}>
                  <FaUtensils style={styles.sectionIcon} />
                  Productos del Menú
                </h4>
                <div style={styles.productCountContainer}>
                  <span style={styles.productCountBadge}>
                    {selectedProductos.length} seleccionados
                  </span>
                </div>
              </div>

              {/* Productos Seleccionados */}
              <div style={styles.selectedProductsSection}>
                <h5 style={styles.subsectionTitle}>
                  Productos Seleccionados
                </h5>
                {renderSelectedProducts()}
              </div>

              {/* Búsqueda y filtros */}
              <div style={styles.searchContainer}>
                <div style={styles.searchBox}>
                  <FaSearch style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Buscar productos por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                    disabled={loading}
                  />
                </div>
                
                <div style={styles.filterBox}>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    style={styles.categorySelect}
                    disabled={loading}
                  >
                    <option value="">Todas las categorías</option>
                    {categoriasUnicas.map((categoria, index) => (
                      <option key={`cat-${index}`} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de productos disponibles */}
              <div style={styles.availableProductsSection}>
                <div style={styles.availableProductsHeader}>
                  <h5 style={styles.subsectionTitle}>
                    Productos Disponibles ({productosFiltrados.length})
                  </h5>
                </div>
                
                {loading ? (
                  <div style={styles.loadingProducts}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Cargando productos...</p>
                  </div>
                ) : productosFiltrados.length === 0 ? (
                  <div style={styles.emptyProducts}>
                    <div style={styles.emptyProductsIcon}>
                      <FaUtensils />
                    </div>
                    <p style={styles.emptyProductsText}>
                      {searchTerm || filtroCategoria 
                        ? 'No se encontraron productos con los filtros aplicados' 
                        : 'No hay productos disponibles'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setFiltroCategoria('');
                      }}
                      style={styles.clearFiltersButton}
                      disabled={loading}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  <div style={styles.productsGrid}>
                    {productosFiltrados.map((producto, index) => {
                      const isSelected = selectedProductos.some(p => p.id === producto.id);
                      
                      return (
                        <div
                          key={`product-${producto.id}-${index}`}
                          onClick={() => !loading && handleSelectProducto(producto)}
                          style={{
                            ...styles.productCard,
                            ...(isSelected ? styles.productCardSelected : {}),
                            ...(loading ? styles.disabledCard : {})
                          }}
                        >
                          <div style={styles.productCardContent}>
                            <div style={styles.productImage}>
                              {producto.imagen ? (
                                <img 
                                  src={producto.imagen} 
                                  alt={producto.nombre}
                                  style={styles.productImg}
                                />
                              ) : (
                                <div style={styles.productPlaceholder}>
                                  <FaUtensils />
                                </div>
                              )}
                            </div>
                            
                            <div style={styles.productInfo}>
                              <div style={styles.productHeader}>
                                <h6 style={styles.productName}>
                                  {producto.nombre || 'Producto sin nombre'}
                                </h6>
                                <span style={styles.productPrice}>
                                  ${producto.precio ? parseFloat(producto.precio).toFixed(2) : '0.00'}
                                </span>
                              </div>
                              
                              <p style={styles.productDescripcion}>
                                {producto.descripcion?.substring(0, 60) || 'Sin descripción'}...
                              </p>
                              
                              <div style={styles.productFooter}>
                                <span style={styles.productCategory}>
                                  {producto.categoria_nombre || 'Sin categoría'}
                                </span>
                                {isSelected && (
                                  <span style={styles.selectedBadge}>
                                    ✓ Seleccionado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div style={styles.productAction}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!loading) handleSelectProducto(producto);
                              }}
                              style={{
                                ...styles.selectButton,
                                ...(isSelected ? styles.deselectButton : {})
                              }}
                              disabled={loading}
                            >
                              {isSelected ? 'Quitar' : 'Seleccionar'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer con botones de acción */}
          <div style={styles.modalFooter}>
            <div style={styles.footerActions}>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.cancelButton}
                disabled={loading}
                title="Cancelar y cerrar"
              >
                <FaUndo style={styles.buttonIcon} />
                Cancelar
              </button>
              
              <div style={styles.saveButtonContainer}>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={loading || !formData.nombre || !formData.fecha}
                  title={!formData.nombre || !formData.fecha ? 'Complete los campos requeridos' : ''}
                >
                  {loading ? (
                    <>
                      <div style={styles.smallSpinner}></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FaSave style={styles.buttonIcon} />
                      {menu ? 'Actualizar Menú' : 'Crear Menú'}
                    </>
                  )}
                </button>
                
                {(!formData.nombre || !formData.fecha) && (
                  <div style={styles.requiredFieldsHint}>
                    * Complete los campos requeridos
                  </div>
                )}
              </div>
            </div>
            
            <div style={styles.footerStatus}>
              <div style={styles.statusIndicator}>
                <div style={styles.statusDot}></div>
                <span style={styles.statusText}>
                  {selectedProductos.length > 0 
                    ? `${selectedProductos.length} productos seleccionados` 
                    : 'Sin productos seleccionados'}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const colors = {
  primary: '#2c5aa0',
  primaryLight: '#3a6bc5',
  primaryDark: '#1e3a8a',
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  danger: '#dc2626',
  dangerLight: '#ef4444',
  info: '#3b82f6',
  background: '#f8fafc',
  card: '#ffffff',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    light: '#9ca3af'
  }
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
    padding: '20px',
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s ease-in'
  },
  
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: '16px',
    width: '95%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out'
  },
  
  modalHeader: {
    padding: '24px 32px',
    borderBottom: `2px solid ${colors.borderLight}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  
  headerIcon: {
    fontSize: '32px',
    color: colors.primary,
    backgroundColor: '#f0f7ff',
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px'
  },
  
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    lineHeight: 1.2
  },
  
  modalSubtitle: {
    fontSize: '14px',
    color: colors.text.secondary,
    margin: '4px 0 0 0'
  },
  
  closeButton: {
    backgroundColor: 'transparent',
    border: `2px solid ${colors.border}`,
    color: colors.text.secondary,
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    transition: 'all 0.2s ease'
  },
  
  modalBody: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  
  sectionIcon: {
    color: colors.primary,
    fontSize: '16px'
  },
  
  productCountContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  
  productCountBadge: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  
  required: {
    color: colors.danger,
    fontWeight: '700'
  },
  
  input: {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    outline: 'none',
    backgroundColor: colors.card,
    color: colors.text.primary
  },
  
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '100px',
    transition: 'all 0.2s ease',
    outline: 'none',
    backgroundColor: colors.card,
    color: colors.text.primary
  },
  
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  },
  
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: colors.primary
  },
  
  checkboxText: {
    fontSize: '15px',
    fontWeight: '600',
    color: colors.text.primary
  },
  
  helperText: {
    fontSize: '13px',
    color: colors.text.secondary,
    marginLeft: '32px',
    lineHeight: 1.4
  },
  
  selectedProductsSection: {
    backgroundColor: colors.background,
    borderRadius: '12px',
    padding: '24px',
    border: `2px solid ${colors.border}`,
    marginBottom: '24px'
  },
  
  subsectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: '16px'
  },
  
  emptySelectedProducts: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: colors.borderLight,
    borderRadius: '10px',
    border: `2px dashed ${colors.border}`
  },
  
  emptySelectedIcon: {
    fontSize: '48px',
    color: colors.text.light,
    marginBottom: '16px',
    opacity: 0.5
  },
  
  emptySelectedText: {
    fontSize: '16px',
    fontWeight: '600',
    color: colors.text.secondary,
    margin: '0 0 8px 0'
  },
  
  emptySelectedHint: {
    fontSize: '14px',
    color: colors.text.light,
    margin: 0
  },
  
  selectedProductsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  
  selectedProductCard: {
    backgroundColor: colors.card,
    border: `2px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.2s ease'
  },
  
  selectedProductHeader: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px'
  },
  
  selectedProductImage: {
    width: '80px',
    height: '80px',
    flexShrink: 0,
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: colors.borderLight
  },
  
  selectedProductImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  
  selectedProductPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text.light,
    fontSize: '24px'
  },
  
  selectedProductInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  selectedProductNameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  
  selectedProductName: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    flex: 1
  },
  
  selectedProductOriginalPrice: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.primary,
    whiteSpace: 'nowrap'
  },
  
  selectedProductDescripcion: {
    fontSize: '14px',
    color: colors.text.secondary,
    margin: 0,
    lineHeight: 1.5
  },
  
  selectedProductActions: {
    display: 'grid',
    gridTemplateColumns: '150px 1fr 48px',
    gap: '16px',
    alignItems: 'flex-end'
  },
  
  availabilityContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  availabilityLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: colors.text.secondary
  },
  
  toggleButton: {
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    color: '#ffffff'
  },
  
  toggleIcon: {
    fontSize: '18px'
  },
  
  toggleText: {
    fontSize: '14px',
    fontWeight: '600'
  },
  
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  priceLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: colors.text.secondary
  },
  
  precioEspecialInput: {
    padding: '10px 14px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    backgroundColor: colors.card,
    color: colors.text.primary
  },
  
  priceComparison: {
    display: 'flex',
    gap: '12px',
    fontSize: '12px',
    marginTop: '4px'
  },
  
  originalPrice: {
    color: colors.text.light,
    textDecoration: 'line-through'
  },
  
  specialPrice: {
    color: colors.success,
    fontWeight: '600'
  },
  
  removeSelectedButton: {
    backgroundColor: '#fee2e2',
    color: colors.danger,
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    width: '48px',
    height: '48px'
  },
  
  searchContainer: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '16px'
  },
  
  searchBox: {
    position: 'relative'
  },
  
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.text.light,
    fontSize: '16px',
    pointerEvents: 'none'
  },
  
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
    backgroundColor: colors.card,
    color: colors.text.primary
  },
  
  filterBox: {
    display: 'flex'
  },
  
  categorySelect: {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '15px',
    backgroundColor: colors.card,
    cursor: 'pointer',
    fontFamily: 'inherit',
    outline: 'none',
    color: colors.text.primary
  },
  
  availableProductsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  
  availableProductsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  loadingProducts: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    gap: '16px'
  },
  
  spinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${colors.border}`,
    borderTopColor: colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  smallSpinner: {
    width: '16px',
    height: '16px',
    border: `2px solid rgba(255, 255, 255, 0.3)`,
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  
  loadingText: {
    fontSize: '15px',
    color: colors.text.secondary,
    fontWeight: '500'
  },
  
  emptyProducts: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: '12px',
    border: `2px dashed ${colors.border}`
  },
  
  emptyProductsIcon: {
    fontSize: '48px',
    color: colors.text.light,
    marginBottom: '16px',
    opacity: 0.5
  },
  
  emptyProductsText: {
    fontSize: '15px',
    color: colors.text.secondary,
    margin: '0 0 20px 0'
  },
  
  clearFiltersButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '8px 4px'
  },
  
  productCard: {
    border: `2px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: colors.card,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  
  productCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f0f7ff',
    boxShadow: '0 4px 12px rgba(44, 90, 160, 0.15)'
  },
  
  disabledCard: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  
  productCardContent: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  
  productImage: {
    width: '80px',
    height: '80px',
    flexShrink: 0,
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: colors.borderLight
  },
  
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  
  productPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text.light,
    fontSize: '24px'
  },
  
  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  
  productHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '4px'
  },
  
  productName: {
    fontSize: '15px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    flex: 1,
    lineHeight: 1.3
  },
  
  productPrice: {
    fontSize: '15px',
    fontWeight: '700',
    color: colors.primary,
    whiteSpace: 'nowrap'
  },
  
  productDescripcion: {
    fontSize: '13px',
    color: colors.text.secondary,
    margin: 0,
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  
  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    gap: '8px'
  },
  
  productCategory: {
    fontSize: '11px',
    fontWeight: '600',
    color: colors.text.light,
    backgroundColor: colors.borderLight,
    padding: '4px 10px',
    borderRadius: '12px'
  },
  
  selectedBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: colors.success,
    backgroundColor: '#10b98120',
    padding: '4px 10px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  
  productAction: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  
  selectButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '100px'
  },
  
  deselectButton: {
    backgroundColor: colors.dangerLight,
    color: '#ffffff'
  },
  
  // Modal Footer
  modalFooter: {
    padding: '24px 32px',
    borderTop: `2px solid ${colors.borderLight}`,
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  
  footerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px'
  },
  
  cancelButton: {
    backgroundColor: 'transparent',
    border: `2px solid ${colors.border}`,
    color: colors.text.primary,
    padding: '12px 24px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  
  saveButtonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px'
  },
  
  submitButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(44, 90, 160, 0.3)'
  },
  
  buttonIcon: {
    fontSize: '16px'
  },
  
  requiredFieldsHint: {
    fontSize: '12px',
    color: colors.danger,
    fontWeight: '500'
  },
  
  footerStatus: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '8px',
    borderTop: `1px solid ${colors.borderLight}`
  },
  
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  statusDot: {
    width: '8px',
    height: '8px',
    //backgroundColor: selectedProductos.length > 0 ? colors.success : colors.text.light,
    borderRadius: '50%'
  },
  
  statusText: {
    fontSize: '13px',
    color: colors.text.secondary,
    fontWeight: '500'
  }
};

// Agregar animaciones CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { 
        transform: translateY(20px);
        opacity: 0;
      }
      to { 
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    /* Focus styles */
    input:focus, 
    textarea:focus, 
    select:focus {
      border-color: ${colors.primary} !important;
      box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.15) !important;
    }
    
    /* Button states */
    button:not(:disabled) {
      cursor: pointer;
    }
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Hover effects */
    button:not(:disabled):hover {
      transform: translateY(-1px);
      opacity: 0.9;
    }
    
    .close-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: ${colors.danger};
    }
    
    .cancel-button:hover:not(:disabled) {
      background-color: ${colors.borderLight};
      border-color: ${colors.text.secondary};
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: ${colors.primaryLight};
      box-shadow: 0 6px 16px rgba(44, 90, 160, 0.4);
    }
    
    .toggle-button:hover:not(:disabled) {
      opacity: 0.8;
    }
    
    .remove-button:hover:not(:disabled) {
      background-color: #fecaca;
      transform: scale(1.05);
    }
    
    .select-button:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    /* Scrollbar styling */
    *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    *::-webkit-scrollbar-track {
      background: ${colors.borderLight};
      border-radius: 4px;
    }
    
    *::-webkit-scrollbar-thumb {
      background: ${colors.border};
      border-radius: 4px;
    }
    
    *::-webkit-scrollbar-thumb:hover {
      background: ${colors.text.light};
    }
    
    /* Product card hover */
    .product-card:hover:not(.disabled-card) {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      border-color: ${colors.primaryLight};
    }
    
    /* Checkbox hover */
    .checkbox-label:hover:not(:has(input:disabled)) {
      background-color: rgba(0, 0, 0, 0.02);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ModalMenu;