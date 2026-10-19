// FORM — demo website for a fictional renovation and interiors studio.
const { esc, money, router: createRouter, validate, formData, toast, reference, firstName, actions, demoBar, formatDate, addBusinessDays } = Kit;
demoBar('FORM');

// Every photo has a 768px card version; sizes tells the browser which one it needs.
const image = (name, alt, { cls = '', eager = false, sizes = '(max-width: 900px) 100vw, 50vw' } = {}) =>
  `<img class="${cls}" src="img/${name}.webp" srcset="img/${name}-sm.webp 768w, img/${name}.webp 1536w" sizes="${sizes}" alt="${esc(alt)}" width="1536" height="1024" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;

const services = [
  {
    id: 'renovation', name: 'Renovation', short: 'Kitchens, bathrooms and whole homes', image: 'kitchen',
    alt: 'Renovated kitchen with navy cabinets, oak shelves and a white stone island',
    lead: 'Kitchens, bathrooms and whole-home renovations, managed from the first sketch to the final walkthrough.',
    includes: ['Measured survey and two design options', 'Fixed-price proposal with a line-by-line breakdown', 'Permits, trades and scheduling handled for you', 'Weekly progress updates with photos'],
    timeline: '6–16 weeks', from: 45000,
  },
  {
    id: 'interiors', name: 'Interiors', short: 'Finishes, lighting and joinery', image: 'bedroom',
    alt: 'Bedroom with an oatmeal linen bed in front of navy wall paneling',
    lead: 'Finishes, lighting, joinery and furnishing plans for rooms that still work but no longer feel like you.',
    includes: ['Room-by-room concept and material board', 'Lighting and electrical plan', 'Custom joinery, paneling and built-ins', 'Furniture sourcing and installation day'],
    timeline: '3–8 weeks', from: 15000,
  },
  {
    id: 'extensions', name: 'Extensions', short: 'Additions, garden rooms and porches', image: 'garden-room',
    alt: 'Garden room extension with open glass doors, skylights and an oak dining table',
    lead: 'Single-story additions, garden rooms and porches that add space without losing the character of your home.',
    includes: ['Feasibility check and zoning review', 'Architectural and structural drawings', 'Foundations, framing, roofing and glazing', 'Finishes matched to the existing house'],
    timeline: '12–24 weeks', from: 120000,
  },
];

const projects = [
  {
    slug: 'oak-and-navy-kitchen', title: 'Oak & navy kitchen', type: 'Kitchens', area: 'Homewood', duration: '10 weeks', image: 'kitchen',
    alt: 'Kitchen with deep navy shaker cabinets, oak open shelves and brass pendant lights',
    summary: 'A closed-off galley became an open kitchen built around a 12-foot stone island.',
    brief: 'The owners cooked every night but ate standing up. They wanted a kitchen that could seat six, keep the 1940s character of the house and stop feeling like a hallway.',
    work: ['Opened a load-bearing wall with a concealed steel beam', 'Custom navy shaker cabinetry with white oak open shelving', 'Honed quartzite island with a waterfall edge and seating for four', 'New lighting plan with unlacquered brass pendants'],
    materials: ['White oak', 'Honed quartzite', 'Unlacquered brass', 'Hand-painted cabinetry'],
  },
  {
    slug: 'quiet-primary-bath', title: 'A quiet primary bath', type: 'Bathrooms', area: 'Mountain Brook', duration: '7 weeks', image: 'bathroom',
    alt: 'Bathroom with a freestanding tub, microcement walls and a fluted glass shower',
    summary: 'A dated en suite reworked into a calm, low-maintenance bathroom with a walk-in shower.',
    brief: 'A cramped tub-shower combination and a double vanity nobody used. The goal was one generous shower, a freestanding tub and surfaces that are easy to keep clean.',
    work: ['Relocated plumbing to free the window wall for the tub', 'Curbless walk-in shower with a fluted glass screen', 'Seamless microcement walls and floor', 'Floating oak vanity with integrated stone basin'],
    materials: ['Microcement', 'Fluted glass', 'White oak', 'Brushed brass'],
  },
  {
    slug: 'garden-room-extension', title: 'Garden room extension', type: 'Extensions', area: 'Vestavia Hills', duration: '16 weeks', image: 'garden-room',
    alt: 'Single-story extension with vaulted ceiling, skylights and glass doors open to the lawn',
    summary: 'A 380 sq ft single-story addition that turned the back of the house toward the garden.',
    brief: 'The family had a large yard they could only see from the laundry room. They wanted a dining space that opens fully to the lawn and fills with light year-round.',
    work: ['Foundations and framing for a 380 sq ft addition', 'Vaulted ceiling with exposed oak beams and three skylights', 'Floor-to-ceiling sliding glass doors', 'Polished concrete floor with radiant heating'],
    materials: ['Polished concrete', 'Oak beams', 'Aluminum glazing', 'Standing-seam roof'],
  },
  {
    slug: 'light-filled-living-room', title: 'Light-filled living room', type: 'Living spaces', area: 'Crestwood', duration: '6 weeks', image: 'hero',
    alt: 'Living room with steel-framed windows, oak floors, a linen sofa and a navy armchair',
    summary: 'Steel-framed windows and new oak floors brought a dark front room back to life.',
    brief: 'The front room faced the garden but had small windows and worn carpet. The owners wanted light, warmth and somewhere to read in the afternoon.',
    work: ['Widened two openings for black steel-framed windows', 'Wide-plank white oak floors throughout', 'Hand-troweled lime plaster walls', 'Built-in window seat and concealed storage'],
    materials: ['Steel windows', 'White oak', 'Lime plaster', 'Stone'],
  },
  {
    slug: 'navy-paneled-bedroom', title: 'Navy-paneled bedroom', type: 'Living spaces', area: 'Forest Park', duration: '4 weeks', image: 'bedroom',
    alt: 'Primary bedroom with navy paneling, an upholstered linen bed and oak nightstands',
    summary: 'An interiors refresh with custom paneling, new lighting and calmer finishes.',
    brief: 'A primary bedroom that had never been finished properly. The owners asked for something restful that still felt like the rest of the house.',
    work: ['Custom paneled feature wall painted deep navy', 'New lighting plan with wall-mounted reading lights', 'Built-in wardrobe with oak interiors', 'Linen window treatments and furniture sourcing'],
    materials: ['Painted poplar paneling', 'White oak', 'Linen', 'Ceramic'],
  },
  {
    slug: 'craftsman-porch-restoration', title: 'Craftsman porch restoration', type: 'Exteriors', area: 'Avondale', duration: '8 weeks', image: 'exterior',
    alt: 'White painted brick craftsman bungalow with a navy front door and a new oak porch',
    summary: 'A 1920s bungalow restored with a rebuilt porch, painted brick and new landscaping.',
    brief: 'The porch had settled and the brick was patched in three colors. The owners wanted the house to look cared for again without losing its age.',
    work: ['Rebuilt the porch deck, steps and tapered columns', 'Brick repair, limewash and trim repainting', 'New front door, lighting and house numbers', 'Front garden redesign with boxwoods and hydrangeas'],
    materials: ['Limewash', 'Oak columns', 'Painted steel lanterns', 'Bluestone steps'],
  },
];
const projectTypes = ['All', 'Kitchens', 'Bathrooms', 'Living spaces', 'Extensions', 'Exteriors'];

const steps = [
  { title: 'Consultation', text: 'A free 45-minute visit to understand your home, how you live in it and what you want to spend.' },
  { title: 'Design', text: 'Measured drawings, material boards and a fixed-price proposal you can compare line by line.' },
  { title: 'Build', text: 'One project lead, a crew we have worked with for years and a photo update every Friday.' },
  { title: 'Handover', text: 'A final walkthrough, a care guide for every finish and a two-year workmanship guarantee.' },
];

const tickerWords = ['Kitchens', 'Bathrooms', 'Extensions', 'Interiors', 'Porches', 'Whole homes'];

const projectCard = (p) => `
  <a class="project-card" href="#/projects/${p.slug}">
    <span class="project-media">${image(p.image, p.alt, { sizes: '(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 400px' })}</span>
    <span class="project-meta"><span>No. ${String(projects.indexOf(p) + 1).padStart(3, '0')}</span><span>${esc(p.type)} · ${esc(p.area)}</span></span>
    <strong>${esc(p.title)}</strong>
    <span class="project-summary">${esc(p.summary)}</span>
  </a>`;

const ctaBand = () => `
  <section class="cta-band">
    <div class="wrap cta-inner">
      <div><p class="eyebrow">Planning a renovation?</p><h2>Tell us about your home. We reply within two business days.</h2></div>
      <a class="btn btn-dark" href="#/estimate">Get an estimate <span aria-hidden="true">→</span></a>
    </div>
  </section>`;

function home() {
  return {
    title: 'FORM — Renovation & interiors in Birmingham, Alabama',
    html: `
    <section class="hero">
      <div class="hero-media">${image('hero', 'Renovated living room with steel-framed windows, oak floors, a linen sofa and a navy armchair', { eager: true, sizes: '100vw' })}</div>
      <div class="wrap hero-inner">
        <p class="tag">Renovation &amp; interiors · Birmingham, Alabama</p>
        <h1>Space to<br>live well.</h1>
        <div class="hero-foot">
          <p class="lead">We design and build kitchens, bathrooms, extensions and whole-home renovations for people who plan to stay a while.</p>
          <div class="hero-actions"><a class="btn btn-primary" href="#/estimate">Get an estimate <span aria-hidden="true">→</span></a><a class="btn btn-outline-light" href="#/projects">See our projects</a></div>
        </div>
      </div>
    </section>
    <section class="facts-band" aria-label="Why homeowners choose FORM">
      <dl class="wrap facts">
        <div><dt>Fixed</dt><dd>Price proposals, line by line</dd></div>
        <div><dt>One</dt><dd>Project lead from start to finish</dd></div>
        <div><dt>Friday</dt><dd>Photo update every week</dd></div>
        <div><dt>2 years</dt><dd>Workmanship guarantee</dd></div>
      </dl>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">What we do</p><h2>Three ways<br>we can help</h2></div><a class="btn btn-ghost" href="#/services">All services</a></div>
        <div class="service-rows">
          ${services.map((s, i) => `<a class="service-row" href="#/services?focus=${s.id}"><span class="row-num">0${i + 1}</span><strong>${s.name}</strong><small>${s.short}</small><span class="row-from">From ${money(s.from)}</span><span class="arrow" aria-hidden="true">→</span></a>`).join('')}
        </div>
      </div>
    </section>
    <div class="ticker" aria-hidden="true"><div class="ticker-track">${[...tickerWords, ...tickerWords].map((w) => `<span>${w}</span>`).join('')}</div></div>
    <section class="section">
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">Selected work</p><h2>Recent projects</h2></div><a class="btn btn-ghost" href="#/projects">All projects</a></div>
        <div class="project-grid">${projects.slice(0, 3).map(projectCard).join('')}</div>
      </div>
    </section>
    <section class="section process">
      <div class="process-media">${image('renovation', 'A room mid-renovation with exposed wall studs, a new steel beam, stacked oak flooring and a yellow ladder', { sizes: '100vw' })}</div>
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">How we work</p><h2>Four steps.<br>One team.</h2></div></div>
        <ol class="steps">${steps.map((s, i) => `<li><span class="step-num">0${i + 1}</span><h3>${s.title}</h3><p>${s.text}</p></li>`).join('')}</ol>
      </div>
    </section>
    <section class="section">
      <div class="wrap split">
        <div class="split-media">${image('studio', 'Material samples of oak, marble, tile and navy paint on a design table')}</div>
        <div class="split-copy">
          <p class="eyebrow">Design before demolition</p>
          <h2>See every finish before a wall comes down.</h2>
          <p>Every project starts with measured drawings and a material board you can hold. You approve the plan and the price before we schedule a crew, so there are no surprises halfway through.</p>
          <a class="link-arrow" href="#/about">How we work <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
    ${ctaBand()}`,
  };
}

function servicesPage({ query }) {
  return {
    title: 'Services — FORM',
    html: `
    <section class="page-hero"><div class="wrap"><p class="eyebrow">Services</p><h1>Renovation, interiors and extensions</h1><p class="lead">One team for design, pricing and building, so the plan you approve is the house you get.</p></div></section>
    ${services.map((s, i) => `
      <section class="section service-detail ${i % 2 ? 'reverse' : ''}" id="service-${s.id}">
        <div class="wrap split">
          <div class="split-media">${image(s.image, s.alt)}</div>
          <div class="split-copy">
            <p class="eyebrow">Service 0${i + 1}</p>
            <h2>${s.name}</h2>
            <p class="service-lead">${s.lead}</p>
            <ul class="check-list">${s.includes.map((item) => `<li>${item}</li>`).join('')}</ul>
            <dl class="service-facts"><div><dt>Typical timeline</dt><dd>${s.timeline}</dd></div><div><dt>Projects from</dt><dd>${money(s.from)}</dd></div></dl>
            <a class="btn btn-primary" href="#/estimate?type=${encodeURIComponent(s.name === 'Renovation' ? 'Kitchen' : s.name === 'Interiors' ? 'Interiors' : 'Extension')}">Get an estimate</a>
          </div>
        </div>
      </section>`).join('')}
    <section class="section section-sand">
      <div class="wrap narrow">
        <p class="eyebrow">Questions</p><h2>Before you get in touch</h2>
        <div class="faq">
          <details><summary>Do you work outside Birmingham?</summary><p>We take projects within about 40 minutes of the city, including Homewood, Mountain Brook, Vestavia Hills, Hoover and Trussville.</p></details>
          <details><summary>How accurate is the estimate?</summary><p>The online estimate gives a realistic range. After a site visit we send a fixed-price proposal, and that price only changes if you change the scope.</p></details>
          <details><summary>Can we live at home during the work?</summary><p>Usually, yes. For kitchens we set up a temporary kitchen, and we seal off work areas and clean up at the end of every day.</p></details>
          <details><summary>Do you handle permits?</summary><p>Yes. We prepare drawings, submit permit applications and schedule every inspection.</p></details>
        </div>
      </div>
    </section>
    ${ctaBand()}`,
    mount: () => {
      const focus = query.get('focus');
      if (focus) document.getElementById(`service-${focus}`)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    },
  };
}

function projectsPage({ query }) {
  const active = projectTypes.includes(query.get('type')) ? query.get('type') : 'All';
  const list = active === 'All' ? projects : projects.filter((p) => p.type === active);
  return {
    title: 'Projects — FORM',
    html: `
    <section class="page-hero"><div class="wrap"><p class="eyebrow">Projects</p><h1>Homes we have worked on</h1><p class="lead">A selection of recent renovations, interiors and extensions around Birmingham.</p></div></section>
    <section class="section section-tight">
      <div class="wrap">
        <div class="filter-bar" role="group" aria-label="Filter projects">
          ${projectTypes.map((t) => `<a class="chip ${t === active ? 'is-active' : ''}" href="#/projects${t === 'All' ? '' : `?type=${encodeURIComponent(t)}`}" ${t === active ? 'aria-current="true"' : ''}>${t}</a>`).join('')}
        </div>
        <p class="result-count">${list.length} ${list.length === 1 ? 'project' : 'projects'}</p>
        <div class="project-grid">${list.map(projectCard).join('')}</div>
      </div>
    </section>
    ${ctaBand()}`,
  };
}

function projectPage({ params }) {
  const index = projects.findIndex((p) => p.slug === params.slug);
  if (index < 0) return null;
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  const typeForEstimate = { Kitchens: 'Kitchen', Bathrooms: 'Bathroom', 'Living spaces': 'Interiors', Extensions: 'Extension', Exteriors: 'Exterior' }[p.type];
  return {
    title: `${p.title} — FORM`,
    html: `
    <section class="project-hero">
      <div class="wrap">
        <a class="back-link" href="#/projects">← All projects</a>
        <p class="eyebrow">${esc(p.type)} · ${esc(p.area)}</p>
        <h1>${esc(p.title)}</h1>
        <p class="lead">${esc(p.summary)}</p>
      </div>
      <div class="wrap project-cover">${image(p.image, p.alt, { eager: true, sizes: '100vw' })}</div>
    </section>
    <section class="section">
      <div class="wrap project-body">
        <aside class="project-facts">
          <dl>
            <div><dt>Location</dt><dd>${esc(p.area)}, Birmingham</dd></div>
            <div><dt>Project type</dt><dd>${esc(p.type)}</dd></div>
            <div><dt>Build time</dt><dd>${esc(p.duration)}</dd></div>
            <div><dt>Materials</dt><dd>${p.materials.map(esc).join(', ')}</dd></div>
          </dl>
          <a class="btn btn-primary full" href="#/estimate?type=${encodeURIComponent(typeForEstimate)}">Start a similar project</a>
        </aside>
        <div class="project-story">
          <h2>The brief</h2>
          <p>${esc(p.brief)}</p>
          <h2>What we did</h2>
          <ul class="check-list">${p.work.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
        </div>
      </div>
    </section>
    <section class="next-project">
      <a class="wrap next-inner" href="#/projects/${next.slug}">
        <span><span class="eyebrow">Next project</span><strong>${esc(next.title)}</strong></span>
        <span class="arrow" aria-hidden="true">→</span>
      </a>
    </section>`,
  };
}

function aboutPage() {
  return {
    title: 'About — FORM',
    html: `
    <section class="page-hero"><div class="wrap"><p class="eyebrow">About</p><h1>A small studio that designs and builds</h1><p class="lead">FORM started with a simple idea: the people who draw your plans should be the same people who build them.</p></div></section>
    <section class="section">
      <div class="wrap split">
        <div class="split-media">${image('studio', 'Design table with oak, marble and tile samples, paint chips and drawings')}</div>
        <div class="split-copy">
          <h2>Design and building under one roof</h2>
          <p>Our designers and carpenters share a studio, so every drawing is checked by someone who has built it before. That keeps plans realistic, prices honest and timelines steady.</p>
          <p>We take on a limited number of projects each season, which means your project lead is never stretched across a dozen sites.</p>
        </div>
      </div>
    </section>
    <section class="section section-sand">
      <div class="wrap">
        <div class="section-head"><div><p class="eyebrow">What we value</p><h2>How we like to work</h2></div></div>
        <div class="value-grid">
          <article><h3>Clear prices</h3><p>A fixed-price proposal with every line item visible. If the scope changes, you see the new price before we do the work.</p></article>
          <article><h3>Respect for the house</h3><p>We work with the age and character of each home, repair before we replace and leave the site clean every evening.</p></article>
          <article><h3>Fewer, better projects</h3><p>A small schedule means one project lead who knows your home, your plans and your preferences.</p></article>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="wrap narrow center">
        <p class="eyebrow">Where we work</p>
        <h2>Birmingham and surrounding cities</h2>
        <p class="lead">Homewood · Mountain Brook · Vestavia Hills · Hoover · Crestwood · Avondale · Forest Park · Trussville</p>
      </div>
    </section>
    ${ctaBand()}`,
  };
}

let contactSent = null;
function contactPage() {
  return {
    title: 'Contact — FORM',
    html: `
    <section class="page-hero"><div class="wrap"><p class="eyebrow">Contact</p><h1>Talk to the studio</h1><p class="lead">Questions about a project, a visit or something you saw here? Send a note and we will reply within two business days.</p></div></section>
    <section class="section section-tight">
      <div class="wrap contact-grid">
        <div class="contact-card">
          <h2>Studio</h2>
          <p>Birmingham, Alabama<br>Visits by appointment</p>
          <h2>Phone</h2>
          <p>(205) 555-0142</p>
          <h2>Hours</h2>
          <p>Monday–Friday, 8 AM–5 PM<br>Saturday consultations by appointment</p>
          <a class="btn btn-ghost" href="#/estimate">Planning a project? Get an estimate</a>
        </div>
        <div class="form-card">
          ${contactSent ? `
            <div class="success" role="status">
              <span class="success-icon" aria-hidden="true">✓</span>
              <h2>Thanks, ${esc(firstName(contactSent.name))}.</h2>
              <p>Your message is ready for the studio. In a live website it would be emailed to the team; in this demo nothing was sent.</p>
              <button class="btn btn-ghost" data-action="contact-reset">Send another message</button>
            </div>` : `
            <form data-form="contact" novalidate>
              <h2>Send a message</h2>
              <div class="field"><label for="c-name">Full name</label><input id="c-name" name="name" autocomplete="name" required></div>
              <div class="field-row">
                <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
                <div class="field"><label for="c-phone">Phone <span class="optional">(optional)</span></label><input id="c-phone" name="phone" type="tel" autocomplete="tel"></div>
              </div>
              <div class="field"><label for="c-message">Message</label><textarea id="c-message" name="message" rows="5" required data-minlength="10"></textarea></div>
              <button class="btn btn-primary" type="submit">Send message</button>
            </form>`}
        </div>
      </div>
    </section>`,
  };
}

// Estimate request: three steps, a review and a confirmation.
const projectOptions = [
  ['Kitchen', 'New layout, cabinets or a full remodel'],
  ['Bathroom', 'Primary, guest or powder room'],
  ['Whole home', 'Several rooms or a full renovation'],
  ['Extension', 'Addition, garden room or porch'],
  ['Interiors', 'Finishes, lighting and joinery'],
  ['Exterior', 'Porch, brick, siding or landscaping'],
];
const blankEstimate = () => ({ step: 1, data: { type: '', property: '', size: '', budget: '', timeline: '', details: '', name: '', email: '', phone: '', zip: '', contact: 'Email' }, done: null });
let estimate = blankEstimate();

const option = (value, current, label = value) => `<option value="${esc(value)}" ${value === current ? 'selected' : ''}>${esc(label)}</option>`;

function estimateStep() {
  const d = estimate.data;
  if (estimate.step === 1) return `
    <form data-form="estimate" novalidate>
      <fieldset class="choice-fieldset">
        <legend><span class="step-label">Step 1 of 3</span>What are you planning?</legend>
        <div class="choice-grid">
          ${projectOptions.map(([value, hint]) => `<label class="choice"><input type="radio" name="type" value="${value}" required data-required="Choose the type of project." ${d.type === value ? 'checked' : ''}><span class="choice-body"><strong>${value}</strong><small>${hint}</small></span></label>`).join('')}
        </div>
      </fieldset>
      <div class="form-actions"><span></span><button class="btn btn-primary" type="submit">Continue</button></div>
    </form>`;
  if (estimate.step === 2) return `
    <form data-form="estimate" novalidate>
      <fieldset class="plain-fieldset">
        <legend><span class="step-label">Step 2 of 3</span>Tell us about the project</legend>
        <div class="field-row">
          <div class="field"><label for="e-property">Property type</label><select id="e-property" name="property" required data-required="Choose a property type.">${option('', d.property, 'Select…')}${['Single-family house', 'Townhome', 'Condo'].map((v) => option(v, d.property)).join('')}</select></div>
          <div class="field"><label for="e-size">Home size</label><select id="e-size" name="size" required data-required="Choose an approximate size.">${option('', d.size, 'Select…')}${['Under 1,500 sq ft', '1,500–2,500 sq ft', '2,500–3,500 sq ft', 'Over 3,500 sq ft'].map((v) => option(v, d.size)).join('')}</select></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="e-budget">Budget range</label><select id="e-budget" name="budget" required data-required="Choose a budget range.">${option('', d.budget, 'Select…')}${['$15,000–$50,000', '$50,000–$100,000', '$100,000–$200,000', '$200,000+'].map((v) => option(v, d.budget)).join('')}</select></div>
          <div class="field"><label for="e-timeline">When would you like to start?</label><select id="e-timeline" name="timeline" required data-required="Choose a timeline.">${option('', d.timeline, 'Select…')}${['As soon as possible', 'In 1–3 months', 'In 3–6 months', 'I am flexible'].map((v) => option(v, d.timeline)).join('')}</select></div>
        </div>
        <div class="field"><label for="e-details">What would you like to change?</label><textarea id="e-details" name="details" rows="5" required data-minlength="20" placeholder="For example: open the kitchen to the dining room, add an island and replace the flooring.">${esc(d.details)}</textarea></div>
      </fieldset>
      <div class="form-actions"><button class="btn btn-ghost" type="button" data-action="estimate-back">Back</button><button class="btn btn-primary" type="submit">Continue</button></div>
    </form>`;
  if (estimate.step === 3) return `
    <form data-form="estimate" novalidate>
      <fieldset class="plain-fieldset">
        <legend><span class="step-label">Step 3 of 3</span>How can we reach you?</legend>
        <div class="field"><label for="e-name">Full name</label><input id="e-name" name="name" autocomplete="name" required value="${esc(d.name)}"></div>
        <div class="field-row">
          <div class="field"><label for="e-email">Email</label><input id="e-email" name="email" type="email" autocomplete="email" required value="${esc(d.email)}"></div>
          <div class="field"><label for="e-phone">Phone</label><input id="e-phone" name="phone" type="tel" autocomplete="tel" required value="${esc(d.phone)}"></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="e-zip">Property ZIP code</label><input id="e-zip" name="zip" inputmode="numeric" autocomplete="postal-code" required pattern="\\d{5}" data-pattern-message="Enter a 5-digit ZIP code." value="${esc(d.zip)}"></div>
          <fieldset class="field inline-choice"><legend>Preferred contact</legend>
            ${['Email', 'Phone'].map((v) => `<label><input type="radio" name="contact" value="${v}" ${d.contact === v ? 'checked' : ''}> ${v}</label>`).join('')}
          </fieldset>
        </div>
      </fieldset>
      <div class="form-actions"><button class="btn btn-ghost" type="button" data-action="estimate-back">Back</button><button class="btn btn-primary" type="submit">Review request</button></div>
    </form>`;
  return `
    <div class="review">
      <h2><span class="step-label">Review</span>Check your request</h2>
      ${[
        ['Project', [['Type', d.type]], 1],
        ['Details', [['Property', d.property], ['Size', d.size], ['Budget', d.budget], ['Start', d.timeline], ['Description', d.details]], 2],
        ['Contact', [['Name', d.name], ['Email', d.email], ['Phone', d.phone], ['ZIP code', d.zip], ['Preferred contact', d.contact]], 3],
      ].map(([title, rows, step]) => `
        <section class="review-block">
          <div class="review-head"><h3>${title}</h3><button class="text-button" data-action="estimate-edit" data-step="${step}">Edit</button></div>
          <dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        </section>`).join('')}
      <div class="form-actions"><button class="btn btn-ghost" type="button" data-action="estimate-back">Back</button><button class="btn btn-primary" data-action="estimate-submit">Submit request</button></div>
    </div>`;
}

function estimatePage({ query }) {
  const preset = query.get('type');
  if (preset && estimate.step === 1 && !estimate.done && projectOptions.some(([v]) => v === preset)) estimate.data.type = preset;
  if (estimate.done) {
    const { ref, data, visitBy } = estimate.done;
    return {
      title: 'Request received — FORM',
      html: `
      <section class="section estimate-section">
        <div class="wrap narrow">
          <div class="success confirmation" role="status">
            <span class="success-icon" aria-hidden="true">✓</span>
            <p class="eyebrow">Request ${esc(ref)}</p>
            <h1>Thanks, ${esc(firstName(data.name))}. Your estimate request is in.</h1>
            <p class="lead">We will ${data.contact === 'Phone' ? `call you at ${esc(data.phone)}` : `email you at ${esc(data.email)}`} to arrange a free consultation, usually by ${esc(visitBy)}.</p>
            <ol class="next-steps">
              <li><strong>We review your notes</strong><span>A designer reads your request and prepares questions.</span></li>
              <li><strong>Free home visit</strong><span>45 minutes to measure, talk options and agree on priorities.</span></li>
              <li><strong>Fixed-price proposal</strong><span>Drawings, materials and a line-by-line price within two weeks.</span></li>
            </ol>
            <p class="demo-note">Demo: this request was not sent anywhere.</p>
            <div class="form-actions center"><a class="btn btn-ghost" href="#/">Back to home</a><button class="btn btn-primary" data-action="estimate-restart">Start another request</button></div>
          </div>
        </div>
      </section>`,
    };
  }
  const progress = Math.min(estimate.step, 4);
  return {
    title: 'Get an estimate — FORM',
    html: `
    <section class="section estimate-section">
      <div class="wrap estimate-grid">
        <div class="estimate-intro">
          <p class="eyebrow">Get an estimate</p>
          <h1>Start with a few details.</h1>
          <p class="lead">It takes about three minutes. We will follow up to arrange a free consultation at your home.</p>
          <ol class="progress" aria-label="Progress">
            ${['Project', 'Details', 'Contact', 'Review'].map((label, i) => `<li class="${i + 1 < progress ? 'done' : i + 1 === progress ? 'current' : ''}" ${i + 1 === progress ? 'aria-current="step"' : ''}>${label}</li>`).join('')}
          </ol>
          <div class="estimate-aside">${image('exterior', 'White painted brick bungalow with a navy front door', { sizes: '(max-width: 900px) 100vw, 420px' })}</div>
        </div>
        <div class="form-card">${estimateStep()}</div>
      </div>
    </section>`,
  };
}

function notFound() {
  return {
    title: 'Page not found — FORM',
    html: `<section class="section"><div class="wrap narrow center"><p class="eyebrow">404</p><h1>We could not find that page.</h1><p class="lead">It may have moved. Try one of these instead.</p><div class="form-actions center"><a class="btn btn-primary" href="#/">Home</a><a class="btn btn-ghost" href="#/projects">Projects</a></div></div></section>`,
  };
}

const router = createRouter([
  ['/', home],
  ['/services', servicesPage],
  ['/projects', projectsPage],
  ['/projects/:slug', projectPage],
  ['/about', aboutPage],
  ['/contact', contactPage],
  ['/estimate', estimatePage],
], { notFound, afterRender: () => setMenu(false) });

function setMenu(open) {
  const button = document.querySelector('.menu-toggle');
  button.setAttribute('aria-expanded', String(open));
  document.getElementById('mobile-nav').hidden = !open;
  document.body.classList.toggle('menu-open', open);
}

actions({
  menu: (button) => setMenu(button.getAttribute('aria-expanded') !== 'true'),
  contact: (form) => {
    if (!validate(form)) return;
    contactSent = formData(form);
    router.render({ keepScroll: true });
    toast('Message ready — demo only, nothing was sent.');
  },
  'contact-reset': () => { contactSent = null; router.render({ keepScroll: true }); },
  estimate: (form) => {
    if (!validate(form)) return;
    Object.assign(estimate.data, formData(form));
    estimate.step += 1;
    router.render();
  },
  'estimate-back': () => {
    const form = document.querySelector('form[data-form="estimate"]');
    if (form) Object.assign(estimate.data, formData(form));
    estimate.step = Math.max(1, estimate.step - 1);
    router.render();
  },
  'estimate-edit': (button) => { estimate.step = Number(button.dataset.step); router.render(); },
  'estimate-submit': () => {
    const visitBy = formatDate(addBusinessDays(new Date(), 2), { weekday: 'long', month: 'long', day: 'numeric' });
    estimate.done = { ref: reference('FORM'), data: { ...estimate.data }, visitBy };
    router.render();
  },
  'estimate-restart': () => { estimate = blankEstimate(); router.go('#/estimate'); },
});
