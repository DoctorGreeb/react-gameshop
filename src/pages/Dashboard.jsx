// src/pages/Dashboard.jsx
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
import { useMemo } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { orders = [] } = useCart(); // ← ГЛАВНОЕ ИСПРАВЛЕНИЕ: значение по умолчанию

  // Защита от null/undefined
  const safeOrders = Array.isArray(orders) ? orders : [];

  const monthlySpending = useMemo(() => {
    const months = {};
    safeOrders.forEach(order => {
      // Проверяем, есть ли items и created_at
      if (!order.items || !order.created_at) return;
      const month = new Date(order.created_at).toLocaleString('ru', { month: 'short', year: 'numeric' });
      months[month] = (months[month] || 0) + (order.total || 0);
    });

    const labels = Object.keys(months);
    return {
      labels: labels.length ? labels : ['Нет данных'],
      datasets: [{
        label: 'Расходы',
        data: labels.length ? Object.values(months) : [0],
        backgroundColor: '#66c0f4'
      }]
    };
  }, [safeOrders]);

  const gameDistribution = useMemo(() => {
    const games = {};
    safeOrders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;
      order.items.forEach(item => {
        if (item.title && item.price !== undefined) {
          games[item.title] = (games[item.title] || 0) + item.price * (item.quantity || 1);
        }
      });
    });

    const labels = Object.keys(games);
    return {
      labels: labels.length ? labels : ['Нет покупок'],
      datasets: [{
        data: labels.length ? Object.values(games) : [1],
        backgroundColor: ['#66c0f4', '#417a9b', '#e74c3c', '#f39c12', '#2c313a', '#9b59b6']
      }]
    };
  }, [safeOrders]);

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
        {safeOrders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Нет заказов</p>
        ) : (
          <table>
            <thead>
              <tr><th>Дата</th><th>Сумма</th><th>Игры</th></tr>
            </thead>
            <tbody>
              {safeOrders.map(order => (
                <tr key={order.id}>
                  <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>{order.total} руб.</td>
                  <td>
                    {Array.isArray(order.items)
                      ? order.items.map(i => i.title).join(', ')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}