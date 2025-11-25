// server.js — ФИНАЛЬНАЯ ВЕРСИЯ С ПОЛНЫМ ФУНКЦИОНАЛОМ ОТЗЫВОВ
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к SQLite
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Ошибка подключения к БД:', err.message);
  else console.log('SQLite подключён: ./database.db');
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
      items TEXT NOT NULL,
      total INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
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
    if (err) return res.status(403).json({ error: 'Неверный или просроченный токен' });
    req.userId = user.userId;
    next();
  });
};

// === API МАРШРУТЫ ===

// 1. Регистрация
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Заполните все поля' });

  if (password.length < 4)
    return res.status(400).json({ error: 'Пароль должен быть не менее 4 символов' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed'))
            return res.status(409).json({ error: 'Этот логин уже занят' });
          return res.status(500).json({ error: 'Ошибка сервера' });
        }
        res.status(201).json({ message: 'Регистрация успешна' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Ошибка хеширования пароля' });
  }
});

// 2. Логин
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT id, password FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const token = generateToken(user.id);
    res.json({ token, username });
  });
});

// 3. Получить заказы пользователя
app.get('/api/orders', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, items, total, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Ошибка чтения заказов' });
      const orders = rows.map(row => ({
        id: row.id,
        total: row.total,
        created_at: row.created_at,
        items: JSON.parse(row.items)
      }));
      res.json(orders);
    }
  );
});

// 4. Создать заказ
app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, total } = req.body;

  if (!Array.isArray(items) || items.length === 0 || !total || total <= 0)
    return res.status(400).json({ error: 'Неверные данные заказа' });

  db.run(
    'INSERT INTO orders (user_id, items, total) VALUES (?, ?, ?)',
    [req.userId, JSON.stringify(items), total],
    function (err) {
      if (err) return res.status(500).json({ error: 'Не удалось сохранить заказ' });
      res.status(201).json({ message: 'Заказ успешно оформлен!', orderId: this.lastID });
    }
  );
});

// 5. Получить отзывы для игры (без аутентификации, но с username)
app.get('/api/reviews/:gameId', (req, res) => {
  const { gameId } = req.params;

  db.all(
    `SELECT r.id, r.text, r.rating, r.created_at, u.username, r.user_id 
     FROM reviews r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.game_id = ? 
     ORDER BY r.created_at DESC`,
    [gameId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Ошибка чтения отзывов' });
      res.json(rows);
    }
  );
});

// 6. Оставить отзыв (с аутентификацией)
app.post('/api/reviews', authenticateToken, (req, res) => {
  const { gameId, text, rating } = req.body;

  if (!gameId || !text || !rating || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Неверные данные отзыва' });

  db.run(
    'INSERT INTO reviews (game_id, user_id, text, rating) VALUES (?, ?, ?, ?)',
    [gameId, req.userId, text, rating],
    function (err) {
      if (err) return res.status(500).json({ error: 'Не удалось сохранить отзыв' });
      res.status(201).json({ message: 'Отзыв успешно добавлен!', reviewId: this.lastID });
    }
  );
});

// 7. Редактировать отзыв (только свой)
app.put('/api/reviews/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { text, rating } = req.body;

  if (!text || !rating || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Неверные данные отзыва' });

  db.get('SELECT user_id FROM reviews WHERE id = ?', [id], (err, review) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    if (!review) return res.status(404).json({ error: 'Отзыв не найден' });
    if (review.user_id !== req.userId) return res.status(403).json({ error: 'Вы не можете редактировать этот отзыв' });

    db.run(
      'UPDATE reviews SET text = ?, rating = ? WHERE id = ?',
      [text, rating, id],
      (err) => {
        if (err) return res.status(500).json({ error: 'Не удалось обновить отзыв' });
        res.json({ message: 'Отзыв успешно обновлён' });
      }
    );
  });
});

// 8. Удалить отзыв (только свой)
app.delete('/api/reviews/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT user_id FROM reviews WHERE id = ?', [id], (err, review) => {
    if (err) return res.status(500).json({ error: 'Ошибка сервера' });
    if (!review) return res.status(404).json({ error: 'Отзыв не найден' });
    if (review.user_id !== req.userId) return res.status(403).json({ error: 'Вы не можете удалить этот отзыв' });

    db.run('DELETE FROM reviews WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Не удалось удалить отзыв' });
      res.json({ message: 'Отзыв успешно удалён' });
    });
  });
});

// === ЗАПУСК СЕРВЕРА ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HAZE Shop API запущен на http://localhost:${PORT}`);
  console.log(`Эндпоинты: /api/register, /api/login, /api/orders (GET/POST), /api/reviews (POST), /api/reviews/:gameId (GET), /api/reviews/:id (PUT/DELETE)`);
});