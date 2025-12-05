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
      <header style={{ textAlign: 'center', marginBottom: '24px', backgroundColor: 'rgba(128,128,128,0.2)', padding: '20px' }}>
        <h1>Добро пожаловать в цифровой магазин игр!</h1>
        <p>
          Здесь вы найдёте самые популярные и новые игры для любого настроения и компании. Открывайте для себя новинки,
          участвуйте в акциях и пополняйте свою коллекцию!
        </p>
        <p>Jump into new phase, just use the HAZE!</p>
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