// src/components/ProfileSettings.jsx — ФИНАЛЬНАЯ ВЕРСИЯ (всё работает как надо)
import { useState, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { useAuth } from '../contexts/AuthContext';

const cities = [
  'Ростов-на-Дону', 'Москва', 'Санкт-Петербург', 'Краснодар',
  'Сочи', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород'
];

export default function ProfileSettings({ open, onClose }) {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Ростов-на-Дону');
  const [cardNumber, setCardNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef(null);

  // Загружаем данные профиля
  useEffect(() => {
    if (open && user) {
      const saved = JSON.parse(localStorage.getItem('userProfile') || '{}');
      setDisplayName(saved.displayName || user.username || '');
      setEmail(saved.email || '');
      setCity(saved.city || 'Ростов-на-Дону');
      setCardNumber(saved.cardNumber || '');
    }
  }, [open, user]);

  // Обновляем аватар в хедере мгновенно
  const updateAvatarInHeader = (src) => {
    const avatarImg = document.querySelector('header img[alt="Avatar"]');
    if (avatarImg) avatarImg.src = src;
  };

  // Обрезка и сохранение аватара (только аватар!)
  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      canvas.width = 200;
      canvas.height = 200;
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0, 0, 200, 200
      );

      const croppedImg = canvas.toDataURL('image/jpeg');
      localStorage.setItem('userAvatar', croppedImg);
      updateAvatarInHeader(croppedImg); // ← мгновенное обновление в хедере!
      alert('Аватар успешно изменён!');
      setImageSrc(null); // закрываем кроппер, но модалка остаётся
    };
  };

  // Сохранение остальных настроек (без аватара)
  const handleSaveProfile = () => {
    const profile = { displayName, email, city, cardNumber };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('displayName', displayName);

    // Обновляем имя в хедере
    const nameSpan = document.querySelector('header button span');
    if (nameSpan && displayName) {
      nameSpan.textContent = displayName;
    }

    alert('Настройки сохранены!');
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#181a20',
          border: '1px solid #333',
          borderRadius: '20px',
          width: '90%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '40px',
          color: '#e0e6ed',
          boxShadow: '0 20px 60px rgba(0,0,0.6)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '32px', color: '#66c0f4', fontSize: '2.2em' }}>
          Настройки профиля
        </h2>

        {/* АВАТАР */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src={localStorage.getItem('userAvatar') || 'https://via.placeholder.com/120/333/fff?text=U'}
            alt="Аватар"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '4px solid #66c0f4',
              objectFit: 'cover'
            }}
          />
          <br />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              marginTop: '16px',
              padding: '12px 28px',
              background: '#66c0f4',
              color: '#23272e',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Сменить аватар
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* КРОППЕР */}
        {imageSrc && (
          <div style={{ position: 'relative', height: '420px', margin: '30px 0', background: '#000', borderRadius: '16px', overflow: 'hidden' }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
              cropShape="round"
              showGrid={false}
            />
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '16px'
            }}>
              <button onClick={() => setImageSrc(null)} style={btn('#555')}>Отмена</button>
              <button onClick={handleCropSave} style={btn('#66c0f4', '#23272e')}>Изменить</button>
            </div>
          </div>
        )}

        {/* ФОРМА */}
        <div style={{ display: 'grid', gap: '24px', marginTop: imageSrc ? '10px' : '20px' }}>
          <div>
            <label style={label}>Отображаемое имя</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={input} placeholder="Как к вам обращаться?" />
          </div>
          <div>
            <label style={label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={input} />
          </div>
          <div>
            <label style={label}>Новый пароль (оставьте пустым)</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={input} />
          </div>
          <div>
            <label style={label}>Номер карты</label>
            <input
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0,16))}
              placeholder="1234 5678 9012 3456"
              maxLength="16"
              style={input}
            />
          </div>
          <div>
            <label style={label}>Город</label>
            <select value={city} onChange={e => setCity(e.target.value)} style={input}>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* КНОПКИ */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
          <button onClick={onClose} style={btn('#444')}>Отмена</button>
          <button onClick={handleSaveProfile} style={btn('#66c0f4', '#23272e', 'bold')}>
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}

// Стили
const label = { display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.95em' };
const input = {
  width: '100%',
  padding: '14px 18px',
  background: '#1e2229',
  border: '1px solid #444',
  borderRadius: '12px',
  color: '#e0e6ed',
  fontSize: '1em'
};
const btn = (bg, color = '#e0e6ed', weight = 'normal') => ({
  padding: '14px 32px',
  background: bg,
  color,
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: weight,
  fontSize: '1em'
});