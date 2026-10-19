// HALE & WHITAKER — demo website for a fictional Birmingham, Alabama law firm.
const { esc, money, router: createRouter, validate, formData, toast, confirmDialog, reference, firstName, storage, actions, demoBar, formatDate, formatTime, dayKey, fromDayKey, addBusinessDays, inPreview } = Kit;
demoBar('Hale & Whitaker', 'law firm');

const PHONE = '(205) 555-0132';
const TEL = 'tel:+12055550132';
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

// ---------------------------------------------------------------- content

const contingency = {
  type: 'Contingency fee',
  rows: [['If resolved before a lawsuit is filed', '33⅓%'], ['If a lawsuit is filed', '40%']],
  note: 'No attorney’s fee unless we recover money for you.',
};

const areas = {
  'personal-injury': {
    name: 'Personal injury',
    matters: 'Car & truck accidents · Slip and fall · Wrongful death',
    summary: 'Hurt because someone else was careless? We take on the insurance company, build the evidence and pursue full compensation while you focus on getting well.',
    lead: 'An accident can take your health, your paycheck and your peace of mind in a single afternoon. We handle the claim from the first phone call to the final check, so you can put your energy into recovery.',
    handle: [
      ['Car accidents', 'Rear-end, intersection and highway collisions, including crashes with uninsured or underinsured drivers.'],
      ['Truck accidents', 'Tractor-trailer and commercial vehicle crashes, where federal safety rules and company records matter.'],
      ['Slip and fall', 'Injuries on unsafe property: wet floors, broken stairs, poor lighting and negligent security.'],
      ['Wrongful death', 'Compassionate, determined representation for families who lost someone because of another’s negligence.'],
      ['Motorcycle, bicycle & pedestrian', 'Riders and walkers hit by drivers who weren’t paying attention.'],
      ['Uninsured motorist claims', 'Claims against your own policy when the at-fault driver has little or no coverage.'],
    ],
    firstTitle: 'What to do first after a car accident',
    first: [
      ['Get medical care', 'Go to the ER, urgent care or your doctor, even if you feel all right. Some injuries take days to show, and a record from the start matters.'],
      ['Call the police', 'Ask for the report number and write down the officer’s name.'],
      ['Take photos', 'Vehicles, the scene, road conditions and your injuries. Keep taking photos as your injuries heal.'],
      ['Collect names and numbers', 'Get the other driver’s insurance details and contact information for any witnesses.'],
      ['Don’t give a recorded statement to the other insurer', 'The other driver’s insurance company may call quickly and sound friendly. Politely decline a recorded statement until you’ve talked with a lawyer.'],
      ['Keep every record', 'Medical bills, receipts, mileage to appointments and missed work. Don’t sign a release or cash a check before getting advice.'],
    ],
    callout: 'Alabama personal injury claims generally must be filed within two years of the injury, and some claims have shorter deadlines. This is general information, not legal advice. Talk with us about your own situation.',
    fee: contingency,
    faqs: [
      ['How much is my case worth?', 'It depends on your medical bills, lost income, how the injury affects your daily life and the insurance coverage available. We won’t guess in the first five minutes. Once we’ve reviewed your records, we’ll give you an honest range and explain how we got there.'],
      ['Should I talk to the other driver’s insurance adjuster?', 'You can give basic facts like your name and contact details, but we recommend declining a recorded statement and not discussing your injuries until you’ve spoken with a lawyer. Adjusters are trained to look for statements that reduce what they pay.'],
      ['What if I was partly at fault?', 'Alabama follows a strict rule called contributory negligence, which can bar recovery if the injured person is found even slightly at fault. There are exceptions, and fault is often less clear than insurers claim, which is why early evidence matters so much.'],
      ['How long will my case take?', 'Many claims resolve within several months after medical treatment ends. If a lawsuit is needed, it can take a year or more. We’ll give you a realistic timeline at the start and update you at every stage.'],
      ['Who pays my medical bills while the case is pending?', 'Usually your health insurance, MedPay coverage or the providers themselves wait to be paid from the settlement. We help sort out who pays what, and we negotiate liens so more of the recovery stays with you.'],
    ],
    attorneys: ['catherine-hale', 'daniel-reyes'],
  },
  'workers-compensation': {
    name: 'Workers’ compensation',
    matters: 'Denied claims · Job-site injuries · Settlements',
    summary: 'Injured on the job? We help you get the medical care and wage benefits Alabama law provides, and we step in when a claim is delayed or denied.',
    lead: 'When you’re hurt at work, the paperwork arrives faster than the paychecks. We make sure your injury is reported properly, your treatment is covered and any settlement reflects what the injury really costs you.',
    handle: [
      ['Denied or delayed claims', 'When the carrier says no, stops benefits or simply stops returning calls.'],
      ['Back, neck & shoulder injuries', 'Lifting injuries, falls and strains that make it hard to do the job you did before.'],
      ['Repetitive-motion injuries', 'Carpal tunnel, tendon and joint injuries that build up over months or years of work.'],
      ['Construction & warehouse injuries', 'Falls, equipment accidents and heavy-lifting injuries on job sites and loading docks.'],
      ['Doctor & treatment disputes', 'Getting the right specialist, the surgery your doctor recommends and the therapy you need.'],
      ['Settlements', 'Weighing a lump-sum offer against your future medical needs before you sign anything.'],
    ],
    firstTitle: 'What to do first after a work injury',
    first: [
      ['Report it right away', 'Tell your supervisor as soon as possible, in writing if you can, and keep a copy. Alabama has short deadlines for notifying your employer.'],
      ['Get medical treatment', 'Tell the doctor the injury happened at work so it’s recorded correctly from the first visit.'],
      ['Write down what happened', 'The date, time, place, what you were doing and who saw it, while it’s still fresh.'],
      ['Keep copies of everything', 'Accident reports, doctor’s notes, work restrictions and every letter from the insurance carrier.'],
      ['Be careful what you sign', 'Don’t sign a settlement, a release or give a recorded statement to the carrier before getting advice.'],
    ],
    callout: 'Workers’ compensation deadlines in Alabama can be short, starting with notice to your employer. This is general information, not legal advice. Call us if you’re unsure whether a deadline applies to you.',
    fee: contingency,
    faqs: [
      ['Can I be fired for filing a workers’ comp claim?', 'Alabama law protects employees from being fired solely because they filed a workers’ compensation claim. If you were let go after reporting an injury, tell us. It may be a separate claim.'],
      ['Can I choose my own doctor?', 'In Alabama the employer usually chooses the first treating doctor. If you’re unhappy with that doctor, you may be able to ask for a panel of alternatives. We’ll explain your options.'],
      ['My claim was denied. Is it over?', 'Not necessarily. Many denials come down to missing paperwork, a disputed report or a question about how the injury happened. We look at why it was denied and what evidence could change the answer.'],
      ['What benefits can I receive?', 'Generally, medical treatment for the injury, a portion of your wages while you can’t work, and compensation for lasting impairment. The details depend on your injury and your earnings.'],
      ['¿Hablan español?', 'Sí. Daniel Reyes speaks Spanish and can meet with you and your family in Spanish, in person, by phone or by video.'],
    ],
    attorneys: ['daniel-reyes'],
  },
  'family-law': {
    name: 'Family law',
    matters: 'Divorce · Custody · Child support',
    summary: 'Divorce and custody decisions shape the years ahead. We help you protect your children, your finances and your peace, with as little conflict as the situation allows.',
    lead: 'Family matters are personal, and they’re rarely simple. We listen first, explain your options in plain English and help you make clear decisions, whether that happens around a mediation table or in a courtroom.',
    handle: [
      ['Uncontested divorce', 'When you and your spouse agree on the terms, we prepare the paperwork and see it through for a flat fee.'],
      ['Contested divorce', 'Careful preparation and firm advocacy on property, debt, alimony and parenting time.'],
      ['Child custody & visitation', 'Parenting plans built around your children’s schooling, routines and relationships.'],
      ['Child support', 'Establishing support under Alabama’s guidelines, and enforcing orders that aren’t being paid.'],
      ['Modifications', 'Updating custody or support orders after a move, a new job or a change in a child’s needs.'],
      ['Mediation & agreements', 'Settlement agreements that keep decisions in your hands instead of a judge’s.'],
    ],
    firstTitle: 'What to do first if you’re considering divorce',
    first: [
      ['Keep routines steady', 'Children do best when school, bedtimes and activities stay as normal as possible.'],
      ['Gather financial records', 'Recent tax returns, pay stubs, bank and retirement statements, and a list of debts.'],
      ['Get advice before moving out', 'Moving out of the home, or moving with the children, can affect custody and property. Talk to us first.'],
      ['Communicate carefully', 'Keep messages with your spouse civil, and assume a judge may one day read texts, emails and social media posts.'],
      ['Leave accounts alone', 'Don’t empty accounts, move money or run up shared credit cards.'],
    ],
    callout: 'Every family is different, and the right approach depends on your children, your finances and your goals. This is general information, not legal advice.',
    fee: {
      type: 'Flat & hourly fees',
      rows: [['Uncontested divorce', '$1,500 flat'], ['Other family law matters', 'Hourly, quoted at consultation']],
      note: 'Hourly matters are quoted at your free consultation, before any work begins.',
    },
    faqs: [
      ['What makes a divorce “uncontested”?', 'Both spouses agree on everything: property, debts and, if there are children, custody, visitation and support. If you agree on most things but not all, we can often help you get the rest of the way there.'],
      ['How is custody decided in Alabama?', 'Courts decide custody based on the best interests of the child, looking at each parent’s involvement, stability and the child’s needs, among other things. Many parents reach their own agreement, which the court then approves.'],
      ['How is child support calculated?', 'Alabama uses child support guidelines based on both parents’ incomes, the number of children and costs like health insurance and childcare. We run the numbers with you at the start.'],
      ['Will I have to go to court?', 'Not always. Uncontested divorces and many custody agreements are resolved with little or no time in a courtroom. If your case does go before a judge, we’ll prepare you thoroughly.'],
    ],
    attorneys: ['amara-okafor'],
  },
  'estate-planning': {
    name: 'Estate planning & probate',
    matters: 'Wills · Trusts · Powers of attorney · Probate',
    summary: 'A thoughtful plan protects the people you love. We draft wills, trusts and powers of attorney, and guide families through probate after a loss.',
    lead: 'A good estate plan is a kindness to your family: fewer decisions in a hard season, and your wishes carried out as you intended. When a loved one has passed, we guide executors through probate step by step.',
    handle: [
      ['Wills', 'Clear instructions for your property and, for parents, who should care for minor children.'],
      ['Revocable living trusts', 'Keep assets out of probate, plan for incapacity and keep family matters private.'],
      ['Powers of attorney', 'Choose who can handle your finances and health care decisions if you can’t.'],
      ['Advance health care directives', 'Put your wishes about medical care in writing, so your family doesn’t have to guess.'],
      ['Probate administration', 'Guidance for executors and families, from opening the estate to final distribution.'],
      ['Plan reviews & updates', 'A fresh look after a marriage, divorce, new grandchild, move or sale of a business.'],
    ],
    firstTitle: 'What to do first after a loved one passes',
    first: [
      ['Find the original will', 'Look in desks, safes and files, and ask whether a lawyer kept the original. Copies help, but the original matters.'],
      ['Secure the home and valuables', 'Lock up the house, collect the mail and keep vehicles and valuables safe.'],
      ['Order death certificates', 'Ask the funeral home for several certified copies; banks and agencies will each want one.'],
      ['Wait before distributing property', 'Don’t hand out belongings, sell property or pay debts from the estate until you understand your duties.'],
      ['Gather the paperwork', 'Recent bank statements, deeds, life insurance and retirement account information, and any bills.'],
    ],
    callout: 'Whether an estate needs probate, and what kind, depends on how assets are titled and whether there is a valid will. This is general information, not legal advice.',
    fee: {
      type: 'Flat fees',
      rows: [['Will package', '$650'], ['Revocable trust package', '$2,400'], ['Probate administration', 'Quoted at consultation']],
      note: 'Flat fees are agreed in writing before we begin, so there are no surprise invoices.',
    },
    faqs: [
      ['Do I need a trust, or is a will enough?', 'For many families a will and powers of attorney are enough. A revocable trust can make sense if you own property in more than one state, want to avoid probate, value privacy or have a blended family. We’ll tell you honestly which fits.'],
      ['What happens if someone dies without a will in Alabama?', 'Alabama law decides who inherits, based on family relationships, and the court appoints someone to manage the estate. The result may not match what the person would have wanted, which is one of the best reasons to plan.'],
      ['How long does probate take?', 'A straightforward estate often takes several months to a year. Disputes, property in several places or unpaid taxes can lengthen it. We’ll map out the steps and timeline at the start.'],
      ['Can you help if a parent can no longer manage their affairs?', 'Yes. If there’s a valid power of attorney, we help the agent use it properly. If there isn’t, we explain the court options and walk you through them.'],
    ],
    attorneys: ['thomas-whitaker'],
  },
};

const attorneys = {
  'catherine-hale': {
    name: 'Catherine Hale', first: 'Catherine', title: 'Founding Partner', image: 'attorney-hale',
    areas: ['personal-injury'], role: 'Personal injury',
    short: 'Catherine founded the firm in 1998 and has spent more than 25 years representing people hurt in car and truck crashes, and families who have lost someone they love.',
    quote: 'Insurance companies prepare every claim as if it could go to trial. So do we.',
    bio: [
      'Catherine Hale founded the firm in 1998 with a simple idea: injured people deserve a lawyer who returns their calls, explains the plan and prepares every case as if it will be tried in front of a jury.',
      'For more than 25 years she has represented people hurt in car and tractor-trailer crashes and on unsafe property, and families who have lost a loved one. She is known for thorough preparation, careful work with medical experts and plain talk with clients about what their case is really worth.',
      'Catherine leads the firm’s personal injury practice and works closely with Daniel Reyes on complex injury and workers’ compensation matters. Outside the office she volunteers with an adult literacy program and spends fall Saturdays at college football games.',
    ],
    focus: ['Car and truck accidents', 'Wrongful death', 'Catastrophic and spinal injuries', 'Premises liability'],
    education: ['Juris Doctor', 'Bachelor of Arts, English'],
    admissions: ['Admitted to practice in Alabama', 'Admitted to practice in the federal district courts of Alabama'],
    languages: ['English'],
    years: '25+ years in practice',
  },
  'thomas-whitaker': {
    name: 'Thomas Whitaker', first: 'Thomas', title: 'Founding Partner', image: 'attorney-whitaker',
    areas: ['estate-planning'], role: 'Estate planning & probate',
    short: 'Thomas co-founded the firm and leads its estate planning and probate practice, helping families plan ahead and settle estates with care.',
    quote: 'A good plan is the last kind thing you do for your family. It should be clear enough that no one has to guess.',
    bio: [
      'Thomas Whitaker joined Catherine Hale in founding the firm in 1998 and has built its estate planning and probate practice ever since. His clients range from young parents writing their first wills to business owners planning a succession and families settling a parent’s estate.',
      'Thomas believes a plan is only useful if the family understands it. He is known for turning dense documents into one-page summaries, for patient signing meetings and for keeping executors calm and organized through probate.',
      'He speaks often to community and church groups about wills, powers of attorney and planning for aging parents, and he still answers his own phone more often than not.',
    ],
    focus: ['Wills and will packages', 'Revocable living trusts', 'Powers of attorney and health care directives', 'Probate and estate administration'],
    education: ['Juris Doctor', 'Master of Laws (LL.M.) in Taxation', 'Bachelor of Science, Accounting'],
    admissions: ['Admitted to practice in Alabama'],
    languages: ['English'],
    years: 'LL.M. in Taxation',
  },
  'amara-okafor': {
    name: 'Amara Okafor', first: 'Amara', title: 'Partner', image: 'attorney-okafor',
    areas: ['family-law'], role: 'Family law',
    short: 'Amara leads the family law practice, guiding clients through divorce, custody and child support with steady judgment and a clear eye on what matters most.',
    quote: 'Most families don’t need a war. They need a plan, a fair agreement and someone steady in their corner.',
    bio: [
      'Amara Okafor leads the firm’s family law practice. She represents clients in uncontested and contested divorces, custody and visitation disputes, child support and modifications.',
      'Amara is trained in mediation and believes the best outcomes usually come from agreements both sides can live with. When a case can’t settle, she prepares carefully and advocates firmly in court. Clients describe her as calm, direct and always prepared.',
      'Before joining the firm she represented parents in custody matters through a legal aid program, an experience that still shapes how she listens. She became a partner after years of building the practice alongside the firm’s founders.',
    ],
    focus: ['Uncontested and contested divorce', 'Child custody and parenting plans', 'Child support and modifications', 'Mediation and settlement agreements'],
    education: ['Juris Doctor', 'Bachelor of Arts, Psychology', 'Family mediation training'],
    admissions: ['Admitted to practice in Alabama'],
    languages: ['English'],
    years: 'Trained mediator',
  },
  'daniel-reyes': {
    name: 'Daniel Reyes', first: 'Daniel', title: 'Associate', image: 'attorney-reyes',
    areas: ['workers-compensation', 'personal-injury'], role: 'Workers’ compensation & personal injury',
    short: 'Daniel represents injured workers and accident victims, and meets with clients and their families in English or Spanish.',
    quote: 'Nobody should sign something they don’t understand. I explain every page, in English or in Spanish.',
    bio: [
      'Daniel Reyes represents people injured on the job and in accidents. He handles workers’ compensation claims from the first report to settlement, and works alongside Catherine Hale on personal injury cases.',
      'Daniel grew up in Birmingham translating for his parents at doctors’ offices and government counters, which is why he makes sure every client understands every document before signing it. He meets with clients and their families in English or Spanish.',
      'He has particular experience with warehouse, construction and manufacturing injuries, denied claims and disputes over medical treatment.',
    ],
    focus: ['Workers’ compensation claims', 'Denied and delayed claims', 'Car accidents', 'Spanish-language consultations'],
    education: ['Juris Doctor', 'Bachelor of Arts, Political Science'],
    admissions: ['Admitted to practice in Alabama'],
    languages: ['English', 'Spanish'],
    years: 'Hablo español',
  },
};

// Sample results: fictional, written for this demo.
const results = [
  { area: 'personal-injury', amount: '$2.1M', full: '$2,100,000', kind: 'Jury verdict', title: 'Wrongful death, distracted driver', text: 'A father of three was killed when a driver texting behind the wheel ran a red light. The insurer’s final offer before trial was $400,000.', attorney: 'catherine-hale' },
  { area: 'personal-injury', amount: '$1.25M', full: '$1,250,000', kind: 'Settlement', title: 'Tractor-trailer collision on the interstate', text: 'A delivery driver suffered spinal injuries when a fatigued truck driver drifted across lanes. Driver logs showed hours-of-service violations.', attorney: 'catherine-hale' },
  { area: 'workers-compensation', amount: '$310K', full: '$310,000', kind: 'Settlement', title: 'Warehouse back injury', text: 'A forklift operator needed spinal fusion surgery after a lifting injury. The settlement set money aside for future medical care.', attorney: 'daniel-reyes' },
  { area: 'personal-injury', amount: '$475K', full: '$475,000', kind: 'Settlement', title: 'Rear-end collision, shoulder surgery', text: 'A teacher needed surgery and months of therapy after being struck at a stoplight. Resolved before a lawsuit was filed.', attorney: 'daniel-reyes' },
  { area: 'personal-injury', amount: '$180K', full: '$180,000', kind: 'Settlement', title: 'Slip and fall at a grocery store', text: 'A retiree broke her wrist on an unmarked wet floor. Store video showed the spill had been reported 40 minutes earlier.', attorney: 'catherine-hale' },
  { area: 'personal-injury', amount: '$92.5K', full: '$92,500', kind: 'Settlement', title: 'Intersection crash, disputed fault', text: 'The other driver’s insurer first offered $11,000 and blamed our client. Witness statements and scene photos changed the conversation.', attorney: 'daniel-reyes' },
  { area: 'workers-compensation', amount: 'Reinstated', full: 'Benefits reinstated', kind: 'Outcome', title: 'Denied claim reversed', text: 'A roofer’s claim was denied as “not work-related.” After we gathered crew statements and medical records, weekly benefits and surgery were approved.', attorney: 'daniel-reyes' },
  { area: 'workers-compensation', amount: '$146K', full: '$146,000', kind: 'Settlement', title: 'Repetitive lifting injury', text: 'A nursing assistant developed a shoulder injury from years of patient transfers. Resolved after the carrier disputed her doctor’s findings.', attorney: 'daniel-reyes' },
  { area: 'family-law', amount: 'Custody', full: 'Primary physical custody', kind: 'Outcome', title: 'Custody after a job relocation', text: 'A father relocating within Alabama for work was awarded primary physical custody, with a detailed long-distance parenting plan for the mother.', attorney: 'amara-okafor' },
  { area: 'family-law', amount: 'Settled', full: 'Settled in mediation', kind: 'Outcome', title: 'Divorce resolved without trial', text: 'A 22-year marriage with a family business and two retirement accounts was resolved in a single day of mediation.', attorney: 'amara-okafor' },
  { area: 'family-law', amount: 'Modified', full: 'Child support modified', kind: 'Outcome', title: 'Support adjusted after a layoff', text: 'A mother’s support obligation was modified after a plant closure, avoiding arrears she had no way to pay.', attorney: 'amara-okafor' },
  { area: 'estate-planning', amount: '7 months', full: 'Estate closed in 7 months', kind: 'Outcome', title: 'Probate across two counties', text: 'An estate with property in Jefferson and Shelby counties was administered and closed without a single dispute among five siblings.', attorney: 'thomas-whitaker' },
  { area: 'estate-planning', amount: 'No probate', full: 'Probate avoided', kind: 'Outcome', title: 'Family land kept out of probate', text: 'A revocable trust drafted years earlier let a family farm pass to the next generation privately, without a court proceeding.', attorney: 'thomas-whitaker' },
];

const testimonials = [
  { quote: 'Catherine called me back the same afternoon. For the first time since the wreck, I felt like someone had a plan.', name: 'Renee T.', matter: 'Car accident client' },
  { quote: 'Daniel explained everything in Spanish to my mother and me. We never felt rushed, and we always knew what came next.', name: 'Luis G.', matter: 'Workers’ compensation client' },
  { quote: 'Amara kept my divorce about my kids, not about winning. I’m grateful for how calm she stayed.', name: 'Jessica P.', matter: 'Family law client' },
  { quote: 'Thomas turned a stack of papers into a one-page plan my children actually understand.', name: 'Harold W.', matter: 'Estate planning client' },
];

const promises = [
  ['You’ll talk to a lawyer.', 'Your consultation is with an attorney who handles cases like yours, not a salesperson or a call center.'],
  ['We return calls within one business day.', 'Usually sooner. If your attorney is in court, you’ll hear from their paralegal the same day.'],
  ['You’ll always know what happens next.', 'Every client gets a written plan and plain-English updates at each stage, without having to chase us.'],
  ['No fee unless we recover.', 'In injury and workers’ compensation cases, you pay no attorney’s fee unless we recover money for you.'],
  ['We’ll tell you the truth.', 'Even when it isn’t what you hoped to hear. If we can’t help, we’ll say so and try to point you to someone who can.'],
];

const processSteps = [
  ['Free consultation', 'Thirty minutes in our office, by phone or by video. Tell us what happened and ask anything.'],
  ['A clear plan', 'We explain your options, the likely timeline and the fee in writing before any work begins.'],
  ['We do the work', 'Evidence, records, paperwork and every call with the insurance company or the other side.'],
  ['Negotiation', 'We push for a fair resolution and bring every offer to you with our honest recommendation.'],
  ['Resolution', 'Most matters settle. If yours needs a courtroom, we’re prepared to take it there.'],
];

const formats = {
  office: { name: 'In office', text: 'At our downtown office, Suite 400.', icon: '<path d="M4 21h16M6 21V5l6-2 6 2v16M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/>' },
  phone: { name: 'Phone call', text: 'We call you at your chosen time.', icon: '<path d="M6.5 3h3l1.5 4.5-2 1.5a11 11 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A17 17 0 0 1 4.5 5a2 2 0 0 1 2-2Z"/>' },
  video: { name: 'Video call', text: 'Secure link emailed the day before.', icon: '<rect x="3" y="6" width="13" height="12" rx="1"/><path d="m16 10 5-3v10l-5-3"/>' },
};

const OPTS = {
  kind: [['car', 'Car accident'], ['truck', 'Truck or 18-wheeler'], ['motorcycle', 'Motorcycle'], ['pedestrian', 'Pedestrian or bicycle'], ['slip', 'Slip and fall'], ['death', 'Wrongful death'], ['other', 'Something else']],
  yesno: [['yes', 'Yes'], ['no', 'No']],
  insurance: [['other', 'Yes, the other side’s insurer'], ['mine', 'Yes, my own insurer'], ['both', 'Both have contacted me'], ['none', 'No one yet']],
  reported: [['writing', 'Yes, in writing'], ['verbal', 'Yes, verbally'], ['not-yet', 'Not yet'], ['unsure', 'I’m not sure']],
  matter: [['uncontested', 'Uncontested divorce'], ['contested', 'Contested divorce'], ['custody', 'Custody or visitation'], ['support', 'Child support'], ['modification', 'Changing an existing order'], ['other', 'Something else']],
  need: [['will', 'A will'], ['trust', 'A revocable trust'], ['poa', 'Powers of attorney or a health care directive'], ['probate', 'Probate for a loved one’s estate'], ['unsure', 'I’m not sure yet']],
  forWhom: [['me', 'Myself'], ['couple', 'My spouse and me'], ['parent', 'A parent or family member'], ['estate', 'The estate of someone who has passed']],
  method: [['phone', 'Phone call'], ['text', 'Text message'], ['email', 'Email']],
  time: [['morning', 'Morning', '8:30 AM – noon'], ['afternoon', 'Afternoon', 'Noon – 5:30 PM'], ['anytime', 'Anytime', 'During office hours']],
};
const COUNTIES = ['Jefferson', 'Shelby', 'St. Clair', 'Blount', 'Walker', 'Tuscaloosa', 'Another Alabama county', 'Outside Alabama'];
const REQUIRED = { 'personal-injury': ['date', 'kind', 'injured', 'treatment', 'insurance'], 'workers-compensation': ['employer', 'date', 'reported'], 'family-law': ['matter', 'children', 'county'], 'estate-planning': ['need', 'forWhom'] };
const DETAIL_ROWS = {
  'personal-injury': [['date', 'Date of incident', 'date'], ['kind', 'Type of accident', 'kind'], ['injured', 'Anyone injured', 'yesno'], ['treatment', 'Medical treatment', 'yesno'], ['insurance', 'Insurance contact', 'insurance'], ['summary', 'What happened']],
  'workers-compensation': [['employer', 'Employer'], ['date', 'Date of injury', 'date'], ['reported', 'Reported to employer', 'reported'], ['summary', 'What happened']],
  'family-law': [['matter', 'Type of matter', 'matter'], ['children', 'Children under 19', 'yesno'], ['county', 'County'], ['summary', 'Your situation']],
  'estate-planning': [['need', 'Needs help with', 'need'], ['forWhom', 'For', 'forWhom'], ['summary', 'Notes']],
};
const BRING = {
  'personal-injury': 'the police report number, photos, medical bills and any letters from insurance companies',
  'workers-compensation': 'your injury report, doctor’s notes, recent pay stubs and any letters from the carrier',
  'family-law': 'a recent tax return, pay stubs and any existing court orders',
  'estate-planning': 'a list of your assets and any existing wills, trusts or beneficiary forms (for probate, the will and death certificate)',
};

// Contingency calculator: example case costs, for illustration only.
const EXAMPLE_COSTS = {
  pre: [['Medical records and bills', 240], ['Police report and photographs', 35], ['Postage, copies and courier', 75]],
  suit: [['Court filing and service fees', 420], ['Medical records and bills', 240], ['Depositions and transcripts', 1650], ['Expert review', 2500], ['Postage, copies and courier', 190]],
};

// ---------------------------------------------------------------- state & helpers

const state = Object.assign({ draft: null, evaluations: [], messages: [], profile: {}, calc: { amount: 100000, stage: 'pre' } }, storage.get('hale-state', {}) || {});
if (!Array.isArray(state.evaluations)) state.evaluations = [];
if (!Array.isArray(state.messages)) state.messages = [];
const save = () => storage.set('hale-state', state);

const portraits = new Set(['attorney-hale', 'attorney-whitaker', 'attorney-okafor', 'attorney-reyes']);
const img = (name, alt, { eager = false, sizes = '(max-width: 900px) 100vw, 50vw' } = {}) => {
  const [w, h, sm] = portraits.has(name) ? [1024, 1536, 512] : [1536, 1024, 768];
  return `<img src="img/${name}.webp" srcset="img/${name}-sm.webp ${sm}w, img/${name}.webp ${w}w" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
};
// Keep the layout clean if a photo is missing (the background colour of its frame shows instead).
document.addEventListener('error', (event) => { if (event.target.tagName === 'IMG') event.target.classList.add('img-missing'); }, true);

const hash = (text) => { let h = 2166136261; for (const ch of text) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); };
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const longDate = (d, year = false) => formatDate(d, { weekday: 'long', month: 'long', day: 'numeric', ...(year ? { year: 'numeric' } : {}) });
const shortDate = (d) => formatDate(d, { weekday: 'short', month: 'short', day: 'numeric' });
const plainDate = (d) => formatDate(d, { month: 'long', day: 'numeric', year: 'numeric' });
const optLabel = (key, value) => (OPTS[key].find((o) => o[0] === value) || [value, value])[1];
const isDayKey = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '');

const label = (num, text, cls = '') => `<p class="label ${cls}">${num ? `<span class="label-num">${num}</span>` : ''}<span class="label-line" aria-hidden="true"></span><span>${text}</span></p>`;
const pageHead = ({ kicker, title, lead = '', extra = '', cls = '' }) => `
  <section class="page-head ${cls}"><div class="wrap">
    ${label('', kicker)}
    <h1>${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}${extra}
  </div></section>`;
const feeSummary = (slug) => ({
  'personal-injury': 'Contingency: 33⅓% before suit, 40% after. No fee unless we recover.',
  'workers-compensation': 'Contingency: 33⅓% before suit, 40% after. No fee unless we recover.',
  'family-law': 'Uncontested divorce $1,500 flat. Other matters hourly, quoted up front.',
  'estate-planning': 'Will package $650. Revocable trust package $2,400.',
}[slug]);
const note = (html, tone = '') => `<div class="note ${tone ? `note-${tone}` : ''}">${html}</div>`;

// Consultation slots: the next ten weekdays, 9 AM to 5 PM in 30-minute slots, some already taken.
const SLOT_TIMES = Array.from({ length: 16 }, (_, i) => [9 + Math.floor(i / 2), i % 2 ? 30 : 0]);
const consultDays = () => Array.from({ length: 10 }, (_, i) => addBusinessDays(today0(), i + 1));
const slotKey = (day, h, m) => `${dayKey(day)}T${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}`;
const isSlotKey = (key) => /^\d{4}-\d{2}-\d{2}T\d{4}$/.test(key || '');
const slotDate = (key) => { const [d, t] = key.split('T'); const date = fromDayKey(d); date.setHours(Number(t.slice(0, 2)), Number(t.slice(2)), 0, 0); return date; };
const bookedByMe = (key, ownKey) => key !== ownKey && state.evaluations.some((e) => e.status === 'scheduled' && e.slot === key);
const takenByOthers = (key) => hash(`hw-${key}`) % 100 < 30;
const slotAvailable = (key, ownKey = null) => isSlotKey(key) && slotDate(key) > new Date() && !takenByOthers(key) && !bookedByMe(key, ownKey)
  && consultDays().some((d) => dayKey(d) === key.slice(0, 10));
const slotsFor = (day, ownKey) => SLOT_TIMES.map(([h, m]) => {
  const key = slotKey(day, h, m);
  return { key, start: slotDate(key), taken: takenByOthers(key) || bookedByMe(key, ownKey), current: key === ownKey };
});
const timeRange = (start) => `${formatTime(start)} – ${formatTime(new Date(start.getTime() + 30 * 60000))}`;

const nextConsult = () => state.evaluations
  .filter((e) => e.status === 'scheduled' && isSlotKey(e.slot) && slotDate(e.slot) > new Date())
  .sort((a, b) => slotDate(a.slot) - slotDate(b.slot))[0];

const consultBanner = (ev) => {
  const start = slotDate(ev.slot);
  return `<div class="consult-banner" role="status"><div class="wrap"><p><span class="cb-label">Your consultation</span><span>${esc(longDate(start))} at ${formatTime(start)} · ${formats[ev.format]?.name || 'Consultation'}</span></p><a class="ulink" href="#/evaluation/${esc(ev.ref)}">View or reschedule</a></div></div>`;
};

// ---------------------------------------------------------------- shared blocks

const attorneyCard = (slug, a) => `
  <li class="atty-card reveal"><a href="#/attorneys/${slug}">
    <span class="atty-photo">${img(a.image, `Portrait of ${a.name}, ${a.title.toLowerCase()}`, { sizes: '(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 300px' })}</span>
    <span class="atty-meta"><span class="atty-title">${a.title}</span><strong>${a.name}</strong><span class="atty-role">${a.role}</span></span>
  </a></li>`;

const ctaBand = (title = 'Talk with an attorney <em>this week.</em>', text = 'Your first consultation is free, lasts 30 minutes and carries no obligation. Meet in our office, by phone or by video.') => `
  <section class="cta-band"><div class="wrap cta-inner">
    <div class="cta-copy"><h2>${title}</h2><p>${text}</p></div>
    <div class="cta-actions"><a class="btn btn-brass" href="#/evaluate">Free case evaluation</a><a class="cta-phone" href="${TEL}"><small>Or call</small>${PHONE}</a></div>
  </div></section>`;

const relatedAttorney = (slug) => {
  const a = attorneys[slug];
  return `
  <div class="side-card atty-mini">
    <a class="atty-mini-photo" href="#/attorneys/${slug}" tabindex="-1" aria-hidden="true">${img(a.image, '', { sizes: '120px' })}</a>
    <div>
      <p class="side-label">${a.title}</p>
      <h2 class="h-sm"><a href="#/attorneys/${slug}">${a.name}</a></h2>
      <p class="atty-mini-role">${a.role}</p>
      <a class="ulink" href="#/evaluate?attorney=${slug}">Book with ${a.first}</a>
    </div>
  </div>`;
};

// ---------------------------------------------------------------- views

function home() {
  const next = nextConsult();
  return {
    title: 'Hale & Whitaker — Attorneys at Law in Birmingham, Alabama',
    html: `
    <section class="hero">
      <div class="hero-media">${img('hero', 'A quiet conference room at Hale & Whitaker with a long wooden table and leather chairs', { eager: true, sizes: '100vw' })}</div>
      <div class="wrap hero-inner">
        <div class="hero-copy">
          <p class="hero-kicker">Attorneys at Law · Birmingham, Alabama · Since 1998</p>
          <h1>Steady counsel for <em>life’s hardest days.</em></h1>
          <p class="hero-lead">Injury, workers’ compensation, family and estate matters, handled by attorneys who return your calls and explain every step in plain English.</p>
          <div class="hero-actions">
            <a class="btn btn-brass" href="#/evaluate">Free case evaluation</a>
            <a class="hero-phone" href="${TEL}"><small>Or call us today</small><strong>${PHONE}</strong></a>
          </div>
          <p class="hero-note">Free 30-minute consultation · In office, by phone or video · Se habla español</p>
        </div>
      </div>
    </section>
    ${next ? consultBanner(next) : ''}
    <section class="facts-strip" aria-label="At a glance">
      <div class="wrap facts-grid">
        <div><strong>1998</strong><span>Founded in downtown Birmingham</span></div>
        <div><strong>30 min</strong><span>Free first consultation, with no obligation</span></div>
        <div><strong>$0</strong><span>Attorney’s fee unless we recover, in injury and workers’ comp cases</span></div>
        <div><strong>4</strong><span>Attorneys, one team, English and Spanish</span></div>
      </div>
    </section>

    <section class="section">
      <div class="wrap split">
        <div class="split-head reveal">
          ${label('I', 'Practice areas')}
          <h2>Four areas of law. <em>One standard of care.</em></h2>
          <p class="lead">We keep our practice focused, so you work with an attorney who handles matters like yours every week.</p>
          <a class="ulink" href="#/practice">All practice areas</a>
        </div>
        <ol class="area-list">
          ${Object.entries(areas).map(([slug, a], i) => `
            <li class="reveal"><a class="area-row" href="#/practice/${slug}">
              <span class="area-num">0${i + 1}</span>
              <span class="area-body"><strong>${a.name}</strong><span class="area-matters">${a.matters}</span><span class="area-summary">${a.summary}</span></span>
              <span class="area-arrow" aria-hidden="true">→</span>
            </a></li>`).join('')}
        </ol>
      </div>
    </section>

    <section class="section section-sage">
      <div class="wrap promise-grid">
        <figure class="framed reveal">${img('desk-detail', 'A fountain pen resting on a legal pad beside case files on a leather-topped desk')}</figure>
        <div>
          ${label('II', 'Why clients choose us')}
          <h2>Plain-English <em>promises.</em></h2>
          <ol class="promises">${promises.map(([t, p]) => `<li class="reveal"><strong>${t}</strong><p>${p}</p></li>`).join('')}</ol>
        </div>
      </div>
    </section>

    <section class="section quote-section">
      <div class="wrap">
        <figure class="pullquote reveal">
          <blockquote><p>The law is complicated. Talking to your lawyer <em>shouldn’t be.</em></p></blockquote>
          <figcaption><strong>Catherine Hale</strong><span>Founding Partner</span></figcaption>
        </figure>
      </div>
    </section>

    <section class="section section-paper">
      <div class="wrap">
        <div class="section-head reveal">
          ${label('III', 'How a case works')}
          <h2>From the first call <em>to the final word.</em></h2>
          <p class="lead">Every matter is different, but the rhythm is the same: listen, plan, do the work, and keep you informed at every turn.</p>
        </div>
        <ol class="timeline">${processSteps.map(([t, p], i) => `<li class="reveal"><span class="t-num">${ROMAN[i]}</span><h3>${t}</h3><p>${p}</p></li>`).join('')}</ol>
      </div>
    </section>

    <section class="band-forest">
      <div class="wrap">
        <div class="band-head">
          <div>${label('IV', 'Sample results', 'on-dark')}<h2>Outcomes that <em>changed what came next.</em></h2></div>
          <a class="ulink on-dark" href="#/results">See all sample results</a>
        </div>
        <ul class="result-strip">${results.slice(0, 4).map((r) => `<li class="reveal"><strong>${r.amount}</strong><span class="r-kind">${r.kind} · ${areas[r.area].name}</span><p>${r.title}</p></li>`).join('')}</ul>
        <p class="band-disclaimer"><strong>Past results do not guarantee a similar outcome.</strong> Results shown are fictional samples written for this demo; every case depends on its own facts.</p>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head row reveal">
          <div>${label('V', 'The attorneys')}<h2>The people <em>in your corner.</em></h2></div>
          <a class="ulink" href="#/attorneys">Meet the attorneys</a>
        </div>
        <ul class="atty-grid">${Object.entries(attorneys).map(([slug, a]) => attorneyCard(slug, a)).join('')}</ul>
      </div>
    </section>

    <section class="section section-sage">
      <div class="wrap">
        <div class="section-head center reveal">${label('VI', 'Client words')}<h2>In their <em>own words.</em></h2></div>
        <div class="testimonials">
          ${testimonials.map((t, i) => `
            <figure class="testimonial ${i === 0 ? 'is-lead' : ''} reveal">
              <blockquote><p>${t.quote}</p></blockquote>
              <figcaption><strong>${t.name}</strong><span>${t.matter}</span></figcaption>
              <p class="sample-tag">Sample testimonial · fictional</p>
            </figure>`).join('')}
        </div>
      </div>
    </section>

    <section class="section closing">
      <div class="wrap closing-grid">
        <div class="closing-media reveal">${img('consultation', 'An attorney listening closely to a client across a desk during a consultation')}</div>
        <div class="closing-copy reveal">
          ${label('VII', 'Free case evaluation')}
          <h2>Tell us what happened. <em>We’ll tell you where you stand.</em></h2>
          <p>Answer a few questions online and choose a time for your free 30-minute consultation. It takes about four minutes, and there’s no obligation.</p>
          <div class="btn-row"><a class="btn btn-primary" href="#/evaluate">Start your free evaluation</a><a class="btn btn-ghost" href="${TEL}">Call ${PHONE}</a></div>
          <p class="small-note">New injury case after hours? Call and leave a message; we’ll call you back.</p>
        </div>
      </div>
    </section>`,
  };
}

function practiceIndex() {
  return {
    title: 'Practice areas — Hale & Whitaker',
    html: `
    ${pageHead({ kicker: 'Practice areas', title: 'Focused practice, <em>deep experience.</em>', lead: 'We handle four kinds of matters, and we handle them often. That focus means faster answers, fewer surprises and an attorney who has seen a case like yours before.' })}
    <section class="section section-tight">
      <div class="wrap practice-cards">
        ${Object.entries(areas).map(([slug, a], i) => `
          <article class="practice-card reveal">
            <p class="pc-num">0${i + 1}</p>
            <h2><a href="#/practice/${slug}">${a.name}</a></h2>
            <p class="pc-matters">${a.matters}</p>
            <p class="pc-summary">${a.summary}</p>
            <dl class="pc-facts">
              <div><dt>Fees</dt><dd>${feeSummary(slug)}</dd></div>
              <div><dt>${a.attorneys.length > 1 ? 'Attorneys' : 'Attorney'}</dt><dd>${a.attorneys.map((s) => `<a href="#/attorneys/${s}">${attorneys[s].name}</a>`).join(', ')}</dd></div>
            </dl>
            <div class="pc-actions"><a class="btn btn-ghost btn-sm" href="#/practice/${slug}">Learn more<span class="visually-hidden"> about ${a.name.toLowerCase()}</span></a><a class="ulink" href="#/evaluate?area=${slug}">Free evaluation</a></div>
          </article>`).join('')}
      </div>
    </section>
    ${ctaBand('Not sure which area <em>fits?</em>', 'Start the free case evaluation and pick the closest match. We’ll route your request to the right attorney.')}`,
  };
}

function practiceDetail({ params }) {
  const a = areas[params.slug];
  if (!a) return null;
  const slugs = Object.keys(areas);
  const idx = slugs.indexOf(params.slug);
  return {
    title: `${a.name} — Hale & Whitaker`,
    html: `
    <section class="page-head detail-head"><div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/practice">Practice areas</a><span aria-hidden="true">/</span><span aria-current="page">${a.name}</span></nav>
      ${label(ROMAN[idx], 'Practice area')}
      <h1>${a.name}</h1>
      <p class="lead">${a.lead}</p>
      <div class="head-actions"><a class="btn btn-primary" href="#/evaluate?area=${params.slug}">Free case evaluation</a><a class="head-phone" href="${TEL}"><small>Or call</small>${PHONE}</a></div>
    </div></section>
    <section class="section section-tight">
      <div class="wrap detail-grid">
        <div class="detail-main">
          <h2 class="h-rule">What we handle</h2>
          <ul class="handle-grid">${a.handle.map(([t, p]) => `<li><h3>${t}</h3><p>${p}</p></li>`).join('')}</ul>
          <h2 class="h-rule">${a.firstTitle}</h2>
          <ol class="first-steps">${a.first.map(([t, p]) => `<li><strong>${t}</strong><p>${p}</p></li>`).join('')}</ol>
          <aside class="callout" aria-label="Good to know"><p class="callout-label">Good to know</p><p>${a.callout}</p></aside>
          <h2 class="h-rule">Questions we hear often</h2>
          <div class="faqs">${a.faqs.map(([q, ans]) => `<details><summary>${q}</summary><p>${ans}</p></details>`).join('')}</div>
        </div>
        <aside class="detail-side" aria-label="Fees and attorneys">
          <div class="side-card fee-card">
            <p class="side-label">Fees for ${a.name.toLowerCase()}</p>
            <h2 class="h-sm">${a.fee.type}</h2>
            <dl>${a.fee.rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
            <p>${a.fee.note}</p>
            <p class="small-note">Every first consultation is free: 30 minutes, in office, by phone or video.</p>
            <a class="ulink" href="#/fees">How our fees work</a>
          </div>
          ${a.attorneys.map(relatedAttorney).join('')}
          <div class="side-card side-cta">
            <h2 class="h-sm">Free case evaluation</h2>
            <p>Answer a few questions and book a free 30-minute consultation.</p>
            <a class="btn btn-primary full" href="#/evaluate?area=${params.slug}">Start now</a>
          </div>
        </aside>
      </div>
    </section>
    <section class="section section-sage other-areas">
      <div class="wrap">
        ${label('', 'Other practice areas')}
        <ul class="other-list">${slugs.filter((s) => s !== params.slug).map((s) => `<li><a href="#/practice/${s}"><span class="area-num">0${slugs.indexOf(s) + 1}</span><strong>${areas[s].name}</strong><span class="area-matters">${areas[s].matters}</span></a></li>`).join('')}</ul>
      </div>
    </section>`,
  };
}

function attorneysIndex() {
  return {
    title: 'Attorneys — Hale & Whitaker',
    html: `
    ${pageHead({ kicker: 'The attorneys', title: 'Four attorneys. <em>One team.</em>', lead: 'Every client works directly with an attorney. We share what we know across practice areas, so a question about your injury claim and your will can be answered under one roof.' })}
    <section class="section section-tight">
      <div class="wrap">
        <ul class="atty-list">${Object.entries(attorneys).map(([slug, a]) => `
          <li class="atty-row reveal">
            <a class="atty-portrait" href="#/attorneys/${slug}" tabindex="-1" aria-hidden="true">${img(a.image, '', { sizes: '(max-width: 640px) 100vw, 240px' })}</a>
            <div class="atty-body">
              <p class="atty-title">${a.title} · ${a.years}</p>
              <h2><a href="#/attorneys/${slug}">${a.name}</a></h2>
              <p class="atty-role">${a.role}</p>
              <p>${a.short}</p>
              <p class="atty-langs"><span>Languages</span>${a.languages.join(', ')}</p>
              <div class="btn-row"><a class="btn btn-ghost btn-sm" href="#/attorneys/${slug}">Read bio<span class="visually-hidden"> of ${a.name}</span></a><a class="ulink" href="#/evaluate?attorney=${slug}">Book a consultation<span class="visually-hidden"> with ${a.name}</span></a></div>
            </div>
          </li>`).join('')}
        </ul>
      </div>
    </section>
    ${ctaBand()}`,
  };
}

function attorneyDetail({ params }) {
  const a = attorneys[params.slug];
  if (!a) return null;
  const facts = [
    ['Focus areas', a.focus.map((f) => `<li>${f}</li>`).join('')],
    ['Practice areas', a.areas.map((s) => `<li><a href="#/practice/${s}">${areas[s].name}</a></li>`).join('')],
    ['Education', a.education.map((f) => `<li>${f}</li>`).join('')],
    ['Admissions', a.admissions.map((f) => `<li>${f}</li>`).join('')],
    ['Languages', a.languages.map((f) => `<li>${f}</li>`).join('')],
  ];
  return {
    title: `${a.name} — Hale & Whitaker`,
    html: `
    <section class="bio">
      <div class="wrap bio-grid">
        <div class="bio-portrait"><figure class="framed">${img(a.image, `Portrait of ${a.name}, ${a.title.toLowerCase()} at Hale & Whitaker`, { eager: true, sizes: '(max-width: 900px) 100vw, 40vw' })}</figure></div>
        <div class="bio-body">
          <nav class="crumbs" aria-label="Breadcrumb"><a href="#/attorneys">Attorneys</a><span aria-hidden="true">/</span><span aria-current="page">${a.name}</span></nav>
          ${label('', `${a.title} · ${a.role}`)}
          <h1>${a.name}</h1>
          <blockquote class="bio-quote"><p>${a.quote}</p></blockquote>
          <div class="bio-text">${a.bio.map((p) => `<p>${p}</p>`).join('')}</div>
          <div class="bio-actions"><a class="btn btn-primary" href="#/evaluate?attorney=${params.slug}">Book a consultation with ${a.name}</a><a class="head-phone" href="${TEL}"><small>Or call</small>${PHONE}</a></div>
          <div class="bio-facts">${facts.map(([h, list]) => `<section><h2>${h}</h2><ul>${list}</ul></section>`).join('')}</div>
        </div>
      </div>
    </section>
    <section class="section section-sage">
      <div class="wrap">
        <div class="section-head row">${label('', 'Also at the firm')}<a class="ulink" href="#/attorneys">All attorneys</a></div>
        <ul class="atty-grid three">${Object.entries(attorneys).filter(([s]) => s !== params.slug).map(([s, x]) => attorneyCard(s, x)).join('')}</ul>
      </div>
    </section>`,
  };
}

function resultsPage({ query }) {
  const area = areas[query.get('area')] ? query.get('area') : '';
  const list = results.filter((r) => !area || r.area === area);
  const count = (slug) => results.filter((r) => r.area === slug).length;
  return {
    title: 'Sample results — Hale & Whitaker',
    html: `
    ${pageHead({ kicker: 'Sample results', title: 'A record built <em>one client at a time.</em>', lead: 'A selection of outcomes across our practice areas. Behind every number is a person who needed someone to take their case seriously.' })}
    <section class="section section-tight">
      <div class="wrap">
        <div class="disclaimer-box" role="note">
          <p class="db-label">Please read</p>
          <p><strong>Past results do not guarantee a similar outcome.</strong> The results on this page are fictional samples written for this demo website. Every case is different, and the outcome of any matter depends on its own facts and the law that applies to it.</p>
        </div>
        <nav class="filter-bar" aria-label="Filter results by practice area">
          <a class="chip ${area ? '' : 'is-active'}" href="#/results" ${area ? '' : 'aria-current="true"'}>All <span>${results.length}</span></a>
          ${Object.entries(areas).map(([slug, a]) => `<a class="chip ${area === slug ? 'is-active' : ''}" href="#/results?area=${slug}" ${area === slug ? 'aria-current="true"' : ''}>${a.name} <span>${count(slug)}</span></a>`).join('')}
        </nav>
        <p class="result-count" aria-live="polite">Showing ${list.length} sample ${list.length === 1 ? 'result' : 'results'}${area ? ` in ${areas[area].name.toLowerCase()}` : ''}.</p>
        <ul class="result-list">${list.map((r) => `
          <li class="result-card">
            <div class="rc-amount"><strong>${r.full}</strong><span>${r.kind}</span></div>
            <div class="rc-body">
              <p class="rc-area">${areas[r.area].name}</p>
              <h2>${r.title}</h2>
              <p>${r.text}</p>
              <p class="rc-atty">Handled by <a href="#/attorneys/${r.attorney}">${attorneys[r.attorney].name}</a> · <span>Fictional sample</span></p>
            </div>
          </li>`).join('')}
        </ul>
        <p class="fine-print">Past results do not guarantee a similar outcome. Dollar amounts are gross recoveries before attorney’s fees and case costs.</p>
      </div>
    </section>
    ${ctaBand('Every case deserves <em>a careful look.</em>', 'Tell us what happened and we’ll give you an honest assessment at a free consultation.')}`,
  };
}

function calcNumbers(amount, stage) {
  const rate = stage === 'suit' ? 0.4 : 1 / 3;
  const fee = Math.round(amount * rate * 100) / 100;
  const costs = EXAMPLE_COSTS[stage].reduce((sum, [, v]) => sum + v, 0);
  const net = Math.max(0, amount - fee - costs);
  return { rate, fee, costs, net };
}
const parseAmount = (value) => Math.min(10000000, Math.max(0, Number(String(value).replace(/[^\d.]/g, '')) || 0));

function feesPage() {
  const c = { amount: 100000, stage: 'pre', ...state.calc };
  const n = calcNumbers(c.amount, c.stage);
  const pct = (v) => (c.amount ? Math.min(100, (v / c.amount) * 100) : 0).toFixed(2);
  return {
    title: 'Fees — Hale & Whitaker',
    html: `
    ${pageHead({ kicker: 'Fees', title: 'Clear fees, <em>agreed in writing.</em>', lead: 'You’ll know what you’ll pay before we start. Every first consultation is free, and injury cases cost nothing up front.' })}
    <section class="section section-tight">
      <div class="wrap">
        ${label('I', 'At a glance')}
        <div class="fee-grid">
          <article class="fee-tile reveal"><p class="side-label">First consultation</p><p class="fee-big">Free</p><p>30 minutes with an attorney, in office, by phone or by video. No obligation.</p></article>
          <article class="fee-tile reveal"><p class="side-label">Injury & workers’ comp</p><p class="fee-big">33⅓%<small> / 40%</small></p><p>Contingency fee: 33⅓% if resolved before a lawsuit is filed, 40% if a lawsuit is filed. No attorney’s fee unless we recover money for you.</p></article>
          <article class="fee-tile reveal"><p class="side-label">Family law</p><p class="fee-big">$1,500</p><p>Flat fee for an uncontested divorce. Other family law matters are billed hourly and quoted at your consultation.</p></article>
          <article class="fee-tile reveal"><p class="side-label">Estate planning</p><p class="fee-big">$650<small> / $2,400</small></p><p>Flat fees: will package $650, revocable trust package $2,400. Probate administration is quoted at consultation.</p></article>
        </div>
      </div>
    </section>
    <section class="section section-sage" id="calculator">
      <div class="wrap calc-grid">
        <div class="calc-intro">
          ${label('II', 'Contingency fee calculator')}
          <h2>See how a contingency fee <em>works.</em></h2>
          <p>Enter a hypothetical settlement and choose when the case resolves. The calculator shows the attorney’s fee and example case costs.</p>
          <ul class="dash-list">
            <li>No attorney’s fee unless we recover money for you.</li>
            <li>In this illustration the fee is a percentage of the gross recovery.</li>
            <li>Case costs are expenses like records, filing fees and depositions. Your written fee agreement explains exactly how fees and costs are handled.</li>
          </ul>
        </div>
        <div class="calc-card">
          <p class="illustration-flag">Illustration only · not a quote or a prediction</p>
          <div class="field">
            <label for="calc-amount">Hypothetical settlement</label>
            <div class="money-input"><span aria-hidden="true">$</span><input id="calc-amount" name="amount" inputmode="numeric" autocomplete="off" value="${c.amount ? c.amount.toLocaleString('en-US') : ''}" data-input="calc" data-change="calc-format" aria-describedby="calc-help"></div>
            <p class="hint" id="calc-help">Any amount up to $10,000,000.</p>
          </div>
          <input class="range" id="calc-range" type="range" min="10000" max="1000000" step="5000" value="${Math.min(1000000, Math.max(10000, c.amount))}" aria-label="Adjust the hypothetical settlement" data-input="calc-range">
          <div class="presets">${[25000, 100000, 250000, 750000].map((v) => `<button type="button" class="preset" data-action="calc-preset" data-value="${v}">${money(v)}</button>`).join('')}</div>
          <fieldset class="seg"><legend>When the case resolves</legend>
            <label><input type="radio" name="stage" value="pre" ${c.stage === 'pre' ? 'checked' : ''} data-change="calc"><span><strong>Before a lawsuit</strong><small>33⅓% fee</small></span></label>
            <label><input type="radio" name="stage" value="suit" ${c.stage === 'suit' ? 'checked' : ''} data-change="calc"><span><strong>After a lawsuit is filed</strong><small>40% fee</small></span></label>
          </fieldset>
          <div class="calc-out" aria-live="polite">
            <div class="calc-bar" aria-hidden="true"><span class="bar-fee" id="bar-fee" style="width:${pct(n.fee)}%"></span><span class="bar-cost" id="bar-cost" style="width:${pct(Math.min(n.costs, c.amount - n.fee))}%"></span><span class="bar-net" id="bar-net" style="width:${pct(n.net)}%"></span></div>
            <dl class="calc-lines">
              <div><dt>Hypothetical settlement</dt><dd id="calc-gross">${money(c.amount)}</dd></div>
              <div><dt><i class="key key-fee"></i>Attorney’s fee <span id="calc-rate">(${c.stage === 'suit' ? '40%' : '33⅓%'})</span></dt><dd id="calc-fee">− ${money(n.fee, true)}</dd></div>
              <div><dt><i class="key key-cost"></i>Example case costs</dt><dd id="calc-costs">− ${money(n.costs)}</dd></div>
              <div class="calc-total"><dt><i class="key key-net"></i>Before medical bills and liens</dt><dd id="calc-net">${money(n.net, true)}</dd></div>
            </dl>
            <details class="cost-detail"><summary>What’s in the example costs?</summary><ul id="calc-cost-list">${EXAMPLE_COSTS[c.stage].map(([k, v]) => `<li><span>${k}</span><span>${money(v)}</span></li>`).join('')}</ul></details>
            <p class="calc-disclaimer">This is an illustration only, not a quote, estimate or promise of any result. Real case costs vary, and medical bills or liens may need to be repaid from a recovery. Past results do not guarantee a similar outcome.</p>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="wrap fee-faq">
        <div>${label('III', 'Questions about fees')}<h2>Straight answers <em>about money.</em></h2><p class="lead">If anything about a fee is unclear, ask us. We would rather explain it twice than have you guess.</p></div>
        <div class="faqs">
          <details><summary>What does “no fee unless we recover” mean?</summary><p>In personal injury and workers’ compensation cases, you don’t pay an attorney’s fee unless we recover money for you. If there’s no recovery, there’s no attorney’s fee.</p></details>
          <details><summary>Why is the fee higher once a lawsuit is filed?</summary><p>Filing a lawsuit means significantly more work: formal discovery, depositions, motions and trial preparation. The fee is 33⅓% if the matter resolves before a lawsuit is filed and 40% if a lawsuit is filed.</p></details>
          <details><summary>What are case costs?</summary><p>Out-of-pocket expenses of pursuing a claim, such as medical records, police reports, court filing fees, deposition transcripts and expert reviews. Your written agreement explains how they are handled, and we review significant costs with you before they are spent.</p></details>
          <details><summary>How are hourly family law matters billed?</summary><p>At your free consultation we explain the hourly rate, give you a realistic estimate for your matter and put it in writing. You receive clear, itemized statements.</p></details>
          <details><summary>What is included in the estate planning packages?</summary><p>The will package ($650) includes a will, a durable power of attorney and an advance health care directive. The revocable trust package ($2,400) includes the trust, a pour-over will, powers of attorney, a health care directive and guidance on moving assets into the trust.</p></details>
        </div>
      </div>
    </section>
    ${ctaBand()}`,
  };
}

let contactSent = null;
function contactPage() {
  const p = state.profile || {};
  const form = `
    <form class="contact-form" data-form="contact" novalidate>
      <h2 class="h-md">Send us a message</h2>
      <p class="form-intro">For general questions. Starting a new case? The <a href="#/evaluate">free case evaluation</a> is the fastest way to reach an attorney.</p>
      <div class="field"><label for="m-name">Full name</label><input id="m-name" name="name" autocomplete="name" required data-required="Enter your name." value="${esc(p.name)}"></div>
      <div class="field-row">
        <div class="field"><label for="m-email">Email</label><input id="m-email" name="email" type="email" autocomplete="email" required data-required="Enter your email address." value="${esc(p.email)}"></div>
        <div class="field"><label for="m-phone">Phone <span class="optional">Optional</span></label><input id="m-phone" name="phone" type="tel" autocomplete="tel" value="${esc(p.phone)}"></div>
      </div>
      <div class="field"><label for="m-topic">Topic</label><select id="m-topic" name="topic" required data-required="Choose a topic."><option value="">Choose a topic</option><option>General question</option><option>I’m a current client</option><option>Billing</option><option>Referral from another lawyer</option><option>Something else</option></select></div>
      <div class="field"><label for="m-message">Message</label><textarea id="m-message" name="message" rows="5" required data-required="Write a short message." data-minlength="10" placeholder="How can we help? Please leave out confidential details for now."></textarea></div>
      <label class="check"><input type="checkbox" name="ack" required data-required="Please confirm to send your message."><span>I understand that sending this message does not create an attorney-client relationship.</span></label>
      <button class="btn btn-primary" type="submit">Send message</button>
    </form>`;
  const done = contactSent ? `
    <div class="contact-done" id="contact-done" tabindex="-1">
      <span class="seal" aria-hidden="true">✓</span>
      <p class="side-label">Message ${esc(contactSent.ref)}</p>
      <h2 class="h-md">Thank you, ${esc(firstName(contactSent.name))}.</h2>
      <p>Your message about “${esc(contactSent.topic)}” is with our front desk. We reply to messages within one business day, usually sooner.</p>
      <p class="demo-note">Demo message: nothing was sent, and it is stored only in this browser.</p>
      <button class="btn btn-ghost btn-sm" data-action="contact-again">Send another message</button>
    </div>` : '';
  return {
    title: 'Contact — Hale & Whitaker',
    html: `
    ${pageHead({ kicker: 'Contact', title: 'Come see us <em>downtown.</em>', lead: 'Call, stop by or send a message. For a new case, the free case evaluation is the fastest way to reach an attorney.' })}
    <section class="section section-tight">
      <div class="wrap contact-grid">
        <div class="contact-info">
          <div class="map" role="img" aria-label="Map illustration: the Hale & Whitaker office on Second Avenue North in downtown Birmingham">
            <div class="map-plane" aria-hidden="true">
              <span class="map-park"></span><span class="map-park p2"></span>
              <span class="map-ave"><em>Second Ave. North</em></span>
              <span class="map-ave minor a2"><em>Third Avenue North</em></span>
              <span class="map-ave minor a1"><em>First Avenue North</em></span>
              <span class="map-pin"><span class="pin-mark">H&amp;W</span><span class="pin-card">Hale &amp; Whitaker<small>Suite 400</small></span></span>
            </div>
            <span class="map-compass" aria-hidden="true">N</span>
            <span class="map-note" aria-hidden="true">Illustration · not to scale</span>
          </div>
          <dl class="contact-list">
            <div><dt>Office</dt><dd>Hale &amp; Whitaker<br>Second Avenue North, Suite 400<br>Birmingham, AL 35203</dd></div>
            <div><dt>Phone</dt><dd><a href="${TEL}">${PHONE}</a></dd></div>
            <div><dt>Hours</dt><dd>Monday–Friday, 8:30 AM–5:30 PM<br><span class="muted">After-hours callback for new injury cases</span></dd></div>
            <div><dt>Languages</dt><dd>English and Spanish</dd></div>
            <div><dt>Consultations</dt><dd>Free, 30 minutes: in office, by phone or by video</dd></div>
          </dl>
        </div>
        <div class="contact-side">${contactSent ? done : form}</div>
      </div>
    </section>`,
  };
}

// ---------------------------------------------------------------- free case evaluation

const STEPS = ['Your matter', 'Details', 'Contact', 'Consultation', 'Review'];
const STEP_TITLES = ['What can we help with?', 'Tell us a little more', 'How can we reach you?', 'Book your free consultation', 'Review and submit'];
const STEP_INTROS = [
  'Choose the kind of matter so we can route your request to the right attorney.',
  'A few quick questions. Estimates are fine, and the last question is optional.',
  'We use these details only to follow up on your request.',
  'Choose how and when you’d like to meet. Every first consultation is free and lasts 30 minutes.',
  'Check your answers, then send your request. You can edit anything before you submit.',
];

const choices = (name, legend, options, value, message, layout = 'grid-2') => `
  <fieldset class="choices ${layout}"><legend>${legend}</legend>
    <div class="choice-list">${options.map(([v, text, sub]) => `<label class="choice"><input type="radio" name="${name}" value="${v}" ${value === v ? 'checked' : ''} required data-required="${esc(message)}"><span class="choice-text">${text}${sub ? `<small>${sub}</small>` : ''}</span></label>`).join('')}</div>
  </fieldset>`;

function solNote(value) {
  if (!isDayKey(value)) return '';
  const date = fromDayKey(value);
  const today = today0();
  if (Number.isNaN(date.getTime()) || date > today || date.getFullYear() < 1950) return '';
  const mark = new Date(date);
  mark.setFullYear(date.getFullYear() + 2);
  const days = Math.round((mark - today) / 86400000);
  const general = '<em>General information, not legal advice.</em>';
  if (days < 0) return note(`<strong>It has been more than two years since this date.</strong> Alabama personal injury claims generally must be filed within two years of the injury, but some situations are different. Please still send your request. We’ll look at it promptly and tell you honestly where you stand. ${general}`, 'warn');
  if (days <= 120) {
    const when = days === 0 ? 'today' : days <= 60 ? `in ${days} ${days === 1 ? 'day' : 'days'}` : `in about ${Math.round(days / 30)} months`;
    return note(`<strong>Your two-year mark is ${esc(plainDate(mark))}, ${when}.</strong> Alabama personal injury claims generally must be filed within two years of the injury, so it’s wise to talk with us soon. We’ll prioritize your request. ${general}`, 'warn');
  }
  return note(`<strong>Thank you.</strong> Alabama personal injury claims generally must be filed within two years of the injury. For this date, that’s around ${esc(plainDate(mark))}. ${general}`);
}

function tipsFor(area, v) {
  const tips = [];
  if (area === 'personal-injury' && v.injured === 'yes' && v.treatment === 'no') tips.push(note('<strong>Please get checked out.</strong> Some injuries take days to show up, and an early medical record protects both your health and your claim.', 'warn'));
  if (area === 'personal-injury' && ['other', 'both'].includes(v.insurance)) tips.push(note('<strong>A quick tip:</strong> you don’t have to give the other side’s insurer a recorded statement. It’s fine to say you’ll call back after speaking with a lawyer.'));
  if (area === 'workers-compensation' && ['not-yet', 'unsure'].includes(v.reported)) tips.push(note('<strong>Report it soon.</strong> Tell your supervisor in writing as soon as you can and keep a copy. Alabama has short deadlines for notifying your employer.', 'warn'));
  if (area === 'family-law' && v.matter === 'uncontested') tips.push(note('<strong>Good to know:</strong> we handle uncontested divorces for a flat fee of $1,500.'));
  if (area === 'estate-planning' && v.need === 'will') tips.push(note('<strong>Good to know:</strong> our will package is a flat $650 and includes a will, a durable power of attorney and a health care directive.'));
  if (area === 'estate-planning' && v.need === 'trust') tips.push(note('<strong>Good to know:</strong> our revocable trust package is a flat $2,400.'));
  return tips.join('');
}

function detailsFields(area, v) {
  const today = dayKey(new Date());
  const summary = `<div class="field"><label for="d-summary">Briefly, what happened? <span class="optional">Optional</span></label><textarea id="d-summary" name="summary" rows="4" maxlength="1200" placeholder="A few sentences is plenty. Please leave out anything confidential for now.">${esc(v.summary)}</textarea></div>`;
  const dateField = (text, hint) => `<div class="field field-date"><label for="d-date">${text}</label><p class="hint">${hint}</p><input id="d-date" name="date" type="date" max="${today}" min="1950-01-01" required data-required="Enter the date it happened. An estimate is fine." value="${esc(v.date)}"></div>`;
  const tips = `<div id="step-tips" class="live-tips" aria-live="polite">${tipsFor(area, v)}</div>`;
  if (area === 'personal-injury') {
    return `
      ${dateField('Date of the accident or injury', 'An estimate is fine.')}
      <div id="sol-note" class="live-tips" aria-live="polite">${solNote(v.date)}</div>
      ${choices('kind', 'What kind of accident was it?', OPTS.kind, v.kind, 'Choose the kind of accident.', 'grid-3')}
      <div class="field-row">
        <div>${choices('injured', 'Was anyone injured?', OPTS.yesno, v.injured, 'Choose yes or no.', 'inline')}</div>
        <div>${choices('treatment', 'Has there been medical treatment?', OPTS.yesno, v.treatment, 'Choose yes or no.', 'inline')}</div>
      </div>
      ${choices('insurance', 'Has an insurance company contacted you?', OPTS.insurance, v.insurance, 'Choose an answer.', 'grid-2')}
      ${tips}${summary}`;
  }
  if (area === 'workers-compensation') {
    return `
      <div class="field"><label for="d-employer">Employer’s name</label><input id="d-employer" name="employer" autocomplete="organization" required data-required="Enter the name of your employer." value="${esc(v.employer)}"></div>
      ${dateField('Date of the injury', 'If it developed over time, when you first noticed it.')}
      ${choices('reported', 'Have you reported the injury to your employer?', OPTS.reported, v.reported, 'Choose an answer.', 'grid-2')}
      ${tips}${summary}`;
  }
  if (area === 'family-law') {
    return `
      ${choices('matter', 'What kind of matter is it?', OPTS.matter, v.matter, 'Choose the kind of matter.', 'grid-2')}
      ${choices('children', 'Are any children under 19 involved?', OPTS.yesno, v.children, 'Choose yes or no.', 'inline')}
      <div class="field"><label for="d-county">County where the case is (or where you live)</label><select id="d-county" name="county" required data-required="Choose a county."><option value="">Choose a county</option>${COUNTIES.map((c) => `<option ${v.county === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      ${tips}${summary}`;
  }
  return `
    ${choices('need', 'What do you need help with?', OPTS.need, v.need, 'Choose what you need help with.', 'grid-2')}
    ${choices('forWhom', 'Who is this for?', OPTS.forWhom, v.forWhom, 'Choose who this is for.', 'grid-2')}
    ${tips}${summary}`;
}

function ensureDraft() {
  if (!state.draft || typeof state.draft !== 'object') state.draft = { step: 1, area: '', attorney: '', details: {}, contact: { ...state.profile }, consult: {} };
  const d = state.draft;
  d.details ||= {}; d.contact ||= {}; d.consult ||= {};
  d.step = Math.min(5, Math.max(1, Number(d.step) || 1));
  if (d.step > 1 && !areas[d.area]) d.step = 1;
  return d;
}

function stepComplete(n) {
  const d = state.draft;
  if (n === 1) return Boolean(areas[d.area]);
  if (n === 2) {
    const det = d.details[d.area] || {};
    return (REQUIRED[d.area] || []).every((k) => String(det[k] || '').trim()) && (!det.date || det.date <= dayKey(new Date()));
  }
  if (n === 3) return ['name', 'phone', 'email', 'method', 'time'].every((k) => String(d.contact[k] || '').trim());
  if (n === 4) return Boolean(formats[d.consult.format]) && slotAvailable(d.consult.slot);
  return true;
}

function consultAttorney(d) {
  const area = areas[d.area];
  if (d.consult.attorney !== undefined) return area.attorneys.includes(d.consult.attorney) ? d.consult.attorney : '';
  return area.attorneys.includes(d.attorney) ? d.attorney : '';
}

function slotPicker({ day, slot, ownKey = null, dayAction }) {
  const days = consultDays();
  const active = days.find((d) => dayKey(d) === day) || days.find((d) => slotsFor(d, ownKey).some((s) => !s.taken)) || days[0];
  const slots = slotsFor(active, ownKey);
  return `
    <div class="day-picker" role="group" aria-label="Choose a day">
      ${days.map((d) => {
        const k = dayKey(d);
        const on = k === dayKey(active);
        const open = slotsFor(d, ownKey).filter((s) => !s.taken).length;
        return `<button type="button" class="day-chip ${on ? 'is-active' : ''}" id="day-${k}" data-action="${dayAction}" data-day="${k}" aria-pressed="${on}" aria-label="${esc(longDate(d))}, ${open} open times"><span>${formatDate(d, { weekday: 'short' })}</span><strong>${d.getDate()}</strong><small>${formatDate(d, { month: 'short' })}</small></button>`;
      }).join('')}
    </div>
    <fieldset class="slot-set"><legend>Open times on ${esc(longDate(active))} <span class="tz">Central Time</span></legend>
      <div class="slots">
        ${slots.map((s) => `<label class="slot ${s.taken ? 'is-taken' : ''} ${s.current ? 'is-current' : ''}"><input type="radio" name="slot" value="${s.key}" ${s.key === slot && !s.taken && !s.current ? 'checked' : ''} ${s.taken || s.current ? 'disabled' : ''} required data-required="Choose a time for your consultation."><span>${formatTime(s.start)}</span>${s.current ? '<small>Current</small>' : s.taken ? '<small>Taken</small>' : ''}</label>`).join('')}
      </div>
    </fieldset>`;
}

const selectedSlotText = (key) => (isSlotKey(key) ? `<strong>Selected:</strong> ${esc(longDate(slotDate(key)))}, ${timeRange(slotDate(key))}` : 'No time selected yet.');

function displayValue(value, kind) {
  if (!String(value || '').trim()) return '<span class="muted">—</span>';
  if (kind === 'date' && isDayKey(value)) return esc(plainDate(fromDayKey(value)));
  if (kind && OPTS[kind]) return esc(optLabel(kind, value));
  return esc(value);
}

function reviewBlocks(d) {
  const area = areas[d.area];
  const det = d.details[d.area] || {};
  const c = d.contact;
  const atty = consultAttorney(d);
  const start = isSlotKey(d.consult.slot) ? slotDate(d.consult.slot) : null;
  const block = (n, title, rows) => `
    <section class="review-block">
      <div class="rb-head"><h3>${title}</h3><button type="button" class="text-btn" data-action="go-step" data-step="${n}">Edit<span class="visually-hidden"> ${title.toLowerCase()}</span></button></div>
      <dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    </section>`;
  return [
    block(1, 'Your matter', [['Practice area', esc(area.name)]]),
    block(2, 'Details', DETAIL_ROWS[d.area].map(([key, text, kind]) => [text, displayValue(det[key], kind)])),
    block(3, 'Contact', [['Name', displayValue(c.name)], ['Phone', displayValue(c.phone)], ['Email', displayValue(c.email)], ['Contact by', displayValue(c.method, 'method')], ['Best time', displayValue(c.time, 'time')], ['Language', displayValue(c.language || 'English')]]),
    block(4, 'Consultation', [['Format', esc(formats[d.consult.format]?.name || '—')], ['When', start ? `${esc(longDate(start))}, ${timeRange(start)}` : '—'], ['Attorney', atty ? esc(attorneys[atty].name) : `First available ${esc(area.name.toLowerCase())} attorney`]]),
  ].join('');
}

let focusStep = false;
function evaluate({ query }) {
  const qa = query.get('area');
  const qt = query.get('attorney');
  if ((qa && areas[qa]) || (qt && attorneys[qt])) {
    const prev = state.draft || {};
    state.draft = { step: 1, area: '', attorney: '', details: prev.details || {}, contact: prev.contact || { ...state.profile }, consult: {} };
    if (qt && attorneys[qt]) { state.draft.attorney = qt; state.draft.area = attorneys[qt].areas[0]; }
    if (qa && areas[qa]) state.draft.area = qa;
    save();
  }
  const d = ensureDraft();
  const step = d.step;
  const area = areas[d.area];
  const next = nextConsult();
  let body = '';

  if (step === 1) {
    const atty = attorneys[d.attorney];
    body = `
      ${atty ? `<div class="booking-with"><span class="bw-photo">${img(atty.image, '', { sizes: '56px' })}</span><p>Booking with <strong>${atty.name}</strong><span>${atty.role}</span></p><button type="button" class="text-btn" data-action="clear-attorney">Remove</button></div>` : ''}
      <fieldset class="area-choices"><legend class="visually-hidden">Type of matter</legend>
        ${Object.entries(areas).map(([slug, a], i) => `
          <label class="area-choice">
            <input type="radio" name="area" value="${slug}" ${d.area === slug ? 'checked' : ''} required data-required="Choose the kind of matter so we can route your request.">
            <span class="ac-box"><span class="ac-num">0${i + 1}</span><strong>${a.name}</strong><small>${a.matters}</small>${atty && atty.areas.includes(slug) ? `<span class="ac-tag">${atty.first} handles this</span>` : ''}</span>
          </label>`).join('')}
      </fieldset>
      <p class="hint">Not sure? Pick the closest match. We’ll make sure the right attorney sees it.</p>`;
  } else if (step === 2) {
    body = `<p class="step-area">${esc(area.name)}</p>${detailsFields(d.area, d.details[d.area] || {})}`;
  } else if (step === 3) {
    const c = d.contact;
    body = `
      <div class="field"><label for="c-name">Full name</label><input id="c-name" name="name" autocomplete="name" required data-required="Enter your full name." value="${esc(c.name)}"></div>
      <div class="field-row">
        <div class="field"><label for="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" autocomplete="tel" required data-required="Enter a phone number so we can reach you." placeholder="(205) 555-0100" value="${esc(c.phone)}"></div>
        <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required data-required="Enter your email address." placeholder="name@example.com" value="${esc(c.email)}"></div>
      </div>
      ${choices('method', 'How should we contact you?', OPTS.method, c.method, 'Choose how we should contact you.', 'grid-3')}
      ${choices('time', 'Best time to reach you', OPTS.time, c.time, 'Choose the best time to reach you.', 'grid-3')}
      <div class="field field-narrow"><label for="c-language">Preferred language</label><select id="c-language" name="language"><option value="English">English</option><option value="Spanish" ${c.language === 'Spanish' ? 'selected' : ''}>Español (Spanish)</option></select></div>`;
  } else if (step === 4) {
    const cs = d.consult;
    const days = consultDays();
    if (cs.slot && !slotAvailable(cs.slot)) cs.slot = '';
    if (!days.some((x) => dayKey(x) === cs.day)) cs.day = cs.slot ? cs.slot.slice(0, 10) : '';
    const atty = consultAttorney(d);
    const wanted = attorneys[d.attorney];
    body = `
      <fieldset class="choices format-choices"><legend>How would you like to meet?</legend>
        <div class="choice-list">${Object.entries(formats).map(([k, f]) => `<label class="choice format"><input type="radio" name="format" value="${k}" ${cs.format === k ? 'checked' : ''} required data-required="Choose in office, phone or video."><span class="choice-text"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${f.icon}</svg>${f.name}<small>${f.text}</small></span></label>`).join('')}</div>
      </fieldset>
      <div class="field field-narrow"><label for="c-attorney">Attorney</label><select id="c-attorney" name="attorney"><option value="">First available attorney</option>${area.attorneys.map((s) => `<option value="${s}" ${atty === s ? 'selected' : ''}>${attorneys[s].name}</option>`).join('')}</select>
        ${wanted && !area.attorneys.includes(d.attorney) ? `<p class="hint">${wanted.name} doesn’t handle ${esc(area.name.toLowerCase())} matters, so we’ll match you with ${area.attorneys.map((s) => attorneys[s].name).join(' or ')}.</p>` : ''}</div>
      <div class="slot-picker">
        <p class="field-label">Choose a day and time</p>
        ${slotPicker({ day: cs.day, slot: cs.slot, dayAction: 'pick-day' })}
        <p class="selected-slot" id="selected-slot" aria-live="polite">${selectedSlotText(cs.slot)}</p>
      </div>`;
  } else {
    if (!d.review) { d.review = true; save(); }
    body = `
      <div class="review">${reviewBlocks(d)}</div>
      <label class="check consent"><input type="checkbox" name="consent" required data-required="Please confirm you understand before submitting."><span>I understand that submitting this request does not create an attorney-client relationship, that Hale &amp; Whitaker does not represent me unless we both sign a written agreement, and that this form is not legal advice.</span></label>
      <p class="hint">Please don’t include confidential details you wouldn’t want shared until we confirm we can take your matter.</p>`;
  }

  const pct = (step - 1) / 4;
  return {
    title: `Free case evaluation · Step ${step} of 5 — Hale & Whitaker`,
    html: `
    <section class="page-head intake-head"><div class="wrap">
      ${label('', 'Free case evaluation')}
      <h1>Tell us what <em>happened.</em></h1>
      <p class="lead">Five short steps, about four minutes. An attorney reviews every request, and your first consultation is free.</p>
    </div></section>
    ${next ? consultBanner(next) : ''}
    <section class="section intake-section">
      <div class="wrap intake-grid">
        <div class="intake-main">
          <ol class="progress" style="--p:${pct}" aria-label="Evaluation progress">
            ${STEPS.map((s, i) => {
              const n = i + 1;
              const cls = n < step ? 'is-done' : n === step ? 'is-current' : '';
              const inner = `<span class="p-mark">${n < step ? '✓' : ROMAN[i]}</span><span class="p-label">${s}</span>`;
              return `<li class="${cls}" ${n === step ? 'aria-current="step"' : ''}>${n < step ? `<button type="button" data-action="go-step" data-step="${n}" aria-label="Step ${n}, ${s}, completed. Go back to this step.">${inner}</button>` : `<span class="p-inner">${inner}</span>`}</li>`;
            }).join('')}
          </ol>
          <p class="visually-hidden" aria-live="polite">Step ${step} of 5: ${STEPS[step - 1]}</p>
          <form class="intake-card" data-form="intake" data-input="intake-save" data-change="intake-save" novalidate>
            <div class="step-head">
              <p class="step-count">Step ${ROMAN[step - 1]} of V · ${STEPS[step - 1]}</p>
              <h2 id="step-title" tabindex="-1">${STEP_TITLES[step - 1]}</h2>
              <p class="step-intro">${STEP_INTROS[step - 1]}</p>
            </div>
            ${body}
            <div class="step-actions">
              ${step > 1 ? '<button type="button" class="btn btn-ghost" data-action="intake-back">← Back</button>' : '<button type="button" class="text-btn" data-action="intake-reset">Start over</button>'}
              <button type="submit" class="btn btn-primary">${step === 5 ? 'Submit request' : d.review ? 'Save and review' : 'Continue'}</button>
            </div>
          </form>
        </div>
        <aside class="intake-aside" aria-label="About the evaluation">
          <div class="aside-card">
            <h2 class="h-sm">What to expect</h2>
            <ol class="expect">
              <li><strong>An attorney reviews your request</strong><span>Usually within one business day.</span></li>
              <li><strong>We confirm your appointment</strong><span>By phone, text or email, whichever you prefer.</span></li>
              <li><strong>Your free consultation</strong><span>Thirty minutes, with no obligation to hire us.</span></li>
            </ol>
          </div>
          <div class="aside-call"><p>Prefer to talk now?</p><a href="${TEL}">${PHONE}</a><span>Mon–Fri 8:30 AM–5:30 PM. After-hours callback for new injury cases.</span></div>
          <p class="aside-notice">Submitting this form does not create an attorney-client relationship. Information on this site is not legal advice.</p>
        </aside>
      </div>
    </section>`,
    mount: () => {
      if (qa || qt) { try { history.replaceState(history.state, '', '#/evaluate'); } catch { /* keep the query */ } }
      if (focusStep) { focusStep = false; document.getElementById('step-title')?.focus({ preventScroll: true }); }
    },
  };
}

function goStep(n) {
  state.draft.step = n;
  save();
  focusStep = true;
  router.render({ keepScroll: true });
  const main = document.querySelector('.intake-main');
  if (main) {
    const top = main.getBoundingClientRect().top + window.scrollY - 110;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'instant' });
  }
}

function collect(form) {
  const d = state.draft;
  if (!d) return;
  const v = formData(form);
  delete v.consent;
  if (d.step === 1) { if (v.area) d.area = v.area; }
  else if (d.step === 2) d.details[d.area] = { ...(d.details[d.area] || {}), ...v };
  else if (d.step === 3) d.contact = { ...d.contact, ...v };
  else if (d.step === 4) { const { slot, ...rest } = v; d.consult = { ...d.consult, ...rest }; if (slot) d.consult.slot = slot; }
}

function checkDate(form) {
  const field = form.elements.date;
  if (!field || !field.value) return true;
  let message = '';
  if (field.value > dayKey(new Date())) message = 'That date is in the future. Please check it.';
  else if (field.value < '1950-01-01') message = 'Please check the year.';
  if (!message) return true;
  const error = Object.assign(document.createElement('p'), { className: 'field-error', id: 'error-date', textContent: message });
  field.insertAdjacentElement('afterend', error);
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', 'error-date');
  field.focus();
  return false;
}

function submitEvaluation() {
  const d = state.draft;
  for (const n of [1, 2, 3, 4]) {
    if (!stepComplete(n)) {
      toast(n === 4 ? 'That time is no longer available. Please choose another.' : 'A step needs another look before you submit.');
      if (n === 4) d.consult.slot = '';
      goStep(n);
      return;
    }
  }
  const ref = reference('HW');
  const ev = {
    ref, createdAt: Date.now(), status: 'scheduled', area: d.area, details: { ...d.details[d.area] }, contact: { language: 'English', ...d.contact },
    format: d.consult.format, attorney: consultAttorney(d), slot: d.consult.slot, history: [],
  };
  state.evaluations.push(ev);
  state.profile = { name: ev.contact.name, phone: ev.contact.phone, email: ev.contact.email };
  state.draft = null;
  save();
  router.go(`#/evaluation/${ref}`);
}

let resched = null;
function evaluationPage({ params }) {
  const ev = state.evaluations.find((e) => e.ref === params.ref);
  if (!ev || !areas[ev.area] || !isSlotKey(ev.slot)) {
    return {
      title: 'Evaluation not found — Hale & Whitaker',
      html: `<section class="section notfound"><div class="wrap narrow center">${label('', 'Free case evaluation')}<h1>We couldn’t find <em>that request.</em></h1><p class="lead">Requests made on this demo are saved only in the browser where they were made. You can start a new free evaluation in a few minutes.</p><div class="btn-row center"><a class="btn btn-primary" href="#/evaluate">Start a free evaluation</a><a class="btn btn-ghost" href="${TEL}">Call ${PHONE}</a></div></div></section>`,
    };
  }
  const a = areas[ev.area];
  const start = slotDate(ev.slot);
  const atty = attorneys[ev.attorney];
  const cancelled = ev.status === 'cancelled';
  const past = start <= new Date();
  const method = { phone: 'call', text: 'text', email: 'email' }[ev.contact.method] || 'call';
  const reach = ev.contact.method === 'email' ? ev.contact.email : ev.contact.phone;
  const timeWord = { morning: 'in the morning', afternoon: 'in the afternoon', anytime: 'during office hours' }[ev.contact.time] || '';
  const where = {
    office: 'Second Avenue North, Suite 400, Birmingham, AL 35203',
    phone: `We’ll call you at ${esc(ev.contact.phone)}`,
    video: `Secure video link sent to ${esc(ev.contact.email)} the day before`,
  }[ev.format];
  const isResched = resched && resched.ref === ev.ref;
  return {
    title: `Request ${ev.ref} — Hale & Whitaker`,
    html: `
    <section class="page-head confirm-head"><div class="wrap">
      <p class="label"><span class="label-line" aria-hidden="true"></span><span>Request received · Reference <strong class="ref">${esc(ev.ref)}</strong></span></p>
      <h1>${cancelled ? `Your consultation is <em>cancelled.</em>` : `Thank you, ${esc(firstName(ev.contact.name))}. <em>We have your request.</em>`}</h1>
      <p class="lead">${cancelled ? 'Your request stays on file. Choose “Book a new time” whenever you’re ready, or call us.' : `An attorney will review your ${esc(a.name.toLowerCase())} request, and we’ll ${method} you ${timeWord} to confirm your appointment.`}</p>
    </div></section>
    <section class="section section-tight">
      <div class="wrap confirm-grid">
        <div class="confirm-main">
          <article class="appt ${cancelled ? 'is-cancelled' : ''}" aria-labelledby="appt-title">
            <div class="appt-date" aria-hidden="true"><span class="appt-month">${formatDate(start, { month: 'short' })}</span><strong>${start.getDate()}</strong><span>${formatDate(start, { weekday: 'long' })}</span></div>
            <div class="appt-body">
              <p class="appt-status ${cancelled ? 'is-off' : ''}">${cancelled ? 'Cancelled' : past ? 'Completed' : 'Scheduled · pending confirmation'}</p>
              <h2 id="appt-title" class="h-md">Free <span class="nowrap">30-minute</span> consultation</h2>
              <p class="appt-when"><time datetime="${start.toISOString()}">${esc(longDate(start))}, ${timeRange(start)}</time> <span>Central Time</span></p>
              <dl class="appt-meta">
                <div><dt>Format</dt><dd>${formats[ev.format]?.name || '—'}</dd></div>
                <div><dt>With</dt><dd>${atty ? `<a href="#/attorneys/${ev.attorney}">${atty.name}</a>, ${atty.title}` : `First available ${esc(a.name.toLowerCase())} attorney`}</dd></div>
                <div><dt>Matter</dt><dd>${a.name}</dd></div>
                <div><dt>${ev.format === 'office' ? 'Where' : 'How'}</dt><dd>${where}</dd></div>
              </dl>
              ${past ? '' : `<div class="appt-actions">${cancelled
                ? `<button class="btn btn-primary btn-sm" data-action="open-resched" data-ref="${esc(ev.ref)}">Book a new time</button>`
                : `<button class="btn btn-ghost btn-sm" data-action="open-resched" data-ref="${esc(ev.ref)}">Reschedule</button><button class="text-btn danger" data-action="cancel-consult" data-ref="${esc(ev.ref)}">Cancel consultation</button>`}</div>`}
            </div>
          </article>
          ${isResched ? `
            <form class="resched" id="resched" data-form="reschedule" data-ref="${esc(ev.ref)}" novalidate>
              <h2 class="h-md" id="resched-title" tabindex="-1">${cancelled ? 'Choose a new time' : 'Move your consultation'}</h2>
              <p class="hint">Open weekday times over the next two weeks. ${cancelled ? '' : 'Your current time stays booked until you confirm a new one.'}</p>
              ${slotPicker({ day: resched.day, slot: '', ownKey: cancelled ? null : ev.slot, dayAction: 'resched-day' })}
              <div class="step-actions"><button type="button" class="btn btn-ghost" data-action="close-resched">${cancelled ? 'Not now' : 'Keep current time'}</button><button type="submit" class="btn btn-primary">${cancelled ? 'Book this time' : 'Confirm new time'}</button></div>
            </form>` : ''}
          <section class="next-steps">
            <h2 class="h-md">What happens next</h2>
            <ol>
              <li><strong>We review your request</strong><p>Usually within one business day. We also run a routine conflict check to make sure we’re free to help.</p></li>
              <li><strong>We confirm by ${{ call: 'phone', text: 'text', email: 'email' }[method]}</strong><p>We’ll ${method} you at ${esc(reach)} ${timeWord} to confirm the appointment and answer quick questions.</p></li>
              <li><strong>Your consultation</strong><p>Thirty minutes with ${atty ? atty.name : 'an attorney who handles ' + esc(a.name.toLowerCase())}. If you can, bring ${BRING[ev.area]}.</p></li>
              <li><strong>You decide</strong><p>No pressure and no obligation. If we’re a good fit, we’ll explain the fee agreement in writing before any work begins.</p></li>
            </ol>
          </section>
        </div>
        <aside class="confirm-side" aria-label="Your request">
          <details class="request-summary" open>
            <summary>Your request</summary>
            <dl>
              <div><dt>Reference</dt><dd>${esc(ev.ref)}</dd></div>
              <div><dt>Submitted</dt><dd>${esc(formatDate(new Date(ev.createdAt), { month: 'short', day: 'numeric', year: 'numeric' }))}</dd></div>
              ${DETAIL_ROWS[ev.area].map(([key, text, kind]) => `<div><dt>${text}</dt><dd>${displayValue(ev.details[key], kind)}</dd></div>`).join('')}
              <div><dt>Contact</dt><dd>${esc(ev.contact.name)}<br>${esc(ev.contact.phone)}<br>${esc(ev.contact.email)}</dd></div>
            </dl>
          </details>
          <div class="aside-call"><p>Questions before then?</p><a href="${TEL}">${PHONE}</a><span>Mention reference ${esc(ev.ref)}.</span></div>
          <p class="demo-note">Demo request: nothing was sent to anyone. It’s stored only in this browser.</p>
        </aside>
      </div>
    </section>`,
    mount: () => {
      if (isResched && resched.focus) {
        resched.focus = false;
        const form = document.getElementById('resched');
        form?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        document.getElementById('resched-title')?.focus({ preventScroll: true });
      }
    },
  };
}

function notFound() {
  return {
    title: 'Page not found — Hale & Whitaker',
    html: `
    <section class="section notfound"><div class="wrap narrow center">
      ${label('404', 'Page not found')}
      <h1>That page isn’t <em>in our files.</em></h1>
      <p class="lead">The link may be out of date, or the page may have moved. These are good places to start.</p>
      <div class="btn-row center"><a class="btn btn-primary" href="#/">Return home</a><a class="btn btn-ghost" href="#/evaluate">Free case evaluation</a></div>
      <ul class="nf-links"><li><a class="ulink" href="#/practice">Practice areas</a></li><li><a class="ulink" href="#/attorneys">Attorneys</a></li><li><a class="ulink" href="#/contact">Contact</a></li></ul>
    </div></section>`,
  };
}

// ---------------------------------------------------------------- router & actions

// Once a field has been corrected, its error message goes away without waiting for the next submit.
const clearFieldError = (event) => {
  const field = event.target;
  const form = field.form;
  if (!form || !field.name) return;
  const flagged = form.querySelector(`[name="${CSS.escape(field.name)}"][aria-invalid]`);
  if (!flagged) return;
  if (field.type !== 'radio' && field.type !== 'checkbox' && !field.value.trim()) return;
  if (field.type === 'checkbox' && !field.checked) return;
  flagged.removeAttribute('aria-invalid');
  flagged.removeAttribute('aria-describedby');
  document.getElementById(`error-${field.name}`)?.remove();
};
document.addEventListener('input', clearFieldError);
document.addEventListener('change', clearFieldError);

const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });

const motionOK = !inPreview && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (motionOK) document.documentElement.classList.add('js-reveal');
const revealer = motionOK ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-in'); revealer.unobserve(entry.target); } });
}, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }) : null;

function setMenu(open) {
  const toggle = document.querySelector('.menu-toggle');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('.menu-text').textContent = open ? 'Close' : 'Menu';
  document.getElementById('mobile-nav').hidden = !open;
}

const router = createRouter([
  ['/', home],
  ['/practice', practiceIndex],
  ['/practice/:slug', practiceDetail],
  ['/attorneys', attorneysIndex],
  ['/attorneys/:slug', attorneyDetail],
  ['/evaluate', evaluate],
  ['/evaluation/:ref', evaluationPage],
  ['/results', resultsPage],
  ['/fees', feesPage],
  ['/contact', contactPage],
], {
  notFound,
  afterRender: () => {
    setMenu(false);
    onScroll();
    document.querySelectorAll('#app .reveal').forEach((el) => (revealer ? revealer.observe(el) : el.classList.add('is-in')));
  },
});

function updateCalc() {
  const input = document.getElementById('calc-amount');
  if (!input) return;
  const amount = parseAmount(input.value);
  const stage = document.querySelector('input[name="stage"]:checked')?.value === 'suit' ? 'suit' : 'pre';
  const n = calcNumbers(amount, stage);
  const pct = (v) => `${(amount ? Math.min(100, Math.max(0, (v / amount) * 100)) : 0).toFixed(2)}%`;
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set('calc-gross', money(amount));
  set('calc-rate', `(${stage === 'suit' ? '40%' : '33⅓%'})`);
  set('calc-fee', `− ${money(n.fee, true)}`);
  set('calc-costs', `− ${money(n.costs)}`);
  set('calc-net', money(n.net, true));
  document.getElementById('bar-fee').style.width = pct(n.fee);
  document.getElementById('bar-cost').style.width = pct(Math.min(n.costs, Math.max(0, amount - n.fee)));
  document.getElementById('bar-net').style.width = pct(n.net);
  document.getElementById('calc-cost-list').innerHTML = EXAMPLE_COSTS[stage].map(([k, v]) => `<li><span>${k}</span><span>${money(v)}</span></li>`).join('');
  const range = document.getElementById('calc-range');
  if (range && document.activeElement !== range) range.value = Math.min(1000000, Math.max(10000, amount));
  state.calc = { amount, stage };
  save();
}

actions({
  menu: (button) => setMenu(button.getAttribute('aria-expanded') !== 'true'),

  // Free case evaluation
  'intake-save': (form, event) => {
    if (!state.draft || !form.matches('form[data-form="intake"]')) return;
    collect(form);
    save();
    const d = state.draft;
    if (d.step === 2) {
      const det = d.details[d.area] || {};
      if (event.target.name === 'date') { const box = document.getElementById('sol-note'); if (box) box.innerHTML = solNote(det.date); }
      const tips = document.getElementById('step-tips');
      if (tips) tips.innerHTML = tipsFor(d.area, det);
    }
    if (d.step === 4 && event.target.name === 'slot') document.getElementById('selected-slot').innerHTML = selectedSlotText(d.consult.slot);
  },
  intake: (form) => {
    const d = state.draft;
    if (!d) { router.render(); return; }
    if (!validate(form)) return;
    if (d.step === 2 && !checkDate(form)) return;
    collect(form);
    if (d.step === 4 && !slotAvailable(d.consult.slot)) {
      d.consult.slot = '';
      save();
      router.render({ keepScroll: true });
      toast('Sorry, that time is no longer available. Please choose another.');
      return;
    }
    if (d.step === 5) { submitEvaluation(); return; }
    const nextStep = d.review ? ([2, 3, 4].find((n) => n > d.step && !stepComplete(n)) || 5) : d.step + 1;
    goStep(nextStep);
  },
  'intake-back': (button) => {
    const form = button.closest('form');
    if (form) collect(form);
    goStep(Math.max(1, state.draft.step - 1));
  },
  'go-step': (button) => {
    const form = document.querySelector('form[data-form="intake"]');
    if (form) collect(form);
    goStep(Number(button.dataset.step));
  },
  'intake-reset': async () => {
    const ok = await confirmDialog({ title: 'Start over?', message: 'This clears the answers you’ve entered so far.', confirm: 'Start over', cancel: 'Keep my answers' });
    if (!ok) return;
    state.draft = null;
    save();
    router.render({ keepScroll: true });
  },
  'clear-attorney': () => {
    state.draft.attorney = '';
    delete state.draft.consult.attorney;
    save();
    router.render({ keepScroll: true });
  },
  'pick-day': (button) => {
    const form = button.closest('form');
    if (form) collect(form);
    const cs = state.draft.consult;
    cs.day = button.dataset.day;
    if (cs.slot && !cs.slot.startsWith(cs.day)) cs.slot = '';
    save();
    router.render({ keepScroll: true });
  },

  // Confirmation: reschedule and cancel
  'open-resched': (button) => {
    const ev = state.evaluations.find((e) => e.ref === button.dataset.ref);
    if (!ev) return;
    const current = ev.slot.slice(0, 10);
    resched = { ref: ev.ref, day: consultDays().some((d) => dayKey(d) === current) ? current : '', focus: true };
    router.render({ keepScroll: true });
  },
  'resched-day': (button) => {
    if (!resched) return;
    resched.day = button.dataset.day;
    router.render({ keepScroll: true });
  },
  'close-resched': () => { resched = null; router.render({ keepScroll: true }); },
  reschedule: async (form) => {
    if (!validate(form)) return;
    const ev = state.evaluations.find((e) => e.ref === form.dataset.ref);
    const { slot } = formData(form);
    if (!ev) return;
    const wasCancelled = ev.status === 'cancelled';
    if (!slotAvailable(slot, wasCancelled ? null : ev.slot)) { toast('Sorry, that time was just taken. Please choose another.'); router.render({ keepScroll: true }); return; }
    const start = slotDate(slot);
    const ok = await confirmDialog({
      title: wasCancelled ? 'Book this time?' : 'Move your consultation?',
      message: `${longDate(start)}, ${timeRange(start)} (Central Time)${wasCancelled ? '' : `\n\nYour current time, ${shortDate(slotDate(ev.slot))} at ${formatTime(slotDate(ev.slot))}, will be released.`}`,
      confirm: wasCancelled ? 'Book consultation' : 'Move consultation',
      cancel: 'Go back',
    });
    if (!ok) return;
    ev.history.push({ at: Date.now(), from: ev.slot, status: ev.status });
    ev.slot = slot;
    ev.status = 'scheduled';
    resched = null;
    save();
    router.render({ keepScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast(`${wasCancelled ? 'Booked' : 'Moved'}: ${shortDate(start)} at ${formatTime(start)}.`);
  },
  'cancel-consult': async (button) => {
    const ev = state.evaluations.find((e) => e.ref === button.dataset.ref);
    if (!ev) return;
    const start = slotDate(ev.slot);
    const ok = await confirmDialog({
      title: 'Cancel your consultation?',
      message: `${longDate(start)} at ${formatTime(start)}.\n\nYour request stays on file, and you can book a new time whenever you’re ready.`,
      confirm: 'Cancel consultation', cancel: 'Keep it', danger: true,
    });
    if (!ok || ev.status !== 'scheduled') return;
    ev.status = 'cancelled';
    ev.history.push({ at: Date.now(), from: ev.slot, status: 'cancelled' });
    resched = null;
    save();
    router.render({ keepScroll: true });
    toast('Your consultation has been cancelled.');
  },

  // Fees calculator
  calc: () => updateCalc(),
  'calc-range': (range) => { document.getElementById('calc-amount').value = Number(range.value).toLocaleString('en-US'); updateCalc(); },
  'calc-format': (input) => { const n = parseAmount(input.value); input.value = n ? n.toLocaleString('en-US') : ''; },
  'calc-preset': (button) => { document.getElementById('calc-amount').value = Number(button.dataset.value).toLocaleString('en-US'); updateCalc(); },

  // Contact
  contact: (form) => {
    if (!validate(form)) return;
    const v = formData(form);
    const ref = reference('MSG');
    state.messages.push({ ref, name: v.name, email: v.email, phone: v.phone || '', topic: v.topic, message: v.message, at: Date.now() });
    state.profile = { ...state.profile, name: v.name, email: v.email, ...(v.phone ? { phone: v.phone } : {}) };
    save();
    contactSent = { ref, name: v.name, topic: v.topic };
    router.render({ keepScroll: true });
    document.getElementById('contact-done')?.focus({ preventScroll: true });
    document.getElementById('contact-done')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    toast('Message received. We reply within one business day.');
  },
  'contact-again': () => { contactSent = null; router.render({ keepScroll: true }); },
});
