import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000'; // ← поменяй на свой сервер, если на другом порту/домене

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (token && savedUsername) {
      setUser({ username: savedUsername });
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
      localStorage.setItem('username', data.username);
      setUser({ username: data.username });
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

    const data = await res.json();

    if (res.ok || res.status === 201) {
      // Автологин после регистрации
      return await login(username, password);
    } else {
      alert(data.error || 'Ошибка регистрации');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);