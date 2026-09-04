import { useEffect, useRef, useState } from "react";
import {
  CloudUpload,
  Flashlight,
  FlashlightOff,
  Lock,
  MapPin,
  PhoneOff,
  Scale,
  Square,
  Star,
  Sun,
} from "lucide-react";
import { CATEGORIES, LAWYER, REGISTERED_WITNESSES, SOS_LAWYERS } from "@/lib/shield/data";
import {
  attachCameras,
  applyTorch,
  decideTorch,
  encryptPayload,
  ensureDualCameras,
  makeSessionKey,
  primeDualCameras,
  publishLive,
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
  const streams = useRef<CamStreams>({ rear: null, front: null, mode: "none" });
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
      publishLive({ type: "gps", lat, lng, accuracy });
    });
    const unLux = watchLux((lux) => {
      luxRef.current = lux;
    });

    (async () => {
      keyRef.current = await makeSessionKey();
      const cams = await primeDualCameras();
      if (cancelled) {
        if (!useShield.getState().recording) {
          stopStreams(cams);
          resetCameraPrime();
        }
        return;
      }
      streams.current = cams;
      setLiveStreams(cams);
      attachCameras();
      setCamerasLive(Boolean(cams.rear), Boolean(cams.front), cams.mode ?? "none");
    })();

    const attachTick = setInterval(attachCameras, 800);
    const dualTick = setInterval(() => {
      void ensureDualCameras().then((cams) => {
        if (!cams || cancelled) return;
        streams.current = cams;
        setLiveStreams(cams);
        attachCameras();
        setCamerasLive(Boolean(cams.rear), Boolean(cams.front), cams.mode ?? "none");
      });
    }, 2500);
    const lightTick = setInterval(() => {
      const rearEl =
        (document.getElementById("shield-rear-cam") as HTMLVideoElement | null) ??
        document.querySelector<HTMLVideoElement>("[data-shield-cam='rear']");
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
          dual: streams.current.mode ?? "unknown",
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
        publishLive({
          type: "chunk",
          seq,
          ts,
          lat,
          lng,
          hash,
          cloud: false,
        });
        window.setTimeout(() => markCloud(seq), 600 + Math.random() * 400);
      })();
    };
    const firstChunk = window.setTimeout(chunkOnce, 400);
    const chunkTick = setInterval(chunkOnce, 4000);

    return () => {
      cancelled = true;
      clearInterval(recTick);
      clearInterval(attachTick);
      clearInterval(dualTick);
      clearInterval(lightTick);
      clearInterval(chunkTick);
      clearTimeout(firstChunk);
      unGps();
      unLux();
      if (!useShield.getState().recording) {
        stopStreams(streams.current);
        streams.current = { rear: null, front: null, mode: "none" };
        setLiveStreams({ rear: null, front: null, mode: "none" });
        resetCameraPrime();
      }
    };
  }, [recording, tickRec, setTorchState, setGps, pushChunk, markCloud, setCamerasLive]);

  // keep chunks referenced so engine re-renders hashes for HitScreen store
  void chunks.length;
  void rearRef;
  return (
    <div className="pointer-events-none fixed -left-[200px] top-0 size-px overflow-hidden opacity-0" aria-hidden>
      <video id="shield-rear-cam-engine" data-shield-cam="rear" muted playsInline autoPlay />
      <video id="shield-front-cam-engine" data-shield-cam="front" muted playsInline autoPlay />
    </div>
  );
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
  const dualCamMode = useShield((s) => s.dualCamMode);
  const category = useShield((s) => s.category);
  const matching = useShield((s) => s.matching);
  const matchingProgress = useShield((s) => s.matchingProgress);
  const matchingLabel = useShield((s) => s.matchingLabel);
  const callActive = useShield((s) => s.callActive);
  const callSeconds = useShield((s) => s.callSeconds);
  const lawyerLeft = useShield((s) => s.lawyerLeft);
  const stopEvidence = useShield((s) => s.stopEvidence);
  const setTorchUser = useShield((s) => s.setTorchUser);
  const fireSos = useShield((s) => s.fireSos);
  const openPin = useShield((s) => s.openPin);
  const lawyerHangUp = useShield((s) => s.lawyerHangUp);
  const last = chunks[chunks.length - 1];
  const cloudN = chunks.filter((c) => c.cloud).length;
  const cat = CATEGORIES.find((c) => c.id === (category ?? "criminal"));
  const [night] = useState(() => {
    const h = new Date().getHours();
    return h < 6 || h >= 18;
  });

  useEffect(() => {
    attachCameras();
  }, [rearLive, frontLive, callActive, matching]);

  const title =
    mode === "attorney"
      ? callActive
        ? "Attorney live — dual cam"
        : matching
          ? "Connecting lawyer — dual cam"
          : lawyerLeft
            ? "Lawyer left — still recording"
            : "Attorney — live evidence"
      : mode === "sos"
        ? "SOS — recording"
        : "Witness recording";

  return (
    <div className="flex min-h-[560px] flex-col bg-paper text-ink">
      <div className={`relative overflow-hidden ${mode === "witness" || mode === "sos" ? "min-h-[240px] flex-none" : "min-h-[420px] flex-1"}`}>
        <video
          id="shield-rear-cam"
          data-shield-cam="rear"
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
            className="flex size-11 items-center justify-center rounded-full bg-ink/60 text-white"
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

        {mode === "attorney" ? (
          <div className="absolute top-16 right-3 z-10 w-[42%] rounded-xl bg-navy/90 p-2 text-[9px] leading-snug text-navy-fg">
            <div className="font-bold tracking-wide">CASE → LAWYER</div>
            <div>{cat?.title ?? "Criminal Matters"}</div>
            <div className="opacity-80">{MEMBER_LOC}</div>
            {gps ? (
              <div className="font-mono opacity-90">
                {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
              </div>
            ) : null}
            <div>
              Dual cam {rearLive ? "REC" : "…"}/{frontLive ? "REC" : "…"}
              {dualCamMode === "concurrent" ? " LIVE" : dualCamMode === "multiplex" ? " both rec" : ""} · {chunks.length}{" "}
              chunks
            </div>
          </div>
        ) : null}

        {callActive ? (
          <div className="absolute left-3 top-[42%] z-10 w-[34%] overflow-hidden rounded-xl border-2 border-emerald-400 bg-navy">
            <div className="flex aspect-3/4 flex-col items-center justify-center p-2 text-center">
              <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
                {LAWYER.initials}
              </div>
              <div className="text-[10px] font-semibold">{LAWYER.name}</div>
              <div className="text-[8px] opacity-80">LIVE {formatTimer(callSeconds)}</div>
              <div className="mt-1 text-[8px] text-emerald-200">Sees rear + front</div>
            </div>
          </div>
        ) : null}

        {matching ? (
          <div className="absolute inset-x-8 top-[40%] z-20 rounded-2xl bg-ink/80 p-3 text-center">
            <Scale className="mx-auto mb-1 size-5" />
            <div className="text-xs font-semibold">{matchingLabel}</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-700">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${matchingProgress}%` }} />
            </div>
            <div className="mt-1 text-[9px] text-zinc-300">Cameras and GPS stay on</div>
          </div>
        ) : null}

        {lawyerLeft ? (
          <div className="absolute inset-x-4 top-[38%] z-20 rounded-2xl bg-amber-500 px-3 py-2 text-center text-[11px] font-semibold text-canvas">
            Lawyer left the call. Dual-cam evidence is still recording.
          </div>
        ) : null}

        <div className="absolute right-3 bottom-28 z-10 w-[28%] overflow-hidden rounded-xl border-2 border-white/40 bg-zinc-900 aspect-3/4">
          <video
            id="shield-front-cam"
            data-shield-cam="front"
            className="size-full object-cover scale-x-[-1]"
            muted
            playsInline
            autoPlay
          />
          {!frontLive ? <SimFront night={night} /> : null}
          <div className="pointer-events-none absolute top-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-bold text-canvas">
            FRONT
          </div>
          {frontLive ? (
            <div className="absolute bottom-1 left-1 rounded bg-sos/90 px-1.5 py-0.5 text-[8px] font-bold">REC</div>
          ) : (
            <div className="absolute bottom-1 left-1 rounded bg-amber-500/90 px-1.5 py-0.5 text-[8px] font-bold">…</div>
          )}
        </div>

        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1">
          <span className="rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-bold text-canvas">
            REAR {rearLive ? "REC" : "…"}
          </span>
          <span className="rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-bold text-canvas">
            FRONT {frontLive ? "REC" : "…"}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
              rearLive && frontLive ? "bg-emerald-600 text-navy-fg" : "bg-amber-500 text-canvas"
            }`}
          >
            {dualCamMode === "concurrent"
              ? "BOTH CAMERAS LIVE"
              : dualCamMode === "multiplex"
                ? "BOTH CAMERAS REC"
                : rearLive && frontLive
                  ? "BOTH CAMERAS REC"
                  : rearLive
                    ? "Rear rec — opening front"
                    : frontLive
                      ? "Front rec — opening rear"
                      : "Allow camera access"}
          </span>
        </div>
      </div>

      <div className="space-y-2 bg-canvas p-3 pb-4">
        {mode === "witness" || mode === "sos" ? (
          <WitnessRoster hideUntilSelected={mode === "sos"} showLawyerTab={mode === "sos"} />
        ) : null}

        {mode === "attorney" && callActive ? (
          <p className="text-[10px] text-muted">
            Lawyer is watching both cameras and the hashed GPS feed in real time. If they hang up,
            recording keeps going. If you end it, everything is saved.
          </p>
        ) : null}

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-line bg-elev px-2 py-2 text-center text-[9px] text-ink">
            <Sun className="mx-auto mb-0.5 size-3" />
            {night ? "Night" : "Day"}
          </div>
          <div className="rounded-xl border border-line bg-elev px-2 py-2 text-center text-[9px] text-ink">
            <CloudUpload className="mx-auto mb-0.5 size-3" />
            {cloudN} backed up
          </div>
          <div className="rounded-xl border border-line bg-elev px-2 py-2 text-center text-[9px] text-ink">
            <Lock className="mx-auto mb-0.5 size-3" />
            {chunks.length} chunks
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {callActive ? (
            <button
              type="button"
              onClick={lawyerHangUp}
              className="flex items-center justify-center gap-1 rounded-2xl border border-line bg-elev py-3 text-[11px] font-semibold text-ink"
            >
              <PhoneOff className="size-3" /> Lawyer hangs up
            </button>
          ) : mode !== "sos" ? (
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
              onClick={() => useShield.getState().startMatch()}
              className="rounded-2xl bg-navy py-3 text-sm font-semibold text-navy-fg"
            >
              Get attorney
            </button>
          )}
          <button
            type="button"
            onClick={() => (callActive ? openPin() : stopEvidence())}
            className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-elev py-3 text-sm font-semibold text-ink"
          >
            <Square className="size-3 fill-current" /> {callActive ? "End & save" : "Stop & save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const MEMBER_LOC = "Gold Coast, QLD";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-3 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
        />
      ))}
    </span>
  );
}

function WitnessAvatar({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-elev text-[10px] font-bold text-ink ${className ?? ""}`}>
        {alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className ?? ""}`}
      onError={() => setFailed(true)}
    />
  );
}

function WitnessRoster({
  hideUntilSelected = false,
  showLawyerTab = false,
}: {
  hideUntilSelected?: boolean;
  showLawyerTab?: boolean;
}) {
  const [tab, setTab] = useState<"witnesses" | "lawyers">("witnesses");
  const sosRosterTab = useShield((s) => s.sosRosterTab);
  useEffect(() => {
    if (showLawyerTab) setTab(sosRosterTab);
  }, [showLawyerTab, sosRosterTab]);
  const [approvedLawyers, setApprovedLawyers] = useState<string[]>([]);
  const [approvedWitnesses, setApprovedWitnesses] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<{ kind: "lawyer" | "witness"; id: string } | null>(null);

  const lawyerSeats = approvedLawyers
    .map((id) => SOS_LAWYERS.find((l) => l.id === id))
    .filter((l): l is (typeof SOS_LAWYERS)[number] => Boolean(l))
    .map((l) => ({
      key: `lawyer-${l.id}`,
      kind: "lawyer" as const,
      id: l.id,
      photo: l.photo,
      title: "Lawyer",
      sub: l.name,
    }));
  const witnessSeats = approvedWitnesses
    .map((id) => REGISTERED_WITNESSES.find((w) => w.id === id))
    .filter((w): w is (typeof REGISTERED_WITNESSES)[number] => Boolean(w))
    .map((w) => ({
      key: `witness-${w.id}`,
      kind: "witness" as const,
      id: w.id,
      photo: w.photo,
      title: "Witness",
      sub: w.name,
    }));
  const seats = [...lawyerSeats, ...witnessSeats];
  const lawyerPool = SOS_LAWYERS.filter((l) => !approvedLawyers.includes(l.id));
  const witnessPool = REGISTERED_WITNESSES.filter((w) => !approvedWitnesses.includes(w.id));
  const full = seats.length >= 6;
  const showGrid = !hideUntilSelected || seats.length > 0;
  const listTab = showLawyerTab ? tab : "witnesses";
  const expandedSeat = expanded
    ? seats.find((s) => s.kind === expanded.kind && s.id === expanded.id)
    : undefined;

  const addLawyer = (id: string) => {
    setApprovedLawyers((ids) => {
      if (ids.includes(id) || ids.length + approvedWitnesses.length >= 6) return ids;
      return [...ids, id];
    });
  };
  const addWitness = (id: string) => {
    setApprovedWitnesses((ids) => {
      if (ids.includes(id) || ids.length + approvedLawyers.length >= 6) return ids;
      return [...ids, id];
    });
  };

  const renderTile = (seat: (typeof seats)[number]) => (
    <button
      key={seat.key}
      type="button"
      onClick={() => setExpanded({ kind: seat.kind, id: seat.id })}
      className="overflow-hidden rounded-xl border border-line bg-canvas text-left"
    >
      <WitnessAvatar src={seat.photo} alt={seat.title} className="aspect-square w-full" />
      <div className="px-1.5 py-1">
        <div className="truncate text-[10px] font-semibold text-ink">{seat.title}</div>
        <div className="truncate text-[9px] text-muted">{seat.sub}</div>
      </div>
    </button>
  );

  return (
    <div className="space-y-2">
      {showGrid ? (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-elev">
          {expandedSeat ? (
            <button
              type="button"
              className="relative block aspect-video w-full bg-paper"
              onClick={() => setExpanded(null)}
              aria-label={`Close ${expandedSeat.title} preview`}
            >
              <WitnessAvatar
                src={expandedSeat.photo}
                alt={expandedSeat.title}
                className="absolute inset-0 size-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-3 text-left text-white">
                <div className="text-sm font-semibold">{expandedSeat.title}</div>
                <div className="text-[11px] text-white/80">{expandedSeat.sub}</div>
              </div>
            </button>
          ) : hideUntilSelected ? (
            <div className="grid grid-cols-3 gap-1.5 p-1.5">{seats.map(renderTile)}</div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 p-1.5">
              {Array.from({ length: 6 }, (_, i) => {
                const seat = seats[i];
                if (!seat) {
                  return (
                    <div
                      key={`empty-${i}`}
                      className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-line bg-canvas text-[9px] text-muted"
                    >
                      Empty
                    </div>
                  );
                }
                return renderTile(seat);
              })}
            </div>
          )}
        </div>
      ) : null}

      {showLawyerTab ? (
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-elev p-1">
          <button
            type="button"
            onClick={() => setTab("witnesses")}
            className={`rounded-xl py-2 text-xs font-semibold ${
              tab === "witnesses" ? "bg-navy text-navy-fg" : "text-muted"
            }`}
          >
            Witnesses
          </button>
          <button
            type="button"
            onClick={() => setTab("lawyers")}
            className={`rounded-xl py-2 text-xs font-semibold ${
              tab === "lawyers" ? "bg-navy text-navy-fg" : "text-muted"
            }`}
          >
            Lawyers
          </button>
        </div>
      ) : null}

      {full ? null : listTab === "lawyers" ? (
        <div className="max-h-40 overflow-y-auto rounded-2xl border border-line bg-elev">
          {lawyerPool.map((lawyer) => (
            <button
              key={lawyer.id}
              type="button"
              onClick={() => addLawyer(lawyer.id)}
              className="flex w-full items-center gap-3 border-b border-line px-3 py-2 text-left last:border-b-0"
            >
              <WitnessAvatar src={lawyer.photo} alt={lawyer.name} className="size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-ink">{lawyer.name}</div>
                <div className="truncate text-[10px] text-muted">{lawyer.firm}</div>
                <div className="truncate text-[10px] text-muted">{lawyer.specialty}</div>
              </div>
              <Stars rating={lawyer.rating} />
            </button>
          ))}
        </div>
      ) : (
        <div className="max-h-40 overflow-y-auto rounded-2xl border border-line bg-elev">
          {witnessPool.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => addWitness(w.id)}
              className="flex w-full items-center gap-3 border-b border-line px-3 py-2 text-left last:border-b-0"
            >
              <WitnessAvatar src={w.photo} alt={w.name} className="size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-ink">{w.name}</div>
                <div className="text-[10px] text-muted">@{w.nick}</div>
              </div>
              <Stars rating={w.rating} />
            </button>
          ))}
        </div>
      )}
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
