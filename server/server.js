// server.js — РАБОЧАЯ ВЕРСИЯ (исправлена ошибка синтаксиса SQLite)
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

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Ошибка подключения к БД:', err.message);
  else console.log('SQLite подключён: ./database.db');
});

db.serialize(() => {
  // Таблицы
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);


//   db.run(`
//   ALTER TABLE users ADD COLUMN display_name TEXT;
// `);
//   db.run(`
//   ALTER TABLE users ADD COLUMN email TEXT;
// `);
//   db.run(`
//   ALTER TABLE users ADD COLUMN city TEXT DEFAULT 'Ростов-на-Дону';
// `);
//   db.run(`
//   ALTER TABLE users ADD COLUMN card_number TEXT;
// `);
//   db.run(`
//   ALTER TABLE users ADD COLUMN avatar TEXT;
// `);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    items TEXT NOT NULL,
    total INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price INTEGER NOT NULL,
    thumbnail TEXT NOT NULL,
    video TEXT NOT NULL,
    desc TEXT NOT NULL
  )`);



  // === SEEDING ADMIN (исправлено!) ===
  const adminPassword = bcrypt.hashSync('admin', 10); // логин: admin | пароль: admin
  db.get(`SELECT id FROM users WHERE username = 'admin'`, (err, row) => {
    if (err) return console.error(err);
    if (!row) {
      db.run(
        `INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)`,
        ['admin', adminPassword],
        (err) => {
          if (err) console.error('Ошибка создания админа:', err);
          else console.log('Админ создан: admin / admin');
        }
      );
    } else {
      console.log('Админ уже существует');
    }
  });

  // === SEEDING ИГР ===
  db.get(`SELECT COUNT(*) as count FROM games`, (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      console.log('Добавляем стартовые игры в БД...');
      const games = [
        ['Counter-Strike: Global Offensive', 1000, 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg', 'https://cs19.pikabu.ru/s/2025/08/28/16/fqruxnms_s0f0d105m0_1280x720.webm', 'Погрузитесь в мир динамичных командных сражений! Станьте частью легендарной серии шутеров, где важна каждая секунда и каждое решение. Соревнуйтесь с игроками по всему миру, открывайте новые скины и совершенствуйте свои навыки.'],
        ['Dota 2', 1500, 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg', 'https://cs14.pikabu.ru/video/2023/01/19/16740880772134516539_640x360.mp4', 'Величайшая MOBA-игра современности! Соберите команду героев, сразитесь на арене и докажите своё превосходство в стратегических баталиях. Постоянные обновления, турниры и уникальные персонажи ждут вас!'],
        ['Grand Theft Auto V', 2000, 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg', 'https://cs13.pikabu.ru/video/2023/01/19/16741510601260438761_640x360.mp4', 'Огромный открытый мир, насыщенный событиями и приключениями. Исследуйте Лос-Сантос, выполняйте миссии, участвуйте в гонках и создавайте свою криминальную империю вместе с друзьями в GTA Online!'],
        ['Borderlands 3', 2500, 'https://upload.wikimedia.org/wikipedia/ru/5/52/%D0%9E%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0_Borderlands_3.jpg', 'https://cs13.pikabu.ru/video/2024/06/25/1719334002260031326_16199c24_640x360.av1.mp4', 'Всеми любимый «шутер с базиллионами лута» возвращается! Действуя в одиночку или в компании друзей, вы должны будете спасти свой дом от безжалостных психопатов, возглавляющих самую опасную секту в галактике. Прорывайтесь через новые миры с миллиардами уникальных стволов, выбирайте из четырёх Vault Hunters и наслаждайтесь кооперативом до 4 игроков.'],
        ['Borderlands 4', 3000, 'https://upload.wikimedia.org/wikipedia/ru/5/52/%D0%9E%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0_Borderlands_3.jpg', 'https://cs15.pikabu.ru/video/2024/12/13/1734056027248863132_452e4b7c_1280x720.webm', 'Легендарный лутер-шутер полон хаоса возвращается! Станьте одним из четырёх новых безбашенных Vault Hunters и возглавьте революцию против жестокого тирана на планете Kairos! Миллиарды диких пушек, динамичный экшен, исследование огромного мира и кооп до 4 игроков!']
      ];

      const stmt = db.prepare(`INSERT INTO games (title, price, thumbnail, video, desc) VALUES (?, ?, ?, ?, ?)`);
      games.forEach(g => stmt.run(...g));
      stmt.finalize(() => console.log('5 игр успешно добавлены в БД'));
    } else {
      console.log(`В БД уже есть ${row.count} игр — пропускаем seeding`);
    }
  });
});

// === МИДЛВАРЫ ===
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется токен' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_2025', (err, user) => {
    if (err) return res.status(403).json({ error: 'Неверный токен' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) return res.status(403).json({ error: 'Только для админа' });
  next();
};

// === АВТОРИЗАЦИЯ ===
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Заполните поля' });

  const hashed = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashed], function (err) {
    if (err) return res.status(400).json({ error: 'Пользователь уже существует' });
    res.status(201).json({ message: 'Успешно зарегистрирован' });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Неверный логин или пароль' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: !!user.is_admin },
      process.env.JWT_SECRET || 'fallback_secret_2025',
      { expiresIn: '24h' }
    );
    res.json({ token, username: user.username });
  });
});

// === ОСТАЛЬНЫЕ ЭНДПОИНТЫ (без изменений, но проверены) ===
app.get('/api/orders', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка заказов' });
    res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items) })));
  });
});

app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, total } = req.body;
  db.run(`INSERT INTO orders (user_id, items, total) VALUES (?, ?, ?)`,
    [req.user.id, JSON.stringify(items), total],
    function (err) {
      if (err) return res.status(500).json({ error: 'Не удалось создать заказ' });
      res.status(201).json({ message: 'Заказ создан' });
    }
  );
});

app.get('/api/reviews/:gameId', (req, res) => {
  db.all(`SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.game_id = ? ORDER BY r.created_at DESC`, [req.params.gameId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка отзывов' });
    res.json(rows);
  });
});

app.post('/api/reviews', authenticateToken, (req, res) => {
  const { game_id, text, rating } = req.body;
  db.run(`INSERT INTO reviews (game_id, user_id, text, rating) VALUES (?, ?, ?, ?)`,
    [game_id, req.user.id, text, rating],
    () => res.status(201).json({ message: 'Отзыв добавлен' })
  );
});

app.put('/api/reviews/:id', authenticateToken, (req, res) => {
  const { text, rating } = req.body;
  db.get(`SELECT user_id FROM reviews WHERE id = ?`, [req.params.id], (err, rev) => {
    if (rev.user_id !== req.user.id) return res.status(403).json({ error: 'Чужой отзыв' });
    db.run(`UPDATE reviews SET text = ?, rating = ? WHERE id = ?`, [text, rating, req.params.id], () => {
      res.json({ message: 'Отзыв обновлён' });
    });
  });
});

app.delete('/api/reviews/:id', authenticateToken, (req, res) => {
  db.get(`SELECT user_id FROM reviews WHERE id = ?`, [req.params.id], (err, rev) => {
    if (rev.user_id !== req.user.id) return res.status(403).json({ error: 'Чужой отзыв' });
    db.run(`DELETE FROM reviews WHERE id = ?`, [req.params.id], () => res.json({ message: 'Отзыв удалён' }));
  });
});

// === ИГРЫ ===
app.get('/api/games', (req, res) => {
  db.all(`SELECT * FROM games`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка загрузки игр' });
    res.json(rows);
  });
});

app.post('/api/games', authenticateToken, isAdmin, (req, res) => {
  const { title, price, thumbnail, video, desc } = req.body;
  if (!title || !price || !thumbnail || !video || !desc) return res.status(400).json({ error: 'Заполните все поля' });

  db.run(`INSERT INTO games (title, price, thumbnail, video, desc) VALUES (?, ?, ?, ?, ?)`,
    [title, price, thumbnail, video, desc],
    function () { res.status(201).json({ message: 'Игра добавлена', gameId: this.lastID }); }
  );
});

app.put('/api/games/:id', authenticateToken, isAdmin, (req, res) => {
  const { title, price, thumbnail, video, desc } = req.body;
  db.run(`UPDATE games SET title = ?, price = ?, thumbnail = ?, video = ?, desc = ? WHERE id = ?`,
    [title, price, thumbnail, video, desc, req.params.id],
    () => res.json({ message: 'Игра обновлена' })
  );
});

app.delete('/api/games/:id', authenticateToken, isAdmin, (req, res) => {
  db.run(`DELETE FROM games WHERE id = ?`, [req.params.id], () => res.json({ message: 'Игра удалена' }));
});

// Получить профиль текущего пользователя
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(
    `SELECT username, display_name, email, city, card_number, avatar 
     FROM users WHERE id = ?`,
    [req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({
        displayName: row.display_name || row.username,
        email: row.email || '',
        city: row.city || 'Ростов-на-Дону',
        cardNumber: row.card_number || '',
        avatar: row.avatar || null
      });
    }
  );
});

// Сохранить профиль
app.put('/api/profile', authenticateToken, (req, res) => {
  const { displayName, email, city, cardNumber, avatar } = req.body;

  db.run(
    `UPDATE users SET 
      display_name = ?, 
      email = ?, 
      city = ?, 
      card_number = ?, 
      avatar = ?
     WHERE id = ?`,
    [displayName, email, city, cardNumber, avatar, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка сохранения' });
      res.json({ message: 'Профиль сохранён' });
    }
  );
});

// Запуск
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});