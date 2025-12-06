document.addEventListener('DOMContentLoaded', function() {
  const enviosList = document.querySelector('.envios-list');
  if (!enviosList) return;

  // Event listener único na lista com delegação
  enviosList.addEventListener('click', handleCardClick);

  function handleCardClick(e) {
    const clickedHeader = e.target.closest('.envio-header');
    if (!clickedHeader) return;

    const clickedCard = clickedHeader.closest('.envio-card');
    if (!clickedCard) return;

    // Fechar todos os outros cards
    document.querySelectorAll('.envio-card.expanded').forEach(openCard => {
      if (openCard !== clickedCard) {
        closeCard(openCard);
      }
    });

    // Toggle do card clicado
    if (clickedCard.classList.contains('expanded')) {
      closeCard(clickedCard);
    } else {
      openCard(clickedCard);
    }
  }

  function openCard(card) {
    card.classList.add('expanded');
    const body = card.querySelector('.envio-body');
    const indicator = card.querySelector('.toggle-indicator');

    if (body) {
      body.style.maxHeight = body.scrollHeight + 'px';
      body.setAttribute('aria-hidden', 'false');
    }

    if (indicator) {
      indicator.setAttribute('aria-expanded', 'true');
    }
  }

  function closeCard(card) {
    card.classList.remove('expanded');
    const body = card.querySelector('.envio-body');
    const indicator = card.querySelector('.toggle-indicator');

    if (body) {
      body.style.maxHeight = '0px';
      body.setAttribute('aria-hidden', 'true');
    }

    if (indicator) {
      indicator.setAttribute('aria-expanded', 'false');
    }
  }

  // Inicializar todos os bodies
  document.querySelectorAll('.envio-body').forEach(body => {
    body.style.maxHeight = '0px';
    body.setAttribute('aria-hidden', 'true');
  });
});
