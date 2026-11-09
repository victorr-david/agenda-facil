import { createContext, useContext, useState } from 'react';
import * as api from '../services/mockApi';

const AuthContext = createContext(null);

function lerUsuario() {
    try {
        return JSON.parse(localStorage.getItem('af_usuario'));
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    // Estado global: quem está logado (recupera do localStorage ao recarregar)
    const [usuario, setUsuario] = useState(lerUsuario);

    function guardarSessao({ token, usuario }) {
        localStorage.setItem('af_token', token);
        localStorage.setItem('af_usuario', JSON.stringify(usuario));
        setUsuario(usuario);
        return usuario;
    }

    async function entrar(email, senha) {
        return guardarSessao(await api.login(email, senha));
    }

    async function cadastrar(dados) {
        return guardarSessao(await api.cadastrar(dados));
    }

    function sair() {
        localStorage.removeItem('af_token');
        localStorage.removeItem('af_usuario');
        setUsuario(null);
    }

    const ehAdmin = usuario?.perfil === 'admin';

    return (
        <AuthContext.Provider value={{ usuario, ehAdmin, entrar, cadastrar, sair }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado: evita importar useContext + AuthContext em todo lugar
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}
