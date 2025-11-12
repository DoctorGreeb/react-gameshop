import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); // НОВОЕ: История заказов
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedOrders = localStorage.getItem('orders');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [cart, orders]);

  const addToCart = (game) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === game.id);
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prev, { ...game, quantity: 1, image: game.thumbnail }];
    });
  };

  const updateQuantity = (id, change) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, Math.min(10, item.quantity + change)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    if (window.confirm('Вы уверены, что хотите очистить корзину?')) {
      setCart([]);
    }
  };

  const checkout = () => {
    if (cart.length === 0) {
      alert('Корзина пуста!');
      return;
    }
    const newOrder = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
    setOrders((prev) => [...prev, newOrder]); // Сохраняем заказ
    alert('Заказ оформлен! Спасибо за покупку!');
    setCart([]);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2000);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orders, // НОВОЕ: Экспорт orders
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        checkout,
        showNotification,
        notification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};