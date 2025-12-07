// src/pages/PedidosPage.jsx
import React, { useState, useEffect } from 'react';
import { usePedidos } from '../Hooks/usePedidos';
import PedidoCard from '../components/Pedidos/PedidosCards'; // Corregí el nombre del import
import PedidoDetalleModal from '../components/Pedidos/PedidoDetalleModal';
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
  FaExclamationTriangle
} from 'react-icons/fa';

const PedidosPage = () => {
  const { 
    pedidos, 
    loading, 
    error, 
    cambiarEstado, 
    cancelarPedido, 
    eliminarPedido,
    obtenerDetallePedido 
  } = usePedidos();

  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [productosDetalle, setProductosDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Calcular estadísticas
  const stats = {
    total: pedidos.length,
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    enPreparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
    listos: pedidos.filter(p => p.estado === 'listo').length,
    entregados: pedidos.filter(p => p.estado === 'entregado').length,
    cancelados: pedidos.filter(p => p.estado === 'cancelado').length,
    totalVentas: pedidos.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0)
  };

  useEffect(() => {
    console.log('📊 Pedidos cargados:', pedidos.length);
  }, [pedidos]);

  // Función para generar contenido PDF mejorado
  const generarPDFContenido = (pedido) => {
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

  const handleImprimirPDF = (pedido) => {
    try {
      // Abrir ventana para imprimir
      const ventana = window.open('', '_blank', 'width=800,height=600');
      
      // Cargar contenido HTML con el PDF
      ventana.document.open();
      ventana.document.write(generarPDFContenido(pedido));
      ventana.document.close();
      
      // Esperar a que cargue el contenido y luego imprimir
      ventana.onload = function() {
        setTimeout(() => {
          ventana.focus();
          ventana.print();
          // Cerrar ventana después de imprimir
          setTimeout(() => {
            if (!ventana.closed) {
              ventana.close();
            }
          }, 500);
        }, 500);
      };
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    if (window.confirm(`¿Cambiar estado del pedido a "${nuevoEstado}"?`)) {
      const result = await cambiarEstado(id, nuevoEstado);
      if (result.success) {
        alert('✅ Estado actualizado exitosamente');
      } else {
        alert(`❌ ${result.error}`);
      }
    }
  };

  const handleCancelar = async (id) => {
    if (window.confirm('¿Estás seguro de cancelar este pedido?')) {
      const result = await cancelarPedido(id);
      if (result.success) {
        alert('✅ Pedido cancelado exitosamente');
      } else {
        alert(`❌ ${result.error}`);
      }
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.')) {
      const result = await eliminarPedido(id);
      if (result.success) {
        alert('✅ Pedido eliminado exitosamente');
      } else {
        alert(`❌ ${result.error}`);
      }
    }
  };

  const handleVerDetalle = async (pedido) => {
    console.log('🔍 Viendo detalle del pedido:', pedido);
    setCargandoDetalle(true);
    setPedidoDetalle(pedido);
    
    const result = await obtenerDetallePedido(pedido.id);
    if (result.success) {
      console.log('✅ Detalle cargado:', result.data);
      setProductosDetalle(result.data);
    } else {
      alert(`❌ ${result.error}`);
      setPedidoDetalle(null);
    }
    
    setCargandoDetalle(false);
  };

  const handleCerrarDetalle = () => {
    setPedidoDetalle(null);
    setProductosDetalle(null);
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    // Filtrar por estado
    if (filtroEstado !== 'todos' && pedido.estado !== filtroEstado) {
      return false;
    }
    
    // Filtrar por búsqueda
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FaExclamationTriangle style={styles.errorIcon} />
        <h3 style={styles.errorTitle}>Error al cargar pedidos</h3>
        <p style={styles.errorText}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={styles.retryButton}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
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
            <span style={styles.statLabel}>Total Ventas</span>
            <span style={styles.statValue}>
              ${stats.totalVentas.toFixed(2)}
            </span>
          </div>
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
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#dbeafe', borderColor: '#3b82f6'}}>
            <div style={styles.statIcon}>
              <FaUtensils style={{color: '#3b82f6'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.enPreparacion}</span>
              <span style={styles.statName}>En Preparación</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#d1fae5', borderColor: '#10b981'}}>
            <div style={styles.statIcon}>
              <FaCheckCircle style={{color: '#10b981'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.listos}</span>
              <span style={styles.statName}>Listos</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#f3f4f6', borderColor: '#6b7280'}}>
            <div style={styles.statIcon}>
              <FaTruck style={{color: '#6b7280'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.entregados}</span>
              <span style={styles.statName}>Entregados</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#fee2e2', borderColor: '#dc2626'}}>
            <div style={styles.statIcon}>
              <FaTimesCircle style={{color: '#dc2626'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>{stats.cancelados}</span>
              <span style={styles.statName}>Cancelados</span>
            </div>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: '#f0f7ff', borderColor: '#2c5aa0'}}>
            <div style={styles.statIcon}>
              <FaChartBar style={{color: '#2c5aa0'}} />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statCount}>${stats.totalVentas.toFixed(2)}</span>
              <span style={styles.statName}>Ventas Totales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>
            <FaFilter style={styles.filtersIcon} />
            Filtros
          </h3>
          <span style={styles.resultsCount}>
            {pedidosFiltrados.length} de {pedidos.length} pedidos
          </span>
        </div>
        
        <div style={styles.filtersContent}>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por número, cliente o mesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.statusFilters}>
            <button
              onClick={() => setFiltroEstado('todos')}
              style={{
                ...styles.statusButton,
                ...(filtroEstado === 'todos' ? styles.statusButtonActive : {})
              }}
            >
              Todos
            </button>
            
            <button
              onClick={() => setFiltroEstado('pendiente')}
              style={{
                ...styles.statusButton,
                ...(filtroEstado === 'pendiente' ? styles.statusButtonActive : {}),
                backgroundColor: filtroEstado === 'pendiente' ? '#fef3c7' : '#ffffff',
                borderColor: '#f59e0b'
              }}
            >
              Pendientes
            </button>
            
            <button
              onClick={() => setFiltroEstado('en_preparacion')}
              style={{
                ...styles.statusButton,
                ...(filtroEstado === 'en_preparacion' ? styles.statusButtonActive : {}),
                backgroundColor: filtroEstado === 'en_preparacion' ? '#dbeafe' : '#ffffff',
                borderColor: '#3b82f6'
              }}
            >
              En Preparación
            </button>
            
            <button
              onClick={() => setFiltroEstado('listo')}
              style={{
                ...styles.statusButton,
                ...(filtroEstado === 'listo' ? styles.statusButtonActive : {}),
                backgroundColor: filtroEstado === 'listo' ? '#d1fae5' : '#ffffff',
                borderColor: '#10b981'
              }}
            >
              Listos
            </button>
            
            <button
              onClick={() => setFiltroEstado('entregado')}
              style={{
                ...styles.statusButton,
                ...(filtroEstado === 'entregado' ? styles.statusButtonActive : {}),
                backgroundColor: filtroEstado === 'entregado' ? '#f3f4f6' : '#ffffff',
                borderColor: '#6b7280'
              }}
            >
              Entregados
            </button>
            
            <button
              onClick={() => setFiltroEstado('cancelado')}
              style={{
                ...styles.statusButton,
                ...(filtroEstado === 'cancelado' ? styles.statusButtonActive : {}),
                backgroundColor: filtroEstado === 'cancelado' ? '#fee2e2' : '#ffffff',
                borderColor: '#dc2626'
              }}
            >
              Cancelados
            </button>
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
                onClick={() => {
                  setSearchTerm('');
                  setFiltroEstado('todos');
                }}
                style={styles.clearFiltersButton}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div style={styles.pedidosGrid}>
            {pedidosFiltrados.map(pedido => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onVerDetalle={handleVerDetalle}
                onCambiarEstado={handleCambiarEstado}
                onCancelar={handleCancelar}
                onImprimirPDF={handleImprimirPDF}
                onEliminar={handleEliminar}
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
    minHeight: '100vh'
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
    fontSize: '28px'
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
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.primary
  },
  
  // Estadísticas
  statsContainer: {
    marginBottom: '32px'
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
    transition: 'all 0.2s ease'
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
    fontWeight: '600'
  },
  
  // Filtros
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
    padding: '12px 16px 12px 48px',
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
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
  statusFilters: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  statusButton: {
    padding: '10px 20px',
    border: `2px solid`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: colors.card,
    color: colors.text.primary
  },
  statusButtonActive: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
    border: `2px dashed ${colors.border}`
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
  clearFiltersButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: colors.primaryLight
    }
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
    margin: '0 0 24px 0',
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
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: colors.primaryLight
    }
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
    
    button:hover {
      transform: translateY(-1px);
      opacity: 0.9;
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default PedidosPage;