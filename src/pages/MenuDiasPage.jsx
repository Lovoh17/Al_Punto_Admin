// src/pages/MenuDiasPage.jsx (CON SISTEMA DE NOTIFICACIONES COMPLETO)
import React, { useState, useEffect, useMemo } from 'react';
import { useMenuDias } from '../hooks/useMenuDias';
import ModalMenu from '../components/MenuDias/MenuDiasModal';
import { ToastContainer, useToast } from '../components/Toast/Toast';
import { 
  FaCalendarAlt, FaPlus, FaUtensils, FaCalendarDay, 
  FaCalendarWeek, FaChartBar, FaExclamationTriangle, 
  FaEdit, FaCopy, FaTrash, FaFilter, FaSearch,
  FaTimes, FaCheck, FaInfoCircle
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

  const toast = useToast();

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
    try {
      const result = await getProductosMenu(menuId);
      if (result.success) {
        setMenuProductos(Array.isArray(result.data) ? result.data : []);
      } else {
        toast.error(`Error al cargar productos: ${result.error}`);
        setMenuProductos([]);
      }
    } catch (error) {
      toast.error(error+'Error al cargar productos del menú');
      setMenuProductos([]);
    } finally {
      setLoadingProductos(false);
    }
  };

  const handleOpenModal = async (menu = null) => {
    if (menu) {
      setLoadingProductos(true);
      try {
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
          toast.warning('No se pudieron cargar todos los productos del menú');
        }
      } catch (error) {
      console.log(error)
        setMenuToEdit(menu);
        toast.error('Error al cargar productos del menú');
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
      const isEditing = !!menuToEdit;
      
      if (isEditing) {
        result = await actualizarMenu(menuToEdit.id, menuData);
        if (result.success) {
          toast.success('✅ Menú actualizado exitosamente');
          if (selectedMenu?.id === menuToEdit.id) {
            await loadProductosMenu(menuToEdit.id);
          }
        } else {
          toast.error(`❌ ${result.error || 'Error al actualizar el menú'}`);
          return;
        }
      } else {
        result = await crearMenu(menuData);
        if (result.success) {
          toast.success('✅ Menú creado exitosamente');
        } else {
          toast.error(`❌ ${result.error || 'Error al crear el menú'}`);
          return;
        }
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error al procesar el menú');
    }
  };

  const handleDeleteClick = (menu) => {
    setMenuToDelete(menu);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (menuToDelete) {
      try {
        const result = await eliminarMenu(menuToDelete.id);
        if (result.success) {
          toast.success('✅ Menú eliminado exitosamente');
          if (selectedMenu?.id === menuToDelete.id) {
            setSelectedMenu(null);
          }
        } else {
          toast.error(`❌ ${result.error || 'Error al eliminar el menú'}`);
        }
      } catch (error) {
      console.log(error)
        toast.error('❌ Error al eliminar el menú');
      }
    }
    setShowDeleteConfirm(false);
    setMenuToDelete(null);
  };

  const handleCopyMenu = async (menu) => {
    try {
      const nombreCopia = prompt('Ingrese el nombre para la copia:', `${menu.nombre} - Copia`);
      if (!nombreCopia) {
        toast.info('Operación de copia cancelada');
        return;
      }

      const fechaCopia = prompt('Ingrese la fecha para la copia (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
      if (!fechaCopia) {
        toast.info('Operación de copia cancelada');
        return;
      }

      // Validar formato de fecha
      if (!isValidDate(fechaCopia)) {
        toast.error('Formato de fecha inválido. Use YYYY-MM-DD');
        return;
      }

      // Validar fecha duplicada
      const menuExistente = menusArray.find(m => m.fecha === fechaCopia);
      if (menuExistente) {
        const confirmar = window.confirm(`⚠️ Ya existe un menú para la fecha ${fechaCopia}. ¿Desea continuar de todas formas?`);
        if (!confirmar) {
          toast.warning('Operación de copia cancelada');
          return;
        }
      }

      const result = await copiarMenu(menu.id, {
        nombre: nombreCopia,
        fecha: fechaCopia
      });

      if (result.success) {
        toast.success('✅ Menú copiado exitosamente');
      } else {
        toast.error(`❌ ${result.error || 'Error al copiar el menú'}`);
      }
    } catch (error) {
      toast.error(error+ '❌ Error al copiar el menú');
    }
  };

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  const esHoy = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      const hoy = new Date();
      return fecha.getFullYear() === hoy.getFullYear() &&
             fecha.getMonth() === hoy.getMonth() &&
             fecha.getDate() === hoy.getDate();
    } catch (error) {
      console.log(error)
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
      console.log(error)
      return false;
    }
  };

  const esPasado = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fecha.setHours(0, 0, 0, 0);
      return fecha < hoy;
    } catch (error) {
      console.log(error)
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
        console.log(error);
      return fechaString;
    }
  };

  // Filtrar menús usando useMemo para optimización
  const menusFiltrados = useMemo(() => {
    let filtered = menusArray;

    switch(viewMode) {
      case 'hoy':
        filtered = filtered.filter(menu => esHoy(menu.fecha));
        break;
      case 'proximos':
        filtered = filtered.filter(menu => esFuturo(menu.fecha));
        break;
      case 'pasados':
        filtered = filtered.filter(menu => esPasado(menu.fecha));
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter(menu => 
        menu.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterActivo !== 'todos') {
      const activo = filterActivo === 'activos';
      filtered = filtered.filter(menu => menu.activo === activo);
    }

    return filtered;
  }, [menusArray, viewMode, searchTerm, filterActivo]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = menusArray.length;
    const activos = menusArray.filter(m => m.activo).length;
    const hoy = menusArray.filter(m => esHoy(m.fecha)).length;
    const futuros = menusArray.filter(m => esFuturo(m.fecha)).length;
    const pasados = menusArray.filter(m => esPasado(m.fecha)).length;
    
    return { total, activos, hoy, futuros, pasados };
  }, [menusArray]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterActivo('todos');
    setViewMode('todos');
    toast.info('Filtros limpiados');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Cargando menús del día...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <FaExclamationTriangle style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error al cargar menús</h3>
        <p style={styles.errorText}>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.retryButton}>
          <FaTimes />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sistema de notificaciones Toast */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Header */}
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
        <div style={styles.headerStats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Total Menús</span>
            <span style={styles.statValue}>{stats.total}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Activos</span>
            <span style={styles.statValue}>{stats.activos}</span>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div style={styles.statsContainer}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <FaCalendarAlt />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.total}</span>
              <span style={styles.statName}>Total Menús</span>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <FaCalendarDay />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.hoy}</span>
              <span style={styles.statName}>Para Hoy</span>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <FaCalendarWeek />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.futuros}</span>
              <span style={styles.statName}>Próximos</span>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <FaCheck />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.activos}</span>
              <span style={styles.statName}>Activos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>
            <FaFilter style={styles.filtersIcon} />
            Filtros y Búsqueda
          </h3>
          <span style={styles.resultsCount}>
            {menusFiltrados.length} de {menusArray.length} menús
          </span>
        </div>
        
        <div style={styles.filtersContent}>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar menús por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={styles.clearSearchButton}
                title="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}
          </div>
          
          <div style={styles.filtersRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Vista</label>
              <div style={styles.viewButtons}>
                <button
                  onClick={() => {
                    setViewMode('todos');
                    setSelectedMenu(null);
                  }}
                  style={{
                    ...styles.viewButton,
                    ...(viewMode === 'todos' ? styles.viewButtonActive : {})
                  }}
                  title="Ver todos los menús"
                >
                  <FaCalendarAlt />
                  Todos
                </button>
                <button
                  onClick={() => {
                    setViewMode('hoy');
                    setSelectedMenu(null);
                  }}
                  style={{
                    ...styles.viewButton,
                    ...(viewMode === 'hoy' ? styles.viewButtonActive : {})
                  }}
                  title="Ver menú de hoy"
                >
                  <FaCalendarDay />
                  Hoy
                </button>
                <button
                  onClick={() => {
                    setViewMode('proximos');
                    setSelectedMenu(null);
                  }}
                  style={{
                    ...styles.viewButton,
                    ...(viewMode === 'proximos' ? styles.viewButtonActive : {})
                  }}
                  title="Ver menús próximos"
                >
                  <FaCalendarWeek />
                  Próximos
                </button>
                <button
                  onClick={() => {
                    setViewMode('pasados');
                    setSelectedMenu(null);
                  }}
                  style={{
                    ...styles.viewButton,
                    ...(viewMode === 'pasados' ? styles.viewButtonActive : {})
                  }}
                  title="Ver menús pasados"
                >
                  <FaCalendarAlt />
                  Pasados
                </button>
              </div>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Estado</label>
              <select
                value={filterActivo}
                onChange={(e) => setFilterActivo(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Solo activos</option>
                <option value="inactivos">Solo inactivos</option>
              </select>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Acciones</label>
              <div style={styles.actionsGroup}>
                <button
                  onClick={clearFilters}
                  style={styles.actionButton}
                  title="Limpiar todos los filtros"
                  disabled={!searchTerm && filterActivo === 'todos' && viewMode === 'todos'}
                >
                  <FaTimes />
                  <span>Limpiar</span>
                </button>
                <button
                  onClick={() => handleOpenModal()}
                  style={styles.createButton}
                  title="Crear nuevo menú"
                >
                  <FaPlus />
                  <span>Nuevo Menú</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={styles.mainContent}>
        {/* Lista de menús */}
        <div style={styles.menusList}>
          <div style={styles.listHeader}>
            <h3 style={styles.listTitle}>
              {viewMode === 'todos' && '📋 Todos los Menús'}
              {viewMode === 'hoy' && '📅 Menú de Hoy'}
              {viewMode === 'proximos' && '🗓️ Menús Próximos'}
              {viewMode === 'pasados' && '📅 Menús Pasados'}
            </h3>
            <div style={styles.listActions}>
              <span style={styles.countBadge}>
                {menusFiltrados.length} {menusFiltrados.length === 1 ? 'menú' : 'menús'}
              </span>
              <button
                onClick={() => handleOpenModal()}
                style={styles.createButtonSmall}
                title="Crear nuevo menú"
              >
                <FaPlus />
              </button>
            </div>
          </div>
          
          {menusFiltrados.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <FaUtensils />
              </div>
              <h3 style={styles.emptyTitle}>
                {viewMode === 'hoy' && '¡No hay menú para hoy!'}
                {viewMode === 'proximos' && 'No hay menús programados'}
                {viewMode === 'pasados' && 'No hay menús pasados'}
                {viewMode === 'todos' && 'No hay menús registrados'}
              </h3>
              <p style={styles.emptyText}>
                {viewMode === 'hoy' && 'Crea un menú para el día de hoy y comienza a recibir pedidos.'}
                {viewMode === 'proximos' && 'Programa menús futuros para mantener tu oferta actualizada.'}
                {viewMode === 'pasados' && 'No hay menús anteriores registrados.'}
                {viewMode === 'todos' && 'Comienza creando tu primer menú del día.'}
              </p>
              {(searchTerm || filterActivo !== 'todos' || viewMode !== 'todos') && (
                <button onClick={clearFilters} style={styles.clearFiltersButton}>
                  Limpiar filtros
                </button>
              )}
              <button onClick={() => handleOpenModal()} style={styles.emptyButton}>
                <FaPlus />
                Crear Menú
              </button>
            </div>
          ) : (
            <div style={styles.menusGrid}>
              {menusFiltrados.map((menu) => {
                const isToday = esHoy(menu.fecha);
                const isFuture = esFuturo(menu.fecha);
                const isPast = esPasado(menu.fecha);
                
                return (
                  <div 
                    key={menu.id}
                    onClick={() => setSelectedMenu(menu)}
                    style={{
                      ...styles.menuCard,
                      ...(selectedMenu?.id === menu.id ? styles.menuCardSelected : {}),
                      ...(isToday ? styles.menuCardToday : {}),
                      ...(isFuture ? styles.menuCardFuture : {}),
                      ...(isPast ? styles.menuCardPast : {})
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
                        backgroundColor: menu.activo ? colors.success : colors.text.light
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
                        style={styles.actionButtonSmall}
                        title="Editar menú"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyMenu(menu);
                        }}
                        style={styles.actionButtonSmall}
                        title="Copiar menú"
                      >
                        <FaCopy />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(menu);
                        }}
                        style={{...styles.actionButtonSmall, color: colors.danger}}
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

        {/* Panel de detalle */}
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
                  onClick={() => handleCopyMenu(selectedMenu)}
                  style={styles.copyButton}
                  title="Copiar menú"
                >
                  <FaCopy />
                  Copiar
                </button>
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
                  <p>Cargando productos del menú...</p>
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
                          backgroundColor: selectedMenu.activo ? colors.success + '20' : colors.text.light + '20',
                          color: selectedMenu.activo ? colors.success : colors.text.light
                        }}>
                          {selectedMenu.activo ? '✓' : '✕'}
                        </div>
                        <div>
                          <div style={styles.infoLabel}>Estado</div>
                          <div style={{
                            ...styles.infoValue,
                            color: selectedMenu.activo ? colors.success : colors.text.light,
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
                        <span style={styles.productsCount}>
                          ({menuProductos.length})
                        </span>
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
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `
                                      <div style="${styles.productPlaceholder}">
                                        <FaUtensils />
                                      </div>
                                    `;
                                  }}
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
                                  backgroundColor: producto.disponible !== false ? colors.success + '20' : colors.text.light + '20',
                                  color: producto.disponible !== false ? colors.success : colors.text.light
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
                                  {producto.precio_especial && producto.precio_especial !== producto.producto_info?.precio && (
                                    <span style={styles.originalPrice}>
                                      ${parseFloat(producto.producto_info?.precio || 0).toFixed(2)}
                                    </span>
                                  )}
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

      {/* Modal de menú */}
      <ModalMenu
        isOpen={modalOpen}
        onClose={handleCloseModal}
        menu={menuToEdit}
        onSubmit={handleSubmitMenu}
        productosDisponibles={productosDisponibles}
        loading={loading || loadingProductos}
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmModal}>
            <div style={styles.confirmHeader}>
              <div style={styles.confirmIcon}>
                <FaExclamationTriangle />
              </div>
              <h3 style={styles.confirmTitle}>¿Eliminar menú?</h3>
            </div>
            <p style={styles.confirmText}>
              ¿Estás seguro de que deseas eliminar el menú <strong>"{menuToDelete?.nombre}"</strong>?
              <br />
              Esta acción no se puede deshacer.
            </p>
            <div style={styles.confirmActions}>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  toast.info('Eliminación cancelada');
                }}
                style={styles.confirmCancel}
              >
                <FaTimes />
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                style={styles.confirmDelete}
              >
                <FaTrash />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inyectar estilos CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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
        
        button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .menu-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

const colors = {
  primary: '#2c5aa0',
  primaryLight: '#3a6bc5',
  primaryDark: '#1e3a8a',
  secondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
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
    padding: '24px',
    backgroundColor: colors.background,
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  headerIcon: {
    width: '56px',
    height: '56px',
    backgroundColor: `${colors.primary}15`,
    color: colors.primary,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    boxShadow: '0 2px 8px rgba(44, 90, 160, 0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    lineHeight: '1.2'
  },
  subtitle: {
    fontSize: '14px',
    color: colors.text.secondary,
    margin: '4px 0 0 0'
  },
  headerStats: {
    display: 'flex',
    gap: '20px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  statLabel: {
    fontSize: '12px',
    color: colors.text.secondary,
    marginBottom: '4px',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.primary
  },

  // Estadísticas
  statsContainer: {
    marginBottom: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px'
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: colors.primary + '10',
    color: colors.primary,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  statContent: {
    flex: 1
  },
  statCount: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.text.primary,
    display: 'block',
    lineHeight: '1.2'
  },
  statName: {
    fontSize: '13px',
    color: colors.text.secondary,
    fontWeight: '600'
  },

  // Filtros
  filtersContainer: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  filtersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  filtersTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filtersIcon: {
    color: colors.primary
  },
  resultsCount: {
    backgroundColor: colors.primary + '10',
    color: colors.primary,
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },
  filtersContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  searchBox: {
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.text.light,
    fontSize: '14px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px',
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: colors.background,
    color: colors.text.primary,
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  clearSearchButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.text.light,
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px'
  },
  filtersRow: {
    display: 'flex',
    gap: '20px',
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
    fontSize: '13px',
    fontWeight: '600',
    color: colors.text.primary
  },
  viewButtons: {
    display: 'flex',
    gap: '8px'
  },
  viewButton: {
    flex: 1,
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    color: colors.text.secondary,
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    minWidth: '80px'
  },
  viewButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: '#ffffff'
  },
  filterSelect: {
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: colors.card,
    color: colors.text.primary,
    cursor: 'pointer',
    outline: 'none'
  },
  actionsGroup: {
    display: 'flex',
    gap: '8px'
  },
  actionButton: {
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    color: colors.text.secondary,
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
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
    boxShadow: '0 2px 4px rgba(44, 90, 160, 0.2)'
  },
  createButtonSmall: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    transition: 'all 0.2s ease'
  },

  // Contenido principal
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '24px',
    '@media (max-width: 1200px)': {
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
    marginBottom: '20px'
  },
  listTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  listActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  countBadge: {
    backgroundColor: colors.primary + '10',
    color: colors.primary,
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },

  // Grid de menús
  menusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px'
  },
  menuCard: {
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  menuCardSelected: {
    borderColor: colors.primary,
    boxShadow: '0 4px 12px rgba(44, 90, 160, 0.15)',
    backgroundColor: colors.primary + '05'
  },
  menuCardToday: {
    borderLeft: `4px solid ${colors.warning}`
  },
  menuCardFuture: {
    borderLeft: `4px solid ${colors.success}`
  },
  menuCardPast: {
    borderLeft: `4px solid ${colors.text.light}`
  },
  todayBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: colors.warning,
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  menuCardHeader: {
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  menuFecha: {
    fontSize: '12px',
    color: colors.text.secondary,
    fontWeight: '500'
  },
  menuEstado: {
    padding: '4px 8px',
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
    margin: '0 0 8px 0',
    lineHeight: '1.3'
  },
  menuDescripcion: {
    fontSize: '13px',
    color: colors.text.secondary,
    margin: '0 0 12px 0',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  menuStats: {
    display: 'flex',
    gap: '16px'
  },
  
  menuCardFooter: {
    display: 'flex',
    gap: '8px',
    paddingTop: '12px',
    borderTop: `1px solid ${colors.border}`
  },
  actionButtonSmall: {
    flex: 1,
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
    color: colors.text.secondary,
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },

  // Panel de detalle
  detailPanel: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 300px)',
    minHeight: '500px',
    position: 'sticky',
    top: '24px'
  },
  detailHeader: {
    padding: '20px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  detailTitle: {
    fontSize: '18px',
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
  copyButton: {
    backgroundColor: colors.info,
    color: '#ffffff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  editButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '8px 12px',
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
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  detailBody: {
    padding: '20px',
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
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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
    backgroundColor: colors.primary + '10',
    color: colors.primary,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0
  },
  infoLabel: {
    fontSize: '12px',
    color: colors.text.secondary,
    marginBottom: '4px',
    fontWeight: '500'
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
  productsCount: {
    fontSize: '14px',
    color: colors.text.secondary,
    fontWeight: '400',
    marginLeft: '8px'
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
    margin: 0,
    flex: 1
  },
  disponibleBadge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    flexShrink: 0,
    marginLeft: '8px'
  },
  productDescripcion: {
    fontSize: '12px',
    color: colors.text.secondary,
    margin: '0 0 8px 0',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
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
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  originalPrice: {
    fontSize: '12px',
    color: colors.text.light,
    textDecoration: 'line-through'
  },
  productCategoria: {
    fontSize: '11px',
    color: colors.text.light,
    backgroundColor: colors.background,
    padding: '4px 8px',
    borderRadius: '6px'
  },

  // Estados vacíos
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '64px',
    color: colors.text.light,
    marginBottom: '16px',
    opacity: 0.5
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
    lineHeight: '1.6',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  clearFiltersButton: {
    backgroundColor: colors.text.secondary,
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '12px'
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
    textAlign: 'center',
    height: 'calc(100vh - 300px)',
    minHeight: '500px'
  },
  noSelectionIcon: {
    fontSize: '64px',
    color: colors.text.light,
    marginBottom: '16px',
    opacity: 0.5
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
    minHeight: '100vh',
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
    color: colors.text.secondary,
    fontWeight: '500'
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
    minHeight: '100vh',
    gap: '16px',
    padding: '40px',
    textAlign: 'center'
  },
  errorIcon: {
    fontSize: '48px',
    color: colors.danger,
    marginBottom: '8px'
  },
  errorTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 8px 0'
  },
  errorText: {
    fontSize: '14px',
    color: colors.text.secondary,
    maxWidth: '400px',
    lineHeight: '1.6'
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
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
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
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s ease-out'
  },
  confirmModal: {
    backgroundColor: colors.card,
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'fadeIn 0.3s ease-out'
  },
  confirmHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  confirmIcon: {
    width: '60px',
    height: '60px',
    backgroundColor: colors.danger + '20',
    color: colors.danger,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px'
  },
  confirmTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    textAlign: 'center'
  },
  confirmText: {
    fontSize: '14px',
    color: colors.text.secondary,
    lineHeight: '1.6',
    marginBottom: '24px',
    textAlign: 'center'
  },
  confirmActions: {
    display: 'flex',
    gap: '12px'
  },
  confirmCancel: {
    flex: 1,
    backgroundColor: colors.background,
    border: `2px solid ${colors.border}`,
    color: colors.text.primary,
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  confirmDelete: {
    flex: 1,
    backgroundColor: colors.danger,
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  }
};

export default MenuDiasPage;