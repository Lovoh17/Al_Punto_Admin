// src/pages/ProductosPage.jsx
import React, { useState, useEffect } from 'react';
import { useProductos } from '../Hooks/useProductos';
import ProductCard from '../components/Productos/ProductCard';
import ProductoModal from '../components/Productos/ProductoModal';
import { ToastContainer, useToast } from '../components/Toast/Toast';
import { 
  FaUtensils, 
  FaFilter, 
  FaSearch, 
  FaPlus, 
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaTags,
  FaBox,
  FaExclamationTriangle,
  FaSync,
  FaStore,
  FaShoppingBag
} from 'react-icons/fa';

const ProductosPage = () => {
  const { 
    productos, 
    categorias,
    loading, 
    error, 
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    toggleDisponibilidad,
    refetchCategorias
  } = useProductos();

  const toast = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroDisponible, setFiltroDisponible] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshingCategorias, setRefreshingCategorias] = useState(false);

  // Modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  // Refrescar categorías periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      refetchCategorias();
    }, 300000); // Cada 5 minutos

    return () => clearInterval(interval);
  }, [refetchCategorias]);

  const showConfirmDialog = (title, message, onConfirm, type = 'danger') => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  const closeConfirmDialog = () => {
    setConfirmModal({
      show: false,
      title: '',
      message: '',
      onConfirm: null,
      type: 'danger'
    });
  };

  const handleRefreshCategorias = async () => {
    setRefreshingCategorias(true);
    await refetchCategorias();
    setRefreshingCategorias(false);
    toast.success('Categorías actualizadas correctamente');
  };

  const handleCrearProducto = () => {
    setEditingProducto(null);
    setShowModal(true);
  };

  const handleEditarProducto = (producto) => {
    setEditingProducto(producto);
    setShowModal(true);
  };

  const handleEliminarProducto = async (id, productoNombre) => {
    showConfirmDialog(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar el producto "${productoNombre}"? Esta acción no se puede deshacer.`,
      async () => {
        const result = await eliminarProducto(id);
        if (result.success) {
          toast.success('Producto eliminado correctamente');
        } else {
          toast.error(result.error || 'Error al eliminar el producto');
        }
        closeConfirmDialog();
      },
      'danger'
    );
  };

  const handleToggleDisponibilidad = async (id, disponible, productoNombre) => {
    showConfirmDialog(
      disponible ? 'Activar producto' : 'Desactivar producto',
      disponible 
        ? `¿Deseas activar el producto "${productoNombre}"?`
        : `¿Deseas desactivar el producto "${productoNombre}"?`,
      async () => {
        const result = await toggleDisponibilidad(id, disponible);
        if (result.success) {
          toast.success(`Producto ${disponible ? 'activado' : 'desactivado'} correctamente`);
        } else {
          toast.error(result.error || 'Error al cambiar la disponibilidad');
        }
        closeConfirmDialog();
      },
      disponible ? 'success' : 'warning'
    );
  };

  const handleSaveProducto = async (productoData) => {
    const isEditing = !!editingProducto;
    
    const result = isEditing 
      ? await actualizarProducto(editingProducto.id, productoData)
      : await crearProducto(productoData);

    if (result.success) {
      toast.success(`Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`);
      setShowModal(false);
      setEditingProducto(null);
    } else {
      toast.error(result.error || `Error al ${isEditing ? 'actualizar' : 'crear'} el producto`);
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    // Filtro por categoría
    if (filtroCategoria !== 'todos') {
      const categoriaId = parseInt(filtroCategoria);
      if (producto.categoria_id !== categoriaId) {
        return false;
      }
    }
    
    // Filtro por disponibilidad
    if (filtroDisponible === 'disponible' && !producto.disponible) return false;
    if (filtroDisponible === 'no-disponible' && producto.disponible) return false;
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const categoriaNombre = categorias.find(c => c.id === producto.categoria_id)?.nombre || '';
      
      return (
        producto.nombre?.toLowerCase().includes(term) ||
        producto.descripcion?.toLowerCase().includes(term) ||
        categoriaNombre.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  // Obtener nombre de categoría para mostrar
  const getCategoriaNombre = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  // Obtener color de categoría
  const getCategoriaColor = (categoriaId) => {
    const colors = [
      '#2c5aa0', // Azul
      '#10b981', // Verde
      '#f59e0b', // Naranja
      '#8b5cf6', // Púrpura
      '#ec4899', // Rosa
      '#ef4444', // Rojo
      '#06b6d4', // Cian
      '#f97316', // Naranja oscuro
      '#84cc16', // Verde lima
      '#6366f1'  // Índigo
    ];
    
    if (!categoriaId) return colors[0];
    const index = categoriaId % colors.length;
    return colors[index];
  };

  // Estadísticas
  const stats = {
    total: productos.length,
    disponibles: productos.filter(p => p.disponible).length,
    noDisponibles: productos.filter(p => !p.disponible).length,
    destacados: productos.filter(p => p.destacado).length,
    conCategoria: productos.filter(p => p.categoria_id).length,
    sinCategoria: productos.filter(p => !p.categoria_id).length,
    precioPromedio: productos.length > 0 
      ? (productos.reduce((sum, p) => sum + (parseFloat(p.precio) || 0), 0) / productos.length).toFixed(2)
      : 0
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando productos y categorías...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FaExclamationTriangle style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error al cargar productos</h3>
        <p style={styles.errorText}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={styles.retryButton}
        >
          <FaSync />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sistema de notificaciones Toast */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Modal de confirmación */}
      {confirmModal.show && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={closeConfirmDialog}
        />
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <FaUtensils />
          </div>
          <div>
            <h1 style={styles.title}>Gestión de Productos</h1>
            <p style={styles.subtitle}>
              Administra el catálogo de productos del restaurante
            </p>
          </div>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Total Productos</span>
            <span style={styles.statValue}>{stats.total}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Categorías</span>
            <span style={styles.statValue}>{categorias.length}</span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsContainer}>
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, backgroundColor: '#f0f7ff', borderColor: '#2c5aa0'}}>
            <div style={styles.statIcon}>
              <FaBox style={{color: '#2c5aa0'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.total}</span>
              <span style={styles.statName}>Total Productos</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#d1fae5', borderColor: '#10b981'}}>
            <div style={styles.statIcon}>
              <FaCheckCircle style={{color: '#10b981'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.disponibles}</span>
              <span style={styles.statName}>Disponibles</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#fee2e2', borderColor: '#ef4444'}}>
            <div style={styles.statIcon}>
              <FaTimesCircle style={{color: '#ef4444'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.noDisponibles}</span>
              <span style={styles.statName}>No Disponibles</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#fef3c7', borderColor: '#f59e0b'}}>
            <div style={styles.statIcon}>
              <FaTags style={{color: '#f59e0b'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.conCategoria}</span>
              <span style={styles.statName}>Con Categoría</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#f3f4f6', borderColor: '#6b7280'}}>
            <div style={styles.statIcon}>
              <FaTags style={{color: '#6b7280'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.sinCategoria}</span>
              <span style={styles.statName}>Sin Categoría</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#e0f2fe', borderColor: '#0ea5e9'}}>
            <div style={styles.statIcon}>
              <FaChartBar style={{color: '#0ea5e9'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>${stats.precioPromedio}</span>
              <span style={styles.statName}>Precio Promedio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>
            <FaFilter style={styles.filtersIcon} />
            Filtros y Búsqueda
          </h3>
          <span style={styles.resultsCount}>
            {productosFiltrados.length} de {productos.length} productos
          </span>
        </div>
        
        <div style={styles.filtersContent}>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.filtersRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Categoría</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                style={styles.filterSelect}
                disabled={categorias.length === 0}
              >
                <option value="todos">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre} {cat.activo === false ? '(Inactiva)' : ''}
                  </option>
                ))}
              </select>
              {categorias.length === 0 && (
                <span style={styles.filterHint}>Cargando categorías...</span>
              )}
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Disponibilidad</label>
              <select
                value={filtroDisponible}
                onChange={(e) => setFiltroDisponible(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="todos">Todos los estados</option>
                <option value="disponible">Solo disponibles</option>
                <option value="no-disponible">Solo no disponibles</option>
              </select>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Acciones</label>
              <div style={styles.actionsGroup}>
                <button
                  onClick={handleRefreshCategorias}
                  style={styles.actionButton}
                  disabled={refreshingCategorias}
                  title="Actualizar categorías"
                >
                  <FaSync />
                  <span>Categorías</span>
                </button>
                <button
                  onClick={handleCrearProducto}
                  style={styles.createButton}
                  title="Crear nuevo producto"
                >
                  <FaPlus />
                  <span>Nuevo Producto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vista rápida de categorías */}
      {categorias.length > 0 && (
        <div style={styles.categoriasContainer}>
          <div style={styles.categoriasHeader}>
            <h3 style={styles.categoriasTitle}>
              <FaTags style={styles.categoriasIcon} />
              Categorías Disponibles
            </h3>
            <button
              onClick={handleRefreshCategorias}
              style={styles.refreshCategoriasButton}
              disabled={refreshingCategorias}
              title="Actualizar categorías"
            >
              <FaSync style={refreshingCategorias ? {animation: 'spin 1s linear infinite'} : {}} />
            </button>
          </div>
          <div style={styles.categoriasGrid}>
            {categorias.map(cat => {
              const productosEnCategoria = productos.filter(p => p.categoria_id === cat.id).length;
              const color = getCategoriaColor(cat.id);
              
              return (
                <div 
                  key={cat.id} 
                  style={{
                    ...styles.categoriaCard,
                    backgroundColor: color + '20',
                    borderColor: color,
                    cursor: 'pointer',
                    transform: filtroCategoria === cat.id.toString() ? 'scale(1.02)' : 'scale(1)'
                  }}
                  onClick={() => setFiltroCategoria(
                    filtroCategoria === cat.id.toString() ? 'todos' : cat.id.toString()
                  )}
                  title={`Ver ${productosEnCategoria} productos en ${cat.nombre}`}
                >
                  <div style={styles.categoriaHeader}>
                    <div style={styles.categoriaIcon}>
                      <FaStore style={{color: color}} />
                    </div>
                    <div style={styles.categoriaInfo}>
                      <div style={styles.categoriaName}>{cat.nombre}</div>
                      <div style={styles.categoriaCount}>
                        {productosEnCategoria} productos
                      </div>
                    </div>
                  </div>
                  <div style={styles.categoriaStatus}>
                    {cat.activo === false ? (
                      <span style={styles.categoriaInactive}>Inactiva</span>
                    ) : (
                      <span style={styles.categoriaActive}>Activa</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de productos */}
      <div style={styles.productosContainer}>
        {productosFiltrados.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <FaShoppingBag />
            </div>
            <h3 style={styles.emptyTitle}>
              {searchTerm || filtroCategoria !== 'todos' || filtroDisponible !== 'todos' 
                ? 'No se encontraron productos' 
                : 'No hay productos registrados'}
            </h3>
            <p style={styles.emptyText}>
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : filtroCategoria !== 'todos' || filtroDisponible !== 'todos'
                ? 'No hay productos con esos filtros'
                : 'Comienza creando tu primer producto'}
            </p>
            {(searchTerm || filtroCategoria !== 'todos' || filtroDisponible !== 'todos') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFiltroCategoria('todos');
                  setFiltroDisponible('todos');
                }}
                style={styles.clearFiltersButton}
              >
                Limpiar filtros
              </button>
            )}
            {!searchTerm && filtroCategoria === 'todos' && filtroDisponible === 'todos' && (
              <button onClick={handleCrearProducto} style={styles.createButton}>
                <FaPlus />
                Crear Producto
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={styles.productosHeader}>
              <div style={styles.productosInfo}>
                <h3 style={styles.productosTitle}>Productos</h3>
                <span style={styles.productosCount}>
                  Mostrando {productosFiltrados.length} productos
                  {filtroCategoria !== 'todos' && ` en "${getCategoriaNombre(parseInt(filtroCategoria))}"`}
                </span>
              </div>
              <div style={styles.productosActions}>
                <button
                  onClick={handleCrearProducto}
                  style={styles.createButton}
                  title="Crear nuevo producto"
                >
                  <FaPlus />
                  Nuevo Producto
                </button>
              </div>
            </div>
            <div style={styles.productosGrid}>
              {productosFiltrados.map(producto => (
                <ProductCard
                  key={producto.id}
                  producto={{
                    ...producto,
                    categoria_nombre: getCategoriaNombre(producto.categoria_id),
                    categoria_color: getCategoriaColor(producto.categoria_id)
                  }}
                  onEdit={handleEditarProducto}
                  onDelete={handleEliminarProducto}
                  onToggleDisponibilidad={handleToggleDisponibilidad}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ProductoModal
          producto={editingProducto}
          categorias={categorias}
          onClose={() => {
            setShowModal(false);
            setEditingProducto(null);
          }}
          onSave={handleSaveProducto}
          isEditing={!!editingProducto}
        />
      )}
    </div>
  );
};

// Componente Modal de Confirmación
const ConfirmModal = ({ title, message, type, onConfirm, onCancel }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          color: '#ef4444',
          buttonBg: '#ef4444',
          buttonHover: '#dc2626'
        };
      case 'warning':
        return {
          color: '#f59e0b',
          buttonBg: '#f59e0b',
          buttonHover: '#d97706'
        };
      case 'success':
        return {
          color: '#10b981',
          buttonBg: '#10b981',
          buttonHover: '#059669'
        };
      default:
        return {
          color: '#3b82f6',
          buttonBg: '#3b82f6',
          buttonHover: '#2563eb'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div style={confirmStyles.overlay} onClick={onCancel}>
      <div style={confirmStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={confirmStyles.header}>
          <div style={{...confirmStyles.iconContainer, backgroundColor: typeStyles.color + '20'}}>
            <FaExclamationTriangle style={{color: typeStyles.color, fontSize: '32px'}} />
          </div>
          <h3 style={confirmStyles.title}>{title}</h3>
        </div>
        <p style={confirmStyles.message}>{message}</p>
        <div style={confirmStyles.actions}>
          <button
            onClick={onCancel}
            style={confirmStyles.cancelButton}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              ...confirmStyles.confirmButton,
              backgroundColor: typeStyles.buttonBg
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const confirmStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'modalSlideIn 0.2s ease-out'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    textAlign: 'center'
  },
  message: {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '32px',
    textAlign: 'center'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1
  },
  confirmButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1
  }
};

const colors = {
  primary: '#2c5aa0',
  primaryLight: '#3a6bc5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  background: '#f8fafc',
  card: '#ffffff',
  border: '#e5e7eb',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    light: '#9ca3af'
  }
};

const styles = {
  container: {
    padding: '32px',
    backgroundColor: colors.background,
    minHeight: '100vh'
  },
  
  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  headerIcon: {
    width: '60px',
    height: '60px',
    backgroundColor: colors.primary,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    fontSize: '28px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 4px 0',
    lineHeight: '1.2'
  },
  subtitle: {
    fontSize: '16px',
    color: colors.text.secondary,
    margin: 0,
    lineHeight: '1.4'
  },
  headerStats: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  statLabel: {
    fontSize: '14px',
    color: colors.text.secondary,
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.primary
  },
  
  // Estadísticas
  statsContainer: {
    marginBottom: '32px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  statCard: {
    backgroundColor: colors.card,
    border: `2px solid`,
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statIcon: {
    width: '60px',
    height: '60px',
    backgroundColor: colors.card,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px'
  },
  statContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  statCount: {
    fontSize: '28px',
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: '1.2'
  },
  statName: {
    fontSize: '14px',
    color: colors.text.secondary,
    fontWeight: '600'
  },
  
  // Filtros
  filtersContainer: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  filtersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  filtersTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  filtersIcon: {
    color: colors.primary
  },
  resultsCount: {
    backgroundColor: colors.primary + '20',
    color: colors.primary,
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  filtersContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  searchBox: {
    position: 'relative',
    flex: 1
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.text.light,
    fontSize: '16px'
  },
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    backgroundColor: colors.card,
    color: colors.text.primary
  },
  filtersRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    minWidth: '200px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text.primary
  },
  filterSelect: {
    padding: '12px 16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    backgroundColor: colors.card,
    color: colors.text.primary,
    cursor: 'pointer',
    outline: 'none'
  },
  filterHint: {
    fontSize: '12px',
    color: colors.text.light,
    fontStyle: 'italic'
  },
  actionsGroup: {
    display: 'flex',
    gap: '12px'
  },
  actionButton: {
    backgroundColor: colors.text.secondary + '20',
    color: colors.text.secondary,
    border: `2px solid ${colors.border}`,
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    flex: 1
  },
  createButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    flex: 1
  },
  
  // Categorías
  categoriasContainer: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  categoriasHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  categoriasTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  categoriasIcon: {
    color: colors.info
  },
  refreshCategoriasButton: {
    backgroundColor: 'transparent',
    border: `2px solid ${colors.border}`,
    color: colors.text.secondary,
    padding: '8px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    transition: 'all 0.2s ease'
  },
  categoriasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px'
  },
  categoriaCard: {
    backgroundColor: colors.card,
    border: `2px solid`,
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  categoriaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  categoriaIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  categoriaInfo: {
    flex: 1
  },
  categoriaName: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: '4px'
  },
  categoriaCount: {
    fontSize: '12px',
    color: colors.text.secondary,
    fontWeight: '500'
  },
  categoriaStatus: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  categoriaActive: {
    backgroundColor: colors.success + '20',
    color: colors.success,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  categoriaInactive: {
    backgroundColor: colors.danger + '20',
    color: colors.danger,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  
  // Productos
  productosContainer: {
    marginBottom: '32px'
  },
  productosHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  productosInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  productosTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0
  },
  productosCount: {
    fontSize: '14px',
    color: colors.text.secondary,
    fontWeight: '500'
  },
  productosActions: {
    display: 'flex',
    gap: '12px'
  },
  productosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  
  // Estado vacío
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '60px 32px',
    textAlign: 'center',
    border: `2px dashed ${colors.border}`,
    marginTop: '32px'
  },
  emptyIcon: {
    fontSize: '64px',
    color: colors.text.light,
    marginBottom: '24px',
    opacity: 0.5
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 12px 0'
  },
  emptyText: {
    fontSize: '15px',
    color: colors.text.secondary,
    margin: '0 0 24px 0',
    lineHeight: '1.6',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto'
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
  
  // Loading States
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '20px',
    backgroundColor: colors.background
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: `4px solid ${colors.border}`,
    borderTopColor: colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '16px',
    color: colors.text.secondary,
    fontWeight: '500'
  },
  
  // Error State
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '20px',
    padding: '32px',
    textAlign: 'center'
  },
  errorIcon: {
    fontSize: '64px',
    color: colors.danger
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0
  },
  errorText: {
    fontSize: '16px',
    color: colors.text.secondary,
    margin: '0 0 24px 0',
    maxWidth: '400px'
  },
  retryButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};

// Inyectar animaciones
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    *::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    *::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
    
    *::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-1px);
    }
    
    .categoria-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ProductosPage;