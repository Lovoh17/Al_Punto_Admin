import { useState, useEffect } from 'react';
import { clienteService } from '../services/api';
import { useAuth } from '../AuthContext.jsx'; // Ajusta la ruta según tu estructura

export const useCliente = () => {
  const { user } = useAuth(); // Obtener usuario del contexto de autenticación
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState('todos');

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [categoriasResponse, productosResponse] = await Promise.all([
        clienteService.getCategoriasActivas(),
        clienteService.getProductosPorCategoria('')
      ]);

      const categoriasData = categoriasResponse.data.data || categoriasResponse.data;
      const productosData = productosResponse.data.data || productosResponse.data;

      setCategorias(categoriasData);
      setProductos(productosData.filter(p => p.disponible));

    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) { // Solo cargar datos si hay usuario autenticado
      cargarDatos();
    }
  }, [user]);

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.id === producto.id);
      if (existente) {
        return prev.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const removerDelCarrito = (productoId) => {
    setCarrito(prev => prev.filter(item => item.id !== productoId));
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      removerDelCarrito(productoId);
      return;
    }
    
    setCarrito(prev =>
      prev.map(item =>
        item.id === productoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    );
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  const totalCarrito = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  const realizarPedido = async (datosCliente) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!user || !user.id) {
        throw new Error('Debes iniciar sesión para realizar un pedido');
      }

      const pedidoData = {
        usuario_id: user.id,
        numero_mesa: datosCliente.mesa || null,
        ubicacion: datosCliente.ubicacion || null,
        notas: datosCliente.notas || '',
        total: totalCarrito
      };

      console.log('📦 Creando pedido para usuario ID:', user.id);
      console.log('📝 Datos del pedido:', pedidoData);

      const pedidoResponse = await clienteService.crearPedidoCompleto(pedidoData);
      const pedido = pedidoResponse.data.data || pedidoResponse.data;
      

      // Si tu API necesita agregar productos por separado
      if (pedido && pedido.id) {
        const productosPedido = carrito.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          subtotal: item.precio * item.cantidad,
          notas: item.notas || ''
        }));

        // Solo llamar si tu API requiere este paso adicional
        try {
          await clienteService.agregarProductosPedido(pedido.id, productosPedido);
        } catch (err) {
          console.warn('⚠️ No se pudieron agregar productos al pedido:', err);
          // Continuar de todos modos si el pedido principal se creó
        }
      }

      limpiarCarrito();

      return { 
        success: true, 
        pedido,
        mensaje: 'Pedido realizado exitosamente'
      };

    } catch (err) {
      console.error('❌ Error al realizar pedido:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al realizar el pedido');
    }
  };

  const productosFiltrados = categoriaActiva === 'todos' 
    ? productos 
    : productos.filter(p => p.categoria_id === categoriaActiva);

  const categoriasPrincipales = [
    { id: 'todos', nombre: 'Todos los productos' },
    ...categorias.filter(cat => 
      ['Platos Fuertes', 'Entradas', 'Postres', 'Bebidas'].includes(cat.nombre)
    )
  ];

  return {
    categorias: categoriasPrincipales,
    productos: productosFiltrados,
    carrito,
    loading,
    error,
    categoriaActiva,
    setCategoriaActiva,
    agregarAlCarrito,
    removerDelCarrito,
    actualizarCantidad,
    limpiarCarrito,
    totalCarrito,
    realizarPedido,
    refetch: cargarDatos,
    user 
  };
};