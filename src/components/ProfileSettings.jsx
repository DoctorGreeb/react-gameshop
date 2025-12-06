// src/components/ProfileSettings.jsx — ЗАМЕНИТЬ ВЕСЬ ФАЙЛ НА ЭТОТ

import { useState, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:5000';
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

    // Загружаем данные профиля с сервера
    useEffect(() => {
        if (open && user) {
            fetch(`${API_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
                .then(r => r.json())
                .then(data => {
                    setDisplayName(data.displayName || '');
                    setEmail(data.email || '');
                    setCity(data.city || 'Ростов-на-Дону');
                    setCardNumber(data.cardNumber || '');
                    if (data.avatar) {
                        setImageSrc(data.avatar);
                        updateAvatarInHeader(data.avatar);
                    }
                })
                .catch(() => { });
        }
    }, [open, user]);

    const updateAvatarInHeader = (src) => {
        const avatarImg = document.querySelector('header img[alt="Avatar"]');
        if (avatarImg) avatarImg.src = src;
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

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

            const croppedImageUrl = canvas.toDataURL('image/jpeg');
            setImageSrc(croppedImageUrl);
            updateAvatarInHeader(croppedImageUrl);
        };
    };

    const handleSaveProfile = async () => {
        const token = localStorage.getItem('token');
        const avatarToSend = imageSrc?.startsWith('data:') ? imageSrc : imageSrc;

        const res = await fetch(`${API_URL}/api/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                displayName: displayName || user.username,
                email,
                city,
                cardNumber,
                avatar: avatarToSend || null
            })
        });

        if (res.ok) {
            window.dispatchEvent(new CustomEvent('profileUpdated', {
                detail: {
                    displayName: displayName || user.username,
                    avatar: imageSrc?.startsWith('data:') ? imageSrc : imageSrc
                }
            }));

        } else {
            alert('Ошибка сохранения');
        }

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
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999
        }} onClick={onClose}>
            <div style={{
                background: '#1e2229', padding: '40px', borderRadius: '20px',
                width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                <h2 style={{ textAlign: 'center', margin: '0 0 30px', color: '#66c0f4' }}>
                    Настройки профиля
                </h2>

                {/* АВАТАР */}
                <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                    <div style={{
                        width: '140px', height: '140px', borderRadius: '50%',
                        overflow: 'hidden', margin: '0 auto 16px', border: '4px solid #66c0f4',
                        background: '#333'
                    }}>
                        <img
                            src={imageSrc || 'https://via.placeholder.com/140/333/fff?text=U'}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <button onClick={() => fileInputRef.current.click()} style={btn('#444')}>
                        Сменить аватар
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    {imageSrc && imageSrc.startsWith('data:') && (
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ position: 'relative', height: '300px', background: '#000' }}>
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>
                            <button onClick={handleCropSave} style={btn('#66c0f4', '#23272e')}>
                                Применить обрезку
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
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
                            onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
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