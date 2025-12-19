// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 15000, // Aumentado a 15 segundos para backend en render
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
    console.log('🔵 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data);
    
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
  // Obtener todas las categorías
  getAll: () => api.get('/categorias'),
  
  // Obtener por ID
  getById: (id) => api.get(`/categorias/${id}`),
  
  // Obtener estadísticas
  getEstadisticas: () => api.get('/categorias/estadisticas'),
  
  // Obtener categorías con productos
  getConProductos: () => api.get('/categorias/con-productos'),
  
  // Crear categoría
  create: (categoria) => {
    console.log('📤 Creando categoría:', categoria);
    return api.post('/categorias', categoria);
  },
  
  // Actualizar categoría
  update: (id, categoria) => {
    console.log('📤 Actualizando categoría:', id, categoria);
    return api.put(`/categorias/${id}`, categoria);
  },
  
  // Eliminar categoría
  delete: (id) => {
    console.log('📤 Eliminando categoría:', id);
    return api.delete(`/categorias/${id}`);
  },
  
  // Reactivar categoría (si el backend lo soporta)
  reactivar: (id) => {
    console.log('📤 Reactivando categoría:', id);
    return api.patch(`/categorias/${id}/reactivar`);
  }
};

// ============================================
// SERVICIO DE PRODUCTOS
// ============================================
export const productoService = {
  getAll: () => api.get('/productos'),
  getById: (id) => api.get(`/productos/${id}`),
  getByCategoria: (categoriaId) => api.get(`/productos?categoria_id=${categoriaId}&disponible=true`),
  create: (producto) => {
    console.log('📤 Creando producto:', producto);
    return api.post('/productos', producto);
  },
  update: (id, producto) => {
    console.log('📤 Actualizando producto:', id, producto);
    return api.put(`/productos/${id}`, producto);
  },
  delete: (id) => {
    console.log('📤 Eliminando producto:', id);
    return api.delete(`/productos/${id}`);
  }
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
  crear: (pedidoData) => {
    console.log('📤 Creando pedido:', pedidoData);
    return api.post('/Pedidos', pedidoData);
  },
  update: (id, pedido) => {
    console.log('📤 Actualizando pedido:', id, pedido);
    return api.put(`/Pedidos/${id}`, pedido);
  },
  cambiarEstado: (id, estado) => {
    console.log('📤 Cambiando estado de pedido:', id, estado);
    return api.patch(`/Pedidos/${id}/estado`, { estado });
  },
  cancelar: (id) => {
    console.log('📤 Cancelando pedido:', id);
    return api.patch(`/Pedidos/${id}/cancelar`);
  },
  delete: (id) => {
    console.log('📤 Eliminando pedido:', id);
    return api.delete(`/Pedidos/${id}`);
  }
};

// ============================================
// SERVICIO DE PEDIDOS_PRODUCTOS
// ============================================
export const pedidosProductosService = {
  obtenerProductosPedido: (pedidoId) => {
    console.log('📤 Obteniendo productos del pedido:', pedidoId);
    return api.get(`/Pedidos_Productos/${pedidoId}/productos`);
  },
  
  agregarProductos: (pedidoId, productos) => {
    console.log('📤 Agregando productos al pedido:', pedidoId, productos);
    return api.post(`/Pedidos_Productos/${pedidoId}/productos/multiples`, { productos });
  },
  
  actualizarCantidad: (itemId, cantidad) => {
    console.log('📤 Actualizando cantidad:', itemId, cantidad);
    return api.patch(`/Pedidos_Productos/${itemId}/cantidad`, { cantidad });
  },
  
  actualizarNotas: (itemId, notas) => {
    console.log('📤 Actualizando notas:', itemId, notas);
    return api.patch(`/Pedidos_Productos/${itemId}/notas`, { notas });
  },
  
  eliminarProducto: (itemId) => {
    console.log('📤 Eliminando producto del pedido:', itemId);
    return api.delete(`/Pedidos_Productos/${itemId}`);
  }
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
    console.log('📤 Creando pedido completo:', datosCarrito);
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
  }
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
  
  // Obtener productos de un menú
  getProductos: (menuId) => {
    console.log('📤 Obteniendo productos del menú:', menuId);
    return api.get(`/Menu_Dias/${menuId}/productos`);
  },
  
  // Crear menú
  create: (menuData) => {
    console.log('📤 Creando menú:', menuData);
    return api.post('/Menu_Dias', menuData);
  },
  
  // Actualizar menú
  update: (id, menuData) => {
    console.log('📤 Actualizando menú:', id, menuData);
    return api.put(`/Menu_Dias/${id}`, menuData);
  },
  
  // Agregar productos al menú
  agregarProductos: (menuId, productos) => {
    console.log('📤 Agregando productos al menú:', menuId, productos);
    return api.post(`/Menu_Dias/${menuId}/productos`, { productos });
  },
  
  // Eliminar menú
  delete: (id) => {
    console.log('📤 Eliminando menú:', id);
    return api.delete(`/Menu_Dias/${id}`);
  },
  
  // Obtener estadísticas
  getEstadisticas: () => api.get('/Menu_Dias/estadisticas'),
  
  // Obtener productos populares
  getProductosPopulares: () => api.get('/Menu_Dias/productos-populares')
};

// ============================================
// SERVICIO DE MENÚ_DÍAS_PRODUCTOS
// ============================================
export const menuDiasProductosService = {
  // Obtener productos por menú
  getProductosPorMenu: (menuId) => {
    console.log('📤 Obteniendo productos del menú (Menu_dias_Productos):', menuId);
    return api.get(`/Menu_dias_Productos/menu-dias/${menuId}/productos`);
  },
  
  // Obtener por categoría
  getPorCategoria: (menuId, categoriaId) => 
    api.get(`/Menu_dias_Productos/menu-dias/${menuId}/productos/categoria/${categoriaId}`),
  
  // Obtener estadísticas
  getEstadisticas: (menuId) => 
    api.get(`/Menu_dias_Productos/menu-dias/${menuId}/productos/estadisticas`),
  
  // Agregar múltiples productos
  agregarMultiples: (menuId, productos) => {
    console.log('📤 Agregando múltiples productos al menú:', menuId, productos);
    return api.post(`/Menu_dias_Productos/menu-dias/${menuId}/productos/multiples`, { productos });
  },
  
  // Agregar producto individual
  agregarProducto: (menuId, producto) => {
    console.log('📤 Agregando producto al menú:', menuId, producto);
    return api.post(`/Menu_dias_Productos/menu-dias/${menuId}/productos`, producto);
  },
  
  // Cambiar disponibilidad
  cambiarDisponibilidad: (itemId, disponible) => {
    console.log('📤 Cambiando disponibilidad:', itemId, disponible);
    return api.patch(`/Menu_dias_Productos/${itemId}/disponibilidad`, { disponible });
  },
  
  // Copiar menú
  copiarMenu: (menuId, datosCopia) => {
    console.log('📤 Copiando menú:', menuId, datosCopia);
    return api.post(`/Menu_dias_Productos/menu-dias/${menuId}/copiar`, datosCopia);
  },
  
  // Activar todos los productos
  activarTodos: (menuId) => {
    console.log('📤 Activando todos los productos del menú:', menuId);
    return api.patch(`/Menu_dias_Productos/menu-dias/${menuId}/productos/activar-todos`);
  },
  
  // Desactivar todos los productos
  desactivarTodos: (menuId) => {
    console.log('📤 Desactivando todos los productos del menú:', menuId);
    return api.patch(`/Menu_dias_Productos/menu-dias/${menuId}/productos/desactivar-todos`);
  },
  
  // Limpiar menú (eliminar todos los productos)
  limpiarMenu: (menuId) => {
    console.log('📤 Limpiando menú:', menuId);
    return api.delete(`/Menu_dias_Productos/menu-dias/${menuId}/productos`);
  },
  
  // Eliminar producto del menú
  eliminarProducto: (itemId) => {
    console.log('📤 Eliminando producto del menú:', itemId);
    return api.delete(`/Menu_dias_Productos/${itemId}`);
  }
};

// ============================================
// SERVICIO DE USUARIOS
// ============================================
export const usuarioService = {
  // Autenticación
  login: (credenciales) => {
    console.log('📤 Login:', credenciales.email);
    return api.post('/usuarios/login', credenciales);
  },
  registro: (usuario) => {
    console.log('📤 Registro:', usuario.email);
    return api.post('/usuarios/registro', usuario);
  },
  getPerfil: () => api.get('/usuarios/perfil'),
  
  // CRUD de usuarios
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  getByEmail: (email) => api.get(`/usuarios/email/${email}`),
  
  // Crear y actualizar
  create: (usuario) => {
    console.log('📤 Creando usuario:', usuario);
    return api.post('/usuarios/registro', usuario);
  },
  update: (id, usuario) => {
    console.log('📤 Actualizando usuario:', id, usuario);
    return api.put(`/usuarios/${id}`, usuario);
  },
  
  // Cambios de estado
  cambiarEstado: (id, activo) => {
    console.log('📤 Cambiando estado de usuario:', id, activo);
    return api.patch(`/usuarios/${id}/estado`, { activo });
  },
  cambiarRol: (id, rol) => {
    console.log('📤 Cambiando rol de usuario:', id, rol);
    return api.patch(`/usuarios/${id}/rol`, { rol });
  },
  
  // Eliminar
  delete: (id) => {
    console.log('📤 Eliminando usuario:', id);
    return api.delete(`/usuarios/${id}`);
  },
  
  // Estadísticas y reportes
  getEstadisticas: () => api.get('/usuarios/estadisticas'),
  getReporteRegistros: () => api.get('/usuarios/reportes/registros')
};

// ============================================
// UTILIDADES
// ============================================

// Función para verificar la conexión con el backend
export const verificarConexion = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ Conexión con backend exitosa');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error de conexión con backend:', error);
    return { success: false, error: error.message };
  }
};

// Función para manejar errores de API de forma consistente
export const manejarErrorAPI = (error) => {
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    return {
      success: false,
      error: error.response.data?.message || error.response.data?.error || 'Error en el servidor',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    return {
      success: false,
      error: 'No se pudo conectar con el servidor. Verifica tu conexión.',
      status: 0
    };
  } else {
    // Algo pasó al configurar la petición
    return {
      success: false,
      error: error.message || 'Error desconocido',
      status: 0
    };
  }
};

export default api;