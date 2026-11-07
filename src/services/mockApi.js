// API simulada (Fase 1). Imita as respostas do backend REST com atraso e códigos HTTP,
// guardando os dados no localStorage. Na Fase 2 basta trocar por chamadas ao api.js (Axios).
import {
    agendamentosIniciais,
    servicosIniciais,
    usuariosFake,
    HORARIO_ABERTURA,
    HORARIO_FECHAMENTO,
    INTERVALO_MINUTOS,
    ANTECEDENCIA_CANCELAMENTO_HORAS,
} from '../data/dadosIniciais';

// Para demonstrar o estado de erro, rode no console do navegador:
//   localStorage.setItem('af_simular_falha', '1')   (para voltar ao normal: removeItem)
async function esperar(ms = 400) {
    await new Promise((r) => setTimeout(r, ms));
    if (localStorage.getItem('af_simular_falha') === '1')
        throw erroHttp(503, 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
}
const ler = (chave, padrao) => JSON.parse(localStorage.getItem(chave)) ?? padrao;
const salvar = (chave, valor) => localStorage.setItem(chave, JSON.stringify(valor));
const novoId = () => Math.random().toString(36).slice(2, 10);

const pad = (n) => String(n).padStart(2, '0');
export const paraMinutos = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
export const paraHora = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

function erroHttp(status, mensagem) {
    const e = new Error(mensagem);
    e.status = status;
    return e;
}

const usuarios = () => ler('af_usuarios', usuariosFake);
const servicos = () => ler('af_servicos', servicosIniciais);
const agendamentos = () => ler('af_agendamentos', agendamentosIniciais);

// "populate": troca os ids de cliente e serviço pelos objetos
function popular(a) {
    const c = usuarios().find((u) => u._id === a.cliente);
    const s = servicos().find((x) => x._id === a.servico);
    return { ...a, cliente: c ? { _id: c._id, nome: c.nome, telefone: c.telefone } : null, servico: s ?? null };
}

// ---------- AUTH ----------
export async function login(email, senha) {
    await esperar();
    const u = usuarios().find((x) => x.email === email.trim().toLowerCase() && x.senha === senha);
    if (!u) throw erroHttp(401, 'E-mail ou senha incorretos. Confira os dados e tente novamente.');
    const { senha: _omit, ...usuario } = u;
    return { token: 'token-fake-' + u._id, usuario };
}

export async function cadastrar({ nome, email, telefone, senha }) {
    await esperar();
    const lista = usuarios();
    const emailNormalizado = email.trim().toLowerCase();
    if (lista.some((u) => u.email === emailNormalizado)) throw erroHttp(409, 'Já existe uma conta com esse e-mail.');
    const novo = { _id: novoId(), nome: nome.trim(), email: emailNormalizado, telefone, senha, perfil: 'cliente' };
    salvar('af_usuarios', [...lista, novo]);
    const { senha: _omit, ...usuario } = novo;
    return { token: 'token-fake-' + novo._id, usuario };
}

// ---------- SERVIÇOS ----------
export async function listarServicos({ busca = '', precoMin = '', precoMax = '', incluirInativos = false, page = 1, limit = 6 } = {}) {
    await esperar();
    let lista = servicos();
    if (!incluirInativos) lista = lista.filter((s) => s.ativo);
    if (busca) lista = lista.filter((s) => s.nome.toLowerCase().includes(busca.trim().toLowerCase()));
    const min = parseFloat(String(precoMin).replace(',', '.'));
    const max = parseFloat(String(precoMax).replace(',', '.'));
    if (!isNaN(min)) lista = lista.filter((s) => s.preco >= min);
    if (!isNaN(max)) lista = lista.filter((s) => s.preco <= max);
    const total = lista.length;
    const dados = lista.sort((a, b) => a.nome.localeCompare(b.nome)).slice((page - 1) * limit, page * limit);
    return { dados, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function buscarServico(id) {
    await esperar(200);
    const s = servicos().find((x) => x._id === id);
    if (!s) throw erroHttp(404, 'Serviço não encontrado.');
    return s;
}

export async function criarServico(dados) {
    await esperar();
    const lista = servicos();
    if (lista.some((s) => s.nome.toLowerCase() === dados.nome.trim().toLowerCase()))
        throw erroHttp(409, 'Já existe um serviço com esse nome.');
    const novo = { ...dados, nome: dados.nome.trim(), _id: novoId() };
    salvar('af_servicos', [...lista, novo]);
    return novo;
}

export async function atualizarServico(id, dados) {
    await esperar();
    const lista = servicos();
    if (!lista.some((s) => s._id === id)) throw erroHttp(404, 'Serviço não encontrado.');
    if (lista.some((s) => s._id !== id && s.nome.toLowerCase() === dados.nome.trim().toLowerCase()))
        throw erroHttp(409, 'Já existe um serviço com esse nome.');
    const atualizados = lista.map((s) => (s._id === id ? { ...s, ...dados, _id: id } : s));
    salvar('af_servicos', atualizados);
    return atualizados.find((s) => s._id === id);
}

export async function removerServico(id) {
    await esperar();
    const hoje = new Date().toLocaleDateString('sv-SE');
    const temFuturos = agendamentos().some(
        (a) => a.servico === id && a.data >= hoje && (a.status === 'pendente' || a.status === 'confirmado'),
    );
    if (temFuturos)
        throw erroHttp(409, 'Este serviço tem agendamentos futuros. Desative-o em vez de remover.');
    salvar('af_servicos', servicos().filter((s) => s._id !== id));
}

// ---------- HORÁRIOS ----------
// Gera os horários do dia e marca como ocupados os que batem com outro agendamento
export async function listarHorarios({ data, servicoId, ignorarId } = {}) {
    await esperar(300);
    const servico = servicos().find((s) => s._id === servicoId);
    if (!servico || !data) return [];
    const dur = servico.duracaoMinutos;
    const agora = new Date();
    const hoje = agora.toLocaleDateString('sv-SE');
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    const ocupados = agendamentos()
        .filter((a) => a.data === data && a._id !== ignorarId && a.status !== 'cancelado')
        .map((a) => {
            const s = servicos().find((x) => x._id === a.servico);
            const ini = paraMinutos(a.hora);
            return [ini, ini + (s?.duracaoMinutos ?? INTERVALO_MINUTOS)];
        });

    const lista = [];
    for (let m = paraMinutos(HORARIO_ABERTURA); m + dur <= paraMinutos(HORARIO_FECHAMENTO); m += INTERVALO_MINUTOS) {
        const conflito = ocupados.some(([ini, fim]) => m < fim && m + dur > ini);
        const passou = data === hoje && m <= minutosAgora;
        lista.push({ hora: paraHora(m), livre: !conflito && !passou });
    }
    return lista;
}

// ---------- AGENDAMENTOS ----------
const ordenar = (a, b) => (a.data + a.hora).localeCompare(b.data + b.hora);

export async function listarMeusAgendamentos(clienteId, { status = '' } = {}) {
    await esperar();
    let lista = agendamentos().filter((a) => a.cliente === clienteId);
    if (status) lista = lista.filter((a) => a.status === status);
    return lista.sort(ordenar).map(popular);
}

export async function listarAgendamentos({ data = '', status = '' } = {}) {
    await esperar();
    let lista = agendamentos();
    if (data) lista = lista.filter((a) => a.data === data);
    if (status) lista = lista.filter((a) => a.status === status);
    return lista.sort(ordenar).map(popular);
}

export async function buscarAgendamento(id) {
    await esperar(200);
    const a = agendamentos().find((x) => x._id === id);
    if (!a) throw erroHttp(404, 'Agendamento não encontrado.');
    return popular(a);
}

async function validarHorario({ servico, data, hora }, ignorarId) {
    const hoje = new Date().toLocaleDateString('sv-SE');
    if (!data || data < hoje) throw erroHttp(422, 'Escolha uma data a partir de hoje.');
    const horarios = await listarHorarios({ data, servicoId: servico, ignorarId });
    const h = horarios.find((x) => x.hora === hora);
    if (!h || !h.livre) throw erroHttp(409, 'Esse horário acabou de ser ocupado. Escolha outro.');
}

export async function criarAgendamento(dados) {
    await validarHorario(dados);
    const novo = { ...dados, _id: novoId(), status: 'pendente' };
    salvar('af_agendamentos', [...agendamentos(), novo]);
    return popular(novo);
}

export async function reagendar(id, dados) {
    const lista = agendamentos();
    const atual = lista.find((a) => a._id === id);
    if (!atual) throw erroHttp(404, 'Agendamento não encontrado.');
    if (atual.status === 'concluido' || atual.status === 'cancelado')
        throw erroHttp(422, 'Agendamentos concluídos ou cancelados não podem ser alterados.');
    await validarHorario(dados, id);
    // Ao reagendar, volta para "pendente" para o estabelecimento confirmar de novo
    const atualizados = lista.map((a) => (a._id === id ? { ...a, ...dados, status: 'pendente' } : a));
    salvar('af_agendamentos', atualizados);
    return popular(atualizados.find((a) => a._id === id));
}

// Transições permitidas de status
const TRANSICOES = {
    pendente: ['confirmado', 'cancelado'],
    confirmado: ['concluido', 'cancelado'],
    concluido: [],
    cancelado: [],
};

export function podeCancelar(agendamento) {
    if (!TRANSICOES[agendamento.status].includes('cancelado')) return false;
    const inicio = new Date(`${agendamento.data}T${agendamento.hora}`);
    return inicio - Date.now() >= ANTECEDENCIA_CANCELAMENTO_HORAS * 3600000;
}

export async function alterarStatus(id, status, { perfil = 'cliente' } = {}) {
    await esperar();
    const lista = agendamentos();
    const atual = lista.find((a) => a._id === id);
    if (!atual) throw erroHttp(404, 'Agendamento não encontrado.');
    if (!TRANSICOES[atual.status].includes(status))
        throw erroHttp(422, `Não é possível mudar de "${atual.status}" para "${status}".`);
    if (perfil !== 'admin' && status !== 'cancelado') throw erroHttp(403, 'Apenas o estabelecimento pode alterar este status.');
    if (perfil !== 'admin' && !podeCancelar(atual))
        throw erroHttp(422, `O cancelamento só é permitido com ${ANTECEDENCIA_CANCELAMENTO_HORAS} horas de antecedência.`);
    const atualizados = lista.map((a) => (a._id === id ? { ...a, status } : a));
    salvar('af_agendamentos', atualizados);
    return popular(atualizados.find((a) => a._id === id));
}
