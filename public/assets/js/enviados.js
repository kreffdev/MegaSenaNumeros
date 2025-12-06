document.addEventListener('DOMContentLoaded', function() {
  // Get all envio-card elements
  const cards = document.querySelectorAll('.envio-card');
  
  cards.forEach(card => {
    const header = card.querySelector('.envio-header');
    const body = card.querySelector('.envio-body');
    const indicator = header.querySelector('.toggle-indicator');
    
    if (!header || !body) return;

    // Click handler on header
    header.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Toggle ONLY this card
      const isExpanded = card.classList.toggle('expanded');
      
      // Update indicator for this card
      if (indicator) {
        indicator.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      }

      // Handle max-height for smooth transition
      if (isExpanded) {
        const scrollHeight = body.scrollHeight;
        body.style.maxHeight = scrollHeight + 'px';
        body.setAttribute('aria-hidden', 'false');
      } else {
        body.style.maxHeight = '0px';
        body.setAttribute('aria-hidden', 'true');
      }
    });

    // Initialize: set aria-hidden and ensure max-height is 0
    body.style.maxHeight = '0px';
    body.setAttribute('aria-hidden', 'true');
  });
});
