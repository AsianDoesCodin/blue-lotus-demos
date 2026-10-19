// RELAY — demo automation hub that Blue Lotus Coding built for Ironwood Plumbing & Air, a fictional
// Birmingham, AL company. Every run is simulated inside the page: no texts, emails or requests leave it.
const { esc, money, router: createRouter, toast, modal, storage, actions, demoBar } = Kit;
demoBar('RELAY', 'app');

/* ------------------------------------------------------------------ helpers */
const OFFICE = '(205) 555-0148';
const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const WEEKS_PER_MONTH = 4.33;
const TZ = 'America/Chicago';
const CANCEL = Symbol('cancel');
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
const pad2 = (n) => String(n).padStart(2, '0');
const sum = (list) => list.reduce((a, b) => a + b, 0);
const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
const num = (n, digits = 0) => new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
const hashStr = (text) => { let h = 2166136261; for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); };
const rng = (seed) => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pickFrom = (r, list) => list[Math.floor(r() * list.length)];

// All clock times are shown in Birmingham time, whatever the visitor's own time zone is.
const partsFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short' });
function chi(ts) {
  const p = {};
  for (const { type, value } of partsFmt.formatToParts(new Date(ts))) p[type] = value;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, min: +p.minute, wd: p.weekday };
}
function chiTs(y, m, d, h = 0, min = 0) {
  const want = Date.UTC(y, m - 1, d, h, min);
  let ts = want + 5 * HOUR;
  for (let i = 0; i < 3; i += 1) { const p = chi(ts); ts -= Date.UTC(p.y, p.m - 1, p.d, p.h, p.min) - want; }
  return ts;
}
const tf = (opts) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, ...opts });
const F = {
  time: tf({ hour: 'numeric', minute: '2-digit' }),
  clock: tf({ hour: 'numeric', minute: '2-digit', second: '2-digit' }),
  log: tf({ hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }),
  date: tf({ weekday: 'short', month: 'short', day: 'numeric' }),
  day: tf({ month: 'short', day: 'numeric' }),
  long: tf({ weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
  month: tf({ month: 'long' }),
  monthShort: tf({ month: 'short' }),
  narrow: tf({ weekday: 'narrow' }),
  dayNum: tf({ day: 'numeric' }),
};
const at = (ts) => F.time.format(ts);
const stamp = (ts) => `${F.log.format(ts)}.${String(Math.floor(ts) % 1000).padStart(3, '0')}`;
const dayKeyChi = (ts) => { const p = chi(ts); return `${p.y}-${pad2(p.m)}-${pad2(p.d)}`; };
const isWeekendTs = (ts) => ['Sat', 'Sun'].includes(chi(ts).wd);
const isAfterHours = (ts) => {
  const p = chi(ts);
  if (p.wd === 'Sun') return true;
  if (p.wd === 'Sat') return p.h < 8 || p.h >= 16;
  return p.h < 8 || p.h >= 18;
};
function ago(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 0) return `in ${span(-s * 1000)}`;
  if (s < 10) return 'just now';
  if (s < 60) return `${s} sec ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
function span(ms) {
  const m = Math.round(ms / MIN);
  if (m < 1) return `${Math.max(1, Math.round(ms / 1000))} sec`;
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return m % 60 ? `${h} hr ${m % 60} min` : `${h} hr`;
  const d = Math.round(h / 24);
  return plural(d, 'day');
}
const fmtMs = (ms) => (ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`);
const fmtOffset = (ms) => {
  if (ms < MIN) return `+${(ms / 1000).toFixed(1)}s`;
  if (ms < HOUR) return `+${Math.floor(ms / MIN)}m ${pad2(Math.floor((ms % MIN) / 1000))}s`;
  if (ms < DAY) return `+${Math.floor(ms / HOUR)}h ${pad2(Math.floor((ms % HOUR) / MIN))}m`;
  return `+${Math.floor(ms / DAY)}d ${Math.floor((ms % DAY) / HOUR)}h`;
};

/* -------------------------------------------------------------------- icons */
const ICONS = {
  web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8.5h18M7 12.5h6M7 16h9"/>',
  phone: '<path d="M6.6 3.5h2.9l1.7 4.4-2.1 1.3a11.5 11.5 0 0 0 5.7 5.7l1.3-2.1 4.4 1.7v2.9a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/>',
  crm: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>',
  sms: '<path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  invoice: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  reviews: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  relay: '<circle cx="5.5" cy="12" r="2.5"/><circle cx="18.5" cy="5.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M8 12h3.5l4.8-5.2M11.5 12l4.8 5.2"/>',
  condition: '<path d="M12 3.5 20.5 12 12 20.5 3.5 12z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7.5a3 3 0 0 0 0-6h-7a3 3 0 0 1 0-6H16"/>',
  play: '<path d="M7.5 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor" stroke="none"/>',
  retry: '<path d="M20 11.5a8 8 0 1 1-2.4-5.7L20 8M20 3.5V8h-4.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  pause: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
  sync: '<path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L19.5 9M19.5 4.5V9H15M19.5 12a7.5 7.5 0 0 1-13 5.1L4.5 15M4.5 19.5V15H9"/>',
  bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  dollar: '<path d="M12 3v18M16.5 7.5c-.6-1.6-2.3-2.5-4.5-2.5-2.6 0-4.5 1.3-4.5 3.4 0 4.6 9.5 2.6 9.5 7.3 0 2.1-2 3.3-4.9 3.3-2.3 0-4.1-1-4.8-2.8"/>',
};
const icon = (name, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

/* ------------------------------------------------------------ business data */
const TECHS = {
  marcus: { name: 'Marcus Bell', first: 'Marcus', trade: 'plumbing', phone: '(205) 555-0171' },
  dana: { name: 'Dana Whitfield', first: 'Dana', trade: 'HVAC, NATE-certified', phone: '(205) 555-0172' },
  luis: { name: 'Luis Ortega', first: 'Luis', trade: 'water heaters & gas lines', phone: '(205) 555-0173' },
};
const ASSIGNEE_LABEL = {
  auto: 'Route by service (automatic)', desk: 'Dispatch desk (office)', marcus: 'Marcus Bell · plumbing', dana: 'Dana Whitfield · HVAC', luis: 'Luis Ortega · water heaters & gas',
};
const personName = (key) => (TECHS[key] ? TECHS[key].name : 'Dispatch desk');
const routeByService = (s) => (/water heater|tankless|gas line/i.test(s) ? 'luis' : /\b(ac|furnace|hvac|heat pump|cooling|heating)\b/i.test(s) ? 'dana' : 'marcus');

const APPS = {
  web: { name: 'Website form', short: 'Web form', blurb: 'Quote requests and Ironwood Club signups from the company website.', unit: 'forms', base: 14 },
  phone: { name: 'Phone line', short: 'Phone', blurb: `Missed calls and voicemails from the main line, ${OFFICE}.`, unit: 'calls', base: 11 },
  crm: { name: 'CRM', short: 'CRM', blurb: 'Customers, jobs, tickets and tasks: the record the whole office works from.', unit: 'records', base: 188 },
  sms: { name: 'Text messages', short: 'Text', blurb: 'Two-way texting from the main business number.', unit: 'texts', base: 97 },
  email: { name: 'Email', short: 'Email', blurb: 'Welcome emails and payment reminders from the office inbox.', unit: 'emails', base: 21 },
  invoice: { name: 'Invoicing', short: 'Invoice', blurb: 'Invoices, pay links and payment status for every job.', unit: 'invoices', base: 33 },
  calendar: { name: 'Calendar', short: 'Calendar', blurb: 'Technician schedules, arrival windows and booked tune-ups.', unit: 'events', base: 26 },
  reviews: { name: 'Reviews', short: 'Reviews', blurb: 'Review requests that go out after four- and five-star visits.', unit: 'requests', base: 8 },
  relay: { name: 'RELAY logic', short: 'Logic', blurb: 'Rules, waits and branches inside RELAY.', unit: 'checks', base: 0 },
};
const INTEGRATIONS = ['web', 'phone', 'crm', 'sms', 'email', 'invoice', 'calendar', 'reviews'];
const APP_MS = { web: 60, phone: 60, crm: 340, sms: 620, email: 560, invoice: 760, calendar: 420, reviews: 480, relay: 90 };
const ERRORS = {
  sms: 'Text messages returned 503 Service Unavailable (simulated outage)',
  crm: 'CRM request timed out after 10s (simulated)',
  email: 'Email service returned 429 Too Many Requests (simulated)',
  invoice: 'Invoicing returned 502 Bad Gateway (simulated)',
  calendar: 'Calendar returned 503 Service Unavailable (simulated)',
  reviews: 'Reviews returned 503 Service Unavailable (simulated)',
  relay: 'Route builder timed out after 8s (simulated)',
};
const KIND = { trigger: 'Trigger', action: 'Action', condition: 'Condition' };

const PEOPLE = [
  ['Tanya Brooks', 'Homewood', '35209'], ['Robert Hayes', 'Mountain Brook', '35223'], ['Denise Carter', 'Vestavia Hills', '35216'],
  ['Michael Grant', 'Hoover', '35244'], ['Carla Jennings', 'Mountain Brook', '35213'], ['Kendra Wallace', 'Hoover', '35226'],
  ['James Whitley', 'Birmingham', '35205'], ['Angela Moore', 'Pelham', '35124'], ['Chris Patel', 'Vestavia Hills', '35243'],
  ['LaToya Simmons', 'Birmingham', '35222'], ['Greg Holloway', 'Homewood', '35209'], ['Megan Foster', 'Hoover', '35242'],
  ['Darius King', 'Birmingham', '35203'], ['Susan Pruitt', 'Mountain Brook', '35223'], ['Brian Tate', 'Pelham', '35124'],
  ['Monique Ellis', 'Birmingham', '35205'], ['Kevin Ochoa', 'Hoover', '35244'], ['Rachel Dunn', 'Vestavia Hills', '35216'],
];
const PHONE_ENDS = Array.from({ length: 97 }, (_, i) => i + 2).filter((n) => ![19, 32, 48, 67, 71, 72, 73].includes(n));
const randomPhone = (r) => `(205) 555-01${pad2(pickFrom(r, PHONE_ENDS))}`;
// [service as it reads mid-sentence, flat-rate price, technician]
const SERVICES = [
  ['drain clearing', 149, 'marcus'], ['toilet repair', 129, 'marcus'], ['leak repair', 179, 'marcus'], ['faucet replacement', 189, 'marcus'],
  ['water heater flush', 129, 'luis'], ['water heater repair', 189, 'luis'], ['40-gal water heater replacement', 1650, 'luis'], ['tankless water heater install', 3900, 'luis'],
  ['AC tune-up', 99, 'dana'], ['AC repair', 189, 'dana'], ['furnace tune-up', 99, 'dana'], ['furnace repair', 189, 'dana'],
];
const JOBS = {
  marcus: [['8–10 AM', 'Drain clearing', 'Homewood'], ['10 AM–12 PM', 'Leak repair', 'Mountain Brook'], ['12–2 PM', 'Toilet repair', 'Birmingham'], ['2–4 PM', 'Faucet replacement', 'Vestavia Hills']],
  dana: [['8–10 AM', 'AC tune-up (Club member)', 'Hoover'], ['10 AM–12 PM', 'AC repair', 'Vestavia Hills'], ['2–4 PM', 'Furnace tune-up', 'Pelham']],
  luis: [['8–10 AM', '50-gal water heater replacement', 'Homewood'], ['2–4 PM', 'Water heater flush', 'Birmingham']],
};
const dispatchVars = (key) => {
  const jobs = JOBS[key];
  return { first_name: TECHS[key].first, job_count: String(jobs.length), first_stop: `${jobs[0][1]}, ${jobs[0][2]}`, first_window: jobs[0][0], route_link: `ironwood.example/route/${key}` };
};
function nextSpring() {
  const now = chi(Date.now());
  const y = now.m >= 3 ? now.y + 1 : now.y;
  let ts = chiTs(y, 3, 9, 12);
  while ([0, 6].includes(new Date(ts).getUTCDay())) ts += DAY;
  return ts;
}

/* ---------------------------------------------------------------- templates */
const T = {
  leadText: 'Hi {first_name}, this is Ironwood Plumbing & Air. Thanks for your request about {service}. A dispatcher will call you shortly, or reply here with a good time. Need help sooner? Call (205) 555-0148, 24/7.',
  leadFollow: 'Hi {first_name}, just checking in from Ironwood. Book before 2 PM and we can often get a tech out the same day. Reply with a time that works, or call (205) 555-0148.',
  missedText: 'Hi {first_name}, sorry we missed your call! This is Ironwood Plumbing & Air. Book a time here: {booking_link} or reply with what’s going on and we’ll call you right back.',
  onCall: 'On call: missed call from {full_name}, {phone} ({city}). Ticket #{ticket}: {issue}. They have the booking link. Please call back within 15 min.',
  payLink: 'Hi {first_name}, thanks for choosing Ironwood! Your invoice {invoice} for {amount} is ready: {pay_link}. How did {tech_name} do today? Reply 1–5.',
  review: 'Thanks for the {rating} stars, {first_name}! Would you share a quick review of {tech_name}’s visit? It really helps a local family business: {review_link}',
  remind3: 'Hi {first_name}, a friendly reminder from Ironwood Plumbing & Air: invoice {invoice} for {amount} was due {due_date}. You can pay here: {pay_link}. Already paid? Thank you, and please ignore this.',
  remind7Subject: 'Second reminder: invoice {invoice} for {amount}',
  remind7: 'Hi {first_name},\n\nOur records show invoice {invoice} for {amount} is now 7 days past due. You can pay securely at {pay_link}, or call us at (205) 555-0148 if you’d like to set up a payment plan.\n\nThank you for choosing a local, family-owned company.\nIronwood Plumbing & Air',
  welcomeSubject: 'Welcome to the Ironwood Club, {first_name}!',
  welcome: 'Hi {first_name},\n\nThanks for joining the Ironwood Club. Here’s what your $14.95 a month covers:\n• AC tune-up in the spring and furnace tune-up in the fall\n• A yearly plumbing inspection with a water heater flush\n• 15% off repairs and no after-hours fee\n• Priority scheduling\n\nWe’ve booked your spring AC tune-up for {tune_up_date}. Need anything sooner? Call (205) 555-0148, day or night.\n\nThe Ironwood team',
  dispatch: 'Morning {first_name}! You have {job_count} jobs today. First stop: {first_stop}, {first_window}. Full route: {route_link}',
};
const fill = (tpl, vars) => String(tpl).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== '' ? vars[k] : m));
const fillHtml = (tpl, vars) => esc(tpl).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? `<mark class="v-ok">${esc(vars[k])}</mark>` : `<mark class="v-bad">${m}</mark>`));
const unknownVars = (tpl, vars) => [...new Set([...String(tpl).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => vars[k] === undefined))];
const segs = (text) => (text.length <= 160 ? 1 : Math.ceil(text.length / 153));

/* ---------------------------------------------------------- artifact makers */
const smsArt = (id, toName, to, body, note, from = OFFICE) => ({ id, type: 'sms', app: 'sms', title: `Text to ${toName}`, to, from, body, note });
const emailArt = (id, toName, to, subject, body) => ({ id, type: 'email', app: 'email', title: `Email to ${toName}`, to, subject, body });
const recordArt = (id, app, title, rows, tag = '', tone = 'lime') => ({ id, type: 'record', app, title, rows, tag, tone });
const smsLines = (to, body, note) => [
  ['data', `sms.send → ${to} · ${body.length} chars · ${plural(segs(body), 'segment')}`],
  ['muted', `preview only, not sent${note ? ` · ${note}` : ''}`],
];
const trimData = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === 'string' && v.length > 64 ? `${v.slice(0, 61)}…` : v]));
const pick = (obj, ...keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));
const leadRecord = (x) => recordArt('crm', 'crm', `CRM contact · ${x.crm.id}`, [
  ['Name', x.vars.full_name], ['Phone', x.vars.phone], ['Email', x.vars.email], ['Location', `${x.vars.city}, AL ${x.vars.zip}`],
  ['Interested in', cap(x.vars.service)], ['Source', 'Website form'], ['Owner', x.crm.owner], ['Stage', x.crm.stage],
], x.crm.stage, x.crm.stage === 'New lead' ? 'cyan' : 'lime');
const ticketRecord = (x) => recordArt('ticket', 'crm', `Ticket #${x.vars.ticket}`, [
  ['Customer', `${x.vars.full_name} (existing customer)`], ['Phone', x.vars.phone], ['Location', `${x.vars.city}, AL ${x.vars.zip}`],
  ['Issue', x.vars.issue], ['Voicemail', `“${x.vars.voicemail}”`], ['Priority', 'High · keyword “backing up”'], ['Assigned', x.ticket.assigned], ['Status', 'Open'],
], 'High priority', 'amber');
const invoiceArt = (x) => ({
  id: 'invoice', type: 'invoice', app: 'invoice', title: `Invoice ${x.vars.invoice}`, customer: `${x.vars.full_name} · ${x.vars.city}, AL ${x.vars.zip}`,
  lines: x.inv.lines, due: x.inv.due, status: x.inv.status, tone: x.inv.tone, link: x.vars.pay_link, note: x.inv.note,
});

/* -------------------------------------------------------------------- flows */
// Nodes sit on a grid: `col` runs left to right, `lane` is 0 for the main path and -1 / 1 for yes / no branches.
const FLOWS = [
  {
    id: 'web-lead', name: 'Web lead follow-up', app: 'web', runsWeek: 27, savedMin: 12, live: true, bump: 'crm',
    chain: ['New web lead', 'create CRM contact', 'text back in 60 sec', 'assign dispatcher', 'follow up if no reply in 2 hr'],
    trigger: 'Website form · Request a quote',
    sim: { key: 'replied', type: 'switch', label: 'Customer replies within 2 hr', default: false },
    decide: (s) => (s ? 'yes' : 'no'),
    vars: ['first_name', 'full_name', 'service', 'city', 'phone'],
    sample: () => ({ first_name: 'Tanya', full_name: 'Tanya Brooks', phone: '(205) 555-0163', email: 'tanya.brooks@example.com', service: 'water heater replacement', city: 'Homewood', zip: '35209', message: 'Our water heater is 12 years old and leaking from the bottom. Hoping to get a quote this week.' }),
    sampleLine: (v) => `${v.full_name} · ${v.phone} · ${v.service}`,
    triggerLabel: (v) => `Website form · ${v.full_name}`,
    feed: (v) => [`New web lead: <b>${esc(v.full_name)}</b> (${esc(v.service)}, ${esc(v.city)})`, 'CRM contact created', `texted back in ${v.secs} sec`, `assigned to ${esc(v.tech)}`],
    nodes: [
      {
        id: 'n1', kind: 'trigger', app: 'web', col: 0, title: 'Quote request submitted', sub: 'Website form · Request a quote',
        help: 'Starts the moment someone sends the Request a quote form on the Ironwood website, day or night.',
        note: 'Form received from {full_name} · {service}',
        exec: (x) => ({ lines: [['data', 'webhook website_form.submitted · form=request_a_quote']], data: pick(x.vars, 'full_name', 'phone', 'email', 'service', 'zip', 'message') }),
      },
      {
        id: 'n2', kind: 'action', app: 'crm', col: 1, title: 'Create CRM contact', sub: 'Stage: New lead · Source: Website',
        help: 'Adds the lead to the CRM with everything from the form, so nobody has to retype it.',
        note: 'Contact {crm_id} created · stage New lead',
        exec: (x) => {
          x.crm = { id: x.vars.crm_id, stage: 'New lead', owner: 'Unassigned' };
          return { lines: [['data', `crm.contacts.create → ${x.crm.id}`], ['muted', 'duplicate check: no contact with this phone or email']], data: { id: x.crm.id, stage: 'New lead', source: 'Website form', tags: ['web-lead', x.vars.service] }, artifacts: [leadRecord(x)] };
        },
      },
      {
        id: 'n3', kind: 'action', app: 'sms', col: 2, title: 'Text back in 60 sec', sub: 'Any hour, from the main number', settings: { template: T.leadText },
        help: 'Replies by text within a minute so the lead hears from Ironwood before they call the next company.',
        note: 'Text-back sent to {phone}',
        exec: (x, c) => {
          const body = fill(c.template, x.vars);
          return { lines: smsLines(x.vars.phone, body, '41 sec after the form came in'), artifacts: [smsArt('sms-1', x.vars.full_name, x.vars.phone, body, 'Would send 41 sec after the form came in')] };
        },
      },
      {
        id: 'n4', kind: 'action', app: 'crm', col: 3, title: 'Assign dispatcher', settings: { assignee: 'auto' }, assignees: ['auto', 'desk', 'marcus', 'dana', 'luis'], assigneeLabel: 'Assign lead to',
        sub: (c) => (c.assignee === 'auto' ? 'Suggests a tech by service' : `Owner: ${personName(c.assignee)}`),
        help: 'Gives the lead an owner and a call-back task. On automatic, RELAY suggests the right technician for the job.',
        note: 'Owner set · call-back task created',
        exec: (x, c) => {
          const auto = c.assignee === 'auto';
          const key = auto ? routeByService(x.vars.service) : c.assignee;
          const tech = TECHS[key];
          x.crm.owner = key === 'desk' ? 'Dispatch desk' : auto ? `Dispatch desk · suggested ${tech.name}` : tech.name;
          const lines = auto
            ? [['data', `rule service ~ "${x.vars.service}" → ${tech.name} (${tech.trade})`]]
            : [['data', `assign → ${personName(key)}`]];
          lines.push(['data', `task.create "Call ${x.vars.full_name}" · due in 30 min`]);
          const task = recordArt('task', 'crm', `Task · Call ${x.vars.full_name}`, [
            ['Assigned to', auto || key === 'desk' ? 'Dispatch desk' : tech.name], ['Suggested tech', auto ? `${tech.name} (${tech.trade})` : '—'],
            ['About', cap(x.vars.service)], ['Due', 'Within 30 min'], ['Lead', `${x.crm.id} · ${x.vars.phone}`],
          ], 'Open', 'cyan');
          return { lines, data: { owner: x.crm.owner, task: `Call ${x.vars.full_name}`, due_in_min: 30 }, artifacts: [leadRecord(x), task] };
        },
      },
      {
        id: 'n5', kind: 'condition', app: 'relay', col: 4, title: 'Replied within 2 hr?', settings: { delay: 120, unit: 'min' }, delayRange: [5, 1440],
        sub: (c) => `Waits ${span(c.delay * MIN)}, then checks`,
        help: 'Waits for the customer to answer the text. If they reply, the dispatcher takes it from there; if not, RELAY nudges them once.',
        rule: 'replied = any text from the lead’s number since the text-back',
        note: 'Checked for a reply after the wait',
        exec: (x, c) => {
          const yes = Boolean(x.sim);
          return {
            lines: [['wait', `wait ${span(c.delay * MIN)} · fast-forwarded in test mode`], ['data', `check replies from ${x.vars.phone}`], ['data', yes ? '→ 1 reply: “Tomorrow morning works, thanks!”' : '→ no reply yet']],
            data: { replied: yes }, branch: yes ? 'yes' : 'no',
          };
        },
      },
      {
        id: 'n6', kind: 'action', app: 'crm', col: 5, lane: -1, title: 'Mark as contacted', sub: 'Stops the follow-up',
        help: 'The customer answered, so RELAY marks the lead as contacted and cancels the follow-up text.',
        note: 'Stage → Contacted · follow-up cancelled',
        exec: (x) => { x.crm.stage = 'Contacted'; return { lines: [['data', `crm.contacts.update ${x.crm.id} stage=Contacted`], ['muted', 'follow-up cancelled: the customer replied']], artifacts: [leadRecord(x)] }; },
      },
      {
        id: 'n7', kind: 'action', app: 'sms', col: 5, lane: 1, title: 'Send follow-up text', sub: 'Only when there’s no reply', settings: { template: T.leadFollow },
        help: 'One friendly nudge, then the dispatcher takes over. RELAY never sends more than one follow-up.',
        note: 'Follow-up text sent to {phone}',
        exec: (x, c) => {
          x.crm.stage = 'Follow-up sent';
          const body = fill(c.template, x.vars);
          return { lines: smsLines(x.vars.phone, body), artifacts: [smsArt('sms-2', x.vars.full_name, x.vars.phone, body, 'Follow-up, sent once'), leadRecord(x)] };
        },
      },
    ],
    edges: [['n1', 'n2'], ['n2', 'n3'], ['n3', 'n4'], ['n4', 'n5'], ['n5', 'n6', 'yes'], ['n5', 'n7', 'no']],
  },
  {
    id: 'missed-call', name: 'Missed call text-back', app: 'phone', runsWeek: 19, savedMin: 9, live: true, bump: 'ticket',
    chain: ['Missed call', 'text back with booking link', 'create ticket', 'notify on-call tech after hours'],
    trigger: `Phone line · ${OFFICE}`,
    sim: { key: 'afterHours', type: 'switch', label: 'Simulate after hours', default: false },
    decide: (s) => (s ? 'yes' : 'no'),
    vars: ['first_name', 'full_name', 'phone', 'city', 'booking_link', 'ticket', 'issue'],
    sample: () => ({ first_name: 'Robert', full_name: 'Robert Hayes', phone: '(205) 555-0187', city: 'Mountain Brook', zip: '35223', issue: 'kitchen sink backing up into the dishwasher', voicemail: 'Hey, our kitchen sink is backing up into the dishwasher. Please give me a call back.', booking_link: 'ironwood.example/book' }),
    sampleLine: (v) => `${v.full_name} · ${v.phone} · voicemail`,
    triggerLabel: (v) => `Missed call · ${v.phone}`,
    feed: (v, r) => [`Missed call from <b>${esc(v.phone)}</b>`, 'text sent', `ticket #${esc(v.ticket)} created`, ...(r.sim ? [`${esc(v.oncall)} paged (after hours)`] : [])],
    nodes: [
      {
        id: 'm1', kind: 'trigger', app: 'phone', col: 0, title: 'Missed call', sub: `Main line ${OFFICE}`,
        help: 'Starts when a call to the main line rings out or the lines are busy. RELAY matches the number against the CRM.',
        note: 'Missed call from {phone}',
        exec: (x) => ({ lines: [['data', `phone.call.missed from ${x.vars.phone}`], ['muted', `caller matched in CRM: ${x.vars.full_name}`]], data: { from: x.vars.phone, to: OFFICE, voicemail_sec: 22, transcript: x.vars.voicemail } }),
      },
      {
        id: 'm2', kind: 'action', app: 'sms', col: 1, title: 'Text back with booking link', sub: 'Within 30 sec of the call', settings: { template: T.missedText },
        help: 'Texts the caller right away with a link to book online, so a missed call doesn’t become a lost job.',
        note: 'Booking link texted to {phone}',
        exec: (x, c) => { const body = fill(c.template, x.vars); return { lines: smsLines(x.vars.phone, body, '18 sec after the call'), artifacts: [smsArt('sms-1', x.vars.full_name, x.vars.phone, body, 'Would send 18 sec after the missed call')] }; },
      },
      {
        id: 'm3', kind: 'action', app: 'crm', col: 2, title: 'Create ticket', sub: 'Priority from voicemail keywords',
        help: 'Opens a service ticket with the voicemail transcript. Words like “leak”, “backing up” or “no heat” raise the priority.',
        note: 'Ticket #{ticket} opened · priority High',
        exec: (x) => { x.ticket = { assigned: 'Unassigned' }; return { lines: [['data', `crm.tickets.create → #${x.vars.ticket}`], ['data', 'priority=high · matched keyword “backing up”']], data: { ticket: Number(x.vars.ticket), priority: 'high', customer: x.vars.full_name, issue: x.vars.issue }, artifacts: [ticketRecord(x)] }; },
      },
      {
        id: 'm4', kind: 'condition', app: 'relay', col: 3, title: 'After hours?', sub: 'Mon–Fri 8–6 · Sat 8–4',
        help: 'Office hours match Ironwood’s arrival windows. After hours, the on-call technician gets paged; otherwise the dispatch desk calls back.',
        rule: 'after_hours = outside Mon–Fri 8 AM–6 PM and Sat 8 AM–4 PM',
        note: 'Office-hours check',
        exec: (x) => {
          const yes = Boolean(x.sim);
          return { lines: [['data', `clock (simulated): ${yes ? 'Tue 9:12 PM' : 'Tue 10:24 AM'}`], ['muted', 'office hours: Mon–Fri 8 AM–6 PM, Sat 8 AM–4 PM'], ['data', `after_hours = ${yes}`]], data: { after_hours: yes }, branch: yes ? 'yes' : 'no' };
        },
      },
      {
        id: 'm5', kind: 'action', app: 'sms', col: 4, lane: -1, title: 'Notify on-call tech', settings: { template: T.onCall, assignee: 'marcus' }, assignees: ['marcus', 'dana', 'luis'], assigneeLabel: 'On-call technician',
        sub: (c) => `Texts ${personName(c.assignee)}`,
        help: 'Pages whoever is on call tonight with the caller’s details and the ticket number.',
        note: 'On-call tech paged',
        exec: (x, c) => {
          const tech = TECHS[c.assignee];
          x.ticket.assigned = `${tech.name} (on call)`;
          const body = fill(c.template, x.vars);
          return { lines: smsLines(tech.phone, body, `to ${tech.name}`), artifacts: [smsArt('sms-tech', `${tech.name} (on call)`, tech.phone, body, 'Internal page to the on-call tech'), ticketRecord(x)] };
        },
      },
      {
        id: 'm6', kind: 'action', app: 'crm', col: 4, lane: 1, title: 'Add to dispatch queue', settings: { assignee: 'desk' }, assignees: ['desk', 'marcus', 'dana', 'luis'], assigneeLabel: 'Call back owner',
        sub: (c) => `${personName(c.assignee)} · call back in 10 min`,
        help: 'During office hours the dispatch desk calls the customer back, with the ticket already open.',
        note: 'Call-back task queued',
        exec: (x, c) => {
          x.ticket.assigned = personName(c.assignee);
          const task = recordArt('task', 'crm', `Task · Call back ${x.vars.full_name}`, [['Assigned to', personName(c.assignee)], ['Due', 'Within 10 min'], ['Ticket', `#${x.vars.ticket} · ${x.vars.issue}`], ['Phone', x.vars.phone]], 'Queued', 'cyan');
          return { lines: [['data', `queue.add dispatch → ${personName(c.assignee)} · due in 10 min`]], artifacts: [task, ticketRecord(x)] };
        },
      },
      {
        id: 'm7', kind: 'action', app: 'crm', col: 5, title: 'Log call in CRM', sub: 'Timeline entry on the contact',
        help: 'Writes the whole story to the customer’s timeline: the call, the text, the ticket and who picked it up.',
        note: 'Call logged on the contact timeline',
        exec: (x) => {
          const rec = recordArt('crm-log', 'crm', `CRM activity · ${x.vars.full_name}`, [['Activity', 'Missed call · voicemail 0:22'], ['Text-back', 'Booking link sent'], ['Ticket', `#${x.vars.ticket} (High)`], ['Routed to', x.ticket.assigned], ['Logged', at(Date.now())]], 'Logged');
          return { lines: [['data', `crm.timeline.add contact=${x.vars.full_name} · 4 events`]], artifacts: [rec] };
        },
      },
    ],
    edges: [['m1', 'm2'], ['m2', 'm3'], ['m3', 'm4'], ['m4', 'm5', 'yes'], ['m4', 'm6', 'no'], ['m5', 'm7'], ['m6', 'm7']],
  },
  {
    id: 'job-completed', name: 'Job complete: invoice & review', app: 'invoice', runsWeek: 41, savedMin: 11, live: true, bump: 'invoice',
    chain: ['Job completed', 'create invoice', 'text pay link', 'review request 2 hr later (4–5 star ratings only)', 'log in CRM'],
    trigger: 'CRM · job marked complete',
    sim: { key: 'rating', type: 'select', label: 'Customer rating reply', options: ['5', '4', '3', '2', '1'], default: '5' },
    decide: (s) => (Number(s) >= 4 ? 'yes' : 'no'),
    vars: ['first_name', 'invoice', 'amount', 'pay_link', 'tech_name', 'rating', 'review_link'],
    sample: () => ({ first_name: 'Denise', full_name: 'Denise Carter', phone: '(205) 555-0126', city: 'Vestavia Hills', zip: '35216', tech_name: 'Dana', tech_full: 'Dana Whitfield', service: 'AC repair', amount: '$189.00', review_link: 'ironwood.example/review' }),
    sampleLine: (v) => `Job ${v.job} · ${v.full_name} · ${v.tech_full}`,
    triggerLabel: (v) => `Job ${v.job} completed · ${v.tech}`,
    feed: (v) => [`Job ${esc(v.job)} completed by <b>${esc(v.tech)}</b>`, `invoice ${esc(v.invoice)} (${esc(v.amount)})`, 'pay link texted'],
    nodes: [
      {
        id: 'j1', kind: 'trigger', app: 'crm', col: 0, title: 'Job marked complete', sub: 'Tech closes the job in the CRM',
        help: 'Starts when a technician marks a job complete from their phone. The line items come straight from the job ticket.',
        note: 'Job {job} closed by the technician',
        exec: (x) => ({ lines: [['data', `crm.job.completed ${x.vars.job} · tech=${x.vars.tech_full}`]], data: { job: x.vars.job, customer: x.vars.full_name, tech: x.vars.tech_full, service: x.vars.service, line_items: 3 } }),
      },
      {
        id: 'j2', kind: 'action', app: 'invoice', col: 1, title: 'Create invoice', sub: 'Line items from the job ticket',
        help: 'Builds the invoice from Ironwood’s flat-rate prices. The $89 diagnostic is credited toward the repair automatically.',
        note: 'Invoice {invoice} created · {amount}',
        exec: (x) => {
          x.inv = { lines: [['Diagnostic visit', 89], ['AC repair: replaced failed run capacitor', 189], ['Diagnostic credit (applied to repair)', -89]], due: `Due ${F.day.format(Date.now() + 14 * DAY)}`, status: 'Draft', tone: 'muted', note: '1-year labor warranty on this repair.' };
          return { lines: [['data', `invoice.create → ${x.vars.invoice} · 3 line items · total ${x.vars.amount}`]], data: { invoice: x.vars.invoice, total: 189, currency: 'USD', terms: 'net 14' }, artifacts: [invoiceArt(x)] };
        },
      },
      {
        id: 'j3', kind: 'action', app: 'sms', col: 2, title: 'Text pay link', sub: 'Asks for a 1–5 rating too', settings: { template: T.payLink },
        help: 'Texts the invoice with a pay link before the tech leaves the driveway, and asks one quick rating question.',
        note: 'Pay link texted to {phone}',
        exec: (x, c) => {
          x.inv.status = 'Sent'; x.inv.tone = 'cyan';
          const body = fill(c.template, x.vars);
          return { lines: smsLines(x.vars.phone, body), artifacts: [smsArt('sms-1', x.vars.full_name, x.vars.phone, body, 'Includes the 1–5 rating question'), invoiceArt(x)] };
        },
      },
      {
        id: 'j4', kind: 'condition', app: 'relay', col: 3, title: 'Rated 4–5 stars?', settings: { delay: 120, unit: 'min' }, delayRange: [15, 1440],
        sub: (c) => `Checks ${span(c.delay * MIN)} after the visit`,
        help: 'Only happy customers get asked for a public review. Lower ratings go to the owner so they can make it right.',
        rule: 'positive = rating reply of 4 or 5',
        note: 'Rating check after the wait',
        exec: (x, c) => {
          const yes = Number(x.sim) >= 4;
          return { lines: [['wait', `wait ${span(c.delay * MIN)} · fast-forwarded in test mode`], ['data', `reply from ${x.vars.phone}: “${x.sim}”`], ['data', `rating ${x.sim} ${yes ? '≥' : '<'} 4`]], data: { rating: Number(x.sim), positive: yes }, branch: yes ? 'yes' : 'no' };
        },
      },
      {
        id: 'j5', kind: 'action', app: 'reviews', col: 4, lane: -1, title: 'Send review request', sub: 'By text, with the review link', settings: { template: T.review },
        help: 'Thanks the customer and asks for a short public review of the technician’s visit.',
        note: 'Review request sent',
        exec: (x, c) => { const body = fill(c.template, x.vars); return { lines: smsLines(x.vars.phone, body, 'review link attached'), artifacts: [smsArt('sms-review', x.vars.full_name, x.vars.phone, body, 'Only sent after a 4 or 5 star rating')] }; },
      },
      {
        id: 'j6', kind: 'action', app: 'crm', col: 4, lane: 1, title: 'Flag for owner follow-up', sub: 'No review ask',
        help: 'A low rating creates a call task for the owner instead of a review request.',
        note: 'Owner follow-up task created',
        exec: (x) => {
          const task = recordArt('task', 'crm', `Task · Call ${x.vars.full_name}`, [['Assigned to', 'Owner (office)'], ['Why', `Rated the ${x.vars.service} visit ${x.sim} of 5`], ['Technician', x.vars.tech_full], ['Due', 'Today']], 'Needs a call', 'amber');
          return { lines: [['data', 'task.create owner follow-up · review request skipped']], artifacts: [task] };
        },
      },
      {
        id: 'j7', kind: 'action', app: 'crm', col: 5, title: 'Log in CRM', sub: 'Invoice, rating and outcome',
        help: 'Adds the invoice, the rating and what happened next to the customer’s record.',
        note: 'Job outcome logged',
        exec: (x) => {
          const positive = Number(x.sim) >= 4;
          const rec = recordArt('crm-log', 'crm', `CRM activity · ${x.vars.full_name}`, [['Job', `${x.vars.job} · ${x.vars.service} · ${x.vars.tech_full}`], ['Invoice', `${x.vars.invoice} · ${x.vars.amount} · pay link sent`], ['Rating', `${x.sim} of 5`], ['Next step', positive ? 'Review request sent' : 'Owner follow-up'], ['Logged', at(Date.now())]], 'Logged');
          return { lines: [['data', `crm.timeline.add contact=${x.vars.full_name} · 3 events`]], artifacts: [rec] };
        },
      },
    ],
    edges: [['j1', 'j2'], ['j2', 'j3'], ['j3', 'j4'], ['j4', 'j5', 'yes'], ['j4', 'j6', 'no'], ['j5', 'j7'], ['j6', 'j7']],
  },
  {
    id: 'invoice-overdue', name: 'Overdue invoice reminders', app: 'invoice', runsWeek: 12, savedMin: 7, live: true,
    chain: ['Invoice overdue', 'day 3 friendly reminder', 'day 7 second reminder', 'day 14 call task for the office'],
    trigger: 'Invoicing · checked daily at 9 AM',
    sim: { key: 'paid', type: 'switch', label: 'Customer pays by day 14', default: false },
    decide: (s) => (s ? 'yes' : 'no'),
    vars: ['first_name', 'invoice', 'amount', 'due_date', 'pay_link'],
    sample: () => ({ first_name: 'Michael', full_name: 'Michael Grant', phone: '(205) 555-0154', email: 'michael.grant@example.com', city: 'Hoover', zip: '35244', invoice: 'INV-10371', amount: '$278.00', due_date: F.day.format(Date.now() - DAY), pay_link: 'ironwood.example/pay/INV-10371' }),
    sampleLine: (v) => `${v.invoice} · ${v.full_name} · ${v.amount}`,
    triggerLabel: (v) => `${v.invoice} past due · ${v.amount}`,
    feed: (v) => [`<b>${esc(v.invoice)}</b> is past due (${esc(v.amount)}, ${esc(v.full_name)})`, 'reminders scheduled for day 3, 7 and 14'],
    nodes: [
      {
        id: 'i1', kind: 'trigger', app: 'invoice', col: 0, title: 'Invoice past due', sub: 'Checked every morning at 9 AM',
        help: 'Every morning RELAY looks for unpaid invoices that just passed their due date and starts a gentle reminder schedule.',
        note: '{invoice} passed its due date',
        exec: (x) => {
          x.inv = { lines: [['Drain clearing: main line', 149], ['Toilet repair: fill valve and flapper', 129]], due: `Was due ${x.vars.due_date}`, status: 'Overdue', tone: 'amber', note: '' };
          return { lines: [['data', `invoice.overdue ${x.vars.invoice} · ${x.vars.amount} · due ${x.vars.due_date}`]], data: { invoice: x.vars.invoice, customer: x.vars.full_name, total: 278, days_past_due: 0 }, artifacts: [invoiceArt(x)] };
        },
      },
      {
        id: 'i2', kind: 'action', app: 'sms', col: 1, title: 'Friendly reminder', settings: { template: T.remind3, delay: 3, unit: 'day' }, delayRange: [1, 30],
        sub: (c) => `Day ${c.delay} · by text`,
        help: 'A short, friendly text with the pay link. Most customers simply forgot.',
        note: 'Day-3 reminder texted to {phone}',
        exec: (x, c) => {
          const body = fill(c.template, x.vars);
          return { lines: [['wait', `wait until day ${c.delay} · fast-forwarded in test mode`], ['data', `invoice.status ${x.vars.invoice} → unpaid`], ...smsLines(x.vars.phone, body)], artifacts: [smsArt('sms-1', x.vars.full_name, x.vars.phone, body, `Day ${c.delay} after the due date`)] };
        },
      },
      {
        id: 'i3', kind: 'action', app: 'email', col: 2, title: 'Second reminder', settings: { subject: T.remind7Subject, template: T.remind7, delay: 7, unit: 'day' }, delayRange: [2, 60],
        sub: (c) => `Day ${c.delay} · by email`,
        help: 'A second, slightly firmer reminder by email, with an offer to set up a payment plan.',
        note: 'Day-7 reminder emailed',
        exec: (x, c) => {
          const subject = fill(c.subject, x.vars);
          const body = fill(c.template, x.vars);
          return { lines: [['wait', `wait until day ${c.delay} · fast-forwarded in test mode`], ['data', `invoice.status ${x.vars.invoice} → unpaid`], ['data', `email.send → ${x.vars.email} · “${subject}”`], ['muted', 'preview only, not sent']], artifacts: [emailArt('email-1', x.vars.full_name, x.vars.email, subject, body)] };
        },
      },
      {
        id: 'i4', kind: 'condition', app: 'relay', col: 3, title: 'Paid by day 14?', settings: { delay: 14, unit: 'day' }, delayRange: [3, 90],
        sub: (c) => `Checks on day ${c.delay}`,
        help: 'If the invoice is paid, RELAY closes it out. If not, the office gets a call task instead of another automatic message.',
        rule: 'paid = invoice status is Paid',
        note: 'Payment check',
        exec: (x, c) => {
          const yes = Boolean(x.sim);
          return { lines: [['wait', `wait until day ${c.delay} · fast-forwarded in test mode`], ['data', yes ? `payment received ${x.vars.amount} on day 9 via pay link` : `invoice.status ${x.vars.invoice} → still unpaid`]], data: { paid: yes }, branch: yes ? 'yes' : 'no' };
        },
      },
      {
        id: 'i5', kind: 'action', app: 'invoice', col: 4, lane: -1, title: 'Close out invoice', sub: 'Mark paid, stop reminders',
        help: 'Marks the invoice paid and cancels anything still scheduled.',
        note: 'Invoice closed as paid',
        exec: (x) => { x.inv.status = 'Paid'; x.inv.tone = 'lime'; x.inv.due = 'Paid on day 9 via pay link'; return { lines: [['data', `invoice.update ${x.vars.invoice} status=paid`], ['muted', 'remaining reminders cancelled']], artifacts: [invoiceArt(x)] }; },
      },
      {
        id: 'i6', kind: 'action', app: 'crm', col: 4, lane: 1, title: 'Call task for office', settings: { assignee: 'desk' }, assignees: ['desk', 'marcus', 'dana', 'luis'], assigneeLabel: 'Assign call to',
        sub: (c) => `${personName(c.assignee)} · today`,
        help: 'After two reminders a person calls, which keeps the relationship friendly and usually settles it.',
        note: 'Call task created for the office',
        exec: (x, c) => {
          const task = recordArt('task', 'crm', `Task · Call ${x.vars.full_name}`, [['Assigned to', personName(c.assignee)], ['About', `${x.vars.invoice} · ${x.vars.amount} · 14 days past due`], ['History', 'Day 3 text and day 7 email sent'], ['Suggest', 'Offer a payment plan if it helps'], ['Due', 'Today by 11 AM']], 'Open', 'amber');
          return { lines: [['data', `task.create call ${x.vars.full_name} → ${personName(c.assignee)} · due 11:00`]], artifacts: [task] };
        },
      },
    ],
    edges: [['i1', 'i2'], ['i2', 'i3'], ['i3', 'i4'], ['i4', 'i5', 'yes'], ['i4', 'i6', 'no']],
  },
  {
    id: 'club-member', name: 'Ironwood Club onboarding', app: 'web', runsWeek: 4, savedMin: 15, live: true,
    chain: ['New Ironwood Club member', 'welcome email', 'schedule spring AC tune-up', 'add to member list'],
    trigger: 'Website form · Club signup',
    vars: ['first_name', 'full_name', 'tune_up_date'],
    sample: () => ({ first_name: 'Carla', full_name: 'Carla Jennings', email: 'carla.jennings@example.com', phone: '(205) 555-0139', city: 'Mountain Brook', zip: '35213', tune_up_date: F.long.format(nextSpring()) }),
    sampleLine: (v) => `${v.full_name} · ${v.city} · $14.95/month`,
    triggerLabel: (v) => `Club signup · ${v.full_name}`,
    feed: (v) => [`New Ironwood Club member: <b>${esc(v.full_name)}</b>`, 'welcome email sent', 'spring AC tune-up booked', 'added to member list'],
    nodes: [
      {
        id: 'c1', kind: 'trigger', app: 'web', col: 0, title: 'Club signup', sub: 'Website form · $14.95/month',
        help: 'Starts when someone joins the Ironwood Club on the website.',
        note: 'Signup from {full_name}',
        exec: (x) => ({ lines: [['data', 'webhook website_form.submitted · form=club_signup']], data: { ...pick(x.vars, 'full_name', 'email', 'phone', 'zip'), plan: 'Ironwood Club', price_monthly: 14.95 } }),
      },
      {
        id: 'c2', kind: 'action', app: 'email', col: 1, title: 'Send welcome email', sub: 'Perks and first visit', settings: { subject: T.welcomeSubject, template: T.welcome },
        help: 'A warm welcome that spells out exactly what the membership includes.',
        note: 'Welcome email sent',
        exec: (x, c) => { const subject = fill(c.subject, x.vars); const body = fill(c.template, x.vars); return { lines: [['data', `email.send → ${x.vars.email} · “${subject}”`], ['muted', 'preview only, not sent']], artifacts: [emailArt('email-1', x.vars.full_name, x.vars.email, subject, body)] }; },
      },
      {
        id: 'c3', kind: 'action', app: 'calendar', col: 2, title: 'Book spring AC tune-up', settings: { assignee: 'dana' }, assignees: ['dana', 'marcus', 'luis'], assigneeLabel: 'Technician',
        sub: (c) => `Early March · ${personName(c.assignee)}`,
        help: 'Puts the included spring tune-up on the calendar right away, so it never depends on someone remembering.',
        note: 'Spring tune-up booked',
        exec: (x, c) => {
          const rec = recordArt('event', 'calendar', `Spring AC tune-up · ${x.vars.full_name}`, [['When', `${x.vars.tune_up_date} · 8–10 AM`], ['Technician', personName(c.assignee)], ['Where', `${x.vars.city}, AL ${x.vars.zip}`], ['Price', 'Included with Ironwood Club (normally $99)'], ['Reminder', 'Text 2 days before']], 'Booked', 'cyan');
          return { lines: [['data', `calendar.events.create ${x.vars.tune_up_date} 8:00–10:00 · ${personName(c.assignee)}`]], artifacts: [rec] };
        },
      },
      {
        id: 'c4', kind: 'action', app: 'crm', col: 3, title: 'Add to member list', sub: 'Tag: Ironwood Club',
        help: 'Tags the customer as a member so everyone in the office sees it on calls and jobs.',
        note: 'Tagged as an Ironwood Club member',
        exec: (x) => {
          const rec = recordArt('crm', 'crm', `Member · ${x.vars.full_name}`, [['Plan', 'Ironwood Club · $14.95/month'], ['Member since', F.long.format(Date.now())], ['Includes', 'Spring AC + fall furnace tune-ups, yearly plumbing inspection with water heater flush'], ['Next visit', x.vars.tune_up_date]], 'Member');
          return { lines: [['data', `crm.contacts.tag ${x.vars.full_name} +ironwood-club`], ['data', 'member_list.add → 1 member']], artifacts: [rec] };
        },
      },
      {
        id: 'c5', kind: 'action', app: 'invoice', col: 4, title: 'Apply member pricing', sub: '15% off repairs · no after-hours fee',
        help: 'Updates invoicing so the discount and waived after-hours fee apply automatically on every future job.',
        note: 'Member pricing applied to future invoices',
        exec: (x) => {
          const rec = recordArt('pricing', 'invoice', `Pricing rules · ${x.vars.full_name}`, [['Repairs', '15% off automatically'], ['After-hours dispatch', 'Waived (normally $149)'], ['Scheduling', 'Priority'], ['Applies to', 'All future invoices']], 'Active');
          return { lines: [['data', 'invoice.rules.set discount=15% after_hours_fee=0 priority=true']], artifacts: [rec] };
        },
      },
    ],
    edges: [['c1', 'c2'], ['c2', 'c3'], ['c3', 'c4'], ['c4', 'c5']],
  },
  {
    id: 'morning-dispatch', name: 'Morning dispatch texts', app: 'calendar', runsWeek: 5, savedMin: 35, live: false,
    chain: ['Morning dispatch', 'build each tech’s route from today’s jobs', 'text techs their schedule at 6:45 AM'],
    trigger: 'Schedule · weekdays at 6:30 AM',
    vars: ['first_name', 'job_count', 'first_stop', 'first_window', 'route_link'],
    sample: () => ({ ...dispatchVars('marcus'), full_name: 'Marcus Bell' }),
    sampleLine: () => '9 jobs · Marcus, Dana and Luis',
    triggerLabel: () => 'Schedule · weekdays 6:30 AM',
    feed: () => ['Morning dispatch: <b>9 jobs</b> routed', 'schedules texted to Marcus, Dana and Luis'],
    nodes: [
      {
        id: 'd1', kind: 'trigger', app: 'calendar', col: 0, title: 'Weekdays at 6:30 AM', sub: 'Schedule trigger',
        help: 'Runs every weekday morning before the trucks roll.',
        note: 'Scheduled run started',
        exec: () => ({ lines: [['data', 'schedule.fired mon–fri 06:30 America/Chicago']], data: { schedule: 'weekdays 06:30', date: F.long.format(Date.now()) } }),
      },
      {
        id: 'd2', kind: 'action', app: 'calendar', col: 1, title: 'Pull today’s jobs', sub: '9 jobs · 3 technicians',
        help: 'Collects every booked job for today with its arrival window and address.',
        note: '9 jobs pulled for 3 technicians',
        exec: () => ({ lines: [['data', 'calendar.jobs.list date=today → 9 jobs'], ...Object.keys(JOBS).map((k) => ['muted', `${TECHS[k].name}: ${plural(JOBS[k].length, 'job')}`])], data: { jobs: 9, technicians: 3, first_window: '8–10 AM' } }),
      },
      {
        id: 'd3', kind: 'action', app: 'relay', col: 2, title: 'Build each tech’s route', sub: 'By arrival window and drive time',
        help: 'Orders each technician’s stops by arrival window, then by drive time between neighborhoods.',
        note: 'Routes built for 3 technicians',
        exec: () => ({
          lines: [['data', 'routes.build strategy=window_then_drive_time'], ['muted', 'Marcus Bell: 4 stops · ~38 mi'], ['muted', 'Dana Whitfield: 3 stops · ~44 mi'], ['muted', 'Luis Ortega: 2 stops · ~19 mi']],
          artifacts: [{ id: 'route', type: 'route', app: 'relay', title: `Routes · ${F.date.format(Date.now())}`, techs: Object.keys(JOBS).map((k) => ({ name: TECHS[k].name, jobs: JOBS[k] })) }],
        }),
      },
      {
        id: 'd4', kind: 'action', app: 'sms', col: 3, title: 'Text techs at 6:45 AM', sub: 'One text per technician', settings: { template: T.dispatch }, fixedWait: 15 * MIN,
        help: 'Each technician gets their own schedule by text at 6:45 AM, with a link to the full route.',
        note: 'Schedules texted to 3 technicians',
        exec: (x, c) => {
          const lines = [['wait', 'wait until 6:45 AM · fast-forwarded in test mode']];
          const artifacts = Object.keys(JOBS).map((k) => {
            const body = fill(c.template, { ...x.vars, ...dispatchVars(k) });
            lines.push(['data', `sms.send → ${TECHS[k].phone} (${TECHS[k].first}) · ${body.length} chars`]);
            return smsArt(`sms-${k}`, TECHS[k].name, TECHS[k].phone, body, 'Would send at 6:45 AM');
          });
          lines.push(['muted', 'preview only, not sent']);
          return { lines, artifacts };
        },
      },
      {
        id: 'd5', kind: 'action', app: 'crm', col: 4, title: 'Post dispatch board', sub: 'The office sees today’s routes',
        help: 'Posts the day’s routes to the dispatch board so the office knows where everyone is headed.',
        note: 'Dispatch board updated',
        exec: () => {
          const rec = recordArt('board', 'crm', `Dispatch board · ${F.date.format(Date.now())}`, Object.keys(JOBS).map((k) => [TECHS[k].name, `${plural(JOBS[k].length, 'job')} · first ${JOBS[k][0][0]}, ${JOBS[k][0][2]}`]), 'Posted');
          return { lines: [['data', 'crm.board.publish date=today · 9 jobs']], artifacts: [rec] };
        },
      },
    ],
    edges: [['d1', 'd2'], ['d2', 'd3'], ['d3', 'd4'], ['d4', 'd5']],
  },
];
const flowOf = (id) => FLOWS.find((f) => f.id === id);
const nodeOf = (flow, id) => flow.nodes.find((n) => n.id === id);
FLOWS.forEach((f) => f.nodes.forEach((n) => { n.lane ||= 0; }));

/* -------------------------------------------------------------------- state */
const KEY = 'relay-state-v1';
const defaults = () => ({
  enabled: Object.fromEntries(FLOWS.map((f) => [f.id, true])),
  overrides: {}, sims: {}, runs: [], feedPaused: false, syncs: {},
  calc: { leads: 25, missed: 15, jobs: 40, minutes: 5, rate: 22 },
  counters: { ticket: 4521, invoice: 10412, job: 2291, crm: 84127 },
  live: { day: dayKeyChi(Date.now()), tasks: 0, minutes: 0, revenue: 0, apps: {} },
});
function loadState() {
  const d = defaults();
  const saved = storage.get(KEY, null);
  if (!saved || typeof saved !== 'object') return d;
  const live = { ...d.live, ...(saved.live || {}) };
  if (live.day !== d.live.day) Object.assign(live, d.live);
  return {
    ...d, ...saved, live,
    enabled: { ...d.enabled, ...(saved.enabled || {}) },
    calc: { ...d.calc, ...(saved.calc || {}) },
    counters: { ...d.counters, ...(saved.counters || {}) },
    overrides: saved.overrides && typeof saved.overrides === 'object' ? saved.overrides : {},
    sims: saved.sims && typeof saved.sims === 'object' ? saved.sims : {},
    syncs: saved.syncs && typeof saved.syncs === 'object' ? saved.syncs : {},
    runs: Array.isArray(saved.runs) ? saved.runs.filter((r) => r && flowOf(r.flowId) && Array.isArray(r.path) && Array.isArray(r.planned)) : [],
  };
}
const state = loadState();
const save = () => storage.set(KEY, state);

const cfg = (flow, node) => ({ ...(node.settings || {}), ...(node.kind === 'action' ? { fail: false } : {}), ...(state.overrides[flow.id]?.[node.id] || {}) });
const simValue = (flow) => (flow.sim ? (state.sims[flow.id] ?? flow.sim.default) : null);
const nodeSub = (flow, node) => (typeof node.sub === 'function' ? node.sub(cfg(flow, node)) : node.sub);
const isCustomized = (flow, node) => Boolean(state.overrides[flow.id]?.[node.id] && Object.keys(state.overrides[flow.id][node.id]).length);

function makeCtx(flow, { bump = false } = {}) {
  if (bump && flow.bump) state.counters[flow.bump] += 1;
  const n = state.counters;
  const vars = {
    crm_id: `CRM-${n.crm + (bump ? 0 : 1)}`, ticket: String(n.ticket + (bump ? 0 : 1)), invoice: `INV-${n.invoice + (bump ? 0 : 1)}`, job: `J-${n.job + 1}`,
    ...flow.sample(),
  };
  vars.pay_link ||= `ironwood.example/pay/${vars.invoice}`;
  const sim = simValue(flow);
  if (flow.id === 'job-completed') vars.rating = String(sim);
  return { flow, vars, sim };
}

function pathFor(flow, sim) {
  const out = [];
  let id = flow.nodes[0].id;
  while (id && !out.includes(id)) {
    out.push(id);
    const node = nodeOf(flow, id);
    const edges = flow.edges.filter((e) => e[0] === id);
    const edge = node.kind === 'condition' ? edges.find((e) => e[2] === flow.decide(sim)) : edges[0];
    id = edge?.[1];
  }
  return out;
}
// How long each step waits before it runs (for example "day 7" in the reminder flow).
function waitsFor(flow, path) {
  let lastDay = 0;
  return path.map((id) => {
    const node = nodeOf(flow, id);
    if (node.fixedWait) return node.fixedWait;
    const c = cfg(flow, node);
    if (!('delay' in c)) return 0;
    if (c.unit === 'day') { const w = Math.max(0, c.delay - lastDay) * DAY; lastDay = Math.max(lastDay, c.delay); return w; }
    return c.delay * MIN;
  });
}

/* --------------------------------------------------------------------- runs */
function randomVars(flow, r) {
  const [full_name, city, zip] = pickFrom(r, PEOPLE);
  let service = pickFrom(r, SERVICES);
  if (flow.id === 'club-member') service = SERVICES[8];
  const [svc, price, techKey] = service;
  const oncall = TECHS[cfg(flowOf('missed-call'), nodeOf(flowOf('missed-call'), 'm5')).assignee] || TECHS.marcus;
  return {
    full_name, first_name: full_name.split(' ')[0], city, zip, phone: randomPhone(r), service: svc, price, amount: money(price, true),
    tech: TECHS[techKey].name, tech_key: techKey, secs: 22 + Math.floor(r() * 34), oncall: oncall.first,
    invoice: `INV-${10340 + Math.floor(r() * 50)}`, ticket: '', job: '', issue: `${svc} request`,
  };
}
function makeRun(flow, started, r, source) {
  const vars = randomVars(flow, r);
  const sim = flow.id === 'missed-call' ? isAfterHours(started)
    : flow.id === 'web-lead' ? r() < 0.45
      : flow.id === 'job-completed' ? String(pickFrom(r, [5, 5, 5, 5, 5, 4, 4, 3, 2]))
        : flow.id === 'invoice-overdue' ? r() < 0.5 : null;
  if (flow.id === 'job-completed') vars.rating = sim;
  const planned = pathFor(flow, sim);
  const waits = waitsFor(flow, planned);
  let acc = started;
  const reached = planned.filter((id, i) => { acc += waits[i]; return acc <= Date.now(); });
  const eligible = reached.filter((id) => nodeOf(flow, id).kind === 'action');
  const roll = r();
  let status = 'success';
  let failAt = null;
  let path = planned;
  if (eligible.length && roll < 0.03) { status = 'failed'; failAt = pickFrom(r, eligible); path = planned.slice(0, planned.indexOf(failAt) + 1); }
  else if (eligible.length && roll < 0.09) { status = 'recovered'; failAt = pickFrom(r, eligible); }
  const stepMs = path.map((id) => Math.round((APP_MS[nodeOf(flow, id).app] || 200) * (0.6 + r() * 0.8)) + (id === failAt && status === 'recovered' ? 3100 : 0));
  const id = `run_${(hashStr(`${flow.id}${started}${r()}`) % 2176782335).toString(36).padStart(6, '0')}`;
  return { id, flowId: flow.id, source, started, status, path, planned, stepMs, failAt, sim, vars };
}
const SEED_PLAN = { 'web-lead': [12, 6, 22], 'missed-call': [9, 0, 24], 'job-completed': [15, 9, 18], 'invoice-overdue': [4, 9, 10], 'club-member': [2, 7, 21] };
function seedRuns() {
  const r = rng(20260930);
  const now = Date.now();
  const out = [];
  for (const [flowId, [count, h0, h1]] of Object.entries(SEED_PLAN)) {
    const flow = flowOf(flowId);
    for (let i = 0; i < count; i += 1) {
      let ts = now;
      for (let k = 0; k < 80; k += 1) {
        ts = now - (4 * MIN + r() * 70 * HOUR);
        const h = chi(ts).h;
        if (h >= h0 && h < h1) break;
      }
      if (flowId === 'invoice-overdue') {
        const p = chi(ts);
        ts = chiTs(p.y, p.m, p.d, 9, 0) + Math.floor(r() * 50) * SEC;
        if (ts > now) ts -= DAY;
      }
      out.push(makeRun(flow, ts, r, 'live'));
    }
  }
  for (let d = 0; d < 4; d += 1) {
    const p = chi(now - d * DAY);
    const ts = chiTs(p.y, p.m, p.d, 6, 30) + 2 * SEC;
    if (ts < now && !isWeekendTs(ts)) out.push(makeRun(flowOf('morning-dispatch'), ts, r, 'live'));
  }
  // Number tickets, invoices and jobs in time order so they count up to today's values.
  out.sort((a, b) => a.started - b.started);
  let ticket = 4521 - out.filter((x) => x.flowId === 'missed-call').length;
  let invoice = 10412 - out.filter((x) => x.flowId === 'job-completed').length;
  let job = 2291 - out.filter((x) => x.flowId === 'job-completed').length;
  let crm = 84127 - out.filter((x) => x.flowId === 'web-lead').length;
  out.forEach((x) => {
    if (x.flowId === 'missed-call') { ticket += 1; x.vars.ticket = String(ticket); }
    if (x.flowId === 'job-completed') { invoice += 1; job += 1; x.vars.invoice = `INV-${invoice}`; x.vars.job = `J-${job}`; }
    if (x.flowId === 'web-lead') { crm += 1; x.vars.crm_id = `CRM-${crm}`; }
  });
  // Two runs that genuinely failed, so the Failed filter and the error timeline have something to show.
  const fail = (flowId, nodeId, error) => {
    const x = out.filter((y) => y.flowId === flowId && y.status === 'success')[1];
    if (!x) return;
    const flow = flowOf(flowId);
    Object.assign(x, { status: 'failed', failAt: nodeId, error, path: x.planned.slice(0, x.planned.indexOf(nodeId) + 1) });
    x.stepMs = x.path.map((id) => Math.round(APP_MS[nodeOf(flow, id).app] * 1.1) + (id === nodeId ? 7200 : 0));
  };
  fail('missed-call', 'm2', 'Carrier rejected the text: this number is a landline');
  fail('job-completed', 'j2', 'Invoicing returned 422: the job has no line items yet');
  return out;
}
const SEEDED = seedRuns();
const allRuns = () => [...state.runs, ...SEEDED].sort((a, b) => b.started - a.started);
const runById = (id) => state.runs.find((r) => r.id === id) || SEEDED.find((r) => r.id === id);

function timeline(run) {
  const flow = flowOf(run.flowId);
  const waits = run.test ? run.path.map(() => 0) : waitsFor(flow, run.path);
  let t = run.started;
  let waited = 0;
  // `due` only counts scheduled waits, so a run that just fired is never shown as waiting.
  return run.path.map((id, i) => { t += waits[i]; waited += waits[i]; const start = t; t += run.stepMs[i] || 0; return { id, start, due: run.started + waited, wait: waits[i], ms: run.stepMs[i] || 0 }; });
}
function runStatus(run) {
  if (run.status === 'failed') return 'failed';
  const tl = timeline(run);
  if (tl.length && tl[tl.length - 1].due > Date.now()) return 'waiting';
  return run.status;
}
const doneSteps = (run) => timeline(run).filter((s) => s.due <= Date.now()).length;
const STATUS = {
  success: ['Succeeded', 'lime'], waiting: ['Waiting', 'cyan'], recovered: ['Recovered', 'amber'], failed: ['Failed', 'red'], running: ['Running', 'lime'],
};
const statusPill = (st) => `<span class="pill pill-${STATUS[st][1]}">${STATUS[st][0]}</span>`;
const triggerText = (run) => (run.test ? 'Test run · sample data' : flowOf(run.flowId).triggerLabel(run.vars));

/* ------------------------------------------------------------ month numbers */
const dayTasks = (ts) => {
  const p = chi(ts);
  const r = rng(p.y * 10000 + p.m * 100 + p.d);
  const base = p.wd === 'Sun' ? 22 + r() * 12 : p.wd === 'Sat' ? 48 + r() * 16 : 96 + r() * 30;
  return Math.round(base);
};
const dayRevenue = (ts) => {
  const p = chi(ts);
  const r = rng(p.y * 10000 + p.m * 100 + p.d + 7);
  if (p.wd === 'Sun') return 0;
  return Math.round((p.wd === 'Sat' ? 120 + r() * 180 : 360 + r() * 420) / 10) * 10;
};
const dayFraction = () => { const p = chi(Date.now()); return Math.min(1, Math.max(0.04, (p.h + p.min / 60 - 6) / 14)); };
function monthDays() {
  const now = Date.now();
  const p = chi(now);
  return Array.from({ length: p.d }, (_, i) => chiTs(p.y, p.m, i + 1, 12));
}
function kpis() {
  const days = monthDays();
  const frac = dayFraction();
  const tasksBase = sum(days.map((ts, i) => (i === days.length - 1 ? Math.round(dayTasks(ts) * frac) : dayTasks(ts))));
  const revenueBase = sum(days.map((ts, i) => (i === days.length - 1 ? Math.round(dayRevenue(ts) * frac / 10) * 10 : dayRevenue(ts))));
  const tasks = tasksBase + state.live.tasks;
  const revenue = revenueBase + state.live.revenue;
  return { tasks, hours: (tasksBase * 2.1 + state.live.minutes) / 60, revenue, paid: Math.round(revenue / 246), today: Math.round(dayTasks(Date.now()) * frac) + state.live.tasks };
}
function last14() {
  const now = Date.now();
  const frac = dayFraction();
  return Array.from({ length: 14 }, (_, i) => {
    const p = chi(now - (13 - i) * DAY);
    const ts = chiTs(p.y, p.m, p.d, 12);
    const today = i === 13;
    return { ts, today, value: today ? Math.round(dayTasks(ts) * frac) + state.live.tasks : dayTasks(ts), revenue: dayRevenue(ts) };
  });
}

/* ------------------------------------------------------------ live activity */
const feed = [];
function eventFromRun(run) {
  const flow = flowOf(run.flowId);
  const parts = flow.feed(run.vars, run);
  let tone = 'ok';
  if (run.status === 'recovered') { parts.push('retried once after a timeout'); tone = 'warn'; }
  if (run.status === 'failed') { parts.push('a step failed · flagged for the office'); tone = 'err'; }
  return { id: run.id, ts: run.started, flowId: flow.id, parts, tone, runId: run.id };
}
function seedFeed() {
  allRuns().filter((r) => !r.test && Date.now() - r.started < 20 * HOUR).slice(0, 9).forEach((r) => feed.push(eventFromRun(r)));
}
function liveTick() {
  const choices = [];
  const add = (key, weight) => { if (weight > 0) choices.push([key, weight]); };
  const on = (id) => state.enabled[id];
  add('web-lead', on('web-lead') ? 3 : 0);
  add('missed-call', on('missed-call') ? 3 : 0);
  add('job-completed', on('job-completed') ? 4 : 0);
  add('invoice-overdue', on('invoice-overdue') ? 0.8 : 0);
  add('club-member', on('club-member') ? 0.5 : 0);
  add('payment', on('invoice-overdue') ? 1.2 : 0);
  add('review', on('job-completed') ? 1.2 : 0);
  if (!choices.length) return;
  let roll = Math.random() * sum(choices.map((c) => c[1]));
  const [kind] = choices.find((c) => { roll -= c[1]; return roll <= 0; }) || choices[0];
  const now = Date.now();
  let event;
  if (kind === 'payment' || kind === 'review') {
    const v = randomVars(flowOf('job-completed'), Math.random);
    if (kind === 'payment') {
      const price = pickFrom(Math.random, [129, 149, 179, 189, 278, 318, 189, 149]);
      state.live.revenue += price;
      state.live.tasks += 2;
      event = { id: `ev${now}`, ts: now, flowId: 'invoice-overdue', tone: 'ok', parts: [`Payment received: <b>${esc(v.invoice)}</b> (${money(price, true)})`, 'paid from the day-3 reminder link', 'reminders stopped'] };
    } else {
      state.live.tasks += 1;
      event = { id: `ev${now}`, ts: now, flowId: 'job-completed', tone: 'ok', parts: [`${esc(v.first_name)} ${esc(v.full_name.split(' ')[1][0])}. rated <b>${esc(v.tech)}</b> 5 stars`, 'review request sent'] };
    }
  } else {
    const flow = flowOf(kind);
    const run = makeRun(flow, now, Math.random, 'live');
    if (run.status === 'failed' && Math.random() < 0.6) { run.status = 'success'; run.failAt = null; run.path = run.planned; run.stepMs = run.planned.map((id) => Math.round(APP_MS[nodeOf(flow, id).app] * (0.6 + Math.random() * 0.8))); }
    if (kind === 'missed-call') { state.counters.ticket += 1; run.vars.ticket = String(state.counters.ticket); }
    if (kind === 'job-completed') { state.counters.invoice += 1; state.counters.job += 1; run.vars.invoice = `INV-${state.counters.invoice}`; run.vars.job = `J-${state.counters.job}`; }
    if (kind === 'web-lead') { state.counters.crm += 1; run.vars.crm_id = `CRM-${state.counters.crm}`; }
    state.runs.unshift(run);
    state.runs = [...state.runs.filter((x) => x.source === 'live').slice(0, 50), ...state.runs.filter((x) => x.test).slice(0, 25)];
    state.live.tasks += doneSteps(run);
    state.live.minutes += flow.savedMin;
    run.path.forEach((id) => { const app = nodeOf(flow, id).app; state.live.apps[app] = (state.live.apps[app] || 0) + 1; state.syncs[app] = now; });
    event = eventFromRun(run);
    insertRunRow(run);
  }
  save();
  pushFeed(event);
}
function pushFeed(event) {
  feed.unshift(event);
  feed.length = Math.min(feed.length, 30);
  const list = document.getElementById('feed');
  if (list) {
    list.querySelector('.feed-empty')?.remove();
    list.insertAdjacentHTML('afterbegin', feedItem(event, true));
    while (list.children.length > 10) list.lastElementChild.remove();
  }
  refreshOverviewNumbers();
  refreshFlowCards();
}
let tickTimer;
function scheduleTick(delay = 3600 + Math.random() * 3400) {
  clearTimeout(tickTimer);
  tickTimer = setTimeout(() => { if (!document.hidden && !state.feedPaused) liveTick(); scheduleTick(); }, delay);
}

/* ------------------------------------------------------------------- chrome */
const ui = { selected: null, flowId: null, runsLimit: 30, lastField: 'template' };
let run = null;
let teardown = null;
const announce = (text) => { const el = document.getElementById('live-status'); el.textContent = ''; setTimeout(() => { el.textContent = text; }, 30); };

function tickClock() {
  const el = document.getElementById('clock');
  if (el) { el.textContent = F.clock.format(Date.now()); el.setAttribute('datetime', new Date().toISOString()); }
}
function refreshAgo() {
  document.querySelectorAll('[data-ago]').forEach((el) => { el.textContent = ago(Number(el.dataset.ago)); });
}
function nextDispatch() {
  let ts = Date.now();
  for (let i = 0; i < 8; i += 1) {
    const p = chi(ts + i * DAY);
    const t = chiTs(p.y, p.m, p.d, 6, 30);
    if (t > Date.now() && !isWeekendTs(t)) return t;
  }
  return ts;
}
function updateSideStatus() {
  const el = document.getElementById('side-status');
  if (!el) return;
  const active = FLOWS.filter((f) => state.enabled[f.id]).length;
  const next = nextDispatch();
  el.innerHTML = `<p class="ss-row"><span class="dot ${active ? 'dot-live' : 'dot-off'}" aria-hidden="true"></span><span><strong>${active} of ${FLOWS.length}</strong> automations active</span></p>
    <p class="ss-row ss-mono">${state.enabled['morning-dispatch'] ? `Next: dispatch · ${F.date.format(next)} 6:30 AM` : 'Morning dispatch is paused'}</p>`;
}
const CRUMBS = { '/': 'Overview', '/automations': 'Automations', '/runs': 'Runs', '/savings': 'Savings', '/integrations': 'Integrations' };
function crumbFor(ctx) {
  if (CRUMBS[ctx.path]) return CRUMBS[ctx.path];
  if (ctx.path.startsWith('/automations/')) return flowOf(ctx.params.id)?.name || 'Not found';
  if (ctx.path.startsWith('/runs/')) return ctx.params.id || 'Run';
  return 'Not found';
}
function tween(el, to, format, dur = 600) {
  if (!el) return;
  const from = Number(el.dataset.value ?? to);
  el.dataset.value = String(to);
  cancelAnimationFrame(el.rafId);
  if (reduced() || Math.abs(from - to) < 1e-9) { el.textContent = format(to); return; }
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    el.textContent = format(from + (to - from) * (1 - (1 - k) ** 3));
    if (k < 1) el.rafId = requestAnimationFrame(step);
  };
  el.rafId = requestAnimationFrame(step);
}

/* ------------------------------------------------------------- small pieces */
function spark(values, tone = 'lime') {
  const w = 120; const h = 34;
  const max = Math.max(...values); const min = Math.min(...values); const spanV = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - min) / spanV) * (h - 8)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return `<svg class="spark spark-${tone}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="spark-fill" d="${d} L${w} ${h} L0 ${h}Z"/><path class="spark-line" d="${d}" vector-effect="non-scaling-stroke"/></svg>`;
}
const pageHead = ({ eyebrow, title, lede, side = '' }) => `<header class="page-head"><div class="ph-main"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div>${side ? `<div class="ph-side">${side}</div>` : ''}</header>`;
const chainHtml = (flow) => flow.chain.map((s, i) => `${i ? '<span class="arr" aria-hidden="true">→</span>' : ''}<span>${esc(cap(s))}</span>`).join(' ');
const appIcon = (app, cls = '') => `<span class="app-ico ${cls}" title="${esc(APPS[app].name)}">${icon(app)}</span>`;
function miniFlow(flow) {
  const cols = Math.max(...flow.nodes.map((n) => n.col)) + 1;
  const bits = [];
  for (let c = 0; c < cols; c += 1) {
    const nodes = flow.nodes.filter((n) => n.col === c).sort((a, b) => a.lane - b.lane);
    const chip = (n) => `<span class="mf-node mf-${n.kind}" title="${esc(n.title)}">${icon(n.kind === 'condition' ? 'condition' : n.app)}</span>`;
    bits.push(nodes.length > 1 ? `<span class="mf-split">${nodes.map(chip).join('')}</span>` : chip(nodes[0]));
  }
  return `<div class="mini-flow ${state.enabled[flow.id] ? '' : 'is-paused'}" aria-hidden="true">${bits.join('<span class="mf-wire"></span>')}</div>`;
}
function flowStats(flow) {
  const runs = allRuns().filter((r) => r.flowId === flow.id && !r.test);
  const weekAgo = Date.now() - 7 * DAY;
  const liveCount = state.runs.filter((r) => r.flowId === flow.id && r.source === 'live' && r.started > weekAgo).length;
  const week = flow.runsWeek + liveCount;
  return { last: runs[0]?.started, week, savedWeek: week * flow.savedMin, runs };
}
const flowSwitch = (flow, extra = '') => `<button type="button" class="switch ${extra}" role="switch" aria-checked="${state.enabled[flow.id]}" data-action="toggle-flow" data-id="${flow.id}" aria-label="${esc(flow.name)} active"></button>`;
const flowPill = (flow) => (state.enabled[flow.id] ? '<span class="pill pill-lime" data-flow-pill>Active</span>' : '<span class="pill pill-muted" data-flow-pill>Paused</span>');

/* ----------------------------------------------------------------- overview */
const COMPARE = [
  ['Lead intake & first reply', 4.6, 0.2], ['Missed-call follow-up', 2.5, 0.3], ['Invoices & pay links', 6.2, 0.4],
  ['Payment reminders', 1.8, 0.1], ['Review requests', 1.4, 0], ['Morning dispatch texts', 2.9, 0.2],
];
function feedItem(ev, fresh = false) {
  const flow = flowOf(ev.flowId);
  const text = ev.parts.map((p, i) => `${i ? '<span class="arr" aria-hidden="true">→</span> ' : ''}${p}`).join(' ');
  const label = ev.runId ? `<a href="#/runs/${ev.runId}">${esc(flow.name)}</a>` : esc(flow.name);
  return `<li class="feed-item tone-${ev.tone}${fresh ? ' is-new' : ''}">
    <span class="fi-ico">${icon(flow.app)}</span>
    <div class="fi-body"><p class="fi-text">${text}</p><p class="fi-meta">${label} · <span data-ago="${ev.ts}">${ago(ev.ts)}</span></p></div>
    <time class="fi-time" datetime="${new Date(ev.ts).toISOString()}">${F.log.format(ev.ts)}</time>
  </li>`;
}
function chartHtml() {
  const days = last14();
  const max = Math.max(40, Math.ceil(Math.max(...days.map((d) => d.value)) / 40) * 40);
  const total = sum(days.map((d) => d.value));
  const bars = days.map((d, i) => {
    const h = Math.max(1.5, (d.value / max) * 100);
    return `<rect class="bar${d.today ? ' is-today' : ''}${isWeekendTs(d.ts) ? ' is-weekend' : ''}" x="${i * 10 + 1.6}" y="${100 - h}" width="6.8" height="${h}"/>`;
  }).join('');
  const cols = days.map((d) => `<div class="cc-col${d.today ? ' is-today' : ''}"><span class="cc-tip"><b>${num(d.value)}</b> tasks<br>${d.today ? 'Today so far' : F.date.format(d.ts)}</span></div>`).join('');
  const labels = days.map((d, i) => `<span class="${d.today ? 'is-today' : ''}">${d.today ? 'Today' : i % 2 === 1 ? F.dayNum.format(d.ts) : F.narrow.format(d.ts)}</span>`).join('');
  return `<div class="chart" role="img" aria-label="Automated tasks per day for the last 14 days: ${num(total)} in total, ${num(days[13].value)} so far today.">
    <div class="chart-grid" aria-hidden="true"><span data-v="${num(max)}"></span><span data-v="${num(max / 2)}"></span><span data-v="0"></span></div>
    <div class="chart-plot" aria-hidden="true"><svg viewBox="0 0 140 100" preserveAspectRatio="none">${bars}</svg><div class="chart-cols">${cols}</div></div>
    <div class="chart-x" aria-hidden="true">${labels}</div>
  </div>`;
}
function overview() {
  const k = kpis();
  const days = last14();
  const active = FLOWS.filter((f) => state.enabled[f.id]).length;
  let cum = 0;
  const hoursSeries = days.map((d) => { cum += d.value * 2.1 / 60; return cum; });
  let rev = 0;
  const revSeries = days.map((d) => { rev += d.revenue; return rev; });
  const respSeries = days.map((d) => 31 + (hashStr(d.ts) % 16));
  const compareHtml = compareBlock();
  const month = F.monthShort.format(Date.now());
  const html = `
  ${pageHead({
    eyebrow: `${F.date.format(Date.now())} · Birmingham, AL`,
    title: 'Operations overview',
    lede: 'RELAY handles the busywork behind every call, lead and job at Ironwood, so the office can spend its time on customers.',
    side: `<span class="sys-status"><span class="dot ${active ? 'dot-live' : 'dot-off'}" aria-hidden="true"></span>${active ? 'All systems normal' : 'All automations paused'}</span><a class="btn btn-ghost" href="#/automations">${active} of ${FLOWS.length} automations active ${icon('arrow')}</a>`,
  })}
  <section class="kpis" aria-label="This month so far">
    <article class="kpi">
      <p class="kpi-label">Hours saved · ${month}</p>
      <p class="kpi-value"><span id="k-hours" data-value="${k.hours}">${num(k.hours, 1)}</span><small>hr</small></p>
      <p class="kpi-sub">About 2 min of office time per task</p>
      ${spark(hoursSeries)}
    </article>
    <article class="kpi">
      <p class="kpi-label">Tasks automated · ${month}</p>
      <p class="kpi-value"><span id="k-tasks" data-value="${k.tasks}">${num(k.tasks)}</span></p>
      <p class="kpi-sub"><span id="k-today" data-value="${k.today}">${num(k.today)}</span> so far today</p>
      ${spark(days.map((d) => d.value), 'cyan')}
    </article>
    <article class="kpi">
      <p class="kpi-label">Avg. lead response</p>
      <p class="kpi-value">38<small>sec</small></p>
      <p class="kpi-sub">Before RELAY: <s>3 hr 12 min</s></p>
      ${spark(respSeries, 'muted')}
    </article>
    <article class="kpi">
      <p class="kpi-label">Recovered by reminders · ${month}</p>
      <p class="kpi-value"><span id="k-revenue" data-value="${k.revenue}">${money(k.revenue)}</span></p>
      <p class="kpi-sub">From <span id="k-paid" data-value="${k.paid}">${k.paid}</span> overdue invoices, now paid</p>
      ${spark(revSeries)}
    </article>
  </section>
  <div class="ov-grid">
    <div class="ov-left">
    <section class="card chart-card" aria-labelledby="chart-title">
      <header class="card-head"><div><h2 id="chart-title">Automated tasks per day</h2><p class="card-sub">Last 14 days · texts, records, invoices and tasks RELAY handled</p></div><span class="legend"><i class="lg-bar"></i>Tasks <i class="lg-bar lg-today"></i>Today</span></header>
      <div id="chart-wrap">${chartHtml()}</div>
    </section>
    ${compareHtml}
    </div>
    <section class="card feed-card" aria-labelledby="feed-title">
      <header class="card-head">
        <div><h2 id="feed-title">Live activity</h2><p class="card-sub">Simulated events as they happen</p></div>
        <div class="feed-controls">
          <span class="pill ${state.feedPaused ? 'pill-muted' : 'pill-lime is-live'}" id="feed-pill">${state.feedPaused ? 'Paused' : 'Live'}</span>
          <button type="button" class="btn btn-sm btn-ghost" data-action="feed-toggle" aria-pressed="${state.feedPaused}">${state.feedPaused ? `${icon('play')} Resume` : `${icon('pause')} Pause`}</button>
        </div>
      </header>
      <ol class="feed" id="feed">${feed.length ? feed.slice(0, 10).map((e) => feedItem(e)).join('') : '<li class="feed-empty">Waiting for the next event…</li>'}</ol>
      <p class="feed-foot" id="feed-foot">${active ? 'New events every few seconds. Paused automations stay quiet.' : 'Every automation is paused, so nothing new will appear. Turn one back on under Automations.'}</p>
    </section>
  </div>`;
  return { title: 'Overview · RELAY', html };
}
function compareBlock() {
  const manual = sum(COMPARE.map((c) => c[1]));
  const auto = sum(COMPARE.map((c) => c[2]));
  return `<section class="card compare-card" aria-labelledby="cmp-title">
      <header class="card-head"><div><h2 id="cmp-title">Manual vs automated</h2><p class="card-sub">Office hours per week for the same work, at Ironwood’s volume</p></div></header>
      <div class="cmp-legend" aria-hidden="true"><span><i class="cmp-m"></i>By hand</span><span><i class="cmp-a"></i>With RELAY</span></div>
      <ul class="cmp-list">
        ${COMPARE.map(([label, m, a]) => `<li>
          <span class="cmp-label">${label}</span>
          <span class="cmp-bars" aria-hidden="true"><i class="cmp-m" style="--w:${(m / 6.2) * 100}%"></i><i class="cmp-a" style="--w:${Math.max(0.8, (a / 6.2) * 100)}%"></i></span>
          <span class="cmp-val"><span class="visually-hidden">By hand </span>${m.toFixed(1)} h <span class="arr" aria-hidden="true">→</span><span class="visually-hidden">, with RELAY </span> <b>${a.toFixed(1)} h</b></span>
        </li>`).join('')}
      </ul>
      <footer class="cmp-foot"><p><span class="mono">${manual.toFixed(1)} h</span> <span class="arr" aria-hidden="true">→</span> <b class="mono">${auto.toFixed(1)} h</b> a week</p><p class="muted">${(manual - auto).toFixed(1)} hours a week handed back to the office. The rest is RELAY flagging exceptions for a person.</p></footer>
    </section>`;
}
function refreshOverviewNumbers() {
  if (!document.getElementById('k-tasks')) return;
  const k = kpis();
  tween(document.getElementById('k-hours'), k.hours, (v) => num(v, 1));
  tween(document.getElementById('k-tasks'), k.tasks, (v) => num(Math.round(v)));
  tween(document.getElementById('k-today'), k.today, (v) => num(Math.round(v)));
  tween(document.getElementById('k-revenue'), k.revenue, (v) => money(Math.round(v)));
  tween(document.getElementById('k-paid'), k.paid, (v) => String(Math.round(v)));
  const wrap = document.getElementById('chart-wrap');
  if (wrap) wrap.innerHTML = chartHtml();
}

/* -------------------------------------------------------------- automations */
function flowCard(flow) {
  const s = flowStats(flow);
  return `<article class="flow-card ${state.enabled[flow.id] ? '' : 'is-paused'}" data-flow-card="${flow.id}">
    <header class="fc-head">
      <span class="fc-ico">${icon(flow.app)}</span>
      <div class="fc-title"><h2><a href="#/automations/${flow.id}" class="stretched">${esc(flow.name)}</a></h2><p class="fc-trigger">${esc(flow.trigger)}</p></div>
      <div class="fc-toggle">${flowPill(flow)}${flowSwitch(flow)}</div>
    </header>
    ${miniFlow(flow)}
    <p class="fc-chain">${chainHtml(flow)}</p>
    <dl class="fc-stats">
      <div><dt>Last run</dt><dd data-ago="${s.last || Date.now()}">${s.last ? ago(s.last) : '—'}</dd></div>
      <div><dt>Runs this week</dt><dd data-week="${flow.id}">${s.week}</dd></div>
      <div><dt>Saves per run</dt><dd>${flow.savedMin} min</dd></div>
    </dl>
    <p class="fc-open" aria-hidden="true">Open builder ${icon('arrow')}</p>
  </article>`;
}
function automations() {
  const active = FLOWS.filter((f) => state.enabled[f.id]).length;
  const weekHours = sum(FLOWS.map((f) => flowStats(f).savedWeek)) / 60;
  return {
    title: 'Automations · RELAY',
    html: `${pageHead({
      eyebrow: 'Automations',
      title: 'The flows that run Ironwood’s back office',
      lede: 'Six automations handle leads, missed calls, invoices, reminders, memberships and dispatch. Switch one off to pause it; open one to see how it works and run a test.',
      side: `<div class="head-stats"><p><span class="mono big" id="active-count">${active}/${FLOWS.length}</span><span>active</span></p><p><span class="mono big">${num(weekHours, 1)}</span><span>hr saved this week</span></p></div>`,
    })}
    <div class="flow-grid">${FLOWS.map(flowCard).join('')}</div>`,
  };
}
function refreshFlowCards() {
  FLOWS.forEach((flow) => {
    const card = document.querySelector(`[data-flow-card="${flow.id}"]`);
    if (!card) return;
    const s = flowStats(flow);
    const last = card.querySelector('[data-ago]');
    if (last && s.last) { last.dataset.ago = s.last; last.textContent = ago(s.last); }
    const wk = card.querySelector('[data-week]');
    if (wk) wk.textContent = s.week;
  });
}
function syncFlowToggle(flow) {
  const on = state.enabled[flow.id];
  document.querySelectorAll(`[data-action="toggle-flow"][data-id="${flow.id}"]`).forEach((b) => b.setAttribute('aria-checked', String(on)));
  document.querySelectorAll(`[data-flow-card="${flow.id}"], [data-flow-head="${flow.id}"]`).forEach((el) => {
    el.classList.toggle('is-paused', !on);
    const pill = el.querySelector('[data-flow-pill]');
    if (pill) pill.outerHTML = flowPill(flow);
    el.querySelector('.mini-flow')?.classList.toggle('is-paused', !on);
  });
  document.getElementById('canvas')?.classList.toggle('is-paused', !on);
  const count = document.getElementById('active-count');
  if (count) count.textContent = `${FLOWS.filter((f) => state.enabled[f.id]).length}/${FLOWS.length}`;
  updateSideStatus();
}

/* ------------------------------------------------------------------ builder */
function nodeHtml(flow, node, i) {
  const c = cfg(flow, node);
  const label = `Step ${i + 1}, ${KIND[node.kind]}, ${APPS[node.app].name}: ${node.title}. Open settings`;
  return `<button type="button" class="node k-${node.kind}" data-node="${node.id}" data-num="${pad2(i + 1)}" data-state="idle" data-action="select-node" aria-label="${esc(label)}">
    <span class="node-top"><span class="node-ico">${icon(node.kind === 'condition' ? 'condition' : node.app)}</span><span class="node-kind">${node.kind === 'trigger' ? 'Trigger' : node.kind === 'condition' ? 'Branch' : APPS[node.app].short}</span><span class="node-badge">${pad2(i + 1)}</span></span>
    <span class="node-title">${esc(node.title)}</span>
    <span class="node-sub">${esc(nodeSub(flow, node))}</span>
    <span class="node-flag"${c.fail ? '' : ' hidden'}>Fail sim</span>
    <span class="node-edit"${isCustomized(flow, node) ? '' : ' hidden'} title="Customized">●</span>
  </button>`;
}
function canvasHtml(flow) {
  const wires = flow.edges.map(([a, b, label]) => `<g class="wire" data-edge="${a}-${b}"><path class="wire-base"/><path class="wire-flow"/><circle class="port" r="3.5"/><circle class="port port-b" r="3.5"/>${label ? `<g class="wire-label wl-${label}"><rect width="34" height="17" rx="4"/><text x="17" y="12" text-anchor="middle">${label.toUpperCase()}</text></g>` : ''}</g>`).join('');
  return `<div class="canvas ${state.enabled[flow.id] ? '' : 'is-paused'}" id="canvas" role="group" aria-label="${esc(flow.name)}: flow diagram with ${flow.nodes.length} steps">
    <svg class="wires" id="wires" aria-hidden="true">${wires}</svg>
    ${flow.nodes.map((n, i) => nodeHtml(flow, n, i)).join('')}
  </div>`;
}
function layoutCanvas(flow) {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const W0 = canvas.clientWidth;
  if (!W0) return;
  const cols = Math.max(...flow.nodes.map((n) => n.col)) + 1;
  const lanes = [...new Set(flow.nodes.map((n) => n.lane))].sort((a, b) => a - b);
  const branch = lanes.length > 1;
  const pad = W0 < 560 ? 14 : 24;
  const fits = (minW, gap) => W0 >= cols * minW + (cols - 1) * gap + pad * 2;
  // Roomy spacing first, then a tighter one for laptop widths, then stack the steps vertically.
  const gapX = fits(140, 34) ? 34 : 22;
  const H = 98;
  const horizontal = fits(140, 34) || fits(122, 22);
  const pos = {};
  let height;
  if (horizontal) {
    const w = Math.min(214, Math.floor((W0 - pad * 2 - gapX * (cols - 1)) / cols));
    const used = cols * w + (cols - 1) * gapX;
    const x0 = Math.round((W0 - used) / 2);
    const laneGap = 26;
    flow.nodes.forEach((n) => { pos[n.id] = { x: x0 + n.col * (w + gapX), y: pad + (n.lane - lanes[0]) * (H + laneGap), w, h: H }; });
    height = pad * 2 + lanes.length * H + (lanes.length - 1) * laneGap;
  } else {
    const gapY = 40;
    const gapLane = 10;
    const inner = W0 - pad * 2;
    const mainW = Math.min(340, inner);
    const bw = branch ? Math.min(250, Math.floor((inner - gapLane) / 2)) : mainW;
    flow.nodes.forEach((n) => {
      const y = pad + n.col * (H + gapY);
      if (!n.lane) pos[n.id] = { x: Math.round((W0 - mainW) / 2), y, w: mainW, h: H };
      else if (n.lane < 0) pos[n.id] = { x: Math.round(W0 / 2 - gapLane / 2 - bw), y, w: bw, h: H };
      else pos[n.id] = { x: Math.round(W0 / 2 + gapLane / 2), y, w: bw, h: H };
    });
    height = pad * 2 + cols * H + (cols - 1) * gapY;
  }
  canvas.style.height = `${height}px`;
  canvas.classList.toggle('is-vertical', !horizontal);
  flow.nodes.forEach((n) => {
    const el = canvas.querySelector(`[data-node="${n.id}"]`);
    const p = pos[n.id];
    el.style.cssText = `left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px`;
    el.classList.toggle('is-narrow', p.w < 146);
  });
  const svg = document.getElementById('wires');
  svg.setAttribute('viewBox', `0 0 ${W0} ${height}`);
  svg.setAttribute('width', W0);
  svg.setAttribute('height', height);
  flow.edges.forEach(([a, b, label]) => {
    const g = svg.querySelector(`[data-edge="${a}-${b}"]`);
    const p = pos[a]; const q = pos[b];
    let d; let x1; let y1; let x2; let y2;
    if (horizontal) {
      x1 = p.x + p.w; y1 = p.y + p.h / 2; x2 = q.x; y2 = q.y + q.h / 2;
      const dx = Math.max(16, (x2 - x1) / 2);
      d = `M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
    } else {
      x1 = p.x + p.w / 2; y1 = p.y + p.h; x2 = q.x + q.w / 2; y2 = q.y;
      const dy = Math.max(14, (y2 - y1) / 2);
      d = `M${x1} ${y1} C${x1} ${y1 + dy} ${x2} ${y2 - dy} ${x2} ${y2}`;
    }
    g.querySelectorAll('path').forEach((path) => path.setAttribute('d', d));
    const [pa, pb] = g.querySelectorAll('.port');
    pa.setAttribute('cx', x1); pa.setAttribute('cy', y1); pb.setAttribute('cx', x2); pb.setAttribute('cy', y2);
    if (label) {
      const base = g.querySelector('.wire-base');
      const pt = base.getPointAtLength(base.getTotalLength() * 0.5);
      g.querySelector('.wire-label').setAttribute('transform', `translate(${(pt.x - 17).toFixed(1)} ${(pt.y - 8.5).toFixed(1)})`);
    }
  });
  applyRunStates(flow);
}
function setNode(id, st, badge) {
  if (run) run.nodeStates[id] = [st, badge];
  if (run && currentFlow()?.id !== run.flowId) return;
  const el = document.querySelector(`.node[data-node="${id}"]`);
  if (!el) return;
  el.dataset.state = st;
  el.querySelector('.node-badge').textContent = badge ?? el.dataset.num;
  // On the stacked (phone) canvas, keep the step that is running in view.
  if (st === 'running' && el.closest('.canvas.is-vertical')) {
    const r = el.getBoundingClientRect();
    if (r.bottom > window.innerHeight - 90 || r.top < 100) el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
  }
}
function setEdge(key, st) {
  if (run) run.edgeStates[key] = st;
  if (run && currentFlow()?.id !== run.flowId) return;
  const g = document.querySelector(`.wire[data-edge="${key}"]`);
  if (!g) return;
  g.classList.toggle('is-active', st === 'active');
  g.classList.toggle('is-live', st === 'live');
  g.classList.toggle('is-skipped', st === 'skipped');
}
function applyRunStates(flow) {
  document.querySelectorAll('.node').forEach((el) => { el.dataset.state = 'idle'; el.querySelector('.node-badge').textContent = el.dataset.num; });
  document.querySelectorAll('.wire').forEach((g) => g.classList.remove('is-active', 'is-live', 'is-skipped'));
  if (!run || run.flowId !== flow.id) return;
  Object.entries(run.nodeStates).forEach(([id, [st, badge]]) => {
    const el = document.querySelector(`.node[data-node="${id}"]`);
    if (el) { el.dataset.state = st; el.querySelector('.node-badge').textContent = badge ?? el.dataset.num; }
  });
  Object.entries(run.edgeStates).forEach(([key, st]) => {
    const g = document.querySelector(`.wire[data-edge="${key}"]`);
    if (g) { g.classList.toggle('is-live', st === 'live' || st === 'active'); g.classList.toggle('is-skipped', st === 'skipped'); }
  });
}
function pulse(key) {
  return new Promise((resolve) => {
    const dur = 460;
    const svg = document.getElementById('wires');
    const path = document.querySelector(`.wire[data-edge="${key}"] .wire-base`);
    if (!svg || !path || reduced()) { setTimeout(resolve, reduced() ? 160 : dur); return; }
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '4.5');
    dot.setAttribute('class', 'pulse');
    svg.append(dot);
    const t0 = performance.now();
    let done = false;
    const finish = () => { if (done) return; done = true; dot.remove(); resolve(); };
    const frame = (now) => {
      if (done) return;
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - ((-2 * k + 2) ** 2) / 2;
      const live = document.querySelector(`.wire[data-edge="${key}"] .wire-base`);
      if (!live) { finish(); return; }
      const pt = live.getPointAtLength(e * live.getTotalLength());
      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);
      if (k < 1) requestAnimationFrame(frame); else finish();
    };
    requestAnimationFrame(frame);
    setTimeout(finish, dur + 400);
  });
}

// Console and output panels.
function logLineHtml(entry) {
  if (entry.k === 'json') return `<pre class="log-json">${jsonHtml(entry.data)}</pre>`;
  return `<div class="log-line k-${entry.k}"><time>${stamp(entry.t)}</time><span>${esc(entry.text)}</span></div>`;
}
function jsonHtml(obj) {
  const src = JSON.stringify(trimData(obj), null, 2);
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;
  let out = '';
  let last = 0;
  src.replace(re, (m, str, colon, bool, n, offset) => {
    out += esc(src.slice(last, offset));
    if (str) out += colon ? `<span class="j-key">${esc(str)}</span>${colon}` : `<span class="j-str">${esc(str)}</span>`;
    else if (bool) out += `<span class="j-bool">${bool}</span>`;
    else out += `<span class="j-num">${n}</span>`;
    last = offset + m.length;
    return m;
  });
  return out + esc(src.slice(last));
}
function log(k, payload) {
  if (!run) return;
  const entry = k === 'json' ? { t: Date.now(), k, data: payload } : { t: Date.now(), k, text: payload };
  run.logs.push(entry);
  const box = currentFlow()?.id === run.flowId && document.getElementById('log');
  if (!box) return;
  box.querySelector('.log-idle')?.remove();
  const near = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
  box.insertAdjacentHTML('beforeend', logLineHtml(entry));
  if (near) box.scrollTop = box.scrollHeight;
}
function idleConsole(flow) {
  const steps = flow.nodes.length;
  const branches = flow.nodes.filter((n) => n.kind === 'condition').length;
  const now = Date.now();
  return `<div class="log-idle">
    <div class="log-line k-muted"><time>${stamp(now)}</time><span>relay 2.4.1 · workspace ironwood-plumbing-air · env simulated</span></div>
    <div class="log-line k-muted"><time>${stamp(now)}</time><span>flow ${flow.id} · ${plural(steps, 'step')} · ${plural(branches, 'branch', 'branches')}</span></div>
    <div class="log-line k-ok"><time>${stamp(now)}</time><span>ready. Press Run test (R) to run this flow with sample data. Nothing is sent.</span></div>
  </div>`;
}
function artifactHtml(a) {
  const TYPE = { sms: 'Text message', email: 'Email', record: 'Record', invoice: 'Invoice', route: 'Routes' };
  const head = `<header class="art-head"><span class="art-ico">${icon(a.app)}</span><span class="art-titles"><span class="art-type">${TYPE[a.type]}</span><strong>${esc(a.title)}</strong></span>${a.tag ? `<span class="pill pill-${a.tone || 'lime'}">${esc(a.tag)}</span>` : ''}${a.type === 'invoice' ? `<span class="pill pill-${a.tone || 'muted'}">${esc(a.status)}</span>` : ''}</header>`;
  let body = '';
  if (a.type === 'sms') {
    body = `<div class="art-sms"><p class="sms-to mono">To ${esc(a.to)} · from ${esc(a.from)}</p><p class="bubble">${esc(a.body)}</p><p class="sms-meta mono">${a.body.length} chars · ${plural(segs(a.body), 'segment')}${a.note ? ` · ${esc(a.note)}` : ''}</p></div>`;
  } else if (a.type === 'email') {
    body = `<div class="art-email"><dl class="email-meta"><div><dt>To</dt><dd>${esc(a.to)}</dd></div><div><dt>From</dt><dd>office@ironwood.example</dd></div><div><dt>Subject</dt><dd><strong>${esc(a.subject)}</strong></dd></div></dl><p class="email-body">${esc(a.body)}</p></div>`;
  } else if (a.type === 'record') {
    body = `<dl class="kv">${a.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  } else if (a.type === 'invoice') {
    const total = sum(a.lines.map((l) => l[1]));
    body = `<div class="art-inv"><p class="inv-cust">Ironwood Plumbing &amp; Air · ${OFFICE}<br><span class="muted">Bill to ${esc(a.customer)}</span></p>
      <table class="inv-table"><caption class="visually-hidden">Line items</caption><thead><tr><th scope="col">Item</th><th scope="col">Amount</th></tr></thead><tbody>${a.lines.map(([d, amt]) => `<tr><td>${esc(d)}</td><td class="mono">${amt < 0 ? '−' : ''}${money(Math.abs(amt), true)}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">Total</th><td class="mono">${money(total, true)}</td></tr></tfoot></table>
      <p class="inv-foot mono">${esc(a.due)} · pay link ${esc(a.link)}</p>${a.note ? `<p class="inv-note">${esc(a.note)}</p>` : ''}</div>`;
  } else if (a.type === 'route') {
    body = `<div class="art-route">${a.techs.map((t) => `<div class="route-tech"><p class="route-name">${esc(t.name)} <span class="mono muted">${plural(t.jobs.length, 'stop')}</span></p><ol>${t.jobs.map(([w, s, c]) => `<li><span class="mono">${esc(w)}</span><span>${esc(s)}</span><span class="muted">${esc(c)}</span></li>`).join('')}</ol></div>`).join('')}</div>`;
  }
  const foot = `Step ${a.step}${a.updated && a.updated !== a.step ? ` · updated in step ${a.updated}` : ''} · preview, nothing sent`;
  return `<article class="artifact art-${a.type}" data-art="${a.id}">${head}${body}<footer class="art-foot mono">${foot}</footer></article>`;
}
function idleOutput() {
  return `<div class="out-empty"><span class="out-ico">${icon('bolt')}</span><p><strong>No output yet</strong></p><p class="muted">Run a test to see exactly what this flow would produce: the text messages, CRM records, tickets and invoices. Nothing is actually sent.</p></div>`;
}
function upsertArtifact(a) {
  const existing = run.artifacts.find((x) => x.id === a.id);
  let item = a;
  if (existing) { item = { ...a, step: existing.step, updated: a.step }; run.artifacts[run.artifacts.indexOf(existing)] = item; }
  else run.artifacts.push(a);
  const box = currentFlow()?.id === run.flowId && document.getElementById('artifacts');
  if (!box) return;
  box.querySelector('.out-empty')?.remove();
  const old = box.querySelector(`[data-art="${a.id}"]`);
  if (old) {
    old.outerHTML = artifactHtml(item);
    box.querySelector(`[data-art="${a.id}"]`).classList.add('is-updated');
  } else {
    box.insertAdjacentHTML('afterbegin', artifactHtml(item));
  }
  const count = document.getElementById('art-count');
  if (count) count.textContent = plural(run.artifacts.length, 'artifact');
}
function runStateHtml(flow) {
  if (!run || run.flowId !== flow.id) return '<span class="rs rs-idle">Ready · sample data</span>';
  if (run.active && run.paused) return `<span class="rs rs-warn">${icon('alert')} Needs attention</span>`;
  if (run.active) return `<span class="rs rs-run"><span class="spinner" aria-hidden="true"></span>Running · step ${Math.min(run.stepMs.length + 1, run.path.length)} of ${run.path.length}</span>`;
  const total = fmtMs((run.finished || Date.now()) - run.started);
  if (run.status === 'success') return `<span class="rs rs-ok">${icon('check')} Passed · ${total}</span>`;
  if (run.status === 'recovered') return `<span class="rs rs-warn">${icon('check')} Passed after retry · ${total}</span>`;
  return '<span class="rs rs-idle">Stopped</span>';
}
function runControlsHtml(flow) {
  if (run?.flowId === flow.id && run.active) {
    if (run.paused) return `<button type="button" class="btn btn-ghost" data-action="stop-run">${icon('stop')} Stop</button><button type="button" class="btn btn-primary" data-action="retry-run">${icon('retry')} Retry step <kbd>R</kbd></button>`;
    return `<button type="button" class="btn btn-ghost" data-action="stop-run">${icon('stop')} Stop</button>`;
  }
  return `<button type="button" class="btn btn-primary" data-action="run-test">${icon('play')} Run test <kbd>R</kbd></button>`;
}
function refreshRunChrome(flow) {
  if (currentFlow()?.id !== flow.id) return;
  const st = document.getElementById('run-state');
  if (st) st.innerHTML = runStateHtml(flow);
  const ctl = document.getElementById('run-controls');
  if (ctl) {
    const hadFocus = ctl.contains(document.activeElement);
    ctl.innerHTML = runControlsHtml(flow);
    if (hadFocus) ctl.querySelector('.btn-primary, .btn')?.focus();
  }
  const id = document.getElementById('run-id');
  if (id) id.textContent = run?.flowId === flow.id ? run.id : '—';
  document.getElementById('canvas')?.classList.toggle('is-running', Boolean(run?.active && run.flowId === flow.id));
}
const check = (token) => { if (token.cancelled) throw CANCEL; };
const wait = async (ms, token) => { await sleep(ms); check(token); };
const testStepMs = (flow, node) => (node.kind === 'condition' ? 760 : 600 + (hashStr(flow.id + node.id) % 600));

async function startRun(flow) {
  if (run?.active) return;
  const x = makeCtx(flow, { bump: true });
  save();
  const path = pathFor(flow, x.sim);
  const token = { cancelled: false };
  run = { flowId: flow.id, id: `run_${(hashStr(`${Date.now()}${Math.random()}`) % 2176782335).toString(36).padStart(6, '0')}`, active: true, paused: false, status: 'running', started: Date.now(), logs: [], artifacts: [], nodeStates: {}, edgeStates: {}, path, stepMs: [], failAt: null, sim: x.sim, vars: x.vars, token };
  const me = run;
  const box = document.getElementById('log');
  if (box) box.innerHTML = '';
  const out = document.getElementById('artifacts');
  if (out) out.innerHTML = '';
  const count = document.getElementById('art-count');
  if (count) count.textContent = '0 artifacts';
  applyRunStates(flow);
  refreshRunChrome(flow);
  if (window.innerWidth < 760) document.getElementById('canvas')?.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
  announce(`Test run started for ${flow.name}.`);
  log('sys', `run ${me.id} · flow ${flow.id} · trigger test · mode simulated`);
  log('sys', `sample: ${flow.sampleLine(x.vars)}${flow.sim ? ` · ${flow.sim.label.toLowerCase()}: ${flow.sim.type === 'switch' ? (x.sim ? 'yes' : 'no') : `${x.sim} stars`}` : ''}`);
  try {
    for (let i = 0; i < path.length; i += 1) {
      const node = nodeOf(flow, path[i]);
      const c = cfg(flow, node);
      if (i > 0) {
        const key = `${path[i - 1]}-${node.id}`;
        setEdge(key, 'active');
        await pulse(key);
        check(token);
        setEdge(key, 'live');
      }
      setNode(node.id, 'running', '···');
      refreshRunChrome(flow);
      log('step', `▸ [${i + 1}/${path.length}] ${KIND[node.kind].toLowerCase()} · ${node.title}`);
      const t0 = performance.now();
      await wait(testStepMs(flow, node), token);
      if (node.kind === 'action' && c.fail) await failAndRecover(flow, node, token);
      const res = node.exec(x, c) || {};
      (res.lines || []).forEach(([k, text]) => log(k, text));
      if (res.data) log('json', res.data);
      (res.artifacts || []).forEach((a) => upsertArtifact({ ...a, step: i + 1 }));
      const ms = Math.round(performance.now() - t0);
      me.stepMs.push(ms);
      if (node.kind === 'condition') {
        log('branch', `branch → ${res.branch.toUpperCase()}`);
        flow.nodes.filter((n) => !path.includes(n.id)).forEach((n) => setNode(n.id, 'skipped', 'Skipped'));
        flow.edges.forEach(([a, b]) => { const ia = path.indexOf(a); if (ia < 0 || path[ia + 1] !== b) setEdge(`${a}-${b}`, 'skipped'); });
      }
      setNode(node.id, me.failAt === node.id ? 'recovered' : 'done', `✓ ${fmtMs(ms)}`);
      log('ok', `✓ ${node.kind === 'condition' ? 'evaluated' : me.failAt === node.id ? 'recovered' : 'done'} · ${fmtMs(ms)}`);
    }
    finishRun(flow, me.failAt ? 'recovered' : 'success');
  } catch (err) {
    if (err !== CANCEL) throw err;
  }
}
async function failAndRecover(flow, node, token) {
  const me = run;
  const err = ERRORS[node.app] || ERRORS.relay;
  me.failAt = node.id;
  setNode(node.id, 'failed', '✕ Failed');
  log('err', `✕ ${err}`);
  announce(`Step failed: ${node.title}. Retrying automatically.`);
  log('warn', '↻ auto-retry 1 of 1 in 1.0s · exponential backoff');
  await wait(1000, token);
  setNode(node.id, 'retrying', '↻ Retry');
  log('muted', 'attempt 2 …');
  await wait(750, token);
  setNode(node.id, 'failed', '✕ Failed');
  log('err', `✕ attempt 2 failed · ${err.replace(/ \(.*\)$/, '')}`);
  log('warn', '■ run paused · this step needs attention. Press Retry to try it again.');
  me.paused = true;
  refreshRunChrome(flow);
  announce('Run paused because a step failed. Press Retry step to try again.');
  await new Promise((resolve) => { me.resume = resolve; });
  check(token);
  me.paused = false;
  me.resume = null;
  refreshRunChrome(flow);
  log('warn', '↻ manual retry · attempt 3 in 2.0s · backoff ×2');
  setNode(node.id, 'retrying', '↻ Retry');
  await wait(1400, token);
  log('ok', `✓ attempt 3 succeeded · ${APPS[node.app].name} responded 200 OK`);
}
function finishRun(flow, status) {
  const me = run;
  me.active = false;
  me.status = status;
  me.finished = Date.now();
  const total = me.finished - me.started;
  log(status === 'recovered' ? 'warn' : 'ok', `■ finished in ${fmtMs(total)} · ${plural(me.path.length, 'step')} · ${plural(me.artifacts.length, 'artifact')} · nothing was sent`);
  state.runs.unshift({ id: me.id, flowId: flow.id, source: 'test', test: true, started: me.started, status, path: me.path, planned: me.path, stepMs: me.stepMs, failAt: me.failAt, sim: me.sim, vars: me.vars, logs: me.logs.slice(-140) });
  state.runs = [...state.runs.filter((x) => x.source === 'live').slice(0, 50), ...state.runs.filter((x) => x.test).slice(0, 25)];
  save();
  refreshRunChrome(flow);
  announce(status === 'recovered' ? `Test passed after a retry in ${fmtMs(total)}.` : `Test passed in ${fmtMs(total)}. ${plural(me.artifacts.length, 'artifact')} in the output panel.`);
  if (window.innerWidth < 760) toast('Test finished. Scroll down for the log and output.');
}
function stopRun(silent = false) {
  if (!run?.active) return;
  const flow = flowOf(run.flowId);
  run.token.cancelled = true;
  run.active = false;
  run.paused = false;
  run.status = 'stopped';
  run.resume?.();
  Object.entries(run.nodeStates).forEach(([id, [st]]) => { if (['running', 'retrying'].includes(st)) setNode(id, 'idle'); });
  log('warn', '■ run stopped');
  if (!silent) { refreshRunChrome(flow); announce('Test run stopped.'); }
}

// Inspector (step settings).
function previewVars(flow) {
  const x = makeCtx(flow);
  if (flow.id === 'morning-dispatch') return { ...x.vars, ...dispatchVars('marcus') };
  return x.vars;
}
function delayRange(flow, node) {
  const [lo, hi] = node.delayRange || [1, 1440];
  if (flow.id === 'invoice-overdue') {
    const i = flow.nodes.indexOf(node);
    const prev = flow.nodes.slice(0, i).reverse().find((n) => 'delay' in cfg(flow, n));
    const next = flow.nodes.slice(i + 1).find((n) => 'delay' in cfg(flow, n));
    return [Math.max(lo, prev ? cfg(flow, prev).delay + 1 : lo), Math.min(hi, next ? cfg(flow, next).delay - 1 : hi)];
  }
  return [lo, hi];
}
function simControl(flow, where) {
  const v = simValue(flow);
  if (flow.sim.type === 'switch') {
    return `<button type="button" class="toggle toggle-sim" role="switch" aria-checked="${Boolean(v)}" data-action="toggle-sim"><span class="toggle-label">${esc(flow.sim.label)}</span><span class="switch-ui" aria-hidden="true"></span></button>`;
  }
  return `<label class="sim-select" for="sim-${where}"><span>${esc(flow.sim.label)}</span><select id="sim-${where}" data-change="set-sim">${flow.sim.options.map((o) => `<option value="${o}"${String(v) === o ? ' selected' : ''}>${o} ${o === '1' ? 'star' : 'stars'}</option>`).join('')}</select></label>`;
}
function outcomeText(flow, node) {
  const branch = flow.decide(simValue(flow));
  const edge = flow.edges.find((e) => e[0] === node.id && e[2] === branch);
  return `Next test takes the <b class="mono">${branch.toUpperCase()}</b> path → ${esc(nodeOf(flow, edge[1]).title)}`;
}
function inspectorHtml(flow, node) {
  const c = cfg(flow, node);
  const i = flow.nodes.indexOf(node);
  const vars = flow.vars;
  const parts = [`<p class="insp-help">${esc(node.help)}</p>`];
  if (node.kind === 'trigger') {
    parts.push(`<div class="field"><p class="field-label">Sample trigger data</p><pre class="code-block">${jsonHtml(node.exec(makeCtx(flow), c).data || {})}</pre><p class="field-hint">Test runs start with this sample. Live runs use the real event.</p></div>`);
  }
  if (node.kind === 'condition') {
    parts.push(`<div class="field"><p class="field-label">Rule</p><p class="rule mono">${esc(node.rule)}</p></div>`);
    if (flow.sim) parts.push(`<div class="field"><p class="field-label">Test setting</p>${simControl(flow, 'insp')}<p class="field-hint" id="outcome">${outcomeText(flow, node)}</p></div>`);
  }
  if ('subject' in c) {
    parts.push(`<div class="field"><label class="field-label" for="f-subject">Email subject</label><input id="f-subject" type="text" value="${esc(c.subject)}" data-input="edit-node" data-field="subject" autocomplete="off"></div>`);
  }
  if ('template' in c) {
    parts.push(`<div class="field"><label class="field-label" for="f-template">${'subject' in c ? 'Email body' : 'Message template'}</label><textarea id="f-template" rows="${'subject' in c ? 8 : 5}" data-input="edit-node" data-field="template">${esc(c.template)}</textarea>
      <div class="var-row" role="group" aria-label="Insert a variable">${vars.map((v) => `<button type="button" class="var-chip" data-action="insert-var" data-var="${v}">{${v}}</button>`).join('')}</div></div>
      <div class="field"><p class="field-label">Live preview <span class="muted">· sample data${flow.id === 'morning-dispatch' ? ' for Marcus' : ''}</span></p><div class="preview ${'subject' in c ? 'preview-email' : 'preview-sms'}" id="tpl-preview"></div><p class="preview-meta" id="tpl-meta" aria-live="polite"></p></div>`);
  }
  if ('delay' in c) {
    const [lo, hi] = delayRange(flow, node);
    const day = c.unit === 'day';
    parts.push(`<div class="field"><label class="field-label" for="f-delay">${day ? 'Runs on day (after the due date)' : 'Delay (minutes)'}</label><div class="input-affix"><input id="f-delay" type="number" inputmode="numeric" min="${lo}" max="${hi}" step="1" value="${c.delay}" data-input="edit-node" data-field="delay"><span>${day ? 'days' : 'min'}</span></div><p class="field-hint">${day ? `Between day ${lo} and day ${hi}.` : `From ${lo} to ${num(hi)} minutes.`} Test runs fast-forward waits.</p></div>`);
  }
  if (node.assignees) {
    parts.push(`<div class="field"><label class="field-label" for="f-assignee">${esc(node.assigneeLabel || 'Assign to')}</label><select id="f-assignee" data-change="edit-node" data-field="assignee">${node.assignees.map((k) => `<option value="${k}"${k === c.assignee ? ' selected' : ''}>${esc(ASSIGNEE_LABEL[k])}</option>`).join('')}</select></div>`);
  }
  if (node.kind === 'action') {
    parts.push(`<div class="field field-fail"><button type="button" class="toggle toggle-block" role="switch" aria-checked="${Boolean(c.fail)}" data-action="toggle-fail"><span class="toggle-label"><strong>Simulate failure</strong><small>This step fails on the next test run so you can watch RELAY retry it.</small></span><span class="switch-ui" aria-hidden="true"></span></button></div>`);
  }
  return `<header class="insp-head">
      <span class="insp-ico k-${node.kind}">${icon(node.kind === 'condition' ? 'condition' : node.app)}</span>
      <div class="insp-titles"><p class="eyebrow">Step ${pad2(i + 1)} · ${KIND[node.kind]} · ${esc(APPS[node.app].name)}</p><h2 id="insp-title" tabindex="-1">${esc(node.title)}</h2></div>
      <button type="button" class="icon-btn" data-action="close-inspector" aria-label="Close step settings">${icon('x')}</button>
    </header>
    <div class="insp-body">${parts.join('')}</div>
    <footer class="insp-foot"><p class="saved-note" id="saved-note">${isCustomized(flow, node) ? 'Customized · saved automatically' : 'Changes save automatically'}</p><div class="insp-actions">${isCustomized(flow, node) ? '<button type="button" class="btn btn-ghost btn-sm" data-action="reset-node">Reset</button>' : ''}<button type="button" class="btn btn-primary btn-sm" data-action="run-test">${icon('play')} Run test</button></div></footer>`;
}
function updatePreview(flow) {
  const node = ui.selected && nodeOf(flow, ui.selected);
  const box = document.getElementById('tpl-preview');
  if (!node || !box) return;
  const c = cfg(flow, node);
  const vars = previewVars(flow);
  const unknown = unknownVars(`${c.subject || ''} ${c.template}`, vars);
  if ('subject' in c) {
    box.innerHTML = `<p class="pv-subject">${fillHtml(c.subject, vars)}</p><p class="pv-body">${fillHtml(c.template, vars)}</p>`;
    document.getElementById('tpl-meta').innerHTML = `${num(fill(c.template, vars).length)} characters${unknown.length ? ` · <span class="warn">Unknown: ${unknown.map((u) => `{${esc(u)}}`).join(', ')} will be sent as typed</span>` : ''}`;
  } else {
    const text = fill(c.template, vars);
    box.innerHTML = `<p class="bubble">${fillHtml(c.template, vars)}</p>`;
    document.getElementById('tpl-meta').innerHTML = `${text.length} characters · ${plural(segs(text), 'text segment')}${unknown.length ? ` · <span class="warn">Unknown: ${unknown.map((u) => `{${esc(u)}}`).join(', ')} will be sent as typed</span>` : ''}`;
  }
}
function refreshNode(flow, node) {
  const el = document.querySelector(`.node[data-node="${node.id}"]`);
  if (!el) return;
  el.querySelector('.node-sub').textContent = nodeSub(flow, node);
  el.querySelector('.node-flag').hidden = !cfg(flow, node).fail;
  el.querySelector('.node-edit').hidden = !isCustomized(flow, node);
  const note = document.getElementById('saved-note');
  if (note) note.textContent = isCustomized(flow, node) ? 'Customized · saved automatically' : 'Changes save automatically';
  const actionsBox = document.querySelector('.insp-actions');
  if (actionsBox && isCustomized(flow, node) && !actionsBox.querySelector('[data-action="reset-node"]')) actionsBox.insertAdjacentHTML('afterbegin', '<button type="button" class="btn btn-ghost btn-sm" data-action="reset-node">Reset</button>');
}
function openInspector(flow, id, { focus = true } = {}) {
  ui.selected = id;
  const panel = document.getElementById('inspector');
  if (!panel) return;
  panel.innerHTML = inspectorHtml(flow, nodeOf(flow, id));
  panel.hidden = false;
  document.querySelector('.bench')?.classList.add('has-insp');
  document.querySelectorAll('.node').forEach((n) => n.classList.toggle('is-selected', n.dataset.node === id));
  updatePreview(flow);
  if (focus) {
    panel.querySelector('#insp-title').focus({ preventScroll: true });
    if (panel.getBoundingClientRect().top > window.innerHeight - 140) panel.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
  }
}
function closeInspector() {
  const flow = currentFlow();
  const id = ui.selected;
  ui.selected = null;
  const panel = document.getElementById('inspector');
  if (panel) { panel.hidden = true; panel.innerHTML = ''; }
  document.querySelector('.bench')?.classList.remove('has-insp');
  document.querySelectorAll('.node').forEach((n) => n.classList.remove('is-selected'));
  if (flow && id) document.querySelector(`.node[data-node="${id}"]`)?.focus({ preventScroll: true });
}
function setOverride(flow, node, field, value) {
  state.overrides[flow.id] ||= {};
  const cur = { ...(state.overrides[flow.id][node.id] || {}), [field]: value };
  const def = { ...(node.settings || {}), fail: false };
  Object.keys(cur).forEach((k) => { if (cur[k] === def[k]) delete cur[k]; });
  if (Object.keys(cur).length) state.overrides[flow.id][node.id] = cur;
  else delete state.overrides[flow.id][node.id];
  save();
}
const currentFlow = () => { const m = (location.hash || '').match(/^#\/automations\/([^/?]+)/); return m ? flowOf(decodeURIComponent(m[1])) : null; };
function syncSimControls(flow) {
  const v = simValue(flow);
  document.querySelectorAll('[data-action="toggle-sim"]').forEach((b) => b.setAttribute('aria-checked', String(Boolean(v))));
  document.querySelectorAll('[data-change="set-sim"]').forEach((s) => { s.value = String(v); });
  const node = ui.selected && nodeOf(flow, ui.selected);
  const outcome = document.getElementById('outcome');
  if (outcome && node?.kind === 'condition') outcome.innerHTML = outcomeText(flow, node);
  updatePreview(flow);
}

function detail(ctx) {
  const flow = flowOf(ctx.params.id);
  if (!flow) return notFound(ctx);
  if (ui.flowId !== flow.id) { ui.selected = null; ui.flowId = flow.id; }
  const s = flowStats(flow);
  const mine = run?.flowId === flow.id;
  const branches = flow.nodes.filter((n) => n.kind === 'condition').length;
  const selected = ui.selected && nodeOf(flow, ui.selected);
  const html = `
  <div class="detail-head ${state.enabled[flow.id] ? '' : 'is-paused'}" data-flow-head="${flow.id}">
    <a class="back-link" href="#/automations">${icon('back')} Automations</a>
    <div class="dh-row">
      <div class="dh-title"><span class="fc-ico">${icon(flow.app)}</span><div><h1>${esc(flow.name)}</h1><p class="dh-chain">${chainHtml(flow)}</p></div></div>
      <div class="dh-actions">${flowPill(flow)}<span class="dh-switch"><span id="flow-sw-label">Active</span>${flowSwitch(flow)}</span></div>
    </div>
    <dl class="meta-row">
      <div><dt>Flow</dt><dd class="mono">${flow.id}</dd></div>
      <div><dt>Steps</dt><dd class="mono">${flow.nodes.length}${branches ? ` · ${plural(branches, 'branch', 'branches')}` : ''}</dd></div>
      <div><dt>Last run</dt><dd class="mono" data-ago="${s.last || Date.now()}">${s.last ? ago(s.last) : '—'}</dd></div>
      <div><dt>This week</dt><dd class="mono">${plural(s.week, 'run')}</dd></div>
      <div><dt>Saves</dt><dd class="mono">${flow.savedMin} min / run</dd></div>
    </dl>
  </div>
  <section class="builder" aria-label="Flow builder">
    <div class="toolbar">
      <div class="tb-sample"><span class="tb-label">Test data</span><span class="sample-chip mono">${esc(flow.sampleLine(makeCtx(flow).vars))}</span></div>
      <div class="tb-sim">${flow.sim ? simControl(flow, 'tb') : `<span class="tb-note">${icon('relay')} No branches in this flow</span>`}</div>
      <div class="tb-run"><p class="run-state" id="run-state">${runStateHtml(flow)}</p><div class="run-controls" id="run-controls">${runControlsHtml(flow)}</div></div>
    </div>
    ${canvasHtml(flow)}
    <p class="canvas-hint">Click any step to edit it · <kbd>R</kbd> runs a test · Tests use sample data and never send anything</p>
  </section>
  <div class="bench${selected ? ' has-insp' : ''}">
    <section class="panel insp" id="inspector" aria-label="Step settings"${selected ? '' : ' hidden'}></section>
    <section class="panel console" aria-labelledby="console-title">
      <header class="panel-head"><h2 id="console-title">Console</h2><span class="mono muted" id="run-id">${mine ? run.id : '—'}</span><span class="grow"></span><button type="button" class="btn btn-sm btn-ghost" data-action="clear-console">Clear</button></header>
      <div class="log" id="log" role="log" aria-label="Run log" tabindex="0">${mine && run.logs.length ? run.logs.map(logLineHtml).join('') : idleConsole(flow)}</div>
    </section>
    <section class="panel output" aria-labelledby="output-title">
      <header class="panel-head"><h2 id="output-title">Output</h2><span class="mono muted" id="art-count">${plural(mine ? run.artifacts.length : 0, 'artifact')}</span></header>
      <div class="artifacts" id="artifacts">${mine && run.artifacts.length ? [...run.artifacts].reverse().map(artifactHtml).join('') : idleOutput()}</div>
    </section>
  </div>`;
  return {
    title: `${flow.name} · RELAY`,
    html,
    mount: () => {
      layoutCanvas(flow);
      if (selected) openInspector(flow, selected.id, { focus: false });
      let frame = 0;
      const ro = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => layoutCanvas(flow)); });
      ro.observe(document.getElementById('canvas'));
      teardown = () => ro.disconnect();
      const box = document.getElementById('log');
      if (box) box.scrollTop = box.scrollHeight;
    },
  };
}

/* --------------------------------------------------------------------- runs */
const STATUS_FILTERS = [['all', 'All'], ['success', 'Succeeded'], ['waiting', 'Waiting'], ['recovered', 'Recovered'], ['failed', 'Failed']];
function runRow(r, fresh = false) {
  const flow = flowOf(r.flowId);
  const st = runStatus(r);
  return `<tr class="${fresh ? 'is-new' : ''}" data-action="open-run" data-id="${r.id}">
    <td data-label="Status">${statusPill(st)}</td>
    <td data-label="Run"><a class="run-link mono" href="#/runs/${r.id}">${r.id}</a>${r.test ? '<span class="tag">test</span>' : ''}</td>
    <td data-label="Automation"><span class="cell-flow">${icon(flow.app)}<span>${esc(flow.name)}</span></span></td>
    <td data-label="Trigger" class="cell-trigger">${esc(triggerText(r))}</td>
    <td data-label="Steps" class="mono">${doneSteps(r)}/${r.planned.length}</td>
    <td data-label="Duration" class="mono">${fmtMs(sum(r.stepMs))}</td>
    <td data-label="Started" class="cell-time"><span data-ago="${r.started}">${ago(r.started)}</span><small class="mono">${F.date.format(r.started)} · ${at(r.started)}</small></td>
  </tr>`;
}
function runsFiltered(flowF, statusF) {
  return allRuns().filter((r) => (flowF === 'all' || r.flowId === flowF) && (statusF === 'all' || runStatus(r) === statusF));
}
function runsView(ctx) {
  const flowF = flowOf(ctx.query.get('flow')) ? ctx.query.get('flow') : 'all';
  const statusF = STATUS_FILTERS.some(([k]) => k === ctx.query.get('status')) ? ctx.query.get('status') : 'all';
  const base = runsFiltered(flowF, 'all');
  const rows = runsFiltered(flowF, statusF);
  const shown = rows.slice(0, ui.runsLimit);
  const counts = Object.fromEntries(STATUS_FILTERS.map(([k]) => [k, k === 'all' ? base.length : base.filter((r) => runStatus(r) === k).length]));
  return {
    title: 'Runs · RELAY',
    html: `${pageHead({
      eyebrow: 'Runs',
      title: 'Every run, step by step',
      lede: 'Each time an automation fires, RELAY records what it did and how long it took. Open a run to see its timeline.',
      side: '<span class="sys-status"><span class="dot dot-live" aria-hidden="true"></span>New runs appear at the top</span>',
    })}
    <div class="filters" role="group" aria-label="Filter runs">
      <label class="select-wrap" for="f-flow"><span class="visually-hidden">Automation</span><select id="f-flow" data-change="filter-flow"><option value="all">All automations</option>${FLOWS.map((f) => `<option value="${f.id}"${f.id === flowF ? ' selected' : ''}>${esc(f.name)}</option>`).join('')}</select></label>
      <div class="seg" role="group" aria-label="Status">${STATUS_FILTERS.map(([k, label]) => `<button type="button" class="seg-btn" aria-pressed="${k === statusF}" data-action="filter-status" data-status="${k}">${label}<span class="seg-count mono" data-count="${k}">${counts[k]}</span></button>`).join('')}</div>
    </div>
    <div class="table-wrap">
      <table class="runs-table" data-flow="${flowF}" data-status="${statusF}">
        <caption class="visually-hidden">Recent runs, newest first</caption>
        <thead><tr><th scope="col">Status</th><th scope="col">Run</th><th scope="col">Automation</th><th scope="col">Trigger</th><th scope="col">Steps</th><th scope="col">Duration</th><th scope="col">Started</th></tr></thead>
        <tbody id="runs-body">${shown.length ? shown.map((r) => runRow(r)).join('') : '<tr class="empty-row"><td colspan="7">No runs match these filters.</td></tr>'}</tbody>
      </table>
    </div>
    ${rows.length > shown.length ? `<div class="more-row"><button type="button" class="btn btn-ghost" data-action="more-runs">Show ${Math.min(30, rows.length - shown.length)} more <span class="mono muted">${shown.length} of ${rows.length}</span></button></div>` : `<p class="table-foot mono">${plural(rows.length, 'run')} · showing the last 3 days</p>`}`,
  };
}
function insertRunRow(r) {
  const table = document.querySelector('.runs-table');
  const body = document.getElementById('runs-body');
  if (!table || !body) return;
  const { flow, status } = table.dataset;
  if ((flow !== 'all' && r.flowId !== flow) || (status !== 'all' && runStatus(r) !== status)) return;
  body.querySelector('.empty-row')?.remove();
  body.insertAdjacentHTML('afterbegin', runRow(r, true));
  const base = runsFiltered(flow, 'all');
  document.querySelectorAll('[data-count]').forEach((el) => { const k = el.dataset.count; el.textContent = k === 'all' ? base.length : base.filter((x) => runStatus(x) === k).length; });
}
function runDetail(ctx) {
  const r = runById(ctx.params.id);
  if (!r) return notFound(ctx);
  const flow = flowOf(r.flowId);
  const st = runStatus(r);
  const tl = timeline(r);
  const now = Date.now();
  const ordered = [...flow.nodes].sort((a, b) => a.col - b.col || a.lane - b.lane);
  const items = [];
  ordered.forEach((node) => {
    const idx = r.path.indexOf(node.id);
    if (idx < 0) {
      const reason = r.planned.includes(node.id) ? 'Not run · an earlier step failed' : 'Skipped · branch not taken';
      items.push(`<li class="tl-item st-skipped"><span class="tl-dot" aria-hidden="true"></span><div class="tl-main"><p class="tl-title"><span class="tl-ico">${icon(node.kind === 'condition' ? 'condition' : node.app)}</span><strong>${esc(node.title)}</strong><span class="tl-kind">${KIND[node.kind]}</span></p><p class="tl-note">${reason}</p></div><div class="tl-meta mono"><span>—</span></div></li>`);
      return;
    }
    const step = tl[idx];
    let cls = 'done';
    let note = esc(fill(node.note, r.vars));
    let extra = '';
    if (step.due > now) { cls = 'scheduled'; note = `Scheduled for ${F.date.format(step.start)} at ${at(step.start)}`; }
    else if (r.failAt === node.id && r.status === 'failed') { cls = 'failed'; note = 'Step failed · run stopped here'; extra = `<p class="tl-err mono">✕ ${esc(r.error || ERRORS[node.app] || ERRORS.relay)}</p><p class="tl-err mono">✕ 3 attempts · flagged for the office</p>`; }
    else if (r.failAt === node.id) { cls = 'recovered'; extra = `<p class="tl-warn mono">✕ ${esc((ERRORS[node.app] || ERRORS.relay).replace(/ \(.*\)$/, ''))} · attempt 1</p><p class="tl-warn mono">↻ retried after ${r.test ? 'a manual retry' : '2.0s backoff'} · succeeded</p>`; }
    if (node.kind === 'condition') {
      const branch = flow.decide(r.sim);
      note = `${esc(node.note)} → <b class="mono">${branch.toUpperCase()}</b>`;
      if (step.due > now) note = `Scheduled for ${F.date.format(step.start)} at ${at(step.start)}`;
    }
    const waitRow = step.wait ? `<li class="tl-wait"><span class="tl-dot" aria-hidden="true"></span><p class="mono">${step.due > now ? `Waiting ${span(step.wait)} · resumes ${ago(step.start)}` : `Waited ${span(step.wait)}`}</p></li>` : '';
    items.push(`${waitRow}<li class="tl-item st-${cls}"><span class="tl-dot" aria-hidden="true"></span><div class="tl-main"><p class="tl-title"><span class="tl-ico">${icon(node.kind === 'condition' ? 'condition' : node.app)}</span><strong>${esc(node.title)}</strong><span class="tl-kind">${KIND[node.kind]}</span></p><p class="tl-note">${note}</p>${extra}</div><div class="tl-meta mono"><span>${fmtOffset(step.start - r.started)}</span><span>${cls === 'scheduled' ? 'pending' : fmtMs(step.ms)}</span></div></li>`);
  });
  const simLine = flow.sim ? `<div><dt>${esc(flow.sim.label)}</dt><dd>${flow.sim.type === 'switch' ? (r.sim ? 'Yes' : 'No') : `${r.sim} stars`}</dd></div>` : '';
  return {
    title: `${r.id} · Runs · RELAY`,
    html: `<a class="back-link" href="#/runs">${icon('back')} All runs</a>
    <header class="page-head run-head"><div class="ph-main"><p class="eyebrow">${esc(flow.name)}</p><h1 class="mono">${r.id}</h1><p class="lede">${esc(triggerText(r))}</p></div><div class="ph-side">${statusPill(st)}<a class="btn btn-ghost" href="#/automations/${flow.id}">Open in builder ${icon('arrow')}</a></div></header>
    <dl class="run-meta">
      <div><dt>Automation</dt><dd><a href="#/automations/${flow.id}">${esc(flow.name)}</a></dd></div>
      <div><dt>Started</dt><dd>${F.date.format(r.started)} · ${F.clock.format(r.started)}</dd></div>
      <div><dt>Active time</dt><dd class="mono">${fmtMs(sum(r.stepMs))}</dd></div>
      <div><dt>Source</dt><dd>${r.test ? 'Test run in the builder' : 'Live trigger (simulated)'}</dd></div>
      <div><dt>Steps</dt><dd class="mono">${doneSteps(r)} of ${r.planned.length} run</dd></div>
      ${simLine}
    </dl>
    <div class="run-grid${r.test && r.logs?.length ? ' has-log' : ''}">
      <section class="card" aria-labelledby="tl-title"><header class="card-head"><div><h2 id="tl-title">Step timeline</h2><p class="card-sub">${st === 'waiting' ? 'This run is waiting for a scheduled step.' : r.test ? 'Test runs fast-forward waits.' : 'Offsets include scheduled waits.'}</p></div></header><ol class="timeline">${items.join('')}</ol></section>
      ${r.test && r.logs?.length ? `<section class="panel console" aria-labelledby="rl-title"><header class="panel-head"><h2 id="rl-title">Console output</h2></header><div class="log log-static" tabindex="0" role="log" aria-label="Recorded run log">${r.logs.map(logLineHtml).join('')}</div></section>` : ''}
    </div>`,
  };
}

/* ------------------------------------------------------------------ savings */
const SLIDERS = [
  ['leads', 'New web leads per week', 0, 120, 1, 'Quote requests from the website form', (v) => String(v)],
  ['missed', 'Missed calls per week', 0, 80, 1, 'Calls that ring out or hit a busy line', (v) => String(v)],
  ['jobs', 'Jobs completed per week', 0, 150, 1, 'Each one needs an invoice and a pay link', (v) => String(v)],
  ['minutes', 'Minutes each manual task takes', 1, 20, 1, 'Typing, texting, looking things up', (v) => `${v} min`],
  ['rate', 'Office staff cost per hour', 15, 60, 1, 'Wage plus taxes and overhead', (v) => money(v)],
];
function calcSavings(c) {
  const overdue = Math.round(c.jobs * 0.18);
  const rows = [
    ['Lead intake & text-back', c.leads * 3, 'Enter in the CRM, text back, follow up'],
    ['Missed-call follow-up', c.missed * 2, 'Text back and open a ticket'],
    ['Invoices & pay links', c.jobs * 2, 'Build the invoice, text the pay link'],
    ['Review requests', Math.round(c.jobs * 0.8), 'Ask happy customers for a review'],
    ['Payment reminders', overdue * 3, 'Day 3, day 7 and day 14 follow-ups'],
  ].map(([label, perWeek, what]) => ({ label, perWeek, what, hours: (perWeek * c.minutes * WEEKS_PER_MONTH) / 60 }));
  rows.push({ label: 'Morning dispatch texts', perWeek: 5, what: '30 min each weekday morning', hours: (5 * 30 * WEEKS_PER_MONTH) / 60 });
  const manual = sum(rows.map((r) => r.hours));
  const hours = manual * 0.9;
  return { rows, manual, hours, dollars: hours * c.rate, year: hours * c.rate * 12, fte: hours / 173, leadsMonth: Math.round(c.leads * WEEKS_PER_MONTH), perDayManual: (manual / WEEKS_PER_MONTH / 5) * 60, overdue };
}
function dayPlan(c, r) {
  const perDay = (n) => Math.max(0, Math.round(n / 5));
  const leads = perDay(c.leads); const missed = perDay(c.missed); const jobs = perDay(c.jobs);
  const before = [
    ['6:15 AM', 'Build routes and text each tech their schedule', 30],
    ['8:00 AM', `Return ${plural(missed, 'missed call')} from overnight and open tickets`, missed * 2 * c.minutes],
    ['9:30 AM', `Type ${plural(leads, 'web lead')} into the CRM and call them back`, leads * 3 * c.minutes, 'First reply takes 3 hr 12 min on average'],
    ['1:00 PM', `Write up ${plural(jobs, 'invoice')} from job sheets and text pay links`, jobs * 2 * c.minutes],
    ['3:30 PM', 'Chase overdue invoices by phone', Math.round(((r.overdue * 3) / 5) * c.minutes)],
    ['5:30 PM', 'Ask happy customers for reviews, when there’s time', Math.round(((c.jobs * 0.8) / 5) * c.minutes), 'Often skipped on busy days'],
  ];
  const after = [
    ['6:45 AM', 'Every tech already has their route by text'],
    ['Seconds', 'Missed callers get a booking link and a ticket opens itself'],
    ['38 sec', 'Each web lead is texted back, entered in the CRM and assigned'],
    ['Job close', 'The invoice and pay link go out before the truck leaves'],
    ['Day 3 · 7 · 14', 'Reminders go out on schedule; the office only makes day-14 calls'],
    ['2 hr later', 'Review requests go to 4- and 5-star customers only'],
  ];
  return { before, after, beforeMin: sum(before.map((b) => b[2])) };
}
const fteText = (pct) => (pct >= 99.5 ? `${(pct / 100).toFixed(1)} full-time office roles` : `${Math.round(pct)}% of a full-time office role`);
const hm = (min) => { const m = Math.round(min); const h = Math.floor(m / 60); return h ? `${h} hr ${pad2(m % 60)} min` : `${m} min`; };
function savingsView() {
  const c = state.calc;
  const r = calcSavings(c);
  const day = dayPlan(c, r);
  return {
    title: 'Savings · RELAY',
    html: `${pageHead({
      eyebrow: 'Savings',
      title: 'What automation is worth to the office',
      lede: 'Move the sliders to match a normal week. The math is simple and shown below, so you can check it against your own numbers.',
    })}
    <div class="sv-grid">
      <section class="card sliders-card" aria-labelledby="sl-title">
        <header class="card-head"><div><h2 id="sl-title">A normal week</h2><p class="card-sub">Starts at Ironwood’s averages</p></div><button type="button" class="btn btn-sm btn-ghost" data-action="calc-reset">Reset</button></header>
        <div class="sliders">${SLIDERS.map(([key, label, min, max, step, hint, fmt]) => `<div class="slider">
          <div class="slider-top"><label for="s-${key}">${label}</label><output class="mono" id="o-${key}" for="s-${key}">${fmt(c[key])}</output></div>
          <input type="range" id="s-${key}" min="${min}" max="${max}" step="${step}" value="${c[key]}" data-input="calc" data-key="${key}" aria-describedby="h-${key}" style="--p:${((c[key] - min) / (max - min)) * 100}%">
          <p class="slider-hint" id="h-${key}">${hint}</p>
        </div>`).join('')}</div>
      </section>
      <section class="card results-card" aria-labelledby="res-title">
        <header class="card-head"><div><h2 id="res-title">Every month with RELAY</h2><p class="card-sub">Assumes RELAY handles 90% of the work; people handle the exceptions</p></div></header>
        <div class="results" aria-live="polite">
          <div class="result big"><p class="r-label">Office hours saved</p><p class="r-value"><span id="r-hours" data-value="${r.hours}">${num(r.hours, 1)}</span><small>hr / month</small></p><p class="r-sub">About <span id="r-fte" data-value="${r.fte * 100}">${fteText(r.fte * 100)}</span></p></div>
          <div class="result"><p class="r-label">Staff cost saved</p><p class="r-value"><span id="r-dollars" data-value="${r.dollars}">${money(r.dollars)}</span><small>/ month</small></p><p class="r-sub"><span id="r-year" data-value="${r.year}">${money(r.year)}</span> a year</p></div>
          <div class="result"><p class="r-label">Faster lead response</p><p class="r-value">38<small>sec</small></p><p class="r-sub">Was <s>3 hr 12 min</s> · <span id="r-leads" data-value="${r.leadsMonth}">${num(r.leadsMonth)}</span> leads a month answered in under a minute</p></div>
        </div>
        <table class="breakdown">
          <caption>How the hours add up</caption>
          <thead><tr><th scope="col">Work RELAY takes over</th><th scope="col">Per week</th><th scope="col">Hours / month by hand</th></tr></thead>
          <tbody>${r.rows.map((row, i) => `<tr><th scope="row">${row.label}<small>${row.what}</small></th><td class="mono" id="b-w-${i}">${row.label.startsWith('Morning') ? '5 mornings' : plural(row.perWeek, 'task')}</td><td class="mono" id="b-h-${i}" data-value="${row.hours}">${num(row.hours, 1)}</td></tr>`).join('')}</tbody>
          <tfoot><tr><th scope="row">Total by hand</th><td></td><td class="mono" id="b-total" data-value="${r.manual}">${num(r.manual, 1)}</td></tr></tfoot>
        </table>
      </section>
    </div>
    <section class="card day-card" aria-labelledby="day-title">
      <header class="card-head"><div><h2 id="day-title">A day in the office</h2><p class="card-sub">Same workload, before and after RELAY</p></div></header>
      <div class="day-grid" id="day-grid">${dayGrid(day, c)}</div>
    </section>`,
  };
}
function dayGrid(day) {
  return `<div class="day-col day-before"><h3>Before · by hand</h3><ol>${day.before.map(([t, what, min, note]) => `<li><span class="d-time mono">${t}</span><span class="d-box" aria-hidden="true"></span><span class="d-what">${esc(what)}${note ? `<small>${esc(note)}</small>` : ''}</span><span class="d-min mono">${hm(min)}</span></li>`).join('')}</ol><p class="day-total">About <b class="mono">${hm(day.beforeMin)}</b> of office time a day</p></div>
    <div class="day-col day-after"><h3>After · with RELAY</h3><ol>${day.after.map(([t, what]) => `<li><span class="d-time mono">${t}</span><span class="d-check" aria-hidden="true">${icon('check')}</span><span class="d-what">${esc(what)}</span><span class="d-min mono">auto</span></li>`).join('')}</ol><p class="day-total">About <b class="mono">${hm(day.beforeMin * 0.1)}</b> a day checking exceptions</p></div>`;
}
function refreshSavings() {
  const c = state.calc;
  const r = calcSavings(c);
  tween(document.getElementById('r-hours'), r.hours, (v) => num(v, 1));
  tween(document.getElementById('r-fte'), r.fte * 100, fteText);
  tween(document.getElementById('r-dollars'), r.dollars, (v) => money(Math.round(v)));
  tween(document.getElementById('r-year'), r.year, (v) => money(Math.round(v)));
  tween(document.getElementById('r-leads'), r.leadsMonth, (v) => num(Math.round(v)));
  r.rows.forEach((row, i) => {
    const w = document.getElementById(`b-w-${i}`);
    if (w && !row.label.startsWith('Morning')) w.textContent = plural(row.perWeek, 'task');
    tween(document.getElementById(`b-h-${i}`), row.hours, (v) => num(v, 1));
  });
  tween(document.getElementById('b-total'), r.manual, (v) => num(v, 1));
  const grid = document.getElementById('day-grid');
  if (grid) grid.innerHTML = dayGrid(dayPlan(c, r));
}

/* ------------------------------------------------------------- integrations */
function integrationsView() {
  const now = Date.now();
  return {
    title: 'Integrations · RELAY',
    html: `${pageHead({
      eyebrow: 'Integrations',
      title: 'Connected to the tools Ironwood already uses',
      lede: 'RELAY sits between the website, phones, CRM and invoicing, and moves the work between them. No new software for the team to learn.',
    })}
    <p class="callout">${icon('lock')}<span><strong>Demo connections.</strong> In this demo every connection is simulated and nothing leaves your browser. In a real build, RELAY connects through each tool’s official API, with keys stored server-side.</span></p>
    <div class="int-grid">${INTEGRATIONS.map((app, i) => {
      const a = APPS[app];
      const last = state.syncs[app] || now - (18 + i * 37) * SEC;
      const used = FLOWS.filter((f) => f.nodes.some((n) => n.app === app));
      return `<article class="int-card">
        <header class="int-head"><span class="int-ico">${icon(app)}</span><div><h2>${a.name}</h2><span class="pill pill-lime">Connected (demo)</span></div></header>
        <p class="int-blurb">${a.blurb}</p>
        <dl class="int-meta">
          <div><dt>Last sync</dt><dd class="mono" data-ago="${last}" id="sync-${app}">${ago(last)}</dd></div>
          <div><dt>Today</dt><dd class="mono">${num(a.base + (state.live.apps[app] || 0))} ${a.unit}</dd></div>
        </dl>
        <div class="int-used"><p class="int-used-label">Used by ${plural(used.length, 'automation')}</p><p class="chips">${used.map((f) => `<a class="chip" href="#/automations/${f.id}">${esc(f.name)}</a>`).join('')}</p></div>
        <button type="button" class="btn btn-ghost btn-sm int-sync" data-action="sync" data-app="${app}">${icon('sync')} Sync now</button>
      </article>`;
    }).join('')}</div>`,
  };
}

/* ---------------------------------------------------------------------- 404 */
function notFound(ctx) {
  return {
    title: 'Not found · RELAY',
    html: `<section class="notfound">
      <p class="eyebrow">Error 404</p>
      <h1>Nothing lives at this address</h1>
      <pre class="code-block nf-code"><span class="j-num">GET</span> #${esc(ctx.path)}\n<span class="nf-err">→ 404 route_not_found</span></pre>
      <p class="lede">The page may have moved, or the link has a typo. Everything RELAY does is one click away from the overview.</p>
      <div class="nf-actions"><a class="btn btn-primary" href="#/">Go to overview ${icon('arrow')}</a><a class="btn btn-ghost" href="#/automations">View automations</a></div>
    </section>`,
  };
}

/* ------------------------------------------------------------------- router */
seedFeed();
const view = (fn) => (ctx) => { teardown?.(); teardown = null; return fn(ctx); };
const router = createRouter([
  ['/', view(overview)],
  ['/automations', view(automations)],
  ['/automations/:id', view(detail)],
  ['/runs', view(runsView)],
  ['/runs/:id', view(runDetail)],
  ['/savings', view(savingsView)],
  ['/integrations', view(integrationsView)],
], {
  notFound: view(notFound),
  afterRender: (ctx) => {
    document.getElementById('crumb-page').textContent = crumbFor(ctx);
    if (run?.active && ctx.path !== `/automations/${run.flowId}`) stopRun(true);
    updateSideStatus();
  },
});

function showShortcuts() {
  if (document.querySelector('dialog[open]')) return;
  const rows = [['1 – 5', 'Overview, Automations, Runs, Savings, Integrations'], ['R', 'Run a test (or retry a failed step) in the builder'], ['Esc', 'Close step settings'], ['?', 'Show this list']];
  modal(`<h2 id="kbd-title">Keyboard shortcuts</h2><dl class="kbd-list">${rows.map(([k, d]) => `<div><dt>${k.split(' – ').map((x) => `<kbd>${x}</kbd>`).join(' – ')}</dt><dd>${d}</dd></div>`).join('')}</dl><div class="bl-dialog-actions"><button type="button" class="bl-dialog-ok" data-close>Got it</button></div>`, { labelledBy: 'kbd-title' });
}

/* ------------------------------------------------------------------ actions */
actions({
  'toggle-flow': (button, event) => {
    event.preventDefault();
    event.stopPropagation();
    const flow = flowOf(button.dataset.id);
    state.enabled[flow.id] = !state.enabled[flow.id];
    save();
    syncFlowToggle(flow);
    toast(state.enabled[flow.id] ? `${flow.name} is active again.` : `${flow.name} paused. Its events stop in the live feed.`);
  },
  'feed-toggle': (button) => {
    state.feedPaused = !state.feedPaused;
    save();
    button.setAttribute('aria-pressed', String(state.feedPaused));
    button.innerHTML = state.feedPaused ? `${icon('play')} Resume` : `${icon('pause')} Pause`;
    const pill = document.getElementById('feed-pill');
    if (pill) { pill.className = `pill ${state.feedPaused ? 'pill-muted' : 'pill-lime is-live'}`; pill.textContent = state.feedPaused ? 'Paused' : 'Live'; }
    announce(state.feedPaused ? 'Live activity paused.' : 'Live activity resumed.');
  },
  'select-node': (button) => {
    const flow = currentFlow();
    if (!flow) return;
    if (ui.selected === button.dataset.node) { closeInspector(); return; }
    openInspector(flow, button.dataset.node);
  },
  'close-inspector': () => closeInspector(),
  'run-test': () => {
    const flow = currentFlow();
    if (!flow || run?.active) return;
    if (window.innerWidth < 760 && ui.selected) closeInspector();
    startRun(flow);
  },
  'stop-run': () => stopRun(),
  'retry-run': () => { if (run?.paused) run.resume?.(); },
  'clear-console': () => {
    const flow = currentFlow();
    if (run && !run.active && run.flowId === flow?.id) run.logs = [];
    const box = document.getElementById('log');
    if (box && !run?.active) box.innerHTML = idleConsole(flow);
  },
  'toggle-sim': () => {
    const flow = currentFlow();
    if (!flow?.sim) return;
    state.sims[flow.id] = !simValue(flow);
    save();
    syncSimControls(flow);
    if (run?.active && run.flowId === flow.id) toast('Saved. This applies to the next test run.');
  },
  'set-sim': (select) => {
    const flow = currentFlow();
    if (!flow?.sim) return;
    state.sims[flow.id] = select.value;
    save();
    syncSimControls(flow);
  },
  'edit-node': (el) => {
    const flow = currentFlow();
    const node = flow && ui.selected && nodeOf(flow, ui.selected);
    if (!node) return;
    const field = el.dataset.field;
    let value = el.value;
    const fieldBox = el.closest('.field');
    fieldBox.querySelector('.field-error')?.remove();
    el.removeAttribute('aria-invalid');
    el.removeAttribute('aria-describedby');
    const fail = (message) => {
      const p = Object.assign(document.createElement('p'), { className: 'field-error', id: `err-${field}`, textContent: message });
      (el.closest('.input-affix') || el).insertAdjacentElement('afterend', p);
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', p.id);
    };
    if (field === 'delay') {
      const [lo, hi] = delayRange(flow, node);
      const n = Number(value);
      if (value.trim() === '' || !Number.isInteger(n) || n < lo || n > hi) { fail(`Enter a whole number from ${lo} to ${hi}.`); return; }
      value = n;
    }
    if ((field === 'template' || field === 'subject') && !value.trim()) { fail(field === 'subject' ? 'Write a subject line, or reset the step.' : 'Write a message, or reset the step.'); return; }
    setOverride(flow, node, field, value);
    refreshNode(flow, node);
    updatePreview(flow);
  },
  'insert-var': (button) => {
    const field = document.getElementById(ui.lastField === 'subject' ? 'f-subject' : 'f-template') || document.getElementById('f-template');
    if (!field) return;
    const token = `{${button.dataset.var}}`;
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? field.value.length;
    field.value = `${field.value.slice(0, start)}${token}${field.value.slice(end)}`;
    field.focus();
    field.setSelectionRange(start + token.length, start + token.length);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  },
  'toggle-fail': (button) => {
    const flow = currentFlow();
    const node = flow && ui.selected && nodeOf(flow, ui.selected);
    if (!node) return;
    const next = !cfg(flow, node).fail;
    setOverride(flow, node, 'fail', next);
    button.setAttribute('aria-checked', String(next));
    refreshNode(flow, node);
    toast(next ? `“${node.title}” will fail on the next test run.` : 'Failure simulation off.');
  },
  'reset-node': () => {
    const flow = currentFlow();
    const node = flow && ui.selected && nodeOf(flow, ui.selected);
    if (!node) return;
    if (state.overrides[flow.id]) delete state.overrides[flow.id][node.id];
    save();
    openInspector(flow, node.id);
    refreshNode(flow, node);
    toast('Step reset to Ironwood’s default settings.');
  },
  'open-run': (row, event) => {
    if (event.target.closest('a, button')) return;
    router.go(`#/runs/${row.dataset.id}`);
  },
  'filter-flow': (select) => {
    ui.runsLimit = 30;
    const status = document.querySelector('.runs-table')?.dataset.status || 'all';
    router.go(`#/runs?${new URLSearchParams({ ...(select.value !== 'all' ? { flow: select.value } : {}), ...(status !== 'all' ? { status } : {}) })}`.replace(/\?$/, ''), { replace: true });
  },
  'filter-status': (button) => {
    ui.runsLimit = 30;
    const flow = document.querySelector('.runs-table')?.dataset.flow || 'all';
    const status = button.dataset.status;
    router.go(`#/runs?${new URLSearchParams({ ...(flow !== 'all' ? { flow } : {}), ...(status !== 'all' ? { status } : {}) })}`.replace(/\?$/, ''), { replace: true });
  },
  'more-runs': () => { ui.runsLimit += 30; router.render({ keepScroll: true }); },
  calc: (input) => {
    const key = input.dataset.key;
    const def = SLIDERS.find((s) => s[0] === key);
    state.calc[key] = Number(input.value);
    input.style.setProperty('--p', `${((state.calc[key] - def[2]) / (def[3] - def[2])) * 100}%`);
    document.getElementById(`o-${key}`).textContent = def[6](state.calc[key]);
    save();
    refreshSavings();
  },
  'calc-reset': () => {
    state.calc = defaults().calc;
    save();
    SLIDERS.forEach(([key, , min, max, , , fmt]) => {
      const input = document.getElementById(`s-${key}`);
      input.value = state.calc[key];
      input.style.setProperty('--p', `${((state.calc[key] - min) / (max - min)) * 100}%`);
      document.getElementById(`o-${key}`).textContent = fmt(state.calc[key]);
    });
    refreshSavings();
    toast('Back to Ironwood’s averages.');
  },
  sync: async (button) => {
    if (button.disabled) return;
    const app = button.dataset.app;
    button.disabled = true;
    button.classList.add('is-syncing');
    button.innerHTML = `${icon('sync')} Syncing…`;
    await sleep(900);
    state.syncs[app] = Date.now();
    save();
    const el = document.getElementById(`sync-${app}`);
    if (el) { el.dataset.ago = state.syncs[app]; el.textContent = ago(state.syncs[app]); }
    if (button.isConnected) { button.disabled = false; button.classList.remove('is-syncing'); button.innerHTML = `${icon('sync')} Sync now`; }
    toast(`${APPS[app].name} synced (demo). Nothing left your browser.`);
  },
  shortcuts: () => showShortcuts(),
});

document.addEventListener('focusin', (event) => {
  if (event.target.id === 'f-subject') ui.lastField = 'subject';
  if (event.target.id === 'f-template') ui.lastField = 'template';
});
document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target;
  if (target.closest?.('input, textarea, select, [contenteditable="true"]')) {
    if (event.key === 'Escape' && target.closest('#inspector')) { event.preventDefault(); closeInspector(); }
    return;
  }
  if (document.querySelector('dialog[open]')) return;
  const nav = { 1: '#/', 2: '#/automations', 3: '#/runs', 4: '#/savings', 5: '#/integrations' };
  if (nav[event.key]) { event.preventDefault(); router.go(nav[event.key]); return; }
  if (event.key === '?') { event.preventDefault(); showShortcuts(); return; }
  const flow = currentFlow();
  if (flow && (event.key === 'r' || event.key === 'R')) {
    event.preventDefault();
    if (run?.active && run.paused && run.flowId === flow.id) run.resume?.();
    else if (!run?.active) startRun(flow);
    return;
  }
  if (event.key === 'Escape' && ui.selected) { event.preventDefault(); closeInspector(); }
});

/* --------------------------------------------------------------------- boot */
// The sticky sidebar is as tall as the viewport minus whatever part of the demo notice is still visible.
let barPx = -1;
function syncBar() {
  const h = document.querySelector('.bl-demo-bar')?.offsetHeight || 0;
  const px = Math.max(0, Math.round(h - window.scrollY));
  if (px !== barPx) { barPx = px; document.documentElement.style.setProperty('--bar', `${px}px`); }
}
addEventListener('scroll', syncBar, { passive: true });
addEventListener('resize', syncBar);
syncBar();
tickClock();
updateSideStatus();
setInterval(tickClock, 1000);
setInterval(refreshAgo, 10000);
scheduleTick(2600);
