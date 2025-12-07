import React from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaChair, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaTruck, 
  FaStore, 
  FaClipboardList,
  FaMoneyBillWave,
  FaReceipt,
  FaExclamationCircle,
  FaPrint,
  FaWhatsapp,
  FaCopy,
  FaFilePdf
} from 'react-icons/fa';

const PedidoDetalleModal = ({ pedido, onClose, productos, loading }) => {
  if (!pedido) return null;

  // Función para formatear el estado
  const formatearEstado = (estado) => {
    const estados = {
      pendiente: { label: 'Pendiente', color: '#92400e', bg: '#fef3c7' },
      en_preparacion: { label: 'En Preparación', color: '#1e40af', bg: '#dbeafe' },
      listo: { label: 'Listo', color: '#065f46', bg: '#d1fae5' },
      entregado: { label: 'Entregado', color: '#374151', bg: '#f3f4f6' },
      cancelado: { label: 'Cancelado', color: '#991b1b', bg: '#fee2e2' }
    };
    return estados[estado] || { label: estado, color: '#6b7280', bg: '#f3f4f6' };
  };

  const estadoInfo = formatearEstado(pedido.estado);
  
  // Determinar tipo de pedido
  const esDelivery = pedido.numero_mesa === 'Delivery' || pedido.numero_mesa === 'delivery';
  const tieneUbicacion = pedido.ubicacion && pedido.ubicacion.trim() !== '';
  const tieneNotas = pedido.notas && pedido.notas.trim() !== '';
  
  // Formatear fecha
  const formatFecha = (fechaString) => {
    try {
      const fecha = new Date(fechaString);
      return {
        completa: fecha.toLocaleString('es-ES', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        corta: fecha.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        hora: fecha.toLocaleString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        imprimir: fecha.toLocaleString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch (error) {
      return { 
        completa: fechaString, 
        corta: fechaString, 
        hora: '',
        imprimir: fechaString
      };
    }
  };

  const fechaInfo = formatFecha(pedido.fecha_pedido || pedido.created_at);

  // Función para copiar información
  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto)
      .then(() => alert('✅ Copiado al portapapeles'))
      .catch(() => alert('❌ Error al copiar'));
  };

  // Función auxiliar para convertir a número seguro
  const safeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Calcular totales
  const calcularTotales = () => {
    if (productos?.estadisticas) {
      return productos.estadisticas;
    }

    if (productos?.productos) {
      const totalItems = productos.productos.length;
      const cantidadTotal = productos.productos.reduce((sum, p) => 
        sum + (parseInt(p.cantidad) || 1), 0);
      const totalPedido = productos.productos.reduce((sum, p) => 
        sum + (safeNumber(p.precio_unitario) * (parseInt(p.cantidad) || 1)), 0);
      const precioPromedio = cantidadTotal > 0 ? totalPedido / cantidadTotal : 0;

      return {
        total_items: totalItems,
        cantidad_total: cantidadTotal,
        total_pedido: totalPedido,
        precio_promedio: precioPromedio
      };
    }

    return {
      total_items: 0,
      cantidad_total: 0,
      total_pedido: safeNumber(pedido.total),
      precio_promedio: 0
    };
  };

  const estadisticas = calcularTotales();

  // Función para generar PDF profesional con logo
  const generarPDFProfesional = () => {
    try {
      // Función segura para formatear precios
      const safePrice = (value) => {
        const num = safeNumber(value);
        return num.toFixed(2);
      };

      // Calcular subtotal seguro para cada producto
      const calcularSubtotalProducto = (producto) => {
        const precio = safeNumber(producto.precio_unitario);
        const cantidad = parseInt(producto.cantidad) || 1;
        return (precio * cantidad).toFixed(2);
      };

      // Crear contenido HTML profesional para el PDF
      const contenido = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Comprobante Pedido #${pedido.numero_pedido || pedido.id}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0;
              padding: 0;
              color: #333;
              font-size: 11px;
              line-height: 1.4;
            }
            .container {
              max-width: 100%;
            }
            /* Encabezado con logo */
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 3px solid #2c5aa0;
            }
            .logo-section {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 15px;
              margin-bottom: 10px;
            }
            .logo-placeholder {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #2c5aa0, #3a6bc5);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
            }
            .restaurant-info {
              text-align: center;
            }
            .restaurant-name {
              font-size: 24px;
              font-weight: 800;
              color: #2c5aa0;
              margin: 0;
              letter-spacing: 1px;
            }
            .restaurant-tagline {
              font-size: 12px;
              color: #666;
              margin: 5px 0;
              font-style: italic;
            }
            .restaurant-contact {
              font-size: 10px;
              color: #777;
              margin: 5px 0;
            }
            
            /* Información del pedido */
            .order-header {
              background-color: #f8fafc;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .order-number {
              font-size: 20px;
              font-weight: 700;
              color: #2c5aa0;
              margin: 0;
            }
            .order-date {
              font-size: 13px;
              color: #666;
              margin: 5px 0;
            }
            .order-status {
              display: inline-block;
              padding: 6px 15px;
              background-color: ${estadoInfo.bg};
              color: ${estadoInfo.color};
              border-radius: 20px;
              font-weight: 700;
              font-size: 12px;
              border: 1px solid ${estadoInfo.color};
            }
            
            /* Secciones */
            .section {
              margin: 20px 0;
              page-break-inside: avoid;
            }
            .section-title {
              background: linear-gradient(90deg, #2c5aa0, #3a6bc5);
              color: white;
              padding: 8px 12px;
              font-weight: 700;
              border-radius: 5px;
              margin-bottom: 12px;
              font-size: 13px;
              letter-spacing: 0.5px;
            }
            
            /* Tabla de productos */
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 11px;
            }
            .products-table th {
              background-color: #f0f0f0;
              padding: 10px 8px;
              text-align: left;
              font-weight: 700;
              color: #555;
              border-bottom: 2px solid #ddd;
              border-top: 1px solid #ddd;
            }
            .products-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #eee;
              vertical-align: top;
            }
            .products-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .product-name {
              font-weight: 600;
              color: #333;
            }
            .product-quantity {
              text-align: center;
              font-weight: 700;
              color: #2c5aa0;
            }
            .product-price {
              text-align: right;
              font-weight: 600;
            }
            .product-subtotal {
              text-align: right;
              font-weight: 700;
              color: #2c5aa0;
            }
            
            /* Totales */
            .totals-section {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #2c5aa0;
            }
            .totals-table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            .totals-table td {
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .total-label {
              text-align: right;
              font-weight: 600;
              color: #555;
              padding-right: 15px;
              width: 70%;
            }
            .total-value {
              text-align: right;
              font-weight: 700;
              color: #333;
            }
            .grand-total {
              font-size: 16px;
              font-weight: 800;
              color: #2c5aa0;
              background-color: #f0f7ff;
              padding: 10px;
              border-radius: 5px;
            }
            
            /* Información del cliente */
            .customer-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .info-card {
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 12px;
            }
            .info-label {
              font-size: 10px;
              font-weight: 700;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .info-value {
              font-size: 12px;
              font-weight: 600;
              color: #333;
            }
            
            /* Notas */
            .notes-section {
              background-color: #fff8e1;
              border: 1px solid #ffc107;
              border-left: 4px solid #ffc107;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .notes-label {
              font-size: 11px;
              font-weight: 700;
              color: #92400e;
              margin-bottom: 5px;
            }
            .notes-content {
              font-size: 11px;
              color: #92400e;
              font-style: italic;
              line-height: 1.5;
            }
            
            /* Footer */
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 9px;
              color: #777;
              padding-top: 15px;
              border-top: 1px solid #ddd;
            }
            .footer p {
              margin: 4px 0;
            }
            .qr-placeholder {
              width: 80px;
              height: 80px;
              background-color: #f0f0f0;
              border: 1px dashed #ccc;
              margin: 10px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #999;
              font-size: 9px;
              text-align: center;
              padding: 5px;
            }
            
            /* Utilidades */
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .text-bold { font-weight: 700; }
            .mt-10 { margin-top: 10px; }
            .mt-20 { margin-top: 20px; }
            .mb-10 { margin-bottom: 10px; }
            .mb-20 { margin-bottom: 20px; }
            
            @media print {
              body { font-size: 10px; }
              .header { margin-bottom: 15px; }
              .section { margin: 15px 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Encabezado con Logo -->
            <div class="header">
              <div class="logo-section">
                <div class="logo-placeholder">
                  <!-- Reemplaza con tu logo -->
                  <img src="../../assets/Images/Logos/Ral Hrm - 2025-12-01 01.56.23.svg" style="width:80px;height:80px;" alt="Logo Restaurante">
                </div>
                <div class="restaurant-info">
                  <h1 class="restaurant-name">RESTAURANTE AL PUNTO</h1>
                  <p class="restaurant-tagline">"Donde cada bocado es una experiencia"</p>
                  <p class="restaurant-contact">
                    Av. Principal 123, Ciudad • Tel: (503) 6037-6783 • www.alpunto.com
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Encabezado del Pedido -->
            <div class="order-header">
              <div>
                <h2 class="order-number">ORDEN #${pedido.numero_pedido || pedido.id}</h2>
                <p class="order-date">Fecha: ${fechaInfo.imprimir}</p>
                <span class="order-status">${estadoInfo.label}</span>
              </div>
              <div>
                <div class="info-card">
                  <div class="info-label">Tipo de Pedido</div>
                  <div class="info-value">${esDelivery ? 'Delivery' : 'Para recoger'}</div>
                </div>
                ${esDelivery && tieneUbicacion ? `
                  <div class="info-card">
                    <div class="info-label">Dirección de Entrega</div>
                    <div class="info-value">${pedido.ubicacion}</div>
                  </div>
                ` : !esDelivery && pedido.numero_mesa ? `
                  <div class="info-card">
                    <div class="info-label">Mesa</div>
                    <div class="info-value">${pedido.numero_mesa}</div>
                  </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Información del Cliente -->
            <div class="section">
              <div class="section-title">INFORMACIÓN DEL CLIENTE</div>
              <div class="customer-info">
                <div class="info-card">
                  <div class="info-label">Nombre</div>
                  <div class="info-value">${pedido.cliente_nombre || 'Cliente no registrado'}</div>
                </div>
                
                ${pedido.cliente_telefono ? `
                  <div class="info-card">
                    <div class="info-label">Teléfono</div>
                    <div class="info-value">${pedido.cliente_telefono}</div>
                  </div>
                ` : ''}
                
                ${pedido.cliente_email ? `
                  <div class="info-card">
                    <div class="info-label">Email</div>
                    <div class="info-value">${pedido.cliente_email}</div>
                  </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Detalle de Productos -->
            <div class="section">
              <div class="section-title">DETALLE DEL PEDIDO</div>
              <table class="products-table">
                <thead>
                  <tr>
                    <th width="5%">#</th>
                    <th width="45%">PRODUCTO</th>
                    <th width="10%" class="text-center">CANT</th>
                    <th width="15%" class="text-right">P. UNITARIO</th>
                    <th width="15%" class="text-right">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${productos?.productos?.map((producto, index) => {
                    const precioUnitario = safePrice(producto.precio_unitario);
                    const subtotal = calcularSubtotalProducto(producto);
                    const cantidad = parseInt(producto.cantidad) || 1;
                    
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td class="product-name">
                          ${producto.producto_nombre || producto.nombre || 'Producto sin nombre'}
                          ${producto.notas ? `<br><small style="color:#666; font-style:italic;">Nota: ${producto.notas}</small>` : ''}
                        </td>
                        <td class="product-quantity">${cantidad}</td>
                        <td class="product-price">$${precioUnitario}</td>
                        <td class="product-subtotal">$${subtotal}</td>
                      </tr>
                    `;
                  }).join('') || `
                    <tr>
                      <td colspan="5" style="text-align: center; padding: 20px; color: #999;">
                        No hay productos en este pedido
                      </td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
            
            <!-- Resumen por Categoría -->
            ${productos?.resumen_por_categoria?.length > 0 ? `
              <div class="section">
                <div class="section-title">RESUMEN POR CATEGORÍA</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                  ${productos.resumen_por_categoria.map(categoria => {
                    const subtotalCategoria = safeNumber(categoria.subtotal_categoria).toFixed(2);
                    return `
                    <div class="info-card">
                      <div class="info-label">${categoria.categoria || 'Sin categoría'}</div>
                      <div class="info-value">
                        ${categoria.cantidad_productos || 0} productos<br>
                        ${categoria.cantidad_items || 0} items<br>
                        <strong>$${subtotalCategoria}</strong>
                      </div>
                    </div>
                  `}).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- Totales -->
            <div class="section totals-section">
              <div class="section-title">RESUMEN</div>
              <table class="totals-table">
                <tr>
                  <td class="total-label">Total Items:</td>
                  <td class="total-value">${estadisticas.total_items}</td>
                </tr>
                <tr>
                  <td class="total-label">Cantidad Total:</td>
                  <td class="total-value">${estadisticas.cantidad_total}</td>
                </tr>
                <tr>
                  <td class="total-label">Subtotal:</td>
                  <td class="total-value">$${estadisticas.total_pedido.toFixed(2)}</td>
                </tr>
                ${esDelivery ? `
                  <tr>
                    <td class="total-label">Costo Delivery:</td>
                    <td class="total-value">$0.00</td>
                  </tr>
                ` : ''}
                <tr style="border-top: 2px solid #2c5aa0;">
                  <td class="total-label text-bold">TOTAL A PAGAR:</td>
                  <td class="total-value grand-total">$${(estadisticas.total_pedido + (esDelivery ? 0 : 0)).toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>
        </body>
        </html>
      `;

      // Abrir ventana para imprimir
      const ventana = window.open('', '_blank', 'width=800,height=1000');
      
      // Cargar contenido HTML
      ventana.document.open();
      ventana.document.write(contenido);
      ventana.document.close();
      
      // Esperar a que cargue el contenido
      ventana.onload = function() {
        setTimeout(() => {
          ventana.focus();
          // Mostrar diálogo de impresión
          ventana.print();
          
          // Cerrar ventana después de imprimir
          setTimeout(() => {
            if (!ventana.closed) {
              ventana.close();
            }
          }, 1000);
        }, 500);
      };
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header del Modal */}
        <div style={styles.modalHeader}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <FaReceipt />
            </div>
            <div>
              <h2 style={styles.modalTitle}>
                Pedido: {pedido.numero_pedido || `#${pedido.id}`}
              </h2>
              <div style={styles.headerSubtitle}>
                <span style={{
                  ...styles.estadoBadge,
                  backgroundColor: estadoInfo.bg,
                  color: estadoInfo.color,
                  borderColor: estadoInfo.color
                }}>
                  {estadoInfo.label}
                </span>
                <span style={styles.fechaBadge}>
                  <FaCalendarAlt style={styles.fechaIcon} />
                  {fechaInfo.corta}
                </span>
              </div>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button 
              onClick={() => copiarAlPortapapeles(`Pedido: ${pedido.numero_pedido}\nCliente: ${pedido.cliente_nombre}\nTotal: $${estadisticas.total_pedido.toFixed(2)}`)}
              style={styles.actionButton}
              title="Copiar información"
            >
              <FaCopy />
            </button>
            <button 
              onClick={onClose} 
              style={styles.closeButton}
              title="Cerrar"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div style={styles.modalBody}>
          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Cargando detalles del pedido...</p>
            </div>
          ) : (
            <>
              {/* Sección 1: Información del Cliente */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <FaUser style={styles.sectionIcon} />
                  Información del Cliente
                </h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Nombre</div>
                    <div style={styles.infoValue}>
                      {pedido.cliente_nombre || 'No especificado'}
                    </div>
                  </div>
                  
                  {pedido.cliente_email && (
                    <div style={styles.infoCard}>
                      <div style={styles.infoLabel}>Email</div>
                      <div style={styles.infoValue}>
                        <FaEnvelope style={styles.infoIcon} />
                        {pedido.cliente_email}
                      </div>
                    </div>
                  )}
                  
                  {pedido.cliente_telefono && (
                    <div style={styles.infoCard}>
                      <div style={styles.infoLabel}>Teléfono</div>
                      <div style={styles.infoValue}>
                        <FaPhone style={styles.infoIcon} />
                        {pedido.cliente_telefono}
                        <button 
                          onClick={() => copiarAlPortapapeles(pedido.cliente_telefono)}
                          style={styles.copyButton}
                          title="Copiar teléfono"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección 2: Información de Entrega */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  {esDelivery ? (
                    <>
                      <FaTruck style={styles.sectionIcon} />
                      Información de Delivery
                    </>
                  ) : (
                    <>
                      <FaStore style={styles.sectionIcon} />
                      Información de Recogida
                    </>
                  )}
                </h3>
                
                {esDelivery ? (
                  <div style={styles.deliverySection}>
                    <div style={styles.infoCard}>
                      <div style={styles.infoLabel}>Tipo de Entrega</div>
                      <div style={styles.infoValue}>
                        <FaTruck style={{color: '#8b5cf6', marginRight: '8px'}} />
                        <span style={{color: '#8b5cf6', fontWeight: '700'}}>
                          Delivery a Domicilio
                        </span>
                      </div>
                    </div>
                    
                    {tieneUbicacion && (
                      <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Dirección de Entrega</div>
                        <div style={styles.infoValue}>
                          <FaMapMarkerAlt style={{color: '#dc2626', marginRight: '8px'}} />
                          <span style={{flex: 1}}>
                            {pedido.ubicacion}
                          </span>
                          <button 
                            onClick={() => copiarAlPortapapeles(pedido.ubicacion)}
                            style={styles.copyButton}
                            title="Copiar dirección"
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={styles.pickupSection}>
                    <div style={styles.infoCard}>
                      <div style={styles.infoLabel}>Tipo de Pedido</div>
                      <div style={styles.infoValue}>
                        <FaStore style={{color: '#10b981', marginRight: '8px'}} />
                        <span style={{color: '#10b981', fontWeight: '700'}}>
                          Para recoger en restaurante
                        </span>
                      </div>
                    </div>
                    
                    {pedido.numero_mesa && pedido.numero_mesa !== 'Delivery' && (
                      <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Mesa / Ubicación</div>
                        <div style={styles.infoValue}>
                          <FaChair style={{color: '#3b82f6', marginRight: '8px'}} />
                          Mesa {pedido.numero_mesa}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sección 3: Notas del Pedido */}
              {tieneNotas && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>
                    <FaClipboardList style={styles.sectionIcon} />
                    Notas e Instrucciones
                  </h3>
                  <div style={styles.notasCard}>
                    <div style={styles.notasContent}>
                      {pedido.notas}
                    </div>
                    <button 
                      onClick={() => copiarAlPortapapeles(pedido.notas)}
                      style={styles.copyButton}
                      title="Copiar notas"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              )}

              {/* Sección 4: Productos del Pedido */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  Productos del Pedido
                  <span style={styles.productosCount}>
                    ({productos?.productos?.length || 0} productos)
                  </span>
                </h3>
                
                {productos?.productos && productos.productos.length > 0 ? (
                  <div style={styles.productosList}>
                    {productos.productos.map((producto, index) => {
                      const precioUnitario = safeNumber(producto.precio_unitario);
                      const cantidad = parseInt(producto.cantidad) || 1;
                      const subtotal = precioUnitario * cantidad;
                      
                      return (
                        <div key={producto.id || index} style={styles.productoItem}>
                          <div style={styles.productoHeader}>
                            <div style={styles.productoNombre}>
                              {producto.producto_nombre || producto.nombre || 'Producto sin nombre'}
                              {cantidad > 1 && (
                                <span style={styles.cantidadBadge}>
                                  x{cantidad}
                                </span>
                              )}
                            </div>
                            <div style={styles.productoPrecio}>
                              ${precioUnitario.toFixed(2)}
                            </div>
                          </div>
                          
                          {producto.producto_descripcion && (
                            <div style={styles.productoDescripcion}>
                              {producto.producto_descripcion}
                            </div>
                          )}
                          
                          <div style={styles.productoFooter}>
                            <div style={styles.productoInfo}>
                              <span style={styles.productoCategoria}>
                                {producto.categoria_nombre || 'Sin categoría'}
                              </span>
                              {producto.notas && (
                                <span style={styles.productoNotas}>
                                  <FaExclamationCircle />
                                  {producto.notas}
                                </span>
                              )}
                            </div>
                            <div style={styles.productoSubtotal}>
                              Subtotal: ${subtotal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={styles.emptyProducts}>
                    <p>No hay productos en este pedido</p>
                  </div>
                )}
              </div>

              {/* Sección 5: Resumen por Categoría */}
              {productos?.resumen_por_categoria && productos.resumen_por_categoria.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>
                    Resumen por Categoría
                  </h3>
                  <div style={styles.categoriasGrid}>
                    {productos.resumen_por_categoria.map((categoria, index) => {
                      const subtotal = safeNumber(categoria.subtotal_categoria);
                      return (
                        <div key={index} style={styles.categoriaCard}>
                          <div style={styles.categoriaHeader}>
                            <span style={styles.categoriaNombre}>
                              {categoria.categoria || 'Sin categoría'}
                            </span>
                            <span style={styles.categoriaTotal}>
                              ${subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div style={styles.categoriaStats}>
                            <span style={styles.categoriaStat}>
                              {categoria.cantidad_productos || 0} productos
                            </span>
                            <span style={styles.categoriaStat}>
                              {categoria.cantidad_items || 0} items
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sección 6: Resumen Financiero */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <FaMoneyBillWave style={styles.sectionIcon} />
                  Resumen Financiero
                </h3>
                <div style={styles.resumenFinanciero}>
                  <div style={styles.resumenGrid}>
                    <div style={styles.resumenItem}>
                      <div style={styles.resumenLabel}>Total Items</div>
                      <div style={styles.resumenValue}>
                        {estadisticas.total_items}
                      </div>
                    </div>
                    
                    <div style={styles.resumenItem}>
                      <div style={styles.resumenLabel}>Cantidad Total</div>
                      <div style={styles.resumenValue}>
                        {estadisticas.cantidad_total}
                      </div>
                    </div>
                    
                    <div style={styles.resumenItem}>
                      <div style={styles.resumenLabel}>Precio Promedio</div>
                      <div style={styles.resumenValue}>
                        ${estadisticas.precio_promedio.toFixed(2)}
                      </div>
                    </div>
                    
                    <div style={styles.resumenItem}>
                      <div style={styles.resumenLabel}>Total Pedido</div>
                      <div style={styles.resumenValue}>
                        ${estadisticas.total_pedido.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.totalSection}>
                    <div style={styles.totalLabel}>TOTAL A PAGAR</div>
                    <div style={styles.totalAmount}>
                      ${estadisticas.total_pedido.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer del Modal con botón de PDF */}
        <div style={styles.modalFooter}>
          <div style={styles.footerActions}>
            <button
              onClick={generarPDFProfesional}
              style={styles.pdfButton}
              title="Generar PDF profesional"
            >
              <FaFilePdf />
              Generar PDF
            </button>
            
            <button
              onClick={() => window.print()}
              style={styles.printButton}
              title="Imprimir pedido"
            >
              <FaPrint />
              Imprimir
            </button>
            
            {pedido.cliente_telefono && (
              <button
                onClick={() => window.open(`https://wa.me/${pedido.cliente_telefono.replace(/\D/g, '')}?text=Hola ${pedido.cliente_nombre}, hablamos sobre tu pedido ${pedido.numero_pedido}`, '_blank')}
                style={styles.whatsappButton}
                title="Contactar por WhatsApp"
              >
                <FaWhatsapp />
                WhatsApp
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            style={styles.closeModalButton}
          >
            Cerrar
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
  pdf: '#e74c3c',
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s ease'
  },
  
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: '16px',
    width: '95%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out'
  },
  
  // Header
  modalHeader: {
    padding: '24px 32px',
    borderBottom: `2px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb'
  },
  
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1
  },
  
  headerIcon: {
    width: '56px',
    height: '56px',
    backgroundColor: colors.primary,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    fontSize: '24px',
    flexShrink: 0
  },
  
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: '0 0 8px 0',
    lineHeight: '1.2'
  },
  
  headerSubtitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  
  estadoBadge: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '700',
    border: `2px solid`,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  
  fechaBadge: {
    backgroundColor: colors.border,
    color: colors.text.secondary,
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  
  fechaIcon: {
    fontSize: '12px'
  },
  
  headerActions: {
    display: 'flex',
    gap: '8px'
  },
  
  actionButton: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.text.secondary,
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    transition: 'all 0.2s ease'
  },
  
  closeButton: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.text.secondary,
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    transition: 'all 0.2s ease'
  },
  
  // Body
  modalBody: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '20px'
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
    color: colors.text.secondary,
    fontWeight: '500'
  },
  
  // Sections
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.text.primary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '12px',
    borderBottom: `2px solid ${colors.border}`
  },
  
  sectionIcon: {
    color: colors.primary,
    fontSize: '16px'
  },
  
  productosCount: {
    marginLeft: 'auto',
    backgroundColor: colors.primary + '20',
    color: colors.primary,
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600'
  },
  
  // Info Grid
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  
  infoCard: {
    backgroundColor: '#f9fafb',
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  infoLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  infoValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  infoIcon: {
    fontSize: '14px',
    color: colors.text.light
  },
  
  copyButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.text.light,
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    fontSize: '12px',
    marginLeft: 'auto',
    transition: 'all 0.2s ease'
  },
  
  // Delivery/Pickup Sections
  deliverySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  
  pickupSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  
  // Notas
  notasCard: {
    backgroundColor: '#fef3c7',
    border: `2px solid #f59e0b`,
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  },
  
  notasContent: {
    flex: 1,
    fontSize: '15px',
    color: '#92400e',
    lineHeight: '1.6',
    fontStyle: 'italic'
  },
  
  // Productos
  productosList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  
  productoItem: {
    backgroundColor: '#f9fafb',
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  
  productoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  
  productoNombre: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  cantidadBadge: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '700'
  },
  
  productoPrecio: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.primary,
    whiteSpace: 'nowrap'
  },
  
  productoDescripcion: {
    fontSize: '14px',
    color: colors.text.secondary,
    lineHeight: '1.5'
  },
  
  productoFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px'
  },
  
  productoInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  
  productoCategoria: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.text.light,
    backgroundColor: colors.border,
    padding: '4px 10px',
    borderRadius: '12px'
  },
  
  productoNotas: {
    fontSize: '12px',
    color: '#d35400',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  
  productoSubtotal: {
    fontSize: '14px',
    fontWeight: '700',
    color: colors.primary
  },
  
  emptyProducts: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
    border: `2px dashed ${colors.border}`
  },
  
  // Categorías
  categoriasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  
  categoriaCard: {
    backgroundColor: '#d1fae5',
    border: `2px solid #10b981`,
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  categoriaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px'
  },
  
  categoriaNombre: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#065f46'
  },
  
  categoriaTotal: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#065f46'
  },
  
  categoriaStats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#065f46',
    fontWeight: '600'
  },
  
  categoriaStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  
  // Resumen Financiero
  resumenFinanciero: {
    backgroundColor: '#f0f7ff',
    border: `2px solid ${colors.primary}`,
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  
  resumenGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px'
  },
  
  resumenItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  
  resumenLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: '8px'
  },
  
  resumenValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.primary
  },
  
  totalSection: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: `2px solid ${colors.border}`
  },
  
  totalLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px'
  },
  
  totalAmount: {
    fontSize: '32px',
    fontWeight: '800',
    color: colors.primary
  },
  
  // Footer
  modalFooter: {
    padding: '24px 32px',
    borderTop: `2px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb'
  },
  
  footerActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  
  pdfButton: {
    backgroundColor: colors.pdf,
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    minWidth: '140px'
  },
  
  printButton: {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    minWidth: '120px'
  },
  
  whatsappButton: {
    backgroundColor: '#25D366',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    minWidth: '130px'
  },
  
  closeModalButton: {
    backgroundColor: colors.text.secondary,
    color: '#ffffff',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px'
  }
};

// Inyectar animaciones CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { 
        transform: translateY(20px);
        opacity: 0;
      }
      to { 
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Hover effects */
    button:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    .copy-button:hover {
      background-color: ${colors.border};
      color: ${colors.text.primary};
    }
    
    .action-button:hover {
      background-color: ${colors.border};
      color: ${colors.text.primary};
    }
    
    .close-button:hover {
      background-color: #fee2e2;
      color: ${colors.danger};
      border-color: ${colors.danger};
    }
    
    .pdf-button:hover {
      background-color: #c0392b;
    }
    
    .print-button:hover {
      background-color: ${colors.primaryLight};
    }
    
    .whatsapp-button:hover {
      background-color: #128C7E;
    }
    
    .close-modal-button:hover {
      background-color: ${colors.text.primary};
    }
    
    /* Scrollbar styling */
    *::-webkit-scrollbar {
      width: 8px;
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
  `;
  document.head.appendChild(styleSheet);
}

export default PedidoDetalleModal;