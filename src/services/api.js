// Cliente HTTP para a Fase 2 (backend Node + MongoDB).
// Enquanto o backend não existe, as páginas usam o mockApi.js.
import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api/v1' });

// Envia o token JWT em toda requisição
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('af_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Sessão expirada (401): limpa os dados e manda para o login
api.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('af_token');
            localStorage.removeItem('af_usuario');
            window.location.assign('/login');
        }
        return Promise.reject(err);
    },
);
