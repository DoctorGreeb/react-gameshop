// src/components/Header.jsx — 100% РАБОЧИЙ, БЕЗ ОШИБОК
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileSettings from './ProfileSettings';

const themes = [
  { name: 'Midnight',    bg: '#0d0f14', accent: '#66c0f4', text: '#e0e6ed', card: '#181a20', cardHover: '#1f232b' },
  { name: 'Obsidian',    bg: '#12131a', accent: '#89b4fa', text: '#cdd6f4', card: '#1e1e2e', cardHover: '#24283b' },
  { name: 'Nord',        bg: '#2e3440', accent: '#88c0d0', text: '#d8dee9', card: '#3b4252', cardHover: '#434c5e' },
  { name: 'Dracula',     bg: '#282a36', accent: '#bd93f9', text: '#f8f8f2', card: '#44475a', cardHover: '#6272a4' },
  { name: 'Everforest',  bg: '#2d353b', accent: '#a7c080', text: '#d3c6aa', card: '#374247', cardHover: '#404c54' },
  { name: 'Catppuccin',  bg: '#1e1e2e', accent: '#cba6f7', text: '#cdd6f4', card: '#313244', cardHover: '#3b4261' },
  { name: 'Tokyo Night', bg: '#1a1b27', accent: '#7aa2f7', text: '#c0caf5', card: '#24283b', cardHover: '#292e42' },
  { name: 'Gruvbox Dark',bg: '#282828', accent: '#cc241d', text: '#ebdbb2', card: '#3c3836', cardHover: '#504945' },
];

export default function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const themeRef = useRef(null);

  // Безопасный подсчёт товаров
  const totalItems = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;

  // Аватар и имя
  const [currentAvatar, setCurrentAvatar] = useState(() =>
    localStorage.getItem('userAvatar') || 'https://via.placeholder.com/40/333/fff?text=U'
  );
  const [currentDisplayName, setCurrentDisplayName] = useState(() =>
    localStorage.getItem('displayName') || user?.username || 'Гость'
  );

  // Текущая тема
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : themes[0];
  });

  // Применяем тему + ФИКС ЛОГОТИПА
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', currentTheme.bg);
    root.style.setProperty('--accent', currentTheme.accent);
    root.style.setProperty('--text', currentTheme.text);
    root.style.setProperty('--card', currentTheme.card);
    root.style.setProperty('--card-hover', currentTheme.cardHover || '#20232a');
    root.style.setProperty('--border', currentTheme.border || '#333');

    // Фиксим логотип
    const logo = document.querySelector('header h1');
    if (logo) {
      logo.style.background = `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accent}cc)`;
      logo.style.webkitBackgroundClip = 'text';
      logo.style.webkitTextFillColor = 'transparent';
    }

    localStorage.setItem('theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  // Обновление аватара и имени
  useEffect(() => {
    const update = () => {
      const avatar = localStorage.getItem('userAvatar');
      const name = localStorage.getItem('displayName');
      if (avatar) setCurrentAvatar(avatar);
      if (name) setCurrentDisplayName(name);
    };
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);

  useEffect(() => {
    if (user) {
      const savedName = localStorage.getItem('displayName');
      setCurrentDisplayName(savedName || user.username);
    }
  }, [user]);

  // Закрытие меню
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target)) setThemeMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
        padding: '16px 20px',
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
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontSize: '2.4em',
              fontWeight: '900',
              margin: 0,
              letterSpacing: '-1px',
              display: 'inline-block'
            }}>
              HAZE
            </h1>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* КОРЗИНА */}
            <Link to="/cart" style={{
              position: 'relative',
              color: currentTheme.text,
              textDecoration: 'none',
              padding: '10px 16px',
              borderRadius: '10px',
              background: totalItems > 0 ? `${currentTheme.accent}22` : 'transparent',
              fontWeight: '600',
              transition: '0.2s'
            }}>
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
                  color: currentTheme.text,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '12px'
                }}
              >
                <img
                  src={currentAvatar}
                  alt="Avatar"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: `2px solid ${currentTheme.accent}`,
                    objectFit: 'cover'
                  }}
                />
                <span style={{ fontWeight: '600' }}>{currentDisplayName}</span>
                <span style={{ fontSize: '1.2em', marginLeft: '4px' }}>▼</span>
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: currentTheme.card,
                  border: `1px solid ${currentTheme.accent}33`,
                  borderRadius: '14px',
                  padding: '12px 0',
                  minWidth: '220px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  zIndex: 1000
                }}>
                  {user ? (
                    <>
                      <MenuItem onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}>Личный кабинет</MenuItem>
                      {user.username === 'admin' && (
                        <MenuItem onClick={() => { setMenuOpen(false); navigate('/admin'); }}>Панель администратора</MenuItem>
                      )}
                      <MenuItem onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}>Настройки профиля</MenuItem>
                      <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '8px 0' }} />
                      <MenuItem onClick={handleLogout} style={{ color: '#e74c3c' }}>Выйти</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem onClick={() => { setMenuOpen(false); navigate('/login'); }}>Войти</MenuItem>
                      <MenuItem onClick={() => { setMenuOpen(false); navigate('/register'); }}>Регистрация</MenuItem>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* КНОПКА ТЕМ — КВАДРАТНАЯ СТЕКЛЯННАЯ С БЛЕСКОМ И ПЕРЕЛИВОМ */}
            <div ref={themeRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                style={{
                  width: '46px',
                  height: '46px',
                  background: `linear-gradient(135deg, ${currentTheme.accent}22, ${currentTheme.accent}11)`,
                  border: `1px solid ${currentTheme.accent}55`,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `
        0 4px 12px rgba(0,0,0,0.4),
        inset 0 2px 2px 8px ${currentTheme.accent}33,
        0 0 16px ${currentTheme.accent}11
      `,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  transition: 'all 0.35s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                  e.currentTarget.style.boxShadow = `
        0 8px 25px rgba(0,0,0,0.5),
        inset 0 3px 15px ${currentTheme.accent}55,
        0 0 30px ${currentTheme.accent}44
      `;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `
        0 4px 12px rgba(0,0,0,0.4),
        inset 0 2px 8px ${currentTheme.accent}33,
        0 0 16px ${currentTheme.accent}11
      `;
                }}
                title="Сменить тему"
              >
                {/* Блеск (светлый блик сверху-слева) */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25), transparent 70%)',
                  borderRadius: '14px 14px 0 0',
                  pointerEvents: 'none'
                }} />

                {/* Медленный перелив по диагонали */}
                <div style={{
                  position: 'absolute',
                  top: '-100%',
                  left: '-100%',
                  width: '200%',
                  height: '200%',
                  background: `conic-gradient(
        transparent 0deg,
        ${currentTheme.accent}33 90deg,
        ${currentTheme.accent}22 180deg,
        transparent 270deg
      )`,
                  animation: 'rotate 12s linear infinite',
                  opacity: 0.4,
                  pointerEvents: 'none'
                }} />

                {/* Иконка палитры в центре */}
                <span style={{
                  fontSize: '1.4em',
                  color: currentTheme.accent,
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))'
                }}>
                  ◐
                </span>
              </button>

              {/* Выпадающее меню — оставляем как было */}
              {themeMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: currentTheme.card,
                  border: `1px solid ${currentTheme.accent}33`,
                  borderRadius: '14px',
                  padding: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  zIndex: 1000
                }}>
                  {themes.map(theme => (
                    <div
                      key={theme.name}
                      onClick={() => {
                        setCurrentTheme(theme);
                        setThemeMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: currentTheme.name === theme.name ? `${theme.accent}33` : 'transparent',
                        marginBottom: '6px'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: theme.accent,
                        borderRadius: '50%',
                        border: '2px solid #333'
                      }} />
                      <span style={{ color: theme.text, fontSize: '0.95em' }}>{theme.name}</span>
                    </div>
                  ))}
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