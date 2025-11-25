import { useCart } from '../contexts/CartContext';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { useMemo } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { orders } = useCart();

  const monthlySpending = useMemo(() => {
    const months = {};
    orders.forEach(order => {
      const month = new Date(order.created_at).toLocaleString('ru', { month: 'short', year: 'numeric' });
      months[month] = (months[month] || 0) + order.total;
    });
    return {
      labels: Object.keys(months),
      datasets: [{ label: 'Расходы', data: Object.values(months), backgroundColor: '#66c0f4' }]
    };
  }, [orders]);

  const gameDistribution = useMemo(() => {
    const games = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        games[item.title] = (games[item.title] || 0) + item.price * item.quantity;
      });
    });
    return {
      labels: Object.keys(games),
      datasets: [{ data: Object.values(games), backgroundColor: ['#66c0f4', '#417a9b', '#e74c3c', '#f39c12', '#2c313a'] }]
    };
  }, [orders]);

  return (
    <section className="cart-section">
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Личный кабинет</h2>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Расходы по месяцам</h3>
          <div className="chart-container">
            <Bar data={monthlySpending} options={{ responsive: true, plugins: { legend: { display: false }}}} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Распределение по играм</h3>
          <div className="chart-container">
            <Pie data={gameDistribution} options={{ responsive: true }} />
          </div>
        </div>
      </div>

      <div className="dashboard-table">
        <h3>История заказов</h3>
        {orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Нет заказов</p>
        ) : (
          <table>
            <thead>
              <tr><th>Дата</th><th>Сумма</th><th>Игры</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{order.total} руб.</td>
                  <td>{order.items.map(i => i.title).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}