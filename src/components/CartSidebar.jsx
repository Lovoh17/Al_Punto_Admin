//import './CartSidebar.css';

const CartSidebar = ({ 
  carrito, 
  mostrar, 
  onCerrar, 
  onRemover, 
  onActualizarCantidad,
  total 
}) => {
  return (
    <div className={`cart-sidebar ${mostrar ? 'open' : ''}`}>
      <div className="cart-header">
        <h2>🛒 Tu Pedido</h2>
        <button className="close-cart" onClick={onCerrar}>×</button>
      </div>

      <div className="cart-content">
        {carrito.length === 0 ? (
          <div className="cart-empty">
            <p>Tu carrito está vacío</p>
            <span>Agrega algunos productos deliciosos</span>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {carrito.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.imagen} alt={item.nombre} />
                  <div className="item-details">
                    <h4>{item.nombre}</h4>
                    <p>S/ {item.precio.toFixed(2)}</p>
                  </div>
                  <div className="item-controls">
                    <button onClick={() => onActualizarCantidad(item.id, item.cantidad - 1)}>
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => onActualizarCantidad(item.id, item.cantidad + 1)}>
                      +
                    </button>
                  </div>
                  <button 
                    className="remove-item"
                    onClick={() => onRemover(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            
            <div className="cart-total">
              <strong>Total: S/ {total.toFixed(2)}</strong>
            </div>
            
            <button className="checkout-btn">
              Realizar Pedido
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;