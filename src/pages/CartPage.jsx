// src/pages/CartPage.jsx — ИСПРАВЛЕНО: все переменные определены
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/CartItem';

export default function CartPage() {
  const { 
    cart, 
    clearCart, 
    checkout,
    showClearConfirm,
    confirmClear,
    cancelClear 
  } = useCart();

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

      {/* Красивое модальное подтверждение очистки корзины */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }} onClick={cancelClear}>
          <div style={{
            background: '#181a20',
            border: '1px solid #333',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', color: '#66c0f4', fontSize: '1.5em' }}>
              Очистить корзину?
            </h3>
            <p style={{ margin: '0 0 32px', color: '#aaa' }}>
              Все товары будут удалены. Продолжить?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={cancelClear}
                style={{
                  padding: '12px 28px',
                  background: 'transparent',
                  border: '1px solid #555',
                  borderRadius: '8px',
                  color: '#aaa',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
              <button
                onClick={confirmClear}
                style={{
                  padding: '12px 28px',
                  background: '#e74c3c',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}