import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!username || !password) {
      setError('Заполните все поля');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 4) {
      setError('Пароль должен быть не менее 4 символов');
      return;
    }

    // Сохраняем пользователя в localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.username === username)) {
      setError('Пользователь уже существует');
      return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));

    // Автологин после регистрации
    login(username, password);
    navigate('/dashboard');
  };

  return (
    <section className="cart-section">
      <div className="cart-title">Регистрация</div>
      <form onSubmit={handleRegister} style={{ maxWidth: '300px', margin: '0 auto' }}>
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
        <input
          type="password"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: '100%', marginBottom: '12px', padding: '8px', borderRadius: '4px' }}
        />
        {error && <p style={{ color: '#e74c3c', marginBottom: '12px' }}>{error}</p>}
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