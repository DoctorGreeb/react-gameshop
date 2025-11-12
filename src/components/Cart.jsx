import React, { useState, useEffect } from 'react';
import '../styles/App.css';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
    calculateTotal(savedCart);
  };

  const calculateTotal = (cartItems) => {
    let totalAmount = 0;
    cartItems.forEach(item => {
      const price = parseInt(item.price);
      if (!isNaN(price)) {
        totalAmount += price * item.quantity;
      }
    });
    setTotal(totalAmount);
  };

  const updateQuantity = (index, change) => {
    const newCart = [...cart];
    if (change > 0 && newCart[index].quantity < 10) {
      newCart[index].quantity += change;
    } else if (change < 0 && newCart[index].quantity > 1) {
      newCart[index].quantity += change;
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    calculateTotal(newCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    calculateTotal(newCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    if (window.confirm('Вы уверены, что хотите очистить корзину?')) {
      setCart([]);
      localStorage.removeItem('cart');
      setTotal(0);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const checkout = () => {
    if (cart.length === 0) {
      alert('Корзина пуста!');
      return;
    }
    
    alert('Заказ оформлен! Спасибо за покупку!');
    setCart([]);
    localStorage.removeItem('cart');
    setTotal(0);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="cart-page">
      <section className="cart-section">
        <div className="cart-title">Корзина</div>
        
        {cart.length === 0 ? (
          <div className="empty-cart">Корзина пуста</div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="cart-item-img">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-title">{item.title}</div>
                    <div className="cart-item-price">{item.price} руб.</div>
                    <div className="cart-item-quantity">
                      <button 
                        className="quantity-btn minus" 
                        onClick={() => updateQuantity(index, -1)}
                      >
                        -
                      </button>
                      <span className="quantity-num">{item.quantity}</span>
                      <button 
                        className="quantity-btn plus" 
                        onClick={() => updateQuantity(index, 1)}
                      >
                        +
                      </button>
                    </div>
                    <div class="delete-btn-wrapper">
                    <button 
                      className="delete-btn" 
                      onClick={() => removeItem(index)}
                    >
                      Удалить
                    </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-total">
              <div className="total-price">Итого: <span>{total}</span> руб.</div>
              <button className="checkout-btn" onClick={checkout}>
                Оформить заказ
              </button>
              <button className="clear-cart-btn" onClick={clearCart}>
                Очистить корзину
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Cart;