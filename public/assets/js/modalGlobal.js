// Menu Hamburger Toggle da nav para versoes mobile e tablet
const hamburgerBtn = document.getElementById("hamburger-btn");
const navMenu = document.getElementById("nav-menu");

if (hamburgerBtn && navMenu) {
  hamburgerBtn.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("active");
    hamburgerBtn.classList.toggle("active");
    hamburgerBtn.setAttribute("aria-expanded", isOpen);
  });

  // Fechar menu ao clicar em um link
  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    });
  });

  // Fechar menu ao clicar fora
  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      navMenu.classList.remove("active");
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    }
  });
}

// modal para mostrar a box de usuario logado da nav
// User dropdown (nav)
function toggleUserBox() {
  const navUserBtn = document.getElementById("nav-user-btn");
  const userBox = document.getElementById("user-box");

  if (navUserBtn && userBox) {
    navUserBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = userBox.hasAttribute('hidden');
      if (isHidden) {
        // OPEN: make visible then add class on next frame to trigger transition
        userBox.removeAttribute('hidden');
        requestAnimationFrame(() => userBox.classList.add('open'));
        navUserBtn.setAttribute('aria-expanded', 'true');
      } else {
        // CLOSE: remove class to start transition, then hide after transition
        userBox.classList.remove('open');
        navUserBtn.setAttribute('aria-expanded', 'false');
        const onEnd = (ev) => {
          if (ev.target === userBox) {
            userBox.setAttribute('hidden', '');
            userBox.removeEventListener('transitionend', onEnd);
          }
        };
        userBox.addEventListener('transitionend', onEnd);
      }
    });

    // close user box when clicking outside
    document.addEventListener("click", (e) => {
      if (!userBox.contains(e.target) && !navUserBtn.contains(e.target)) {
        if (!userBox.hasAttribute("hidden")) {
          userBox.classList.remove('open');
          navUserBtn.setAttribute('aria-expanded', 'false');
          const onEnd = (ev) => {
            if (ev.target === userBox) {
              userBox.setAttribute('hidden', '');
              userBox.removeEventListener('transitionend', onEnd);
            }
          };
          userBox.addEventListener('transitionend', onEnd);
        }
      }
    });
  }
}
toggleUserBox();



// function  para mostrar os itens de jogos na nav
function toggleGamesMenu() {
// Jogos dropdown (nav)
const gamesToggle = document.getElementById('games-toggle');
const gamesMenu = document.getElementById('games-menu');

if (gamesToggle && gamesMenu) {
  gamesToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = gamesMenu.hasAttribute('hidden');
    if (isHidden) {
      // OPEN
      gamesMenu.removeAttribute('hidden');
      // add visual state to button as well
      gamesToggle.classList.add('open');
      // ensure any previous closing state is cleared
      gamesToggle.classList.remove('closing');
      requestAnimationFrame(() => gamesMenu.classList.add('open'));
      gamesToggle.setAttribute('aria-expanded', 'true');
    } else {
      // CLOSE
      // start close sequence: remove menu open, start caret close animation
      gamesMenu.classList.remove('open');
      gamesToggle.classList.remove('open');
      gamesToggle.classList.add('closing');
      gamesToggle.setAttribute('aria-expanded', 'false');

      // when caret close animation ends, remove 'closing' class
      const caret = gamesToggle.querySelector('.caret-svg');
      if (caret) {
        const onAnim = (ev) => {
          if (ev.animationName && ev.animationName.indexOf('caret-close') !== -1) {
            gamesToggle.classList.remove('closing');
            caret.removeEventListener('animationend', onAnim);
          }
        };
        caret.addEventListener('animationend', onAnim);
      }

      // hide menu after its transition ends as before
      const onEnd = (ev) => {
        if (ev.target === gamesMenu) {
          gamesMenu.setAttribute('hidden', '');
          gamesMenu.removeEventListener('transitionend', onEnd);
        }
      };
      gamesMenu.addEventListener('transitionend', onEnd);
    }
  });

  document.addEventListener('click', (e) => {
    if (!gamesMenu.contains(e.target) && !gamesToggle.contains(e.target)) {
      if (!gamesMenu.hasAttribute('hidden')) {
      gamesMenu.classList.remove('open');
      gamesToggle.classList.remove('open');
      gamesToggle.classList.add('closing');
      gamesToggle.setAttribute('aria-expanded', 'false');

        const caret = gamesToggle.querySelector('.caret-svg');
        if (caret) {
          const onAnim = (ev) => {
            if (ev.animationName && ev.animationName.indexOf('caret-close') !== -1) {
              gamesToggle.classList.remove('closing');
              caret.removeEventListener('animationend', onAnim);
            }
          };
          caret.addEventListener('animationend', onAnim);
        }

        const onEnd = (ev) => {
          if (ev.target === gamesMenu) {
            gamesMenu.setAttribute('hidden', '');
            gamesMenu.removeEventListener('transitionend', onEnd);
          }
        };
        gamesMenu.addEventListener('transitionend', onEnd);
      }
    }
  });
}

}
toggleGamesMenu();

function mostraNumerosPopup() {
  // Delegated handler for any "..." number previews (class: .numero-mini.mais)
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.numero-mini.mais');
    if (!target) return;

    // If an overlay already exists, don't open another
    if (document.querySelector('.popup-overlay')) return;

    // If the element has an inline onclick (page-specific handler), skip to avoid double handling
    if (target.getAttribute && target.getAttribute('onclick')) return;

    e.preventDefault();
    e.stopPropagation();

    // Try to find the nearest container that holds the numbers
    const container = target.closest('.numeros-sorteados') || target.closest('.jogo-numeros') || target.closest('.jogo-previsao') || target.closest('.jogo-card') || target.closest('.modalidade-card') || document.body;

    // Collect visible number elements (exclude the "mais" trigger)
    const numeroEls = Array.from(container.querySelectorAll('.numero-mini')).filter(n => !n.classList.contains('mais'));
    const numeros = numeroEls.map(n => n.textContent.trim()).filter(Boolean);

    // Collect badges (trevos, mes, time) if present
    const trevos = Array.from(container.querySelectorAll('.trevo-badge, .numero-badge.trevo-badge')).map(el => el.textContent.trim()).filter(Boolean);
    const mesEl = container.querySelector('.mes-sorte-badge');
    const timeEl = container.querySelector('.time-coracao-badge');
    const mesDaSorte = mesEl ? mesEl.textContent.trim() : null;
    const timeCoracao = timeEl ? timeEl.textContent.trim() : null;

    // Determine modalidade/title
    let modalidade = null;
    const jogoCard = target.closest('.jogo-card');
    const modalidadeCard = target.closest('.modalidade-card');
    if (jogoCard && jogoCard.dataset && jogoCard.dataset.modalidade) modalidade = jogoCard.dataset.modalidade;
    else if (modalidadeCard && modalidadeCard.dataset && modalidadeCard.dataset.modalidade) modalidade = modalidadeCard.dataset.modalidade;
    else {
      // try to read a nearby modalidade name
      const nomeEl = container.querySelector('.jogo-modalidade-nome, .jogo-modalidade-nome, .modalidade-nome');
      if (nomeEl) modalidade = nomeEl.textContent.trim();
    }
    if (!modalidade) modalidade = 'Números';

    // Build overlay + popup
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const popup = document.createElement('div');
    popup.className = 'popup-numeros';

    const numerosHTML = numeros.map(n => `<span class="numero-popup">${String(n).padStart(2, '0')}</span>`).join('');

    let extrasHTML = '';
    if (trevos.length > 0) {
      extrasHTML += '<p class="popup-extras-title">🍀 Trevos da Sorte</p>';
      extrasHTML += '<div class="popup-numeros-grid">' + trevos.map(t => `<span class="numero-popup">${t}</span>`).join('') + '</div>';
    }
    if (mesDaSorte) {
      extrasHTML += `<p class="popup-mes">📅 ${mesDaSorte}</p>`;
    }
    if (timeCoracao) {
      extrasHTML += `<p class="popup-time">⚽ ${timeCoracao}</p>`;
    }

    popup.innerHTML = `
      <div class="popup-header">
        <h3>${modalidade}</h3>
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

    // show with animation class
    setTimeout(() => overlay.classList.add('active'), 10);

    console.log('🔍 Popup criada, procurando botões...');
    console.log('   HTML do header:', popup.querySelector('.popup-header').innerHTML);

    const btnClose = popup.querySelector('.popup-close');
    if (btnClose) {
      console.log('✅ Botão fechar encontrado');
      btnClose.addEventListener('click', () => closePopup(overlay));
    }

    // Botão copiar números
    const btnCopiar = popup.querySelector('.popup-copiar');
    console.log('🔍 Botão copiar:', btnCopiar);
    if (btnCopiar) {
      console.log('✅ Botão copiar encontrado, adicionando listener');
      btnCopiar.addEventListener('click', () => {
        const numerosParaCopiar = numeros.join(', ');
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

    overlay.addEventListener('click', (ev) => {
      if (ev.target === overlay) closePopup(overlay);
    });

    const handleEsc = (ev) => {
      if (ev.key === 'Escape') {
        closePopup(overlay);
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  });

  function closePopup(overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }

}
// initialize popup handler once
mostraNumerosPopup();


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