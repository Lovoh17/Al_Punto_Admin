// src/components/Pedidos/PedidoCard.jsx
import React from 'react';
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope,
  FaChair, 
  FaMapMarkerAlt,
  FaShoppingBag,
  FaCalendarAlt,
  FaEye,
  FaFire,
  FaCheck,
  FaTruck,
  FaTimes,
  FaEllipsisV,
  FaHome,
  FaStore
} from 'react-icons/fa';

const estadoColors = {
  pendiente: { 
    bg: '#fef3c7', 
    color: '#92400e', 
    border: '#f59e0b',
    icon: <FaFire />
  },
  en_preparacion: { 
    bg: '#dbeafe', 
    color: '#1e40af', 
    border: '#3b82f6',
    icon: <FaFire />
  },
  listo: { 
    bg: '#d1fae5', 
    color: '#065f46', 
    border: '#10b981',
    icon: <FaCheck />
  },
  entregado: { 
    bg: '#f3f4f6', 
    color: '#374151', 
    border: '#6b7280',
    icon: <FaTruck />
  },
  cancelado: { 
    bg: '#fee2e2', 
    color: '#991b1b', 
    border: '#dc2626',
    icon: <FaTimes />
  }
};

const estadoLabels = {
  pendiente: 'Pendiente',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};

const PedidoCard = ({ 
  pedido, 
  onVerDetalle, 
  onCambiarEstado, 
  onCancelar, 
  onEliminar 
}) => {
  const estadoStyle = estadoColors[pedido.estado] || estadoColors.pendiente;

  const getEstadoSiguiente = () => {
    switch(pedido.estado) {
      case 'pendiente': return 'en_preparacion';
      case 'en_preparacion': return 'listo';
      case 'listo': return 'entregado';
      default: return null;
    }
  };

  const getAccionLabel = () => {
    switch(pedido.estado) {
      case 'pendiente': return 'Preparar';
      case 'en_preparacion': return 'Marcar Listo';
      case 'listo': return 'Entregar';
      default: return null;
    }
  };

  const estadoSiguiente = getEstadoSiguiente();
  const accionLabel = getAccionLabel();

  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return fechaString;
    }
  };

  // Determinar tipo de pedido y mostrar información correspondiente
  const esDelivery = pedido.numero_mesa === 'Delivery' || pedido.numero_mesa === 'delivery';
  const tieneUbicacion = pedido.ubicacion && pedido.ubicacion.trim() !== '';
  const tieneNotas = pedido.notas && pedido.notas.trim() !== '';

  return (
    <div style={styles.card}>
      {/* Header con número de pedido y estado */}
      <div style={styles.cardHeader}>
        <div style={styles.pedidoInfo}>
          <h3 style={styles.pedidoNumero}>
            #{pedido.numero_pedido || pedido.id}
          </h3>
          <div style={styles.clienteInfo}>
            <div style={styles.clienteItem}>
              <FaUser style={styles.clienteIcon} />
              <span style={styles.clienteText}>
                {pedido.cliente_nombre || 'Cliente no registrado'}
              </span>
            </div>
            
            {pedido.cliente_email && (
              <div style={styles.clienteItem}>
                <FaEnvelope style={styles.clienteIcon} />
                <span style={styles.clienteText}>
                  {pedido.cliente_email}
                </span>
              </div>
            )}
            
            {pedido.cliente_telefono && (
              <div style={styles.clienteItem}>
                <FaPhone style={styles.clienteIcon} />
                <span style={styles.clienteText}>
                  {pedido.cliente_telefono}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div style={{
          ...styles.estadoBadge,
          backgroundColor: estadoStyle.bg,
          color: estadoStyle.color,
          borderColor: estadoStyle.border
        }}>
          <span style={styles.estadoIcon}>
            {estadoStyle.icon}
          </span>
          <span style={styles.estadoText}>
            {estadoLabels[pedido.estado]}
          </span>
        </div>
      </div>

      {/* Información del pedido - Primera fila */}
      <div style={styles.infoSection}>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>
              <FaShoppingBag />
              <span>Productos</span>
            </div>
            <div style={styles.infoValue}>
              {pedido.total_productos || 0} items
            </div>
          </div>
          
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>
              <span>Total</span>
            </div>
            <div style={styles.infoValue}>
              <span style={styles.totalAmount}>
                ${parseFloat(pedido.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Información de Entrega/Ubicación */}
      <div style={styles.entregaSection}>
        {esDelivery ? (
          <div style={styles.deliveryInfo}>
            <div style={styles.tipoEntrega}>
              <FaTruck style={styles.deliveryIcon} />
              <span style={styles.deliveryLabel}>Delivery</span>
            </div>
            
            {tieneUbicacion && (
              <div style={styles.ubicacionInfo}>
                <FaMapMarkerAlt style={styles.ubicacionIcon} />
                <div style={styles.ubicacionContent}>
                  <span style={styles.ubicacionLabel}>Dirección de entrega:</span>
                  <span style={styles.ubicacionText} title={pedido.ubicacion}>
                    {pedido.ubicacion.length > 40 
                      ? `${pedido.ubicacion.substring(0, 40)}...` 
                      : pedido.ubicacion}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.mesaInfo}>
            <div style={styles.tipoEntrega}>
              <FaStore style={styles.mesaIcon} />
              <span style={styles.mesaLabel}>Para recoger en restaurante</span>
            </div>
            
            {pedido.numero_mesa && pedido.numero_mesa !== 'Delivery' && (
              <div style={styles.numeroMesa}>
                <FaChair style={styles.mesaNumeroIcon} />
                <span style={styles.mesaNumero}>Mesa {pedido.numero_mesa}</span>
              </div>
            )}
          </div>
        )}
      </div>

    

      {/* Fecha y hora */}
      <div style={styles.fechaSection}>
        <FaCalendarAlt style={styles.fechaIcon} />
        <span style={styles.fechaText}>
          {formatFecha(pedido.fecha_pedido || pedido.created_at)}
        </span>
      </div>

      {/* Acciones */}
      <div style={styles.actionsSection}>
        <button
          onClick={() => onVerDetalle(pedido)}
          style={styles.detalleButton}
          title="Ver detalle del pedido"
        >
          <FaEye />
          <span>Ver Detalle</span>
        </button>
        
        {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
          <div style={styles.estadoActions}>
            {estadoSiguiente && (
              <button
                onClick={() => onCambiarEstado(pedido.id, estadoSiguiente)}
                style={{
                  ...styles.accionButton,
                  backgroundColor: estadoStyle.bg,
                  color: estadoStyle.color,
                  borderColor: estadoStyle.border
                }}
                title={accionLabel}
              >
                {accionLabel}
              </button>
            )}
            
            <button
              onClick={() => onCancelar(pedido.id)}
              style={styles.cancelButton}
              title="Cancelar pedido"
            >
              <FaTimes />
            </button>
          </div>
        )}
        
        {/* Menú de opciones adicionales */}
        <div style={styles.optionsMenu}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('¿Eliminar este pedido?')) {
                onEliminar(pedido.id);
              }
            }}
            style={styles.optionsButton}
            title="Más opciones"
          >
            <FaEllipsisV />
          </button>
        </div>
      </div>
    </div>
  );
};

const colors = {
  primary: '#2c5aa0',
  primaryLight: '#3a6bc5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
  info: '#3b82f6',
  delivery: '#8b5cf6',
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
  card: {
    backgroundColor: colors.card,
    border: `2px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      borderColor: colors.primaryLight
    }
  },
  
  // Header
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  pedidoInfo: {
    flex: 1
  },
  pedidoNumero: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 8px 0',
    lineHeight: '1.2'
  },
  clienteInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  clienteItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  clienteIcon: {
    fontSize: '12px',
    color: colors.text.secondary,
    minWidth: '12px'
  },
  clienteText: {
    fontSize: '13px',
    color: colors.text.secondary,
    fontWeight: '500'
  },
  
  // Estado Badge
  estadoBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: `2px solid`,
    whiteSpace: 'nowrap'
  },
  estadoIcon: {
    fontSize: '12px'
  },
  estadoText: {
    fontSize: '12px',
    fontWeight: '700'
  },
  
  // Info Section (Productos y Total)
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px 0',
    borderTop: `1px solid ${colors.border}`,
    borderBottom: `1px solid ${colors.border}`
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  infoLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.text.secondary,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.text.primary
  },
  totalAmount: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.primary
  },
  
  // Sección de Entrega/Ubicación
  entregaSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`
  },
  
  // Estilo para Delivery
  deliveryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  tipoEntrega: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  deliveryIcon: {
    fontSize: '14px',
    color: colors.delivery
  },
  deliveryLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.delivery
  },
  ubicacionInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: `1px solid ${colors.border}`
  },
  ubicacionIcon: {
    fontSize: '12px',
    color: colors.danger,
    marginTop: '2px',
    flexShrink: 0
  },
  ubicacionContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  ubicacionLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  ubicacionText: {
    fontSize: '13px',
    fontWeight: '500',
    color: colors.text.primary,
    lineHeight: '1.4'
  },
  
  // Estilo para Mesa/Para recoger
  mesaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  mesaIcon: {
    fontSize: '14px',
    color: colors.success
  },
  mesaLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.success
  },
  numeroMesa: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: `1px solid ${colors.border}`,
    alignSelf: 'flex-start'
  },
  mesaNumeroIcon: {
    fontSize: '12px',
    color: colors.text.secondary
  },
  mesaNumero: {
    fontSize: '13px',
    fontWeight: '600',
    color: colors.text.primary
  },
  
  // Sección de Notas
  notasSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    border: `1px solid #f59e0b`
  },
  notasHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  notasLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#92400e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  notasContent: {
    fontSize: '13px',
    color: '#92400e',
    lineHeight: '1.4',
    fontStyle: 'italic'
  },
  notasText: {
    fontSize: '13px',
    fontWeight: '500'
  },
  
  // Fecha
  fechaSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: colors.text.light,
    paddingTop: '8px',
    borderTop: `1px solid ${colors.border}`
  },
  fechaIcon: {
    fontSize: '12px'
  },
  fechaText: {
    fontSize: '12px',
    fontWeight: '500'
  },
  
  // Actions Section
  actionsSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingTop: '12px',
    borderTop: `1px solid ${colors.border}`
  },
  detalleButton: {
    flex: 1,
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '10px 16px',
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
  estadoActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  accionButton: {
    padding: '10px 16px',
    border: `2px solid`,
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  cancelButton: {
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
    transition: 'all 0.2s ease'
  },
  optionsMenu: {
    display: 'flex',
    alignItems: 'center'
  },
  optionsButton: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.text.secondary,
    padding: '8px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    transition: 'all 0.2s ease'
  }
};

// Agregar hover effects
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .detalle-button:hover {
      background-color: ${colors.primaryLight};
      transform: translateY(-1px);
    }
    
    .accion-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    .cancel-button:hover {
      background-color: #fecaca;
      transform: scale(1.1);
    }
    
    .options-button:hover {
      background-color: ${colors.border};
      color: ${colors.text.primary};
    }
    
    .pedido-card:hover {
      border-color: ${colors.primaryLight};
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    
    .ubicacion-info:hover {
      background-color: #f3f4f6;
      border-color: ${colors.primaryLight};
    }
    
    .notas-section:hover {
      background-color: #fde68a;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default PedidoCard;