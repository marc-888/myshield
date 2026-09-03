import { useState } from "react";
import {
  ATSILS,
  COURT_PREP,
  EXPERTS,
  GLOVEBOX_TYPES,
  LIBRARY,
  LITIGATION_INDEX,
  MORE_LINKS,
  NOTIFICATIONS,
  PANEL,
  PLAN_ROWS,
  RESOURCE_HEADINGS,
  RIGHTS,
  SERVICE_INDEX,
  TEMPLATES,
} from "@/lib/shield/data";
import { useShield } from "@/lib/shield/store";
import type { RightsState, ScreenId } from "@/lib/shield/types";
import { cn, formatMoney } from "@/lib/utils";
import { BackHeader, InfoBadge } from "./chrome";

function Field({
  label,
  value,
  onChange,
  placeholder,
  area,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  area?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted">{label}</label>
      {area ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="mt-1 w-full rounded-3xl border border-line px-4 py-3 text-sm"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full rounded-2xl border border-line px-4 py-2.5 text-sm"
        />
      )}
    </div>
  );
}

export function RightsScreen() {
  const [state, setState] = useState<RightsState>("qld");
  const go = useShield((s) => s.go);
  return (
    <div>
      <BackHeader title="Know Your Rights" />
      <div className="mb-3">
        <InfoBadge>General information only — not legal advice</InfoBadge>
      </div>
      <div className="mb-4 flex gap-2">
        {(["qld", "nsw", "vic"] as RightsState[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setState(s)}
            className={cn(
              "flex-1 rounded-xl py-2 text-xs font-semibold uppercase",
              state === s ? "bg-navy text-navy-fg" : "bg-elev text-muted",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {RIGHTS[state].map((card) => (
          <div key={card.title} className="rounded-2xl border border-line bg-elev p-4">
            <div className="mb-1 font-semibold">{card.title}</div>
            <p className="text-xs text-muted">{card.body}</p>
            {"note" in card && card.note ? (
              <div className="mt-2 text-[10px] font-medium text-amber-200">{card.note}</div>
            ) : null}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => go("aboriginal")}
        className="mt-4 w-full rounded-2xl border border-amber-700/50 bg-amber-950/30 p-3 text-left text-sm"
      >
        Aboriginal Legal Services →
      </button>
    </div>
  );
}

export function AboriginalScreen() {
  return (
    <div>
      <BackHeader title="Aboriginal Legal Services" to="rights" />
      <div className="mb-4">
        <InfoBadge>Referral information only</InfoBadge>
      </div>
      <div className="mb-4 rounded-2xl border border-amber-700/50 bg-amber-950/30 p-4 text-xs text-amber-200">
        Aboriginal and Torres Strait Islander Legal Services (ATSILS) provide <strong>free</strong>{" "}
        legal help. Many offer 24-hour custody notification. MyShield complements — does not replace
        — these services.
      </div>
      <div className="space-y-3">
        {ATSILS.map((a) => (
          <a
            key={a.name}
            href={a.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-line p-4 hover:border-amber-400"
          >
            <div className="text-sm font-semibold">{a.name}</div>
            <div className="mt-1 text-xs text-muted">{a.detail}</div>
            <div className="mt-2 text-sm text-navy">{a.host} →</div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function GloveboxScreen() {
  const docs = useShield((s) => s.glovebox);
  const add = useShield((s) => s.addGlovebox);
  const remove = useShield((s) => s.removeGlovebox);
  const [type, setType] = useState<(typeof GLOVEBOX_TYPES)[number]["value"]>("drivers_licence");
  const [label, setLabel] = useState("");
  const [consent, setConsent] = useState(false);
  return (
    <div>
      <BackHeader title="Digital Glovebox" />
      <p className="mb-4 text-xs text-muted">
        ID, licence, insurance — ready to show a lawyer during a police stop. Australia-hosted
        AES-256 in production.
      </p>
      <div className="mb-4 space-y-2">
        {docs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-4 text-center text-xs text-muted">
            No documents yet. Add your licence before you need it.
          </div>
        ) : (
          docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-2xl border border-line p-3">
              <div>
                <div className="text-sm font-semibold">{d.label}</div>
                <div className="text-[10px] text-muted">{d.type.replace("_", " ")}</div>
              </div>
              <button type="button" onClick={() => remove(d.id)} className="text-xs text-sos">
                Remove
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mb-4 rounded-2xl border border-line p-4">
        <div className="mb-3 text-sm font-semibold">Add document</div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="mb-2 w-full rounded-xl border border-line px-3 py-2 text-sm"
        >
          {GLOVEBOX_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. QLD Licence)"
          className="mb-3 w-full rounded-xl border border-line px-3 py-2 text-sm"
        />
        <label className="mb-3 flex items-start gap-2 text-[10px]">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 rounded" />
          I consent to encrypted storage of this document on MyShield servers (demo: browser only).
        </label>
        <button
          type="button"
          disabled={!consent || !label.trim()}
          onClick={() => {
            add({ type, label: label.trim() });
            setLabel("");
            setConsent(false);
          }}
          className="w-full rounded-xl bg-navy py-2.5 text-sm font-semibold text-navy-fg disabled:opacity-40"
        >
          Save to Glovebox
        </button>
      </div>
    </div>
  );
}

export function EmergencyScreen() {
  const contacts = useShield((s) => s.contacts);
  const add = useShield((s) => s.addContact);
  const remove = useShield((s) => s.removeContact);
  const alerts = useShield((s) => s.alertsEnabled);
  const setAlerts = useShield((s) => s.setAlerts);
  const testAlert = useShield((s) => s.testAlert);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [log, setLog] = useState<string | null>(null);
  return (
    <div>
      <BackHeader title="Emergency Contacts" />
      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-900">
        When you connect to a lawyer, trusted contacts receive an <strong>SMS alert</strong> with
        your live location and a link to your session status (demo).
      </div>
      <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-3 text-xs">
        <input type="checkbox" checked={alerts} onChange={(e) => setAlerts(e.target.checked)} className="mt-1 rounded" />
        Enable emergency alerts when I request lawyer support
      </label>
      <div className="mb-4 space-y-2">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-2xl border border-line p-3">
            <div>
              <div className="text-sm font-semibold">{c.name}</div>
              <div className="text-xs text-muted">{c.phone}</div>
            </div>
            <button type="button" onClick={() => remove(c.id)} className="text-xs text-sos">
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mb-4 rounded-2xl border border-line p-4">
        <div className="mb-3 text-sm font-semibold">Add contact</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="mb-2 w-full rounded-xl border px-3 py-2 text-sm" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile e.g. 04XX XXX XXX" className="mb-3 w-full rounded-xl border px-3 py-2 text-sm" />
        <button
          type="button"
          onClick={() => {
            if (!name.trim() || !phone.trim()) return;
            add(name.trim(), phone.trim());
            setName("");
            setPhone("");
          }}
          className="w-full rounded-xl bg-sos py-2.5 text-sm font-semibold text-sos-fg"
        >
          Add Contact
        </button>
      </div>
      <button
        type="button"
        onClick={() => setLog(testAlert())}
        className="w-full rounded-2xl bg-elev py-3 text-sm font-semibold text-muted"
      >
        Send test alert (demo)
      </button>
      {log ? <div className="mt-3 rounded-xl bg-elev p-3 text-[10px] text-muted">{log}</div> : null}
    </div>
  );
}

export function FamilyScreen() {
  const family = useShield((s) => s.family);
  const add = useShield((s) => s.addFamily);
  const remove = useShield((s) => s.removeFamily);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState("Partner / Spouse");
  return (
    <div>
      <BackHeader title="Family Plan" />
      <div className="mb-4 rounded-2xl bg-linear-to-r from-navy to-navy-deep p-4 text-navy-fg">
        <div className="text-sm opacity-90">Shield Family</div>
        <div className="mt-1 text-xs opacity-75">$79/mo → $70 shared Shield Credit • Up to 5 members</div>
        <div className="mt-2 inline-block rounded-lg bg-white/10 px-2 py-1 text-[10px]">
          Primary account: Lewis • Billing centralized
        </div>
      </div>
      <div className="mb-2 text-xs font-semibold text-muted">Sub-accounts</div>
      <div className="mb-4 space-y-2">
        {family.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-2xl border p-3">
            <div>
              <div className="text-sm font-semibold">{m.name}</div>
              <div className="text-[10px] text-muted">
                {m.relation} · {m.status}
              </div>
            </div>
            <button type="button" onClick={() => remove(m.id)} className="text-xs text-sos">
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mb-4 rounded-2xl border p-4">
        <div className="mb-3 text-sm font-semibold">Invite family member</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="mb-2 w-full rounded-xl border px-3 py-2 text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="mb-2 w-full rounded-xl border px-3 py-2 text-sm" />
        <select value={relation} onChange={(e) => setRelation(e.target.value)} className="mb-3 w-full rounded-xl border px-3 py-2 text-sm">
          {["Partner / Spouse", "Child (18+)", "Parent", "Sibling", "Other"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            if (!name.trim() || !email.trim()) return;
            add({ name: name.trim(), email: email.trim(), relation });
            setName("");
            setEmail("");
          }}
          className="w-full rounded-xl bg-navy py-2.5 text-sm font-semibold text-navy-fg"
        >
          Send Invite (demo)
        </button>
      </div>
      <div className="rounded-xl bg-elev p-3 text-[10px] text-muted">
        Each member gets their own app login. Lawyer connections draw from shared Shield Credit.
      </div>
    </div>
  );
}

export function DocumentScreen() {
  const incident = useShield((s) => s.incident);
  const setIncident = useShield((s) => s.setIncident);
  const saveIncident = useShield((s) => s.saveIncident);
  const [consent, setConsent] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <BackHeader title="Document What Happened" />
      <div className="mb-4 rounded-2xl border border-amber-700/50 bg-amber-950/30 p-3 text-[10px] text-amber-200">
        <strong>Your personal notes only.</strong> MyShield does not analyse these notes. They are
        not legal advice.
      </div>
      <div className="space-y-4 rounded-3xl border border-line bg-elev p-5">
        <Field label="Date & Time" value={incident.time} onChange={(v) => setIncident({ time: v })} />
        <Field label="Location" value={incident.location} onChange={(v) => setIncident({ location: v })} placeholder="e.g. Gold Coast Highway, Biggera Waters" />
        <Field label="Officer name / badge number (if known)" value={incident.officer} onChange={(v) => setIncident({ officer: v })} placeholder="Optional" />
        <Field label="Witnesses" value={incident.witnesses} onChange={(v) => setIncident({ witnesses: v })} placeholder="Names or descriptions" />
        <Field label="What happened (factual only)" value={incident.notes} onChange={(v) => setIncident({ notes: v })} placeholder="Describe events calmly and factually..." area />
        <label className="flex items-start gap-2 text-[10px]">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 rounded" />
          I consent to MyShield storing these notes securely for my access and optional sharing with my connected lawyer.
        </label>
        <button
          type="button"
          disabled={!consent}
          onClick={() => {
            saveIncident();
            setSaved(true);
          }}
          className="w-full rounded-2xl bg-navy-deep py-3 text-sm font-semibold text-navy-fg disabled:opacity-40"
        >
          Save Secure Note (Demo)
        </button>
        {saved ? <p className="text-center text-xs text-emerald-700">Saved in this browser (demo).</p> : null}
      </div>
    </div>
  );
}

export function WitnessScreen() {
  const incident = useShield((s) => s.incident);
  const setIncident = useShield((s) => s.setIncident);
  const saveIncident = useShield((s) => s.saveIncident);
  const addMatter = useShield((s) => s.addMatter);
  const fireSos = useShield((s) => s.fireSos);
  const go = useShield((s) => s.go);
  const [consent, setConsent] = useState(false);
  const [notify, setNotify] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    saveIncident();
    addMatter("Witness statement — Gold Coast");
    setSaved(true);
    if (notify) fireSos();
  };

  return (
    <div>
      <BackHeader title="Witness a crime" />
      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-[11px] text-red-900">
        If a crime is happening now or someone is in danger, call <strong>000</strong> first. This
        form is for a factual witness record — not a police report and not legal advice.
      </div>
      <div className="space-y-4 rounded-3xl border border-line bg-elev p-5">
        <Field
          label="Date & time"
          value={incident.time}
          onChange={(v) => setIncident({ time: v })}
        />
        <Field
          label="Where did this happen?"
          value={incident.location}
          onChange={(v) => setIncident({ location: v })}
          placeholder="e.g. Gold Coast Highway, Biggera Waters"
        />
        <Field
          label="What did you see? (factual only)"
          value={incident.notes}
          onChange={(v) => setIncident({ notes: v })}
          placeholder="Who, what, when, where. No guesses."
          area
        />
        <Field
          label="Other people present (optional)"
          value={incident.witnesses}
          onChange={(v) => setIncident({ witnesses: v })}
          placeholder="Names or descriptions"
        />
        <label className="flex items-start gap-2 text-[11px]">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="mt-0.5 rounded"
          />
          Also send SOS to my emergency contacts and family
        </label>
        <label className="flex items-start gap-2 text-[11px]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 rounded"
          />
          I consent to storing this witness note in my vault (demo: this browser only).
        </label>
        <button
          type="button"
          disabled={!consent}
          onClick={save}
          className="w-full rounded-2xl bg-amber-700 py-3 text-sm font-semibold text-navy-fg disabled:opacity-40"
        >
          Save witness statement
        </button>
        <button
          type="button"
          onClick={() => go("category")}
          className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg"
        >
          Connect to attorney
        </button>
        {saved ? (
          <p className="text-center text-xs text-emerald-700">
            Saved to My Matters. You can still connect a lawyer.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ComplaintsScreen() {
  return (
    <div>
      <BackHeader title="Make a Complaint" />
      <InfoBadge>Official QLD channels — not MyShield</InfoBadge>
      <div className="mt-4 space-y-3 text-sm">
        {[
          { t: "QPS Ethical Standards Command", d: "Complaints about Queensland Police Service conduct." },
          { t: "Crime and Corruption Commission", d: "Serious corrupt conduct and police misconduct." },
          { t: "Body-worn camera footage", d: "Apply to QPS for footage of your interaction." },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border p-4">
            <div className="font-semibold">{c.t}</div>
            <p className="mt-1 text-xs text-muted">{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CannabisScreen() {
  const go = useShield((s) => s.go);
  return (
    <div>
      <BackHeader title="Medicinal Cannabis" />
      <InfoBadge>General info only</InfoBadge>
      <div className="mt-4 space-y-3 text-xs text-muted">
        <div className="rounded-2xl border p-4">
          Queensland has <strong>zero-tolerance THC</strong> in roadside saliva tests. A valid
          medicinal cannabis prescription is not a defence to drug driving in QLD.
        </div>
        <div className="rounded-2xl border p-4">
          Carry your prescription and clinic details in Digital Glovebox. Do not drive if you may
          test positive.
        </div>
      </div>
      <button type="button" onClick={() => go("category")} className="mt-4 w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg">
        Connect to cannabis-law specialist (demo)
      </button>
    </div>
  );
}

export function TermsScreen() {
  return (
    <div>
      <BackHeader title="Terms of Service" />
      <div className="space-y-3 text-xs text-muted">
        <p>MyShield is a technology and referral platform, not a law firm. Legal advice is provided by independent licensed lawyers. No guarantee of outcomes or availability.</p>
        <p>Users must comply with all laws. Fees are set by lawyers; the platform may charge a referral fee. Liability is limited to the service fee paid.</p>
        <p>This demo is a non-functional prototype for product modelling. Demo PIN to end calls: 1234.</p>
      </div>
    </div>
  );
}

export function PrivacyScreen() {
  return (
    <div>
      <BackHeader title="Privacy Policy" />
      <div className="space-y-3 text-xs text-muted">
        <p>Intended to comply with the Privacy Act 1988 and Australian Privacy Principles in production. This demo stores data in your browser only.</p>
        <p>Evidence Shield recordings (front/back/mic) would be encrypted and stored in Legal Vault. You control access. Deletion on request unless legally required.</p>
      </div>
    </div>
  );
}

export function HotlineScreen() {
  const callHotline = useShield((s) => s.callHotline);
  const status = useShield((s) => s.hotlineStatus);
  return (
    <div>
      <BackHeader title="24/7 Legal Hotline" />
      <div className="mb-4 rounded-3xl border border-navy/40 bg-navy/10 p-5 text-center">
        <div className="text-lg font-semibold text-navy">Always-on legal access</div>
        <p className="mt-2 text-xs text-muted">
          Unlimited phone consults on covered matters while your Shield membership is active —
          inspired by LegalShield prepaid plans.
        </p>
        <button type="button" onClick={callHotline} className="mt-4 w-full rounded-2xl bg-navy py-4 text-sm font-semibold text-navy-fg">
          Call 24/7 Hotline (demo)
        </button>
        {status ? <div className="mt-3 rounded-xl border border-navy/30 bg-paper p-3 text-xs text-navy">{status}</div> : null}
      </div>
      <div className="mb-2 text-xs font-semibold text-muted">Covered matters (Shield Plus+)</div>
      {["Police stops, questioning, traffic & criminal matters", "Consumer disputes, tenancy, employment", "Wills, POA, and family law intake"].map((t) => (
        <div key={t} className="mb-2 rounded-xl border p-3 text-xs text-muted">
          {t}
        </div>
      ))}
    </div>
  );
}

export function AskLawyerScreen() {
  const chat = useShield((s) => s.askChat);
  const push = useShield((s) => s.pushAsk);
  const credits = useShield((s) => s.askCredits);
  const go = useShield((s) => s.go);
  const [q, setQ] = useState("");
  return (
    <div>
      <BackHeader title="Ask a Lawyer" />
      <div className="mb-3 text-xs text-muted">{credits} credits left this month · JustAnswer-style Q&A</div>
      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
        {chat.length === 0 ? (
          <div className="rounded-2xl bg-elev p-4 text-xs text-muted">
            Ask until satisfied on Shield Plus (demo). Try: “Can police search my car without a warrant?”
          </div>
        ) : (
          chat.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[90%] rounded-2xl px-3 py-2 text-xs",
                m.role === "user"
                  ? "ml-auto bg-navy text-navy-fg rounded-br-sm"
                  : "bg-elev text-ink rounded-bl-sm",
              )}
            >
              {m.text}
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask a legal question…"
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            if (!q.trim()) return;
            push(q.trim());
            setQ("");
          }}
          className="rounded-xl bg-navy px-4 text-sm font-semibold text-navy-fg"
        >
          Ask
        </button>
      </div>
      <button type="button" onClick={() => go("experts")} className="mt-3 w-full text-center text-xs text-navy">
        Browse Experts →
      </button>
    </div>
  );
}

export function CopilotScreen() {
  const chat = useShield((s) => s.copilotChat);
  const push = useShield((s) => s.pushCopilot);
  const [q, setQ] = useState("");
  return (
    <div>
      <BackHeader title="Shield Copilot" />
      <p className="mb-3 text-xs text-muted">AI legal assistant • drafts only • not legal advice. Try: “Draft a character reference for court”</p>
      <div className="mb-3 max-h-72 space-y-2 overflow-y-auto">
        {chat.map((m) => (
          <div
            key={m.id}
            className={cn(
              "whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs",
              m.role === "user" ? "ml-auto max-w-[90%] bg-navy text-navy-fg" : "bg-elev text-ink",
            )}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask Copilot to draft…" className="flex-1 rounded-xl border px-3 py-2 text-sm" />
        <button
          type="button"
          onClick={() => {
            if (!q.trim()) return;
            push(q.trim());
            setQ("");
          }}
          className="rounded-xl bg-navy px-4 text-sm font-semibold text-navy-fg"
        >
          Draft
        </button>
      </div>
    </div>
  );
}

export function TemplatesScreen() {
  const [open, setOpen] = useState<string | null>(null);
  const addSigning = useShield((s) => s.addSigning);
  const go = useShield((s) => s.go);
  const tpl = TEMPLATES.find((t) => t.id === open);
  return (
    <div>
      <BackHeader title="Legal Templates" />
      {tpl ? (
        <div>
          <div className="mb-2 text-sm font-semibold">{tpl.name}</div>
          <textarea readOnly value={tpl.body} rows={10} className="mb-3 w-full rounded-2xl border p-3 text-xs" />
          <button
            type="button"
            onClick={() => {
              addSigning(tpl.name);
              go("signing");
            }}
            className="mb-2 w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg"
          >
            Apply E-Signature
          </button>
          <button type="button" onClick={() => setOpen(null)} className="w-full rounded-2xl bg-elev py-3 text-sm">
            Back to library
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setOpen(t.id)}
              className="w-full rounded-2xl border p-3 text-left text-sm"
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SigningScreen() {
  const signing = useShield((s) => s.signing);
  const addSigning = useShield((s) => s.addSigning);
  return (
    <div>
      <BackHeader title="E-Sign & Tracker" />
      <p className="mb-3 text-xs text-muted">Send signing invites — RocketSign style (demo).</p>
      <div className="mb-4 space-y-2">
        {signing.length === 0 ? <p className="text-xs text-muted">No envelopes yet.</p> : null}
        {signing.map((s) => (
          <div key={s.id} className="rounded-2xl border p-3">
            <div className="text-sm font-semibold">{s.title}</div>
            <div className="text-[10px] text-amber-200">{s.status}</div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => addSigning("Character Reference — invite Sarah")} className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg">
        Send signing invite (demo)
      </button>
    </div>
  );
}

export function AttorneyScreen() {
  const logActivity = useShield((s) => s.logActivity);
  const [sent, setSent] = useState(false);
  return (
    <div>
      <BackHeader title="Letters & Calls For You" />
      <p className="mb-3 text-xs text-muted">A lawyer acts for you — LegalShield style demand letters and calls.</p>
      <textarea rows={5} defaultValue="Please contact the other party regarding…" className="mb-3 w-full rounded-2xl border p-3 text-sm" />
      <button
        type="button"
        onClick={() => {
          logActivity("Attorney action requested (demo)");
          setSent(true);
        }}
        className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg"
      >
        Request Lawyer Action
      </button>
      {sent ? <p className="mt-2 text-xs text-emerald-700">Submitted. A panel lawyer would action this in 2–3 business days.</p> : null}
    </div>
  );
}

export function BusinessScreen() {
  const go = useShield((s) => s.go);
  return (
    <div>
      <BackHeader title="Business Legal" />
      <div className="space-y-2">
        {[
          { t: "ABN & company setup", s: "asic" as ScreenId },
          { t: "ATO audit defence", s: "ato" as ScreenId },
          { t: "Contracts & NDA", s: "templates" as ScreenId },
        ].map((x) => (
          <button key={x.t} type="button" onClick={() => go(x.s)} className="w-full rounded-2xl border p-4 text-left text-sm">
            {x.t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WalletScreen() {
  const wallet = useShield((s) => s.wallet);
  const topUp = useShield((s) => s.topUp);
  return (
    <div>
      <BackHeader title="Shield Credit" />
      <div className="mb-4 rounded-3xl bg-navy p-5 text-navy-fg">
        <div className="text-sm opacity-90">Available credit</div>
        <div className="mt-1 text-3xl font-semibold">{formatMoney(wallet)}</div>
        <div className="mt-2 text-xs opacity-80">Shield Basic $15/mo • Renews 25 July 2026</div>
      </div>
      <div className="mb-4 rounded-2xl border p-4 text-xs">
        <div className="mb-2 text-sm font-semibold">How lawyer billing works</div>
        <ol className="list-decimal space-y-2 pl-4 text-muted">
          <li>
            <strong>First 15 minutes — FREE to you.</strong> Included with Shield Basic ($15/mo).
          </li>
          <li>
            <strong>Minutes 16+</strong> — per minute (hourly ÷ 60) from Shield Credit.
          </li>
          <li>
            <strong>Arrest Protection</strong> — video and recording continue after arrest.
          </li>
        </ol>
      </div>
      <div className="mb-3 overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse text-[10px]">
          <thead>
            <tr className="text-left text-muted">
              <th className="p-2">Feature</th>
              <th className="bg-emerald-50 p-2 text-center">Basic ✓</th>
              <th className="p-2 text-center">Plus</th>
              <th className="p-2 text-center">Family</th>
              <th className="p-2 text-center">Pro</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_ROWS.map((row) => (
              <tr key={row.feature} className="border-t">
                <td className="p-2">{row.feature}</td>
                {row.values.map((v, i) => (
                  <td key={i} className={cn("p-2 text-center", i === 0 && "bg-emerald-50/50")}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={topUp} className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg">
        Top up $50 credit (demo)
      </button>
    </div>
  );
}

export function VaultScreen() {
  const vault = useShield((s) => s.vault);
  const add = useShield((s) => s.addVault);
  const remove = useShield((s) => s.removeVault);
  const [name, setName] = useState("");
  return (
    <div>
      <BackHeader title="Legal Vault" />
      <p className="mb-3 text-xs text-muted">
        Your name, photo ID and licence — not a general document dump.
      </p>
      <div className="mb-3 space-y-2">
        {vault.map((d) => (
          <div key={d.id} className="flex justify-between rounded-2xl border p-3 text-sm">
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-[10px] text-muted">{d.kind}</div>
            </div>
            <button type="button" onClick={() => remove(d.id)} className="text-xs text-sos">
              Remove
            </button>
          </div>
        ))}
        {vault.length === 0 ? <p className="text-xs text-muted">Add your legal name and ID.</p> : null}
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Passport"
        className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={() => {
          if (!name.trim()) return;
          add(name.trim(), "Identity");
          setName("");
        }}
        className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg"
      >
        Add ID
      </button>
    </div>
  );
}

export function CalendarScreen() {
  const events = useShield((s) => s.calendar);
  const add = useShield((s) => s.addEvent);
  const remove = useShield((s) => s.removeEvent);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  return (
    <div>
      <BackHeader title="Court & Deadlines" />
      <div className="mb-3 space-y-2">
        {events.map((e) => (
          <div key={e.id} className="flex justify-between rounded-2xl border p-3">
            <div>
              <div className="text-sm font-semibold">{e.title}</div>
              <div className="text-[10px] text-muted">{e.date}</div>
            </div>
            <button type="button" onClick={() => remove(e.id)} className="text-xs text-sos">
              Remove
            </button>
          </div>
        ))}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Southport Magistrates — mention" className="mb-2 w-full rounded-xl border px-3 py-2 text-sm" />
      <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="12 Sep 2026, 9:00am" className="mb-2 w-full rounded-xl border px-3 py-2 text-sm" />
      <button
        type="button"
        onClick={() => {
          if (!title.trim()) return;
          add(title.trim(), date || "TBD", "");
          setTitle("");
          setDate("");
        }}
        className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg"
      >
        Add reminder
      </button>
    </div>
  );
}

export function TicketScreen() {
  const logActivity = useShield((s) => s.logActivity);
  const [done, setDone] = useState(false);
  return (
    <div>
      <BackHeader title="Fine Defence" />
      <p className="mb-3 text-xs text-muted">Infringement review — LegalShield style. Upload the ticket, a lawyer reviews options.</p>
      <input placeholder="Infringement number" className="mb-2 w-full rounded-xl border px-3 py-2 text-sm" />
      <button
        type="button"
        onClick={() => {
          logActivity("Fine submitted for review");
          setDone(true);
        }}
        className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg"
      >
        Submit for Review (2–3 business days)
      </button>
      {done ? <p className="mt-2 text-xs text-emerald-700">Queued for a traffic lawyer (demo).</p> : null}
    </div>
  );
}

export function EstateScreen() {
  const go = useShield((s) => s.go);
  return (
    <div>
      <BackHeader title="Estate Planning" />
      <div className="space-y-2">
        {["Simple Will Starter Kit", "Enduring Power of Attorney", "Advance Health Directive"].map((t) => (
          <button key={t} type="button" onClick={() => go("templates")} className="w-full rounded-2xl border p-4 text-left text-sm">
            {t}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => go("category")} className="mt-4 w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg">
        Book estate planning consult
      </button>
    </div>
  );
}

export function LibraryScreen() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = LIBRARY.filter((a) => a.title.toLowerCase().includes(q.toLowerCase()));
  const article = LIBRARY.find((a) => a.id === open);
  return (
    <div>
      <BackHeader title="Legal Library" />
      {article ? (
        <div>
          <div className="mb-2 font-semibold">{article.title}</div>
          <p className="mb-4 text-xs text-muted">{article.body}</p>
          <button type="button" onClick={() => setOpen(null)} className="text-xs text-navy">
            ← All articles
          </button>
        </div>
      ) : (
        <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guides…" className="mb-3 w-full rounded-xl border px-3 py-2 text-sm" />
          <div className="space-y-2">
            {list.map((a) => (
              <button key={a.id} type="button" onClick={() => setOpen(a.id)} className="w-full rounded-2xl border p-3 text-left text-sm">
                {a.title}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ProviderScreen() {
  return (
    <div>
      <BackHeader title="Your Law Firm" />
      <p className="mb-3 text-xs text-muted">Independent partner panel — not employed by MyShield.</p>
      <div className="space-y-3">
        {PANEL.map((p) => (
          <div key={p.initials} className="flex gap-3 rounded-2xl border p-4">
            <div className={`flex size-10 items-center justify-center rounded-xl text-xs font-bold ${p.color}`}>{p.initials}</div>
            <div>
              <div className="text-sm font-semibold">{p.name}</div>
              <div className="text-xs text-muted">{p.firm}</div>
              <div className="text-[10px] text-muted">{p.specialty}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AddonsScreen() {
  const [on, setOn] = useState<Record<string, boolean>>({});
  return (
    <div>
      <BackHeader title="Supplemental Coverage" />
      {[
        { id: "gig", t: "Gig worker cover", d: "+$9/mo" },
        { id: "id", t: "Identity Shield", d: "+$9/mo" },
        { id: "driver", t: "Rideshare / delivery", d: "+$12/mo" },
      ].map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => setOn((s) => ({ ...s, [a.id]: !s[a.id] }))}
          className="mb-2 flex w-full items-center justify-between rounded-2xl border p-4 text-left"
        >
          <div>
            <div className="text-sm font-semibold">{a.t}</div>
            <div className="text-[10px] text-muted">{a.d}</div>
          </div>
          <span className="text-xs text-navy">{on[a.id] ? "Added" : "Add"}</span>
        </button>
      ))}
    </div>
  );
}

export function DashboardScreen() {
  const wallet = useShield((s) => s.wallet);
  const matters = useShield((s) => s.matters);
  const glovebox = useShield((s) => s.glovebox);
  return (
    <div>
      <BackHeader title="Dashboard" />
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: "Credit", v: formatMoney(wallet) },
          { l: "Matters", v: String(matters.length) },
          { l: "Glovebox", v: String(glovebox.length) },
          { l: "Health", v: "72%" },
        ].map((c) => (
          <div key={c.l} className="rounded-2xl border p-4">
            <div className="text-[10px] text-muted">{c.l}</div>
            <div className="text-lg font-semibold">{c.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SearchScreen() {
  const q = useShield((s) => s.searchQuery);
  const setSearch = useShield((s) => s.setSearch);
  const go = useShield((s) => s.go);
  const hits = SERVICE_INDEX.filter((s) =>
    `${s.name} ${s.tags} ${s.cat}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div>
      <BackHeader title="Search" />
      <input
        value={q}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search all legal services..."
        className="mb-3 w-full rounded-xl border px-3 py-2 text-sm"
        autoFocus
      />
      <div className="space-y-2">
        {hits.map((h) => (
          <button key={h.name} type="button" onClick={() => go(h.screen)} className="w-full rounded-2xl border p-3 text-left">
            <div className="text-sm font-semibold">{h.name}</div>
            <div className="text-[10px] text-muted">{h.cat}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function NotificationsScreen() {
  return (
    <div>
      <BackHeader title="Notifications" />
      <div className="space-y-2">
        {NOTIFICATIONS.map((n) => (
          <div key={n.title} className="rounded-2xl border p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{n.title}</div>
              {n.unread ? <span className="size-2 rounded-full bg-sos" /> : null}
            </div>
            <p className="text-xs text-muted">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServicesHubScreen() {
  const go = useShield((s) => s.go);
  const groups = [...new Set(SERVICE_INDEX.map((s) => s.cat))];
  return (
    <div>
      <BackHeader title="All Legal Services" />
      {groups.map((g) => (
        <div key={g} className="mb-4">
          <div className="mb-2 text-xs font-semibold text-muted">{g}</div>
          <div className="space-y-2">
            {SERVICE_INDEX.filter((s) => s.cat === g).map((s) => (
              <button key={s.name} type="button" onClick={() => go(s.screen)} className="w-full rounded-2xl border p-3 text-left text-sm">
                {s.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MattersScreen() {
  const matters = useShield((s) => s.matters);
  const add = useShield((s) => s.addMatter);
  const remove = useShield((s) => s.removeMatter);
  const [title, setTitle] = useState("");
  return (
    <div>
      <BackHeader title="My Matters" />
      {matters.map((m) => (
        <div key={m.id} className="mb-2 flex justify-between rounded-2xl border p-3">
          <div>
            <div className="text-sm font-semibold">{m.title}</div>
            <div className="text-[10px] text-muted">
              {m.status} · {m.next}
            </div>
          </div>
          <button type="button" onClick={() => remove(m.id)} className="text-xs text-sos">
            Close
          </button>
        </div>
      ))}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New matter" className="mb-2 w-full rounded-xl border px-3 py-2 text-sm" />
      <button
        type="button"
        onClick={() => {
          if (!title.trim()) return;
          add(title.trim());
          setTitle("");
        }}
        className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg"
      >
        Add matter
      </button>
    </div>
  );
}

export function SimpleInfo({
  title,
  body,
  cta,
  action,
}: {
  title: string;
  body: string;
  cta?: string;
  action?: () => void;
}) {
  return (
    <div>
      <BackHeader title={title} />
      <p className="mb-4 text-xs text-muted">{body}</p>
      {cta && action ? (
        <button type="button" onClick={action} className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg">
          {cta}
        </button>
      ) : null}
    </div>
  );
}

export function CourtPrepScreen() {
  const courtPrep = useShield((s) => s.courtPrep);
  const toggle = useShield((s) => s.toggleCourtPrep);
  return (
    <div>
      <BackHeader title="Court Appearance Prep" />
      <div className="space-y-2">
        {COURT_PREP.map((item) => (
          <label key={item} className="flex items-start gap-3 rounded-2xl border p-3 text-xs">
            <input type="checkbox" checked={!!courtPrep[item]} onChange={() => toggle(item)} className="mt-0.5 rounded" />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

export function ExpertsScreen() {
  const go = useShield((s) => s.go);
  return (
    <div>
      <BackHeader title="Browse Experts" />
      <div className="space-y-2">
        {EXPERTS.map((e) => (
          <div key={e.initials} className="flex items-center justify-between rounded-2xl border p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-navy/20 text-xs font-bold text-navy">
                {e.initials}
              </div>
              <div>
                <div className="text-sm font-semibold">{e.name}</div>
                <div className="text-[10px] text-muted">
                  {e.field} · {e.rating}
                </div>
              </div>
            </div>
            <button type="button" onClick={() => go("asklawyer")} className="text-xs font-semibold text-navy">
              Ask
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReferralsScreen() {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <BackHeader title="Refer & Earn $25" />
      <p className="mb-3 text-xs text-muted">Share MyShield. You both get $25 Shield Credit when they subscribe (demo).</p>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText("https://shieldau.example/invite/lewis");
          setCopied(true);
        }}
        className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg"
      >
        {copied ? "Invite link copied" : "Copy invite link"}
      </button>
    </div>
  );
}

export function IdentityScreen() {
  const logActivity = useShield((s) => s.logActivity);
  return (
    <div>
      <BackHeader title="Identity Shield" />
      <p className="mb-3 text-xs text-muted">Credit monitoring + dark-web alerts. +$9/mo add-on (demo).</p>
      <button type="button" onClick={() => logActivity("Identity theft report filed (demo)")} className="w-full rounded-2xl bg-sos py-3 text-sm font-semibold text-sos-fg">
        Report Identity Theft
      </button>
    </div>
  );
}

export function MoreScreen() {
  const go = useShield((s) => s.go);
  const wallet = useShield((s) => s.wallet);
  const credits = useShield((s) => s.askCredits);
  const glovebox = useShield((s) => s.glovebox);
  const contacts = useShield((s) => s.contacts);
  const theme = useShield((s) => s.theme);
  const setTheme = useShield((s) => s.setTheme);
  const hint = (h?: string) => {
    if (h === "credit") return formatMoney(wallet);
    if (h === "credits") return `${credits} credits left`;
    if (h === "docs") return `${glovebox.length} docs`;
    if (h === "contacts") return `${contacts.length} contacts`;
    return h;
  };
  return (
    <div>
      <div className="mb-4 text-lg font-semibold">More</div>
      <div className="mb-4 rounded-2xl border border-line bg-elev p-3">
        <div className="mb-2 text-xs font-semibold text-ink">Appearance</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
              theme === "light" ? "bg-navy text-navy-fg" : "border border-line bg-paper text-ink"
            }`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
              theme === "dark" ? "bg-navy text-navy-fg" : "border border-line bg-paper text-ink"
            }`}
          >
            Dark
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {MORE_LINKS.map((l) => (
          <button
            key={l.label}
            type="button"
            onClick={() => go(l.screen)}
            className="flex w-full items-center justify-between rounded-2xl border p-4 text-left text-sm"
          >
            <span>{l.label}</span>
            <span className="text-[10px] text-muted">{hint(l.hint) ?? "›"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PartnerScreen() {
  const go = useShield((s) => s.go);
  return (
    <div>
      <BackHeader title="Partner Handoff" />
      <div className="mb-4 rounded-2xl bg-navy p-4 text-navy-fg">
        <div className="font-display text-lg">Working model copy</div>
        <p className="mt-1 text-xs opacity-80">
          This is a rebuild of the MyShield demo for your partner to explore, click through, and
          extend. Same product, same copy, same PIN.
        </p>
      </div>
      <div className="space-y-3 text-xs text-muted">
        <div className="rounded-2xl border p-3">
          <div className="mb-1 font-semibold text-ink">How to demo it</div>
          Tick terms → top <strong>24/7</strong> for the hotline, or the large{" "}
          <strong>Connect to attorney</strong> button → Traffic / Drug Driving → PIN{" "}
          <strong>1234</strong>. <strong>Witness</strong> starts dual-cam evidence. <strong>SOS</strong>{" "}
          alerts emergency contacts and family.
        </div>
        <div className="rounded-2xl border p-3">
          <div className="mb-1 font-semibold text-ink">Where to extend</div>
          Product copy & plans live in <code className="text-[10px]">src/lib/shield/data.ts</code>.
          Client state (wallet, glovebox, family, vault) in{" "}
          <code className="text-[10px]">src/lib/shield/store.ts</code>. Screens are one file each
          under <code className="text-[10px]">src/components/shield/</code>.
        </div>
        <div className="rounded-2xl border p-3">
          <div className="mb-1 font-semibold text-ink">Vanilla HTML backup</div>
          Original Render site snapshot is at{" "}
          <a href="/archive/index.html" className="text-navy underline">
            /archive/index.html
          </a>{" "}
          (lawyer portal + install page included). Use it as the source-of-truth mock.
        </div>
        <div className="rounded-2xl border p-3">
          <div className="mb-1 font-semibold text-ink">Production gaps</div>
          Agora video, licensed lawyers, insurance, Privacy Act hosting, real SMS, payments. Demo
          only — not legal advice.
        </div>
      </div>
      <button type="button" onClick={() => go("home")} className="mt-4 w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg">
        Open member home
      </button>
    </div>
  );
}

export function DivorceScreen() {
  const go = useShield((s) => s.go);
  return (
    <SimpleInfo
      title="Divorce & Family Law"
      body="Separation agreements, parenting plans, and property — LegalZoom-style kits plus a family lawyer on the panel. Templates are starting points only."
      cta="Book family lawyer call"
      action={() => go("category")}
    />
  );
}
export function AtoScreen() {
  const logActivity = useShield((s) => s.logActivity);
  return (
    <SimpleInfo
      title="ATO Audit Defence"
      body="Upload the ATO letter. A tax lawyer would review in production. This demo logs the request only."
      cta="Request tax lawyer review"
      action={() => logActivity("ATO review requested")}
    />
  );
}
export function AsicScreen() {
  return (
    <SimpleInfo
      title="ASIC Registered Office"
      body="Registered office / agent mail handling for companies. Production would scan mail into Legal Vault."
    />
  );
}
export function BailScreen() {
  const go = useShield((s) => s.go);
  return (
    <SimpleInfo
      title="Bail & Bond Guide"
      body="If you or a family member is in custody: stay calm, request a lawyer, do not discuss the matter. A bail specialist can join the video line."
      cta="Connect bail lawyer now"
      action={() => go("category")}
    />
  );
}

export function ResourceLibraryScreen() {
  const go = useShield((s) => s.go);
  return (
    <div>
      <BackHeader title="Resource Library" />
      <p className="mb-3 text-xs text-muted">Index of headings. Tap a heading to open it.</p>
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-elev">
        {RESOURCE_HEADINGS.map((h) => (
          <button
            key={h.title}
            type="button"
            onClick={() => go(h.screen)}
            className="flex w-full items-baseline justify-between gap-3 px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-ink">{h.title}</span>
            <span className="shrink-0 text-xs text-muted">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LitigationScreen() {
  const go = useShield((s) => s.go);
  return (
    <div>
      <BackHeader title="Litigation" />
      <p className="mb-3 text-xs text-muted">Templates, letter & call register, and court.</p>
      {LITIGATION_INDEX.map((section) => (
        <div key={section.heading} className="mb-4">
          <div className="mb-2 px-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
            {section.heading}
          </div>
          <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-elev">
            {section.items.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => go(item.screen)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-[11px] text-muted">{item.sub}</div>
                </div>
                <span className="shrink-0 text-xs text-muted">→</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
