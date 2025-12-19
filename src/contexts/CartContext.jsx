// src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
const API_URL = 'http://localhost:5000';

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Загрузка корзины из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Загрузка заказов с сервера (если авторизован)
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
    showNotification({ message: `Добавлено: ${game.title}`, type: 'success' });
  };

  const updateQuantity = (id, change) => {
    setCart(prev => prev
      .map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item)
      .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    const item = cart.find(i => i.id === id);
    setCart(prev => prev.filter(i => i.id !== id));
    if (item) {
      showNotification({ message: `Удалено: ${item.title}`, type: 'warning' });
    }
  };

  // Открываем модалку подтверждения
  const clearCart = () => {
    setShowClearConfirm(true);
  };

  // Подтверждение очистки
  const confirmClear = () => {
    setCart([]);
    showNotification({ message: 'Корзина очищена', type: 'warning' });
    setShowClearConfirm(false);
  };

  // Отмена очистки
  const cancelClear = () => {
    setShowClearConfirm(false);
  };

  const checkout = async () => {
    if (cart.length === 0) {
      showNotification({ message: 'Корзина пуста!', type: 'warning' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showNotification({ message: 'Войдите в аккаунт для оформления заказа!', type: 'error' });
      return;
    }

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
      showNotification({ message: 'Заказ успешно оформлен! Спасибо за покупку!', type: 'success' });
      setCart([]);
      const newOrders = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      setOrders(newOrders);
    } else {
      showNotification({ message: 'Ошибка при оформлении заказа', type: 'error' });
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000); // 3 секунды для всех уведомлений
  };

  return (
    <CartContext.Provider value={{
      cart,
      orders,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      checkout,
      showNotification,
      notification,
      showClearConfirm,
      confirmClear,
      cancelClear
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