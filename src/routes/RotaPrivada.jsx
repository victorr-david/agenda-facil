import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protege rotas: sem login -> vai para /login (guardando de onde veio);
// perfil errado -> volta para /servicos
export default function RotaPrivada({ perfil }) {
    const { usuario } = useAuth();
    const location = useLocation();
    if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    if (perfil && usuario.perfil !== perfil) return <Navigate to="/servicos" replace />;
    return <Outlet />;
}
