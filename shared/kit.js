// Shared helpers for the Blue Lotus demo websites: hash routing, storage that also works in
// sandboxed gallery previews, formatting, form validation, toasts and the demo notice.
(() => {
  const memory = {};
  const storage = {
    get(key, fallback) {
      try {
        const saved = localStorage.getItem(key);
        if (saved !== null) return JSON.parse(saved);
      } catch { /* Sandboxed previews have no storage; fall back to memory. */ }
      return key in memory ? memory[key] : fallback;
    },
    set(key, value) {
      memory[key] = value;
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* memory only */ }
    },
    remove(key) {
      delete memory[key];
      try { localStorage.removeItem(key); } catch { /* memory only */ }
    },
  };

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (amount, cents = false) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0,
  }).format(amount);
  const formatDate = (date, options = { weekday: 'short', month: 'short', day: 'numeric' }) => new Intl.DateTimeFormat('en-US', options).format(date);
  const formatTime = (date) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
  const dayKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const fromDayKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (date, days) => { const next = new Date(date); next.setDate(next.getDate() + days); return next; };
  const addBusinessDays = (date, days) => {
    const next = new Date(date);
    while (days > 0) { next.setDate(next.getDate() + 1); if (next.getDay() % 6 !== 0) days -= 1; }
    return next;
  };
  const reference = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}${String(Date.now()).slice(-3)}`;
  const firstName = (name) => String(name).trim().split(/\s+/)[0];

  // Routes are [pattern, view] pairs such as ['/projects/:slug', view]; a view returns { title, html, mount? }.
  function router(routes, { notFound, afterRender, scrollContainer } = {}) {
    const outlet = document.getElementById('app');
    const compiled = routes.map(([pattern, view]) => {
      const keys = [];
      const source = pattern.replace(/:(\w+)/g, (_, key) => { keys.push(key); return '([^/]+)'; });
      return { re: new RegExp(`^${source}/?$`), keys, view };
    });
    let first = true;
    let lastPath = null;
    const currentPath = () => (location.hash.replace(/^#/, '') || '/').split('?')[0];
    function resolve() {
      const [path, search = ''] = (location.hash.replace(/^#/, '') || '/').split('?');
      const query = new URLSearchParams(search);
      for (const route of compiled) {
        const match = path.match(route.re);
        if (match) return { view: route.view, path, query, params: Object.fromEntries(route.keys.map((key, i) => [key, decodeURIComponent(match[i + 1])])) };
      }
      return { view: notFound, path, query, params: {} };
    }
    function render({ keepScroll = false } = {}) {
      const ctx = resolve();
      const result = ctx.view(ctx) || notFound(ctx);
      // Re-rendering replaces the page, so remember which control had focus and restore it.
      const active = document.activeElement;
      const focusKey = keepScroll && outlet.contains(active)
        ? (active.id ? `#${CSS.escape(active.id)}` : active.name ? `[name="${CSS.escape(active.name)}"]` : null) : null;
      outlet.innerHTML = result.html;
      lastPath = ctx.path;
      const refocus = focusKey && outlet.querySelector(focusKey);
      if (refocus) {
        refocus.focus({ preventScroll: true });
        try { refocus.setSelectionRange(refocus.value.length, refocus.value.length); } catch { /* not a text field */ }
      }
      document.title = result.title;
      document.querySelectorAll('[data-nav]').forEach((link) => {
        const target = link.getAttribute('data-nav');
        const active = target === '/' ? ctx.path === '/' : ctx.path === target || ctx.path.startsWith(`${target}/`);
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
      });
      if (!keepScroll) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (scrollContainer) document.querySelector(scrollContainer)?.scrollTo({ top: 0, behavior: 'instant' });
      }
      result.mount?.(outlet, ctx);
      afterRender?.(ctx);
      if (!first && !keepScroll) outlet.focus({ preventScroll: true });
      first = false;
    }
    // A filter or sort change (same page, new query) keeps the reader where they are.
    window.addEventListener('hashchange', () => render({ keepScroll: currentPath() === lastPath }));
    render();
    // replace: update the address without a new history entry (used for search-as-you-type).
    function go(hash, { replace = false } = {}) {
      if (location.hash === hash) { render(); return; }
      if (replace) {
        try {
          const samePath = hash.replace(/^#/, '').split('?')[0] === lastPath;
          history.replaceState(history.state, '', hash);
          render({ keepScroll: samePath });
          return;
        } catch { /* fall back to a normal navigation */ }
      }
      location.hash = hash;
    }
    return { render, go };
  }

  function fieldMessage(field, form) {
    if (field.type === 'radio') {
      const group = form.querySelectorAll(`input[type="radio"][name="${CSS.escape(field.name)}"]`);
      const required = [...group].some((input) => input.required);
      return required && ![...group].some((input) => input.checked) ? (field.dataset.required || 'Choose an option.') : '';
    }
    if (field.type === 'checkbox') return field.required && !field.checked ? (field.dataset.required || 'Please confirm to continue.') : '';
    const value = field.value.trim();
    if (!value) return field.required ? (field.dataset.required || 'This field is required.') : '';
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Enter a valid email address, like name@example.com.';
    if (field.type === 'tel' && value.replace(/\D/g, '').length < 10) return 'Enter a 10-digit phone number.';
    if (field.dataset.minlength && value.length < Number(field.dataset.minlength)) return `Please write at least ${field.dataset.minlength} characters.`;
    if (field.pattern && !new RegExp(`^(?:${field.pattern})$`).test(value)) return field.dataset.patternMessage || 'Check this field.';
    if (field.type === 'number') {
      const number = Number(value);
      if (Number.isNaN(number)) return 'Enter a number.';
      if (field.min !== '' && number < Number(field.min)) return field.dataset.rangeMessage || `Enter ${field.min} or more.`;
      if (field.max !== '' && number > Number(field.max)) return field.dataset.rangeMessage || `Enter ${field.max} or less.`;
    }
    if (field.type === 'date' && field.min && value < field.min) return field.dataset.rangeMessage || 'Choose a later date.';
    return '';
  }

  // Validates a form in place: inline messages, aria-invalid and focus on the first problem.
  function validate(form) {
    form.querySelectorAll('.field-error').forEach((node) => node.remove());
    form.querySelectorAll('[aria-invalid]').forEach((node) => { node.removeAttribute('aria-invalid'); node.removeAttribute('aria-describedby'); });
    const seen = new Set();
    let firstInvalid = null;
    for (const field of form.elements) {
      if (!field.name || field.disabled || field.type === 'hidden' || field.type === 'submit' || field.type === 'button') continue;
      if (field.type === 'radio' && seen.has(field.name)) continue;
      seen.add(field.name);
      const message = fieldMessage(field, form);
      if (!message) continue;
      const id = `error-${field.name}`;
      const error = Object.assign(document.createElement('p'), { className: 'field-error', id, textContent: message });
      const anchor = field.type === 'radio' ? (field.closest('fieldset') || field.closest('label') || field)
        : field.type === 'checkbox' ? (field.closest('label') || field) : field;
      anchor.insertAdjacentElement('afterend', error);
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', id);
      firstInvalid ||= field;
    }
    firstInvalid?.focus();
    return !firstInvalid;
  }

  const formData = (form) => Object.fromEntries(new FormData(form).entries());

  let toastTimer;
  function toast(message) {
    let node = document.querySelector('.bl-toast');
    if (!node) {
      node = Object.assign(document.createElement('div'), { className: 'bl-toast' });
      node.setAttribute('role', 'status');
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('is-visible'), 2800);
  }

  // A modal dialog that closes on [data-close], Escape or a click outside it. Closing is handled
  // directly rather than through the dialog's close event, which can be delayed while a page is hidden.
  function modal(html, { className = 'bl-dialog', labelledBy = '', label = '', onClose } = {}) {
    const dialog = document.createElement('dialog');
    dialog.className = className;
    if (labelledBy) dialog.setAttribute('aria-labelledby', labelledBy);
    if (label) dialog.setAttribute('aria-label', label);
    dialog.innerHTML = html;
    const opener = document.activeElement;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      if (dialog.open) dialog.close();
      dialog.remove();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
      onClose?.();
    };
    dialog.addEventListener('click', (event) => {
      if (event.target.closest('[data-close]')) { close(); return; }
      const box = dialog.getBoundingClientRect();
      const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
      if (event.target === dialog && outside) close();
    });
    dialog.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
    dialog.addEventListener('close', close);
    document.body.append(dialog);
    dialog.showModal();
    return { dialog, close };
  }

  // An in-page confirmation (Escape or the backdrop cancels). Resolves true when confirmed.
  function confirmDialog({ title, message = '', confirm = 'Confirm', cancel = 'Cancel', danger = false }) {
    return new Promise((resolve) => {
      let confirmed = false;
      const { dialog, close } = modal(`<h2 id="bl-dialog-title">${esc(title)}</h2>${message ? `<p>${esc(message)}</p>` : ''}<div class="bl-dialog-actions"><button type="button" class="bl-dialog-cancel" data-close>${esc(cancel)}</button><button type="button" class="bl-dialog-ok${danger ? ' is-danger' : ''}">${esc(confirm)}</button></div>`,
        { labelledBy: 'bl-dialog-title', onClose: () => resolve(confirmed) });
      dialog.querySelector('.bl-dialog-ok').addEventListener('click', () => { confirmed = true; close(); });
      dialog.querySelector(danger ? '.bl-dialog-cancel' : '.bl-dialog-ok').focus();
    });
  }

  const inPreview = (() => { try { return window.self !== window.top; } catch { return true; } })();

  function demoBar(siteName, kind = 'business') {
    const bar = document.createElement('div');
    bar.className = 'bl-demo-bar';
    bar.setAttribute('role', 'note');
    bar.innerHTML = `<span><strong>Demo ${kind === 'app' ? 'app' : 'website'}</strong> · ${esc(siteName)} is a fictional ${esc(kind)} with sample content, made by <a href="https://bluelotuscoding.com" target="_blank" rel="noopener noreferrer">Blue Lotus Coding</a>.</span>${inPreview ? '' : '<a class="bl-demo-back" href="/">← All demos</a>'}`;
    document.body.prepend(bar);
  }

  // One delegated listener per event type; handlers are looked up by data-action / data-form.
  function actions(handlers) {
    // A hash link would be read as a route, so the skip link is a button that moves focus.
    const map = { 'skip-to-content': () => document.getElementById('app').focus(), ...handlers };
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target || !map[target.dataset.action]) return;
      map[target.dataset.action](target, event);
    });
    document.addEventListener('change', (event) => {
      const target = event.target.closest('[data-change]');
      if (target && map[target.dataset.change]) map[target.dataset.change](target, event);
    });
    document.addEventListener('input', (event) => {
      const target = event.target.closest('[data-input]');
      if (target && map[target.dataset.input]) map[target.dataset.input](target, event);
    });
    document.addEventListener('submit', (event) => {
      const form = event.target.closest('form[data-form]');
      if (!form || !map[form.dataset.form]) return;
      event.preventDefault();
      map[form.dataset.form](form, event);
    });
  }

  window.Kit = { storage, esc, money, formatDate, formatTime, dayKey, fromDayKey, addDays, addBusinessDays, reference, firstName, router, validate, formData, toast, modal, confirmDialog, demoBar, actions, inPreview };
})();
