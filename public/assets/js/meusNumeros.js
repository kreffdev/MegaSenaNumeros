/**
 * Módulo: Meus Números
 * Gerencia funcionalidades da página de sequências salvas do usuário
 */

// Função para atualizar o valor total das apostas
function atualizarValorTotal() {
    const totalCards = document.querySelectorAll('.jogo-card').length;
    const valorTotal = (totalCards * 6).toFixed(2).replace('.', ',');
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

        if (matches > 0) card.classList.add('has-acertos');

        // Se acertou todos os números do cartão (ganhou)
        if (matches === badges.length && badges.length > 0) {
            card.classList.add('ganhou');
        }
    });

    // Rolagem suave para área de jogos para ver os resultados (opcional)
    const grid = document.querySelector('.jogos-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// Função para abrir modal de envio
function abrirModal() {
    document.getElementById('modal-enviar-jogos').style.display = 'flex';
    document.getElementById('nome-usuario-envio').focus();
}

// Função para fechar modal de envio
function fecharModal() {
    document.getElementById('modal-enviar-jogos').style.display = 'none';
    document.getElementById('nome-usuario-envio').value = '';
}

// Função para enviar jogos para outro usuário
function enviarJogos() {
    const nomeUsuario = document.getElementById('nome-usuario-envio').value.trim();

    if (!nomeUsuario) {
        alert('Digite um nome de usuário');
        return;
    }

    const btn = document.querySelector('.modal-footer .btn-confirmar');
    btn.disabled = true;
    btn.textContent = '📤 Enviando...';

    fetch('/api/jogos/enviar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nomeUsuario: nomeUsuario })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            alert(`✓ ${data.mensagem}`);
            fecharModal();
            // Redirecionar para meus envios após sucesso
            setTimeout(() => {
                window.location.href = '/meusenvios';
            }, 500);
        } else {
            alert(`✗ ${data.mensagem}`);
        }
    })
    .catch(erro => {
        console.error('Erro:', erro);
        alert('✗ Erro ao enviar jogos');
    })
    .finally(() => {
        btn.disabled = false;
        btn.textContent = 'Enviar';
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
});
