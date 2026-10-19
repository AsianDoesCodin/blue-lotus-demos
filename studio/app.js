// STUDIO — demo booking website for a fictional yoga and breathwork studio.
const { esc, money, router: createRouter, validate, formData, toast, confirmDialog, reference, firstName, storage, actions, demoBar, formatDate, formatTime, dayKey, fromDayKey, addDays } = Kit;
demoBar('STUDIO');

const PRICE = { dropIn: 24, intro: 12, pack: 200, unlimited: 149 };
const DAYS_AHEAD = 14;

const classTypes = {
  'morning-flow': {
    name: 'Morning flow', image: 'morning-flow', duration: 60, level: 'All levels', intensity: 'Moderate',
    alt: 'Morning sun across yoga mats with cork blocks and straps',
    blurb: 'A steady vinyasa class to wake the body, link breath and movement and start the day clear-headed.',
    bring: ['Your own mat, or rent one for $2', 'A water bottle', 'Layers you can move in'],
  },
  'slow-stretch': {
    name: 'Slow stretch', image: 'slow-stretch', duration: 75, level: 'Beginner friendly', intensity: 'Gentle',
    alt: 'Bolsters, folded blankets and eye pillows arranged on yoga mats',
    blurb: 'Long, supported holds with bolsters and blankets. Ideal for tight hips, busy minds and rest days.',
    bring: ['Warm socks', 'Comfortable, loose clothing', 'Props are provided'],
  },
  'evening-reset': {
    name: 'Evening reset', image: 'evening-reset', duration: 60, level: 'All levels', intensity: 'Gentle',
    alt: 'Candlelit yoga studio at dusk with mats and blankets',
    blurb: 'Gentle movement by candlelight followed by guided relaxation, so you can leave the day at the door.',
    bring: ['A sweater for the final rest', 'An empty stomach helps', 'Props are provided'],
  },
  breathwork: {
    name: 'Breathwork', image: 'breathwork', duration: 45, level: 'All levels', intensity: 'Calm',
    alt: 'Meditation cushions in a circle around a brass singing bowl',
    blurb: 'Seated breathing techniques and short meditations to steady the nervous system and sharpen focus.',
    bring: ['Nothing but yourself', 'Cushions and blankets are provided', 'Arrive a few minutes early'],
  },
};
const instructors = {
  maya: { name: 'Maya Brooks', initials: 'MB', color: '#ecd9c4', focus: 'Vinyasa and morning practice', bio: 'Maya teaches strong, playful flows and believes the best practice is the one you keep coming back to.' },
  jordan: { name: 'Jordan Ellis', initials: 'JE', color: '#d9dfca', focus: 'Breathwork and meditation', bio: 'Jordan came to breathwork through years of shift work and teaches simple techniques you can use anywhere.' },
  elena: { name: 'Elena Park', initials: 'EP', color: '#f1cfbe', focus: 'Yin and restorative yoga', bio: 'Elena loves slow classes, good props and giving people permission to rest.' },
  sam: { name: 'Sam Carter', initials: 'SC', color: '#e6dccd', focus: 'Gentle flow and yoga nidra', bio: 'Sam teaches the evening classes and has a knack for making the hour feel like three.' },
};
// Weekly timetable by weekday (0 = Sunday): [time, class, instructor, capacity].
const weekly = {
  0: [['09:00', 'slow-stretch', 'elena', 20], ['10:45', 'breathwork', 'jordan', 16], ['17:00', 'evening-reset', 'sam', 20]],
  1: [['06:30', 'morning-flow', 'maya', 18], ['12:15', 'breathwork', 'jordan', 16], ['17:30', 'slow-stretch', 'elena', 20], ['19:15', 'evening-reset', 'sam', 20]],
  2: [['06:30', 'morning-flow', 'maya', 18], ['09:30', 'slow-stretch', 'elena', 20], ['18:00', 'evening-reset', 'sam', 20]],
  3: [['06:30', 'morning-flow', 'maya', 18], ['12:15', 'breathwork', 'jordan', 16], ['17:30', 'morning-flow', 'maya', 18], ['19:15', 'slow-stretch', 'elena', 20]],
  4: [['06:30', 'morning-flow', 'maya', 18], ['09:30', 'breathwork', 'jordan', 16], ['18:00', 'evening-reset', 'sam', 20]],
  5: [['06:30', 'morning-flow', 'maya', 18], ['12:15', 'slow-stretch', 'elena', 20], ['17:30', 'breathwork', 'jordan', 16]],
  6: [['08:00', 'morning-flow', 'maya', 18], ['09:45', 'slow-stretch', 'elena', 20], ['11:15', 'breathwork', 'jordan', 16]],
};

const state = storage.get('studio-state', { bookings: [], credits: 0, membership: null, purchases: [], profile: {}, reschedule: null });
const save = () => { storage.set('studio-state', state); updateBadge(); };

// Portrait photos are 1024×1536 with a 512px card version; the rest are 1536×1024 with a 768px one.
const portrait = new Set(['hero', 'morning-flow', 'slow-stretch']);
const img = (name, alt, { eager = false, sizes = '(max-width: 960px) 100vw, 50vw' } = {}) => {
  const [w, h, sm] = portrait.has(name) ? [1024, 1536, 512] : [1536, 1024, 768];
  return `<img src="img/${name}.webp" srcset="img/${name}-sm.webp ${sm}w, img/${name}.webp ${w}w" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
};
const hash = (text) => { let h = 2166136261; for (const ch of text) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); };
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const longDate = (d) => formatDate(d, { weekday: 'long', month: 'long', day: 'numeric' });
const shortDate = (d) => formatDate(d, { weekday: 'short', month: 'short', day: 'numeric' });

function sessionsFor(date) {
  const key = dayKey(date);
  return (weekly[date.getDay()] || []).map(([time, type, teacher, capacity]) => {
    const [h, m] = time.split(':').map(Number);
    const start = new Date(date);
    start.setHours(h, m, 0, 0);
    const id = `${key}-${time.replace(':', '')}`;
    // A stable, believable number of spots already taken by other members.
    const base = Math.min(capacity, Math.floor(((hash(id) % 997) / 997) * (capacity + 2)));
    return { id, start, type, teacher, capacity, base };
  });
}
function sessionById(id) {
  const match = /^(\d{4}-\d{2}-\d{2})-\d{4}$/.exec(id || '');
  return match ? sessionsFor(fromDayKey(match[1])).find((s) => s.id === id) || null : null;
}
const upcomingSessions = (limit) => {
  const list = [];
  for (let i = 0; i < DAYS_AHEAD && list.length < limit; i += 1) list.push(...sessionsFor(addDays(startOfToday(), i)).filter((s) => s.start > new Date()));
  return list.slice(0, limit);
};
const takenByMe = (s) => state.bookings.filter((b) => b.sessionId === s.id && b.status === 'booked').length;
const spotsLeft = (s) => Math.max(0, s.capacity - s.base - takenByMe(s));
const isPast = (s) => s.start <= new Date();
const myBooking = (s) => state.bookings.find((b) => b.sessionId === s.id && b.status === 'booked');
const upcomingBookings = () => state.bookings.filter((b) => b.status === 'booked' && sessionById(b.sessionId)?.start > new Date());
const ticketLabel = { membership: 'Unlimited membership', credit: 'Class pack credit', intro: `First class offer · ${money(PRICE.intro)}`, 'drop-in': `Drop-in · ${money(PRICE.dropIn)}` };

function updateBadge() {
  const count = upcomingBookings().length;
  const badge = document.getElementById('booking-count');
  badge.hidden = !count;
  badge.textContent = count;
}

const avatar = (id) => `<span class="avatar" style="background:${instructors[id].color}" aria-hidden="true">${instructors[id].initials}</span>`;

function sessionRow(s, { showDate = false } = {}) {
  const c = classTypes[s.type];
  const left = spotsLeft(s);
  const mine = myBooking(s);
  const past = isPast(s);
  const label = `${c.name}, ${longDate(s.start)} at ${formatTime(s.start)}`;
  let action = `<a class="btn btn-primary btn-sm" href="#/book/${s.id}" aria-label="Book ${esc(label)}">Book</a>`;
  if (mine) action = `<a class="btn btn-soft btn-sm" href="#/bookings">Booked ✓</a>`;
  else if (past) action = '<span class="status">Started</span>';
  else if (!left) action = '<span class="status">Full</span>';
  return `
    <li class="session ${past ? 'is-past' : ''}">
      <div class="session-time"><strong>${formatTime(s.start)}</strong><span>${c.duration} min${showDate ? ` · ${shortDate(s.start)}` : ''}</span></div>
      <div class="session-info"><a href="#/classes/${s.type}">${c.name}</a><span>${avatar(s.teacher)} ${instructors[s.teacher].name} · ${c.level}</span></div>
      <div class="session-spots ${left && left <= 3 && !past ? 'low' : ''}">${past ? '' : left ? `${left} ${left === 1 ? 'spot' : 'spots'} left` : 'Waitlist at the desk'}</div>
      <div class="session-action">${action}</div>
    </li>`;
}

const rescheduleBanner = () => {
  const moving = state.reschedule && state.bookings.find((b) => b.ref === state.reschedule && b.status === 'booked');
  if (!moving) return '';
  const s = sessionById(moving.sessionId);
  return `<div class="banner" role="status"><span><strong>Rescheduling:</strong> choose a new time for ${esc(classTypes[s.type].name)} (currently ${esc(shortDate(s.start))} at ${esc(formatTime(s.start))}). Your ticket moves with you.</span><button class="text-button" data-action="keep-booking">Keep current booking</button></div>`;
};

function home() {
  const [next] = upcomingSessions(1);
  const archSizes = '(max-width: 640px) 45vw, 400px';
  return {
    title: 'STUDIO — Yoga & breathwork in Birmingham, Alabama',
    html: `
    <section class="hero">
      <div class="wrap hero-inner">
        <p class="eyebrow">Yoga · Stretch · Breathwork</p>
        <h1>Make time<br>for <em>yourself.</em></h1>
        <p class="lead">Small classes in a calm, light-filled studio. Book online in under a minute and arrive to a mat already laid out for you.</p>
        <div class="hero-actions"><a class="btn btn-primary" href="#/schedule">Find your class</a><a class="btn btn-ghost" href="#/pricing">New here? First class ${money(PRICE.intro)}</a></div>
      </div>
      <div class="hero-arches">
        <figure class="arch arch-side">${img('morning-flow', 'Morning sun across yoga mats with cork blocks and straps', { sizes: archSizes })}</figure>
        <figure class="arch arch-main">${img('hero', 'Sunlit yoga studio with arched windows and rows of sage green mats', { eager: true, sizes: archSizes })}
          ${next ? `<a class="next-pill" href="#/book/${next.id}"><span class="pulse" aria-hidden="true"></span>Next class: ${classTypes[next.type].name}, ${esc(formatDate(next.start, { weekday: 'short' }))} ${formatTime(next.start)}</a>` : ''}
        </figure>
        <figure class="arch arch-side">${img('breathwork', 'Meditation cushions in a circle around a brass singing bowl', { sizes: archSizes })}</figure>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">Up next</p><h2>Find your class</h2></div><a class="link" href="#/schedule">Full schedule →</a></div>
        <ul class="session-list">${upcomingSessions(4).map((s) => sessionRow(s, { showDate: true })).join('')}</ul>
      </div>
    </section>
    <section class="section section-pale">
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">Classes</p><h2>Four ways <em>to practice</em></h2></div></div>
        <div class="class-grid">
          ${Object.entries(classTypes).map(([id, c]) => `
            <a class="class-card" href="#/classes/${id}">
              <span class="class-media">${img(c.image, c.alt, { sizes: '(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 300px' })}</span>
              <span class="class-body"><strong>${c.name}</strong><span>${c.duration} min · ${c.level}</span><span class="class-blurb">${c.blurb}</span></span>
            </a>`).join('')}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="wrap intro-band">
        <div><p class="eyebrow">First visit</p><h2>Your first class is <em>${money(PRICE.intro)}.</em></h2><p class="lead">Arrive ten minutes early, tell the teacher about any injuries and borrow everything you need. We will take it from there.</p></div>
        <ol class="first-visit">
          <li><strong>Book online</strong><span>Pick any class marked “All levels” or “Beginner friendly”.</span></li>
          <li><strong>Check in</strong><span>Mats, blocks and blankets are waiting for you.</span></li>
          <li><strong>Stay for tea</strong><span>Ask questions and find the classes that suit you.</span></li>
        </ol>
      </div>
    </section>`,
  };
}

function scheduleHref({ day, type, level }) {
  const q = new URLSearchParams();
  if (day) q.set('day', day);
  if (type) q.set('type', type);
  if (level) q.set('level', level);
  const qs = q.toString();
  return `#/schedule${qs ? `?${qs}` : ''}`;
}

function schedule({ query }) {
  const first = startOfToday();
  const last = addDays(first, DAYS_AHEAD - 1);
  let selected = query.get('day') ? fromDayKey(query.get('day')) : first;
  if (Number.isNaN(selected.getTime()) || selected < first) selected = first;
  if (selected > last) selected = last;
  const secondWeek = selected >= addDays(first, 7);
  const weekStart = addDays(first, secondWeek ? 7 : 0);
  const type = classTypes[query.get('type')] ? query.get('type') : '';
  const level = ['All levels', 'Beginner friendly'].includes(query.get('level')) ? query.get('level') : '';
  const list = sessionsFor(selected).filter((s) => (!type || s.type === type) && (!level || classTypes[s.type].level === level));
  const keep = { type, level };
  return {
    title: 'Class schedule — STUDIO',
    html: `
    <section class="page-head"><div class="wrap"><p class="eyebrow">Schedule</p><h1>Class schedule</h1><p class="lead">Book up to two weeks ahead. Cancel free of charge up to 12 hours before class.</p></div></section>
    <section class="section section-tight">
      <div class="wrap">
        ${rescheduleBanner()}
        <div class="schedule-controls">
          <div class="week-nav">
            <a class="week-btn ${secondWeek ? '' : 'is-disabled'}" ${secondWeek ? `href="${scheduleHref({ ...keep, day: dayKey(first) })}"` : 'aria-disabled="true"'}>← This week</a>
            <a class="week-btn ${secondWeek ? 'is-disabled' : ''}" ${secondWeek ? 'aria-disabled="true"' : `href="${scheduleHref({ ...keep, day: dayKey(addDays(first, 7)) })}"`}>Next week →</a>
          </div>
          <div class="filters">
            <label>Class<select data-change="filter" name="type"><option value="">All classes</option>${Object.entries(classTypes).map(([id, c]) => `<option value="${id}" ${id === type ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label>
            <label>Level<select data-change="filter" name="level"><option value="">Any level</option>${['All levels', 'Beginner friendly'].map((l) => `<option ${l === level ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
          </div>
        </div>
        <nav class="day-strip" aria-label="Choose a day">
          ${Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d) => {
            const active = dayKey(d) === dayKey(selected);
            return `<a class="day ${active ? 'is-active' : ''}" href="${scheduleHref({ ...keep, day: dayKey(d) })}" ${active ? 'aria-current="date"' : ''}><span>${dayKey(d) === dayKey(first) ? 'Today' : formatDate(d, { weekday: 'short' })}</span><strong>${d.getDate()}</strong><small>${formatDate(d, { month: 'short' })}</small></a>`;
          }).join('')}
        </nav>
        <h2 class="day-title">${esc(longDate(selected))}</h2>
        ${list.length ? `<ul class="session-list">${list.map((s) => sessionRow(s)).join('')}</ul>` : `<div class="empty"><p>No classes match these filters on this day.</p><a class="btn btn-ghost" href="${scheduleHref({ day: dayKey(selected) })}">Clear filters</a></div>`}
      </div>
    </section>`,
  };
}

function classesPage() {
  return {
    title: 'Classes — STUDIO',
    html: `
    <section class="page-head"><div class="wrap"><p class="eyebrow">Classes</p><h1>Find the practice that fits your day</h1><p class="lead">Every class is capped at 20 people so teachers can offer hands-on help and options.</p></div></section>
    <section class="section section-tight">
      <div class="wrap class-list">
        ${Object.entries(classTypes).map(([id, c]) => `
          <article class="class-row">
            <a class="class-row-media" href="#/classes/${id}" tabindex="-1" aria-hidden="true">${img(c.image, '')}</a>
            <div class="class-row-body">
              <h2><a href="#/classes/${id}">${c.name}</a></h2>
              <p class="meta">${c.duration} min · ${c.level} · ${c.intensity}</p>
              <p>${c.blurb}</p>
              <div class="row-actions"><a class="btn btn-primary" href="${scheduleHref({ type: id })}">See times</a><a class="link" href="#/classes/${id}">About this class →</a></div>
            </div>
          </article>`).join('')}
      </div>
    </section>`,
  };
}

function classDetail({ params }) {
  const c = classTypes[params.id];
  if (!c) return null;
  const next = [];
  for (let i = 0; i < DAYS_AHEAD && next.length < 6; i += 1) next.push(...sessionsFor(addDays(startOfToday(), i)).filter((s) => s.type === params.id && !isPast(s)));
  const teachers = [...new Set(Object.values(weekly).flat().filter(([, t]) => t === params.id).map(([, , teacher]) => teacher))];
  return {
    title: `${c.name} — STUDIO`,
    html: `
    <section class="class-hero">
      <div class="wrap class-hero-grid">
        <div>
          <a class="back" href="#/classes">← All classes</a>
          <p class="eyebrow">${c.level} · ${c.intensity}</p>
          <h1>${c.name}</h1>
          <p class="lead">${c.blurb}</p>
          <dl class="facts"><div><dt>Length</dt><dd>${c.duration} minutes</dd></div><div><dt>Level</dt><dd>${c.level}</dd></div><div><dt>Drop-in</dt><dd>${money(PRICE.dropIn)}</dd></div></dl>
        </div>
        <div class="class-hero-media">${img(c.image, c.alt, { eager: true })}</div>
      </div>
    </section>
    <section class="section">
      <div class="wrap class-detail-grid">
        <div>
          <h2>Next classes</h2>
          ${next.length ? `<ul class="session-list">${next.slice(0, 6).map((s) => sessionRow(s, { showDate: true })).join('')}</ul>` : '<p>No upcoming classes in the next two weeks.</p>'}
        </div>
        <aside class="side-card">
          <h3>What to bring</h3>
          <ul class="dots">${c.bring.map((b) => `<li>${b}</li>`).join('')}</ul>
          <h3>Taught by</h3>
          ${teachers.map((t) => `<p class="teacher">${avatar(t)}<span><strong>${instructors[t].name}</strong><small>${instructors[t].focus}</small></span></p>`).join('')}
        </aside>
      </div>
    </section>`,
  };
}

let booking = { sessionId: null, stage: 'form', data: {} };
function ticketOptions() {
  const options = [];
  if (state.membership) options.push(['membership', 'Unlimited membership', 'Included']);
  if (state.credits > 0) options.push(['credit', `Class pack credit (${state.credits} left)`, 'Uses 1 credit']);
  if (!state.bookings.length) options.push(['intro', 'First class offer', money(PRICE.intro)]);
  options.push(['drop-in', 'Drop-in', money(PRICE.dropIn)]);
  return options;
}

function bookPage({ params }) {
  const s = sessionById(params.id);
  if (!s) return null;
  const c = classTypes[s.type];
  const summary = `
    <aside class="booking-summary">
      <div class="summary-media">${img(c.image, '', { sizes: '(max-width: 960px) 240px, 360px' })}</div>
      <div class="summary-body">
        <p class="eyebrow">${esc(shortDate(s.start))}</p>
        <h2>${c.name}</h2>
        <p>${formatTime(s.start)} – ${formatTime(new Date(s.start.getTime() + c.duration * 60000))} · ${c.duration} min</p>
        <p class="teacher">${avatar(s.teacher)}<span><strong>${instructors[s.teacher].name}</strong><small>${c.level}</small></span></p>
        <p class="spots-note">${spotsLeft(s)} of ${s.capacity} spots left</p>
      </div>
    </aside>`;
  const wrapPage = (content) => ({ title: `Book ${c.name} — STUDIO`, html: `<section class="section book-section"><div class="wrap"><a class="back" href="${scheduleHref({ day: dayKey(s.start) })}">← Back to schedule</a><div class="book-grid"><div class="book-main">${content}</div>${summary}</div></div></section>` });
  if (myBooking(s)) return wrapPage(`<h1>You are already booked.</h1><p class="lead">See you on ${esc(longDate(s.start))}. You can change or cancel from your bookings.</p><a class="btn btn-primary" href="#/bookings">My bookings</a>`);
  if (isPast(s)) return wrapPage(`<h1>This class has already started.</h1><p class="lead">Choose another time from the schedule.</p><a class="btn btn-primary" href="${scheduleHref({ type: s.type })}">See other times</a>`);
  if (!spotsLeft(s)) return wrapPage(`<h1>This class is full.</h1><p class="lead">Ask at the front desk to join the waitlist, or pick another time.</p><a class="btn btn-primary" href="${scheduleHref({ type: s.type })}">See other times</a>`);

  if (booking.sessionId !== s.id) booking = { sessionId: s.id, stage: 'form', data: { ...state.profile } };
  const moving = state.reschedule && state.bookings.find((b) => b.ref === state.reschedule && b.status === 'booked');
  const d = booking.data;
  const options = ticketOptions();
  const chosen = moving ? moving.ticket : (options.find(([v]) => v === d.ticket) || options[0])[0];
  if (booking.stage === 'review') {
    return wrapPage(`
      ${rescheduleBanner()}
      <h1>Confirm your booking</h1>
      <div class="review-card">
        <dl>
          <div><dt>Class</dt><dd>${c.name}, ${esc(longDate(s.start))} at ${formatTime(s.start)}</dd></div>
          <div><dt>Name</dt><dd>${esc(d.name)}</dd></div>
          <div><dt>Email</dt><dd>${esc(d.email)}</dd></div>
          ${d.phone ? `<div><dt>Phone</dt><dd>${esc(d.phone)}</dd></div>` : ''}
          <div><dt>Ticket</dt><dd>${moving ? `${ticketLabel[chosen]} (moved from your original booking)` : ticketLabel[chosen]}</dd></div>
          ${d.note ? `<div><dt>Note for the teacher</dt><dd>${esc(d.note)}</dd></div>` : ''}
        </dl>
        <p class="pay-note">${['drop-in', 'intro'].includes(chosen) && !moving ? 'You pay at check-in. (Demo: no payment is taken.)' : 'No payment needed for this booking.'}</p>
      </div>
      <div class="form-actions"><button class="btn btn-ghost" data-action="book-edit">Edit details</button><button class="btn btn-primary" data-action="book-confirm">${moving ? 'Confirm new time' : 'Confirm booking'}</button></div>`);
  }
  return wrapPage(`
    ${rescheduleBanner()}
    <h1>${moving ? 'Move your booking' : 'Book your spot'}</h1>
    <form data-form="book" novalidate>
      ${moving ? '' : `
        <fieldset class="tickets"><legend>Ticket</legend>
          ${options.map(([value, label, price]) => `<label class="ticket"><input type="radio" name="ticket" value="${value}" ${value === chosen ? 'checked' : ''}><span><strong>${label}</strong><small>${price}</small></span></label>`).join('')}
          ${state.credits || state.membership ? '' : '<p class="hint">Coming often? <a href="#/pricing">A 10-class pack</a> brings the price down to $20 a class.</p>'}
        </fieldset>`}
      <div class="field"><label for="b-name">Full name</label><input id="b-name" name="name" autocomplete="name" required data-required="Enter your name." value="${esc(d.name)}"></div>
      <div class="field-row">
        <div class="field"><label for="b-email">Email</label><input id="b-email" name="email" type="email" autocomplete="email" required data-required="Enter your email address." value="${esc(d.email)}"></div>
        <div class="field"><label for="b-phone">Mobile <span class="optional">(optional)</span></label><input id="b-phone" name="phone" type="tel" autocomplete="tel" value="${esc(d.phone)}"></div>
      </div>
      <div class="field"><label for="b-note">Anything the teacher should know? <span class="optional">(optional)</span></label><textarea id="b-note" name="note" rows="3" placeholder="Injuries, pregnancy, first class…">${esc(d.note)}</textarea></div>
      <label class="check"><input type="checkbox" name="waiver" required data-required="Please accept the studio waiver to book." ${d.waiver ? 'checked' : ''}><span>I have read and accept the <button type="button" class="text-button" data-action="waiver">studio waiver</button>.</span></label>
      <div class="waiver-text" id="waiver-text" hidden><p>Yoga involves physical movement. I will listen to my body, tell the teacher about injuries or health conditions and practice within my limits. STUDIO is not liable for injuries resulting from ignoring these guidelines. (Sample text.)</p></div>
      <div class="form-actions"><a class="btn btn-ghost" href="${scheduleHref({ day: dayKey(s.start) })}">Cancel</a><button class="btn btn-primary" type="submit">Continue</button></div>
    </form>`);
}

function bookingConfirmation({ params }) {
  const b = state.bookings.find((x) => x.ref === params.ref);
  const s = b && sessionById(b.sessionId);
  if (!s) return null;
  const c = classTypes[s.type];
  const cutoff = new Date(s.start.getTime() - 12 * 3600000);
  return {
    title: 'Booking confirmed — STUDIO',
    html: `
    <section class="section book-section">
      <div class="wrap narrow">
        <div class="confirm-card">
          <span class="tick" aria-hidden="true">✓</span>
          <p class="eyebrow">Booking ${esc(b.ref)}${b.movedFrom ? ' · rescheduled' : ''}</p>
          <h1>You are booked, ${esc(firstName(b.name))}.</h1>
          <p class="lead">${c.name} with ${instructors[s.teacher].name}<br><strong>${esc(longDate(s.start))} at ${formatTime(s.start)}</strong></p>
          <ul class="know">
            <li>Arrive 10 minutes early to settle in.</li>
            <li>${['drop-in', 'intro'].includes(b.ticket) ? `Pay ${money(b.ticket === 'intro' ? PRICE.intro : PRICE.dropIn)} at check-in.` : `Ticket: ${ticketLabel[b.ticket]}.`}</li>
            <li>Free cancellation until ${esc(formatTime(cutoff))} on ${esc(shortDate(cutoff))}, 12 hours before class.</li>
          </ul>
          <p class="demo-note">Demo booking: it lives only in this browser and no confirmation email was sent.</p>
          <div class="form-actions center"><a class="btn btn-ghost" href="#/bookings">My bookings</a><a class="btn btn-primary" href="#/schedule">Book another class</a></div>
        </div>
      </div>
    </section>`,
  };
}

function bookingsPage() {
  const withSession = state.bookings.map((b) => ({ b, s: sessionById(b.sessionId) })).filter((x) => x.s);
  const upcoming = withSession.filter(({ b, s }) => b.status === 'booked' && s.start > new Date()).sort((x, y) => x.s.start - y.s.start);
  const past = withSession.filter(({ b, s }) => b.status === 'booked' && s.start <= new Date());
  const cancelled = withSession.filter(({ b }) => b.status === 'cancelled');
  const card = ({ b, s }, actionsHtml = '') => `
    <li class="booking-card">
      <div class="booking-date"><strong>${s.start.getDate()}</strong><span>${formatDate(s.start, { month: 'short' })}</span></div>
      <div class="booking-info"><strong>${classTypes[s.type].name}</strong><span>${esc(shortDate(s.start))} · ${formatTime(s.start)} · ${instructors[s.teacher].name}</span><small>${b.status === 'cancelled' ? esc(b.cancelNote || 'Cancelled') : ticketLabel[b.ticket]}</small></div>
      <div class="booking-actions">${actionsHtml}</div>
    </li>`;
  return {
    title: 'My bookings — STUDIO',
    html: `
    <section class="page-head"><div class="wrap"><p class="eyebrow">Account</p><h1>My bookings</h1><p class="lead">Change or cancel up to 12 hours before class.</p></div></section>
    <section class="section section-tight">
      <div class="wrap bookings-grid">
        <div>
          <h2>Upcoming</h2>
          ${upcoming.length ? `<ul class="booking-list">${upcoming.map((x) => card(x, `<button class="btn btn-ghost btn-sm" data-action="reschedule" data-ref="${x.b.ref}">Reschedule</button><button class="btn btn-danger btn-sm" data-action="cancel-booking" data-ref="${x.b.ref}">Cancel</button>`)).join('')}</ul>`
            : '<div class="empty"><p>No upcoming classes yet.</p><a class="btn btn-primary" href="#/schedule">Find a class</a></div>'}
          ${past.length ? `<h2>Past</h2><ul class="booking-list muted">${past.map((x) => card(x)).join('')}</ul>` : ''}
          ${cancelled.length ? `<h2>Cancelled</h2><ul class="booking-list muted">${cancelled.map((x) => card(x)).join('')}</ul>` : ''}
        </div>
        <aside class="side-card">
          <h3>Your passes</h3>
          <p class="wallet"><span>Class pack credits</span><strong>${state.credits}</strong></p>
          <p class="wallet"><span>Unlimited membership</span><strong>${state.membership ? 'Active' : '—'}</strong></p>
          <a class="btn btn-ghost full" href="#/pricing">Buy a pass</a>
          <p class="demo-note">Bookings and passes on this demo are stored only in your browser.</p>
        </aside>
      </div>
    </section>`,
  };
}

const plans = {
  pack: { name: '10-class pack', price: PRICE.pack, note: '$20 a class · valid for 6 months', perks: ['Use for any class', 'Share with a friend', 'Book two weeks ahead'] },
  unlimited: { name: 'Unlimited monthly', price: PRICE.unlimited, note: 'per month · cancel anytime', perks: ['Unlimited classes', 'Free mat rental', 'Priority waitlist'] },
};

function pricing() {
  return {
    title: 'Pricing — STUDIO',
    html: `
    <section class="page-head"><div class="wrap"><p class="eyebrow">Pricing</p><h1>Simple, flexible passes</h1><p class="lead">Start with a ${money(PRICE.intro)} first class, then choose what fits your week.</p></div></section>
    <section class="section section-tight">
      <div class="wrap price-grid">
        <article class="price-card">
          <h2>Drop-in</h2><p class="amount">${money(PRICE.dropIn)}</p><p class="note">per class · first class ${money(PRICE.intro)}</p>
          <ul class="dots"><li>Any class on the schedule</li><li>Pay at check-in</li><li>Mats for rent ($2)</li></ul>
          <a class="btn btn-ghost full" href="#/schedule">Book a class</a>
        </article>
        ${Object.entries(plans).map(([id, p]) => `
          <article class="price-card ${id === 'pack' ? 'featured' : ''}">
            ${id === 'pack' ? '<span class="tag">Most popular</span>' : ''}
            <h2>${p.name}</h2><p class="amount">${money(p.price)}</p><p class="note">${p.note}</p>
            <ul class="dots">${p.perks.map((x) => `<li>${x}</li>`).join('')}</ul>
            <a class="btn ${id === 'pack' ? 'btn-primary' : 'btn-ghost'} full" href="#/buy/${id}">Buy ${id === 'pack' ? 'pack' : 'membership'}</a>
          </article>`).join('')}
      </div>
    </section>`,
  };
}

let purchaseDone = null;
function buyPage({ params }) {
  const p = plans[params.plan];
  if (!p) return null;
  const d = state.profile;
  return {
    title: `${p.name} — STUDIO`,
    html: `
    <section class="section book-section">
      <div class="wrap narrow">
        <a class="back" href="#/pricing">← Pricing</a>
        <h1>${p.name}</h1>
        <p class="lead">${money(p.price)} ${p.note}</p>
        ${params.plan === 'unlimited' && state.membership ? '<div class="banner"><span>You already have an active unlimited membership.</span></div>' : ''}
        <form class="review-card" data-form="buy" data-plan="${params.plan}" novalidate>
          <div class="field"><label for="p-name">Full name</label><input id="p-name" name="name" autocomplete="name" required data-required="Enter your name." value="${esc(d.name)}"></div>
          <div class="field"><label for="p-email">Email</label><input id="p-email" name="email" type="email" autocomplete="email" required data-required="Enter your email address." value="${esc(d.email)}"></div>
          <p class="pay-note">In a live studio you would pay by card here. This demo takes no payment and adds the pass to this browser only.</p>
          <button class="btn btn-primary full" type="submit">Add ${p.name} · ${money(p.price)}</button>
        </form>
      </div>
    </section>`,
  };
}

function purchaseConfirmation() {
  if (!purchaseDone) return null;
  const p = plans[purchaseDone.plan];
  return {
    title: 'Pass added — STUDIO',
    html: `
    <section class="section book-section"><div class="wrap narrow"><div class="confirm-card">
      <span class="tick" aria-hidden="true">✓</span>
      <p class="eyebrow">Purchase ${esc(purchaseDone.ref)}</p>
      <h1>${p.name} added.</h1>
      <p class="lead">${purchaseDone.plan === 'pack' ? `You now have ${state.credits} class credits.` : 'Your unlimited membership is active.'} Choose “${purchaseDone.plan === 'pack' ? 'Class pack credit' : 'Unlimited membership'}” when you book.</p>
      <p class="demo-note">Demo purchase: no payment was taken.</p>
      <div class="form-actions center"><a class="btn btn-primary" href="#/schedule">Book a class</a></div>
    </div></div></section>`,
  };
}

function about() {
  return {
    title: 'About — STUDIO',
    html: `
    <section class="page-head"><div class="wrap"><p class="eyebrow">About</p><h1>A quiet room in a busy city</h1><p class="lead">STUDIO opened with one idea: an hour on the mat should feel like a pause, not another thing to get right.</p></div></section>
    <section class="section section-tight">
      <div class="wrap about-grid">
        <div class="about-media">${img('breathwork', 'Meditation cushions arranged in a circle in the studio')}</div>
        <div>
          <h2>Small classes, real attention</h2>
          <p>Classes are capped at 20, so teachers learn your name and your old knee injury. Mats, blocks, bolsters and blankets are always included.</p>
          <ul class="dots"><li>Showers and changing rooms</li><li>Filtered water and tea bar</li><li>Free parking behind the building</li><li>Mat storage for members</li></ul>
        </div>
      </div>
    </section>
    <section class="section section-pale">
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">Teachers</p><h2>The people you will practice with</h2></div></div>
        <div class="teacher-grid">
          ${Object.values(instructors).map((t) => `<article class="teacher-card"><span class="avatar lg" style="background:${t.color}" aria-hidden="true">${t.initials}</span><h3>${t.name}</h3><p class="meta">${t.focus}</p><p>${t.bio}</p></article>`).join('')}
        </div>
      </div>
    </section>`,
  };
}

function notFound() {
  return { title: 'Page not found — STUDIO', html: `<section class="section"><div class="wrap narrow center"><p class="eyebrow">404</p><h1>This page took a rest day.</h1><a class="btn btn-primary" href="#/schedule">See the schedule</a></div></section>` };
}

const router = createRouter([
  ['/', home],
  ['/schedule', schedule],
  ['/classes', classesPage],
  ['/classes/:id', classDetail],
  ['/book/:id', bookPage],
  ['/booking/:ref', bookingConfirmation],
  ['/bookings', bookingsPage],
  ['/pricing', pricing],
  ['/buy/:plan', buyPage],
  ['/purchase', purchaseConfirmation],
  ['/about', about],
], { notFound, afterRender: () => setMenu(false) });

function setMenu(open) {
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', String(open));
  document.getElementById('mobile-nav').hidden = !open;
}

actions({
  menu: (button) => setMenu(button.getAttribute('aria-expanded') !== 'true'),
  filter: (select) => {
    const [, search = ''] = location.hash.split('?');
    const q = new URLSearchParams(search);
    if (select.value) q.set(select.name, select.value); else q.delete(select.name);
    router.go(`#/schedule${q.toString() ? `?${q}` : ''}`);
  },
  waiver: () => { const box = document.getElementById('waiver-text'); box.hidden = !box.hidden; },
  book: (form) => {
    if (!validate(form)) return;
    booking.data = { ...booking.data, ...formData(form), waiver: true };
    booking.stage = 'review';
    router.render();
  },
  'book-edit': () => { booking.stage = 'form'; router.render(); },
  'book-confirm': () => {
    const s = sessionById(booking.sessionId);
    if (!s || isPast(s) || !spotsLeft(s)) { toast('Sorry, that class is no longer available.'); router.render(); return; }
    const moving = state.reschedule && state.bookings.find((b) => b.ref === state.reschedule && b.status === 'booked');
    const options = ticketOptions();
    const ticket = moving ? moving.ticket : (options.find(([v]) => v === booking.data.ticket) || options[0])[0];
    if (ticket === 'credit' && !moving) state.credits -= 1;
    const { name, email, phone = '', note = '' } = booking.data;
    const ref = reference('STU');
    state.bookings.push({ ref, sessionId: s.id, ticket, name, email, phone, note, status: 'booked', createdAt: Date.now(), movedFrom: moving?.ref || null });
    if (moving) {
      moving.status = 'cancelled';
      moving.cancelNote = `Moved to ${shortDate(s.start)} at ${formatTime(s.start)}`;
      state.reschedule = null;
    }
    state.profile = { name, email, phone };
    save();
    booking = { sessionId: null, stage: 'form', data: {} };
    router.go(`#/booking/${ref}`);
  },
  'cancel-booking': async (button) => {
    const b = state.bookings.find((x) => x.ref === button.dataset.ref);
    const s = sessionById(b.sessionId);
    const late = s.start - new Date() < 12 * 3600000;
    const ok = await confirmDialog({
      title: 'Cancel this booking?',
      message: `${classTypes[s.type].name}, ${longDate(s.start)} at ${formatTime(s.start)}.${late ? '\n\nThis is less than 12 hours before class, so it counts as a late cancellation.' : b.ticket === 'credit' ? '\n\nYour class credit will be returned.' : ''}`,
      confirm: 'Cancel booking', cancel: 'Keep booking', danger: true,
    });
    if (!ok || b.status !== 'booked') return;
    b.status = 'cancelled';
    b.cancelNote = late ? 'Cancelled late' : 'Cancelled';
    if (b.ticket === 'credit') state.credits += 1;
    if (state.reschedule === b.ref) state.reschedule = null;
    save();
    router.render({ keepScroll: true });
    toast(b.ticket === 'credit' ? 'Booking cancelled. Your class credit is back in your account.' : 'Booking cancelled. Your spot has been released.');
  },
  reschedule: (button) => {
    const b = state.bookings.find((x) => x.ref === button.dataset.ref);
    state.reschedule = b.ref;
    save();
    const s = sessionById(b.sessionId);
    router.go(scheduleHref({ day: dayKey(s.start), type: s.type }));
  },
  'keep-booking': () => { state.reschedule = null; save(); router.render({ keepScroll: true }); toast('Your original booking is unchanged.'); },
  buy: (form) => {
    if (!validate(form)) return;
    const plan = form.dataset.plan;
    const { name, email } = formData(form);
    state.profile = { ...state.profile, name, email };
    if (plan === 'pack') state.credits += 10;
    else state.membership = { since: Date.now() };
    purchaseDone = { plan, ref: reference('PASS') };
    state.purchases.push({ ...purchaseDone, at: Date.now() });
    save();
    router.go('#/purchase');
  },
});

updateBadge();
