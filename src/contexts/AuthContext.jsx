// src/contexts/AuthContext.jsx — ФИНАЛЬНАЯ ВЕРСИЯ (всё работает идеально)

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверяем токен при каждом запуске/перезагрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Расшифровываем токен
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentUser = {
          id: payload.id,
          username: payload.username,
          is_admin: !!payload.is_admin
        };
        setUser(currentUser);

        // Дополнительно обновляем данные профиля (имя, аватар)
        fetch(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(data => {
            window.dispatchEvent(new CustomEvent('profileUpdated', { detail: data }));
          })
          .catch(() => { });
      } catch (e) {
        console.error('Неверный токен');
        localStorage.removeItem('token');
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

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      const fullUser = {
        id: payload.id,
        username: payload.username,
        is_admin: !!payload.is_admin
      };

      setUser(fullUser);

      // Обновляем профиль сразу после логина
      fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${data.token}` }
      })
        .then(r => r.json())
        .then(profileData => {
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profileData }));
        });

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
  
  // ЖЁСТКИЙ СБРОС — работает всегда
  window.dispatchEvent(new CustomEvent('USER_LOGGED_OUT'));
};

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);