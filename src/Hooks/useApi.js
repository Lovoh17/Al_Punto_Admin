// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-al-punto-1.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    // Log de respuestas exitosas para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log de errores
    console.error(`❌ Error ${error.response?.status || 'Network'}: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('redireccion');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// 📦 Helper para extraer datos de respuesta
const extractData = (response) => {
  const data = response.data;
  
  // Verificar si la respuesta tiene estructura { success, data, message }
  if (data && typeof data === 'object') {
    // Si tiene propiedad data, usar esa
    if (data.data !== undefined) {
      return data.data;
    }
    // Si tiene propiedad success y data dentro
    if (data.success && data.data) {
      return data.data;
    }
  }
  
  // Si no, retornar la respuesta completa
  return data;
};

// Servicio de Categorías
export const categoriaService = {
  getAll: () => api.get('/categorias').then(extractData),
  getById: (id) => api.get(`/categorias/${id}`).then(extractData),
  create: (categoria) => api.post('/categorias', categoria).then(extractData),
  update: (id, categoria) => api.put(`/categorias/${id}`, categoria).then(extractData),
  delete: (id) => api.delete(`/categorias/${id}`).then(extractData),
  getActivas: () => api.get('/categorias?activo=true').then(extractData),
  cambiarEstado: (id, activo) => api.patch(`/categorias/${id}/estado`, { activo }).then(extractData),
  obtenerEstadisticas: () => api.get('/categorias/estadisticas').then(extractData),
  obtenerConProductos: () => api.get('/categorias/con-productos').then(extractData),
};

// Servicio de Productos
export const productoService = {
  getAll: () => api.get('/productos').then(extractData),
  getById: (id) => api.get(`/productos/${id}`).then(extractData),
  getByCategoria: (categoriaId) => api.get(`/productos?categoria_id=${categoriaId}`).then(extractData),
  getDisponibles: () => api.get('/productos?disponible=true').then(extractData),
  getDestacados: () => api.get('/productos?destacado=true').then(extractData),
  create: (producto) => api.post('/productos', producto).then(extractData),
  update: (id, producto) => api.put(`/productos/${id}`, producto).then(extractData),
  delete: (id) => api.delete(`/productos/${id}`).then(extractData),
  cambiarDisponibilidad: (id, disponible) => api.patch(`/productos/${id}/disponibilidad`, { disponible }).then(extractData),
  cambiarDestacado: (id, destacado) => api.patch(`/productos/${id}/destacado`, { destacado }).then(extractData),
  obtenerEstadisticas: () => api.get('/productos/estadisticas').then(extractData),
  obtenerReporte: (fecha_desde, fecha_hasta) => 
    api.get(`/productos/reporte?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`).then(extractData),
};

// Servicio de Pedidos (COMPLETO)
export const pedidoService = {
  // Obtener
  getAll: () => api.get('/Pedidos').then(extractData),
  getById: (id) => api.get(`/Pedidos/${id}`).then(extractData),
  getByNumero: (numeroPedido) => api.get(`/Pedidos/numero/${numeroPedido}`).then(extractData),
  getByCliente: (usuarioId) => api.get(`/Pedidos/cliente/${usuarioId}`).then(extractData),
  getActivos: () => api.get('/Pedidos/activos').then(extractData),
  getHoy: () => api.get('/Pedidos/hoy').then(extractData),
  getPorFecha: (fecha) => api.get(`/Pedidos/fecha/${fecha}`).then(extractData),
  
  // Crear y Modificar
  create: (pedidoData) => api.post('/Pedidos', pedidoData).then(extractData),
  createConProductos: (pedidoData) => api.post('/Pedidos/con-productos', pedidoData).then(extractData),
  update: (id, pedidoData) => api.put(`/Pedidos/${id}`, pedidoData).then(extractData),
  delete: (id) => api.delete(`/Pedidos/${id}`).then(extractData),
  
  // Estado
  cambiarEstado: (id, estado) => api.patch(`/Pedidos/${id}/estado`, { estado }).then(extractData),
  cancelar: (id) => api.patch(`/Pedidos/${id}/cancelar`).then(extractData),
  marcarEntregado: (id) => api.patch(`/Pedidos/${id}/entregado`).then(extractData),
  
  // Reportes y Estadísticas
  obtenerEstadisticas: (filtros = {}) => {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) params.append(key, filtros[key]);
    });
    return api.get(`/Pedidos/estadisticas?${params}`).then(extractData);
  },
  obtenerReporteVentas: (fecha_desde, fecha_hasta) => 
    api.get(`/Pedidos/reportes/ventas?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`).then(extractData),
  obtenerMesasOcupadas: () => api.get('/Pedidos/mesas-ocupadas').then(extractData),
  
  // Productos del Pedido
  obtenerProductos: (pedidoId) => api.get(`/Pedidos/${pedidoId}/productos`).then(extractData),
  agregarProducto: (pedidoId, productoData) => 
    api.post(`/Pedidos/${pedidoId}/productos`, productoData).then(extractData),
  actualizarProducto: (itemId, productoData) => 
    api.put(`/Pedidos/productos/${itemId}`, productoData).then(extractData),
  eliminarProducto: (itemId) => api.delete(`/Pedidos/productos/${itemId}`).then(extractData),
};

// Servicio de Pedidos_Productos
export const pedidosProductosService = {
  obtenerProductosPedido: (pedidoId) => 
    api.get(`/Pedidos_Productos/${pedidoId}/productos`).then(extractData),
  agregarProductos: (pedidoId, productos) => 
    api.post(`/Pedidos_Productos/${pedidoId}/productos/multiples`, { productos }).then(extractData),
  obtenerEstadisticas: (pedidoId) => 
    api.get(`/Pedidos_Productos/${pedidoId}/productos/estadisticas`).then(extractData),
  actualizarCantidad: (itemId, cantidad) => 
    api.patch(`/Pedidos_Productos/${itemId}/cantidad`, { cantidad }).then(extractData),
  actualizarNotas: (itemId, notas) => 
    api.patch(`/Pedidos_Productos/${itemId}/notas`, { notas }).then(extractData),
  eliminarProducto: (itemId) => api.delete(`/Pedidos_Productos/${itemId}`).then(extractData),
};

// Servicio de Usuarios (COMPLETO)
export const usuarioService = {
  // Autenticación
  login: (credenciales) => api.post('/usuarios/login', credenciales).then(extractData),
  registro: (usuario) => api.post('/usuarios/registro', usuario).then(extractData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redireccion');
  },
  
  // Perfil
  getPerfil: () => api.get('/usuarios/perfil').then(extractData),
  actualizarPerfil: (datos) => api.put('/usuarios/perfil', datos).then(extractData),
  cambiarPassword: (datos) => api.post('/usuarios/cambiar-password', datos).then(extractData),
  
  // Gestión de Usuarios (admin)
  getAll: () => api.get('/usuarios').then(extractData),
  getById: (id) => api.get(`/usuarios/${id}`).then(extractData),
  getByRol: (rol) => api.get(`/usuarios?rol=${rol}`).then(extractData),
  createUsuario: (usuario) => api.post('/usuarios', usuario).then(extractData),
  updateUsuario: (id, usuario) => api.put(`/usuarios/${id}`, usuario).then(extractData),
  deleteUsuario: (id) => api.delete(`/usuarios/${id}`).then(extractData),
  cambiarEstado: (id, activo) => api.patch(`/usuarios/${id}/estado`, { activo }).then(extractData),
  cambiarRol: (id, rol) => api.patch(`/usuarios/${id}/rol`, { rol }).then(extractData),
  
  // Reportes
  obtenerEstadisticas: () => api.get('/usuarios/estadisticas').then(extractData),
  obtenerReporteRegistros: (fecha_desde, fecha_hasta) => 
    api.get(`/usuarios/reporte-registros?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`).then(extractData),
};

// Servicio de MenuDias (COMPLETO)
export const menuDiasService = {
  // Obtener
  getAll: () => api.get('/Menu_Dias').then(extractData),
  getById: (id) => api.get(`/Menu_Dias/${id}`).then(extractData),
  getHoy: () => api.get('/Menu_Dias/hoy').then(extractData),
  getProximos: () => api.get('/Menu_Dias/proximos').then(extractData),
  getPorFecha: (fecha) => api.get(`/Menu_Dias/fecha/${fecha}`).then(extractData),
  
  // Crear y Modificar
  create: (menuData) => api.post('/Menu_Dias', menuData).then(extractData),
  update: (id, menuData) => api.put(`/Menu_Dias/${id}`, menuData).then(extractData),
  delete: (id) => api.delete(`/Menu_Dias/${id}`).then(extractData),
  cambiarEstado: (id, activo) => api.patch(`/Menu_Dias/${id}/estado`, { activo }).then(extractData),
  
  // Productos del Menú
  getProductos: (menuId) => api.get(`/Menu_Dias/${menuId}/productos`).then(extractData),
  agregarProductos: (menuId, productos) => 
    api.post(`/Menu_Dias/${menuId}/productos`, { productos }).then(extractData),
  actualizarDisponibilidadProducto: (menuId, productoId, disponible) => 
    api.patch(`/Menu_Dias/${menuId}/productos/${productoId}/disponibilidad`, { disponible }).then(extractData),
  eliminarProducto: (menuId, productoId) => 
    api.delete(`/Menu_Dias/${menuId}/productos/${productoId}`).then(extractData),
  
  // Reportes y Estadísticas
  obtenerEstadisticas: () => api.get('/Menu_Dias/estadisticas').then(extractData),
  obtenerProductosPopulares: () => api.get('/Menu_Dias/productos-populares').then(extractData),
};

// Servicio de MenuDias_Productos
export const menuDiasProductosService = {
  obtenerProductosPorMenu: (menuId) => 
    api.get(`/Menu_dias_Productos/menu-dias/${menuId}/productos`).then(extractData),
  obtenerPorCategoria: (menuId, categoriaId) => 
    api.get(`/Menu_dias_Productos/menu-dias/${menuId}/productos/categoria/${categoriaId}`).then(extractData),
  obtenerEstadisticas: (menuId) => 
    api.get(`/Menu_dias_Productos/menu-dias/${menuId}/productos/estadisticas`).then(extractData),
  agregarMultiples: (menuId, productos) => 
    api.post(`/Menu_dias_Productos/menu-dias/${menuId}/productos/multiples`, { productos }).then(extractData),
  agregarProducto: (menuId, producto) => 
    api.post(`/Menu_dias_Productos/menu-dias/${menuId}/productos`, producto).then(extractData),
  cambiarDisponibilidad: (itemId, disponible) => 
    api.patch(`/Menu_dias_Productos/${itemId}/disponibilidad`, { disponible }).then(extractData),
  copiarMenu: (menuId, datosCopia) => 
    api.post(`/Menu_dias_Productos/menu-dias/${menuId}/copiar`, datosCopia).then(extractData),
  activarTodos: (menuId) => 
    api.patch(`/Menu_dias_Productos/menu-dias/${menuId}/productos/activar-todos`).then(extractData),
  desactivarTodos: (menuId) => 
    api.patch(`/Menu_dias_Productos/menu-dias/${menuId}/productos/desactivar-todos`).then(extractData),
  limpiarMenu: (menuId) => 
    api.delete(`/Menu_dias_Productos/menu-dias/${menuId}/productos`).then(extractData),
  eliminarProducto: (itemId) => api.delete(`/Menu_dias_Productos/${itemId}`).then(extractData),
};

// Servicio para Cliente (Frontend público)
export const clienteService = {
  // Menú público
  getMenuHoy: () => api.get('/Menu_Dias/hoy').then(extractData),
  getCategoriasActivas: () => api.get('/categorias?activo=true').then(extractData),
  getProductosDisponibles: () => api.get('/productos?disponible=true').then(extractData),
  getProductosPorCategoria: (categoriaId) => 
    api.get(`/productos?categoria_id=${categoriaId}&disponible=true`).then(extractData),
  getProductosDestacados: () => api.get('/productos?destacado=true&disponible=true').then(extractData),
  
  // Pedidos del cliente
  crearPedido: (pedidoData) => api.post('/Pedidos/cliente', pedidoData).then(extractData),
  getMisPedidos: (usuarioId) => api.get(`/Pedidos/cliente/${usuarioId}`).then(extractData),
  cancelarPedido: (pedidoId) => api.patch(`/Pedidos/${pedidoId}/cancelar-cliente`).then(extractData),
  
  // Autenticación cliente
  loginCliente: (credenciales) => api.post('/clientes/login', credenciales).then(extractData),
  registroCliente: (cliente) => api.post('/clientes/registro', cliente).then(extractData),
  getPerfilCliente: () => api.get('/clientes/perfil').then(extractData),
};

// Servicio de Configuración
export const configuracionService = {
  getConfig: () => api.get('/configuracion').then(extractData),
  updateConfig: (config) => api.put('/configuracion', config).then(extractData),
  getHorarios: () => api.get('/configuracion/horarios').then(extractData),
  updateHorarios: (horarios) => api.put('/configuracion/horarios', horarios).then(extractData),
  getImpuestos: () => api.get('/configuracion/impuestos').then(extractData),
  updateImpuestos: (impuestos) => api.put('/configuracion/impuestos', impuestos).then(extractData),
};

// Servicio de Reportes
export const reporteService = {
  // Ventas
  getVentasPorDia: (fecha_desde, fecha_hasta) => 
    api.get(`/reportes/ventas/dia?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`).then(extractData),
  getVentasPorCategoria: (fecha_desde, fecha_hasta) => 
    api.get(`/reportes/ventas/categoria?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`).then(extractData),
  getVentasPorProducto: (fecha_desde, fecha_hasta) => 
    api.get(`/reportes/ventas/producto?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`).then(extractData),
  getVentasPorMesero: (fecha_desde, fecha_hasta) => 
    api.get(`/reportes/ventas/mesero?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`).then(extractData),
  
  // Inventario
  getInventarioActual: () => api.get('/reportes/inventario/actual').then(extractData),
  getMovimientosInventario: (fecha_desde, fecha_hasta) => 
    api.get(`/reportes/inventario/movimientos?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`).then(extractData),
  
  // Clientes
  getClientesFrecuentes: (limite = 10) => 
    api.get(`/reportes/clientes/frecuentes?limite=${limite}`).then(extractData),
  getClientesNuevos: (fecha_desde, fecha_hasta) => 
    api.get(`/reportes/clientes/nuevos?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`).then(extractData),
  
  // Exportar
  exportarExcel: (tipo, filtros) => 
    api.post(`/reportes/exportar/${tipo}`, filtros, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    }),
  exportarPDF: (tipo, filtros) => 
    api.post(`/reportes/exportar/${tipo}/pdf`, filtros, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    }),
};

// Helper para uso general
export const apiHelper = {
  // Validar token
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
  
  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (err) {
        return null;
      }
    }
    return null;
  },
  
  // Obtener rol actual
  getCurrentRole: () => {
    const user = apiHelper.getCurrentUser();
    return user?.rol || null;
  },
  
  // Verificar permisos
  hasRole: (roles) => {
    const currentRole = apiHelper.getCurrentRole();
    if (!currentRole) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(currentRole);
    }
    return currentRole === roles;
  },
  
  // Limpiar sesión
  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redireccion');
  },
  
  // Formatear errores de API
  formatError: (error) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400:
          return data.message || 'Datos inválidos';
        case 401:
          return 'No autorizado. Por favor inicie sesión.';
        case 403:
          return 'No tiene permisos para realizar esta acción';
        case 404:
          return 'Recurso no encontrado';
        case 409:
          return 'Conflicto: ' + (data.message || 'El recurso ya existe');
        case 422:
          return 'Error de validación: ' + (data.message || 'Revise los datos enviados');
        case 500:
          return 'Error interno del servidor';
        default:
          return `Error ${status}: ${data.message || 'Error desconocido'}`;
      }
    } else if (error.request) {
      return 'Error de conexión. Verifique su internet.';
    } else {
      return 'Error: ' + error.message;
    }
  }
};

// Exportar axios instance también por si se necesita
export { api };

export default {
  // Re-exportar todo
  categoriaService,
  productoService,
  pedidoService,
  pedidosProductosService,
  usuarioService,
  menuDiasService,
  menuDiasProductosService,
  clienteService,
  configuracionService,
  reporteService,
  apiHelper,
  api
};