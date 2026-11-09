import { useEffect, useState } from 'react';
import { listarServicos } from '../services/mockApi';
import ServicoCard from '../components/ServicoCard';
import Paginacao from '../components/Paginacao';
import Carregando from '../components/Carregando';
import MensagemErro from '../components/MensagemErro';

const FILTROS_VAZIOS = { busca: '', precoMin: '', precoMax: '' };

export default function Servicos() {
    const [campos, setCampos] = useState(FILTROS_VAZIOS); // o que está digitado
    const [filtros, setFiltros] = useState(FILTROS_VAZIOS); // o que foi aplicado
    const [erroFiltro, setErroFiltro] = useState('');
    const [page, setPage] = useState(1);
    const [resultado, setResultado] = useState({ dados: [], totalPages: 1, total: 0 });
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [tentativa, setTentativa] = useState(0);

    // Efeito: busca os serviços sempre que filtros ou página mudarem
    useEffect(() => {
        let ativo = true; // evita atualizar estado de componente desmontado
        setCarregando(true);
        setErro('');
        listarServicos({ ...filtros, page })
            .then((res) => ativo && setResultado(res))
            .catch((err) => ativo && setErro(err.message || 'Não foi possível carregar os serviços.'))
            .finally(() => ativo && setCarregando(false));
        return () => { ativo = false; }; // limpeza
    }, [filtros, page, tentativa]);

    function handleChange(e) {
        setCampos({ ...campos, [e.target.name]: e.target.value });
    }

    function handleFiltrar(e) {
        e.preventDefault();
        const min = parseFloat(campos.precoMin.replace(',', '.'));
        const max = parseFloat(campos.precoMax.replace(',', '.'));
        if ((campos.precoMin && isNaN(min)) || (campos.precoMax && isNaN(max)))
            return setErroFiltro('Digite apenas números nos preços, ex.: 30 ou 29,90');
        if (!isNaN(min) && !isNaN(max) && min > max)
            return setErroFiltro('O preço mínimo não pode ser maior que o máximo');
        setErroFiltro('');
        setFiltros(campos);
        setPage(1); // novo filtro sempre volta para a página 1
    }

    function handleLimpar() {
        setCampos(FILTROS_VAZIOS);
        setFiltros(FILTROS_VAZIOS);
        setErroFiltro('');
        setPage(1);
    }

    return (
        <section>
            <h1>Nossos serviços {!carregando && !erro && <small className="muted">({resultado.total})</small>}</h1>
            <p className="sub">Escolha um serviço para ver os horários livres.</p>
            <form className="card filters" onSubmit={handleFiltrar} noValidate>
                <div className="grow2">
                    <label htmlFor="busca">Buscar serviço</label>
                    <input id="busca" name="busca" type="search" placeholder="Ex.: corte" value={campos.busca} onChange={handleChange} />
                </div>
                <div className="grow">
                    <label htmlFor="precoMin">Preço mínimo (R$)</label>
                    <input id="precoMin" name="precoMin" inputMode="decimal" value={campos.precoMin} onChange={handleChange} />
                </div>
                <div className="grow">
                    <label htmlFor="precoMax">Preço máximo (R$)</label>
                    <input id="precoMax" name="precoMax" inputMode="decimal" value={campos.precoMax} onChange={handleChange} />
                </div>
                <button className="btn">Filtrar</button>
                <button type="button" className="btn2" onClick={handleLimpar}>Limpar</button>
                {erroFiltro && <p className="err largura-total" role="alert">{erroFiltro}</p>}
            </form>

            <MensagemErro mensagem={erro} onTentarNovamente={() => setTentativa(tentativa + 1)} />
            {carregando ? (
                <Carregando texto="Buscando serviços..." />
            ) : !erro && resultado.dados.length === 0 ? (
                <p className="empty">Nenhum serviço encontrado. Ajuste a busca ou os preços.</p>
            ) : (
                <div className="grid">
                    {resultado.dados.map((s) => <ServicoCard key={s._id} servico={s} />)}
                </div>
            )}
            <Paginacao page={page} totalPages={resultado.totalPages} onMudar={setPage} />
        </section>
    );
}
