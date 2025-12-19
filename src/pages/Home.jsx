// pages/Home.jsx (обновлённый: fetch игр с сервера вместо импорта)
import { useState, useEffect } from 'react';
import GameCard from '../components/GameCard';
import { useCart } from '../contexts/CartContext';

const API_URL = 'http://localhost:5000';

export default function Home() {
  const { addToCart } = useCart();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/games`)
      .then(res => res.json())
      .then(setGames)
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Загрузка...</p>;

  return (
    <>
      <header style={{
  textAlign: 'center',
  margin: '40px auto 60px',
  maxWidth: '800px',
  padding: '40px 20px'
}}>
  <h1 style={{
    fontSize: '2.8em',
    margin: '0 0 16px',
    color: '#66c0f4',
    fontWeight: 'bold'
  }}>
    HAZE Shop
  </h1>

  <p style={{
    fontSize: '1.3em',
    lineHeight: '1.6',
    color: '#b0bec5',
    margin: '0 auto 24px',
    maxWidth: '640px'
  }}>
    Новые и популярные игры. Акции. Быстрая доставка ключей.
  </p>

  <p style={{
    fontSize: '1.5em',
    color: '#66c0f4',
    margin: 0,
    fontWeight: '500',
    letterSpacing: '0.8px'
  }}>
    Jump into new phase, just use the HAZE!
  </p>
</header>

      <main className="steam-section">
        <div className="steam-title">Популярные игры</div>
        <div className="steam-games">
          {games.map((game) => (
            <GameCard key={game.id} game={game} addToCart={addToCart} />
          ))}
        </div>
      </main>
    </>
  );
}