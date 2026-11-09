import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { alterarStatus, listarMeusAgendamentos, podeCancelar } from '../services/mockApi';
import { formatarData, formatarPreco, ROTULO_STATUS, STATUS, ANTECEDENCIA_CANCELAMENTO_HORAS } from '../data/dadosIniciais';
import Carregando from '../components/Carregando';
import MensagemErro from '../components/MensagemErro';
import MensagemSucesso from '../components/MensagemSucesso';
import SeloStatus from '../components/SeloStatus';

// "Meus agendamentos" do cliente logado
export default function Agendamentos() {
    const { usuario } = useAuth();
    const location = useLocation();
    const [status, setStatus] = useState('');
    const [lista, setLista] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [erroAcao, setErroAcao] = useState('');
    const [sucesso, setSucesso] = useState(location.state?.mensagem ?? '');
    const [processando, setProcessando] = useState(null); // id do agendamento sendo cancelado
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        let ativo = true;
        setCarregando(true);
        setErro('');
        listarMeusAgendamentos(usuario._id, { status })
            .then((r) => ativo && setLista(r))
            .catch((err) => ativo && setErro(err.message || 'Não foi possível carregar seus agendamentos.'))
            .finally(() => ativo && setCarregando(false));
        return () => { ativo = false; };
    }, [usuario._id, status, tentativa]);

    async function handleCancelar(a) {
        if (!window.confirm(`Cancelar ${a.servico?.nome} em ${formatarData(a.data)} às ${a.hora}?`)) return;
        setProcessando(a._id);
        setErroAcao('');
        setSucesso('');
        try {
            const atualizado = await alterarStatus(a._id, 'cancelado');
            setLista(lista.map((x) => (x._id === a._id ? atualizado : x)));
            setSucesso('Agendamento cancelado.');
        } catch (err) {
            setErroAcao(err.message);
        } finally {
            setProcessando(null);
        }
    }

    return (
        <section>
            <div className="titulo-acao">
                <div>
                    <h1>Meus agendamentos</h1>
                    <p className="sub">Acompanhe, reagende ou cancele seus horários.</p>
                </div>
                <Link className="btn" to="/agendamentos/novo">Novo agendamento</Link>
            </div>

            <div className="card filters">
                <div className="grow">
                    <label htmlFor="status">Filtrar por status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">Todos</option>
                        {STATUS.map((s) => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
                    </select>
                </div>
            </div>

            <MensagemSucesso>{sucesso}</MensagemSucesso>
            <MensagemErro mensagem={erroAcao} />
            <MensagemErro mensagem={erro} onTentarNovamente={() => setTentativa(tentativa + 1)} />

            {carregando ? (
                <Carregando texto="Buscando seus agendamentos..." />
            ) : !erro && lista.length === 0 ? (
                <p className="empty">
                    Você ainda não tem agendamentos{status ? ` com status "${ROTULO_STATUS[status]}"` : ''}.{' '}
                    <Link to="/servicos">Ver serviços</Link>
                </p>
            ) : (
                <div className="lista-agendamentos">
                    {lista.map((a) => {
                        const ativo = a.status === 'pendente' || a.status === 'confirmado';
                        const cancelavel = podeCancelar(a);
                        return (
                            <article className="card agendamento" key={a._id}>
                                <div>
                                    <SeloStatus status={a.status} />
                                    <h3>{a.servico?.nome ?? 'Serviço removido'}</h3>
                                    <p className="cap">{formatarData(a.data)} às {a.hora}</p>
                                    {a.servico && <p className="muted">{formatarPreco(a.servico.preco)} · {a.servico.duracaoMinutos} min</p>}
                                    {a.observacoes && <p className="hint">Obs.: {a.observacoes}</p>}
                                </div>
                                {ativo && (
                                    <div className="acts">
                                        <Link className="btn2 btn-link" to={`/agendamentos/${a._id}/editar`}>Reagendar</Link>
                                        <button
                                            className="btn2 danger"
                                            disabled={!cancelavel || processando === a._id}
                                            title={cancelavel ? undefined : `Só é possível cancelar com ${ANTECEDENCIA_CANCELAMENTO_HORAS}h de antecedência`}
                                            onClick={() => handleCancelar(a)}
                                        >
                                            {processando === a._id ? 'Cancelando...' : 'Cancelar'}
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
