import React, { useState, useEffect, useMemo } from 'react';
import { usePedidos } from '../Hooks/usePedidos';
import PedidoCard from '../components/Pedidos/PedidosCards';
import PedidoDetalleModal from '../components/Pedidos/PedidoDetalleModal';
import { ToastContainer, useToast } from '../components/Toast/Toast';
import { 
  FaShoppingCart, 
  FaFilter, 
  FaSearch, 
  FaChartBar,
  FaClock,
  FaUtensils,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaExclamationTriangle,
  FaPrint,
  FaEye,
  FaSync,
  FaCalendarDay,
  FaClipboardList,
  FaChartPie,
  FaFire,
  FaPercent,
  FaListAlt,
  FaHamburger,
  FaPizzaSlice,
  FaCoffee,
  FaIceCream
} from 'react-icons/fa';

const PedidosPage = () => {
  const { 
    pedidos, 
    loading, 
    error, 
    cambiarEstado, 
    cancelarPedido, 
    eliminarPedido,
    obtenerDetallePedido,
    refetchPedidos
  } = usePedidos();

  const toast = useToast();

  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [productosDetalle, setProductosDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  // Calcular estadísticas con useMemo
  const stats = useMemo(() => {
    const total = pedidos.length;
    const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
    const enPreparacion = pedidos.filter(p => p.estado === 'en_preparacion').length;
    const listos = pedidos.filter(p => p.estado === 'listo').length;
    const entregados = pedidos.filter(p => p.estado === 'entregado').length;
    const cancelados = pedidos.filter(p => p.estado === 'cancelado').length;
    const totalVentas = pedidos.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
    
    const ventasPendientes = pedidos
      .filter(p => p.estado === 'pendiente')
      .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
    
    const ventasEntregados = pedidos
      .filter(p => p.estado === 'entregado')
      .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
    
    // Obtener fecha de hoy
    const hoy = new Date();
    const hoyString = hoy.toISOString().split('T')[0];
    
    // Pedidos de hoy
    const pedidosHoy = pedidos.filter(p => {
      const fechaPedido = new Date(p.fecha_pedido || p.created_at);
      const fechaPedidoString = fechaPedido.toISOString().split('T')[0];
      return fechaPedidoString === hoyString;
    });
    
    // Análisis de productos más vendidos
    const productosVendidos = {};
    pedidos.forEach(pedido => {
      if (pedido.productos && Array.isArray(pedido.productos)) {
        pedido.productos.forEach(producto => {
          const nombre = producto.nombre || 'Producto sin nombre';
          const cantidad = producto.cantidad || 1;
          if (productosVendidos[nombre]) {
            productosVendidos[nombre].cantidad += cantidad;
          } else {
            productosVendidos[nombre] = {
              cantidad: cantidad,
              nombre: nombre
            };
          }
        });
      }
    });
    
    // Convertir a array y ordenar por cantidad
    const productosMasVendidos = Object.values(productosVendidos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5); // Top 5 productos

    // Análisis por hora del día
    const pedidosPorHora = {};
    pedidosHoy.forEach(pedido => {
      const fecha = new Date(pedido.fecha_pedido || pedido.created_at);
      const hora = fecha.getHours();
      if (pedidosPorHora[hora]) {
        pedidosPorHora[hora]++;
      } else {
        pedidosPorHora[hora] = 1;
      }
    });
    
    // Encontrar hora pico
    let horaPico = '';
    let maxPedidos = 0;
    Object.entries(pedidosPorHora).forEach(([hora, cantidad]) => {
      if (cantidad > maxPedidos) {
        maxPedidos = cantidad;
        horaPico = `${hora}:00`;
      }
    });
    
    return { 
      total, 
      pendientes, 
      enPreparacion, 
      listos, 
      entregados, 
      cancelados, 
      totalVentas,
      ventasPendientes,
      ventasEntregados,
      pedidosHoy: pedidosHoy.length,
      ventasHoy: pedidosHoy.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0),
      productosMasVendidos,
      horaPico: horaPico || 'No hay datos',
      maxPedidosPorHora: maxPedidos
    };
  }, [pedidos]);

  // Refrescar pedidos automáticamente cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetchPedidos();
      toast.info('Pedidos actualizados automáticamente', 3000);
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchPedidos, toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchPedidos();
      toast.success('Pedidos actualizados correctamente');
    } catch (error) {
      console.log(error);
      toast.error('Error al actualizar pedidos');
    } finally {
      setRefreshing(false);
    }
  };

  // Funciones rápidas
  const filtrarPedidosHoy = () => {
    const hoy = new Date();
    const hoyString = hoy.toISOString().split('T')[0];
    setFiltroEstado('todos');
    setSearchTerm('');
    
    const pedidosHoyCount = pedidos.filter(p => {
      const fechaPedido = new Date(p.fecha_pedido || p.created_at);
      const fechaPedidoString = fechaPedido.toISOString().split('T')[0];
      return fechaPedidoString === hoyString;
    }).length;
    
    toast.info(`${pedidosHoyCount} pedidos registrados hoy`);
  };

  const filtrarPedidosPendientes = () => {
    setFiltroEstado('pendiente');
    setSearchTerm('');
    toast.info(`${stats.pendientes} pedidos pendientes`);
  };

  const verProductosMasVendidos = () => {
    if (stats.productosMasVendidos.length === 0) {
      toast.info('No hay datos de productos vendidos aún');
      return;
    }
    
    const productosLista = stats.productosMasVendidos
      .map((prod, index) => `${index + 1}. ${prod.nombre}: ${prod.cantidad} unidades`)
      .join('\n');
    
    alert(`🏆 TOP 5 PRODUCTOS MÁS VENDIDOS:\n\n${productosLista}`);
  };

  const verResumenDia = () => {
    const hoy = new Date();
    const fechaHoy = hoy.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const resumen = `
📅 RESUMEN DEL DÍA (${fechaHoy})

📊 Pedidos totales: ${stats.pedidosHoy}
💰 Ventas totales: $${stats.ventasHoy.toFixed(2)}
⏰ Hora pico: ${stats.horaPico} (${stats.maxPedidosPorHora} pedidos)

📈 ESTADOS ACTUALES:
• Pendientes: ${stats.pendientes}
• En preparación: ${stats.enPreparacion}
• Listos: ${stats.listos}
• Entregados: ${stats.entregados}
• Cancelados: ${stats.cancelados}

💵 VENTAS:
• Total acumulado: $${stats.totalVentas.toFixed(2)}
• Hoy: $${stats.ventasHoy.toFixed(2)}
• Pendientes por cobrar: $${stats.ventasPendientes.toFixed(2)}
    `;
    
    alert(resumen);
  };

  const generarResumenDiaPDF = () => {
  // Obtener pedidos del día actual
  const hoy = new Date();
  const hoyString = hoy.toISOString().split('T')[0];
  
  const pedidosHoy = pedidos.filter(p => {
    const fechaPedido = new Date(p.fecha_pedido || p.created_at);
    const fechaPedidoString = fechaPedido.toISOString().split('T')[0];
    return fechaPedidoString === hoyString;
  });

  // Verificar si hay datos
  if (pedidosHoy.length === 0) {
    toast.info('No hay pedidos registrados para hoy');
    return;
  }

  // Mostrar loading
  toast.info('Generando reporte del día...', 2000);

  // Abrir ventana para imprimir
  const ventana = window.open('', '_blank', 'width=1000,height=700');
  
  // Cargar contenido HTML con el PDF
  ventana.document.open();
  ventana.document.write(generarResumenDiaPDF(stats, pedidosHoy));
  ventana.document.close();
  
  // Esperar a que cargue el contenido y luego imprimir
  ventana.onload = function() {
    setTimeout(() => {
      ventana.focus();
      ventana.print();
      toast.success('Reporte del día generado correctamente');
      
      // Cerrar ventana después de imprimir
      setTimeout(() => {
        if (!ventana.closed) {
          ventana.close();
        }
      }, 500);
    }, 1000);
  };
};


  const verEstadisticasProductos = () => {
    if (stats.productosMasVendidos.length === 0) {
      toast.info('No hay datos de productos aún');
      return;
    }
    
    const totalVendidos = stats.productosMasVendidos.reduce((sum, prod) => sum + prod.cantidad, 0);
    
    let mensaje = '📊 ESTADÍSTICAS DE PRODUCTOS\n\n';
    
    stats.productosMasVendidos.forEach((prod, index) => {
      const porcentaje = ((prod.cantidad / totalVendidos) * 100).toFixed(1);
      mensaje += `${index + 1}. ${prod.nombre}\n`;
      mensaje += `   📦 ${prod.cantidad} unidades (${porcentaje}%)\n`;
      mensaje += `   ${'█'.repeat(Math.round(porcentaje / 5))}\n\n`;
    });
    
    mensaje += `Total unidades vendidas: ${totalVendidos}`;
    
    alert(mensaje);
  };

  const verRendimientoHoy = () => {
    const hoy = new Date();
    const fechaHoy = hoy.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    
    // Calcular porcentaje de entregados vs total
    const totalHoy = stats.pedidosHoy;
    const entregadosHoy = pedidos.filter(p => {
      const fechaPedido = new Date(p.fecha_pedido || p.created_at);
      const fechaPedidoString = fechaPedido.toISOString().split('T')[0];
      const hoyString = hoy.toISOString().split('T')[0];
      return fechaPedidoString === hoyString && p.estado === 'entregado';
    }).length;
    
    const porcentajeEntregados = totalHoy > 0 ? (entregadosHoy / totalHoy * 100).toFixed(1) : 0;
    
    const rendimiento = `
🚀 RENDIMIENTO HOY (${fechaHoy})

📊 PEDIDOS HOY:
• Total: ${totalHoy}
• Entregados: ${entregadosHoy}
• Pendientes: ${totalHoy - entregadosHoy}
• Eficiencia: ${porcentajeEntregados}% entregados

💰 VENTAS HOY:
• Total: $${stats.ventasHoy.toFixed(2)}
• Ticket promedio: $${totalHoy > 0 ? (stats.ventasHoy / totalHoy).toFixed(2) : '0.00'}

⏱️ TIEMPO PROMEDIO (estimado):
• Preparación: 15-25 min
• Entrega: 5-15 min
    `;
    
    alert(rendimiento);
  };

  // Resto de las funciones existentes...
  const generarPDFContenido = (pedido) => {
    // ... (mantener código existente)
    const formatFecha = (fechaString) => {
      try {
        const fecha = new Date(fechaString);
        return fecha.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.log(error);
        return fechaString;
      }
    };

    const estadoLabels = {
      pendiente: 'Pendiente',
      en_preparacion: 'En Preparación',
      listo: 'Listo',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };

    const estadoStyle = {
      pendiente: { bg: '#fef3c7', color: '#92400e' },
      en_preparacion: { bg: '#dbeafe', color: '#1e40af' },
      listo: { bg: '#d1fae5', color: '#065f46' },
      entregado: { bg: '#f3f4f6', color: '#374151' },
      cancelado: { bg: '#fee2e2', color: '#991b1b' }
    };

    const estilo = estadoStyle[pedido.estado] || estadoStyle.pendiente;
    const esDelivery = pedido.numero_mesa === 'Delivery' || pedido.numero_mesa === 'delivery';
    const tieneNotas = pedido.notas && pedido.notas.trim() !== '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orden #${pedido.numero_pedido || pedido.id}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0;
            padding: 0;
            color: #333;
            font-size: 12px;
          }
          .container {
            max-width: 100%;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #2c5aa0; 
            padding-bottom: 15px; 
            margin-bottom: 25px; 
          }
          .header h1 { 
            color: #2c5aa0; 
            margin: 0 0 5px 0;
            font-size: 24px;
          }
          .header h3 { 
            color: #666; 
            margin: 5px 0 15px 0;
            font-size: 14px;
          }
          .estado-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 12px;
            background-color: ${estilo.bg};
            color: ${estilo.color};
          }
          .section { 
            margin: 20px 0;
            page-break-inside: avoid;
          }
          .section-title { 
            background-color: #f0f0f0; 
            padding: 8px 12px; 
            font-weight: bold;
            color: #2c5aa0;
            border-left: 4px solid #2c5aa0;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px;
            margin-bottom: 10px;
          }
          .info-item { 
            margin: 8px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
          }
          .label { 
            font-weight: bold; 
            color: #555;
            font-size: 11px;
            display: block;
            margin-bottom: 3px;
          }
          .valor { 
            color: #333;
            font-size: 12px;
          }
          .total-section {
            text-align: right;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #2c5aa0;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            color: #2c5aa0;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 10px; 
            color: #777; 
            border-top: 1px solid #ddd; 
            padding-top: 10px;
          }
          .notas { 
            background-color: #fff8e1; 
            padding: 12px; 
            border-left: 4px solid #ffc107; 
            margin: 15px 0;
            font-style: italic;
          }
          .productos-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          .productos-table th {
            background-color: #f0f0f0;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            color: #555;
            border-bottom: 2px solid #ddd;
          }
          .productos-table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
          }
          .productos-table tr:last-child td {
            border-bottom: none;
          }
          .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
          }
          @media print {
            body { font-size: 11px; }
            .header { padding-bottom: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ORDEN #${pedido.numero_pedido || pedido.id}</h1>
            <h3>Fecha: ${formatFecha(pedido.fecha_pedido || pedido.created_at)}</h3>
            <div class="estado-badge">${estadoLabels[pedido.estado]}</div>
          </div>

          <div class="section">
            <div class="section-title">INFORMACIÓN DEL CLIENTE</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Nombre:</span>
                <span class="valor">${pedido.cliente_nombre || 'Cliente no registrado'}</span>
              </div>
              ${pedido.cliente_telefono ? `
                <div class="info-item">
                  <span class="label">Teléfono:</span>
                  <span class="valor">${pedido.cliente_telefono}</span>
                </div>` : ''}
              ${pedido.cliente_email ? `
                <div class="info-item">
                  <span class="label">Email:</span>
                  <span class="valor">${pedido.cliente_email}</span>
                </div>` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">INFORMACIÓN DE ENTREGA</div>
            <div class="info-item">
              <span class="label">Tipo de pedido:</span>
              <span class="valor">${esDelivery ? 'Delivery' : 'Recoger en Restaurante'}</span>
            </div>
            ${!esDelivery && pedido.numero_mesa && pedido.numero_mesa !== 'Delivery' ? `
              <div class="info-item">
                <span class="label">Mesa:</span>
                <span class="valor">${pedido.numero_mesa}</span>
              </div>` : ''}
            ${esDelivery && pedido.ubicacion ? `
              <div class="info-item">
                <span class="label">Dirección de entrega:</span>
                <span class="valor">${pedido.ubicacion}</span>
              </div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">DETALLE DEL PEDIDO</div>
            ${productosDetalle && Array.isArray(productosDetalle) && productosDetalle.length > 0 ? `
              <table class="productos-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${productosDetalle.map(p => `
                    <tr>
                      <td>${p.nombre || 'Producto'}</td>
                      <td>${p.cantidad || 1}</td>
                      <td>$${(p.precio_unitario || 0).toFixed(2)}</td>
                      <td>$${((p.precio_unitario || 0) * (p.cantidad || 1)).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                    <td><strong>$${parseFloat(pedido.total || 0).toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>
            ` : `
              <div class="info-item">
                <span class="label">Total productos:</span>
                <span class="valor">${pedido.total_productos || 0} items</span>
              </div>
            `}
          </div>

          ${tieneNotas ? `
          <div class="section">
            <div class="section-title">NOTAS ESPECIALES</div>
            <div class="notas">${pedido.notas}</div>
          </div>
          ` : ''}

          <div class="total-section">
            <div class="total">TOTAL A PAGAR: $${parseFloat(pedido.total || 0).toFixed(2)}</div>
          </div>

          <div class="footer">
            <p><strong>Gracias por su preferencia</strong></p>
            <p>Documento generado el: ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p>Para consultas: contacto@turestaurante.com - Tel: (123) 456-7890</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleImprimirPDF = async (pedido) => {
    try {
      if (!productosDetalle || pedido.id !== pedidoDetalle?.id) {
        toast.info('Cargando detalles del pedido para imprimir...', 2000);
        const result = await obtenerDetallePedido(pedido.id);
        if (result.success) {
          setProductosDetalle(result.data);
        } else {
          toast.error('Error al cargar detalles del pedido');
          return;
        }
      }

      const ventana = window.open('', '_blank', 'width=800,height=600');
      
      ventana.document.open();
      ventana.document.write(generarPDFContenido(pedido));
      ventana.document.close();
      
      ventana.onload = function() {
        setTimeout(() => {
          ventana.focus();
          ventana.print();
          toast.success('PDF generado correctamente');
          
          setTimeout(() => {
            if (!ventana.closed) {
              ventana.close();
            }
          }, 500);
        }, 500);
      };
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    const estadoLabels = {
      pendiente: 'Pendiente',
      en_preparacion: 'En Preparación',
      listo: 'Listo',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };

    try {
      const result = await cambiarEstado(id, nuevoEstado);
      if (result.success) {
        toast.success(` Estado del pedido actualizado a "${estadoLabels[nuevoEstado]}"`);
      } else {
        toast.error(` ${result.error || 'Error al cambiar el estado'}`);
      }
    } catch (error) {
      console.log(error);
      toast.error(' Error al cambiar el estado del pedido');
    }
  };

  const handleCancelarClick = (pedido) => {
    setPedidoSeleccionado(pedido);
    setShowCancelConfirm(true);
  };

  // En PedidosPage.jsx, modificar la función handleConfirmCancel:
const handleConfirmCancel = async () => {
  if (pedidoSeleccionado) {
    try {
      // ✅ Asegurarte de obtener el ID correcto
      const pedidoId = pedidoSeleccionado.id || pedidoSeleccionado.pedido_id;
      
      console.log('🟡 ID a cancelar:', pedidoId);
      
      if (!pedidoId) {
        toast.error('No se pudo obtener el ID del pedido');
        return;
      }
      
      const result = await cancelarPedido(pedidoId);
      if (result.success) {
        toast.success(' Pedido cancelado exitosamente');
      } else {
        toast.error(` ${result.error || 'Error al cancelar el pedido'}`);
      }
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      toast.error(' Error al cancelar el pedido');
    }
  }
  setShowCancelConfirm(false);
  setPedidoSeleccionado(null);
};

  const handleEliminarClick = (pedido) => {
    setPedidoSeleccionado(pedido);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (pedidoSeleccionado) {
      try {
        const result = await eliminarPedido(pedidoSeleccionado.id);
        if (result.success) {
          toast.success(' Pedido eliminado exitosamente');
        } else {
          toast.error(` ${result.error || 'Error al eliminar el pedido'}`);
        }
      } catch (error) {
        console.log(error);
        toast.error(' Error al eliminar el pedido');
      }
    }
    setShowDeleteConfirm(false);
    setPedidoSeleccionado(null);
  };

  const handleVerDetalle = async (pedido) => {
    setCargandoDetalle(true);
    setPedidoDetalle(pedido);
    
    try {
      const result = await obtenerDetallePedido(pedido.id);
      if (result.success) {
        setProductosDetalle(result.data);
        toast.info('Detalles del pedido cargados');
      } else {
        toast.error(` ${result.error || 'Error al cargar detalles'}`);
        setPedidoDetalle(null);
      }
    } catch (error) {
      console.log(error);
      toast.error(' Error al cargar detalles del pedido');
      setPedidoDetalle(null);
    }
    
    setCargandoDetalle(false);
  };

  const handleCerrarDetalle = () => {
    setPedidoDetalle(null);
    setProductosDetalle(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFiltroEstado('todos');
    toast.info('Filtros limpiados');
  };

  // Filtrar pedidos con useMemo
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(pedido => {
      if (filtroEstado !== 'todos' && pedido.estado !== filtroEstado) {
        return false;
      }
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          pedido.numero_pedido?.toLowerCase().includes(term) ||
          pedido.cliente_nombre?.toLowerCase().includes(term) ||
          pedido.cliente_telefono?.toLowerCase().includes(term) ||
          pedido.numero_mesa?.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
  }, [pedidos, filtroEstado, searchTerm]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        <FaExclamationTriangle style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error al cargar pedidos</h3>
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
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Modales de confirmación */}
      {showCancelConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmModal}>
            <div style={styles.confirmHeader}>
              <div style={{...styles.confirmIcon, backgroundColor: colors.warning + '20', color: colors.warning}}>
                <FaExclamationTriangle />
              </div>
              <h3 style={styles.confirmTitle}>¿Cancelar pedido?</h3>
            </div>
            <p style={styles.confirmText}>
              ¿Estás seguro de que deseas cancelar el pedido 
              <strong> #{pedidoSeleccionado?.numero_pedido || pedidoSeleccionado?.id}</strong>?
            </p>
            <div style={styles.confirmActions}>
              <button 
                onClick={() => {
                  setShowCancelConfirm(false);
                  toast.info('Cancelación cancelada');
                }}
                style={styles.confirmCancel}
              >
                <FaTimesCircle />
                No, mantener
              </button>
              <button 
                onClick={handleConfirmCancel}
                style={{...styles.confirmDelete, backgroundColor: colors.warning}}
              >
                <FaTimesCircle />
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmModal}>
            <div style={styles.confirmHeader}>
              <div style={{...styles.confirmIcon, backgroundColor: colors.danger + '20', color: colors.danger}}>
                <FaExclamationTriangle />
              </div>
              <h3 style={styles.confirmTitle}>¿Eliminar pedido?</h3>
            </div>
            <p style={styles.confirmText}>
              ¿Estás seguro de que deseas eliminar permanentemente el pedido 
              <strong> #{pedidoSeleccionado?.numero_pedido || pedidoSeleccionado?.id}</strong>?
              <br />
              <span style={{color: colors.danger, fontWeight: 'bold'}}>
                Esta acción no se puede deshacer.
              </span>
            </p>
            <div style={styles.confirmActions}>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  toast.info('Eliminación cancelada');
                }}
                style={styles.confirmCancel}
              >
                <FaTimesCircle />
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                style={styles.confirmDelete}
              >
                <FaTimesCircle />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <FaShoppingCart />
          </div>
          <div>
            <h1 style={styles.title}>Gestión de Pedidos</h1>
            <p style={styles.subtitle}>
              Administra y sigue el estado de todos los pedidos del restaurante
            </p>
          </div>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Total Pedidos</span>
            <span style={styles.statValue}>{stats.total}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Ventas Totales</span>
            <span style={styles.statValue}>
              ${stats.totalVentas.toFixed(2)}
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Hoy</span>
            <span style={styles.statValue}>
              {stats.pedidosHoy}
            </span>
          </div>
        </div>
      </div>

      {/* Funciones Rápidas */}
      <div style={styles.quickActions}>
        <div style={styles.quickActionsHeader}>
          <h3 style={styles.quickActionsTitle}>
            <FaFire style={styles.quickActionsIcon} />
            Funciones Rápidas
          </h3>
          <span style={styles.quickActionsSubtitle}>
            Acciones instantáneas para análisis rápido
          </span>
        </div>
        
        <div style={styles.quickActionsGrid}>
          <button
            onClick={filtrarPedidosHoy}
            style={styles.quickActionButton}
            title="Ver pedidos del día de hoy"
          >
            <div style={styles.quickActionIcon}>
              <FaCalendarDay />
            </div>
            <div style={styles.quickActionContent}>
              <span style={styles.quickActionTitle}>Pedidos Hoy</span>
              <span style={styles.quickActionSubtitle}>
                {stats.pedidosHoy} pedidos • ${stats.ventasHoy.toFixed(2)}
              </span>
            </div>
          </button>

          <button
            onClick={filtrarPedidosPendientes}
            style={styles.quickActionButton}
            title="Filtrar solo pedidos pendientes"
          >
            <div style={styles.quickActionIcon}>
              <FaClipboardList />
            </div>
            <div style={styles.quickActionContent}>
              <span style={styles.quickActionTitle}>Pendientes</span>
              <span style={styles.quickActionSubtitle}>
                {stats.pendientes} pedidos • ${stats.ventasPendientes.toFixed(2)}
              </span>
            </div>
          </button>

          <button
            onClick={verProductosMasVendidos}
            style={styles.quickActionButton}
            title="Ver top 5 productos más vendidos"
          >
            <div style={styles.quickActionIcon}>
              <FaChartPie />
            </div>
            <div style={styles.quickActionContent}>
              <span style={styles.quickActionTitle}>Top Productos</span>
              <span style={styles.quickActionSubtitle}>
                {stats.productosMasVendidos.length} productos
              </span>
            </div>
          </button>

          <button
  onClick={generarResumenDiaPDF}
  style={styles.quickActionButton}
  title="Generar reporte PDF del día"
>
  <div style={styles.quickActionIcon}>
    
  </div>
  <div style={styles.quickActionContent}>
    <span style={styles.quickActionTitle}>Reporte del Día</span>
    <span style={styles.quickActionSubtitle}>
      PDF con estadísticas
    </span>
  </div>
</button>

          

          <button
            onClick={verEstadisticasProductos}
            style={styles.quickActionButton}
            title="Ver estadísticas detalladas de productos"
          >
            <div style={styles.quickActionIcon}>
              <FaListAlt />
            </div>
            <div style={styles.quickActionContent}>
              <span style={styles.quickActionTitle}>Estadísticas</span>
              <span style={styles.quickActionSubtitle}>
                Análisis de productos
              </span>
            </div>
          </button>

          <button
            onClick={verRendimientoHoy}
            style={styles.quickActionButton}
            title="Ver rendimiento y eficiencia del día"
          >
            <div style={styles.quickActionIcon}>
              <FaChartBar />
            </div>
            <div style={styles.quickActionContent}>
              <span style={styles.quickActionTitle}>Rendimiento</span>
              <span style={styles.quickActionSubtitle}>
                Eficiencia del día
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsContainer}>
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, backgroundColor: '#fef3c7', borderColor: '#f59e0b'}}>
            <div style={styles.statIcon}>
              <FaClock style={{color: '#f59e0b'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.pendientes}</span>
              <span style={styles.statName}>Pendientes</span>
              <span style={styles.statSub}>${stats.ventasPendientes.toFixed(2)}</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#dbeafe', borderColor: '#3b82f6'}}>
            <div style={styles.statIcon}>
              <FaUtensils style={{color: '#3b82f6'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.enPreparacion}</span>
              <span style={styles.statName}>En Preparación</span>
              <span style={styles.statSub}>En proceso</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#d1fae5', borderColor: '#10b981'}}>
            <div style={styles.statIcon}>
              <FaCheckCircle style={{color: '#10b981'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.listos}</span>
              <span style={styles.statName}>Listos</span>
              <span style={styles.statSub}>Para entregar</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#f3f4f6', borderColor: '#6b7280'}}>
            <div style={styles.statIcon}>
              <FaTruck style={{color: '#6b7280'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.entregados}</span>
              <span style={styles.statName}>Entregados</span>
              <span style={styles.statSub}>${stats.ventasEntregados.toFixed(2)}</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#fee2e2', borderColor: '#dc2626'}}>
            <div style={styles.statIcon}>
              <FaTimesCircle style={{color: '#dc2626'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.cancelados}</span>
              <span style={styles.statName}>Cancelados</span>
              <span style={styles.statSub}>No facturado</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#f0f7ff', borderColor: '#2c5aa0'}}>
            <div style={styles.statIcon}>
              <FaChartBar style={{color: '#2c5aa0'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>${stats.totalVentas.toFixed(2)}</span>
              <span style={styles.statName}>Ventas Totales</span>
              <span style={styles.statSub}>Acumulado</span>
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
          <div style={styles.resultsSection}>
            <span style={styles.resultsCount}>
              {pedidosFiltrados.length} de {pedidos.length} pedidos
            </span>
            <button
              onClick={handleRefresh}
              style={styles.refreshButton}
              disabled={refreshing}
              title="Actualizar pedidos"
            >
              <FaSync style={refreshing ? {animation: 'spin 1s linear infinite'} : {}} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
        
        <div style={styles.filtersContent}>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por número, cliente, teléfono o mesa..."
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
                <FaTimesCircle />
              </button>
            )}
          </div>
          
          <div style={styles.filtersRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Filtrar por Estado</label>
              <div style={styles.statusFilters}>
                <button
                  onClick={() => setFiltroEstado('todos')}
                  style={{
                    ...styles.statusButton,
                    ...(filtroEstado === 'todos' ? styles.statusButtonActive : {})
                  }}
                >
                  Todos ({stats.total})
                </button>
                
                <button
                  onClick={() => setFiltroEstado('pendiente')}
                  style={{
                    ...styles.statusButton,
                    ...(filtroEstado === 'pendiente' ? styles.statusButtonActive : {}),
                    backgroundColor: filtroEstado === 'pendiente' ? '#fef3c7' : colors.background,
                    borderColor: '#f59e0b',
                    color: filtroEstado === 'pendiente' ? '#92400e' : colors.text.secondary
                  }}
                >
                  Pendientes ({stats.pendientes})
                </button>
                
                <button
                  onClick={() => setFiltroEstado('en_preparacion')}
                  style={{
                    ...styles.statusButton,
                    ...(filtroEstado === 'en_preparacion' ? styles.statusButtonActive : {}),
                    backgroundColor: filtroEstado === 'en_preparacion' ? '#dbeafe' : colors.background,
                    borderColor: '#3b82f6',
                    color: filtroEstado === 'en_preparacion' ? '#1e40af' : colors.text.secondary
                  }}
                >
                  En Prep. ({stats.enPreparacion})
                </button>
                
                <button
                  onClick={() => setFiltroEstado('listo')}
                  style={{
                    ...styles.statusButton,
                    ...(filtroEstado === 'listo' ? styles.statusButtonActive : {}),
                    backgroundColor: filtroEstado === 'listo' ? '#d1fae5' : colors.background,
                    borderColor: '#10b981',
                    color: filtroEstado === 'listo' ? '#065f46' : colors.text.secondary
                  }}
                >
                  Listos ({stats.listos})
                </button>
                
                <button
                  onClick={() => setFiltroEstado('entregado')}
                  style={{
                    ...styles.statusButton,
                    ...(filtroEstado === 'entregado' ? styles.statusButtonActive : {}),
                    backgroundColor: filtroEstado === 'entregado' ? '#f3f4f6' : colors.background,
                    borderColor: '#6b7280',
                    color: filtroEstado === 'entregado' ? '#374151' : colors.text.secondary
                  }}
                >
                  Entregados ({stats.entregados})
                </button>
                
                <button
                  onClick={() => setFiltroEstado('cancelado')}
                  style={{
                    ...styles.statusButton,
                    ...(filtroEstado === 'cancelado' ? styles.statusButtonActive : {}),
                    backgroundColor: filtroEstado === 'cancelado' ? '#fee2e2' : colors.background,
                    borderColor: '#dc2626',
                    color: filtroEstado === 'cancelado' ? '#991b1b' : colors.text.secondary
                  }}
                >
                  Cancelados ({stats.cancelados})
                </button>
              </div>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Acciones</label>
              <div style={styles.actionsGroup}>
                <button
                  onClick={clearFilters}
                  style={styles.actionButton}
                  disabled={!searchTerm && filtroEstado === 'todos'}
                  title="Limpiar todos los filtros"
                >
                  <FaTimesCircle />
                  <span>Limpiar Filtros</span>
                </button>
                <button
                  onClick={() => handleImprimirPDF(pedidosFiltrados[0])}
                  style={styles.printButton}
                  disabled={pedidosFiltrados.length === 0}
                  title="Imprimir reporte"
                >
                  <FaPrint />
                  <span>Reporte</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div style={styles.pedidosContainer}>
        {pedidosFiltrados.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <FaShoppingCart />
            </div>
            <h3 style={styles.emptyTitle}>
              {searchTerm || filtroEstado !== 'todos' 
                ? 'No se encontraron pedidos' 
                : 'No hay pedidos registrados'}
            </h3>
            <p style={styles.emptyText}>
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : filtroEstado !== 'todos'
                ? 'No hay pedidos en este estado'
                : 'Cuando los clientes realicen pedidos, aparecerán aquí'}
            </p>
            {(searchTerm || filtroEstado !== 'todos') && (
              <button
                onClick={clearFilters}
                style={styles.clearFiltersButton}
              >
                Limpiar filtros
              </button>
            )}
            <div style={styles.emptyActions}>
              <button
                onClick={handleRefresh}
                style={styles.refreshButton}
              >
                <FaSync />
                Actualizar
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.pedidosGrid}>
            {pedidosFiltrados.map(pedido => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onVerDetalle={handleVerDetalle}
                onCambiarEstado={handleCambiarEstado}
                onCancelar={handleCancelarClick}
                onImprimirPDF={handleImprimirPDF}
                onEliminar={handleEliminarClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {pedidoDetalle && (
        <PedidoDetalleModal
          pedido={pedidoDetalle}
          productos={productosDetalle}
          onClose={handleCerrarDetalle}
          loading={cargandoDetalle}
          onImprimirPDF={handleImprimirPDF}
          onCancelar={handleCancelarClick}
          onCambiarEstado={handleCambiarEstado}
        />
      )}

      {/* Loading para detalle */}
      {cargandoDetalle && (
        <div style={styles.detailLoading}>
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Cargando detalle del pedido...</p>
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
    marginBottom: '24px',
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
    marginBottom: '4px',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.primary
  },
  
  // Funciones Rápidas
  quickActions: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    border: `1px solid ${colors.border}`
  },
  quickActionsHeader: {
    marginBottom: '20px'
  },
  quickActionsTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  quickActionsIcon: {
    color: colors.danger
  },
  quickActionsSubtitle: {
    fontSize: '14px',
    color: colors.text.secondary,
    margin: 0
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  quickActionButton: {
    backgroundColor: colors.card,
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%'
  },
  quickActionIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: colors.primary + '10',
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    fontSize: '20px',
    flexShrink: 0
  },
  quickActionContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  quickActionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: colors.text.primary
  },
  quickActionSubtitle: {
    fontSize: '12px',
    color: colors.text.secondary,
    fontWeight: '500'
  },
  
  // Estadísticas
  statsContainer: {
    marginBottom: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  statCard: {
    backgroundColor: colors.card,
    border: `2px solid`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    fontSize: '24px',
    flexShrink: 0
  },
  statContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  statCount: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: '1.2'
  },
  statName: {
    fontSize: '14px',
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: '4px'
  },
  statSub: {
    fontSize: '12px',
    color: colors.text.light,
    fontWeight: '500'
  },
  
  // Filtros
  filtersContainer: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
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
    outline: 'none'
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
    padding: '4px'
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
    minWidth: '300px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text.primary
  },
  statusFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  statusButton: {
    padding: '10px 16px',
    border: `2px solid`,
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: colors.background,
    color: colors.text.secondary,
    flex: 1,
    minWidth: '120px',
    textAlign: 'center'
  },
  statusButtonActive: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  actionsGroup: {
    display: 'flex',
    gap: '12px'
  },
  actionButton: {
    backgroundColor: colors.background,
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
    transition: 'all 0.2s ease',
    flex: 1
  },
  printButton: {
    backgroundColor: colors.info,
    color: '#ffffff',
    border: 'none',
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
  
  // Pedidos Container
  pedidosContainer: {
    marginBottom: '32px'
  },
  pedidosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px'
  },
  
  // Empty State
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '60px 32px',
    textAlign: 'center',
    border: `2px dashed ${colors.border}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
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
    marginTop: '20px'
  },
  clearFiltersButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    margin: '0 8px'
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
    zIndex: 10000,
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s ease-out'
  },
  confirmModal: {
    backgroundColor: colors.card,
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'modalSlideIn 0.3s ease-out'
  },
  confirmHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  },
  confirmIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px'
  },
  confirmTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    textAlign: 'center'
  },
  confirmText: {
    fontSize: '16px',
    color: colors.text.secondary,
    lineHeight: '1.6',
    marginBottom: '32px',
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
    padding: '14px',
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
    padding: '14px',
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
  detailLoading: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    backdropFilter: 'blur(4px)'
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
    color: '#ffffff',
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
    color: colors.danger,
    marginBottom: '16px'
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
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};

// Inyectar animaciones CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
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
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .stat-card:hover,
    .quick-action-button:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    
    .quick-action-button:hover {
      border-color: ${colors.primary};
      background-color: ${colors.primary + '05'};
    }
  `;
  document.head.appendChild(styleSheet);
}

export default PedidosPage;