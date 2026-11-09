export default function MensagemSucesso({ children }) {
    if (!children) return null;
    return <div className="ok" role="status">{children}</div>;
}
