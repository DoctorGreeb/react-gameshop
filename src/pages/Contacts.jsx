// src/pages/Contacts.jsx — ФИНАЛЬНАЯ ВЕРСИЯ: карта видна на мобильных + полная высота экрана на десктопах
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Кастомная синяя пульсирующая иконка для пользователя
const userIcon = L.divIcon({
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
    ">
      <!-- Внешнее пульсирующее кольцо -->
      <div style="
        position: absolute;
        width: 36px;
        height: 36px;
        background: #66c0f4;
        border-radius: 50%;
        opacity: 0.4;
        animation: pulse-ring 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
      "></div>

      <!-- Основная метка -->
      <div style="
        position: absolute;
        width: 20px;
        height: 20px;
        background: #66c0f4;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        left: 8px;
        top: 8px;
      "></div>

      <!-- Маленькая белая точка в центре -->
      <div style="
        position: absolute;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        left: 14px;
        top: 14px;
      "></div>
    </div>

    <style>
      @keyframes pulse-ring {
        0%   { transform: scale(0.6); opacity: 0.4; }
        70%  { transform: scale(1.3); opacity: 0; }
        100% { transform: scale(1.3); opacity: 0; }
      }
    </style>
  `,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

const shopIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const points = [
    { coords: [47.2325, 39.7205], title: 'Главный офис и склад HAZE Shop', address: 'ул. Большая Садовая, 68', phone: '+7 (863) 300-88-99', hours: 'Пн–Вс: 10:00 – 21:00', main: true },
    { coords: [47.215, 39.685], title: 'Пункт выдачи — Западный', address: 'пр. Стачки, 175 (ТЦ Золотой Вавилон)', hours: '10:00 – 21:00' },
    { coords: [47.285, 39.765], title: 'Пункт выдачи — Северный', address: 'ул. Орбитальная, 32', hours: 'Самовывоз 24/7' },
    { coords: [47.198, 39.701], title: 'Пункт выдачи — Центр', address: 'пер. Соборный, 17', hours: '10:00 – 22:00' },
];

// Компонент для центрирования карты
function MapController({ center, userPosition }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, userPosition ? 14 : 12);
    }, [center, userPosition, map]);
    return null;
}

// Компонент для пересчёта размера карты (важно для мобильных)
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const timer1 = setTimeout(() => map.invalidateSize(true), 100);
        const timer2 = setTimeout(() => map.invalidateSize(true), 300);
        const timer3 = setTimeout(() => map.invalidateSize(true), 600);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [map]);

    return null;
}

export default function Contacts() {
    const [userPosition, setUserPosition] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
                () => console.log('Геолокация отключена')
            );
        }
    }, []);

    const center = userPosition || [47.23, 39.71];

    const handleRoute = (lat, lng) => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const url = isMobile
            ? `yandexmaps://maps.yandex.ru/?rtext=${userPosition ? userPosition.join(',') + '~' : ''}${lat},${lng}&rtt=auto`
            : `https://yandex.ru/maps/?rtext=${userPosition ? userPosition.join(',') + '~' : ''}${lat},${lng}&rtt=auto`;
        window.open(url, '_blank');
    };

    return (
        <>
            {/* Мобильная адаптация + фикс высоты на десктопах */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 767px) {
                    .contacts-page {
                        flex-direction: column !important;
                        min-height: 100vh !important;
                    }
                    .contacts-sidebar {
                        width: 100% !important;
                        border-right: none !important;
                        border-bottom: 1px solid #333 !important;
                        padding: 32px 20px !important;
                        box-shadow: none !important;
                    }
                    .contacts-map {
                        width: 100% !important;
                        height: 500px !important;
                        min-height: 500px !important;
                        flex: 0 0 500px !important;
                    }
                    .leaflet-container {
                        height: 100% !important;
                        width: 100% !important;
                    }
                    .location-notice {
                        top: 20px !important;
                        right: 20px !important;
                        left: auto !important;
                        transform: none !important;
                    }
                }

                /* Фикс высоты на десктопах — страница занимает весь экран */
                @media (min-width: 768px) {
                    .contacts-page {
                        height: 85vh !important;
                        min-height: 85vh !important;
                    }
                    .contacts-map {
                        height: 100% !important;
                    }
                }
            ` }} />

            {/* Главный контейнер */}
            <div className="contacts-page" style={{ display: 'flex' }}>
                {/* Сайдбар */}
                <div className="contacts-sidebar" style={{
                    width: '420px',
                    background: 'linear-gradient(135deg, #181a20, #1e2229)',
                    borderRight: '1px solid #333',
                    padding: '40px 32px',
                    overflowY: 'auto',
                    color: '#e0e6ed',
                    boxShadow: '8px 0 30px rgba(0,0,0,0.6)',
                    flexShrink: 0,
                }}>
                    <h1 style={{ fontSize: '2.8em', background: 'linear-gradient(135deg,#66c0f4,#8fd3f4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px' }}>
                        HAZE Shop
                    </h1>
                    <p style={{ marginBottom: '32px', color: '#aaa' }}>Цифровые ключи Steam • Epic • Battle.net</p>

                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ color: '#66c0f4', marginBottom: '16px' }}>О компании</h3>
                        <p style={{ lineHeight: '1.7' }}>
                            Официальный магазин цифровых игр с 2021 года.<br />
                            Более 150 000 довольных покупателей по всей России.
                        </p>
                    </div>

                    <div style={{ background: 'rgba(102,192,244,0.15)', padding: '24px', borderRadius: '16px', border: '1px solid #66c0f4' }}>
                        <h3 style={{ color: '#66c0f4', marginBottom: '12px' }}>Главный офис</h3>
                        <p style={{ fontWeight: 'bold', margin: '8px 0' }}>Большая Садовая, 68</p>
                        <p style={{ color: '#ccc' }}>Ростов-на-Дону</p>
                        <p style={{ margin: '12px 0' }}>+7 (863) 300-88-99</p>
                        <p style={{ color: '#88f4c0' }}>Ежедневно 10:00 – 21:00</p>
                    </div>

                    <div style={{ marginTop: '40px', fontSize: '0.9em', color: '#777' }}>
                        <p>ООО «ХЕЙЗ ДИДЖИТАЛ»</p>
                        <p>ИНН 6165222111 • ОГРН 1216100012345</p>
                    </div>
                </div>

                {/* Карта */}
                <div className="contacts-map" style={{ flex: 1, position: 'relative' }}>
                    {userPosition && (
                        <div className="location-notice" style={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            background: 'rgba(24,26,32,0.9)',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: '1px solid #66c0f4',
                            zIndex: 1000,
                            color: '#66c0f4',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}>
                            Ваше местоположение определено
                        </div>
                    )}

                    <MapContainer center={center} zoom={userPosition ? 14 : 12} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <MapController center={center} userPosition={userPosition} />
                        <MapResizer />

                        {userPosition && (
                            <Marker position={userPosition} icon={userIcon}>
                                <Popup>Вы здесь</Popup>
                            </Marker>
                        )}

                        {points.map(point => (
                            <Marker key={point.title} position={point.coords} icon={shopIcon}>
                                <Popup>
                                    <div style={{ minWidth: '260px', color: '#23272e' }}>
                                        <h3 style={{ margin: '0 0 8px', color: point.main ? '#66c0f4' : '#fff' }}>
                                            {point.title}
                                        </h3>
                                        <p style={{ margin: '6px 0' }}>{point.address}</p>
                                        {point.phone && <p style={{ fontWeight: 'bold', margin: '8px 0' }}>{point.phone}</p>}
                                        <p style={{ color: '#88f4c0' }}>{point.hours}</p>
                                        <button
                                            onClick={() => handleRoute(point.coords[0], point.coords[1])}
                                            style={{
                                                marginTop: '14px',
                                                width: '100%',
                                                padding: '12px',
                                                background: '#66c0f4',
                                                color: '#23272e',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Проложить маршрут
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </>
    );
}