// src/utils/reportes.js
export const generarResumenDiaPDF = (stats, pedidosHoy) => {
  const hoy = new Date();
  const fechaFormateada = hoy.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const horaGeneracion = hoy.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calcular métricas adicionales
  const ticketPromedio = stats.pedidosHoy > 0 ? stats.ventasHoy / stats.pedidosHoy : 0;
  const porcentajeEntregados = stats.pedidosHoy > 0 ? (pedidosHoy.filter(p => p.estado === 'entregado').length / stats.pedidosHoy * 100) : 0;
  
  // Análisis por tipo de pedido
  const pedidosDelivery = pedidosHoy.filter(p => p.numero_mesa === 'Delivery' || p.numero_mesa === 'delivery').length;
  const pedidosMesa = pedidosHoy.filter(p => p.numero_mesa && p.numero_mesa !== 'Delivery' && p.numero_mesa !== 'delivery').length;
  
  // Análisis por hora
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

  // Ordenar horas por actividad
  const horasActivas = Object.entries(pedidosPorHora)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calcular estadísticas por estado
  const pedidosPorEstado = {
    pendiente: pedidosHoy.filter(p => p.estado === 'pendiente').length,
    en_preparacion: pedidosHoy.filter(p => p.estado === 'en_preparacion').length,
    listo: pedidosHoy.filter(p => p.estado === 'listo').length,
    entregado: pedidosHoy.filter(p => p.estado === 'entregado').length,
    cancelado: pedidosHoy.filter(p => p.estado === 'cancelado').length
  };

  // Análisis de ventas por estado
  const ventasPorEstado = {
    pendiente: pedidosHoy
      .filter(p => p.estado === 'pendiente')
      .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0),
    entregado: pedidosHoy
      .filter(p => p.estado === 'entregado')
      .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0)
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Resumen del Día - ${fechaFormateada}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          color: #333;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 0;
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
          font-size: 24px;
          margin: 0 0 10px 0;
          font-weight: 700;
        }
        
        .header h2 {
          color: #666;
          font-size: 16px;
          margin: 0;
          font-weight: 400;
        }
        
        .section {
          margin: 25px 0;
          page-break-inside: avoid;
        }
        
        .section-title {
          background-color: #f8f9fa;
          border-left: 4px solid #2c5aa0;
          padding: 10px 15px;
          font-size: 14px;
          font-weight: 700;
          color: #2c5aa0;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .metric-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #2c5aa0;
          margin-bottom: 5px;
          display: block;
        }
        
        .metric-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .metric-sub {
          font-size: 11px;
          color: #999;
          margin-top: 5px;
        }
        
        .table-container {
          overflow-x: auto;
          margin: 15px 0;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        
        .data-table th {
          background-color: #f8f9fa;
          color: #2c5aa0;
          font-weight: 600;
          text-align: left;
          padding: 10px;
          border-bottom: 2px solid #e0e0e0;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
        }
        
        .data-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #eee;
          vertical-align: top;
        }
        
        .data-table tr:hover {
          background-color: #f8f9fa;
        }
        
        .highlight-row {
          background-color: #fff8e1;
          font-weight: 600;
        }
        
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 600;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-pendiente { background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .status-en-preparacion { background-color: #cce5ff; color: #004085; border: 1px solid #b8daff; }
        .status-listo { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status-entregado { background-color: #e2e3e5; color: #383d41; border: 1px solid #d6d8db; }
        .status-cancelado { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        
        .summary-box {
          background-color: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .summary-title {
          font-size: 14px;
          font-weight: 600;
          color: #2c5aa0;
          margin-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 10px;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }
        
        .summary-label {
          color: #666;
          font-weight: 500;
        }
        
        .summary-value {
          color: #333;
          font-weight: 600;
        }
        
        .summary-value.highlight {
          color: #2c5aa0;
          font-size: 14px;
        }
        
        .bar-chart {
          margin: 15px 0;
        }
        
        .bar-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .bar-label {
          width: 80px;
          font-size: 11px;
          color: #666;
          text-align: right;
          padding-right: 10px;
        }
        
        .bar-container {
          flex: 1;
          height: 20px;
          background-color: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }
        
        .bar-fill {
          height: 100%;
          background-color: #2c5aa0;
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        
        .bar-value {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          font-weight: 600;
          color: #333;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          font-size: 10px;
          color: #999;
        }
        
        .footer strong {
          color: #666;
        }
        
        .print-info {
          font-size: 10px;
          color: #999;
          text-align: right;
          margin-bottom: 10px;
        }
        
        @media print {
          body {
            font-size: 11px;
          }
          
          .metric-card {
            break-inside: avoid;
          }
          
          .section {
            break-inside: avoid;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>RESUMEN DIARIO DE OPERACIONES</h1>
          <h2>Fecha: ${fechaFormateada}</h2>
          <div class="print-info">
            Generado: ${horaGeneracion} | Sistema de Gestión de Pedidos
          </div>
        </div>

        <div class="section">
          <div class="section-title">RESUMEN EJECUTIVO</div>
          <div class="summary-box">
            <div class="summary-item">
              <span class="summary-label">Total de Pedidos del Día</span>
              <span class="summary-value highlight">${stats.pedidosHoy}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Ventas Totales del Día</span>
              <span class="summary-value highlight">$${stats.ventasHoy.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Ticket Promedio</span>
              <span class="summary-value">$${ticketPromedio.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Eficiencia de Entrega</span>
              <span class="summary-value">${porcentajeEntregados.toFixed(1)}%</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Pedidos Delivery / Mesa</span>
              <span class="summary-value">${pedidosDelivery} / ${pedidosMesa}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">MÉTRICAS PRINCIPALES</div>
          <div class="metrics-grid">
            <div class="metric-card">
              <span class="metric-value">${stats.pedidosHoy}</span>
              <span class="metric-label">Pedidos Totales</span>
              <span class="metric-sub">Hasta ${horaGeneracion}</span>
            </div>
            
            <div class="metric-card">
              <span class="metric-value">$${stats.ventasHoy.toFixed(2)}</span>
              <span class="metric-label">Ventas del Día</span>
              <span class="metric-sub">Ingreso total</span>
            </div>
            
            <div class="metric-card">
              <span class="metric-value">$${ticketPromedio.toFixed(2)}</span>
              <span class="metric-label">Ticket Promedio</span>
              <span class="metric-sub">Por pedido</span>
            </div>
            
            <div class="metric-card">
              <span class="metric-value">${porcentajeEntregados.toFixed(1)}%</span>
              <span class="metric-label">Tasa de Entrega</span>
              <span class="metric-sub">Completados vs total</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">DISTRIBUCIÓN POR ESTADO</div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Cantidad</th>
                  <th>Porcentaje</th>
                  <th>Valor Total</th>
                  <th>Ticket Promedio</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(pedidosPorEstado).map(([estado, cantidad]) => {
                  const pedidosEstado = pedidosHoy.filter(p => p.estado === estado);
                  const ventasEstado = pedidosEstado.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
                  const porcentaje = (cantidad / stats.pedidosHoy * 100).toFixed(1);
                  const ticketPromedioEstado = cantidad > 0 ? ventasEstado / cantidad : 0;
                  
                  return `
                    <tr>
                      <td>
                        <span class="status-badge status-${estado.replace('_', '-')}">
                          ${estado === 'en_preparacion' ? 'En Preparación' : 
                            estado === 'pendiente' ? 'Pendiente' :
                            estado === 'listo' ? 'Listo' :
                            estado === 'entregado' ? 'Entregado' : 'Cancelado'}
                        </span>
                      </td>
                      <td>${cantidad}</td>
                      <td>${porcentaje}%</td>
                      <td>$${ventasEstado.toFixed(2)}</td>
                      <td>$${ticketPromedioEstado.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        ${horasActivas.length > 0 ? `
        <div class="section">
          <div class="section-title">HORAS DE MAYOR ACTIVIDAD</div>
          <div class="bar-chart">
            ${horasActivas.map(([hora, cantidad]) => {
              const porcentaje = (cantidad / stats.pedidosHoy * 100).toFixed(1);
              const horaFormateada = `${hora.padStart(2, '0')}:00`;
              
              return `
                <div class="bar-item">
                  <span class="bar-label">${horaFormateada}</span>
                  <div class="bar-container">
                    <div class="bar-fill" style="width: ${porcentaje}%"></div>
                    <span class="bar-value">${cantidad} pedidos (${porcentaje}%)</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">VENTAS POR TIPO DE PEDIDO</div>
          <div class="summary-box">
            <div class="summary-item">
              <span class="summary-label">Delivery</span>
              <span class="summary-value">${pedidosDelivery} pedidos</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Recoger en Restaurante</span>
              <span class="summary-value">${pedidosMesa} pedidos</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Distribución</span>
              <span class="summary-value">
                ${stats.pedidosHoy > 0 ? ((pedidosDelivery / stats.pedidosHoy * 100).toFixed(1)) : 0}% Delivery / 
                ${stats.pedidosHoy > 0 ? ((pedidosMesa / stats.pedidosHoy * 100).toFixed(1)) : 0}% Mesa
              </span>
            </div>
          </div>
        </div>

        ${stats.productosMasVendidos.length > 0 ? `
        <div class="section">
          <div class="section-title">TOP 5 PRODUCTOS MÁS VENDIDOS</div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Producto</th>
                  <th>Cantidad Vendida</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                ${stats.productosMasVendidos.map((producto, index) => {
                  const totalVendido = stats.productosMasVendidos.reduce((sum, p) => sum + p.cantidad, 0);
                  const porcentaje = ((producto.cantidad / totalVendido) * 100).toFixed(1);
                  
                  return `
                    <tr ${index < 3 ? 'class="highlight-row"' : ''}>
                      <td>#${index + 1}</td>
                      <td>${producto.nombre}</td>
                      <td>${producto.cantidad} unidades</td>
                      <td>${porcentaje}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">ANÁLISIS FINANCIERO</div>
          <div class="summary-box">
            <div class="summary-item">
              <span class="summary-label">Ventas Pendientes por Cobrar</span>
              <span class="summary-value">$${ventasPorEstado.pendiente.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Ventas Confirmadas</span>
              <span class="summary-value">$${ventasPorEstado.entregado.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Tasa de Conversión</span>
              <span class="summary-value">
                ${stats.ventasHoy > 0 ? ((ventasPorEstado.entregado / stats.ventasHoy * 100).toFixed(1)) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Reporte Generado por Sistema de Gestión de Restaurante</strong></p>
          <p>Fecha de generación: ${fechaFormateada} ${horaGeneracion}</p>
          <p>Documento para uso interno - Todos los datos son confidenciales</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

// src/pages/PedidosPage.jsx - Función del botón
