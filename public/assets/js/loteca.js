/**
 * Módulo: Loteca
 * Gerencia a interface de palpites da Loteca
 */

let jogosLoteca = [];
let concursoAtual = null;
let palpitesSelecionados = {};

// Carregar jogos da API
async function carregarJogosLoteca() {
  try {
    console.log('🔄 Carregando jogos da Loteca...');
    console.log('📍 URL:', '/api/loteca/jogos');
    
    const response = await fetch('/api/loteca/jogos');
    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Data recebida:', data);
    
    if (data.sucesso) {
      // Verificar se há jogos disponíveis
      if (data.dados.semJogosDisponiveis || !data.dados.jogos || data.dados.jogos.length === 0) {
        console.log('⚠️ Jogos ainda não disponíveis');
        mostrarMensagemSemJogos(data.dados);
        return;
      }
      
      jogosLoteca = data.dados.jogos || [];
      concursoAtual = data.dados.concurso;
      palpitesSelecionados = {};
      
      console.log(`✓ ${jogosLoteca.length} jogos carregados do concurso ${concursoAtual}`);
      
      // Ocultar aviso e mostrar jogos
      const avisoElement = document.getElementById('loteca-sem-jogos');
      const jogosListaElement = document.getElementById('loteca-jogos-lista');
      const progressoElement = document.querySelector('.loteca-progresso');
      const acoesElement = document.querySelector('.loteca-acoes');
      
      if (avisoElement) avisoElement.style.display = 'none';
      if (jogosListaElement) jogosListaElement.style.display = 'grid';
      if (progressoElement) progressoElement.style.display = 'block';
      if (acoesElement) acoesElement.style.display = 'flex';
      
      renderizarJogos();
      atualizarInfoConcurso(data.dados);
    } else {
      console.error('❌ Erro ao carregar jogos:', data.mensagem);
      mostrarErro('Não foi possível carregar os jogos da Loteca');
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    mostrarErro('Erro ao conectar com o servidor');
  }
}

// Mostrar mensagem quando não há jogos disponíveis
function mostrarMensagemSemJogos(dados) {
  const avisoElement = document.getElementById('loteca-sem-jogos');
  const jogosListaElement = document.getElementById('loteca-jogos-lista');
  const progressoElement = document.querySelector('.loteca-progresso');
  const acoesElement = document.querySelector('.loteca-acoes');
  
  // Ocultar lista de jogos, progresso e ações
  if (jogosListaElement) jogosListaElement.style.display = 'none';
  if (progressoElement) progressoElement.style.display = 'none';
  if (acoesElement) acoesElement.style.display = 'none';
  
  // Mostrar aviso
  if (avisoElement) {
    avisoElement.style.display = 'block';
    
    // Atualizar textos do aviso
    const tituloElement = document.getElementById('loteca-aviso-titulo');
    const mensagemElement = document.getElementById('loteca-aviso-mensagem');
    
    if (tituloElement) {
      tituloElement.textContent = dados.semJogosDisponiveis ? 
        'Jogos Ainda Não Disponíveis' : 
        'Nenhum Jogo Encontrado';
    }
    
    if (mensagemElement) {
      let mensagem = dados.mensagem || 'Os jogos do próximo concurso ainda não foram divulgados pela Caixa. Por favor, tente novamente mais tarde.';
      
      if (dados.dataProximoConcurso) {
        mensagem += `<br><br><strong>📅 Próximo Concurso ${dados.concurso || ''}</strong><br>Previsão: ${dados.dataProximoConcurso}`;
      }
      
      if (dados.valorEstimado) {
        mensagem += `<br><br><strong>💰 Prêmio Estimado:</strong> R$ ${dados.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      }
      
      mensagemElement.innerHTML = mensagem;
    }
  }
  
  // Atualizar info do concurso
  const concursoNumeroElement = document.getElementById('loteca-concurso-numero');
  const rodadaElement = document.getElementById('loteca-rodada');
  
  if (concursoNumeroElement) {
    concursoNumeroElement.textContent = dados.concurso || '-';
  }
  
  if (rodadaElement) {
    rodadaElement.textContent = dados.rodada || 'Aguardando Divulgação';
  }
}

// Função para atualizar a Loteca manualmente
function atualizarLoteca() {
  carregarJogosLoteca();
}
  
  if (progressContainer) progressContainer.style.display = 'none';
  if (botoesContainer) botoesContainer.style.display = 'none';
}

// Renderizar jogos na interface
function renderizarJogos() {
  const container = document.getElementById('loteca-jogos-lista');
  console.log('🎨 Renderizando jogos...');
  console.log('📍 Container encontrado:', !!container);
  console.log('📊 Jogos para renderizar:', jogosLoteca.length);
  
  if (!container) {
    console.error('❌ Container loteca-jogos-lista não encontrado!');
    return;
  }
  
  container.innerHTML = '';
  
  jogosLoteca.forEach(jogo => {
    const jogoDiv = document.createElement('div');
    jogoDiv.className = 'loteca-jogo-item';
    jogoDiv.dataset.numeroJogo = jogo.numeroJogo;
    
    jogoDiv.innerHTML = `
      <div class="loteca-jogo-numero">${jogo.numeroJogo}</div>
      <div class="loteca-jogo-times">
        <span class="time-casa">${jogo.timeCasa}</span>
        <span class="vs">×</span>
        <span class="time-visitante">${jogo.timeVisitante}</span>
      </div>
      <div class="loteca-jogo-opcoes">
        <button class="loteca-opcao" data-opcao="1" title="Vitória ${jogo.timeCasa}">
          <span class="opcao-label">1</span>
        </button>
        <button class="loteca-opcao" data-opcao="X" title="Empate">
          <span class="opcao-label">X</span>
        </button>
        <button class="loteca-opcao" data-opcao="2" title="Vitória ${jogo.timeVisitante}">
          <span class="opcao-label">2</span>
        </button>
      </div>
    `;
    
    // Adicionar event listeners nos botões
    const botoes = jogoDiv.querySelectorAll('.loteca-opcao');
    botoes.forEach(btn => {
      btn.addEventListener('click', () => {
        selecionarPalpite(jogo.numeroJogo, btn.dataset.opcao, jogoDiv);
      });
    });
    
    container.appendChild(jogoDiv);
  });
  
  atualizarProgresso();
}

// Selecionar palpite
function selecionarPalpite(numeroJogo, opcao, jogoDiv) {
  // Remover seleção anterior deste jogo
  jogoDiv.querySelectorAll('.loteca-opcao').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Adicionar nova seleção
  const botaoSelecionado = jogoDiv.querySelector(`[data-opcao="${opcao}"]`);
  botaoSelecionado.classList.add('selected');
  
  // Armazenar palpite
  palpitesSelecionados[numeroJogo] = opcao;
  
  // Atualizar progresso
  atualizarProgresso();
  
  // Verificar se todos os palpites foram feitos
  if (Object.keys(palpitesSelecionados).length === 14) {
    habilitarBotaoConfirmar();
  }
}

// Atualizar informações do concurso
function atualizarInfoConcurso(dados) {
  const concursoEl = document.getElementById('loteca-concurso-numero');
  const rodadaEl = document.getElementById('loteca-rodada');
  const dataEl = document.getElementById('loteca-data-atualizacao');
  
  if (concursoEl) concursoEl.textContent = dados.concurso;
  if (rodadaEl) rodadaEl.textContent = dados.rodada;
  if (dataEl) {
    const data = new Date(dados.dataAtualizacao);
    dataEl.textContent = `Atualizado em ${data.toLocaleDateString()} às ${data.toLocaleTimeString()}`;
  }
}

// Atualizar barra de progresso
function atualizarProgresso() {
  const total = 14;
  const selecionados = Object.keys(palpitesSelecionados).length;
  const percentual = (selecionados / total) * 100;
  
  const progressoBar = document.querySelector('.loteca-progresso-bar');
  const progressoTexto = document.querySelector('.loteca-progresso-texto');
  
  if (progressoBar) {
    progressoBar.style.width = `${percentual}%`;
  }
  
  if (progressoTexto) {
    progressoTexto.textContent = `${selecionados} de ${total} jogos`;
  }
}

// Habilitar botão de confirmar
function habilitarBotaoConfirmar() {
  const btnConfirmar = document.getElementById('btn-confirmar-loteca');
  if (btnConfirmar) {
    btnConfirmar.disabled = false;
    btnConfirmar.classList.add('enabled');
  }
}

// Gerar palpites aleatórios
function gerarPalpitesAleatorios() {
  palpitesSelecionados = {};
  
  const opcoes = ['1', 'X', '2'];
  
  jogosLoteca.forEach(jogo => {
    const opcaoAleatoria = opcoes[Math.floor(Math.random() * 3)];
    palpitesSelecionados[jogo.numeroJogo] = opcaoAleatoria;
    
    // Atualizar visualmente
    const jogoDiv = document.querySelector(`[data-numero-jogo="${jogo.numeroJogo}"]`);
    if (jogoDiv) {
      jogoDiv.querySelectorAll('.loteca-opcao').forEach(btn => {
        btn.classList.remove('selected');
      });
      
      const botaoSelecionado = jogoDiv.querySelector(`[data-opcao="${opcaoAleatoria}"]`);
      if (botaoSelecionado) {
        botaoSelecionado.classList.add('selected');
      }
    }
  });
  
  atualizarProgresso();
  habilitarBotaoConfirmar();
}

// Confirmar palpites
async function confirmarPalpitesLoteca() {
  if (Object.keys(palpitesSelecionados).length !== 14) {
    alert('❌ Você precisa fazer palpites para todos os 14 jogos!');
    return;
  }
  
  // Ordenar palpites por número do jogo
  const palpitesOrdenados = [];
  for (let i = 1; i <= 14; i++) {
    palpitesOrdenados.push(palpitesSelecionados[i]);
  }
  
  try {
    const btnConfirmar = document.getElementById('btn-confirmar-loteca');
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = '💾 Salvando...';
    
    const response = await fetch('/api/loteca/salvar-palpites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        concurso: concursoAtual,
        palpites: palpitesOrdenados
      })
    });
    
    const data = await response.json();
    
    if (data.sucesso) {
      alert('✓ Palpites salvos com sucesso!');
      limparPalpites();
    } else {
      alert(`❌ ${data.mensagem}`);
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = '✓ Confirmar Palpites';
    }
  } catch (error) {
    console.error('Erro ao salvar palpites:', error);
    alert('❌ Erro ao salvar palpites');
    const btnConfirmar = document.getElementById('btn-confirmar-loteca');
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = '✓ Confirmar Palpites';
  }
}

// Limpar palpites
function limparPalpites() {
  palpitesSelecionados = {};
  
  document.querySelectorAll('.loteca-opcao').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  atualizarProgresso();
  
  const btnConfirmar = document.getElementById('btn-confirmar-loteca');
  if (btnConfirmar) {
    btnConfirmar.disabled = true;
    btnConfirmar.classList.remove('enabled');
    btnConfirmar.textContent = '✓ Confirmar Palpites';
  }
}

// Mostrar erro
function mostrarErro(mensagem) {
  const container = document.getElementById('loteca-jogos-lista');
  if (container) {
    container.innerHTML = `
      <div class="loteca-erro">
        <span>❌</span>
        <p>${mensagem}</p>
        <button onclick="carregarJogosLoteca()" class="btn-recarregar">🔄 Tentar Novamente</button>
      </div>
    `;
  }
}

// Expor funções globalmente
window.carregarJogosLoteca = carregarJogosLoteca;
window.gerarPalpitesAleatorios = gerarPalpitesAleatorios;
window.confirmarPalpitesLoteca = confirmarPalpitesLoteca;
window.limparPalpites = limparPalpites;

// Log de inicialização
console.log('✅ Módulo Loteca carregado');
console.log('📋 Funções disponíveis:', {
  carregarJogosLoteca: typeof window.carregarJogosLoteca,
  gerarPalpitesAleatorios: typeof window.gerarPalpitesAleatorios,
  confirmarPalpitesLoteca: typeof window.confirmarPalpitesLoteca,
  limparPalpites: typeof window.limparPalpites
});
