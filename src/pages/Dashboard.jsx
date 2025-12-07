import React, { useState, useEffect } from 'react';
import { 
  FaBox, FaUtensils, FaClipboardList, FaDollarSign, 
  FaClock, FaCheckCircle, FaFire, FaStar,
  FaArrowUp, FaArrowDown, FaShoppingCart, FaChartBar,
  FaChartLine, FaUsers, FaHourglassHalf, FaCalendarDay
} from 'react-icons/fa';

// Paleta de colores
const colors = {
  primary: '#2c5aa0',
  primaryLight: '#3a6bc5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

const Dashboard = () => {
  // Datos de ejemplo para la demostración
  const user = { nombre: 'Admin' };
  const categorias = [
    { id: 1, nombre: 'Entradas' },
    { id: 2, nombre: 'Platos Fuertes' },
    { id: 3, nombre: 'Bebidas' },
    { id: 4, nombre: 'Postres' }
  ];
  
  const productos = [
    { id: 1, nombre: 'Pizza Margarita', precio: 12.99, disponible: true, destacado: true, imagen: null },
    { id: 2, nombre: 'Hamburguesa Clásica', precio: 9.99, disponible: true, destacado: true, imagen: null },
    { id: 3, nombre: 'Ensalada César', precio: 7.99, disponible: true, destacado: true, imagen: null },
    { id: 4, nombre: 'Pasta Alfredo', precio: 11.99, disponible: false, destacado: true, imagen: null },
    { id: 5, nombre: 'Tacos al Pastor', precio: 8.99, disponible: true, destacado: false, imagen: null }
  ];
  
  const pedidos = [
    { id: 1, numero_pedido: '001', cliente_nombre: 'Juan Pérez', numero_mesa: 5, total: 45.50, estado: 'entregado', fecha_pedido: new Date().toISOString() },
    { id: 2, numero_pedido: '002', cliente_nombre: 'María García', numero_mesa: 3, total: 32.00, estado: 'pendiente', fecha_pedido: new Date().toISOString() },
    { id: 3, numero_pedido: '003', cliente_nombre: 'Carlos López', numero_mesa: 8, total: 28.75, estado: 'en_preparacion', fecha_pedido: new Date().toISOString() },
    { id: 4, numero_pedido: '004', cliente_nombre: 'Ana Martínez', numero_mesa: 2, total: 55.20, estado: 'listo', fecha_pedido: new Date().toISOString() },
    { id: 5, numero_pedido: '005', cliente_nombre: 'Luis Rodríguez', numero_mesa: 7, total: 41.90, estado: 'entregado', fecha_pedido: new Date(Date.now() - 86400000).toISOString() },
    { id: 6, numero_pedido: '006', cliente_nombre: 'Sofia Torres', numero_mesa: 1, total: 38.00, estado: 'entregado', fecha_pedido: new Date().toISOString() },
    { id: 7, numero_pedido: '007', cliente_nombre: 'Diego Ramírez', numero_mesa: 4, total: 22.50, estado: 'cancelado', fecha_pedido: new Date().toISOString() },
    { id: 8, numero_pedido: '008', cliente_nombre: 'Laura Fernández', numero_mesa: 6, total: 49.80, estado: 'entregado', fecha_pedido: new Date(Date.now() - 86400000).toISOString() }
  ];

  // Cálculos
  const hoy = new Date();
  const pedidosHoy = pedidos.filter(p => {
    const fechaPedido = new Date(p.fecha_pedido);
    return fechaPedido.toDateString() === hoy.toDateString();
  });

  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  const pedidosAyer = pedidos.filter(p => {
    const fechaPedido = new Date(p.fecha_pedido);
    return fechaPedido.toDateString() === ayer.toDateString();
  });

  const pedidosPendientes = pedidos.filter(p => 
    p.estado === 'pendiente' || p.estado === 'en_preparacion'
  );

  const pedidosCompletados = pedidos.filter(p => p.estado === 'entregado');
  
  const totalVentas = pedidosCompletados.reduce((sum, p) => 
    sum + parseFloat(p.total || 0), 0
  );

  const ventasHoy = pedidosHoy
    .filter(p => p.estado === 'entregado')
    .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

  const ventasAyer = pedidosAyer
    .filter(p => p.estado === 'entregado')
    .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

  const cambioVentas = ventasAyer > 0 
    ? ((ventasHoy - ventasAyer) / ventasAyer * 100).toFixed(1)
    : 0;

  const productosDisponibles = productos.filter(p => p.disponible).length;
  const productosAgotados = productos.filter(p => !p.disponible).length;

  const estadosPedidos = {
    pendiente: pedidos.filter(p => p.estado === 'pendiente').length,
    preparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
    listo: pedidos.filter(p => p.estado === 'listo').length,
    entregado: pedidosCompletados.length,
    cancelado: pedidos.filter(p => p.estado === 'cancelado').length
  };

  const ticketPromedio = pedidosCompletados.length > 0
    ? totalVentas / pedidosCompletados.length
    : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Panel de Control</h1>
          <p style={styles.subtitle}>
            Bienvenido, {user?.nombre || 'Usuario'}
          </p>
        </div>
        <div style={styles.dateDisplay}>
          <FaCalendarDay style={styles.dateIcon} />
          <div style={styles.dateInfo}>
            <div style={styles.dateText}>
              {hoy.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div style={styles.statsGrid}>
        <StatCard
          title="Ventas Hoy"
          value={`$${ventasHoy.toFixed(2)}`}
          change={cambioVentas}
          icon={<FaDollarSign />}
          iconBg={colors.primary}
          iconColor="#ffffff"
          subtitle={`${pedidosHoy.filter(p => p.estado === 'entregado').length} pedidos`}
        />
        <StatCard
          title="Pedidos Activos"
          value={pedidosPendientes.length}
          icon={<FaClipboardList />}
          iconBg={colors.warning}
          iconColor="#ffffff"
          subtitle="Por atender"
        />
        <StatCard
          title="Productos Disponibles"
          value={productosDisponibles}
          icon={<FaUtensils />}
          iconBg={colors.success}
          iconColor="#ffffff"
          subtitle={`${productosAgotados} agotados`}
        />
        <StatCard
          title="Categorías"
          value={categorias.length}
          icon={<FaBox />}
          iconBg={colors.info}
          iconColor="#ffffff"
          subtitle="Activas"
        />
      </div>

      {/* Contenido Principal */}
      <div style={styles.contentGrid}>
        {/* Estado de Pedidos */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Distribución de Pedidos</h3>
              <p style={styles.cardSubtitle}>Estado actual</p>
            </div>
            <div style={styles.totalBadge}>
              Total: {pedidos.length}
            </div>
          </div>
          <div style={styles.cardContent}>
            {Object.entries(estadosPedidos).map(([estado, cantidad]) => {
              const porcentaje = pedidos.length > 0 ? (cantidad / pedidos.length) * 100 : 0;
              const color = getEstadoColor(estado);
              
              return (
                <div key={estado} style={styles.progressItem}>
                  <div style={styles.progressHeader}>
                    <div style={styles.progressLabel}>
                      <span style={{ ...styles.dot, backgroundColor: color }} />
                      <span style={styles.progressText}>
                        {formatEstado(estado)}
                      </span>
                    </div>
                    <div style={styles.progressStats}>
                      <span style={styles.progressValue}>{cantidad}</span>
                      <span style={styles.progressPercentage}>{porcentaje.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div style={styles.progressBar}>
                    <div 
                      style={{ 
                        ...styles.progressFill,
                        width: `${porcentaje}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pedidos Recientes */}
        <div style={{ ...styles.card, gridColumn: 'span 2' }}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Pedidos Recientes</h3>
              <p style={styles.cardSubtitle}>Últimos pedidos del sistema</p>
            </div>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Pedido</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.slice(0, 6).map(pedido => (
                    <tr key={pedido.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.pedidoNumero}>
                          #{pedido.numero_pedido}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div>
                          <div style={styles.clienteNombre}>
                            {pedido.cliente_nombre || 'Cliente'}
                          </div>
                          {pedido.numero_mesa && (
                            <div style={styles.mesaText}>
                              Mesa {pedido.numero_mesa}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.totalAmount}>
                          ${parseFloat(pedido.total || 0).toFixed(2)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: getEstadoColor(pedido.estado),
                          color: '#ffffff'
                        }}>
                          {formatEstado(pedido.estado)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.timeCell}>
                          <FaClock style={styles.timeIcon} />
                          {new Date(pedido.fecha_pedido).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Métricas Clave */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Métricas Clave</h3>
              <p style={styles.cardSubtitle}>Rendimiento del sistema</p>
            </div>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.metricasGrid}>
              <MetricItem
                label="Ticket Promedio"
                value={`$${ticketPromedio.toFixed(2)}`}
                icon={<FaShoppingCart />}
                color={colors.primary}
              />
              <MetricItem
                label="Pedidos Completados"
                value={pedidosCompletados.length}
                icon={<FaCheckCircle />}
                color={colors.success}
              />
              <MetricItem
                label="Total Ventas"
                value={`$${totalVentas.toFixed(2)}`}
                icon={<FaChartLine />}
                color={colors.warning}
              />
              <MetricItem
                label="Tasa de Éxito"
                value={`${pedidos.length > 0 ? Math.round((pedidosCompletados.length / pedidos.length) * 100) : 0}%`}
                icon={<FaStar />}
                color={colors.info}
              />
            </div>
          </div>
        </div>

        {/* Productos Destacados */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Productos Destacados</h3>
              <p style={styles.cardSubtitle}>Los más populares</p>
            </div>
            <FaFire style={{ color: colors.danger, fontSize: '18px' }} />
          </div>
          <div style={styles.cardContent}>
            {productos.filter(p => p.destacado).slice(0, 4).map(producto => (
              <div key={producto.id} style={styles.productoItem}>
                <div style={styles.productoImage}>
                  {producto.imagen ? (
                    <img src={producto.imagen} alt={producto.nombre} style={styles.img} />
                  ) : (
                    <div style={styles.placeholder}>
                      <FaUtensils />
                    </div>
                  )}
                </div>
                <div style={styles.productoInfo}>
                  <div style={styles.productoNombre}>{producto.nombre}</div>
                  <div style={styles.productoPrecio}>
                    ${parseFloat(producto.precio).toFixed(2)}
                  </div>
                </div>
                <div style={{
                  ...styles.disponibleIndicator,
                  backgroundColor: producto.disponible ? colors.success : colors.danger
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Resumen Rápido */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Resumen del Día</h3>
              <p style={styles.cardSubtitle}>Vista general</p>
            </div>
          </div>
          <div style={styles.cardContent}>
            <QuickStat
              icon={<FaUsers />}
              label="Pedidos Hoy"
              value={pedidosHoy.length}
              color={colors.primary}
            />
            <QuickStat
              icon={<FaHourglassHalf />}
              label="En Espera"
              value={estadosPedidos.pendiente}
              color={colors.warning}
            />
            <QuickStat
              icon={<FaCheckCircle />}
              label="Completados Hoy"
              value={pedidosHoy.filter(p => p.estado === 'entregado').length}
              color={colors.success}
            />
            <QuickStat
              icon={<FaChartBar />}
              label="Tasa de Hoy"
              value={`${pedidosHoy.length > 0 ? Math.round((pedidosHoy.filter(p => p.estado === 'entregado').length / pedidosHoy.length) * 100) : 0}%`}
              color={colors.info}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente StatCard
const StatCard = ({ title, value, change, icon, iconBg, iconColor, subtitle }) => (
  <div style={styles.statCard}>
    <div style={styles.statHeader}>
      <div style={{ ...styles.statIcon, backgroundColor: iconBg }}>
        <div style={{ color: iconColor }}>{icon}</div>
      </div>
      {change && (
        <div style={{
          ...styles.changeBadge,
          backgroundColor: change >= 0 ? `${colors.success}20` : `${colors.danger}20`,
          color: change >= 0 ? colors.success : colors.danger
        }}>
          {change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div style={styles.statBody}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
      {subtitle && (
        <div style={styles.statSubtitle}>{subtitle}</div>
      )}
    </div>
  </div>
);

// Componente MetricItem
const MetricItem = ({ label, value, icon, color }) => (
  <div style={styles.metricItem}>
    <div style={{ ...styles.metricIcon, color }}>
      {icon}
    </div>
    <div style={styles.metricContent}>
      <div style={styles.metricValue}>{value}</div>
      <div style={styles.metricLabel}>{label}</div>
    </div>
  </div>
);

// Componente QuickStat
const QuickStat = ({ icon, label, value, color }) => (
  <div style={styles.quickStatItem}>
    <div style={{ ...styles.quickStatIcon, color }}>
      {icon}
    </div>
    <div style={styles.quickStatContent}>
      <div style={styles.quickStatValue}>{value}</div>
      <div style={styles.quickStatLabel}>{label}</div>
    </div>
  </div>
);

// Helper functions
const getEstadoColor = (estado) => {
  const estadoColors = {
    pendiente: colors.warning,
    en_preparacion: colors.info,
    preparacion: colors.info,
    listo: colors.primaryLight,
    entregado: colors.success,
    cancelado: colors.danger
  };
  return estadoColors[estado] || colors.gray[500];
};

const formatEstado = (estado) => {
  const nombres = {
    pendiente: 'Pendiente',
    en_preparacion: 'En Prep.',
    preparacion: 'En Prep.',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  };
  return nombres[estado] || estado;
};

// Estilos Mejorados
const styles = {
  container: {
    padding: '24px',
    backgroundColor: colors.gray[50],
    minHeight: '100vh'
  },
  
  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: colors.gray[900],
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: colors.gray[600],
    margin: 0
  },
  dateDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: colors.gray[100],
    border: `1px solid ${colors.gray[200]}`
  },
  dateIcon: {
    fontSize: '18px',
    color: colors.gray[600]
  },
  dateInfo: {},
  dateText: {
    fontSize: '14px',
    fontWeight: '500',
    color: colors.gray[700]
  },
  
  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    border: `1px solid ${colors.gray[200]}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  changeBadge: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  statBody: {},
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: '8px'
  },
  statTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: '4px'
  },
  statSubtitle: {
    fontSize: '13px',
    color: colors.gray[500]
  },
  
  // Content Grid
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px'
  },
  
  // Card
  card: {
    backgroundColor: '#ffffff',
    border: `1px solid ${colors.gray[200]}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  cardHeader: {
    padding: '20px',
    borderBottom: `1px solid ${colors.gray[200]}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: colors.gray[900],
    margin: '0 0 4px 0'
  },
  cardSubtitle: {
    fontSize: '13px',
    color: colors.gray[500],
    margin: 0
  },
  totalBadge: {
    backgroundColor: colors.gray[100],
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
    color: colors.gray[700]
  },
  cardContent: {
    padding: '20px'
  },
  
  // Progress Items
  progressItem: {
    marginBottom: '16px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  progressLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  dot: {
    width: '10px',
    height: '10px'
  },
  progressText: {
    fontSize: '14px',
    fontWeight: '500',
    color: colors.gray[700]
  },
  progressStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  progressValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.gray[900]
  },
  progressPercentage: {
    fontSize: '13px',
    color: colors.gray[500]
  },
  progressBar: {
    height: '6px',
    backgroundColor: colors.gray[200],
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  
  // Table
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: colors.gray[600],
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `2px solid ${colors.gray[200]}`
  },
  tr: {
    borderBottom: `1px solid ${colors.gray[200]}`,
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: colors.gray[50]
    }
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: colors.gray[800]
  },
  pedidoNumero: {
    fontWeight: '600',
    color: colors.gray[900]
  },
  clienteNombre: {
    fontWeight: '500',
    color: colors.gray[900],
    marginBottom: '4px'
  },
  mesaText: {
    fontSize: '12px',
    color: colors.gray[500]
  },
  totalAmount: {
    fontWeight: '600',
    color: colors.gray[900]
  },
  statusBadge: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  timeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: colors.gray[600]
  },
  timeIcon: {
    fontSize: '12px'
  },
  
  // Metricas Grid
  metricasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: colors.gray[50],
    border: `1px solid ${colors.gray[200]}`
  },
  metricIcon: {
    fontSize: '20px'
  },
  metricContent: {
    flex: 1
  },
  metricValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: '2px'
  },
  metricLabel: {
    fontSize: '12px',
    color: colors.gray[600]
  },
  
  // Productos
  productoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: `1px solid ${colors.gray[200]}`,
    ':last-child': {
      borderBottom: 'none'
    }
  },
  productoImage: {
    width: '48px',
    height: '48px',
    backgroundColor: colors.gray[200],
    overflow: 'hidden',
    flexShrink: 0
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.gray[400]
  },
  productoInfo: {
    flex: 1
  },
  productoNombre: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: '2px'
  },
  productoPrecio: {
    fontSize: '13px',
    color: colors.gray[700],
    fontWeight: '600'
  },
  disponibleIndicator: {
    width: '8px',
    height: '8px'
  },
  
  // Quick Stats
  quickStatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: `1px solid ${colors.gray[200]}`,
    ':last-child': {
      borderBottom: 'none'
    }
  },
  quickStatIcon: {
    fontSize: '18px'
  },
  quickStatContent: {
    flex: 1
  },
  quickStatValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: '2px'
  },
  quickStatLabel: {
    fontSize: '13px',
    color: colors.gray[600]
  }
};

export default Dashboard;