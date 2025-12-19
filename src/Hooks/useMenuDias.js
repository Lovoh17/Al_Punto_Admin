// src/hooks/useMenuDias.js (actualizado completo)
import { useState, useEffect } from 'react';
import { menuDiasService, menuDiasProductosService, categoriaService, productoService } from '../services/api';

export const useMenuDias = () => {
  const [menus, setMenus] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productosDisponibles, setProductosDisponibles] = useState([]);

  // Función para cargar todos los datos necesarios
  const cargarDatos = async () => {
    console.log('🔄 Iniciando carga de datos...');
    try {
      setLoading(true);
      setError(null);

      const [menusRes, categoriasRes, productosRes] = await Promise.all([
        menuDiasService.getAll(),
        categoriaService.getAll(),
        productoService.getAll()
      ]);

      // Procesar menús
      let menusData = [];
      if (menusRes.data) {
        if (menusRes.data.datos && Array.isArray(menusRes.data.datos)) {
          menusData = menusRes.data.datos;
        } else if (menusRes.data.data && Array.isArray(menusRes.data.data)) {
          menusData = menusRes.data.data;
        } else if (Array.isArray(menusRes.data)) {
          menusData = menusRes.data;
        }
      }

      const menusTransformados = menusData.map(menu => ({
        id: menu.id,
        nombre: menu.nombre || (menu.dia_semana ? `Menú del ${menu.dia_semana}` : 'Menú del día'),
        fecha: menu.fecha,
        descripcion: menu.descripcion || '',
        activo: menu.activo !== undefined ? menu.activo : true,
        dia_semana: menu.dia_semana,
        total_productos: parseInt(menu.cantidad_productos) || 0,
        total_ventas: parseFloat(menu.total_ventas) || 0,
        created_at: menu.created_at
      }));

      setMenus(menusTransformados);

      // Procesar categorías
      let categoriasData = [];
      if (categoriasRes.data) {
        if (categoriasRes.data.datos && Array.isArray(categoriasRes.data.datos)) {
          categoriasData = categoriasRes.data.datos;
        } else if (categoriasRes.data.data && Array.isArray(categoriasRes.data.data)) {
          categoriasData = categoriasRes.data.data;
        } else if (Array.isArray(categoriasRes.data)) {
          categoriasData = categoriasRes.data;
        }
      }
      setCategorias(categoriasData);

      // Procesar productos
      let productosData = [];
      if (productosRes.data) {
        if (productosRes.data.datos && Array.isArray(productosRes.data.datos)) {
          productosData = productosRes.data.datos;
        } else if (productosRes.data.data && Array.isArray(productosRes.data.data)) {
          productosData = productosRes.data.data;
        } else if (Array.isArray(productosRes.data)) {
          productosData = productosRes.data;
        }
      }
      setProductos(productosData);

      // Filtrar productos disponibles
      const disponibles = productosData.filter(p => p.disponible !== false);
      setProductosDisponibles(disponibles);

      console.log('✅ Datos cargados:', {
        menus: menusTransformados.length,
        categorias: categoriasData.length,
        productos: productosData.length,
        disponibles: disponibles.length
      });

    } catch (err) {
      console.error('❌ Error en cargarDatos:', err);
      setError(err.response?.data?.message || 'Error al cargar datos');
      setMenus([]);
      setCategorias([]);
      setProductos([]);
      setProductosDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  // CRUD de Menús
const crearMenu = async (menuData) => {
  try {
    console.log('📝 ========== CREANDO MENÚ ==========');
    console.log('📥 menuData recibido:', menuData);
    
    // ✅ CORREGIDO: Mapeo de días SIN acentos
    const obtenerDiaSemana = (fechaString) => {
      const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const fecha = new Date(fechaString + 'T00:00:00'); // Agregar hora para evitar problemas de zona horaria
      return dias[fecha.getDay()];
    };
    
    const menuParaEnviar = {
      nombre: menuData.nombre,
      fecha: menuData.fecha,
      descripcion: menuData.descripcion || '',
      activo: menuData.activo !== undefined ? menuData.activo : true,
      dia_semana: menuData.dia_semana || obtenerDiaSemana(menuData.fecha)
    };

    console.log('📤 menuParaEnviar (SIN productos):', menuParaEnviar);
    console.log('🌐 URL:', 'https://backend-al-punto-1.onrender.com/api/Menu_Dias');
    
    // PRIMERO: Crear solo el menú
    const response = await menuDiasService.create(menuParaEnviar);
    
    console.log('✅ Menú creado exitosamente:', response.data);
    
    // Obtener el ID del menú recién creado
    const menuId = response.data.id || response.data.datos?.id || response.data.data?.id;
    console.log('🆔 Menu ID obtenido:', menuId);
    
    // SEGUNDO: Si hay productos, agregarlos
    if (menuData.productos && menuData.productos.length > 0) {
      console.log('➕ ========== AGREGANDO PRODUCTOS ==========');
      console.log('📦 Cantidad de productos a agregar:', menuData.productos.length);
      
      const resultProductos = await agregarProductosMenu(menuId, menuData.productos);
      
      if (!resultProductos.success) {
        console.error('❌ Error al agregar productos:', resultProductos.error);
        alert(`⚠️ Menú creado pero hubo un error al agregar productos: ${resultProductos.error}`);
      } else {
        console.log('✅ Productos agregados exitosamente');
      }
    } else {
      console.log('ℹ️ No hay productos para agregar');
    }

    await cargarDatos();
    
    return { 
      success: true, 
      data: response.data,
      message: 'Menú creado exitosamente' 
    };
  } catch (err) {
    console.error('❌ ========== ERROR AL CREAR MENÚ ==========');
    console.error('❌ Error response data:', err.response?.data);
    
    return { 
      success: false, 
      error: err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al crear menú',
      detalles: err.response?.data 
    };
  }
};

const actualizarMenu = async (id, menuData) => {
  try {
    console.log('📝 Actualizando menú:', id, menuData);
    
    // ✅ CORREGIDO: Mapeo de días SIN acentos
    const obtenerDiaSemana = (fechaString) => {
      const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const fecha = new Date(fechaString + 'T00:00:00');
      return dias[fecha.getDay()];
    };
    
    const menuParaEnviar = {
      nombre: menuData.nombre,
      fecha: menuData.fecha,
      descripcion: menuData.descripcion || '',
      activo: menuData.activo !== undefined ? menuData.activo : true,
      dia_semana: menuData.dia_semana || obtenerDiaSemana(menuData.fecha)
    };

    const response = await menuDiasService.update(id, menuParaEnviar);
    
    // Si se incluyen productos para actualizar
    if (menuData.productos !== undefined) {
      // Primero limpiar productos existentes
      await menuDiasProductosService.limpiarMenu(id);
      
      // Luego agregar los nuevos productos
      if (menuData.productos.length > 0) {
        await agregarProductosMenu(id, menuData.productos);
      }
    }

    await cargarDatos();
    
    return { 
      success: true, 
      data: response.data,
      message: 'Menú actualizado exitosamente' 
    };
  } catch (err) {
    console.error('❌ Error en actualizarMenu:', err);
    return { 
      success: false, 
      error: err.response?.data?.mensaje || err.response?.data?.message || 'Error al actualizar menú',
      detalles: err.response?.data 
    };
  }
};

  const eliminarMenu = async (id) => {
    try {
      console.log('🗑️ Eliminando menú:', id);
      const response = await menuDiasService.delete(id);
      await cargarDatos();
      
      return { 
        success: true, 
        data: response.data,
        message: 'Menú eliminado exitosamente' 
      };
    } catch (err) {
      console.error('❌ Error en eliminarMenu:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al eliminar menú',
        detalles: err.response?.data 
      };
    }
  };

  // Funciones para productos del menú
  const getProductosMenu = async (menuId) => {
    try {
      console.log('📋 Obteniendo productos del menú:', menuId);
      const response = await menuDiasProductosService.getProductosPorMenu(menuId);
      
      let productosData = [];
      if (response.data) {
        if (response.data.datos && Array.isArray(response.data.datos)) {
          productosData = response.data.datos;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          productosData = response.data.data;
        } else if (Array.isArray(response.data)) {
          productosData = response.data;
        }
      }

      // Enriquecer con información de productos
      const productosEnriquecidos = productosData.map(item => ({
        ...item,
        producto_info: productos.find(p => p.id === item.producto_id) || {}
      }));

      return { success: true, data: productosEnriquecidos };
    } catch (err) {
      console.error('❌ Error en getProductosMenu:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al cargar productos',
        data: [] 
      };
    }
  };

// En useMenuDias.js, actualiza esta función:

const agregarProductosMenu = async (menuId, productos) => {
  try {
    console.log('➕ ========== AGREGANDO PRODUCTOS AL MENÚ ==========');
    console.log('🆔 menuId:', menuId);
    console.log('📦 productos recibidos:', productos);
    console.log('📦 Cantidad:', productos.length);
    
    const productosParaEnviar = productos.map((producto, index) => {
      console.log(`📦 Procesando producto ${index + 1}:`, producto);
      
      return {
        producto_id: producto.producto_id || producto.id,
        disponible: producto.disponible !== undefined ? producto.disponible : true,
        precio_especial: producto.precio_especial || null
      };
    });

    console.log('📤 productosParaEnviar:', JSON.stringify(productosParaEnviar, null, 2));
    console.log('🌐 URL:', `https://backend-al-punto.onrender.com/api//Menu_dias_Productos/menu-dias/${menuId}/productos/multiples`);
    console.log('📤 Body completo:', JSON.stringify({ productos: productosParaEnviar }, null, 2));

    const response = await menuDiasProductosService.agregarMultiples(menuId, productosParaEnviar);
    
    console.log('✅ Respuesta del servidor:', response.data);
    
    return { 
      success: true, 
      data: response.data,
      message: 'Productos agregados exitosamente' 
    };
  } catch (err) {
    console.error('❌ ========== ERROR AL AGREGAR PRODUCTOS ==========');
    console.error('❌ Error completo:', err);
    console.error('❌ Error message:', err.message);
    console.error('❌ Error response:', err.response);
    console.error('❌ Error response data:', err.response?.data);
    console.error('❌ Error response status:', err.response?.status);
    
    return { 
      success: false, 
      error: err.response?.data?.message || err.message || 'Error al agregar productos',
      detalles: err.response?.data 
    };
  }
};

  const cambiarDisponibilidadProductoMenu = async (itemId, disponible) => {
    try {
      console.log('🔄 Cambiando disponibilidad:', itemId, disponible);
      const response = await menuDiasProductosService.cambiarDisponibilidad(itemId, disponible);
      await cargarDatos();
      
      return { 
        success: true, 
        data: response.data,
        message: `Producto ${disponible ? 'activado' : 'desactivado'} exitosamente` 
      };
    } catch (err) {
      console.error('❌ Error en cambiarDisponibilidadProductoMenu:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al cambiar disponibilidad' 
      };
    }
  };

  const eliminarProductoMenu = async (itemId) => {
    try {
      console.log('🗑️ Eliminando producto del menú:', itemId);
      await menuDiasProductosService.eliminarProducto(itemId);
      await cargarDatos();
      
      return { 
        success: true, 
        message: 'Producto eliminado del menú exitosamente' 
      };
    } catch (err) {
      console.error('❌ Error en eliminarProductoMenu:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al eliminar producto' 
      };
    }
  };

  const copiarMenu = async (menuId, datosCopia) => {
    try {
      console.log('📋 Copiando menú:', menuId, datosCopia);
      const response = await menuDiasProductosService.copiarMenu(menuId, datosCopia);
      await cargarDatos();
      
      return { 
        success: true, 
        data: response.data,
        message: 'Menú copiado exitosamente' 
      };
    } catch (err) {
      console.error('❌ Error en copiarMenu:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al copiar menú' 
      };
    }
  };

  // Otras funciones
  const getMenuHoy = async () => {
    try {
      const response = await menuDiasService.getHoy();
      let menuData = null;
      
      if (response.data) {
        if (response.data.datos) menuData = response.data.datos;
        else if (response.data.data) menuData = response.data.data;
        else menuData = response.data;
      }
      
      return { success: true, data: menuData };
    } catch (err) {
      console.error('❌ Error en getMenuHoy:', err);
      return { success: false, error: err.response?.data?.message || 'Error' };
    }
  };

  const getMenuProximos = async () => {
    try {
      const response = await menuDiasService.getProximos();
      let menusData = [];
      
      if (response.data) {
        if (response.data.datos && Array.isArray(response.data.datos)) {
          menusData = response.data.datos;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          menusData = response.data.data;
        } else if (Array.isArray(response.data)) {
          menusData = response.data;
        }
      }
      
      return { success: true, data: menusData };
    } catch (err) {
      console.error('❌ Error en getMenuProximos:', err);
      return { success: false, error: err.response?.data?.message || 'Error' };
    }
  };

  const getEstadisticasMenu = async (menuId) => {
    try {
      const response = await menuDiasProductosService.getEstadisticas(menuId);
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Error al cargar estadísticas' 
      };
    }
  };

  // Efecto para cargar datos al inicio
  useEffect(() => {
    cargarDatos();
  }, []);

  return {
    // Estado
    menus,
    categorias,
    productos,
    productosDisponibles,
    loading,
    error,
    
    // Funciones CRUD
    refetch: cargarDatos,
    crearMenu,
    actualizarMenu,
    eliminarMenu,
    
    // Funciones de productos
    getProductosMenu,
    agregarProductosMenu,
    cambiarDisponibilidadProductoMenu,
    eliminarProductoMenu,
    
    // Otras funciones
    getMenuHoy,
    getMenuProximos,
    getEstadisticasMenu,
    copiarMenu
  };
};