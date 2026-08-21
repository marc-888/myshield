import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BatteryMedium,
  Home,
  Info,
  MessageSquare,
  FolderClosed,
  Ellipsis,
  Shield,
  Siren,
  Wifi,
} from "lucide-react";
import { APP_NAME, DEMO_PIN } from "@/lib/shield/data";
import { useShield } from "@/lib/shield/store";
import type { ScreenId } from "@/lib/shield/types";
import { cn, formatMoney } from "@/lib/utils";
import { EvidenceEngine } from "./evidence";

export function BackHeader({ title, to = "home" }: { title: string; to?: ScreenId }) {
  const go = useShield((s) => s.go);
  return (
    <div className="mb-4 flex items-center gap-3">
      <button
        type="button"
        onClick={() => go(to)}
        className="text-muted hover:text-ink"
        aria-label="Back"
      >
        <ArrowLeft className="size-5" />
      </button>
      <div className="font-semibold text-lg leading-tight">{title}</div>
    </div>
  );
}

export function InfoBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-navy/40 bg-navy/15 px-2 py-0.5 text-[10px] font-medium text-navy">
      {children}
    </span>
  );
}

export function TermsGate() {
  const acceptTerms = useShield((s) => s.acceptTerms);
  const [checked, setChecked] = useState(false);
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-canvas/80 p-4 sm:items-center">
      <div className="w-full rounded-3xl border border-line bg-elev p-5 shadow-2xl">
        <div className="mb-1 text-lg font-semibold">Before you start</div>
        <p className="mb-4 text-xs text-muted">
          MyShield is a technology platform. It does not provide legal advice. Independent lawyers
          on the partner panel advise you. Comply with lawful police directions.
        </p>
        <label className="mb-4 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 rounded"
          />
          I understand MyShield does not provide legal advice.
        </label>
        <button
          type="button"
          disabled={!checked}
          onClick={acceptTerms}
          className="w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg disabled:opacity-40"
        >
          Continue to Demo
        </button>
      </div>
    </div>
  );
}

export function PinModal() {
  const pinOpen = useShield((s) => s.pinOpen);
  const pinBuffer = useShield((s) => s.pinBuffer);
  const pinError = useShield((s) => s.pinError);
  const pinPress = useShield((s) => s.pinPress);
  const closePin = useShield((s) => s.closePin);
  if (!pinOpen) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-canvas/80 p-4">
      <div className="w-full rounded-3xl border border-line bg-elev p-5">
        <div className="mb-1 text-center text-lg font-semibold">Enter PIN to end session</div>
        <p className="mb-4 text-center text-xs text-muted">Demo PIN is {DEMO_PIN}</p>
        <div className="mb-3 flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "size-3 rounded-full border-2",
                i < pinBuffer.length ? "border-navy bg-navy" : "border-line",
              )}
            />
          ))}
        </div>
        {pinError ? <p className="mb-2 text-center text-xs text-sos">{pinError}</p> : null}
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0"].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => pinPress(k)}
              className="rounded-2xl bg-paper py-3 text-sm font-semibold"
            >
              {k === "clear" ? "CLR" : k}
            </button>
          ))}
        </div>
        <button type="button" onClick={closePin} className="mt-3 w-full text-xs text-muted">
          Cancel
        </button>
      </div>
    </div>
  );
}

function StatusBar() {
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );
  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center justify-between bg-canvas px-5 py-2 text-xs text-ink">
      <div className="flex items-center gap-2">
        <Wifi className="size-3" />
        <span>4G</span>
      </div>
      <div>{clock}</div>
      <div className="flex items-center gap-1">
        <BatteryMedium className="size-3.5" />
        <span>87%</span>
      </div>
    </div>
  );
}

export function AppHeader() {
  const go = useShield((s) => s.go);
  const wallet = useShield((s) => s.wallet);

  return (
    <div className="relative bg-paper px-5 py-3">
      <button
        type="button"
        onClick={() => go("wallet")}
        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full border border-panel/40 bg-panel/10 px-2.5 py-1 text-sm font-semibold tabular-nums text-panel"
        aria-label="Shield Credit"
      >
        {formatMoney(wallet)}
      </button>
      <div className="flex items-center justify-center gap-2">
        <div className="illum illum-navy flex size-8 items-center justify-center rounded-xl bg-navy text-navy-fg">
          <Shield className="size-4" />
        </div>
        <div className="font-display text-xl tracking-tight" aria-label={APP_NAME}>
          <span className="text-ink">My</span>
          <span className="text-navy">Shield</span>
        </div>
      </div>
    </div>
  );
}

export function BottomNav() {
  const nav = useShield((s) => s.nav);
  const navTo = useShield((s) => s.navTo);
  const hidden = useShield((s) => s.callActive);

  if (hidden) return null;

  const items = [
    { id: "home" as const, label: "Home", Icon: Home },
    { id: "ask" as const, label: "Ask", Icon: MessageSquare },
    { id: "glovebox" as const, label: "Glovebox", Icon: FolderClosed },
    { id: "more" as const, label: "More", Icon: Ellipsis },
  ];

  return (
    <nav className="flex items-center justify-around border-t border-line bg-paper px-2 py-2">
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => navTo(id)}
          className={cn(
            "flex flex-col items-center px-3 py-1 text-[10px]",
            nav === id ? "text-navy" : "text-muted",
          )}
        >
          <Icon className={cn("mb-0.5 size-[18px]", nav === id && "scale-110 drop-shadow-[0_0_8px_var(--color-navy)]")} />
          {label}
        </button>
      ))}
    </nav>
  );
}

export function SosFab() {
  const fireSos = useShield((s) => s.fireSos);
  const sosOpen = useShield((s) => s.sosOpen);
  const screen = useShield((s) => s.screen);
  if (sosOpen || screen === "home" || screen === "hit") return null;
  return (
    <button
      type="button"
      onClick={fireSos}
      className="illum illum-sos absolute right-3 bottom-16 z-20 flex size-14 flex-col items-center justify-center rounded-full bg-linear-to-b from-sos to-sos-deep text-[10px] font-bold tracking-wide text-sos-fg active:scale-95"
      aria-label="SOS alert emergency contacts and family"
      title="SOS — alert contacts and family"
    >
      <Siren className="size-4" />
      SOS
    </button>
  );
}

export function SosOverlay() {
  const sosOpen = useShield((s) => s.sosOpen);
  const sosHits = useShield((s) => s.sosHits);
  const sosAt = useShield((s) => s.sosAt);
  const closeSos = useShield((s) => s.closeSos);
  const setCategory = useShield((s) => s.setCategory);
  const startMatch = useShield((s) => s.startMatch);
  const gps = useShield((s) => s.gps);
  const contacts = sosHits.filter((h) => h.kind === "contact");
  const family = sosHits.filter((h) => h.kind === "family");

  if (!sosOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-canvas/80 p-4 sm:items-center">
      <div className="max-h-[90%] w-full overflow-y-auto rounded-3xl border border-line bg-elev p-5 shadow-2xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="pulse-ring illum illum-sos flex size-12 items-center justify-center rounded-2xl bg-sos text-sos-fg">
            <Siren className="size-6" />
          </div>
          <div>
            <div className="text-lg font-semibold text-sos">SOS sent</div>
            <div className="text-[11px] text-muted">
              {sosAt} ·{" "}
              {gps ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : "Gold Coast, QLD (demo location)"}
            </div>
          </div>
        </div>
        <div className="mb-3 rounded-2xl border border-sos/40 bg-sos/10 p-3 text-[11px] text-rose-100">
          If you are in immediate danger, call <strong>Triple Zero (000)</strong>. This demo alerts
          your people — it does not dispatch police.
        </div>
        <div className="mb-3">
          <div className="mb-1 text-xs font-semibold text-ink">Emergency contacts</div>
          {contacts.length === 0 ? (
            <p className="text-[11px] text-muted">No emergency contacts on file.</p>
          ) : (
            contacts.map((h, i) => (
              <div key={`c-${i}`} className="flex justify-between border-b border-line py-1.5 text-xs">
                <span className="font-medium">{h.name}</span>
                <span className="text-muted">{h.channel}</span>
              </div>
            ))
          )}
        </div>
        <div className="mb-4">
          <div className="mb-1 text-xs font-semibold text-ink">Family</div>
          {family.length === 0 ? (
            <p className="text-[11px] text-muted">No family members on file.</p>
          ) : (
            family.map((h, i) => (
              <div key={`f-${i}`} className="flex justify-between border-b border-line py-1.5 text-xs">
                <span className="font-medium">{h.name}</span>
                <span className="text-muted">{h.channel}</span>
              </div>
            ))
          )}
        </div>
        <p className="mb-4 text-[10px] text-muted">
          Demo SMS with live location and session link. Dual-cam evidence is hashing in the background.
        </p>
        <button
          type="button"
          onClick={() => {
            closeSos();
            setCategory("criminal");
            startMatch();
          }}
          className="mb-2 w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg"
        >
          Also connect to attorney
        </button>
        <button
          type="button"
          onClick={closeSos}
          className="w-full rounded-2xl bg-paper py-3 text-sm font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function PhoneChrome({ children }: { children: ReactNode }) {
  const go = useShield((s) => s.go);
  const termsAccepted = useShield((s) => s.termsAccepted);
  const screen = useShield((s) => s.screen);
  const recording = useShield((s) => s.recording);
  const recSeconds = useShield((s) => s.recSeconds);
  const immersive = screen === "hit" || screen === "call";

  return (
    <div className="min-h-dvh bg-canvas sm:py-8">
      <div className="mx-auto max-w-[420px]">
        <div className="mb-4 hidden items-center justify-between px-3 sm:flex">
          <div className="flex items-center gap-3">
            <div className="illum illum-navy flex size-10 items-center justify-center rounded-2xl bg-navy text-navy-fg">
              <Shield className="size-5" />
            </div>
            <div>
              <span className="font-display text-3xl tracking-tighter text-ink">My</span>
              <span className="font-display text-3xl tracking-tighter text-navy">Shield</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go("partner")}
              className="rounded-full bg-elev px-3 py-1 text-[10px] font-medium text-panel"
            >
              Partner copy
            </button>
            <div className="flex items-center gap-1.5 rounded-full bg-elev px-3 py-1 text-xs text-muted">
              <span className="size-2 animate-pulse rounded-full bg-panel" />
              Ultimate v2.0
            </div>
          </div>
        </div>

        <div className="relative min-h-dvh overflow-hidden bg-paper sm:min-h-[520px] sm:rounded-[40px] sm:border-[12px] sm:border-zinc-950 sm:shadow-2xl">
          <StatusBar />
          {!immersive ? (
            <div className="disclaimer-bar overflow-hidden border-b border-disclaimer-line bg-disclaimer px-3 py-1.5 text-center text-[8px] leading-none whitespace-nowrap text-disclaimer-fg">
              <Info className="mr-1 inline size-2.5 align-[-1px]" />
              Technology platform only — not legal advice. Comply with lawful police directions.
            </div>
          ) : null}
          {!immersive ? <AppHeader /> : null}
          {recording && screen !== "hit" ? (
            <button
              type="button"
              onClick={() => go("hit")}
              className="flex w-full items-center justify-center gap-2 bg-sos px-3 py-1.5 text-[10px] font-semibold text-sos-fg"
            >
              <span className="rec-dot size-1.5 rounded-full bg-paper" />
              Dual cam recording {recSeconds}s · tap to return
            </button>
          ) : null}
          <div className={cn("relative min-h-[520px]", immersive ? "p-0 pb-0" : "p-5 pb-16")}>{children}</div>
          {!immersive ? <BottomNav /> : null}
          <SosFab />
          {recording ? <EvidenceEngine /> : null}
          <SosOverlay />
          <PinModal />
          {!termsAccepted ? <TermsGate /> : null}
        </div>

        <p className="mt-4 hidden px-4 text-center text-[10px] text-muted sm:block">
          MyShield — lawyer on call, witness capture, SOS. Demo only.{" "}
          <Link to="/lawyer" className="text-navy underline">
            Lawyer portal
          </Link>
          {" · "}
          <Link to="/install" className="text-navy underline">
            Install
          </Link>
        </p>
      </div>
    </div>
  );
}
