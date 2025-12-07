// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// SERVICIO DE CATEGORÍAS
// ============================================
export const categoriaService = {
  getAll: () => api.get('/categorias'),
  getById: (id) => api.get(`/categorias/${id}`),
  create: (categoria) => api.post('/categorias', categoria),
  update: (id, categoria) => api.put(`/categorias/${id}`, categoria),
  delete: (id) => api.delete(`/categorias/${id}`),
};

// ============================================
// SERVICIO DE PRODUCTOS
// ============================================
export const productoService = {
  getAll: () => api.get('/productos'),
  getById: (id) => api.get(`/productos/${id}`),
  getByCategoria: (categoriaId) => api.get(`/productos?categoria_id=${categoriaId}&disponible=true`),
  create: (producto) => api.post('/productos', producto),
  update: (id, producto) => api.put(`/productos/${id}`, producto),
  delete: (id) => api.delete(`/productos/${id}`),
};

// ============================================
// SERVICIO DE PEDIDOS
// ============================================
export const pedidoService = {
  getAll: () => api.get('/Pedidos'),
  getById: (id) => api.get(`/Pedidos/${id}`),
  getActivos: () => api.get('/Pedidos/activos'),
  getByCliente: (usuarioId) => api.get(`/Pedidos/cliente/${usuarioId}`),
  getByNumero: (numeroPedido) => api.get(`/Pedidos/numero/${numeroPedido}`),
  getEstadisticas: () => api.get('/Pedidos/estadisticas'),
  getReporteVentas: () => api.get('/Pedidos/reportes/ventas'),
  crear: (pedidoData) => api.post('/Pedidos', pedidoData),
  update: (id, pedido) => api.put(`/Pedidos/${id}`, pedido),
  cambiarEstado: (id, estado) => api.patch(`/Pedidos/${id}/estado`, { estado }),
  cancelar: (id) => api.patch(`/Pedidos/${id}/cancelar`),
  delete: (id) => api.delete(`/Pedidos/${id}`),
};

// ============================================
// SERVICIO DE PEDIDOS_PRODUCTOS
// ============================================
export const pedidosProductosService = {
  obtenerProductosPedido: (pedidoId) => 
    api.get(`/Pedidos_Productos/${pedidoId}/productos`),
  
  agregarProductos: (pedidoId, productos) => 
    api.post(`/Pedidos_Productos/${pedidoId}/productos/multiples`, { productos }),
  
  actualizarCantidad: (itemId, cantidad) => 
    api.patch(`/Pedidos_Productos/${itemId}/cantidad`, { cantidad }),
  
  actualizarNotas: (itemId, notas) => 
    api.patch(`/Pedidos_Productos/${itemId}/notas`, { notas }),
  
  eliminarProducto: (itemId) => 
    api.delete(`/Pedidos_Productos/${itemId}`),
};

// ============================================
// SERVICIO PARA CLIENTES
// ============================================
export const clienteService = {
  getMenuHoy: () => api.get('/Menu_Dias/hoy'),
  getCategoriasActivas: () => api.get('/categorias?activo=true'),
  getProductosPorCategoria: (categoriaId) => 
    api.get(`/productos?categoria_id=${categoriaId}&disponible=true`),
  getProductosDisponibles: () => 
    api.get('/productos?disponible=true'),
  
  crearPedidoCompleto: (datosCarrito) => {
    return api.post('/Pedidos', {
      usuario_id: datosCarrito.usuario_id,
      numero_mesa: datosCarrito.numero_mesa || null,
      ubicacion: datosCarrito.ubicacion || null,
      notas: datosCarrito.notas || '',
      productos: datosCarrito.items.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        notas: item.notas || ''
      }))
    });
  },
};

// ============================================
// SERVICIO DE MENÚS DEL DÍA
// ============================================
export const menuDiasService = {
  // Obtener todos los menús
  getAll: () => api.get('/Menu_Dias'),
  
  // Obtener menú de hoy
  getHoy: () => api.get('/Menu_Dias/hoy'),
  
  // Obtener menús próximos
  getProximos: () => api.get('/Menu_Dias/proximos'),
  
  // Obtener por ID
  getById: (id) => api.get(`/Menu_Dias/${id}`),
  
  // Obtener por fecha
  getByFecha: (fecha) => api.get(`/Menu_Dias/fecha/${fecha}`),
  
  // Obtener productos de un menú (usando la ruta correcta del backend)
  getProductos: (menuId) => api.get(`/Menu_Dias/${menuId}/productos`),
  
  // ✅ CORREGIDO: Crear menú (sin productos)
  create: (menuData) => api.post('/Menu_Dias', menuData),
  
  // Actualizar menú
  update: (id, menuData) => api.put(`/Menu_Dias/${id}`, menuData),
  
  // ✅ CORREGIDO: Agregar productos al menú (usando la ruta del backend)
  agregarProductos: (menuId, productos) => 
    api.post(`/Menu_Dias/${menuId}/productos`, { productos }),
  
  // Eliminar menú
  delete: (id) => api.delete(`/Menu_Dias/${id}`),
  
  // Obtener estadísticas
  getEstadisticas: () => api.get('/Menu_Dias/estadisticas'),
  
  // Obtener productos populares
  getProductosPopulares: () => api.get('/Menu_Dias/productos-populares'),
};

// ============================================
// SERVICIO DE MENÚ_DÍAS_PRODUCTOS
// ============================================
export const menuDiasProductosService = {
  // Obtener productos por menú
  getProductosPorMenu: (menuId) => 
    api.get(`/Menu_dias_Productos/menu-dias/${menuId}/productos`),
  
  // Obtener por categoría
  getPorCategoria: (menuId, categoriaId) => 
    api.get(`/Menu_dias_Productos/menu-dias/${menuId}/productos/categoria/${categoriaId}`),
  
  // Obtener estadísticas
  getEstadisticas: (menuId) => 
    api.get(`/Menu_dias_Productos/menu-dias/${menuId}/productos/estadisticas`),
  
  // ✅ CORREGIDO: Agregar múltiples productos
  agregarMultiples: (menuId, productos) => {
    console.log('🔵 API Call - agregarMultiples:', {
      url: `/Menu_dias_Productos/menu-dias/${menuId}/productos/multiples`,
      productos: productos
    });
    return api.post(`/Menu_dias_Productos/menu-dias/${menuId}/productos/multiples`, { productos });
  },
  
  // Agregar producto individual
  agregarProducto: (menuId, producto) => 
    api.post(`/Menu_dias_Productos/menu-dias/${menuId}/productos`, producto),
  
  // Cambiar disponibilidad
  cambiarDisponibilidad: (itemId, disponible) => 
    api.patch(`/Menu_dias_Productos/${itemId}/disponibilidad`, { disponible }),
  
  // Copiar menú
  copiarMenu: (menuId, datosCopia) => 
    api.post(`/Menu_dias_Productos/menu-dias/${menuId}/copiar`, datosCopia),
  
  // Activar todos los productos
  activarTodos: (menuId) => 
    api.patch(`/Menu_dias_Productos/menu-dias/${menuId}/productos/activar-todos`),
  
  // Desactivar todos los productos
  desactivarTodos: (menuId) => 
    api.patch(`/Menu_dias_Productos/menu-dias/${menuId}/productos/desactivar-todos`),
  
  // Limpiar menú (eliminar todos los productos)
  limpiarMenu: (menuId) => 
    api.delete(`/Menu_dias_Productos/menu-dias/${menuId}/productos`),
  
  // Eliminar producto del menú
  eliminarProducto: (itemId) => 
    api.delete(`/Menu_dias_Productos/${itemId}`),
};

// ============================================
// SERVICIO DE USUARIOS
// ============================================
export const usuarioService = {
  // Autenticación
  login: (credenciales) => api.post('/usuarios/login', credenciales),
  registro: (usuario) => api.post('/usuarios/registro', usuario),
  getPerfil: () => api.get('/usuarios/perfil'),
  
  // CRUD de usuarios
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  getByEmail: (email) => api.get(`/usuarios/email/${email}`),
  
  // Crear y actualizar
  create: (usuario) => api.post('/usuarios/registro', usuario),
  update: (id, usuario) => api.put(`/usuarios/${id}`, usuario),
  
  // Cambios de estado
  cambiarEstado: (id, activo) => api.patch(`/usuarios/${id}/estado`, { activo }),
  cambiarRol: (id, rol) => api.patch(`/usuarios/${id}/rol`, { rol }),
  
  // Eliminar
  delete: (id) => api.delete(`/usuarios/${id}`),
  
  // Estadísticas y reportes
  getEstadisticas: () => api.get('/usuarios/estadisticas'),
  getReporteRegistros: () => api.get('/usuarios/reportes/registros'),
};

export default api;