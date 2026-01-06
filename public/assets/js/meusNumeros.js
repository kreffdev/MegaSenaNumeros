/**
 * Módulo: Meus Números
 * Gerencia funcionalidades da página de sequências salvas do usuário
 */

// Função para atualizar o valor total das apostas
function atualizarValorTotal() {
    const cards = document.querySelectorAll('.jogo-card');
    const totalCards = cards.length;
    
    // Mapa de preços por modalidade
    const precos = {
        megasena: 6.00,
        lotofacil: 3.50,
        quina: 3.00,
        lotomania: 3.00,
        duplasena: 3.00,
        diadesorte: 2.50,
        timemania: 3.50,
        maismilionaria: 6.00,
        supersete: 3.00,
        loteca: 4.00
    };
    
    // Calcular valor total baseado nas modalidades dos cards
    let valorTotalNum = 0;
    cards.forEach(card => {
        const modalidade = card.getAttribute('data-modalidade') || 'megasena';
        valorTotalNum += precos[modalidade] || 5.00;
    });
    
    const valorTotal = valorTotalNum.toFixed(2).replace('.', ',');
    const statValue = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (statValue) {
        statValue.textContent = `R$ ${valorTotal}`;
    }
    // Atualizar também o total de sequências
    const totalSequencias = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (totalSequencias) {
        totalSequencias.textContent = totalCards;
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

// Função para marcar aposta como feita (MEUS JOGOS PRÓPRIOS)
function marcarApostaPropria(checkbox) {
    if (!checkbox.checked) {
        // Impedir desmarcar
        checkbox.checked = true;
        return;
    }

    const card = checkbox.closest('.jogo-card');
    const jogoId = card.getAttribute('data-jogo-id');
    
    console.log('🎯 marcarApostaPropria() chamada');
    console.log('   - jogoId:', jogoId);
    
    if (!jogoId) {
        alert('✗ Erro: ID do jogo não encontrado');
        checkbox.checked = false;
        return;
    }
    
    // Desabilitar checkbox imediatamente
    checkbox.disabled = true;
    card.classList.add('aposta-feita');

    console.log('📡 POST para: /api/jogos/' + jogoId + '/marcar-aposta');

    // Salvar no backend
    fetch(`/api/jogos/${jogoId}/marcar-aposta`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            console.log('✅ Aposta própria marcada com sucesso');
            
            // Animar e remover o card
            card.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                card.remove();
                // Atualizar contadores
                atualizarValorTotal();
                
                // Verificar se ainda há cards
                if (document.querySelectorAll('.jogo-card').length === 0) {
                    location.reload();
                }
            }, 500);
        } else {
            alert(`✗ Erro: ${data.mensagem}`);
            // Reverter em caso de erro
            checkbox.disabled = false;
            checkbox.checked = false;
            card.classList.remove('aposta-feita');
        }
    })
    .catch(erro => {
        console.error('❌ Erro:', erro);
        alert('✗ Erro ao marcar aposta');
        // Reverter em caso de erro
        checkbox.disabled = false;
        checkbox.checked = false;
        card.classList.remove('aposta-feita');
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
                // Capturar nome do usuário da página
                const userInfo = document.querySelector('.user-info strong');
                nomeUsuario = userInfo ? userInfo.textContent : 'Você';
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
    console.log('🔔 mostrarPopupVencedor chamado', { numeros, nomeUsuario });
    const modal = document.getElementById('modal-vencedor');
    if (!modal) { console.warn('modal-vencedor não encontrado no DOM'); return; }
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
        usuarioElement.innerHTML = `<span>Sequência de:</span> ${nomeUsuario}`;
    }
    
    // Mostrar modal (forçar display e adicionar classe de animação)
    // ensure it's visible above other overlays
    modal.style.zIndex = '20000';
    modal.style.display = 'flex';
    // pequena espera para garantir que o display seja aplicado antes da animação
    setTimeout(() => {
        modal.classList.add('show');
        console.log('🔔 modal-vencedor exibido (classe .show aplicada)');
    }, 10);
    
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
    console.log('🔕 fecharPopupVencedor chamado', { modalPresent: !!modal, time: Date.now() });
    console.log(new Error('fecharPopupVencedor stack').stack);
    if (!modal) return;
    modal.classList.remove('show');
    // esconder após animação
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

    // Rolagem suave para área de jogos após fechar
    const grid = document.querySelector('.jogos-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
        // Scroll até o card vencedor e destacar visualmente
        const winnerCard = document.querySelector('.jogo-card.ganhou');
        if (winnerCard) {
            // rolar suavemente até o centro da viewport
            winnerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // aplicar destaque contínuo (permanece até navegação/ação do usuário)
            winnerCard.classList.add('vencedor-destaque');
            // dar foco para acessibilidade
            winnerCard.setAttribute('tabindex', '-1');
            winnerCard.focus({ preventScroll: true });
        }
}

// Função para deletar um jogo específico
function deletarJogo(jogoId) {
    if (!confirm('Tem certeza que deseja deletar esta sequência?')) {
        return;
    }

    const card = document.querySelector(`[data-jogo-id="${jogoId}"]`);
    card.classList.add('deleting');

    fetch(`/api/jogos/${jogoId}`, {
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
        alert('✗ Erro ao deletar sequência');
        card.classList.remove('deleting');
    });
}



// Função para deletar todas as sequências
function deletarTodas() {
    if (!confirm('Tem certeza que deseja deletar TODAS as sequências? Esta ação não pode ser desfeita.')) {
        return;
    }

    fetch('/api/jogos/deletar-todos', {
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
        alert('✗ Erro ao deletar sequências');
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

    // Permitir envio com Enter na modal
    const inputEnvio = document.getElementById('nome-usuario-envio');
    if (inputEnvio) {
        inputEnvio.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                enviarJogos();
            }
        });
    }
    
    // Fechar modal ao clicar fora
    const modal = document.getElementById('modal-enviar-jogos');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) fecharModal();
        });
    }

    // Garantir que os modals comecem escondidos e adicionar fechamento ao clicar fora
    const modalVencedor = document.getElementById('modal-vencedor');
    if (modalVencedor) {
        // forçar escondido no carregamento
        modalVencedor.style.display = 'none';
        // clicar fora do conteúdo fecha o modal
        modalVencedor.addEventListener('click', function(e) {
            if (e.target === modalVencedor) {
                if (typeof __fecharPopupVencedorSafe === 'function') {
                    __fecharPopupVencedorSafe();
                } else {
                    fecharPopupVencedor();
                }
            }
        });
    }

    // garantir modal de envio escondido por JS (só por segurança)
    const modalEnvio = document.getElementById('modal-enviar-jogos');
    if (modalEnvio) modalEnvio.style.display = 'none';
});

// Função para mostrar popup com todos os números
function mostrarTodosNumeros(jogoId, numeros, modalidade, extras = {}) {
    console.log('🎨 [meusNumeros.js] mostrarTodosNumeros() chamada');
    console.log('   - jogoId:', jogoId);
    console.log('   - numeros:', numeros);
    console.log('   - modalidade:', modalidade);
    console.log('   - extras:', extras);
    
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.dataset.source = 'meusNumeros';
    console.log('✨ [meusNumeros.js] Criando overlay com data-source="meusNumeros"');
    
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

// Expor funções globalmente
window.copiarNumeros = copiarNumeros;
window.marcarApostaPropria = marcarApostaPropria;
window.deletarJogo = deletarJogo;
window.deletarTodas = deletarTodas;
if (typeof abrirModal !== 'undefined') window.abrirModal = abrirModal;
if (typeof fecharModal !== 'undefined') window.fecharModal = fecharModal;
if (typeof enviarJogos !== 'undefined') window.enviarJogos = enviarJogos;
window.mostrarTodosNumeros = mostrarTodosNumeros;
window.fecharPopup = fecharPopup;
window.fecharPopupVencedor = fecharPopupVencedor;
