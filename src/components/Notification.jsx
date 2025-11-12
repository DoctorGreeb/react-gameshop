import { useCart } from '../contexts/CartContext';

export default function Notification() {
  const { notification } = useCart();
  if (!notification) return null;
  return <div className="notification">{notification}</div>;
}