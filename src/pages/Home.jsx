import GameCard from '../components/GameCard';
import { games } from '../data/games';
import { useCart } from '../contexts/CartContext';

export default function Home() {
  const { addToCart } = useCart();
  return (
    <>
      <header style={{ textAlign: 'center', marginBottom: '24px', backgroundColor: 'rgba(128,128,128,0.2)', padding: '20px' }}>
        <h6>Добро пожаловать в цифровой магазин игр!</h6>
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