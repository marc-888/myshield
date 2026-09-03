import { create } from "zustand";
import { calculateCallCost, DEMO_PIN, STARTING_CREDIT, uid } from "./data";
import { NAV_FOR_SCREEN } from "./data";
import { primeDualCameras, publishLive } from "./evidence";
import type {
  Activity,
  CalendarEvent,
  CallReceipt,
  CategoryId,
  ChatMsg,
  Contact,
  EvidenceChunk,
  EvidenceMode,
  FamilyMember,
  GloveboxDoc,
  Matter,
  NavTab,
  ScreenId,
  SigningEntry,
  SosHit,
  VaultDoc,
  DualCamMode,
} from "./types";

const LS = {
  terms: "shieldau_terms_accepted",
  wallet: "shieldau_wallet",
  glovebox: "shieldau_glovebox",
  emergency: "shieldau_emergency",
  family: "shieldau_family",
  vault: "shieldau_vault",
  alerts: "shieldau_emergency_alerts",
  theme: "myshield_theme",
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function nextHistory(history: ScreenId[], current: ScreenId, next: ScreenId): ScreenId[] {
  if (current === next) return history;
  return [...history, current].slice(-24);
}

const DEFAULT_EMERGENCY: Contact[] = [
  { id: "e1", name: "Sarah Mitchell", phone: "0412 345 678" },
  { id: "e2", name: "James Mitchell", phone: "0423 456 789" },
];

const DEFAULT_FAMILY: FamilyMember[] = [
  { id: "f1", name: "Sarah Mitchell", email: "sarah.m@email.com", relation: "Partner / Spouse", status: "active" },
  { id: "f2", name: "Tom Mitchell", email: "tom.m@email.com", relation: "Child (18+)", status: "invited" },
];

const DEFAULT_VAULT: VaultDoc[] = [
  { id: "v1", name: "Lewis Mitchell", kind: "Legal name", addedAt: "On file" },
  { id: "v2", name: "Australian Photo ID", kind: "Photo ID", addedAt: "On file" },
  { id: "v3", name: "QLD Driver Licence", kind: "Licence", addedAt: "On file" },
];

export type ShieldState = {
  hydrated: boolean;
  termsAccepted: boolean;
  screen: ScreenId;
  history: ScreenId[];
  nav: NavTab;
  wallet: number;
  askCredits: number;
  category: CategoryId | null;
  matchingProgress: number;
  matchingLabel: string;
  matching: boolean;
  callActive: boolean;
  callSeconds: number;
  lawyerMuted: boolean;
  previewOn: boolean;
  arrestProtection: boolean;
  emergencyBanner: string | null;
  lawyerLeft: boolean;
  pinOpen: boolean;
  pinBuffer: string;
  pinError: string | null;
  receipt: CallReceipt | null;
  glovebox: GloveboxDoc[];
  contacts: Contact[];
  alertsEnabled: boolean;
  family: FamilyMember[];
  vault: VaultDoc[];
  calendar: CalendarEvent[];
  matters: Matter[];
  askChat: ChatMsg[];
  copilotChat: ChatMsg[];
  incident: { time: string; location: string; officer: string; witnesses: string; notes: string };
  activity: Activity[];
  searchQuery: string;
  hotlineStatus: string | null;
  signing: SigningEntry[];
  checkupDone: boolean;
  courtPrep: Record<string, boolean>;
  sosOpen: boolean;
  sosHits: SosHit[];
  sosAt: string | null;
  evidenceMode: EvidenceMode | null;
  recording: boolean;
  recSeconds: number;
  torchOn: boolean;
  torchUserOff: boolean;
  torchUserOn: boolean;
  torchReason: string;
  gps: { lat: number; lng: number; accuracy: number } | null;
  chunks: EvidenceChunk[];
  cloudOk: boolean;
  camerasLive: boolean;
  rearLive: boolean;
  frontLive: boolean;
  dualCamMode: DualCamMode;
  theme: "light" | "dark";
  hydrate: () => void;
  acceptTerms: () => void;
  go: (screen: ScreenId) => void;
  back: () => void;
  navTo: (tab: NavTab) => void;
  setCategory: (id: CategoryId) => void;
  startMatch: () => void;
  tickMatch: () => void;
  beginCall: () => void;
  lawyerHangUp: () => void;
  tickCall: () => void;
  toggleMute: () => void;
  togglePreview: () => void;
  activateArrest: () => void;
  openPin: () => void;
  closePin: () => void;
  pinPress: (key: string) => void;
  endCall: () => void;
  topUp: () => void;
  addGlovebox: (doc: Omit<GloveboxDoc, "id" | "addedAt">) => void;
  removeGlovebox: (id: string) => void;
  addContact: (name: string, phone: string) => void;
  removeContact: (id: string) => void;
  setAlerts: (on: boolean) => void;
  testAlert: () => string;
  addFamily: (member: Omit<FamilyMember, "id" | "status">) => void;
  removeFamily: (id: string) => void;
  addVault: (name: string, kind: string) => void;
  removeVault: (id: string) => void;
  addEvent: (title: string, date: string, note: string) => void;
  removeEvent: (id: string) => void;
  addMatter: (title: string) => void;
  removeMatter: (id: string) => void;
  pushAsk: (text: string) => void;
  pushCopilot: (text: string) => void;
  setIncident: (patch: Partial<ShieldState["incident"]>) => void;
  saveIncident: () => void;
  setSearch: (q: string) => void;
  callHotline: () => void;
  addSigning: (title: string) => void;
  runCheckup: () => void;
  toggleCourtPrep: (item: string) => void;
  logActivity: (text: string) => void;
  fireSos: () => void;
  closeSos: () => void;
  startEvidence: (mode: EvidenceMode) => void;
  stopEvidence: () => void;
  tickRec: () => void;
  setTorchUser: (state: "auto" | "on" | "off") => void;
  setTorchState: (on: boolean, reason: string) => void;
  setGps: (lat: number, lng: number, accuracy: number) => void;
  pushChunk: (chunk: EvidenceChunk) => void;
  markCloud: (seq: number) => void;
  setCamerasLive: (rear: boolean, front: boolean, mode?: DualCamMode) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
};

export const useShield = create<ShieldState>((set, get) => ({
  hydrated: false,
  termsAccepted: false,
  screen: "home",
  history: [],
  nav: "home",
  wallet: STARTING_CREDIT,
  askCredits: 3,
  category: null,
  matchingProgress: 0,
  matchingLabel: "Searching panel...",
  matching: false,
  callActive: false,
  callSeconds: 0,
  lawyerMuted: false,
  previewOn: true,
  arrestProtection: false,
  emergencyBanner: null,
  lawyerLeft: false,
  pinOpen: false,
  pinBuffer: "",
  pinError: null,
  receipt: null,
  glovebox: [],
  contacts: DEFAULT_EMERGENCY,
  alertsEnabled: true,
  family: DEFAULT_FAMILY,
  vault: DEFAULT_VAULT,
  calendar: [],
  matters: [],
  askChat: [],
  copilotChat: [],
  incident: {
    time: "21 August 2026, 2:08pm",
    location: "",
    officer: "",
    witnesses: "",
    notes: "",
  },
  activity: [],
  searchQuery: "",
  hotlineStatus: null,
  signing: [],
  checkupDone: false,
  courtPrep: {},
  sosOpen: false,
  sosHits: [],
  sosAt: null,
  evidenceMode: null,
  recording: false,
  recSeconds: 0,
  torchOn: false,
  torchUserOff: false,
  torchUserOn: false,
  torchReason: "Checking light…",
  gps: null,
  chunks: [],
  cloudOk: false,
  camerasLive: false,
  rearLive: false,
  frontLive: false,
  dualCamMode: "none",
  theme: "light",

  hydrate: () => {
    if (get().hydrated) return;
    const walletRaw = typeof window !== "undefined" ? localStorage.getItem(LS.wallet) : null;
    const themeRaw = typeof window !== "undefined" ? localStorage.getItem(LS.theme) : null;
    const theme = themeRaw === "dark" ? "dark" : "light";
    set({
      hydrated: true,
      termsAccepted: typeof window !== "undefined" && localStorage.getItem(LS.terms) === "true",
      wallet: walletRaw ? Number(walletRaw) : STARTING_CREDIT,
      glovebox: readJson(LS.glovebox, [] as GloveboxDoc[]),
      contacts: readJson(LS.emergency, DEFAULT_EMERGENCY),
      family: readJson(LS.family, DEFAULT_FAMILY),
      vault: readJson(LS.vault, DEFAULT_VAULT),
      alertsEnabled: typeof window === "undefined" || localStorage.getItem(LS.alerts) !== "false",
      theme,
    });
  },

  acceptTerms: () => {
    localStorage.setItem(LS.terms, "true");
    set({ termsAccepted: true });
  },

  go: (screen) => {
    const { callActive, pinOpen, screen: current, history } = get();
    if (callActive && screen !== "call" && screen !== "glovebox" && screen !== "hit") {
      if (!pinOpen) set({ pinOpen: true, pinBuffer: "", pinError: null });
      return;
    }
    set({
      screen,
      nav: NAV_FOR_SCREEN[screen],
      history: nextHistory(history, current, screen),
    });
  },

  back: () => {
    const { pinOpen, sosOpen, callActive, screen, history } = get();
    if (pinOpen) {
      set({ pinOpen: false, pinBuffer: "", pinError: null });
      return;
    }
    if (sosOpen) {
      set({ sosOpen: false });
      return;
    }
    if (callActive && screen === "call") return;
    const prev = history[history.length - 1];
    if (!prev) {
      if (screen !== "home") set({ screen: "home", nav: "home", history: [] });
      return;
    }
    set({
      screen: prev,
      nav: NAV_FOR_SCREEN[prev],
      history: history.slice(0, -1),
    });
  },

  navTo: (tab) => {
    if (get().callActive && tab !== "glovebox") {
      set({ pinOpen: true, pinBuffer: "", pinError: null });
      return;
    }
    const screen: ScreenId =
      tab === "home" ? "home" : tab === "ask" ? "asklawyer" : tab === "glovebox" ? "glovebox" : "more";
    const { screen: current, history } = get();
    set({
      nav: tab,
      screen,
      history: tab === "home" ? [] : nextHistory(history, current, screen),
    });
  },

  setCategory: (id) => set({ category: id }),

  startMatch: () => {
    const { alertsEnabled, contacts } = get();
    if (!get().recording) {
      void primeDualCameras();
      set({
        evidenceMode: "attorney",
        recording: true,
        recSeconds: 0,
        torchUserOff: false,
        torchUserOn: false,
        chunks: [],
        cloudOk: false,
        camerasLive: false,
        rearLive: false,
        frontLive: false,
        dualCamMode: "none",
      });
    }
    set({
      screen: "hit",
      nav: "home",
      matching: true,
      matchingProgress: 8,
      matchingLabel: "Connecting you to a lawyer now…",
      category: get().category ?? "criminal",
      lawyerLeft: false,
      callActive: false,
      emergencyBanner: alertsEnabled
        ? `Emergency alert sent to ${contacts[0]?.name ?? "trusted contacts"} (demo)`
        : null,
    });
    get().logActivity(`Instant attorney connect — ${(get().category ?? "criminal")} · dual cam live`);
    publishLive({ type: "case", category: get().category ?? "criminal", recSeconds: get().recSeconds });
  },

  tickMatch: () => {
    const p = get().matchingProgress;
    if (p < 45) set({ matchingProgress: 45, matchingLabel: "Checking availability..." });
    else if (p < 85) set({ matchingProgress: 85, matchingLabel: "Matching specialist..." });
    else set({ matchingProgress: 100, matchingLabel: "Lawyer found — handing them the live case" });
  },

  beginCall: () =>
    set({
      screen: "hit",
      matching: false,
      callActive: true,
      callSeconds: 0,
      lawyerMuted: false,
      previewOn: true,
      arrestProtection: false,
      lawyerLeft: false,
    }),

  lawyerHangUp: () => {
    if (!get().callActive && !get().matching) return;
    set({
      callActive: false,
      matching: false,
      matchingProgress: 0,
      lawyerLeft: true,
      pinOpen: false,
      screen: "hit",
    });
    get().logActivity("Lawyer left the session — dual-cam evidence still recording");
  },

  tickCall: () => set({ callSeconds: get().callSeconds + 1 }),

  toggleMute: () => set({ lawyerMuted: !get().lawyerMuted }),
  togglePreview: () => set({ previewOn: !get().previewOn }),
  activateArrest: () => {
    set({ arrestProtection: true });
    get().logActivity("Arrest Protection activated — recording continues");
  },

  openPin: () => set({ pinOpen: true, pinBuffer: "", pinError: null }),
  closePin: () => set({ pinOpen: false, pinBuffer: "", pinError: null }),

  pinPress: (key) => {
    if (key === "clear") {
      set({ pinBuffer: "", pinError: null });
      return;
    }
    const next = (get().pinBuffer + key).slice(0, 4);
    set({ pinBuffer: next, pinError: null });
    if (next.length === 4) {
      if (next === DEMO_PIN) get().endCall();
      else set({ pinError: "Incorrect PIN. Demo PIN is 1234.", pinBuffer: "" });
    }
  },

  endCall: () => {
    const minutes = get().callSeconds / 60;
    const cost = calculateCallCost(minutes);
    const remaining = Math.max(0, get().wallet - cost.total);
    localStorage.setItem(LS.wallet, String(remaining));
    const n = get().chunks.length;
    const receipt: CallReceipt = {
      durationSec: get().callSeconds,
      total: cost.total,
      remaining,
      breakdown: cost.breakdown,
      phase: cost.phase,
      recorded: true,
    };
    set({
      callActive: false,
      matching: false,
      matchingProgress: 0,
      lawyerLeft: false,
      pinOpen: false,
      pinBuffer: "",
      pinError: null,
      wallet: remaining,
      screen: "postcall",
      receipt,
      recording: false,
      camerasLive: false,
      rearLive: false,
      frontLive: false,
      torchOn: false,
    });
    get().logActivity(`You ended the session — ${n} encrypted chunks saved · ${cost.phase}`);
    publishLive({ type: "session-end" });
  },

  topUp: () => {
    const next = get().wallet + 50;
    localStorage.setItem(LS.wallet, String(next));
    set({ wallet: next });
    get().logActivity("Added $50 Shield Credit (demo)");
  },

  addGlovebox: (doc) => {
    const next = [...get().glovebox, { ...doc, id: uid(), addedAt: new Date().toISOString() }];
    writeJson(LS.glovebox, next);
    set({ glovebox: next });
  },
  removeGlovebox: (id) => {
    const next = get().glovebox.filter((d) => d.id !== id);
    writeJson(LS.glovebox, next);
    set({ glovebox: next });
  },

  addContact: (name, phone) => {
    const next = [...get().contacts, { id: uid(), name, phone }];
    writeJson(LS.emergency, next);
    set({ contacts: next });
  },
  removeContact: (id) => {
    const next = get().contacts.filter((c) => c.id !== id);
    writeJson(LS.emergency, next);
    set({ contacts: next });
  },
  setAlerts: (on) => {
    localStorage.setItem(LS.alerts, String(on));
    set({ alertsEnabled: on });
  },
  testAlert: () => {
    const msg = `Demo SMS to ${get().contacts.map((c) => c.name).join(", ") || "no contacts"} — Lewis connecting to a lawyer, Gold Coast Hwy (simulated location).`;
    get().logActivity("Test emergency alert sent");
    return msg;
  },

  addFamily: (member) => {
    const next = [...get().family, { ...member, id: uid(), status: "invited" as const }];
    writeJson(LS.family, next);
    set({ family: next });
  },
  removeFamily: (id) => {
    const next = get().family.filter((m) => m.id !== id);
    writeJson(LS.family, next);
    set({ family: next });
  },

  addVault: (name, kind) => {
    const next = [...get().vault, { id: uid(), name, kind, addedAt: new Date().toISOString() }];
    writeJson(LS.vault, next);
    set({ vault: next });
  },
  removeVault: (id) => {
    const next = get().vault.filter((d) => d.id !== id);
    writeJson(LS.vault, next);
    set({ vault: next });
  },

  addEvent: (title, date, note) =>
    set({ calendar: [...get().calendar, { id: uid(), title, date, note }] }),
  removeEvent: (id) => set({ calendar: get().calendar.filter((e) => e.id !== id) }),

  addMatter: (title) =>
    set({
      matters: [...get().matters, { id: uid(), title, status: "Open", next: "Follow up with lawyer" }],
    }),
  removeMatter: (id) => set({ matters: get().matters.filter((m) => m.id !== id) }),

  pushAsk: (text) => {
    const credits = Math.max(0, get().askCredits - 1);
    const reply =
      credits === 0
        ? "That’s your last Ask credit this cycle (demo). Upgrade to Shield Plus for unlimited Q&A. This is general information, not legal advice."
        : "Thanks — a panel lawyer would review this in production. For a police stop: stay calm, comply with lawful directions, and request a lawyer before answering incriminating questions. General information only.";
    set({
      askCredits: credits,
      askChat: [
        ...get().askChat,
        { id: uid(), role: "user", text },
        { id: uid(), role: "expert", text: reply },
      ],
    });
  },

  pushCopilot: (text) => {
    const lower = text.toLowerCase();
    const draft = lower.includes("character")
      ? "Draft (demo):\n\nTo the Presiding Magistrate,\n\nI have known Lewis for several years. They are of good character in our community. This letter is a starting point — have your lawyer review before filing."
      : "Copilot draft (demo, not legal advice):\n\n1. Stay factual.\n2. Do not admit facts you are unsure of.\n3. Attach dates, locations, and witnesses.\n4. Share with your independent lawyer before sending.";
    set({
      copilotChat: [
        ...get().copilotChat,
        { id: uid(), role: "user", text },
        { id: uid(), role: "ai", text: draft },
      ],
    });
  },

  setIncident: (patch) => set({ incident: { ...get().incident, ...patch } }),
  saveIncident: () => get().logActivity("Incident notes saved (demo, browser only)"),

  setSearch: (q) => {
    set({ searchQuery: q });
    if (get().screen !== "search") get().go("search");
  },

  callHotline: () =>
    set({
      hotlineStatus:
        "Connecting to Shield Plus hotline (demo)… A duty lawyer would take this call in production. Stay on the line.",
    }),

  addSigning: (title) =>
    set({ signing: [...get().signing, { id: uid(), title, status: "Awaiting signature" }] }),

  runCheckup: () => {
    set({ checkupDone: true });
    get().logActivity("Legal Health Checkup complete — score 72%");
    get().go("dashboard");
  },

  toggleCourtPrep: (item) =>
    set({ courtPrep: { ...get().courtPrep, [item]: !get().courtPrep[item] } }),

  logActivity: (text) =>
    set({
      activity: [{ id: uid(), text, at: new Date().toLocaleTimeString() }, ...get().activity].slice(0, 8),
    }),

  fireSos: () => {
    const { contacts, family } = get();
    const hits: SosHit[] = [
      ...contacts.map((c) => ({
        name: c.name,
        channel: `SMS ${c.phone}`,
        kind: "contact" as const,
      })),
      ...family.map((f) => ({
        name: f.name,
        channel: `SMS + email ${f.email}`,
        kind: "family" as const,
      })),
    ];
    set({
      sosOpen: true,
      sosHits: hits,
      sosAt: new Date().toLocaleString(),
    });
    if (!get().recording) get().startEvidence("sos");
    else if (get().screen !== "hit") set({ screen: "hit", nav: "home" });
    get().logActivity(
      `SOS sent to ${contacts.length} emergency contact${contacts.length === 1 ? "" : "s"} and ${family.length} family member${family.length === 1 ? "" : "s"}`,
    );
  },

  closeSos: () => set({ sosOpen: false }),

  startEvidence: (mode) => {
    void primeDualCameras();
    set({
      evidenceMode: mode,
      recording: true,
      recSeconds: 0,
      torchUserOff: false,
      torchUserOn: false,
      chunks: [],
      cloudOk: false,
      camerasLive: false,
      rearLive: false,
      frontLive: false,
      dualCamMode: "none",
      lawyerLeft: false,
      screen: "hit",
      nav: "home",
      history: nextHistory(get().history, get().screen, "hit"),
    });
    get().logActivity(
      mode === "witness"
        ? "Witness capture started — dual cam + GPS"
        : mode === "attorney"
          ? "Attorney connect — both cameras on, case sent to lawyer"
          : "SOS evidence recording started",
    );
    if (mode === "attorney") get().startMatch();
  },

  stopEvidence: () => {
    const n = get().chunks.length;
    set({
      recording: false,
      camerasLive: false,
      rearLive: false,
      frontLive: false,
      dualCamMode: "none",
      torchOn: false,
    });
    get().logActivity(`Evidence stopped — ${n} encrypted chunks saved`);
    if (get().screen === "hit") set({ screen: "home", nav: "home", history: [] });
  },

  tickRec: () => {
    if (get().recording) set({ recSeconds: get().recSeconds + 1 });
  },

  setTorchUser: (state) => {
    set({
      torchUserOff: state === "off",
      torchUserOn: state === "on",
    });
  },

  setTorchState: (on, reason) => set({ torchOn: on, torchReason: reason }),
  setGps: (lat, lng, accuracy) => set({ gps: { lat, lng, accuracy } }),
  pushChunk: (chunk) => {
    const next = [...get().chunks, chunk].slice(-48);
    set({ chunks: next });
    writeJson("shieldau_evidence_chunks", next);
  },
  markCloud: (seq) => {
    const next = get().chunks.map((c) => (c.seq === seq ? { ...c, cloud: true } : c));
    set({ chunks: next, cloudOk: next.some((c) => c.cloud) });
  },
  setCamerasLive: (rear, front, mode) =>
    set({
      rearLive: rear,
      frontLive: front,
      camerasLive: rear || front,
      dualCamMode: mode ?? (rear && front ? "concurrent" : "none"),
    }),
  setTheme: (theme) => {
    localStorage.setItem(LS.theme, theme);
    set({ theme });
  },
  toggleTheme: () => {
    const theme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem(LS.theme, theme);
    set({ theme });
  },
}));
