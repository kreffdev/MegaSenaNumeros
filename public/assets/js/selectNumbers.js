// Função principal de seleção de números
function initSelectNumbers() {
  const container = document.querySelector('.numeros-criador ul');
  const escolhidosLista = document.querySelector('.escolhidos-lista');
  const previewDiv = document.querySelector('.meus-numeros-preview');
  const btnGerar = document.getElementById('btn-gerar-aleatorio');
  const btnRegistrar = document.getElementById('btn-registrar-sequencias');
  if (!container || !escolhidosLista || !previewDiv) return;

  const MAX_SELECTIONS = 6;
  let sequenciasConfirmadas = []; // Armazena sequências confirmadas localmente

  // Função para gerar números aleatórios
  function gerarAleatorios() {
    const numeros = new Set();
    while (numeros.size < MAX_SELECTIONS) {
      numeros.add(Math.floor(Math.random() * 60) + 1);
    }
    return Array.from(numeros).sort((a, b) => a - b);
  }

  // Função para selecionar números programaticamente
  function selecionarNumeros(numeros) {
    // Limpar seleção anterior
    container.querySelectorAll('button.selected').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    // Selecionar os novos números
    container.querySelectorAll('button').forEach(btn => {
      if (numeros.includes(parseInt(btn.textContent))) {
        btn.classList.add('selected');
      }
      btn.disabled = false;
    });
    
    // Desabilitar botões não selecionados
    container.querySelectorAll('button').forEach(b => {
      if (!b.classList.contains('selected')) b.disabled = true;
    });
    
    updateEscolhidos();
  }

  // Função para atualizar a contagem de sequências
  function atualizarContagem() {
    const contagem = previewDiv.querySelectorAll('.sequencia-item').length;
    const contagemSpan = document.querySelector('.contagem-sequencias');
    if (contagemSpan) {
      contagemSpan.textContent = contagem;
    }
    
    // Mostrar botão registrar se houver sequências confirmadas
    if (btnRegistrar) {
      if (contagem > 0) {
        btnRegistrar.style.display = 'block';
      } else {
        btnRegistrar.style.display = 'none';
      }
    }
  }

  // Função para atualizar a lista de números escolhidos
  function updateEscolhidos() {
    const selectedButtons = container.querySelectorAll('button.selected');
    const listItems = escolhidosLista.querySelectorAll('.escolhido-numero');
    
    // Remove items da lista que não estão mais selecionados
    listItems.forEach(item => {
      const numero = item.textContent;
      const isStillSelected = Array.from(selectedButtons).some(btn => btn.textContent === numero);
      if (!isStillSelected) {
        item.remove();
      }
    });

    // Adiciona novos números selecionados
    selectedButtons.forEach(btn => {
      const numero = btn.textContent;
      const exists = Array.from(escolhidosLista.querySelectorAll('.escolhido-numero')).some(item => item.textContent === numero);
      
      if (!exists) {
        const item = document.createElement('div');
        item.className = 'escolhido-numero';
        item.textContent = numero;
        item.addEventListener('click', function() {
          btn.click();
        });
        escolhidosLista.appendChild(item);
      }
    });

    // Mostra botão de confirmação se houver 6 selecionados
    updateConfirmButton();
  }

  // Função para atualizar visibilidade do botão de confirmação
  function updateConfirmButton() {
    const selectedCount = container.querySelectorAll('button.selected').length;
    let confirmBtn = document.getElementById('btn-confirmar-numeros');
    
    if (selectedCount === MAX_SELECTIONS && !confirmBtn) {
      // Criar botão de confirmação
      confirmBtn = document.createElement('button');
      confirmBtn.id = 'btn-confirmar-numeros';
      confirmBtn.className = 'btn-confirmar';
      confirmBtn.textContent = 'Confirmar Sequência';
      confirmBtn.addEventListener('click', confirmarSequencia);
      escolhidosLista.parentElement.appendChild(confirmBtn);
      
      // Scroll automático para o botão
      setTimeout(() => {
        confirmBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else if (selectedCount < MAX_SELECTIONS && confirmBtn) {
      // Remover botão se não tiver 6
      confirmBtn.remove();
    }
  }

  // Função para confirmar e guardar a sequência
  function confirmarSequencia() {
    const selectedNumbers = Array.from(container.querySelectorAll('button.selected'))
      .map(btn => btn.textContent)
      .sort((a, b) => parseInt(a) - parseInt(b));

    // Armazenar localmente
    sequenciasConfirmadas.push(selectedNumbers.map(n => parseInt(n)));

    // Criar elemento para exibir a sequência salva
    const sequenciaItem = document.createElement('div');
    sequenciaItem.className = 'sequencia-item';
    sequenciaItem.dataset.numeros = JSON.stringify(selectedNumbers.map(n => parseInt(n)));
    
    // Criar display dos números
    const numerosDisplay = document.createElement('div');
    numerosDisplay.className = 'sequencia-numeros';
    selectedNumbers.forEach(num => {
      const numSpan = document.createElement('span');
      numSpan.className = 'numero-sequencia';
      numSpan.textContent = num;
      numerosDisplay.appendChild(numSpan);
    });

    // Botão para remover sequência
    const btnRemover = document.createElement('button');
    btnRemover.className = 'btn-remover-sequencia';
    btnRemover.textContent = '✕';
    btnRemover.addEventListener('click', function() {
      const numerosStr = sequenciaItem.dataset.numeros;
      const index = sequenciasConfirmadas.findIndex(seq => 
        JSON.stringify(seq) === numerosStr
      );
      if (index > -1) {
        sequenciasConfirmadas.splice(index, 1);
      }
      sequenciaItem.remove();
      atualizarContagem();
    });

    sequenciaItem.appendChild(numerosDisplay);
    sequenciaItem.appendChild(btnRemover);
    previewDiv.appendChild(sequenciaItem);
    atualizarContagem();

    // Limpar seleção e reiniciar
    container.querySelectorAll('button.selected').forEach(btn => {
      btn.classList.remove('selected');
    });
    container.querySelectorAll('button').forEach(b => b.disabled = false);
    
    // Limpar lista de escolhidos
    escolhidosLista.innerHTML = '';
    updateConfirmButton();
  }

  // Função para registrar sequências no backend
  async function registrarSequenciasBackend() {

    btnRegistrar.disabled = true;
    btnRegistrar.textContent = '💾 Registrando...';

    try {
      const response = await fetch('/api/jogos/salvar-multiplas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sequencias: sequenciasConfirmadas.map(seq => ({ numeros: seq }))
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        alert(`✓ ${data.mensagem}`);
        // Limpar sequências confirmadas
        sequenciasConfirmadas = [];
        // Limpar preview
        previewDiv.querySelectorAll('.sequencia-item').forEach(item => item.remove());
        atualizarContagem();
        btnRegistrar.style.display = 'none';
      } else {
        alert(`✗ Erro: ${data.mensagem}`);
      }
    } catch (erro) {
      console.error('Erro ao registrar sequências:', erro);
      alert('Erro ao registrar sequências. Verifique o console.');
    } finally {
      btnRegistrar.disabled = false;
      btnRegistrar.textContent = '💾 Registrar Sequências';
    }
  }

  // Event listener para o botão registrar
  if (btnRegistrar) {
    btnRegistrar.addEventListener('click', registrarSequenciasBackend);
  }

  // Evento do botão gerar aleatório
  if (btnGerar) {
    btnGerar.addEventListener('click', function() {
      const numerosAleatorios = gerarAleatorios();
      selecionarNumeros(numerosAleatorios);
    });
  }

  // Event listener para os botões de número
  container.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    // ignorar se estiver desabilitado
    if (btn.disabled) return;

    const isSelected = btn.classList.contains('selected');

    if (isSelected) {
      btn.classList.remove('selected');
    } else {
      const selectedCount = container.querySelectorAll('button.selected').length;
      if (selectedCount >= MAX_SELECTIONS) {
        // já atingiu o máximo, ignorar novo clique
        return;
      }
      btn.classList.add('selected');
    }

    // Atualiza estado dos demais botões: se já houver MAX_SELECTIONS selecionados, desabilita os não selecionados
    const nowSelected = container.querySelectorAll('button.selected').length;
    if (nowSelected >= MAX_SELECTIONS) {
      container.querySelectorAll('button').forEach(b => {
        if (!b.classList.contains('selected')) b.disabled = true;
      });
    } else {
      container.querySelectorAll('button').forEach(b => b.disabled = false);
    }

    // Atualiza a lista de números escolhidos
    updateEscolhidos();
  });
}

initSelectNumbers();
// Disponibiliza a função globalmente para ser chamada quando desejar
window.initSelectNumbers = initSelectNumbers;