// enviados.js — versão simples: controla apenas classes e atributos ARIA
(function () {
  'use strict';

  function initEnviados() {
    if (window.__enviados_inited) return;
    window.__enviados_inited = true;

    const enviosList = document.querySelector('.envios-list');
    if (!enviosList) return;

    // Initialize ARIA attributes and ensure no card is expanded
    enviosList.querySelectorAll('.envio-card').forEach(card => {
      card.classList.remove('expanded');
      const body = card.querySelector('.envio-body');
      const ind = card.querySelector('.toggle-indicator');
      if (body) {
        body.setAttribute('aria-hidden', 'true');
        // ensure initial height 0
        body.style.height = '0px';
      }
      if (ind) ind.setAttribute('aria-expanded', 'false');
    });

    // Helper to animate open/close using height, then set to auto when open
    function animateOpen(body) {
      return new Promise(resolve => {
        // set height to current computed (in case it's auto)
        body.style.removeProperty('height');
        const start = body.offsetHeight; // may be 0
        // force to px
        body.style.height = start + 'px';
        // next frame set to target
        requestAnimationFrame(() => {
          const target = body.scrollHeight;
          body.style.transition = 'height 240ms ease';
          body.style.height = target + 'px';
        });
        function onEnd(e) {
          if (e.propertyName !== 'height') return;
          body.removeEventListener('transitionend', onEnd);
          body.style.height = 'auto';
          resolve();
        }
        body.addEventListener('transitionend', onEnd);
      });
    }

    function animateClose(body) {
      return new Promise(resolve => {
        // if height is auto, set to current pixel height first
        const cur = body.offsetHeight;
        body.style.height = cur + 'px';
        requestAnimationFrame(() => {
          body.style.transition = 'height 240ms ease';
          body.style.height = '0px';
        });
        function onEnd(e) {
          if (e.propertyName !== 'height') return;
          body.removeEventListener('transitionend', onEnd);
          body.style.height = '0px';
          resolve();
        }
        body.addEventListener('transitionend', onEnd);
      });
    }

    // Attach click handlers to headers
    const headers = Array.from(enviosList.querySelectorAll('.envio-header'));
    headers.forEach(header => {
      header.addEventListener('click', async function (ev) {
        const card = this.closest('.envio-card');
        if (!card) return;
        const body = card.querySelector('.envio-body');
        const isOpen = card.classList.contains('expanded');

        // Close any open card first
        const openCard = enviosList.querySelector('.envio-card.expanded');
        if (openCard && openCard !== card) {
          const openBody = openCard.querySelector('.envio-body');
          openCard.classList.remove('expanded');
          if (openBody) {
            openBody.setAttribute('aria-hidden', 'true');
            await animateClose(openBody);
          }
        }

        if (isOpen) {
          // close this
          card.classList.remove('expanded');
          if (body) {
            body.setAttribute('aria-hidden', 'true');
            await animateClose(body);
          }
        } else {
          // open this
          card.classList.add('expanded');
          if (body) {
            body.setAttribute('aria-hidden', 'false');
            await animateOpen(body);
          }
        }
      }, false);
      // keyboard support
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      }, false);
    });
  }

  document.addEventListener('DOMContentLoaded', initEnviados);
})();
