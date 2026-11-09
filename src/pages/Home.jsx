import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { usuario, ehAdmin } = useAuth();
    return (
        <section className="hero">
            <h1>Bem-vindo(a) ao AgendaFácil{usuario ? `, ${usuario.nome.split(' ')[0]}` : ''}!</h1>
            <p>Escolha o serviço, veja os horários livres e marque seu atendimento sem troca de mensagens.</p>
            <div className="acoes">
                {ehAdmin ? (
                    <Link className="btn" to="/admin/painel">Ver agenda do dia</Link>
                ) : (
                    <Link className="btn" to="/servicos">Ver serviços</Link>
                )}
                {!usuario && <Link className="btn2 btn-link" to="/login">Entrar</Link>}
                {usuario && !ehAdmin && <Link className="btn2 btn-link" to="/agendamentos">Meus agendamentos</Link>}
            </div>
        </section>
    );
}
