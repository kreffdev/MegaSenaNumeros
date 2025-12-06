document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const btn = document.getElementById('notif-btn');
  const countEl = document.getElementById('notif-count');

  if (!btn || !countEl) return;

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      const unread = data.unreadCount || 0;
      countEl.textContent = unread > 0 ? String(unread) : '';
      if (unread > 0) countEl.style.display = 'inline-block'; else countEl.style.display = 'none';
      return data;
    } catch (e) {
      console.warn('notifications fetch error', e);
    }
  }

  function renderModal(notifications) {
    // render as a dropdown anchored to the bell button
    const existing = document.getElementById('notif-dropdown');
    if (existing) {
      existing.remove();
      btn.setAttribute('aria-expanded', 'false');
      return;
    }

    const dropdown = document.createElement('div');
    dropdown.id = 'notif-dropdown';
    dropdown.className = 'notif-dropdown';

    const listHtml = notifications.length === 0 ? '<p class="notif-empty">Nenhuma notificação</p>' : notifications.map(n => `
      <div class="notif-dropdown-item" data-env-id="${n.id}" data-enviado="${n.enviadoPor || ''}" data-dataenvio="${new Date(n.dataEnvio).toISOString()}">
        <div class="notif-sender">${escapeHtml(n.sender)}</div>
        <div class="notif-time">${new Date(n.dataEnvio).toLocaleString()}</div>
      </div>
    `).join('');

    dropdown.innerHTML = `
      <div class="notif-dropdown-box">
        <div class="notif-dropdown-header"><strong>Notificações</strong></div>
        <div class="notif-dropdown-list">${listHtml}</div>
      </div>
    `;

    document.body.appendChild(dropdown);

    // position dropdown under the button
    const box = dropdown.querySelector('.notif-dropdown-box');
    const rect = btn.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const left = Math.max(8, rect.right - 320); // align right edge
    const top = rect.bottom + scrollY + 8;
    box.style.position = 'absolute';
    box.style.top = `${top}px`;
    box.style.left = `${left}px`;

    // indicate expanded state for accessibility
    btn.setAttribute('aria-expanded', 'true');

    // animate open
    requestAnimationFrame(() => {
      dropdown.classList.add('open');
    });

    function closeDropdown() {
      // animate close then remove
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('resize', onResize);
      setTimeout(() => { if (dropdown && dropdown.parentNode) dropdown.remove(); }, 200);
    }

    // close when clicking outside
    function onDocClick(e) {
      if (!dropdown.contains(e.target) && e.target !== btn) {
        closeDropdown();
      }
    }

    function onResize() {
      // gracefully close dropdown on resize to avoid misposition
      closeDropdown();
    }

    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('resize', onResize);
    // delegate click on notification items to navigate to received games
    dropdown.addEventListener('click', async function (e) {
      const item = e.target.closest('.notif-dropdown-item');
      if (!item) return;
      const envioId = item.getAttribute('data-env-id');
      const enviado = item.getAttribute('data-enviado');
      const dataEnvioIso = item.getAttribute('data-dataenvio');

      // call server to mark this envio as read (persist)
      try {
        const res = await fetch('/api/notifications/mark-read-single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enviadoPor: enviado, dataEnvio: dataEnvioIso })
        });
        if (!res.ok) {
          console.warn('mark-read-single failed', await res.text());
          return; // don't remove UI if server failed
        }
      } catch (err) {
        console.warn('mark-read-single error', err);
        return;
      }

      // remove the clicked item from the dropdown (after server confirmed)
      item.remove();

      // decrement badge count (if present)
      const current = parseInt(countEl.textContent) || 0;
      if (current > 1) {
        countEl.textContent = String(current - 1);
      } else {
        countEl.textContent = '';
        countEl.style.display = 'none';
      }

      // if no items left, show empty message
      const remaining = dropdown.querySelectorAll('.notif-dropdown-item').length;
      if (remaining === 0) {
        const list = dropdown.querySelector('.notif-dropdown-list');
        if (list) list.innerHTML = '<p class="notif-empty">Nenhuma notificação</p>';
      }

      // navigate to jogos recebidos; include envio id as query for highlighting
      const url = envioId ? `/jogosrecebidos?envio=${encodeURIComponent(envioId)}` : '/jogosrecebidos';
      // close animated then navigate
      closeDropdown();
      // small delay to allow close animation
      setTimeout(() => { window.location.href = url; }, 180);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (s) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s];
    });
  }

  btn.addEventListener('click', async function () {
    const data = await fetchNotifications();
    const notifications = (data && data.notifications) || [];
    renderModal(notifications);
    // mark as read
    try { await fetch('/api/notifications/mark-read', { method: 'POST' }); countEl.textContent = ''; countEl.style.display = 'none'; } catch(e){console.warn(e)}
  });

  // initial fetch + periodic refresh
  fetchNotifications();
  setInterval(fetchNotifications, 30 * 1000);
});
