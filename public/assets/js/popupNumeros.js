// Popup para mostrar todos os números de um jogo
function mostrarTodosNumeros(jogoId, numeros, modalidade, extras = {}) {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;

    // Criar popup
    const popup = document.createElement('div');
    popup.className = 'popup-numeros';
    popup.style.cssText = `
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
        border: 2px solid rgba(139, 92, 246, 0.3);
        border-radius: 1rem;
        padding: 2rem;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;

    // Título
    const titulo = document.createElement('div');
    titulo.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid rgba(139, 92, 246, 0.3);
    `;
    
    const tituloText = document.createElement('h3');
    tituloText.textContent = `Jogo #${jogoId}`;
    tituloText.style.cssText = `
        color: rgba(248, 250, 252, 0.95);
        font-size: 1.3rem;
        font-weight: 700;
    `;

    const btnFechar = document.createElement('button');
    btnFechar.textContent = '✕';
    btnFechar.style.cssText = `
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.5);
        color: #ef4444;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.2rem;
        font-weight: bold;
        transition: all 0.2s ease;
    `;
    btnFechar.addEventListener('mouseenter', () => {
        btnFechar.style.background = 'rgba(239, 68, 68, 0.3)';
        btnFechar.style.transform = 'scale(1.1)';
    });
    btnFechar.addEventListener('mouseleave', () => {
        btnFechar.style.background = 'rgba(239, 68, 68, 0.2)';
        btnFechar.style.transform = 'scale(1)';
    });
    btnFechar.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    titulo.appendChild(tituloText);
    titulo.appendChild(btnFechar);

    // Modalidade info se fornecida
    if (modalidade) {
        const modalidadeTag = document.createElement('div');
        modalidadeTag.textContent = modalidade;
        modalidadeTag.style.cssText = `
            display: inline-block;
            background: rgba(139, 92, 246, 0.2);
            border: 1px solid rgba(139, 92, 246, 0.4);
            color: rgba(248, 250, 252, 0.9);
            padding: 0.3rem 0.8rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-top: 0.5rem;
        `;
        titulo.appendChild(modalidadeTag);
    }

    // Container de números
    const numerosContainer = document.createElement('div');
    numerosContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
        margin-bottom: 1rem;
    `;

    // Adicionar números
    numeros.forEach(num => {
        const numeroSpan = document.createElement('span');
        numeroSpan.textContent = String(num).padStart(2, '0');
        numeroSpan.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 2.5rem;
            height: 2.5rem;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3));
            border: 2px solid rgba(139, 92, 246, 0.5);
            border-radius: 50%;
            font-size: 0.9rem;
            font-weight: bold;
            color: rgba(248, 250, 252, 0.95);
            transition: all 0.2s ease;
        `;
        numeroSpan.addEventListener('mouseenter', () => {
            numeroSpan.style.transform = 'scale(1.1)';
            numeroSpan.style.borderColor = 'rgba(139, 92, 246, 0.8)';
        });
        numeroSpan.addEventListener('mouseleave', () => {
            numeroSpan.style.transform = 'scale(1)';
            numeroSpan.style.borderColor = 'rgba(139, 92, 246, 0.5)';
        });
        numerosContainer.appendChild(numeroSpan);
    });

    // Extras (trevos, mês, time)
    if (extras.trevos && extras.trevos.length > 0) {
        const separador = document.createElement('div');
        separador.textContent = '🍀 Trevos da Sorte';
        separador.style.cssText = `
            color: rgba(22, 57, 127, 0.9);
            font-weight: bold;
            margin: 1.5rem 0 0.5rem 0;
            text-align: center;
        `;
        numerosContainer.appendChild(separador);

        const trevosDiv = document.createElement('div');
        trevosDiv.style.cssText = `
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            width: 100%;
        `;
        extras.trevos.forEach(trevo => {
            const trevoSpan = document.createElement('span');
            trevoSpan.textContent = trevo;
            trevoSpan.style.cssText = `
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 2.5rem;
                height: 2.5rem;
                background: linear-gradient(135deg, rgba(22, 57, 127, 0.3), rgba(22, 57, 127, 0.5));
                border: 2px solid rgba(22, 57, 127, 0.7);
                border-radius: 50%;
                font-size: 0.9rem;
                font-weight: bold;
                color: rgba(248, 250, 252, 0.95);
            `;
            trevosDiv.appendChild(trevoSpan);
        });
        numerosContainer.appendChild(trevosDiv);
    }

    if (extras.mesDaSorte) {
        const mesDiv = document.createElement('div');
        mesDiv.textContent = `📅 ${extras.mesDaSorte}`;
        mesDiv.style.cssText = `
            background: linear-gradient(135deg, rgba(203, 133, 43, 0.2), rgba(203, 133, 43, 0.3));
            border: 2px solid rgba(203, 133, 43, 0.5);
            color: rgba(203, 133, 43, 1);
            padding: 0.7rem 1.5rem;
            border-radius: 2rem;
            font-weight: bold;
            text-align: center;
            margin-top: 1rem;
        `;
        numerosContainer.appendChild(mesDiv);
    }

    if (extras.timeCoracao) {
        const timeDiv = document.createElement('div');
        timeDiv.textContent = `⚽ ${extras.timeCoracao}`;
        timeDiv.style.cssText = `
            background: linear-gradient(135deg, rgba(0, 255, 72, 0.2), rgba(0, 255, 72, 0.3));
            border: 2px solid rgba(0, 255, 72, 0.5);
            color: rgba(0, 255, 72, 1);
            padding: 0.7rem 1.5rem;
            border-radius: 2rem;
            font-weight: bold;
            text-align: center;
            margin-top: 1rem;
        `;
        numerosContainer.appendChild(timeDiv);
    }

    popup.appendChild(titulo);
    popup.appendChild(numerosContainer);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Fechar ao clicar fora
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });

    // Fechar com ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// Tornar função global
window.mostrarTodosNumeros = mostrarTodosNumeros;
