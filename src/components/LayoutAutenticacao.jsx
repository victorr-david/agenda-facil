import Logo from './Logo';

// Tela dividida usada no Login e no Cadastro: lado azul com benefícios + formulário
export default function LayoutAutenticacao({ destaque, beneficios, titulo, subtitulo, children }) {
    return (
        <div className="auth">
            <aside className="auth-side">
                <Logo />
                <div>
                    <h2>{destaque}</h2>
                    <ul className="ul">
                        {beneficios.map((b) => (
                            <li key={b}>
                                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="10" fill="#60A5FA" />
                                    <path d="M5.5 10.5l3 3 6-6.5" stroke="#0B1F4B" strokeWidth="2" fill="none" />
                                </svg>
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <p>Agendamento online para barbearias e salões.</p>
            </aside>
            <main className="auth-main">
                <div className="auth-box">
                    <h1>{titulo}</h1>
                    <p className="sub">{subtitulo}</p>
                    {children}
                </div>
            </main>
        </div>
    );
}
