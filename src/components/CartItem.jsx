import { useCart } from '../contexts/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-item">
      <div className="cart-item-img">
        <img
          src={item.image}
          alt={item.title}
          onError={(e) => (e.target.style.display = 'none')}
        />
      </div>
      <div className="cart-item-info">
        <div className="cart-item-title">{item.title}</div>
        <div className="cart-item-price">{item.price} руб.</div>
        <div className="cart-item-quantity">
          <button
            className="quantity-btn minus"
            onClick={() => updateQuantity(item.id, -1)}
          >
            -
          </button>
          <span className="quantity-num">{item.quantity}</span>
          <button
            className="quantity-btn plus"
            onClick={() => updateQuantity(item.id, 1)}
          >
            +
          </button>
        </div>
        <div class="delete-btn-wrapper">
        <button className="delete-btn" onClick={() => removeFromCart(item.id)}>
          Удалить
        </button>
        </div>
      </div>
    </div>
  );
}