// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к SQLite (создаст файл database.db, если его нет)
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error(err.message);
  else console.log('SQLite подключён');
});

// Создание таблиц
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      items TEXT NOT NULL,        -- JSON строка
      total INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
});

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Неверный токен' });
    req.userId = user.userId;
    next();
  });
};

// === API МАРШРУТЫ ===

// Регистрация
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Заполните все поля' });

  if (password.length < 4)
    return res.status(400).json({ error: 'Пароль слишком короткий' });

  const hashedPassword = await bcrypt.hash(password, 10);

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (row) return res.status(400).json({ error: 'Пользователь уже существует' });

    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function (err) {
        if (err) return res.status(500).json({ error: 'Ошибка сервера' });
        res.status(201).json({ message: 'Регистрация успешна' });
      }
    );
  });
});

// Логин
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const token = generateToken(user.id);
    res.json({ token, username: user.username });
  });
});

// Получить историю заказов пользователя
app.get('/api/orders', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, items, total, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Ошибка сервера' });
      const orders = rows.map(row => ({
        ...row,
        items: JSON.parse(row.items)
      }));
      res.json(orders);
    }
  );
});

// Создать заказ
app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, total } = req.body;

  if (!items || !total || total <= 0)
    return res.status(400).json({ error: 'Неверные данные заказа' });

  db.run(
    'INSERT INTO orders (user_id, items, total) VALUES (?, ?, ?)',
    [req.userId, JSON.stringify(items), total],
    function (err) {
      if (err) return res.status(500).json({ error: 'Не удалось сохранить заказ' });
      res.json({ message: 'Заказ успешно оформлен!', orderId: this.lastID });
    }
  );
});

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('HAZE Shop API работает! SQLite версия');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});