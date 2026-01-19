import React, { useState, useEffect } from 'react';
import { 
  FaBox, FaUtensils, FaClipboardList, FaDollarSign, 
  FaClock, FaCheckCircle, FaFire, FaStar,
  FaArrowUp, FaArrowDown, FaShoppingCart, FaChartBar,
  FaChartLine, FaUsers, FaHourglassHalf, FaCalendarDay,
  FaExclamationTriangle, FaSpinner
} from 'react-icons/fa';
import { pedidoService, productoService, categoriaService } from '../services/api';
import { useAuth } from '../AuthContext';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para datos reales
  const [estadisticas, setEstadisticas] = useState({
    ventasHoy: 0,
    ventasAyer: 0,
    pedidosActivos: 0,
    pedidosHoy: 0,
    pedidosCompletados: 0,
    productosDisponibles: 0,
    productosTotal: 0,
    categoriasActivas: 0,
    ticketPromedio: 0,
    tasaExito: 0
  });
  
  const [estadosPedidos, setEstadosPedidos] = useState({
    pendiente: 0,
    en_preparacion: 0,
    listo: 0,
    entregado: 0,
    cancelado: 0
  });
  
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Cargar datos del dashboard
  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar datos en paralelo
      const [
        estadisticasResponse,
        pedidosResponse,
        productosResponse,
        categoriasResponse
      ] = await Promise.all([
        pedidoService.getEstadisticas(),
        pedidoService.getAll(),
        productoService.getAll(),
        categoriaService.getAll()
      ]);
      
      // Procesar estadísticas
      if (estadisticasResponse.data?.success) {
        const stats = estadisticasResponse.data.data?.generales || {};
        setEstadisticas({
          ventasHoy: parseFloat(stats.total_ventas || 0),
          ventasAyer: parseFloat(stats.total_ventas || 0) * 0.8, // Simulado para comparación
          pedidosActivos: parseInt(stats.pendientes || 0) + parseInt(stats.en_preparacion || 0),
          pedidosHoy: parseInt(stats.total_pedidos || 0),
          pedidosCompletados: parseInt(stats.entregados || 0),
          productosDisponibles: 0, // Se calculará después
          productosTotal: 0, // Se calculará después
          categoriasActivas: 0, // Se calculará después
          ticketPromedio: parseFloat(stats.ticket_promedio || 0),
          tasaExito: stats.entregados && stats.total_pedidos 
            ? Math.round((parseInt(stats.entregados) / parseInt(stats.total_pedidos)) * 100)
            : 0
        });
      }
      
      // Procesar pedidos
      if (pedidosResponse.data?.success) {
        const pedidos = pedidosResponse.data.data || pedidosResponse.data || [];
        setPedidosRecientes(pedidos.slice(0, 8));
        
        // Calcular distribución de estados
        const estados = {
          pendiente: 0,
          en_preparacion: 0,
          listo: 0,
          entregado: 0,
          cancelado: 0
        };
        
        pedidos.forEach(pedido => {
          if (estados[pedido.estado] !== undefined) {
            estados[pedido.estado]++;
          }
        });
        
        setEstadosPedidos(estados);
        
        // Actualizar estadísticas con datos reales
        const pedidosEntregados = pedidos.filter(p => p.estado === 'entregado');
        const totalVentas = pedidosEntregados.reduce((sum, p) => 
          sum + parseFloat(p.total || 0), 0
        );
        const ticketPromedio = pedidosEntregados.length > 0
          ? totalVentas / pedidosEntregados.length
          : 0;
        
        setEstadisticas(prev => ({
          ...prev,
          pedidosCompletados: pedidosEntregados.length,
          ticketPromedio: ticketPromedio
        }));
      }
      
      // Procesar productos
      if (productosResponse.data?.success) {
        const productos = productosResponse.data.data || productosResponse.data || [];
        const disponibles = productos.filter(p => p.disponible === true || p.disponible === 1);
        const destacados = productos.filter(p => p.destacado === true || p.destacado === 1)
          .slice(0, 4);
        
        setProductosDestacados(destacados);
        
        setEstadisticas(prev => ({
          ...prev,
          productosDisponibles: disponibles.length,
          productosTotal: productos.length
        }));
      }
      
      // Procesar categorías
      if (categoriasResponse.data?.success) {
        const categoriasData = categoriasResponse.data.data || categoriasResponse.data || [];
        const activas = categoriasData.filter(c => c.activo === true || c.activo === 1);
        
        setCategorias(categoriasData);
        setEstadisticas(prev => ({
          ...prev,
          categoriasActivas: activas.length
        }));
      }
      
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError('Error al cargar los datos del dashboard');
      
      // Datos de ejemplo si hay error
      setEstadisticas({
        ventasHoy: 1250.75,
        ventasAyer: 980.50,
        pedidosActivos: 8,
        pedidosHoy: 15,
        pedidosCompletados: 12,
        productosDisponibles: 24,
        productosTotal: 30,
        categoriasActivas: 6,
        ticketPromedio: 45.80,
        tasaExito: 80
      });
      
      setPedidosRecientes([
        { id: 1, numero_pedido: 'PED-001', cliente_nombre: 'Cliente 1', total: 45.50, estado: 'entregado', fecha_pedido: new Date().toISOString() },
        { id: 2, numero_pedido: 'PED-002', cliente_nombre: 'Cliente 2', total: 32.00, estado: 'pendiente', fecha_pedido: new Date().toISOString() },
        { id: 3, numero_pedido: 'PED-003', cliente_nombre: 'Cliente 3', total: 28.75, estado: 'en_preparacion', fecha_pedido: new Date().toISOString() }
      ]);
      
      setProductosDestacados([
        { id: 1, nombre: 'Producto Destacado 1', precio: 12.99, disponible: true },
        { id: 2, nombre: 'Producto Destacado 2', precio: 9.99, disponible: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cálculos
  const hoy = new Date();
  const cambioVentas = estadisticas.ventasAyer > 0 
    ? ((estadisticas.ventasHoy - estadisticas.ventasAyer) / estadisticas.ventasAyer * 100)
    : estadisticas.ventasHoy > 0 ? 100 : 0;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <FaSpinner style={styles.spinner} />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FaExclamationTriangle style={styles.errorIcon} />
        <h3>Error al cargar el dashboard</h3>
        <p>{error}</p>
        <button 
          onClick={cargarDashboard}
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
        <div>
          <h1 style={styles.title}>Panel de Control</h1>
          <p style={styles.subtitle}>
            Bienvenido, {user?.nombre || user?.email || 'Usuario'}
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
          value={`$${estadisticas.ventasHoy.toFixed(2)}`}
          change={cambioVentas.toFixed(1)}
          icon={<FaDollarSign />}
          iconBg={colors.primary}
          iconColor="#ffffff"
          subtitle={`${estadisticas.pedidosCompletados} pedidos completados`}
        />
        <StatCard
          title="Pedidos Activos"
          value={estadisticas.pedidosActivos}
          icon={<FaClipboardList />}
          iconBg={colors.warning}
          iconColor="#ffffff"
          subtitle="Por atender"
        />
        <StatCard
          title="Productos Disponibles"
          value={estadisticas.productosDisponibles}
          icon={<FaUtensils />}
          iconBg={colors.success}
          iconColor="#ffffff"
          subtitle={`${estadisticas.productosTotal} totales`}
        />
        <StatCard
          title="Categorías"
          value={estadisticas.categoriasActivas}
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
              Total: {estadisticas.pedidosHoy}
            </div>
          </div>
          <div style={styles.cardContent}>
            {Object.entries(estadosPedidos).map(([estado, cantidad]) => {
              const porcentaje = estadisticas.pedidosHoy > 0 ? (cantidad / estadisticas.pedidosHoy) * 100 : 0;
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
            <button 
              onClick={cargarDashboard}
              style={styles.refreshButton}
            >
              Actualizar
            </button>
          </div>
          <div style={styles.cardContent}>
            {pedidosRecientes.length > 0 ? (
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
                    {pedidosRecientes.map(pedido => (
                      <tr key={pedido.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.pedidoNumero}>
                            #{pedido.numero_pedido || `PED-${pedido.id}`}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div>
                            <div style={styles.clienteNombre}>
                              {pedido.cliente_nombre || pedido.usuario_nombre || 'Cliente'}
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
                            {pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '--:--'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.noDataMessage}>
                <p>No hay pedidos recientes</p>
              </div>
            )}
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
                value={`$${estadisticas.ticketPromedio.toFixed(2)}`}
                icon={<FaShoppingCart />}
                color={colors.primary}
              />
              <MetricItem
                label="Pedidos Completados"
                value={estadisticas.pedidosCompletados}
                icon={<FaCheckCircle />}
                color={colors.success}
              />
              <MetricItem
                label="Total Ventas"
                value={`$${estadisticas.ventasHoy.toFixed(2)}`}
                icon={<FaChartLine />}
                color={colors.warning}
              />
              <MetricItem
                label="Tasa de Éxito"
                value={`${estadisticas.tasaExito}%`}
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
            {productosDestacados.length > 0 ? (
              productosDestacados.map(producto => (
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
                      ${parseFloat(producto.precio || 0).toFixed(2)}
                    </div>
                  </div>
                  <div style={{
                    ...styles.disponibleIndicator,
                    backgroundColor: producto.disponible ? colors.success : colors.danger
                  }} />
                </div>
              ))
            ) : (
              <div style={styles.noDataMessage}>
                <p>No hay productos destacados</p>
              </div>
            )}
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
              value={estadisticas.pedidosHoy}
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
              value={estadisticas.pedidosCompletados}
              color={colors.success}
            />
            <QuickStat
              icon={<FaChartBar />}
              label="Tasa de Hoy"
              value={`${estadisticas.tasaExito}%`}
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
          backgroundColor: parseFloat(change) >= 0 ? `${colors.success}20` : `${colors.danger}20`,
          color: parseFloat(change) >= 0 ? colors.success : colors.danger
        }}>
          {parseFloat(change) >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          {Math.abs(parseFloat(change))}%
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
  
  // Loading y Error
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: colors.gray[50]
  },
  spinner: {
    fontSize: '48px',
    color: colors.primary,
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: colors.gray[50],
    padding: '24px',
    textAlign: 'center'
  },
  errorIcon: {
    fontSize: '64px',
    color: colors.danger,
    marginBottom: '24px'
  },
  retryButton: {
    marginTop: '24px',
    padding: '12px 24px',
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
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
    borderRadius: '8px',
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
    fontSize: '20px',
    borderRadius: '8px'
  },
  changeBadge: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '4px'
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
    borderRadius: '8px',
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
    color: colors.gray[700],
    borderRadius: '4px'
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
    border: `1px solid ${colors.gray[200]}`,
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  cardContent: {
    padding: '20px'
  },
  noDataMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100px',
    color: colors.gray[500]
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
    height: '10px',
    borderRadius: '50%'
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
    overflow: 'hidden',
    borderRadius: '3px'
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '3px'
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
    letterSpacing: '0.5px',
    borderRadius: '4px'
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
    border: `1px solid ${colors.gray[200]}`,
    borderRadius: '6px'
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
    flexShrink: 0,
    borderRadius: '6px'
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
    height: '8px',
    borderRadius: '50%'
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