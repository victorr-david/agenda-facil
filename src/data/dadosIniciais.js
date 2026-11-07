// Dados "fake" da Fase 1. Na Fase 2 eles virão da API (Node + MongoDB).

// Data de hoje no formato AAAA-MM-DD (usado para montar a agenda de exemplo)
const hoje = new Date().toLocaleDateString('sv-SE');
const amanha = new Date(Date.now() + 86400000).toLocaleDateString('sv-SE');

export const STATUS = ['pendente', 'confirmado', 'concluido', 'cancelado'];

export const ROTULO_STATUS = {
    pendente: 'Pendente',
    confirmado: 'Confirmado',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
};

// Funcionamento do estabelecimento (regra de negócio)
export const HORARIO_ABERTURA = '09:00';
export const HORARIO_FECHAMENTO = '18:00';
export const INTERVALO_MINUTOS = 30;
export const ANTECEDENCIA_CANCELAMENTO_HORAS = 2;

export const usuariosFake = [
    { _id: 'u1', nome: 'Administrador', email: 'admin@agendafacil.com', telefone: '(83) 99999-0000', senha: 'admin123', perfil: 'admin' },
    { _id: 'u2', nome: 'João Pereira', email: 'joao@email.com', telefone: '(83) 98888-1111', senha: 'cliente123', perfil: 'cliente' },
    { _id: 'u3', nome: 'Maria Silva', email: 'maria@email.com', telefone: '(83) 97777-2222', senha: 'cliente123', perfil: 'cliente' },
    { _id: 'u4', nome: 'Carlos Lima', email: 'carlos@email.com', telefone: '(83) 96666-3333', senha: 'cliente123', perfil: 'cliente' },
];

export const servicosIniciais = [
    { _id: 's1', nome: 'Corte masculino', descricao: 'Corte na tesoura ou máquina', preco: 35, duracaoMinutos: 30, ativo: true },
    { _id: 's2', nome: 'Barba', descricao: 'Modelagem e acabamento com toalha quente', preco: 25, duracaoMinutos: 30, ativo: true },
    { _id: 's3', nome: 'Corte + barba', descricao: 'Os dois serviços em um só horário', preco: 55, duracaoMinutos: 60, ativo: true },
    { _id: 's4', nome: 'Sobrancelha', descricao: 'Design e limpeza', preco: 15, duracaoMinutos: 30, ativo: true },
    { _id: 's5', nome: 'Pigmentação de barba', descricao: 'Preenchimento de falhas com pigmento', preco: 40, duracaoMinutos: 30, ativo: true },
    { _id: 's6', nome: 'Hidratação capilar', descricao: 'Tratamento para fios ressecados', preco: 45, duracaoMinutos: 60, ativo: true },
];

export const agendamentosIniciais = [
    { _id: 'a1', cliente: 'u2', servico: 's1', data: hoje, hora: '09:00', observacoes: '', status: 'concluido' },
    { _id: 'a2', cliente: 'u4', servico: 's3', data: hoje, hora: '10:30', observacoes: 'Barba mais curta', status: 'confirmado' },
    { _id: 'a3', cliente: 'u3', servico: 's1', data: hoje, hora: '14:00', observacoes: '', status: 'pendente' },
    { _id: 'a4', cliente: 'u3', servico: 's4', data: hoje, hora: '15:30', observacoes: '', status: 'pendente' },
    { _id: 'a5', cliente: 'u2', servico: 's2', data: amanha, hora: '11:00', observacoes: '', status: 'pendente' },
];

// Formata número como moeda brasileira (R$ 35,00)
export const formatarPreco = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// "2026-11-06" -> "sexta-feira, 6 de novembro"
export const formatarData = (d) =>
    new Date(`${d}T00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
