document.addEventListener('DOMContentLoaded', function() {
  const headers = document.querySelectorAll('.envio-header');
  
  headers.forEach((header, idx) => {
    const card = header.closest('.envio-card');
    const body = card.querySelector('.envio-body');
    const indicator = header.querySelector('.toggle-indicator');
    
    if (!card || !body) return;

    // Initialize body
    body.style.maxHeight = '0px';
    body.setAttribute('aria-hidden', 'true');
    
    // Click handler - only on this specific header
    header.addEventListener('click', function(e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      
      // Close all other cards first (accordion behavior)
      document.querySelectorAll('.envio-card.expanded').forEach(otherCard => {
        if (otherCard !== card) {
          otherCard.classList.remove('expanded');
          const otherBody = otherCard.querySelector('.envio-body');
          const otherIndicator = otherCard.querySelector('.toggle-indicator');
          if (otherBody) {
            otherBody.style.maxHeight = '0px';
            otherBody.setAttribute('aria-hidden', 'true');
          }
          if (otherIndicator) {
            otherIndicator.setAttribute('aria-expanded', 'false');
          }
        }
      });
      
      // Toggle current card
      const isExpanded = card.classList.toggle('expanded');
      
      if (indicator) {
        indicator.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      }

      if (isExpanded) {
        const scrollHeight = body.scrollHeight;
        body.style.maxHeight = scrollHeight + 'px';
        body.setAttribute('aria-hidden', 'false');
      } else {
        body.style.maxHeight = '0px';
        body.setAttribute('aria-hidden', 'true');
      }
    }, true); // use capture phase
  });
});
