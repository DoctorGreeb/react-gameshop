import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) return setError('Заполните все поля');
    if (password !== confirmPassword) return setError('Пароли не совпадают');
    if (password.length < 4) return setError('Пароль должен быть не менее 4 символов');

    const success = await register(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <section className="cart-section">
      <div className="cart-title">Регистрация</div>
      <form onSubmit={handleRegister} style={{ maxWidth: '300px', margin: '0 auto' }}>
        <input type="text" placeholder="Логин" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
        <input type="password" placeholder="Повторите пароль" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        {error && <p style={{ color: '#e74c3c' }}>{error}</p>}
        <button type="submit" className="checkout-btn" style={{ width: '100%' }}>
          Зарегистрироваться
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '16px' }}>
        Уже есть аккаунт? <a href="/login" style={{ color: '#66c0f4' }}>Войти</a>
      </p>
    </section>
  );
}