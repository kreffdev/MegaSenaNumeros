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
      if (data.dados.semJogosDisponiveis) {
        console.log('⚠️ Jogos ainda não disponíveis para o próximo concurso');
        mostrarMensagemSemJogos(data.dados);
        return;
      }
      
      jogosLoteca = data.dados.jogos || [];
      concursoAtual = data.dados.concurso;
      palpitesSelecionados = {};
      
      if (jogosLoteca.length === 0) {
        console.log('⚠️ Nenhum jogo encontrado');
        mostrarMensagemSemJogos(data.dados);
        return;
      }
      
      console.log(`✓ ${jogosLoteca.length} jogos carregados do concurso ${concursoAtual}`);
      
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
  const container = document.getElementById('loteca-jogos-lista');
  if (!container) return;
  
  container.innerHTML = `
    <div class="sem-jogos-loteca" style="
      text-align: center;
      padding: 3rem 2rem;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
      border-radius: 1rem;
      border: 2px dashed rgba(139, 92, 246, 0.3);
    ">
      <div class="sem-jogos-icon" style="font-size: 4rem; margin-bottom: 1rem;">📅</div>
      <h3 style="color: var(--text-light); margin-bottom: 1rem; font-size: 1.5rem;">Jogos Ainda Não Disponíveis</h3>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 1.1rem;">
        ${dados.mensagem || 'Os jogos do próximo concurso ainda não foram definidos pela Caixa.'}
      </p>
      ${dados.dataProximoConcurso ? `
        <p style="color: var(--accent-purple); margin-bottom: 1rem; font-size: 1.2rem;">
          <strong>Próximo Concurso ${dados.concurso}</strong><br>
          <span style="font-size: 0.9rem; color: var(--text-muted);">Previsão: ${dados.dataProximoConcurso}</span>
        </p>
      ` : ''}
      ${dados.valorEstimado ? `
        <p style="color: var(--accent-emerald); font-size: 1.3rem; margin-bottom: 2rem;">
          💰 Prêmio Estimado: R$ ${dados.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      ` : ''}
      <button class="btn-atualizar-loteca" onclick="carregarJogosLoteca()" style="
        background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
        color: white;
        border: none;
        padding: 0.8rem 2rem;
        border-radius: 0.5rem;
        font-size: 1rem;
        cursor: pointer;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        🔄 Atualizar
      </button>
    </div>
  `;
  
  // Ocultar barra de progresso e botões
  const progressContainer = document.querySelector('.loteca-progress');
  const botoesContainer = document.querySelector('.loteca-acoes');
  
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
