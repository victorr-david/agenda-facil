import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { atualizarServico, listarServicos, removerServico } from '../services/mockApi';
import { formatarPreco } from '../data/dadosIniciais';
import Carregando from '../components/Carregando';
import MensagemErro from '../components/MensagemErro';
import MensagemSucesso from '../components/MensagemSucesso';
import Paginacao from '../components/Paginacao';

// Lista de serviços para o administrador (inclui os inativos)
export default function GerenciarServicos() {
    const location = useLocation();
    const [busca, setBusca] = useState('');
    const [page, setPage] = useState(1);
    const [resultado, setResultado] = useState({ dados: [], totalPages: 1, total: 0 });
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [erroAcao, setErroAcao] = useState('');
    const [sucesso, setSucesso] = useState(location.state?.mensagem ?? '');
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        let ativo = true;
        setCarregando(true);
        setErro('');
        listarServicos({ busca, incluirInativos: true, page, limit: 8 })
            .then((r) => ativo && setResultado(r))
            .catch((err) => ativo && setErro(err.message || 'Não foi possível carregar os serviços.'))
            .finally(() => ativo && setCarregando(false));
        return () => { ativo = false; };
    }, [busca, page, tentativa]);

    async function handleAtivar(s) {
        setErroAcao('');
        try {
            await atualizarServico(s._id, { ...s, ativo: !s.ativo });
            setSucesso(`"${s.nome}" ${s.ativo ? 'desativado' : 'ativado'}.`);
            setTentativa(tentativa + 1);
        } catch (err) {
            setErroAcao(err.message);
        }
    }

    async function handleRemover(s) {
        if (!window.confirm(`Remover o serviço "${s.nome}"?`)) return;
        setErroAcao('');
        setSucesso('');
        try {
            await removerServico(s._id);
            setSucesso(`"${s.nome}" removido.`);
            setTentativa(tentativa + 1);
        } catch (err) {
            setErroAcao(err.message);
        }
    }

    return (
        <section>
            <div className="titulo-acao">
                <div>
                    <h1>Gerenciar serviços <small className="muted">({resultado.total})</small></h1>
                    <p className="sub">Cadastre, edite ou desative os serviços oferecidos.</p>
                </div>
                <Link className="btn" to="/admin/servicos/novo">Novo serviço</Link>
            </div>

            <div className="card filters">
                <div className="grow2">
                    <label htmlFor="busca">Buscar por nome</label>
                    <input id="busca" type="search" placeholder="Ex.: barba" value={busca} onChange={(e) => { setBusca(e.target.value); setPage(1); }} />
                </div>
            </div>

            <MensagemSucesso>{sucesso}</MensagemSucesso>
            <MensagemErro mensagem={erroAcao} />
            <MensagemErro mensagem={erro} onTentarNovamente={() => setTentativa(tentativa + 1)} />

            {carregando ? (
                <Carregando texto="Buscando serviços..." />
            ) : !erro && resultado.dados.length === 0 ? (
                <p className="empty">Nenhum serviço encontrado.</p>
            ) : (
                <div className="card tbl">
                    <table>
                        <thead>
                            <tr><th>Serviço</th><th>Preço</th><th>Duração</th><th>Situação</th><th>Ações</th></tr>
                        </thead>
                        <tbody>
                            {resultado.dados.map((s) => (
                                <tr key={s._id}>
                                    <td><b>{s.nome}</b><br /><small className="muted">{s.descricao}</small></td>
                                    <td>{formatarPreco(s.preco)}</td>
                                    <td>{s.duracaoMinutos} min</td>
                                    <td><span className={`chip ${s.ativo ? 'chip-confirmado' : 'chip-k'}`}>{s.ativo ? 'Ativo' : 'Inativo'}</span></td>
                                    <td>
                                        <div className="acts">
                                            <Link className="btn2 btn-link" to={`/admin/servicos/${s._id}/editar`}>Editar</Link>
                                            <button className="btn2" onClick={() => handleAtivar(s)}>{s.ativo ? 'Desativar' : 'Ativar'}</button>
                                            <button className="btn2 danger" onClick={() => handleRemover(s)}>Remover</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Paginacao page={page} totalPages={resultado.totalPages} onMudar={setPage} />
        </section>
    );
}
