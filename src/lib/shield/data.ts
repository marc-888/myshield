import type { CategoryId, GloveboxType, ScreenId } from "./types";

export const APP_NAME = "myShield";
export const DEMO_PIN = "1234";
export const LAWYER_HOURLY_RATE = 360;
export const PER_MIN = LAWYER_HOURLY_RATE / 60;
export const FREE_MINUTES = 15;
export const MEMBER_NAME = "Lewis";
export const MEMBER_LOCATION = "Gold Coast, QLD";
export const STARTING_CREDIT = 149;

export const LAWYER = {
  name: "Dr. Priya Sharma",
  initials: "PS",
  firm: "Gold Coast Criminal Law Group",
  rating: "4.9 • 312 reviews",
  wait: "Available now • < 2 min wait",
  cert: "QLD #S1234567 (demo)",
  specialty: "Police interactions, drug driving",
  color: "bg-blue-200",
};

export const PANEL = [
  LAWYER,
  {
    name: "James Morrow",
    initials: "JM",
    firm: "Morrow Traffic Defence",
    rating: "4.8 • 201 reviews",
    wait: "Available now",
    cert: "QLD #S445512 (demo)",
    specialty: "Traffic, RBT, licence appeals",
    color: "bg-emerald-200",
  },
  {
    name: "Tom Keene",
    initials: "TK",
    firm: "Keene Criminal Chambers",
    rating: "4.7 • 156 reviews",
    wait: "On call",
    cert: "QLD #S778823 (demo)",
    specialty: "Criminal, bail, police complaints",
    color: "bg-amber-200",
  },
];

export const CATEGORIES: {
  id: CategoryId;
  title: string;
  sub: string;
  specialists: string;
  advice: string;
}[] = [
  {
    id: "traffic",
    title: "Traffic / Drug Driving",
    sub: "RBT, saliva tests, licences",
    specialists: "Traffic & Drug Driving specialists",
    advice:
      "Comply with any lawful saliva or breath test request. Do not admit to drug use. Note the time of any prescription medication. I will advise on your specific results and options.",
  },
  {
    id: "criminal",
    title: "Criminal Matters",
    sub: "Arrest, questioning, charges",
    specialists: "Criminal law specialists",
    advice:
      "You have the right to remain silent except for identification when lawfully required. Do not discuss the matter with other detainees. I am your lawyer — wait for my advice before answering police questions.",
  },
  {
    id: "complaint",
    title: "Complaints Against Police",
    sub: "Misconduct, use of force",
    specialists: "Police complaints specialists",
    advice:
      "Document everything factually while fresh. Do not obstruct police. We can discuss formal complaint pathways and whether CCC or Ethical Standards is appropriate for your situation.",
  },
  {
    id: "general",
    title: "General Police Interaction",
    sub: "Stopped, searched, questioned",
    specialists: "General police interaction",
    advice:
      "Stay calm. Comply with lawful directions. You may decline to answer incriminating questions. Ask if you are under arrest or free to leave.",
  },
  {
    id: "cannabis",
    title: "Medicinal Cannabis Related",
    sub: "Prescription, driving, workplace",
    specialists: "Medicinal cannabis & criminal law",
    advice:
      "Queensland has zero-tolerance THC driving laws regardless of prescription. Comply with testing. Do not drive if you may test positive. I will advise on your specific circumstances.",
  },
];

export const SERVICE_INDEX: { name: string; screen: ScreenId; tags: string; cat: string }[] = [
  { name: "Instant Lawyer Video", screen: "category", tags: "emergency police attorney video", cat: "Emergency" },
  { name: "SOS Alert", screen: "home", tags: "sos emergency family contacts sms", cat: "Emergency" },
  { name: "Witness a Crime", screen: "witness", tags: "witness crime statement police", cat: "Emergency" },
  { name: "24/7 Legal Hotline", screen: "hotline", tags: "phone call legalshield", cat: "Emergency" },
  { name: "Resource Library", screen: "resourcelibrary", tags: "headings index guides library", cat: "Resources" },
  { name: "Litigation", screen: "litigation", tags: "templates letters court register", cat: "Court" },
  { name: "Shield Copilot AI", screen: "copilot", tags: "ai draft rocket lawyer", cat: "Consult" },
  { name: "Browse Experts", screen: "experts", tags: "specialist justanswer", cat: "Consult" },
  { name: "Legal Templates", screen: "templates", tags: "document rocket lawyer", cat: "Documents" },
  { name: "E-Sign & Signing Tracker", screen: "signing", tags: "sign rocketsign", cat: "Documents" },
  { name: "Legal Vault", screen: "vault", tags: "storage archive", cat: "Documents" },
  { name: "Letters & Calls For You", screen: "attorney", tags: "legalshield demand", cat: "Documents" },
  { name: "Fine & Infringement Defence", screen: "ticket", tags: "traffic ticket speeding", cat: "Traffic" },
  { name: "Court & Deadlines", screen: "calendar", tags: "reminder legalzoom", cat: "Court" },
  { name: "Court Appearance Prep", screen: "courtprep", tags: "checklist trial", cat: "Court" },
  { name: "My Matters", screen: "matters", tags: "case tracker", cat: "Court" },
  { name: "Bail & Bond Guide", screen: "bail", tags: "arrest custody", cat: "Criminal" },
  { name: "Know Your Rights", screen: "rights", tags: "qld nsw vic police", cat: "Criminal" },
  { name: "Estate Planning", screen: "estate", tags: "will poa", cat: "Estate" },
  { name: "Divorce & Family Law", screen: "divorce", tags: "separation parenting", cat: "Family" },
  { name: "Business Legal", screen: "business", tags: "abn company", cat: "Business" },
  { name: "ASIC Registered Office", screen: "asic", tags: "registered agent mail", cat: "Business" },
  { name: "ATO Audit Defence", screen: "ato", tags: "tax audit", cat: "Business" },
  { name: "Digital Glovebox", screen: "glovebox", tags: "id licence", cat: "MyShield" },
  { name: "Emergency Contacts", screen: "emergency", tags: "sms location alert", cat: "MyShield" },
  { name: "Family Plan", screen: "family", tags: "sub accounts", cat: "Membership" },
  { name: "Identity Shield", screen: "identity", tags: "theft monitoring", cat: "Membership" },
  { name: "Supplemental Coverage", screen: "addons", tags: "gig gun driver", cat: "Membership" },
  { name: "Your Law Firm", screen: "provider", tags: "panel legalshield", cat: "Membership" },
  { name: "Legal Library", screen: "library", tags: "articles guides", cat: "Resources" },
  { name: "Medicinal Cannabis", screen: "cannabis", tags: "thc driving qld", cat: "Resources" },
  { name: "Aboriginal Legal Services", screen: "aboriginal", tags: "atsils als vals", cat: "Resources" },
  { name: "Partner Handoff", screen: "partner", tags: "model copy architecture", cat: "Partner" },
];

export const TEMPLATES = [
  { id: "stat-dec", name: "Statutory Declaration (QLD)", body: "I, [full name] of [address], do solemnly and sincerely declare that:\n\n1. \n\nAnd I make this solemn declaration conscientiously believing the same to be true." },
  { id: "character-ref", name: "Character Reference Letter", body: "To the Presiding Magistrate,\n\nI have known [name] for [years] in the capacity of [relationship]. They are of good character…\n\nYours faithfully,\n[Your name]" },
  { id: "complaint-letter", name: "Police Complaint Letter", body: "To: Ethical Standards Command\n\nI wish to make a formal complaint regarding an incident on [date] at [location]. Factual account:\n\n" },
  { id: "tenancy-notice", name: "Tenancy Notice to Leave", body: "Notice to Leave — Residential Tenancies and Rooming Accommodation Act 2008 (Qld)\n\nPremises: \nGrounds: \nHandover date: " },
  { id: "employment", name: "Casual Employment Agreement", body: "Casual Employment Agreement\nEmployer:\nEmployee:\nHourly rate:\nDuties:\n" },
  { id: "will-starter", name: "Simple Will Starter Kit", body: "Last Will and Testament of [name]\nI revoke all former wills. I appoint [executor] as executor. I give…\n" },
  { id: "nda", name: "Non-Disclosure Agreement (NDA)", body: "Confidentiality Agreement between [Party A] and [Party B]. The Recipient must not disclose Confidential Information…" },
  { id: "lease", name: "Residential Lease Agreement", body: "Residential Tenancy Agreement\nLessor:\nTenant:\nRent:\nBond:\nTerm:\n" },
  { id: "poa", name: "Enduring Power of Attorney", body: "Enduring Power of Attorney (Qld)\nPrincipal:\nAttorney:\nPowers: financial / personal / health\n" },
  { id: "separation", name: "Separation Agreement", body: "Separation Agreement\nParties:\nDate of separation:\nParenting / property in principle (not legal advice):\n" },
];

export const RESOURCE_HEADINGS: { title: string; screen: ScreenId }[] = [
  { title: "Know Your Rights", screen: "rights" },
  { title: "Roadside breath & saliva tests (QLD)", screen: "library" },
  { title: "Right to silence vs identification", screen: "library" },
  { title: "If you are arrested", screen: "library" },
  { title: "Vehicle searches", screen: "library" },
  { title: "Complaints in Queensland", screen: "complaints" },
  { title: "QLD tenancy basics", screen: "library" },
  { title: "Aboriginal Legal Services", screen: "aboriginal" },
  { title: "Medicinal Cannabis", screen: "cannabis" },
  { title: "Fine & Infringement Defence", screen: "ticket" },
  { title: "Bail & Bond Guide", screen: "bail" },
  { title: "Court Appearance Prep", screen: "courtprep" },
  { title: "Estate Planning", screen: "estate" },
  { title: "Divorce & Family Law", screen: "divorce" },
  { title: "Business Legal", screen: "business" },
];

export const LITIGATION_INDEX: { heading: string; items: { title: string; sub: string; screen: ScreenId }[] }[] = [
  {
    heading: "Legal Templates",
    items: [
      { title: "Statutory Declaration (QLD)", sub: "Form starter", screen: "templates" },
      { title: "Character Reference Letter", sub: "Court-ready draft", screen: "templates" },
      { title: "Police Complaint Letter", sub: "Factual account", screen: "templates" },
      { title: "All legal templates", sub: "Docs + e-sign", screen: "templates" },
    ],
  },
  {
    heading: "Letter & Call Register",
    items: [
      { title: "Letters & calls for you", sub: "Lawyer acts on your behalf", screen: "attorney" },
      { title: "E-Sign & signing tracker", sub: "Envelopes and status", screen: "signing" },
      { title: "Demand letter register", sub: "Sent correspondence log", screen: "attorney" },
    ],
  },
  {
    heading: "Court",
    items: [
      { title: "Court & deadlines", sub: "Reminders and dates", screen: "calendar" },
      { title: "Court appearance prep", sub: "Checklist before you go", screen: "courtprep" },
      { title: "My matters", sub: "Case tracker", screen: "matters" },
      { title: "Fine defence", sub: "Infringements", screen: "ticket" },
    ],
  },
];

export const LIBRARY = [
  { id: "rbt", title: "Roadside breath & saliva tests (QLD)", body: "Police may require a roadside breath or saliva test. Refusal is a separate offence. Prescription cannabis is not a defence to QLD drug driving." },
  { id: "silence", title: "Right to silence vs identification", body: "You generally do not have to answer incriminating questions. You should still give your name and address when lawfully required." },
  { id: "arrest", title: "If you are arrested", body: "Ask if you are under arrest and why. Request a lawyer. Do not resist. MyShield can keep the lawyer on the line after arrest (demo)." },
  { id: "search", title: "Vehicle searches", body: "Police need lawful authority — warrant, consent, or a specific power. Stay calm, do not obstruct, and note badge numbers." },
  { id: "ccc", title: "Complaints in Queensland", body: "QPS Ethical Standards Command handles internal complaints. Serious corrupt conduct can go to the Crime and Corruption Commission." },
  { id: "tenancy", title: "QLD tenancy basics", body: "Bonds, notices to leave, and repair obligations sit under the RTRA Act. Templates in this demo are starting points only." },
];

export const RIGHTS = {
  qld: [
    { title: "Right to Silence", body: "You generally have the right to remain silent and not answer questions that may incriminate you. You should still provide your name and address when lawfully required under the Police Powers and Responsibilities Act 2000 (Qld)." },
    { title: "Drug & Alcohol Testing", body: "You must comply with lawful directions to provide a breath, blood, or saliva sample. Queensland roadside drug testing detects THC, methamphetamine, and MDMA. Refusing a lawful test is a separate offence with serious penalties.", note: "QLD has zero-tolerance THC in saliva — prescription is not a defence to drug driving." },
    { title: "Search & Seizure", body: "Police may search you, your vehicle, or property only with lawful authority — e.g. a warrant, your consent, or specific powers under PPRA." },
    { title: "Complaints & Footage", body: "Complaints: QPS Ethical Standards Command or Crime and Corruption Commission (CCC). You may apply for body-worn camera footage through QPS." },
  ],
  nsw: [
    { title: "Right to Silence", body: "Under the Law Enforcement (Powers and Responsibilities) Act 2002 (NSW), you must provide your name and address in certain situations. You generally do not have to answer other questions or participate in an interview beyond identification requirements." },
    { title: "Drug & Alcohol Testing", body: "You must comply with lawful breath, blood, oral fluid, or urine tests. Refusing is a serious offence. NSW has a limited medicinal cannabis defence for oral fluid THC — subject to strict conditions. Check current law.", note: "Always comply with testing. Do not rely on this summary — laws are complex and change." },
    { title: "Search Powers", body: "Police searches in NSW require lawful authority under LEPRA — e.g. warrant, arrest, reasonable suspicion, or vehicle search powers. You can ask: “Am I under arrest? Am I free to leave?”" },
  ],
  vic: [
    { title: "Right to Silence", body: "You generally have the right to remain silent. You must still state your name and address when lawfully required. Ask for a lawyer before a formal interview." },
    { title: "Testing", body: "Victoria requires compliance with lawful alcohol and drug testing. Refusal is an offence. Medicinal cannabis does not automatically authorise driving." },
    { title: "Complaints", body: "Complaints about Victoria Police can go to Professional Standards Command or IBAC for serious misconduct." },
  ],
};

export const ATSILS = [
  { name: "ATSILS Queensland", detail: "State-wide criminal, civil, and family law. 24hr custody helpline.", href: "https://www.atsils.org.au/", host: "atsils.org.au" },
  { name: "ALS NSW/ACT", detail: "Aboriginal Legal Service for NSW and ACT. Police custody legal advice.", href: "https://www.alsnswact.org.au/", host: "alsnswact.org.au" },
  { name: "VALS — Victoria", detail: "Victorian Aboriginal Legal Service. Criminal, civil, and family law.", href: "https://www.vals.org.au/", host: "vals.org.au" },
];

export const PLANS = [
  { id: "basic", name: "Basic", price: 15, credit: "Pay as you go", hotline: false, current: true },
  { id: "plus", name: "Plus", price: 49, credit: "$45", hotline: true, current: false },
  { id: "family", name: "Family", price: 79, credit: "$70", hotline: true, current: false },
  { id: "pro", name: "Pro", price: 99, credit: "$90", hotline: true, current: false },
];

export const PLAN_ROWS: { feature: string; values: string[] }[] = [
  { feature: "Monthly price", values: ["$15", "$49", "$79", "$99"] },
  { feature: "Free lawyer time (per call)", values: ["15 min", "15 min", "15 min", "15 min"] },
  { feature: "Overage credit pool", values: ["Pay as you go", "$45", "$70", "$90"] },
  { feature: "24/7 hotline", values: ["—", "✓", "✓", "✓"] },
  { feature: "Ask a Lawyer credits", values: ["2 / mo", "Unlimited", "Unlimited", "Unlimited"] },
  { feature: "Legal templates", values: ["3", "All", "All", "All"] },
  { feature: "E-sign", values: ["—", "✓", "✓", "✓"] },
  { feature: "Shield Copilot", values: ["—", "✓", "✓", "✓"] },
  { feature: "Legal Vault", values: ["500MB", "5GB", "10GB", "25GB"] },
  { feature: "Family seats", values: ["1", "1", "5", "10"] },
];

export const GLOVEBOX_TYPES: { value: GloveboxType; label: string }[] = [
  { value: "drivers_licence", label: "Driver's Licence" },
  { value: "photo_id", label: "Photo ID" },
  { value: "medicare", label: "Medicare Card" },
  { value: "insurance", label: "Vehicle Insurance" },
  { value: "rego", label: "Registration" },
  { value: "prescription", label: "Medicinal Prescription" },
  { value: "other", label: "Other" },
];

export const COURT_PREP = [
  "Confirm court date, time, and courtroom in Calendar",
  "Dress appropriately — business casual minimum",
  "Arrive 30 minutes early with photo ID",
  "Bring all documents — notices, bail papers, character refs",
  "Phone on silent — lawyer will attend or appear via video",
  "Do not discuss case in courthouse corridors",
  "Address the bench as Your Honour",
  "Answer only the question asked — wait for your lawyer",
];

export const EXPERTS = [
  { name: "Dr. Priya Sharma", field: "Criminal & traffic", rating: "4.9", initials: "PS" },
  { name: "James Morrow", field: "Traffic defence", rating: "4.8", initials: "JM" },
  { name: "Tom Keene", field: "Bail & complaints", rating: "4.7", initials: "TK" },
  { name: "Aisha Rahman", field: "Family & parenting", rating: "4.9", initials: "AR" },
  { name: "Ben Walsh", field: "Business & ABN", rating: "4.6", initials: "BW" },
];

export const NOTIFICATIONS = [
  { title: "Court reminder", body: "No court dates on file. Add one from Court & Deadlines.", unread: true },
  { title: "Shield Basic active", body: "First 15 minutes of lawyer time included on every call.", unread: true },
  { title: "Partner panel online", body: "3 QLD criminal & traffic specialists available.", unread: true },
  { title: "Vault ID on file", body: "Name, photo ID and QLD licence stored in Legal Vault.", unread: false },
];

export const NAV_FOR_SCREEN: Record<ScreenId, "home" | "ask" | "glovebox" | "more"> = {
  home: "home",
  category: "home",
  precall: "home",
  connect: "home",
  call: "home",
  postcall: "home",
  hotline: "home",
  copilot: "home",
  vault: "home",
  calendar: "home",
  ticket: "home",
  estate: "home",
  library: "home",
  resourcelibrary: "ask",
  litigation: "home",
  dashboard: "home",
  search: "home",
  notifications: "home",
  services: "home",
  matters: "home",
  courtprep: "home",
  asklawyer: "ask",
  templates: "ask",
  attorney: "ask",
  business: "ask",
  rights: "ask",
  aboriginal: "ask",
  divorce: "ask",
  ato: "ask",
  asic: "ask",
  bail: "ask",
  experts: "ask",
  signing: "ask",
  cannabis: "ask",
  complaints: "ask",
  document: "glovebox",
  glovebox: "glovebox",
  more: "more",
  wallet: "more",
  emergency: "more",
  family: "more",
  terms: "more",
  privacy: "more",
  identity: "more",
  addons: "more",
  provider: "more",
  referrals: "more",
  partner: "more",
  witness: "home",
  hit: "home",
};

export const MORE_LINKS: { label: string; screen: ScreenId; hint?: string }[] = [
  { label: "24/7 Legal Hotline", screen: "hotline", hint: "Included" },
  { label: "Resource Library", screen: "resourcelibrary" },
  { label: "Litigation", screen: "litigation" },
  { label: "Shield Credit & Plans", screen: "wallet", hint: "credit" },
  { label: "Digital Glovebox", screen: "glovebox", hint: "docs" },
  { label: "Emergency Contacts", screen: "emergency", hint: "contacts" },
  { label: "Witness a Crime", screen: "witness" },
  { label: "Family Plan", screen: "family" },
  { label: "Identity Shield", screen: "identity" },
  { label: "Partner Handoff", screen: "partner", hint: "model" },
  { label: "Terms of Service", screen: "terms" },
  { label: "Privacy Policy", screen: "privacy" },
];

export function calculateCallCost(totalMinutes: number) {
  const minutes = Math.max(totalMinutes, 0.1);
  const freeBlock = { label: "First 15 min (included in Shield Basic)", amount: 0 };
  if (minutes <= FREE_MINUTES) {
    return { total: 0, breakdown: [freeBlock], phase: "Included in subscription" };
  }
  const extraMins = Math.ceil(minutes - FREE_MINUTES);
  const extraCost = extraMins * PER_MIN;
  return {
    total: extraCost,
    breakdown: [
      freeBlock,
      { label: `Minutes 16–${Math.ceil(minutes)} (${extraMins} min × $${PER_MIN.toFixed(2)})`, amount: extraCost },
    ],
    phase: `Per-minute billing (${extraMins} min after free block)`,
  };
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
