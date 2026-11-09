import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import RotaPrivada from './routes/RotaPrivada';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Servicos from './pages/Servicos';
import Agendamentos from './pages/Agendamentos';
import AgendamentoForm from './pages/AgendamentoForm';
import PainelAdmin from './pages/PainelAdmin';
import GerenciarServicos from './pages/GerenciarServicos';
import ServicoForm from './pages/ServicoForm';
import NaoEncontrada from './pages/NaoEncontrada';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Telas de autenticação (layout próprio, sem navbar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          <Route element={<Layout />}>
            {/* Rotas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/servicos" element={<Servicos />} />
            {/* Rotas protegidas: precisa estar logado */}
            <Route element={<RotaPrivada />}>
              <Route path="/agendamentos" element={<Agendamentos />} />
              <Route path="/agendamentos/novo" element={<AgendamentoForm />} />
              <Route path="/agendamentos/:id/editar" element={<AgendamentoForm />} />
            </Route>
            {/* Rotas só para admin */}
            <Route element={<RotaPrivada perfil="admin" />}>
              <Route path="/admin/painel" element={<PainelAdmin />} />
              <Route path="/admin/servicos" element={<GerenciarServicos />} />
              <Route path="/admin/servicos/novo" element={<ServicoForm />} />
              <Route path="/admin/servicos/:id/editar" element={<ServicoForm />} />
            </Route>
            <Route path="*" element={<NaoEncontrada />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
