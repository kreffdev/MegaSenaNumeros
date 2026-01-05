/**
 * Módulo: Jogos Recebidos
 * Gerencia funcionalidades da página de jogos recebidos de outros usuários
 */

// Função para atualizar o valor total das apostas
function atualizarValorTotal() {
    const totalCards = document.querySelectorAll('.jogo-card').length;
    const valorTotal = (totalCards * 6).toFixed(2).replace('.', ',');
    const statValue = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (statValue) {
        statValue.textContent = `R$ ${valorTotal}`;
    }
    // Atualizar também o total de jogos recebidos
    const totalJogos = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (totalJogos) {
        totalJogos.textContent = totalCards;
    }
}

// Função para copiar números para a área de transferência
function copiarNumeros(numeros) {
    navigator.clipboard.writeText(numeros).then(() => {
        alert('✓ Números copiados para a área de transferência!');
    }).catch(() => {
        alert('✗ Erro ao copiar. Tente novamente.');
    });
}

// Função para verificar e destacar números acertados
function verificarNumeros() {
    const raw = document.getElementById('verifica-numeros-input').value || '';
    // Extrai números separados por vírgula, aceita espaços e zeros à esquerda
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) {
        alert('Digite entre 1 e 6 números separados por vírgula.');
        return;
    }

    if (parts.length > 6) {
        alert('Máximo de 6 números.');
        return;
    }

    const numeros = [];
    for (let p of parts) {
        // remover zeros à esquerda e converter
        const num = parseInt(p, 10);
        if (Number.isNaN(num) || num < 1 || num > 60) {
            alert(`Número inválido: ${p}. Use valores entre 1 e 60.`);
            return;
        }
        if (!numeros.includes(num)) numeros.push(num);
    }

    // Limpa destaques anteriores
    document.querySelectorAll('.numero-badge.acertou').forEach(el => el.classList.remove('acertou'));
    document.querySelectorAll('.jogo-card').forEach(card => { 
        card.classList.remove('has-acertos'); 
        card.classList.remove('ganhou'); 
    });

    let vencedorEncontrado = false;
    let numerosVencedores = [];
    let nomeUsuario = '';
    
    // Contador de acertos por quantidade (0 a 6)
    const estatisticas = [0, 0, 0, 0, 0, 0, 0];

    // Para cada jogo, verifica quais números batem e marca
    document.querySelectorAll('.jogo-card').forEach(card => {
        const badges = Array.from(card.querySelectorAll('.numero-badge'));
        let matches = 0;
        badges.forEach(b => {
            const text = b.textContent.trim();
            const val = parseInt(text, 10);
            if (numeros.includes(val)) {
                b.classList.add('acertou');
                matches += 1;
            }
        });
        
        // Incrementar estatística baseado no número de acertos
        estatisticas[matches]++;

        if (matches > 0) card.classList.add('has-acertos');

        // Se acertou todos os números do cartão (ganhou)
        if (matches === badges.length && badges.length > 0) {
            card.classList.add('ganhou');
            if (!vencedorEncontrado) {
                vencedorEncontrado = true;
                numerosVencedores = Array.from(badges).map(b => b.textContent.trim());
                // Capturar nome do usuário que enviou
                const origemUsuario = card.querySelector('.origem-usuario');
                nomeUsuario = origemUsuario ? origemUsuario.textContent : 'Desconhecido';
            }
        }
    });
    
    // Exibir estatísticas
    exibirEstatisticas(estatisticas);

    // Se encontrou vencedor, mostra o popup
    if (vencedorEncontrado) {
        mostrarPopupVencedor(numerosVencedores, nomeUsuario);
    } else {
        // Rolagem suave para área de jogos para ver os resultados
        const grid = document.querySelector('.jogos-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Função para exibir estatísticas de acertos
function exibirEstatisticas(estatisticas) {
    const container = document.getElementById('estatisticas-acertos');
    if (!container) return;
    
    // Atualizar contadores
    for (let i = 0; i <= 6; i++) {
        const countElement = container.querySelector(`[data-acertos="${i}"] .estatistica-count`);
        if (countElement) {
            countElement.textContent = estatisticas[i];
        }
    }
    
    // Mostrar container
    container.classList.add('show');
}

// Função para mostrar popup de vencedor
function mostrarPopupVencedor(numeros, nomeUsuario) {
    const modal = document.getElementById('modal-vencedor');
    const numerosContainer = modal.querySelector('.vencedor-numeros');
    const usuarioElement = modal.querySelector('.modal-vencedor-usuario');
    
    // Limpar números anteriores
    numerosContainer.innerHTML = '';
    
    // Adicionar números vencedores
    numeros.forEach(num => {
        const span = document.createElement('span');
        span.className = 'vencedor-numero';
        span.textContent = num;
        numerosContainer.appendChild(span);
    });
    
    // Atualizar nome do usuário
    if (usuarioElement && nomeUsuario) {
        usuarioElement.innerHTML = `<span>Enviado por:</span> ${nomeUsuario}`;
    }
    
    // Mostrar modal
    modal.classList.add('show');
    
    // Tocar música de vitória via elemento <audio> anexado ao modal (mais robusto)
    try {
        const audioEl = document.createElement('audio');
        audioEl.src = '/assets/audios/weAreTheChamp.m4a';
        audioEl.volume = 0.5;
        audioEl.autoplay = true;
        audioEl.style.display = 'none';
        modal.appendChild(audioEl);
        window._vencedorAudio = audioEl;
        audioEl.play().catch(err => { console.log('Não foi possível reproduzir o áudio:', err); });
    } catch(e) {
        console.log('Erro ao carregar áudio:', e);
    }
}

// Função para fechar popup de vencedor
function fecharPopupVencedor() {
    const modal = document.getElementById('modal-vencedor');
    if (!modal) return;
    modal.classList.remove('show');

    // esconder após animação, se necessário
    setTimeout(() => { if (modal) modal.style.display = 'none'; }, 300);

    // parar e resetar áudio de vitória, se estiver tocando
    try {
        if (window._vencedorAudio) {
            window._vencedorAudio.pause();
            window._vencedorAudio.currentTime = 0;
            try { if (window._vencedorAudio.parentNode) window._vencedorAudio.parentNode.removeChild(window._vencedorAudio); } catch(e){}
            window._vencedorAudio = null;
        }
    } catch (e) { console.warn('Erro ao parar áudio de vencedor', e); }

    // Scroll até o card vencedor e aplicar destaque
    const winnerCard = document.querySelector('.jogo-card.ganhou');
    if (winnerCard) {
        winnerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // aplicar destaque contínuo (permanece até navegação/ação do usuário)
        winnerCard.classList.add('vencedor-destaque');
        winnerCard.setAttribute('tabindex', '-1');
        winnerCard.focus({ preventScroll: true });
    } else {
        const grid = document.querySelector('.jogos-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Função para marcar aposta como feita
function marcarAposta(checkbox) {
    if (!checkbox.checked) {
        // Impedir desmarcar
        checkbox.checked = true;
        return;
    }

    const card = checkbox.closest('.jogo-card');
    const jogoId = card.getAttribute('data-jogo-id');
    
    // Desabilitar checkbox imediatamente
    checkbox.disabled = true;
    card.classList.add('aposta-feita');

    // Salvar no backend
    fetch(`/api/jogos-recebidos/${jogoId}/marcar-aposta`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            console.log('Aposta marcada com sucesso');
        } else {
            alert(`✗ Erro: ${data.mensagem}`);
            // Reverter em caso de erro
            checkbox.disabled = false;
            checkbox.checked = false;
            card.classList.remove('aposta-feita');
        }
    })
    .catch(erro => {
        console.error('Erro:', erro);
        alert('✗ Erro ao marcar aposta');
        // Reverter em caso de erro
        checkbox.disabled = false;
        checkbox.checked = false;
        card.classList.remove('aposta-feita');
    });
}

// Função para deletar um jogo recebido específico
function deletarJogoRecebido(jogoId) {
    if (!confirm('Tem certeza que deseja deletar este jogo recebido?')) {
        return;
    }

    const card = document.querySelector(`[data-jogo-id="${jogoId}"]`);
    card.classList.add('deleting');

    fetch(`/api/jogos-recebidos/${jogoId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            card.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                card.remove();
                // Atualizar valor total
                atualizarValorTotal();
                // Se não houver mais cards, recarrega a página
                if (document.querySelectorAll('.jogo-card').length === 0) {
                    location.reload();
                }
            }, 300);
        } else {
            alert(`✗ Erro: ${data.mensagem}`);
            card.classList.remove('deleting');
        }
    })
    .catch(erro => {
        console.error('Erro:', erro);
        alert('✗ Erro ao deletar jogo');
        card.classList.remove('deleting');
    });
}

// Função para deletar todos os jogos recebidos
function deletarTodosRecebidos() {
    if (!confirm('Tem certeza que deseja deletar TODOS os jogos recebidos? Esta ação não pode ser desfeita.')) {
        return;
    }

    fetch('/api/jogos-recebidos/deletar-todos', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            alert(`✓ ${data.mensagem}`);
            location.reload();
        } else {
            alert(`✗ ${data.mensagem}`);
        }
    })
    .catch(erro => {
        console.error('Erro:', erro);
        alert('✗ Erro ao deletar jogos recebidos');
    });
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Ligar o botão de verificar ao evento
    const btnVerificar = document.querySelector('.btn-verificar');
    if (btnVerificar) {
        btnVerificar.addEventListener('click', verificarNumeros);
    }
    
    // Permitir enter no input de verificação para executar
    const inputVerificar = document.getElementById('verifica-numeros-input');
    if (inputVerificar) {
        inputVerificar.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                verificarNumeros();
            }
        });
    }
});

// Função para mostrar popup com todos os números
function mostrarTodosNumeros(jogoId, numeros, modalidade, extras = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'popup-numeros';
    
    let numerosHTML = numeros.map(n => `<span class="numero-popup">${String(n).padStart(2, '0')}</span>`).join('');
    
    let extrasHTML = '';
    if (extras.trevos && extras.trevos.length > 0) {
        extrasHTML += '<p style="color: var(--text-muted); margin: 1.5rem 0 0.8rem; text-align: center; font-weight: 600;">🍀 Trevos da Sorte</p>';
        extrasHTML += '<div class="popup-numeros-grid">';
        extras.trevos.forEach(trevo => {
            extrasHTML += `<span class="numero-popup" style="background: linear-gradient(135deg, rgba(22, 57, 127, 0.2), rgba(22, 57, 127, 0.3)); border-color: rgba(22, 57, 127, 0.5);">${trevo}</span>`;
        });
        extrasHTML += '</div>';
    }
    
    if (extras.mesDaSorte) {
        extrasHTML += `<p style="background: linear-gradient(135deg, rgba(203, 133, 43, 0.2), rgba(203, 133, 43, 0.3)); border: 2px solid rgba(203, 133, 43, 0.5); color: rgba(203, 133, 43, 1); padding: 0.7rem 1.5rem; border-radius: 2rem; font-weight: bold; text-align: center; margin-top: 1.5rem;">📅 ${extras.mesDaSorte}</p>`;
    }
    
    if (extras.timeCoracao) {
        extrasHTML += `<p style="background: linear-gradient(135deg, rgba(0, 255, 72, 0.2), rgba(0, 255, 72, 0.3)); border: 2px solid rgba(0, 255, 72, 0.5); color: rgba(0, 255, 72, 1); padding: 0.7rem 1.5rem; border-radius: 2rem; font-weight: bold; text-align: center; margin-top: 1rem;">⚽ ${extras.timeCoracao}</p>`;
    }
    
    popup.innerHTML = `
        <div class="popup-header">
            <h3>${modalidade} - Jogo #${jogoId}</h3>
            <span class="popup-close">&times;</span>
        </div>
        <div class="popup-body">
            <div class="popup-numeros-grid">
                ${numerosHTML}
            </div>
            ${extrasHTML}
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('active'), 10);
    
    const btnClose = popup.querySelector('.popup-close');
    btnClose.addEventListener('click', () => fecharPopup(overlay));
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fecharPopup(overlay);
    });
    
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            fecharPopup(overlay);
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

function fecharPopup(overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
}

// Expor funções globalmente para serem acessíveis aos event handlers
window.verificarNumeros = verificarNumeros;
window.copiarNumeros = copiarNumeros;
window.deletarJogoRecebido = deletarJogoRecebido;
window.deletarTodosRecebidos = deletarTodosRecebidos;
window.mostrarTodosNumeros = mostrarTodosNumeros;
window.fecharPopup = fecharPopup;
window.marcarAposta = marcarAposta;
window.fecharPopupVencedor = fecharPopupVencedor;
