// src/pages/ReviewsPage.jsx — ИДЕАЛЬНЫЕ ОТЗЫВЫ КАК В STEAM (100% красиво и логично)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:5000';

export default function ReviewsPage() {
  const { gameId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [gameTitle, setGameTitle] = useState('Загрузка...');
  const [newReview, setNewReview] = useState({ text: '', rating: 5 });
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/games`)
      .then(r => r.json())
      .then(games => {
        const game = games.find(g => g.id === parseInt(gameId));
        setGameTitle(game ? game.title : 'Игра не найдена');
      });
  }, [gameId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${gameId}`);
      const data = await res.json();
      setReviews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [gameId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');

    const token = localStorage.getItem('token');
    const method = editingReview ? 'PUT' : 'POST';
    const url = editingReview ? `${API_URL}/api/reviews/${editingReview.id}` : `${API_URL}/api/reviews`;

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        game_id: parseInt(gameId),
        text: newReview.text.trim(),
        rating: newReview.rating
      })
    });

    setNewReview({ text: '', rating: 5 });
    setEditingReview(null);
    fetchReviews();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить отзыв?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchReviews();
  };

  const startEdit = (review) => {
    setEditingReview(review);
    setNewReview({ text: review.text, rating: review.rating });
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setNewReview({ text: '', rating: 5 });
  };

  const declineStars = (n) => n === 1 ? 'звезда' : n <= 4 ? 'звезды' : 'звёзд';

  if (loading || authLoading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>Загрузка отзывов...</div>;
  }

  return (
    <section className="cart-section" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0' }}>
      {/* Заголовок — красиво и аккуратно */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.2em', color: '#66c0f4', margin: '0 0 8px 0', fontWeight: '700' }}>
          {gameTitle}
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1em', margin: 0 }}>
          Отзывы игроков ({reviews.length})
        </p>
      </div>

      {/* Форма написания отзыва */}
      {user && (
        <div style={{
          background: '#1e2229',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '40px'
        }}>
          <h3 style={{ color: '#66c0f4', margin: '0 0 16px 0', fontSize: '1.3em' }}>
            {editingReview ? 'Редактирование отзыва' : 'Написать отзыв'}
          </h3>

          <form onSubmit={handleSubmit} style={{ maxWidth: 'none', width: '100%' }}>
            <textarea
              placeholder="Поделитесь своими впечатлениями от игры..."
              value={newReview.text}
              onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
              required
              rows="5"
              style={{
                width: '100%',
                padding: '14px',
                background: '#2c313a',
                border: '1px solid #444',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1em',
                resize: 'vertical',
                marginBottom: '16px'
                
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              {/* Звёзды слева */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#aaa', whiteSpace: 'nowrap' }}>Ваша оценка:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <label key={n} style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="rating"
                        value={n}
                        checked={newReview.rating === n}
                        onChange={() => setNewReview({ ...newReview, rating: n })}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        fontSize: '2em',
                        color: newReview.rating >= n ? '#f1c40f' : '#444',
                        transition: 'color 0.2s'
                      }}>★</span>
                    </label>
                  ))}
                </div>
                <span style={{ color: '#aaa', minWidth: '80px' }}>
                  {newReview.rating} {declineStars(newReview.rating)}
                </span>
              </div>

              {/* Кнопки справа */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {editingReview ? (
                  <>
                    <button type="submit" className="checkout-btn" style={{ padding: '10px 20px' }}>
                      Сохранить
                    </button>
                    <button type="button" onClick={cancelEdit} className="clear-cart-btn" style={{ padding: '10px 20px' }}>
                      Отмена
                    </button>
                  </>
                ) : (
                  <button type="submit" className="checkout-btn" style={{ padding: '12px 28px', fontSize: '1em' }}>
                    Опубликовать отзыв
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Список отзывов */}
      <div>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            <p style={{ fontSize: '1.3em', margin: '0 0 10px 0' }}>Пока нет отзывов</p>
            <p style={{ margin: 0, color: '#666' }}>Станьте первым, кто поделится впечатлениями!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div
              key={review.id}
              style={{
                background: '#1e2229',
                border: '1px solid #333',
                borderRadius: '10px',
                padding: '18px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <strong style={{ color: '#66c0f4', fontSize: '1.1em' }}>{review.username}</strong>
                  <span style={{ color: '#888', fontSize: '0.9em', marginLeft: '12px' }}>
                    {new Date(review.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {user && user.id === review.user_id && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => startEdit(review)}
                      style={{
                        background: 'none',
                        border: '1px solid #f39c12',
                        color: '#f39c12',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85em',
                        cursor: 'pointer'
                      }}
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #e74c3c',
                        color: '#e74c3c',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85em',
                        cursor: 'pointer'
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#f1c40f', fontSize: '1.5em' }}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
              </div>

              <p style={{ color: '#ddd', lineHeight: '1.65', margin: 0, wordBreak: 'break-word' }}>
                {review.text}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}