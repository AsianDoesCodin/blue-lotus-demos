// SPACES — demo website for a fictional real estate brokerage.
const { esc, money, router: createRouter, validate, formData, toast, modal, confirmDialog, reference, firstName, storage, actions, demoBar, formatDate, dayKey, addDays } = Kit;
demoBar('SPACES Real Estate');

const TAX_RATE = 0.0041; // sample effective property tax rate for the demo calculator
const INSURANCE_RATE = 0.0045; // sample annual home insurance as a share of price

const agents = {
  rachel: { name: 'Rachel Kim', initials: 'RK', color: '#221f19', role: 'Buyer & seller agent', areas: 'Hoover · Vestavia Hills', phone: '(205) 555-0131', sold: 38, years: 9, bio: 'Rachel grew up in Hoover and has helped hundreds of families buy and sell across the southern suburbs. Clients know her for calm negotiating and very quick replies.' },
  marcus: { name: 'Marcus Webb', initials: 'MW', color: '#1c211d', role: 'Listing specialist', areas: 'Mountain Brook · Homewood', phone: '(205) 555-0132', sold: 31, years: 12, bio: 'Marcus specializes in older homes and knows which renovations pay off at sale time. He has sold homes over the mountain for more than a decade.' },
  dana: { name: 'Dana Whitfield', initials: 'DW', color: '#241c18', role: 'Lake & waterfront', areas: 'Lake Martin', phone: '(256) 555-0133', sold: 24, years: 7, bio: 'Dana lives on Lake Martin year-round and can talk water depth, docks and permits with anyone. She covers every side of the lake.' },
  luis: { name: 'Luis Ortega', initials: 'LO', color: '#1f1d22', role: 'New construction & downtown', areas: 'Downtown Birmingham', phone: '(205) 555-0134', sold: 27, years: 6, bio: 'Luis works with builders across downtown and helps first-time buyers compare new construction with resale homes.' },
};
const areaAgent = { Hoover: 'rachel', 'Vestavia Hills': 'rachel', 'Mountain Brook': 'marcus', Homewood: 'marcus', 'Lake Martin': 'dana', 'Downtown Birmingham': 'luis' };
const areas = [
  { name: 'Hoover', blurb: 'Family neighborhoods, parks and quick access to I-459.' },
  { name: 'Homewood', blurb: 'Walkable streets, local shops and 1930s bungalows.' },
  { name: 'Mountain Brook', blurb: 'Leafy lanes, classic architecture and village shopping.' },
  { name: 'Vestavia Hills', blurb: 'Hillside views and mid-century homes on big lots.' },
  { name: 'Lake Martin', blurb: 'Deep-water lots, docks and weekend living.' },
  { name: 'Downtown Birmingham', blurb: 'New townhomes and lofts near restaurants and parks.' },
];

const listings = [
  {
    id: 'larkspur-bend', street: '2418 Larkspur Bend', area: 'Hoover', city: 'Hoover', zip: '35226',
    price: 689000, beds: 4, baths: 3.5, sqft: 3120, acres: 0.62, year: 2019, type: 'House', style: 'Modern farmhouse',
    badge: 'New', listedDaysAgo: 2, parking: '2-car attached garage', hoa: 0, mls: 'SP-26114', agent: 'rachel', schools: 'Hoover City Schools',
    photos: [
      ['home-1', 'White modern farmhouse with a wraparound porch and a gravel drive'],
      ['int-living', 'Great room with a vaulted, beamed ceiling and a white brick fireplace'],
      ['int-kitchen', 'White kitchen with a quartz waterfall island and black pendant lights'],
      ['int-bedroom', 'Primary bedroom with a tray ceiling and a reading chair by the window'],
    ],
    headline: 'Modern farmhouse with a wraparound porch',
    description: [
      'Built in 2019 on a quiet cul-de-sac, this four-bedroom farmhouse pairs an easy open plan with the porch everyone wants. The great room has a vaulted, beamed ceiling and a painted brick fireplace, and it opens straight into a kitchen with a waterfall island that seats three.',
      'The primary suite is on the main level with a tray ceiling and a walk-in closet. Upstairs there are three more bedrooms, a bonus room and plenty of storage. Out back, a level lawn meets a line of mature trees.',
    ],
    features: ['Main-level primary suite', 'Vaulted great room with beams', 'Quartz waterfall island', 'Wraparound porch', 'Bonus room upstairs', 'Level backyard'],
  },
  {
    id: 'wren-hollow', street: '1127 Wren Hollow Road', area: 'Homewood', city: 'Homewood', zip: '35209',
    price: 525000, beds: 3, baths: 2, sqft: 1860, acres: 0.21, year: 1938, type: 'House', style: 'Craftsman bungalow',
    badge: 'Open house Sat 1–3 PM', listedDaysAgo: 6, parking: 'Detached 1-car garage', hoa: 0, mls: 'SP-26097', agent: 'marcus', schools: 'Homewood City Schools',
    photos: [
      ['home-2', 'Sage green craftsman bungalow with stone porch columns and hydrangeas'],
      ['craftsman-living', 'Living room with built-in bookcases around a red brick fireplace'],
      ['craftsman-kitchen', 'Sage green kitchen with butcher-block counters and a farmhouse sink'],
    ],
    headline: 'Restored 1938 bungalow on a walkable street',
    description: [
      'A 1938 bungalow that kept its character and gained a modern kitchen. Original oak trim, built-in bookcases and a brick fireplace anchor the living room, while the 2022 kitchen adds sage cabinets, butcher-block counters and a farmhouse sink.',
      'Two bedrooms share a renovated hall bath, and the third has its own bath at the back of the house. The deep front porch faces a quiet, tree-lined street a few blocks from shops, coffee and parks.',
    ],
    features: ['Original built-ins and oak trim', 'Wood-burning brick fireplace', 'Kitchen renovated in 2022', 'Deep covered front porch', 'Walkable to shops and parks', 'Detached garage with workshop'],
  },
  {
    id: 'fairhaven-circle', street: '48 Fairhaven Circle', area: 'Mountain Brook', city: 'Mountain Brook', zip: '35213',
    price: 1150000, beds: 5, baths: 4.5, sqft: 4480, acres: 0.74, year: 1962, type: 'House', style: 'Georgian colonial',
    badge: null, listedDaysAgo: 12, parking: '2-car side-entry garage', hoa: 0, mls: 'SP-26071', agent: 'marcus', schools: 'Mountain Brook Schools',
    photos: [
      ['home-3', 'Red brick colonial with black shutters and a brick front walk'],
      ['colonial-living', 'Formal living room with a white mantel and French doors to a terrace'],
      ['colonial-dining', 'Dining room with wainscoting, a brass chandelier and a long walnut table'],
    ],
    headline: 'Classic brick colonial on three-quarters of an acre',
    description: [
      'A stately brick Georgian set well back from the street behind boxwoods and a brick walk. The formal rooms are generous and bright: a living room with a painted mantel and French doors to the terrace, and a dining room that seats twelve.',
      'The family wing adds a renovated kitchen, breakfast room and den. Upstairs, the primary suite has two walk-in closets, and four more bedrooms, a finished lower level and a flat, fenced backyard complete the picture.',
    ],
    features: ['Formal living and dining rooms', 'French doors to a stone terrace', 'Primary suite with two closets', 'Finished lower level', 'Fenced, level backyard', 'Side-entry garage'],
  },
  {
    id: 'quillan-trail', street: '3305 Quillan Trail', area: 'Vestavia Hills', city: 'Vestavia Hills', zip: '35216',
    price: 612000, previousPrice: 639000, beds: 3, baths: 2.5, sqft: 2240, acres: 0.48, year: 1959, renovated: 2023, type: 'House', style: 'Mid-century ranch',
    badge: 'Price reduced', listedDaysAgo: 24, parking: 'Carport and storage room', hoa: 0, mls: 'SP-26033', agent: 'rachel', schools: 'Vestavia Hills City Schools',
    photos: [
      ['home-4', 'Mid-century ranch house with a teal front door and blooming azaleas'],
      ['ranch-living', 'Living room with floor-to-ceiling windows and a stone fireplace wall'],
      ['ranch-kitchen', 'Walnut kitchen with white quartz counters and clerestory windows'],
    ],
    headline: 'Renovated mid-century ranch with a wall of glass',
    description: [
      'Built in 1959 and carefully renovated in 2023, this single-level ranch is all about light. A wall of floor-to-ceiling glass in the living room looks onto a wooded backyard, and the original stone fireplace wall was kept and restored.',
      'The new kitchen has walnut cabinets, quartz counters and clerestory windows. Three bedrooms include a primary suite with a walk-in shower, and the sellers are offering a flexible closing date.',
    ],
    features: ['Single-level living', 'Floor-to-ceiling windows', 'Restored stone fireplace', 'Walnut kitchen (2023)', 'Walk-in shower in primary', 'Wooded half-acre lot'],
  },
  {
    id: 'heron-point', street: '715 Heron Point Drive', area: 'Lake Martin', city: 'Dadeville', zip: '36853',
    price: 1395000, beds: 4, baths: 4, sqft: 3650, acres: 1.1, year: 2016, type: 'House', style: 'Lake house',
    badge: 'Waterfront', listedDaysAgo: 9, parking: '2-car garage and boat storage', hoa: 0, mls: 'SP-26088', agent: 'dana', schools: 'Tallapoosa County Schools',
    photos: [
      ['home-5', 'Dark-sided lake house with a stone chimney and a private dock'],
      ['lake-great-room', 'Great room with a two-story wall of windows facing the lake'],
      ['lake-dock', 'Covered boathouse and dock with a boat lift on calm water at sunset'],
    ],
    headline: 'Deep-water lake house with a covered dock',
    description: [
      'Set on a gentle point with deep water year-round, this lake house was built for long weekends and big gatherings. The great room has a two-story wall of windows, timber beams and a stacked-stone fireplace, all facing the water.',
      'Every bedroom has its own bath, and the lower level opens onto a lawn that runs down to a covered dock with a boat slip and lift. A screened porch, outdoor kitchen and firepit make it easy to live outside from spring to fall.',
    ],
    features: ['Deep water year-round', 'Covered dock with slip and lift', 'Two-story great room', 'Four en-suite bedrooms', 'Screened porch and outdoor kitchen', 'Sold partly furnished'],
  },
  {
    id: 'foundry-row', street: '220 Foundry Row, Unit 4', area: 'Downtown Birmingham', city: 'Birmingham', zip: '35203',
    price: 419000, beds: 3, baths: 2.5, sqft: 1740, acres: null, year: 2025, type: 'Townhome', style: 'New-construction townhome',
    badge: 'New construction', listedDaysAgo: 4, parking: 'Rear-entry 1-car garage', hoa: 185, mls: 'SP-26109', agent: 'luis', schools: 'Birmingham City Schools',
    photos: [
      ['home-6', 'Row of new brick and white board-and-batten townhomes'],
      ['townhome-kitchen', 'Open kitchen with white oak cabinets, a large island and city views'],
      ['townhome-terrace', 'Rooftop terrace with an outdoor sofa and string lights at dusk'],
    ],
    headline: 'New end-unit townhome with a rooftop terrace',
    description: [
      'A brand-new end-unit townhome a short walk from restaurants, parks and weekend markets. The open main floor has white oak cabinets, a large island and polished concrete floors, with big windows that pull in city views.',
      'Upstairs are three bedrooms, including a primary suite with a double vanity, and on top is a private rooftop terrace with room for a lounge set and a grill. Monthly dues cover exterior maintenance and landscaping.',
    ],
    features: ['End unit with extra windows', 'Private rooftop terrace', 'Polished concrete floors', 'Primary suite with double vanity', 'Rear-entry garage', 'Builder warranty included'],
  },
];
const byId = (id) => listings.find((l) => l.id === id);

const saved = new Set(storage.get('spaces-saved', []));
let requests = storage.get('spaces-requests', []);
let profile = storage.get('spaces-profile', {});
const viewingDone = {};
let valuationDone = null;

const icon = {
  heart: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1z"/></svg>',
  share: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 13v6h14v-6"/></svg>',
  search: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  camera: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  phone: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/></svg>',
  left: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>',
  right: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
  close: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
};

const photo = (name, alt, { eager = false, sizes = '(max-width: 900px) 100vw, 50vw' } = {}) =>
  `<img src="img/${name}.webp" srcset="img/${name}-sm.webp 768w, img/${name}.webp 1536w" sizes="${sizes}" alt="${esc(alt)}" width="1536" height="1024" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
const num = (n) => n.toLocaleString('en-US');
const fullAddress = (l) => `${l.city}, AL ${l.zip}`;
const listedLabel = (days) => (days === 0 ? 'Listed today' : days === 1 ? 'Listed yesterday' : `Listed ${days} days ago`);
const badgeTone = (badge) => ({ New: 'tone-blue', 'Price reduced': 'tone-amber', 'New construction': 'tone-navy', Waterfront: 'tone-teal' }[badge] || (badge?.startsWith('Open house') ? 'tone-green' : 'tone-blue'));
const avatar = (a, cls = '') => `<span class="avatar ${cls}" style="background:${a.color}" aria-hidden="true">${a.initials}</span>`;
const telHref = (phone) => `tel:+1${phone.replace(/\D/g, '')}`;

function saveButton(l, { labelled = false } = {}) {
  const on = saved.has(l.id);
  return `<button class="save-btn${labelled ? ' labelled' : ''}" data-action="save" data-id="${l.id}" aria-pressed="${on}" ${labelled ? '' : `aria-label="Save ${esc(l.street)}"`}>${icon.heart}${labelled ? `<span>${on ? 'Saved' : 'Save'}</span>` : ''}</button>`;
}

function listingCard(l, sizes = '(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 400px') {
  const [cover, alt] = l.photos[0];
  return `
    <article class="listing-card">
      <div class="listing-media">
        ${photo(cover, alt, { sizes })}
        ${l.badge ? `<span class="badge ${badgeTone(l.badge)}">${esc(l.badge)}</span>` : ''}
        <span class="photo-count">${icon.camera}${l.photos.length}</span>
      </div>
      ${saveButton(l)}
      <div class="listing-body">
        <p class="price">${money(l.price)}${l.previousPrice ? ` <s>${money(l.previousPrice)}</s>` : ''}</p>
        <p class="specs"><span><strong>${l.beds}</strong> bd</span><span><strong>${l.baths}</strong> ba</span><span><strong>${num(l.sqft)}</strong> sq ft</span></p>
        <h3><a href="#/listing/${l.id}">${esc(l.street)}</a></h3>
        <p class="address">${esc(fullAddress(l))}</p>
      </div>
    </article>`;
}

const selectField = (name, label, options, value, attrs = 'data-change="filter"') => `
  <label class="select-field"><span>${label}</span><select name="${name}" ${attrs}>${options.map(([v, text]) => `<option value="${v}" ${String(v) === String(value) ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`;
const areaOptions = [['', 'Any area'], ...areas.map((a) => [a.name, a.name])];
const minOptions = [['', 'No min'], ['300000', '$300K'], ['400000', '$400K'], ['500000', '$500K'], ['750000', '$750K'], ['1000000', '$1M']];
const maxOptions = [['', 'No max'], ['500000', '$500K'], ['750000', '$750K'], ['1000000', '$1M'], ['1500000', '$1.5M']];
const bedOptions = [['', 'Any'], ['2', '2+'], ['3', '3+'], ['4', '4+'], ['5', '5+']];
const bathOptions = [['', 'Any'], ['2', '2+'], ['3', '3+'], ['4', '4+']];

function home() {
  const newest = [...listings].sort((a, b) => a.listedDaysAgo - b.listedDaysAgo).slice(0, 3);
  return {
    title: 'SPACES Real Estate — Homes for sale in Birmingham, Alabama',
    html: `
    <section class="hero">
      <div class="hero-media">${photo('hero', 'Modern white farmhouse with tall black windows at sunset', { eager: true, sizes: '100vw' })}</div>
      <div class="wrap hero-inner">
        <p class="eyebrow light">Birmingham · Over the Mountain · Lake Martin</p>
        <h1>Find the place that <em>fits your life.</em></h1>
        <p class="hero-lead">Local agents, honest advice and every home we list, in one easy search.</p>
        <form class="search-panel" data-form="search" role="search" aria-label="Search homes for sale">
          ${selectField('area', 'Location', areaOptions, '', '')}
          ${selectField('max', 'Max price', maxOptions, '', '')}
          ${selectField('beds', 'Bedrooms', bedOptions, '', '')}
          <button class="btn btn-primary" type="submit">${icon.search}Search homes</button>
        </form>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">Just listed</p><h2>New to the market</h2></div><a class="link" href="#/buy">View all ${listings.length} homes →</a></div>
        <div class="listing-grid">${newest.map((l) => listingCard(l)).join('')}</div>
      </div>
    </section>
    <section class="section section-soft">
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">Neighborhoods</p><h2>Explore by area</h2></div></div>
        <div class="area-grid">
          ${areas.map((a) => {
            return `<a class="area-card" href="#/buy?area=${encodeURIComponent(a.name)}"><strong>${a.name}</strong><span>${a.blurb}</span><small>View homes →</small></a>`;
          }).join('')}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="wrap sell-band">
        <div class="sell-media">${photo('colonial-living', 'Bright traditional living room with French doors to a terrace')}</div>
        <div class="sell-copy">
          <p class="eyebrow">Selling?</p>
          <h2>Find out what your home is worth.</h2>
          <p class="lead">Get an instant estimate online, then a free, no-pressure visit from an agent who knows your street.</p>
          <ul class="checks">${['Instant estimate in under a minute', 'Priced from local sales, not guesswork', 'No obligation to list'].map((t) => `<li>${icon.check}${t}</li>`).join('')}</ul>
          <a class="btn btn-primary" href="#/sell">Get my estimate</a>
        </div>
      </div>
    </section>
    <section class="section section-soft">
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">Our agents</p><h2>People who know these streets</h2></div><a class="link" href="#/agents">Meet the team →</a></div>
        <div class="agent-strip">
          ${Object.values(agents).map((a) => `<a class="agent-mini" href="#/agents">${avatar(a)}<span><strong>${a.name}</strong><small>${a.areas}</small></span></a>`).join('')}
        </div>
      </div>
    </section>`,
  };
}

function readFilters(query) {
  return {
    area: areas.some((a) => a.name === query.get('area')) ? query.get('area') : '',
    min: Number(query.get('min')) || 0,
    max: Number(query.get('max')) || 0,
    beds: Number(query.get('beds')) || 0,
    baths: Number(query.get('baths')) || 0,
    type: ['House', 'Townhome'].includes(query.get('type')) ? query.get('type') : '',
    sort: ['newest', 'price-asc', 'price-desc', 'size'].includes(query.get('sort')) ? query.get('sort') : 'newest',
  };
}

function buy({ query }) {
  const f = readFilters(query);
  const sorters = { newest: (a, b) => a.listedDaysAgo - b.listedDaysAgo, 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, size: (a, b) => b.sqft - a.sqft };
  const results = listings
    .filter((l) => (!f.area || l.area === f.area) && (!f.min || l.price >= f.min) && (!f.max || l.price <= f.max) && (!f.beds || l.beds >= f.beds) && (!f.baths || l.baths >= f.baths) && (!f.type || l.type === f.type))
    .sort(sorters[f.sort]);
  const label = (list, value) => list.find(([v]) => String(v) === String(value))?.[1];
  const chips = [
    f.area && ['area', f.area],
    f.min && ['min', `From ${label(minOptions, f.min) || money(f.min)}`],
    f.max && ['max', `Up to ${label(maxOptions, f.max) || money(f.max)}`],
    f.beds && ['beds', `${f.beds}+ beds`],
    f.baths && ['baths', `${f.baths}+ baths`],
    f.type && ['type', f.type],
  ].filter(Boolean);
  return {
    title: `${f.area ? `Homes for sale in ${f.area}` : 'Homes for sale'} — SPACES`,
    html: `
    <section class="page-head compact">
      <div class="wrap">
        <p class="eyebrow">Buy</p>
        <h1>${f.area ? `Homes for sale in ${esc(f.area)}` : 'Homes for sale'}</h1>
      </div>
    </section>
    <section class="section section-tight">
      <div class="wrap">
        <div class="filter-bar">
          ${selectField('area', 'Location', areaOptions, f.area)}
          ${selectField('min', 'Min price', minOptions, f.min || '')}
          ${selectField('max', 'Max price', maxOptions, f.max || '')}
          ${selectField('beds', 'Beds', bedOptions, f.beds || '')}
          ${selectField('baths', 'Baths', bathOptions, f.baths || '')}
          ${selectField('type', 'Home type', [['', 'Any type'], ['House', 'House'], ['Townhome', 'Townhome']], f.type)}
        </div>
        <div class="results-head">
          <p class="results-count" aria-live="polite"><strong>${results.length}</strong> ${results.length === 1 ? 'home' : 'homes'} for sale</p>
          ${chips.length ? `<div class="chips">${chips.map(([name, text]) => `<button class="chip" data-action="clear-filter" data-name="${name}" aria-label="Remove filter: ${esc(text)}">${esc(text)} ${icon.close}</button>`).join('')}<a class="text-link" href="#/buy">Clear all</a></div>` : ''}
          ${selectField('sort', 'Sort', [['newest', 'Newest'], ['price-asc', 'Price (low to high)'], ['price-desc', 'Price (high to low)'], ['size', 'Largest']], f.sort)}
        </div>
        ${results.length ? `<div class="listing-grid">${results.map((l) => listingCard(l)).join('')}</div>` : `
          <div class="empty">
            <h2>No homes match these filters</h2>
            <p>Try a wider price range or a different area. New homes are added every week.</p>
            <a class="btn btn-primary" href="#/buy">Clear filters</a>
          </div>`}
      </div>
    </section>`,
  };
}

function calculator(l) {
  return `
  <section class="calculator" id="calculator" data-id="${l.id}" aria-labelledby="calc-title">
    <div class="calc-head">
      <h2 id="calc-title">Monthly payment</h2>
      <p class="calc-total"><strong id="calc-total">—</strong><span>per month</span></p>
    </div>
    <div class="calc-grid">
      <label class="calc-field"><span>Home price</span><span class="affix"><em>$</em><input name="price" inputmode="numeric" value="${num(l.price)}" data-input="calc" aria-describedby="calc-note"></span></label>
      <label class="calc-field"><span>Down payment</span><span class="affix suffix"><input name="down" type="number" min="0" max="100" step="1" value="20" data-input="calc"><em>%</em></span><small id="calc-down"></small></label>
      <label class="calc-field"><span>Interest rate</span><span class="affix suffix"><input name="rate" type="number" min="0" max="20" step="0.05" value="6.4" data-input="calc"><em>%</em></span></label>
      <label class="calc-field"><span>Loan term</span><select name="term" data-change="calc"><option value="30">30-year fixed</option><option value="20">20-year fixed</option><option value="15">15-year fixed</option></select></label>
    </div>
    <div class="calc-bar" aria-hidden="true"><span class="seg pi"></span><span class="seg tax"></span><span class="seg ins"></span><span class="seg hoa"></span></div>
    <dl class="calc-breakdown">
      <div><dt><i class="dot pi"></i>Principal &amp; interest</dt><dd id="calc-pi"></dd></div>
      <div><dt><i class="dot tax"></i>Property tax</dt><dd id="calc-tax"></dd></div>
      <div><dt><i class="dot ins"></i>Home insurance</dt><dd id="calc-ins"></dd></div>
      <div><dt><i class="dot hoa"></i>HOA dues</dt><dd id="calc-hoa"></dd></div>
    </dl>
    <p class="fine" id="calc-note">Estimate only, using sample tax and insurance rates for this demo. A lender will give you exact figures.</p>
  </section>`;
}

function updateCalculator() {
  const box = document.getElementById('calculator');
  if (!box) return;
  const l = byId(box.dataset.id);
  const field = (name) => box.querySelector(`[name="${name}"]`);
  const price = Number(field('price').value.replace(/[^\d.]/g, '')) || 0;
  const downPct = Math.min(100, Math.max(0, Number(field('down').value) || 0));
  const rate = Math.min(20, Math.max(0, Number(field('rate').value) || 0));
  const years = Number(field('term').value);
  const loan = price * (1 - downPct / 100);
  const r = rate / 100 / 12;
  const n = years * 12;
  const parts = {
    pi: loan <= 0 ? 0 : r === 0 ? loan / n : (loan * r) / (1 - (1 + r) ** -n),
    tax: (price * TAX_RATE) / 12,
    ins: (price * INSURANCE_RATE) / 12,
    hoa: l.hoa || 0,
  };
  const total = Object.values(parts).reduce((sum, v) => sum + v, 0);
  box.querySelector('#calc-total').textContent = price ? money(total) : '—';
  box.querySelector('#calc-down').textContent = `${money(price * (downPct / 100))} down · ${money(loan)} loan`;
  Object.entries(parts).forEach(([key, value]) => {
    box.querySelector(`#calc-${key}`).textContent = key === 'hoa' && !value ? 'None' : money(value);
    box.querySelector(`.seg.${key}`).style.width = total ? `${(value / total) * 100}%` : '0';
  });
}

function viewingPanel(l) {
  const a = agents[l.agent];
  const done = viewingDone[l.id];
  const head = `<div class="agent-row">${avatar(a)}<div><strong>${a.name}</strong><span>${a.role}</span></div><a class="call" href="${telHref(a.phone)}" aria-label="Call ${a.name} at ${a.phone}">${icon.phone}</a></div>`;
  if (done) {
    return `
      <div class="contact-card" id="viewing">
        ${head}
        <div class="done" role="status" tabindex="-1">
          <span class="done-tick">${icon.check}</span>
          <h2>Viewing requested</h2>
          <p>Thanks, ${esc(firstName(done.name))}. ${a.name.split(' ')[0]} will confirm your ${done.slot.toLowerCase()} viewing on <strong>${esc(formatDate(new Date(`${done.date}T12:00`), { weekday: 'long', month: 'long', day: 'numeric' }))}</strong> by text.</p>
          <p class="ref">Reference ${esc(done.ref)}</p>
          <p class="fine">Demo request: nothing was sent. It is saved in this browser under Saved homes.</p>
          <button class="btn btn-ghost full" data-action="viewing-reset" data-id="${l.id}">Request another time</button>
        </div>
      </div>`;
  }
  const min = dayKey(addDays(new Date(), 1));
  const max = dayKey(addDays(new Date(), 30));
  return `
    <div class="contact-card" id="viewing">
      ${head}
      <h2>Request a viewing</h2>
      <form data-form="viewing" data-id="${l.id}" novalidate>
        <div class="field"><label for="v-date">Preferred date</label><input id="v-date" name="date" type="date" min="${min}" max="${max}" required data-required="Choose a date for your viewing." data-range-message="Choose a date from tomorrow onward."></div>
        <fieldset class="slots"><legend>Time of day</legend>
          ${[['Morning', '9–12'], ['Afternoon', '12–4'], ['Evening', '4–7']].map(([slot, hours], i) => `<label class="slot"><input type="radio" name="slot" value="${slot}" ${i === 1 ? 'checked' : ''}><span>${slot}<small>${hours}</small></span></label>`).join('')}
        </fieldset>
        <div class="field"><label for="v-name">Full name</label><input id="v-name" name="name" autocomplete="name" required data-required="Enter your name." value="${esc(profile.name)}"></div>
        <div class="field"><label for="v-email">Email</label><input id="v-email" name="email" type="email" autocomplete="email" required data-required="Enter your email address." value="${esc(profile.email)}"></div>
        <div class="field"><label for="v-phone">Mobile</label><input id="v-phone" name="phone" type="tel" autocomplete="tel" required data-required="Enter a mobile number so we can confirm by text." value="${esc(profile.phone)}"></div>
        <div class="field"><label for="v-message">Message <span class="optional">(optional)</span></label><textarea id="v-message" name="message" rows="3" placeholder="Pre-approved? First-time buyer? Anything we should know."></textarea></div>
        <button class="btn btn-primary full" type="submit">Request viewing</button>
        <p class="fine">Viewings run Monday to Saturday. No payment details needed.</p>
      </form>
    </div>`;
}

function listingPage({ params }) {
  const l = byId(params.id);
  if (!l) return null;
  const listed = addDays(new Date(), -l.listedDaysAgo);
  const similar = listings.filter((x) => x.id !== l.id).sort((a, b) => Math.abs(a.price - l.price) - Math.abs(b.price - l.price)).slice(0, 3);
  const facts = [
    ['Home type', l.type], ['Style', l.style], ['Year built', `${l.year}${l.renovated ? ` · renovated ${l.renovated}` : ''}`],
    ['Lot size', l.acres ? `${l.acres} acres` : 'Townhome lot'], ['Parking', l.parking], ['HOA dues', l.hoa ? `${money(l.hoa)} / month` : 'None'],
    ['School district', l.schools], ['Listed', `${formatDate(listed, { month: 'long', day: 'numeric', year: 'numeric' })} (${l.listedDaysAgo} days on market)`], ['MLS number', l.mls],
  ];
  const photoButton = ([name, alt], i, cls, sizes) => `<button class="${cls}" data-action="lightbox" data-id="${l.id}" data-index="${i}" aria-label="Open photo ${i + 1} of ${l.photos.length}: ${esc(alt)}">${photo(name, alt, { eager: i === 0, sizes })}${cls === 'gallery-side last' ? `<span class="gallery-more">${icon.camera}View all ${l.photos.length} photos</span>` : ''}</button>`;
  return {
    title: `${l.street}, ${fullAddress(l)} — SPACES`,
    html: `
    <section class="listing-top">
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/buy">Buy</a><span aria-hidden="true">/</span><a href="#/buy?area=${encodeURIComponent(l.area)}">${l.area}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(l.street)}</span></nav>
        <div class="gallery">
          ${photoButton(l.photos[0], 0, 'gallery-main', '(max-width: 900px) 100vw, 66vw')}
          ${photoButton(l.photos[1], 1, 'gallery-side', '(max-width: 900px) 50vw, 33vw')}
          ${photoButton(l.photos[2], 2, 'gallery-side last', '(max-width: 900px) 50vw, 33vw')}
        </div>
      </div>
    </section>
    <section class="listing-content">
      <div class="wrap listing-layout">
        <div class="listing-main">
          <div class="listing-head">
            <div>
              ${l.badge ? `<span class="badge ${badgeTone(l.badge)}">${esc(l.badge)}</span>` : ''}
              <p class="listing-price">${money(l.price)}${l.previousPrice ? `<span class="was">was ${money(l.previousPrice)}</span>` : ''}</p>
              <h1>${esc(l.street)}</h1>
              <p class="listing-address">${esc(fullAddress(l))} · ${listedLabel(l.listedDaysAgo)}</p>
            </div>
            <div class="listing-tools">${saveButton(l, { labelled: true })}<button class="tool-btn" data-action="share" data-id="${l.id}">${icon.share}<span>Share</span></button></div>
          </div>
          <ul class="key-specs">
            <li><strong>${l.beds}</strong><span>Bedrooms</span></li>
            <li><strong>${l.baths}</strong><span>Bathrooms</span></li>
            <li><strong>${num(l.sqft)}</strong><span>Square feet</span></li>
            <li><strong>${l.acres ? l.acres : '—'}</strong><span>${l.acres ? 'Acres' : 'Lot'}</span></li>
          </ul>
          <div class="prose">
            <h2>${esc(l.headline)}</h2>
            ${l.description.map((p) => `<p>${esc(p)}</p>`).join('')}
          </div>
          <h2 class="block-title">Highlights</h2>
          <ul class="feature-list">${l.features.map((x) => `<li>${icon.check}${esc(x)}</li>`).join('')}</ul>
          <h2 class="block-title">Property details</h2>
          <dl class="facts-grid">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          ${calculator(l)}
        </div>
        <aside class="listing-aside">${viewingPanel(l)}</aside>
      </div>
    </section>
    <section class="section section-soft">
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">You might also like</p><h2>Similar homes</h2></div><a class="link" href="#/buy">All homes →</a></div>
        <div class="listing-grid">${similar.map((x) => listingCard(x)).join('')}</div>
      </div>
    </section>
    <div class="mobile-cta"><span><strong>${money(l.price)}</strong><small>${l.beds} bd · ${l.baths} ba · ${num(l.sqft)} sq ft</small></span><button class="btn btn-primary" data-action="to-viewing">Request viewing</button></div>`,
    mount: updateCalculator,
  };
}

function savedPage() {
  const homes = listings.filter((l) => saved.has(l.id));
  const active = requests.filter((r) => byId(r.listing));
  return {
    title: 'Saved homes — SPACES',
    html: `
    <section class="page-head compact"><div class="wrap"><p class="eyebrow">Your list</p><h1>Saved homes</h1><p class="lead">Homes you save and viewings you request are kept in this browser so you can come back to them.</p></div></section>
    <section class="section section-tight">
      <div class="wrap">
        ${homes.length ? `<div class="listing-grid">${homes.map((l) => listingCard(l)).join('')}</div>` : `
          <div class="empty">
            <span class="empty-icon">${icon.heart}</span>
            <h2>No saved homes yet</h2>
            <p>Tap the heart on any home to keep it here and compare later.</p>
            <a class="btn btn-primary" href="#/buy">Browse homes</a>
          </div>`}
        ${active.length ? `
          <h2 class="block-title spaced">Viewing requests</h2>
          <ul class="request-list">
            ${active.map((r) => {
              const l = byId(r.listing);
              return `<li class="request">
                <span class="request-thumb">${photo(l.photos[0][0], '', { sizes: '120px' })}</span>
                <span class="request-info"><a href="#/listing/${l.id}">${esc(l.street)}</a><span>${esc(formatDate(new Date(`${r.date}T12:00`), { weekday: 'short', month: 'short', day: 'numeric' }))} · ${esc(r.slot)} · with ${agents[l.agent].name}</span><small>${esc(r.ref)} · Awaiting confirmation</small></span>
                <button class="btn btn-ghost btn-sm" data-action="cancel-request" data-ref="${esc(r.ref)}">Cancel</button>
              </li>`;
            }).join('')}
          </ul>` : ''}
      </div>
    </section>`,
  };
}

const PRICE_PER_SQFT = { Hoover: 215, Homewood: 285, 'Mountain Brook': 330, 'Vestavia Hills': 265, 'Lake Martin': 385, 'Downtown Birmingham': 240 };
const CONDITION = { 'Needs work': 0.86, Good: 1, Updated: 1.07, 'Like new': 1.13 };
const TYPE_FACTOR = { House: 1, Townhome: 0.94, Condo: 0.86 };
function estimateValue({ area, sqft, condition, type, beds, baths }) {
  const perSqft = PRICE_PER_SQFT[area];
  const size = Number(String(sqft).replace(/[^\d]/g, ''));
  if (!perSqft || !(size >= 400 && size <= 15000)) return null;
  const value = perSqft * size * (CONDITION[condition] || 1) * (TYPE_FACTOR[type] || 1) + (Number(beds) >= 4 ? 12000 : 0) + (Number(baths) >= 3 ? 9000 : 0);
  const round = (n) => Math.round(n / 5000) * 5000;
  return { low: round(value * 0.94), mid: round(value), high: round(value * 1.06), perSqft };
}

function estimateCard(values) {
  const e = estimateValue(values);
  if (!e) return `<p class="eyebrow">Instant estimate</p><p class="estimate-empty">Choose the area and enter the size of the home to see an estimate.</p>`;
  const a = agents[areaAgent[values.area]];
  return `
    <p class="eyebrow">Instant estimate</p>
    <p class="estimate-range">${money(e.low)} – ${money(e.high)}</p>
    <p class="estimate-mid">Most likely around <strong>${money(e.mid)}</strong></p>
    <div class="estimate-scale" aria-hidden="true"><span></span></div>
    <p class="fine">Based on a sample price of ${money(e.perSqft)} per sq ft in ${esc(values.area)}. A visit makes it precise.</p>
    <div class="agent-row small">${avatar(a)}<div><strong>${a.name}</strong><span>Covers ${esc(values.area)}</span></div></div>`;
}

function sell() {
  const d = profile;
  return {
    title: 'What is my home worth? Free valuation — SPACES',
    html: `
    <section class="page-head"><div class="wrap"><p class="eyebrow">Sell</p><h1>What is your home worth?</h1><p class="lead">Tell us about your home for an instant estimate, then book a free valuation visit. No obligation to list.</p></div></section>
    <section class="section section-tight">
      <div class="wrap sell-layout">
        <form class="panel" data-form="valuation" data-input="estimate" novalidate>
          <h2 class="panel-title">Your home</h2>
          <div class="field"><label for="s-address">Street address</label><input id="s-address" name="address" autocomplete="street-address" required data-required="Enter the address of the home." placeholder="e.g. 1450 Maple Crest Drive"></div>
          <div class="field-row">
            <div class="field"><label for="s-area">Area</label><select id="s-area" name="area" required data-required="Choose the area."><option value="">Choose an area</option>${areas.map((a) => `<option>${a.name}</option>`).join('')}</select></div>
            <div class="field"><label for="s-sqft">Size (sq ft)</label><input id="s-sqft" name="sqft" type="number" inputmode="numeric" min="400" max="15000" required data-required="Enter the size in square feet." data-range-message="Enter a size between 400 and 15,000 sq ft." placeholder="e.g. 2,100"></div>
          </div>
          <fieldset class="choice-row"><legend>Home type</legend>${['House', 'Townhome', 'Condo'].map((t, i) => `<label class="choice"><input type="radio" name="type" value="${t}" ${i === 0 ? 'checked' : ''}><span>${t}</span></label>`).join('')}</fieldset>
          <div class="field-row">
            <div class="field"><label for="s-beds">Bedrooms</label><select id="s-beds" name="beds">${['1', '2', '3', '4', '5', '6+'].map((b) => `<option ${b === '3' ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
            <div class="field"><label for="s-baths">Bathrooms</label><select id="s-baths" name="baths">${['1', '1.5', '2', '2.5', '3', '3.5', '4+'].map((b) => `<option ${b === '2' ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
          </div>
          <fieldset class="choice-row four"><legend>Condition</legend>${Object.keys(CONDITION).map((c) => `<label class="choice"><input type="radio" name="condition" value="${c}" ${c === 'Good' ? 'checked' : ''}><span>${c}</span></label>`).join('')}</fieldset>
          <h2 class="panel-title">Your details</h2>
          <div class="field"><label for="s-timeline">When are you thinking of selling?</label><select id="s-timeline" name="timeline"><option>In the next 3 months</option><option>In 3–6 months</option><option>In 6–12 months</option><option>Just curious for now</option></select></div>
          <div class="field"><label for="s-name">Full name</label><input id="s-name" name="name" autocomplete="name" required data-required="Enter your name." value="${esc(d.name)}"></div>
          <div class="field-row">
            <div class="field"><label for="s-email">Email</label><input id="s-email" name="email" type="email" autocomplete="email" required data-required="Enter your email address." value="${esc(d.email)}"></div>
            <div class="field"><label for="s-phone">Phone <span class="optional">(optional)</span></label><input id="s-phone" name="phone" type="tel" autocomplete="tel" value="${esc(d.phone)}"></div>
          </div>
          <button class="btn btn-primary" type="submit">Book my free valuation visit</button>
        </form>
        <aside class="estimate-card" id="estimate" aria-live="polite">${estimateCard({})}</aside>
      </div>
    </section>`,
  };
}

function valuationRequested() {
  if (!valuationDone) return null;
  const v = valuationDone;
  const a = agents[areaAgent[v.area]];
  return {
    title: 'Valuation visit requested — SPACES',
    html: `
    <section class="section">
      <div class="wrap narrow">
        <div class="confirm-card">
          <span class="done-tick">${icon.check}</span>
          <p class="eyebrow">Request ${esc(v.ref)}</p>
          <h1>Thanks, ${esc(firstName(v.name))}. We will be in touch.</h1>
          <p class="lead">${a.name} will call you within one business day to arrange a 30-minute visit at ${esc(v.address)}.</p>
          <div class="confirm-grid">
            <div><span>Instant estimate</span><strong>${money(v.estimate.low)} – ${money(v.estimate.high)}</strong></div>
            <div><span>Your agent</span><strong>${a.name}</strong><small>${a.phone}</small></div>
          </div>
          <ol class="steps">
            <li><strong>A quick call</strong><span>We confirm a time that suits you and ask a few questions about the home.</span></li>
            <li><strong>A 30-minute visit</strong><span>${a.name.split(' ')[0]} walks through the home and notes updates that add value.</span></li>
            <li><strong>Your pricing plan</strong><span>Within two days you get a written valuation with recent local sales.</span></li>
          </ol>
          <p class="fine">Demo request: nothing was sent and no one will call.</p>
          <div class="actions-row"><a class="btn btn-primary" href="#/buy">Browse homes for sale</a><a class="btn btn-ghost" href="#/">Back to home</a></div>
        </div>
      </div>
    </section>`,
  };
}

function agentsPage() {
  return {
    title: 'Our agents — SPACES',
    html: `
    <section class="page-head"><div class="wrap"><p class="eyebrow">Agents</p><h1>Local agents who pick up the phone</h1><p class="lead">Each of our agents focuses on a few neighborhoods, so the advice you get is specific to your street.</p></div></section>
    <section class="section section-tight">
      <div class="wrap agent-grid">
        ${Object.entries(agents).map(([id, a]) => {
          const own = listings.filter((l) => l.agent === id);
          return `
          <article class="agent-card">
            <div class="agent-top">${avatar(a, 'lg')}<div><h2>${a.name}</h2><p class="agent-role">${a.role}</p><p class="agent-areas">${a.areas}</p></div></div>
            <p>${a.bio}</p>
            <dl class="agent-stats"><div><dt>Homes sold, last 12 months</dt><dd>${a.sold}</dd></div><div><dt>Years with SPACES</dt><dd>${a.years}</dd></div></dl>
            ${own.length ? `<p class="agent-listings"><span>Current listings:</span> ${own.map((l) => `<a href="#/listing/${l.id}">${esc(l.street)}</a>`).join(', ')}</p>` : ''}
            <div class="actions-row"><button class="btn btn-primary" data-action="message-agent" data-agent="${id}">Send a message</button><a class="btn btn-ghost" href="${telHref(a.phone)}">${icon.phone}${a.phone}</a></div>
          </article>`;
        }).join('')}
      </div>
    </section>`,
  };
}

function openAgentMessage(id) {
  const a = agents[id];
  const { dialog } = modal(`
    <div class="modal-head">${avatar(a)}<div><h2 id="msg-title">Message ${a.name}</h2><p>${a.role} · ${a.areas}</p></div><button class="icon-btn" data-close aria-label="Close">${icon.close}</button></div>
    <form data-form="agent-message" data-agent="${id}" novalidate>
      <div class="field"><label for="m-name">Full name</label><input id="m-name" name="name" autocomplete="name" required data-required="Enter your name." value="${esc(profile.name)}"></div>
      <div class="field-row">
        <div class="field"><label for="m-email">Email</label><input id="m-email" name="email" type="email" autocomplete="email" required data-required="Enter your email address." value="${esc(profile.email)}"></div>
        <div class="field"><label for="m-topic">I am</label><select id="m-topic" name="topic"><option>Buying</option><option>Selling</option><option>Buying and selling</option><option>Just asking a question</option></select></div>
      </div>
      <div class="field"><label for="m-message">Message</label><textarea id="m-message" name="message" rows="4" required data-required="Write a short message." data-minlength="10" placeholder="Hi ${a.name.split(' ')[0]}, I am looking for…"></textarea></div>
      <div class="bl-dialog-actions"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" type="submit">Send message</button></div>
    </form>`, { className: 'bl-dialog agent-dialog', labelledBy: 'msg-title' });
  dialog.querySelector(profile.name ? '#m-message' : '#m-name').focus();
}

function openLightbox(l, start) {
  let index = start;
  const { dialog, close } = modal(`
    <div class="lightbox-bar"><span class="lightbox-title">${esc(l.street)}</span><span class="lightbox-count" aria-live="polite"></span><button class="lightbox-close" data-close aria-label="Close photos">${icon.close}</button></div>
    <figure class="lightbox-stage"><img alt=""><figcaption></figcaption></figure>
    <button class="lightbox-nav prev" data-step="-1" aria-label="Previous photo">${icon.left}</button>
    <button class="lightbox-nav next" data-step="1" aria-label="Next photo">${icon.right}</button>`, { className: 'lightbox', label: `Photos of ${l.street}` });
  const image = dialog.querySelector('img');
  const paint = () => {
    const [name, alt] = l.photos[index];
    image.src = `img/${name}.webp`;
    image.alt = alt;
    dialog.querySelector('figcaption').textContent = alt;
    dialog.querySelector('.lightbox-count').textContent = `${index + 1} / ${l.photos.length}`;
  };
  const step = (delta) => { index = (index + delta + l.photos.length) % l.photos.length; paint(); };
  dialog.addEventListener('click', (event) => {
    const nav = event.target.closest('[data-step]');
    if (nav) step(Number(nav.dataset.step));
    else if (event.target === dialog || event.target.classList.contains('lightbox-stage')) close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });
  let touchX = null;
  dialog.addEventListener('touchstart', (event) => { touchX = event.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (event) => {
    if (touchX === null) return;
    const dx = event.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touchX = null;
  });
  paint();
  dialog.querySelector('.lightbox-close').focus();
}

function notFound() {
  return { title: 'Page not found — SPACES', html: `<section class="section"><div class="wrap narrow center"><p class="eyebrow">404</p><h1>This page has moved out.</h1><p class="lead">The home may have sold or the link may be old.</p><a class="btn btn-primary" href="#/buy">Browse homes for sale</a></div></section>` };
}

const router = createRouter([
  ['/', home],
  ['/buy', buy],
  ['/listing/:id', listingPage],
  ['/saved', savedPage],
  ['/sell', sell],
  ['/sell/requested', valuationRequested],
  ['/agents', agentsPage],
], {
  notFound,
  afterRender: (ctx) => {
    setMenu(false);
    document.body.classList.toggle('has-cta', ctx.path.startsWith('/listing/'));
  },
});

function setMenu(open) {
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', String(open));
  document.getElementById('mobile-nav').hidden = !open;
}

function updateSavedCount() {
  const badge = document.getElementById('saved-count');
  badge.hidden = !saved.size;
  badge.textContent = saved.size;
}

function setQuery(changes) {
  const [, search = ''] = location.hash.split('?');
  const query = new URLSearchParams(search);
  Object.entries(changes).forEach(([key, value]) => (value ? query.set(key, value) : query.delete(key)));
  const qs = query.toString();
  router.go(`#/buy${qs ? `?${qs}` : ''}`);
}

function showError(form, name, message) {
  const field = form.elements[name];
  const error = Object.assign(document.createElement('p'), { className: 'field-error', id: `error-${name}`, textContent: message });
  field.insertAdjacentElement('afterend', error);
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', error.id);
  field.focus();
}

function rememberProfile({ name, email, phone }) {
  profile = { ...profile, name, email, ...(phone ? { phone } : {}) };
  storage.set('spaces-profile', profile);
}

actions({
  menu: (button) => setMenu(button.getAttribute('aria-expanded') !== 'true'),
  search: (form) => {
    const { area, max, beds } = formData(form);
    const query = new URLSearchParams(Object.entries({ area, max, beds }).filter(([, v]) => v));
    router.go(`#/buy${query.toString() ? `?${query}` : ''}`);
  },
  filter: (select) => setQuery({ [select.name]: select.value }),
  'clear-filter': (button) => setQuery({ [button.dataset.name]: '' }),
  save: (button) => {
    const l = byId(button.dataset.id);
    const on = !saved.has(l.id);
    if (on) saved.add(l.id); else saved.delete(l.id);
    storage.set('spaces-saved', [...saved]);
    updateSavedCount();
    if (location.hash.startsWith('#/saved')) router.render({ keepScroll: true });
    document.querySelectorAll(`.save-btn[data-id="${l.id}"]`).forEach((b) => {
      b.setAttribute('aria-pressed', String(on));
      const label = b.querySelector('span');
      if (label) label.textContent = on ? 'Saved' : 'Save';
    });
    toast(on ? `${l.street} saved. Find it under Saved homes.` : `${l.street} removed from saved homes.`);
  },
  share: async (button) => {
    const url = `${location.href.split('#')[0]}#/listing/${button.dataset.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied. Paste it anywhere to share this home.');
    } catch {
      toast('Copy the link from your address bar to share this home.');
    }
  },
  lightbox: (button) => openLightbox(byId(button.dataset.id), Number(button.dataset.index)),
  calc: updateCalculator,
  'to-viewing': () => {
    const panel = document.getElementById('viewing');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    panel.querySelector('input, button')?.focus({ preventScroll: true });
  },
  viewing: (form) => {
    if (!validate(form)) return;
    const data = formData(form);
    if (new Date(`${data.date}T12:00`).getDay() === 0) { showError(form, 'date', 'Viewings run Monday to Saturday. Choose another day.'); return; }
    const l = byId(form.dataset.id);
    const request = { ref: reference('SPC'), listing: l.id, date: data.date, slot: data.slot, name: data.name, email: data.email, phone: data.phone, message: data.message || '', at: Date.now() };
    requests = [...requests, request];
    storage.set('spaces-requests', requests);
    rememberProfile(data);
    viewingDone[l.id] = request;
    router.render({ keepScroll: true });
    document.querySelector('#viewing .done')?.focus({ preventScroll: true });
    toast('Viewing requested. Demo only: nothing was sent.');
  },
  'viewing-reset': (button) => { delete viewingDone[button.dataset.id]; router.render({ keepScroll: true }); document.getElementById('v-date')?.focus({ preventScroll: true }); },
  'cancel-request': async (button) => {
    const r = requests.find((x) => x.ref === button.dataset.ref);
    const ok = await confirmDialog({ title: 'Cancel this viewing request?', message: `${byId(r.listing).street}, ${formatDate(new Date(`${r.date}T12:00`), { weekday: 'long', month: 'long', day: 'numeric' })} (${r.slot.toLowerCase()}).`, confirm: 'Cancel request', cancel: 'Keep it', danger: true });
    if (!ok) return;
    requests = requests.filter((x) => x.ref !== r.ref);
    storage.set('spaces-requests', requests);
    Object.keys(viewingDone).forEach((id) => { if (viewingDone[id].ref === r.ref) delete viewingDone[id]; });
    router.render({ keepScroll: true });
    toast('Viewing request cancelled.');
  },
  estimate: (form) => { document.getElementById('estimate').innerHTML = estimateCard(formData(form)); },
  valuation: (form) => {
    if (!validate(form)) return;
    const data = formData(form);
    rememberProfile(data);
    valuationDone = { ...data, ref: reference('VAL'), estimate: estimateValue(data) };
    router.go('#/sell/requested');
  },
  'message-agent': (button) => openAgentMessage(button.dataset.agent),
  'agent-message': (form) => {
    if (!validate(form)) return;
    const data = formData(form);
    rememberProfile(data);
    const a = agents[form.dataset.agent];
    const dialog = form.closest('dialog');
    dialog.innerHTML = `
      <div class="modal-done">
        <span class="done-tick">${icon.check}</span>
        <h2 id="msg-title">Message ready for ${a.name.split(' ')[0]}</h2>
        <p>Thanks, ${esc(firstName(data.name))}. In the live site ${a.name.split(' ')[0]} would reply to ${esc(data.email)}, usually within a few hours.</p>
        <p class="fine">Demo: nothing was sent.</p>
        <div class="bl-dialog-actions"><button type="button" class="btn btn-primary" data-close>Done</button></div>
      </div>`;
    dialog.querySelector('[data-close]').focus();
  },
});

updateSavedCount();
