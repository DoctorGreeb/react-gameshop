import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="header-menu">
      <nav className="nav-unit">
        <Link to="/">Главная</Link>
      </nav>
      <nav className="nav-unit">
        <h1>HAZE</h1>
      </nav>
      <nav className="nav-unit">
        <Link to="/cart">Корзина ({totalItems})</Link>
        {user ? (
          <>
            <Link to="/dashboard">Личный кабинет</Link>
            <button
              onClick={logout}
              style={{
                background: 'none',
                color: '#66c0f4',
                border: 'none',
                cursor: 'pointer',
                padding: '0 1rem',
                fontSize: '1em',
              }}
            >
              Выход
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </nav>
    </header>
  );
}