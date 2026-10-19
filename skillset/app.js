// SKILLSET — demo app by Blue Lotus Coding. A scripted, side-by-side comparison of a generic chatbot and an
// assistant that runs on a business's own skills. Every answer here is pre-written; no AI model runs on this page.
const { esc, router: createRouter, validate, toast, modal, storage, actions, demoBar, formatDate, addDays, addBusinessDays, inPreview } = Kit;
demoBar('SKILLSET', 'app');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const CANCELLED = Symbol('cancelled');
const CONTACT = 'https://bluelotuscoding.com/contact';

/* ------------------------------------------------------------------ icons */
const ICONS = {
  tag: '<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.2 6.2a1.4 1.4 0 0 1-2 0z"/><circle cx="8.2" cy="8.2" r="1.4"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  pin: '<path d="M12 21s-7-6.1-7-11.4a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.6" r="2.5"/>',
  chat: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.6 3.6c-.4.3-1 0-1-.5V16H5.5A1.5 1.5 0 0 1 4 14.5z"/>',
  shield: '<path d="M12 3l7.5 3v5.6c0 4.5-3.2 8.1-7.5 9.4-4.3-1.3-7.5-4.9-7.5-9.4V6z"/><path d="M8.8 12.2l2.2 2.2 4.3-4.4"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.6-3.3 3-5.2 6-5.2s5.4 1.9 6 5.2"/><circle cx="17" cy="9.2" r="2.4"/><path d="M16.6 14.3c2.4.3 4 1.9 4.4 4.6"/>',
  scale: '<path d="M12 4v16M7 20h10M5 7.5h14M12 4.5l-7 3M12 4.5l7 3"/><path d="M5 7.5l-2.5 6a2.5 2.5 0 0 0 5 0zM19 7.5l-2.5 6a2.5 2.5 0 0 0 5 0z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16" rx="2.5"/><path d="M9 3.5h6v3H9zM8.5 11.5h7M8.5 15.5h5"/>',
  receipt: '<path d="M6 3.5h12v17l-2.2-1.4-2 1.4-1.8-1.4-1.8 1.4-2-1.4L6 20.5z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
  briefcase: '<rect x="3.5" y="7" width="17" height="12.5" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17"/>',
  badge: '<circle cx="12" cy="10" r="5.5"/><path d="M8.5 14.5L7 21l5-2.5 5 2.5-1.5-6.5"/>',
  sparkle: '<path d="M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9L12 18.5l-1.9-5.6L4.5 11l5.6-1.9z"/><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  undo: '<path d="M8 8H4V4"/><path d="M4.5 8a8 8 0 1 1-1 5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>',
  forward: '<path d="M14 5l6 6-6 6"/><path d="M20 11H10a6 6 0 0 0-6 6v1"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  layers: '<path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z"/><path d="M3.5 12l8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5"/>',
  bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
  hand: '<path d="M8 12.5V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7.5c0 4-2.6 7-6.5 7-2.6 0-4.1-1.3-5.4-3.4L3.4 13.3a1.5 1.5 0 0 1 2.5-1.6L8 14.2"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1.1"/><circle cx="4.8" cy="12" r="1.1"/><circle cx="4.8" cy="17.5" r="1.1"/>',
};
const icon = (name, cls = '') => `<svg class="ico${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

/* ------------------------------------------------------------------ dates and times */
// All three businesses are in Birmingham, so scripted answers use Birmingham wall-clock time wherever the visitor is.
const birminghamParts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
const birminghamTime = (timestamp) => {
  const p = Object.fromEntries(birminghamParts.formatToParts(timestamp).map(({ type, value }) => [type, Number(value)]));
  return new Date(p.year, p.month - 1, p.day, p.hour % 24, p.minute);
};
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const at = (d, h, m = 0) => { const x = new Date(d); x.setHours(h, m, 0, 0); return x; };
const h12 = (h) => (Math.floor(h) % 12) || 12;
const clock = (h) => {
  const whole = Math.floor(h);
  const min = Math.round((h - whole) * 60);
  return `${h12(whole)}${min ? `:${String(min).padStart(2, '0')}` : ''} ${whole >= 12 ? 'PM' : 'AM'}`;
};
// Arrival windows read like "8–10 AM", "10 AM–12 PM" and "12–4 PM".
const span = ([s, e]) => ((s >= 12) === (e >= 12) ? `${h12(s)}–${h12(e)} ${e >= 12 ? 'PM' : 'AM'}` : `${clock(s)}–${clock(e)}`);
const shortDay = (d) => formatDate(d, { weekday: 'short', month: 'short', day: 'numeric' });
const longDay = (d) => formatDate(d, { weekday: 'long', month: 'long', day: 'numeric' });
const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 864e5);
const relDay = (d, now) => { const n = daysBetween(now, d); return n === 0 ? 'today' : n === 1 ? 'tomorrow' : shortDay(d); };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Ironwood: Mon–Fri 8–10, 10–12, 12–2, 2–4, 4–6; Sat 8–12, 12–4; same-day when booked before 2 PM.
const IW_WINDOWS = { weekday: [[8, 10], [10, 12], [12, 14], [14, 16], [16, 18]], saturday: [[8, 12], [12, 16]] };
const windowsOn = (d) => (d.getDay() === 0 ? [] : d.getDay() === 6 ? IW_WINDOWS.saturday : IW_WINDOWS.weekday);
function nextWindow(now) {
  const today = startOfDay(now);
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour < 14) {
    const w = windowsOn(today).find(([s]) => s >= hour + 0.5);
    if (w) return { date: today, w, sameDay: true };
  }
  for (let i = 1; i <= 7; i += 1) {
    const d = addDays(today, i);
    if (windowsOn(d).length) return { date: d, w: windowsOn(d)[0], sameDay: false };
  }
  return { date: addDays(today, 1), w: [8, 10], sameDay: false };
}
function nextSaturday(now) {
  const today = startOfDay(now);
  let add = (6 - today.getDay() + 7) % 7;
  if (add === 0 && now.getHours() >= 7) add = 7;
  return addDays(today, add);
}
const slotPhrase = (slot, now) => `${relDay(slot.date, now)}, ${span(slot.w)}`;

// Hale & Whitaker: consultations offered on the next business day.
const consultDay = (now) => addBusinessDays(startOfDay(now), 1);

// Luna: Mon–Thu 11–9, Fri–Sat 11–10, Sun 11–8; last delivery orders 30 minutes before close.
const LUNA_HOURS = [[11, 20], [11, 21], [11, 21], [11, 21], [11, 21], [11, 22], [11, 22]];
function lunaToday(now) {
  const [open, close] = LUNA_HOURS[now.getDay()];
  const hour = now.getHours() + now.getMinutes() / 60;
  const last = close - 0.5;
  if (hour < open) return `We open at **${clock(open)}** today and take delivery orders until **${clock(last)}**.`;
  if (hour < last) return `Today we’re open until **${clock(close)}**, and the last delivery orders go in at **${clock(last)}**.`;
  if (hour < close) return `Delivery orders for today closed at **${clock(last)}**, 30 minutes before close, but we’re open until **${clock(close)}**.`;
  const [nextOpen, nextClose] = LUNA_HOURS[(now.getDay() + 1) % 7];
  return `We’re closed for the night. Tomorrow we open at **${clock(nextOpen)}** and take delivery orders until **${clock(nextClose - 0.5)}**.`;
}
// Catering needs 48 hours' notice. "This Friday" is checked against a noon serving time.
function lunaCatering(now) {
  const today = startOfDay(now);
  const friday = at(addDays(today, (5 - today.getDay() + 7) % 7), 12);
  const hours = (friday - now) / 36e5;
  if (hours >= 48) return { ok: true, friday, date: friday, hours: Math.floor(hours) };
  let d = addDays(startOfDay(friday), 1);
  while ((at(d, 12) - now) / 36e5 < 48) d = addDays(d, 1);
  return { ok: false, friday, date: at(d, 12), hours: Math.floor(hours) };
}

/* ------------------------------------------------------------------ the three businesses */
// Scripts are written as small markup strings: **bold**, *italic* and [[skill]] for a citation chip.
// Each skilled answer is a list of segments tagged with the skills they need; a segment whose skill is
// switched off is dropped or replaced by its generic `alt`, so every combination still reads as one answer.
const ALT = {
  iwPrice: { p: 'Our office will confirm pricing once a technician has looked at it.', key: 'price', bounce: 1 },
  iwArea: { p: 'Our office will confirm whether your address is in our service area.', key: 'area', bounce: 1 },
  hwLater: { p: 'Our office can set up a consultation whenever you’re ready.', key: 'schedule', bounce: 0 },
  hwFees: { p: 'Our office will quote the fee at your consultation.', key: 'fees', bounce: 1 },
};

const BIZ = {
  ironwood: {
    id: 'ironwood', name: 'Ironwood Plumbing & Air', short: 'Ironwood', possessive: 'Ironwood’s', team: 'Ironwood team',
    kind: 'Plumbing & HVAC', glyph: 'IW', assistant: 'Ironwood assistant', demo: '../ironwood/',
    blurb: 'Family-owned plumbing, heating and cooling in Birmingham since 2004. Phones answered 24/7.',
    placeholder: 'e.g. How much does a new water heater cost?',
    examples: ['Water heater dripping in the garage', 'Do you service Hoover? What does a tune-up cost?', 'Any weekend appointments on Saturday?', 'Is the club membership worth the money?'],
    skills: [
      {
        id: 'pricing', name: 'Pricing sheet', icon: 'tag', slug: 'pricing-sheet', summary: 'Upfront flat-rate prices. The price is agreed before any work starts.',
        knows: ['Diagnostic visit $89, credited toward the repair', 'After-hours emergency dispatch $149', 'Drain clearing from $149 · Toilet repair from $129 · Leak repair from $179', 'Faucet replacement from $189, plus the fixture', 'Water heater flush $129 · Water heater repair from $189', 'Water heater replacement, installed: 40-gal gas from $1,650 · 50-gal from $1,850 · Tankless from $3,900', 'AC tune-up $99 · Furnace tune-up $99 · AC or furnace repair from $189', 'New AC system from $5,900', 'Ironwood Club $14.95/month: spring AC and fall furnace tune-ups, yearly plumbing inspection with water heater flush, 15% off repairs, no after-hours fee, priority scheduling'],
        rules: ['Quote only prices on this sheet, and say “from” for repairs.', 'Job not listed? Offer the $89 diagnostic visit.'],
        can: ['Start an Ironwood Club enrollment'],
      },
      {
        id: 'scheduling', name: 'Scheduling', icon: 'calendar', slug: 'scheduling', summary: 'Arrival windows, same-day rules and which technician to send.',
        knows: ['Mon–Fri arrival windows: 8–10, 10–12, 12–2, 2–4, 4–6', 'Saturday arrival windows: 8–12, 12–4', 'Same-day service when booked before 2 PM, subject to availability', '24/7 emergency service at (205) 555-0148', 'Marcus Bell: plumbing, 11 years', 'Dana Whitfield: HVAC, NATE-certified, 9 years', 'Luis Ortega: water heaters and gas lines, 17 years'],
        rules: ['Send the technician who specializes in the job.', 'Hold the earliest open window; the customer confirms it.'],
        can: ['Hold an arrival window', 'Assign a technician'],
      },
      {
        id: 'area', name: 'Service area', icon: 'pin', slug: 'service-area', summary: 'Where Ironwood’s trucks go.',
        knows: ['Birmingham, Homewood, Mountain Brook, Vestavia Hills, Hoover and Pelham', 'ZIPs 35124, 35203, 35205, 35209, 35213, 35216, 35222, 35223, 35226, 35242, 35243, 35244'],
        rules: ['Outside the area? Say so plainly and pass the request to the office.'],
        can: [],
      },
      {
        id: 'voice', name: 'Brand voice', icon: 'chat', slug: 'brand-voice', summary: 'How Ironwood sounds on the phone.',
        knows: ['Family-owned in Birmingham since 2004'],
        rules: ['Calm, neighborly and plain-spoken. No jargon.', 'Safety first, then price, then the next step.', 'Never upsell during an emergency.'],
        can: [],
      },
      {
        id: 'sop', name: 'SOPs & policies', icon: 'shield', slug: 'sops-policies', summary: 'Safety steps and the promises Ironwood makes.',
        knows: ['Water heater leak: turn off the cold-water supply valve on top of the heater, or the home’s main shutoff', 'Gas heater: turn the gas control to OFF. Electric heater: switch off the breaker', 'Move valuables away from the water', 'Smell gas? Leave the house and call the gas company’s emergency line or 911 from outside', 'Licensed, insured, background-checked technicians', '1-year labor warranty on repairs'],
        rules: ['Give safety steps before anything else.', 'Gas smell or flooding: flag it for the on-call technician.'],
        can: ['Flag an emergency for the on-call technician'],
      },
    ],
    scenarios: [
      {
        id: 'leak', prompt: 'My water heater is leaking all over the garage floor, what do I do?',
        keywords: [['water heater', 4], ['leak', 3], ['garage', 1], ['hot water', 2], ['=tank', 1], ['flood', 2], ['puddle', 2], ['drip', 2], ['burst', 2]],
        genericBounce: 2, possible: 1,
        generic: [
          { p: 'I’m sorry you’re dealing with that! A leaking water heater can have several causes, such as a loose connection, a faulty pressure relief valve or a corroded tank.' },
          { p: 'Here are a few general tips:' },
          { ul: ['Try to figure out where the water is coming from.', 'If it seems safe, you could turn off the water supply.', 'Use towels or a bucket to limit water damage.'] },
          { p: 'It’s a good idea to have a licensed plumber take a look. Repair costs vary a lot depending on the problem, so I can’t give you a price.' },
          { p: 'I’m not able to book appointments, but the business should be able to help if you contact them directly.' },
        ],
        skilled: [
          { need: ['voice'], p: 'Let’s get that under control, one step at a time.[[voice]]', alt: { p: 'Here is what to do.' } },
          {
            need: ['sop'], facts: 4,
            ol: [
              '**Shut off the water.** Turn the cold-water supply valve on top of the heater to off, or use your home’s main shutoff.[[sop]]',
              '**Cut the power.** On a gas heater, turn the gas control to OFF. On an electric heater, switch off its breaker.[[sop]]',
              '**Move valuables** and anything stored on the floor away from the water.[[sop]]',
              '**If you smell gas,** leave the house and call the gas company’s emergency line or 911 from outside.[[sop]]',
            ],
            alt: { p: 'Please keep people and pets away from the water. A member of our team will walk you through shutting the heater down safely.', key: 'safety', bounce: 1 },
          },
          {
            need: ['pricing'], facts: 5,
            p: 'What it usually costs: **water heater repair starts at $189**. If the tank itself has failed, a **40-gallon gas replacement starts at $1,650 installed** (50-gallon from $1,850). The **$89 diagnostic visit is credited toward the repair**, and you approve the flat price before any work starts.[[pricing]]',
            alt: ALT.iwPrice,
          },
          {
            need: ['scheduling'], facts: (c) => (c.slot.sameDay ? 4 : 5) + (!c.slot.sameDay && c.on('pricing') ? 1 : 0),
            p: (c) => {
              const s = c.slot;
              const who = '**Luis Ortega**, our water heater and gas line specialist (17 years)';
              const lead = s.sameDay
                ? `It’s before 2 PM, so we can still come **today**. I’m holding the **${span(s.w)}** arrival window with ${who}.`
                : `${c.now.getDay() === 0 ? 'We don’t have regular arrival windows on Sundays' : 'Same-day visits need to be booked before 2 PM'}, so I’m holding the first open window, **${slotPhrase(s, c.now)}**, with ${who}.`;
              const phone = s.sameDay
                ? ' If you can’t stop the water before then, call **(205) 555-0148**. We answer 24/7.'
                : ` If you can’t stop the water, call **(205) 555-0148**. We answer 24/7 and can send an emergency technician right away${c.on('pricing') ? ' (after-hours dispatch is $149)' : ''}.`;
              return `${lead}${phone}[[scheduling]]${!s.sameDay && c.on('pricing') ? '[[pricing]]' : ''}`;
            },
            alt: { p: 'Someone from our office will call you to set up a visit.', key: 'schedule', bounce: 1 },
          },
        ],
        actions: [{
          kind: 'hold', counter: 'hold', prefix: 'IW-H', need: ['scheduling'],
          build: (c) => ({
            title: `Held: ${cap(slotPhrase(c.slot, c.now))} arrival window with Luis Ortega`, ask: true,
            short: `${slotPhrase(c.slot, c.now)} with Luis Ortega`,
            detail: `Water heater leak · ${c.on('pricing') ? '$89 diagnostic, credited toward the repair' : 'price confirmed by the office'}`,
          }),
        }],
      },
      {
        id: 'tuneup', prompt: 'How much is an AC tune-up and do you come to Hoover?',
        keywords: [['tune up', 3], ['tuneup', 3], ['=ac', 2], ['air condition', 2], ['hoover', 3], ['service area', 2], ['maintenance', 1], ['=hvac', 1], ['cooling', 1]],
        genericBounce: 2, possible: 1,
        generic: [
          { p: 'AC tune-up prices vary by company and region, and some companies run seasonal specials, so it’s hard to say what this one charges.' },
          { p: 'A typical tune-up includes cleaning the coils, checking refrigerant levels, inspecting the filter and testing the thermostat.' },
          { p: 'As for Hoover, service areas differ from company to company. I’d recommend checking the business’s website or calling them to confirm they serve your address.' },
        ],
        skilled: [
          { need: ['voice'], p: 'Thanks for checking with us. Here’s the short version.[[voice]]', alt: { p: 'Here is the information you asked for.' } },
          { need: ['area'], facts: 2, p: '**Yes, we come to Hoover.** Our service area covers Birmingham, Homewood, Mountain Brook, Vestavia Hills, Hoover and Pelham.[[area]]', alt: ALT.iwArea },
          { need: ['pricing'], facts: 3, p: 'An **AC tune-up is a flat $99**, agreed before we start. If you’d like both seasons covered, the **Ironwood Club ($14.95/month)** includes a spring AC tune-up and a fall furnace tune-up.[[pricing]]', alt: { ...ALT.iwPrice, p: 'Our office will confirm pricing before any work starts.' } },
          {
            need: ['scheduling'], facts: 3,
            p: (c) => `The next open window is **${slotPhrase(c.slot, c.now)}** with **Dana Whitfield**, our NATE-certified HVAC technician (9 years). I’m holding it for you.[[scheduling]]`,
            alt: { p: 'If you’d like a visit, our office can find you a time.', key: 'schedule', bounce: 0 },
          },
        ],
        actions: [{
          kind: 'hold', counter: 'hold', prefix: 'IW-H', need: ['scheduling'],
          build: (c) => ({
            title: `Held: ${cap(slotPhrase(c.slot, c.now))} with Dana Whitfield`, ask: true,
            short: `${slotPhrase(c.slot, c.now)} with Dana Whitfield`,
            detail: `AC tune-up · ${c.on('pricing') ? '$99 flat' : 'price confirmed by the office'} · ${c.on('area') ? 'Hoover is in our service area' : 'service address to be confirmed'}`,
          }),
        }],
      },
      {
        id: 'saturday', prompt: 'Can someone come Saturday morning?',
        keywords: [['saturday', 3], ['weekend', 2], ['morning', 1], ['appointment', 1], ['availab', 1], ['=sat', 2]],
        genericBounce: 1, possible: 1,
        generic: [
          { p: 'Many home service companies offer weekend appointments, but availability depends on their schedule and staffing.' },
          { p: 'Some charge extra for Saturday visits, so you may want to ask about any additional fees.' },
          { p: 'I don’t have access to this company’s calendar, so I’d suggest calling the business to see if they have a Saturday morning opening.' },
        ],
        skilled: [
          { need: ['voice'], p: 'Happy to help. Saturday works well for a lot of our customers.[[voice]]', alt: { p: 'Here is what I can tell you.' } },
          {
            need: ['scheduling'], facts: 2,
            p: (c) => `Our Saturday arrival windows are **8 AM–12 PM** and **12–4 PM**. I’m holding **${shortDay(c.sat)}, 8 AM–12 PM** for you.[[scheduling]]`,
            alt: { p: 'Our office will call you to check Saturday availability.', key: 'schedule', bounce: 1 },
          },
          { need: ['scheduling'], facts: 3, p: 'What’s the job? We’ll send the right specialist: **Marcus Bell** for plumbing, **Dana Whitfield** for heating and cooling, or **Luis Ortega** for water heaters and gas lines.[[scheduling]]' },
          { need: ['pricing'], facts: 2, p: 'Every visit starts with an upfront price: the **$89 diagnostic visit is credited toward the repair**, and you approve the flat rate before any work starts.[[pricing]]' },
          { need: ['area'], facts: 1, p: 'Just confirm your address. We cover Birmingham, Homewood, Mountain Brook, Vestavia Hills, Hoover and Pelham.[[area]]' },
          { need: ['sop'], facts: 2, p: 'Every technician is licensed, insured and background-checked, and repairs carry a **1-year labor warranty**.[[sop]]' },
        ],
        actions: [{
          kind: 'hold', counter: 'hold', prefix: 'IW-H', need: ['scheduling'],
          build: (c) => ({
            title: `Held: ${shortDay(c.sat)}, 8 AM–12 PM arrival window`, ask: true,
            short: `${shortDay(c.sat)}, 8 AM–12 PM`,
            detail: `Technician assigned once you tell us the job${c.on('pricing') ? ' · $89 diagnostic, credited toward the repair' : ''}`,
          }),
        }],
      },
      {
        id: 'club', prompt: 'Is the Ironwood Club worth it?',
        keywords: [['ironwood club', 4], ['=club', 3], ['membership', 3], ['member', 2], ['worth', 2], ['maintenance plan', 2], ['=plan', 1]],
        genericBounce: 1, possible: 1,
        generic: [
          { p: 'Maintenance memberships can be worth it, depending on how often you’d use the included services and how old your equipment is.' },
          { p: 'Plans like this often include seasonal tune-ups, repair discounts and priority service. To decide, compare the yearly cost with what you’d normally spend on maintenance.' },
          { p: 'I don’t have details about this particular plan, so I’d recommend contacting the company for pricing and what’s included.' },
        ],
        skilled: [
          { need: ['voice'], p: 'Honest answer: it depends on whether you’d keep up with yearly maintenance anyway.[[voice]]', alt: { p: 'Here is a summary.' } },
          {
            need: ['pricing'], facts: 4,
            caption: 'One year of membership, at our regular prices:[[pricing]]',
            rows: [['Spring AC tune-up', '$99.00'], ['Fall furnace tune-up', '$99.00'], ['Plumbing inspection with water heater flush', '$129.00'], ['Membership, 12 × $14.95', '−$179.40']],
            total: ['You come out ahead by', '$147.60'],
            alt: { p: 'Our office can walk you through membership pricing and what it includes.', key: 'price', bounce: 1 },
          },
          { need: ['pricing'], facts: 4, p: 'Members also get **15% off repairs** (a $189 AC repair becomes $160.65), **no after-hours fee** (normally $149 for an emergency dispatch) and **priority scheduling**.[[pricing]]' },
          { need: ['voice'], p: 'If you’d rather call only when something breaks, that’s fine too. No pressure either way.[[voice]]' },
          { need: ['scheduling'], facts: 1, p: (c) => `If you join, I can put your first visit, a **${c.season === 'spring' ? 'spring AC tune-up' : 'fall furnace tune-up'}**, on the calendar with **Dana Whitfield**, our HVAC technician.[[scheduling]]` },
        ],
        actions: [{
          kind: 'club', counter: 'club', prefix: 'IW-CLUB', need: ['pricing'],
          build: (c) => ({
            title: 'Ironwood Club enrollment ready: $14.95/month',
            detail: c.on('scheduling') ? `First visit: ${c.season === 'spring' ? 'spring AC' : 'fall furnace'} tune-up with Dana Whitfield · 15% off repairs from day one` : 'Spring AC and fall furnace tune-ups, yearly plumbing inspection with flush, 15% off repairs',
          }),
        }],
      },
    ],
  },

  hale: {
    id: 'hale', name: 'Hale & Whitaker', short: 'Hale & Whitaker', possessive: 'Hale & Whitaker’s', team: 'Hale & Whitaker team',
    kind: 'Law firm', glyph: 'HW', assistant: 'Hale & Whitaker assistant', demo: '../hale/',
    blurb: 'Hale & Whitaker, Attorneys at Law: a Birmingham firm founded in 1998 for injury, workers’ comp, family law and estate planning.',
    placeholder: 'e.g. Someone hit my car and their insurance keeps calling',
    examples: ['The other driver’s insurance adjuster keeps calling', 'What does a will cost?', '¿Hablan español?', 'Cost of an uncontested divorce'],
    skills: [
      {
        id: 'fees', name: 'Fee schedule', icon: 'tag', slug: 'fee-schedule', summary: 'What each kind of matter costs, stated exactly.',
        knows: ['Free 30-minute initial consultation, in the office, by phone or by video', 'Personal injury and workers’ comp: contingency fee of 33⅓% if resolved before a lawsuit is filed, 40% if a lawsuit is filed', 'No attorney’s fee unless we recover money for you', 'Uncontested divorce: $1,500 flat fee', 'Other family law matters: hourly, quoted at the consultation', 'Estate planning flat fees: will package $650, revocable trust package $2,400'],
        rules: ['State fees exactly as written. Never estimate what a case is worth.'],
        can: [],
      },
      {
        id: 'intake', name: 'Intake & scheduling', icon: 'calendar', slug: 'intake-scheduling', summary: 'Office hours, meeting options and how new matters are opened.',
        knows: ['Office hours Mon–Fri 8:30 AM–5:30 PM', 'After-hours callback for new injury cases', 'Suite 400, Birmingham, AL 35203 · (205) 555-0132', 'Consultations in the office, by phone or by video'],
        rules: ['Collect name, phone, matter type and the other party’s name for a conflict check.'],
        can: ['Create a consultation request', 'Request an after-hours callback'],
      },
      {
        id: 'directory', name: 'Attorney directory', icon: 'users', slug: 'attorney-directory', summary: 'Who handles what.',
        knows: ['Catherine Hale: founding partner, personal injury, 25+ years', 'Thomas Whitaker: founding partner, estate planning & probate', 'Amara Okafor: partner, family law', 'Daniel Reyes: associate, workers’ comp & personal injury, speaks Spanish'],
        rules: ['Route each matter to the attorney who handles that practice area.'],
        can: [],
      },
      {
        id: 'compliance', name: 'Compliance language', icon: 'scale', slug: 'compliance-language', summary: 'Required notices, and the only legal information the assistant may share.',
        knows: ['“Information on this site is not legal advice. Contacting us does not create an attorney-client relationship.”', '“Past results do not guarantee a similar outcome.”', '“Attorney advertising.”', 'Approved general information: Alabama personal injury claims generally must be filed within 2 years of the injury', 'Approved general information: you don’t have to give the other driver’s insurer a recorded statement; speak with a lawyer first'],
        rules: ['Frame legal topics as general information, not legal advice.', 'Never predict outcomes or case values.', 'Anything specific goes to an attorney.'],
        can: [],
      },
      {
        id: 'voice', name: 'Firm voice', icon: 'chat', slug: 'firm-voice', summary: 'How the firm speaks to people on a hard day.',
        knows: ['Founded in Birmingham in 1998'],
        rules: ['Composed, reassuring, plain English. No legalese.', 'Acknowledge the stress first, then give the facts.', 'Offer to continue in Spanish when it helps.'],
        can: [],
      },
    ],
    scenarios: [
      {
        id: 'accident', prompt: 'I was rear-ended last week and the other driver’s insurance keeps calling me.',
        keywords: [['rear ended', 4], ['accident', 3], ['wreck', 3], ['crash', 2], ['insurance', 2], ['adjuster', 2], ['other driver', 2], ['recorded statement', 3], ['injur', 2], ['=hit', 1], ['whiplash', 2]],
        genericBounce: 1, possible: 1,
        generic: [
          { p: 'I’m sorry to hear about your accident. It’s common for the other driver’s insurance company to reach out after a crash.' },
          { p: 'You may want to be careful about what you say to them, since statements can sometimes affect a claim. Laws and deadlines vary by state, so I can’t tell you what applies to your situation.' },
          { p: 'It’s usually a good idea to consult a personal injury lawyer, and fee arrangements vary between firms. I’d recommend contacting a local law firm directly.' },
        ],
        skilled: [
          { need: ['voice'], p: 'I’m sorry. Being rear-ended is stressful enough without the phone calls.[[voice]]', alt: { p: 'Thank you for reaching out.' } },
          { need: ['compliance'], facts: 1, note: 'General information, not legal advice. Contacting us does not create an attorney-client relationship.[[compliance]]' },
          {
            need: ['compliance'], facts: 1,
            p: '**You don’t have to give the other driver’s insurance company a recorded statement.** It’s generally wise to speak with a lawyer before you do.[[compliance]]',
            alt: { p: 'One of our attorneys can talk with you about how to handle the insurance company’s calls and any deadlines.', key: 'legal', bounce: 1 },
          },
          { need: ['compliance'], facts: 1, p: 'In Alabama, personal injury claims generally must be filed **within 2 years of the injury**.[[compliance]]' },
          { need: ['fees'], facts: 4, p: 'Your first **30-minute consultation is free**, in our office, by phone or by video. Car accident cases are handled on contingency: **33⅓% if resolved before a lawsuit is filed, 40% if a lawsuit is filed**, and **no attorney’s fee unless we recover money for you**.[[fees]]' },
          { need: ['directory'], facts: 1, p: '**Catherine Hale**, our founding partner, has handled personal injury cases for more than 25 years.[[directory]]' },
          {
            need: ['intake'], facts: 1,
            p: (c) => `I’ve requested a consultation for **${shortDay(c.consult)} at 2:30 PM**. Our intake team will call to confirm and run a quick conflict check.[[intake]]`,
            alt: ALT.hwLater,
          },
        ],
        actions: [{
          kind: 'consult', counter: 'consult', prefix: 'HW-C', need: ['intake'],
          build: (c) => ({
            title: `Consultation request created with ${c.on('directory') ? 'Catherine Hale' : 'a personal injury attorney'}, ${shortDay(c.consult)}, 2:30 PM`,
            detail: `Car accident · ${c.on('fees') ? 'Free 30-minute consultation' : 'Consultation'} by phone, video or in the office`,
          }),
        }],
      },
      {
        id: 'will', prompt: 'How much does a simple will cost?',
        keywords: [['simple will', 4], ['=a will', 3], ['=my will', 3], ['=wills', 3], ['=will cost', 3], ['=will', 1], ['estate plan', 3], ['=trust', 2], ['probate', 3], ['power of attorney', 3], ['testament', 3]],
        genericBounce: 1, possible: 1,
        generic: [
          { p: 'The cost of a simple will depends on where you live, how complex your situation is and who prepares it.' },
          { p: 'Online will services are often the least expensive option. Attorneys may charge a flat fee or bill by the hour, and prices can differ quite a bit.' },
          { p: 'For an accurate price, I’d suggest contacting an estate planning attorney in your area and asking for a quote.' },
        ],
        skilled: [
          { need: ['voice'], p: 'Happy to give you a straight answer.[[voice]]', alt: { p: 'Here is the information you asked for.' } },
          { need: ['fees'], facts: 2, p: 'Our **will package is a flat fee of $650**. If you’re also weighing a trust, the **revocable trust package is $2,400**, also a flat fee.[[fees]]', alt: ALT.hwFees },
          { need: ['directory'], facts: 1, p: '**Thomas Whitaker**, one of our founding partners, leads our estate planning and probate work.[[directory]]' },
          { need: ['fees'], facts: 1, p: 'The first **30-minute consultation is free**, in our office, by phone or by video.[[fees]]' },
          { need: ['intake'], facts: 1, p: (c) => `I’ve requested a consultation for **${shortDay(c.consult)} at 10:00 AM**. Our intake team will call to confirm.[[intake]]`, alt: ALT.hwLater },
          { need: ['compliance'], facts: 1, note: 'Information here is not legal advice. Contacting us does not create an attorney-client relationship.[[compliance]]' },
        ],
        actions: [{
          kind: 'consult', counter: 'consult', prefix: 'HW-C', need: ['intake'],
          build: (c) => ({
            title: `Consultation request created with ${c.on('directory') ? 'Thomas Whitaker' : 'an estate planning attorney'}, ${shortDay(c.consult)}, 10:00 AM`,
            detail: `Estate planning${c.on('fees') ? ' · Will package, $650 flat fee' : ''} · by phone, video or in the office`,
          }),
        }],
      },
      {
        id: 'spanish', prompt: 'Do you have anyone who speaks Spanish?',
        keywords: [['spanish', 4], ['español', 4], ['espanol', 4], ['habla', 3], ['bilingual', 3], ['interpret', 2], ['translat', 2], ['language', 1]],
        genericBounce: 1, possible: 1,
        generic: [
          { p: 'Many law firms have bilingual attorneys or staff, and some can arrange an interpreter if needed.' },
          { p: 'I don’t have information about the attorneys at this firm or the languages they speak. I’d recommend calling the office and asking whether someone can help you in Spanish.' },
        ],
        skilled: [
          { need: ['voice'], p: 'Thank you for asking. We want you to be comfortable talking with us.[[voice]]', alt: { p: 'Here is the answer.' } },
          {
            need: ['directory'], facts: 2,
            p: '**Yes. Daniel Reyes speaks Spanish.** He’s an associate on our workers’ compensation and personal injury team.[[directory]]',
            alt: { p: 'I’ll ask our office to confirm which attorney can meet with you in Spanish.', key: 'lang', bounce: 1 },
          },
          { need: ['intake'], facts: 2, p: 'You can meet at our office, **Suite 400, Birmingham, AL 35203**, or by phone or video, **Monday–Friday, 8:30 AM–5:30 PM**.[[intake]]' },
          { need: ['fees'], facts: 1, p: 'The first **30-minute consultation is free**.[[fees]]' },
          { need: ['intake', 'directory'], facts: 1, p: (c) => `I’ve requested a consultation with Daniel for **${shortDay(c.consult)} at 9:00 AM**.[[intake]]` },
          { need: ['voice'], p: '*Si prefiere, podemos continuar en español.*[[voice]]' },
        ],
        actions: [{
          kind: 'consult', counter: 'consult', prefix: 'HW-C', need: ['intake', 'directory'],
          build: (c) => ({
            title: `Consultation request created with Daniel Reyes, ${shortDay(c.consult)}, 9:00 AM`,
            detail: 'Consultation in Spanish · by phone, video or in the office',
          }),
        }],
      },
      {
        id: 'divorce', prompt: 'What does an uncontested divorce cost?',
        keywords: [['divorce', 4], ['uncontested', 4], ['separat', 2], ['custody', 2], ['child support', 2], ['family law', 3]],
        genericBounce: 1, possible: 1,
        generic: [
          { p: 'The cost of an uncontested divorce varies by state and by attorney. Some lawyers offer a flat fee for uncontested cases, while others bill hourly.' },
          { p: 'There may also be court filing fees, and costs can rise if you and your spouse disagree on things like property or custody.' },
          { p: 'I’d recommend contacting a family law attorney near you for a quote.' },
        ],
        skilled: [
          { need: ['voice'], p: 'I know this can be a hard season, so we keep things clear.[[voice]]', alt: { p: 'Here is the information you asked for.' } },
          { need: ['fees'], facts: 1, p: 'An **uncontested divorce is a flat fee of $1,500**.[[fees]]', alt: ALT.hwFees },
          { need: ['fees'], facts: 1, p: 'If something turns into a dispute, such as custody or child support, those family law matters are **billed hourly, with the rate quoted at your consultation**.[[fees]]' },
          { need: ['directory'], facts: 1, p: '**Amara Okafor**, our family law partner, handles these cases.[[directory]]' },
          { need: ['fees'], facts: 1, p: 'The first **30-minute consultation is free**, in our office, by phone or by video.[[fees]]' },
          { need: ['intake'], facts: 1, p: (c) => `I’ve requested a consultation for **${shortDay(c.consult)} at 11:30 AM**. Our intake team will call to confirm.[[intake]]`, alt: ALT.hwLater },
          { need: ['compliance'], facts: 1, note: 'This is general information, not legal advice. Contacting us does not create an attorney-client relationship.[[compliance]]' },
        ],
        actions: [{
          kind: 'consult', counter: 'consult', prefix: 'HW-C', need: ['intake'],
          build: (c) => ({
            title: `Consultation request created with ${c.on('directory') ? 'Amara Okafor' : 'a family law attorney'}, ${shortDay(c.consult)}, 11:30 AM`,
            detail: `Uncontested divorce${c.on('fees') ? ' · $1,500 flat fee' : ''} · by phone, video or in the office`,
          }),
        }],
      },
    ],
  },

  luna: {
    id: 'luna', name: 'Luna Taquería', short: 'Luna', possessive: 'Luna’s', team: 'Luna team',
    kind: 'Taquería', glyph: 'LT', assistant: 'Luna assistant', demo: '../luna/',
    blurb: 'Neighborhood taquería in Avondale with family recipes and tortillas pressed in-house every morning.',
    placeholder: 'e.g. Do you deliver to 35209?',
    examples: ['Can you cater a party for 40?', 'Do you deliver to Homewood, 35209?', 'Is anything gluten-free?', 'Sunday closing time?'],
    skills: [
      {
        id: 'menu', name: 'Menu & prices', icon: 'tag', slug: 'menu-prices', summary: 'Every dish, every price and what’s in it.',
        knows: ['Tacos al pastor, 3 for $12.50 · Birria tacos, 3 for $14.50', 'Baja fish tacos (beer-battered cod), 2 for $12.00', 'Burrito bowl $13.00: grilled chicken, al pastor or cauliflower al pastor included; carne asada +$2', 'Chips & guacamole $8.50 · Elote, 2 for $6.50 · Agua fresca $4.00 · Churros $6.50', 'Any taco plate can be made with cauliflower al pastor (vegan) at no charge', 'Beans are cooked without lard (vegan) · Corn tortillas are gluten-free', 'Tortillas pressed in-house every morning · Sales tax 10%'],
        rules: ['Only describe dishes that are on the menu.'],
        can: [],
      },
      {
        id: 'catering', name: 'Catering policy', icon: 'clipboard', slug: 'catering-policy', summary: 'Packages, minimums and the notice the kitchen needs.',
        knows: ['48 hours’ notice required', 'Taco Bar $15 per person, minimum 15 guests: 2 proteins, tortillas, rice, beans, three salsas, toppings', 'Fiesta Spread $19 per person, minimum 15 guests: 3 proteins, chips & guac, elote, agua fresca', 'Vegan cauliflower al pastor can be one of the proteins in either package', 'Free delivery and setup within 5 miles on catering orders over $300'],
        rules: ['Check the 48-hour notice against the event date before quoting.', 'Recommend the package that fits the budget.'],
        can: ['Create a catering quote'],
      },
      {
        id: 'zones', name: 'Delivery zones', icon: 'pin', slug: 'delivery-zones', summary: 'Where Luna delivers, how long it takes and what it costs.',
        knows: ['Delivery ZIPs 35203, 35204, 35205, 35206, 35209, 35212, 35222, 35233, 35234', 'Delivery 30–45 minutes · Pickup ready in 15–20 minutes', 'Delivery fee $3.99, free on orders of $40 or more before tax', '$15 order minimum for delivery', 'Optional tip for the driver; no other fees'],
        rules: ['Outside these ZIPs? Offer pickup.'],
        can: [],
      },
      {
        id: 'hours', name: 'Hours', icon: 'clock', slug: 'hours', summary: 'When the doors are open and when delivery stops.',
        knows: ['Mon–Thu 11 AM–9 PM', 'Fri–Sat 11 AM–10 PM', 'Sun 11 AM–8 PM', 'Last delivery orders 30 minutes before close', 'Avondale, Birmingham · (205) 555-0119'],
        rules: ['Answer with today’s real hours first.'],
        can: [],
      },
      {
        id: 'voice', name: 'Brand voice', icon: 'chat', slug: 'brand-voice', summary: 'How Luna sounds: family-run and friendly.',
        knows: ['Family recipes from a neighborhood taquería in Avondale'],
        rules: ['Warm and upbeat, short sentences, a little Spanish where it fits.', 'Allergy questions: give the facts and invite a note on the order.', 'Never pushy.'],
        can: [],
      },
    ],
    scenarios: [
      {
        id: 'catering', prompt: 'I need catering for 40 people this Friday, a few are vegan, budget is about $600.',
        keywords: [['cater', 4], ['taco bar', 4], ['fiesta spread', 4], ['party', 2], ['event', 2], ['guests', 2], ['budget', 2], ['people', 1], ['office lunch', 2], ['=feed', 1], ['vegan', 1], ['friday', 1]],
        genericBounce: 2, possible: 1,
        generic: [
          { p: 'That sounds like a fun event! For 40 people on a $600 budget, you’re looking at about $15 per person, which is doable for a taco-style buffet at many restaurants.' },
          { p: 'Be sure to ask about vegan options, since not every restaurant offers them. Many caterers also need advance notice, so check availability for Friday as soon as you can.' },
          { p: 'I can’t see this restaurant’s menu or place orders, but they should be able to help if you contact them directly.' },
        ],
        skilled: [
          { need: ['voice'], p: '¡Claro! We’d love to feed your crew.[[voice]]', alt: { p: 'Here is what I can tell you.' } },
          {
            need: ['catering'], facts: 1,
            p: (c) => {
              const k = c.cat;
              if (k.ok) return `Catering needs **48 hours’ notice**. Assuming a noon serving on ${longDay(k.friday)}, that’s **${k.hours} hours away**, so you’re in time.[[catering]]`;
              const why = k.hours > 0 ? `a noon serving on ${longDay(k.friday)} is only **${k.hours} hours away**` : `it’s already past noon on ${longDay(k.friday)}`;
              return `Catering needs **48 hours’ notice**, and ${why}, so we can’t make Friday. **${longDay(k.date)}** works, so I’ve built the quote for then.[[catering]]`;
            },
            alt: { p: 'Our catering team will get back to you with packages, pricing and availability for Friday.', key: 'cater', bounce: 2 },
          },
          { need: ['catering'], facts: 3, p: 'The **Taco Bar is $15 per person**, so 40 guests comes to **$600.00**, right on budget. It includes 2 proteins, tortillas, rice, beans, three salsas and toppings. (The Fiesta Spread, at $19 per person, would be $760.)[[catering]]' },
          { need: ['catering'], facts: 1, p: 'For your vegan guests, make one of the two proteins our **vegan cauliflower al pastor**.[[catering]]' },
          {
            need: ['menu'], facts: (c) => (c.on('catering') ? 1 : 2),
            p: (c) => (c.on('catering') ? 'Our **beans are cooked without lard**, so they’re vegan too.[[menu]]' : 'Good news for your vegan guests: our **cauliflower al pastor** is vegan, and our **beans are cooked without lard**.[[menu]]'),
          },
          { need: ['catering'], facts: 1, p: 'Because the order is over $300, **delivery and setup are free** within 5 miles of our Avondale kitchen.[[catering]]' },
        ],
        actions: [{
          kind: 'quote', counter: 'quote', prefix: 'LUNA-Q', need: ['catering'],
          build: (c, ref) => ({
            title: `Quote ${ref || 'LUNA-Q'}: Taco Bar for 40 guests, $600.00`,
            detail: `${shortDay(c.cat.date)}, 12:00 PM · Cauliflower al pastor (vegan) + 1 more protein · Free delivery & setup within 5 miles${c.on('menu') ? ' · Before 10% sales tax' : ''}`,
          }),
        }],
      },
      {
        id: 'delivery', prompt: 'Do you deliver to 35209?',
        keywords: [['deliver', 3], ['35209', 4], ['#zip', 2], ['=zip', 2], ['homewood', 1], ['delivery fee', 2]],
        genericBounce: 1, possible: 0,
        generic: [
          { p: 'Delivery areas depend on the restaurant and the delivery service it uses. You can usually check by entering your address on the restaurant’s website or in a delivery app.' },
          { p: 'I don’t have information about this restaurant’s delivery zone, so I’d recommend contacting them directly.' },
        ],
        skilled: [
          { need: ['voice'], p: '¡Hola! Thanks for checking.[[voice]]' },
          { need: ['zones'], facts: 2, p: '**Yes, 35209 is in our delivery zone.** Delivery usually takes **30–45 minutes**.[[zones]]', alt: { p: 'Our team will confirm whether we deliver to 35209.', key: 'zone', bounce: 1 } },
          { need: ['zones'], facts: 3, p: 'The delivery fee is **$3.99, free on orders of $40 or more** before tax, with a **$15 minimum**. No other fees.[[zones]]' },
          { need: ['hours'], facts: 2, p: (c) => `${lunaToday(c.now)}[[hours]]` },
          { need: ['zones'], facts: 1, p: 'Nearby? **Pickup is ready in 15–20 minutes.**[[zones]]' },
          { need: ['voice'], p: 'Our tortillas are pressed in-house every morning, so every order starts fresh.[[voice]]' },
        ],
        actions: [],
      },
      {
        id: 'gluten', prompt: 'Are your corn tortillas gluten-free?',
        keywords: [['gluten', 4], ['celiac', 3], ['coeliac', 3], ['tortilla', 2], ['=corn', 2], ['wheat', 2], ['allerg', 2]],
        genericBounce: 1, possible: 0,
        generic: [
          { p: 'Corn tortillas are usually made from corn masa, which is naturally gluten-free. Some brands add wheat flour, though, and cross-contact can happen in restaurant kitchens.' },
          { p: 'If you have celiac disease or a gluten sensitivity, I’d recommend asking the restaurant directly how their tortillas are made.' },
        ],
        skilled: [
          { need: ['voice'], p: 'Great question. We get it a lot.[[voice]]' },
          { need: ['menu'], facts: 2, p: '**Yes, our corn tortillas are gluten-free.** We press them in-house every morning.[[menu]]', alt: { p: 'I’ll ask our kitchen to confirm which items are gluten-free.', key: 'menu', bounce: 1 } },
          { need: ['menu'], facts: 1, p: 'One heads-up: our **Baja fish tacos are beer-battered**, so they aren’t a gluten-free pick.[[menu]]' },
          { need: ['voice'], p: 'If it’s an allergy, add a note to your order so the kitchen can take extra care.[[voice]]' },
        ],
        actions: [],
      },
      {
        id: 'sunday', prompt: 'What time do you close on Sunday?',
        keywords: [['sunday', 4], ['close', 2], ['closing', 2], ['=hours', 3], ['what time', 2], ['=open', 2]],
        genericBounce: 1, possible: 0,
        generic: [
          { p: 'Restaurant hours vary, and many places close earlier on Sundays and holidays.' },
          { p: 'I don’t have this restaurant’s hours, so I’d suggest checking their website or Google listing, or calling ahead to confirm.' },
        ],
        skilled: [
          { need: ['voice'], p: '¡Hola! Thanks for asking.[[voice]]' },
          { need: ['hours'], facts: 2, p: 'On **Sunday we’re open 11 AM–8 PM**, so we close at 8. **Last delivery orders go in at 7:30 PM**, 30 minutes before close.[[hours]]', alt: { p: 'Our team will confirm our Sunday hours.', key: 'hours', bounce: 1 } },
          { need: ['hours'], facts: 2, p: 'The rest of the week: **Monday–Thursday 11 AM–9 PM** and **Friday–Saturday 11 AM–10 PM**.[[hours]]' },
          { need: ['hours', 'zones'], facts: 1, p: 'Cutting it close? **Pickup is ready in 15–20 minutes.**[[zones]]' },
          { need: ['voice'], p: 'Come hungry. The tortillas are pressed fresh every morning, Sundays included.[[voice]]' },
        ],
        actions: [],
      },
    ],
  },
};
const BIZ_IDS = Object.keys(BIZ);
const findScenario = (bizId, id) => BIZ[bizId].scenarios.find((s) => s.id === id) || null;
const skillOf = (biz, id) => biz.skills.find((s) => s.id === id);

/* ------------------------------------------------------------------ state */
const KEY = 'skillset-state-v1';
function defaults() {
  return {
    biz: 'ironwood',
    skills: Object.fromEntries(BIZ_IDS.map((b) => [b, Object.fromEntries(BIZ[b].skills.map((s) => [s.id, true]))])),
    selected: Object.fromEntries(BIZ_IDS.map((b) => [b, BIZ[b].scenarios[0].id])),
    results: {},
    counters: { hold: 5530, quote: 1041, consult: 2186, club: 310 },
    pane: 'skilled',
    try: {},
  };
}
const state = (() => {
  const base = defaults();
  const saved = storage.get(KEY, null);
  if (!saved || typeof saved !== 'object') return base;
  const merged = { ...base, ...saved };
  merged.skills = Object.fromEntries(BIZ_IDS.map((b) => [b, { ...base.skills[b], ...(saved.skills?.[b] || {}) }]));
  merged.selected = { ...base.selected, ...(saved.selected || {}) };
  merged.counters = { ...base.counters, ...(saved.counters || {}) };
  merged.results = saved.results && typeof saved.results === 'object' ? saved.results : {};
  merged.try = saved.try && typeof saved.try === 'object' ? saved.try : {};
  if (!BIZ[merged.biz]) merged.biz = 'ironwood';
  if (!['generic', 'skilled'].includes(merged.pane)) merged.pane = 'skilled';
  BIZ_IDS.forEach((b) => { if (!findScenario(b, merged.selected[b])) merged.selected[b] = base.selected[b]; });
  return merged;
})();
const save = () => storage.set(KEY, state);
const nextRef = (counter, prefix) => { state.counters[counter] = (state.counters[counter] || 1000) + 1; return `${prefix}-${state.counters[counter]}`; };

/* ------------------------------------------------------------------ composing answers */
const BLOCK_KEYS = ['p', 'ol', 'ul', 'note', 'rows'];
const val = (v, c) => (typeof v === 'function' ? v(c) : v);
function blockOf(o, c) {
  const type = BLOCK_KEYS.find((k) => o[k] !== undefined);
  if (!type) return null;
  const content = val(o[type], c);
  return content == null ? null : { type, content, caption: val(o.caption, c), total: val(o.total, c) };
}
function makeCtx(skills, now) {
  return {
    now, on: (id) => !!skills[id],
    slot: nextWindow(now), sat: nextSaturday(now), consult: consultDay(now), cat: lunaCatering(now),
    season: now.getMonth() >= 2 && now.getMonth() <= 7 ? 'spring' : 'fall',
  };
}
function compose(biz, sc, skills, now, refs = []) {
  const c = makeCtx(skills, now);
  const has = (need = []) => need.every((id) => skills[id]);
  const blocks = [];
  const alts = new Map();
  const used = [];
  let facts = 0;
  const use = (need = []) => need.forEach((id) => { if (!used.includes(id)) used.push(id); });
  for (const seg of sc.skilled) {
    if (has(seg.need)) {
      const block = blockOf(seg, c);
      if (block) { blocks.push(block); facts += val(seg.facts, c) || 0; use(seg.need); }
    } else if (seg.alt) {
      const key = seg.alt.key || seg.alt.p;
      if (!alts.has(key)) { alts.set(key, seg.alt.bounce || 0); blocks.push(blockOf(seg.alt, c)); }
    }
  }
  const bounced = [...alts.values()].reduce((sum, n) => sum + n, 0);
  if (bounced) blocks.push({ type: 'handoff', content: `I’ve passed your question to the ${biz.team} so a person can follow up.` });
  const acts = (sc.actions || []).filter((a) => has(a.need)).map((a, i) => {
    use(a.need);
    return { kind: a.kind, counter: a.counter, prefix: a.prefix, ref: refs[i] || '', ...a.build(c, refs[i] || '') };
  });
  const time = 1 + 6 * bounced + 5 * Math.max(0, (sc.possible || 0) - acts.length);
  return { blocks, actions: acts, used, metrics: { facts, actions: acts.length, bounced, time } };
}
const genericMetrics = (sc) => ({ facts: 0, actions: 0, bounced: sc.genericBounce, time: 1 + 6 * sc.genericBounce + 5 * (sc.possible || 0) });

/* ------------------------------------------------------------------ keyword matching for "Try your own" */
const MATCH_MIN = 3;
const normalize = (s) => ` ${String(s).toLowerCase().normalize('NFC').replace(/[’'`]/g, '').replace(/[^a-z0-9áéíóúñü$\s]+/g, ' ').replace(/\s+/g, ' ').trim()} `;
function scoreScenario(text, sc) {
  let score = 0;
  const terms = [];
  for (const [term, weight] of sc.keywords) {
    let hit = false;
    if (term === '#zip') hit = /\s35\d{3}\s/.test(text);
    else if (term.startsWith('=')) hit = text.includes(` ${normalize(term.slice(1)).trim()} `);
    else hit = text.includes(` ${normalize(term).trim()}`);
    if (hit) { score += weight; terms.push(term === '#zip' ? 'a ZIP code' : term.replace(/^=/, '')); }
  }
  // Show "a will" rather than "a will, will" when one keyword contains another.
  return { score, terms: terms.filter((t, i) => !terms.some((o, j) => j !== i && o !== t && o.includes(t))) };
}
function bestIn(bizId, text) {
  return BIZ[bizId].scenarios.map((sc) => ({ biz: bizId, sc, ...scoreScenario(text, sc) })).sort((a, b) => b.score - a.score)[0];
}
function matchQuestion(bizId, query) {
  const text = normalize(query);
  const best = bestIn(bizId, text);
  if (best.score >= MATCH_MIN) return { match: { scenarioId: best.sc.id, terms: best.terms }, suggest: null };
  const other = BIZ_IDS.filter((b) => b !== bizId).map((b) => bestIn(b, text)).sort((a, b) => b.score - a.score)[0];
  return { match: null, suggest: other && other.score >= MATCH_MIN ? { biz: other.biz, scenarioId: other.sc.id } : null };
}

/* ------------------------------------------------------------------ markup -> DOM */
const el = (tag, className = '') => { const node = document.createElement(tag); if (className) node.className = className; return node; };
function parseInline(str) {
  const parts = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[\[(\w+)\]\]/g;
  let last = 0;
  let m;
  while ((m = re.exec(str))) {
    if (m.index > last) parts.push({ t: str.slice(last, m.index) });
    if (m[1] !== undefined) parts.push({ b: m[1] });
    else if (m[2] !== undefined) parts.push({ i: m[2] });
    else parts.push({ chip: m[3] });
    last = re.lastIndex;
  }
  if (last < str.length) parts.push({ t: str.slice(last) });
  return parts;
}
const plain = (str) => String(str).replace(/\*\*|\*|\[\[\w+\]\]/g, '');
function countWords(blocks) {
  let n = 0;
  const add = (s) => { n += (plain(s).match(/\S+/g) || []).length; };
  blocks.forEach((b) => {
    if (Array.isArray(b.content)) b.content.forEach((item) => (Array.isArray(item) ? item.forEach(add) : add(item)));
    else add(b.content);
    if (b.caption) add(b.caption);
  });
  return n;
}
function chipEl(biz, id, { stat = false } = {}) {
  const skill = skillOf(biz, id);
  const node = el(stat ? 'span' : 'button', `cite${stat ? ' is-static' : ''}`);
  if (!stat) {
    node.type = 'button';
    node.dataset.action = 'open-skill';
    node.dataset.skill = id;
    node.setAttribute('aria-label', `Source: ${skill.name}. Show what this skill contains.`);
  }
  node.innerHTML = `${icon(skill.icon)}<span>${esc(skill.name)}</span>`;
  return node;
}
function makeWriter(o) {
  const caret = el('span', 'caret');
  caret.setAttribute('aria-hidden', 'true');
  async function inline(parent, str) {
    for (const part of parseInline(str)) {
      caret.remove();
      if (part.chip) {
        parent.append(chipEl(o.biz, part.chip));
        if (o.animate) { parent.append(caret); await o.pause(110); }
        continue;
      }
      const text = part.b ?? part.i ?? part.t;
      let target = parent;
      if (part.b !== undefined || part.i !== undefined) { target = el(part.b !== undefined ? 'strong' : 'em'); parent.append(target); }
      if (!o.animate) { target.append(text); continue; }
      const node = document.createTextNode('');
      target.append(node);
      parent.append(caret);
      for (const token of text.match(/\s*\S+\s*/g) || [text]) { node.data += token; await o.pause(o.delay); }
    }
  }
  async function block(container, b) {
    if (b.type === 'ol' || b.type === 'ul') {
      const list = el(b.type);
      container.append(list);
      for (const item of b.content) { const li = el('li'); list.append(li); await inline(li, item); }
      return;
    }
    if (b.type === 'rows') {
      const box = el('div', 'receipt');
      container.append(box);
      if (b.caption) { const capEl = el('p', 'receipt-cap'); box.append(capEl); await inline(capEl, b.caption); }
      const dl = el('dl');
      box.append(dl);
      const rows = [...b.content.map((r) => [r, false]), ...(b.total ? [[b.total, true]] : [])];
      for (const [[k, v], total] of rows) {
        const row = el('div', `receipt-row${total ? ' is-total' : ''}`);
        row.innerHTML = `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`;
        dl.append(row);
        if (o.animate) await o.pause(150);
      }
      return;
    }
    const p = el('p', b.type === 'p' ? '' : b.type);
    container.append(p);
    if (b.type === 'handoff') p.insertAdjacentHTML('afterbegin', icon('forward'));
    await inline(p, b.content);
  }
  return { block, done: () => caret.remove() };
}

/* ------------------------------------------------------------------ running a comparison */
let runToken = 0;
const cancelRun = () => { runToken += 1; };
const animateByDefault = () => !reduceMotion.matches;

const userMsg = (text) => `<div class="msg msg-user"><span class="msg-who">Customer</span><p>${esc(text)}</p></div>`;

async function think(box, o) {
  const node = el('div', 'thinking');
  node.innerHTML = `<div class="thinking-top"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="shimmer">${o.consult ? 'Checking skills' : 'Thinking'}</span></div><div class="skeleton" aria-hidden="true"><i></i><i></i><i></i></div>`;
  box.append(node);
  if (o.consult && o.consult.length) {
    const row = el('div', 'consult');
    node.querySelector('.thinking-top').after(row);
    await o.pause(320);
    for (const id of o.consult) { row.append(chipEl(o.biz, id, { stat: true })); await o.pause(230); }
    await o.pause(260);
  } else {
    await o.pause(o.consult ? 700 : 950);
  }
  node.remove();
}

async function answerSide(box, blocks, o) {
  if (o.animate) await think(box, o);
  const msg = el('div', 'msg msg-bot');
  msg.innerHTML = `<span class="msg-who">${o.consult ? icon('sparkle') : ''}${esc(o.who)}</span>`;
  const bubble = el('div', 'bubble');
  msg.append(bubble);
  box.append(msg);
  const words = Math.max(1, countWords(blocks));
  const writer = makeWriter({ ...o, delay: Math.min(42, Math.max(9, o.target / words)) });
  if (o.animate) bubble.classList.add('is-streaming');
  for (const b of blocks) await writer.block(bubble, b);
  writer.done();
  bubble.classList.remove('is-streaming');
}

const ACTION_KINDS = {
  hold: {
    icon: 'calendar', label: 'Held for you', yes: 'Confirm visit', no: 'Release', done: { yes: 'Confirmed (demo)', no: 'Released (demo)' },
    toast: { yes: (a) => `Visit confirmed (demo): ${a.short}. No real appointment was booked.`, no: () => 'Hold released (demo). That window is back on the schedule.' },
  },
  quote: {
    icon: 'receipt', label: 'Quote created', yes: 'Approve quote', no: 'Not now', done: { yes: 'Approved (demo)', no: 'Saved for later' },
    toast: { yes: (a) => `Quote ${a.ref} approved (demo). Nothing was ordered or charged.`, no: (a) => `Quote ${a.ref} saved for later (demo).` },
  },
  consult: {
    icon: 'briefcase', label: 'Request created', yes: 'Confirm request', no: 'Withdraw', done: { yes: 'Requested (demo)', no: 'Withdrawn (demo)' },
    toast: { yes: () => 'Consultation request confirmed (demo). Nothing was sent to a real firm.', no: () => 'Consultation request withdrawn (demo).' },
  },
  club: {
    icon: 'badge', label: 'Enrollment ready', yes: 'Start membership', no: 'Not now', done: { yes: 'Enrolled (demo)', no: 'Maybe later' },
    toast: { yes: () => 'Ironwood Club started (demo). Nothing was charged.', no: () => 'No problem. The offer stays open (demo).' },
  },
};
const statusPill = (kind, status) => `<p class="action-status is-${status}" tabindex="-1">${icon(status === 'yes' ? 'check' : 'undo')}<span>${ACTION_KINDS[kind].done[status]}</span></p>`;
function actionCard(a, status) {
  const k = ACTION_KINDS[a.kind];
  return `
    <article class="action${status ? ` is-${status}` : ''}" data-ref="${esc(a.ref)}" data-kind="${a.kind}" data-short="${esc(a.short || '')}">
      <span class="action-ico">${icon(k.icon)}</span>
      <div class="action-body">
        <p class="action-kind">${k.label}${a.kind === 'quote' ? '' : ` · ${esc(a.ref)}`}</p>
        <h3>${esc(a.title)}${!status && a.ask ? '<span class="ask"> — confirm?</span>' : ''}</h3>
        <p class="action-detail">${esc(a.detail)}</p>
        ${status ? statusPill(a.kind, status) : `<div class="action-buttons"><button type="button" class="btn btn-primary btn-sm" data-action="act" data-do="yes">${k.yes}</button><button type="button" class="btn btn-glass btn-sm" data-action="act" data-do="no">${k.no}</button></div>`}
      </div>
    </article>`;
}
async function showActions(box, acts, result, o) {
  if (!acts.length) return;
  const list = el('div', 'action-list');
  box.append(list);
  for (const a of acts) {
    if (o.animate) await o.pause(280);
    list.insertAdjacentHTML('beforeend', actionCard(a, result.status?.[a.ref]));
  }
}

const METRICS = [['facts', 'Business facts used'], ['actions', 'Actions completed'], ['bounced', 'Bounced to staff'], ['time', 'Est. handling time']];
const metricText = (key, n) => (key === 'time' ? `~${n} min` : String(n));
function fillMetrics(root, side, m, animate) {
  METRICS.forEach(([key]) => {
    const dd = root.querySelector(`[data-metrics="${side}"] [data-m="${key}"]`);
    if (!dd) return;
    dd.classList.toggle('is-good', side === 'skilled' && ((key === 'facts' && m.facts > 0) || (key === 'actions' && m.actions > 0)));
    if (!animate || m[key] === 0) { dd.textContent = metricText(key, m[key]); return; }
    const start = performance.now();
    const step = (t) => {
      if (!dd.isConnected) return;
      const p = Math.min(1, (t - start) / 700);
      dd.textContent = metricText(key, Math.round(m[key] * (1 - (1 - p) ** 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
function clearMetrics(root) {
  root.querySelectorAll('[data-m]').forEach((dd) => { dd.textContent = '—'; dd.classList.remove('is-good'); });
  root.querySelectorAll('[data-badge]').forEach((b) => { b.textContent = ''; });
}
function showDelta(root, biz, g, s) {
  const box = root.querySelector('[data-delta]');
  const saved = g.time - s.time;
  box.innerHTML = `
    <span class="delta-label">${icon('sparkle')}With ${esc(biz.possessive)} skills</span>
    <span class="delta-item"><strong>${s.facts}</strong> business ${s.facts === 1 ? 'fact' : 'facts'} vs <strong>0</strong></span>
    <span class="delta-item"><strong>${s.actions}</strong> ${s.actions === 1 ? 'action' : 'actions'} taken vs <strong>0</strong></span>
    <span class="delta-item"><strong>${s.bounced}</strong> hand-${s.bounced === 1 ? 'off' : 'offs'} to staff vs <strong>${g.bounced}</strong></span>
    <span class="delta-item delta-save">${saved > 0 ? `About <strong>${saved}</strong> minutes of staff time saved on this one message` : 'No staff time saved with these skills switched off'}</span>`;
  box.hidden = false;
}
const announce = (root, text) => { const node = root.querySelector('[data-run-status]'); if (node) node.textContent = text; };

async function playResult(root, bizId, result, { animate }) {
  const token = runToken;
  const alive = () => token === runToken && root.isConnected;
  const pause = (ms) => new Promise((resolve, reject) => { setTimeout(() => (alive() ? resolve() : reject(CANCELLED)), ms); });
  const biz = BIZ[bizId];
  const sc = findScenario(bizId, result.scenarioId);
  if (!sc) return;
  const answer = compose(biz, sc, result.skills, birminghamTime(result.runAt), result.refs || []);
  const g = genericMetrics(sc);
  const s = answer.metrics;
  const stage = root.querySelector('.stage');
  const gBox = root.querySelector('[data-chat="generic"]');
  const sBox = root.querySelector('[data-chat="skilled"]');
  root.querySelector('[data-delta]').hidden = true;
  clearMetrics(root);
  gBox.innerHTML = userMsg(sc.prompt);
  sBox.innerHTML = userMsg(sc.prompt);
  stage.setAttribute('aria-busy', String(animate));
  announce(root, animate ? 'Running the comparison. Both assistants are answering.' : '');
  try {
    await Promise.all([
      answerSide(gBox, sc.generic.map((o) => blockOf(o, {})), { animate, pause, biz, who: 'Generic AI', target: 2500 }),
      answerSide(sBox, answer.blocks, { animate, pause, biz, who: biz.assistant, consult: answer.used, target: 3300 })
        .then(() => showActions(sBox, answer.actions, result, { animate, pause })),
    ]);
  } catch (err) {
    if (err === CANCELLED) return;
    throw err;
  }
  stage.setAttribute('aria-busy', 'false');
  fillMetrics(root, 'generic', g, animate);
  fillMetrics(root, 'skilled', s, animate);
  showDelta(root, biz, g, s);
  const gb = root.querySelector('[data-badge="generic"]');
  const sb = root.querySelector('[data-badge="skilled"]');
  if (gb) gb.innerHTML = '0<span class="visually-hidden"> business facts</span>';
  if (sb) sb.innerHTML = `${s.facts}<span class="visually-hidden"> business ${s.facts === 1 ? 'fact' : 'facts'}</span>`;
  if (animate) announce(root, `Both answers are ready. Generic AI used no business facts and bounced ${g.bounced} ${g.bounced === 1 ? 'question' : 'questions'} to staff. The assistant with skills used ${s.facts} facts and took ${s.actions} ${s.actions === 1 ? 'action' : 'actions'}.`);
}

function startRun(root, bizId, scenarioId, { animate = animateByDefault() } = {}) {
  const biz = BIZ[bizId];
  const sc = findScenario(bizId, scenarioId);
  if (!root || !sc) return;
  cancelRun();
  const skills = { ...state.skills[bizId] };
  const runAt = Date.now();
  const draft = compose(biz, sc, skills, birminghamTime(runAt));
  const refs = draft.actions.map((a) => nextRef(a.counter, a.prefix));
  state.results[bizId] = { scenarioId, skills, runAt, refs, status: {} };
  state.selected[bizId] = scenarioId;
  save();
  updateStale(root, bizId);
  playResult(root, bizId, state.results[bizId], { animate });
}

function skillsDiffer(bizId) {
  const res = state.results[bizId];
  if (!res) return false;
  return BIZ[bizId].skills.some((s) => !!res.skills?.[s.id] !== !!state.skills[bizId][s.id]);
}
function updateStale(root, bizId) {
  const banner = root?.querySelector('[data-stale]');
  if (banner) banner.hidden = !skillsDiffer(bizId);
}
function updateSkillCount(root, bizId) {
  const biz = BIZ[bizId];
  const on = biz.skills.filter((s) => state.skills[bizId][s.id]).length;
  root?.querySelectorAll('[data-skill-count]').forEach((n) => { n.textContent = `${on}/${biz.skills.length} skills`; });
}

function mountStage(root, bizId, { autorun = false, play = false, scenarioId = null } = {}) {
  if (!root) return;
  updateStale(root, bizId);
  const res = state.results[bizId];
  if (play && scenarioId) { startRun(root, bizId, scenarioId); return; }
  if (res && findScenario(bizId, res.scenarioId) && (!scenarioId || res.scenarioId === scenarioId)) {
    playResult(root, bizId, res, { animate: false });
    return;
  }
  if (scenarioId) { startRun(root, bizId, scenarioId, { animate: false }); return; }
  if (autorun) {
    const token = runToken;
    const go = () => { if (token === runToken && root.isConnected) startRun(root, bizId, state.selected[bizId], { animate: !inPreview && animateByDefault() }); };
    if (inPreview) go(); else setTimeout(go, 450);
  }
}

/* ------------------------------------------------------------------ shared markup */
function bizSwitch(biz) {
  return `
    <div class="biz-row">
      <div class="biz-switch" role="group" aria-label="Choose a business">
        ${BIZ_IDS.map((id) => {
          const b = BIZ[id];
          return `<button type="button" id="biz-${id}" class="biz biz-${id}" data-action="biz" data-biz="${id}" aria-pressed="${id === biz.id}">
            <span class="biz-glyph" aria-hidden="true">${b.glyph}</span>
            <span class="biz-text"><strong><span class="biz-full">${esc(b.name)}</span><span class="biz-short">${esc(id === 'ironwood' ? 'Ironwood' : b.name)}</span></strong><small>${esc(b.kind)}</small></span>
          </button>`;
        }).join('')}
      </div>
      <p class="biz-blurb">${esc(biz.blurb)} <a href="${biz.demo}" target="_blank" rel="noopener">See the ${esc(biz.short)} demo site<span class="visually-hidden"> (opens in a new tab)</span> <span aria-hidden="true">↗</span></a></p>
    </div>`;
}

function skillPill(biz, s) {
  const on = !!state.skills[biz.id][s.id];
  return `<button type="button" class="skill-pill" role="switch" aria-checked="${on}" data-action="toggle-skill" data-skill="${s.id}"><span class="knob" aria-hidden="true"></span><span class="pill-label">${esc(s.name)}</span></button>`;
}

const metricsHTML = (side) => `
  <dl class="metrics" data-metrics="${side}">
    ${METRICS.map(([key, label]) => `<div class="metric"><dt>${label}</dt><dd data-m="${key}">—</dd></div>`).join('')}
  </dl>`;

function stageHTML(biz) {
  const on = biz.skills.filter((s) => state.skills[biz.id][s.id]).length;
  return `
    <p class="scripted-note">${icon('info')}<span><strong>Scripted example</strong> — responses are pre-written to illustrate the difference; no AI model runs on this page.</span></p>
    <div class="pane-switch" role="group" aria-label="Choose which answer to show">
      <button type="button" data-action="pane" data-pane="generic" aria-pressed="${state.pane === 'generic'}">Generic AI <span class="pane-badge" data-badge="generic"></span></button>
      <button type="button" data-action="pane" data-pane="skilled" aria-pressed="${state.pane === 'skilled'}">With your skills <span class="pane-badge" data-badge="skilled"></span></button>
    </div>
    <div class="stage" data-pane="${state.pane}" aria-busy="false">
      <section class="panel panel-generic" aria-labelledby="generic-title">
        <header class="panel-head">
          <span class="bot bot-generic" aria-hidden="true">${icon('chat')}</span>
          <div class="panel-title"><h2 id="generic-title">Generic AI</h2><p>Knows nothing about ${esc(biz.name)}</p></div>
          <span class="panel-tag">0 skills</span>
        </header>
        <div class="panel-note"><span>${icon('eye')} Sees only the customer’s message</span></div>
        <div class="chat" data-chat="generic"><p class="chat-empty">Pick a customer message to compare answers.</p></div>
        ${metricsHTML('generic')}
      </section>
      <section class="panel panel-skilled" aria-labelledby="skilled-title">
        <header class="panel-head">
          <span class="bot bot-skilled" aria-hidden="true">${icon('sparkle')}</span>
          <div class="panel-title"><h2 id="skilled-title">AI with your skills</h2><p>Runs on ${esc(biz.possessive)} own knowledge, rules and actions</p></div>
          <span class="panel-tag" data-skill-count>${on}/${biz.skills.length} skills</span>
        </header>
        <div class="skills" role="group" aria-labelledby="skills-label">
          <div class="skills-head"><h3 id="skills-label">Skills</h3><button type="button" class="link-btn" data-action="open-skills">Show what the skills contain</button></div>
          <div class="skill-pills">${biz.skills.map((s) => skillPill(biz, s)).join('')}</div>
        </div>
        <div class="stale" data-stale hidden><span>${icon('bolt')} Skills changed. Run it again to see the new answer.</span><button type="button" class="btn btn-primary btn-sm" data-action="rerun">Run again</button></div>
        <div class="chat" data-chat="skilled"><p class="chat-empty">Pick a customer message to compare answers.</p></div>
        ${metricsHTML('skilled')}
      </section>
    </div>
    <div class="delta" data-delta hidden></div>
    <p class="estimate-note">Handling time is an estimate: about 1 minute to read the reply, plus 6 minutes of staff time for each question bounced back and 5 minutes for each booking, quote or request staff must create by hand.</p>
    <p class="visually-hidden" aria-live="polite" data-run-status></p>`;
}

/* ------------------------------------------------------------------ views */
const view = (fn) => (ctx) => { cancelRun(); return fn(ctx); };

function home() {
  const biz = BIZ[state.biz];
  const selected = state.selected[biz.id];
  return {
    title: 'SKILLSET — Generic AI vs. AI with your skills',
    html: `
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">${icon('sparkle')}Same message · Two assistants</p>
          <h1>Generic AI guesses.<br><span class="grad">AI with your skills knows.</span></h1>
          <p class="lead">Send one customer message to two assistants. One has never heard of the business. The other runs on the business’s own skills (its price sheet, schedule, service area, voice and policies), so it answers with real facts and takes the next step.</p>
        </div>
        <ol class="read-steps">
          <li><span class="step-num">01</span><div><strong>Pick a business</strong><span>Three fictional Birmingham businesses from our demo gallery.</span></div></li>
          <li><span class="step-num">02</span><div><strong>Send a customer message</strong><span>Both assistants answer at the same time.</span></div></li>
          <li><span class="step-num">03</span><div><strong>Switch skills off</strong><span>Watch the answer lose its facts and actions.</span></div></li>
        </ol>
      </div>
    </section>
    <section class="compare" aria-label="Comparison">
      <div class="wrap">
        ${bizSwitch(biz)}
        <div class="compare-grid">
          <aside class="rail" aria-labelledby="rail-title">
            <h2 id="rail-title">Customer messages</h2>
            <p class="rail-sub">Pick one to send it to both assistants.</p>
            <ol class="presets">
              ${biz.scenarios.map((sc, i) => `<li><button type="button" class="preset" data-action="preset" data-id="${sc.id}" aria-pressed="${sc.id === selected}"><span class="preset-num">0${i + 1}</span><span class="preset-text">“${esc(sc.prompt)}”</span></button></li>`).join('')}
            </ol>
            <button type="button" class="btn btn-primary btn-block" data-action="run">${icon('sparkle')}Run comparison</button>
            <a class="rail-link" href="#/try">Ask your own question ${icon('arrow')}</a>
          </aside>
          <div class="stage-root" id="stage-root">${stageHTML(biz)}</div>
        </div>
      </div>
    </section>
    <section class="section more">
      <div class="wrap more-grid">
        <article class="more-card">
          <span class="more-ico">${icon('layers')}</span>
          <h2>What’s inside a skill?</h2>
          <p>Prices, rules, schedules and the actions the assistant is allowed to take. Open ${esc(biz.possessive)} skills to see every fact behind the answers.</p>
          <button type="button" class="btn btn-glass btn-sm" data-action="open-skills">Show what the skills contain</button>
        </article>
        <article class="more-card">
          <span class="more-ico">${icon('search')}</span>
          <h2>Ask your own question</h2>
          <p>Type a question and we’ll match it to the closest script, or tell you honestly that we haven’t written one.</p>
          <a class="btn btn-glass btn-sm" href="#/try">Try your own</a>
        </article>
        <article class="more-card">
          <span class="more-ico">${icon('bolt')}</span>
          <h2>How we build one for you</h2>
          <p>We interview your team, turn your price sheet and policies into skills, and connect booking and quoting.</p>
          <a class="btn btn-glass btn-sm" href="#/how">How it works</a>
        </article>
      </div>
    </section>`,
    mount: (outlet) => mountStage(outlet.querySelector('#stage-root'), biz.id, { autorun: true }),
  };
}

let pendingTryRun = false;
function tryPage() {
  const biz = BIZ[state.biz];
  const t = state.try[biz.id] || {};
  const match = t.match && findScenario(biz.id, t.match.scenarioId);
  let result = '<div class="try-empty"><span class="try-empty-ico">' + icon('chat') + '</span><p>Your comparison will appear here. Every answer is a script we wrote in advance.</p></div>';
  if (match) {
    result = `
      <div class="match-banner">
        <p class="match-label">${icon('check')}Closest script</p>
        <p class="match-prompt">“${esc(match.prompt)}”</p>
        <p class="match-terms">You asked: “${esc(t.query)}”${t.match.terms?.length ? ` · Matched on ${t.match.terms.map((x) => `<code>${esc(x)}</code>`).join(' ')}` : ''}</p>
      </div>
      <div class="stage-root" id="stage-root">${stageHTML(biz)}</div>`;
  } else if (t.query) {
    const suggest = t.suggest && BIZ[t.suggest.biz] && findScenario(t.suggest.biz, t.suggest.scenarioId);
    result = `
      <div class="nomatch" role="status">
        <p class="match-label is-muted">${icon('info')}No match</p>
        <h2>No script for that question yet — try one of these</h2>
        <p>We only play answers we wrote in advance, so we won’t make one up for “${esc(t.query)}”. Here are the ${esc(biz.short)} scripts we have:</p>
        <div class="nomatch-list">
          ${biz.scenarios.map((sc) => `<button type="button" class="preset" data-action="try-preset" data-id="${sc.id}"><span class="preset-text">“${esc(sc.prompt)}”</span>${icon('arrow')}</button>`).join('')}
        </div>
        ${suggest ? `<div class="cross"><p>That sounds like a question for <strong>${esc(BIZ[t.suggest.biz].name)}</strong>: “${esc(suggest.prompt)}”</p><button type="button" class="btn btn-glass btn-sm" data-action="try-switch">Switch to ${esc(BIZ[t.suggest.biz].short)} and run it</button></div>` : ''}
      </div>`;
  }
  return {
    title: 'Try your own question — SKILLSET',
    html: `
    <section class="hero hero-tight">
      <div class="wrap">
        <p class="eyebrow">${icon('search')}Try your own</p>
        <h1>Ask your own question.</h1>
        <p class="lead">Type something a customer might ask. We match it by keywords to the closest scripted scenario and play both answers. There’s no live AI on this page, so if we haven’t written a script for it, we’ll say so.</p>
      </div>
    </section>
    <section class="try">
      <div class="wrap">
        ${bizSwitch(biz)}
        <form class="try-card" data-form="try" novalidate>
          <label class="try-label" for="try-q">Your question for ${esc(biz.name)}</label>
          <div class="try-row">
            <div class="try-field"><textarea id="try-q" name="q" rows="2" required data-required="Type a question first." data-minlength="3" placeholder="${esc(biz.placeholder)}">${esc(t.query || '')}</textarea></div>
            <button class="btn btn-primary" type="submit">${icon('search')}Find the closest script</button>
          </div>
          <div class="try-examples"><span>Try:</span>${biz.examples.map((e) => `<button type="button" class="chip-btn" data-action="try-example" data-text="${esc(e)}">${esc(e)}</button>`).join('')}</div>
          <p class="try-fine">Matching happens in your browser. Nothing you type is sent anywhere.</p>
        </form>
        <div class="try-result" id="try-result">${result}</div>
      </div>
    </section>`,
    mount: (outlet) => {
      if (!match) return;
      const root = outlet.querySelector('#stage-root');
      const play = pendingTryRun;
      pendingTryRun = false;
      mountStage(root, biz.id, { play, scenarioId: match.id });
      if (play) outlet.querySelector('#try-result').scrollIntoView({ behavior: animateByDefault() ? 'smooth' : 'auto', block: 'start' });
    },
  };
}

function howPage() {
  const steps = [
    ['We interview your team', 'We sit down with the people who answer your phones and inbox, and collect the questions customers really ask, the answers you give and the moments a person should step in.', 'chat'],
    ['We turn your documents into skills', 'Your price sheet, service area, schedule, policies and SOPs become structured skills: the facts, the rules for using them and the voice you use with customers.', 'layers'],
    ['We connect real actions', 'Holding an arrival window, creating a quote, filing a consultation request, updating your CRM. The assistant asks before it acts, and your team sees everything it does.', 'bolt'],
    ['We review and keep improving', 'We read real conversations with you, fix gaps and add skills as you grow. Change a price once and every answer uses it the same day.', 'check'],
  ];
  const guards = [
    ['hand', 'Emergencies go to a person', 'Gas smells, flooding, injuries: the assistant gives the safety steps from your SOP and alerts your on-call team right away.'],
    ['scale', 'No legal, medical or financial advice', 'It shares only approved general information with your required disclaimers, and books time with a professional for anything specific.'],
    ['users', 'Refunds and complaints stay human', 'Billing disputes, refunds and unhappy customers are handed to your staff with the whole conversation attached.'],
    ['tag', 'It never invents prices', 'If a price isn’t in the pricing skill, it says your office will confirm, and tells your team what was asked.'],
    ['list', 'It shows its sources', 'Every fact links back to the skill it came from, so your team can check any answer in seconds.'],
    ['shield', 'It asks before acting', 'Holds, quotes and requests wait for the customer to confirm, and every action is logged for your team.'],
  ];
  return {
    title: 'How it works — SKILLSET',
    html: `
    <section class="hero hero-tight">
      <div class="wrap how-hero">
        <p class="eyebrow">${icon('layers')}How it works</p>
        <h1>Your business, written down so <span class="grad">an assistant can use it.</span></h1>
        <p class="lead">A generic chatbot only knows the internet. We build assistants on your own price sheet, schedule, policies and tone, then connect them to the tools you already use, so every answer is specific and every next step actually happens.</p>
      </div>
    </section>
    <section class="section section-tight">
      <div class="wrap">
        <ol class="steps">
          ${steps.map(([title, text, ic], i) => `<li class="step"><div class="step-top"><span class="step-num">0${i + 1}</span><span class="step-ico">${icon(ic)}</span></div><h2>${title}</h2><p>${text}</p></li>`).join('')}
        </ol>
      </div>
    </section>
    <section class="section">
      <div class="wrap skill-example">
        <div class="skill-example-copy">
          <p class="eyebrow">${icon('tag')}What a skill looks like</p>
          <h2>One skill, four parts.</h2>
          <p class="lead">This is a trimmed version of Ironwood’s pricing skill, the one behind every price on the comparison page.</p>
          <dl class="anatomy">
            <div><dt>Knows</dt><dd>The facts, in your words and at your prices.</dd></div>
            <div><dt>Rules</dt><dd>How and when to use them, and what to never say.</dd></div>
            <div><dt>Actions</dt><dd>What the assistant is allowed to do, like hold a slot or start a quote.</dd></div>
            <div><dt>Cites</dt><dd>The chip customers and staff see next to every fact it supplies.</dd></div>
          </dl>
        </div>
        <figure class="code-card">
          <div class="code-head"><span class="code-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>skills/ironwood/pricing-sheet</span></div>
          <pre class="code"><code><span class="k">skill</span>: Pricing sheet
<span class="k">business</span>: Ironwood Plumbing &amp; Air

<span class="k">knows</span>:
  <span class="k">ac_tune_up</span>: <span class="s">"$99 flat"</span>
  <span class="k">diagnostic_visit</span>: <span class="s">"$89, credited toward the repair"</span>
  <span class="k">water_heater_40gal_gas</span>: <span class="s">"from $1,650 installed"</span>
  <span class="k">ironwood_club</span>: <span class="s">"$14.95/month"</span>

<span class="k">rules</span>:
  - <span class="s">Quote only prices on this sheet.</span>
  - <span class="s">Say "from" for repairs; the flat price is agreed before work starts.</span>
  - <span class="s">Not on the sheet? Offer the $89 diagnostic visit.</span>

<span class="k">actions</span>:
  - <span class="f">start_club_enrollment</span>()

<span class="k">cite_as</span>: <span class="cite is-static">${icon('tag')}<span>Pricing sheet</span></span></code></pre>
          <figcaption class="visually-hidden">Example pricing skill for Ironwood Plumbing &amp; Air</figcaption>
        </figure>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="section-head"><p class="eyebrow">${icon('shield')}Guardrails</p><h2>Built to know when to stop.</h2><p class="lead">A good assistant knows its limits. These rules ship with every project, and your team can tighten them.</p></div>
        <div class="guard-grid">
          ${guards.map(([ic, title, text]) => `<article class="guard"><span class="guard-ico">${icon(ic)}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="honest">
          <span class="honest-ico">${icon('info')}</span>
          <div><h2>About this demo</h2><p>Everything on the comparison page is a script. We wrote both answers by hand to show the difference skills make; no AI model runs on this page, and nothing you type leaves your browser. A real project runs on a live model with your skills, your guardrails and your tools.</p></div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="cta">
          <h2>Want an assistant that knows your business this well?</h2>
          <p>Tell us how customers reach you today, and we’ll show you which skills to build first.</p>
          <div class="cta-actions">
            <a class="btn btn-primary" href="${CONTACT}" target="_blank" rel="noopener noreferrer">Start a project ${icon('external')}</a>
            <a class="btn btn-glass" href="#/">Back to the comparison</a>
          </div>
        </div>
      </div>
    </section>`,
  };
}

function notFound() {
  return {
    title: 'Page not found — SKILLSET',
    html: `
    <section class="hero not-found">
      <div class="wrap">
        <p class="eyebrow">${icon('search')}404</p>
        <h1>No skill covers this page.</h1>
        <p class="lead">The page you were looking for doesn’t exist. The comparison is a good place to start.</p>
        <div class="cta-actions"><a class="btn btn-primary" href="#/">Compare the assistants</a><a class="btn btn-glass" href="#/how">How it works</a></div>
      </div>
    </section>`,
  };
}

/* ------------------------------------------------------------------ skills drawer */
function openSkills(focusId) {
  const biz = BIZ[state.biz];
  const cur = state.skills[biz.id];
  const section = (title, items, cls = '') => (items && items.length ? `<h4>${title}</h4><ul class="${cls}">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  const { dialog } = modal(`
    <div class="drawer-head">
      <div><p class="drawer-eyebrow">${esc(biz.name)}</p><h2 id="drawer-title">What the skills contain</h2></div>
      <button type="button" class="icon-btn" data-close aria-label="Close">${icon('close')}</button>
    </div>
    <div class="drawer-body">
      <p class="drawer-intro">Skills are the business’s own knowledge, rules and actions, written down once and used in every conversation. Switch one off in the panel to see what the assistant loses.</p>
      ${biz.skills.map((s) => `
        <article class="skill-card${cur[s.id] ? '' : ' is-off'}" data-skill-card="${s.id}">
          <header>
            <span class="skill-ico">${icon(s.icon)}</span>
            <div><h3>${esc(s.name)}</h3><p class="skill-slug">${biz.id}/${s.slug}</p></div>
            <span class="skill-state">${cur[s.id] ? 'On' : 'Off'}</span>
          </header>
          <p class="skill-summary">${esc(s.summary)}</p>
          ${section('Knows', s.knows, 'facts')}
          ${section('Rules', s.rules, 'rules')}
          ${section('Can do', s.can, 'can')}
        </article>`).join('')}
      <p class="drawer-foot">In a real project these come from your price sheet, calendar, policies and SOPs, and your team can update them anytime.</p>
    </div>`, { className: 'drawer', labelledBy: 'drawer-title' });
  if (focusId) {
    const card = dialog.querySelector(`[data-skill-card="${focusId}"]`);
    if (card) { card.classList.add('is-focus'); card.scrollIntoView({ block: 'center' }); }
  }
}

/* ------------------------------------------------------------------ router and actions */
const router = createRouter([
  ['/', view(home)],
  ['/try', view(tryPage)],
  ['/how', view(howPage)],
], { notFound: view(notFound), afterRender: () => setMenu(false) });

function setMenu(open) {
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', String(open));
  document.getElementById('mobile-nav').hidden = !open;
}
const stageRoot = () => document.getElementById('stage-root');
const smallScreen = () => window.matchMedia('(max-width: 1180px)').matches;

function runFromTry(bizId, scenarioId, query, terms) {
  state.biz = bizId;
  state.try[bizId] = { query, match: { scenarioId, terms }, suggest: null };
  save();
  pendingTryRun = true;
  router.render({ keepScroll: true });
}

actions({
  menu: (button) => setMenu(button.getAttribute('aria-expanded') !== 'true'),
  biz: (button) => {
    if (state.biz === button.dataset.biz) return;
    state.biz = button.dataset.biz;
    save();
    router.render({ keepScroll: true });
  },
  preset: (button) => {
    document.querySelectorAll('.rail .preset').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    const root = stageRoot();
    startRun(root, state.biz, button.dataset.id);
    if (smallScreen() && root) root.scrollIntoView({ behavior: animateByDefault() ? 'smooth' : 'auto', block: 'start' });
  },
  run: () => {
    const root = stageRoot();
    startRun(root, state.biz, state.selected[state.biz]);
    if (smallScreen() && root) root.scrollIntoView({ behavior: animateByDefault() ? 'smooth' : 'auto', block: 'start' });
  },
  rerun: () => {
    const res = state.results[state.biz];
    startRun(stageRoot(), state.biz, res?.scenarioId || state.selected[state.biz]);
  },
  'toggle-skill': (button) => {
    const bizId = state.biz;
    const id = button.dataset.skill;
    state.skills[bizId][id] = !state.skills[bizId][id];
    save();
    const root = stageRoot();
    root?.querySelectorAll(`.skill-pill[data-skill="${id}"]`).forEach((b) => b.setAttribute('aria-checked', String(state.skills[bizId][id])));
    updateSkillCount(root, bizId);
    updateStale(root, bizId);
    announce(root, `${skillOf(BIZ[bizId], id).name} switched ${state.skills[bizId][id] ? 'on' : 'off'}. Run it again to see the difference.`);
  },
  'open-skills': () => openSkills(),
  'open-skill': (button) => openSkills(button.dataset.skill),
  pane: (button) => {
    state.pane = button.dataset.pane;
    save();
    const root = stageRoot();
    if (!root) return;
    root.querySelector('.stage').dataset.pane = state.pane;
    root.querySelectorAll('.pane-switch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pane === state.pane)));
  },
  act: (button) => {
    const card = button.closest('.action');
    const ref = card.dataset.ref;
    const kind = card.dataset.kind;
    const res = Object.values(state.results).find((r) => r.refs?.includes(ref));
    if (!res) return;
    const outcome = button.dataset.do;
    res.status = { ...(res.status || {}), [ref]: outcome };
    save();
    card.classList.add(`is-${outcome}`);
    card.querySelector('.ask')?.remove();
    card.querySelector('.action-buttons').outerHTML = statusPill(kind, outcome);
    card.querySelector('.action-status').focus({ preventScroll: true });
    toast(ACTION_KINDS[kind].toast[outcome]({ ref, short: card.dataset.short }));
  },
  try: (form) => {
    if (!validate(form)) return;
    const query = form.elements.q.value.trim();
    const found = matchQuestion(state.biz, query);
    state.try[state.biz] = { query, ...found };
    save();
    pendingTryRun = !!found.match;
    router.render({ keepScroll: true });
    if (!found.match) document.querySelector('.nomatch')?.scrollIntoView({ behavior: animateByDefault() ? 'smooth' : 'auto', block: 'nearest' });
  },
  'try-example': (button) => {
    const form = document.querySelector('form[data-form="try"]');
    form.elements.q.value = button.dataset.text;
    form.requestSubmit();
  },
  'try-preset': (button) => {
    const sc = findScenario(state.biz, button.dataset.id);
    runFromTry(state.biz, sc.id, sc.prompt, ['picked from the list']);
  },
  'try-switch': () => {
    const t = state.try[state.biz];
    if (!t?.suggest) return;
    const text = normalize(t.query);
    const { terms } = scoreScenario(text, findScenario(t.suggest.biz, t.suggest.scenarioId));
    runFromTry(t.suggest.biz, t.suggest.scenarioId, t.query, terms);
  },
});
