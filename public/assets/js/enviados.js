document.addEventListener('DOMContentLoaded', function() {
  const enviosList = document.querySelector('.envios-list');
  if (!enviosList) return;

  // Event delegation on .envios-list
  enviosList.addEventListener('click', function(e) {
    const header = e.target.closest('.envio-header');
    if (!header) return;

    const card = header.closest('.envio-card');
    if (!card) return;

    const body = card.querySelector('.envio-body');
    if (!body) return;

    // Toggle expanded class
    const isExpanded = card.classList.toggle('expanded');
    
    // Update indicator
    const indicator = header.querySelector('.toggle-indicator');
    if (indicator) {
      indicator.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }

    // Handle max-height for smooth transition
    if (isExpanded) {
      // Calculate scrollHeight for dynamic height
      const scrollHeight = body.scrollHeight;
      body.style.maxHeight = scrollHeight + 'px';
      body.setAttribute('aria-hidden', 'false');
    } else {
      body.style.maxHeight = '0px';
      body.setAttribute('aria-hidden', 'true');
    }
  });

  // Initialize: set aria-hidden and ensure max-height is 0
  document.querySelectorAll('.envio-body').forEach(body => {
    body.style.maxHeight = '0px';
    body.setAttribute('aria-hidden', 'true');
  });
});
