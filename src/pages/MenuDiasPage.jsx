// src/pages/MenuDiasPage.jsx (CORREGIDO)
import React, { useState, useEffect } from 'react';
import { useMenuDias } from '../hooks/useMenuDias';
import ModalMenu from '../components/MenuDias/MenuDiasModal';
import { 
  FaCalendarAlt, FaPlus, FaUtensils, FaCalendarDay, 
  FaCalendarWeek, FaChartBar, FaExclamationTriangle, 
  FaEdit, FaCopy, FaTrash, FaFilter 
} from 'react-icons/fa';

const MenuDiasPage = () => {
  const { 
    menus, 
    productosDisponibles,
    loading, 
    error,
    crearMenu,
    actualizarMenu,
    eliminarMenu,
    getProductosMenu,
    copiarMenu
  } = useMenuDias();

  const [viewMode, setViewMode] = useState('todos');
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menuProductos, setMenuProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('todos');

  const menusArray = Array.isArray(menus) ? menus : [];

  useEffect(() => {
    if (selectedMenu) {
      loadProductosMenu(selectedMenu.id);
    }
  }, [selectedMenu]);

  const loadProductosMenu = async (menuId) => {
    setLoadingProductos(true);
    const result = await getProductosMenu(menuId);
    if (result.success) {
      setMenuProductos(Array.isArray(result.data) ? result.data : []);
    } else {
      alert(`Error al cargar productos: ${result.error}`);
      setMenuProductos([]);
    }
    setLoadingProductos(false);
  };

  // CORREGIDO: Cargar productos antes de abrir modal de edición
  const handleOpenModal = async (menu = null) => {
    if (menu) {
      setLoadingProductos(true);
      const result = await getProductosMenu(menu.id);
      
      if (result.success) {
        const productosFormateados = result.data.map(p => ({
          id: p.producto_id,
          nombre: p.producto_info?.nombre,
          precio: p.producto_info?.precio,
          disponible: p.disponible !== false,
          precio_especial: p.precio_especial,
          imagen: p.producto_info?.imagen,
          descripcion: p.producto_info?.descripcion,
          categoria_id: p.producto_info?.categoria_id,
          categoria_nombre: p.producto_info?.categoria_nombre
        }));
        
        setMenuToEdit({ 
          ...menu, 
          productos: productosFormateados 
        });
      } else {
        setMenuToEdit(menu);
      }
      setLoadingProductos(false);
    } else {
      setMenuToEdit(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setMenuToEdit(null);
  };

  const handleSubmitMenu = async (menuData) => {
    try {
      let result;
      
      if (menuToEdit) {
        result = await actualizarMenu(menuToEdit.id, menuData);
        if (result.success) {
          alert('✅ Menú actualizado exitosamente');
          if (selectedMenu?.id === menuToEdit.id) {
            await loadProductosMenu(menuToEdit.id);
          }
        } else {
          alert(`❌ ${result.error}`);
          return;
        }
      } else {
        result = await crearMenu(menuData);
        if (result.success) {
          alert('✅ Menú creado exitosamente');
        } else {
          alert(`❌ ${result.error}`);
          return;
        }
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al procesar el menú');
    }
  };

  const handleDeleteClick = (menu) => {
    setMenuToDelete(menu);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (menuToDelete) {
      const result = await eliminarMenu(menuToDelete.id);
      if (result.success) {
        alert('✅ Menú eliminado exitosamente');
        if (selectedMenu?.id === menuToDelete.id) {
          setSelectedMenu(null);
        }
      } else {
        alert(`❌ ${result.error}`);
      }
    }
    setShowDeleteConfirm(false);
    setMenuToDelete(null);
  };

  // CORREGIDO: Validar fecha duplicada
  const handleCopyMenu = async (menu) => {
    const nombreCopia = prompt('Ingrese el nombre para la copia:', `${menu.nombre} - Copia`);
    if (!nombreCopia) return;

    const fechaCopia = prompt('Ingrese la fecha para la copia (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!fechaCopia) return;

    // Validar fecha duplicada
    const menuExistente = menusArray.find(m => m.fecha === fechaCopia);
    if (menuExistente) {
      const confirmar = window.confirm(`⚠️ Ya existe un menú para la fecha ${fechaCopia}. ¿Desea continuar de todas formas?`);
      if (!confirmar) return;
    }

    const result = await copiarMenu(menu.id, {
      nombre: nombreCopia,
      fecha: fechaCopia
    });

    if (result.success) {
      alert('✅ Menú copiado exitosamente');
    } else {
      alert(`❌ ${result.error}`);
    }
  };

  const filtrarMenus = () => {
    let menusFiltrados = menusArray;

    switch(viewMode) {
      case 'hoy':
        menusFiltrados = menusFiltrados.filter(menu => esHoy(menu.fecha));
        break;
      case 'proximos':
        menusFiltrados = menusFiltrados.filter(menu => esFuturo(menu.fecha));
        break;
    }

    if (searchTerm) {
      menusFiltrados = menusFiltrados.filter(menu => 
        menu.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterActivo !== 'todos') {
      const activo = filterActivo === 'activos';
      menusFiltrados = menusFiltrados.filter(menu => menu.activo === activo);
    }

    return menusFiltrados;
  };

  const esHoy = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      const hoy = new Date();
      return fecha.getFullYear() === hoy.getFullYear() &&
             fecha.getMonth() === hoy.getMonth() &&
             fecha.getDate() === hoy.getDate();
    } catch (error) {
      return false;
    }
  };

  const esFuturo = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fecha.setHours(0, 0, 0, 0);
      return fecha > hoy;
    } catch (error) {
      return false;
    }
  };

  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return fechaString;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Cargando menús...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FaExclamationTriangle style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error al cargar</h3>
        <p style={styles.errorText}>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.retryButton}>
          Reintentar
        </button>
      </div>
    );
  }

  const menusFiltrados = filtrarMenus();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <FaCalendarAlt />
          </div>
          <div>
            <h1 style={styles.title}>Menús del Día</h1>
            <p style={styles.subtitle}>Gestiona y organiza los menús diarios del restaurante</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} style={styles.crearButton}>
          <FaPlus />
          Crear Nuevo Menú
        </button>
      </div>

      <div style={styles.filtersContainer}>
        <div style={styles.filters}>
          <button 
            onClick={() => {
              setViewMode('todos');
              setSelectedMenu(null);
            }}
            style={{
              ...styles.filterButton,
              ...(viewMode === 'todos' ? styles.filterButtonActive : {})
            }}
          >
            <FaCalendarAlt />
            <span>Todos los Menús</span>
            <span style={styles.filterBadge}>{menusArray.length}</span>
          </button>
          
          <button 
            onClick={() => {
              setViewMode('hoy');
              setSelectedMenu(null);
            }}
            style={{
              ...styles.filterButton,
              ...(viewMode === 'hoy' ? styles.filterButtonActive : {})
            }}
          >
            <FaCalendarDay />
            <span>Menú de Hoy</span>
            <span style={styles.filterBadge}>
              {menusArray.filter(m => esHoy(m.fecha)).length}
            </span>
          </button>
          
          <button 
            onClick={() => {
              setViewMode('proximos');
              setSelectedMenu(null);
            }}
            style={{
              ...styles.filterButton,
              ...(viewMode === 'proximos' ? styles.filterButtonActive : {})
            }}
          >
            <FaCalendarWeek />
            <span>Próximos Menús</span>
            <span style={styles.filterBadge}>
              {menusArray.filter(m => esFuturo(m.fecha)).length}
            </span>
          </button>
        </div>

        <div style={styles.searchAndFilter}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar menús..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <select
            value={filterActivo}
            onChange={(e) => setFilterActivo(e.target.value)}
            style={styles.statusFilter}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.menusList}>
          <div style={styles.listHeader}>
            <h3 style={styles.listTitle}>
              {viewMode === 'todos' && '📋 Todos los Menús'}
              {viewMode === 'hoy' && '📅 Menú de Hoy'}
              {viewMode === 'proximos' && '🗓️ Menús Próximos'}
            </h3>
            <span style={styles.countBadge}>
              {menusFiltrados.length} {menusFiltrados.length === 1 ? 'menú' : 'menús'}
            </span>
          </div>
          
          {menusFiltrados.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <FaUtensils />
              </div>
              <h3 style={styles.emptyTitle}>
                {viewMode === 'hoy' && '¡No hay menú para hoy!'}
                {viewMode === 'proximos' && 'No hay menús programados'}
                {viewMode === 'todos' && 'No hay menús registrados'}
              </h3>
              <p style={styles.emptyText}>
                {viewMode === 'hoy' && 'Crea un menú para el día de hoy y comienza a recibir pedidos.'}
                {viewMode === 'proximos' && 'Programa menús futuros para mantener tu oferta actualizada.'}
                {viewMode === 'todos' && 'Comienza creando tu primer menú del día.'}
              </p>
              <button onClick={() => handleOpenModal()} style={styles.emptyButton}>
                <FaPlus />
                Crear Menú
              </button>
            </div>
          ) : (
            <div style={styles.menusGrid}>
              {menusFiltrados.map((menu, index) => {
                const isToday = esHoy(menu.fecha);
                
                return (
                  <div 
                    key={menu.id || `menu-${index}`}
                    onClick={() => setSelectedMenu(menu)}
                    style={{
                      ...styles.menuCard,
                      ...(selectedMenu?.id === menu.id ? styles.menuCardSelected : {})
                    }}
                  >
                    {isToday && (
                      <div style={styles.todayBadge}>
                        ⭐ HOY
                      </div>
                    )}
                    
                    <div style={styles.menuCardHeader}>
                      <div style={styles.menuFecha}>
                        📅 {menu.fecha ? formatFecha(menu.fecha) : 'Fecha no disponible'}
                      </div>
                      <div style={{
                        ...styles.menuEstado,
                        backgroundColor: menu.activo ? '#10b981' : '#6b7280'
                      }}>
                        {menu.activo ? '✓ Activo' : '✕ Inactivo'}
                      </div>
                    </div>
                    
                    <div style={styles.menuCardBody}>
                      <h4 style={styles.menuNombre}>{menu.nombre || 'Menú sin nombre'}</h4>
                      <p style={styles.menuDescripcion}>
                        {menu.descripcion || 'Sin descripción disponible'}
                      </p>
                      
                      <div style={styles.menuStats}>
                        <div style={styles.statItem}>
                          <FaUtensils style={styles.statIcon} />
                          <span>{menu.total_productos || 0} productos</span>
                        </div>
                        <div style={styles.statItem}>
                          <FaChartBar style={styles.statIcon} />
                          <span>${parseFloat(menu.total_ventas || 0).toFixed(2)} ventas</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.menuCardFooter}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(menu);
                        }}
                        style={styles.actionButton}
                        title="Editar menú"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyMenu(menu);
                        }}
                        style={styles.actionButton}
                        title="Copiar menú"
                      >
                        <FaCopy />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(menu);
                        }}
                        style={{...styles.actionButton, color: '#dc2626'}}
                        title="Eliminar menú"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedMenu ? (
          <div style={styles.detailPanel}>
            <div style={styles.detailHeader}>
              <div>
                <h3 style={styles.detailTitle}>{selectedMenu.nombre || 'Menú'}</h3>
                <p style={styles.detailSubtitle}>
                  {selectedMenu.fecha ? formatFecha(selectedMenu.fecha) : 'Fecha no disponible'}
                </p>
              </div>
              <div style={styles.detailActions}>
                <button 
                  onClick={() => handleOpenModal(selectedMenu)}
                  style={styles.editButton}
                >
                  <FaEdit />
                  Editar
                </button>
                <button 
                  onClick={() => handleDeleteClick(selectedMenu)}
                  style={styles.deleteButton}
                >
                  <FaTrash />
                  Eliminar
                </button>
              </div>
            </div>

            <div style={styles.detailBody}>
              {loadingProductos ? (
                <div style={styles.loadingProducts}>
                  <div style={styles.spinner} />
                  <p>Cargando productos...</p>
                </div>
              ) : (
                <>
                  <div style={styles.infoSection}>
                    <h4 style={styles.sectionTitle}>📊 Información General</h4>
                    <div style={styles.infoGrid}>
                      <div style={styles.infoCard}>
                        <div style={styles.infoIcon}>📝</div>
                        <div>
                          <div style={styles.infoLabel}>Descripción</div>
                          <div style={styles.infoValue}>
                            {selectedMenu.descripcion || 'Sin descripción'}
                          </div>
                        </div>
                      </div>
                      
                      <div style={styles.infoCard}>
                        <div style={{
                          ...styles.infoIcon,
                          backgroundColor: selectedMenu.activo ? '#10b98120' : '#6b728020',
                          color: selectedMenu.activo ? '#10b981' : '#6b7280'
                        }}>
                          {selectedMenu.activo ? '✓' : '✕'}
                        </div>
                        <div>
                          <div style={styles.infoLabel}>Estado</div>
                          <div style={{
                            ...styles.infoValue,
                            color: selectedMenu.activo ? '#10b981' : '#6b7280',
                            fontWeight: '700'
                          }}>
                            {selectedMenu.activo ? 'Activo' : 'Inactivo'}
                          </div>
                        </div>
                      </div>
                      
                      <div style={styles.infoCard}>
                        <div style={styles.infoIcon}>🍽️</div>
                        <div>
                          <div style={styles.infoLabel}>Total Productos</div>
                          <div style={styles.infoValue}>
                            {selectedMenu.total_productos || 0} productos
                          </div>
                        </div>
                      </div>
                      
                      <div style={styles.infoCard}>
                        <div style={styles.infoIcon}>💰</div>
                        <div>
                          <div style={styles.infoLabel}>Total Ventas</div>
                          <div style={styles.infoValue}>
                            ${parseFloat(selectedMenu.total_ventas || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.productsSection}>
                    <div style={styles.productsSectionHeader}>
                      <h4 style={styles.sectionTitle}>
                        🍽️ Productos del Menú
                      </h4>
                      <button
                        onClick={() => handleOpenModal(selectedMenu)}
                        style={styles.addProductButton}
                      >
                        <FaPlus />
                        Editar Productos
                      </button>
                    </div>
                    
                    {menuProductos.length === 0 ? (
                      <div style={styles.emptyProducts}>
                        <div style={styles.emptyProductsIcon}>
                          <FaUtensils />
                        </div>
                        <p style={styles.emptyProductsText}>
                          No hay productos en este menú
                        </p>
                        <button 
                          onClick={() => handleOpenModal(selectedMenu)}
                          style={styles.addProductButton}
                        >
                          <FaPlus />
                          Agregar Productos
                        </button>
                      </div>
                    ) : (
                      <div style={styles.productsList}>
                        {menuProductos.map((producto, index) => (
                          <div key={producto.id || `producto-${index}`} style={styles.productItem}>
                            <div style={styles.productImage}>
                              {producto.producto_info?.imagen ? (
                                <img 
                                  src={producto.producto_info.imagen} 
                                  alt={producto.producto_info.nombre}
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
                                <h5 style={styles.productName}>
                                  {producto.producto_info?.nombre || 'Producto sin nombre'}
                                </h5>
                                <div style={{
                                  ...styles.disponibleBadge,
                                  backgroundColor: producto.disponible !== false ? '#10b98120' : '#6b728020',
                                  color: producto.disponible !== false ? '#10b981' : '#6b7280'
                                }}>
                                  {producto.disponible !== false ? '✓ Disponible' : '✕ No disponible'}
                                </div>
                              </div>
                              
                              <p style={styles.productDescripcion}>
                                {producto.producto_info?.descripcion || 'Sin descripción'}
                              </p>
                              
                              <div style={styles.productFooter}>
                                <span style={styles.productPrice}>
                                  💵 ${parseFloat(producto.precio_especial || producto.producto_info?.precio || 0).toFixed(2)}
                                </span>
                                <span style={styles.productCategoria}>
                                  {producto.producto_info?.categoria_nombre || 'Sin categoría'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.noSelectionPanel}>
            <div style={styles.noSelectionIcon}>
              <FaCalendarAlt />
            </div>
            <h3 style={styles.noSelectionTitle}>Selecciona un menú</h3>
            <p style={styles.noSelectionText}>
              Haz clic en cualquier menú de la lista para ver sus detalles y productos
            </p>
            <button 
              onClick={() => handleOpenModal()} 
              style={styles.emptyButton}
            >
              <FaPlus />
              Crear tu primer menú
            </button>
          </div>
        )}
      </div>

      <ModalMenu
        isOpen={modalOpen}
        onClose={handleCloseModal}
        menu={menuToEdit}
        onSubmit={handleSubmitMenu}
        productosDisponibles={productosDisponibles}
        loading={loading || loadingProductos}
      />

      {showDeleteConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmModal}>
            <h3 style={styles.confirmTitle}>¿Eliminar menú?</h3>
            <p style={styles.confirmText}>
              ¿Estás seguro de que deseas eliminar el menú "{menuToDelete?.nombre}"?
              Esta acción no se puede deshacer.
            </p>
            <div style={styles.confirmActions}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                style={styles.confirmCancel}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                style={styles.confirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const colors = {
  primary: '#2c5aa0',
  primaryLight: '#3a6bc5',
  primaryDark: '#1e3a8a',
  background: '#f8fafc',
  card: '#ffffff',
  border: '#e5e7eb',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    light: '#9ca3af'
  }
};

const styles = {
  // Container principal
  container: {
    padding: '24px',
    backgroundColor: colors.background,
    minHeight: '100vh'
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    backgroundColor: colors.card,
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: `${colors.primary}15`,
    color: colors.primary,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: colors.text.secondary,
    margin: '4px 0 0 0'
  },
  crearButton: {
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
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(44, 90, 160, 0.2)'
  },

  // Filtros
  filtersContainer: {
    backgroundColor: colors.card,
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  filters: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  filterButton: {
    backgroundColor: 'transparent',
    border: `2px solid ${colors.border}`,
    color: colors.text.secondary,
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: '#ffffff'
  },
  filterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '700'
  },
  searchAndFilter: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px'
  },
  searchContainer: {
    flex: 1
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  statusFilter: {
    padding: '10px 14px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: colors.card,
    minWidth: '160px',
    cursor: 'pointer',
    outline: 'none'
  },

  // Contenido principal
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '24px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr'
    }
  },

  // Lista de menús
  menusList: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${colors.border}`
  },
  listTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0
  },
  countBadge: {
    backgroundColor: `${colors.primary}15`,
    color: colors.primary,
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600'
  },

  // Grid de menús
  menusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  menuCard: {
    position: 'relative',
    border: `2px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: colors.card
  },
  menuCardSelected: {
    borderColor: colors.primary,
    boxShadow: '0 4px 12px rgba(44, 90, 160, 0.15)',
    transform: 'translateY(-2px)'
  },
  todayBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: colors.warning,
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  menuCardHeader: {
    marginBottom: '12px'
  },
  menuFecha: {
    fontSize: '12px',
    color: colors.text.secondary,
    marginBottom: '8px'
  },
  menuEstado: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#ffffff'
  },
  menuCardBody: {
    marginBottom: '16px'
  },
  menuNombre: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 8px 0'
  },
  menuDescripcion: {
    fontSize: '13px',
    color: colors.text.secondary,
    margin: '0 0 12px 0',
    lineHeight: '1.5',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },
  menuStats: {
    display: 'flex',
    gap: '16px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: colors.text.secondary
  },
  statIcon: {
    color: colors.primary,
    fontSize: '14px'
  },
  menuCardFooter: {
    display: 'flex',
    gap: '8px',
    paddingTop: '12px',
    borderTop: `1px solid ${colors.border}`
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.text.secondary,
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },

  // Estado vacío
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '64px',
    color: colors.text.light,
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 8px 0'
  },
  emptyText: {
    fontSize: '14px',
    color: colors.text.secondary,
    margin: '0 0 24px 0',
    lineHeight: '1.6'
  },
  emptyButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },

  // Panel de detalle
  detailPanel: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 200px)',
    position: 'sticky',
    top: '24px'
  },
  detailHeader: {
    padding: '24px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  detailTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 4px 0'
  },
  detailSubtitle: {
    fontSize: '13px',
    color: colors.text.secondary,
    margin: 0
  },
  detailActions: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  deleteButton: {
    backgroundColor: colors.danger,
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  detailBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  },

  // Sección de información
  infoSection: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 16px 0'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  infoCard: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: colors.background,
    borderRadius: '8px',
    border: `1px solid ${colors.border}`
  },
  infoIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: `${colors.primary}15`,
    color: colors.primary,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0
  },
  infoLabel: {
    fontSize: '12px',
    color: colors.text.secondary,
    marginBottom: '4px'
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text.primary
  },

  // Sección de productos
  productsSection: {
    marginTop: '24px'
  },
  productsSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  addProductButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
  },
  emptyProducts: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: colors.background,
    borderRadius: '8px',
    border: `1px dashed ${colors.border}`
  },
  emptyProductsIcon: {
    fontSize: '48px',
    color: colors.text.light,
    marginBottom: '12px'
  },
  emptyProductsText: {
    fontSize: '14px',
    color: colors.text.secondary,
    margin: '0 0 16px 0'
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  productItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    backgroundColor: colors.background,
    borderRadius: '8px',
    border: `1px solid ${colors.border}`
  },
  productImage: {
    width: '80px',
    height: '80px',
    flexShrink: 0
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '6px'
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text.light,
    fontSize: '24px'
  },
  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  productHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  productName: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0
  },
  disponibleBadge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600'
  },
  productDescripcion: {
    fontSize: '12px',
    color: colors.text.secondary,
    margin: '0 0 8px 0',
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },
  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto'
  },
  productPrice: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.primary
  },
  productCategoria: {
    fontSize: '11px',
    color: colors.text.light,
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '6px'
  },

  // Panel sin selección
  noSelectionPanel: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
    textAlign: 'center'
  },
  noSelectionIcon: {
    fontSize: '64px',
    color: colors.text.light,
    marginBottom: '16px'
  },
  noSelectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 8px 0'
  },
  noSelectionText: {
    fontSize: '14px',
    color: colors.text.secondary,
    margin: '0 0 24px 0',
    lineHeight: '1.6',
    maxWidth: '300px'
  },

  // Loading y errores
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `4px solid ${colors.border}`,
    borderTopColor: colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '14px',
    color: colors.text.secondary
  },
  loadingProducts: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '12px'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px',
    padding: '40px'
  },
  errorIcon: {
    fontSize: '48px',
    color: colors.danger
  },
  errorTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0
  },
  errorText: {
    fontSize: '14px',
    color: colors.text.secondary,
    textAlign: 'center',
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
    marginTop: '8px'
  },

  // Modal de confirmación
  confirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001
  },
  confirmModal: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  confirmTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 12px 0'
  },
  confirmText: {
    fontSize: '14px',
    color: colors.text.secondary,
    margin: '0 0 24px 0',
    lineHeight: '1.5'
  },
  confirmActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  confirmCancel: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.text.primary,
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  confirmDelete: {
    backgroundColor: colors.danger,
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};


export default MenuDiasPage;