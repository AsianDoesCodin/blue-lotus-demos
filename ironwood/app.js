// IRONWOOD Plumbing & Air: demo website for a fictional family-owned plumbing, heating and cooling company in Birmingham, AL.
const { esc, money, router: createRouter, validate, toast, confirmDialog, reference, firstName, storage, actions, demoBar, formatDate, dayKey, fromDayKey, addDays } = Kit;
demoBar('Ironwood Plumbing & Air');

const PHONE = '(205) 555-0148';
const TEL = 'tel:+12055550148';
const DIAGNOSTIC = 89;
const AFTER_HOURS = 149;
const CLUB_MONTHLY = 14.95;
const CLUB_OFF = 0.15;

/* ---------- Icons: 24px line icons drawn inline ---------- */
const ICONS = {
  drop: '<path d="M12 2.8c3.6 4.3 6.6 8 6.6 11.4a6.6 6.6 0 0 1-13.2 0c0-3.4 3-7.1 6.6-11.4z"/><path d="M8.9 14.6a3.2 3.2 0 0 0 3.1 3"/>',
  flame: '<path d="M12 21.6c-3.9 0-6.9-2.7-6.9-6.5 0-3.9 3-6.1 4.2-10.5 2.6 1.6 4 3.9 4 6.4 1-.7 1.7-1.8 2-3.1 1.8 1.7 3.6 4.3 3.6 7.2 0 3.8-3 6.5-6.9 6.5z"/><path d="M12 21.6c-1.6 0-2.9-1.2-2.9-2.8 0-1.8 1.5-2.8 2.3-4.5 1.5 1 3.5 2.6 3.5 4.5 0 1.6-1.3 2.8-2.9 2.8z"/>',
  snowflake: '<path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17"/><path d="M9.9 7.1 12 5l2.1 2.1M9.9 16.9 12 19l2.1-2.1M17.3 12.6l.8 2.9-2.9.8M6.7 11.4l-.8-2.9 2.9-.8M17.3 11.4l.8-2.9-2.9-.8M6.7 12.6l-.8 2.9 2.9.8"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  pipe: '<path d="M2 5h8a7 7 0 0 1 7 7v10M2 10h8a2 2 0 0 1 2 2v10"/><path d="M5 3.5v8M10.5 18h8"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  shield: '<path d="M12 21.5s7.5-3.6 7.5-9.5V5.5L12 2.5 4.5 5.5V12c0 5.9 7.5 9.5 7.5 9.5z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.4"/>',
  award: '<circle cx="12" cy="8.5" r="5.8"/><path d="m8.7 13.6-1.4 7.9 4.7-2.7 4.7 2.7-1.4-7.9"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  pin: '<path d="M12 21.5s7-6.1 7-11.7a7 7 0 0 0-14 0c0 5.6 7 11.7 7 11.7z"/><circle cx="12" cy="9.8" r="2.5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
  van: '<path d="M1.5 16.5V7a1.5 1.5 0 0 1 1.5-1.5h11v11"/><path d="M14 9h4.2l3.3 3.8v3.7h-2"/><path d="M9 16.5h5.5"/><circle cx="6.5" cy="17" r="2"/><circle cx="17.5" cy="17" r="2"/>',
  alert: '<path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4.5M12 17.2h.01"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1z"/>',
  chat: '<path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.4A8.5 8.5 0 1 1 21 12z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  gauge: '<path d="M3.5 17.5a9 9 0 1 1 17 0"/><path d="m12 14 4.5-4.5"/><circle cx="12" cy="14" r="1.6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
};
const icon = (name, cls = '') => `<svg class="i${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
const STAR = '<path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z"/>';
const stars = (rating, { label = true } = {}) => `<span class="stars" ${label ? `role="img" aria-label="Rated ${rating.toFixed(1)} out of 5"` : 'aria-hidden="true"'}>${Array.from({ length: 5 }, (_, i) => `<svg viewBox="0 0 24 24" class="${i < Math.round(rating) ? 'on' : ''}" aria-hidden="true" focusable="false">${STAR}</svg>`).join('')}</span>`;

/* ---------- Business facts ---------- */
const AREAS = [
  ['Birmingham', ['35203', '35205', '35222'], 'Downtown, Southside, Crestwood & Avondale'],
  ['Homewood', ['35209'], 'Edgewood, West Homewood & Hollywood'],
  ['Mountain Brook', ['35213', '35223'], 'Crestline, English Village & the Village'],
  ['Vestavia Hills', ['35216', '35243'], 'Rocky Ridge & Cahaba Heights'],
  ['Hoover', ['35226', '35242', '35244'], 'Bluff Park, Inverness & Riverchase'],
  ['Pelham', ['35124'], 'Ballantrae & Oak Mountain'],
];
const ALL_ZIPS = AREAS.flatMap(([, zips]) => zips).sort();
const areaFor = (zip) => AREAS.find(([, zips]) => zips.includes(String(zip)))?.[0] || null;

const TECHS = {
  marcus: { name: 'Marcus Bell', role: 'Plumbing', years: 11, rating: 4.9, jobs: '2,300+', unit: '07', image: 'tech-marcus',
    bio: 'Grew up in Homewood, can hear a slab leak through the floor and puts on shoe covers before he says hello.' },
  dana: { name: 'Dana Whitfield', role: 'Heating & cooling · NATE-certified', years: 9, rating: 5.0, jobs: '1,900+', unit: '12', image: 'tech-dana',
    bio: 'Our lead HVAC tech. Dana keeps the common parts on the van, so most AC and furnace repairs are done on the first visit.' },
  luis: { name: 'Luis Ortega', role: 'Water heaters & gas lines', years: 17, rating: 4.9, jobs: '3,100+', unit: '03', image: 'tech-luis',
    bio: 'Has installed more water heaters than anyone on the crew and will tell you straight whether yours is worth repairing.' },
};

// Problems: [key, label, low, high (null = "from"), kind]. Kinds: repair (15% Club discount), diag, tune (included for members), replace.
const SERVICES = {
  plumbing: {
    name: 'Plumbing', noun: 'plumbing', cta: 'plumbing service', short: 'Leaks, toilets, faucets and fixtures', icon: 'wrench', image: 'plumbing', tech: 'marcus', from: 129,
    alt: 'Ironwood plumber repairing the supply lines under a kitchen sink',
    headline: 'Leaks, drips and running toilets, fixed at a price you approve first.',
    intro: 'From a toilet that won’t stop running to a pinhole leak behind the vanity, Marcus and the plumbing crew find the real cause, fix it cleanly and leave the room tidier than they found it.',
    fixes: ['Leaking pipes, fittings and shutoff valves', 'Running, weak-flushing or rocking toilets', 'Dripping faucets and new fixture installs', 'Garbage disposals and dishwasher hookups', 'Low water pressure and noisy pipes', 'Outdoor spigots and hose bibs'],
    signs: ['A water bill that jumps with no change in use', 'Stains or soft spots on a ceiling, wall or floor', 'Running water sounds when everything is off', 'A toilet that refills by itself every few minutes', 'Rusty or sputtering water from the tap'],
    prices: ['diagnostic', 'toilet', 'leak', 'faucet'],
    problems: [['leak', 'Leaking pipe or fitting', 179, 450, 'repair'], ['toilet', 'Running or clogged toilet', 129, 289, 'repair'], ['faucet', 'Replace a faucet', 189, 320, 'repair'], ['pressure', 'Low water pressure', 89, 450, 'diag'], ['other', 'Something else', 89, 89, 'diag']],
  },
  'water-heaters': {
    name: 'Water heaters', noun: 'water heater', cta: 'water heater service', short: 'Repairs, flushes and same-day replacements', icon: 'drop', image: 'water-heater', tech: 'luis', from: 129, gas: true,
    alt: 'Ironwood technician checking the valves on a residential water heater',
    headline: 'Cold shower this morning? Hot water back, usually the same day.',
    intro: 'Luis has repaired and installed water heaters for 17 years: gas and electric, tank and tankless. He’ll tell you honestly whether yours is worth fixing, and most replacements are finished the day we come out.',
    fixes: ['No hot water, or not enough of it', 'Leaks from the tank, valves or fittings', 'Pilot lights and igniters that won’t stay lit', 'Rumbling or popping from sediment build-up', '40- and 50-gallon tank replacements', 'Tankless conversions and gas line work'],
    signs: ['Hot water runs out faster than it used to', 'Rusty or cloudy hot water', 'Popping or rumbling while it heats', 'Moisture or rust around the base of the tank', 'The heater is 10 or more years old'],
    prices: ['whFlush', 'whRepair', 'wh40', 'wh50', 'tankless'],
    problems: [['no-hot', 'No hot water', 189, 450, 'repair'], ['leaking', 'Leaking', 189, 480, 'repair'], ['noise', 'Strange noises', 129, 320, 'repair'], ['pilot', 'Pilot won’t stay lit', 189, 340, 'repair'], ['replace', 'Replace my water heater', 1650, null, 'replace'], ['flush', 'Yearly flush', 129, 129, 'tune']],
  },
  drains: {
    name: 'Drains', noun: 'drain', cta: 'drain cleaning', short: 'Clogs, backups and slow drains', icon: 'pipe', image: 'drain', tech: 'marcus', from: 149,
    alt: 'Ironwood technician clearing a clogged drain line with a drain cable',
    headline: 'Slow sink? Backed-up toilet? Cleared properly, not just poked at.',
    intro: 'We clear the clog with the right cable or jetter for the job, then tell you what caused it so it doesn’t come back next month. Main line backups get top priority.',
    fixes: ['Kitchen sinks clogged with grease and food', 'Hair-clogged tubs, showers and bathroom sinks', 'Toilets that back up or flush slowly', 'Main sewer line backups', 'Floor drains and laundry lines', 'Recurring clogs and drain odors'],
    signs: ['Water that drains slowly or pools around your feet', 'Gurgling from drains or toilets', 'A sewer smell inside the house', 'More than one drain backing up at once', 'Water coming up in the tub when you flush'],
    prices: ['drain', 'diagnostic', 'afterHours'],
    problems: [['sink', 'Slow or clogged sink', 149, 249, 'repair'], ['shower', 'Clogged tub or shower', 149, 229, 'repair'], ['toilet', 'Toilet backing up', 149, 249, 'repair'], ['main', 'Several drains backing up', 249, 549, 'repair'], ['smell', 'Sewer smell', 89, 300, 'diag']],
  },
  ac: {
    name: 'Air conditioning', noun: 'AC', cta: 'AC service', short: 'Repairs, tune-ups and new systems', icon: 'snowflake', image: 'hvac', tech: 'dana', from: 99,
    alt: 'Ironwood HVAC technician servicing an outdoor air conditioning unit beside a house',
    headline: 'Alabama summers don’t wait. Neither do we.',
    intro: 'Dana is NATE-certified and keeps the common parts on the van, so most AC repairs are finished on the first visit. When it’s time to replace, you get honest sizing and a firm installed price.',
    fixes: ['AC blowing warm or barely cool air', 'Systems that won’t start or trip the breaker', 'Frozen coils and water leaking inside', 'Capacitors, contactors and fan motors', 'Refrigerant leaks and recharges', 'Full system replacements and new installs'],
    signs: ['The house won’t get below 76° on a hot afternoon', 'Ice on the copper line at the outdoor unit', 'Water around the indoor unit or a wet ceiling spot', 'Buzzing, grinding or a burning smell', 'Power bills climbing all summer'],
    prices: ['acTune', 'acRepair', 'newAc', 'diagnostic'],
    problems: [['warm', 'Blowing warm air', 189, 650, 'repair'], ['off', 'Won’t turn on', 189, 550, 'repair'], ['leak', 'Leaking water inside', 189, 420, 'repair'], ['noise', 'Strange noise or smell', 189, 520, 'repair'], ['tune', 'Tune-up', 99, 99, 'tune'], ['replace', 'Replace my system', 5900, null, 'replace']],
  },
  heating: {
    name: 'Heating', noun: 'heating', cta: 'heating service', short: 'Furnace repairs and tune-ups', icon: 'flame', image: 'furnace', tech: 'dana', from: 99, gas: true,
    alt: 'Ironwood technician inspecting the burners inside a gas furnace',
    headline: 'Warm again before the next cold snap.',
    intro: 'Furnaces that sat idle all summer tend to act up on the first cold night. We repair gas furnaces quickly and safely, and check for carbon monoxide risks on every heating visit.',
    fixes: ['No heat or lukewarm air', 'Furnaces that turn on and off too often', 'Igniters, flame sensors and pilot problems', 'Blower motors and belts', 'Thermostat wiring and replacements', 'Carbon monoxide and gas safety checks'],
    signs: ['Rooms that never quite warm up', 'A furnace that clicks but doesn’t light', 'Short cycles every few minutes', 'A dusty or burning smell that lingers', 'A yellow burner flame instead of blue'],
    prices: ['furnaceTune', 'furnaceRepair', 'diagnostic', 'afterHours'],
    problems: [['no-heat', 'No heat', 189, 600, 'repair'], ['cycling', 'Turns on and off', 189, 450, 'repair'], ['noise', 'Strange noise or smell', 189, 480, 'repair'], ['thermostat', 'Thermostat trouble', 189, 350, 'repair'], ['tune', 'Tune-up', 99, 99, 'tune'], ['other', 'Something else', 89, 89, 'diag']],
  },
};

const URGENCY = {
  emergency: { label: 'Emergency now', note: 'Active leak, no heat or AC in extreme weather, sewage backup', icon: 'bolt' },
  today: { label: 'Today', note: 'Same-day when you book before 2 PM', icon: 'clock' },
  week: { label: 'This week', note: 'Any open window in the next 7 days', icon: 'calendar' },
  flexible: { label: 'Flexible', note: 'We’ll text if an earlier window opens', icon: 'chat' },
};

// The flat-rate price book (from the business facts). kind drives the Club member column.
const PRICES = {
  diagnostic: { label: 'Diagnostic visit', amount: 89, note: 'Credited toward the repair', kind: 'diag' },
  afterHours: { label: 'After-hours emergency dispatch', amount: 149, note: 'Nights, Sundays and holidays', kind: 'fee' },
  drain: { label: 'Drain clearing', amount: 149, from: true, kind: 'repair' },
  toilet: { label: 'Toilet repair', amount: 129, from: true, kind: 'repair' },
  leak: { label: 'Leak repair', amount: 179, from: true, kind: 'repair' },
  faucet: { label: 'Faucet replacement', amount: 189, from: true, note: 'Plus fixture', kind: 'repair' },
  whFlush: { label: 'Water heater flush', amount: 129, kind: 'tune' },
  whRepair: { label: 'Water heater repair', amount: 189, from: true, kind: 'repair' },
  wh40: { label: '40-gallon gas water heater replacement', amount: 1650, from: true, note: 'Installed', kind: 'replace' },
  wh50: { label: '50-gallon gas water heater replacement', amount: 1850, from: true, note: 'Installed', kind: 'replace' },
  tankless: { label: 'Tankless water heater replacement', amount: 3900, from: true, note: 'Installed', kind: 'replace' },
  acTune: { label: 'AC tune-up', amount: 99, kind: 'tune' },
  acRepair: { label: 'AC repair', amount: 189, from: true, kind: 'repair' },
  furnaceTune: { label: 'Furnace tune-up', amount: 99, kind: 'tune' },
  furnaceRepair: { label: 'Furnace repair', amount: 189, from: true, kind: 'repair' },
  newAc: { label: 'New AC system', amount: 5900, from: true, kind: 'replace' },
};
const PRICE_GROUPS = [
  ['Visits & fees', ['diagnostic', 'afterHours']],
  ['Plumbing & drains', ['drain', 'toilet', 'leak', 'faucet']],
  ['Water heaters', ['whFlush', 'whRepair', 'wh40', 'wh50', 'tankless']],
  ['Heating & cooling', ['acTune', 'acRepair', 'furnaceTune', 'furnaceRepair', 'newAc']],
];
const priceText = (p) => `${p.from ? 'from ' : ''}${money(p.amount)}`;
const memberPriceText = (p) => ({
  repair: `${p.from ? 'from ' : ''}${money(Math.round(p.amount * (1 - CLUB_OFF)))}`,
  tune: 'Included',
  fee: '$0',
  diag: money(p.amount),
  replace: 'Priority install',
}[p.kind]);

const REVIEWS = [
  { name: 'Kendra M.', area: 'Homewood', job: 'Water heater replacement', rating: 5, text: 'Our water heater quit on a Sunday night. Luis was in the garage by 8 the next morning, showed us the price before he touched anything and we had hot water by lunch.' },
  { name: 'Robert T.', area: 'Vestavia Hills', job: 'AC repair', rating: 5, text: 'Dana explained exactly why the AC kept freezing up, fixed it for less than the top of the estimate and texted me a photo of the old part.' },
  { name: 'Ashley P.', area: 'Mountain Brook', job: 'Leak repair', rating: 5, text: 'Marcus found a leak two other companies missed. Tidy, polite, shoe covers on, and the price didn’t change once.' },
  { name: 'Tasha W.', area: 'Hoover', job: 'Drain clearing', rating: 5, text: 'Booked online at 11, had a tech at 2. The tracker showed me exactly when he’d arrive, so I didn’t lose my whole afternoon waiting.' },
  { name: 'Greg L.', area: 'Pelham', job: 'Furnace repair', rating: 5, text: 'The Club pays for itself. Two tune-ups a year, and they waived the after-hours fee when our heat went out at 10 PM.' },
  { name: 'Maria S.', area: 'Crestwood', job: 'Plumbing', rating: 4, text: 'Upfront price and no upsell. Replaced two faucets and fixed a running toilet in one visit. Only wish they’d had an earlier window.' },
];

const FAQS = [
  ['How much does it cost for you to come out?', `A diagnostic visit is ${money(DIAGNOSTIC)}, and it’s credited toward the repair when you go ahead. You get a flat-rate price before any work starts, so the number you approve is the number you pay.`],
  ['Do you really offer same-day service?', 'Yes. Book before 2 PM and we’ll get you a same-day window whenever a technician is free. Emergencies are answered 24/7, day or night.'],
  ['What does upfront pricing mean?', 'We price by the job, not by the hour. Your technician diagnoses the problem, shows you the flat-rate price from our book and only starts once you say yes. No surprise overtime, no trip charges added later.'],
  ['Are your technicians licensed and insured?', 'Every Ironwood technician is licensed, insured and background-checked, and wears a company uniform and ID badge. We text you their name and photo before they arrive.'],
  ['What does your warranty cover?', 'Every repair comes with a 1-year labor warranty. If the same problem comes back within a year, we fix it at no charge. New equipment also carries the manufacturer’s parts warranty.'],
  ['Do you work nights and weekends?', `Arrival windows run Monday–Friday 8 AM–6 PM and Saturday 8 AM–4 PM. Nights, Sundays and holidays are for emergencies, with a ${money(AFTER_HOURS)} after-hours dispatch fee that’s waived for Ironwood Club members.`],
  ['Which areas do you serve?', `Birmingham, Homewood, Mountain Brook, Vestavia Hills, Hoover and Pelham. ZIP codes ${ALL_ZIPS.join(', ')}.`],
];

const EMERGENCIES = {
  leak: {
    label: 'Water leak', icon: 'drop', service: 'plumbing', title: 'Water leak or burst pipe',
    steps: [
      ['Shut off the water.', 'Find the main shutoff (where the water line enters the house, often in a crawlspace, garage or near the water heater) and turn it clockwise until it stops. For one fixture, use the small valve under the sink or behind the toilet.'],
      ['Keep water away from electricity.', 'If water is near outlets, cords or the electrical panel, don’t touch them. Switch off the breaker for that area only if you can reach the panel standing on dry ground.'],
      ['Drain the pipes.', 'Open a faucet at the lowest point of the house to let the remaining pressure out of the lines.'],
      ['Protect your things.', 'Move rugs, electronics and valuables out of the way, start soaking up water with towels and take photos for your insurance.'],
      ['Call us.', 'We answer 24/7 and can usually have a plumber on the way within the hour.'],
    ],
  },
  'water-heater': {
    label: 'Water heater leak', icon: 'drop', service: 'water-heaters', title: 'Leaking water heater',
    steps: [
      ['Turn off the cold-water supply.', 'Close the cold-water valve on top of the heater. If you can’t reach it or it won’t turn, shut off the home’s main water valve.'],
      ['Shut off the energy.', 'Gas heater: turn the gas control knob to OFF. Electric heater: switch off its breaker at the panel.'],
      ['Move valuables away from the water.', 'Put down towels, keep kids and pets clear and don’t try to drain a hot tank yourself.'],
      ['If you smell gas, leave the house.', 'Call the gas company’s emergency line or 911 from outside, not from inside the house.'],
      ['Call us.', 'Luis handles water heater emergencies and can often replace a tank the same day.'],
    ],
  },
  'no-heat': {
    label: 'No heat', icon: 'flame', service: 'heating', title: 'No heat',
    steps: [
      ['Check the thermostat.', 'Set it to Heat, a few degrees above room temperature, and replace the batteries if the screen is blank.'],
      ['Check the power.', 'Look for a tripped breaker labeled furnace, and make sure the switch near the unit (it looks like a light switch) is on.'],
      ['Check the filter.', 'A clogged filter can shut a furnace down on a safety limit. If you can’t see light through it, replace it.'],
      ['Carbon monoxide alarm or gas smell?', 'Leave the house now and call 911 or the gas company from outside. Don’t restart the furnace.'],
      ['Stay warm safely.', 'Close doors to unused rooms and never heat the house with an oven, grill or generator. Then call us.'],
    ],
  },
  'no-ac': {
    label: 'No AC', icon: 'snowflake', service: 'ac', title: 'No air conditioning',
    steps: [
      ['Check the thermostat.', 'Set it to Cool, a few degrees below room temperature, and replace the batteries if the screen is blank.'],
      ['Check both breakers.', 'The indoor unit and the outdoor unit each have one, plus a disconnect switch in a box next to the outdoor unit.'],
      ['Change a dirty filter.', 'Then make sure supply vents are open and not blocked by furniture.'],
      ['See ice? Let it thaw.', 'If the copper lines or coil are frozen, set the system to Off and the fan to On for a couple of hours.'],
      ['Keep cool while you wait.', 'Close blinds on the sunny side, run ceiling fans and check on older neighbors and pets. Then call us.'],
    ],
  },
  gas: {
    label: 'Gas smell', icon: 'alert', service: 'heating', title: 'You smell gas', danger: true,
    steps: [
      ['Leave the house right away.', 'Get everyone out, including pets. Don’t stop to look for the leak or open windows.'],
      ['Don’t create a spark.', 'Don’t flip light switches, unplug anything, start a car in an attached garage, use a lighter or make calls from inside.'],
      ['Move well away from the house.', 'Leave the door open behind you only if it’s safe, and keep neighbors back.'],
      ['Call 911 or the gas company from outside.', 'They make the area safe first. Do this before you call us.'],
      ['Then call Ironwood to repair it.', 'Once the gas company says it’s safe, Luis can find and repair the leak and test the lines.'],
    ],
  },
};

/* ---------- Pricing estimator jobs ---------- */
const opt = (k, label, lo, hi, extra = {}) => ({ k, label, lo, hi, ...extra });
const TIMING = { key: 'timing', label: 'When do you need it?', options: [opt('regular', 'Regular hours', 0, 0), opt('after', 'Nights, Sundays or holidays', 0, 0, { afterHours: true })] };
const JOBS = {
  'plumbing-repair': { name: 'Plumbing repair', icon: 'wrench', kind: 'repair', service: 'plumbing', groups: [
    { key: 'job', label: 'What needs fixing?', options: [opt('toilet', 'Toilet repair', 129, 289, { problem: 'toilet' }), opt('leak', 'Leak repair', 179, 450, { problem: 'leak' }), opt('faucet', 'Faucet replacement (plus fixture)', 189, 320, { problem: 'faucet' })] },
    { key: 'access', label: 'How easy is it to reach?', options: [opt('open', 'Out in the open', 0, 0), opt('cabinet', 'Under a sink or behind a panel', 0, 60), opt('wall', 'Inside a wall or ceiling', 60, 240)] },
    TIMING] },
  drain: { name: 'Drain clearing', icon: 'pipe', kind: 'repair', service: 'drains', groups: [
    { key: 'where', label: 'Which drain?', options: [opt('kitchen', 'Kitchen sink', 149, 249, { problem: 'sink' }), opt('bath', 'Bathroom sink, tub or shower', 149, 229, { problem: 'shower' }), opt('toilet', 'Toilet', 149, 249, { problem: 'toilet' }), opt('main', 'Main line (several drains slow)', 249, 549, { problem: 'main' })] },
    { key: 'history', label: 'Has it clogged before?', options: [opt('first', 'First time', 0, 0), opt('repeat', 'Keeps coming back', 0, 120)] },
    TIMING] },
  'wh-repair': { name: 'Water heater repair', icon: 'drop', kind: 'repair', service: 'water-heaters', groups: [
    { key: 'issue', label: 'What’s it doing?', options: [opt('no-hot', 'No hot water', 189, 450, { problem: 'no-hot' }), opt('leaking', 'Leaking at a valve or fitting', 189, 380, { problem: 'leaking' }), opt('pilot', 'Pilot or igniter won’t stay lit', 189, 340, { problem: 'pilot' }), opt('noise', 'Rumbling or popping', 129, 320, { problem: 'noise' })] },
    TIMING] },
  'wh-replace': { name: 'Water heater replacement', icon: 'drop', kind: 'replace', service: 'water-heaters', problem: 'replace', groups: [
    { key: 'type', label: 'Type and size', options: [opt('gas40', '40-gallon gas tank', 1650, 2150), opt('gas50', '50-gallon gas tank', 1850, 2400), opt('elec40', '40-gallon electric tank', 1650, 1950), opt('elec50', '50-gallon electric tank', 1850, 2200), opt('tankless', 'Tankless (gas)', 3900, 5200)] },
    { key: 'where', label: 'Where is it installed?', options: [opt('garage', 'Garage or basement', 0, 0), opt('closet', 'Closet or utility room', 100, 250), opt('attic', 'Attic', 250, 450)] }] },
  'hvac-repair': { name: 'AC or furnace repair', icon: 'flame', kind: 'repair', groups: [
    { key: 'system', label: 'Which system?', options: [opt('ac', 'Air conditioner', 0, 0), opt('furnace', 'Furnace', 0, 0)] },
    { key: 'issue', label: 'What’s happening?', options: [opt('comfort', 'Not cooling or not heating', 189, 600), opt('off', 'Won’t turn on', 189, 550), opt('cycling', 'Turns on and off', 189, 450), opt('noise', 'Strange noise or smell', 189, 480)] },
    { key: 'age', label: 'How old is the system?', options: [opt('new', 'Under 10 years', 0, 0), opt('mid', '10–15 years', 0, 150), opt('old', 'Over 15 years', 0, 300)] },
    TIMING] },
  'ac-replace': { name: 'New AC system', icon: 'snowflake', kind: 'replace', service: 'ac', problem: 'replace', groups: [
    { key: 'size', label: 'Home size (AC tonnage)', options: [opt('2', 'Up to 1,200 sq ft · 2 ton', 5900, 7100), opt('3', '1,200–1,800 sq ft · 3 ton', 6500, 7900), opt('4', '1,800–2,400 sq ft · 4 ton', 7200, 8800), opt('5', 'Over 2,400 sq ft · 5 ton', 7900, 9800)] },
    { key: 'efficiency', label: 'Efficiency', options: [opt('standard', 'Standard (14.3 SEER2)', 0, 0), opt('high', 'High efficiency (16+ SEER2)', 1200, 2200)] },
    { key: 'ducts', label: 'Ductwork', options: [opt('keep', 'Ducts are in good shape', 0, 0), opt('seal', 'Needs some repair or sealing', 400, 900)] }] },
  'tune-up': { name: 'Tune-ups', icon: 'gauge', kind: 'tune', groups: [
    { key: 'what', label: 'What should we service?', options: [opt('ac', 'AC tune-up', 99, 99), opt('furnace', 'Furnace tune-up', 99, 99), opt('flush', 'Water heater flush', 129, 129), opt('all', 'All three', 327, 327)] }] },
};

/* ---------- State (persisted with Kit.storage) ---------- */
const STATE_KEY = 'ironwood-state';
const DRAFT_KEY = 'ironwood-draft';
const state = { appointments: [], member: null, profile: {}, estimator: { job: 'wh-replace', opts: {} }, calc: { ac: true, furnace: true, flush: true, repairs: 600, emergencies: 1 }, ...storage.get(STATE_KEY, {}) };
const save = () => { storage.set(STATE_KEY, state); updateVisits(); };
const blankDraft = () => {
  const p = state.profile || {};
  return { step: 1, service: '', problem: '', urgency: '', street: p.street || '', unit: p.unit || '', zip: p.zip || '', access: '', day: '', window: '', name: p.name || '', phone: p.phone || '', email: p.email || '', contact: 'text', notes: '', photo: '', member: Boolean(state.member) };
};
let draft = { ...blankDraft(), ...storage.get(DRAFT_KEY, {}) };
const saveDraft = () => storage.set(DRAFT_KEY, draft);
let resched = { ref: null, day: '', window: '' };

/* ---------- Helpers ---------- */
const SQUARE = new Set(['tech-marcus', 'tech-dana', 'tech-luis']);
const img = (name, alt, { eager = false, sizes = '(max-width: 900px) 100vw, 50vw' } = {}) => {
  const [w, h, sm] = SQUARE.has(name) ? [1024, 1024, 512] : [1536, 1024, 768];
  return `<img src="img/${name}.webp" srcset="img/${name}-sm.webp ${sm}w, img/${name}.webp ${w}w" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
};
// Until the photos arrive, hide broken images so the colored frames hold the layout.
document.addEventListener('error', (event) => { if (event.target instanceof HTMLImageElement) event.target.classList.add('is-missing'); }, true);

const hash = (text) => { let h = 2166136261; for (const ch of text) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); };
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const longDate = (d) => formatDate(d, { weekday: 'long', month: 'long', day: 'numeric' });
const shortDate = (d) => formatDate(d, { weekday: 'short', month: 'short', day: 'numeric' });
const dayOffset = (date) => Math.round((new Date(date).setHours(0, 0, 0, 0) - startOfToday()) / 86400000);
const relDay = (date) => { const n = dayOffset(date); return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : formatDate(date, { weekday: 'long' }); };
const relDayShort = (date) => { const n = dayOffset(date); return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : formatDate(date, { weekday: 'short' }); };
const hourLabel = (h) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
const windowLabel = (s, e) => {
  const ms = s < 12 ? 'AM' : 'PM';
  const me = e < 12 ? 'AM' : 'PM';
  return ms === me ? `${s % 12 || 12}–${e % 12 || 12} ${me}` : `${hourLabel(s)}–${hourLabel(e)}`;
};
const formatPhone = (value) => {
  const digits = String(value).replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : String(value).trim();
};
const rangeText =(lo, hi) => (hi == null ? `From ${money(lo)}` : lo === hi ? money(lo) : `${money(lo)} – ${money(hi)}`);
// Regular hours: Mon–Fri 8 AM–6 PM, Sat 8 AM–4 PM. Everything else is after hours.
const isAfterHours = (d = new Date()) => {
  const h = d.getHours() + d.getMinutes() / 60;
  if (d.getDay() === 0) return true;
  if (d.getDay() === 6) return h < 8 || h >= 16;
  return h < 8 || h >= 18;
};
const season = () => { const m = new Date().getMonth(); return m >= 2 && m <= 5 ? 'ac' : m >= 8 && m <= 11 ? 'furnace' : null; };

/* Arrival windows: Mon–Fri five 2-hour windows, Sat two 4-hour windows, Sunday emergencies only. */
const WEEKDAY_WINDOWS = [[8, 10], [10, 12], [12, 14], [14, 16], [16, 18]];
const SATURDAY_WINDOWS = [[8, 12], [12, 16]];
const SAME_DAY_CUTOFF = 14;
function dayWindows(date, now = new Date()) {
  const key = dayKey(date);
  const today = key === dayKey(now);
  if (date.getDay() === 0) return { key, date, today, status: 'sunday', windows: [], open: 0 };
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const sameDayClosed = today && now.getHours() >= SAME_DAY_CUTOFF;
  const windows = (date.getDay() === 6 ? SATURDAY_WINDOWS : WEEKDAY_WINDOWS).map(([start, end]) => {
    const passed = today && (sameDayClosed || start * 60 < nowMin + 30);
    const full = !passed && hash(`${key}-${start}`) % 100 < 30;
    return { id: String(start), start, end, label: windowLabel(start, end), passed, full, open: !passed && !full };
  });
  if (!today && !windows.some((w) => w.open)) Object.assign(windows[windows.length - 1], { full: false, open: true });
  const open = windows.filter((w) => w.open).length;
  const status = sameDayClosed || (today && windows.every((w) => w.passed)) ? 'closed' : open ? 'open' : 'full';
  return { key, date, today, status, windows, open };
}
const nextDays = () => Array.from({ length: 7 }, (_, i) => dayWindows(addDays(startOfToday(), i)));
const firstOpen = () => {
  for (const day of nextDays()) { const w = day.windows.find((x) => x.open); if (w) return { day, w }; }
  return null;
};
const windowFor = (key, id) => {
  if (!key || !id) return null;
  const date = fromDayKey(key);
  if (Number.isNaN(date.getTime()) || dayOffset(date) < 0 || dayOffset(date) > 6) return null;
  return dayWindows(date).windows.find((w) => w.id === id && w.open) || null;
};

/* Upfront estimates */
function priceEstimate({ title, low, high, kind }, { member = false, afterHours = false } = {}) {
  // The 15% applies to repair work; a diagnostic-only visit stays at the flat diagnostic price.
  const off = member && (kind === 'repair' || (kind === 'diag' && high > low)) ? CLUB_OFF : 0;
  const included = member && kind === 'tune';
  const lo = included ? 0 : kind === 'diag' ? low : Math.round(low * (1 - off));
  const hi = high == null ? null : included ? 0 : Math.max(lo, Math.round(high * (1 - off)));
  const feeCharged = afterHours && !member ? AFTER_HOURS : 0;
  const feeSaved = afterHours && member ? AFTER_HOURS : 0;
  return {
    title, kind, low, high, lo, hi, off, included, member, afterHours, feeCharged, feeSaved,
    totalLo: lo + feeCharged, totalHi: hi == null ? null : hi + feeCharged,
    saveLo: low - lo + feeSaved, saveHi: high == null ? null : high - hi + feeSaved,
  };
}
const problemOf = (d) => {
  const svc = SERVICES[d.service];
  const p = svc?.problems.find(([key]) => key === d.problem);
  return p ? { key: p[0], label: p[1], low: p[2], high: p[3], kind: p[4] } : null;
};
const bookingEstimate = (d) => {
  const p = problemOf(d);
  if (!p) return null;
  return priceEstimate({ title: `${SERVICES[d.service].name}: ${p.label}`, ...p }, { member: d.member, afterHours: d.urgency === 'emergency' && isAfterHours() });
};
const savingsText = (est) => {
  if (est.included) return `Save ${money(est.low + est.feeSaved)}`;
  if (!est.saveLo && !est.saveHi) return '';
  if (est.saveHi == null || est.saveLo === est.saveHi) return `Save ${money(est.saveLo)}`;
  return est.saveLo ? `Save ${money(est.saveLo)}–${money(est.saveHi)}` : `Save up to ${money(est.saveHi)}`;
};
const kindWord = { repair: 'Estimated repair', diag: 'Diagnosis & repair', tune: 'Flat rate', replace: 'Replacement, installed' };
function estimateHtml(est, { compact = false } = {}) {
  if (!est) return '';
  const lines = [`<li><span>${kindWord[est.kind]}</span><span>${rangeText(est.low, est.high)}</span></li>`];
  if (est.included) lines.push('<li class="is-save"><span>Ironwood Club</span><span>Included</span></li>');
  else if (est.off) lines.push(`<li class="is-save"><span>Club member · 15% off</span><span>${est.kind === 'diag' ? `up to −${money(est.high - est.hi)}` : `−${money(est.low - est.lo)}${est.high == null ? '' : ` to −${money(est.high - est.hi)}`}`}</span></li>`);
  if (est.afterHours) lines.push(`<li class="${est.member ? 'is-save' : ''}"><span>After-hours emergency dispatch</span><span>${est.member ? `<s>${money(AFTER_HOURS)}</s> Waived` : money(AFTER_HOURS)}</span></li>`);
  const note = est.kind === 'replace'
    ? `Your technician measures and confirms a firm installed price on site. The ${money(DIAGNOSTIC)} visit is credited if you go ahead.`
    : est.kind === 'tune' ? (est.included ? 'Included in your Ironwood Club membership.' : 'Flat rate, with a written report on the condition of your system.')
      : `Includes the ${money(DIAGNOSTIC)} diagnostic visit, credited toward your repair. Decide not to go ahead and you pay only the ${money(DIAGNOSTIC)}.`;
  const saving = savingsText(est);
  return `
    <div class="estimate${compact ? ' is-compact' : ''}">
      <p class="estimate-label">${icon('tag')} Upfront estimate</p>
      <p class="estimate-range">${est.included && !est.feeCharged ? 'Included' : rangeText(est.totalLo, est.totalHi)}</p>
      ${saving && est.member ? `<p class="estimate-save">${icon('percent')} ${saving} as a Club member</p>` : ''}
      <ul class="estimate-lines">${lines.join('')}</ul>
      <p class="estimate-note">${note} Upfront price agreed before any work starts.</p>
    </div>`;
}

/* ---------- Shared pieces ---------- */
function updateVisits() {
  const link = document.getElementById('visits-link');
  const count = document.getElementById('visits-count');
  const upcoming = state.appointments.filter((a) => a.status === 'scheduled' && !a.completedAt).length;
  link.hidden = !state.appointments.length;
  document.getElementById('m-visits').hidden = !state.appointments.length;
  count.textContent = upcoming || '';
  count.hidden = !upcoming;
}
const findAppt = (ref) => state.appointments.find((a) => a.ref === ref);
const whenText = (a, { short = false } = {}) => {
  if (a.emergency) return short ? `${shortDate(new Date(a.createdAt))} · ASAP` : `${longDate(new Date(a.createdAt))}, emergency dispatch`;
  const d = fromDayKey(a.day);
  return `${short ? shortDate(d) : longDate(d)}, ${windowLabel(a.start, a.end)}`;
};
const techMini = (t, caption) => `<div class="tech-mini"><span class="tech-mini-photo">${img(t.image, `Portrait of ${t.name}`, { sizes: '64px' })}</span><p><small>${caption}</small><strong>${t.name}</strong><span>${t.role}</span></p></div>`;
const zipAnswer = (zip) => {
  if (!/^\d{5}$/.test(zip)) return `<span class="zip-muted">Enter a 5-digit ZIP code.</span>`;
  const area = areaFor(zip);
  if (!area) return `<span class="zip-no">${icon('pin')}<span><strong>Not yet, sorry.</strong> ${zip} is outside our area, but call ${PHONE} and we’ll point you to a pro we trust.</span></span>`;
  const first = firstOpen();
  return `<span class="zip-yes">${icon('check')}<span><strong>Yes! We serve ${esc(area)}.</strong> ${first ? `Next open window: ${relDay(first.day.date)}, ${first.w.label}.` : ''} <a href="#/book?zip=${zip}">Book now</a></span></span>`;
};
const sectionHead = (eyebrow, title, extra = '') => `<div class="section-head"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2></div>${extra}</div>`;
const techCard = (id) => {
  const t = TECHS[id];
  return `<article class="tech-card">
    <div class="tech-photo">${img(t.image, `Portrait of ${t.name}, Ironwood technician`, { sizes: '(max-width: 700px) 100vw, 400px' })}<span class="tech-badge">${icon('shield')} Background-checked</span></div>
    <div class="tech-body">
      <h3>${t.name}</h3>
      <p class="tech-role">${t.role}</p>
      <p class="tech-meta"><span>${stars(t.rating)} <strong>${t.rating.toFixed(1)}</strong></span><span>${t.years} years</span><span>${t.jobs} jobs</span></p>
      <p>${t.bio}</p>
    </div>
  </article>`;
};
const priceRows = (ids, { member = true } = {}) => ids.map((id) => {
  const p = PRICES[id];
  return `<tr role="row"><th scope="row" role="rowheader">${p.label}${p.note ? `<small>${p.note}</small>` : ''}</th><td class="num" role="cell">${priceText(p)}</td>${member ? `<td class="num member" role="cell" data-label="Club">${memberPriceText(p)}</td>` : ''}</tr>`;
}).join('');
const priceTable = (ids, caption) => `<div class="table-wrap"><table class="price-table"><caption class="visually-hidden">${caption}</caption><thead><tr><th scope="col">Service</th><th scope="col" class="num">Price</th><th scope="col" class="num">Club member</th></tr></thead><tbody>${priceRows(ids)}</tbody></table></div>`;

/* ---------- Home ---------- */
function home() {
  const first = firstOpen();
  return {
    title: 'Ironwood Plumbing & Air — Plumbing, heating & cooling in Birmingham, AL',
    html: `
    <section class="hero">
      <div class="hero-media">${img('hero', 'An Ironwood technician carrying a tool bag up the driveway of a brick home at sunrise, a white service van parked alongside', { eager: true, sizes: '100vw' })}</div>
      <div class="wrap hero-inner">
        <div class="hero-copy">
          <p class="hero-kicker">${icon('home')} Family-owned in Birmingham since 2004</p>
          <h1>No hot water?<br> No cool air?<br> <span>We’re on the way.</span></h1>
          <p class="hero-lead">Plumbing, heating and cooling repairs with upfront flat-rate prices, background-checked technicians and same-day service when you book before 2 PM.</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="#/book">Book service ${icon('arrow')}</a>
            <a class="btn btn-light btn-lg" href="${TEL}">${icon('phone')} Call ${PHONE}</a>
          </div>
          <p class="hero-proof">${stars(4.9)}<span><strong>4.9</strong> from 1,286 neighbors <em>· sample rating</em></span></p>
          <form class="zip-card" data-form="zip-check" novalidate>
            <label for="zip-check"><strong>Do you serve my area?</strong><span>Enter your ZIP for an instant answer.</span></label>
            <div class="zip-row">
              <input id="zip-check" name="zipcheck" inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="ZIP code, e.g. 35209" data-input="zip-live">
              <button class="btn btn-primary" type="submit">Check</button>
            </div>
            <p class="zip-answer" id="zip-answer" aria-live="polite">${first ? `<span class="zip-muted">${icon('clock')} Next open window: <strong>${relDay(first.day.date)}, ${first.w.label}</strong></span>` : ''}</p>
          </form>
        </div>
      </div>
    </section>
    <section class="badges" aria-label="Why homeowners choose Ironwood">
      <ul class="wrap badge-row">
        <li><span class="badge-ico">${icon('shield')}</span><span><strong>Licensed &amp; insured</strong><small>Background-checked techs</small></span></li>
        <li><span class="badge-ico">${icon('tag')}</span><span><strong>Upfront pricing</strong><small>Flat rate, approved first</small></span></li>
        <li><span class="badge-ico">${icon('award')}</span><span><strong>1-year labor warranty</strong><small>On every repair</small></span></li>
        <li><span class="badge-ico is-orange">${icon('clock')}</span><span><strong>24/7 emergencies</strong><small>A real person answers</small></span></li>
      </ul>
    </section>
    <section class="section section-steel section-after-badges">
      <div class="wrap">
        ${sectionHead('What we fix', 'One call for pipes, drains, hot water and air.', '<a class="link-arrow" href="#/services">All services <span aria-hidden="true">→</span></a>')}
        <div class="service-grid">
          ${Object.entries(SERVICES).map(([slug, s]) => `
            <a class="service-card" href="#/services/${slug}">
              <span class="service-media">${img(s.image, '', { sizes: '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 400px' })}</span>
              <span class="service-body">
                <span class="icon-tile">${icon(s.icon)}</span>
                <strong>${s.name}</strong>
                <span>${s.short}</span>
                <span class="service-from"><span>From <b>${money(s.from)}</b></span><span class="go" aria-hidden="true">${icon('arrow')}</span></span>
              </span>
            </a>`).join('')}
          <a class="service-card is-diag" href="#/book">
            <span class="service-body">
              <span class="icon-tile is-orange">${icon('search')}</span>
              <strong>Not sure what’s wrong?</strong>
              <span>Book a diagnostic visit. A technician finds the cause and gives you a flat-rate price before any work starts.</span>
              <span class="diag-price"><b>${money(DIAGNOSTIC)}</b> credited toward the repair</span>
              <span class="service-from"><span>Book a diagnostic</span><span class="go" aria-hidden="true">${icon('arrow')}</span></span>
            </span>
          </a>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="section-head is-center"><div><p class="eyebrow">How it works</p><h2>Booked in two minutes. Fixed right the first time.</h2></div></div>
        <ol class="steps">
          <li><span class="step-num">1</span><h3>Tell us what’s wrong</h3><p>Book online or call. Pick the problem, your address and a two-hour arrival window that suits your day.</p></li>
          <li><span class="step-num">2</span><h3>Track your technician</h3><p>We text your tech’s name and photo, then a live map when they’re on the way. No waiting around all afternoon.</p></li>
          <li><span class="step-num">3</span><h3>Approve the price, then we fix it</h3><p>You see a flat-rate price before any work starts, and the ${money(DIAGNOSTIC)} diagnostic is credited toward the repair.</p></li>
        </ol>
      </div>
    </section>
    <section class="price-band">
      <div class="wrap price-band-grid">
        <div>
          <p class="eyebrow on-dark">Upfront pricing</p>
          <h2>Know the price before we pick up a wrench.</h2>
          <p>Every job is priced from our flat-rate book, not by the hour. You approve it first, and it doesn’t change if the job takes longer than we thought.</p>
          <div class="band-actions"><a class="btn btn-orange btn-lg" href="#/pricing">Get an instant estimate ${icon('arrow')}</a></div>
        </div>
        <ul class="price-list">
          ${['diagnostic', 'drain', 'toilet', 'acTune', 'whRepair', 'wh40'].map((id) => `<li><span>${PRICES[id].label}${PRICES[id].note ? `<small>${PRICES[id].note}</small>` : ''}</span><strong>${priceText(PRICES[id])}</strong></li>`).join('')}
        </ul>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        ${sectionHead('Meet the crew', 'The people who’ll show up at your door.', '<p class="section-note">Every Ironwood tech is licensed, insured and background-checked. You’ll get their name and photo by text before they arrive.</p>')}
        <div class="tech-grid">${Object.keys(TECHS).map(techCard).join('')}</div>
      </div>
    </section>
    <section class="section section-steel">
      <div class="wrap reviews-grid">
        <div class="rating-card">
          <p class="eyebrow on-dark">Reviews</p>
          <p class="rating-big">4.9</p>
          ${stars(4.9)}
          <p class="rating-count">Average from 1,286 reviews</p>
          <ul class="bars">${[[5, 91], [4, 6], [3, 2], [2, 0], [1, 1]].map(([n, pct]) => `<li><span>${n}★</span><span class="bar"><span style="width:${pct}%"></span></span><span>${pct}%</span></li>`).join('')}</ul>
          <p class="sample-note">Sample reviews and ratings written for this demo.</p>
        </div>
        <div>
          <h2 class="reviews-title">Neighbors say it better than we can.</h2>
          <div class="review-list">
            ${REVIEWS.slice(0, 4).map((r) => `
              <figure class="review">
                ${stars(r.rating)}
                <blockquote>“${r.text}”</blockquote>
                <figcaption><span class="avatar" aria-hidden="true">${r.name[0]}</span><span><strong>${r.name}</strong><small>${r.area} · ${r.job}</small></span><span class="sample-tag">Sample</span></figcaption>
              </figure>`).join('')}
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="wrap club-teaser">
        <div>
          <p class="eyebrow">Ironwood Club</p>
          <h2>${money(CLUB_MONTHLY, true)} a month keeps the whole house running.</h2>
          <p class="lead">Two seasonal tune-ups, a yearly plumbing check and member pricing on every repair. Most members save more than the membership costs in the first year.</p>
          <ul class="checks">
            <li>${icon('check')} AC tune-up in spring, furnace tune-up in fall</li>
            <li>${icon('check')} Yearly plumbing inspection with water heater flush</li>
            <li>${icon('check')} 15% off repairs and no after-hours fee</li>
            <li>${icon('check')} Priority scheduling when the weather turns</li>
          </ul>
          <a class="btn btn-primary btn-lg" href="#/club">Explore the Club ${icon('arrow')}</a>
        </div>
        ${memberCardVisual()}
      </div>
    </section>
    <section class="section section-steel">
      <div class="wrap area-grid">
        <div>
          <p class="eyebrow">Service area</p>
          <h2>Serving the Magic City and over the mountain.</h2>
          <p class="lead">Our vans run out of a shop near Oxmoor Road, so most of the area is 30 minutes or less away.</p>
          <a class="btn btn-outline" href="#/book">${icon('pin')} Check my address</a>
        </div>
        <ul class="area-list">
          ${AREAS.map(([city, zips, hoods]) => `<li><strong>${icon('pin')} ${city}</strong><small>${hoods}</small><span class="zip-chips">${zips.map((z) => `<span>${z}</span>`).join('')}</span></li>`).join('')}
        </ul>
      </div>
    </section>
    <section class="section">
      <div class="wrap faq-grid">
        <div>
          <p class="eyebrow">FAQ</p>
          <h2>Good questions, straight answers.</h2>
          <p class="lead">Still wondering about something? Call <a href="${TEL}">${PHONE}</a>. A real person answers, day or night.</p>
        </div>
        <div class="faq">${FAQS.map(([q, a]) => `<details><summary>${q}<span class="faq-icon" aria-hidden="true"></span></summary><p>${a}</p></details>`).join('')}</div>
      </div>
    </section>
    ${ctaBand()}`,
  };
}

const memberCardVisual = () => `
  <div class="member-visual" aria-hidden="true">
    <div class="member-card">
      <div class="member-card-top"><span class="member-mark">${brandMark()}</span><span>IRONWOOD CLUB</span></div>
      <p class="member-card-big">15<span>%</span></p>
      <p class="member-card-line">off repairs · no after-hours fee · priority</p>
      <div class="member-card-bottom"><span>${state.member ? esc(state.member.name) : 'Member since 2026'}</span><span>${money(CLUB_MONTHLY, true)}/mo</span></div>
    </div>
    <div class="member-chip">${icon('check')} Tune-ups included</div>
  </div>`;
const brandMark = () => '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" rx="11" fill="#0d1b33"/><path d="M20 6.5c5.3 6.4 9.6 11.7 9.6 17a9.6 9.6 0 0 1-19.2 0c0-5.3 4.3-10.6 9.6-17z" fill="#1f6fff"/><path d="M20 19.5c2.2 2.8 4.1 5 4.1 7.2a4.1 4.1 0 0 1-8.2 0c0-2.2 1.9-4.4 4.1-7.2z" fill="#ff7a1a"/></svg>';
const ctaBand = (title = 'Something leaking, rattling or not heating?') => `
  <section class="cta-band">
    <div class="wrap cta-inner">
      <div><h2>${title}</h2><p>Book online in two minutes, or call. We answer 24/7.</p></div>
      <div class="cta-actions"><a class="btn btn-light btn-lg" href="#/book">Book service ${icon('arrow')}</a><a class="btn btn-orange btn-lg" href="${TEL}">${icon('phone')} ${PHONE}</a></div>
    </div>
  </section>`;

/* ---------- Services ---------- */
function servicesPage() {
  return {
    title: 'Services — Ironwood Plumbing & Air',
    html: `
    <section class="page-head">
      <div class="wrap">
        <p class="eyebrow on-dark">Services</p>
        <h1>Plumbing, drains, water heaters, heating and air.</h1>
        <p class="lead">Five crews, one number. Every job gets an upfront flat-rate price and a 1-year labor warranty.</p>
      </div>
    </section>
    <section class="section section-tight">
      <div class="wrap svc-list">
        ${Object.entries(SERVICES).map(([slug, s], i) => `
          <article class="svc-row${i % 2 ? ' is-flip' : ''}">
            <a class="svc-row-media" href="#/services/${slug}" tabindex="-1" aria-hidden="true">${img(s.image, '', { sizes: '(max-width: 900px) 100vw, 560px' })}</a>
            <div class="svc-row-body">
              <div class="svc-row-top"><span class="icon-tile">${icon(s.icon)}</span><span class="from-pill">From ${money(s.from)}</span></div>
              <h2><a href="#/services/${slug}">${s.name}</a></h2>
              <p>${s.intro}</p>
              <ul class="list-check compact">${s.fixes.slice(0, 3).map((f) => `<li>${icon('check')} ${f}</li>`).join('')}</ul>
              <div class="row-actions"><a class="btn btn-primary" href="#/book?service=${slug}">Book ${s.cta}</a><a class="link-arrow" href="#/services/${slug}">Prices &amp; details <span aria-hidden="true">→</span></a></div>
            </div>
          </article>`).join('')}
      </div>
    </section>
    ${ctaBand('Not sure which service you need?')}`,
  };
}

function serviceDetail({ params }) {
  const s = SERVICES[params.slug];
  if (!s) return null;
  const t = TECHS[s.tech];
  const review = REVIEWS.find((r) => (s.tech === 'marcus' ? /Leak|Drain|Plumbing/.test(r.job) : s.tech === 'dana' ? /AC|Furnace/.test(r.job) : /Water heater/.test(r.job)));
  return {
    title: `${s.name} in Birmingham, AL — Ironwood Plumbing & Air`,
    html: `
    <section class="svc-hero">
      <div class="wrap svc-hero-grid">
        <div class="svc-hero-copy">
          <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><a href="#/services">Services</a><span aria-hidden="true">/</span><span aria-current="page">${s.name}</span></nav>
          <p class="eyebrow on-dark"><span class="eyebrow-ico">${icon(s.icon)}</span>${s.name}</p>
          <h1>${s.headline}</h1>
          <p class="lead">${s.intro}</p>
          <div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/book?service=${params.slug}">Book ${s.cta} ${icon('arrow')}</a><a class="btn btn-ghost-light btn-lg" href="${TEL}">${icon('phone')} ${PHONE}</a></div>
          <ul class="mini-badges"><li>${icon('check')} Upfront flat-rate price</li><li>${icon('check')} Same day before 2 PM</li><li>${icon('check')} 1-year labor warranty</li></ul>
        </div>
        <div class="svc-hero-media">${img(s.image, s.alt, { eager: true, sizes: '(max-width: 900px) 100vw, 50vw' })}</div>
      </div>
    </section>
    <section class="section">
      <div class="wrap svc-cols">
        <div class="info-card"><h2>What we fix</h2><ul class="list-check">${s.fixes.map((f) => `<li>${icon('check')} ${f}</li>`).join('')}</ul></div>
        <div class="info-card is-signs"><h2>Common signs you need us</h2><ul class="list-signs">${s.signs.map((f) => `<li>${icon('alert')} ${f}</li>`).join('')}</ul>
          ${s.gas ? '<p class="gas-line"><strong>Smell gas?</strong> Leave the house first, then call 911 or the gas company from outside. <a href="#/emergency?topic=gas">What to do</a></p>' : ''}
        </div>
      </div>
    </section>
    <section class="section section-steel">
      <div class="wrap svc-price-grid">
        <div>
          <p class="eyebrow">Flat-rate prices</p>
          <h2>${s.noun[0].toUpperCase()}${s.noun.slice(1)} prices, upfront.</h2>
          <p class="lead">Starting prices from our flat-rate book. Your technician confirms the exact price before any work starts, and Ironwood Club members save 15% on repairs.</p>
          ${priceTable(s.prices, `${s.name} prices`)}
          <div class="row-actions"><a class="btn btn-primary" href="#/book?service=${params.slug}">Book ${s.cta}</a><a class="link-arrow" href="#/pricing">Get a detailed estimate <span aria-hidden="true">→</span></a></div>
        </div>
        <aside class="tech-feature">
          <p class="eyebrow">Your likely technician</p>
          ${techCard(s.tech)}
          ${review ? `<figure class="review is-small">${stars(review.rating)}<blockquote>“${review.text}”</blockquote><figcaption><span><strong>${review.name}</strong><small>${review.area} · ${review.job}</small></span><span class="sample-tag">Sample</span></figcaption></figure>` : ''}
        </aside>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        ${sectionHead('More services', 'We handle the rest of the house, too.')}
        <div class="mini-services">${Object.entries(SERVICES).filter(([slug]) => slug !== params.slug).map(([slug, x]) => `<a class="mini-service" href="#/services/${slug}"><span class="icon-tile is-small">${icon(x.icon)}</span><span><strong>${x.name}</strong><small>${x.short}</small></span><span class="go" aria-hidden="true">${icon('arrow')}</span></a>`).join('')}</div>
      </div>
    </section>
    ${ctaBand(`Need ${s.cta} today?`)}`,
  };
}

/* ---------- Booking ---------- */
const STEPS = ['Problem', 'Address', 'Time', 'Contact', 'Review'];
function maxStep(d) {
  if (!problemOf(d) || !URGENCY[d.urgency]) return 1;
  if (!d.street.trim() || !areaFor(d.zip)) return 2;
  if (d.urgency !== 'emergency' && !windowFor(d.day, d.window)) return 3;
  if (!d.name.trim() || !d.phone.trim() || !d.email.trim()) return 4;
  return 5;
}
// Links like #/book?service=ac preselect the booker once; the query is then dropped from the address.
let appliedQuery = '';
function applyBookQuery(query) {
  const qs = query.toString();
  if (!qs) { appliedQuery = ''; return false; }
  if (qs === appliedQuery) return false;
  appliedQuery = qs;
  const service = query.get('service');
  const problem = query.get('problem');
  const urgency = query.get('urgency');
  const zip = query.get('zip');
  if (!service && !problem && !urgency && !zip) return false;
  if (SERVICES[service] && draft.service !== service) Object.assign(draft, { service, problem: '' });
  if (problem && SERVICES[draft.service]?.problems.some(([key]) => key === problem)) draft.problem = problem;
  if (URGENCY[urgency]) draft.urgency = urgency;
  if (/^\d{5}$/.test(zip || '')) draft.zip = zip;
  draft.step = 1;
  saveDraft();
  return true;
}
const whenDraft = (d) => {
  if (d.urgency === 'emergency') return 'ASAP · emergency dispatch';
  const w = windowFor(d.day, d.window);
  return w ? `${relDayShort(fromDayKey(d.day))}, ${formatDate(fromDayKey(d.day), { month: 'short', day: 'numeric' })} · ${w.label}` : '';
};

function bookPage({ query }) {
  const fromQuery = applyBookQuery(query);
  const d = draft;
  const step = Math.max(1, Math.min(d.step || 1, maxStep(d)));
  d.step = step;
  const views = [null, stepProblem, stepAddress, stepTime, stepContact, stepReview];
  return {
    title: `Book service (step ${step} of 5) — Ironwood Plumbing & Air`,
    html: `
    <section class="book-section">
      <div class="wrap book-grid">
        <div class="book-main">
          <div class="book-top">
            <p class="eyebrow"><span>Book service<span class="eyebrow-extra"> · about 2 minutes</span></span></p>
            ${d.service || d.urgency ? '<button type="button" class="text-btn small" data-action="book-reset">Start over</button>' : ''}
          </div>
          <h1>Let’s get you on the schedule.</h1>
          <ol class="progress" aria-label="Booking progress">
            ${STEPS.map((label, i) => {
              const n = i + 1;
              const cls = n < step ? 'is-done' : n === step ? 'is-current' : '';
              const inner = `<span class="progress-bar"></span><span class="progress-label"><span class="progress-num">${n < step ? icon('check') : n}</span>${label}</span>`;
              return `<li class="${cls}" ${n === step ? 'aria-current="step"' : ''}>${n < step ? `<button type="button" data-action="goto-step" data-step="${n}" aria-label="Step ${n}, ${label}: completed. Edit">${inner}</button>` : inner}</li>`;
            }).join('')}
          </ol>
          <p class="visually-hidden" aria-live="polite">Step ${step} of 5: ${STEPS[step - 1]}</p>
          ${views[step](d)}
        </div>
        <aside class="book-aside${step === 5 ? ' is-review' : ''}" aria-label="Your visit summary">${bookAside(d, step)}</aside>
      </div>
    </section>`,
    mount: () => {
      if (fromQuery) { try { history.replaceState(history.state, '', '#/book'); } catch { /* sandboxed preview */ } }
    },
  };
}

function bookAside(d, step = 1) {
  const svc = SERVICES[d.service];
  const prob = problemOf(d);
  const est = bookingEstimate(d);
  const area = areaFor(d.zip);
  return `
    <div class="summary-card">
      <h2>Your visit</h2>
      <dl class="summary-list">
        <div><dt>Service</dt><dd>${svc ? `${svc.name}${prob ? ` · ${prob.label}` : ''}` : '<span class="muted">Not chosen yet</span>'}</dd></div>
        <div><dt>How soon</dt><dd>${URGENCY[d.urgency] ? URGENCY[d.urgency].label : '<span class="muted">—</span>'}</dd></div>
        <div><dt>Where</dt><dd id="aside-where">${area ? `${area}, ${d.zip}` : '<span class="muted">—</span>'}</dd></div>
        <div><dt>Arrival</dt><dd>${whenDraft(d) || '<span class="muted">—</span>'}</dd></div>
      </dl>
      ${svc ? techMini(TECHS[svc.tech], 'Your likely technician') : ''}
      ${step === 5 ? `<ol class="next-steps is-compact"><li><strong>Book now</strong> and get a confirmation right away.</li><li><strong>We text</strong> when your tech is on the way.</li><li><strong>Approve the price</strong> before any work starts.</li></ol>` : est ? estimateHtml(est, { compact: true }) : `<p class="summary-empty">${icon('tag')} Pick a service and problem to see your upfront estimate.</p>`}
    </div>
    <div class="help-card">${icon('phone')}<p><strong>Rather talk to a person?</strong> Call <a href="${TEL}">${PHONE}</a>, answered 24/7.</p></div>`;
}

const formActions = (label, { back = true } = {}) => `<div class="form-actions">${back ? `<button type="button" class="btn btn-outline" data-action="step-back">${icon('back')} Back</button>` : '<span></span>'}<button class="btn btn-primary btn-lg" type="submit">${label} ${icon('arrow')}</button></div>`;

function emergencyNotice() {
  const after = isAfterHours();
  return `
    <div class="notice notice-urgent" role="note">
      <span class="notice-ico">${icon('alert')}</span>
      <div>
        <h3>Emergency? Here’s what happens next.</h3>
        <p>We dispatch the next available technician, usually arriving within 60–90 minutes, 24/7. For an active leak, shut off the main water valve now. <strong>If you smell gas, leave the house and call 911 or the gas company from outside first.</strong></p>
        <p class="fee-note">${icon('clock')}<span>After-hours emergency dispatch is ${money(AFTER_HOURS)} on nights, Sundays and holidays, waived for Ironwood Club members. ${after ? '<strong>It’s after hours right now, so the fee applies to this visit.</strong>' : '<strong>It’s regular business hours right now, so no after-hours fee applies.</strong>'}</span></p>
        <div class="notice-actions"><a class="btn btn-orange" href="${TEL}">${icon('phone')} Faster by phone: ${PHONE}</a><a class="link-arrow" href="#/emergency">What to do right now <span aria-hidden="true">→</span></a></div>
      </div>
    </div>`;
}

function stepProblem(d) {
  const svc = SERVICES[d.service];
  return `
  <form data-form="step-problem" novalidate>
    <h2 class="step-title">What’s going on?</h2>
    <p class="step-lead">Pick the closest match. Your technician confirms everything on site.</p>
    <fieldset>
      <legend>What do you need help with?</legend>
      <div class="svc-choices">
        ${Object.entries(SERVICES).map(([slug, s]) => `
          <label class="svc-choice"><input type="radio" name="service" id="svc-${slug}" value="${slug}" data-change="draft-choice" required data-required="Choose the kind of service you need." ${d.service === slug ? 'checked' : ''}>
            <span class="svc-choice-box"><span class="icon-tile is-small">${icon(s.icon)}</span><strong>${s.name}</strong></span></label>`).join('')}
      </div>
    </fieldset>
    ${svc ? `
    <fieldset>
      <legend>What’s happening with your ${svc.noun}?</legend>
      <div class="chips">${svc.problems.map(([key, label]) => `<label class="chip"><input type="radio" name="problem" id="prob-${key}" value="${key}" data-change="draft-choice" required data-required="Choose what’s happening." ${d.problem === key ? 'checked' : ''}><span>${label}</span></label>`).join('')}</div>
      ${svc.gas ? `<p class="safety-line">${icon('alert')} Smell gas? Leave the house first, then call 911 or the gas company from outside.</p>` : ''}
    </fieldset>` : ''}
    <fieldset>
      <legend>How soon do you need us?</legend>
      <div class="urgency">
        ${Object.entries(URGENCY).map(([key, u]) => `
          <label class="urg${key === 'emergency' ? ' is-emergency' : ''}"><input type="radio" name="urgency" id="urg-${key}" value="${key}" data-change="draft-choice" required data-required="Tell us how soon you need us." ${d.urgency === key ? 'checked' : ''}>
            <span class="urg-box"><strong>${icon(u.icon)} ${u.label}</strong><small>${u.note}</small></span></label>`).join('')}
      </div>
    </fieldset>
    ${d.urgency === 'emergency' ? emergencyNotice() : ''}
    ${formActions('Continue', { back: false })}
  </form>`;
}

function zipStatus(zip) {
  if (!/^\d{5}$/.test(zip || '')) return `<p class="zip-hint">${icon('pin')} We serve Birmingham, Homewood, Mountain Brook, Vestavia Hills, Hoover and Pelham.</p>`;
  const area = areaFor(zip);
  if (area) return `<p class="zip-ok">${icon('check')} Good news: we serve ${esc(area)} (${zip}). Technicians are working nearby this week.</p>`;
  return `
    <div class="zip-out" id="zip-out" tabindex="-1">
      <span class="zip-out-ico">${icon('pin')}</span>
      <div>
        <h3>We’re not in ${zip} yet.</h3>
        <p>Ironwood covers Birmingham, Homewood, Mountain Brook, Vestavia Hills, Hoover and Pelham. Call us anyway: we’re glad to recommend a licensed pro we trust near you.</p>
        <p class="zip-list"><strong>ZIPs we serve:</strong> ${ALL_ZIPS.join(', ')}</p>
        <div class="notice-actions"><a class="btn btn-outline btn-sm" href="${TEL}">${icon('phone')} Call ${PHONE}</a><button type="button" class="text-btn" data-action="focus-zip">Try a different ZIP</button></div>
      </div>
    </div>`;
}

function stepAddress(d) {
  return `
  <form data-form="step-address" novalidate>
    <h2 class="step-title">Where should we come?</h2>
    <p class="step-lead">We check your ZIP against our service area as you type.</p>
    <div class="field"><label for="b-street">Street address</label><input id="b-street" name="street" autocomplete="street-address" required data-required="Enter the street address for the visit." data-input="draft-text" value="${esc(d.street)}"></div>
    <div class="field-row">
      <div class="field"><label for="b-unit">Apt, unit or gate code <span class="optional">(optional)</span></label><input id="b-unit" name="unit" autocomplete="address-line2" data-input="draft-text" value="${esc(d.unit)}"></div>
      <div class="field"><label for="b-zip">ZIP code</label><input id="b-zip" name="zip" inputmode="numeric" autocomplete="postal-code" maxlength="5" required pattern="\\d{5}" data-pattern-message="Enter a 5-digit ZIP code." data-required="Enter your ZIP code so we can check your area." data-input="draft-zip" value="${esc(d.zip)}"></div>
    </div>
    <div class="zip-result" id="zip-result" aria-live="polite">${zipStatus(d.zip)}</div>
    <div class="field"><label for="b-access">Anything that helps us get in? <span class="optional">(optional)</span></label><textarea id="b-access" name="access" rows="2" data-input="draft-text" placeholder="Friendly dog in the backyard, park on the street, use the side door…">${esc(d.access)}</textarea></div>
    ${formActions('Continue')}
  </form>`;
}

function timePicker(sel, target, { preferToday = false } = {}) {
  const days = nextDays();
  const selected = days.find((x) => x.key === sel.day) || (preferToday ? days[0] : days.find((x) => x.status === 'open')) || days[0];
  const chip = (x) => {
    const sub = x.status === 'sunday' ? 'Emergency only' : x.status === 'closed' ? 'Same-day closed' : x.status === 'full' ? 'Fully booked' : `${x.open} open`;
    const on = x.key === selected.key;
    return `<button type="button" id="day-${x.key}" class="day-chip is-${x.status}${on ? ' is-selected' : ''}" data-action="pick-day" data-target="${target}" data-day="${x.key}" aria-pressed="${on}"><span>${relDayShort(x.date)}</span><strong>${formatDate(x.date, { month: 'short', day: 'numeric' })}</strong><small>${sub}</small></button>`;
  };
  const first = firstOpen();
  const earliest = first ? `<button type="button" class="btn btn-outline btn-sm" data-action="pick-day" data-target="${target}" data-day="${first.day.key}" data-window="${first.w.id}">Earliest: ${relDayShort(first.day.date)} ${first.w.label}</button>` : '';
  let panel;
  if (selected.status === 'sunday') {
    panel = `<div class="day-note is-orange">${icon('bolt')}<div><h3>Sundays are for emergencies only.</h3><p>Our on-call technicians handle emergencies around the clock. Call ${PHONE}${target === 'draft' ? ' or switch this booking to emergency service' : ''}, or choose another day for a regular visit.</p><div class="notice-actions">${target === 'draft' ? '<button type="button" class="btn btn-orange btn-sm" data-action="set-urgency" data-value="emergency">Switch to emergency</button>' : ''}${earliest}</div></div></div>`;
  } else if (selected.status === 'closed') {
    panel = `<div class="day-note">${icon('clock')}<div><h3>Same-day booking closes at 2 PM.</h3><p>Today’s windows are no longer available online. If it can’t wait, we still answer 24/7 at ${PHONE}.</p><div class="notice-actions">${earliest}${target === 'draft' ? '<button type="button" class="text-btn" data-action="set-urgency" data-value="emergency">It can’t wait: request emergency service</button>' : ''}</div></div></div>`;
  } else {
    panel = `
      <fieldset class="windows" id="windows">
        <legend>Arrival windows for ${longDate(selected.date)}</legend>
        <div class="window-grid">
          ${selected.windows.map((w) => {
            const checked = sel.day === selected.key && sel.window === w.id;
            return `<label class="window${w.open ? '' : ' is-off'}"><input type="radio" name="window" id="win-${w.id}" value="${w.id}" data-change="pick-window" data-target="${target}" data-day="${selected.key}" ${w.open ? '' : 'disabled'} ${checked ? 'checked' : ''}><span><strong>${w.label}</strong><small>${w.open ? (selected.today ? 'Same-day' : 'Available') : w.full ? 'Full' : 'Passed'}</small></span></label>`;
          }).join('')}
        </div>
        ${selected.today ? `<p class="hint">${icon('clock')} Same-day windows book until 2 PM, subject to availability.</p>` : ''}
      </fieldset>`;
  }
  return `<div class="day-strip" role="group" aria-label="Choose a day">${days.map(chip).join('')}</div><div class="window-panel" id="window-panel">${panel}</div>`;
}

function stepTime(d) {
  if (d.urgency === 'emergency') {
    const after = isAfterHours();
    return `
    <form data-form="step-time" novalidate>
      <h2 class="step-title">We’ll send the next available technician.</h2>
      <p class="step-lead">Emergency visits skip the calendar. Dispatch calls you within 15 minutes to confirm.</p>
      <div class="dispatch-card">
        <span class="dispatch-ico">${icon('van')}</span>
        <div>
          <p class="dispatch-eta">Arrival in about <strong>60–90 minutes</strong></p>
          <p>${TECHS[SERVICES[d.service].tech].name} or the nearest on-call ${SERVICES[d.service].noun} technician heads your way as soon as you book.</p>
          <p class="fee-note">${icon('clock')}<span>${after ? `After-hours dispatch fee: ${d.member ? `<s>${money(AFTER_HOURS)}</s> waived for Club members.` : `${money(AFTER_HOURS)}.`}` : 'Regular business hours: no after-hours fee.'}</span></p>
        </div>
      </div>
      <p class="switch-line">Not quite an emergency? <button type="button" class="text-btn" data-action="set-urgency" data-value="today">Pick an arrival window instead</button></p>
      ${formActions('Continue')}
    </form>`;
  }
  return `
  <form data-form="step-time" novalidate>
    <h2 class="step-title">Pick an arrival window</h2>
    <p class="step-lead">Your technician arrives within the window you choose, and we text when they’re on the way.${d.urgency === 'flexible' ? ' Since you’re flexible, we’ll also text if an earlier window opens up.' : ''}</p>
    ${timePicker(d, 'draft', { preferToday: d.urgency === 'today' })}
    ${formActions('Continue')}
  </form>`;
}

function stepContact(d) {
  return `
  <form data-form="step-contact" novalidate>
    <h2 class="step-title">How do we reach you?</h2>
    <p class="step-lead">We’ll text your technician’s name and photo before they arrive.</p>
    <div class="field-row">
      <div class="field"><label for="b-name">Full name</label><input id="b-name" name="name" autocomplete="name" required data-required="Enter your name." data-input="draft-text" value="${esc(d.name)}"></div>
      <div class="field"><label for="b-phone">Mobile phone</label><input id="b-phone" name="phone" type="tel" autocomplete="tel" required data-required="Enter a phone number so your technician can reach you." data-input="draft-text" value="${esc(d.phone)}" placeholder="(205) 555-0100"></div>
    </div>
    <div class="field"><label for="b-email">Email</label><input id="b-email" name="email" type="email" autocomplete="email" required data-required="Enter your email for the confirmation." data-input="draft-text" value="${esc(d.email)}" placeholder="you@example.com"></div>
    <fieldset class="inline-choice">
      <legend>On the day, how should we update you?</legend>
      <div class="chips">${[['text', 'Text me'], ['call', 'Call me']].map(([v, l]) => `<label class="chip"><input type="radio" name="contact" id="contact-${v}" value="${v}" data-change="draft-choice" ${d.contact === v ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
    </fieldset>
    <div class="field"><label for="b-notes">Tell us a bit more <span class="optional">(optional)</span></label><textarea id="b-notes" name="notes" rows="3" data-input="draft-text" placeholder="When did it start? Anything you’ve already tried?">${esc(d.notes)}</textarea></div>
    <div class="field"><label for="b-photo">Photo description <span class="optional">(optional)</span></label><input id="b-photo" name="photo" data-input="draft-text" value="${esc(d.photo)}" placeholder="e.g. Water pooling under the tank, rust along the bottom seam"><p class="hint">On the live site you could attach photos. For this demo, describe what the photo would show and your technician will see it.</p></div>
    <label class="switch-row${d.member ? ' is-on' : ''}" for="b-member">
      <input type="checkbox" role="switch" id="b-member" name="member" data-change="draft-member" ${d.member ? 'checked' : ''}>
      <span class="switch-track" aria-hidden="true"></span>
      <span class="switch-copy"><strong>Ironwood Club member?</strong><small>${state.member ? `Member ${esc(state.member.ref)}. ` : ''}15% off repairs and no after-hours fee, applied to your estimate${state.member ? '' : '. We confirm membership at the visit'}.</small></span>
    </label>
    ${state.member ? '' : `<p class="hint member-hint">Not a member yet? <a href="#/club">Join the Ironwood Club</a> for ${money(CLUB_MONTHLY, true)}/month.</p>`}
    ${d.member && bookingEstimate(d) ? `<div class="inline-estimate">${estimateHtml(bookingEstimate(d), { compact: true })}</div>` : ''}
    ${formActions('Review booking')}
  </form>`;
}

const reviewBlock = (title, main, sub, step) => `<div class="review-block"><div><h3>${title}</h3><p>${main}</p>${sub ? `<small>${sub}</small>` : ''}</div><button type="button" class="text-btn" data-action="goto-step" data-step="${step}" aria-label="Edit ${title.toLowerCase()}">Edit</button></div>`;
function stepReview(d) {
  const svc = SERVICES[d.service];
  const prob = problemOf(d);
  const t = TECHS[svc.tech];
  return `
  <div class="review-step">
    <h2 class="step-title">Review and book</h2>
    <p class="step-lead">Check the details, then book. You can reschedule or cancel anytime.</p>
    <div class="review-blocks">
      ${reviewBlock('Problem', `${svc.name}: ${prob.label}`, URGENCY[d.urgency].label, 1)}
      ${reviewBlock('Address', `${esc(d.street)}${d.unit ? `, ${esc(d.unit)}` : ''}`, `${esc(areaFor(d.zip))}, AL ${esc(d.zip)}`, 2)}
      ${reviewBlock('Arrival', whenDraft(d), `Technician: ${t.name}`, 3)}
      ${reviewBlock('Contact', esc(d.name), `${esc(d.phone)} · ${esc(d.email)} · ${d.contact === 'call' ? 'Call' : 'Text'} updates${d.member ? ' · Club member' : ''}`, 4)}
    </div>
    ${estimateHtml(bookingEstimate(d))}
    <button class="btn btn-primary btn-lg full" type="button" data-action="confirm-booking">${icon('check')} Book my visit</button>
    <p class="demo-note">Demo booking: nothing is charged, no technician is dispatched and your details stay in this browser.</p>
    <div class="form-actions"><button type="button" class="btn btn-outline" data-action="step-back">${icon('back')} Back</button></div>
  </div>`;
}

/* ---------- Appointment ---------- */
function appointmentPage({ params }) {
  const a = findAppt(params.ref);
  if (!a) return null;
  const svc = SERVICES[a.service];
  const t = TECHS[a.tech];
  const tf = firstName(t.name);
  const status = a.status === 'cancelled' ? 'cancelled' : a.completedAt ? 'done' : 'scheduled';
  const date = a.emergency ? new Date(a.createdAt) : fromDayKey(a.day);
  const headline = { cancelled: 'This visit was cancelled.', done: `All done, ${esc(firstName(a.name))}.`, scheduled: `You’re booked, ${esc(firstName(a.name))}!` }[status];
  const sub = status === 'cancelled' ? `Cancelled ${esc(shortDate(new Date(a.cancelledAt || Date.now())))}. Nothing was charged.`
    : status === 'done' ? `${tf} finished the job. Your 1-year labor warranty starts today.`
      : a.emergency ? `${t.name} is being dispatched now. Dispatch will call within 15 minutes, and arrival is usually 60–90 minutes.` : `${t.name} will arrive ${longDate(date)} between ${hourLabel(a.start)} and ${hourLabel(a.end)}.`;
  return {
    title: `Visit ${a.ref} — Ironwood Plumbing & Air`,
    html: `
    <section class="confirm-hero is-${status}">
      <div class="wrap narrow center">
        <span class="confirm-tick" aria-hidden="true">${icon(status === 'cancelled' ? 'x' : 'check')}</span>
        <p class="confirm-ref">Visit ${esc(a.ref)}${a.history?.length ? ' · rescheduled' : ''}</p>
        <h1>${headline}</h1>
        <p class="lead">${sub}</p>
      </div>
    </section>
    <section class="confirm-body">
      <div class="wrap confirm-grid">
        <div class="confirm-main">
          ${status === 'scheduled' ? `
          <div class="card action-card">
            <div><h2>Track ${tf} on the day</h2><p>Watch the van on a live map with an arrival countdown.</p></div>
            <div class="action-row">
              <a class="btn btn-primary btn-lg" href="#/track/${a.ref}">${icon('van')} Track technician</a>
              <button type="button" class="btn btn-outline" data-action="reschedule" data-ref="${a.ref}">${icon('calendar')} Reschedule</button>
              <button type="button" class="text-btn danger" data-action="cancel-visit" data-ref="${a.ref}">Cancel visit</button>
            </div>
          </div>` : status === 'cancelled' ? `
          <div class="card action-card"><div><h2>Need us after all?</h2><p>Book a new visit in two minutes, or call ${PHONE}.</p></div><div class="action-row"><a class="btn btn-primary" href="#/book?service=${a.service}">Book again</a></div></div>` : `
          <div class="card action-card"><div><h2>How did ${tf} do?</h2><p>${a.rating ? `You rated this visit ${a.rating} out of 5. Thank you!` : 'Replay the visit tracker or leave a quick rating.'}</p></div><div class="action-row"><a class="btn btn-outline" href="#/track/${a.ref}">${icon('van')} View visit tracker</a><a class="btn btn-primary" href="#/book">Book another visit</a></div></div>`}
          <div class="card">
            <h2>Visit details</h2>
            <dl class="detail-list">
              <div><dt>Service</dt><dd>${svc.name}: ${esc(a.problemLabel)}</dd></div>
              <div><dt>Arrival</dt><dd>${whenText(a)}</dd></div>
              <div><dt>Address</dt><dd>${esc(a.street)}${a.unit ? `, ${esc(a.unit)}` : ''}<br>${esc(areaFor(a.zip))}, AL ${esc(a.zip)}</dd></div>
              <div><dt>Contact</dt><dd>${esc(a.name)}<br>${esc(a.phone)} · ${esc(a.email)}<br><small>${a.contact === 'call' ? 'We’ll call' : 'We’ll text'} you on the day</small></dd></div>
              ${a.access ? `<div><dt>Access</dt><dd>${esc(a.access)}</dd></div>` : ''}
              ${a.notes ? `<div><dt>Notes</dt><dd>${esc(a.notes)}</dd></div>` : ''}
              ${a.photo ? `<div><dt>Photo</dt><dd>${esc(a.photo)}</dd></div>` : ''}
              ${a.history?.length ? `<div><dt>Changes</dt><dd>${a.history.map((h) => esc(h)).join('<br>')}</dd></div>` : ''}
            </dl>
          </div>
          <div class="card">
            <h2>Your upfront estimate</h2>
            ${estimateHtml(a.estimate)}
          </div>
          ${status === 'scheduled' ? `
          <div class="card">
            <h2>What happens next</h2>
            <ol class="next-steps">
              <li><strong>${a.contact === 'call' ? 'We call' : 'We text'} when ${tf} is on the way,</strong> with a live tracking link.</li>
              <li><strong>${tf} diagnoses the problem</strong> and shows you a flat-rate price. Nothing starts until you approve it.</li>
              <li><strong>Pay when the job is done.</strong> Every repair comes with a 1-year labor warranty.</li>
            </ol>
          </div>` : ''}
          <p class="demo-note">Demo booking: no technician is dispatched and nothing is charged. This visit is saved only in this browser.</p>
        </div>
        <aside class="confirm-side">
          <div class="card tech-card-lg">
            <span class="tech-lg-photo">${img(t.image, `Portrait of ${t.name}`, { sizes: '(max-width: 900px) 100vw, 380px' })}</span>
            <div>
              <p class="eyebrow">Your technician</p>
              <h2>${t.name}</h2>
              <p class="tech-role">${t.role}</p>
              <p class="tech-meta"><span>${stars(t.rating)} <strong>${t.rating.toFixed(1)}</strong></span><span>${t.years} years</span></p>
              <p class="vehicle">${icon('van')} White Ironwood van · Unit ${t.unit}</p>
            </div>
          </div>
          ${status === 'scheduled' ? `
          <div class="card cal-card">
            <div class="cal-row">
              <span class="cal-tile" aria-hidden="true"><span>${formatDate(date, { month: 'short' }).toUpperCase()}</span><strong>${date.getDate()}</strong><small>${formatDate(date, { weekday: 'short' })}</small></span>
              <div><h2>Add it to your calendar</h2><p>${a.emergency ? 'Today, as soon as possible' : `${hourLabel(a.start)} – ${hourLabel(a.end)} arrival window`}</p></div>
            </div>
            <div class="cal-buttons">${['Apple', 'Google', 'Outlook'].map((c) => `<button type="button" class="btn btn-outline btn-sm" data-action="add-calendar" data-cal="${c}">${icon('calendar')} ${c}</button>`).join('')}</div>
          </div>` : ''}
        </aside>
      </div>
    </section>`,
  };
}

function reschedulePage({ params }) {
  const a = findAppt(params.ref);
  if (!a) return null;
  if (a.status !== 'scheduled' || a.completedAt) {
    return { title: 'Reschedule — Ironwood Plumbing & Air', html: `<section class="section"><div class="wrap narrow center"><p class="eyebrow">Visit ${esc(a.ref)}</p><h1>This visit can’t be rescheduled.</h1><p class="lead">It has already been ${a.completedAt ? 'completed' : 'cancelled'}.</p><a class="btn btn-primary" href="#/appointment/${a.ref}">Back to visit</a></div></section>` };
  }
  if (resched.ref !== a.ref) resched = { ref: a.ref, day: '', window: '' };
  return {
    title: 'Reschedule your visit — Ironwood Plumbing & Air',
    html: `
    <section class="book-section">
      <div class="wrap narrow">
        <a class="back-link" href="#/appointment/${a.ref}">${icon('back')} Visit ${esc(a.ref)}</a>
        <div class="book-main">
          <p class="eyebrow">Reschedule</p>
          <h1>Pick a new arrival window.</h1>
          <p class="step-lead">Currently: <strong>${whenText(a)}</strong> with ${TECHS[a.tech].name}. Your price and details stay the same.</p>
          ${timePicker(resched, 'resched')}
          <div class="form-actions"><a class="btn btn-outline" href="#/appointment/${a.ref}">Keep current time</a><button type="button" class="btn btn-primary btn-lg" data-action="confirm-reschedule" data-ref="${a.ref}">Confirm new time ${icon('arrow')}</button></div>
        </div>
      </div>
    </section>`,
  };
}

/* ---------- Technician tracker (simulated at demo speed) ---------- */
const TRACK = [
  { key: 'scheduled', label: 'Scheduled', ms: 6000 },
  { key: 'enroute', label: 'On the way', ms: 30000 },
  { key: 'arrived', label: 'Arrived', ms: 6000 },
  { key: 'working', label: 'Working', ms: 16000 },
  { key: 'done', label: 'Done', ms: Infinity },
];
const REAL_OFFSETS = [0, 4, 22, 25, 70]; // minutes into a real visit, used for the message timestamps
const DRIVE_MIN = 18;
const ROUTE = [[70, 372], [70, 300], [250, 300], [250, 170], [430, 170], [430, 92], [548, 92]];
const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - ((-2 * p + 2) ** 2) / 2);
function trackPhase(start, now = Date.now()) {
  let t = Math.max(0, now - start);
  for (let i = 0; i < TRACK.length; i += 1) {
    if (t < TRACK[i].ms) return { index: i, p: TRACK[i].ms === Infinity ? 1 : t / TRACK[i].ms };
    t -= TRACK[i].ms;
  }
  return { index: TRACK.length - 1, p: 1 };
}
function routePoint(p) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < ROUTE.length; i += 1) {
    const [x1, y1] = ROUTE[i - 1];
    const [x2, y2] = ROUTE[i];
    const len = Math.hypot(x2 - x1, y2 - y1);
    segs.push({ x1, y1, x2, y2, len });
    total += len;
  }
  let dist = Math.min(1, Math.max(0, p)) * total;
  for (const s of segs) {
    if (dist <= s.len) { const f = s.len ? dist / s.len : 0; return [s.x1 + (s.x2 - s.x1) * f, s.y1 + (s.y2 - s.y1) * f]; }
    dist -= s.len;
  }
  return ROUTE[ROUTE.length - 1];
}
function mapSvg() {
  const H = [[40, 8], [92, 18], [170, 18], [236, 8], [300, 18], [372, 8]];
  const V = [[70, 18], [160, 8], [250, 18], [340, 8], [430, 18], [520, 8], [600, 8]];
  const xs = [0, ...V.map(([x]) => x), 640];
  const ys = [0, ...H.map(([y]) => y), 420];
  let houses = '';
  for (let i = 0; i < xs.length - 1; i += 1) {
    for (let j = 0; j < ys.length - 1; j += 1) {
      const x0 = xs[i] + 13; const x1 = xs[i + 1] - 13; const y0 = ys[j] + 12; const y1 = ys[j + 1] - 12;
      if (x1 - x0 < 14 || y1 - y0 < 10) continue;
      for (let x = x0; x + 14 <= x1; x += 22) {
        if (hash(`${i}-${j}-${x}`) % 4 === 0) continue;
        houses += `<rect x="${x}" y="${y0}" width="14" height="10" rx="2"/>`;
        if (y1 - y0 > 34) houses += `<rect x="${x}" y="${y1 - 10}" width="14" height="10" rx="2"/>`;
      }
    }
  }
  const d = `M${ROUTE.map(([x, y]) => `${x} ${y}`).join(' L')}`;
  return `
  <svg viewBox="0 0 640 420" role="img" aria-label="Stylized map of the technician's van driving toward your home">
    <rect width="640" height="420" fill="#e3ebf6"/>
    <g fill="#d2ddeb">${houses}</g>
    <g stroke="#fff" stroke-linecap="round">
      ${H.map(([y, w]) => `<line x1="0" y1="${y}" x2="640" y2="${y}" stroke-width="${w}"/>`).join('')}
      ${V.map(([x, w]) => `<line x1="${x}" y1="0" x2="${x}" y2="420" stroke-width="${w}"/>`).join('')}
    </g>
    <rect x="262" y="182" width="156" height="106" rx="16" fill="#cde8d6"/>
    <g fill="#9fd3b3">${[[288, 206], [318, 226], [300, 256], [352, 204], [380, 240], [396, 268], [340, 266]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${9 + (x % 5)}"/>`).join('')}</g>
    <rect x="530" y="318" width="96" height="66" rx="30" fill="#c6dafa"/>
    <g class="map-label" aria-hidden="true">
      <text x="96" y="292">LAKESHORE DR</text>
      <text x="446" y="162">VALLEY AVE</text>
      <text x="290" y="86">YOUR STREET</text><text x="578" y="355" class="pond" text-anchor="middle">POND</text>
      <text x="306" y="240" class="park">PARK</text>
    </g>
    <path d="${d}" fill="none" stroke="#1f6fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 11"/>
    <path id="route-done" d="${d}" pathLength="1" fill="none" stroke="#1b66f5" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 1" stroke-dashoffset="1"/>
    <g transform="translate(70 372)"><rect x="-15" y="-15" width="30" height="30" rx="9" fill="#0d1b33"/><path d="M-5 -7h10M0 -7v14M-5 7h10" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></g>
    <text x="92" y="400" class="map-tag">Ironwood shop</text>
    <g transform="translate(548 92)">
      <circle class="pin-pulse" r="22" fill="#ff7a1a" fill-opacity=".45"/>
      <circle r="22" fill="#ff7a1a" stroke="#fff" stroke-width="4"/>
      <g transform="translate(-10 -10) scale(.84)" fill="none" stroke="#0d1b33" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICONS.home}</g>
    </g>
    <text x="576" y="130" class="map-tag" text-anchor="middle">Your home</text>
    <g id="van" transform="translate(70 372)">
      <circle r="26" fill="#1b66f5" fill-opacity=".18"/>
      <circle r="19" fill="#1b66f5" stroke="#fff" stroke-width="4"/>
      <g transform="translate(-10 -10) scale(.84)" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICONS.van}</g>
    </g>
  </svg>`;
}
function stageCopy(i, a) {
  const t = TECHS[a.tech];
  const f = firstName(t.name);
  return [
    { title: `${f} is finishing a nearby job`, sub: `Your visit is next on ${f}’s route. We’ll text you the moment the van leaves.` },
    { title: `${f} is on the way`, sub: `${f} is driving the white Ironwood van, Unit ${t.unit}. Put the dog in the backyard!` },
    { title: `${f} has arrived`, sub: 'Look for the navy uniform and Ironwood ID badge at your door.' },
    { title: `${f} is working on it`, sub: 'You approved an upfront price, so there are no surprises when the job is done.' },
    { title: 'All done!', sub: `${SERVICES[a.service].name} work finished and tested. Your 1-year labor warranty starts today.` },
  ][i];
}
function feedCopy(i, a) {
  const t = TECHS[a.tech];
  const f = firstName(t.name);
  const est = a.estimate;
  const price = est.included && !est.feeCharged ? 'included with your Club membership'
    : est.kind === 'replace' ? `${money(est.totalLo)} installed`
      : money(Math.round((est.totalLo + ((est.totalHi ?? est.totalLo) - est.totalLo) * 0.4) / 5) * 5);
  return [
    `Hi ${esc(firstName(a.name))}, it’s Ironwood. ${f} is confirmed for your ${SERVICES[a.service].noun} visit. Reply C to confirm or R to reschedule.`,
    `${f} is on the way in the white Ironwood van, Unit ${t.unit}. ETA about ${DRIVE_MIN} minutes. Track live: ironwood.demo/t/${esc(a.ref)}`,
    `${f} has arrived. Shoe covers on, ready when you are.`,
    `${f} found the problem and shared your upfront price: ${price}. Work has started.`,
    `All done! Your receipt and 1-year labor warranty are on the way to ${esc(a.email)}. How did ${f} do?`,
  ][i];
}
const feedItem = (i, a, fresh) => {
  const at = new Date((a.trackStart || Date.now()) + REAL_OFFSETS[i] * 60000);
  return `<li class="${fresh ? 'is-new' : ''}"><p>${feedCopy(i, a)}</p><time>${formatDate(at, { hour: 'numeric', minute: '2-digit' })}</time></li>`;
};

function trackPage({ params }) {
  const a = findAppt(params.ref);
  if (!a) return null;
  const t = TECHS[a.tech];
  const f = firstName(t.name);
  if (a.status === 'cancelled') {
    return { title: 'Tracker — Ironwood Plumbing & Air', html: `<section class="section"><div class="wrap narrow center"><p class="eyebrow">Visit ${esc(a.ref)}</p><h1>This visit was cancelled.</h1><p class="lead">There’s nothing to track. Book a new visit whenever you need us.</p><a class="btn btn-primary" href="#/book?service=${a.service}">Book again</a></div></section>` };
  }
  const future = !a.emergency && dayOffset(fromDayKey(a.day)) > 0;
  return {
    title: `Track ${f} — Ironwood Plumbing & Air`,
    html: `
    <section class="track-section" id="track-root" data-ref="${a.ref}">
      <div class="wrap">
        <a class="back-link" href="#/appointment/${a.ref}">${icon('back')} Visit ${esc(a.ref)}</a>
        <div class="track-head">
          <div>
            <p class="eyebrow">Live tracker · demo speed</p>
            <h1 id="track-title">${stageCopy(0, a).title}</h1>
            <p class="track-sub" id="track-sub" aria-live="polite">${stageCopy(0, a).sub}</p>
          </div>
          <div class="track-controls">
            <button type="button" class="btn btn-outline btn-sm" data-action="track-skip" data-ref="${a.ref}" id="track-skip">Skip ahead ${icon('arrow')}</button>
            <button type="button" class="btn btn-outline btn-sm" data-action="track-replay" data-ref="${a.ref}">Replay</button>
          </div>
        </div>
        <ol class="track-steps" id="track-steps">${TRACK.map((s) => `<li><span class="dot">${icon('check')}</span><span class="track-step-label">${s.label}</span></li>`).join('')}</ol>
        <div class="track-grid">
          <div class="track-main">
            <div class="map-card">
              ${mapSvg()}
              <div class="eta-chip" id="eta-chip"><small>ETA</small><strong id="eta-value">${DRIVE_MIN} min</strong><span id="eta-note">Not on the road yet</span></div>
            </div>
            <div class="card done-card" id="track-done" hidden>
              <div>
                <h2>How did ${f} do?</h2>
                <p>Your rating helps ${f} and helps neighbors choose. (Demo: nothing is posted.)</p>
              </div>
              <div class="rate" role="group" aria-label="Rate your visit">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="rate-star${a.rating >= n ? ' on' : ''}" data-action="rate" data-ref="${a.ref}" data-value="${n}" aria-label="${n} star${n > 1 ? 's' : ''}" aria-pressed="${a.rating === n}"><svg viewBox="0 0 24 24" aria-hidden="true">${STAR}</svg></button>`).join('')}</div>
              <div class="action-row"><a class="btn btn-primary" href="#/appointment/${a.ref}">View visit summary</a><a class="btn btn-outline" href="#/book">Book another visit</a></div>
            </div>
          </div>
          <aside class="track-side">
            <div class="card tech-live">
              <span class="tech-live-photo">${img(t.image, `Portrait of ${t.name}`, { sizes: '96px' })}</span>
              <div>
                <p class="tech-live-status" id="tech-status">${f} is finishing a nearby job</p>
                <h2>${t.name}</h2>
                <p class="tech-meta"><span>${stars(t.rating)} <strong>${t.rating.toFixed(1)}</strong></span><span>${t.years} yrs</span></p>
                <p class="vehicle">${icon('van')} White Ironwood van · Unit ${t.unit}</p>
              </div>
              <div class="tech-live-actions"><a class="btn btn-outline btn-sm" href="${TEL}">${icon('phone')} Call</a><button type="button" class="btn btn-outline btn-sm" data-action="text-tech">${icon('chat')} Text ${f}</button></div>
            </div>
            <div class="demo-explain">
              <strong>How this demo works</strong>
              <p>This replays a real visit in about a minute${future ? `, as if it were ${longDate(fromDayKey(a.day))}` : ''}. A real drive takes 15–25 minutes, and updates come from your technician’s phone. Use “Skip ahead” to jump to the next step.</p>
            </div>
            <div class="card feed-card">
              <h2>${icon('chat')} Text updates</h2>
              <ol class="feed-list" id="feed"></ol>
            </div>
          </aside>
        </div>
      </div>
    </section>`,
    mount: (outlet) => {
      if (!a.trackStart) { a.trackStart = Date.now(); save(); }
      const root = outlet.querySelector('#track-root');
      root.dataset.stage = '-1';
      root.dataset.feed = '0';
      const loop = () => {
        if (!root.isConnected) return;
        updateTracker(root, a);
        requestAnimationFrame(loop);
      };
      loop();
    },
  };
}
function updateTracker(root, a) {
  const ph = trackPhase(a.trackStart);
  const vanP = ph.index === 0 ? 0 : ph.index === 1 ? ease(ph.p) : 1;
  const [x, y] = routePoint(vanP);
  root.querySelector('#van').setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  root.querySelector('#route-done').setAttribute('stroke-dashoffset', String(1 - vanP));
  const eta = ph.index === 0 ? DRIVE_MIN : ph.index === 1 ? Math.max(1, Math.ceil(DRIVE_MIN * (1 - vanP))) : 0;
  const etaText = ph.index >= 2 ? 'Arrived' : `${eta} min`;
  const etaNode = root.querySelector('#eta-value');
  if (etaNode.textContent !== etaText) etaNode.textContent = etaText;
  if (String(ph.index) === root.dataset.stage) return;
  // Stage changed: update steps, headline, status and the text feed.
  const first = root.dataset.stage === '-1';
  root.dataset.stage = String(ph.index);
  const copy = stageCopy(ph.index, a);
  root.querySelector('#track-title').textContent = copy.title;
  root.querySelector('#track-sub').textContent = copy.sub;
  root.querySelector('#tech-status').textContent = copy.title;
  root.querySelector('#eta-note').textContent = ['Not on the road yet', 'Live, updates every few seconds', 'At your door', 'On site', 'Visit complete'][ph.index];
  root.querySelector('#eta-chip').classList.toggle('is-arrived', ph.index >= 2);
  root.querySelectorAll('#track-steps li').forEach((li, i) => {
    li.classList.toggle('is-done', i < ph.index || (i === ph.index && ph.index === TRACK.length - 1));
    li.classList.toggle('is-current', i === ph.index && ph.index < TRACK.length - 1);
    if (i === ph.index) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
  });
  const feed = root.querySelector('#feed');
  const shown = Number(root.dataset.feed);
  let html = '';
  for (let i = shown; i <= ph.index; i += 1) html += feedItem(i, a, !first);
  feed.insertAdjacentHTML('afterbegin', html.split('</li>').filter(Boolean).map((x) => `${x}</li>`).reverse().join(''));
  root.dataset.feed = String(ph.index + 1);
  const done = ph.index === TRACK.length - 1;
  root.querySelector('#track-done').hidden = !done;
  root.querySelector('#track-skip').disabled = done;
  if (done && !a.completedAt) { a.completedAt = Date.now(); save(); }
}

/* ---------- Pricing estimator ---------- */
function jobEstimate(jobKey, opts, member) {
  const job = JOBS[jobKey];
  let low = 0;
  let high = 0;
  let afterHours = false;
  const chosen = {};
  job.groups.forEach((g) => {
    const o = g.options.find((x) => x.k === opts[g.key]) || g.options[0];
    chosen[g.key] = o;
    low += o.lo;
    high += o.hi;
    if (o.afterHours) afterHours = true;
  });
  return { chosen, est: priceEstimate({ title: job.name, low, high, kind: job.kind }, { member, afterHours }) };
}
function jobBookLink(jobKey, chosen) {
  const job = JOBS[jobKey];
  let service = job.service;
  let problem = job.problem || Object.values(chosen).find((o) => o.problem)?.problem || '';
  if (jobKey === 'hvac-repair') {
    const ac = chosen.system.k === 'ac';
    service = ac ? 'ac' : 'heating';
    problem = { comfort: ac ? 'warm' : 'no-heat', off: ac ? 'off' : 'no-heat', cycling: ac ? 'warm' : 'cycling', noise: 'noise' }[chosen.issue.k];
  }
  if (jobKey === 'tune-up') {
    const w = chosen.what.k;
    service = w === 'flush' ? 'water-heaters' : w === 'furnace' ? 'heating' : 'ac';
    problem = w === 'flush' ? 'flush' : 'tune';
  }
  const q = new URLSearchParams({ service, problem });
  if (chosen.timing?.afterHours) q.set('urgency', 'emergency');
  return `#/book?${q}`;
}
function pricingPage() {
  const e = state.estimator;
  if (!JOBS[e.job]) e.job = 'wh-replace';
  const job = JOBS[e.job];
  const { chosen, est } = jobEstimate(e.job, e.opts, false);
  const { est: mem } = jobEstimate(e.job, e.opts, true);
  const details = Object.values(chosen).map((o) => o.label).join(' · ');
  const saving = savingsText(mem);
  const memberBlock = job.kind === 'replace'
    ? `<div class="est-member is-note">${icon('percent')}<p><strong>Club members</strong> get priority install dates and free seasonal tune-ups to protect the new equipment. The 15% discount applies to repairs.</p></div>`
    : `<div class="est-member">${icon('percent')}<p><strong>Club members pay ${mem.included && !mem.feeCharged ? '$0, it’s included' : rangeText(mem.totalLo, mem.totalHi)}</strong>${saving ? `<span>${saving} with the <a href="#/club">Ironwood Club</a></span>` : ''}</p></div>`;
  return {
    title: 'Upfront pricing & estimator — Ironwood Plumbing & Air',
    html: `
    <section class="page-head">
      <div class="wrap">
        <p class="eyebrow on-dark">Upfront pricing</p>
        <h1>See the price before we pick up a wrench.</h1>
        <p class="lead">Choose the job and a few details for a live upfront range. Your technician confirms a firm flat-rate price on site before any work begins.</p>
      </div>
    </section>
    <section class="section section-tight section-steel">
      <div class="wrap est-grid">
        <div class="est-main card">
          <h2 class="est-h"><span>1</span> What’s the job?</h2>
          <div class="job-grid">
            ${Object.entries(JOBS).map(([key, j]) => `<label class="job-choice"><input type="radio" name="job" id="job-${key}" value="${key}" data-change="est-job" ${key === e.job ? 'checked' : ''}><span class="job-box"><span class="icon-tile is-small">${icon(j.icon)}</span><strong>${j.name}</strong></span></label>`).join('')}
          </div>
          <h2 class="est-h"><span>2</span> A few details</h2>
          ${job.groups.map((g) => `
            <fieldset class="est-group">
              <legend>${g.label}</legend>
              <div class="chips">${g.options.map((o) => `<label class="chip"><input type="radio" name="opt-${g.key}" id="opt-${g.key}-${o.k}" value="${o.k}" data-change="est-opt" data-group="${g.key}" ${chosen[g.key].k === o.k ? 'checked' : ''}><span>${o.label}</span></label>`).join('')}</div>
            </fieldset>`).join('')}
        </div>
        <aside class="est-result">
          <div class="est-card" aria-live="polite">
            <p class="estimate-label">${icon('tag')} Your upfront estimate</p>
            <p class="est-range">${est.included ? money(est.totalLo) : rangeText(est.totalLo, est.totalHi)}</p>
            <p class="est-sub">${job.name}<br><span>${details}</span></p>
            ${est.afterHours ? `<p class="est-fee">${icon('clock')} Includes the ${money(AFTER_HOURS)} after-hours dispatch fee</p>` : ''}
            ${memberBlock}
            <ul class="checks small">
              <li>${icon('check')} Price agreed before any work starts</li>
              <li>${icon('check')} 1-year labor warranty on the work</li>
              <li>${icon('check')} ${job.kind === 'replace' ? 'Removal and haul-away of the old unit' : job.kind === 'tune' ? 'Written report on your system' : `${money(DIAGNOSTIC)} diagnostic credited toward the repair`}</li>
            </ul>
            <a class="btn btn-orange btn-lg full" href="${jobBookLink(e.job, chosen)}">Book this job ${icon('arrow')}</a>
            <p class="est-fine">Typical ranges for homes in our service area. Final price depends on what your technician finds, and you approve it first.</p>
          </div>
        </aside>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        ${sectionHead('Flat-rate price book', 'Our starting prices, out in the open.', '<p class="section-note">Club members save 15% on repairs, get tune-ups included and never pay the after-hours fee.</p>')}
        <div class="price-book">
          ${PRICE_GROUPS.map(([title, ids]) => `<div class="price-group"><h3>${title}</h3>${priceTable(ids, `${title} prices`)}</div>`).join('')}
        </div>
      </div>
    </section>
    ${ctaBand('Ready when you are.')}`,
  };
}

/* ---------- Ironwood Club ---------- */
function calcValues() {
  const c = state.calc;
  const maintenance = (c.ac ? 99 : 0) + (c.furnace ? 99 : 0) + (c.flush ? 129 : 0);
  const without = maintenance + Number(c.repairs) + Number(c.emergencies) * AFTER_HOURS;
  const yearly = CLUB_MONTHLY * 12;
  const withClub = yearly + Number(c.repairs) * (1 - CLUB_OFF);
  return { without, withClub, yearly, savings: without - withClub };
}
function calcOutput() {
  const v = calcValues();
  const max = Math.max(v.without, v.withClub, 1);
  return `
    <div class="calc-bars">
      <div class="calc-bar"><span class="calc-bar-label">Without the Club</span><span class="calc-track"><span style="width:${(v.without / max) * 100}%"></span></span><strong>${money(v.without)}</strong></div>
      <div class="calc-bar is-member"><span class="calc-bar-label">With the Club</span><span class="calc-track"><span style="width:${(v.withClub / max) * 100}%"></span></span><strong>${money(v.withClub)}</strong></div>
    </div>
    <p class="calc-result ${v.savings > 0 ? 'is-good' : ''}">${v.savings > 0 ? `You’d save about <strong>${money(v.savings)}</strong> a year.` : `The Club would cost about <strong>${money(-v.savings)}</strong> more this year, but you’d still get priority scheduling.`}</p>
    <p class="calc-fine">Includes ${money(v.yearly, true)} in membership fees (${money(CLUB_MONTHLY, true)} × 12).</p>`;
}
function clubPage() {
  const m = state.member;
  const c = state.calc;
  const benefits = [
    ['snowflake', 'Spring AC tune-up', 'Cleaned coils, checked refrigerant and a safety inspection before the heat hits.'],
    ['flame', 'Fall furnace tune-up', 'Burners, igniter, flame sensor and a carbon monoxide check before the first cold night.'],
    ['drop', 'Yearly plumbing inspection', 'A whole-house check for leaks and wear, plus a water heater flush.'],
    ['percent', '15% off repairs', 'On every plumbing, drain, water heater, heating and cooling repair.'],
    ['clock', 'No after-hours fee', `Emergency at 2 AM or on a Sunday? The ${money(AFTER_HOURS)} dispatch fee is waived.`],
    ['bolt', 'Priority scheduling', 'Members go to the front of the line when the weather turns and everyone calls.'],
  ];
  const rows = [
    ['AC tune-up (spring)', money(99), 'Included'],
    ['Furnace tune-up (fall)', money(99), 'Included'],
    ['Plumbing inspection & water heater flush', money(129), 'Included'],
    ['Repairs', 'Standard flat rate', '15% off'],
    ['After-hours emergency dispatch', money(AFTER_HOURS), '$0'],
    ['Scheduling', 'Next available', 'Priority'],
    ['Monthly cost', '$0', `${money(CLUB_MONTHLY, true)}`],
  ];
  return {
    title: 'Ironwood Club membership — Ironwood Plumbing & Air',
    html: `
    <section class="club-hero">
      <div class="wrap club-hero-grid">
        <div>
          <p class="eyebrow on-dark">Ironwood Club</p>
          <h1>Tune-ups, priority service and 15% off, for ${money(CLUB_MONTHLY, true)} a month.</h1>
          <p class="lead">One simple membership for the whole house: heating, cooling and plumbing. Cancel anytime.</p>
          <div class="hero-actions"><button type="button" class="btn btn-orange btn-lg" data-action="scroll-to" data-target="join">${m ? 'View my membership' : 'Join the Club'} ${icon('arrow')}</button><button type="button" class="btn btn-ghost-light btn-lg" data-action="scroll-to" data-target="calc">Calculate my savings</button></div>
        </div>
        ${memberCardVisual()}
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        ${sectionHead('Member benefits', 'Everything the house needs, on a schedule.')}
        <div class="benefit-grid">${benefits.map(([ic, t, d]) => `<article class="benefit"><span class="icon-tile">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
      </div>
    </section>
    <section class="section section-steel">
      <div class="wrap compare-grid">
        <div>
          <p class="eyebrow">Compare</p>
          <h2>Member vs. non-member</h2>
          <p class="lead">The two tune-ups and the yearly flush alone are worth ${money(327)} at regular prices. The membership is ${money(CLUB_MONTHLY * 12, true)} a year.</p>
        </div>
        <div class="table-wrap">
          <table class="compare">
            <caption class="visually-hidden">Ironwood Club member and non-member prices</caption>
            <thead><tr><th scope="col">What you get</th><th scope="col">Non-member</th><th scope="col" class="col-member">Club member</th></tr></thead>
            <tbody>${rows.map(([a, b, cc]) => `<tr><th scope="row">${a}</th><td>${b}</td><td class="col-member">${cc === 'Included' || cc === 'Priority' || cc === '15% off' || cc === '$0' ? icon('check') : ''} ${cc}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section" id="calc">
      <div class="wrap calc-grid">
        <div>
          <p class="eyebrow">Savings calculator</p>
          <h2>Will the Club pay for itself?</h2>
          <div class="calc-form">
            <fieldset>
              <legend>Maintenance you’d do anyway</legend>
              ${[['ac', 'AC tune-up', 99], ['furnace', 'Furnace tune-up', 99], ['flush', 'Water heater flush', 129]].map(([k, l, p]) => `<label class="check-row"><input type="checkbox" name="${k}" id="calc-${k}" data-change="calc" ${c[k] ? 'checked' : ''}><span>${l}</span><small>${money(p)}</small></label>`).join('')}
            </fieldset>
            <div class="field">
              <label for="calc-repairs">Repairs in a typical year: <output id="calc-repairs-out" for="calc-repairs">${money(c.repairs)}</output></label>
              <input type="range" id="calc-repairs" name="repairs" min="0" max="2500" step="50" value="${c.repairs}" data-input="calc">
            </div>
            <div class="field">
              <label for="calc-emergencies">After-hours emergency calls per year</label>
              <select id="calc-emergencies" name="emergencies" data-change="calc">${[0, 1, 2, 3].map((n) => `<option value="${n}" ${Number(c.emergencies) === n ? 'selected' : ''}>${n}</option>`).join('')}</select>
            </div>
          </div>
        </div>
        <div class="calc-out card" id="calc-out" aria-live="polite">${calcOutput()}</div>
      </div>
    </section>
    <section class="section section-steel" id="join">
      <div class="wrap narrow">
        ${m ? `
        <div class="card member-status">
          <span class="confirm-tick is-small" aria-hidden="true">${icon('check')}</span>
          <h2>You’re a member, ${esc(firstName(m.name))}.</h2>
          <p>Member ${esc(m.ref)} since ${esc(formatDate(new Date(m.since), { month: 'long', day: 'numeric', year: 'numeric' }))}. Your 15% repair discount and no after-hours fee apply automatically when you book.</p>
          <div class="action-row"><a class="btn btn-primary" href="#/book">Book a visit</a><button type="button" class="text-btn danger" data-action="cancel-club">Cancel membership</button></div>
          <p class="demo-note">Demo membership: nothing was charged.</p>
        </div>` : `
        <div class="card join-card">
          <p class="eyebrow">Join the Club</p>
          <h2>Start your membership</h2>
          <p class="step-lead">${money(CLUB_MONTHLY, true)} a month, cancel anytime. We’ll call to schedule your first tune-up.</p>
          <form data-form="join" novalidate>
            <div class="field-row">
              <div class="field"><label for="j-name">Full name</label><input id="j-name" name="name" autocomplete="name" required data-required="Enter your name." value="${esc(state.profile.name)}"></div>
              <div class="field"><label for="j-phone">Mobile phone</label><input id="j-phone" name="phone" type="tel" autocomplete="tel" required data-required="Enter a phone number." value="${esc(state.profile.phone)}"></div>
            </div>
            <div class="field-row">
              <div class="field"><label for="j-email">Email</label><input id="j-email" name="email" type="email" autocomplete="email" required data-required="Enter your email." value="${esc(state.profile.email)}"></div>
              <div class="field"><label for="j-zip">Home ZIP code</label><input id="j-zip" name="zip" inputmode="numeric" maxlength="5" autocomplete="postal-code" required pattern="\\d{5}" data-pattern-message="Enter a 5-digit ZIP code." data-required="Enter your ZIP code." value="${esc(state.profile.zip)}"></div>
            </div>
            <label class="check-row is-confirm"><input type="checkbox" name="agree" required data-required="Please confirm to join."><span>I understand this is a demo membership and nothing will be charged.</span></label>
            <button class="btn btn-primary btn-lg full" type="submit">Join for ${money(CLUB_MONTHLY, true)}/month</button>
          </form>
        </div>`}
      </div>
    </section>`,
  };
}
function clubWelcome() {
  const m = state.member;
  if (!m) return null;
  const s = season();
  const tune = s === 'furnace' ? { label: 'fall furnace tune-up', link: '#/book?service=heating&problem=tune' } : s === 'ac' ? { label: 'spring AC tune-up', link: '#/book?service=ac&problem=tune' } : { label: 'first tune-up', link: '#/book?service=ac&problem=tune' };
  return {
    title: 'Welcome to the Ironwood Club',
    html: `
    <section class="confirm-hero">
      <div class="wrap narrow center">
        <span class="confirm-tick" aria-hidden="true">${icon('check')}</span>
        <p class="confirm-ref">Member ${esc(m.ref)}</p>
        <h1>Welcome to the Club, ${esc(firstName(m.name))}!</h1>
        <p class="lead">Your 15% repair discount, waived after-hours fee and priority scheduling start today.</p>
      </div>
    </section>
    <section class="confirm-body">
      <div class="wrap narrow">
        <div class="card welcome-card">
          ${memberCardVisual()}
          <div>
            <h2>What happens next</h2>
            <ol class="next-steps">
              <li><strong>We’ll call ${esc(m.phone)}</strong> within one business day to schedule your ${tune.label}.</li>
              <li><strong>Book anytime online.</strong> Your member pricing is applied to every estimate automatically.</li>
              <li><strong>Emergencies are on us.</strong> No ${money(AFTER_HOURS)} after-hours fee, nights, Sundays or holidays.</li>
            </ol>
            <div class="action-row"><a class="btn btn-primary" href="${tune.link}">Book my ${tune.label}</a><a class="btn btn-outline" href="#/club">Membership details</a></div>
            <p class="demo-note">Demo membership: nothing was charged and no card was collected.</p>
          </div>
        </div>
      </div>
    </section>`,
  };
}

/* ---------- Emergency guide ---------- */
function emergencyPage({ query }) {
  const topic = EMERGENCIES[query.get('topic')] ? query.get('topic') : 'leak';
  const e = EMERGENCIES[topic];
  return {
    title: 'Emergency help — Ironwood Plumbing & Air',
    html: `
    <section class="emg-hero">
      <div class="wrap emg-hero-grid">
        <div>
          <p class="eyebrow on-dark">Emergency guide</p>
          <h1>Plumbing or heating emergency? Here’s what to do right now.</h1>
          <p class="lead">Follow these steps to keep everyone safe and limit the damage, then call. A real person answers 24/7.</p>
        </div>
        <a class="call-xl" href="${TEL}"><span class="call-xl-ico">${icon('phone')}</span><span><small>Call now, answered 24/7</small><strong>${PHONE}</strong></span></a>
      </div>
    </section>
    <section class="section section-tight">
      <div class="wrap">
        <div class="gas-alert" role="note">
          <span class="gas-ico">${icon('alert')}</span>
          <div><h2>Smell gas? Leave first, call second.</h2><p>Get everyone out of the house now, then call <strong>911</strong> or your gas company’s emergency line from outside. Don’t flip switches or use your phone inside. Call us once they’ve made it safe.</p></div>
        </div>
        <nav class="emg-tabs" aria-label="Choose your emergency">
          ${Object.entries(EMERGENCIES).map(([key, x]) => `<a class="emg-tab${x.danger ? ' is-danger' : ''}" href="#/emergency?topic=${key}" ${key === topic ? 'aria-current="true"' : ''}>${icon(x.icon)} ${x.label}</a>`).join('')}
        </nav>
        <div class="emg-panel${e.danger ? ' is-danger' : ''}">
          <div>
            <h2>${e.title}: step by step</h2>
            <ol class="emg-steps">${e.steps.map(([t, d]) => `<li><div><strong>${t}</strong><p>${d}</p></div></li>`).join('')}</ol>
          </div>
          <aside class="emg-side">
            <div class="card emg-call">
              <h3>${e.danger ? 'After the gas company says it’s safe' : 'Need a technician now?'}</h3>
              <p>${e.danger ? 'Luis handles gas line repairs and will test every connection before relighting appliances.' : `Our on-call ${SERVICES[e.service].noun} techs usually arrive within 60–90 minutes.`}</p>
              <a class="btn btn-orange btn-lg full" href="${TEL}">${icon('phone')} ${PHONE}</a>
              <a class="btn btn-outline full" href="#/book?service=${e.service}&urgency=emergency">Book an emergency visit online</a>
              <p class="hint">After-hours dispatch is ${money(AFTER_HOURS)} on nights, Sundays and holidays, waived for Ironwood Club members.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>`,
  };
}

/* ---------- My visits ---------- */
function visitsPage() {
  const list = [...state.appointments].sort((x, y) => y.createdAt - x.createdAt);
  const label = (a) => (a.status === 'cancelled' ? ['Cancelled', 'is-muted'] : a.completedAt ? ['Completed', 'is-done'] : a.emergency ? ['Emergency', 'is-urgent'] : ['Scheduled', 'is-ok']);
  return {
    title: 'My visits — Ironwood Plumbing & Air',
    html: `
    <section class="page-head is-short"><div class="wrap"><p class="eyebrow on-dark">Account</p><h1>My visits</h1><p class="lead">Visits booked on this device. Reschedule, cancel or track your technician.</p></div></section>
    <section class="section section-tight section-steel">
      <div class="wrap narrow">
        ${list.length ? `<ul class="visit-list">${list.map((a) => {
          const [text, cls] = label(a);
          return `<li class="card visit-item">
            <span class="icon-tile is-small">${icon(SERVICES[a.service].icon)}</span>
            <div><p class="visit-top"><strong>${SERVICES[a.service].name}: ${esc(a.problemLabel)}</strong><span class="status-pill ${cls}">${text}</span></p><p class="visit-sub">${whenText(a, { short: true })} · ${TECHS[a.tech].name} · ${esc(a.ref)}</p></div>
            <div class="visit-actions"><a class="btn btn-outline btn-sm" href="#/appointment/${a.ref}">Details</a>${a.status === 'scheduled' && !a.completedAt ? `<a class="btn btn-primary btn-sm" href="#/track/${a.ref}">Track</a>` : ''}</div>
          </li>`;
        }).join('')}</ul>` : `<div class="card empty"><h2>No visits yet.</h2><p>Book in about two minutes and you’ll see it here.</p><a class="btn btn-primary" href="#/book">Book service</a></div>`}
      </div>
    </section>`,
  };
}

function notFound() {
  return {
    title: 'Page not found — Ironwood Plumbing & Air',
    html: `
    <section class="section notfound">
      <div class="wrap narrow center">
        <span class="icon-tile is-big">${icon('pipe')}</span>
        <p class="eyebrow">Error 404</p>
        <h1>This pipe doesn’t lead anywhere.</h1>
        <p class="lead">The page you’re looking for has moved or never existed. Let’s get you back on track.</p>
        <div class="action-row center"><a class="btn btn-primary" href="#/">Go to the homepage</a><a class="btn btn-outline" href="#/book">Book service</a><a class="btn btn-outline" href="#/emergency">Emergency help</a></div>
      </div>
    </section>`,
  };
}

/* ---------- Router ---------- */
const router = createRouter([
  ['/', home],
  ['/services', servicesPage],
  ['/services/:slug', serviceDetail],
  ['/book', bookPage],
  ['/appointment/:ref', appointmentPage],
  ['/reschedule/:ref', reschedulePage],
  ['/track/:ref', trackPage],
  ['/pricing', pricingPage],
  ['/club', clubPage],
  ['/club/welcome', clubWelcome],
  ['/emergency', emergencyPage],
  ['/visits', visitsPage],
], {
  notFound,
  afterRender: (ctx) => {
    setMenu(false);
    if (ctx.path !== '/book') appliedQuery = '';
    document.body.dataset.route = ctx.path.split('/')[1] || 'home';
  },
});

function setMenu(open) {
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', String(open));
  document.getElementById('mobile-nav').hidden = !open;
}

/* ---------- Actions ---------- */
const goStep = (n) => { draft.step = n; saveDraft(); router.render(); };
const pickTarget = (name) => (name === 'resched' ? resched : draft);
const fieldError = (anchor, id, message) => {
  anchor.parentElement.querySelector(`#${id}`)?.remove();
  anchor.insertAdjacentHTML('afterend', `<p class="field-error" id="${id}">${message}</p>`);
};

actions({
  menu: (button) => setMenu(button.getAttribute('aria-expanded') !== 'true'),
  'scroll-to': (button) => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    target.querySelector('input, button, a')?.focus({ preventScroll: true });
  },
  'zip-live': (input) => {
    input.value = input.value.replace(/\D/g, '').slice(0, 5);
    if (input.value.length === 5) document.getElementById('zip-answer').innerHTML = zipAnswer(input.value);
  },
  'zip-check': (form) => {
    const input = form.querySelector('input');
    document.getElementById('zip-answer').innerHTML = zipAnswer(input.value.trim());
    if (!/^\d{5}$/.test(input.value.trim())) input.focus();
  },

  // Booking
  'book-reset': async () => {
    const ok = await confirmDialog({ title: 'Start over?', message: 'This clears the details you’ve entered for this booking.', confirm: 'Start over', cancel: 'Keep going' });
    if (!ok) return;
    draft = blankDraft();
    saveDraft();
    router.render();
  },
  'draft-choice': (input) => {
    draft[input.name] = input.value;
    if (input.name === 'service') draft.problem = '';
    saveDraft();
    router.render({ keepScroll: true });
  },
  'draft-text': (input) => { draft[input.name] = input.value; saveDraft(); },
  'draft-zip': (input) => {
    input.value = input.value.replace(/\D/g, '').slice(0, 5);
    draft.zip = input.value;
    saveDraft();
    document.getElementById('zip-result').innerHTML = zipStatus(draft.zip);
    const area = areaFor(draft.zip);
    document.getElementById('aside-where').innerHTML = area ? `${area}, ${draft.zip}` : '<span class="muted">—</span>';
  },
  'draft-member': (input) => { draft.member = input.checked; saveDraft(); router.render({ keepScroll: true }); },
  'focus-zip': () => { const zip = document.getElementById('b-zip'); zip.focus(); zip.select(); },
  'set-urgency': (button) => { draft.urgency = button.dataset.value; if (draft.urgency === 'emergency') { draft.day = ''; draft.window = ''; } saveDraft(); router.render({ keepScroll: true }); },
  'goto-step': (button) => goStep(Number(button.dataset.step)),
  'step-back': () => goStep(Math.max(1, draft.step - 1)),
  'step-problem': (form) => { if (validate(form)) goStep(2); },
  'step-address': (form) => {
    ['street', 'unit', 'zip', 'access'].forEach((k) => { draft[k] = form.elements[k].value.trim(); });
    saveDraft();
    if (!validate(form)) return;
    if (!areaFor(draft.zip)) {
      const zip = form.elements.zip;
      zip.setAttribute('aria-invalid', 'true');
      zip.setAttribute('aria-describedby', 'error-zip');
      fieldError(zip, 'error-zip', `Sorry, ${draft.zip} is outside our service area.`);
      document.getElementById('zip-out')?.scrollIntoView({ block: 'center' });
      zip.focus({ preventScroll: true });
      return;
    }
    goStep(3);
  },
  'pick-day': (button) => {
    const t = pickTarget(button.dataset.target);
    t.day = button.dataset.day;
    t.window = button.dataset.window || '';
    if (t === draft) saveDraft();
    router.render({ keepScroll: true });
  },
  'pick-window': (input) => {
    const t = pickTarget(input.dataset.target);
    t.day = input.dataset.day;
    t.window = input.value;
    if (t === draft) saveDraft();
    router.render({ keepScroll: true });
  },
  'step-time': (form) => {
    if (draft.urgency !== 'emergency' && !windowFor(draft.day, draft.window)) {
      const panel = form.querySelector('#window-panel');
      fieldError(panel, 'error-window', 'Choose an open arrival window to continue.');
      (form.querySelector('.window input:not(:disabled)') || form.querySelector('.day-chip.is-open'))?.focus();
      return;
    }
    goStep(4);
  },
  'step-contact': (form) => {
    ['name', 'phone', 'email', 'notes', 'photo'].forEach((k) => { draft[k] = form.elements[k].value.trim(); });
    draft.phone = formatPhone(draft.phone);
    saveDraft();
    if (validate(form)) goStep(5);
  },
  'confirm-booking': () => {
    const d = draft;
    const need = maxStep(d);
    if (need < 5) { toast('A detail needs another look before booking.'); goStep(need); return; }
    const svc = SERVICES[d.service];
    const w = windowFor(d.day, d.window);
    const ref = reference('IRN');
    const appt = {
      ref, service: d.service, problem: d.problem, problemLabel: problemOf(d).label, urgency: d.urgency, emergency: d.urgency === 'emergency',
      day: d.urgency === 'emergency' ? dayKey(new Date()) : d.day, window: w?.id || null, start: w?.start ?? null, end: w?.end ?? null,
      street: d.street, unit: d.unit, zip: d.zip, access: d.access, name: d.name, phone: d.phone, email: d.email, contact: d.contact,
      notes: d.notes, photo: d.photo, member: d.member, estimate: bookingEstimate(d), tech: svc.tech,
      status: 'scheduled', createdAt: Date.now(), trackStart: null, completedAt: null, rating: 0, history: [],
    };
    state.appointments.unshift(appt);
    state.profile = { name: d.name, phone: d.phone, email: d.email, street: d.street, unit: d.unit, zip: d.zip };
    save();
    draft = blankDraft();
    saveDraft();
    router.go(`#/appointment/${ref}`);
  },

  // Appointment
  reschedule: async (button) => {
    const a = findAppt(button.dataset.ref);
    const ok = await confirmDialog({ title: 'Reschedule this visit?', message: `Currently ${whenText(a)}. Your current window is held until you confirm a new one.`, confirm: 'Pick a new time', cancel: 'Keep this time' });
    if (ok) router.go(`#/reschedule/${a.ref}`);
  },
  'confirm-reschedule': (button) => {
    const a = findAppt(button.dataset.ref);
    const w = windowFor(resched.day, resched.window);
    if (!w) {
      const panel = document.getElementById('window-panel');
      fieldError(panel, 'error-window', 'Choose an open arrival window first.');
      (document.querySelector('.window input:not(:disabled)') || document.querySelector('.day-chip.is-open'))?.focus();
      return;
    }
    const before = whenText(a, { short: true });
    Object.assign(a, { emergency: false, urgency: 'week', day: resched.day, window: w.id, start: w.start, end: w.end, trackStart: null });
    a.estimate = priceEstimate({ title: a.estimate.title, low: a.estimate.low, high: a.estimate.high, kind: a.estimate.kind }, { member: a.member, afterHours: false });
    a.history.push(`Moved from ${before} to ${whenText(a, { short: true })}`);
    save();
    resched = { ref: null, day: '', window: '' };
    router.go(`#/appointment/${a.ref}`);
    toast(`Visit moved to ${whenText(a, { short: true })}.`);
  },
  'cancel-visit': async (button) => {
    const a = findAppt(button.dataset.ref);
    const ok = await confirmDialog({ title: 'Cancel this visit?', message: `${SERVICES[a.service].name} on ${whenText(a)}. There’s no charge for cancelling.`, confirm: 'Cancel visit', cancel: 'Keep visit', danger: true });
    if (!ok || a.status !== 'scheduled') return;
    a.status = 'cancelled';
    a.cancelledAt = Date.now();
    save();
    router.render();
    toast('Visit cancelled. Nothing was charged.');
  },
  'add-calendar': (button) => toast(`Demo: this would add your Ironwood visit to ${button.dataset.cal} Calendar.`),

  // Tracker
  'track-skip': (button) => {
    const a = findAppt(button.dataset.ref);
    const ph = trackPhase(a.trackStart);
    if (ph.index >= TRACK.length - 1) return;
    const elapsedToNext = TRACK.slice(0, ph.index + 1).reduce((sum, s) => sum + s.ms, 0);
    a.trackStart = Date.now() - elapsedToNext - 30;
    save();
  },
  'track-replay': (button) => {
    const a = findAppt(button.dataset.ref);
    Object.assign(a, { trackStart: Date.now(), completedAt: null, rating: 0 });
    save();
    router.render({ keepScroll: true });
  },
  'text-tech': () => toast('Demo: in the live app this opens a text thread with your technician.'),
  rate: (button) => {
    const a = findAppt(button.dataset.ref);
    a.rating = Number(button.dataset.value);
    save();
    document.querySelectorAll('.rate-star').forEach((star, i) => { star.classList.toggle('on', i < a.rating); star.setAttribute('aria-pressed', String(i + 1 === a.rating)); });
    toast(`Thanks for rating ${firstName(TECHS[a.tech].name)} ${a.rating} star${a.rating > 1 ? 's' : ''}! (Demo: nothing was posted.)`);
  },

  // Estimator
  'est-job': (input) => { state.estimator = { job: input.value, opts: {} }; save(); router.render({ keepScroll: true }); },
  'est-opt': (input) => { state.estimator.opts[input.dataset.group] = input.value; save(); router.render({ keepScroll: true }); },

  // Club
  calc: (input) => {
    const c = state.calc;
    if (input.type === 'checkbox') c[input.name] = input.checked;
    else c[input.name] = Number(input.value);
    save();
    document.getElementById('calc-repairs-out').textContent = money(c.repairs);
    document.getElementById('calc-out').innerHTML = calcOutput();
  },
  join: (form) => {
    if (!validate(form)) return;
    const zip = form.elements.zip;
    if (!areaFor(zip.value.trim())) {
      zip.setAttribute('aria-invalid', 'true');
      zip.setAttribute('aria-describedby', 'error-zip');
      fieldError(zip, 'error-zip', `Sorry, ${esc(zip.value.trim())} is outside our service area, so we can’t offer a membership there yet.`);
      zip.focus();
      return;
    }
    const v = Object.fromEntries(['name', 'phone', 'email', 'zip'].map((k) => [k, form.elements[k].value.trim()]));
    v.phone = formatPhone(v.phone);
    state.member = { ref: reference('CLUB'), ...v, since: Date.now() };
    state.profile = { ...state.profile, ...v };
    draft.member = true;
    saveDraft();
    save();
    router.go('#/club/welcome');
  },
  'cancel-club': async () => {
    const ok = await confirmDialog({ title: 'Cancel your membership?', message: 'You’ll lose the 15% repair discount, the waived after-hours fee and your seasonal tune-ups.', confirm: 'Cancel membership', cancel: 'Stay a member', danger: true });
    if (!ok) return;
    state.member = null;
    draft.member = false;
    saveDraft();
    save();
    router.render({ keepScroll: true });
    toast('Membership cancelled. Nothing was charged.');
  },
});

updateVisits();
