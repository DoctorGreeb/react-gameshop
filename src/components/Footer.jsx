import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
        Поиск в Google
      </a>
      <a href="contacts.html" target="_blank">
        Контакты
      </a>
      <Link to="/">Вернуться в магазин</Link>
    </footer>
  );
}