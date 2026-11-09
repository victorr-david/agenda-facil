// Campo com rótulo, dica e mensagem de erro ligados por acessibilidade (aria-describedby)
export default function CampoFormulario({ id, rotulo, erro, dica, children, ...props }) {
    const descricao = erro ? `${id}-erro` : dica ? `${id}-dica` : undefined;
    return (
        <div className="f">
            <label htmlFor={id}>{rotulo}</label>
            {children ?? (
                <input
                    id={id}
                    name={id}
                    className={erro ? 'bad' : ''}
                    aria-invalid={erro ? true : undefined}
                    aria-describedby={descricao}
                    {...props}
                />
            )}
            {dica && !erro && <p className="hint" id={`${id}-dica`}>{dica}</p>}
            {erro && <p className="err" id={`${id}-erro`} role="alert">{erro}</p>}
        </div>
    );
}
