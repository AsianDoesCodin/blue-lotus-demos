// LUNA TAQUERÍA — demo ordering website for a fictional neighborhood taquería in Avondale, Birmingham.
const { esc, money, router: createRouter, validate, formData, toast, modal, reference, firstName, storage, actions, demoBar, formatDate, formatTime, dayKey, addDays } = Kit;
demoBar('Luna Taquería');

/* ------------------------------------------------------------------ Facts */
const SHOP = { street: '412 Marigold Ave S', city: 'Birmingham, AL 35222', phone: '(205) 555-0119', tel: '+12055550119' };
const DELIVERY_ZIPS = ['35203', '35204', '35205', '35206', '35209', '35212', '35222', '35233', '35234'];
const DELIVERY_FEE = 399;       // all money is kept in cents
const FREE_DELIVERY_AT = 4000;  // food subtotal, before tax
const DELIVERY_MIN = 1500;
const TAX_RATE = 10;            // percent of the food subtotal
const TIP_PRESETS = [0, 15, 18, 20];
// Opening hours by weekday (0 = Sunday) in Birmingham (Central) time.
const HOURS = { 0: [11, 20], 1: [11, 21], 2: [11, 21], 3: [11, 21], 4: [11, 21], 5: [11, 22], 6: [11, 22] };
const LAST_ORDER_MIN = 30;
const STEP_MS = 9000;           // demo tracking: seconds per step
const MIN = 60000;

const CATEGORIES = [['tacos', 'Tacos'], ['bowls', 'Bowls'], ['sides', 'Sides'], ['drinks', 'Drinks'], ['sweets', 'Sweets']];
const CATEGORY_NOTES = {
  tacos: 'Served on corn tortillas we press every morning, and they are gluten-free. Any taco plate can be made with cauliflower al pastor (vegan) at no charge.',
  bowls: 'Everything you love about a burrito, in a bowl. Our black beans are cooked without lard.',
  sides: 'For the table, or just for you.',
  drinks: 'Made fresh in the kitchen every day.',
  sweets: 'Save room. Or don’t, and take them home.',
};
const MENU = {
  'al-pastor': { cat: 'tacos', name: 'Tacos al pastor', portion: '3 tacos', price: 1250, protein: 'Pork al pastor', desc: 'Spit-roasted pork, charred pineapple, onion, cilantro.', stickers: ['fav'], tags: ['Gluten-free tortillas', 'Vegan swap'], alt: 'Three tacos al pastor topped with charred pineapple, diced onion and cilantro' },
  birria: { cat: 'tacos', name: 'Birria tacos', portion: '3 tacos', price: 1450, protein: 'Braised beef birria', desc: 'Slow-braised beef, melted Oaxaca cheese, consommé for dipping.', stickers: ['fav'], tags: ['Gluten-free tortillas', 'Vegan swap'], alt: 'Crispy birria tacos with melted cheese and a cup of consommé for dipping' },
  'baja-fish': { cat: 'tacos', name: 'Baja fish tacos', portion: '2 tacos', price: 1200, protein: 'Beer-battered cod', desc: 'Beer-battered cod, cabbage slaw, chipotle crema.', stickers: ['spicy'], tags: ['Vegan swap'], alt: 'Two Baja fish tacos with golden battered cod, cabbage slaw and chipotle crema' },
  bowl: { cat: 'bowls', name: 'Burrito bowl', portion: 'Your choice of protein', price: 1300, desc: 'Cilantro rice, black beans, corn, pico, avocado, crema.', stickers: ['veganopt'], tags: ['Vegan option', 'Beans without lard'], alt: 'Burrito bowl with cilantro rice, black beans, corn, pico de gallo, avocado and crema' },
  'chips-guac': { cat: 'sides', name: 'Chips & guacamole', portion: 'Made to share', price: 850, desc: 'Tortilla chips fried every morning and guacamole mashed to order with lime, onion and serrano.', stickers: ['vegan'], tags: ['Vegan'], alt: 'Warm tortilla chips beside a stone bowl of chunky guacamole' },
  elote: { cat: 'sides', name: 'Elote', portion: '2 per order', price: 650, desc: 'Grilled street corn, crema, cotija, chile.', stickers: ['spicy'], tags: ['Vegetarian'], alt: 'Two ears of grilled street corn with crema, cotija and chile powder' },
  'agua-fresca': { cat: 'drinks', name: 'Agua fresca', portion: 'Hibiscus, horchata or tamarind', price: 400, desc: 'Big, cold and not too sweet, made fresh in the kitchen every morning.', stickers: [], tags: ['Made daily'], alt: 'Tall glasses of hibiscus, horchata and tamarind agua fresca over ice' },
  churros: { cat: 'sweets', name: 'Churros', portion: 'With chocolate sauce', price: 650, desc: 'Cinnamon sugar, Mexican chocolate sauce.', stickers: [], tags: ['Vegetarian'], alt: 'Cinnamon-sugar churros with a small bowl of Mexican chocolate sauce' },
};
const STICKERS = { fav: ['Fan favorite', 'fav'], spicy: ['Spicy', 'spicy'], vegan: ['Vegan', 'vegan'], veganopt: ['Vegan option', 'vegan'] };
const BOWL_PROTEINS = [['chicken', 'Grilled chicken', 0], ['pastor', 'Al pastor', 0], ['asada', 'Carne asada', 200], ['cauli', 'Cauliflower al pastor', 0, 'Vegan']];
const FLAVORS = [['hibiscus', 'Hibiscus', '#b3134f'], ['horchata', 'Horchata', '#f1e2c8'], ['tamarind', 'Tamarind', '#8a4b1f']];
const EXTRAS = [['guac', 'Extra guac', 200], ['verde', 'Extra salsa verde', 75], ['queso', 'Add queso', 150]];
const SPICE = ['Mild', 'Medium', 'Hot'];

const PACKAGES = {
  'taco-bar': { name: 'Taco Bar', price: 15, proteins: 2, includes: ['2 proteins', 'Corn tortillas pressed that morning', 'Cilantro rice and black beans', 'Three salsas', 'All the toppings'], blurb: 'Build-your-own tacos for offices, birthdays and game days.' },
  fiesta: { name: 'Fiesta Spread', price: 19, proteins: 3, includes: ['3 proteins', 'Chips and guacamole', 'Elote', 'Agua fresca'], blurb: 'The full party: more proteins, plus sides and drinks for everyone.' },
};
const CATER_PROTEINS = [['pastor', 'Al pastor'], ['birria', 'Birria beef'], ['chicken', 'Grilled chicken'], ['asada', 'Carne asada'], ['cauli', 'Cauliflower al pastor', 'Vegan']];
const CATER_MIN_GUESTS = 15;
const CATER_MAX_GUESTS = 300;
const CATER_FREE_OVER = 30000;

const REVIEWS = [
  { name: 'Danielle R.', area: 'Avondale', dish: 'Birria tacos', text: 'The birria is the real deal: crispy edges, rich consommé, and it showed up hot in about 35 minutes. I drink whatever consommé is left. No shame.' },
  { name: 'Marcus T.', area: 'Crestwood', dish: 'Fiesta Spread catering', text: 'We did the Fiesta Spread for my daughter’s graduation. Forty people, zero stress, and the cauliflower al pastor had our vegan friends going back for thirds.' },
  { name: 'Priya K.', area: 'Forest Park', dish: 'Tacos al pastor', text: 'You can taste that the tortillas were pressed that morning. Al pastor with extra salsa verde is officially my Friday night.' },
];

/* ------------------------------------------------------------------ State */
const state = Object.assign({ cart: [], mode: 'delivery', tip: null, when: { type: 'asap', day: '', time: '' }, details: {}, orders: [], catering: [] }, storage.get('luna-state', {}));
const save = () => storage.set('luna-state', state);
let saveTimer;
const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 250); };

/* ---------------------------------------------------------------- Helpers */
const usd = (cents) => money(cents / 100, true);
const prettyPhone = (value) => { const d = String(value).replace(/D/g, '').replace(/^1(?=d{10}$)/, ''); return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(value).trim(); };
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const LANDSCAPE = new Set(['hero', 'kitchen']);
const img = (name, alt, { eager = false, sizes = '(max-width: 640px) 100vw, 360px' } = {}) => {
  const [w, h, sm] = LANDSCAPE.has(name) ? [1536, 1024, 768] : [1024, 1024, 512];
  return `<img src="img/${name}.webp" srcset="img/${name}-sm.webp ${sm}w, img/${name}.webp ${w}w" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
};
// Until the photos arrive, a missing image just shows its colored frame.
document.addEventListener('error', (event) => { if (event.target.tagName === 'IMG') event.target.classList.add('is-missing'); }, true);

const icon = {
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  scooter: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17" r="2.5"/><circle cx="18.5" cy="17" r="2.5"/><path d="M8 17h6l3-8h2M15 9l3.5 8M4 12h6l2 5"/></g></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.6" fill="currentColor"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  cash: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="currentColor"/></svg>',
  receipt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8h6M9 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c4 0 7-2.8 7-7 0-4.6-4-7-4-11-3 1.5-5 4.5-5 7.5-1-.6-1.8-1.8-2-3-1.3 1.6-3 3.8-3 6.5 0 4.2 3 7 7 7Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  spark: '<svg class="spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l2.4 7.1 7.1 2.4-7.1 2.4L12 20.5l-2.4-7.1L2.5 11l7.1-2.4z" fill="currentColor"/></svg>',
  chili: '<svg class="chili" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.2 7.2c2.9.5 4.6 3 3.8 6.2-1.2 4.8-6.8 8.1-14.5 8.1 5.2-1.9 7.5-5.5 8-9.4.3-2.8.8-5.2 2.7-4.9Z" fill="currentColor"/><path d="M15.3 7.3c.1-2 1.2-3.4 3.1-3.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill="currentColor"/></svg>',
};

/* ---------------------------------------------------- Clock and opening hours */
// All scheduling runs on Birmingham wall-clock time, wherever the visitor is.
const clockFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
function shopNow() {
  if (window.lunaTestNow) return new Date(window.lunaTestNow); // lets a demo walkthrough pretend it is another time
  const p = Object.fromEntries(clockFormat.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return new Date(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour) % 24, Number(p.minute), Number(p.second));
}
const plus = (date, minutes) => new Date(date.getTime() + minutes * MIN);
const at = (date, h, m = 0) => { const d = new Date(date); d.setHours(h, m, 0, 0); return d; };
const ceilTo = (date, step) => { const d = new Date(date); d.setSeconds(0, 0); const r = d.getMinutes() % step; if (r) d.setMinutes(d.getMinutes() + step - r); return d; };
const timeKey = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const hourLabel = (d) => formatTime(d).replace(':00', '');
const hoursOn = (date) => { const [o, c] = HOURS[date.getDay()]; return { open: at(date, o), close: at(date, c) }; };
const hoursText = (date) => { const { open, close } = hoursOn(date); return `${hourLabel(open)}–${hourLabel(close)}`; };

function shopStatus(now = shopNow()) {
  const { open, close } = hoursOn(now);
  const cutoff = plus(close, -LAST_ORDER_MIN);
  const tomorrow = hoursOn(addDays(at(now, 12), 1)).open;
  if (now >= open && now < close) {
    if (now < plus(cutoff, -30)) return { tone: 'open', ordering: true, cutoff, label: `Open now · until ${hourLabel(close)}`, short: `Open · until ${hourLabel(close)}` };
    if (now < cutoff) return { tone: 'soon', ordering: true, cutoff, label: `Open · last orders at ${formatTime(cutoff)}`, short: `Last orders ${formatTime(cutoff)}` };
    return { tone: 'closed', ordering: false, next: tomorrow, label: `Kitchen closing · online orders reopen tomorrow at ${hourLabel(tomorrow)}`, short: 'Closed for orders' };
  }
  const next = now < open ? open : tomorrow;
  const when = now < open ? `today at ${hourLabel(next)}` : `tomorrow at ${hourLabel(next)}`;
  return { tone: 'closed', ordering: false, next, label: `Closed now · opens ${when}`, short: `Closed · opens ${now < open ? '' : 'tmrw '}${hourLabel(next)}` };
}

// Delivery slots are arrival times; pickup slots are ready times. 15-minute steps.
function slotsOn(day, mode, now = shopNow()) {
  const { open, close } = hoursOn(day);
  let first = plus(open, mode === 'delivery' ? 45 : 15);
  const soonest = ceilTo(plus(now, mode === 'delivery' ? 45 : 20), 15);
  if (soonest > first) first = soonest;
  const last = mode === 'delivery' ? close : plus(close, -15);
  const list = [];
  for (let t = first; t <= last; t = plus(t, 15)) list.push(t);
  return list;
}
function scheduleDays(mode, now = shopNow()) {
  return [0, 1].map((i) => {
    const day = addDays(at(now, 12), i);
    return { key: dayKey(day), label: `${i ? 'Tomorrow' : 'Today'}, ${formatDate(day)}`, slots: slotsOn(day, mode, now) };
  });
}
function resolveWhen(mode = state.mode) {
  const status = shopStatus();
  const days = scheduleDays(mode);
  const when = { ...state.when };
  if (when.type !== 'scheduled' && !status.ordering) when.type = 'scheduled';
  let slot = null;
  if (when.type === 'scheduled') {
    const day = days.find((d) => d.key === when.day && d.slots.length) || days.find((d) => d.slots.length);
    when.day = day.key;
    slot = day.slots.find((s) => timeKey(s) === when.time) || day.slots[0];
    when.time = timeKey(slot);
  }
  return { when, days, status, slot };
}
const asapWindow = (mode, now = shopNow()) => (mode === 'delivery' ? { from: plus(now, 30), to: plus(now, 45), text: '30–45 min' } : { from: plus(now, 15), to: plus(now, 20), text: '15–20 min' });

/* ----------------------------------------------------------- Menu and cart */
function proteinsFor(id) {
  const m = MENU[id];
  if (m.cat === 'tacos') return [['original', m.protein, 0], ['cauli', 'Cauliflower al pastor', 0, 'Vegan']];
  return id === 'bowl' ? BOWL_PROTEINS : [];
}
const hasExtras = (id) => ['tacos', 'bowls'].includes(MENU[id].cat) || id === 'chips-guac';
const hasSpice = (id) => ['tacos', 'bowls', 'sides'].includes(MENU[id].cat);
const hasFlavor = (id) => id === 'agua-fresca';

function unitPrice(line) {
  let cents = MENU[line.id].price;
  const protein = proteinsFor(line.id).find(([key]) => key === line.protein);
  if (protein) cents += protein[2];
  (line.extras || []).forEach((key) => { const extra = EXTRAS.find(([k]) => k === key); if (extra) cents += extra[2]; });
  return cents;
}
function lineSummary(line) {
  const parts = [];
  const protein = proteinsFor(line.id).find(([key]) => key === line.protein);
  if (protein && (line.id === 'bowl' || line.protein !== 'original')) parts.push(protein[1] + (protein[3] ? ' (vegan)' : ''));
  if (line.flavor) parts.push(FLAVORS.find(([k]) => k === line.flavor)?.[1]);
  (line.extras || []).forEach((key) => parts.push(EXTRAS.find(([k]) => k === key)?.[1]));
  if (line.spice) parts.push(`${line.spice} spice`);
  return parts.filter(Boolean).join(' · ');
}
const lineKey = (l) => [l.id, l.protein || '', l.flavor || '', [...(l.extras || [])].sort().join('+'), l.spice || '', (l.note || '').trim().toLowerCase()].join('|');

function addLine(line) {
  const clean = { id: line.id, qty: line.qty, protein: line.protein || '', flavor: line.flavor || '', extras: [...(line.extras || [])], spice: line.spice || '', note: (line.note || '').trim() };
  clean.key = lineKey(clean);
  const existing = state.cart.find((l) => l.key === clean.key);
  if (existing) existing.qty = clamp(existing.qty + clean.qty, 1, 30);
  else state.cart.push(clean);
}

function resolveTip(tip = state.tip, mode = state.mode) {
  if (tip?.type === 'custom') {
    const cents = Math.round(parseFloat(tip.amount) * 100);
    return { choice: 'custom', pct: null, cents: Number.isFinite(cents) && cents > 0 ? Math.min(cents, 20000) : 0 };
  }
  if (tip?.type === 'pct') return { choice: String(tip.pct), pct: tip.pct };
  const pct = mode === 'delivery' ? 18 : 0;
  return { choice: String(pct), pct };
}
function totals(cart = state.cart, mode = state.mode, tip = state.tip) {
  const subtotal = cart.reduce((sum, l) => sum + unitPrice(l) * l.qty, 0);
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const delivery = mode === 'delivery' && subtotal > 0 && subtotal < FREE_DELIVERY_AT ? DELIVERY_FEE : 0;
  const tax = Math.round((subtotal * TAX_RATE) / 100);
  const t = resolveTip(tip, mode);
  const tipCents = t.pct === null ? t.cents : Math.round((subtotal * t.pct) / 100);
  return { subtotal, count, delivery, tax, tip: tipCents, tipPct: t.pct, total: subtotal + delivery + tax + tipCents, toFree: Math.max(0, FREE_DELIVERY_AT - subtotal), toMin: Math.max(0, DELIVERY_MIN - subtotal) };
}

/* ------------------------------------------------------------- Components */
const stickerHtml = (m) => (m.stickers.length ? `<span class="stickers">${m.stickers.map((s, i) => `<span class="sticker sticker--${STICKERS[s][1]}" style="--r:${i ? 4 : -6}deg">${STICKERS[s][0]}</span>`).join('')}</span>` : '');
const tagsHtml = (m) => (m.tags.length ? `<ul class="tags" aria-label="Dietary notes">${m.tags.map((t) => `<li>${t}</li>`).join('')}</ul>` : '');

function dishCard(id, variant = 'row') {
  const m = MENU[id];
  const sizes = variant === 'fav' ? '(max-width: 640px) 78vw, (max-width: 1080px) 45vw, 300px' : '(max-width: 640px) 120px, 200px';
  return `
    <article class="dish dish--${variant}">
      <div class="dish-media-wrap"><div class="dish-media">${img(id, m.alt, { sizes })}</div>${stickerHtml(m)}</div>
      <div class="dish-body">
        <h3 class="dish-name"><button type="button" class="dish-open" data-action="open-item" data-id="${id}" aria-haspopup="dialog">${m.name}</button></h3>
        <p class="dish-portion">${m.portion}</p>
        <p class="dish-desc">${m.desc}</p>
        ${variant === 'row' ? tagsHtml(m) : ''}
        <div class="dish-foot"><span class="dish-price">${usd(m.price)}</span><span class="add-chip" aria-hidden="true">${icon.plus}<span>Add</span></span></div>
      </div>
    </article>`;
}

function modeToggle(prefix) {
  const btn = (mode, label, sub, glyph) => `<button type="button" class="mode-btn" id="${prefix}-${mode}" aria-pressed="${state.mode === mode}" data-action="set-mode" data-mode="${mode}">${glyph}<span class="mode-text"><span>${label}</span><small>${sub}</small></span></button>`;
  return `<div class="mode-toggle" role="group" aria-label="Delivery or pickup">${btn('delivery', 'Delivery', '30–45 min', icon.scooter)}${btn('pickup', 'Pickup', '15–20 min', icon.bag)}</div>`;
}
const modeNote = () => (state.mode === 'delivery'
  ? `Delivery to 9 Birmingham ZIPs · ${usd(DELIVERY_FEE)} fee, free on orders of $40+ · $15 minimum`
  : `Pickup at ${SHOP.street} · ready 15–20 minutes after you order`);

function freeMeter(t) {
  const pct = Math.min(100, Math.round((t.subtotal / FREE_DELIVERY_AT) * 100));
  return `<div class="meter ${t.toFree ? '' : 'is-full'}">
    <p>${t.toFree ? `<strong>${usd(t.toFree)}</strong> away from free delivery` : `${icon.check}<strong>Free delivery unlocked</strong>`}</p>
    <div class="meter-track" aria-hidden="true"><span style="width:${pct}%"></span></div>
  </div>`;
}
const minWarning = (t) => `<div class="notice notice-warn" id="min-warning"><p>Delivery orders start at ${usd(DELIVERY_MIN)}. Add <strong>${usd(t.toMin)}</strong> more, or <button type="button" class="text-btn" data-action="set-mode" data-mode="pickup">switch to pickup</button>.</p></div>`;

let qtyPulse = null; // { key, dir } so the changed quantity animates after a re-render
function stepper({ value, label, key, min = 1 }) {
  const pulse = qtyPulse && qtyPulse.key === key ? ` tick-${qtyPulse.dir}` : '';
  return `<div class="stepper" role="group" aria-label="${esc(label)}">
    <button type="button" class="step-btn" data-action="qty" data-key="${esc(key)}" data-delta="-1" aria-label="${value <= min ? 'Remove' : 'One less'}">${value <= min ? icon.trash : icon.minus}</button>
    <output class="step-val${pulse}">${value}</output>
    <button type="button" class="step-btn" data-action="qty" data-key="${esc(key)}" data-delta="1" aria-label="One more">${icon.plus}</button>
  </div>`;
}

function lineRow(l) {
  const m = MENU[l.id];
  const summary = lineSummary(l);
  return `
    <li class="line">
      <div class="line-thumb">${img(l.id, '', { sizes: '80px' })}</div>
      <div class="line-info">
        <div class="line-top"><strong>${m.name}</strong><span class="line-price">${usd(unitPrice(l) * l.qty)}</span></div>
        ${summary ? `<span class="line-opts">${esc(summary)}</span>` : ''}
        ${l.note ? `<span class="line-note">“${esc(l.note)}”</span>` : ''}
        <div class="line-row">${stepper({ value: l.qty, label: `Quantity of ${m.name}`, key: l.key })}<button type="button" class="text-btn line-remove" data-action="remove-line" data-key="${esc(l.key)}" aria-label="Remove ${esc(m.name)}">Remove</button></div>
      </div>
    </li>`;
}

const emptyPlate = `<svg class="empty-art" viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="96" rx="64" ry="12" fill="#f1cfa8"/><path d="M22 84a58 58 0 0 1 116 0Z" fill="#ffb22e"/><path d="M34 84a46 46 0 0 1 92 0" fill="none" stroke="#e39a1c" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/><circle cx="62" cy="70" r="5" fill="#231815"/><circle cx="98" cy="70" r="5" fill="#231815"/><path d="M70 82q10 -8 20 0" fill="none" stroke="#231815" stroke-width="4" stroke-linecap="round"/><path d="M40 60c4-10 10-14 16-14M120 60c-4-10-10-14-16-14" fill="none" stroke="#1f4d3a" stroke-width="5" stroke-linecap="round"/></svg>`;

/* ------------------------------------------------------------------ Views */
let cleanups = [];
const view = (fn) => (ctx) => { cleanups.forEach((stop) => stop()); cleanups = []; return fn(ctx); };

function home() {
  const status = shopStatus();
  const today = shopNow();
  const dishes = ['Tacos al pastor', 'Birria & consommé', 'Baja fish', 'Burrito bowls', 'Chips & guac', 'Elote', 'Horchata', 'Hibiscus', 'Churros'];
  const tape = (list) => `<div class="tape-track">${[...list, ...list].map((d) => `<span>${d}</span>${icon.spark}`).join('')}</div>`;
  return {
    title: 'Luna Taquería — Tacos, birria & bowls in Avondale, Birmingham',
    html: `
    <section class="hero">
      <div class="hero-media">${img('hero', 'Overhead spread of tacos al pastor, birria with consommé, chips and guacamole, salsas and a hibiscus agua fresca on a sunny red table', { eager: true, sizes: '100vw' })}</div>
      <div class="wrap hero-inner">
        <div class="hero-copy">
          <p class="status-chip tone-${status.tone}"><span class="status-dot"></span>${esc(status.label)}</p>
          <h1 class="display hero-title">Hot off the comal. <span class="hl">At your door.</span></h1>
          <p class="hero-lead">Family recipes and corn tortillas pressed every morning in Avondale. Delivery in 30–45 minutes, or pickup ready in 15–20.</p>
          <div class="hero-actions">
            <button type="button" class="btn btn-primary btn-lg" data-action="start-order" data-mode="delivery">${icon.scooter}Order delivery</button>
            <button type="button" class="btn btn-cream btn-lg" data-action="start-order" data-mode="pickup">${icon.bag}Order pickup</button>
          </div>
          <form class="zip-check" data-form="zip-check" novalidate>
            <label for="zip-q">Do we deliver to you?</label>
            <div class="zip-row">
              <input id="zip-q" name="zip" autocomplete="postal-code" placeholder="Street address or ZIP" value="${esc(state.details.zip || '')}" required data-required="Enter your ZIP code, like 35222." pattern=".*\\d{5}.*" data-pattern-message="Include your 5-digit ZIP code, like 35222.">
              <button class="btn btn-ink" type="submit">Check</button>
            </div>
            <div class="zip-result" id="zip-result" aria-live="polite"></div>
          </form>
        </div>
      </div>
    </section>

    <div class="tapes" aria-hidden="true">
      <div class="tape tape-back">${tape([...dishes].reverse())}</div>
      <div class="tape tape-front">${tape(dishes)}</div>
    </div>

    <section class="section favorites" aria-labelledby="fav-title">
      <div class="wrap">
        <div class="section-head">
          <div><p class="eyebrow">Fan favorites</p><h2 class="display" id="fav-title">The ones everybody orders</h2></div>
          <a class="link-arrow" href="#/menu">See the full menu ${icon.arrow}</a>
        </div>
        <div class="fav-grid">${['al-pastor', 'birria', 'baja-fish', 'chips-guac'].map((id) => dishCard(id, 'fav')).join('')}</div>
      </div>
    </section>

    <section class="how" aria-labelledby="how-title">
      <div class="scallop" aria-hidden="true"></div>
      <div class="how-body">
        <div class="wrap">
          <p class="eyebrow">How it works</p>
          <h2 class="display" id="how-title">From our comal to your couch</h2>
          <ol class="how-steps">
            <li><span class="how-num">1</span><h3>Build your plate</h3><p>Tacos, bowls, sides and aguas frescas. Swap in cauliflower al pastor, pick your heat, add extra guac.</p></li>
            <li><span class="how-num">2</span><h3>Delivery or pickup</h3><p>We deliver to nine Birmingham ZIP codes in 30–45 minutes. Pickup orders are ready in 15–20.</p></li>
            <li><span class="how-num">3</span><h3>Watch it come to you</h3><p>Follow your order from the kitchen to your door, then pay at the door or at the counter.</p></li>
          </ol>
        </div>
      </div>
      <div class="scallop scallop-flip" aria-hidden="true"></div>
    </section>

    <section class="section kitchen" aria-labelledby="kitchen-title">
      <div class="wrap kitchen-grid">
        <figure class="kitchen-media">${img('kitchen', 'A cook shaving al pastor from the spinning trompo in Luna’s open kitchen', { sizes: '(max-width: 900px) 100vw, 640px' })}<span class="sticker sticker--fav sticker-big" style="--r:-8deg">Pressed daily</span></figure>
        <div class="kitchen-copy">
          <p class="eyebrow">Our kitchen</p>
          <h2 class="display" id="kitchen-title">Tortillas pressed every single morning.</h2>
          <p>Carmen starts pressing masa at seven, hours before the doors open at 11. By lunch the trompo is spinning, the pineapple is charring and the birria has been braising since sunrise. The recipes are the Morales family’s, and nothing comes out of a bag.</p>
          <ul class="check-list">
            <li>${icon.check}Corn tortillas are gluten-free</li>
            <li>${icon.check}Beans cooked without lard</li>
            <li>${icon.check}Any taco plate can go vegan, free</li>
          </ul>
          <a class="link-arrow" href="#/about">Our story and hours ${icon.arrow}</a>
        </div>
      </div>
    </section>

    <section class="teaser" aria-labelledby="teaser-title">
      <div class="wave" aria-hidden="true"></div>
      <div class="teaser-body">
        <div class="wrap teaser-grid">
          <div class="teaser-copy">
            <p class="eyebrow">Catering</p>
            <h2 class="display" id="teaser-title">Feeding 15?<br>Feeding 150?</h2>
            <p>Taco bars and fiesta spreads for offices, birthdays and backyard parties. Give us 48 hours and we’ll handle the rest, including delivery and setup.</p>
            <div class="price-tags">
              <div class="price-tag"><strong>$15</strong><span>Taco Bar<br>per person</span></div>
              <div class="price-tag price-tag--red"><strong>$19</strong><span>Fiesta Spread<br>per person</span></div>
            </div>
            <a class="btn btn-primary" href="#/catering">Plan your catering ${icon.arrow}</a>
          </div>
          <div class="teaser-photos" aria-hidden="true">
            <div class="polaroid p1">${img('chips-guac', '', { sizes: '260px' })}</div>
            <div class="polaroid p2">${img('elote', '', { sizes: '260px' })}</div>
            <div class="polaroid p3">${img('bowl', '', { sizes: '260px' })}</div>
          </div>
        </div>
      </div>
      <div class="wave wave-flip" aria-hidden="true"></div>
    </section>

    <section class="section reviews" aria-labelledby="reviews-title">
      <div class="wrap">
        <div class="section-head">
          <div><p class="eyebrow">Neighbors say</p><h2 class="display" id="reviews-title">Regulars, in their own words</h2></div>
          <p class="sample-note">Sample reviews written for this demo</p>
        </div>
        <div class="review-grid">
          ${REVIEWS.map((r, i) => `
            <figure class="review review-${i + 1}">
              <div class="stars" aria-label="5 out of 5 stars">${icon.star.repeat(5)}</div>
              <blockquote>${r.text}</blockquote>
              <figcaption><strong>${r.name}</strong><span>${r.area} · ${r.dish}</span></figcaption>
            </figure>`).join('')}
        </div>
      </div>
    </section>

    <section class="section-tight visit-strip" aria-labelledby="visit-title">
      <div class="wrap">
        <div class="visit-band">
          <div><h2 class="display" id="visit-title">Come say hola.</h2><p>${SHOP.street}, two blocks from Avondale Park.</p></div>
          <dl>
            <div><dt>Today</dt><dd>${hoursText(today)}</dd></div>
            <div><dt>Call</dt><dd><a href="tel:${SHOP.tel}">${SHOP.phone}</a></dd></div>
          </dl>
          <a class="btn btn-ink" href="#/about">Hours &amp; directions</a>
        </div>
      </div>
    </section>`,
  };
}

function menuPage() {
  const status = shopStatus();
  return {
    title: 'Menu — Luna Taquería',
    html: `
    <section class="page-head menu-head">
      <div class="wrap menu-head-inner">
        <div>
          <p class="eyebrow">Order online</p>
          <h1 class="display">The menu</h1>
          <p class="lead">Tacos on tortillas we press every morning, big bowls, sides for the table, aguas frescas and warm churros.</p>
        </div>
        <div class="order-panel">
          ${modeToggle('menu')}
          <p class="order-note" id="menu-mode-note">${modeNote()}</p>
          <p class="status-chip tone-${status.tone}"><span class="status-dot"></span>${esc(status.label)}</p>
        </div>
      </div>
    </section>
    <nav class="cat-nav" aria-label="Menu categories">
      <div class="wrap cat-nav-inner">${CATEGORIES.map(([id, label], i) => `<button type="button" class="cat-tab${i ? '' : ' is-active'}" id="tab-${id}" data-action="jump" data-cat="${id}"${i ? '' : ' aria-current="true"'}>${label}</button>`).join('')}</div>
    </nav>
    <div class="wrap menu-body">
      ${CATEGORIES.map(([cat, label]) => {
        const ids = Object.keys(MENU).filter((id) => MENU[id].cat === cat);
        return `
        <section class="menu-section" id="cat-${cat}" aria-labelledby="h-${cat}">
          <div class="menu-section-head"><h2 class="display" id="h-${cat}" tabindex="-1">${label}</h2><p>${CATEGORY_NOTES[cat]}</p></div>
          <div class="dish-grid">${ids.map((id) => dishCard(id)).join('')}${menuTile(cat, ids.length)}</div>
        </section>`;
      }).join('')}
    </div>
    <div class="cart-bar-slot" id="cart-bar-slot">${cartBar()}</div>`,
    mount: mountMenu,
  };
}

// Odd-numbered categories get a small info tile so the two-column grid stays full.
function menuTile(cat, count) {
  if (count % 2 === 0) return '';
  const tiles = {
    tacos: ['tile-green', 'Go vegan, free', 'Swap any taco plate to cauliflower al pastor at no charge. Corn tortillas are gluten-free; the Baja fish is beer-battered.'],
    bowls: ['tile-marigold', 'Pick your protein', 'Grilled chicken, al pastor, carne asada (+$2.00) or cauliflower al pastor, which is vegan. Rice, beans, corn, pico, avocado and crema come on every bowl.'],
    drinks: ['tile-coral', 'Three flavors, every day', 'Hibiscus is tart and ruby red, horchata is creamy rice and cinnamon, tamarind is sweet and tangy.'],
    sweets: ['tile-ink', 'Fried to order', 'Churros are dusted with cinnamon sugar while they are hot. The chocolate sauce rides along on the side for dunking.'],
  };
  const [cls, title, text] = tiles[cat] || ['tile-green', '', ''];
  return `<aside class="menu-tile ${cls}"><h3>${title}</h3><p>${text}</p></aside>`;
}

function cartBar() {
  const t = totals();
  if (!t.count) return '';
  return `<button type="button" class="cart-bar" data-action="open-cart" id="cart-bar">${icon.bag}<span class="cart-bar-label">View order</span><span class="cart-bar-count">${plural(t.count, 'item')}</span><strong>${usd(t.subtotal)}</strong></button>`;
}

function mountMenu(root) {
  const tabs = [...root.querySelectorAll('.cat-tab')];
  const nav = root.querySelector('.cat-nav-inner');
  const sections = CATEGORIES.map(([id]) => document.getElementById(`cat-${id}`));
  let current = '';
  const setActive = (id) => {
    if (id === current) return;
    current = id;
    tabs.forEach((tab) => {
      const on = tab.dataset.cat === id;
      tab.classList.toggle('is-active', on);
      if (on) {
        tab.setAttribute('aria-current', 'true');
        const left = tab.offsetLeft - 16;
        if (left < nav.scrollLeft || tab.offsetLeft + tab.offsetWidth > nav.scrollLeft + nav.clientWidth) nav.scrollTo({ left, behavior: reducedMotion() ? 'auto' : 'smooth' });
      } else tab.removeAttribute('aria-current');
    });
  };
  let ticking = false;
  const spy = () => {
    ticking = false;
    const line = (root.querySelector('.cat-nav')?.getBoundingClientRect().bottom || 0) + 80;
    let active = sections[0].id;
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= line) active = s.id; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) active = sections[sections.length - 1].id;
    setActive(active.replace('cat-', ''));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } };
  addEventListener('scroll', onScroll, { passive: true });
  cleanups.push(() => removeEventListener('scroll', onScroll));
  spy();
  document.body.classList.toggle('has-cart-bar', totals().count > 0);
  cleanups.push(() => document.body.classList.remove('has-cart-bar'));
}

function openItem(id) {
  const m = MENU[id];
  if (!m) return;
  const proteins = proteinsFor(id);
  const draft = { id, qty: 1, protein: proteins[0]?.[0] || '', flavor: hasFlavor(id) ? 'hibiscus' : '', extras: [], spice: hasSpice(id) ? 'Medium' : '', note: '' };
  const proteinPrice = (delta, i) => (delta ? `+${usd(delta)}` : m.cat === 'tacos' && i ? 'No charge' : 'Included');
  const html = `
    <form class="item-form" novalidate>
      <div class="item-scroll">
        <div class="item-media">${img(id, m.alt, { sizes: '(max-width: 640px) 100vw, 580px' })}${stickerHtml(m)}<button type="button" class="dialog-x" data-close aria-label="Close">${icon.close}</button></div>
        <div class="item-body">
          <h2 id="item-title" class="display">${m.name}</h2>
          <p class="item-meta">${m.portion} · ${usd(m.price)}</p>
          <p class="item-desc">${m.desc}</p>
          ${tagsHtml(m)}
          ${proteins.length ? `
            <fieldset class="opt-group">
              <legend>Protein <span class="opt-hint">Choose 1</span></legend>
              ${proteins.map(([key, label, delta, badge], i) => `<label class="opt"><input type="radio" name="protein" value="${key}" ${i ? '' : 'checked'}><span class="opt-label">${label}${badge ? ` <span class="mini-badge">${badge}</span>` : ''}${m.cat === 'tacos' && !i ? ' <span class="opt-sub">(original)</span>' : ''}</span><span class="opt-price">${proteinPrice(delta, i)}</span></label>`).join('')}
            </fieldset>` : ''}
          ${hasFlavor(id) ? `
            <fieldset class="opt-group">
              <legend>Flavor <span class="opt-hint">Choose 1</span></legend>
              ${FLAVORS.map(([key, label, color], i) => `<label class="opt"><input type="radio" name="flavor" value="${key}" ${i ? '' : 'checked'}><span class="swatch" style="background:${color}" aria-hidden="true"></span><span class="opt-label">${label}</span></label>`).join('')}
            </fieldset>` : ''}
          ${hasExtras(id) ? `
            <fieldset class="opt-group">
              <legend>Extras <span class="opt-hint">Optional</span></legend>
              ${EXTRAS.map(([key, label, delta]) => `<label class="opt"><input type="checkbox" name="extras" value="${key}"><span class="opt-label">${label}</span><span class="opt-price">+${usd(delta)}</span></label>`).join('')}
            </fieldset>` : ''}
          ${hasSpice(id) ? `
            <fieldset class="opt-group">
              <legend>Spice level</legend>
              <div class="spice-row">${SPICE.map((s, i) => `<label class="spice"><input type="radio" name="spice" value="${s}" ${s === 'Medium' ? 'checked' : ''}><span>${icon.chili.repeat(i + 1)}<b>${s}</b></span></label>`).join('')}</div>
            </fieldset>` : ''}
          <div class="field">
            <label for="item-note">Special instructions <span class="optional">(optional)</span></label>
            <textarea id="item-note" name="note" rows="2" maxlength="140" placeholder="No onions, extra lime, sauce on the side…"></textarea>
          </div>
        </div>
      </div>
      <div class="item-foot">
        <div class="stepper stepper-lg" role="group" aria-label="Quantity">
          <button type="button" class="step-btn" data-delta="-1" aria-label="One less" aria-disabled="true">${icon.minus}</button>
          <output class="step-val" id="item-qty">1</output>
          <button type="button" class="step-btn" data-delta="1" aria-label="One more">${icon.plus}</button>
        </div>
        <button type="submit" class="btn btn-primary btn-add"><span>Add to order</span><span class="btn-price" id="item-price">${usd(m.price)}</span></button>
      </div>
    </form>`;
  const { dialog, close } = modal(html, { className: 'bl-dialog item-dialog', labelledBy: 'item-title' });
  const form = dialog.querySelector('form');
  const qtyNode = dialog.querySelector('#item-qty');
  const priceNode = dialog.querySelector('#item-price');
  const [less, more] = dialog.querySelectorAll('.item-foot .step-btn');
  const read = () => {
    draft.protein = form.querySelector('[name="protein"]:checked')?.value || '';
    draft.flavor = form.querySelector('[name="flavor"]:checked')?.value || '';
    draft.extras = [...form.querySelectorAll('[name="extras"]:checked')].map((box) => box.value);
    draft.spice = form.querySelector('[name="spice"]:checked')?.value || '';
    draft.note = form.note.value;
  };
  const refresh = () => {
    read();
    priceNode.textContent = usd(unitPrice(draft) * draft.qty);
    less.setAttribute('aria-disabled', String(draft.qty <= 1));
    more.setAttribute('aria-disabled', String(draft.qty >= 20));
  };
  form.addEventListener('change', refresh);
  form.addEventListener('input', refresh);
  form.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delta]');
    if (!button) return;
    const next = clamp(draft.qty + Number(button.dataset.delta), 1, 20);
    if (next === draft.qty) return;
    const dir = next > draft.qty ? 'up' : 'down';
    draft.qty = next;
    qtyNode.textContent = next;
    qtyNode.classList.remove('tick-up', 'tick-down');
    void qtyNode.offsetWidth;
    qtyNode.classList.add(`tick-${dir}`);
    refresh();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    read();
    addLine(draft);
    save();
    close();
    cartChanged({ bump: true });
    toast(`Added ${draft.qty} × ${m.name} to your order.`);
  });
}

function checkoutPage() {
  if (!state.cart.length) {
    return {
      title: 'Checkout — Luna Taquería',
      html: `<section class="section"><div class="wrap narrow center empty-state">${emptyPlate}<h1 class="display">Your order is empty</h1><p class="lead">The tortillas are warm and the trompo is turning. Pick something good and come back here to check out.</p><a class="btn btn-primary btn-lg" href="#/menu">Browse the menu</a></div></section>`,
    };
  }
  const delivery = state.mode === 'delivery';
  const { when, days, status } = resolveWhen();
  const d = state.details;
  const tip = resolveTip();
  const t = totals();
  const asap = asapWindow(state.mode);
  const day = days.find((x) => x.key === when.day);
  return {
    title: 'Checkout — Luna Taquería',
    html: `
    <section class="page-head checkout-head">
      <div class="wrap"><a class="back-link" href="#/menu">← Keep browsing the menu</a><h1 class="display">Checkout</h1></div>
    </section>
    <form class="wrap checkout-grid" data-form="checkout" novalidate>
      <div class="checkout-main">
        <section class="co-card" aria-labelledby="co-how">
          <h2 id="co-how"><span class="co-num">1</span>Delivery or pickup?</h2>
          ${modeToggle('co')}
          ${delivery ? `
            <div class="field-grid">
              <div class="field span-2"><label for="co-street">Street address</label><input id="co-street" name="street" autocomplete="address-line1" placeholder="1234 5th Ave S" value="${esc(d.street)}" required data-required="Enter the street address for delivery." data-input="detail"></div>
              <div class="field"><label for="co-apt">Apt, suite or floor <span class="optional">(optional)</span></label><input id="co-apt" name="apt" autocomplete="address-line2" value="${esc(d.apt)}" data-input="detail"></div>
              <div class="field"><label for="co-zip">ZIP code</label><input id="co-zip" name="zip" inputmode="numeric" autocomplete="postal-code" maxlength="5" value="${esc(d.zip)}" required data-required="Enter your 5-digit ZIP code." pattern="\\d{5}" data-pattern-message="Enter a 5-digit ZIP code, like 35222." data-input="zip"></div>
            </div>
            <p class="city-line">${icon.pin}<span>Birmingham, AL · we deliver to ${DELIVERY_ZIPS.join(', ')}</span></p>
            <div id="zip-status" aria-live="polite">${zipStatus(d.zip)}</div>` : `
            <div class="pickup-card">${icon.pin}<div><strong>Pick up at Luna Taquería</strong><span>${SHOP.street}, ${SHOP.city}</span><span>Park on Marigold Ave, come to the counter and give the name on the order.</span></div></div>`}
        </section>

        <section class="co-card" aria-labelledby="co-when">
          <h2 id="co-when"><span class="co-num">2</span>When do you want it?</h2>
          <div class="choice-row">
            <label class="choice ${status.ordering ? '' : 'is-disabled'}"><input type="radio" name="whenType" id="when-asap" value="asap" ${when.type === 'asap' ? 'checked' : ''} ${status.ordering ? '' : 'disabled'} data-change="when-type"><span><strong>${icon.bolt}ASAP</strong><small>${status.ordering ? `${asap.text} · ${delivery ? 'arrives' : 'ready'} by about ${formatTime(asap.to)}` : 'Not available while we’re closed'}</small></span></label>
            <label class="choice"><input type="radio" name="whenType" id="when-later" value="scheduled" ${when.type === 'scheduled' ? 'checked' : ''} data-change="when-type"><span><strong>${icon.clock}Schedule</strong><small>Pick a time today or tomorrow</small></span></label>
          </div>
          ${!status.ordering ? `<p class="notice notice-info">${esc(status.label)}. Choose a time below and we’ll have it ${delivery ? 'at your door' : 'ready'} right on schedule.</p>` : ''}
          ${when.type === 'scheduled' ? `
            <div class="field-grid">
              <div class="field"><label for="co-day">Day</label><select id="co-day" name="day" data-change="when-day">${days.map((x) => `<option value="${x.key}" ${x.key === when.day ? 'selected' : ''} ${x.slots.length ? '' : 'disabled'}>${x.label}${x.slots.length ? '' : ' (no times left)'}</option>`).join('')}</select></div>
              <div class="field"><label for="co-time">${delivery ? 'Delivery time' : 'Pickup time'}</label><select id="co-time" name="time" data-change="when-time">${day.slots.map((s) => `<option value="${timeKey(s)}" ${timeKey(s) === when.time ? 'selected' : ''}>${formatTime(s)}</option>`).join('')}</select></div>
            </div>` : ''}
          <p class="fine">Times are Birmingham time. We’re open ${hoursText(shopNow())} today; last orders ${LAST_ORDER_MIN} minutes before close.</p>
        </section>

        <section class="co-card" aria-labelledby="co-you">
          <h2 id="co-you"><span class="co-num">3</span>Your details</h2>
          <div class="field-grid">
            <div class="field"><label for="co-name">Name</label><input id="co-name" name="name" autocomplete="name" value="${esc(d.name)}" required data-required="Enter your name so we know whose order it is." data-input="detail"></div>
            <div class="field"><label for="co-phone">Mobile phone</label><input id="co-phone" name="phone" type="tel" autocomplete="tel" placeholder="(205) 555-0100" value="${esc(d.phone)}" required data-required="Enter a phone number in case ${delivery ? 'the driver' : 'the kitchen'} needs to reach you." data-input="detail"></div>
            <div class="field span-2"><label for="co-email">Email <span class="optional">(optional, for your receipt)</span></label><input id="co-email" name="email" type="email" autocomplete="email" value="${esc(d.email)}" data-input="detail"></div>
            <div class="field span-2"><label for="co-notes">${delivery ? 'Delivery notes' : 'Pickup notes'} <span class="optional">(optional)</span></label><textarea id="co-notes" name="notes" rows="3" maxlength="240" placeholder="${delivery ? 'Gate code, which door, leave it on the porch…' : 'Running late? Someone else picking up?'}" data-input="detail">${esc(d.notes)}</textarea></div>
          </div>
        </section>

        <section class="co-card" aria-labelledby="co-tip">
          <h2 id="co-tip"><span class="co-num">4</span>${delivery ? 'Tip your driver' : 'Tip the kitchen crew'} <span class="optional">(optional)</span></h2>
          <div class="tip-row">
            ${TIP_PRESETS.map((p) => `<label class="tip"><input type="radio" name="tip" id="tip-${p}" value="${p}" ${tip.choice === String(p) ? 'checked' : ''} data-change="tip"><span><strong>${p ? `${p}%` : 'No tip'}</strong><small>${usd(Math.round((t.subtotal * p) / 100))}</small></span></label>`).join('')}
            <label class="tip"><input type="radio" name="tip" id="tip-custom" value="custom" ${tip.choice === 'custom' ? 'checked' : ''} data-change="tip"><span><strong>Custom</strong><small>Your call</small></span></label>
          </div>
          ${tip.choice === 'custom' ? `<div class="field tip-custom"><label for="co-tip-amount">Custom tip</label><div class="money-input"><span aria-hidden="true">$</span><input id="co-tip-amount" name="tipAmount" type="number" inputmode="decimal" min="0" max="200" step="0.01" value="${esc(state.tip?.amount ?? '')}" required data-required="Enter a tip amount, or choose No tip." data-range-message="Enter a tip between $0 and $200." data-input="tip-amount"></div></div>` : ''}
          <p class="fine">${delivery ? 'Every cent of the tip goes to your driver.' : 'Tips are shared by everyone in the kitchen.'} Percentages are figured on the food subtotal.</p>
        </section>
      </div>
      <aside class="checkout-side" aria-label="Order summary"><div id="summary">${summaryHtml()}</div></aside>
    </form>`,
  };
}

function zipStatus(zip) {
  if (!/^\d{5}$/.test(zip || '')) return '';
  if (DELIVERY_ZIPS.includes(zip)) return `<p class="notice notice-ok">${icon.check}Good news: we deliver to ${zip}. Expect your order in 30–45 minutes.</p>`;
  return `<div class="notice notice-warn zip-out"><p><strong>We don’t deliver to ${esc(zip)} yet.</strong> Our drivers stay close to Avondale so every taco arrives hot. Pickup is ready 15–20 minutes after you order at ${SHOP.street}.</p><button type="button" class="btn btn-ink btn-sm" data-action="set-mode" data-mode="pickup">Switch to pickup</button></div>`;
}

function summaryHtml() {
  const t = totals();
  const delivery = state.mode === 'delivery';
  return `
    <div class="summary-card">
      <div class="summary-head"><h2 class="display">Your order</h2><button type="button" class="text-btn" data-action="open-cart">Edit</button></div>
      <ul class="sum-lines">${state.cart.map((l) => {
        const summary = lineSummary(l);
        return `<li><span class="sum-qty">${l.qty}×</span><span class="sum-name">${MENU[l.id].name}${summary ? `<small>${esc(summary)}</small>` : ''}${l.note ? `<small class="sum-note">“${esc(l.note)}”</small>` : ''}</span><span class="sum-price">${usd(unitPrice(l) * l.qty)}</span></li>`;
      }).join('')}</ul>
      ${delivery ? freeMeter(t) : ''}
      <dl class="sum-totals">
        <div><dt>Subtotal</dt><dd>${usd(t.subtotal)}</dd></div>
        <div><dt>${delivery ? 'Delivery fee' : 'Pickup'}</dt><dd>${delivery && t.delivery ? usd(t.delivery) : '<span class="free">Free</span>'}</dd></div>
        <div><dt>Tax (${TAX_RATE}%)</dt><dd>${usd(t.tax)}</dd></div>
        <div><dt>Tip${t.tipPct !== null ? ` (${t.tipPct}%)` : ''}</dt><dd>${usd(t.tip)}</dd></div>
        <div class="sum-total"><dt>Total</dt><dd>${usd(t.total)}</dd></div>
      </dl>
      ${delivery && t.toMin ? minWarning(t) : ''}
      <button class="btn btn-primary btn-block btn-lg" type="submit">Place order · ${usd(t.total)}</button>
      <p class="pay-note">${icon.cash}<span>Pay at the door or at pickup — demo, nothing is charged.</span></p>
      <p class="fine center">No service fees, no surprises.</p>
    </div>`;
}
const refreshSummary = () => { const node = document.getElementById('summary'); if (node) node.innerHTML = summaryHtml(); };

/* ------------------------------------------------------- Tracking & orders */
function trackProgress(o) {
  const elapsed = Math.max(0, Date.now() - o.startedAt);
  return { elapsed, step: Math.min(3, Math.floor(elapsed / STEP_MS)), leg: clamp((elapsed - 2 * STEP_MS) / STEP_MS, 0, 1), done: elapsed >= 3 * STEP_MS };
}
function stepsFor(o) {
  const name = firstName(o.details.name);
  return o.mode === 'delivery' ? [
    { short: 'Received', title: 'Order received', sub: `Thanks, ${name}! Your ticket just printed in the kitchen.`, glyph: icon.receipt },
    { short: 'Cooking', title: 'Cooking your order', sub: 'Tortillas are on the comal and the trompo is turning.', glyph: icon.flame },
    { short: 'On the way', title: 'Out for delivery', sub: 'Rosa is on the way with your order.', glyph: icon.scooter },
    { short: 'Delivered', title: 'Delivered', sub: '¡Buen provecho! Your order was handed off at the door.', glyph: icon.check },
  ] : [
    { short: 'Received', title: 'Order received', sub: `Thanks, ${name}! Your ticket just printed in the kitchen.`, glyph: icon.receipt },
    { short: 'Cooking', title: 'Cooking your order', sub: 'Tortillas are on the comal and the trompo is turning.', glyph: icon.flame },
    { short: 'Ready', title: 'Ready for pickup', sub: `Bagged and waiting at the counter under “${name}”.`, glyph: icon.bag },
    { short: 'Picked up', title: 'Picked up', sub: 'Thanks for eating with us. See you next time!', glyph: icon.check },
  ];
}
const statusLabel = (o) => stepsFor(o)[trackProgress(o).step].short;

function mapSvg(o) {
  const delivery = o.mode === 'delivery';
  const xs = [-30, 90, 250, 410, 570, 670];
  const ys = [-30, 70, 200, 330, 430];
  let blocks = '';
  for (let i = 0; i < xs.length - 1; i += 1) {
    for (let j = 0; j < ys.length - 1; j += 1) {
      if (i === 2 && j === 2) continue; // the park
      const x = xs[i] + 13; const y = ys[j] + 13;
      blocks += `<rect x="${x}" y="${y}" width="${xs[i + 1] - xs[i] - 26}" height="${ys[j + 1] - ys[j] - 26}" rx="12"/>`;
    }
  }
  const route = 'M90 330 H232 Q250 330 250 312 V218 Q250 200 268 200 H392 Q410 200 410 182 V88 Q410 70 428 70 H570';
  return `
    <svg class="map-svg" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${delivery ? 'Map of the route from Luna Taquería to your address' : 'Map showing Luna Taquería on Marigold Ave S'}">
      <rect x="0" y="0" width="640" height="400" fill="#fff3e2"/>
      <g fill="#f8dcbc">${blocks}</g>
      <rect x="263" y="213" width="134" height="104" rx="18" fill="#c5e0b8"/>
      <g fill="#8fbf8a"><circle cx="290" cy="240" r="9"/><circle cx="312" cy="232" r="7"/><circle cx="372" cy="292" r="10"/><circle cx="350" cy="300" r="6"/><circle cx="378" cy="236" r="6"/></g>
      <path d="M0 200 H640" stroke="#f1c996" stroke-width="2" stroke-dasharray="10 10"/>
      <g class="map-label"><text x="480" y="334" text-anchor="middle">MARIGOLD AVE S</text><text x="160" y="204" text-anchor="middle">5TH AVE S</text><text x="330" y="74" text-anchor="middle">3RD AVE S</text><text transform="translate(254 138) rotate(-90)" text-anchor="middle">41ST ST S</text><text class="park-label" x="330" y="272" text-anchor="middle">AVONDALE PARK</text></g>
      ${delivery ? `
        <path id="route-path" d="${route}" fill="none" stroke="#231815" stroke-opacity=".22" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 13"/>
        <path id="route-done" d="${route}" pathLength="1" fill="none" stroke="#e5412d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 1" stroke-dashoffset="1"/>
        <g transform="translate(570 70)"><circle r="23" fill="#1f4d3a" stroke="#fff4e6" stroke-width="4"/><path d="M-9 1 0-8 9 1M-6-1v9h12v-9" fill="none" stroke="#fff4e6" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>
        <text class="pin-label" x="570" y="116" text-anchor="middle">YOU</text>` : ''}
      <g transform="translate(90 330)">
        ${delivery ? '' : '<circle class="pulse-ring" r="23" fill="#e5412d" opacity=".35"/>'}
        <circle r="23" fill="#e5412d" stroke="#fff4e6" stroke-width="4"/><path d="M3-12a12 12 0 1 0 9 19A10 10 0 0 1 3-12z" fill="#ffb22e"/>
      </g>
      <text class="pin-label" x="90" y="376" text-anchor="middle">LUNA</text>
      ${delivery ? `<g id="scooter" transform="translate(90 330)"><g class="scooter-bob"><circle r="19" fill="#ffb22e" stroke="#231815" stroke-width="3"/><g transform="translate(-10 -10) scale(.85)" fill="none" stroke="#231815" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17" r="2.5"/><circle cx="18.5" cy="17" r="2.5"/><path d="M8 17h6l3-8h2M15 9l3.5 8M4 12h6l2 5"/></g></g></g>` : ''}
    </svg>`;
}

function trackingPage({ params }) {
  const o = state.orders.find((x) => x.ref === params.ref);
  if (!o) return null;
  const delivery = o.mode === 'delivery';
  const steps = stepsFor(o);
  const t = o.totals;
  return {
    title: `Order ${o.ref} — Luna Taquería`,
    html: `
    <section class="track-head">
      <div class="wrap">
        <p class="eyebrow">Order ${esc(o.ref)} · ${delivery ? 'Delivery' : 'Pickup'} · ${esc(o.when.label)}</p>
        <h1 class="display" id="track-title">${steps[0].title}</h1>
        <p class="lead" id="track-sub">${esc(steps[0].sub)}</p>
        <p class="demo-chip">${icon.bolt}<span>Demo tracking runs faster than real life: each step takes about ${STEP_MS / 1000} seconds.</span></p>
        <ol class="track-steps" id="track-steps">
          ${steps.map((s, i) => `<li class="track-step" data-step="${i}"><span class="track-dot">${s.glyph}</span><span class="track-label">${s.short}</span></li>`).join('')}
        </ol>
        <p class="visually-hidden" id="track-live" aria-live="polite"></p>
      </div>
    </section>
    <section class="section-tight track-section">
      <div class="wrap track-grid">
        <div class="track-main">
          <div class="map-card">
            ${mapSvg(o)}
            <div class="eta-chip"><span class="eta-big" id="eta-big">–</span><span class="eta-small" id="eta-small"></span></div>
          </div>
          ${delivery ? `
            <div class="driver-card">
              <span class="driver-avatar" aria-hidden="true">R</span>
              <div class="driver-text"><strong id="driver-title">Rosa will deliver your order</strong><span>Red scooter · knows every shortcut in Avondale</span></div>
              <span class="driver-rating">${icon.star}4.9</span>
            </div>
            <p class="fine">Rosa is a fictional driver for this demo.</p>` : `
            <div class="driver-card pickup">
              <span class="driver-avatar" aria-hidden="true">${icon.pin}</span>
              <div class="driver-text"><strong>${SHOP.street}</strong><span>Park on Marigold Ave and head to the counter. Say the name on the order: ${esc(firstName(o.details.name))}.</span></div>
            </div>`}
        </div>
        <aside class="track-side">
          <div class="summary-card">
            <div class="summary-head"><h2 class="display">Order summary</h2></div>
            <ul class="sum-lines">${o.lines.map((l) => `<li><span class="sum-qty">${l.qty}×</span><span class="sum-name">${esc(l.name)}${l.summary ? `<small>${esc(l.summary)}</small>` : ''}${l.note ? `<small class="sum-note">“${esc(l.note)}”</small>` : ''}</span><span class="sum-price">${usd(l.unit * l.qty)}</span></li>`).join('')}</ul>
            <dl class="sum-totals">
              <div><dt>Subtotal</dt><dd>${usd(t.subtotal)}</dd></div>
              <div><dt>${delivery ? 'Delivery fee' : 'Pickup'}</dt><dd>${t.delivery ? usd(t.delivery) : '<span class="free">Free</span>'}</dd></div>
              <div><dt>Tax (${TAX_RATE}%)</dt><dd>${usd(t.tax)}</dd></div>
              <div><dt>Tip${t.tipPct !== null ? ` (${t.tipPct}%)` : ''}</dt><dd>${usd(t.tip)}</dd></div>
              <div class="sum-total"><dt>Total due</dt><dd>${usd(t.total)}</dd></div>
            </dl>
            <dl class="order-facts">
              <div><dt>${delivery ? 'Delivering to' : 'Pickup at'}</dt><dd>${delivery ? `${esc(o.details.street)}${o.details.apt ? `, ${esc(o.details.apt)}` : ''}<br>Birmingham, AL ${esc(o.details.zip)}` : `${SHOP.street}<br>${SHOP.city}`}</dd></div>
              <div><dt>Contact</dt><dd>${esc(o.details.name)}<br>${esc(o.details.phone)}</dd></div>
              ${o.details.notes ? `<div><dt>Notes</dt><dd>${esc(o.details.notes)}</dd></div>` : ''}
            </dl>
            <p class="pay-note">${icon.cash}<span>Pay ${delivery ? 'at the door' : 'at pickup'} — demo order, nothing was charged.</span></p>
          </div>
          <div class="track-actions">
            <button type="button" class="btn btn-primary" data-action="order-again" data-ref="${esc(o.ref)}">Order again</button>
            <a class="btn btn-ghost" href="#/orders">All orders</a>
          </div>
          <button type="button" class="text-btn replay" data-action="replay" data-ref="${esc(o.ref)}">Replay the demo tracking</button>
        </aside>
      </div>
    </section>`,
    mount: () => startTracking(o),
  };
}

function startTracking(o) {
  const steps = stepsFor(o);
  const delivery = o.mode === 'delivery';
  const route = document.getElementById('route-path');
  const done = document.getElementById('route-done');
  const scooter = document.getElementById('scooter');
  const length = route ? route.getTotalLength() : 0;
  const nodes = { title: document.getElementById('track-title'), sub: document.getElementById('track-sub'), live: document.getElementById('track-live'), big: document.getElementById('eta-big'), small: document.getElementById('eta-small'), driver: document.getElementById('driver-title'), items: [...document.querySelectorAll('.track-step')] };
  const eta = new Date((o.when.type === 'scheduled' ? o.when.at : o.placedWall + o.estMin * MIN));
  let lastStep = -1;
  let lastEta = '';
  let frame = 0;
  const tick = () => {
    const p = trackProgress(o);
    if (p.step !== lastStep) {
      const first = lastStep === -1;
      lastStep = p.step;
      nodes.items.forEach((li, i) => { li.classList.toggle('is-done', i < p.step || p.done); li.classList.toggle('is-current', i === p.step && !p.done); if (i === p.step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
      nodes.title.textContent = steps[p.step].title;
      nodes.sub.textContent = steps[p.step].sub;
      if (!first) nodes.live.textContent = `Order status: ${steps[p.step].title}.`;
      if (nodes.driver) nodes.driver.textContent = p.step < 2 ? 'Rosa will deliver your order' : p.step === 2 ? 'Rosa is on the way' : 'Rosa dropped off your order';
      document.querySelector('.track-steps')?.style.setProperty('--progress', String(p.step / 3));
    }
    let big; let small;
    const span = delivery ? 3 : 2;
    const left = Math.max(1, Math.ceil(o.estMin * (1 - p.elapsed / (span * STEP_MS))));
    if (delivery) {
      if (p.done) { big = 'Delivered'; small = '¡Buen provecho!'; } else { big = `${left} min`; small = o.when.type === 'scheduled' ? `Scheduled for ${formatTime(eta)}` : `Arriving about ${formatTime(eta)}`; }
    } else if (p.step >= 3) { big = 'Picked up'; small = 'Enjoy!'; } else if (p.step === 2) { big = 'Ready'; small = 'Waiting at the counter'; } else { big = `${left} min`; small = o.when.type === 'scheduled' ? `Ready at ${formatTime(eta)}` : `Ready about ${formatTime(eta)}`; }
    if (big + small !== lastEta) { lastEta = big + small; nodes.big.textContent = big; nodes.small.textContent = small; }
    if (route) {
      const point = route.getPointAtLength(length * p.leg);
      scooter.setAttribute('transform', `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
      done.style.strokeDashoffset = String(1 - p.leg);
    }
    if (!p.done) frame = requestAnimationFrame(tick);
  };
  tick();
  cleanups.push(() => cancelAnimationFrame(frame));
}

function ordersPage() {
  const orders = state.orders;
  return {
    title: 'Your orders — Luna Taquería',
    html: `
    <section class="page-head">
      <div class="wrap"><p class="eyebrow">Order history</p><h1 class="display">Your orders</h1><p class="lead">Track a recent order or reorder a favorite in one tap. Orders placed on this demo are saved in this browser only.</p></div>
    </section>
    <section class="section-tight">
      <div class="wrap">
        ${orders.length ? `<ul class="order-list">${orders.map((o) => {
          const p = trackProgress(o);
          const count = o.lines.reduce((n, l) => n + l.qty, 0);
          return `
            <li class="order-card">
              <div class="order-thumbs" aria-hidden="true">${o.lines.slice(0, 3).map((l) => `<span>${img(l.id, '', { sizes: '64px' })}</span>`).join('')}</div>
              <div class="order-info">
                <p class="order-top"><strong>${esc(o.ref)}</strong><span class="badge ${p.done ? 'badge-done' : 'badge-live'}">${esc(statusLabel(o))}</span></p>
                <p>${esc(formatDate(new Date(o.placedWall), { weekday: 'short', month: 'short', day: 'numeric' }))} at ${esc(formatTime(new Date(o.placedWall)))} · ${o.mode === 'delivery' ? 'Delivery' : 'Pickup'} · ${plural(count, 'item')}</p>
                <p class="order-items">${o.lines.map((l) => `${l.qty} × ${esc(l.name)}`).join(', ')}</p>
              </div>
              <div class="order-side">
                <strong class="order-total">${usd(o.totals.total)}</strong>
                <div class="order-actions"><a class="btn btn-ghost btn-sm" href="#/order/${esc(o.ref)}">${p.done ? 'Details' : 'Track'}</a><button type="button" class="btn btn-primary btn-sm" data-action="order-again" data-ref="${esc(o.ref)}">Order again</button></div>
              </div>
            </li>`;
        }).join('')}</ul>` : `<div class="empty-state center">${emptyPlate}<h2 class="display">No orders yet</h2><p>Once you place an order it shows up here, with live tracking.</p><a class="btn btn-primary" href="#/menu">Start an order</a></div>`}
      </div>
    </section>`,
  };
}

/* ------------------------------------------------------------------ Catering */
let catering = { stage: 'form', ref: null, data: null };
function cateringDraft() {
  if (!catering.data) catering.data = { package: 'taco-bar', guests: '25', proteins: [], vegan: '', date: '', time: '', service: 'delivery', within: '', street: '', zip: '', name: state.details.name || '', email: state.details.email || '', phone: state.details.phone || '', org: '', notes: '' };
  return catering.data;
}
function cateringEarliest(now = shopNow()) {
  let e = ceilTo(plus(now, 48 * 60), 30);
  if (e.getHours() < 11) e = at(e, 11);
  if (e > at(e, 20)) e = at(addDays(e, 1), 11);
  return e;
}
const CATER_TIMES = Array.from({ length: 19 }, (_, i) => { const d = at(new Date(2026, 0, 1), 11, 0); d.setMinutes(i * 30); return timeKey(d); });
const timeLabel = (key) => { const [h, m] = key.split(':').map(Number); return formatTime(new Date(2026, 0, 1, h, m)); };

function cateringQuote(d) {
  const pkg = PACKAGES[d.package];
  const guests = parseInt(d.guests, 10);
  const valid = Number.isFinite(guests) && guests >= CATER_MIN_GUESTS && guests <= CATER_MAX_GUESTS;
  const food = valid ? pkg.price * 100 * guests : 0;
  const tax = Math.round((food * TAX_RATE) / 100);
  const delivery = d.service === 'delivery';
  const over = food > CATER_FREE_OVER;
  const needGuests = Math.floor(CATER_FREE_OVER / (pkg.price * 100)) + 1;
  let setup;
  if (!delivery) setup = { label: 'Pickup at Luna', value: 'Free' };
  else if (d.within === 'yes' && over) setup = { label: 'Delivery & setup', value: 'Free' };
  else if (d.within === 'yes') setup = { label: 'Delivery & setup', value: 'Quoted', note: `Free over $300 — that’s ${needGuests} guests for the ${pkg.name}.` };
  else setup = { label: 'Delivery & setup', value: 'Quoted', note: d.within === 'no' ? 'Beyond 5 miles we quote delivery and setup separately.' : 'Free within 5 miles of Avondale on orders over $300.' };
  return { pkg, guests, valid, food, tax, total: food + tax, setup, quoted: setup.value === 'Quoted' };
}
function quoteHtml(d) {
  const q = cateringQuote(d);
  return `
    <div class="quote-card">
      <p class="eyebrow">Your estimate</p>
      <p class="quote-big">${q.valid ? usd(q.total) : '—'}</p>
      <p class="quote-sub">${q.valid ? `${q.guests} guests × ${usd(q.pkg.price * 100)} ${q.pkg.name}, plus tax` : `Enter ${CATER_MIN_GUESTS}–${CATER_MAX_GUESTS} guests to see your estimate`}</p>
      <dl class="sum-totals">
        <div><dt>${q.pkg.name} · ${q.valid ? plural(q.guests, 'guest') : '–'}</dt><dd>${usd(q.food)}</dd></div>
        <div><dt>Tax (${TAX_RATE}%)</dt><dd>${usd(q.tax)}</dd></div>
        <div><dt>${q.setup.label}</dt><dd>${q.setup.value === 'Free' ? '<span class="free">Free</span>' : 'Quoted separately'}</dd></div>
        <div class="sum-total"><dt>Estimated total</dt><dd>${usd(q.total)}${q.quoted ? '<small>+ delivery</small>' : ''}</dd></div>
      </dl>
      ${q.setup.note ? `<p class="notice notice-info">${q.setup.note}</p>` : ''}
      <p class="fine">Per-person price covers the food; the final quote is confirmed by our catering team.</p>
    </div>`;
}
const refreshQuote = () => { const node = document.getElementById('quote'); if (node) node.innerHTML = quoteHtml(cateringDraft()); };
function refreshTimeOptions() {
  const select = document.getElementById('c-time');
  if (!select) return;
  const earliest = cateringEarliest();
  const onFirstDay = cateringDraft().date === dayKey(earliest);
  [...select.options].forEach((option) => {
    if (!option.value) return;
    const tooSoon = onFirstDay && option.value < timeKey(earliest);
    option.disabled = tooSoon;
    option.textContent = timeLabel(option.value) + (tooSoon ? ' (too soon)' : '');
  });
}

function cateringPage() {
  const d = cateringDraft();
  const earliest = cateringEarliest();
  const pkg = PACKAGES[d.package];
  const earliestText = `${formatDate(earliest)} at ${formatTime(earliest)}`;
  const intro = `
    <section class="cater-hero">
      <div class="wrap cater-hero-grid">
        <div>
          <p class="eyebrow">Catering</p>
          <h1 class="display">Catering that shows up hot.</h1>
          <p class="lead">Taco bars and fiesta spreads for 15 to 300 guests: office lunches, birthdays, graduations and backyard parties. Tell us about your event and get a price in seconds.</p>
          <ul class="rule-chips">
            <li>${icon.clock}48 hours’ notice</li>
            <li>${icon.check}15-guest minimum</li>
            <li>${icon.scooter}Free delivery &amp; setup within 5 miles over $300</li>
          </ul>
        </div>
        <div class="cater-photos" aria-hidden="true">
          <div class="polaroid p1">${img('al-pastor', '', { sizes: '280px' })}</div>
          <div class="polaroid p2">${img('chips-guac', '', { sizes: '280px' })}</div>
          <div class="polaroid p3">${img('agua-fresca', '', { sizes: '280px' })}</div>
        </div>
      </div>
    </section>
    <section class="section-tight">
      <div class="wrap package-grid">
        ${Object.entries(PACKAGES).map(([id, p]) => `
          <article class="package package--${id}">
            <p class="package-min">Minimum 15 guests</p>
            <h2 class="display">${p.name}</h2>
            <p class="package-price"><strong>${usd(p.price * 100).replace('.00', '')}</strong><span>per person</span></p>
            <p>${p.blurb}</p>
            <ul class="check-list">${p.includes.map((x) => `<li>${icon.check}${x}</li>`).join('')}</ul>
            <p class="package-vegan"><span class="mini-badge">Vegan</span> Cauliflower al pastor can be one of your proteins.</p>
            <button type="button" class="btn ${id === 'fiesta' ? 'btn-cream' : 'btn-ink'}" data-action="choose-package" data-pkg="${id}">Choose ${p.name}</button>
          </article>`).join('')}
      </div>
    </section>`;

  if (catering.stage === 'done') {
    const r = state.catering.find((x) => x.ref === catering.ref);
    const q = cateringQuote(r);
    return {
      title: 'Catering request sent — Luna Taquería',
      html: `${intro}
      <section class="section" id="cater-form">
        <div class="wrap narrow">
          <div class="confirm-card">
            <span class="confirm-badge" aria-hidden="true">${icon.check}</span>
            <p class="eyebrow">Request ${esc(r.ref)}</p>
            <h2 class="display" id="cater-done" tabindex="-1">Thanks, ${esc(firstName(r.name))}. Your catering request is in.</h2>
            <dl class="order-facts two-col">
              <div><dt>Package</dt><dd>${q.pkg.name}, ${plural(q.guests, 'guest')}</dd></div>
              <div><dt>When</dt><dd>${esc(formatDate(new Date(`${r.date}T12:00:00`), { weekday: 'long', month: 'long', day: 'numeric' }))} at ${timeLabel(r.time)}</dd></div>
              <div><dt>Proteins</dt><dd>${r.proteins.map((k) => CATER_PROTEINS.find(([x]) => x === k)[1]).join(', ')}</dd></div>
              <div><dt>Service</dt><dd>${r.service === 'delivery' ? `Delivery &amp; setup · ${esc(r.street)}, ${esc(r.zip)}` : 'Pickup at Luna'}</dd></div>
              <div><dt>Estimate</dt><dd>${usd(q.total)}${q.quoted ? ' plus delivery' : ''}</dd></div>
              <div><dt>Contact</dt><dd>${esc(r.email)} · ${esc(r.phone)}</dd></div>
            </dl>
            <p class="demo-note">Demo request — no one will contact you, and nothing was booked or charged.</p>
            <button type="button" class="btn btn-primary" data-action="cater-new">Start another request</button>
          </div>
        </div>
      </section>`,
      mount: () => document.getElementById('cater-done')?.focus({ preventScroll: true }),
    };
  }

  const earliestKey = dayKey(earliest);
  const timeOptions = CATER_TIMES.map((key) => {
    const tooSoon = d.date === earliestKey && key < timeKey(earliest);
    return `<option value="${key}" ${key === d.time ? 'selected' : ''} ${tooSoon ? 'disabled' : ''}>${timeLabel(key)}${tooSoon ? ' (too soon)' : ''}</option>`;
  }).join('');
  const chosen = d.proteins.length;
  return {
    title: 'Catering — Luna Taquería',
    html: `${intro}
    <section class="section cater-form-section" id="cater-form" aria-labelledby="cater-form-title">
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">Request a quote</p><h2 class="display" id="cater-form-title">Plan your event</h2></div></div>
        <form class="cater-grid" data-form="catering" novalidate>
          <div class="checkout-main">
            <section class="co-card" aria-labelledby="c-pkg">
              <h3 id="c-pkg"><span class="co-num">1</span>Package</h3>
              <div class="choice-row">${Object.entries(PACKAGES).map(([id, p]) => `<label class="choice"><input type="radio" name="package" id="pkg-${id}" value="${id}" ${d.package === id ? 'checked' : ''} data-change="cater-package"><span><strong>${p.name}</strong><small>${usd(p.price * 100)} per person · ${p.proteins} proteins</small></span></label>`).join('')}</div>
            </section>

            <section class="co-card" aria-labelledby="c-when">
              <h3 id="c-when"><span class="co-num">2</span>Guests and date</h3>
              <div class="field-grid three">
                <div class="field"><label for="c-guests">Guests</label>
                  <div class="guest-stepper"><button type="button" class="step-btn" data-action="guests" data-delta="-5" aria-label="Five fewer guests">−5</button><input id="c-guests" name="guests" type="number" inputmode="numeric" min="${CATER_MIN_GUESTS}" max="${CATER_MAX_GUESTS}" value="${esc(d.guests)}" required data-required="How many guests are you expecting?" data-range-message="Catering is for ${CATER_MIN_GUESTS} to ${CATER_MAX_GUESTS} guests. For smaller groups, order from the menu; for bigger events, call ${SHOP.phone}." data-input="cater"><button type="button" class="step-btn" data-action="guests" data-delta="5" aria-label="Five more guests">+5</button></div>
                </div>
                <div class="field"><label for="c-date">Event date</label><input id="c-date" name="date" type="date" min="${earliestKey}" value="${esc(d.date)}" required data-required="Choose the date of your event." data-range-message="Catering needs 48 hours’ notice. The earliest we can serve is ${earliestText}." data-change="cater-date"></div>
                <div class="field"><label for="c-time">Serving time</label><select id="c-time" name="time" required data-required="Choose a serving time." data-change="cater-time"><option value="">Choose a time</option>${timeOptions}</select></div>
              </div>
              <p class="fine">We need 48 hours’ notice: the earliest we can serve is <strong>${esc(earliestText)}</strong>.</p>
            </section>

            <section class="co-card" aria-labelledby="c-prot">
              <h3 id="c-prot"><span class="co-num">3</span>Proteins</h3>
              <fieldset class="protein-set" id="protein-set">
                <legend>Choose ${pkg.proteins} for the ${pkg.name} <span class="opt-hint" id="protein-count">${chosen} of ${pkg.proteins} chosen</span></legend>
                <div class="protein-grid">${CATER_PROTEINS.map(([key, label, badge]) => {
                  const on = d.proteins.includes(key);
                  const off = !on && chosen >= pkg.proteins;
                  return `<label class="opt ${off ? 'is-disabled' : ''}"><input type="checkbox" name="proteins" value="${key}" ${on ? 'checked' : ''} ${off ? 'disabled' : ''} data-change="cater-protein"><span class="opt-label">${label}${badge ? ` <span class="mini-badge">${badge}</span>` : ''}</span></label>`;
                }).join('')}</div>
              </fieldset>
              <div class="field narrow-field"><label for="c-vegan">Vegan guests <span class="optional">(optional)</span></label><input id="c-vegan" name="vegan" type="number" inputmode="numeric" min="0" max="${CATER_MAX_GUESTS}" value="${esc(d.vegan)}" data-range-message="Enter a number from 0 up to your guest count." data-input="cater"></div>
              <p class="fine">Beans are cooked without lard and our corn tortillas are gluten-free, so vegan guests can build a full plate.</p>
            </section>

            <section class="co-card" aria-labelledby="c-serv">
              <h3 id="c-serv"><span class="co-num">4</span>Delivery or pickup</h3>
              <div class="choice-row">
                <label class="choice"><input type="radio" name="service" id="serv-delivery" value="delivery" ${d.service === 'delivery' ? 'checked' : ''} data-change="cater-service"><span><strong>${icon.scooter}Delivery &amp; setup</strong><small>We bring it, set it up and label everything</small></span></label>
                <label class="choice"><input type="radio" name="service" id="serv-pickup" value="pickup" ${d.service === 'pickup' ? 'checked' : ''} data-change="cater-service"><span><strong>${icon.bag}Pickup</strong><small>Ready at ${SHOP.street}</small></span></label>
              </div>
              ${d.service === 'delivery' ? `
                <fieldset class="within-set">
                  <legend>Is the event within 5 miles of Avondale?</legend>
                  <div class="pill-row">${[['yes', 'Yes'], ['no', 'No'], ['unsure', 'Not sure']].map(([v, l]) => `<label class="pill"><input type="radio" name="within" id="within-${v}" value="${v}" ${d.within === v ? 'checked' : ''} required data-required="Let us know if the event is within 5 miles." data-change="cater-within"><span>${l}</span></label>`).join('')}</div>
                </fieldset>
                <div class="field-grid">
                  <div class="field span-2"><label for="c-street">Event address</label><input id="c-street" name="street" autocomplete="address-line1" value="${esc(d.street)}" required data-required="Enter the event address." data-input="cater"></div>
                  <div class="field"><label for="c-zip">ZIP code</label><input id="c-zip" name="zip" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="${esc(d.zip)}" required data-required="Enter the event ZIP code." pattern="\\d{5}" data-pattern-message="Enter a 5-digit ZIP code." data-input="cater"></div>
                </div>` : ''}
            </section>

            <section class="co-card" aria-labelledby="c-you">
              <h3 id="c-you"><span class="co-num">5</span>Your details</h3>
              <div class="field-grid">
                <div class="field"><label for="c-name">Name</label><input id="c-name" name="name" autocomplete="name" value="${esc(d.name)}" required data-required="Enter your name." data-input="cater"></div>
                <div class="field"><label for="c-org">Company or group <span class="optional">(optional)</span></label><input id="c-org" name="org" autocomplete="organization" value="${esc(d.org)}" data-input="cater"></div>
                <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" value="${esc(d.email)}" required data-required="Enter your email so we can send the quote." data-input="cater"></div>
                <div class="field"><label for="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" autocomplete="tel" value="${esc(d.phone)}" required data-required="Enter a phone number for the day of the event." data-input="cater"></div>
                <div class="field span-2"><label for="c-notes">Anything else? <span class="optional">(optional)</span></label><textarea id="c-notes" name="notes" rows="3" maxlength="400" placeholder="Allergies, a theme, where to set up, parking…" data-input="cater">${esc(d.notes)}</textarea></div>
              </div>
            </section>
          </div>
          <aside class="checkout-side">
            <div id="quote">${quoteHtml(d)}</div>
            <button class="btn btn-primary btn-block btn-lg" type="submit">Send catering request</button>
            <p class="pay-note">${icon.cash}<span>Demo request — no one will contact you and nothing is charged.</span></p>
          </aside>
        </form>
      </div>
    </section>`,
  };
}

/* --------------------------------------------------------------- About / 404 */
function aboutPage() {
  const now = shopNow();
  const status = shopStatus(now);
  const order = [1, 2, 3, 4, 5, 6, 0];
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return {
    title: 'Our story & hours — Luna Taquería',
    html: `
    <section class="page-head about-head">
      <div class="wrap about-hero">
        <div>
          <p class="eyebrow">Our story</p>
          <h1 class="display">Hola, we’re Luna.</h1>
          <p class="lead">A neighborhood taquería in Avondale, run by one family, three generations deep. We press our tortillas every morning and cook the way our abuela taught us.</p>
        </div>
        <figure class="about-media">${img('kitchen', 'The trompo turning in Luna’s open kitchen while a cook slices al pastor', { eager: true, sizes: '(max-width: 900px) 100vw, 620px' })}</figure>
      </div>
    </section>
    <section class="section-tight">
      <div class="wrap story-grid">
        <div class="story-text">
          <h2 class="display">From block parties to Marigold Avenue</h2>
          <p>Luna started with Inés Morales, a tortilla press and her mother’s recipes from Guadalajara. For years she cooked for Avondale block parties and church fundraisers, until neighbors kept asking where they could get her tacos the rest of the week.</p>
          <p>Today her son Mateo runs the trompo, her sister Carmen presses tortillas at seven every morning, and the salsas are still blended the way they were in her mother’s kitchen. We named the place after the moon because it was always the last thing we saw closing up, and the first thing the neighborhood asked about.</p>
        </div>
        <ul class="value-cards">
          <li class="value v1"><h3>Pressed every morning</h3><p>Corn tortillas made in-house before we open. They’re gluten-free, too.</p></li>
          <li class="value v2"><h3>Room at the table</h3><p>Beans without lard, and cauliflower al pastor that turns any taco plate vegan for free.</p></li>
          <li class="value v3"><h3>Close to home</h3><p>We deliver to nine nearby ZIP codes so every order arrives hot, in 30–45 minutes.</p></li>
        </ul>
      </div>
    </section>
    <section class="section visit" aria-labelledby="visit-h">
      <div class="wrap visit-grid">
        <div class="hours-card">
          <h2 class="display" id="visit-h">Hours</h2>
          <p class="status-chip tone-${status.tone}"><span class="status-dot"></span>${esc(status.label)}</p>
          <table class="hours-table">
            <caption class="visually-hidden">Opening hours, Birmingham time</caption>
            <tbody>${order.map((i) => { const day = addDays(at(now, 12), (i - now.getDay() + 7) % 7); return `<tr class="${i === now.getDay() ? 'is-today' : ''}"><th scope="row">${names[i]}${i === now.getDay() ? ' <span class="today-tag">Today</span>' : ''}</th><td>${hoursText(day).replace('–', ' – ')}</td></tr>`; }).join('')}</tbody>
          </table>
          <p class="fine">Last delivery orders 30 minutes before close. Pickup is ready 15–20 minutes after you order.</p>
        </div>
        <div class="find-card">
          <h2 class="display">Find us</h2>
          <p class="find-line">${icon.pin}<span><strong>${SHOP.street}</strong><br>Avondale, ${SHOP.city}</span></p>
          <p class="find-line">${icon.phone}<span><a href="tel:${SHOP.tel}">${SHOP.phone}</a><br>Call ahead for big pickup orders</span></p>
          <p class="find-line">${icon.scooter}<span>Street parking on Marigold Ave and a small lot behind the building</span></p>
          <div class="find-actions"><button type="button" class="btn btn-primary" data-action="start-order" data-mode="pickup">Order pickup</button><a class="btn btn-ghost" href="#/catering">Catering</a></div>
          <div class="map-card mini-map">${mapSvg({ mode: 'pickup' })}</div>
        </div>
      </div>
    </section>
    <section class="section-tight faq-section" aria-labelledby="faq-h">
      <div class="wrap narrow">
        <h2 class="display" id="faq-h">Good to know</h2>
        <div class="faq">
          <details><summary>Where do you deliver?</summary><p>We deliver to ZIP codes ${DELIVERY_ZIPS.join(', ')}. Delivery takes 30–45 minutes. Outside that area, pickup is ready in 15–20 minutes.</p></details>
          <details><summary>What does delivery cost?</summary><p>Delivery is ${usd(DELIVERY_FEE)}, and free on orders of $40 or more before tax. The delivery minimum is $15. Sales tax is 10%, tipping your driver is optional, and there are no other fees.</p></details>
          <details><summary>Do you have vegan and gluten-free options?</summary><p>Yes. Any taco plate can be made with cauliflower al pastor (vegan) at no charge, our beans are cooked without lard, and our corn tortillas are gluten-free. The Baja fish is beer-battered.</p></details>
          <details><summary>How late can I order?</summary><p>We take delivery orders until 30 minutes before close. You can also schedule an order for later today or tomorrow in 15-minute slots.</p></details>
        </div>
      </div>
    </section>`,
  };
}

function notFound() {
  return {
    title: 'Page not found — Luna Taquería',
    html: `<section class="section"><div class="wrap narrow center empty-state not-found">${emptyPlate}<p class="eyebrow">Error 404</p><h1 class="display">This page got eaten.</h1><p class="lead">We looked everywhere, even behind the salsa bar. Let’s get you back to the good stuff.</p><div class="center-actions"><a class="btn btn-primary btn-lg" href="#/menu">See the menu</a><a class="btn btn-ghost btn-lg" href="#/">Back home</a></div></div></section>`,
  };
}

/* ------------------------------------------------------------ Cart drawer */
const drawer = document.getElementById('cart-drawer');
let drawerOpener = null;
function renderDrawer() {
  const panel = document.getElementById('drawer-panel');
  const t = totals();
  const delivery = state.mode === 'delivery';
  const active = document.activeElement;
  const focusSel = panel.contains(active) && active.dataset.action ? `[data-action="${active.dataset.action}"]${active.dataset.key ? `[data-key="${CSS.escape(active.dataset.key)}"]` : ''}${active.dataset.delta ? `[data-delta="${active.dataset.delta}"]` : ''}${active.dataset.mode ? `[data-mode="${active.dataset.mode}"]` : ''}` : null;
  panel.innerHTML = `
    <header class="drawer-head"><h2 class="display" id="drawer-title">Your order</h2><button type="button" class="icon-btn" id="drawer-close" data-action="close-cart" aria-label="Close your order">${icon.close}</button></header>
    <div class="drawer-mode">${modeToggle('drawer')}</div>
    ${state.cart.length ? `
      <div class="drawer-body">
        ${delivery ? freeMeter(t) : `<p class="notice notice-info">${icon.pin}Pickup at ${SHOP.street} · ready in 15–20 min</p>`}
        <ul class="lines">${state.cart.map(lineRow).join('')}</ul>
      </div>
      <footer class="drawer-foot">
        ${delivery && t.toMin ? minWarning(t) : ''}
        <div class="drawer-sub"><span>Subtotal · ${plural(t.count, 'item')}</span><strong>${usd(t.subtotal)}</strong></div>
        <p class="fine">Tax${delivery ? ', delivery' : ''} and tip are added at checkout.</p>
        <a class="btn btn-primary btn-block btn-lg" href="#/checkout" data-action="close-cart" data-nav-away="1">Go to checkout ${icon.arrow}</a>
      </footer>` : `
      <div class="drawer-empty">
        ${emptyPlate}
        <h3 class="display">Nothing here yet</h3>
        <p>The tortillas are warm and the trompo is turning. Pick something good.</p>
        <a class="btn btn-primary" href="#/menu" data-action="close-cart" data-nav-away="1">Browse the menu</a>
      </div>`}`;
  qtyPulse = null;
  const again = focusSel && panel.querySelector(focusSel);
  if (again) again.focus({ preventScroll: true });
  else if (panel.contains(active) || active === document.body) document.getElementById('drawer-close')?.focus({ preventScroll: true });
}
function openDrawer() {
  if (!drawer.open) { drawerOpener = document.activeElement; renderDrawer(); drawer.showModal(); }
  else renderDrawer();
  document.getElementById('drawer-close').focus();
}
function closeDrawer({ restoreFocus = true } = {}) {
  if (!drawer.open || drawer.classList.contains('is-closing')) return;
  drawer.classList.add('is-closing');
  setTimeout(() => {
    drawer.classList.remove('is-closing');
    drawer.close();
    if (restoreFocus && drawerOpener?.isConnected) drawerOpener.focus({ preventScroll: true });
  }, reducedMotion() ? 0 : 220);
}
drawer.addEventListener('cancel', (event) => { event.preventDefault(); closeDrawer(); });
drawer.addEventListener('click', (event) => { if (event.target === drawer) closeDrawer(); });

/* ------------------------------------------------------- Shared UI updates */
const currentPath = () => (location.hash.replace(/^#/, '') || '/').split('?')[0];
function updateBadge() {
  const t = totals();
  const badge = document.getElementById('cart-count');
  badge.hidden = !t.count;
  badge.textContent = t.count;
  document.getElementById('cart-button').setAttribute('aria-label', t.count ? `Your order, ${plural(t.count, 'item')}, ${usd(t.subtotal)}` : 'Your order, empty');
}
function bump() {
  [document.getElementById('cart-count'), document.getElementById('cart-bar')].forEach((node) => {
    if (!node) return;
    node.classList.remove('is-bumping');
    void node.offsetWidth;
    node.classList.add('is-bumping');
  });
}
function cartChanged({ bump: doBump = false } = {}) {
  save();
  updateBadge();
  if (drawer.open) renderDrawer();
  const path = currentPath();
  if (path === '/checkout') router.render({ keepScroll: true });
  const slot = document.getElementById('cart-bar-slot');
  if (slot) { slot.innerHTML = cartBar(); document.body.classList.toggle('has-cart-bar', totals().count > 0); }
  if (doBump) requestAnimationFrame(bump);
}
function setMode(mode) {
  if (!['delivery', 'pickup'].includes(mode) || state.mode === mode) return;
  state.mode = mode;
  save();
  document.querySelectorAll('[data-action="set-mode"][aria-pressed]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  const note = document.getElementById('menu-mode-note');
  if (note) note.textContent = modeNote();
  if (drawer.open) renderDrawer();
  if (currentPath() === '/checkout') router.render({ keepScroll: true });
}
function updateStatus() {
  const s = shopStatus();
  const pill = document.getElementById('status-pill');
  if (pill.dataset.text === s.short) return;
  pill.dataset.text = s.short;
  pill.className = `status-pill tone-${s.tone}`;
  pill.innerHTML = `<span class="status-dot"></span>${esc(s.short)}`;
  pill.setAttribute('aria-label', `${s.label}. See hours.`);
}
function setMenu(open) {
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', String(open));
  document.getElementById('mobile-nav').hidden = !open;
}
function fieldError(field, message, anchor = field) {
  const id = `error-${field.name || field.id}`;
  document.getElementById(id)?.remove();
  const p = Object.assign(document.createElement('p'), { className: 'field-error', id, textContent: message });
  anchor.insertAdjacentElement('afterend', p);
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', id);
  field.focus();
}

/* ------------------------------------------------------------------ Router */
const router = createRouter([
  ['/', view(home)],
  ['/menu', view(menuPage)],
  ['/checkout', view(checkoutPage)],
  ['/order/:ref', view(trackingPage)],
  ['/orders', view(ordersPage)],
  ['/catering', view(cateringPage)],
  ['/about', view(aboutPage)],
], { notFound: view(notFound), afterRender: () => setMenu(false) });

/* ----------------------------------------------------------------- Actions */
actions({
  menu: (button) => setMenu(button.getAttribute('aria-expanded') !== 'true'),
  'open-cart': () => openDrawer(),
  'close-cart': (el) => closeDrawer({ restoreFocus: !el.dataset.navAway }),
  'open-item': (button) => openItem(button.dataset.id),
  'set-mode': (button) => setMode(button.dataset.mode),
  'start-order': (button) => { setMode(button.dataset.mode); router.go('#/menu'); },
  jump: (button) => {
    const section = document.getElementById(`cat-${button.dataset.cat}`);
    if (!section) return;
    section.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    section.querySelector('h2')?.focus({ preventScroll: true });
  },
  qty: (button) => {
    const line = state.cart.find((l) => l.key === button.dataset.key);
    if (!line) return;
    const delta = Number(button.dataset.delta);
    line.qty = clamp(line.qty + delta, 0, 30);
    if (!line.qty) { state.cart = state.cart.filter((l) => l !== line); toast(`Removed ${MENU[line.id].name}.`); }
    qtyPulse = { key: line.key, dir: delta > 0 ? 'up' : 'down' };
    cartChanged({ bump: delta > 0 });
  },
  'remove-line': (button) => {
    const line = state.cart.find((l) => l.key === button.dataset.key);
    if (!line) return;
    state.cart = state.cart.filter((l) => l !== line);
    cartChanged();
    toast(`Removed ${MENU[line.id].name}.`);
  },
  'zip-check': (form) => {
    if (!validate(form)) return;
    const zip = form.zip.value.match(/\d{5}/)[0];
    state.details.zip = zip;
    save();
    const out = document.getElementById('zip-result');
    out.innerHTML = DELIVERY_ZIPS.includes(zip)
      ? `<div class="zip-answer ok"><p>${icon.check}<span><strong>Yes! We deliver to ${zip}.</strong> Usually 30–45 minutes, and free on orders of $40 or more.</span></p><button type="button" class="btn btn-primary btn-sm" data-action="start-order" data-mode="delivery">Start a delivery order</button></div>`
      : `<div class="zip-answer no"><p><strong>We don’t deliver to ${zip} yet.</strong> Pickup is quick, though: ready 15–20 minutes after you order at ${SHOP.street}.</p><button type="button" class="btn btn-ink btn-sm" data-action="start-order" data-mode="pickup">Order pickup instead</button></div>`;
  },
  detail: (field) => { state.details[field.name] = field.value; saveSoon(); },
  zip: (field) => {
    const clean = field.value.replace(/\D/g, '').slice(0, 5);
    if (clean !== field.value) field.value = clean;
    state.details.zip = clean;
    saveSoon();
    const box = document.getElementById('zip-status');
    if (box) box.innerHTML = zipStatus(clean);
  },
  'when-type': (input) => { state.when = { ...state.when, type: input.value }; save(); router.render({ keepScroll: true }); },
  'when-day': (select) => { state.when = { type: 'scheduled', day: select.value, time: '' }; save(); router.render({ keepScroll: true }); },
  'when-time': (select) => { state.when = { ...state.when, type: 'scheduled', time: select.value }; save(); },
  tip: (input) => {
    state.tip = input.value === 'custom' ? { type: 'custom', amount: state.tip?.amount ?? '' } : { type: 'pct', pct: Number(input.value) };
    save();
    router.render({ keepScroll: true });
    if (input.value === 'custom') document.getElementById('co-tip-amount')?.focus();
  },
  'tip-amount': (input) => { state.tip = { type: 'custom', amount: input.value }; saveSoon(); refreshSummary(); },
  checkout: (form) => {
    if (!state.cart.length) return;
    const { name = '', phone = '', email = '', notes = '', street, apt, zip } = formData(form);
    Object.assign(state.details, { name, phone, email, notes }, state.mode === 'delivery' ? { street, apt, zip } : {});
    save();
    const t = totals();
    const delivery = state.mode === 'delivery';
    if (!validate(form)) return;
    if (delivery && !DELIVERY_ZIPS.includes(form.zip.value.trim())) {
      fieldError(form.zip, `${form.zip.value.trim()} is outside our delivery area. See your options below.`);
      return;
    }
    if (delivery && t.toMin) {
      toast(`Delivery orders start at ${usd(DELIVERY_MIN)}. Add ${usd(t.toMin)} more or switch to pickup.`);
      document.getElementById('min-warning')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    const { when, status, slot } = resolveWhen();
    if (when.type === 'asap' && !status.ordering) { toast('We just stopped taking orders for tonight. Please pick a time.'); router.render({ keepScroll: true }); return; }
    const now = shopNow();
    const estMin = delivery ? 30 + Math.floor(Math.random() * 16) : 15 + Math.floor(Math.random() * 6);
    const whenRecord = when.type === 'asap'
      ? { type: 'asap', label: `ASAP · ${delivery ? 'arrives' : 'ready'} about ${formatTime(plus(now, estMin))}` }
      : { type: 'scheduled', at: slot.getTime(), label: `${formatDate(slot)} at ${formatTime(slot)}` };
    const d = state.details;
    const order = {
      ref: reference('LUNA'),
      placedAt: Date.now(),
      placedWall: now.getTime(),
      startedAt: Date.now(),
      mode: state.mode,
      lines: state.cart.map((l) => ({ ...l, name: MENU[l.id].name, unit: unitPrice(l), summary: lineSummary(l) })),
      totals: t,
      when: whenRecord,
      estMin,
      details: { name: d.name.trim(), phone: prettyPhone(d.phone), email: (d.email || '').trim(), notes: (d.notes || '').trim(), street: delivery ? d.street.trim() : '', apt: delivery ? (d.apt || '').trim() : '', zip: delivery ? d.zip : '' },
    };
    state.orders.unshift(order);
    state.orders = state.orders.slice(0, 20);
    state.cart = [];
    state.details.notes = '';
    save();
    updateBadge();
    router.go(`#/order/${order.ref}`);
    toast('Order placed! Demo only — nothing was charged.');
  },
  'order-again': (button) => {
    const o = state.orders.find((x) => x.ref === button.dataset.ref);
    if (!o) return;
    o.lines.forEach((l) => addLine(l));
    setMode(o.mode);
    const count = o.lines.reduce((n, l) => n + l.qty, 0);
    cartChanged({ bump: true });
    openDrawer();
    toast(`Added ${plural(count, 'item')} from order ${o.ref}.`);
  },
  replay: (button) => {
    const o = state.orders.find((x) => x.ref === button.dataset.ref);
    if (!o) return;
    o.startedAt = Date.now();
    save();
    router.render({ keepScroll: true });
  },
  'choose-package': (button) => {
    const d = cateringDraft();
    if (catering.stage === 'done') catering.stage = 'form';
    d.package = button.dataset.pkg;
    d.proteins = d.proteins.slice(0, PACKAGES[d.package].proteins);
    router.render({ keepScroll: true });
    const target = document.getElementById(`pkg-${d.package}`);
    document.getElementById('cater-form')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    target?.focus({ preventScroll: true });
  },
  'cater-package': (input) => {
    const d = cateringDraft();
    d.package = input.value;
    d.proteins = d.proteins.slice(0, PACKAGES[d.package].proteins);
    router.render({ keepScroll: true });
  },
  cater: (field) => { cateringDraft()[field.name] = field.value; refreshQuote(); },
  // Update the time list in place: re-rendering would interrupt someone typing a date.
  'cater-date': (input) => { cateringDraft().date = input.value; refreshTimeOptions(); },
  'cater-time': (select) => { cateringDraft().time = select.value; },
  'cater-within': (input) => { cateringDraft().within = input.value; refreshQuote(); },
  'cater-service': (input) => { cateringDraft().service = input.value; router.render({ keepScroll: true }); },
  'cater-protein': (box) => {
    const d = cateringDraft();
    const max = PACKAGES[d.package].proteins;
    const boxes = [...box.form.querySelectorAll('[name="proteins"]')];
    d.proteins = boxes.filter((b) => b.checked).map((b) => b.value);
    boxes.forEach((b) => { b.disabled = !b.checked && d.proteins.length >= max; b.closest('label').classList.toggle('is-disabled', b.disabled); });
    document.getElementById('protein-count').textContent = `${d.proteins.length} of ${max} chosen`;
    document.getElementById('error-proteins')?.remove();
  },
  guests: (button) => {
    const input = document.getElementById('c-guests');
    const current = parseInt(input.value, 10) || CATER_MIN_GUESTS;
    input.value = clamp(current + Number(button.dataset.delta), CATER_MIN_GUESTS, CATER_MAX_GUESTS);
    cateringDraft().guests = input.value;
    refreshQuote();
  },
  catering: (form) => {
    const d = cateringDraft();
    if (!validate(form)) return;
    const pkg = PACKAGES[d.package];
    const guests = parseInt(d.guests, 10);
    const earliest = cateringEarliest();
    const [y, mo, da] = form.date.value.split('-').map(Number);
    const [h, mi] = form.time.value.split(':').map(Number);
    const event = new Date(y, mo - 1, da, h, mi);
    if (event < earliest) {
      fieldError(form.time, `Catering needs 48 hours’ notice. The earliest we can serve is ${formatDate(earliest)} at ${formatTime(earliest)}.`);
      return;
    }
    if (d.proteins.length !== pkg.proteins) {
      const first = form.querySelector('[name="proteins"]:not(:disabled)') || form.querySelector('[name="proteins"]');
      fieldError(first, `Choose ${pkg.proteins} proteins for the ${pkg.name} (you have ${d.proteins.length}).`, document.getElementById('protein-set'));
      return;
    }
    if (d.vegan && parseInt(d.vegan, 10) > guests) { fieldError(form.vegan, 'Vegan guests can’t be more than your total guest count.'); return; }
    const ref = reference('CAT');
    state.catering.unshift({ ...d, phone: prettyPhone(d.phone), proteins: [...d.proteins], ref, at: Date.now() });
    state.details = { ...state.details, name: d.name, email: d.email, phone: d.phone };
    save();
    catering = { stage: 'done', ref, data: null };
    router.render({ keepScroll: true });
    document.getElementById('cater-form')?.scrollIntoView({ behavior: 'auto', block: 'start' });
  },
  'cater-new': () => { catering = { stage: 'form', ref: null, data: null }; router.render({ keepScroll: true }); document.getElementById('cater-form')?.scrollIntoView({ block: 'start' }); document.getElementById('pkg-taco-bar')?.focus({ preventScroll: true }); },
});

updateBadge();
updateStatus();
setInterval(updateStatus, 30000);
