import { Check, Circle, Eye, Headset, Scale, Shield, Siren, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { HOME_TILES, PANEL } from "@/lib/shield/data";
import { useShield } from "@/lib/shield/store";
import { TILE_ICONS } from "./icons";

export function HomeScreen() {
  const go = useShield((s) => s.go);
  const fireSos = useShield((s) => s.fireSos);
  const sosOpen = useShield((s) => s.sosOpen);
  const startEvidence = useShield((s) => s.startEvidence);
  const family = useShield((s) => s.family);
  const glovebox = useShield((s) => s.glovebox);
  const contacts = useShield((s) => s.contacts);
  const activity = useShield((s) => s.activity);
  const runCheckup = useShield((s) => s.runCheckup);

  const setup = [
    { label: "Emergency contacts", done: contacts.length > 0, screen: "emergency" as const },
    { label: "Glovebox ID", done: glovebox.length > 0, screen: "glovebox" as const },
    { label: "Shield Basic active", done: true, screen: "wallet" as const },
  ];
  const doneCount = setup.filter((s) => s.done).length;
  const showChecklist = doneCount < setup.length;

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => go("hotline")}
          className="illum illum-blue flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-hotline px-1 py-3 text-center text-navy-fg active:scale-[0.97]"
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
          className="illum illum-sos flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-navy-deep px-1 py-3 text-center text-navy-fg active:scale-[0.97]"
        >
          <Siren className="size-6" />
          <span className="text-[11px] leading-tight font-semibold">SOS</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => startEvidence("attorney")}
        className="illum illum-green mb-3 flex w-full items-center gap-4 rounded-3xl bg-witness p-4 text-left text-navy-fg"
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

      <div className="mb-5 grid grid-cols-2 gap-3">
        {HOME_TILES.map((tile) => {
          const Icon = TILE_ICONS[tile.icon] ?? Shield;
          return (
            <button
              key={tile.title}
              type="button"
              onClick={() => go(tile.screen)}
              className="rounded-3xl border border-navy bg-navy p-4 text-left text-navy-fg"
            >
              <Icon className="mb-2 size-5 text-navy-fg" />
              <div className="text-sm font-semibold">{tile.title}</div>
              {tile.badge ? (
                <div className="mt-1">
                  <span className="inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-navy">
                    {tile.badge}
                  </span>
                </div>
              ) : (
                <div className="text-xs opacity-80">
                  {tile.title === "Family Plan" ? `${family.length} sub-accounts` : tile.sub}
                </div>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => go("aboriginal")}
          className="col-span-2 flex items-center gap-3 rounded-3xl bg-navy p-4 text-left text-navy-fg"
        >
          <Users className="size-5 text-navy-fg" />
          <div>
            <div className="text-sm font-semibold">Aboriginal Legal Services</div>
            <div className="text-xs opacity-80">Free 24/7 culturally safe help — ATSILS, ALS, VALS</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => go("services")}
          className="col-span-2 flex items-center justify-between rounded-3xl bg-navy p-4 text-left text-navy-fg"
        >
          <div>
            <div className="text-sm font-semibold">All Legal Services</div>
            <div className="text-xs opacity-80">24 tools — Rocket Lawyer, LegalZoom, LegalShield, JustAnswer + myShield</div>
          </div>
        </button>
      </div>

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

      <div className="mb-4 flex items-center gap-4 rounded-3xl border border-line bg-elev p-4">
        <div className="health-ring shrink-0">
          <div className="health-ring-inner">72%</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Legal Health Score</div>
          <div className="text-[10px] text-muted">Rocket Lawyer checkup + your setup progress</div>
          <button type="button" onClick={runCheckup} className="mt-1 text-[10px] font-medium text-navy">
            Improve score →
          </button>
        </div>
        <button type="button" onClick={() => go("dashboard")} className="shrink-0 text-xs font-semibold text-navy">
          Dashboard
        </button>
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
