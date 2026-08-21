import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Camera,
  Car,
  Check,
  CloudUpload,
  Gavel,
  IdCard,
  Leaf,
  Lock,
  Mic,
  MicOff,
  Share,
  Shield,
  ShieldUser,
  Video,
  VideoOff,
} from "lucide-react";
import { CATEGORIES, LAWYER, PER_MIN, calculateCallCost } from "@/lib/shield/data";
import { useShield } from "@/lib/shield/store";
import type { CategoryId } from "@/lib/shield/types";
import { cn, formatMoney, formatTimer } from "@/lib/utils";
import { BackHeader } from "./chrome";

const CAT_ICONS = {
  traffic: Car,
  criminal: Gavel,
  complaint: Shield,
  general: ShieldUser,
  cannabis: Leaf,
};

export function CategoryScreen() {
  const category = useShield((s) => s.category);
  const setCategory = useShield((s) => s.setCategory);
  const startMatch = useShield((s) => s.startMatch);

  return (
    <div>
      <BackHeader title="What do you need help with?" />
      <div className="mb-4 rounded-2xl border border-amber-700/50 bg-amber-950/30 p-3 text-xs text-amber-200">
        Pick a category only if you have time. Connect to attorney from home sends the live case instantly.
      </div>
      <div className="mb-5 space-y-2">
        {CATEGORIES.map((c) => {
          const Icon = CAT_ICONS[c.id];
          const selected = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border p-4 text-left",
                selected ? "border-navy bg-navy/15 shadow-[0_0_0_2px_var(--color-navy)]" : "border-line",
              )}
            >
              <Icon className="size-5 text-navy" />
              <div>
                <div className="text-sm font-semibold">{c.title}</div>
                <div className="text-xs text-muted">{c.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={!category}
        onClick={startMatch}
        className="w-full rounded-2xl bg-emerald-600 py-4 text-sm font-semibold text-navy-fg disabled:opacity-40"
      >
        Connect Lawyer Now
      </button>
    </div>
  );
}

export function PrecallScreen() {
  const go = useShield((s) => s.go);
  const startMatch = useShield((s) => s.startMatch);
  const alertsEnabled = useShield((s) => s.alertsEnabled);
  const setAlerts = useShield((s) => s.setAlerts);
  const [ok, setOk] = useState(false);

  return (
    <div>
      <BackHeader title="Before you connect" to="category" />
      <div className="mb-4 rounded-2xl border border-navy/40 bg-navy/10 p-4 text-sm">
        <div className="mb-2 font-semibold text-blue-900">General reminders (not legal advice)</div>
        <ul className="list-disc space-y-2 pl-4 text-xs text-blue-800">
          <li>Remain calm and polite where possible.</li>
          <li>Comply with lawful directions (ID, breath/saliva tests when required).</li>
          <li>
            You may choose not to answer questions that could incriminate you — but you should still
            provide name and address when lawfully required.
          </li>
          <li>Do not resist lawful arrest — resistance can be a separate offence.</li>
        </ul>
      </div>
      <label className="mb-3 flex cursor-pointer items-start gap-3 text-xs">
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 rounded" />
        <span>
          I understand I must comply with lawful police directions and that the lawyer will provide
          advice specific to my situation.
        </span>
      </label>
      <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-3 text-xs">
        <input
          type="checkbox"
          checked={alertsEnabled}
          onChange={(e) => setAlerts(e.target.checked)}
          className="mt-1 rounded"
        />
        <span>
          <strong>Alert emergency contacts</strong> — send SMS with my live location when I connect
          (demo).{" "}
          <button type="button" onClick={() => go("emergency")} className="text-red-700 underline">
            Manage contacts
          </button>
        </span>
      </label>
      <button
        type="button"
        disabled={!ok}
        onClick={startMatch}
        className="w-full rounded-2xl bg-emerald-600 py-4 text-sm font-semibold text-navy-fg disabled:opacity-40"
      >
        Proceed to Video Connect
      </button>
    </div>
  );
}

export function ConnectScreen() {
  const matchingProgress = useShield((s) => s.matchingProgress);
  const matchingLabel = useShield((s) => s.matchingLabel);
  const category = useShield((s) => s.category);
  const wallet = useShield((s) => s.wallet);
  const go = useShield((s) => s.go);
  const cat = CATEGORIES.find((c) => c.id === category);

  return (
    <div>
      <BackHeader title="Connecting..." />
      <div className="mb-6 rounded-3xl border border-line bg-elev p-6 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-navy/20">
          <Shield className="size-8 text-navy" />
        </div>
        <div className="text-lg font-semibold">{matchingLabel}</div>
        <div className="mt-1 text-sm text-muted">{cat?.specialists ?? "Queensland specialists"}</div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-line">
          <div
            className="h-2 bg-navy-deep transition-all duration-700"
            style={{ width: `${matchingProgress}%` }}
          />
        </div>
      </div>

      {matchingProgress >= 85 ? (
        <div>
          <div className="mb-4 rounded-3xl border border-line bg-elev p-5">
            <div className="flex gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-navy/30 text-sm font-bold text-navy">
                {LAWYER.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{LAWYER.name}</div>
                <div className="text-xs text-muted">Partner: {LAWYER.firm}</div>
                <div className="mt-1 text-[10px] text-muted">{LAWYER.rating}</div>
                <div className="mt-1 text-sm text-panel">{LAWYER.wait}</div>
                <div className="mt-1 text-[10px] text-muted">Practising cert: {LAWYER.cert}</div>
                <div className="mt-1 text-xs text-muted">Specialist: {LAWYER.specialty}</div>
              </div>
            </div>
            <div className="mt-3 border-t pt-3 text-[10px] text-muted">
              Independent legal practitioner. Advice provided by lawyer, not MyShield. Client care
              agreement applies.
            </div>
          </div>
          <div className="mb-4 space-y-2 rounded-2xl bg-elev p-4 text-xs text-muted">
            <div className="font-semibold text-ink">Billing from your Shield Credit</div>
            <div className="flex justify-between">
              <span>Lawyer rate</span>
              <span>$360/hr</span>
            </div>
            <div className="flex justify-between">
              <span>First 15 minutes</span>
              <span className="font-semibold text-emerald-700">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>Then per minute (min 16+)</span>
              <span>${PER_MIN.toFixed(2)}/min</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 font-semibold text-ink">
              <span>Your balance</span>
              <span>{formatMoney(wallet)}</span>
            </div>
          </div>
          <div className="py-2 text-center text-sm font-medium text-emerald-700">Starting video session...</div>
          <div className="mt-3 text-center">
            <button type="button" onClick={() => go("home")} className="text-xs text-muted">
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CallScreen() {
  const tickCall = useShield((s) => s.tickCall);
  const callSeconds = useShield((s) => s.callSeconds);
  const category = useShield((s) => s.category);
  const lawyerMuted = useShield((s) => s.lawyerMuted);
  const previewOn = useShield((s) => s.previewOn);
  const arrestProtection = useShield((s) => s.arrestProtection);
  const emergencyBanner = useShield((s) => s.emergencyBanner);
  const toggleMute = useShield((s) => s.toggleMute);
  const togglePreview = useShield((s) => s.togglePreview);
  const activateArrest = useShield((s) => s.activateArrest);
  const openPin = useShield((s) => s.openPin);
  const go = useShield((s) => s.go);
  const logActivity = useShield((s) => s.logActivity);
  const [recReady, setRecReady] = useState(false);

  useEffect(() => {
    const t = setInterval(tickCall, 1000);
    const r = setTimeout(() => setRecReady(true), 1200);
    return () => {
      clearInterval(t);
      clearTimeout(r);
    };
  }, [tickCall]);

  const cat = CATEGORIES.find((c) => c.id === (category as CategoryId));
  const cost = calculateCallCost(callSeconds / 60);
  const recClass = recReady ? "bg-sos/90 text-sos-fg" : "bg-amber-500/90 text-canvas";

  return (
    <div>
      {emergencyBanner ? (
        <div className="slide-down mb-3 flex items-center gap-2 rounded-xl bg-sos px-3 py-2 text-[10px] text-sos-fg">
          {emergencyBanner}
        </div>
      ) : null}
      {arrestProtection ? (
        <div className="mb-3 rounded-xl bg-amber-600 px-3 py-2 text-[10px] text-navy-fg">
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="size-3" /> Arrest Protection — session & recording continue
          </div>
          <div className="mt-1 opacity-90">
            Lawyer stays on. Front cam, back cam, and mic keep recording after arrest. Evidence
            saved to your vault — independent of police body-cam footage.
          </div>
        </div>
      ) : null}

      <div className="relative mb-2 aspect-3/4 overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 to-slate-800">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-canvas">
          <div className="relative mb-2 h-36 w-28 overflow-hidden rounded-2xl border-2 border-emerald-500 bg-zinc-900 shadow-lg">
            <div className="flex h-full items-center justify-center bg-navy text-2xl font-bold text-navy-fg">
              {LAWYER.initials}
            </div>
            {lawyerMuted ? (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
                <MicOff className="size-6" />
              </div>
            ) : null}
          </div>
          <div className="rounded-full bg-white/90 px-3 py-1 font-semibold">{LAWYER.name}</div>
          <div className="mt-1 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-800">
            <span className="rec-dot size-2 rounded-full bg-sos" />
            LIVE • {formatTimer(callSeconds)}
          </div>
          <div className="mt-2 rounded-lg bg-white/90 px-2 py-1 text-[10px] text-canvas">
            {recReady ? "Agora E2E channel ready (demo)" : "Connecting Agora video…"}
          </div>
        </div>
        {previewOn ? (
          <div className="absolute right-3 bottom-3 z-10 aspect-3/4 w-[28%] overflow-hidden rounded-xl border-2 border-white/30 bg-zinc-800">
            <div className="flex h-full flex-col items-center justify-center text-[8px] text-muted">
              <Camera className="mb-1 size-4" />
              Front cam
            </div>
            <div className="absolute bottom-1 left-1 rounded bg-sos/90 px-1.5 py-0.5 text-[8px] font-semibold text-sos-fg">
              FRONT REC
            </div>
          </div>
        ) : null}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-2 py-1 text-[9px] font-medium text-canvas">
            <Lock className="mr-1 inline size-2.5" />
            Agora E2E
          </span>
          <span className="rounded-full bg-emerald-600/80 px-2 py-1 text-[9px] text-navy-fg">Agora + dual cam</span>
        </div>
      </div>

      <div className="mb-2 rounded-xl border border-line bg-elev px-3 py-2 text-[10px] text-muted">
        <span className="font-semibold text-ink">Channel:</span>{" "}
        <code className="text-blue-800">shield-gc-{category ?? "general"}-demo</code>{" "}
        <Link to="/lawyer" className="ml-2 text-blue-600 underline">
          Lawyer portal
        </Link>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2 text-[10px]">
        {["Front", "Back", "Mic", "Cloud"].map((label) => (
          <div
            key={label}
            className={cn(
              "flex items-center justify-center gap-1 rounded-xl px-2 py-1.5 font-semibold",
              recClass,
            )}
          >
            {label === "Mic" ? <Mic className="size-3" /> : label === "Cloud" ? <CloudUpload className="size-3" /> : <Camera className="size-3" />}
            {label} {recReady ? "ON" : "…"}
          </div>
        ))}
      </div>

      <div className="mb-3 rounded-2xl bg-zinc-900 p-3 text-xs text-zinc-100">
        <div className="mb-1 text-[10px] text-muted">LAWYER (independent — not MyShield)</div>
        <div>
          “{cat?.advice ?? "Stay calm. Show the officer I am your lawyer on screen. Comply with lawful directions. Do not answer incriminating questions until I advise you."}”
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between rounded-xl border border-navy/40 bg-navy/10 p-2.5 text-xs">
        <div>
          <span className="font-medium text-blue-800">Your cost this call</span>
          <div className="text-[10px] text-blue-600">{cost.phase}</div>
        </div>
        <div className="text-right">
          <span className="font-semibold text-blue-900">{formatMoney(cost.total)}</span>
          <div className="text-[10px] text-muted">First 15 min free with $15/mo</div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-5 gap-2">
        <button type="button" onClick={toggleMute} className="flex flex-col items-center gap-1 rounded-xl bg-elev py-2.5 text-[10px] font-medium">
          {lawyerMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />} Lawyer
        </button>
        <button type="button" onClick={togglePreview} className="flex flex-col items-center gap-1 rounded-xl bg-elev py-2.5 text-[10px] font-medium">
          {previewOn ? <Video className="size-4" /> : <VideoOff className="size-4" />} Preview
        </button>
        <button type="button" onClick={() => go("glovebox")} className="flex flex-col items-center gap-1 rounded-xl bg-navy/20 py-2.5 text-[10px] font-medium text-navy">
          <IdCard className="size-4" /> ID
        </button>
        <button
          type="button"
          onClick={() => logActivity("Notes shared with lawyer (demo)")}
          className="flex flex-col items-center gap-1 rounded-xl bg-elev py-2.5 text-[10px] font-medium"
        >
          <Share className="size-4" /> Notes
        </button>
        <button type="button" onClick={activateArrest} className="flex flex-col items-center gap-1 rounded-xl bg-amber-100 py-2.5 text-[10px] font-medium text-amber-900">
          <Lock className="size-4" /> Arrest
        </button>
      </div>

      <button
        type="button"
        onClick={openPin}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sos py-3.5 text-sm font-semibold text-sos-fg"
      >
        <Lock className="size-4" /> End Session (PIN required)
      </button>
      <div className="mt-2 text-center text-[10px] text-muted">
        Evidence Shield records <strong>front camera</strong>, <strong>back camera</strong>, and{" "}
        <strong>microphone</strong> together. Recording cannot be stopped during a session (demo).
      </div>
    </div>
  );
}

export function PostcallScreen() {
  const receipt = useShield((s) => s.receipt);
  const chunks = useShield((s) => s.chunks);
  const go = useShield((s) => s.go);
  const addMatter = useShield((s) => s.addMatter);
  const logActivity = useShield((s) => s.logActivity);

  return (
    <div>
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-100">
          <Check className="size-6 text-emerald-600" />
        </div>
        <div className="text-lg font-semibold">Video session ended</div>
        <div className="text-xs text-muted">Summary from your independent lawyer (demo)</div>
      </div>
      <div className="mb-4 space-y-3 rounded-2xl border border-line bg-elev p-4 text-sm">
        <div>
          <span className="text-xs text-muted">Duration</span>
          <div>{receipt ? formatTimer(receipt.durationSec) : "—"}</div>
        </div>
        <div>
          <span className="text-xs text-muted">Next steps (from lawyer)</span>
          <div className="text-xs text-muted">
            Do not discuss the matter with anyone except your lawyer. If charged, contact our office
            within 24 hours. Preserve any dashcam or witness details.
          </div>
        </div>
        <div>
          <span className="text-xs text-muted">Billing breakdown</span>
          <div className="mt-1 space-y-1 text-xs">
            {receipt?.breakdown.map((b) => (
              <div key={b.label} className="flex justify-between">
                <span>{b.label}</span>
                <span>{formatMoney(b.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 text-sm font-semibold">
            <span>Deducted from Shield Credit</span>
            <span>{receipt ? formatMoney(receipt.total) : "—"}</span>
          </div>
          <div className="mt-1 text-[10px] text-muted">
            Remaining balance: <span className="font-medium">{receipt ? formatMoney(receipt.remaining) : "—"}</span>
          </div>
          <div className="mt-2 text-[10px] text-amber-200">
            Evidence Shield saved {chunks.length} hashed GPS chunks. Dual-cam recording stopped and backed up.
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => logActivity("Call receipt downloaded (demo)")}
        className="mb-2 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-navy-fg"
      >
        Download call receipt (PDF)
      </button>
      <button
        type="button"
        onClick={() => {
          addMatter("Police interaction — Gold Coast");
          go("matters");
        }}
        className="mb-2 w-full rounded-2xl bg-navy/20 py-3 text-sm font-semibold text-navy"
      >
        Add to My Matters
      </button>
      <button
        type="button"
        onClick={() => go("document")}
        className="mb-2 w-full rounded-2xl border border-navy/40 py-3 text-sm font-semibold text-navy"
      >
        Update incident notes
      </button>
      <button type="button" onClick={() => go("home")} className="w-full rounded-2xl bg-elev py-3 text-sm font-semibold">
        Back to home
      </button>
    </div>
  );
}
