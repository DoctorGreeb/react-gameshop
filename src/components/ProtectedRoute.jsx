// ProtectedRoute.jsx (обновлённый: добавлена проверка requireAdmin)
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.username !== 'admin') return <Navigate to="/" />;
  return children;
}