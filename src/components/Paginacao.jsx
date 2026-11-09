export default function Paginacao({ page, totalPages, onMudar }) {
    if (totalPages <= 1) return null;
    return (
        <div className="paginacao">
            <button className="btn2" disabled={page <= 1} onClick={() => onMudar(page - 1)}>
                ← Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button className="btn2" disabled={page >= totalPages} onClick={() => onMudar(page + 1)}>
                Próxima →
            </button>
        </div>
    );
}
