import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
        Поиск в Google
      </a>
      <Link to="/contacts">Контакты</Link>
      <Link to="/">Вернуться в магазин</Link>
    </footer>
  );
}