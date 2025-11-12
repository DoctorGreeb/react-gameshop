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
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { orders } = useCart();
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);

  // Данные для графиков
  const monthlySpending = useMemo(() => {
    const months = {};
    orders.forEach((order) => {
      const month = new Date(order.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      months[month] = (months[month] || 0) + order.total;
    });
    return {
      labels: Object.keys(months),
      datasets: [{ label: 'Расходы', data: Object.values(months), backgroundColor: '#66c0f4' }],
    };
  }, [orders]);

  const gameDistribution = useMemo(() => {
    const games = {};
    orders.flatMap((order) => order.items).forEach((item) => {
      games[item.title] = (games[item.title] || 0) + item.quantity * item.price;
    });
    return {
      labels: Object.keys(games),
      datasets: [{ data: Object.values(games), backgroundColor: ['#66c0f4', '#417a9b', '#2c313a', '#e74c3c', '#f39c12'] }],
    };
  }, [orders]);

  // Колонки для таблицы
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => new Date(row.date).toLocaleDateString(),
        id: 'date',
        header: 'Дата',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'total',
        header: 'Сумма',
        cell: (info) => `${info.getValue()} руб.`,
      },
      {
        accessorFn: (row) => row.items.map((i) => i.title).join(', '),
        id: 'items',
        header: 'Товары',
        cell: (info) => info.getValue(),
      },
    ],
    []
  );

  const table = useReactTable({
    data: orders,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className="cart-section dashboard-section">
      <div className="cart-title">Личный кабинет</div>

      {/* Графики */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Расходы по месяцам</h3>
          <div className="chart-container">
            <Bar
              data={monthlySpending}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>Распределение по играм</h3>
          <div className="chart-container">
            <Pie
              data={gameDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="dashboard-table">
        <h3>История заказов</h3>
        <input
          type="text"
          placeholder="Поиск по заказам..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="filter-input"
        />
        <div className="table-wrapper">
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() ? (
                        <span style={{ marginLeft: '8px', color: '#66c0f4' }}>
                          {header.column.getIsSorted() === 'desc' ? 'descending' : 'ascending'}
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="empty-table">Нет заказов</div>
          )}
        </div>
      </div>
    </section>
  );
}