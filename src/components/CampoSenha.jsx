import { useState } from 'react';
import CampoFormulario from './CampoFormulario';

// Campo de senha com botão Mostrar/Ocultar
export default function CampoSenha({ id, rotulo, erro, ...props }) {
    const [visivel, setVisivel] = useState(false);
    return (
        <CampoFormulario id={id} rotulo={rotulo} erro={erro}>
            <div className="pw">
                <input
                    id={id}
                    name={id}
                    type={visivel ? 'text' : 'password'}
                    className={erro ? 'bad' : ''}
                    aria-invalid={erro ? true : undefined}
                    aria-describedby={erro ? `${id}-erro` : undefined}
                    {...props}
                />
                <button
                    type="button"
                    className="btn2 ghost"
                    aria-pressed={visivel}
                    aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setVisivel(!visivel)}
                >
                    {visivel ? 'Ocultar' : 'Mostrar'}
                </button>
            </div>
        </CampoFormulario>
    );
}
