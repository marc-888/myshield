export type ScreenId =
  | "home"
  | "category"
  | "precall"
  | "connect"
  | "call"
  | "postcall"
  | "rights"
  | "aboriginal"
  | "glovebox"
  | "emergency"
  | "family"
  | "document"
  | "complaints"
  | "cannabis"
  | "terms"
  | "privacy"
  | "hotline"
  | "asklawyer"
  | "templates"
  | "attorney"
  | "business"
  | "identity"
  | "copilot"
  | "vault"
  | "calendar"
  | "ticket"
  | "estate"
  | "library"
  | "provider"
  | "addons"
  | "dashboard"
  | "search"
  | "notifications"
  | "services"
  | "matters"
  | "divorce"
  | "ato"
  | "asic"
  | "courtprep"
  | "bail"
  | "experts"
  | "signing"
  | "referrals"
  | "wallet"
  | "more"
  | "partner"
  | "witness"
  | "hit";

export type NavTab = "home" | "ask" | "glovebox" | "more";

export type CategoryId =
  | "traffic"
  | "criminal"
  | "complaint"
  | "general"
  | "cannabis";

export type RightsState = "qld" | "nsw" | "vic";

export type GloveboxType =
  | "drivers_licence"
  | "photo_id"
  | "medicare"
  | "insurance"
  | "rego"
  | "prescription"
  | "other";

export type Contact = { id: string; name: string; phone: string };
export type FamilyMember = {
  id: string;
  name: string;
  email: string;
  relation: string;
  status: "active" | "invited";
};
export type VaultDoc = { id: string; name: string; kind: string; addedAt: string };
export type GloveboxDoc = {
  id: string;
  type: GloveboxType;
  label: string;
  addedAt: string;
};
export type CalendarEvent = { id: string; title: string; date: string; note: string };
export type Matter = { id: string; title: string; status: string; next: string };
export type ChatMsg = { id: string; role: "user" | "expert" | "ai"; text: string };
export type Activity = { id: string; text: string; at: string };
export type SigningEntry = { id: string; title: string; status: string };

export type SosHit = {
  name: string;
  channel: string;
  kind: "contact" | "family";
};

export type CallReceipt = {
  durationSec: number;
  total: number;
  remaining: number;
  breakdown: { label: string; amount: number }[];
  phase: string;
  recorded: boolean;
};

export type EvidenceMode = "witness" | "attorney" | "sos";

export type DualCamMode = "concurrent" | "multiplex" | "none";

export type EvidenceChunk = {
  seq: number;
  ts: string;
  lat: number;
  lng: number;
  hash: string;
  prev: string;
  cipher: string;
  local: boolean;
  cloud: boolean;
};
