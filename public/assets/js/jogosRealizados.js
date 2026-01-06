/**
 * Módulo: Jogos Realizados
 * Gerencia funcionalidades da página de jogos realizados/apostas feitas
 */

// Event listeners quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 [jogosRealizados.js] DOMContentLoaded disparado');
    console.log('📍 URL atual:', window.location.pathname);
    
    // Event delegation para os botões "..." APENAS na página de jogos realizados
    // Verificar URL da página para garantir que estamos na página correta
    const isJogosRealizadosPage = window.location.pathname === '/jogos-realizados' || 
                                   window.location.pathname === '/jogosrealizados';
    
    console.log('🔍 [jogosRealizados.js] Verificação de página:');
    console.log('   - Pathname:', window.location.pathname);
    console.log('   ➜ isJogosRealizadosPage:', isJogosRealizadosPage);
    
    if (isJogosRealizadosPage) {
        console.log('✅ [jogosRealizados.js] Event delegation ativado para esta página');
        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('numero-mini') && e.target.classList.contains('mais')) {
                console.log('🎯 [jogosRealizados.js] Event delegation disparado - clique em ...');
                const jogoId = e.target.dataset.jogoId;
                const numeros = JSON.parse(e.target.dataset.numeros || '[]');
                const modalidade = e.target.dataset.modalidade;
                const trevos = JSON.parse(e.target.dataset.trevos || '[]');
                const mesDaSorte = e.target.dataset.mes || null;
                const timeCoracao = e.target.dataset.time || null;
                
                const extras = {
                    trevos: trevos.length > 0 ? trevos : null,
                    mesDaSorte: mesDaSorte || null,
                    timeCoracao: timeCoracao || null
                };
                
                console.log('📞 [jogosRealizados.js] Chamando mostrarTodosNumeros via event delegation');
                mostrarTodosNumeros(jogoId, numeros, modalidade, extras);
            }
        });
    } else {
        console.log('⏭️ [jogosRealizados.js] Event delegation NÃO ativado - página incorreta');
    }
});

function verificarNumeros() {
    console.log('🔍 verificarNumeros() chamada');
    const input = document.getElementById('verifica-numeros-input');
    console.log('Input encontrado:', !!input);
    
    const raw = input ? input.value : '';
    console.log('Valor raw:', raw);
    
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) {
        alert('Digite os números sorteados separados por vírgula.');
        return;
    }

    // Validar quantidade baseado na modalidade mais comum dos jogos na página
    // Mega-Sena: 6, Lotofácil: 15, Quina: 5, Lotomania: 20, etc.
    if (parts.length > 25) {
        alert('Máximo de 25 números.');
        return;
    }

    const numeros = [];
    for (let p of parts) {
        const num = parseInt(p, 10);
        if (Number.isNaN(num) || num < 0 || num > 100) {
            alert(`Número inválido: ${p}. Use valores entre 0 e 100.`);
            return;
        }
        if (!numeros.includes(num)) numeros.push(num);
    }
    
    console.log('Números a verificar:', numeros);

    // Limpa destaques anteriores
    document.querySelectorAll('.numero-mini.acertou').forEach(el => el.classList.remove('acertou'));
    document.querySelectorAll('.numero-badge.acertou').forEach(el => el.classList.remove('acertou'));
    document.querySelectorAll('.jogo-card').forEach(card => { 
        card.classList.remove('has-acertos'); 
        card.classList.remove('ganhou'); 
    });

    let vencedorEncontrado = false;
    let numerosVencedores = [];
    let tipoVencedor = '';
    
    // Contador de acertos expandido para até 25 números
    const estatisticas = new Array(26).fill(0);

    // Para cada jogo, verifica quais números batem e marca
    document.querySelectorAll('.jogo-card').forEach(card => {
        // Pegar TODOS os números do cartão (numero-mini E numero-badge, excluindo trevos)
        const numerosElements = Array.from(card.querySelectorAll('.numero-mini:not(.mais), .numero-badge:not(.trevo-badge)'));
        
        console.log('Card:', card.querySelector('.jogo-numero')?.textContent);
        console.log('Elementos de números encontrados:', numerosElements.length);
        
        let matches = 0;
        const numerosDoCartao = [];
        
        numerosElements.forEach(el => {
            const text = el.textContent.trim();
            const val = parseInt(text, 10);
            
            if (!isNaN(val)) {
                numerosDoCartao.push(val);
                if (numeros.includes(val)) {
                    el.classList.add('acertou');
                    matches += 1;
                }
            }
        });
        
        console.log('Números do cartão:', numerosDoCartao);
        console.log('Acertos:', matches);
        console.log('Total de números no cartão:', numerosDoCartao.length);
        
        // Incrementar estatística baseado no número de acertos
        if (matches < estatisticas.length) {
            estatisticas[matches]++;
        }

        if (matches > 0) card.classList.add('has-acertos');

        // Se acertou todos os números do cartão (ganhou)
        // IMPORTANTE: Para ganhar, TODOS os números do cartão devem estar nos números sorteados
        if (matches === numerosDoCartao.length && numerosDoCartao.length > 0) {
            card.classList.add('ganhou');
            console.log('🎉🎉🎉 VENCEDOR ENCONTRADO!');
            if (!vencedorEncontrado) {
                vencedorEncontrado = true;
                // Pegar TODOS os números do card (incluindo os escondidos)
                // Tentar pegar do atributo data-numeros primeiro
                const dataNumeros = card.getAttribute('data-numeros');
                if (dataNumeros) {
                    try {
                        const todosNumeros = JSON.parse(dataNumeros);
                        numerosVencedores = todosNumeros.map(n => String(n).padStart(2, '0'));
                        console.log('✅ Pegou todos os números do data-numeros:', numerosVencedores.length);
                    } catch (e) {
                        numerosVencedores = numerosDoCartao.map(n => String(n).padStart(2, '0'));
                    }
                } else {
                    numerosVencedores = numerosDoCartao.map(n => String(n).padStart(2, '0'));
                }
                // Identificar tipo da aposta
                const origemBadge = card.querySelector('.origem-badge');
                tipoVencedor = origemBadge ? origemBadge.textContent.trim() : 'Aposta Realizada';
            }
        }
    });
    
    // Exibir estatísticas
    exibirEstatisticas(estatisticas);

    console.log('Vencedor encontrado:', vencedorEncontrado);
    console.log('Números vencedores:', numerosVencedores);

    // Se encontrou vencedor, mostra o popup
    if (vencedorEncontrado) {
        console.log('🎉 Chamando mostrarPopupVencedor()');
        mostrarPopupVencedor(numerosVencedores, tipoVencedor, numeros);
    } else {
        console.log('❌ Nenhum vencedor encontrado');
        // Rolagem suave para área de jogos para ver os resultados
        const grid = document.querySelector('.jogos-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

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

function mostrarPopupVencedor(numerosJogo, tipo, numerosSorteados = []) {
    console.log('🎊 mostrarPopupVencedor() chamada');
    console.log('Números do jogo:', numerosJogo);
    console.log('Números sorteados:', numerosSorteados);
    console.log('Tipo:', tipo);
    
    const modal = document.getElementById('modal-vencedor');
    console.log('Modal encontrada:', !!modal);
    
    if (!modal) {
        console.error('❌ Modal #modal-vencedor não encontrada no DOM!');
        alert('VENCEDOR! Números: ' + numerosJogo.join(', '));
        return;
    }
    
    const numerosContainer = modal.querySelector('.vencedor-numeros');
    const usuarioElement = modal.querySelector('.modal-vencedor-usuario');
    
    console.log('numerosContainer:', !!numerosContainer);
    console.log('usuarioElement:', !!usuarioElement);
    
    // Limpar números anteriores
    numerosContainer.innerHTML = '';
    
    // Converter números sorteados para array de números para comparação
    const sorteadosNum = numerosSorteados.map(n => parseInt(n, 10));
    console.log('📊 Sorteados convertidos:', sorteadosNum);
    
    // Se tem mais de 6 números, mostrar os primeiros 6 com botão expandir
    const mostrarTodos = numerosJogo.length <= 6;
    const numerosVisiveis = mostrarTodos ? numerosJogo : numerosJogo.slice(0, 6);
    console.log('📊 Mostrar todos?', mostrarTodos);
    console.log('📊 Números visíveis:', numerosVisiveis);
    
    // Adicionar números vencedores com cor
    numerosVisiveis.forEach(num => {
        const numInt = parseInt(num, 10);
        const acertou = sorteadosNum.includes(numInt);
        console.log(`  - Número ${num}: ${acertou ? '✅ acertou' : '❌ errou'}`);
        const span = document.createElement('span');
        span.className = 'vencedor-numero ' + (acertou ? 'acertou' : 'errou');
        span.textContent = num;
        numerosContainer.appendChild(span);
    });
    
    // Se há mais números, adicionar botão "..."
    if (!mostrarTodos) {
        console.log('🔢 Criando botão +X para mostrar mais números');
        const btnMais = document.createElement('span');
        btnMais.className = 'vencedor-numero mais';
        btnMais.textContent = `+${numerosJogo.length - 6}`;
        btnMais.style.cursor = 'pointer';
        btnMais.style.display = 'inline-grid';
        btnMais.title = 'Clique para ver todos os números';
        console.log('📍 Botão criado:', btnMais.textContent);
        btnMais.addEventListener('click', () => {
            console.log('🖱️ Botão +X clicado, expandindo todos os números');
            // Limpar e mostrar todos
            numerosContainer.innerHTML = '';
            numerosJogo.forEach(num => {
                const numInt = parseInt(num, 10);
                const acertou = sorteadosNum.includes(numInt);
                const span = document.createElement('span');
                span.className = 'vencedor-numero ' + (acertou ? 'acertou' : 'errou');
                span.textContent = num;
                numerosContainer.appendChild(span);
            });
        });
        numerosContainer.appendChild(btnMais);
        console.log('✅ Botão +X adicionado ao container');
    } else {
        console.log('ℹ️ Não precisa de botão +X (total de números: ' + numerosJogo.length + ')');
    }
    
    // Atualizar tipo da aposta
    if (usuarioElement && tipo) {
        usuarioElement.innerHTML = `<span>Aposta:</span> ${tipo}`;
    }
    
    // Mostrar modal
    console.log('Adicionando classe .show');
    // ensure modal is visible even if an inline style 'display: none' exists
    try {
        modal.style.zIndex = '20000';
        modal.style.display = 'flex';
        
        // Observador para garantir que, caso outro script remova a classe show
        // ou altere display, o áudio de vitória seja interrompido.
        try {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(m => {
                    if (m.type === 'attributes' && (m.attributeName === 'class' || m.attributeName === 'style')) {
                        const hasShow = modal.classList.contains('show');
                        const isHidden = window.getComputedStyle(modal).display === 'none';
                        if (!hasShow || isHidden) {
                            try {
                                if (window._vencedorAudio) {
                                    window._vencedorAudio.pause();
                                    window._vencedorAudio.currentTime = 0;
                                    window._vencedorAudio = null;
                                }
                            } catch (e) { /* swallow */ }
                        }
                    }
                });
            });
            observer.observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
        } catch (e) { 
            console.warn('MutationObserver não disponível', e); 
        }
    } catch (e) { 
        console.warn('Erro ao configurar modal:', e); 
    }
    modal.classList.add('show');
    
    console.log('Classes da modal:', modal.className);
    console.log('Style display:', modal.style.display);
    
    // Tocar música de vitória via elemento <audio> anexado ao modal (mais robusto)
    try {
        const audioEl = document.createElement('audio');
        audioEl.src = '/assets/audios/weAreTheChamp.m4a';
        audioEl.volume = 0.5;
        audioEl.autoplay = true;
        audioEl.style.display = 'none';
        // anexar ao modal para que possamos sempre localizá-lo e pará-lo
        modal.appendChild(audioEl);
        window._vencedorAudio = audioEl;
        audioEl.play().then(() => console.log('✅ Música tocando!')).catch(err => {
            console.log('❌ Não foi possível reproduzir o áudio:', err);
        });
    } catch(e) {
        console.log('❌ Erro ao carregar áudio:', e);
    }
}

function fecharPopupVencedor() {
    const modal = document.getElementById('modal-vencedor');
    if (!modal) return;
    modal.classList.remove('show');
    // hide after animation
    setTimeout(() => { if (modal) modal.style.display = 'none'; }, 300);

    // parar e resetar áudio de vitória, se estiver tocando
    try {
        if (window._vencedorAudio) {
            window._vencedorAudio.pause();
            window._vencedorAudio.currentTime = 0;
            // remover elemento de áudio do DOM se estiver anexado
            try {
                if (window._vencedorAudio.parentNode) window._vencedorAudio.parentNode.removeChild(window._vencedorAudio);
            } catch (e) { /* ignore */ }
            window._vencedorAudio = null;
        }
        // como redundância, parar quaisquer elementos <audio> na página
        try {
            document.querySelectorAll('audio').forEach(a => {
                try { a.pause(); a.currentTime = 0; } catch (e) { /* ignore individual audio errors */ }
            });
        } catch (e) { /* ignore */ }
    } catch (e) { console.warn('Erro ao parar áudio de vencedor', e); }

    // Scroll até o card vencedor e aplicar destaque
    const winnerCard = document.querySelector('.jogo-card.ganhou');
    if (winnerCard) {
        // rolar suavemente até o centro da viewport
        winnerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // aplicar destaque contínuo (permanece até navegação/ação do usuário)
        winnerCard.classList.add('vencedor-destaque');
        // foco para acessibilidade
        winnerCard.setAttribute('tabindex', '-1');
        winnerCard.focus({ preventScroll: true });
    } else {
        // fallback: rolar para grid geral
        const grid = document.querySelector('.jogos-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// handler seguro que garante parada do áudio antes de delegar ao fechamento
function __fecharPopupVencedorSafe() {
    try {
        if (window._vencedorAudio) {
            window._vencedorAudio.pause();
            window._vencedorAudio.currentTime = 0;
            window._vencedorAudio = null;
        }
        // redundância: pausar todos elementos de áudio na página
        try { document.querySelectorAll('audio').forEach(a => { try { a.pause(); a.currentTime = 0;} catch(e){} }); } catch(e){}
    } catch (e) { console.warn('Erro ao parar áudio de vencedor (safe)', e); }

    if (typeof fecharPopupVencedor === 'function') {
        try { fecharPopupVencedor(); } catch (e) { console.warn('fecharPopupVencedor threw', e); }
    } else {
        const modal = document.getElementById('modal-vencedor');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        }
    }
}

// Expor o handler seguro globalmente para uso no template
window.__fecharPopupVencedorSafe = __fecharPopupVencedorSafe;

function copiarNumeros(numeros) {
    navigator.clipboard.writeText(numeros).then(() => {
        const btn = event.target;
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '✅ Copiado!';
        btn.style.backgroundColor = '#22c55e';
        
        setTimeout(() => {
            btn.innerHTML = textoOriginal;
            btn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('❌ Erro ao copiar números');
    });
}

function mostrarTodosNumeros(jogoId, numeros, modalidade, extras = {}) {
    console.log('🎨 [jogosRealizados.js] mostrarTodosNumeros() chamada');
    console.log('   - jogoId:', jogoId);
    console.log('   - numeros:', numeros);
    console.log('   - modalidade:', modalidade);
    console.log('   - extras:', extras);
    
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.dataset.source = 'jogosRealizados';
    console.log('✨ [jogosRealizados.js] Criando overlay com data-source="jogosRealizados"');
    
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
            <span class="popup-copiar" style="display: inline-flex !important; visibility: visible !important;" title="Copiar números">📋 Copiar</span>
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
    btnClose.addEventListener('click', () => fecharPopupNumeros(overlay));
    
    // Botão copiar números
    const btnCopiar = popup.querySelector('.popup-copiar');
    if (btnCopiar) {
        btnCopiar.addEventListener('click', () => {
            const numerosParaCopiar = numeros.map(n => String(n).padStart(2, '0')).join(', ');
            navigator.clipboard.writeText(numerosParaCopiar).then(() => {
                const textoOriginal = btnCopiar.textContent;
                btnCopiar.textContent = '✓ Copiado!';
                btnCopiar.style.backgroundColor = '#10b981';
                setTimeout(() => {
                    btnCopiar.textContent = textoOriginal;
                    btnCopiar.style.backgroundColor = '';
                }, 2000);
            }).catch(err => {
                console.error('Erro ao copiar:', err);
                alert('✗ Erro ao copiar números');
            });
        });
    }
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fecharPopupNumeros(overlay);
    });
    
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            fecharPopupNumeros(overlay);
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

function fecharPopupNumeros(overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
}

// Expor funções globalmente para serem acessadas pelo onclick
window.verificarNumeros = verificarNumeros;
window.fecharPopupVencedor = fecharPopupVencedor;
window.copiarNumeros = copiarNumeros;
window.mostrarTodosNumeros = mostrarTodosNumeros;
