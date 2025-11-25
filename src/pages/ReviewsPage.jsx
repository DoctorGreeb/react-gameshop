// src/pages/ReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { games } from '../data/games';

export default function ReviewsPage() {
  const { gameId } = useParams();
  const { user } = useAuth(); // ← { username, id }
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ text: '', rating: 5 });
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Название игры вместо ID
  const currentGame = games.find(g => g.id === parseInt(gameId));
  const gameTitle = currentGame ? currentGame.title : 'Игра не найдена';

  const API_URL = 'http://localhost:5000';

  // Склонение слова "звезда"
  const declineStars = (num) => {
    if (num === 1) return 'звезда';
    if (num >= 2 && num <= 4) return 'звезды';
    return 'звёзд';
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${gameId}`);
      if (!res.ok) throw new Error('Ошибка загрузки отзывов');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [gameId]);

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');

    const token = localStorage.getItem('token');
    const method = editingReview ? 'PUT' : 'POST';
    const url = editingReview
      ? `${API_URL}/api/reviews/${editingReview.id}`
      : `${API_URL}/api/reviews`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...(editingReview ? {} : { gameId: parseInt(gameId) }),
          text: newReview.text,
          rating: newReview.rating,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка операции');
      }

      setNewReview({ text: '', rating: 5 });
      setEditingReview(null);
      fetchReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить отзыв навсегда?')) return; // ← ESLint доволен

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не удалось удалить');
      fetchReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditing = (review) => {
    setEditingReview(review);
    setNewReview({ text: review.text, rating: review.rating });
  };

  if (loading) return <div className="empty-cart">Загрузка отзывов...</div>;
  if (error) return <div style={{ color: '#e74c3c', textAlign: 'center', padding: '40px' }}>{error}</div>;

  return (
    <section className="cart-section">
      <h2 className="cart-title">Отзывы: {gameTitle}</h2>

      {/* Форма добавления/редактирования */}
      {user ? (
        <form onSubmit={handleAddOrEdit} style={{ maxWidth: '720px', margin: '24px auto' }}>
          <textarea
            placeholder="Поделитесь своими впечатлениями от игры..."
            value={newReview.text}
            onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
            required
            style={{
              width: '100%',
              minHeight: '130px',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid #444',
              background: '#1e2229',
              color: '#fff',
              fontSize: '1em',
              marginBottom: '12px',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ color: '#aaa' }}>Оценка:</span>
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: +e.target.value })}
              style={{ padding: '10px 14px', fontSize: '1.1em', borderRadius: '6px' }}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {'★'.repeat(n)}{'☆'.repeat(5 - n)} — {n} {declineStars(n)}
                </option>
              ))}
            </select>

            <button type="submit" className="checkout-btn">
              {editingReview ? 'Сохранить изменения' : 'Опубликовать отзыв'}
            </button>
            {editingReview && (
              <button
                type="button"
                onClick={() => {
                  setEditingReview(null);
                  setNewReview({ text: '', rating: 5 });
                }}
                style={{ padding: '10px 16px' }}
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '1.2em', margin: '40px 0' }}>
          Войдите в аккаунт, чтобы оставить отзыв → <a href="/login" style={{ color: '#66c0f4' }}>Войти</a>
        </p>
      )}

      {/* Список отзывов */}
      <div className="cart-items">
        {reviews.length === 0 ? (
          <div className="empty-cart">Пока нет отзывов. Станьте первым!</div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="cart-item"
              style={{
                padding: '20px',
                marginBottom: '18px',
                background: '#1e2229',
                borderRadius: '10px',
                border: '1px solid #333',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#66c0f4' }}>{review.username}</strong>
                <span style={{ color: '#888', fontSize: '0.9em' }}>
                  {new Date(review.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>

              {/* Красивые звёзды */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
                <span style={{ color: '#aaa' }}>Оценка:</span>
                <span style={{ color: '#f1c40f', fontSize: '1.5em', letterSpacing: '2px' }}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
                <span style={{ color: '#aaa', fontSize: '0.95em' }}>
                  ({review.rating} {declineStars(review.rating)})
                </span>
              </div>

              <p style={{ margin: '14px 0', lineHeight: '1.6', color: '#ddd' }}>{review.text}</p>

              {/* Кнопки только для автора */}
              {user && review.user_id === user.id && (
                <div style={{ marginTop: '14px' }}>
                  <button onClick={() => startEditing(review)} className="quantity-btn">
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="delete-btn"
                    style={{ marginLeft: '10px' }}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}