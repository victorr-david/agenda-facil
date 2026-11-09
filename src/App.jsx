import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import NaoEncontrada from './pages/NaoEncontrada';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Telas de autenticação (layout próprio, sem navbar) */}
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
            {/* Rotas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
