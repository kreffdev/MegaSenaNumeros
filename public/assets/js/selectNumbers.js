// Função principal de seleção de números
function initSelectNumbers() {
  const container = document.querySelector('.numeros-criador ul');
  const escolhidosLista = document.querySelector('.escolhidos-lista');
  const previewDiv = document.querySelector('.meus-numeros-preview');
  const btnGerar = document.getElementById('btn-gerar-aleatorio');
  const btnRegistrar = document.getElementById('btn-registrar-sequencias');
  if (!container || !escolhidosLista || !previewDiv) return;

  // Garantir que os botões de número estejam habilitados ao iniciar
  container.querySelectorAll('button').forEach(b => { b.disabled = false; b.style.pointerEvents = 'auto'; });

  // Ativar debug para verificação rápida no console
  const DEBUG_SELECT_NUMBERS = true;
  let sequenciasConfirmadas = []; // Armazena sequências confirmadas localmente
  let duplaSenaPrimeiraSerie = []; // Armazena primeira série de 6 números da Dupla Sena

  // Inicializar seleção de trevos (+Milionária)
  const trevosContainer = document.getElementById('trevos-container');
  if (trevosContainer) {
    const trevosBtns = trevosContainer.querySelectorAll('.trevo-btn');
    trevosBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const selectedTrevos = trevosContainer.querySelectorAll('.trevo-btn.selected');
        if (btn.classList.contains('selected')) {
          btn.classList.remove('selected');
          // Reabilitar todos os trevos quando desmarcar
          trevosBtns.forEach(b => b.disabled = false);
        } else if (selectedTrevos.length < 2) {
          btn.classList.add('selected');
          // Se atingiu o limite de 2, desabilitar os não selecionados
          if (selectedTrevos.length + 1 >= 2) {
            trevosBtns.forEach(b => {
              if (!b.classList.contains('selected')) {
                b.disabled = true;
              }
            });
          }
        }
        updateEscolhidos();
        updateConfirmButton(); // Atualizar botão de confirmação quando trevos mudarem
      });
    });
  }

  // Função para obter o número máximo de seleções baseado na modalidade
  function getMaxSelections() {
    if (window.getConfigAtual) {
      return window.getConfigAtual().numerosObrigatorios;
    }
    return 6; // Fallback para Mega-Sena
  }

  // Função para gerar números aleatórios
  function gerarAleatorios() {
    const config = window.getConfigAtual ? window.getConfigAtual() : { rangeInicio: 1, rangeFim: 60 };
    const MAX_SELECTIONS = getMaxSelections();
    const numeros = new Set();
    while (numeros.size < MAX_SELECTIONS) {
      numeros.add(Math.floor(Math.random() * (config.rangeFim - config.rangeInicio + 1)) + config.rangeInicio);
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
    const selectedNumbers = Array.from(selectedButtons)
      .map(btn => btn.textContent)
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    // Limpar completamente a lista
    escolhidosLista.innerHTML = '';
    
    // Verificar modalidade
    const config = window.getConfigAtual ? window.getConfigAtual() : {};
    const ehDuplaSena = config.doisSorteios === true;
    const ehDiaDeSorte = config.temMesDaSorte === true;
    
    if (ehDuplaSena) {
      // Se tem primeira série armazenada, mostrar ela primeiro
      if (duplaSenaPrimeiraSerie.length === 6) {
        // Mostrar primeira série
        duplaSenaPrimeiraSerie.forEach(numero => {
          const item = document.createElement('div');
          item.className = 'escolhido-numero';
          item.textContent = numero;
          item.style.opacity = '0.6'; // Levemente transparente para indicar que já foi salva
          escolhidosLista.appendChild(item);
        });
        
        // Separador entre os dois sorteios
        const separador = document.createElement('span');
        separador.className = 'separador-escolhidos';
        separador.textContent = '|';
        separador.style.color = '#8B5CF6';
        separador.style.fontSize = '2rem';
        separador.style.fontWeight = 'bold';
        separador.style.margin = '0 0.5rem';
        escolhidosLista.appendChild(separador);
        
        // Mostrar segunda série (seleção atual)
        selectedNumbers.forEach(numero => {
          const item = document.createElement('div');
          item.className = 'escolhido-numero';
          item.textContent = numero;
          const btn = Array.from(selectedButtons).find(b => b.textContent === numero);
          if (btn) {
            item.addEventListener('click', function() {
              btn.click();
            });
          }
          escolhidosLista.appendChild(item);
        });
      } else {
        // Ainda na primeira série
        selectedNumbers.forEach(numero => {
          const item = document.createElement('div');
          item.className = 'escolhido-numero';
          item.textContent = numero;
          const btn = Array.from(selectedButtons).find(b => b.textContent === numero);
          if (btn) {
            item.addEventListener('click', function() {
              btn.click();
            });
          }
          escolhidosLista.appendChild(item);
        });
        
        // Se completou 6 da primeira série, armazenar e desmarcar
        if (selectedNumbers.length === 6) {
          duplaSenaPrimeiraSerie = [...selectedNumbers];
          
          // Aguardar um pouco e então desmarcar para segunda série
          setTimeout(() => {
            container.querySelectorAll('button.selected').forEach(btn => {
              btn.classList.remove('selected');
              btn.disabled = false;
            });
            container.querySelectorAll('button').forEach(b => {
              b.disabled = false;
            });
            updateEscolhidos(); // Atualizar para mostrar o separador
          }, 500);
          
          // Não retornar aqui para permitir que o restante da função execute
        }
      }
    } else {
      // Outras modalidades: exibir normalmente em ordem crescente
      selectedNumbers.forEach(numero => {
        const item = document.createElement('div');
        item.className = 'escolhido-numero';
        item.textContent = numero;
        const btn = Array.from(selectedButtons).find(b => b.textContent === numero);
        if (btn) {
          item.addEventListener('click', function() {
            btn.click();
          });
        }
        escolhidosLista.appendChild(item);
      });
      
      // Adicionar Mês da Sorte se for Dia de Sorte
      if (ehDiaDeSorte && selectedNumbers.length > 0) {
        const mesSorteSelect = document.getElementById('mes-sorte');
        const mesSelecionado = mesSorteSelect ? mesSorteSelect.value : '';
        const mesTexto = mesSorteSelect && mesSelecionado ? mesSorteSelect.options[mesSorteSelect.selectedIndex].text : '';
        
        if (mesTexto) {
          // Separador entre números e mês
          const separador = document.createElement('span');
          separador.className = 'separador-mes-sorte';
          separador.textContent = '|';
          separador.style.color = '#CB852B';
          separador.style.fontSize = '2rem';
          separador.style.fontWeight = 'bold';
          separador.style.margin = '0 0.5rem';
          escolhidosLista.appendChild(separador);
          
          // Mês da Sorte
          const mesSorteItem = document.createElement('div');
          mesSorteItem.className = 'escolhido-mes-sorte';
          mesSorteItem.textContent = `🌟 ${mesTexto}`;
          mesSorteItem.style.color = '#CB852B';
          mesSorteItem.style.fontWeight = 'bold';
          mesSorteItem.style.fontSize = '1.1rem';
          mesSorteItem.style.display = 'flex';
          mesSorteItem.style.alignItems = 'center';
          mesSorteItem.style.padding = '0.5rem 1rem';
          mesSorteItem.style.background = 'rgba(203, 133, 43, 0.1)';
          mesSorteItem.style.borderRadius = '0.5rem';
          escolhidosLista.appendChild(mesSorteItem);
        }
      }
      
      // Adicionar Time do Coração se for Timemania
      const ehTimemania = config.temTimeCoracao === true;
      if (ehTimemania && selectedNumbers.length > 0) {
        const timeCoracaoSelect = document.getElementById('time-coracao');
        const timeSelecionado = timeCoracaoSelect ? timeCoracaoSelect.value : '';
        const timeTexto = timeCoracaoSelect && timeSelecionado ? timeCoracaoSelect.options[timeCoracaoSelect.selectedIndex].text : '';
        
        if (timeTexto) {
          // Separador entre números e time
          const separador = document.createElement('span');
          separador.className = 'separador-time-coracao';
          separador.textContent = '|';
          separador.style.color = '#00FF48';
          separador.style.fontSize = '2rem';
          separador.style.fontWeight = 'bold';
          separador.style.margin = '0 0.5rem';
          escolhidosLista.appendChild(separador);
          
          // Time do Coração
          const timeCoracaoItem = document.createElement('div');
          timeCoracaoItem.className = 'escolhido-time-coracao';
          timeCoracaoItem.textContent = `⚽ ${timeTexto}`;
          timeCoracaoItem.style.color = '#00FF48';
          timeCoracaoItem.style.fontWeight = 'bold';
          timeCoracaoItem.style.fontSize = '1.1rem';
          timeCoracaoItem.style.display = 'flex';
          timeCoracaoItem.style.alignItems = 'center';
          timeCoracaoItem.style.padding = '0.5rem 1rem';
          timeCoracaoItem.style.background = 'rgba(0, 255, 72, 0.1)';
          timeCoracaoItem.style.borderRadius = '0.5rem';
          escolhidosLista.appendChild(timeCoracaoItem);
        }
      }
      
      // Adicionar Trevos se for +Milionária
      const ehMaisMilionaria = config.temTrevos === true;
      if (ehMaisMilionaria && selectedNumbers.length > 0) {
        const trevosContainer = document.getElementById('trevos-container');
        const trevosSelecionados = trevosContainer ? Array.from(trevosContainer.querySelectorAll('.trevo-btn.selected')).map(btn => btn.dataset.trevo) : [];
        
        if (trevosSelecionados.length > 0) {
          // Separador entre números e trevos
          const separador = document.createElement('span');
          separador.className = 'separador-trevos';
          separador.textContent = '|';
          separador.style.color = '#16397F';
          separador.style.fontSize = '2rem';
          separador.style.fontWeight = 'bold';
          separador.style.margin = '0 0.5rem';
          escolhidosLista.appendChild(separador);
          
          // Trevos
          trevosSelecionados.forEach(trevo => {
            const trevoItem = document.createElement('div');
            trevoItem.className = 'escolhido-numero';
            trevoItem.textContent = trevo;
            escolhidosLista.appendChild(trevoItem);
          });
        }
      }
    }

    // Mostra botão de confirmação se houver números selecionados
    updateConfirmButton();
    
    // Esconde instruções quando começar a selecionar
    if (selectedButtons.length > 0 && window.esconderInstrucoes) {
      window.esconderInstrucoes();
    }
  }

  // Função para atualizar visibilidade do botão de confirmação
  function updateConfirmButton() {
    const selectedCount = container.querySelectorAll('button.selected').length;
    const config = window.getConfigAtual ? window.getConfigAtual() : {};
    const ehDuplaSena = config.doisSorteios === true;
    const ehMaisMilionaria = config.temTrevos === true;
    const MAX_SELECTIONS = getMaxSelections();
    let confirmBtn = document.getElementById('btn-confirmar-numeros');
    
    // Para Dupla Sena, só mostrar botão quando completar a segunda série
    if (ehDuplaSena) {
      if (duplaSenaPrimeiraSerie.length === 6 && selectedCount === 6 && !confirmBtn) {
        // Criar botão de confirmação
        confirmBtn = document.createElement('button');
        confirmBtn.id = 'btn-confirmar-numeros';
        confirmBtn.className = 'btn-confirmar';
        confirmBtn.textContent = 'Confirmar Sequência (2 Sorteios)';
        confirmBtn.addEventListener('click', confirmarSequencia);
        escolhidosLista.parentElement.appendChild(confirmBtn);
        
        // Scroll automático para o botão
        setTimeout(() => {
          confirmBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else if ((duplaSenaPrimeiraSerie.length !== 6 || selectedCount !== 6) && confirmBtn) {
        // Remover botão se não completou
        confirmBtn.remove();
      }
    } else if (ehMaisMilionaria) {
      // Para +Milionária, verificar se tem números E trevos selecionados
      const trevosContainer = document.getElementById('trevos-container');
      const trevosSelecionados = trevosContainer ? trevosContainer.querySelectorAll('.trevo-btn.selected').length : 0;
      const podeConfirmar = selectedCount >= MAX_SELECTIONS && trevosSelecionados === 2;
      
      if (podeConfirmar && !confirmBtn) {
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
      } else if (!podeConfirmar && confirmBtn) {
        // Remover botão se não completou números e trevos
        confirmBtn.remove();
      }
    } else {
      // Outras modalidades: comportamento normal
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
  }

  // Função para confirmar e guardar a sequência
  function confirmarSequencia() {
    const config = window.getConfigAtual ? window.getConfigAtual() : {};
    const ehDuplaSena = config.doisSorteios === true;
    const ehMaisMilionaria = config.temTrevos === true;
    
    console.log('confirmarSequencia chamada', { config, ehMaisMilionaria });
    
    let selectedNumbers;
    
    // Para Dupla Sena, combinar primeira série + segunda série
    if (ehDuplaSena && duplaSenaPrimeiraSerie.length === 6) {
      const segundaSerie = Array.from(container.querySelectorAll('button.selected'))
        .map(btn => btn.textContent)
        .sort((a, b) => parseInt(a) - parseInt(b));
      
      selectedNumbers = [...duplaSenaPrimeiraSerie, ...segundaSerie];
    } else {
      selectedNumbers = Array.from(container.querySelectorAll('button.selected'))
        .map(btn => btn.textContent)
        .sort((a, b) => parseInt(a) - parseInt(b));
    }
    
    console.log('Números selecionados:', selectedNumbers);

    // Para +Milionária, verificar se tem trevos selecionados
    if (ehMaisMilionaria) {
      const trevosContainer = document.getElementById('trevos-container');
      const trevosSelecionados = trevosContainer ? 
        Array.from(trevosContainer.querySelectorAll('.trevo-btn.selected')).map(btn => btn.dataset.trevo) : [];
      
      console.log('Trevos selecionados:', trevosSelecionados);
      console.log('Quantidade de trevos:', trevosSelecionados.length);
      
      // Removi a validação aqui porque ela impede a criação do preview
      // A validação será feita no backend
    }

    // Armazenar localmente
    sequenciasConfirmadas.push(selectedNumbers.map(n => parseInt(n)));
    
    console.log('sequenciasConfirmadas após push:', sequenciasConfirmadas);

    // Referência para os elementos fixos (label e contagem)
    const labelContagem = previewDiv.querySelector('.label-contagem');
    
    // Criar elemento para exibir a sequência salva
    const sequenciaItem = document.createElement('div');
    sequenciaItem.className = 'sequencia-item';
    sequenciaItem.dataset.numeros = JSON.stringify(selectedNumbers.map(n => parseInt(n)));
    
    // Criar display dos números
    const numerosDisplay = document.createElement('div');
    numerosDisplay.className = 'sequencia-numeros';
    
    const ehDiaDeSorte = config.temMesDaSorte === true;
    
    if (ehDuplaSena && selectedNumbers.length === 12) {
      // Primeiro grupo de 6 números
      for (let i = 0; i < 6; i++) {
        const numSpan = document.createElement('span');
        numSpan.className = 'numero-sequencia';
        numSpan.textContent = selectedNumbers[i];
        numerosDisplay.appendChild(numSpan);
      }
      
      // Separador entre os dois sorteios
      const separadorSorteios = document.createElement('span');
      separadorSorteios.className = 'separador-sorteios';
      separadorSorteios.textContent = '|';
      separadorSorteios.style.color = '#8B5CF6';
      separadorSorteios.style.fontSize = '2rem';
      separadorSorteios.style.fontWeight = 'bold';
      separadorSorteios.style.margin = '0 0.75rem';
      numerosDisplay.appendChild(separadorSorteios);
      
      // Segundo grupo de 6 números
      for (let i = 6; i < 12; i++) {
        const numSpan = document.createElement('span');
        numSpan.className = 'numero-sequencia';
        numSpan.textContent = selectedNumbers[i];
        numerosDisplay.appendChild(numSpan);
      }
    } else {
      // Outras modalidades: exibir normalmente
      selectedNumbers.forEach(num => {
        const numSpan = document.createElement('span');
        numSpan.className = 'numero-sequencia';
        numSpan.textContent = num;
        numerosDisplay.appendChild(numSpan);
      });
      
      // Adicionar Mês da Sorte se for Dia de Sorte
      if (ehDiaDeSorte) {
        const mesSorteSelect = document.getElementById('mes-sorte');
        const mesSelecionado = mesSorteSelect ? mesSorteSelect.value : '';
        const mesTexto = mesSorteSelect && mesSelecionado ? mesSorteSelect.options[mesSorteSelect.selectedIndex].text : '';
        
        if (mesTexto) {
          // Separador entre números e mês
          const separadorMes = document.createElement('span');
          separadorMes.className = 'separador-mes-sorte';
          separadorMes.textContent = '|';
          separadorMes.style.color = '#CB852B';
          separadorMes.style.fontSize = '2rem';
          separadorMes.style.fontWeight = 'bold';
          separadorMes.style.margin = '0 0.75rem';
          numerosDisplay.appendChild(separadorMes);
          
          // Mês da Sorte
          const mesSorteSpan = document.createElement('span');
          mesSorteSpan.className = 'mes-sorte-preview';
          mesSorteSpan.textContent = `🌟 ${mesTexto}`;
          mesSorteSpan.style.color = '#CB852B';
          mesSorteSpan.style.fontWeight = 'bold';
          mesSorteSpan.style.fontSize = '1rem';
          mesSorteSpan.style.padding = '0.5rem 1rem';
          mesSorteSpan.style.background = 'rgba(203, 133, 43, 0.15)';
          mesSorteSpan.style.borderRadius = '2rem';
          mesSorteSpan.style.whiteSpace = 'nowrap';
          numerosDisplay.appendChild(mesSorteSpan);
          
          // Armazenar o TEXTO do mês junto com a sequência (não o value)
          sequenciaItem.dataset.mesSorte = mesTexto;
        }
      }
      
      // Adicionar Time do Coração se for Timemania
      const ehTimemania = config.temTimeCoracao === true;
      if (ehTimemania) {
        const timeCoracaoSelect = document.getElementById('time-coracao');
        const timeSelecionado = timeCoracaoSelect ? timeCoracaoSelect.value : '';
        const timeTexto = timeCoracaoSelect && timeSelecionado ? timeCoracaoSelect.options[timeCoracaoSelect.selectedIndex].text : '';
        
        if (timeTexto) {
          // Separador entre números e time
          const separadorTime = document.createElement('span');
          separadorTime.className = 'separador-time-coracao';
          separadorTime.textContent = '|';
          separadorTime.style.color = '#00FF48';
          separadorTime.style.fontSize = '2rem';
          separadorTime.style.fontWeight = 'bold';
          separadorTime.style.margin = '0 0.75rem';
          numerosDisplay.appendChild(separadorTime);
          
          // Time do Coração
          const timeCoracaoSpan = document.createElement('span');
          timeCoracaoSpan.className = 'time-coracao-preview';
          timeCoracaoSpan.textContent = `⚽ ${timeTexto}`;
          timeCoracaoSpan.style.color = '#00FF48';
          timeCoracaoSpan.style.fontWeight = 'bold';
          timeCoracaoSpan.style.fontSize = '1rem';
          timeCoracaoSpan.style.padding = '0.5rem 1rem';
          timeCoracaoSpan.style.background = 'rgba(0, 255, 72, 0.15)';
          timeCoracaoSpan.style.borderRadius = '2rem';
          timeCoracaoSpan.style.whiteSpace = 'nowrap';
          numerosDisplay.appendChild(timeCoracaoSpan);
          
          // Armazenar o TEXTO do time junto com a sequência (não o value)
          sequenciaItem.dataset.timeCoracao = timeTexto;
        }
      }
      
      // Adicionar Trevos se for +Milionária
      const ehMaisMilionaria = config.temTrevos === true;
      if (ehMaisMilionaria) {
        const trevosContainer = document.getElementById('trevos-container');
        const trevosSelecionados = trevosContainer ? Array.from(trevosContainer.querySelectorAll('.trevo-btn.selected')).map(btn => btn.dataset.trevo) : [];
        
        if (trevosSelecionados.length > 0) {
          // Separador entre números e trevos
          const separadorTrevos = document.createElement('span');
          separadorTrevos.className = 'separador-trevos';
          separadorTrevos.textContent = '|';
          separadorTrevos.style.color = '#16397F';
          separadorTrevos.style.fontSize = '2rem';
          separadorTrevos.style.fontWeight = 'bold';
          separadorTrevos.style.margin = '0 0.75rem';
          numerosDisplay.appendChild(separadorTrevos);
          
          // Trevos
          trevosSelecionados.forEach(trevo => {
            const trevoSpan = document.createElement('span');
            trevoSpan.className = 'numero-sequencia';
            trevoSpan.textContent = trevo;
            numerosDisplay.appendChild(trevoSpan);
          });
          
          // Armazenar os trevos junto com a sequência
          sequenciaItem.dataset.trevos = JSON.stringify(trevosSelecionados);
        }
      }
    }

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
    
    console.log('Inserindo sequenciaItem no DOM', { previewDiv, labelContagem, sequenciaItem });
    console.log('sequenciaItem.dataset.trevos antes de inserir:', sequenciaItem.dataset.trevos);
    
    // Inserir antes dos elementos fixos
    if (labelContagem) {
      previewDiv.insertBefore(sequenciaItem, labelContagem);
    } else {
      previewDiv.appendChild(sequenciaItem);
    }
    
    console.log('Elemento inserido! Verificando quantos .sequencia-item existem:', previewDiv.querySelectorAll('.sequencia-item').length);
    
    atualizarContagem();

    // Limpar seleção e reiniciar
    container.querySelectorAll('button.selected').forEach(btn => {
      btn.classList.remove('selected');
    });
    container.querySelectorAll('button').forEach(b => b.disabled = false);
    
    // Limpar primeira série da Dupla Sena
    duplaSenaPrimeiraSerie = [];
    
    // Limpar trevos selecionados
    if (trevosContainer) {
      trevosContainer.querySelectorAll('.trevo-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
      });
      trevosContainer.querySelectorAll('.trevo-btn').forEach(btn => {
        btn.disabled = false;
      });
    }
    
    // Limpar lista de escolhidos
    escolhidosLista.innerHTML = '';
    updateConfirmButton();
  }

  // Função para registrar sequências no backend
  async function registrarSequenciasBackend() {

    btnRegistrar.disabled = true;
    btnRegistrar.textContent = '💾 Registrando...';

    try {
      // Obter modalidade atual
      const config = window.getConfigAtual ? window.getConfigAtual() : { modalidade: 'megasena' };
      const modalidadeAtual = config.modalidade || 'megasena';
      
      console.log('registrarSequenciasBackend - modalidade:', modalidadeAtual);
      console.log('registrarSequenciasBackend - sequenciasConfirmadas:', sequenciasConfirmadas);
      
      // Preparar sequências incluindo trevos para +Milionária
      const sequenciasParaEnviar = [];
      const ehMaisMilionaria = modalidadeAtual === 'maismilionaria';
      
      // Obter elementos do DOM para extrair dados extras
      const sequenciasItems = document.querySelectorAll('.meus-numeros-preview .sequencia-item');
      console.log('Itens de sequência encontrados:', sequenciasItems.length);
      
      sequenciasItems.forEach((item, index) => {
        const numerosSeq = sequenciasConfirmadas[index];
        
        if (!numerosSeq) return;
        
        const sequenciaData = { numeros: numerosSeq };
        
        // Para +Milionária, adicionar trevos
        if (ehMaisMilionaria) {
          const trevosStr = item.dataset.trevos;
          console.log(`Sequência ${index}:`, { numerosSeq, trevosStr });
          
          if (trevosStr) {
            try {
              const trevos = JSON.parse(trevosStr).map(t => parseInt(t));
              sequenciaData.numeros = [...numerosSeq, ...trevos];
              console.log(`Números completos com trevos:`, sequenciaData.numeros);
            } catch (e) {
              console.error('Erro ao processar trevos:', e);
            }
          }
        }
        
        // Para Dia de Sorte, adicionar mês da sorte
        if (modalidadeAtual === 'diadesorte' && item.dataset.mesSorte) {
          sequenciaData.mesDaSorte = item.dataset.mesSorte;
          console.log(`Mês da Sorte adicionado:`, sequenciaData.mesDaSorte);
        }
        
        // Para Timemania, adicionar time do coração
        if (modalidadeAtual === 'timemania' && item.dataset.timeCoracao) {
          sequenciaData.timeCoracao = item.dataset.timeCoracao;
          console.log(`Time do Coração adicionado:`, sequenciaData.timeCoracao);
        }
        
        sequenciasParaEnviar.push(sequenciaData);
      });
      
      console.log('sequenciasParaEnviar:', sequenciasParaEnviar);
      
      if (sequenciasParaEnviar.length === 0) {
        alert('❌ Nenhuma sequência válida encontrada. Por favor, crie pelo menos uma sequência.');
        btnRegistrar.disabled = false;
        btnRegistrar.textContent = '💾 Registrar Sequências';
        return;
      }
      
      const response = await fetch('/api/jogos/salvar-multiplas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sequencias: sequenciasParaEnviar,
          modalidade: modalidadeAtual
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
      console.log('Botão aleatório clicado!');
      
      // Gerar números aleatórios baseado na modalidade
      const config = window.getConfigAtual ? window.getConfigAtual() : { rangeInicio: 1, rangeFim: 60, numerosObrigatorios: 6 };
      const ehDuplaSena = config.doisSorteios === true;
      const qtdNumeros = parseInt(config.numerosObrigatorios) || 6;
      
      console.log('Config atual:', config);
      console.log('Quantidade de números a gerar:', qtdNumeros);
      console.log('Range:', config.rangeInicio, 'até', config.rangeFim);
      console.log('É Dupla Sena?', ehDuplaSena);
      
      if (ehDuplaSena) {
        // Para Dupla Sena: gerar 2 séries de 6 números independentes
        // Os números são únicos DENTRO de cada série, mas podem se repetir ENTRE séries
        // NÃO ordenar - manter ordem aleatória!
        
        // Função auxiliar para gerar uma série de 6 números únicos SEM ORDENAR
        const gerarSerieAleatoria = () => {
          const serie = [];
          const tentativasMax = 100;
          let tentativas = 0;
          
          while (serie.length < 6 && tentativas < tentativasMax) {
            const numero = Math.floor(Math.random() * (config.rangeFim - config.rangeInicio + 1)) + config.rangeInicio;
            if (!serie.includes(numero)) {
              serie.push(numero); // NÃO ordenar aqui
            }
            tentativas++;
          }
          
          return serie; // Retornar sem ordenar
        };
        
        // Gerar primeira série (embaralhada)
        duplaSenaPrimeiraSerie = gerarSerieAleatoria();
        
        // Gerar segunda série (INDEPENDENTE da primeira - pode repetir números, também embaralhada)
        const numerosSegundaSerie = gerarSerieAleatoria();
        
        console.log('🎲 Dupla Sena - Série 1 (embaralhada):', duplaSenaPrimeiraSerie);
        console.log('🎲 Dupla Sena - Série 2 (embaralhada):', numerosSegundaSerie);
        console.log('📊 Números repetidos entre séries:', 
          duplaSenaPrimeiraSerie.filter(n => numerosSegundaSerie.includes(n)));
        
        // Selecionar apenas a segunda série no grid
        selecionarNumeros(numerosSegundaSerie);
        
        // updateEscolhidos irá mostrar ambas as séries com separador
        updateEscolhidos();
      } else {
        // Outras modalidades: comportamento normal
        const numeros = new Set();
        let tentativas = 0;
        const maxTentativas = qtdNumeros * 10;
        
        while (numeros.size < qtdNumeros && tentativas < maxTentativas) {
          const numero = Math.floor(Math.random() * (config.rangeFim - config.rangeInicio + 1)) + config.rangeInicio;
          numeros.add(numero);
          tentativas++;
        }
        
        const numerosAleatorios = Array.from(numeros).sort((a, b) => a - b);
        
        console.log('Números gerados:', numerosAleatorios.length, numerosAleatorios);
        console.log('Tentativas necessárias:', tentativas);
        
        // Selecionar os números no grid
        selecionarNumeros(numerosAleatorios);
      }
      
      // Se for +Milionária, gerar 2 trevos aleatórios
      if (config.temTrevos) {
        const trevosContainer = document.getElementById('trevos-container');
        if (trevosContainer) {
          // Limpar seleção anterior de trevos
          trevosContainer.querySelectorAll('.trevo-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
          });
          
          // Gerar 2 trevos aleatórios (de 1 a 6)
          const trevosAleatorios = new Set();
          while (trevosAleatorios.size < 2) {
            trevosAleatorios.add(Math.floor(Math.random() * 6) + 1);
          }
          
          // Selecionar os trevos
          trevosContainer.querySelectorAll('.trevo-btn').forEach(btn => {
            if (trevosAleatorios.has(parseInt(btn.dataset.trevo))) {
              btn.classList.add('selected');
            }
          });
          
          console.log('Trevos gerados:', Array.from(trevosAleatorios));
        }
      }
      
      // Atualizar escolhidos para incluir trevos
      updateEscolhidos();
      
      // Feedback visual
      btnGerar.textContent = '✓ Gerado!';
      setTimeout(() => {
        btnGerar.textContent = '🎲 Aleatório';
      }, 500);
    });
  }

  // Event listener para os botões de número
  container.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (DEBUG_SELECT_NUMBERS) console.log('selectNumbers: click event', { target: e.target, closestBtn: btn });
    if (!btn) return;
    // ignorar se estiver desabilitado
    if (btn.disabled) {
      if (DEBUG_SELECT_NUMBERS) {
        // inspeciona qual elemento está realmente recebendo o clique no centro do botão
        try {
          const r = btn.getBoundingClientRect();
          const center = { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
          const elAtPoint = document.elementFromPoint(center.x, center.y);
          console.log('selectNumbers: button appears disabled; elementFromPoint at center:', center, elAtPoint);
          // log pointer-events up the tree
          let cur = elAtPoint;
          const ancestors = [];
          while (cur) { ancestors.push({ tag: cur.tagName, cls: cur.className, stylePointer: window.getComputedStyle(cur).pointerEvents }); cur = cur.parentElement; }
          console.log('selectNumbers: ancestors pointer-events chain:', ancestors);
        } catch (err) {
          console.warn('selectNumbers: debug elementFromPoint failed', err);
        }
      }
      return;
    }

    const isSelected = btn.classList.contains('selected');

    if (isSelected) {
      btn.classList.remove('selected');
    } else {
      const selectedCount = container.querySelectorAll('button.selected').length;
      const config = window.getConfigAtual ? window.getConfigAtual() : {};
      const ehDuplaSena = config.doisSorteios === true;
      
      // Para Dupla Sena, limitar a 6 na segunda série também
      let maxParaEstaSelecao = getMaxSelections();
      if (ehDuplaSena && duplaSenaPrimeiraSerie.length === 6) {
        maxParaEstaSelecao = 6; // Limitar segunda série a 6
      }
      
      if (selectedCount >= maxParaEstaSelecao) {
        // já atingiu o máximo, ignorar novo clique
        return;
      }
      btn.classList.add('selected');
    }

    // Atualiza estado dos demais botões
    const nowSelected = container.querySelectorAll('button.selected').length;
    const config = window.getConfigAtual ? window.getConfigAtual() : {};
    const ehDuplaSena = config.doisSorteios === true;
    
    let maxParaEstaSelecao = getMaxSelections();
    if (ehDuplaSena && duplaSenaPrimeiraSerie.length === 6) {
      maxParaEstaSelecao = 6; // Limitar segunda série a 6
    }
    
    if (nowSelected >= maxParaEstaSelecao) {
      container.querySelectorAll('button').forEach(b => {
        if (!b.classList.contains('selected')) b.disabled = true;
      });
    } else {
      container.querySelectorAll('button').forEach(b => b.disabled = false);
    }

    // Atualiza a lista de números escolhidos
    if (DEBUG_SELECT_NUMBERS) console.log('selectNumbers: updated selection count', container.querySelectorAll('button.selected').length);
    updateEscolhidos();
  });
  
  // Event listener para mudança no select do mês da sorte
  const mesSorteSelect = document.getElementById('mes-sorte');
  if (mesSorteSelect) {
    mesSorteSelect.addEventListener('change', function() {
      updateEscolhidos(); // Atualiza a lista quando o mês mudar
    });
  }
  
  // Event listener para mudança no select do time do coração
  const timeCoracaoSelect = document.getElementById('time-coracao');
  if (timeCoracaoSelect) {
    timeCoracaoSelect.addEventListener('change', function() {
      updateEscolhidos(); // Atualiza a lista quando o time mudar
    });
  }
}

// Inicializa de forma segura quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSelectNumbers);
} else {
  initSelectNumbers();
}
// Disponibiliza a função globalmente para ser chamada quando desejar
window.initSelectNumbers = initSelectNumbers;