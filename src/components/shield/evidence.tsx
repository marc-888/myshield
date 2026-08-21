import { useEffect, useRef, useState } from "react";
import {
  CloudUpload,
  Flashlight,
  FlashlightOff,
  Lock,
  MapPin,
  Scale,
  Square,
  Sun,
} from "lucide-react";
import { CATEGORIES } from "@/lib/shield/data";
import {
  attachCameras,
  applyTorch,
  decideTorch,
  encryptPayload,
  makeSessionKey,
  primeDualCameras,
  resetCameraPrime,
  sampleLuma,
  setLiveStreams,
  sha256Hex,
  stopStreams,
  watchGps,
  watchLux,
  type CamStreams,
} from "@/lib/shield/evidence";
import { useShield } from "@/lib/shield/store";
import type { EvidenceChunk } from "@/lib/shield/types";
import { formatTimer } from "@/lib/utils";

export function EvidenceEngine() {
  const recording = useShield((s) => s.recording);
  const torchUserOff = useShield((s) => s.torchUserOff);
  const torchUserOn = useShield((s) => s.torchUserOn);
  const chunks = useShield((s) => s.chunks);
  const tickRec = useShield((s) => s.tickRec);
  const setTorchState = useShield((s) => s.setTorchState);
  const setGps = useShield((s) => s.setGps);
  const pushChunk = useShield((s) => s.pushChunk);
  const markCloud = useShield((s) => s.markCloud);
  const setCamerasLive = useShield((s) => s.setCamerasLive);
  const rearRef = useRef<HTMLVideoElement | null>(null);
  const streams = useRef<CamStreams>({ rear: null, front: null });
  const keyRef = useRef<CryptoKey | null>(null);
  const gpsRef = useRef({ lat: -27.9674, lng: 153.3997, accuracy: 18 });
  const luxRef = useRef<number | null>(null);
  const seqRef = useRef(0);
  const prevHash = useRef("genesis");
  const userOff = useRef(torchUserOff);
  const userOn = useRef(torchUserOn);
  userOff.current = torchUserOff;
  userOn.current = torchUserOn;

  useEffect(() => {
    if (!recording) return;
    let cancelled = false;
    seqRef.current = 0;
    prevHash.current = "genesis";

    const recTick = setInterval(tickRec, 1000);
    const unGps = watchGps((lat, lng, accuracy) => {
      gpsRef.current = { lat, lng, accuracy };
      setGps(lat, lng, accuracy);
    });
    const unLux = watchLux((lux) => {
      luxRef.current = lux;
    });

    (async () => {
      keyRef.current = await makeSessionKey();
      const cams = await primeDualCameras();
      if (cancelled) {
        stopStreams(cams);
        resetCameraPrime();
        return;
      }
      streams.current = cams;
      setLiveStreams(cams);
      attachCameras();
      setCamerasLive(Boolean(cams.rear), Boolean(cams.front));
    })();

    const lightTick = setInterval(() => {
      const rearEl = document.getElementById("shield-rear-cam") as HTMLVideoElement | null;
      const luma = sampleLuma(rearEl);
      const decision = decideTorch({
        userOff: userOff.current,
        userOn: userOn.current,
        lux: luxRef.current,
        luma,
      });
      setTorchState(decision.on, decision.reason);
      void applyTorch(streams.current.rear, decision.on);
    }, 1500);

    const chunkOnce = () => {
      void (async () => {
        const { lat, lng, accuracy } = gpsRef.current;
        const seq = ++seqRef.current;
        const ts = new Date().toISOString();
        const prev = prevHash.current;
        const body = JSON.stringify({
          seq,
          ts,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          accuracy: Math.round(accuracy),
          cams: "front+rear",
          prev,
        });
        const hash = await sha256Hex(body);
        const { cipher } = await encryptPayload(keyRef.current, body);
        prevHash.current = hash;
        const chunk: EvidenceChunk = {
          seq,
          ts,
          lat,
          lng,
          hash,
          prev,
          cipher,
          local: true,
          cloud: false,
        };
        pushChunk(chunk);
        window.setTimeout(() => markCloud(seq), 600 + Math.random() * 400);
      })();
    };
    const firstChunk = window.setTimeout(chunkOnce, 400);
    const chunkTick = setInterval(chunkOnce, 4000);

    return () => {
      cancelled = true;
      clearInterval(recTick);
      clearInterval(lightTick);
      clearInterval(chunkTick);
      clearTimeout(firstChunk);
      unGps();
      unLux();
      stopStreams(streams.current);
      streams.current = { rear: null, front: null };
      setLiveStreams({ rear: null, front: null });
      resetCameraPrime();
    };
  }, [recording, tickRec, setTorchState, setGps, pushChunk, markCloud, setCamerasLive]);

  // keep chunks referenced so engine re-renders hashes for HitScreen store
  void chunks.length;
  void rearRef;
  return null;
}

export function HitScreen() {
  const mode = useShield((s) => s.evidenceMode) ?? "witness";
  const recSeconds = useShield((s) => s.recSeconds);
  const torchOn = useShield((s) => s.torchOn);
  const torchReason = useShield((s) => s.torchReason);
  const torchUserOff = useShield((s) => s.torchUserOff);
  const gps = useShield((s) => s.gps);
  const chunks = useShield((s) => s.chunks);
  const rearLive = useShield((s) => s.rearLive);
  const frontLive = useShield((s) => s.frontLive);
  const category = useShield((s) => s.category);
  const setCategory = useShield((s) => s.setCategory);
  const startMatch = useShield((s) => s.startMatch);
  const stopEvidence = useShield((s) => s.stopEvidence);
  const setTorchUser = useShield((s) => s.setTorchUser);
  const fireSos = useShield((s) => s.fireSos);
  const last = chunks[chunks.length - 1];
  const cloudN = chunks.filter((c) => c.cloud).length;
  const [night] = useState(() => {
    const h = new Date().getHours();
    return h < 6 || h >= 18;
  });

  useEffect(() => {
    attachCameras();
  }, [rearLive, frontLive]);

  const title =
    mode === "attorney" ? "Attorney — live evidence" : mode === "sos" ? "SOS — recording" : "Witness a crime";

  return (
    <div className="flex min-h-[560px] flex-col bg-ink text-navy-fg">
      <div className="relative min-h-[420px] flex-1 overflow-hidden">
        <video
          id="shield-rear-cam"
          className="absolute inset-0 size-full object-cover"
          muted
          playsInline
          autoPlay
        />
        {!rearLive ? <SimRear night={night} torch={torchOn} /> : null}

        <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="rec-dot size-2 rounded-full bg-sos" />
              <span className="rounded-full bg-sos px-2 py-0.5 text-[10px] font-bold">
                REC {formatTimer(recSeconds)}
              </span>
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-canvas">
                {title}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-canvas">
              <MapPin className="size-3" />
              {gps
                ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)} ±${Math.round(gps.accuracy)}m`
                : "Acquiring GPS…"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTorchUser(torchUserOff ? "auto" : torchOn ? "off" : "on")}
            className="flex size-11 items-center justify-center rounded-full bg-ink/60"
            aria-label="Toggle torch"
          >
            {torchOn ? <Flashlight className="size-5 text-amber-300" /> : <FlashlightOff className="size-5" />}
          </button>
        </div>

        <div className="absolute top-16 left-3 z-10 max-w-[70%] rounded-lg bg-white/90 px-2 py-1 text-[9px] leading-snug text-canvas">
          <Lock className="mr-1 inline size-2.5" />
          AES-GCM · SHA-256 chain · {cloudN}/{chunks.length || 0} cloud
          <div className="mt-0.5 opacity-80">{torchReason}</div>
          {last ? (
            <div className="mt-0.5 truncate font-mono text-[8px] text-emerald-800">
              #{last.seq} {last.hash.slice(0, 20)}…
            </div>
          ) : (
            <div className="mt-0.5 text-canvas/60">Hashing first chunk…</div>
          )}
        </div>

        <div className="absolute right-3 bottom-28 z-10 w-[28%] overflow-hidden rounded-xl border-2 border-white/40 bg-zinc-900 aspect-3/4">
          <video id="shield-front-cam" className="size-full object-cover" muted playsInline autoPlay />
          {!frontLive ? <SimFront night={night} /> : null}
          <div className="pointer-events-none absolute top-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-bold text-canvas">
            FRONT
          </div>
          <div className="absolute bottom-1 left-1 rounded bg-sos/90 px-1.5 py-0.5 text-[8px] font-bold">REC</div>
        </div>

        <div className="absolute bottom-3 left-3 z-10 flex gap-1">
          <span className="rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-bold text-canvas">
            REAR {rearLive ? "LIVE" : "SIM"}
          </span>
          <span className="rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-bold text-canvas">
            FRONT {frontLive ? "LIVE" : "SIM"}
          </span>
        </div>
      </div>

      <div className="space-y-2 bg-zinc-950 p-3 pb-4">
        {mode === "attorney" ? (
          <div>
            <div className="mb-1 text-[10px] text-zinc-400">Both cameras on. Pick a matter, then connect.</div>
            <div className="mb-2 flex gap-1 overflow-x-auto">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold ${
                    category === c.id ? "bg-navy text-navy-fg" : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {c.title.split(" ")[0]}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!category}
              onClick={startMatch}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg disabled:opacity-40"
            >
              <Scale className="size-4" /> Connect to attorney
            </button>
          </div>
        ) : null}

        {mode === "witness" ? (
          <p className="text-[10px] text-zinc-400">
            Dual cam + GPS hashed every 4s. Rear and front stay on for your records. Call 000 if someone is in danger.
          </p>
        ) : null}

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-zinc-800 px-2 py-2 text-center text-[9px]">
            <Sun className="mx-auto mb-0.5 size-3" />
            {night ? "Night" : "Day"}
          </div>
          <div className="rounded-xl bg-zinc-800 px-2 py-2 text-center text-[9px]">
            <CloudUpload className="mx-auto mb-0.5 size-3" />
            {cloudN} backed up
          </div>
          <div className="rounded-xl bg-zinc-800 px-2 py-2 text-center text-[9px]">
            <Lock className="mx-auto mb-0.5 size-3" />
            {chunks.length} chunks
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {mode !== "sos" ? (
            <button
              type="button"
              onClick={fireSos}
              className="rounded-2xl bg-sos py-3 text-sm font-semibold text-sos-fg"
            >
              SOS
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCategory("criminal");
                startMatch();
              }}
              className="rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg"
            >
              Get attorney
            </button>
          )}
          <button
            type="button"
            onClick={stopEvidence}
            className="flex items-center justify-center gap-2 rounded-2xl bg-elev py-3 text-sm font-semibold text-ink"
          >
            <Square className="size-3 fill-current" /> Stop & save
          </button>
        </div>
      </div>
    </div>
  );
}

function SimRear({ night, torch }: { night: boolean; torch: boolean }) {
  return (
    <div
      className={`cam-sim absolute inset-0 ${night ? "cam-sim-night" : "cam-sim-day"}`}
      aria-hidden
    >
      <div className="cam-road" />
      {torch ? <div className="cam-torch" /> : null}
      <div className="absolute bottom-8 left-4 rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium text-canvas">
        Rear cam {night ? "night" : "day"} · Gold Coast Hwy
      </div>
    </div>
  );
}

function SimFront({ night }: { night: boolean }) {
  return (
    <div className={`absolute inset-0 ${night ? "cam-front-night" : "cam-front-day"}`} aria-hidden>
      <div className="cam-front-face" />
    </div>
  );
}
