document.addEventListener('DOMContentLoaded', function() {
  const enviosList = document.querySelector('.envios-list');
  if (!enviosList) return;

  // Get all cards
  const allCards = Array.from(enviosList.querySelectorAll('.envio-card'));

  // Initialize all bodies as closed
  allCards.forEach((card) => {
    const body = card.querySelector('.envio-body');
    if (body) {
      body.style.maxHeight = '0px';
      body.style.overflow = 'hidden';
      body.style.padding = '0 0.8rem';
      body.setAttribute('aria-hidden', 'true');
    }
  });

  // Single delegated listener
  enviosList.addEventListener('click', function(e) {
    const clickedHeader = e.target.closest('.envio-header');
    if (!clickedHeader) return;

    const clickedCard = clickedHeader.closest('.envio-card');
    if (!clickedCard) return;

    e.preventDefault();
    e.stopPropagation();

    // Step 1: Close ALL cards (including this one)
    allCards.forEach((card) => {
      const body = card.querySelector('.envio-body');
      const indicator = card.querySelector('.toggle-indicator');

      card.classList.remove('expanded');
      
      if (body) {
        body.style.maxHeight = '0px';
        body.style.padding = '0 0.8rem';
        body.setAttribute('aria-hidden', 'true');
      }
      
      if (indicator) {
        indicator.setAttribute('aria-expanded', 'false');
      }
    });

    // Step 2: Open ONLY the clicked card
    const body = clickedCard.querySelector('.envio-body');
    const indicator = clickedCard.querySelector('.toggle-indicator');

    clickedCard.classList.add('expanded');
    
    if (body) {
      body.style.maxHeight = body.scrollHeight + 'px';
      body.style.padding = '0.8rem';
      body.setAttribute('aria-hidden', 'false');
    }
    
    if (indicator) {
      indicator.setAttribute('aria-expanded', 'true');
    }
  });
});
