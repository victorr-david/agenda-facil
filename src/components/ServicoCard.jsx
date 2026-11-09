import { Link } from 'react-router-dom';
import { formatarPreco } from '../data/dadosIniciais';

// Componente reutilizável que recebe dados via props
export default function ServicoCard({ servico }) {
    return (
        <article className="card svc">
            <h3>{servico.nome}</h3>
            <p>{servico.descricao}</p>
            <div className="row">
                <span>{formatarPreco(servico.preco)}</span>
                <span className="muted">{servico.duracaoMinutos} min</span>
            </div>
            <Link className="btn block" to={`/agendamentos/novo?servico=${servico._id}`}>Agendar</Link>
        </article>
    );
}
