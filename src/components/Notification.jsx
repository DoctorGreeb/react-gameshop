// src/components/Notification.jsx
import { useCart } from '../contexts/CartContext';

export default function Notification() {
  const { notification } = useCart();

  // Если уведомления нет — сразу возвращаем null (useEffect вызывается всегда)
  if (!notification) return null;

  const message = typeof notification === 'object' ? notification.message : notification;
  const type = typeof notification === 'object' ? notification.type || 'success' : 'success';

  const bgColor = {
    success: '#66c0f4',
    warning: '#f39c12',
    error: '#e74c3c'
  }[type];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '40px',
        right: '40px',
        background: bgColor,
        color: '#23272e',
        padding: '16px 32px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        zIndex: 2000,
        fontWeight: 'bold',
        fontSize: '1.1em',
        maxWidth: '400px',
        width: 'auto',
        height: 'auto',
        lineHeight: '1.4',
        animation: 'slideDown 0.3s ease',
        pointerEvents: 'none'
      }}
    >
      {message}
    </div>
  );
}