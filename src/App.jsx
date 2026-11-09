import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import NaoEncontrada from './pages/NaoEncontrada';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
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
