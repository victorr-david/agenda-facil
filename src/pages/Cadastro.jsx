import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LayoutAutenticacao from '../components/LayoutAutenticacao';
import CampoFormulario from '../components/CampoFormulario';
import CampoSenha from '../components/CampoSenha';
import MensagemErro from '../components/MensagemErro';

export default function Cadastro() {
    const { cadastrar } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '' });
    const [erros, setErros] = useState({});
    const [erroApi, setErroApi] = useState('');
    const [enviando, setEnviando] = useState(false);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErros({ ...erros, [e.target.name]: undefined }); // some o erro ao corrigir
    }

    function validar() {
        const novos = {};
        if (!form.nome.trim()) novos.nome = 'Informe seu nome completo';
        else if (form.nome.trim().split(/\s+/).length < 2) novos.nome = 'Digite nome e sobrenome';
        if (!form.email.trim()) novos.email = 'Informe seu e-mail';
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) novos.email = 'Digite um e-mail válido';
        const digitos = form.telefone.replace(/\D/g, '');
        if (!digitos) novos.telefone = 'Informe seu telefone com DDD';
        else if (digitos.length < 10 || digitos.length > 11) novos.telefone = 'Digite o telefone com DDD, ex.: (83) 99999-9999';
        if (!form.senha) novos.senha = 'Informe uma senha';
        else if (form.senha.length < 6) novos.senha = 'A senha deve ter no mínimo 6 caracteres';
        setErros(novos);
        return Object.keys(novos).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validar()) return;
        setEnviando(true);
        setErroApi('');
        try {
            await cadastrar(form);
            navigate('/servicos', { replace: true });
        } catch (err) {
            setErroApi(err.message);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <LayoutAutenticacao
            destaque="Crie sua conta e agende em poucos passos."
            beneficios={['Escolha o serviço, o dia e um horário livre', 'Acompanhe o status: pendente, confirmado ou concluído', 'Reagende ou cancele pelo próprio site']}
            titulo="Criar conta"
            subtitulo="Preencha seus dados para começar a agendar."
        >
            <form onSubmit={handleSubmit} noValidate>
                <MensagemErro mensagem={erroApi} />
                <CampoFormulario id="nome" rotulo="Nome completo" autoComplete="name" value={form.nome} onChange={handleChange} erro={erros.nome} />
                <CampoFormulario id="email" rotulo="E-mail" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={handleChange} erro={erros.email} />
                <CampoFormulario id="telefone" rotulo="Telefone com DDD" type="tel" autoComplete="tel" inputMode="tel" dica="A barbearia usa este número para falar com você sobre o horário." value={form.telefone} onChange={handleChange} erro={erros.telefone} />
                <CampoSenha id="senha" rotulo="Senha" autoComplete="new-password" value={form.senha} onChange={handleChange} erro={erros.senha} />
                <button type="submit" className="btn block" disabled={enviando}>{enviando ? 'Criando conta...' : 'Criar conta'}</button>
            </form>
            <p className="alt">Já tem conta? <Link to="/login">Entrar</Link></p>
        </LayoutAutenticacao>
    );
}
