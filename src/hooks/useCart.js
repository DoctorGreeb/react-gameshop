import { useState, useEffect } from "react";

export function useCart() {
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (game) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.title === game.title);
      if (existing) {
        return prev.map((i) => i.title === game.title ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...game, quantity: 1, image: game.video }];
    });
  };

  const updateQuantity = (index, change) => {
    setCart((prev) => {
      const newCart = [...prev];
      newCart[index].quantity = Math.max(1, Math.min(10, newCart[index].quantity + change));
      return newCart;
    });
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    if (window.confirm("Очистить корзину?")) {
      setCart([]);
    }
  };

  const checkout = () => {
    if (cart.length === 0) return alert("Корзина пуста!");
    alert("Заказ оформлен! Спасибо за покупку!");
    setCart([]);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2000);
  };

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
    showNotification,
  };
}