import { startTransition } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
    const { usuario, ehAdmin, sair } = useAuth();
    const navigate = useNavigate();

    function handleSair() {
        // Navega e limpa a sessão na mesma transição. Se a sessão fosse limpa antes,
        // a RotaPrivada guardaria a página atual e o próximo usuário cairia nela.
        startTransition(() => {
            navigate('/login', { replace: true });
            sair();
        });
    }

    return (
        <header className="nav">
            <Link to="/" aria-label="AgendaFácil, ir para o início"><Logo /></Link>
            {ehAdmin && <span className="chip chip-k">Admin</span>}
            <nav aria-label="Principal">
                {ehAdmin ? (
                    <>
                        <NavLink to="/admin/painel">Painel</NavLink>
                        <NavLink to="/admin/servicos">Gerenciar serviços</NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/servicos">Serviços</NavLink>
                        {usuario && <NavLink to="/agendamentos" end>Meus agendamentos</NavLink>}
                    </>
                )}
                {usuario ? (
                    <>
                        <span>Olá, {usuario.nome.split(' ')[0]}</span>
                        <button className="btn2" onClick={handleSair}>Sair</button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login">Entrar</NavLink>
                        <Link to="/cadastro" className="btn btn-sm">Criar conta</Link>
                    </>
                )}
            </nav>
        </header>
    );
}
