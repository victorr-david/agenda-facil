export default function Carregando({ texto = 'Carregando...' }) {
    return (
        <p className="estado estado--carregando" role="status">
            <span className="spinner" aria-hidden="true" /> {texto}
        </p>
    );
}
