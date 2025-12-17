// src/pages/GestionUsuarios.jsx (CON SISTEMA DE NOTIFICACIONES)
import React, { useState } from 'react';
import { useUsuarios } from '../Hooks/useUsuarios';
import { ToastContainer, useToast } from '../components/Toast/Toast'; // Importar Toast
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserShield, 
  FaUserTie, 
  FaSearch, 
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCrown,
  FaUserCircle,
  FaTimes,
  FaCheck,
  FaSync,
  FaKey
} from 'react-icons/fa';

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

const GestionUsuarios = () => {
  // Hook personalizado
  const {
    usuariosFiltrados,
    loading,
    error,
    estadisticas,
    busqueda,
    setBusqueda,
    filtroRol,
    setFiltroRol,
    filtroEstado,
    setFiltroEstado,
    cargarUsuarios,
    crearUsuario,
    actualizarUsuario,
    cambiarEstado,
    cambiarRol,
    eliminarUsuario
  } = useUsuarios();

  // Hook de Toast
  const toast = useToast();

  // Estado local para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    rol: 'cliente',
    activo: true
  });

  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Estado para confirmaciones
  const [showConfirmModal, setShowConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: null,
    usuario: null
  });

  // Mostrar modal de confirmación
  const showConfirmDialog = (title, message, onConfirm, type = 'danger', usuario = null) => {
    setShowConfirmModal({
      show: true,
      title,
      message,
      type,
      onConfirm,
      usuario
    });
  };

  // Cerrar modal de confirmación
  const closeConfirmDialog = () => {
    setShowConfirmModal({
      show: false,
      title: '',
      message: '',
      type: 'danger',
      onConfirm: null,
      usuario: null
    });
  };

  // Abrir modal para crear
  const abrirModalCrear = () => {
    setUsuarioEditar(null);
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      password: '',
      rol: 'cliente',
      activo: true
    });
    setModalAbierto(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (usuario) => {
    setUsuarioEditar(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono || '',
      password: '',
      rol: usuario.rol,
      activo: usuario.activo
    });
    setModalAbierto(true);
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('El email es requerido');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('El email no es válido');
      return false;
    }
    
    if (!usuarioEditar && !formData.password) {
      toast.error('La contraseña es requerida para nuevos usuarios');
      return false;
    }
    
    if (formData.password && formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    return true;
  };

  // Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    try {
      const resultado = usuarioEditar 
        ? await actualizarUsuario(usuarioEditar.id, formData)
        : await crearUsuario(formData);
      
      if (resultado.success) {
        toast.success(resultado.mensaje || (usuarioEditar 
          ? 'Usuario actualizado correctamente' 
          : 'Usuario creado correctamente'));
        setModalAbierto(false);
      } else {
        toast.error(resultado.error || (usuarioEditar 
          ? 'Error al actualizar el usuario' 
          : 'Error al crear el usuario'));
      }
    } catch (error) {
      console.log(error)
      toast.error('Error al procesar la solicitud');
    }
  };

  // Manejar cambio de estado
  const handleCambiarEstado = async (id, nuevoEstado, usuario) => {
    showConfirmDialog(
      nuevoEstado ? 'Activar usuario' : 'Desactivar usuario',
      nuevoEstado 
        ? `¿Deseas activar al usuario "${usuario.nombre}"?`
        : `¿Deseas desactivar al usuario "${usuario.nombre}"?`,
      async () => {
        try {
          const resultado = await cambiarEstado(id, nuevoEstado);
          
          if (resultado.success) {
            toast.success(resultado.mensaje || `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
          } else {
            toast.error(resultado.error || `Error al ${nuevoEstado ? 'activar' : 'desactivar'} el usuario`);
          }
        } catch (error) {
          console.log(error)
          toast.error('Error al cambiar el estado del usuario');
        }
        closeConfirmDialog();
      },
      nuevoEstado ? 'success' : 'warning',
      usuario
    );
  };

  // Manejar cambio de rol
  const handleCambiarRol = async (id, nuevoRol, usuario) => {
    const rolTexto = nuevoRol === 'administrador' ? 'Administrador' : 'Cliente';
    
    showConfirmDialog(
      'Cambiar rol de usuario',
      `¿Cambiar rol del usuario "${usuario.nombre}" a ${rolTexto}?`,
      async () => {
        try {
          const resultado = await cambiarRol(id, nuevoRol);
          
          if (resultado.success) {
            toast.success(resultado.mensaje || `Rol cambiado a ${rolTexto} correctamente`);
          } else {
            toast.error(resultado.error || 'Error al cambiar el rol');
          }
        } catch (error) {
          console.log(error)
          toast.error('Error al cambiar el rol del usuario');
        }
        closeConfirmDialog();
      },
      'info',
      usuario
    );
  };

  // Manejar eliminación
  const handleEliminar = async (id, usuarioNombre) => {
    showConfirmDialog(
      'Eliminar usuario',
      `¿Estás seguro de eliminar al usuario "${usuarioNombre}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          const resultado = await eliminarUsuario(id);
          
          if (resultado.success) {
            toast.success(resultado.mensaje || 'Usuario eliminado correctamente');
          } else {
            toast.error(resultado.error || 'Error al eliminar el usuario');
          }
        } catch (error) {
            console.log(error)
          toast.error('Error al eliminar el usuario');
        }
        closeConfirmDialog();
      },
      'danger'
    );
  };

  // Limpiar filtros
  const clearFilters = () => {
    setBusqueda('');
    setFiltroRol('todos');
    setFiltroEstado('todos');
    toast.info('Filtros limpiados');
  };

  // Obtener color de avatar basado en el nombre
  const getAvatarColor = (nombre) => {
    const colors = [
      '#2c5aa0', // Azul
      '#10b981', // Verde
      '#f59e0b', // Naranja
      '#8b5cf6', // Púrpura
      '#ec4899', // Rosa
      '#ef4444', // Rojo
      '#06b6d4', // Cian
      '#f97316'  // Naranja oscuro
    ];
    if (!nombre) return colors[0];
    const charCode = nombre.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Formatear fecha
  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.log(error)
      return fechaString;
    }
  };

  // Loading
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sistema de notificaciones Toast */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Modal de confirmación */}
      {showConfirmModal.show && (
        <ConfirmModal
          title={showConfirmModal.title}
          message={showConfirmModal.message}
          type={showConfirmModal.type}
          onConfirm={showConfirmModal.onConfirm}
          onCancel={closeConfirmDialog}
        />
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <FaUsers />
          </div>
          <div>
            <h1 style={styles.title}>Gestión de Usuarios</h1>
            <p style={styles.subtitle}>
              Administra y controla los usuarios del sistema
            </p>
          </div>
        </div>
        <button 
          onClick={abrirModalCrear} 
          style={styles.btnPrimary}
          title="Crear nuevo usuario"
        >
          <FaPlus />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div style={styles.statsContainer}>
          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, backgroundColor: '#f0f7ff', borderColor: colors.primary}}>
              <div style={styles.statIcon}>
                <FaUsers style={{color: colors.primary}} />
              </div>
              <div style={styles.statContent}>
                <span style={styles.statValue}>{estadisticas.total || 0}</span>
                <span style={styles.statName}>Total Usuarios</span>
              </div>
            </div>
            
            <div style={{...styles.statCard, backgroundColor: '#d1fae5', borderColor: colors.success}}>
              <div style={styles.statIcon}>
                <FaUserCheck style={{color: colors.success}} />
              </div>
              <div style={styles.statContent}>
                <span style={styles.statValue}>{estadisticas.activos || 0}</span>
                <span style={styles.statName}>Activos</span>
              </div>
            </div>
            
            <div style={{...styles.statCard, backgroundColor: '#dbeafe', borderColor: colors.info}}>
              <div style={styles.statIcon}>
                <FaUserCircle style={{color: colors.info}} />
              </div>
              <div style={styles.statContent}>
                <span style={styles.statValue}>{estadisticas.clientes || 0}</span>
                <span style={styles.statName}>Clientes</span>
              </div>
            </div>
            
            <div style={{...styles.statCard, backgroundColor: '#fef3c7', borderColor: colors.warning}}>
              <div style={styles.statIcon}>
                <FaUserShield style={{color: colors.warning}} />
              </div>
              <div style={styles.statContent}>
                <span style={styles.statValue}>{estadisticas.administradores || 0}</span>
                <span style={styles.statName}>Administradores</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>
            <FaFilter style={styles.filtersIcon} />
            Filtros y Búsqueda
          </h3>
          <div style={styles.resultsSection}>
            <span style={styles.resultsCount}>
              {usuariosFiltrados.length} usuarios encontrados
            </span>
            <button
              onClick={() => {
                cargarUsuarios();
                toast.info('Actualizando lista de usuarios...');
              }}
              style={styles.refreshButton}
              title="Actualizar usuarios"
            >
              <FaSync />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
        
        <div style={styles.filtersContent}>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={styles.searchInput}
            />
            {busqueda && (
              <button 
                onClick={() => setBusqueda('')}
                style={styles.clearSearchButton}
                title="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}
          </div>
          
          <div style={styles.filtersRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Rol</label>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="todos">Todos los roles</option>
                <option value="administrador">Administradores</option>
                <option value="cliente">Clientes</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Solo activos</option>
                <option value="inactivo">Solo inactivos</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Acciones</label>
              <div style={styles.filterActions}>
                <button
                  onClick={clearFilters}
                  style={styles.clearFiltersButton}
                  disabled={!busqueda && filtroRol === 'todos' && filtroEstado === 'todos'}
                  title="Limpiar todos los filtros"
                >
                  <FaTimes />
                  <span>Limpiar Filtros</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      {error ? (
        <div style={styles.errorContainer}>
          <FaExclamationTriangle style={styles.errorIcon} />
          <h3 style={styles.errorTitle}>Error al cargar usuarios</h3>
          <p style={styles.errorText}>{error}</p>
          <button 
            onClick={() => {
              cargarUsuarios();
              toast.info('Reintentando cargar usuarios...');
            }} 
            style={styles.retryButton}
          >
            <FaSync />
            Reintentar
          </button>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <FaUsers />
          </div>
          <h3 style={styles.emptyTitle}>
            {busqueda || filtroRol !== 'todos' || filtroEstado !== 'todos' 
              ? 'No se encontraron usuarios' 
              : 'No hay usuarios registrados'}
          </h3>
          <p style={styles.emptyText}>
            {busqueda 
              ? 'Intenta con otros términos de búsqueda'
              : filtroRol !== 'todos' || filtroEstado !== 'todos'
              ? 'No hay usuarios con esos filtros'
              : 'Cuando se registren usuarios, aparecerán aquí'}
          </p>
          <div style={styles.emptyActions}>
            {(busqueda || filtroRol !== 'todos' || filtroEstado !== 'todos') && (
              <button
                onClick={clearFilters}
                style={styles.clearFiltersButton}
              >
                Limpiar filtros
              </button>
            )}
            <button
              onClick={abrirModalCrear}
              style={styles.btnPrimary}
            >
              <FaPlus />
              Crear Usuario
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Usuario</th>
                <th style={styles.th}>Contacto</th>
                <th style={styles.th}>Rol</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Registro</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.userInfo}>
                      <div 
                        style={{
                          ...styles.userAvatar,
                          backgroundColor: getAvatarColor(usuario.nombre)
                        }}
                      >
                        {usuario.nombre?.charAt(0).toUpperCase() || '?'}
                        {usuario.rol === 'administrador' && (
                          <div style={styles.adminBadge}>
                            <FaCrown />
                          </div>
                        )}
                      </div>
                      <div style={styles.userDetails}>
                        <div style={styles.userName}>
                          {usuario.nombre}
                          {usuario.rol === 'administrador' && (
                            <span style={styles.adminLabel}>Admin</span>
                          )}
                        </div>
                        <div style={styles.userId}>
                          ID: {usuario.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.contactInfo}>
                      <div style={styles.contactItem}>
                        <FaEnvelope style={styles.contactIcon} />
                        <span style={styles.contactText} title={usuario.email}>
                          {usuario.email}
                        </span>
                      </div>
                      {usuario.telefono && (
                        <div style={styles.contactItem}>
                          <FaPhone style={styles.contactIcon} />
                          <span style={styles.contactText}>
                            {usuario.telefono}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <select
                      value={usuario.rol}
                      onChange={(e) => handleCambiarRol(usuario.id, e.target.value, usuario)}
                      style={{
                        ...styles.rolSelect,
                        backgroundColor: usuario.rol === 'administrador' 
                          ? '#fef3c7' 
                          : '#dbeafe',
                        color: usuario.rol === 'administrador' 
                          ? '#92400e' 
                          : '#1e40af',
                        borderColor: usuario.rol === 'administrador' 
                          ? '#f59e0b' 
                          : '#3b82f6'
                      }}
                    >
                      <option value="cliente">Cliente</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleCambiarEstado(usuario.id, !usuario.activo, usuario)}
                      style={{
                        ...styles.estadoButton,
                        backgroundColor: usuario.activo 
                          ? '#d1fae5' 
                          : '#fee2e2',
                        color: usuario.activo 
                          ? '#065f46' 
                          : '#991b1b',
                        borderColor: usuario.activo 
                          ? '#10b981' 
                          : '#ef4444'
                      }}
                      title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      {usuario.activo ? (
                        <>
                          <FaCheck />
                          <span>Activo</span>
                        </>
                      ) : (
                        <>
                          <FaTimes />
                          <span>Inactivo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.dateInfo}>
                      <FaCalendarAlt style={styles.dateIcon} />
                      <span style={styles.dateText}>
                        {formatFecha(usuario.created_at || usuario.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => abrirModalEditar(usuario)}
                        style={styles.btnEdit}
                        title="Editar usuario"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleEliminar(usuario.id, usuario.nombre)}
                        style={styles.btnDelete}
                        title="Eliminar usuario"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {modalAbierto && (
        <div style={styles.modalOverlay} onClick={() => setModalAbierto(false)}>
          <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <h2 style={styles.modalTitle}>
                  {usuarioEditar ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                {usuarioEditar && (
                  <div style={styles.userAvatarModal}>
                    {usuarioEditar.nombre?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setModalAbierto(false)} 
                style={styles.modalClose}
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelText}>Nombre Completo</span>
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  style={styles.input}
                  required
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelText}>Email</span>
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                  required
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelText}>Teléfono</span>
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  style={styles.input}
                  placeholder="Opcional"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelText}>
                    {usuarioEditar 
                      ? 'Nueva Contraseña' 
                      : 'Contraseña'
                    }
                  </span>
                  {!usuarioEditar && <span style={styles.required}>*</span>}
                </label>
                <div style={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    style={styles.passwordInput}
                    required={!usuarioEditar}
                    placeholder={usuarioEditar ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"}
                    minLength={!usuarioEditar ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.togglePassword}
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {usuarioEditar && (
                  <div style={styles.passwordHint}>
                    <FaKey style={styles.hintIcon} />
                    <span style={styles.hintText}>Dejar vacío para mantener la contraseña actual</span>
                  </div>
                )}
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <span style={styles.labelText}>Rol</span>
                    <span style={styles.required}>*</span>
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                    style={{
                      ...styles.select,
                      backgroundColor: formData.rol === 'administrador' 
                        ? '#fef3c7' 
                        : '#dbeafe',
                      color: formData.rol === 'administrador' 
                        ? '#92400e' 
                        : '#1e40af',
                      borderColor: formData.rol === 'administrador' 
                        ? '#f59e0b' 
                        : '#3b82f6'
                    }}
                    required
                  >
                    <option value="cliente">Cliente</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <span style={styles.labelText}>Estado</span>
                  </label>
                  <select
                    value={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}
                    style={{
                      ...styles.select,
                      backgroundColor: formData.activo 
                        ? '#d1fae5' 
                        : '#fee2e2',
                      color: formData.activo 
                        ? '#065f46' 
                        : '#991b1b',
                      borderColor: formData.activo 
                        ? '#10b981' 
                        : '#ef4444'
                    }}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  onClick={() => {
                    setModalAbierto(false);
                    toast.info('Operación cancelada');
                  }} 
                  style={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={styles.btnPrimary}
                >
                  {usuarioEditar ? 'Actualizar Usuario' : 'Crear Usuario'}
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
      case 'info':
        return {
          color: '#3b82f6',
          buttonBg: '#3b82f6',
          buttonHover: '#2563eb'
        };
      default:
        return {
          color: colors.primary,
          buttonBg: colors.primary,
          buttonHover: colors.primaryLight
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

const styles = {
  container: {
    padding: '32px',
    backgroundColor: colors.background,
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
    fontSize: '28px',
    boxShadow: '0 4px 12px rgba(44, 90, 160, 0.2)'
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
  
  // Botón primario
  btnPrimary: {
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
    '&:hover': {
      backgroundColor: colors.primaryLight,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(44, 90, 160, 0.2)'
    }
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer'
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
  statValue: {
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  filtersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
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
  resultsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  resultsCount: {
    backgroundColor: colors.primary + '20',
    color: colors.primary,
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  refreshButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
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
    color: colors.text.primary,
    outline: 'none',
    '&:focus': {
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px ${colors.primary}20`
    }
  },
  clearSearchButton: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.text.light,
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    '&:hover': {
      color: colors.text.primary
    }
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
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text.primary
  },
  filterSelect: {
    padding: '12px 16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: colors.card,
    color: colors.text.primary,
    minWidth: '200px',
    outline: 'none',
    '&:focus': {
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px ${colors.primary}20`
    }
  },
  filterActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },
  clearFiltersButton: {
    backgroundColor: colors.text.secondary,
    border: `2px solid ${colors.text.secondary}`,
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    '&:disabled': {
      backgroundColor: colors.border,
      borderColor: colors.border,
      color: colors.text.light,
      cursor: 'not-allowed',
      opacity: 0.6
    }
  },
  
  // Tabla
  tableContainer: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    overflow: 'auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '32px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1000px'
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    borderBottom: `2px solid ${colors.border}`
  },
  th: {
    padding: '20px 16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '700',
    color: colors.text.primary,
    borderBottom: `2px solid ${colors.border}`,
    whiteSpace: 'nowrap'
  },
  tableRow: {
    borderBottom: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f9fafb'
    }
  },
  td: {
    padding: '20px 16px',
    fontSize: '14px',
    color: colors.text.primary,
    verticalAlign: 'middle'
  },
  
  // Información de usuario
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '20px',
    position: 'relative'
  },
  adminBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    backgroundColor: colors.warning,
    color: '#ffffff',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px'
  },
  userDetails: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  adminLabel: {
    backgroundColor: colors.warning,
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700'
  },
  userId: {
    fontSize: '12px',
    color: colors.text.light
  },
  
  // Información de contacto
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  contactIcon: {
    fontSize: '12px',
    color: colors.text.secondary,
    minWidth: '12px'
  },
  contactText: {
    fontSize: '14px',
    color: colors.text.primary,
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '200px'
  },
  
  // Rol y Estado
  rolSelect: {
    padding: '8px 12px',
    border: `2px solid`,
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    minWidth: '120px',
    '&:hover': {
      opacity: 0.9,
      transform: 'translateY(-1px)'
    }
  },
  estadoButton: {
    padding: '8px 16px',
    border: `2px solid`,
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    '&:hover': {
      opacity: 0.9,
      transform: 'translateY(-1px)'
    }
  },
  
  // Fecha
  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dateIcon: {
    fontSize: '12px',
    color: colors.text.secondary
  },
  dateText: {
    fontSize: '14px',
    fontWeight: '500',
    color: colors.text.primary
  },
  
  // Botones de acción
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  btnEdit: {
    backgroundColor: '#dbeafe',
    color: colors.primary,
    border: `2px solid ${colors.primary}`,
    padding: '8px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: colors.primary,
      color: '#ffffff',
      transform: 'translateY(-1px)'
    }
  },
  btnDelete: {
    backgroundColor: '#fee2e2',
    color: colors.danger,
    border: `2px solid ${colors.danger}`,
    padding: '8px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: colors.danger,
      color: '#ffffff',
      transform: 'translateY(-1px)'
    }
  },
  
  // Modal
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
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s ease'
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: '16px',
    width: '95%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out'
  },
  modalHeader: {
    padding: '24px 32px',
    borderBottom: `2px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb'
  },
  modalHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    lineHeight: '1.2'
  },
  userAvatarModal: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '16px'
  },
  modalClose: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.text.secondary,
    padding: '8px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: colors.border,
      color: colors.text.primary
    }
  },
  modalBody: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1
  },
  formGroup: {
    marginBottom: '24px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text.primary
  },
  labelText: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text.primary
  },
  required: {
    color: colors.danger,
    fontWeight: '700'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    backgroundColor: colors.card,
    color: colors.text.primary,
    boxSizing: 'border-box',
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px ${colors.primary}20`
    }
  },
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    flex: 1,
    padding: '12px 48px 12px 16px',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    backgroundColor: colors.card,
    color: colors.text.primary,
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px ${colors.primary}20`
    }
  },
  togglePassword: {
    position: 'absolute',
    right: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.text.secondary,
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    '&:hover': {
      color: colors.text.primary
    }
  },
  passwordHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    fontSize: '12px',
    color: colors.text.light
  },
  hintIcon: {
    fontSize: '12px'
  },
  hintText: {
    fontSize: '12px',
    fontStyle: 'italic'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid`,
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    color: colors.text.primary,
    boxSizing: 'border-box',
    cursor: 'pointer',
    fontWeight: '600',
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 3px rgba(0,0,0,0.1)`
    }
  },
  modalFooter: {
    padding: '24px 0 0 0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  btnSecondary: {
    backgroundColor: colors.text.secondary,
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px',
    '&:hover': {
      backgroundColor: colors.text.primary,
      transform: 'translateY(-1px)'
    }
  },
  
  // Estados de carga y error
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
  errorContainer: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '60px 32px',
    textAlign: 'center',
    marginTop: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  errorIcon: {
    fontSize: '64px',
    color: colors.danger,
    marginBottom: '24px'
  },
  errorTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 12px 0'
  },
  errorText: {
    fontSize: '15px',
    color: colors.text.secondary,
    margin: '0 0 24px 0',
    lineHeight: '1.6',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto'
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
    gap: '8px',
    margin: '0 auto',
    '&:hover': {
      backgroundColor: colors.primaryLight,
      transform: 'translateY(-1px)'
    }
  },
  
  // Estado vacío
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '60px 32px',
    textAlign: 'center',
    border: `2px dashed ${colors.border}`,
    marginTop: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
  emptyActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
};

// Inyectar animaciones CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
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
    
    /* Scrollbar styling */
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
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default GestionUsuarios;