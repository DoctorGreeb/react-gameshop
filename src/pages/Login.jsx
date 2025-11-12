import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/dashboard');
    }
  };

  return (
    <section className="cart-section"> {/* Переиспользуем стиль */}
      <div className="cart-title">Вход в личный кабинет</div>
      <form onSubmit={handleLogin} style={{ maxWidth: '300px', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', marginBottom: '12px', padding: '8px', borderRadius: '4px' }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: '12px', padding: '8px', borderRadius: '4px' }}
        />
        <button type="submit" className="checkout-btn" style={{ width: '100%' }}>
          Войти
        </button>
      </form>
    </section>
  );
}