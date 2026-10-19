// Workbench — demo web app: a fictional project management tool for a small studio.
const { esc, router: createRouter, validate, formData, toast, modal, confirmDialog, firstName, storage, actions, demoBar, formatDate, dayKey, fromDayKey, addDays } = Kit;
demoBar('Workbench', 'app');

const DAY = 86400000;
const STATUSES = [['todo', 'To do'], ['progress', 'In progress'], ['review', 'Review'], ['done', 'Complete']];
const statusLabel = Object.fromEntries(STATUSES);
const PRIORITIES = ['High', 'Medium', 'Low'];

const people = {
  alex: { name: 'Alex Rivera', initials: 'AR', color: '#7c3aed', role: 'Project lead' },
  priya: { name: 'Priya Shah', initials: 'PS', color: '#db2777', role: 'Product designer' },
  ben: { name: 'Ben Okafor', initials: 'BO', color: '#059669', role: 'Developer' },
  mia: { name: 'Mia Laurent', initials: 'ML', color: '#d97706', role: 'Developer' },
  sam: { name: 'Sam Torres', initials: 'ST', color: '#0891b2', role: 'QA and content' },
};
const projects = [
  { id: 'harbor-pine', prefix: 'HP', name: 'Harbor & Pine website', client: 'Harbor & Pine Coffee', color: '#7c3aed', dueIn: 24, members: ['alex', 'priya', 'ben', 'sam'], summary: 'Redesign of the café website with a seasonal menu and order-ahead for pickup.' },
  { id: 'ridgeway-portal', prefix: 'RD', name: 'Ridgeway patient portal', client: 'Ridgeway Dental Studio', color: '#0d9488', dueIn: 45, members: ['alex', 'mia', 'ben', 'sam'], summary: 'Online booking, intake forms and text reminders for a two-location dental practice.' },
  { id: 'magnolia-booking', prefix: 'MG', name: 'Magnolia booking app', client: 'Magnolia Hall Events', color: '#d6336c', dueIn: 12, members: ['alex', 'priya', 'mia'], summary: 'Venue availability, package quotes and deposits for a wedding and events venue.' },
];
const projectById = (id) => projects.find((p) => p.id === id);

function seed() {
  const now = Date.now();
  const at = (days, hours = 0) => now - days * DAY - hours * 3600000;
  let order = 0;
  let item = 0;
  const task = (key, project, title, assignee, status, priority, dueIn, extra = {}) => ({
    id: key, key, project, title, assignee, status, priority, due: dayKey(addDays(new Date(), dueIn)), order: order += 1,
    description: extra.description || '', created: at(extra.createdDaysAgo ?? 12),
    checklist: (extra.checklist || []).map(([text, done]) => ({ id: `c${item += 1}`, text, done })),
    comments: (extra.comments || []).map(([by, text, when]) => ({ id: `m${item += 1}`, by, text, at: when })),
    completedAt: status === 'done' ? at(extra.completedDaysAgo ?? 2) : null,
  });
  const tasks = [
    task('HP-1', 'harbor-pine', 'Finalize homepage design', 'priya', 'review', 'High', 1, {
      description: 'Final pass on the homepage: hero, menu highlights, visit info and the order-ahead call to action.',
      checklist: [['Hero section', true], ['Menu highlights', true], ['Mobile layout', false]],
      comments: [['alex', 'Looks great. Can we try the darker navy for the header?', at(1, 3)], ['priya', 'Updated in v3, take a look when you can.', at(0, 2)]],
    }),
    task('HP-2', 'harbor-pine', 'Build menu page with categories', 'ben', 'progress', 'Medium', 4, {
      description: 'Menu grouped by coffee, tea, bakery and seasonal, with prices and allergen notes.',
      checklist: [['Menu data model', true], ['Category tabs', false], ['Allergen icons', false]],
      comments: [['ben', 'Data model is in. Starting on the category tabs today.', at(0, 6)]],
    }),
    task('HP-3', 'harbor-pine', 'Set up order-ahead for pickup', 'ben', 'todo', 'High', 9, { description: 'Pickup ordering with time slots and a simple confirmation screen. Payments stay in test mode until launch.', checklist: [['Pickup time slots', false], ['Order summary', false], ['Confirmation email', false]] }),
    task('HP-4', 'harbor-pine', 'Write copy for About and Visit pages', 'sam', 'progress', 'Low', 3, { description: 'Short story of the café, opening hours, parking and accessibility info.' }),
    task('HP-5', 'harbor-pine', 'Collect photos for the seasonal menu', 'sam', 'todo', 'Low', 6),
    task('HP-6', 'harbor-pine', 'Kickoff workshop notes', 'alex', 'done', 'Medium', -10, { completedDaysAgo: 10, description: 'Goals, audience and success measures agreed with the owners.' }),
    task('HP-7', 'harbor-pine', 'Color contrast and accessibility pass', 'sam', 'todo', 'Medium', 11),
    task('HP-8', 'harbor-pine', 'Prepare launch checklist', 'alex', 'todo', 'Medium', 18, { checklist: [['Redirects from old site', false], ['Analytics goals', false], ['Owner training session', false]] }),
    task('RD-1', 'ridgeway-portal', 'Appointment booking flow', 'mia', 'progress', 'High', 2, {
      description: 'Patients choose a service, location and time, then confirm with their details.',
      checklist: [['Choose service', true], ['Pick a time', true], ['Confirm step', false], ['Reschedule and cancel', false]],
      comments: [['sam', 'Can we show the dentist’s name on the time picker?', at(1, 1)], ['mia', 'Yes, adding it to the slot cards.', at(0, 20)]],
    }),
    task('RD-2', 'ridgeway-portal', 'Patient intake forms', 'ben', 'todo', 'Medium', 8, { description: 'Medical history and insurance forms patients can finish before their visit.' }),
    task('RD-3', 'ridgeway-portal', 'SMS reminder templates', 'sam', 'review', 'Low', 0, { checklist: [['48-hour reminder', true], ['Same-day reminder', true], ['Reschedule link', false]] }),
    task('RD-4', 'ridgeway-portal', 'Insurance info page', 'sam', 'done', 'Low', -3, { completedDaysAgo: 1 }),
    task('RD-5', 'ridgeway-portal', 'Security review of patient data', 'alex', 'todo', 'High', 14, { description: 'Review access rules, encryption and data retention before the pilot.' }),
    task('RD-6', 'ridgeway-portal', 'Staff calendar sync', 'mia', 'todo', 'Medium', 20),
    task('RD-7', 'ridgeway-portal', 'Send weekly status update', 'alex', 'progress', 'Medium', 0, { description: 'Summary of progress, risks and next steps for the practice manager.' }),
    task('MG-1', 'magnolia-booking', 'Availability calendar', 'mia', 'progress', 'High', -1, {
      description: 'Month view of open dates for the ballroom and garden, with holds and booked dates.',
      comments: [['alex', 'The client asked for a legend for holds versus booked dates.', at(0, 5)]],
    }),
    task('MG-2', 'magnolia-booking', 'Quote builder with packages', 'priya', 'review', 'Medium', 2),
    task('MG-3', 'magnolia-booking', 'Deposit payment flow', 'mia', 'todo', 'High', 7, { description: 'Deposit checkout in test mode with a receipt screen.' }),
    task('MG-4', 'magnolia-booking', 'Venue photo gallery', 'priya', 'done', 'Low', -5, { completedDaysAgo: 5 }),
    task('MG-5', 'magnolia-booking', 'Client review meeting', 'alex', 'todo', 'Medium', 5),
    task('MG-6', 'magnolia-booking', 'Confirm content deadlines with client', 'alex', 'review', 'Low', 1),
  ];
  const files = [
    ['harbor-pine-homepage-v3.fig', 'harbor-pine', 19293798, 'priya', at(0, 2)],
    ['menu-fall-2026.pdf', 'harbor-pine', 2202009, 'sam', at(2)],
    ['brand-guidelines.pdf', 'harbor-pine', 7130317, 'alex', at(12)],
    ['ridgeway-sitemap.png', 'ridgeway-portal', 860160, 'mia', at(4)],
    ['intake-form-questions.docx', 'ridgeway-portal', 98304, 'sam', at(6)],
    ['sms-templates.xlsx', 'ridgeway-portal', 45056, 'sam', at(1)],
    ['magnolia-packages-2026.pdf', 'magnolia-booking', 3355443, 'alex', at(8)],
    ['venue-floorplan.jpg', 'magnolia-booking', 1677722, 'priya', at(5)],
  ].map(([name, project, size, by, when], i) => ({ id: `f${i + 1}`, name, project, size, by, at: when }));
  const activity = [
    ['priya', 'moved', 'HP-1', 'to Review', at(0, 2)],
    ['mia', 'commented on', 'RD-1', '', at(0, 20)],
    ['alex', 'commented on', 'MG-1', '', at(0, 5)],
    ['ben', 'moved', 'HP-2', 'to In progress', at(0, 6)],
    ['sam', 'completed', 'RD-4', '', at(1)],
    ['priya', 'uploaded', null, 'harbor-pine-homepage-v3.fig', at(0, 2)],
    ['alex', 'created', 'RD-5', '', at(2)],
    ['priya', 'completed', 'MG-4', '', at(5)],
  ].map(([who, verb, taskId, extra, when]) => ({ who, verb, taskId, extra, at: when })).sort((a, b) => b.at - a.at);
  return {
    version: 1, seededOn: dayKey(new Date()), tasks, files, activity, nextId: 100, notificationsRead: false,
    profile: { name: 'Alex Rivera', email: 'alex@fieldnote.example', role: 'Project lead', timezone: 'America/Chicago' },
    prefs: { theme: 'light', notify: { assigned: true, mentions: true, daily: false, weekly: true } },
  };
}

let state = storage.get('workbench-state', null);
if (!state || state.version !== 1) state = seed();
const save = () => storage.set('workbench-state', state);

// Keep the sample data current: if the demo was first opened days ago, move every date forward.
(() => {
  const days = Math.round((fromDayKey(dayKey(new Date())) - fromDayKey(state.seededOn)) / DAY);
  if (days <= 0) return;
  const shift = days * DAY;
  state.tasks.forEach((t) => {
    t.due = dayKey(addDays(fromDayKey(t.due), days));
    t.created += shift;
    if (t.completedAt) t.completedAt += shift;
    t.comments.forEach((c) => { c.at += shift; });
  });
  state.files.forEach((f) => { f.at += shift; });
  state.activity.forEach((a) => { a.at += shift; });
  state.seededOn = dayKey(new Date());
})();
save();

const icon = {
  plus: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  close: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  dots: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>',
  check: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  list: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7l2 2 3-3M4 15l2 2 3-3M12 8h8M12 16h8"/></svg>',
  comment: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H9l-4 4z"/></svg>',
  calendar: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14v14H5zM5 10h14M9 4v4M15 4v4"/></svg>',
  upload: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L8 8m4-4 4 4M5 14v6h14v-6"/></svg>',
  trash: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/></svg>',
  search: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
};

const todayDate = () => fromDayKey(dayKey(new Date()));
const taskById = (id) => state.tasks.find((t) => t.id === id);
const avatar = (id, size = '') => `<span class="avatar ${size}" style="--c:${people[id].color}" title="${esc(people[id].name)}" aria-hidden="true">${people[id].initials}</span>`;
const avatarStack = (ids) => `<span class="avatar-stack" aria-label="${ids.map((id) => people[id].name).join(', ')}">${ids.map((id) => avatar(id, 'sm')).join('')}</span>`;
const projTag = (p) => `<span class="proj-tag" style="--c:${p.color}">${esc(p.name)}</span>`;
const daysUntil = (key) => Math.round((fromDayKey(key) - todayDate()) / DAY);

function ago(ts) {
  const minutes = Math.round((Date.now() - ts) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return formatDate(new Date(ts), { month: 'short', day: 'numeric' });
}

function dueChip(t) {
  const d = daysUntil(t.due);
  const date = fromDayKey(t.due);
  const label = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : d === -1 ? 'Yesterday' : d > 1 && d < 7 ? formatDate(date, { weekday: 'short' }) : formatDate(date, { month: 'short', day: 'numeric' });
  const tone = t.status === 'done' ? 'done' : d < 0 ? 'overdue' : d <= 1 ? 'soon' : '';
  return `<span class="due ${tone}" title="Due ${esc(formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' }))}">${icon.calendar}${label}${tone === 'overdue' ? '<span class="visually-hidden"> (overdue)</span>' : ''}</span>`;
}
const prioTag = (p) => `<span class="prio prio-${p.toLowerCase()}">${p}</span>`;
const statusPill = (s) => `<span class="status-pill s-${s}">${statusLabel[s]}</span>`;
const progressOf = (p) => {
  const list = state.tasks.filter((t) => t.project === p.id);
  const done = list.filter((t) => t.status === 'done').length;
  return { total: list.length, done, open: list.length - done, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
};
const byDue = (a, b) => a.due.localeCompare(b.due) || PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority);

function log(verb, t, extra = '') {
  state.activity.unshift({ who: 'alex', verb, taskId: t?.id || null, title: t?.title, extra, at: Date.now() });
  state.activity = state.activity.slice(0, 40);
}

function activityRow(a) {
  const t = a.taskId && taskById(a.taskId);
  const subject = a.verb === 'uploaded' ? `<strong class="file-name">${esc(a.extra)}</strong>`
    : t ? `<button class="inline-link" data-action="open-task" data-id="${t.id}">${esc(t.title)}</button>` : `<strong>${esc(a.title || 'a task')}</strong>`;
  return `<li>${avatar(a.who, 'sm')}<p><strong>${a.who === 'alex' ? 'You' : esc(people[a.who].name)}</strong> ${a.verb} ${subject}${a.verb !== 'uploaded' && a.extra ? ` ${esc(a.extra)}` : ''}<time>${ago(a.at)}</time></p></li>`;
}

function overview() {
  const today = todayDate();
  const open = state.tasks.filter((t) => t.status !== 'done');
  const dueWeek = open.filter((t) => { const d = daysUntil(t.due); return d >= 0 && d <= 7; });
  const overdue = open.filter((t) => daysUntil(t.due) < 0);
  const done = state.tasks.filter((t) => t.status === 'done');
  const mine = open.filter((t) => t.assignee === 'alex').sort(byDue);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const load = Object.keys(people).map((id) => [id, open.filter((t) => t.assignee === id).length]);
  const maxLoad = Math.max(1, ...load.map(([, n]) => n));
  const kpi = (label, value, note, tone = '') => `<div class="kpi ${tone}"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
  return {
    title: 'Overview — Workbench',
    html: `
    <div class="page">
      <div class="page-head">
        <div><p class="page-kicker">${esc(formatDate(today, { weekday: 'long', month: 'long', day: 'numeric' }))}</p><h1>${greeting}, ${esc(firstName(state.profile.name))}</h1></div>
        <div class="head-actions"><a class="btn btn-ghost" href="#/tasks?assignee=alex">My tasks</a><button class="btn btn-primary" data-action="new-task">${icon.plus}New task</button></div>
      </div>
      <div class="kpis">
        ${kpi('Open tasks', open.length, `${state.tasks.length} in total`)}
        ${kpi('Due in 7 days', dueWeek.length, `${dueWeek.filter((t) => t.assignee === 'alex').length} assigned to you`)}
        ${kpi('Overdue', overdue.length, overdue.length ? 'Needs attention' : 'Everything on track', overdue.length ? 'bad' : 'good')}
        ${kpi('Completed', done.length, `${projects.length} active projects`)}
      </div>
      <div class="dash-grid">
        <section class="card">
          <div class="card-head"><h2>My tasks</h2><a class="text-link" href="#/tasks?assignee=alex">View all</a></div>
          ${mine.length ? `<ul class="my-tasks">${mine.slice(0, 6).map((t) => `
            <li>
              <button class="check" data-action="toggle-done" data-id="${t.id}" aria-pressed="false" aria-label="Mark “${esc(t.title)}” complete">${icon.check}</button>
              <button class="my-task" data-action="open-task" data-id="${t.id}"><span>${esc(t.title)}</span><small>${esc(projectById(t.project).name)} · ${t.key}</small></button>
              ${prioTag(t.priority)}${dueChip(t)}
            </li>`).join('')}</ul>` : '<p class="muted-note">Nothing assigned to you. Nice work.</p>'}
        </section>
        <section class="card">
          <div class="card-head"><h2>Activity</h2></div>
          <ul class="activity">${state.activity.slice(0, 6).map(activityRow).join('')}</ul>
        </section>
        <section class="card">
          <div class="card-head"><h2>Projects</h2><a class="text-link" href="#/projects">All projects</a></div>
          <div class="project-rows">
            ${projects.map((p) => {
              const pr = progressOf(p);
              return `<a class="project-row" href="#/projects/${p.id}">
                <span class="proj-dot" style="--c:${p.color}"></span>
                <span class="pr-name"><strong>${esc(p.name)}</strong><small>${esc(p.client)} · due ${esc(formatDate(addDays(today, p.dueIn), { month: 'short', day: 'numeric' }))}</small></span>
                <span class="pr-progress"><span class="bar"><span style="width:${pr.pct}%;background:${p.color}"></span></span><small>${pr.pct}%</small></span>
                ${avatarStack(p.members)}
              </a>`;
            }).join('')}
          </div>
        </section>
        <section class="card">
          <div class="card-head"><h2>Team workload</h2><span class="muted-note">Open tasks</span></div>
          <ul class="workload">
            ${load.map(([id, n]) => `<li>${avatar(id, 'sm')}<span class="wl-name">${esc(people[id].name)}</span><span class="bar"><span style="width:${(n / maxLoad) * 100}%"></span></span><strong>${n}</strong></li>`).join('')}
          </ul>
        </section>
      </div>
    </div>`,
  };
}

function projectsPage() {
  return {
    title: 'Projects — Workbench',
    html: `
    <div class="page">
      <div class="page-head"><div><p class="page-kicker">Fieldnote Studio</p><h1>Projects</h1></div><div class="head-actions"><button class="btn btn-primary" data-action="new-task">${icon.plus}New task</button></div></div>
      <div class="project-grid">
        ${projects.map((p) => {
          const pr = progressOf(p);
          const overdue = state.tasks.filter((t) => t.project === p.id && t.status !== 'done' && daysUntil(t.due) < 0).length;
          return `<a class="project-card" href="#/projects/${p.id}" style="--c:${p.color}">
            <span class="pc-top"><span class="pc-logo">${p.prefix}</span><span class="pc-client">${esc(p.client)}</span></span>
            <strong class="pc-name">${esc(p.name)}</strong>
            <span class="pc-summary">${esc(p.summary)}</span>
            <span class="pc-progress"><span class="bar"><span style="width:${pr.pct}%"></span></span><span>${pr.done}/${pr.total} tasks · ${pr.pct}%</span></span>
            <span class="pc-foot">${avatarStack(p.members)}<span class="pc-due ${overdue ? 'warn' : ''}">${overdue ? `${overdue} overdue` : `Due ${esc(formatDate(addDays(todayDate(), p.dueIn), { month: 'short', day: 'numeric' }))}`}</span></span>
          </a>`;
        }).join('')}
      </div>
    </div>`,
  };
}

function taskCard(t) {
  const checks = t.checklist.length ? `<span class="meta-item">${icon.list}${t.checklist.filter((c) => c.done).length}/${t.checklist.length}</span>` : '';
  const comments = t.comments.length ? `<span class="meta-item">${icon.comment}${t.comments.length}</span>` : '';
  return `
    <article class="task-card ${t.status === 'done' ? 'is-done' : ''}" draggable="true" data-id="${t.id}" data-action="open-card">
      <div class="tc-top"><span class="task-key">${t.key}</span>${prioTag(t.priority)}</div>
      <h3><button class="task-open" data-action="open-task" data-id="${t.id}">${esc(t.title)}</button></h3>
      <div class="tc-meta">${dueChip(t)}${checks}${comments}<span class="tc-avatar">${avatar(t.assignee, 'sm')}</span></div>
      <button class="card-menu-btn icon-btn xs" data-action="card-menu" data-id="${t.id}" aria-haspopup="menu" aria-expanded="false" aria-label="Move “${esc(t.title)}”">${icon.dots}</button>
    </article>`;
}

function board({ params, query }) {
  const p = projectById(params.id);
  if (!p) return null;
  const who = p.members.includes(query.get('assignee')) ? query.get('assignee') : '';
  const list = state.tasks.filter((t) => t.project === p.id && (!who || t.assignee === who));
  const pr = progressOf(p);
  return {
    title: `${p.name} — Workbench`,
    html: `
    <div class="page page-board">
      <div class="page-head">
        <div><p class="page-kicker"><a href="#/projects">Projects</a> / ${esc(p.client)}</p><h1><span class="proj-dot lg" style="--c:${p.color}"></span>${esc(p.name)}</h1></div>
        <div class="head-actions">${avatarStack(p.members)}<button class="btn btn-primary" data-action="new-task" data-project="${p.id}">${icon.plus}Add task</button></div>
      </div>
      <div class="board-bar">
        <div class="board-progress"><span class="bar"><span style="width:${pr.pct}%;background:${p.color}"></span></span><span>${pr.pct}% complete · ${pr.open} open · due ${esc(formatDate(addDays(todayDate(), p.dueIn), { month: 'long', day: 'numeric' }))}</span></div>
        <div class="filter-chips" role="group" aria-label="Show tasks for">
          <a class="fchip ${who ? '' : 'on'}" href="#/projects/${p.id}" ${who ? '' : 'aria-current="true"'}>Everyone</a>
          ${p.members.map((m) => `<a class="fchip ${who === m ? 'on' : ''}" href="#/projects/${p.id}?assignee=${m}" ${who === m ? 'aria-current="true"' : ''}>${avatar(m, 'xs')}${esc(firstName(people[m].name))}</a>`).join('')}
        </div>
      </div>
      <p class="board-hint">Drag cards between columns, or use the ••• menu on a card.</p>
      <div class="board" id="board">
        ${STATUSES.map(([s, label]) => {
          const col = list.filter((t) => t.status === s).sort((a, b) => a.order - b.order);
          return `
          <section class="column" data-status="${s}" aria-label="${label}, ${col.length} tasks">
            <header class="column-head"><span class="col-dot s-${s}"></span><h2>${label}</h2><span class="col-count">${col.length}</span><button class="icon-btn xs" data-action="new-task" data-project="${p.id}" data-status="${s}" aria-label="Add a task to ${label}">${icon.plus}</button></header>
            <div class="column-body">${col.map(taskCard).join('') || '<p class="col-empty">No tasks here yet</p>'}</div>
          </section>`;
        }).join('')}
      </div>
    </div>`,
    mount: mountBoard,
  };
}

function mountBoard(outlet) {
  let dragId = null;
  outlet.querySelectorAll('.task-card').forEach((card) => {
    card.addEventListener('dragstart', (event) => {
      dragId = card.dataset.id;
      event.dataTransfer.effectAllowed = 'move';
      try { event.dataTransfer.setData('text/plain', dragId); } catch { /* some browsers restrict this */ }
      requestAnimationFrame(() => card.classList.add('dragging'));
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      outlet.querySelectorAll('.drop-target').forEach((c) => c.classList.remove('drop-target'));
      dragId = null;
    });
  });
  outlet.querySelectorAll('.column').forEach((column) => {
    column.addEventListener('dragover', (event) => {
      if (!dragId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      column.classList.add('drop-target');
    });
    column.addEventListener('dragleave', (event) => { if (!column.contains(event.relatedTarget)) column.classList.remove('drop-target'); });
    column.addEventListener('drop', (event) => {
      event.preventDefault();
      column.classList.remove('drop-target');
      const id = dragId || event.dataTransfer.getData('text/plain');
      dragId = null;
      const before = [...column.querySelectorAll('.task-card:not(.dragging)')].find((c) => { const r = c.getBoundingClientRect(); return event.clientY < r.top + r.height / 2; });
      placeTask(id, column.dataset.status, before?.dataset.id);
    });
  });
}

function placeTask(id, status, beforeId) {
  const t = taskById(id);
  if (!t) return;
  const changed = t.status !== status;
  const column = state.tasks.filter((x) => x.project === t.project && x.status === status && x.id !== t.id).sort((a, b) => a.order - b.order);
  const index = beforeId ? column.findIndex((x) => x.id === beforeId) : -1;
  column.splice(index < 0 ? column.length : index, 0, t);
  column.forEach((x, i) => { x.order = i + 1; });
  if (changed) setStatus(t, status, { silentRender: true });
  save();
  router.render({ keepScroll: true });
  refreshDrawer();
}

function setStatus(t, status, { silentRender = false } = {}) {
  if (t.status === status) return;
  t.status = status;
  t.completedAt = status === 'done' ? Date.now() : null;
  if (status === 'done') log('completed', t);
  else log('moved', t, `to ${statusLabel[status]}`);
  toast(status === 'done' ? `Completed “${t.title}”.` : `Moved “${t.title}” to ${statusLabel[status]}.`);
  if (!silentRender) {
    t.order = Math.max(0, ...state.tasks.filter((x) => x.project === t.project && x.status === status && x.id !== t.id).map((x) => x.order)) + 1;
    save();
    router.render({ keepScroll: true });
    refreshDrawer();
  }
}

function readTaskFilters(query) {
  return {
    q: (query.get('q') || '').slice(0, 80),
    project: projectById(query.get('project')) ? query.get('project') : '',
    assignee: people[query.get('assignee')] ? query.get('assignee') : '',
    status: ['open', 'all', 'todo', 'progress', 'review', 'done'].includes(query.get('status')) ? query.get('status') : 'open',
    sort: ['due', 'priority', 'recent'].includes(query.get('sort')) ? query.get('sort') : 'due',
  };
}

function tasksPage({ query }) {
  const f = readTaskFilters(query);
  const needle = f.q.toLowerCase();
  const sorters = { due: byDue, priority: (a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) || byDue(a, b), recent: (a, b) => b.created - a.created };
  const list = state.tasks
    .filter((t) => (!needle || `${t.title} ${t.key}`.toLowerCase().includes(needle))
      && (!f.project || t.project === f.project) && (!f.assignee || t.assignee === f.assignee)
      && (f.status === 'all' || (f.status === 'open' ? t.status !== 'done' : t.status === f.status)))
    .sort(sorters[f.sort]);
  const select = (name, label, options, value) => `<label class="tool-select"><span class="visually-hidden">${label}</span><select name="${name}" data-change="task-filter" aria-label="${label}">${options.map(([v, text]) => `<option value="${v}" ${v === value ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`;
  return {
    title: 'Tasks — Workbench',
    html: `
    <div class="page">
      <div class="page-head"><div><p class="page-kicker">All projects</p><h1>Tasks</h1></div><div class="head-actions"><button class="btn btn-primary" data-action="new-task">${icon.plus}New task</button></div></div>
      <div class="toolbar">
        <label class="tool-search">${icon.search}<span class="visually-hidden">Search tasks</span><input id="task-search" type="search" placeholder="Filter by name or key" value="${esc(f.q)}" data-input="task-search" autocomplete="off"></label>
        ${select('project', 'Project', [['', 'All projects'], ...projects.map((p) => [p.id, p.name])], f.project)}
        ${select('assignee', 'Assignee', [['', 'Anyone'], ...Object.entries(people).map(([id, p]) => [id, id === 'alex' ? 'Me (Alex)' : p.name])], f.assignee)}
        ${select('status', 'Status', [['open', 'Open tasks'], ['all', 'All tasks'], ...STATUSES], f.status)}
        ${select('sort', 'Sort', [['due', 'Sort: Due date'], ['priority', 'Sort: Priority'], ['recent', 'Sort: Newest']], f.sort)}
      </div>
      <p class="result-note" aria-live="polite">${list.length} ${list.length === 1 ? 'task' : 'tasks'}${f.q ? ` matching “${esc(f.q)}”` : ''}</p>
      ${list.length ? `
      <div class="table-card">
        <table class="task-table">
          <thead><tr><th class="c-check"><span class="visually-hidden">Complete</span></th><th>Task</th><th>Project</th><th>Assignee</th><th>Status</th><th>Priority</th><th>Due</th></tr></thead>
          <tbody>
            ${list.map((t) => `
            <tr class="${t.status === 'done' ? 'is-done' : ''}">
              <td class="c-check"><button class="check ${t.status === 'done' ? 'on' : ''}" data-action="toggle-done" data-id="${t.id}" aria-pressed="${t.status === 'done'}" aria-label="${t.status === 'done' ? 'Reopen' : 'Complete'} “${esc(t.title)}”">${icon.check}</button></td>
              <td class="c-title"><button class="row-open" data-action="open-task" data-id="${t.id}"><span class="task-key">${t.key}</span>${esc(t.title)}</button></td>
              <td class="c-project">${projTag(projectById(t.project))}</td>
              <td class="c-assignee">${avatar(t.assignee, 'sm')}<span>${esc(people[t.assignee].name)}</span></td>
              <td class="c-status">${statusPill(t.status)}</td>
              <td class="c-prio">${prioTag(t.priority)}</td>
              <td class="c-due">${dueChip(t)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : `<div class="empty-card"><h2>No tasks found</h2><p>Try a different search or clear the filters.</p><a class="btn btn-ghost" href="#/tasks?status=all">Show all tasks</a></div>`}
    </div>`,
  };
}

const fileKind = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'heic'].includes(ext)) return ['IMG', 'k-img'];
  if (ext === 'pdf') return ['PDF', 'k-pdf'];
  if (['doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)) return ['DOC', 'k-doc'];
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return ['XLS', 'k-xls'];
  if (['fig', 'sketch', 'psd', 'ai', 'xd'].includes(ext)) return ['FIG', 'k-fig'];
  if (['zip', 'rar', '7z'].includes(ext)) return ['ZIP', 'k-zip'];
  return [ext.slice(0, 3).toUpperCase() || 'FILE', 'k-other'];
};
const fileSize = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

function filesPage({ query }) {
  const project = projectById(query.get('project')) ? query.get('project') : '';
  const list = state.files.filter((f) => !project || f.project === project).sort((a, b) => b.at - a.at);
  const total = list.reduce((sum, f) => sum + f.size, 0);
  return {
    title: 'Files — Workbench',
    html: `
    <div class="page">
      <div class="page-head">
        <div><p class="page-kicker">Shared with your team</p><h1>Files</h1></div>
        <div class="head-actions">
          <input class="visually-hidden" id="file-input" type="file" multiple data-change="upload">
          <label class="btn btn-primary" for="file-input">${icon.upload}Upload files</label>
        </div>
      </div>
      <div class="tabs" role="group" aria-label="Filter files by project">
        <a class="tab ${project ? '' : 'on'}" href="#/files" ${project ? '' : 'aria-current="true"'}>All files <span>${state.files.length}</span></a>
        ${projects.map((p) => `<a class="tab ${project === p.id ? 'on' : ''}" href="#/files?project=${p.id}" ${project === p.id ? 'aria-current="true"' : ''}><span class="proj-dot" style="--c:${p.color}"></span>${esc(p.name)} <span>${state.files.filter((f) => f.project === p.id).length}</span></a>`).join('')}
      </div>
      <div class="dropzone" id="dropzone">
        ${icon.upload}
        <p><strong>Drop files here to upload</strong><span>Demo only: Workbench records the file name and size. Your files stay on your device.</span></p>
      </div>
      ${list.length ? `
      <div class="table-card">
        <ul class="file-list">
          ${list.map((f) => {
            const [label, kind] = fileKind(f.name);
            const p = projectById(f.project);
            return `<li class="file-row">
              <span class="file-icon ${kind}" aria-hidden="true">${label}</span>
              <span class="file-main"><strong>${esc(f.name)}</strong><small>${fileSize(f.size)} · ${f.by === 'alex' ? 'You' : esc(people[f.by].name)} · ${ago(f.at)}</small></span>
              <span class="file-project">${projTag(p)}</span>
              <button class="icon-btn" data-action="delete-file" data-id="${f.id}" aria-label="Delete ${esc(f.name)}">${icon.trash}</button>
            </li>`;
          }).join('')}
        </ul>
        <p class="table-foot">${list.length} ${list.length === 1 ? 'file' : 'files'} · ${fileSize(total)}</p>
      </div>` : '<div class="empty-card"><h2>No files yet</h2><p>Upload briefs, designs and documents to share them with the team.</p></div>'}
    </div>`,
    mount: mountDropzone,
  };
}

function mountDropzone(outlet) {
  const zone = outlet.querySelector('#dropzone');
  ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (event) => { event.preventDefault(); zone.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((type) => zone.addEventListener(type, () => zone.classList.remove('over')));
  zone.addEventListener('drop', (event) => { event.preventDefault(); addFiles(event.dataTransfer.files); });
}

function addFiles(fileList) {
  const files = [...(fileList || [])].slice(0, 20);
  if (!files.length) return;
  const project = new URLSearchParams(location.hash.split('?')[1] || '').get('project');
  const target = projectById(project) ? project : projects[0].id;
  files.forEach((file) => {
    state.nextId += 1;
    state.files.push({ id: `f${state.nextId}`, name: file.name.slice(0, 120), project: target, size: file.size, by: 'alex', at: Date.now() });
    state.activity.unshift({ who: 'alex', verb: 'uploaded', taskId: null, extra: file.name.slice(0, 120), at: Date.now() });
  });
  save();
  router.render({ keepScroll: true });
  toast(`${files.length === 1 ? `“${files[0].name}” added` : `${files.length} files added`} to ${projectById(target).name}. Demo: only the name and size were recorded.`);
}

function settingsPage() {
  const p = state.profile;
  const n = state.prefs.notify;
  const toggle = (key, title, text) => `<label class="switch-row"><span><strong>${title}</strong><small>${text}</small></span><input type="checkbox" role="switch" name="${key}" data-change="notify-pref" ${n[key] ? 'checked' : ''}><span class="switch" aria-hidden="true"></span></label>`;
  return {
    title: 'Settings — Workbench',
    html: `
    <div class="page page-narrow">
      <div class="page-head"><div><p class="page-kicker">Your account</p><h1>Settings</h1></div></div>
      <section class="card settings-card">
        <div class="settings-side"><h2>Profile</h2><p>How your name appears to teammates.</p></div>
        <form class="settings-form" data-form="profile" novalidate>
          <div class="profile-preview">${`<span class="avatar lg" style="--c:${people.alex.color}" aria-hidden="true">${esc(p.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase())}</span>`}<span><strong>${esc(p.name)}</strong><small>${esc(p.role)}</small></span></div>
          <div class="field-row">
            <div class="field"><label for="p-name">Full name</label><input id="p-name" name="name" required maxlength="60" data-required="Enter your name." value="${esc(p.name)}"></div>
            <div class="field"><label for="p-role">Role</label><input id="p-role" name="role" maxlength="60" value="${esc(p.role)}"></div>
          </div>
          <div class="field-row">
            <div class="field"><label for="p-email">Email</label><input id="p-email" name="email" type="email" required data-required="Enter your email address." value="${esc(p.email)}"></div>
            <div class="field"><label for="p-tz">Time zone</label><select id="p-tz" name="timezone">${[['America/Chicago', 'Central Time (Alabama)'], ['America/New_York', 'Eastern Time'], ['America/Denver', 'Mountain Time'], ['America/Los_Angeles', 'Pacific Time']].map(([v, label]) => `<option value="${v}" ${v === p.timezone ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
          </div>
          <div class="form-foot"><button class="btn btn-primary" type="submit">Save profile</button></div>
        </form>
      </section>
      <section class="card settings-card">
        <div class="settings-side"><h2>Notifications</h2><p>Choose what Workbench emails you about.</p></div>
        <div class="switch-list">
          ${toggle('assigned', 'Assigned to me', 'When someone gives you a task')}
          ${toggle('mentions', 'Mentions and comments', 'When someone replies or mentions you')}
          ${toggle('daily', 'Daily summary', 'Your tasks for the day, every morning at 8 AM')}
          ${toggle('weekly', 'Weekly project report', 'Progress across all projects every Monday')}
        </div>
      </section>
      <section class="card settings-card">
        <div class="settings-side"><h2>Appearance</h2><p>Light, dark or match your device.</p></div>
        <div class="theme-options" role="radiogroup" aria-label="Theme">
          ${[['light', 'Light'], ['dark', 'Dark'], ['system', 'System']].map(([v, label]) => `<label class="theme-option"><input type="radio" name="theme" value="${v}" data-change="theme-pref" ${state.prefs.theme === v ? 'checked' : ''}><span class="theme-swatch sw-${v}" aria-hidden="true"><i></i><i></i></span><span>${label}</span></label>`).join('')}
        </div>
      </section>
      <section class="card settings-card">
        <div class="settings-side"><h2>Demo data</h2><p>Everything you change here is stored in this browser only.</p></div>
        <div><p class="muted-note">Start over with the original sample projects, tasks and files.</p><button class="btn btn-danger" data-action="reset-demo">Reset demo data</button></div>
      </section>
    </div>`,
  };
}

function notFound() {
  return { title: 'Not found — Workbench', html: '<div class="page"><div class="empty-card"><h2>Page not found</h2><p>That page does not exist in this workspace.</p><a class="btn btn-primary" href="#/">Go to overview</a></div></div>' };
}

let drawer = null;
function drawerHtml(t) {
  const p = projectById(t.project);
  const doneCount = t.checklist.filter((c) => c.done).length;
  const pct = t.checklist.length ? Math.round((doneCount / t.checklist.length) * 100) : 0;
  const options = (list, value) => list.map(([v, label]) => `<option value="${v}" ${v === value ? 'selected' : ''}>${label}</option>`).join('');
  return `
    <div class="drawer-head">
      <span class="task-key">${t.key}</span>${projTag(p)}
      <button class="icon-btn drawer-close" data-close aria-label="Close task">${icon.close}</button>
    </div>
    <div class="drawer-body">
      <h2 class="drawer-title" id="drawer-title">${esc(t.title)}</h2>
      <div class="drawer-fields">
        <label><span>Status</span><select name="status" data-change="task-field" data-id="${t.id}">${options(STATUSES, t.status)}</select></label>
        <label><span>Assignee</span><select name="assignee" data-change="task-field" data-id="${t.id}">${options(p.members.map((m) => [m, people[m].name]), t.assignee)}</select></label>
        <label><span>Priority</span><select name="priority" data-change="task-field" data-id="${t.id}">${options(PRIORITIES.map((x) => [x, x]), t.priority)}</select></label>
        <label><span>Due date</span><input type="date" name="due" value="${t.due}" data-change="task-field" data-id="${t.id}"></label>
      </div>
      <section class="drawer-section">
        <h3>Description</h3>
        <p class="${t.description ? '' : 'muted-note'}">${esc(t.description || 'No description yet.')}</p>
      </section>
      <section class="drawer-section">
        <h3>Checklist <span>${doneCount}/${t.checklist.length}</span></h3>
        ${t.checklist.length ? `<div class="mini-bar"><span style="width:${pct}%"></span></div>` : ''}
        <ul class="checklist">
          ${t.checklist.map((c) => `<li><label><input type="checkbox" id="chk-${c.id}" data-change="check-item" data-id="${t.id}" data-item="${c.id}" ${c.done ? 'checked' : ''}><span>${esc(c.text)}</span></label><button class="icon-btn xs" data-action="remove-item" data-id="${t.id}" data-item="${c.id}" aria-label="Remove “${esc(c.text)}”">${icon.close}</button></li>`).join('')}
        </ul>
        <form class="inline-form" data-form="add-item" data-id="${t.id}" novalidate><input id="new-item" name="text" maxlength="100" placeholder="Add an item" aria-label="New checklist item" autocomplete="off"><button class="btn btn-ghost btn-sm" type="submit">Add</button></form>
      </section>
      <section class="drawer-section">
        <h3>Comments <span>${t.comments.length}</span></h3>
        <ul class="comments">
          ${t.comments.map((c) => `<li>${avatar(c.by, 'sm')}<div><p class="c-meta"><strong>${c.by === 'alex' ? 'You' : esc(people[c.by].name)}</strong><time>${ago(c.at)}</time></p><p>${esc(c.text)}</p></div></li>`).join('') || '<li class="muted-note">No comments yet.</li>'}
        </ul>
        <form class="comment-form" data-form="add-comment" data-id="${t.id}" novalidate>
          <textarea id="new-comment" name="text" rows="2" maxlength="500" placeholder="Write a comment" aria-label="Write a comment" required data-required="Write a comment first."></textarea>
          <button class="btn btn-primary btn-sm" type="submit">Comment</button>
        </form>
      </section>
    </div>
    <div class="drawer-foot"><span>Created ${ago(t.created)}</span><button class="btn btn-danger-ghost btn-sm" data-action="delete-task" data-id="${t.id}">${icon.trash}Delete task</button></div>`;
}

function openTask(id) {
  const t = taskById(id);
  if (!t) return;
  drawer?.close();
  const m = modal(drawerHtml(t), { className: 'drawer', labelledBy: 'drawer-title', onClose: () => { drawer = null; } });
  drawer = { ...m, id };
  m.dialog.querySelector('.drawer-close').focus();
}

function refreshDrawer() {
  if (!drawer) return;
  const t = taskById(drawer.id);
  if (!t) { drawer.close(); return; }
  const body = drawer.dialog.querySelector('.drawer-body');
  const scroll = body ? body.scrollTop : 0;
  const active = document.activeElement;
  const key = drawer.dialog.contains(active) ? (active.id ? `#${CSS.escape(active.id)}` : active.name ? `[name="${CSS.escape(active.name)}"]` : null) : null;
  drawer.dialog.innerHTML = drawerHtml(t);
  drawer.dialog.querySelector('.drawer-body').scrollTop = scroll;
  (key && drawer.dialog.querySelector(key) || drawer.dialog.querySelector('.drawer-close')).focus({ preventScroll: true });
}

function openNewTask({ project, status } = {}) {
  const fromRoute = (location.hash.match(/^#\/projects\/([^/?]+)/) || [])[1];
  const current = projectById(project) ? project : projectById(fromRoute) ? fromRoute : projects[0].id;
  const p = projectById(current);
  const { dialog } = modal(`
    <div class="modal-head"><h2 id="nt-title">New task</h2><button class="icon-btn" data-close aria-label="Close">${icon.close}</button></div>
    <form data-form="create-task" novalidate>
      <div class="field"><label for="nt-name">Task name</label><input id="nt-name" name="title" required maxlength="120" autocomplete="off" data-required="Give the task a name." placeholder="e.g. Design the checkout page"></div>
      <div class="field-row">
        <div class="field"><label for="nt-project">Project</label><select id="nt-project" name="project" data-change="nt-project">${projects.map((x) => `<option value="${x.id}" ${x.id === current ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
        <div class="field"><label for="nt-status">Status</label><select id="nt-status" name="status">${STATUSES.map(([v, label]) => `<option value="${v}" ${v === (status || 'todo') ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
      </div>
      <div class="field-row">
        <div class="field"><label for="nt-assignee">Assignee</label><select id="nt-assignee" name="assignee">${p.members.map((m) => `<option value="${m}" ${m === 'alex' ? 'selected' : ''}>${esc(people[m].name)}</option>`).join('')}</select></div>
        <div class="field"><label for="nt-priority">Priority</label><select id="nt-priority" name="priority">${PRIORITIES.map((x) => `<option ${x === 'Medium' ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label for="nt-due">Due date</label><input id="nt-due" name="due" type="date" required min="${dayKey(new Date())}" value="${dayKey(addDays(new Date(), 7))}" data-required="Choose a due date." data-range-message="Choose today or a later date."></div>
      <div class="field"><label for="nt-desc">Description <span class="optional">(optional)</span></label><textarea id="nt-desc" name="description" rows="3" maxlength="600"></textarea></div>
      <div class="bl-dialog-actions"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" type="submit">Create task</button></div>
    </form>`, { className: 'bl-dialog form-dialog', labelledBy: 'nt-title' });
  dialog.querySelector('#nt-name').focus();
}

const notifications = [
  ['priya', 'mentioned you in', 'HP-1', 2],
  ['mia', 'moved', 'MG-1', 5, 'to In progress'],
  ['sam', 'completed', 'RD-4', 26],
];
function renderNotifications() {
  const panel = document.getElementById('notify-panel');
  panel.innerHTML = `
    <div class="np-head"><strong>Notifications</strong>${state.notificationsRead ? '' : '<button class="text-button" data-action="mark-read">Mark all as read</button>'}</div>
    <ul>${notifications.map(([who, verb, id, hours, extra = '']) => {
      const t = taskById(id);
      return `<li class="${state.notificationsRead ? '' : 'unread'}">${avatar(who, 'sm')}<p><strong>${esc(people[who].name)}</strong> ${verb} ${t ? `<button class="inline-link" data-action="open-task" data-id="${t.id}">${esc(t.title)}</button>` : 'a task'} ${esc(extra)}<time>${hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`}</time></p></li>`;
    }).join('')}</ul>`;
  document.getElementById('notify-dot').hidden = state.notificationsRead;
}
function setNotifications(open) {
  const panel = document.getElementById('notify-panel');
  if (open) renderNotifications();
  panel.hidden = !open;
  document.getElementById('notify-btn').setAttribute('aria-expanded', String(open));
}

function closeMenus() {
  document.querySelectorAll('.card-menu').forEach((m) => m.remove());
  document.querySelectorAll('.card-menu-btn[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
}
function openCardMenu(button) {
  const wasOpen = button.getAttribute('aria-expanded') === 'true';
  closeMenus();
  if (wasOpen) return;
  const t = taskById(button.dataset.id);
  const menu = document.createElement('div');
  menu.className = 'card-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `${STATUSES.filter(([s]) => s !== t.status).map(([s, label]) => `<button role="menuitem" data-action="move-to" data-id="${t.id}" data-status="${s}"><span class="col-dot s-${s}"></span>Move to ${label}</button>`).join('')}<button role="menuitem" data-action="open-task" data-id="${t.id}">Open task</button>`;
  menu.addEventListener('keydown', (event) => {
    const items = [...menu.querySelectorAll('button')];
    const i = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    if (event.key === 'Escape') { event.stopPropagation(); closeMenus(); button.focus(); }
  });
  button.after(menu);
  button.setAttribute('aria-expanded', 'true');
  menu.querySelector('button').focus();
}

function applyTheme() {
  const pref = state.prefs.theme;
  let dark = pref === 'dark';
  if (pref === 'system') { try { dark = matchMedia('(prefers-color-scheme: dark)').matches; } catch { dark = false; } }
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.getElementById('theme-toggle').setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

function renderChrome(ctx) {
  const current = (ctx.path.match(/^\/projects\/([^/]+)/) || [])[1];
  document.getElementById('side-projects').innerHTML = projects.map((p) => {
    const open = progressOf(p).open;
    return `<a class="side-project ${current === p.id ? 'is-active' : ''}" href="#/projects/${p.id}" ${current === p.id ? 'aria-current="page"' : ''}><span class="proj-dot" style="--c:${p.color}"></span><span>${esc(p.name)}</span><small>${open}</small></a>`;
  }).join('');
  const initials = state.profile.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('side-user').innerHTML = `<span class="avatar" style="--c:${people.alex.color}" aria-hidden="true">${esc(initials)}</span><span><strong>${esc(state.profile.name)}</strong><small>${esc(state.profile.role)}</small></span>`;
  document.getElementById('me-avatar').innerHTML = `<span class="avatar" style="--c:${people.alex.color}" aria-hidden="true">${esc(initials)}</span>`;
  document.getElementById('notify-dot').hidden = state.notificationsRead;
  const search = document.getElementById('global-search');
  if (ctx.path !== '/tasks' && document.activeElement !== search) search.value = '';
}

function setSidebar(open) {
  document.body.classList.toggle('sidebar-open', open);
  document.querySelector('.scrim').hidden = !open;
  document.querySelector('.menu-btn').setAttribute('aria-expanded', String(open));
  if (open) document.querySelector('.side-nav a').focus();
}

applyTheme();
const router = createRouter([
  ['/', overview],
  ['/projects', projectsPage],
  ['/projects/:id', board],
  ['/tasks', tasksPage],
  ['/files', filesPage],
  ['/settings', settingsPage],
], { notFound, scrollContainer: '.main', afterRender: (ctx) => { closeMenus(); setNotifications(false); if (document.body.classList.contains('sidebar-open')) setSidebar(false); renderChrome(ctx); } });

function setTaskQuery(changes, options) {
  const query = new URLSearchParams(location.hash.startsWith('#/tasks') ? location.hash.split('?')[1] || '' : '');
  Object.entries(changes).forEach(([key, value]) => (value ? query.set(key, value) : query.delete(key)));
  const qs = query.toString();
  router.go(`#/tasks${qs ? `?${qs}` : ''}`, options);
}

let searchTimer;
actions({
  'sidebar-open': () => setSidebar(true),
  'sidebar-close': () => setSidebar(false),
  'new-task': (button) => openNewTask({ project: button.dataset.project, status: button.dataset.status }),
  'nt-project': (select) => {
    const p = projectById(select.value);
    const assignee = select.form.elements.assignee;
    const keep = p.members.includes(assignee.value) ? assignee.value : 'alex';
    assignee.innerHTML = p.members.map((m) => `<option value="${m}" ${m === keep ? 'selected' : ''}>${esc(people[m].name)}</option>`).join('');
  },
  'create-task': (form) => {
    if (!validate(form)) return;
    const data = formData(form);
    const p = projectById(data.project);
    const next = Math.max(0, ...state.tasks.filter((t) => t.project === p.id).map((t) => Number(t.key.split('-')[1]))) + 1;
    const key = `${p.prefix}-${next}`;
    const t = {
      id: key, key, project: p.id, title: data.title.trim(), assignee: data.assignee, status: data.status, priority: data.priority, due: data.due,
      description: data.description.trim(), created: Date.now(), checklist: [], comments: [], completedAt: data.status === 'done' ? Date.now() : null,
      order: Math.max(0, ...state.tasks.filter((x) => x.project === p.id && x.status === data.status).map((x) => x.order)) + 1,
    };
    state.tasks.push(t);
    log('created', t);
    save();
    form.closest('dialog').querySelector('[data-close]').click();
    router.render({ keepScroll: true });
    toast(`Created ${key} in ${p.name}.`);
  },
  'open-task': (el, event) => { event?.stopPropagation(); closeMenus(); setNotifications(false); openTask(el.dataset.id); },
  'open-card': (card) => openTask(card.dataset.id),
  'card-menu': (button, event) => { event.stopPropagation(); openCardMenu(button); },
  'move-to': (button, event) => { event.stopPropagation(); const t = taskById(button.dataset.id); closeMenus(); setStatus(t, button.dataset.status); },
  'toggle-done': (button) => { const t = taskById(button.dataset.id); setStatus(t, t.status === 'done' ? 'todo' : 'done'); },
  'task-field': (field) => {
    const t = taskById(field.dataset.id);
    if (field.name === 'status') { setStatus(t, field.value); return; }
    if (field.name === 'due' && !field.value) { field.value = t.due; return; }
    t[field.name] = field.value;
    save();
    router.render({ keepScroll: true });
    refreshDrawer();
    toast(field.name === 'assignee' ? `Assigned to ${people[field.value].name}.` : field.name === 'priority' ? `Priority set to ${field.value}.` : 'Due date updated.');
  },
  'check-item': (box) => {
    const t = taskById(box.dataset.id);
    const c = t.checklist.find((x) => x.id === box.dataset.item);
    c.done = box.checked;
    save();
    router.render({ keepScroll: true });
    refreshDrawer();
  },
  'remove-item': (button) => {
    const t = taskById(button.dataset.id);
    t.checklist = t.checklist.filter((x) => x.id !== button.dataset.item);
    save();
    router.render({ keepScroll: true });
    refreshDrawer();
  },
  'add-item': (form) => {
    const text = form.elements.text.value.trim();
    if (!text) { form.elements.text.focus(); return; }
    const t = taskById(form.dataset.id);
    state.nextId += 1;
    t.checklist.push({ id: `c${state.nextId}`, text, done: false });
    save();
    router.render({ keepScroll: true });
    refreshDrawer();
    drawer?.dialog.querySelector('#new-item')?.focus();
  },
  'add-comment': (form) => {
    if (!validate(form)) return;
    const t = taskById(form.dataset.id);
    state.nextId += 1;
    t.comments.push({ id: `m${state.nextId}`, by: 'alex', text: form.elements.text.value.trim(), at: Date.now() });
    log('commented on', t);
    save();
    router.render({ keepScroll: true });
    refreshDrawer();
    const body = drawer?.dialog.querySelector('.drawer-body');
    if (body) body.scrollTop = body.scrollHeight;
  },
  'delete-task': async (button) => {
    const t = taskById(button.dataset.id);
    const ok = await confirmDialog({ title: `Delete ${t.key}?`, message: `“${t.title}” and its checklist and comments will be removed.`, confirm: 'Delete task', danger: true });
    if (!ok) return;
    state.tasks = state.tasks.filter((x) => x.id !== t.id);
    log('deleted', { title: t.title });
    save();
    drawer?.close();
    router.render({ keepScroll: true });
    toast(`Deleted ${t.key}.`);
  },
  search: (form) => {
    const q = form.elements.q.value.trim();
    setTaskQuery({ q, status: q ? 'all' : '' });
  },
  'task-search': (input) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => setTaskQuery({ q: input.value.trim() }, { replace: true }), 180);
  },
  'task-filter': (select) => setTaskQuery({ [select.name]: select.value }),
  upload: (input) => { addFiles(input.files); input.value = ''; },
  'delete-file': async (button) => {
    const f = state.files.find((x) => x.id === button.dataset.id);
    const ok = await confirmDialog({ title: 'Delete this file?', message: `${f.name} will be removed for everyone on the project.`, confirm: 'Delete file', danger: true });
    if (!ok) return;
    state.files = state.files.filter((x) => x.id !== f.id);
    save();
    router.render({ keepScroll: true });
    toast(`Deleted ${f.name}.`);
  },
  profile: (form) => {
    if (!validate(form)) return;
    const data = formData(form);
    state.profile = { ...state.profile, name: data.name.trim(), role: data.role.trim() || 'Team member', email: data.email.trim(), timezone: data.timezone };
    save();
    router.render({ keepScroll: true });
    toast('Profile saved.');
  },
  'notify-pref': (box) => {
    state.prefs.notify[box.name] = box.checked;
    save();
    toast(box.checked ? 'Notification turned on.' : 'Notification turned off.');
  },
  'theme-pref': (radio) => { state.prefs.theme = radio.value; save(); applyTheme(); },
  'theme-toggle': () => {
    state.prefs.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    save();
    applyTheme();
    if (location.hash.startsWith('#/settings')) router.render({ keepScroll: true });
  },
  notifications: (button, event) => { event.stopPropagation(); setNotifications(document.getElementById('notify-panel').hidden); },
  'mark-read': (button, event) => { event.stopPropagation(); state.notificationsRead = true; save(); renderNotifications(); },
  'reset-demo': async () => {
    const ok = await confirmDialog({ title: 'Reset the demo?', message: 'All projects, tasks, files and settings go back to the original sample data.', confirm: 'Reset demo data', danger: true });
    if (!ok) return;
    state = seed();
    save();
    applyTheme();
    router.render();
    toast('Demo data reset.');
  },
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.card-menu, .card-menu-btn')) closeMenus();
  if (!event.target.closest('.notify')) setNotifications(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenus();
    if (!document.getElementById('notify-panel').hidden) { setNotifications(false); document.getElementById('notify-btn').focus(); }
    if (document.body.classList.contains('sidebar-open')) setSidebar(false);
  }
  if (event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
  const el = document.activeElement;
  const typing = el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
  if (typing || document.querySelector('dialog[open]')) return;
  if (event.key === '/') { event.preventDefault(); document.getElementById('global-search').focus(); }
  if (event.key === 'n' || event.key === 'N') { event.preventDefault(); openNewTask(); }
});
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (state.prefs.theme === 'system') applyTheme(); }); } catch { /* older browsers */ }

