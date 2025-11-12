import { useCart } from '../contexts/CartContext';
import CartItem from '../components/CartItem';

export default function CartPage() {
  const { cart, clearCart, checkout } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="cart-section">
      <div className="cart-title">Корзина</div>
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">Корзина пуста</div>
        ) : (
          cart.map((item) => <CartItem key={item.id} item={item} />)
        )}
      </div>
      <div className="cart-total">
        <div className="total-price">
          Итого: <span>{total}</span> руб.
        </div>
        <button className="checkout-btn" onClick={checkout}>
          Оформить заказ
        </button>
        <button className="clear-cart-btn" onClick={clearCart}>
          Очистить корзину
        </button>
      </div>
    </section>
  );
}