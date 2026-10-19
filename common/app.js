// COMMON — demo online store for a fictional home goods brand.
const { esc, money, router: createRouter, validate, formData, toast, reference, firstName, storage, actions, demoBar, formatDate, addBusinessDays } = Kit;
demoBar('COMMON');

const FREE_SHIPPING = 75;
const STANDARD_SHIPPING = 8;
const EXPRESS_SHIPPING = 18;

const categories = {
  ceramics: { name: 'Ceramics', blurb: 'Stoneware for everyday meals, thrown in small batches.', image: 'bowls' },
  linen: { name: 'Linen', blurb: 'Stonewashed European flax for the table and the sofa.', image: 'throw' },
  glass: { name: 'Glass', blurb: 'Hand-blown and pressed glass that catches the light.', image: 'carafe' },
};

const products = [
  {
    slug: 'oat-speckled-mug', name: 'Oat speckled mug', category: 'ceramics', image: 'mug', added: 3,
    alt: 'Handmade stoneware mug with a speckled oatmeal glaze', tagline: 'Handmade stoneware · 12 oz',
    description: 'A generous everyday mug thrown in small batches and finished in a speckled oatmeal glaze. The thick handle stays cool and the rim is slightly uneven, so no two are quite the same.',
    details: ['Holds 12 oz', 'Stoneware with a food-safe glaze', 'Dishwasher and microwave safe', 'Each piece varies slightly'],
    variants: [{ id: 'single', label: 'Single', price: 28 }, { id: 'pair', label: 'Set of 2', price: 52 }],
  },
  {
    slug: 'tide-bowls', name: 'Tide bowls, set of 3', category: 'ceramics', image: 'bowls', added: 6,
    alt: 'Stack of three speckled white ceramic bowls with pale blue insides', tagline: 'Nesting stoneware bowls',
    description: 'Nesting bowls in speckled white with a pale blue interior, sized for cereal, soup and salad. They stack neatly and look good left out on open shelves.',
    details: ['Diameters 5.5, 6.5 and 7.5 in (large set: 6.5, 7.5 and 8.5 in)', 'Stoneware with a satin glaze', 'Dishwasher safe', 'Stack neatly'],
    variants: [{ id: 'standard', label: 'Standard set', price: 64 }, { id: 'large', label: 'Large set', price: 78 }],
  },
  {
    slug: 'dune-vase', name: 'Dune vase', category: 'ceramics', image: 'vase', added: 8,
    alt: 'Round matte sand-colored ceramic vase with a dried olive branch', tagline: 'Matte stoneware vase',
    description: 'A round, matte vase with a narrow neck that holds a single stem or a few dried branches. The sand glaze is soft to the touch and sits quietly in any room.',
    details: ['Medium 7 in tall, large 10 in tall', 'Watertight interior glaze', 'Wipe clean with a damp cloth', 'Branch not included'],
    variants: [{ id: 'medium', label: 'Medium', price: 86 }, { id: 'large', label: 'Large', price: 118 }],
  },
  {
    slug: 'harvest-platter', name: 'Harvest platter', category: 'ceramics', image: 'platter', added: 2,
    alt: 'Oval white speckled stoneware platter with a raw clay rim', tagline: 'Oval serving platter',
    description: 'An oval serving platter with a raw clay rim, big enough for a roast chicken or a table of shared plates.',
    details: ['16 × 11 in', 'Oven safe to 400°F', 'Dishwasher safe', 'The raw rim darkens gently with use'],
    variants: [{ id: 'one', label: 'One size', price: 72 }],
  },
  {
    slug: 'stonewashed-linen-throw', name: 'Stonewashed linen throw', category: 'linen', image: 'throw', added: 5,
    alt: 'Folded oatmeal linen throw blanket with a fringed edge', tagline: '100% European flax linen',
    description: 'Heavyweight linen, stonewashed for softness and finished with a knotted fringe. Light enough for a Southern summer and warm enough for winter evenings.',
    details: ['Standard 50 × 70 in, large 60 × 80 in', '100% linen', 'Machine wash cold, tumble dry low', 'Gets softer with every wash'],
    variants: [{ id: 'standard', label: 'Standard', price: 148 }, { id: 'large', label: 'Large', price: 178 }],
  },
  {
    slug: 'linen-napkins', name: 'Linen napkins, set of 4', category: 'linen', image: 'napkins', added: 7,
    alt: 'Stack of four dusty blue linen napkins tied with twine', tagline: 'Stonewashed · dusty blue',
    description: 'Stonewashed linen napkins in dusty blue that look better slightly rumpled. Generous enough to cover a lap and soft from the first use.',
    details: ['20 × 20 in each', '100% linen', 'Machine wash warm', 'Set of four'],
    variants: [{ id: 'four', label: 'Set of 4', price: 42 }],
  },
  {
    slug: 'bedside-carafe', name: 'Bedside carafe', category: 'glass', image: 'carafe', added: 4,
    alt: 'Clear glass carafe with a tumbler resting upside down on top', tagline: 'Hand-blown · 20 oz',
    description: 'A hand-blown carafe with a tumbler that doubles as a lid, for the nightstand, the desk or the dinner table.',
    details: ['Holds 20 oz', 'Borosilicate glass', 'Hand wash recommended', 'Tumbler included'],
    variants: [{ id: 'one', label: 'Carafe + tumbler', price: 48 }],
  },
  {
    slug: 'ribbed-tumblers', name: 'Ribbed tumblers', category: 'glass', image: 'tumblers', added: 1,
    alt: 'Two ribbed clear glass tumblers, one filled with water', tagline: 'Pressed glass · 10 oz',
    description: 'Heavy-bottomed tumblers with fine vertical ribs that catch the light. Right for water, iced tea or a short drink.',
    details: ['Holds 10 oz', 'Soda-lime glass', 'Dishwasher safe', 'Sold in sets'],
    variants: [{ id: 'two', label: 'Set of 2', price: 36 }, { id: 'four', label: 'Set of 4', price: 64 }],
  },
];
const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
const fromPrice = (p) => Math.min(...p.variants.map((v) => v.price));
// Products have a 480px card version, lifestyle photos a 768px one.
const img = (name, alt, { eager = false, square = true, sizes = square ? '(max-width: 640px) 50vw, 25vw' : '(max-width: 900px) 100vw, 50vw' } = {}) =>
  `<img src="img/${name}.webp" srcset="img/${name}-sm.webp ${square ? 480 : 768}w, img/${name}.webp ${square ? 900 : 1536}w" sizes="${sizes}" alt="${esc(alt)}" width="${square ? 900 : 1536}" height="${square ? 900 : 1024}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;

// Bag state survives reloads when storage is available.
let bag = storage.get('common-bag', []);
const orders = storage.get('common-orders', {});
const lineFor = (item) => {
  const product = bySlug[item.slug];
  const variant = product?.variants.find((v) => v.id === item.variant);
  return product && variant ? { ...item, product, variant, total: variant.price * item.qty } : null;
};
const lines = () => bag.map(lineFor).filter(Boolean);
const subtotal = () => lines().reduce((sum, line) => sum + line.total, 0);
const shippingFor = (sub, method = 'standard') => (method === 'express' ? EXPRESS_SHIPPING : sub >= FREE_SHIPPING ? 0 : STANDARD_SHIPPING);
function saveBag() {
  storage.set('common-bag', bag);
  const count = bag.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('bag-count').textContent = count;
  document.querySelector('.bag-button').setAttribute('aria-label', `Bag, ${count} ${count === 1 ? 'item' : 'items'}`);
  renderBag();
}
function addToBag(slug, variant, qty = 1) {
  const existing = bag.find((item) => item.slug === slug && item.variant === variant);
  if (existing) existing.qty = Math.min(10, existing.qty + qty);
  else bag.push({ slug, variant, qty: Math.min(10, qty) });
  saveBag();
}

const productCard = (p) => `
  <article class="product-card">
    <div class="product-media">
      <a href="#/product/${p.slug}" tabindex="-1" aria-hidden="true">${img(p.image, '')}</a>
      <button class="quick-add" data-action="quick-add" data-slug="${p.slug}" aria-label="Add ${esc(p.name)} to bag">Add to bag</button>
    </div>
    <a class="product-link" href="#/product/${p.slug}">
      <span class="product-name">${esc(p.name)}</span>
      <span class="product-sub">${esc(p.tagline)}</span>
      <span class="product-price">${p.variants.length > 1 ? 'From ' : ''}${money(fromPrice(p))}</span>
    </a>
  </article>`;

let newsletterDone = false;
const newsletter = (id) => newsletterDone
  ? `<div class="news-done" role="status"><strong>You are on the list.</strong><span>New collections arrive about once a month. (Demo: no email was saved.)</span></div>`
  : `<form class="news-form" data-form="newsletter" novalidate>
      <label for="${id}">Get new collections first</label>
      <div class="news-row"><input id="${id}" name="email" type="email" placeholder="Email address" autocomplete="email" required><button class="btn btn-dark" type="submit">Sign up</button></div>
    </form>`;
const renderFooterNews = () => { document.getElementById('footer-news').innerHTML = `<h2>Newsletter</h2>${newsletter('footer-email')}`; };

function home() {
  const bestsellers = ['oat-speckled-mug', 'tide-bowls', 'stonewashed-linen-throw', 'bedside-carafe'].map((s) => bySlug[s]);
  return {
    title: 'COMMON — Ceramics, linen and glass for everyday',
    html: `
    <section class="cover">
      <div class="wrap cover-head">
        <p class="kicker">Autumn collection, 2026</p>
        <h1>Objects for<br><em>everyday.</em></h1>
        <div class="cover-aside">
          <p class="lead">Stoneware, linen and glass made by small studios, chosen to be used daily and kept for years.</p>
          <a class="btn btn-dark" href="#/shop">Shop the collection</a>
        </div>
      </div>
      <figure class="cover-media">
        ${img('hero', 'Still life of ceramic vases, a glass carafe, bowls and linen napkins on a linen-covered table', { eager: true, square: false, sizes: '100vw' })}
        <figcaption class="wrap"><span>Fig. 1</span>Stoneware, glass and linen from the autumn collection.</figcaption>
      </figure>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="section-head"><h2>Shop by <em>material</em></h2><a class="text-link" href="#/shop">Shop all</a></div>
        <div class="category-grid">
          ${Object.entries(categories).map(([id, c], i) => `
            <a class="category-card" href="#/shop/${id}">
              <span class="category-media">${img(c.image, `${c.name} collection`, { sizes: '(max-width: 800px) 100vw, 33vw' })}</span>
              <span class="category-text"><small>0${i + 1}</small><strong>${c.name}</strong><span>${c.blurb}</span></span>
            </a>`).join('')}
        </div>
      </div>
    </section>
    <section class="section section-tight">
      <div class="wrap">
        <div class="section-head"><h2>Most <em>loved</em></h2><a class="text-link" href="#/shop">Shop all</a></div>
        <div class="product-grid">${bestsellers.map(productCard).join('')}</div>
      </div>
    </section>
    <section class="section">
      <div class="wrap quote">
        <p class="kicker">Made to be used</p>
        <blockquote>Nothing here is too precious for a <em>Tuesday.</em></blockquote>
        <div class="quote-body">
          <div class="quote-media">${img('platter', 'Oval stoneware platter with a raw clay rim', { sizes: '(max-width: 800px) 100vw, 55vw' })}</div>
          <div>
            <p>We work with a handful of potters, weavers and glassblowers who make things slowly and well. Every piece is dishwasher-friendly or machine-washable unless we say otherwise, because good things should be used.</p>
            <a class="text-link" href="#/about">Our story</a>
          </div>
        </div>
      </div>
    </section>
    <section class="news-band">
      <div class="wrap news-inner">
        <div><h2>New arrivals, <em>once a month.</em></h2><p>No daily emails. Just new collections and the occasional restock.</p></div>
        ${newsletter('home-email')}
      </div>
    </section>`,
  };
}

function shop({ params, query }) {
  const category = params.category;
  if (category && !categories[category]) return null;
  const q = (query.get('q') || '').trim();
  const sort = query.get('sort') || 'featured';
  let list = products.filter((p) => !category || p.category === category);
  if (q) list = list.filter((p) => `${p.name} ${p.tagline} ${p.category}`.toLowerCase().includes(q.toLowerCase()));
  if (sort === 'price-asc') list = [...list].sort((a, b) => fromPrice(a) - fromPrice(b));
  if (sort === 'price-desc') list = [...list].sort((a, b) => fromPrice(b) - fromPrice(a));
  if (sort === 'newest') list = [...list].sort((a, b) => b.added - a.added);
  const title = category ? categories[category].name : 'Shop all';
  return {
    title: `${title} — COMMON`,
    html: `
    <section class="shop-head">
      <div class="wrap">
        <h1>${title}</h1>
        <p class="lead">${category ? categories[category].blurb : 'Everything we carry, from everyday mugs to heirloom linen.'}</p>
      </div>
    </section>
    <section class="section section-tight">
      <div class="wrap">
        <div class="shop-toolbar">
          <nav class="tabs" aria-label="Categories">
            <a href="#/shop" class="${!category ? 'is-active' : ''}">All</a>
            ${Object.entries(categories).map(([id, c]) => `<a href="#/shop/${id}" class="${category === id ? 'is-active' : ''}">${c.name}</a>`).join('')}
          </nav>
          <div class="shop-controls">
            <form class="search" data-form="search" role="search"><label class="visually-hidden" for="shop-q">Search products</label><input id="shop-q" name="q" type="search" placeholder="Search" value="${esc(q)}"></form>
            <label class="sort"><span>Sort</span>
              <select data-change="sort" aria-label="Sort products">
                ${[['featured', 'Featured'], ['newest', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']].map(([v, l]) => `<option value="${v}" ${v === sort ? 'selected' : ''}>${l}</option>`).join('')}
              </select>
            </label>
          </div>
        </div>
        <p class="count">${list.length} ${list.length === 1 ? 'product' : 'products'}${q ? ` for “${esc(q)}”` : ''}</p>
        ${list.length ? `<div class="product-grid">${list.map(productCard).join('')}</div>` : `
          <div class="empty"><h2>No products match “${esc(q)}”.</h2><p>Try another word, or browse everything.</p><a class="btn btn-primary" href="#/shop">Shop all</a></div>`}
      </div>
    </section>`,
  };
}

function productPage({ params }) {
  const p = bySlug[params.slug];
  if (!p) return null;
  const related = products.filter((x) => x.slug !== p.slug && x.category === p.category).concat(products.filter((x) => x.category !== p.category)).slice(0, 4);
  return {
    title: `${p.name} — COMMON`,
    html: `
    <section class="section section-tight">
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/shop">Shop</a><span aria-hidden="true">/</span><a href="#/shop/${p.category}">${categories[p.category].name}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
        <div class="product-layout">
          <div class="gallery">
            <div class="gallery-main" id="gallery-main">${img(p.image, p.alt, { eager: true, sizes: '(max-width: 900px) 100vw, 50vw' })}</div>
            <div class="gallery-thumbs">
              <button class="thumb is-active" data-action="view-image" data-view="full" aria-label="Show full product photo" aria-pressed="true">${img(p.image, '')}</button>
              <button class="thumb detail" data-action="view-image" data-view="detail" aria-label="Show close-up detail" aria-pressed="false">${img(p.image, '')}</button>
            </div>
          </div>
          <div class="product-info">
            <p class="kicker">${categories[p.category].name}</p>
            <h1>${esc(p.name)}</h1>
            <p class="price" id="product-price">${money(p.variants[0].price)}</p>
            <p class="product-description">${esc(p.description)}</p>
            <form data-form="add" novalidate>
              <input type="hidden" name="slug" value="${p.slug}">
              ${p.variants.length > 1 ? `
                <fieldset class="variant-group"><legend>Option</legend>
                  <div class="variants">${p.variants.map((v, i) => `<label class="variant"><input type="radio" name="variant" value="${v.id}" data-price="${v.price}" data-change="variant" ${i === 0 ? 'checked' : ''}><span>${esc(v.label)} · ${money(v.price)}</span></label>`).join('')}</div>
                </fieldset>` : `<input type="hidden" name="variant" value="${p.variants[0].id}">`}
              <div class="buy-row">
                <div class="qty" role="group" aria-label="Quantity">
                  <button type="button" data-action="qty" data-step="-1" aria-label="Decrease quantity">−</button>
                  <input name="qty" value="1" inputmode="numeric" aria-label="Quantity" readonly>
                  <button type="button" data-action="qty" data-step="1" aria-label="Increase quantity">+</button>
                </div>
                <button class="btn btn-primary add-button" type="submit">Add to bag</button>
              </div>
            </form>
            <p class="ship-note">Ships in 2–3 business days · Free standard shipping over ${money(FREE_SHIPPING)}</p>
            <div class="accordions">
              <details open><summary>Details</summary><ul>${p.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></details>
              <details><summary>Care</summary><p>${p.category === 'linen' ? 'Machine wash cold with like colors and tumble dry low, or line dry for a crisper feel. Linen softens with every wash.' : p.category === 'glass' ? 'Hand wash in warm soapy water or use the top rack of the dishwasher. Avoid sudden temperature changes.' : 'Dishwasher safe. Avoid sudden temperature changes and let pieces cool before washing.'}</p></details>
              <details><summary>Shipping &amp; returns</summary><p>Standard shipping is ${money(STANDARD_SHIPPING)} and free over ${money(FREE_SHIPPING)}. Returns are accepted within 30 days in original condition. <a href="#/shipping">Read the full policy</a>.</p></details>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section section-soft">
      <div class="wrap">
        <div class="section-head"><h2>You may also like</h2></div>
        <div class="product-grid">${related.map(productCard).join('')}</div>
      </div>
    </section>`,
  };
}

let checkout = { stage: 'details', data: { email: '', first: '', last: '', address: '', apt: '', city: '', state: 'AL', zip: '', phone: '', method: 'standard' } };
const states = ['AL', 'FL', 'GA', 'MS', 'TN', 'Other US state'];

function summaryHtml(method) {
  const sub = subtotal();
  const shipping = shippingFor(sub, method);
  return `
    <div class="summary-lines">
      ${lines().map((l) => `<div class="summary-line"><span class="summary-thumb">${img(l.product.image, '')}<span class="summary-qty">${l.qty}</span></span><span><strong>${esc(l.product.name)}</strong><small>${esc(l.variant.label)}</small></span><span>${money(l.total)}</span></div>`).join('')}
    </div>
    <dl class="totals">
      <div><dt>Subtotal</dt><dd>${money(sub, true)}</dd></div>
      <div><dt>Shipping (${method === 'express' ? 'express' : 'standard'})</dt><dd>${shipping ? money(shipping, true) : 'Free'}</dd></div>
      <div class="grand"><dt>Total</dt><dd>${money(sub + shipping, true)}</dd></div>
    </dl>
    <p class="tax-note">Sales tax would be added by the live store at payment. This demo shows totals before tax.</p>`;
}

function checkoutPage() {
  if (!lines().length) {
    return { title: 'Checkout — COMMON', html: `<section class="section"><div class="wrap narrow center"><h1>Your bag is empty.</h1><p class="lead">Add something you love and come back to check out.</p><a class="btn btn-primary" href="#/shop">Shop collection</a></div></section>` };
  }
  const d = checkout.data;
  const field = (name, label, attrs = '', type = 'text', value = d[name]) => `<div class="field"><label for="co-${name}">${label}</label><input id="co-${name}" name="${name}" type="${type}" value="${esc(value)}" ${attrs}></div>`;
  const details = `
    <form data-form="checkout" novalidate>
      <section class="co-block"><h2>Contact</h2>${field('email', 'Email', 'autocomplete="email" required', 'email')}</section>
      <section class="co-block"><h2>Shipping address</h2>
        <div class="field-row">${field('first', 'First name', 'autocomplete="given-name" required')}${field('last', 'Last name', 'autocomplete="family-name" required')}</div>
        ${field('address', 'Street address', 'autocomplete="address-line1" required')}
        ${field('apt', 'Apartment, suite, etc. <span class="optional">(optional)</span>', 'autocomplete="address-line2"')}
        <div class="field-row three">${field('city', 'City', 'autocomplete="address-level2" required')}
          <div class="field"><label for="co-state">State</label><select id="co-state" name="state" autocomplete="address-level1">${states.map((s) => `<option ${s === d.state ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
          ${field('zip', 'ZIP code', 'autocomplete="postal-code" inputmode="numeric" required pattern="\\d{5}" data-pattern-message="Enter a 5-digit ZIP code."')}</div>
        ${field('phone', 'Phone <span class="optional">(for delivery questions)</span>', 'autocomplete="tel"', 'tel')}
      </section>
      <section class="co-block"><h2>Delivery</h2>
        <fieldset class="methods"><legend class="visually-hidden">Delivery method</legend>
          <label class="method"><input type="radio" name="method" value="standard" data-change="method" ${d.method !== 'express' ? 'checked' : ''}><span><strong>Standard · 3–5 business days</strong><small>${subtotal() >= FREE_SHIPPING ? 'Free on this order' : `${money(STANDARD_SHIPPING)}, free over ${money(FREE_SHIPPING)}`}</small></span></label>
          <label class="method"><input type="radio" name="method" value="express" data-change="method" ${d.method === 'express' ? 'checked' : ''}><span><strong>Express · 1–2 business days</strong><small>${money(EXPRESS_SHIPPING)}</small></span></label>
        </fieldset>
      </section>
      <div class="notice">Payment is not collected in this demo. The next step shows your order for review.</div>
      <button class="btn btn-primary wide" type="submit">Review order</button>
    </form>`;
  const review = `
    <div class="review">
      <section class="co-block"><div class="review-head"><h2>Ship to</h2><button class="text-button" data-action="checkout-edit">Edit</button></div>
        <p>${esc(d.first)} ${esc(d.last)}<br>${esc(d.address)}${d.apt ? `, ${esc(d.apt)}` : ''}<br>${esc(d.city)}, ${esc(d.state)} ${esc(d.zip)}<br>${esc(d.email)}${d.phone ? ` · ${esc(d.phone)}` : ''}</p></section>
      <section class="co-block"><div class="review-head"><h2>Delivery</h2><button class="text-button" data-action="checkout-edit">Edit</button></div>
        <p>${d.method === 'express' ? 'Express, 1–2 business days' : 'Standard, 3–5 business days'} · estimated ${deliveryRange(d.method)}</p></section>
      <div class="notice">This is a demo store: placing the order will not charge you or ship anything.</div>
      <button class="btn btn-primary wide" data-action="place-order">Place demo order · ${money(subtotal() + shippingFor(subtotal(), d.method), true)}</button>
    </div>`;
  return {
    title: 'Checkout — COMMON',
    html: `
    <section class="section section-tight checkout">
      <div class="wrap checkout-grid">
        <div>
          <nav class="crumbs" aria-label="Checkout progress"><a href="#/shop">Bag</a><span aria-hidden="true">/</span><span ${checkout.stage === 'details' ? 'aria-current="step"' : ''} class="${checkout.stage === 'details' ? 'current' : ''}">Details</span><span aria-hidden="true">/</span><span ${checkout.stage === 'review' ? 'aria-current="step"' : ''} class="${checkout.stage === 'review' ? 'current' : ''}">Review</span></nav>
          <h1>Checkout</h1>
          ${checkout.stage === 'review' ? review : details}
        </div>
        <aside class="order-summary" aria-label="Order summary"><h2>Order summary</h2><div id="summary">${summaryHtml(d.method)}</div></aside>
      </div>
    </section>`,
  };
}

function deliveryRange(method) {
  const today = new Date();
  const [min, max] = method === 'express' ? [1, 2] : [3, 5];
  const fmt = { weekday: 'short', month: 'short', day: 'numeric' };
  return `${formatDate(addBusinessDays(today, min + 1), fmt)} – ${formatDate(addBusinessDays(today, max + 1), fmt)}`;
}

function orderPage({ params }) {
  const order = orders[params.id];
  if (!order) {
    return { title: 'Order not found — COMMON', html: `<section class="section"><div class="wrap narrow center"><h1>We could not find that order.</h1><p class="lead">Demo orders are kept in this browser only.</p><a class="btn btn-primary" href="#/shop">Continue shopping</a></div></section>` };
  }
  return {
    title: `Order ${order.id} — COMMON`,
    html: `
    <section class="section">
      <div class="wrap narrow">
        <div class="confirmation">
          <span class="check" aria-hidden="true">✓</span>
          <p class="kicker">Order ${esc(order.id)}</p>
          <h1>Thank you, ${esc(order.first)}.</h1>
          <p class="lead">Your demo order is confirmed. A live store would email a receipt to ${esc(order.email)} and ship by ${esc(order.method === 'express' ? 'express' : 'standard')} delivery, arriving ${esc(order.delivery)}.</p>
          <div class="confirmation-grid">
            <div><h2>Items</h2>${order.items.map((l) => `<div class="summary-line"><span class="summary-thumb">${img(l.image, '')}<span class="summary-qty">${l.qty}</span></span><span><strong>${esc(l.name)}</strong><small>${esc(l.variant)}</small></span><span>${money(l.total)}</span></div>`).join('')}
              <dl class="totals"><div><dt>Subtotal</dt><dd>${money(order.subtotal, true)}</dd></div><div><dt>Shipping</dt><dd>${order.shipping ? money(order.shipping, true) : 'Free'}</dd></div><div class="grand"><dt>Total</dt><dd>${money(order.subtotal + order.shipping, true)}</dd></div></dl>
            </div>
            <div><h2>Shipping to</h2><p>${esc(order.first)} ${esc(order.last)}<br>${esc(order.address)}<br>${esc(order.city)}, ${esc(order.state)} ${esc(order.zip)}</p>
              <p class="demo-note">Demo order: no payment was taken and nothing will ship.</p></div>
          </div>
          <a class="btn btn-primary" href="#/shop">Continue shopping</a>
        </div>
      </div>
    </section>`,
  };
}

function about() {
  return {
    title: 'About — COMMON',
    html: `
    <section class="shop-head"><div class="wrap"><h1>Good things, used often.</h1><p class="lead">COMMON began at a kitchen table in Birmingham with a simple question: why do the nicest plates stay in the cabinet?</p></div></section>
    <section class="section">
      <div class="wrap story">
        <div class="story-media">${img('hero', 'Ceramics, glass and linen arranged on a table', { square: false })}</div>
        <div class="story-copy">
          <h2>Made slowly, chosen carefully</h2>
          <p>We work with a small group of potters, weavers and glassblowers. Most pieces are made in batches of a few dozen, so glazes shift and every mug is a little different.</p>
          <p>We only carry things we would use ourselves: pieces that go in the dishwasher, linens that survive a toddler and glass that feels good in the hand.</p>
        </div>
      </div>
    </section>
    <section class="section section-soft">
      <div class="wrap values">
        <article><h3>Everyday first</h3><p>If it cannot handle a weeknight dinner, it is not for us.</p></article>
        <article><h3>Small makers</h3><p>Fewer, better suppliers who we visit and know by name.</p></article>
        <article><h3>Honest prices</h3><p>No inflated “sales”. Our prices are the same all year.</p></article>
      </div>
    </section>`,
  };
}

function shipping() {
  return {
    title: 'Shipping & returns — COMMON',
    html: `
    <section class="shop-head"><div class="wrap"><h1>Shipping &amp; returns</h1><p class="lead">Everything you need to know about delivery, returns and caring for your pieces.</p></div></section>
    <section class="section section-tight">
      <div class="wrap narrow policy">
        <h2>Shipping</h2>
        <table class="rates"><thead><tr><th scope="col">Method</th><th scope="col">Delivery</th><th scope="col">Cost</th></tr></thead>
          <tbody><tr><td>Standard</td><td>3–5 business days</td><td>${money(STANDARD_SHIPPING)} · free over ${money(FREE_SHIPPING)}</td></tr><tr><td>Express</td><td>1–2 business days</td><td>${money(EXPRESS_SHIPPING)}</td></tr></tbody></table>
        <p>Orders placed before 1 PM Central on business days leave our studio the same day. Every order is packed in recycled paper, with no plastic fill.</p>
        <h2>Returns</h2>
        <p>Return unused items in their original condition within 30 days for a full refund. If something arrives damaged, send a photo within 7 days and we will replace it at no cost.</p>
        <h2>Care guide</h2>
        <div class="accordions">
          <details><summary>Ceramics</summary><p>Our stoneware is dishwasher and microwave safe unless noted. Avoid moving pieces straight from the fridge to a hot oven.</p></details>
          <details><summary>Linen</summary><p>Wash cold with like colors and tumble dry low. Linen softens and relaxes with every wash; wrinkles are part of the charm.</p></details>
          <details><summary>Glass</summary><p>Hand wash or use the top rack of the dishwasher. Dry with a linen towel for a streak-free finish.</p></details>
        </div>
      </div>
    </section>`,
  };
}

function notFound() {
  return { title: 'Page not found — COMMON', html: `<section class="section"><div class="wrap narrow center"><h1>This page wandered off.</h1><p class="lead">Let us take you somewhere useful.</p><a class="btn btn-primary" href="#/shop">Shop collection</a></div></section>` };
}

// Bag drawer
let bagTrigger = null;
function renderBag() {
  const body = document.getElementById('bag-body');
  const current = lines();
  if (!current.length) {
    body.innerHTML = `<div class="bag-empty"><p>Your bag is empty.</p><a class="btn btn-primary" href="#/shop" data-action="close-bag">Shop collection</a></div>`;
    return;
  }
  const sub = subtotal();
  const remaining = Math.max(0, FREE_SHIPPING - sub);
  body.innerHTML = `
    <div class="free-ship"><p>${remaining ? `You are <strong>${money(remaining, true)}</strong> away from free standard shipping.` : 'Your order ships free.'}</p><span class="bar"><span style="width:${Math.min(100, (sub / FREE_SHIPPING) * 100)}%"></span></span></div>
    <ul class="bag-lines">
      ${current.map((l, i) => `
        <li class="bag-line">
          <a class="bag-thumb" href="#/product/${l.product.slug}" data-action="close-bag">${img(l.product.image, '')}</a>
          <div class="bag-line-info">
            <a href="#/product/${l.product.slug}" data-action="close-bag"><strong>${esc(l.product.name)}</strong></a>
            <small>${esc(l.variant.label)} · ${money(l.variant.price)}</small>
            <div class="bag-line-actions">
              <div class="qty small" role="group" aria-label="Quantity for ${esc(l.product.name)}">
                <button data-action="bag-qty" data-index="${i}" data-step="-1" aria-label="Decrease quantity">−</button><span aria-live="polite">${l.qty}</span><button data-action="bag-qty" data-index="${i}" data-step="1" aria-label="Increase quantity" ${l.qty >= 10 ? 'disabled' : ''}>+</button>
              </div>
              <button class="text-button" data-action="bag-remove" data-index="${i}">Remove</button>
            </div>
          </div>
          <span class="bag-line-total">${money(l.total)}</span>
        </li>`).join('')}
    </ul>
    <div class="bag-foot">
      <dl class="totals"><div><dt>Subtotal</dt><dd>${money(sub, true)}</dd></div><div><dt>Standard shipping</dt><dd>${shippingFor(sub) ? money(shippingFor(sub), true) : 'Free'}</dd></div><div class="grand"><dt>Total</dt><dd>${money(sub + shippingFor(sub), true)}</dd></div></dl>
      <a class="btn btn-primary wide" href="#/checkout" data-action="close-bag">Checkout</a>
      <button class="btn btn-ghost wide" data-action="close-bag">Continue shopping</button>
    </div>`;
}
function openBag(trigger) {
  bagTrigger = trigger || document.activeElement;
  const panel = document.getElementById('bag');
  document.querySelector('.bag-overlay').hidden = false;
  panel.hidden = false;
  requestAnimationFrame(() => { panel.classList.add('is-open'); document.querySelector('.bag-overlay').classList.add('is-open'); });
  document.body.classList.add('no-scroll');
  panel.querySelector('.icon-btn').focus();
}
function closeBag() {
  const panel = document.getElementById('bag');
  if (panel.hidden) return;
  panel.classList.remove('is-open');
  document.querySelector('.bag-overlay').classList.remove('is-open');
  document.body.classList.remove('no-scroll');
  setTimeout(() => { panel.hidden = true; document.querySelector('.bag-overlay').hidden = true; }, 220);
  if (bagTrigger && document.contains(bagTrigger)) bagTrigger.focus();
}

const router = createRouter([
  ['/', home],
  ['/shop', shop],
  ['/shop/:category', shop],
  ['/product/:slug', productPage],
  ['/checkout', checkoutPage],
  ['/order/:id', orderPage],
  ['/about', about],
  ['/shipping', shipping],
], { notFound, afterRender: () => { setMenu(false); renderFooterNews(); } });

function setMenu(open) {
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', String(open));
  document.getElementById('mobile-nav').hidden = !open;
}

function goWithQuery(changes) {
  const [path, search = ''] = (location.hash.replace(/^#/, '') || '/shop').split('?');
  const query = new URLSearchParams(search);
  Object.entries(changes).forEach(([k, v]) => (v ? query.set(k, v) : query.delete(k)));
  const qs = query.toString();
  router.go(`#${path}${qs ? `?${qs}` : ''}`);
}

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeBag(); });

actions({
  menu: (button) => setMenu(button.getAttribute('aria-expanded') !== 'true'),
  'open-bag': (button) => openBag(button),
  'close-bag': (el, event) => { if (el.tagName !== 'A') event.preventDefault(); closeBag(); },
  'quick-add': (button) => {
    const p = bySlug[button.dataset.slug];
    addToBag(p.slug, p.variants[0].id);
    toast(`${p.name} (${p.variants[0].label}) added to your bag.`);
    openBag(button);
  },
  variant: (input) => { document.getElementById('product-price').textContent = money(Number(input.dataset.price)); },
  qty: (button) => {
    const input = button.closest('.qty').querySelector('input');
    input.value = Math.min(10, Math.max(1, Number(input.value) + Number(button.dataset.step)));
  },
  add: (form) => {
    const data = formData(form);
    const p = bySlug[data.slug];
    const variant = p.variants.find((v) => v.id === data.variant);
    addToBag(p.slug, variant.id, Number(data.qty));
    toast(`${data.qty} × ${p.name} added to your bag.`);
    openBag(form.querySelector('.add-button'));
  },
  'view-image': (button) => {
    document.getElementById('gallery-main').classList.toggle('detail', button.dataset.view === 'detail');
    document.querySelectorAll('.thumb').forEach((t) => { t.classList.toggle('is-active', t === button); t.setAttribute('aria-pressed', String(t === button)); });
  },
  'bag-qty': (button) => {
    const item = bag[Number(button.dataset.index)];
    item.qty = Math.min(10, item.qty + Number(button.dataset.step));
    if (item.qty < 1) bag.splice(Number(button.dataset.index), 1);
    saveBag();
    if (location.hash.startsWith('#/checkout')) router.render({ keepScroll: true });
  },
  'bag-remove': (button) => {
    const [removed] = bag.splice(Number(button.dataset.index), 1);
    saveBag();
    toast(`${bySlug[removed.slug].name} removed.`);
    if (location.hash.startsWith('#/checkout')) router.render({ keepScroll: true });
    document.querySelector('#bag .icon-btn').focus();
  },
  sort: (select) => goWithQuery({ sort: select.value === 'featured' ? '' : select.value }),
  search: (form) => goWithQuery({ q: formData(form).q.trim() }),
  newsletter: (form) => {
    if (!validate(form)) return;
    newsletterDone = true;
    router.render({ keepScroll: true });
    toast('Thanks for signing up (demo: no email was saved).');
  },
  method: (input) => {
    checkout.data.method = input.value;
    document.getElementById('summary').innerHTML = summaryHtml(input.value);
  },
  checkout: (form) => {
    if (!validate(form)) return;
    Object.assign(checkout.data, formData(form));
    checkout.stage = 'review';
    router.render();
  },
  'checkout-edit': () => { checkout.stage = 'details'; router.render(); },
  'place-order': () => {
    const sub = subtotal();
    const d = checkout.data;
    const id = reference('CM');
    orders[id] = {
      id, ...d, subtotal: sub, shipping: shippingFor(sub, d.method), delivery: deliveryRange(d.method),
      items: lines().map((l) => ({ name: l.product.name, variant: l.variant.label, qty: l.qty, total: l.total, image: l.product.image })),
    };
    storage.set('common-orders', orders);
    bag = [];
    saveBag();
    checkout = { stage: 'details', data: { ...d, method: 'standard' } };
    router.go(`#/order/${id}`);
  },
});

saveBag();
