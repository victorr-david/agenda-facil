import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LayoutAutenticacao from '../components/LayoutAutenticacao';
import CampoFormulario from '../components/CampoFormulario';
import CampoSenha from '../components/CampoSenha';
import MensagemErro from '../components/MensagemErro';

export default function Login() {
    const { entrar } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', senha: '' });
    const [erros, setErros] = useState({});
    const [erroApi, setErroApi] = useState('');
    const [enviando, setEnviando] = useState(false);

    // Um único handler para todos os campos (usa o atributo name)
    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErros({ ...erros, [e.target.name]: undefined }); // some o erro ao corrigir
    }

    function validar() {
        const novos = {};
        if (!form.email.trim()) novos.email = 'Informe seu e-mail';
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) novos.email = 'Digite um e-mail válido';
        if (!form.senha) novos.senha = 'Informe a senha';
        else if (form.senha.length < 6) novos.senha = 'A senha deve ter no mínimo 6 caracteres';
        setErros(novos);
        return Object.keys(novos).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault(); // impede o recarregamento da página
        if (!validar()) return;
        setEnviando(true);
        setErroApi('');
        try {
            const u = await entrar(form.email, form.senha);
            const destino = location.state?.from ?? (u.perfil === 'admin' ? '/admin/painel' : '/servicos');
            navigate(destino, { replace: true });
        } catch (err) {
            setErroApi(err.message);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <LayoutAutenticacao
            destaque="Seu horário marcado, sem troca de mensagens."
            beneficios={['Veja os horários livres em tempo real', 'Reagende ou cancele com até 2 horas de antecedência', 'Todos os seus agendamentos em um só lugar']}
            titulo="Entrar na sua conta"
            subtitulo="Acesse para agendar ou acompanhar seus horários."
        >
            <form onSubmit={handleSubmit} noValidate>
                <MensagemErro mensagem={erroApi} />
                <CampoFormulario id="email" rotulo="E-mail" type="email" autoComplete="email" inputMode="email" placeholder="voce@email.com" value={form.email} onChange={handleChange} erro={erros.email} />
                <CampoSenha id="senha" rotulo="Senha" autoComplete="current-password" value={form.senha} onChange={handleChange} erro={erros.senha} />
                <button type="submit" className="btn block" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
            </form>
            <p className="alt">Ainda não tem conta? <Link to="/cadastro">Criar conta</Link></p>
            <p className="alt"><Link to="/servicos">Ver serviços sem entrar</Link></p>
            <p className="dica">Teste: admin@agendafacil.com / admin123 · joao@email.com / cliente123</p>
        </LayoutAutenticacao>
    );
}
