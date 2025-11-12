import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import CartPage from './pages/CartPage';
import Notification from './components/Notification';
import Login from './pages/Login';
import Register from './pages/Register'; // НОВОЕ
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const Footer = () => (
  <footer>
    <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
      Поиск в Google
    </a>
    <a href="contacts.html" target="_blank">
      Контакты
    </a>
    <a href="/">Вернуться в магазин</a>
  </footer>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Header />
            <Notification />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} /> {/* НОВОЕ */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}