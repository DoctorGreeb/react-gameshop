// src/contexts/AuthContext.jsx — ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Восстановление пользователя при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.id,
          username: payload.username,
          is_admin: !!payload.is_admin
        });
      } catch (e) {
        console.error('Неверный токен');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);

      // Расшифровываем токен
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      const fullUser = {
        id: payload.id,
        username: payload.username,
        is_admin: !!payload.is_admin
      };

      setUser(fullUser);
      return true;
    } else {
      alert(data.error || 'Ошибка входа');
      return false;
    }
  };

  const register = async (username, password) => {
    const res = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok || res.status === 201) {
      return await login(username, password);
    } else {
      const data = await res.json();
      alert(data.error || 'Ошибка регистрации');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);