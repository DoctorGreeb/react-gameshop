// src/pages/AdminPanel.jsx — ФИНАЛЬНАЯ ВЕРСИЯ (всё красиво + кнопки в ряд)
import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

export default function AdminPanel() {
    const [games, setGames] = useState([]);
    const [editingGame, setEditingGame] = useState(null);
    const [formData, setFormData] = useState({
        title: '', price: '', thumbnail: '', video: '', desc: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchGames(); }, []);

    const fetchGames = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/games`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Не удалось загрузить игры');
            const data = await res.json();
            setGames(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('token');
        const method = editingGame ? 'PUT' : 'POST';
        const url = editingGame ? `${API_URL}/api/games/${editingGame.id}` : `${API_URL}/api/games`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Ошибка');
            }
            await fetchGames();
            setEditingGame(null);
            setFormData({ title: '', price: '', thumbnail: '', video: '', desc: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (game) => {
        setEditingGame(game);
        setFormData({
            title: game.title,
            price: game.price,
            thumbnail: game.thumbnail,
            video: game.video,
            desc: game.desc
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Удалить игру навсегда?')) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_URL}/api/games/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchGames();
        } catch (err) {
            setError('Не удалось удалить');
        }
    };

    if (loading) return <p style={{ textAlign: 'center', padding: '50px', color: '#aaa' }}>Загрузка...</p>;

    return (
        <section className="cart-section">
            <h2 style={{ textAlign: 'center', margin: '30px 0', color: '#66c0f4', fontSize: '2em' }}>
                Панель администратора
            </h2>

            {/* Форма */}
            <div style={{ maxWidth: '600px', margin: '0 auto 50px', padding: '24px', background: '#1e2229', borderRadius: '12px', border: '1px solid #333' }}>
                <h3 style={{ color: '#66c0f4', marginBottom: '16px' }}>
                    {editingGame ? 'Редактировать игру' : 'Добавить игру'}
                </h3>
                {error && <p style={{ color: '#e74c3c', marginBottom: '12px' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input name="title" placeholder="Название" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #444', background: '#2c313a', color: '#fff' }} />
                    <input name="price" type="number" placeholder="Цена (руб)" value={formData.price} onChange={handleChange} required style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #444', background: '#2c313a', color: '#fff' }} />
                    <input name="thumbnail" placeholder="URL обложки" value={formData.thumbnail} onChange={handleChange} required style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #444', background: '#2c313a', color: '#fff' }} />
                    <input name="video" placeholder="URL видео" value={formData.video} onChange={handleChange} required style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #444', background: '#2c313a', color: '#fff' }} />
                    <textarea name="desc" placeholder="Описание" value={formData.desc} onChange={handleChange} required rows="4" style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #444', background: '#2c313a', color: '#fff', resize: 'vertical' }} />
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="checkout-btn" style={{ flex: 1, height: '44px' }}>
                            {editingGame ? 'Сохранить' : 'Добавить'}
                        </button>
                        {editingGame && (
                            <button type="button" onClick={() => { setEditingGame(null); setFormData({ title: '', price: '', thumbnail: '', video: '', desc: '' }); }} className="clear-cart-btn" style={{ flex: 1, height: '44px' }}>
                                Отмена
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Список игр — КРАСИВО И С КНОПКАМИ В ОДНУ СТРОКУ */}
            <div className="steam-section">
                <div className="steam-title">Управление играми ({games.length})</div>
                <div className="steam-games">
                    {games.map((game) => (
                        <div key={game.id} className="steam-game-card">
                            <div className="game-video">
                                <video autoPlay loop muted playsInline>
                                    <source src={game.video} type="video/webm" />
                                    <source src={game.video} type="video/mp4" />
                                </video>
                            </div>

                            <div className="game-content">
                                <div className="game-title"><h3>{game.title}</h3></div>
                                <div className="game-desc"><p>{game.desc}</p></div>
                            </div>

                            {/* КНОПКИ В ОДНУ СТРОКУ — ГАРАНТИРОВАННО */}
                            <div className="controls-row" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0 16px 16px',
                                gap: '12px'
                            }}>
                                <button
                                    onClick={() => handleEdit(game)}
                                    className="admin-edit-btn"
                                >
                                    Редактировать
                                </button>
                                <button
                                    onClick={() => handleDelete(game.id)}
                                    className="admin-delete-btn"
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}