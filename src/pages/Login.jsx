import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <section className="cart-section">
      <div className="cart-title">Вход</div>
      <form onSubmit={handleLogin} style={{ maxWidth: '300px', margin: '0 auto' }}>
        <input type="text" placeholder="Логин" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="checkout-btn" style={{ width: '100%' }}>
          Войти
        </button>
      </form>
    </section>
  );
}