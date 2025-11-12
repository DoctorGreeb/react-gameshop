// GameCard.jsx
import React from 'react';

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

      {/* === ТОЛЬКО КНОПКА КУПИТЬ — НА ВСЁ МЕСТО === */}
      <div className="controls-row">
        <button className="buy-btn" onClick={() => addToCart(game)}>
          Купить
        </button>
      </div>
    </div>
  );
};

export default GameCard;