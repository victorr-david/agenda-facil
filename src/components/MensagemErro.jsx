// Mostra erros vindos da API. O botão "Tentar novamente" é opcional.
export default function MensagemErro({ mensagem, onTentarNovamente }) {
    if (!mensagem) return null;
    return (
        <div className="alert" role="alert">
            <span>{mensagem}</span>
            {onTentarNovamente && (
                <button type="button" className="link" onClick={onTentarNovamente}>Tentar novamente</button>
            )}
        </div>
    );
}
