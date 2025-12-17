// src/pages/CategoriasPage.jsx
import React, { useState } from 'react';
import { useCategorias } from '../Hooks/useCategarias';
import { ToastContainer, useToast } from '../components/Toast/Toast';
import { 
  FaTags, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
  FaCheckCircle, FaTimesCircle, FaBox, FaSync, FaTimes,
  FaExclamationTriangle, FaSpinner, FaInfoCircle
} from 'react-icons/fa';

const CategoriasPage = () => {
  const hookData = useCategorias();
  
  console.log('🔍 CategoriasPage - Hook completo:', Object.keys(hookData));
  console.log('🔍 CategoriasPage - eliminarCategoria:', {
    exists: 'eliminarCategoria' in hookData,
    type: typeof hookData.eliminarCategoria,
    isFunction: typeof hookData.eliminarCategoria === 'function'
  });
  
  if (!('eliminarCategoria' in hookData)) {
    console.error('❌ ERROR CRÍTICO: eliminarCategoria no está en el hook');
    console.log('📋 Propiedades disponibles:', Object.keys(hookData));
  }
  
  if (typeof hookData.eliminarCategoria !== 'function') {
    console.error('❌ ERROR: eliminarCategoria no es una función');
    console.log('🔧 Tipo:', typeof hookData.eliminarCategoria);
  }
  
  const {
    categorias,
    loading,
    error,
    estadisticas,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    cargarCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    cambiarEstadoCategoria
  } = hookData;

  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  const showConfirmDialog = (title, message, onConfirm, type = 'danger') => {
    console.log('📋 Mostrando diálogo de confirmación:', title);
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  const closeConfirmDialog = () => {
    console.log('📋 Cerrando diálogo de confirmación');
    setConfirmModal({
      show: false,
      title: '',
      message: '',
      onConfirm: null,
      type: 'danger'
    });
  };

  const handleOpenModal = (categoria = null) => {
    console.log('📝 Abriendo modal para:', categoria ? `editar ${categoria.nombre}` : 'crear nueva');
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || '',
        activo: categoria.activo !== false && categoria.activo !== 0 && categoria.activo !== 'false'
      });
    } else {
      setEditingCategoria(null);
      setFormData({
        nombre: '',
        descripcion: '',
        activo: true
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('📝 Cerrando modal');
    setModalOpen(false);
    setEditingCategoria(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 Enviando formulario:', formData);
    
    if (!formData.nombre.trim()) {
      toast.warning('El nombre de la categoría es requerido');
      return;
    }

    try {
      let result;
      if (editingCategoria) {
        console.log('📤 Actualizando categoría:', editingCategoria.id, formData);
        result = await actualizarCategoria(editingCategoria.id, formData);
      } else {
        console.log('📤 Creando nueva categoría:', formData);
        result = await crearCategoria(formData);
      }
      
      console.log('📤 Resultado de la operación:', result);
      
      if (result.success) {
        toast.success(result.mensaje || 'Operación exitosa');
        handleCloseModal();
      } else {
        toast.error(result.error || 'Error en la operación');
      }
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      toast.error('Error al procesar la solicitud');
    }
  };

  const handleToggleEstado = async (id, estado, nombre) => {
    console.log('🔄 Cambiando estado de categoría:', { id, estado, nombre });
    
    if (typeof cambiarEstadoCategoria !== 'function') {
      console.error('❌ cambiarEstadoCategoria no es una función');
      toast.error('Error interno: función no disponible');
      return;
    }
    
    showConfirmDialog(
      estado ? 'Desactivar categoría' : 'Activar categoría',
      estado 
        ? `¿Deseas desactivar la categoría "${nombre}"?`
        : `¿Deseas activar la categoría "${nombre}"?`,
      async () => {
        console.log('✅ Confirmado cambio de estado para:', { id, estado, nombre });
        try {
          const result = await cambiarEstadoCategoria(id, !estado);
          console.log('✅ Resultado del cambio de estado:', result);
          if (result.success) {
            toast.success(result.mensaje || 'Estado cambiado correctamente');
          } else {
            toast.error(result.error || 'Error al cambiar estado');
          }
        } catch (error) {
          console.error('❌ Error en handleToggleEstado:', error);
          toast.error('Error al cambiar el estado');
        }
        closeConfirmDialog();
      },
      estado ? 'warning' : 'success'
    );
  };

  const handleDeleteClick = (categoria) => {
    console.log('🗑️ Intentando eliminar categoría:', categoria);
    
    if (typeof eliminarCategoria !== 'function') {
      console.error('❌ ERROR CRÍTICO: eliminarCategoria no es una función');
      toast.error('Error interno: función de eliminación no disponible');
      return;
    }
    
    if ((categoria.total_productos || 0) > 0) {
      toast.warning('No se puede eliminar una categoría con productos asociados');
      return;
    }

    showConfirmDialog(
      'Eliminar categoría',
      `¿Estás seguro de que deseas eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`,
      async () => {
        console.log('✅ Confirmada eliminación de:', categoria);
        try {
          const result = await eliminarCategoria(categoria.id);
          console.log('✅ Resultado de eliminación:', result);
          if (result.success) {
            toast.success(result.mensaje || 'Categoría eliminada correctamente');
          } else {
            toast.error(result.error || 'Error al eliminar');
          }
        } catch (error) {
          console.error('❌ Error en handleDeleteClick:', error);
          toast.error('Error al eliminar la categoría');
        }
        closeConfirmDialog();
      },
      'danger'
    );
  };

  const handleClearFilters = () => {
    console.log('🧹 Limpiando filtros');
    setBusqueda('');
    setFiltroEstado('todos');
    toast.info('Filtros limpiados');
  };

  const handleRefresh = async () => {
    console.log('🔄 Refrescando categorías');
    try {
      await cargarCategorias();
      toast.success('Categorías actualizadas');
    } catch (error) {
      console.error('❌ Error al refrescar:', error);
      toast.error('Error al actualizar categorías');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>
          <FaSpinner style={styles.spinnerIcon} />
        </div>
        <p style={styles.loadingText}>Cargando categorías...</p>
        <p style={styles.loadingSubtext}>Espere un momento por favor</p>
      </div>
    );
  }

  // Mostrar error si no se pueden cargar las categorías
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FaExclamationTriangle style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error al cargar categorías</h3>
        <p style={styles.errorText}>{error}</p>
        <div style={styles.errorButtons}>
          <button onClick={cargarCategorias} style={styles.retryButton}>
            <FaSync />
            Reintentar
          </button>
          <button onClick={() => window.location.reload()} style={styles.reloadButton}>
            Recargar página
          </button>
        </div>
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
            <FaTags />
          </div>
          <div>
            <h1 style={styles.title}>Gestión de Categorías</h1>
            <p style={styles.subtitle}>Administra las categorías de productos</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} style={styles.addButton}>
          <FaPlus /> Nueva Categoría
        </button>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsContainer}>
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, backgroundColor: '#f0f7ff', borderColor: '#2c5aa0'}}>
            <div style={styles.statIcon}>
              <FaTags style={{color: '#2c5aa0'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{estadisticas?.total || 0}</span>
              <span style={styles.statName}>Total Categorías</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#d1fae5', borderColor: '#10b981'}}>
            <div style={styles.statIcon}>
              <FaCheckCircle style={{color: '#10b981'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{estadisticas?.activas || 0}</span>
              <span style={styles.statName}>Activas</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#fee2e2', borderColor: '#dc2626'}}>
            <div style={styles.statIcon}>
              <FaTimesCircle style={{color: '#dc2626'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{estadisticas?.inactivas || 0}</span>
              <span style={styles.statName}>Inactivas</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#fef3c7', borderColor: '#f59e0b'}}>
            <div style={styles.statIcon}>
              <FaBox style={{color: '#f59e0b'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{estadisticas?.totalProductos || 0}</span>
              <span style={styles.statName}>Total Productos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>
            <FaFilter style={styles.filtersIcon} />
            Filtros
          </h3>
          <span style={styles.resultsCount}>
            {categorias.length} categorías
          </span>
        </div>
        
        <div style={styles.filtersContent}>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="todos">Todos los estados</option>
            <option value="activas">Solo activas</option>
            <option value="inactivas">Solo inactivas</option>
          </select>
          
          <button onClick={handleClearFilters} style={styles.clearButton}>
            Limpiar filtros
          </button>
          
          <button onClick={handleRefresh} style={styles.refreshButton}>
            <FaSync /> Actualizar
          </button>
        </div>
      </div>

      {/* Tabla de categorías */}
      <div style={styles.tableContainer}>
        {categorias.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <FaTags />
            </div>
            <h3 style={styles.emptyTitle}>
              {busqueda || filtroEstado !== 'todos' 
                ? 'No se encontraron categorías' 
                : 'No hay categorías registradas'
              }
            </h3>
            <p style={styles.emptyText}>
              {busqueda 
                ? `No hay categorías que coincidan con "${busqueda}"`
                : filtroEstado !== 'todos'
                ? `No hay categorías ${filtroEstado === 'activas' ? 'activas' : 'inactivas'}`
                : 'Comienza creando tu primera categoría de productos'
              }
            </p>
            {(busqueda || filtroEstado !== 'todos') ? (
              <button onClick={handleClearFilters} style={styles.addButton}>
                <FaSync /> Limpiar búsqueda
              </button>
            ) : (
              <button onClick={() => handleOpenModal()} style={styles.addButton}>
                <FaPlus /> Crear Primera Categoría
              </button>
            )}
          </div>
        ) : (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Nombre</th>
                  <th style={styles.tableHeader}>Descripción</th>
                  <th style={styles.tableHeader}>Estado</th>
                  <th style={styles.tableHeader}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map(categoria => {
                  const esActiva = categoria.activo === true || categoria.activo === 1 || categoria.activo === 'true';
                  const tieneProductos = (categoria.total_productos || 0) > 0;
                  
                  return (
                    <tr key={categoria.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <strong>{categoria.nombre}</strong>
                      </td>
                      <td style={styles.tableCell}>
                        {categoria.descripcion || 'Sin descripción'}
                      </td>
                      
                      <td style={styles.tableCell}>
                        <button
                          onClick={() => handleToggleEstado(
                            categoria.id, 
                            esActiva,
                            categoria.nombre
                          )}
                          style={{
                            ...styles.statusButton,
                            backgroundColor: esActiva ? '#d1fae5' : '#fee2e2',
                            color: esActiva ? '#065f46' : '#991b1b'
                          }}
                          title={esActiva ? 'Clic para desactivar' : 'Clic para activar'}
                        >
                          {esActiva 
                            ? <><FaCheckCircle /> Activa</>
                            : <><FaTimesCircle /> Inactiva</>
                          }
                        </button>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleOpenModal(categoria)}
                            style={styles.editButton}
                            title="Editar categoría"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(categoria)}
                            style={{
                              ...styles.deleteButton,
                              opacity: tieneProductos ? 0.5 : 1,
                              cursor: tieneProductos ? 'not-allowed' : 'pointer'
                            }}
                            title={tieneProductos ? 'No se puede eliminar con productos asociados' : 'Eliminar categoría'}
                            disabled={tieneProductos}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Footer de la tabla */}
            <div style={styles.tableFooter}>
              <span style={styles.tableFooterText}>
                Mostrando {categorias.length} de {hookData.categoriasOriginales?.length || 0} categorías
              </span>
            </div>
          </>
        )}
      </div>

      {/* Modal para crear/editar */}
      {modalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={handleCloseModal} style={styles.closeButton}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    style={styles.input}
                    required
                    placeholder="Nombre de la categoría"
                    autoFocus
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    style={styles.textarea}
                    placeholder="Descripción opcional"
                    rows="3"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Estado</label>
                  <select
                    value={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}
                    style={styles.select}
                  >
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
                </div>
                
                {/* Información adicional para edición */}
                {editingCategoria && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Información</label>
                    <div style={styles.infoBox}>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>ID:</span>
                        <span style={styles.infoValue}>{editingCategoria.id}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Productos asociados:</span>
                        <span style={styles.infoValue}>{editingCategoria.total_productos || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} style={styles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" style={styles.saveButton}>
                  {editingCategoria ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
          icon: <FaExclamationTriangle />
        };
      case 'warning':
        return {
          color: '#f59e0b',
          buttonBg: '#f59e0b',
          icon: <FaExclamationTriangle />
        };
      case 'success':
        return {
          color: '#10b981',
          buttonBg: '#10b981',
          icon: <FaCheckCircle />
        };
      default:
        return {
          color: '#3b82f6',
          buttonBg: '#3b82f6',
          icon: <FaInfoCircle />
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div style={confirmStyles.overlay} onClick={onCancel}>
      <div style={confirmStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={confirmStyles.header}>
          <div style={{...confirmStyles.iconContainer, backgroundColor: typeStyles.color + '20'}}>
            {typeStyles.icon}
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
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'modalSlideIn 0.3s ease-out'
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
    justifyContent: 'center',
    fontSize: '32px'
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
  danger: '#dc2626',
  warning: '#f59e0b',
  info: '#3b82f6',
  background: '#f8fafc',
  card: '#ffffff',
  border: '#e5e7eb',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    light: '#9ca3af'
  },
  debug: '#8b5cf6'
};

const styles = {
  container: {
    padding: '32px',
    backgroundColor: colors.background,
    minHeight: '100vh',
    position: 'relative'
  },
  
  debugInfo: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: colors.debug + '20',
    color: colors.debug,
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: `1px solid ${colors.debug}30`
  },
  
  debugIcon: {
    fontSize: '12px'
  },
  
  debugText: {
    fontWeight: '600'
  },
  
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
    margin: '0 0 4px 0'
  },
  
  subtitle: {
    fontSize: '16px',
    color: colors.text.secondary,
    margin: 0
  },
  
  addButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  
  statsContainer: {
    marginBottom: '32px'
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  
  searchBox: {
    position: 'relative',
    flex: 1,
    minWidth: '200px'
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
    padding: '12px 16px 12px 48px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  
  filterSelect: {
    padding: '12px 16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: colors.card,
    minWidth: '160px',
    cursor: 'pointer',
    outline: 'none'
  },
  
  clearButton: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: `2px solid ${colors.border}`,
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  
  refreshButton: {
    backgroundColor: colors.success,
    color: '#ffffff',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  
  tableContainer: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '32px'
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px'
  },
  
  tableHeader: {
    padding: '16px',
    textAlign: 'left',
    borderBottom: `2px solid ${colors.border}`,
    backgroundColor: '#f9fafb',
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: '14px'
  },
  
  tableRow: {
    borderBottom: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease'
  },
  
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: colors.text.secondary
  },
  
  productCount: {
    backgroundColor: '#f3f4f6',
    color: colors.text.secondary,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },
  
  statusButton: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
  },
  
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  
  editButton: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  
  deleteButton: {
    backgroundColor: '#fee2e2',
    color: colors.danger,
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  
  tableFooter: {
    padding: '16px',
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: '#f9fafb',
    textAlign: 'center'
  },
  
  tableFooterText: {
    fontSize: '13px',
    color: colors.text.secondary,
    fontWeight: '500'
  },
  
  emptyState: {
    padding: '80px 32px',
    textAlign: 'center'
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
    margin: '0 0 32px 0',
    lineHeight: '1.6',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  
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
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'spin 1.5s linear infinite'
  },
  
  spinnerIcon: {
    fontSize: '48px',
    color: colors.primary
  },
  
  loadingText: {
    fontSize: '18px',
    color: colors.text.primary,
    fontWeight: '600'
  },
  
  loadingSubtext: {
    fontSize: '14px',
    color: colors.text.secondary
  },
  
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
    fontSize: '72px',
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
    margin: '0 0 32px 0',
    maxWidth: '500px',
    backgroundColor: '#fee2e2',
    padding: '16px',
    borderRadius: '8px',
    borderLeft: `4px solid ${colors.danger}`
  },
  
  errorButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center'
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  
  reloadButton: {
    backgroundColor: colors.border,
    color: colors.text.primary,
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s ease-out'
  },
  
  modal: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'modalSlideIn 0.3s ease-out'
  },
  
  modalHeader: {
    padding: '24px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text.primary
  },
  
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: colors.text.secondary,
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  
  modalBody: {
    padding: '24px',
    maxHeight: '60vh',
    overflowY: 'auto'
  },
  
  formGroup: {
    marginBottom: '20px'
  },
  
  formLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: colors.text.primary,
    fontSize: '14px'
  },
  
  input: {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  
  select: {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: colors.card,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  
  infoBox: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`
  },
  
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '13px'
  },
  
  infoLabel: {
    color: colors.text.secondary,
    fontWeight: '500'
  },
  
  infoValue: {
    color: colors.text.primary,
    fontWeight: '600'
  },
  
  modalActions: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    borderTop: `1px solid ${colors.border}`
  },
  
  cancelButton: {
    backgroundColor: 'transparent',
    color: colors.text.secondary,
    border: `2px solid ${colors.border}`,
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  
  saveButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
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
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-1px);
      opacity: 0.9;
    }
    
    tr:hover {
      background-color: #f9fafb;
    }
    
    input:focus, textarea:focus, select:focus {
      border-color: ${colors.primary} !important;
      box-shadow: 0 0 0 3px ${colors.primary}20 !important;
    }
    
    .addButton:hover {
      background-color: ${colors.primaryLight} !important;
    }
    
    .refreshButton:hover {
      background-color: #0da271 !important;
    }
    
    .editButton:hover {
      background-color: #bfdbfe !important;
    }
    
    .deleteButton:hover:not(:disabled) {
      background-color: #fecaca !important;
    }
  `;
  if (!document.getElementById('categorias-animations')) {
    styleSheet.id = 'categorias-animations';
    document.head.appendChild(styleSheet);
  }
}

export default CategoriasPage;