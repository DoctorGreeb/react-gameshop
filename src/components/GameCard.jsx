// GameCard.jsx (обновлённый: две кнопки в controls-row)
import React from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ game, addToCart }) => {
  return (
    <div className="steam-game-card">
      {/* === ВИДЕО === */}
      <div className="game-video">
        <video autoPlay loop muted playsInline>
          <source src={game.video} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* === КОНТЕНТ: НАЗВАНИЕ + ОПИСАНИЕ === */}
      <div className="game-content">
        <div className="game-title">
          <h3>{game.title}</h3>
        </div>
        <div className="game-desc">
          <p>{game.desc}</p>
        </div>
      </div>

      {/* === ДВЕ КНОПКИ: КУПИТЬ + ОТЗЫВЫ (делят пространство) === */}
      <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="buy-btn" onClick={() => addToCart(game)} style={{ flex: 1, marginRight: '8px' }}>
          Купить
        </button>
        <Link to={`/reviews/${game.id}`} className="reviews-btn" style={{ flex: 1, textDecoration: 'none', color: '#23272e', background: '#66c0f4', borderRadius: '6px', textAlign: 'center', padding: '8px' }}>
          Отзывы
        </Link>
      </div>
    </div>
  );
};

export default GameCard;