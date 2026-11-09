import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { atualizarServico, buscarServico, criarServico } from '../services/mockApi';
import CampoFormulario from '../components/CampoFormulario';
import Carregando from '../components/Carregando';
import MensagemErro from '../components/MensagemErro';

const VAZIO = { nome: '', descricao: '', preco: '', duracaoMinutos: '30', ativo: true };
const DURACOES = [30, 60, 90, 120];

// Usado em duas rotas: /admin/servicos/novo e /admin/servicos/:id/editar
export default function ServicoForm() {
    const { id } = useParams();
    const editando = Boolean(id);
    const navigate = useNavigate();
    const [form, setForm] = useState(VAZIO);
    const [erros, setErros] = useState({});
    const [erroApi, setErroApi] = useState('');
    const [carregando, setCarregando] = useState(editando);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (!editando) return;
        buscarServico(id)
            .then((s) => setForm({ ...s, preco: String(s.preco).replace('.', ','), duracaoMinutos: String(s.duracaoMinutos) }))
            .catch((err) => setErroApi(err.message))
            .finally(() => setCarregando(false));
    }, [id, editando]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        setErros({ ...erros, [name]: undefined }); // some o erro ao corrigir
    }

    function validar() {
        const novos = {};
        if (!form.nome.trim()) novos.nome = 'Nome é obrigatório';
        else if (form.nome.trim().length < 3) novos.nome = 'O nome deve ter pelo menos 3 caracteres';
        if (form.descricao.length > 120) novos.descricao = 'Use no máximo 120 caracteres';
        const preco = parseFloat(String(form.preco).replace(',', '.'));
        if (form.preco === '') novos.preco = 'Preço é obrigatório';
        else if (isNaN(preco) || preco <= 0) novos.preco = 'Digite um preço maior que zero, ex.: 35 ou 29,90';
        if (!DURACOES.includes(Number(form.duracaoMinutos))) novos.duracaoMinutos = 'Selecione a duração';
        setErros(novos);
        return Object.keys(novos).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validar()) return;
        setEnviando(true);
        setErroApi('');
        const dados = {
            nome: form.nome.trim(),
            descricao: form.descricao.trim(),
            preco: parseFloat(String(form.preco).replace(',', '.')),
            duracaoMinutos: Number(form.duracaoMinutos),
            ativo: form.ativo,
        };
        try {
            if (editando) await atualizarServico(id, dados);
            else await criarServico(dados);
            navigate('/admin/servicos', { state: { mensagem: `Serviço "${dados.nome}" salvo.` } });
        } catch (err) {
            setErroApi(err.message);
        } finally {
            setEnviando(false);
        }
    }

    if (carregando) return <Carregando texto="Carregando serviço..." />;

    return (
        <section className="painel">
            <p className="back"><Link to="/admin/servicos">← Voltar</Link></p>
            <h1>{editando ? 'Editar serviço' : 'Novo serviço'}</h1>
            <p className="sub">Campos com * são obrigatórios.</p>
            <form className="card" onSubmit={handleSubmit} noValidate>
                <MensagemErro mensagem={erroApi} />
                <CampoFormulario id="nome" rotulo="Nome *" value={form.nome} onChange={handleChange} erro={erros.nome} />
                <CampoFormulario id="descricao" rotulo="Descrição" value={form.descricao} onChange={handleChange} erro={erros.descricao} dica={`${form.descricao.length}/120 caracteres`} />
                <div className="form-linha">
                    <CampoFormulario id="preco" rotulo="Preço (R$) *" inputMode="decimal" placeholder="35,00" value={form.preco} onChange={handleChange} erro={erros.preco} />
                    <CampoFormulario id="duracaoMinutos" rotulo="Duração *" erro={erros.duracaoMinutos}>
                        <select id="duracaoMinutos" name="duracaoMinutos" value={form.duracaoMinutos} onChange={handleChange}>
                            {DURACOES.map((d) => <option key={d} value={d}>{d} min</option>)}
                        </select>
                    </CampoFormulario>
                </div>
                <label className="checkbox">
                    <input name="ativo" type="checkbox" checked={form.ativo} onChange={handleChange} />
                    Disponível para agendamento
                </label>
                <div className="acts">
                    <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar'}</button>
                    <button className="btn2" type="button" onClick={() => navigate(-1)}>Cancelar</button>
                </div>
            </form>
        </section>
    );
}
