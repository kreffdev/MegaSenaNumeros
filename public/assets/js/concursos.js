/**
 * Módulo: Dados dos Concursos
 * Carrega e exibe informações oficiais nos cards das modalidades
 */

let dadosConcursos = {};

// Carregar dados dos concursos
async function carregarDadosConcursos() {
  try {
    console.log('📊 Carregando dados dos concursos...');
    
    const response = await fetch('/api/loterias/concursos');
    const data = await response.json();
    
    if (data.sucesso && data.dados) {
      // Organizar por modalidade
      data.dados.forEach(concurso => {
        dadosConcursos[concurso.modalidade] = concurso;
      });
      
      console.log('✓ Dados carregados:', Object.keys(dadosConcursos).length, 'modalidades');
      atualizarCards();
    }
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
  }
}

// Atualizar cards com os dados
function atualizarCards() {
  document.querySelectorAll('.modalidade-card').forEach(card => {
    const modalidade = card.dataset.modalidade;
    const dados = dadosConcursos[modalidade];
    
    if (dados) {
      atualizarCard(card, dados);
    }
  });
}

// Atualizar card individual
function atualizarCard(card, dados) {
  // Verificar se já existe o container de info dinâmica
  let infoDinamica = card.querySelector('.modalidade-info-dinamica');
  
  if (!infoDinamica) {
    // Criar container
    infoDinamica = document.createElement('div');
    infoDinamica.className = 'modalidade-info-dinamica';
    
    // Inserir antes de modalidade-info
    const modalidadeInfo = card.querySelector('.modalidade-info');
    if (modalidadeInfo) {
      card.insertBefore(infoDinamica, modalidadeInfo);
    } else {
      card.appendChild(infoDinamica);
    }
  }
  
  // Próximo concurso = último + 1
  const proximoConcurso = dados.numeroConcurso + 1;
  
  // Formatar valor
  const valorFormatado = formatarValor(dados.valorEstimadoProximoConcurso);
  
  // Formatar números sorteados
  let numerosHTML = '';
  if (dados.numerossorteados.length > 0) {
    const totalNumeros = dados.numerossorteados.length;
    const mostrarAte = Math.min(6, totalNumeros);
    const numerosExibir = dados.numerossorteados.slice(0, mostrarAte);
    const temMais = totalNumeros > 6;
    
    numerosHTML = `
      <div class="ultimo-resultado">
        <span class="label-resultado">Último resultado (${totalNumeros} números):</span>
        <div class="numeros-sorteados">
          ${numerosExibir.map(n => `<span class="numero-mini">${n}</span>`).join('')}
          ${temMais ? '<span class="numero-mini mais" title="Clique para ver todos">...</span>' : ''}
        </div>
      </div>`;
  }
  
  // Atualizar conteúdo
  infoDinamica.innerHTML = `
    <div class="concurso-numero">Próximo: Concurso ${proximoConcurso}</div>
    ${valorFormatado ? `<div class="premio-valor">💰 ${valorFormatado}</div>` : ''}
    ${numerosHTML}
  `;
  
  // Adicionar event listener para abrir popup (apenas no botão ...)
  if (dados.numerossorteados.length > 6) {
    const btnMais = infoDinamica.querySelector('.numero-mini.mais');
    
    if (btnMais) {
      btnMais.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        abrirPopupNumeros(dados.modalidade, dados.numerossorteados, dados.numeroConcurso);
      });
    }
  }
}

// Abrir popup com todos os números
function abrirPopupNumeros(modalidade, numeros, concurso) {
  // Criar overlay
  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';
  
  // Criar popup
  const popup = document.createElement('div');
  popup.className = 'popup-numeros';
  
  // Nome da modalidade formatado
  const nomeFormatado = modalidade.charAt(0).toUpperCase() + modalidade.slice(1).replace(/([A-Z])/g, ' $1');
  
  popup.innerHTML = `
    <div class="popup-header">
      <h3>${nomeFormatado}</h3>
      <span class="popup-close">&times;</span>
    </div>
    <div class="popup-body">
      <p class="popup-concurso">Concurso ${concurso}</p>
      <div class="popup-numeros-grid">
        ${numeros.map(n => `<span class="numero-popup">${n}</span>`).join('')}
      </div>
    </div>
  `;
  
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  
  // Animar entrada
  setTimeout(() => {
    overlay.classList.add('active');
  }, 10);
  
  // Fechar ao clicar no X
  const btnClose = popup.querySelector('.popup-close');
  btnClose.addEventListener('click', () => fecharPopup(overlay));
  
  // Fechar ao clicar no overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      fecharPopup(overlay);
    }
  });
  
  // Fechar com ESC
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      fecharPopup(overlay);
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

// Fechar popup
function fecharPopup(overlay) {
  overlay.classList.remove('active');
  setTimeout(() => {
    overlay.remove();
  }, 300);
}

// Formatar valor monetário
function formatarValor(valor) {
  if (!valor || valor === 0) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', carregarDadosConcursos);
} else {
  carregarDadosConcursos();
}

// Atualizar a cada 5 minutos
setInterval(carregarDadosConcursos, 5 * 60 * 1000);

// Expor globalmente
window.carregarDadosConcursos = carregarDadosConcursos;
window.dadosConcursos = dadosConcursos;
