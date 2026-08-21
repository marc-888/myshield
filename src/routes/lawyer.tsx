import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Scale, Video } from "lucide-react";
import { attachCameras, getLiveStreams, publishLive, subscribeLive } from "@/lib/shield/evidence";
import { LAWYER } from "@/lib/shield/data";

export const Route = createFileRoute("/lawyer")({ component: LawyerPortal });

function LawyerPortal() {
  const [joined, setJoined] = useState(false);
  const [gps, setGps] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [hash, setHash] = useState("waiting for client chunks…");
  const [seq, setSeq] = useState(0);
  const [rearLive, setRearLive] = useState(false);
  const [frontLive, setFrontLive] = useState(false);

  useEffect(() => {
    return subscribeLive((msg) => {
      if (msg.type === "gps") setGps({ lat: msg.lat, lng: msg.lng, accuracy: msg.accuracy });
      if (msg.type === "chunk") {
        setGps({ lat: msg.lat, lng: msg.lng });
        setHash(msg.hash);
        setSeq(msg.seq);
      }
      if (msg.type === "session-end") setJoined(false);
    });
  }, []);

  useEffect(() => {
    if (!joined) return;
    const bind = () => {
      const live = getLiveStreams();
      const rearEl = document.getElementById("lawyer-rear-cam") as HTMLVideoElement | null;
      const frontEl = document.getElementById("lawyer-front-cam") as HTMLVideoElement | null;
      if (rearEl && live.rear) {
        rearEl.srcObject = live.rear;
        void rearEl.play().catch(() => {});
        setRearLive(true);
      }
      if (frontEl && live.front) {
        frontEl.srcObject = live.front;
        void frontEl.play().catch(() => {});
        setFrontLive(true);
      }
      attachCameras();
    };
    bind();
    const t = window.setInterval(bind, 1000);
    return () => window.clearInterval(t);
  }, [joined]);

  return (
    <div className="min-h-dvh bg-zinc-950 p-4 text-zinc-100">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-navy">
            <Scale className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">MyShield Lawyer</h1>
            <p className="text-xs text-zinc-400">{LAWYER.name} · live dual-cam + GPS</p>
          </div>
        </div>

        {!joined ? (
          <div className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-3 text-sm">
              Case arrives the instant the member taps <strong>Connect to attorney</strong>. No extra
              steps on their side.
            </div>
            <button
              type="button"
              onClick={() => setJoined(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-semibold hover:bg-emerald-500"
            >
              <Video className="size-4" /> Join live session
            </button>
            <p className="mt-3 text-[10px] text-zinc-500">
              You receive rear + front cameras, GPS chunks and the case brief in real time. Leaving
              this session does not stop the member’s evidence recording.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-3 rounded-2xl border border-emerald-700/50 bg-emerald-950/40 p-3 text-xs">
              <div className="font-semibold text-emerald-300">CASE BRIEF (instant)</div>
              <div>Criminal / police interaction · Gold Coast, QLD</div>
              <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-zinc-300">
                <MapPin className="size-3" />
                {gps
                  ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`
                  : "Waiting for member GPS…"}
              </div>
              <div className="mt-1 truncate font-mono text-[10px] text-emerald-200">
                chunk #{seq} {hash.slice(0, 24)}
              </div>
            </div>

            <div className="relative mb-3 aspect-3/4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
              <video
                id="lawyer-rear-cam"
                className="absolute inset-0 size-full object-cover"
                muted
                playsInline
                autoPlay
              />
              {!rearLive ? (
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#1e293b,#0f172a)]">
                  <div className="absolute inset-x-8 top-1/3 h-24 rounded-full bg-zinc-700/40 blur-2xl" />
                  <div className="absolute bottom-8 left-4 text-[10px] text-zinc-400">
                    Client rear cam (encrypted stream)
                  </div>
                </div>
              ) : null}
              <div className="absolute top-3 left-3 rounded-full bg-sos px-2 py-1 text-[10px] font-semibold">
                REAR LIVE
              </div>
              <div className="absolute right-3 bottom-3 w-[28%] overflow-hidden rounded-xl border-2 border-white/40 bg-zinc-800 aspect-3/4">
                <video
                  id="lawyer-front-cam"
                  className="size-full object-cover"
                  muted
                  playsInline
                  autoPlay
                />
                {!frontLive ? (
                  <div className="flex size-full items-center justify-center text-[8px] text-zinc-400">
                    FRONT
                  </div>
                ) : null}
                <div className="pointer-events-none absolute bottom-1 left-1 rounded bg-sos/90 px-1 py-0.5 text-[8px] font-bold">
                  FRONT
                </div>
              </div>
            </div>
            <div className="mb-3 text-xs text-zinc-400">
              Both member cameras + hashed GPS. If you leave, they keep recording.
            </div>
            <button
              type="button"
              onClick={() => {
                publishLive({ type: "lawyer-hangup" });
                setJoined(false);
              }}
              className="w-full rounded-2xl bg-zinc-800 py-3 text-sm font-semibold"
            >
              Leave session (member keeps recording)
            </button>
          </div>
        )}

        <Link to="/" className="mt-6 inline-block text-xs text-blue-400 underline">
          ← Back to member app
        </Link>
      </div>
    </div>
  );
}
