import { BookOpen, Check, Circle, Eye, Gavel, Headset, Scale, Siren } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LAW_ADS, PANEL } from "@/lib/shield/data";
import { useShield } from "@/lib/shield/store";

export function HomeScreen() {
  const go = useShield((s) => s.go);
  const fireSos = useShield((s) => s.fireSos);
  const sosOpen = useShield((s) => s.sosOpen);
  const startEvidence = useShield((s) => s.startEvidence);
  const glovebox = useShield((s) => s.glovebox);
  const contacts = useShield((s) => s.contacts);
  const activity = useShield((s) => s.activity);

  const setup = [
    { label: "Emergency contacts", done: contacts.length > 0, screen: "emergency" as const },
    { label: "Glovebox ID", done: glovebox.length > 0, screen: "glovebox" as const },
    { label: "Shield Basic active", done: true, screen: "wallet" as const },
  ];
  const doneCount = setup.filter((s) => s.done).length;
  const showChecklist = doneCount < setup.length;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => go("hotline")}
          className="illum illum-logo flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-navy bg-white px-1 py-3 text-center text-navy active:scale-[0.97]"
        >
          <Headset className="size-6" />
          <span className="text-[11px] leading-tight font-semibold">24/7</span>
        </button>
        <button
          type="button"
          onClick={() => startEvidence("witness")}
          className="illum illum-green flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-witness px-1 py-3 text-center text-navy-fg active:scale-[0.97]"
        >
          <Eye className="size-6" />
          <span className="text-[11px] leading-tight font-semibold">Witness</span>
        </button>
        <button
          type="button"
          onClick={fireSos}
          aria-pressed={sosOpen}
          className="illum illum-sos flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-sos px-1 py-3 text-center text-sos-fg active:scale-[0.97]"
        >
          <Siren className="size-6" />
          <span className="text-[11px] leading-tight font-semibold">SOS</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => startEvidence("attorney")}
        className="illum illum-green flex w-full items-center gap-4 rounded-3xl bg-witness p-4 text-left text-navy-fg"
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <Scale className="size-6" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Connect to attorney</div>
          <div className="text-[11px] opacity-90">Live dual-cam · hashed GPS evidence</div>
        </div>
        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-witness">Live</span>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => go("resourcelibrary")}
          className="flex min-h-[84px] flex-col items-start justify-center gap-1 rounded-3xl bg-navy-deep p-4 text-left text-navy-fg"
        >
          <BookOpen className="size-5" />
          <span className="text-sm font-semibold">Resource Library</span>
          <span className="text-[11px] opacity-90">Index of headings</span>
        </button>
        <button
          type="button"
          onClick={() => go("litigation")}
          className="flex min-h-[84px] flex-col items-start justify-center gap-1 rounded-3xl bg-navy-deep p-4 text-left text-navy-fg"
        >
          <Gavel className="size-5" />
          <span className="text-sm font-semibold">Litigation</span>
          <span className="text-[11px] opacity-90">Templates • letters • court</span>
        </button>
      </div>
      </div>

      {showChecklist ? (
        <div className="mb-4 rounded-2xl border border-line bg-elev p-3">
          <div className="mb-2 text-xs font-semibold text-ink">
            Setup checklist <span className="text-navy">{doneCount}/{setup.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-[10px]">
            {setup.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.screen)}
                className={`rounded-lg px-2 py-1.5 text-left ${
                  item.done ? "bg-navy/10 text-navy" : "bg-navy/5 text-ink"
                }`}
              >
                {item.done ? (
                  <Check className="mr-1 inline size-3" />
                ) : (
                  <Circle className="mr-1 inline size-3" />
                )}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activity.length > 0 ? (
        <div className="mb-4 rounded-2xl border border-line bg-elev p-3 text-xs">
          <div className="mb-1 font-semibold">Recent activity</div>
          {activity.slice(0, 3).map((a) => (
            <div key={a.id} className="text-muted">
              {a.at} · {a.text}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mb-4 rounded-2xl border border-line bg-elev p-4">
        <div className="mb-2 text-xs font-semibold text-ink">Partner panel (demo)</div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <div className="flex -space-x-2">
            {PANEL.map((p) => (
              <div
                key={p.initials}
                className={`flex size-7 items-center justify-center rounded-full border-2 border-paper text-[10px] font-bold text-canvas ${p.color}`}
              >
                {p.initials}
              </div>
            ))}
          </div>
          <span>3 lawyers available • QLD criminal & traffic specialists</span>
        </div>
      </div>

      <div className="-mx-5 mb-4">
        <div className="mb-2 flex items-end justify-between px-5">
          <div className="text-xs font-semibold text-ink">Lawyers & firms</div>
          <div className="text-[10px] text-muted">Paid ads · mockup only</div>
        </div>
        <div className="ad-rail px-5">
          {LAW_ADS.map((ad) => (
            <article
              key={ad.id}
              className={`ad-card ad-card-${ad.tone} flex snap-start flex-col justify-between rounded-3xl p-4`}
            >
              <div>
                <div className="ad-kicker">{ad.kicker}</div>
                <div className="mt-2 font-display text-lg leading-tight font-semibold tracking-tight">
                  {ad.headline}
                </div>
                <div className="mt-2 text-sm font-semibold">{ad.firm}</div>
                <div className="text-[11px] opacity-80">{ad.lawyer}</div>
                <p className="mt-2 text-[11px] leading-snug opacity-90">{ad.body}</p>
              </div>
              <div className="mt-3">
                <div className="text-[10px] opacity-80">{ad.proof}</div>
                <div className="text-[10px] opacity-70">{ad.hours}</div>
                <button
                  type="button"
                  onClick={() => (ad.id === "nightdesk" ? go("hotline") : startEvidence("attorney"))}
                  className="ad-cta mt-3 w-full rounded-full px-3 py-2 text-xs font-semibold"
                >
                  {ad.cta}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Link to="/install" className="mb-3 block text-center text-[11px] text-navy underline">
        Install Android app
      </Link>
      <div className="text-[10px] text-muted">
        Demo prototype. Dual-cam evidence, GPS hashes and torch use this device. A production
        version requires licensed lawyers, insurance, and Privacy Act compliance.
      </div>
    </div>
  );
}
