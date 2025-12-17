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
