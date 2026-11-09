import { ROTULO_STATUS } from '../data/dadosIniciais';

// Etiqueta colorida com o status do agendamento
export default function SeloStatus({ status }) {
    return <span className={`chip chip-${status}`}>{ROTULO_STATUS[status] ?? status}</span>;
}
