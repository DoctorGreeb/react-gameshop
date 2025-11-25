import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
const API_URL = 'http://localhost:5000';

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState('');

  // Загрузка корзины из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Загрузка заказов с сервера (только если авторизован)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setOrders(data || []))
        .catch(() => setOrders([]));
    }
  }, []);

  const addToCart = (game) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === game.id);
      if (existing) {
        return prev.map(i => i.id === game.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...game, quantity: 1, image: game.thumbnail }];
    });
    showNotification(`Добавлено: ${game.title}`);
  };

  const updateQuantity = (id, change) => {
    setCart(prev => prev
      .map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item)
      .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const clearCart = () => {
    if (window.confirm('Очистить корзину?')) setCart([]);
  };

  const checkout = async () => {
    if (cart.length === 0) return alert('Корзина пуста!');

    const token = localStorage.getItem('token');
    if (!token) return alert('Войдите в аккаунт для оформления заказа!');

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items: cart, total })
    });

    if (res.ok) {
      alert('Заказ успешно оформлен!');
      setCart([]);
      // Обновляем заказы
      const newOrders = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      setOrders(newOrders);
    } else {
      alert('Ошибка при оформлении заказа');
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2000);
  };

  return (
    <CartContext.Provider value={{
      cart, orders, addToCart, updateQuantity, removeFromCart,
      clearCart, checkout, showNotification, notification
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};