// src/pages/Dashboard.jsx — ФИНАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ (100% без ошибок)
import { useState, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { orders = [] } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Все купленные игры
  const allPurchasedGames = useMemo(() => {
    const games = [];
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          games.push({
            ...item,
            orderId: order.id,
            orderDate: order.created_at,
            orderTotal: order.total
          });
        });
      }
    });
    return games;
  }, [orders]);

  // Фильтрация + сортировка
  const filteredAndSortedGames = useMemo(() => {
    let result = allPurchasedGames.filter(game =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.orderDate) - new Date(a.orderDate);
        case 'date-asc':  return new Date(a.orderDate) - new Date(b.orderDate);
        case 'price-desc': return b.price - a.price;
        case 'price-asc':  return a.price - b.price;
        default: return 0;
      }
    });

    return result;
  }, [allPurchasedGames, searchQuery, sortBy]);

  // График: расходы по месяцам
  const monthlyData = useMemo(() => {
    const months = {};
    orders.forEach(order => {
      if (order.created_at && order.total) {
        const date = new Date(order.created_at);
        const key = date.toLocaleString('ru-RU', { month: 'short', year: 'numeric' });
        months[key] = (months[key] || 0) + order.total;
      }
    });

    const labels = Object.keys(months).length ? Object.keys(months) : ['Нет данных'];
    const data = Object.values(months).length ? Object.values(months) : [0];

    return {
      labels,
      datasets: [{
        label: 'Расходы (₽)',
        data,
        backgroundColor: '#66c0f4',
        borderRadius: 6,
      }]
    };
  }, [orders]);

  // График: топ игр по затратам
  const gamesPieData = useMemo(() => {
    const stats = {};
    allPurchasedGames.forEach(game => {
      stats[game.title] = (stats[game.title] || 0) + game.price;
    });

    const labels = Object.keys(stats);
    const data = Object.values(stats);

    return {
      labels: labels.length ? labels : ['Нет покупок'],
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: [
          '#66c0f4', '#417a9b', '#e74c3c', '#f39c12',
          '#9b59b6', '#1abc9c', '#3498db', '#2ecc71'
        ],
      }]
    };
  }, [allPurchasedGames]);

  // Настройки графиков
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#e0e6ed', font: { size: 13 } }
      },
      tooltip: {
        backgroundColor: '#1e2229',
        titleColor: '#66c0f4',
        bodyColor: '#e0e6ed',
        cornerRadius: 8
      }
    },
    scales: {
      y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(102,192,244,0.1)' } },
      x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(102,192,244,0.1)' } }
    }
  };

  return (
    <section style={{ padding: '40px 20px', maxWidth: '1300px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.6em', color: '#66c0f4' }}>
        Личный кабинет
      </h2>

      {/* ГРАФИКИ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '32px',
        marginBottom: '70px'
      }}>
        <div style={{
          background: 'rgba(30,34,41,0.7)',
          borderRadius: '18px',
          padding: '28px',
          border: '1px solid #333',
          height: '400px'
        }}>
          <h3 style={{ color: '#66c0f4', textAlign: 'center', marginBottom: '20px' }}>
            Расходы по месяцам
          </h3>
          <Bar data={monthlyData} options={chartOptions} />
        </div>

        <div style={{
          background: 'rgba(30,34,41,0.7)',
          borderRadius: '18px',
          padding: '28px',
          border: '1px solid #333',
          height: '400px'
        }}>
          <h3 style={{ color: '#66c0f4', textAlign: 'center', marginBottom: '20px' }}>
            Топ игр по затратам
          </h3>
          <Pie data={gamesPieData} options={chartOptions} />
        </div>
      </div>

      {/* МОИ ИГРЫ */}
      <div style={{
        background: 'rgba(30,34,41,0.8)',
        borderRadius: '20px',
        padding: '36px',
        border: '1px solid #333'
      }}>
        <h3 style={{ color: '#66c0f4', marginBottom: '28px', fontSize: '1.9em' }}>
          Мои покупки ({filteredAndSortedGames.length})
        </h3>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Поиск по названию игры..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: '320px',
              padding: '16px 20px',
              borderRadius: '14px',
              border: '1px solid #444',
              background: '#1e2229',
              color: '#e0e6ed',
              fontSize: '1.05em'
            }}
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              background: '#1e2229',
              color: '#e0e6ed',
              border: '1px solid #444',
              cursor: 'pointer'
            }}
          >
            <option value="date-desc">Сначала новые</option>
            <option value="date-asc">Сначала старые</option>
            <option value="price-desc">Дорогие → дешёвые</option>
            <option value="price-asc">Дешёвые → дорогие</option>
          </select>
        </div>

        {filteredAndSortedGames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: '#888' }}>
            <p style={{ fontSize: '1.4em' }}>
              {searchQuery ? 'По запросу ничего не найдено' : 'Вы ещё не купили ни одной игры'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '22px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))'
          }}>
            {filteredAndSortedGames.map((game, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(102,192,244,0.08)',
                  border: '1px solid #333',
                  borderRadius: '16px',
                  padding: '22px',
                  display: 'flex',
                  gap: '22px',
                  transition: '0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(102,192,244,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(102,192,244,0.08)'}
              >
                <img
                  src={game.thumbnail || game.image || 'https://via.placeholder.com/80x110/333/666?text=NO+IMG'}
                  alt={game.title}
                  style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '10px' }}
                />
                <div style={{ flex: 1, marginLeft: '20px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '1.25em', color: '#e0e6ed' }}>
                    {game.title}
                  </h4>
                  <p style={{ margin: '8px 0', color: '#66c0f4', fontWeight: 'bold', fontSize: '1.2em' }}>
                    {game.price} ₽
                  </p>
                  <p style={{ margin: '10px 0 0', color: '#aaa', fontSize: '0.95em' }}>
                    Куплено: {new Date(game.orderDate).toLocaleDateString('ru-RU', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}