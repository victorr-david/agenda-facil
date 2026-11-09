import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    buscarAgendamento,
    criarAgendamento,
    listarHorarios,
    listarServicos,
    reagendar,
    paraHora,
    paraMinutos,
} from '../services/mockApi';
import { formatarData, formatarPreco, ANTECEDENCIA_CANCELAMENTO_HORAS } from '../data/dadosIniciais';
import CampoFormulario from '../components/CampoFormulario';
import Carregando from '../components/Carregando';
import MensagemErro from '../components/MensagemErro';

const LIMITE_OBSERVACOES = 200;

// Usado em duas rotas: /agendamentos/novo e /agendamentos/:id/editar (reagendar)
export default function AgendamentoForm() {
    const { id } = useParams(); // existe só na rota de edição
    const editando = Boolean(id);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const hoje = new Date().toLocaleDateString('sv-SE');

    const [form, setForm] = useState({ servico: '', data: hoje, hora: '', observacoes: '' });
    const [servicos, setServicos] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [erros, setErros] = useState({});
    const [erroApi, setErroApi] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [carregandoHorarios, setCarregandoHorarios] = useState(false);
    const [enviando, setEnviando] = useState(false);

    // Carrega serviços e, se for edição, o agendamento atual
    useEffect(() => {
        let ativo = true;
        async function carregar() {
            try {
                const { dados } = await listarServicos({ limit: 100 });
                if (!ativo) return;
                setServicos(dados);
                if (editando) {
                    const a = await buscarAgendamento(id);
                    if (!ativo) return;
                    if (a.cliente?._id !== usuario._id) throw new Error('Você não pode alterar este agendamento.');
                    if (a.status === 'concluido' || a.status === 'cancelado')
                        throw new Error('Agendamentos concluídos ou cancelados não podem ser reagendados.');
                    setForm({ servico: a.servico._id, data: a.data, hora: a.hora, observacoes: a.observacoes ?? '' });
                } else {
                    const pedido = searchParams.get('servico');
                    const inicial = dados.some((s) => s._id === pedido) ? pedido : dados[0]?._id ?? '';
                    setForm((f) => ({ ...f, servico: inicial }));
                }
            } catch (err) {
                if (ativo) setErroApi(err.message);
            } finally {
                if (ativo) setCarregando(false);
            }
        }
        carregar();
        return () => { ativo = false; };
    }, [id, editando, searchParams, usuario._id]);

    // Recarrega os horários sempre que serviço ou data mudarem
    useEffect(() => {
        if (!form.servico || !form.data || form.data < hoje) {
            setHorarios([]);
            return;
        }
        let ativo = true;
        setCarregandoHorarios(true);
        listarHorarios({ data: form.data, servicoId: form.servico, ignorarId: id })
            .then((h) => ativo && setHorarios(h))
            .catch(() => ativo && setErroApi('Não foi possível carregar os horários. Tente novamente.'))
            .finally(() => ativo && setCarregandoHorarios(false));
        return () => { ativo = false; };
    }, [form.servico, form.data, id, hoje]);

    function handleChange(e) {
        const { name, value } = e.target;
        // trocar serviço ou data invalida o horário escolhido
        const limparHora = name === 'servico' || name === 'data';
        setForm({ ...form, [name]: value, ...(limparHora ? { hora: '' } : {}) });
        setErros({ ...erros, [name]: undefined, ...(limparHora ? { hora: undefined } : {}) });
    }

    function escolherHora(hora) {
        setForm({ ...form, hora });
        setErros({ ...erros, hora: undefined });
    }

    function validar() {
        const novos = {};
        if (!form.servico) novos.servico = 'Selecione um serviço';
        if (!form.data) novos.data = 'Escolha uma data';
        else if (form.data < hoje) novos.data = 'Escolha uma data a partir de hoje';
        if (!form.hora) novos.hora = 'Escolha um horário livre';
        if (form.observacoes.length > LIMITE_OBSERVACOES)
            novos.observacoes = `Use no máximo ${LIMITE_OBSERVACOES} caracteres`;
        setErros(novos);
        return Object.keys(novos).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validar()) return;
        setEnviando(true);
        setErroApi('');
        try {
            const dados = { ...form, cliente: usuario._id };
            if (editando) await reagendar(id, dados);
            else await criarAgendamento(dados);
            const texto = `${editando ? 'Agendamento remarcado' : 'Agendamento solicitado'} para ${formatarData(form.data)} às ${form.hora}. Status: pendente.`;
            navigate('/agendamentos', { state: { mensagem: texto } });
        } catch (err) {
            setErroApi(err.message);
            // o horário pode ter sido ocupado por outra pessoa: recarrega a lista
            if (err.status === 409) {
                setForm((f) => ({ ...f, hora: '' }));
                listarHorarios({ data: form.data, servicoId: form.servico, ignorarId: id }).then(setHorarios);
            }
        } finally {
            setEnviando(false);
        }
    }

    if (carregando) return <Carregando texto="Carregando formulário..." />;

    const servico = servicos.find((s) => s._id === form.servico);
    const nenhumLivre = horarios.length > 0 && horarios.every((h) => !h.livre);

    return (
        <section>
            <p className="back"><Link to={editando ? '/agendamentos' : '/servicos'}>← Voltar</Link></p>
            <h1>{editando ? 'Reagendar agendamento' : 'Novo agendamento'}</h1>
            <p className="sub">Escolha o serviço, o dia e um horário livre.</p>
            <MensagemErro mensagem={erroApi} />

            {servico && (
                <div className="cols">
                    <form id="form-agendamento" className="card main-col" onSubmit={handleSubmit} noValidate>
                        <CampoFormulario id="servico" rotulo="1. Serviço *" erro={erros.servico}>
                            <select id="servico" name="servico" value={form.servico} onChange={handleChange}>
                                {servicos.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.nome} · {formatarPreco(s.preco)} · {s.duracaoMinutos} min
                                    </option>
                                ))}
                            </select>
                        </CampoFormulario>

                        <CampoFormulario id="data" rotulo="2. Data *" type="date" min={hoje} value={form.data} onChange={handleChange} erro={erros.data} />

                        <div className="f">
                            <p className="lbl" id="rotulo-horario">3. Horário *{form.data && form.data >= hoje ? ` (${formatarData(form.data)})` : ''}</p>
                            {carregandoHorarios ? (
                                <Carregando texto="Buscando horários livres..." />
                            ) : nenhumLivre ? (
                                <p className="empty">Não há horários livres nesta data. Escolha outro dia.</p>
                            ) : (
                                <div className="slots" role="group" aria-labelledby="rotulo-horario">
                                    {horarios.map((h) => (
                                        <button
                                            type="button"
                                            key={h.hora}
                                            className={`btn2 slot ${form.hora === h.hora ? 'on' : ''} ${!h.livre ? 'off' : ''}`}
                                            disabled={!h.livre}
                                            aria-pressed={form.hora === h.hora}
                                            onClick={() => escolherHora(h.hora)}
                                        >
                                            {h.hora}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {erros.hora ? (
                                <p className="err" role="alert">{erros.hora}</p>
                            ) : (
                                <p className="hint">Horários riscados já estão ocupados ou já passaram.</p>
                            )}
                        </div>

                        <CampoFormulario
                            id="observacoes"
                            rotulo="Observações (opcional)"
                            erro={erros.observacoes}
                            dica={`${form.observacoes.length}/${LIMITE_OBSERVACOES} caracteres`}
                        >
                            <textarea
                                id="observacoes"
                                name="observacoes"
                                rows="3"
                                className={erros.observacoes ? 'bad' : ''}
                                value={form.observacoes}
                                onChange={handleChange}
                            />
                        </CampoFormulario>
                        <button type="submit" className="btn block mobile-only" disabled={enviando}>
                            {enviando ? 'Salvando...' : editando ? 'Confirmar nova data' : 'Confirmar agendamento'}
                        </button>
                    </form>

                    <aside className="card side-col">
                        <h2>Resumo</h2>
                        <p><b>{servico.nome}</b></p>
                        <p className="cap">
                            {form.hora
                                ? `${formatarData(form.data)}, das ${form.hora} às ${paraHora(paraMinutos(form.hora) + servico.duracaoMinutos)}`
                                : 'Escolha um horário para ver o resumo.'}
                        </p>
                        <p className="preco">{formatarPreco(servico.preco)}</p>
                        <button type="submit" form="form-agendamento" className="btn block" disabled={enviando}>
                            {enviando ? 'Salvando...' : editando ? 'Confirmar nova data' : 'Confirmar agendamento'}
                        </button>
                        <p className="hint">Você pode cancelar até {ANTECEDENCIA_CANCELAMENTO_HORAS} horas antes do horário.</p>
                    </aside>
                </div>
            )}
            {!servico && !erroApi && <p className="empty">Nenhum serviço disponível para agendamento no momento.</p>}
        </section>
    );
}
