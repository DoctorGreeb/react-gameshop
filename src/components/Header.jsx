// src/components/Header.jsx — ФИНАЛЬНАЯ ВЕРСИЯ: аватар не пропадает + красивые отступы
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileSettings from './ProfileSettings';

export default function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // При загрузке страницы — подтягиваем аватар и имя из localStorage
  const [currentAvatar, setCurrentAvatar] = useState(
    localStorage.getItem('userAvatar') || 'https://via.placeholder.com/40/333/fff?text=User'
  );
  const [currentDisplayName, setCurrentDisplayName] = useState(
    localStorage.getItem('displayName') || user?.username || 'Гость'
  );

  useEffect(() => {
    // Обновляем при изменении в localStorage (например, после настроек)
    const updateFromStorage = () => {
      const avatar = localStorage.getItem('userAvatar');
      const name = localStorage.getItem('displayName');
      if (avatar) setCurrentAvatar(avatar);
      if (name) setCurrentDisplayName(name);
    };

    updateFromStorage();
    window.addEventListener('storage', updateFromStorage);
    return () => window.removeEventListener('storage', updateFromStorage);
  }, []);

  // Также обновляем при изменении user (вход/выход)
  useEffect(() => {
    if (user) {
      const savedName = localStorage.getItem('displayName');
      setCurrentDisplayName(savedName || user.username);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header style={{
        background: 'rgba(24, 26, 32, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(102, 192, 244, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '16px 20px', // ← ОТСТУПЫ ОТ КРАЁВ
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          {/* ЛОГО */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <h1 style={{
              fontSize: '2.4em',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #66c0f4, #8fd3f4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              letterSpacing: '-1px'
            }}>
              HAZE
            </h1>
          </Link>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* КОРЗИНА */}
            <Link
              to="/cart"
              style={{
                position: 'relative',
                color: '#e0e6ed',
                textDecoration: 'none',
                padding: '10px 16px',
                borderRadius: '10px',
                background: totalItems > 0 ? 'rgba(102,192,244,0.15)' : 'transparent',
                fontWeight: '600',
                transition: '0.3s'
              }}
            >
              Корзина
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#e74c3c',
                  color: 'white',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  fontSize: '0.8em',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* ПРОФИЛЬ */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#e0e6ed',
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  transition: '0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(102,192,244,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <img
                  src={currentAvatar}
                  alt="Avatar"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #66c0f4',
                    objectFit: 'cover'
                  }}
                />
                <span style={{ fontWeight: '600' }}>
                  {currentDisplayName}
                </span>
                <span style={{ fontSize: '0.8em', opacity: 0.7 }}>▼</span>
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: '#1e2229',
                  border: '1px solid #333',
                  borderRadius: '14px',
                  padding: '12px 0',
                  minWidth: '220px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  zIndex: 1000
                }}>
                  {user ? (
                    <>
                      <MenuItem onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}>
                        Личный кабинет
                      </MenuItem>
                      {user.username === 'admin' && (
                        <MenuItem onClick={() => { setMenuOpen(false); navigate('/admin'); }}>
                          Панель администратора
                        </MenuItem>
                      )}
                      <MenuItem onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}>
                        Настройки профиля
                      </MenuItem>
                      <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '8px 0' }} />
                      <MenuItem onClick={handleLogout} style={{ color: '#e74c3c' }}>
                        Выйти
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem onClick={() => { setMenuOpen(false); navigate('/login'); }}>
                        Войти
                      </MenuItem>
                      <MenuItem onClick={() => { setMenuOpen(false); navigate('/register'); }}>
                        Регистрация
                      </MenuItem>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ProfileSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

function MenuItem({ children, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 24px',
        color: '#e0e6ed',
        cursor: 'pointer',
        transition: '0.2s',
        ...style
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(102,192,244,0.15)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </div>
  );
}