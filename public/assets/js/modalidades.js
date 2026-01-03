// Configurações de cada modalidade
const MODALIDADES_CONFIG = {
  megasena: {
    nome: 'Mega-Sena',
    minNumeros: 6,
    maxNumeros: 15,
    rangeInicio: 1,
    rangeFim: 60,
    numerosObrigatorios: 6,
    cor: '#209869'
  },
  lotofacil: {
    nome: 'Lotofácil',
    minNumeros: 15,
    maxNumeros: 20,
    rangeInicio: 1,
    rangeFim: 25,
    numerosObrigatorios: 15,
    cor: '#930089'
  },
  quina: {
    nome: 'Quina',
    minNumeros: 5,
    maxNumeros: 15,
    rangeInicio: 1,
    rangeFim: 80,
    numerosObrigatorios: 5,
    cor: '#260085'
  },
  lotomania: {
    nome: 'Lotomania',
    minNumeros: 50,
    maxNumeros: 50,
    rangeInicio: 0,
    rangeFim: 99,
    numerosObrigatorios: 50,
    cor: '#F78100'
  },
  duplasena: {
    nome: 'Dupla Sena',
    minNumeros: 6,
    maxNumeros: 15,
    rangeInicio: 1,
    rangeFim: 50,
    numerosObrigatorios: 12, // 2 sorteios de 6 números cada
    cor: '#A61324',
    doisSorteios: true
  },
  diadesorte: {
    nome: 'Dia de Sorte',
    minNumeros: 7,
    maxNumeros: 15,
    rangeInicio: 1,
    rangeFim: 31,
    numerosObrigatorios: 7,
    cor: '#CB852B',
    temMesDaSorte: true
  },
  timemania: {
    nome: 'Timemania',
    minNumeros: 10,
    maxNumeros: 10,
    rangeInicio: 1,
    rangeFim: 80,
    numerosObrigatorios: 10,
    cor: '#00FF48',
    temTimeCoracao: true
  },
  maismilionaria: {
    nome: '+Milionária',
    minNumeros: 6,
    maxNumeros: 12,
    rangeInicio: 1,
    rangeFim: 50,
    numerosObrigatorios: 6,
    cor: '#16397F',
    temTrevos: true,
    trevosQtd: 2,
    trevosRange: { inicio: 1, fim: 6 }
  },
  supersete: {
    nome: 'Super Sete',
    minNumeros: 7,
    maxNumeros: 21,
    rangeInicio: 0,
    rangeFim: 9,
    numerosObrigatorios: 7,
    cor: '#A8CF45',
    seteColunas: true
  },
  loteca: {
    nome: 'Loteca',
    tipo: 'especial',
    cor: '#E30613',
    jogosQtd: 14
  }
};

// Modalidade atual
let modalidadeAtual = 'megasena';
let instrucoesVisiveis = false;

// Função para alternar modalidade
function trocarModalidade(novaModalidade) {
  console.log('🔄 trocarModalidade chamada:', novaModalidade);
  
  if (!MODALIDADES_CONFIG[novaModalidade]) {
    console.error('Modalidade não encontrada:', novaModalidade);
    return;
  }

  const modalidadeAnterior = modalidadeAtual;
  modalidadeAtual = novaModalidade;
  const config = MODALIDADES_CONFIG[novaModalidade];
  
  console.log('✓ Config encontrada:', config);

  // Atualizar cards visuais
  document.querySelectorAll('.modalidade-card').forEach(card => {
    card.classList.remove('active');
    if (card.dataset.modalidade === novaModalidade) {
      card.classList.add('active');
    }
  });

  // Adicionar atributo data-modalidade-ativa no body para CSS dinâmico
  document.body.setAttribute('data-modalidade-ativa', novaModalidade);

  // Atualizar instruções
  document.querySelectorAll('.instrucao').forEach(instrucao => {
    instrucao.classList.remove('active');
    if (instrucao.dataset.instrucao === novaModalidade) {
      instrucao.classList.add('active');
    }
  });

  // Se clicar na mesma modalidade, toggle instruções
  if (modalidadeAnterior === novaModalidade) {
    toggleInstrucoes();
  } else {
    // Se mudar de modalidade, mostrar instruções
    mostrarInstrucoes();
  }

  // Atualizar título do criador
  const headerTitulo = document.querySelector('.header-criador h2');
  if (headerTitulo) {
    headerTitulo.textContent = `Escolha seus números - ${config.nome}`;
  }

  // Mostrar/ocultar seletor de mês da sorte
  const mesSorteContainer = document.getElementById('mes-sorte-container');
  if (mesSorteContainer) {
    if (config.temMesDaSorte) {
      mesSorteContainer.style.display = 'flex';
    } else {
      mesSorteContainer.style.display = 'none';
    }
  }

  // Mostrar/ocultar seletor de time do coração
  const timeCoracaoContainer = document.getElementById('time-coracao-container');
  if (timeCoracaoContainer) {
    if (config.temTimeCoracao) {
      timeCoracaoContainer.style.display = 'flex';
    } else {
      timeCoracaoContainer.style.display = 'none';
    }
  }

  // Mostrar/ocultar seletor de trevos
  const trevosContainer = document.getElementById('trevos-container');
  if (trevosContainer) {
    if (config.temTrevos) {
      trevosContainer.style.display = 'block';
    } else {
      trevosContainer.style.display = 'none';
    }
  }

  // Mostrar/ocultar interface da Loteca
  const lotecaContainer = document.getElementById('loteca-container');
  const numerosContainer = document.querySelector('.numeros-criador');
  const headerCriador = document.querySelector('.header-criador');
  
  if (config.tipo === 'especial' && novaModalidade === 'loteca') {
    // Esconder criador de números padrão
    if (numerosContainer) {
      const ul = numerosContainer.querySelector('ul');
      if (ul) ul.style.display = 'none';
    }
    if (headerCriador) headerCriador.style.display = 'none';
    
    // Mostrar interface da Loteca
    if (lotecaContainer) {
      lotecaContainer.style.display = 'block';
      // Carregar jogos da Loteca
      console.log('Carregando jogos da Loteca...');
      setTimeout(() => {
        if (window.carregarJogosLoteca) {
          window.carregarJogosLoteca();
        } else {
          console.error('Função carregarJogosLoteca não encontrada');
        }
      }, 100);
    } else {
      console.error('Container loteca-container não encontrado');
    }
  } else {
    // Mostrar criador de números padrão
    if (numerosContainer) {
      const ul = numerosContainer.querySelector('ul');
      if (ul) ul.style.display = 'grid';
    }
    if (headerCriador) headerCriador.style.display = 'flex';
    
    // Esconder interface da Loteca
    if (lotecaContainer) lotecaContainer.style.display = 'none';
    
    // Reconstruir grid de números para outras modalidades
    if (config.rangeInicio !== undefined && config.rangeFim !== undefined) {
      reconstruirGridNumeros(config);
    }
  }

  // Limpar seleções anteriores
  limparSelecoes();

  // Scroll suave até o main-container
  const mainContainer = document.querySelector('.main-container');
  if (mainContainer) {
    setTimeout(() => {
      mainContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    }, 100);
  }

  console.log(`Modalidade alterada para: ${config.nome}`);
}

// Função para reconstruir o grid de números baseado na modalidade
function reconstruirGridNumeros(config) {
  const container = document.querySelector('.numeros-criador ul');
  if (!container) {
    console.warn('Container de números não encontrado');
    return;
  }

  console.log(`Reconstruindo grid para ${config.nome}`);

  // Limpar container
  container.innerHTML = '';

  // Gerar botões de números
  for (let i = config.rangeInicio; i <= config.rangeFim; i++) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.textContent = i;
    li.appendChild(button);
    container.appendChild(li);
  }

  // Ajustar layout baseado no tamanho
  const totalNumeros = config.rangeFim - config.rangeInicio + 1;
  if (totalNumeros === 25) {
    // Lotofácil - 5x5
    container.style.gridTemplateColumns = 'repeat(5, 1fr)';
  } else if (totalNumeros === 31) {
    // Dia de Sorte - layout otimizado
    container.style.gridTemplateColumns = 'repeat(7, 1fr)';
  } else if (totalNumeros === 100) {
    // Lotomania - 10x10
    container.style.gridTemplateColumns = 'repeat(10, 1fr)';
  } else if (totalNumeros === 80) {
    // Quina - 10x8
    container.style.gridTemplateColumns = 'repeat(10, 1fr)';
  } else {
    // Padrão (Mega-Sena, Dupla Sena, etc) - 10 colunas
    container.style.gridTemplateColumns = 'repeat(10, 1fr)';
  }
}

// Função para mostrar instruções
function mostrarInstrucoes() {
  const instrucoesContainer = document.querySelector('.modalidade-instrucoes');
  if (instrucoesContainer) {
    instrucoesContainer.classList.add('show');
    instrucoesVisiveis = true;
  }
}

// Função para esconder instruções
function esconderInstrucoes() {
  const instrucoesContainer = document.querySelector('.modalidade-instrucoes');
  if (instrucoesContainer) {
    instrucoesContainer.classList.remove('show');
    instrucoesVisiveis = false;
  }
}

// Função para toggle instruções
function toggleInstrucoes() {
  if (instrucoesVisiveis) {
    esconderInstrucoes();
  } else {
    mostrarInstrucoes();
  }
}

// Função para limpar seleções
function limparSelecoes() {
  const container = document.querySelector('.numeros-criador ul');
  const escolhidosLista = document.querySelector('.escolhidos-lista');
  const previewDiv = document.querySelector('.meus-numeros-preview');

  // Limpar botões selecionados
  if (container) {
    container.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('selected');
      btn.disabled = false;
    });
  }

  // Limpar lista de escolhidos
  if (escolhidosLista) {
    escolhidosLista.innerHTML = '';
  }

  // Limpar sequências confirmadas
  if (previewDiv) {
    previewDiv.querySelectorAll('.sequencia-item').forEach(item => item.remove());
  }

  // Remover botão de confirmação se existir
  const confirmBtn = document.getElementById('btn-confirmar-numeros');
  if (confirmBtn) {
    confirmBtn.remove();
  }

  // Esconder botão de registrar
  const btnRegistrar = document.getElementById('btn-registrar-sequencias');
  if (btnRegistrar) {
    btnRegistrar.style.display = 'none';
  }
}

// Função para obter a configuração atual
function getConfigAtual() {
  return {
    ...MODALIDADES_CONFIG[modalidadeAtual],
    modalidade: modalidadeAtual
  };
}

// Inicialização
function initModalidades() {
  // Esconder instruções inicialmente
  esconderInstrucoes();
  
  // Adicionar event listeners nos cards
  document.querySelectorAll('.modalidade-card').forEach(card => {
    card.addEventListener('click', function() {
      const modalidade = this.dataset.modalidade;
      trocarModalidade(modalidade);
    });
  });

  // Iniciar com Mega-Sena mas sem mostrar instruções
  const primeiraModalidade = document.querySelector('.modalidade-card.active');
  if (primeiraModalidade) {
    modalidadeAtual = primeiraModalidade.dataset.modalidade;
    // Definir modalidade inicial no body
    document.body.setAttribute('data-modalidade-ativa', modalidadeAtual);
  }
  
  console.log('Sistema de modalidades inicializado');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModalidades);
} else {
  initModalidades();
}

// Exportar funções globalmente
window.getConfigAtual = getConfigAtual;
window.trocarModalidade = trocarModalidade;
window.mostrarInstrucoes = mostrarInstrucoes;
window.esconderInstrucoes = esconderInstrucoes;
window.MODALIDADES_CONFIG = MODALIDADES_CONFIG;
