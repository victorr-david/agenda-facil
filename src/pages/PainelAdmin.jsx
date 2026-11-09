import { useEffect, useState } from 'react';
import { alterarStatus, listarAgendamentos } from '../services/mockApi';
import { formatarData, ROTULO_STATUS, STATUS } from '../data/dadosIniciais';
import Carregando from '../components/Carregando';
import MensagemErro from '../components/MensagemErro';
import SeloStatus from '../components/SeloStatus';

// Painel do estabelecimento: agenda do dia com filtros e mudança de status
export default function PainelAdmin() {
    const hoje = new Date().toLocaleDateString('sv-SE');
    const [filtros, setFiltros] = useState({ data: hoje, status: '' });
    const [agenda, setAgenda] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [erroAcao, setErroAcao] = useState('');
    const [processando, setProcessando] = useState(null);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        let ativo = true;
        setCarregando(true);
        setErro('');
        listarAgendamentos(filtros)
            .then((r) => ativo && setAgenda(r))
            .catch((err) => ativo && setErro(err.message || 'Não foi possível carregar a agenda.'))
            .finally(() => ativo && setCarregando(false));
        return () => { ativo = false; };
    }, [filtros, tentativa]);

    function handleFiltro(e) {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    }

    async function mudarStatus(a, status) {
        if (status === 'cancelado' && !window.confirm(`Cancelar o horário de ${a.cliente?.nome} às ${a.hora}?`)) return;
        setProcessando(a._id);
        setErroAcao('');
        try {
            const atualizado = await alterarStatus(a._id, status, { perfil: 'admin' });
            setAgenda(agenda.map((x) => (x._id === a._id ? atualizado : x)));
        } catch (err) {
            setErroAcao(err.message);
        } finally {
            setProcessando(null);
        }
    }

    const contar = (st) => agenda.filter((a) => a.status === st).length;

    return (
        <section>
            <h1>Agenda {filtros.data === hoje ? 'do dia' : ''}</h1>
            <p className="sub cap">{filtros.data ? formatarData(filtros.data) : 'Todas as datas'}</p>

            <div className="card filters">
                <div className="grow">
                    <label htmlFor="data">Data</label>
                    <input id="data" name="data" type="date" value={filtros.data} onChange={handleFiltro} />
                </div>
                <div className="grow">
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" value={filtros.status} onChange={handleFiltro}>
                        <option value="">Todos</option>
                        {STATUS.map((s) => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
                    </select>
                </div>
                <button type="button" className="btn2" onClick={() => setFiltros({ data: hoje, status: '' })}>Hoje</button>
                <button type="button" className="btn2" onClick={() => setFiltros({ data: '', status: filtros.status })}>Todas as datas</button>
            </div>

            <div className="stats">
                {[['Total', agenda.length], ['Pendentes', contar('pendente')], ['Confirmados', contar('confirmado')], ['Concluídos', contar('concluido')]].map(([t, n]) => (
                    <div className="card" key={t}><p className="hint">{t}</p><b>{carregando ? '·' : n}</b></div>
                ))}
            </div>

            <MensagemErro mensagem={erroAcao} />
            <MensagemErro mensagem={erro} onTentarNovamente={() => setTentativa(tentativa + 1)} />

            {carregando ? (
                <Carregando texto="Carregando agenda..." />
            ) : !erro && agenda.length === 0 ? (
                <p className="empty">Nenhum agendamento encontrado para estes filtros.</p>
            ) : (
                <div className="card tbl">
                    <table>
                        <thead>
                            <tr>
                                {!filtros.data && <th>Data</th>}
                                <th>Horário</th><th>Cliente</th><th>Serviço</th><th>Status</th><th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agenda.map((a) => (
                                <tr key={a._id}>
                                    {!filtros.data && <td>{a.data.split('-').reverse().join('/')}</td>}
                                    <td><b>{a.hora}</b></td>
                                    <td>{a.cliente?.nome}<br /><small className="muted">{a.cliente?.telefone}</small></td>
                                    <td>{a.servico?.nome ?? '·'}{a.observacoes && <><br /><small className="muted">Obs.: {a.observacoes}</small></>}</td>
                                    <td><SeloStatus status={a.status} /></td>
                                    <td>
                                        <div className="acts">
                                            {a.status === 'pendente' && <button className="btn2" disabled={processando === a._id} onClick={() => mudarStatus(a, 'confirmado')}>Confirmar</button>}
                                            {a.status === 'confirmado' && <button className="btn2" disabled={processando === a._id} onClick={() => mudarStatus(a, 'concluido')}>Concluir</button>}
                                            {(a.status === 'pendente' || a.status === 'confirmado') && <button className="btn2 danger" disabled={processando === a._id} onClick={() => mudarStatus(a, 'cancelado')}>Cancelar</button>}
                                            {(a.status === 'concluido' || a.status === 'cancelado') && '·'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
