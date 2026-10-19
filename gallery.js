// Demo gallery: live previews scaled to fit, click-to-interact, desktop/mobile viewports and a fullscreen view.
(() => {
  const SIZES = { desktop: { width: 1280, height: 800 }, mobile: { width: 390, height: 844 } };
  const BEZEL = 12;
  const SANDBOX = 'allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox';
  const demos = [...document.querySelectorAll('.demo')];
  const small = matchMedia('(max-width: 760px)');
  const fs = document.getElementById('fs');
  const fsStage = document.getElementById('fs-stage');
  let active = null;
  let fsOpener = null;

  // Desktop previews render at 1280px wide and scale down; mobile previews render at 390px inside a phone frame.
  function fit(stage) {
    const device = stage.querySelector('.device');
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    if (stage.dataset.view === 'mobile') {
      const outerW = SIZES.mobile.width + BEZEL * 2;
      const outerH = SIZES.mobile.height + BEZEL * 2;
      const scale = Math.min(1, (h - 32) / outerH, (w - 32) / outerW);
      Object.assign(device.style, { width: `${outerW}px`, height: `${outerH}px`, left: '50%', top: '16px', transform: `translateX(-50%) scale(${scale})` });
    } else {
      const scale = w / SIZES.desktop.width;
      Object.assign(device.style, { width: `${SIZES.desktop.width}px`, height: `${Math.ceil(h / scale)}px`, left: '0', top: '0', transform: `scale(${scale})` });
    }
  }

  function setView(demo, view) {
    const stage = demo.querySelector('.stage');
    stage.dataset.view = view;
    demo.querySelectorAll('button[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    fit(stage);
  }

  const load = (frame) => { if (!frame.getAttribute('src')) frame.src = frame.dataset.src; };

  function activate(demo) {
    if (active && active !== demo) deactivate(active);
    const stage = demo.querySelector('.stage');
    const frame = stage.querySelector('iframe');
    load(frame);
    stage.querySelector('.device').inert = false;
    stage.querySelector('[data-activate]').hidden = true;
    stage.querySelector('[data-deactivate]').hidden = false;
    demo.classList.add('is-active');
    active = demo;
    frame.focus();
  }

  function deactivate(demo, { focus = false } = {}) {
    const stage = demo.querySelector('.stage');
    stage.querySelector('.device').inert = true;
    stage.querySelector('[data-activate]').hidden = false;
    stage.querySelector('[data-deactivate]').hidden = true;
    demo.classList.remove('is-active');
    if (active === demo) active = null;
    if (focus) stage.querySelector('[data-activate]').focus();
  }

  function setFsView(view) {
    fsStage.dataset.view = view;
    fs.querySelectorAll('[data-fs-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fsView === view)));
  }

  // Fullscreen grows out of the preview card and shrinks back into it: an accent panel leads, the dark panel follows.
  const EXPO = 'cubic-bezier(.76, 0, .24, 1)';
  const FULL = 'inset(0px 0px 0px 0px round 0px)';
  const canAnimateBackdrop = typeof KeyframeEffect !== 'undefined' && 'pseudoElement' in KeyframeEffect.prototype;
  const motion = () => document.documentElement.classList.contains('js-motion');
  const wipe = fs.querySelector('.fs-wipe');
  const panel = fs.querySelector('.fs-panel');
  let fsDemo = null;
  let fsAnimations = [];
  let fsClosing = false;

  function cardInset(demo) {
    const r = demo.querySelector('.demo-preview').getBoundingClientRect();
    const px = (n) => `${Math.max(0, Math.round(n))}px`;
    return `inset(${px(r.top)} ${px(innerWidth - r.right)} ${px(innerHeight - r.bottom)} ${px(r.left)} round 16px)`;
  }

  function openFullscreen(demo, opener) {
    if (fs.open) return;
    if (active) deactivate(active);
    fsOpener = opener;
    fsDemo = demo;
    fs.dataset.demo = demo.id;
    fs.style.setProperty('--accent', demo.style.getPropertyValue('--accent') || '#7f9dff');
    document.getElementById('fs-name').textContent = demo.dataset.name;
    document.getElementById('fs-kind').textContent = demo.dataset.kind;
    const link = document.getElementById('fs-open');
    link.href = demo.dataset.src;
    link.firstChild.textContent = demo.hasAttribute('data-app') ? 'View app ' : 'View website ';

    // While the site loads, its name rises letter by letter in the demo's own typeface.
    const loader = document.createElement('div');
    loader.className = 'fs-loader';
    loader.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span');
    name.className = 'fs-loader-name fs-font';
    // Letters are grouped by word so a two-word name wraps between words, never inside one.
    let count = 0;
    demo.dataset.name.split(/\s+/).forEach((part) => {
      const word = Object.assign(document.createElement('span'), { className: 'fs-loader-word' });
      [...part].forEach((ch) => {
        const letter = document.createElement('span');
        letter.textContent = ch;
        letter.style.setProperty('--c', count++);
        word.append(letter);
      });
      name.append(word);
    });
    loader.append(name, Object.assign(document.createElement('span'), { className: 'fs-loader-bar' }), Object.assign(document.createElement('span'), { className: 'fs-loader-kind', textContent: demo.dataset.kind }));

    const frame = document.createElement('iframe');
    frame.title = `${demo.dataset.name} demo, full screen`;
    frame.setAttribute('sandbox', SANDBOX);
    frame.setAttribute('referrerpolicy', 'no-referrer');
    const ready = { loaded: false, opened: false };
    const reveal = () => { if (ready.loaded && ready.opened && fsStage.contains(frame)) fsStage.classList.add('is-loaded'); };
    frame.addEventListener('load', () => { ready.loaded = true; reveal(); }, { once: true });
    setTimeout(() => { ready.loaded = true; reveal(); }, 5000);
    frame.src = demo.dataset.src;
    fsStage.classList.remove('is-loaded');
    fsStage.replaceChildren(loader, frame);
    setFsView(small.matches ? 'mobile' : demo.querySelector('.stage').dataset.view);
    fs.showModal();
    document.documentElement.style.overflow = 'hidden';
    document.getElementById('fs-close').focus();

    if (!motion()) { ready.opened = true; reveal(); fs.classList.add('is-open'); return; }
    const from = cardInset(demo);
    fsAnimations = [
      wipe.animate([{ clipPath: from, opacity: 0 }, { opacity: 1, offset: 0.18 }, { clipPath: FULL, opacity: 1 }], { duration: 720, delay: 30, easing: EXPO, fill: 'backwards' }),
      panel.animate([{ clipPath: from }, { clipPath: FULL }], { duration: 780, delay: 190, easing: EXPO, fill: 'backwards' }),
    ];
    if (canAnimateBackdrop) fsAnimations.push(fs.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: 'ease-out', pseudoElement: '::backdrop' }));
    requestAnimationFrame(() => fs.classList.add('is-open'));
    fsAnimations[1].finished.then(() => { ready.opened = true; reveal(); }, () => {});
  }

  function closeFullscreen() {
    if (!fs.open || fsClosing) return;
    fsClosing = true;
    fsAnimations.forEach((animation) => animation.finish());
    const demo = fsDemo;
    const done = () => {
      fs.close();
      fs.classList.remove('is-open', 'is-closing');
      fsStage.replaceChildren();
      fsStage.classList.remove('is-loaded');
      document.documentElement.style.overflow = '';
      fsClosing = false;
      fsOpener?.focus({ preventScroll: true });
      // The card settles as the panel lands back in it.
      if (demo && motion()) demo.querySelector('.demo-preview').animate([{ transform: 'scale(.965)' }, { transform: 'scale(1.015)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 560, easing: 'ease-out' });
    };
    if (!motion() || !demo) { done(); return; }
    fs.classList.remove('is-open');
    fs.classList.add('is-closing');
    const to = cardInset(demo);
    const closing = [
      panel.animate([{ clipPath: FULL }, { clipPath: to }], { duration: 640, delay: 140, easing: EXPO, fill: 'forwards' }),
      wipe.animate([{ clipPath: FULL, opacity: 1 }, { opacity: 1, offset: 0.78 }, { clipPath: to, opacity: 0 }], { duration: 660, delay: 250, easing: EXPO, fill: 'forwards' }),
    ];
    if (canAnimateBackdrop) closing.push(fs.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 640, delay: 260, easing: 'ease-in', fill: 'forwards', pseudoElement: '::backdrop' }));
    Promise.all(closing.map((animation) => animation.finished)).then(() => {
      done();
      closing.forEach((animation) => animation.cancel());
    }, done);
  }

  // Previews load as they come within 600px of the viewport.
  let checkQueued = false;
  function loadNearby() {
    checkQueued = false;
    demos.forEach((demo) => {
      const rect = demo.querySelector('.stage').getBoundingClientRect();
      if (rect.bottom > -600 && rect.top < innerHeight + 600) load(demo.querySelector('.stage iframe'));
    });
  }
  const queueCheck = () => { if (!checkQueued) { checkQueued = true; setTimeout(loadNearby, 120); } };
  addEventListener('scroll', queueCheck, { passive: true });
  addEventListener('resize', queueCheck);
  addEventListener('hashchange', queueCheck);

  // A preview stops capturing input once it is scrolled mostly out of view.
  const watcher = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (active && entry.intersectionRatio < 0.2 && active.contains(entry.target)) deactivate(active);
    });
  }, { threshold: [0, 0.2] });

  demos.forEach((demo) => {
    const stage = demo.querySelector('.stage');
    if (small.matches) setView(demo, 'mobile');
    demo.addEventListener('click', (event) => {
      const viewButton = event.target.closest('button[data-view]');
      if (viewButton) { setView(demo, viewButton.dataset.view); return; }
      if (event.target.closest('[data-activate]')) { activate(demo); return; }
      if (event.target.closest('[data-deactivate]')) { deactivate(demo, { focus: true }); return; }
      const full = event.target.closest('[data-fullscreen]');
      if (full) openFullscreen(demo, full);
    });
    new ResizeObserver(() => fit(stage)).observe(stage);
    watcher.observe(stage);
    fit(stage);
  });
  loadNearby();

  document.addEventListener('pointerdown', (event) => {
    if (active && !active.querySelector('.demo-preview').contains(event.target)) deactivate(active);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && active && !fs.open) deactivate(active, { focus: true });
  });
  small.addEventListener('change', () => demos.forEach((demo) => setView(demo, small.matches ? 'mobile' : 'desktop')));

  document.getElementById('fs-close').addEventListener('click', closeFullscreen);
  fs.addEventListener('cancel', (event) => { event.preventDefault(); closeFullscreen(); });
  fs.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); closeFullscreen(); } });
  fs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-fs-view]');
    if (button) setFsView(button.dataset.fsView);
  });
})();

// Slides: kinetic headings, entrance builds, the current slide's accent color, a section rail and scroll progress.
(() => {
  window.slidesReady = true;
  const root = document.documentElement;
  const slides = [...document.querySelectorAll('[data-slide]')];

  // Hero words and demo-name letters become spans so they can animate one by one.
  const span = (className, text, index) => {
    const el = document.createElement('span');
    el.className = className;
    el.textContent = text;
    el.style.setProperty(className === 'w' ? '--w' : '--c', index);
    return el;
  };
  document.querySelectorAll('.split').forEach((heading) => {
    if (heading.classList.contains('demo-name')) {
      const name = heading.textContent.trim();
      const letters = document.createElement('span');
      letters.setAttribute('aria-hidden', 'true');
      let count = 0;
      name.split(/(\s+)/).forEach((part) => {
        if (/^\s+$/.test(part)) { letters.append(' '); return; }
        const word = Object.assign(document.createElement('span'), { className: 'word' });
        [...part].forEach((ch) => word.append(span('ch', ch, count++)));
        letters.append(word);
      });
      heading.replaceChildren(Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: name }), letters);
    } else {
      let n = 0;
      const walk = (node) => [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) { walk(child); return; }
        if (child.nodeType !== Node.TEXT_NODE) return;
        const parts = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (part) parts.append(/^\s+$/.test(part) ? part : span('w', part, n++));
        });
        child.replaceWith(parts);
      });
      walk(heading);
    }
    heading.classList.add('is-split');
  });
  document.querySelectorAll('[data-reveal=""]').forEach((group) => {
    [...group.children].forEach((child, i) => child.style.setProperty('--i', i));
  });

  // Builds play when a group comes into view and reset once it has fully left, so revisiting replays them.
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
      if (isIntersecting && intersectionRatio >= 0.15) target.classList.add('is-in');
      else if (!isIntersecting) target.classList.remove('is-in');
    });
  }, { threshold: [0, 0.15] });
  document.querySelectorAll('[data-reveal]').forEach((el) => reveal.observe(el));

  // The slide crossing the middle of the screen sets the page accent and the rail position.
  const rail = document.querySelector('.g-rail');
  const list = document.createElement('ol');
  const links = slides.map((slide) => {
    const link = Object.assign(document.createElement('a'), { href: `#${slide.id}` });
    link.append(Object.assign(document.createElement('span'), { textContent: slide.dataset.label }));
    const item = document.createElement('li');
    item.append(link);
    list.append(item);
    return link;
  });
  rail.append(list);
  rail.hidden = false;
  let current = null;
  const setCurrent = (slide) => {
    if (slide === current) return;
    current = slide;
    root.style.setProperty('--accent', slide.style.getPropertyValue('--accent') || '#7f9dff');
    links.forEach((link, i) => {
      if (slides[i] === slide) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };
  const middle = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) setCurrent(entry.target); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  slides.forEach((slide) => middle.observe(slide));

  const bar = document.querySelector('.g-progress');
  let ticking = false;
  const progress = () => {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
  addEventListener('resize', progress);
  progress();
})();
