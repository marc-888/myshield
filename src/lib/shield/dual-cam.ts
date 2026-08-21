import {
  areDistinctCameras,
  concurrentConstraintAttempts,
  multiplexConstraintAttempts,
  MULTIPLEX_FRONT_MS,
  MULTIPLEX_REAR_MS,
  classifyVideoDevices,
  pickRecorderMime,
} from "../../../scripts/dual-cam-plan.mjs";

export type DualCamMode = "concurrent" | "multiplex" | "none";

export type CamStreams = {
  rear: MediaStream | null;
  front: MediaStream | null;
  mode?: DualCamMode;
};

export type DualCamSession = CamStreams & {
  stop: () => void;
  hardwareRear: () => MediaStream | null;
};

type CamIdentity = {
  deviceId?: string;
  facingMode?: string;
  label?: string;
  trackId?: string;
};

type Recorders = {
  rear: MediaRecorder | null;
  front: MediaRecorder | null;
  rearChunks: Blob[];
  frontChunks: Blob[];
};

let live: CamStreams = { rear: null, front: null, mode: "none" };
let session: DualCamSession | null = null;
let primed: Promise<DualCamSession> | null = null;
let recorders: Recorders | null = null;
let lastBlobs: { rear: Blob | null; front: Blob | null } = { rear: null, front: null };

export function getLiveStreams(): CamStreams {
  return live;
}

export function setLiveStreams(streams: CamStreams) {
  live = streams;
}

export function getLastRecordings() {
  return lastBlobs;
}

function identityOf(stream: MediaStream | null): CamIdentity | null {
  const track = stream?.getVideoTracks()[0];
  if (!track) return null;
  const settings = track.getSettings?.() ?? {};
  return {
    deviceId: settings.deviceId,
    facingMode: settings.facingMode,
    label: track.label,
    trackId: track.id,
  };
}

export function streamHasLiveVideo(stream: MediaStream | null) {
  const track = stream?.getVideoTracks()[0];
  return Boolean(track && track.readyState === "live" && !track.muted);
}

export function isPhysicalDual(rear: MediaStream | null, front: MediaStream | null) {
  if (!streamHasLiveVideo(rear) || !streamHasLiveVideo(front)) return false;
  return areDistinctCameras(identityOf(rear), identityOf(front));
}

function releaseStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((t) => {
    try {
      t.stop();
    } catch {
      /* ignore */
    }
  });
}

async function gum(constraints: MediaStreamConstraints) {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch {
    return null;
  }
}

async function openWithAttempts(
  attempts: Array<{ video: object; audio: false }>,
): Promise<MediaStream | null> {
  for (const constraints of attempts) {
    const stream = await gum(constraints as MediaStreamConstraints);
    if (streamHasLiveVideo(stream)) return stream;
    releaseStream(stream);
  }
  return null;
}

async function primePermission() {
  const first = await gum({
    audio: false,
    video: { facingMode: { ideal: "environment" }, width: { max: 320 }, height: { max: 240 } },
  });
  if (first) {
    releaseStream(first);
    return;
  }
  const any = await gum({ audio: false, video: true });
  releaseStream(any);
}

async function listVideoDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return classifyVideoDevices(devices);
  } catch {
    return classifyVideoDevices([]);
  }
}

function bindVideo(el: HTMLVideoElement, stream: MediaStream | null) {
  if (!stream) return false;
  if (el.srcObject !== stream) el.srcObject = stream;
  el.muted = true;
  el.playsInline = true;
  el.autoplay = true;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  void el.play().catch(() => {});
  return streamHasLiveVideo(stream);
}

export function attachCameras() {
  const rearNodes = document.querySelectorAll<HTMLVideoElement>(
    "[data-shield-cam='rear'], #shield-rear-cam",
  );
  const frontNodes = document.querySelectorAll<HTMLVideoElement>(
    "[data-shield-cam='front'], #shield-front-cam",
  );
  let rearOk = false;
  let frontOk = false;
  rearNodes.forEach((el) => {
    if (bindVideo(el, live.rear)) rearOk = true;
  });
  frontNodes.forEach((el) => {
    if (bindVideo(el, live.front)) frontOk = true;
  });
  return { rear: rearOk, front: frontOk };
}

function attachMic(target: MediaStream | null) {
  return gum({ audio: { echoCancellation: true, noiseSuppression: true }, video: false }).then(
    (mic) => {
      if (mic && target) {
        mic.getAudioTracks().forEach((t) => target.addTrack(t));
      } else {
        releaseStream(mic);
      }
    },
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function openKind(
  kind: "rear" | "front",
  deviceId: string | null | undefined,
  concurrent: boolean,
) {
  const attempts = concurrent
    ? concurrentConstraintAttempts(kind, deviceId)
    : multiplexConstraintAttempts(kind, deviceId);
  return openWithAttempts(attempts);
}

async function tryConcurrent(classified: ReturnType<typeof classifyVideoDevices>): Promise<CamStreams | null> {
  const rearId = classified.dualDevices ? classified.rear?.deviceId : null;
  const frontId = classified.dualDevices ? classified.front?.deviceId : null;

  const [rearSettled, frontSettled] = await Promise.allSettled([
    openKind("rear", rearId, true),
    openKind("front", frontId, true),
  ]);
  const rear = rearSettled.status === "fulfilled" ? rearSettled.value : null;
  const front = frontSettled.status === "fulfilled" ? frontSettled.value : null;

  if (isPhysicalDual(rear, front)) {
    return { rear, front, mode: "concurrent" };
  }

  releaseStream(rear);
  releaseStream(front);

  const seqRear = await openKind("rear", rearId, true);
  await sleep(140);
  const seqFront = await openKind("front", frontId, true);
  if (isPhysicalDual(seqRear, seqFront)) {
    return { rear: seqRear, front: seqFront, mode: "concurrent" };
  }
  releaseStream(seqRear);
  releaseStream(seqFront);

  const seqFrontFirst = await openKind("front", frontId, true);
  await sleep(140);
  const seqRearSecond = await openKind("rear", rearId, true);
  if (isPhysicalDual(seqRearSecond, seqFrontFirst)) {
    return { rear: seqRearSecond, front: seqFrontFirst, mode: "concurrent" };
  }

  releaseStream(seqFrontFirst);
  releaseStream(seqRearSecond);
  return null;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  w: number,
  h: number,
  srcW: number,
  srcH: number,
) {
  if (!srcW || !srcH) {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);
    return;
  }
  const scale = Math.max(w / srcW, h / srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  ctx.drawImage(source, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

async function startMultiplex(
  classified: ReturnType<typeof classifyVideoDevices>,
): Promise<DualCamSession | null> {
  const rearCanvas = document.createElement("canvas");
  const frontCanvas = document.createElement("canvas");
  rearCanvas.width = 640;
  rearCanvas.height = 480;
  frontCanvas.width = 480;
  frontCanvas.height = 360;
  const rearCtxMaybe = rearCanvas.getContext("2d", { alpha: false });
  const frontCtxMaybe = frontCanvas.getContext("2d", { alpha: false });
  if (!rearCtxMaybe || !frontCtxMaybe) return null;
  const rearDraw = rearCtxMaybe;
  const frontDraw = frontCtxMaybe;

  const lastRear = document.createElement("canvas");
  const lastFront = document.createElement("canvas");
  lastRear.width = rearCanvas.width;
  lastRear.height = rearCanvas.height;
  lastFront.width = frontCanvas.width;
  lastFront.height = frontCanvas.height;
  const lastRearMaybe = lastRear.getContext("2d", { alpha: false });
  const lastFrontMaybe = lastFront.getContext("2d", { alpha: false });
  if (!lastRearMaybe || !lastFrontMaybe) return null;
  const lastRearDraw = lastRearMaybe;
  const lastFrontDraw = lastFrontMaybe;

  lastRearDraw.fillStyle = "#111";
  lastRearDraw.fillRect(0, 0, lastRear.width, lastRear.height);
  lastFrontDraw.fillStyle = "#111";
  lastFrontDraw.fillRect(0, 0, lastFront.width, lastFront.height);

  const sink = document.createElement("video");
  sink.muted = true;
  sink.playsInline = true;
  sink.autoplay = true;
  sink.setAttribute("playsinline", "");
  sink.setAttribute("webkit-playsinline", "");

  const rearOut = rearCanvas.captureStream(12);
  const frontOut = frontCanvas.captureStream(12);

  let stopped = false;
  let hardware: MediaStream | null = null;
  let facing: "rear" | "front" = "rear";
  let paintedRear = false;
  let paintedFront = false;

  const rearId = classified.rear?.deviceId ?? null;
  const frontId = classified.front?.deviceId ?? null;

  async function openFacing(which: "rear" | "front") {
    const next = await openKind(which, which === "rear" ? rearId : frontId, false);
    if (!next) return false;
    releaseStream(hardware);
    hardware = next;
    sink.srcObject = next;
    facing = which;
    try {
      await sink.play();
    } catch {
      /* autoplay may wait for a gesture; draw loop still runs */
    }
    return true;
  }

  function paint() {
    if (stopped) return;
    const srcW = sink.videoWidth || 0;
    const srcH = sink.videoHeight || 0;
    if (sink.readyState >= 2 && srcW > 0) {
      if (facing === "rear") {
        drawCover(rearDraw, sink, rearCanvas.width, rearCanvas.height, srcW, srcH);
        lastRearDraw.drawImage(rearCanvas, 0, 0);
        paintedRear = true;
      } else {
        drawCover(frontDraw, sink, frontCanvas.width, frontCanvas.height, srcW, srcH);
        lastFrontDraw.drawImage(frontCanvas, 0, 0);
        paintedFront = true;
      }
    }
    drawCover(
      facing === "rear" ? frontDraw : rearDraw,
      facing === "rear" ? lastFront : lastRear,
      facing === "rear" ? frontCanvas.width : rearCanvas.width,
      facing === "rear" ? frontCanvas.height : rearCanvas.height,
      facing === "rear" ? lastFront.width : lastRear.width,
      facing === "rear" ? lastFront.height : lastRear.height,
    );
    requestAnimationFrame(paint);
  }

  const openedRear = await openFacing("rear");
  const rearIdent = identityOf(hardware);
  await sleep(180);
  const openedFront = await openFacing("front");
  const frontIdent = identityOf(hardware);
  if (!openedRear && !openedFront) {
    stopped = true;
    releaseStream(hardware);
    releaseStream(rearOut);
    releaseStream(frontOut);
    return null;
  }
  if (openedRear && openedFront && !areDistinctCameras(rearIdent, frontIdent)) {
    stopped = true;
    releaseStream(hardware);
    releaseStream(rearOut);
    releaseStream(frontOut);
    return null;
  }
  paint();

  const cycle = async () => {
    while (!stopped) {
      if (facing !== "rear") await openFacing("rear");
      await sleep(MULTIPLEX_REAR_MS);
      if (stopped) break;
      await openFacing("front");
      await sleep(MULTIPLEX_FRONT_MS);
    }
  };
  void cycle();

  await attachMic(rearOut);

  const waitDeadline = Date.now() + 4000;
  while (Date.now() < waitDeadline && !(paintedRear || paintedFront)) {
    await sleep(80);
  }

  return {
    rear: rearOut,
    front: frontOut,
    mode: "multiplex",
    hardwareRear: () => (facing === "rear" ? hardware : null),
    stop: () => {
      stopped = true;
      releaseStream(hardware);
      hardware = null;
      sink.srcObject = null;
      rearOut.getTracks().forEach((t) => t.stop());
      frontOut.getTracks().forEach((t) => t.stop());
    },
  };
}

function stopRecorders() {
  if (!recorders) return;
  for (const rec of [recorders.rear, recorders.front]) {
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
  }
}

function startRecorder(stream: MediaStream | null, chunks: Blob[]) {
  if (!stream || typeof MediaRecorder === "undefined") return null;
  const mime = pickRecorderMime((t) => MediaRecorder.isTypeSupported(t));
  try {
    const rec = mime ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 600_000 }) : new MediaRecorder(stream);
    rec.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunks.push(ev.data);
    };
    rec.start(4000);
    return rec;
  } catch {
    return null;
  }
}

export function startEvidenceRecorders(streams: CamStreams) {
  stopRecorders();
  const bag: Recorders = { rear: null, front: null, rearChunks: [], frontChunks: [] };
  bag.rear = startRecorder(streams.rear, bag.rearChunks);
  bag.front = startRecorder(streams.front, bag.frontChunks);
  recorders = bag;
  return bag;
}

export function stopEvidenceRecorders() {
  const bag = recorders;
  stopRecorders();
  recorders = null;
  if (!bag) {
    lastBlobs = { rear: null, front: null };
    return lastBlobs;
  }
  const type = bag.rear?.mimeType || bag.front?.mimeType || "video/webm";
  lastBlobs = {
    rear: bag.rearChunks.length ? new Blob(bag.rearChunks, { type }) : null,
    front: bag.frontChunks.length ? new Blob(bag.frontChunks, { type }) : null,
  };
  return lastBlobs;
}

export async function applySessionTorch(on: boolean) {
  const stream = session?.hardwareRear() ?? session?.rear ?? live.rear;
  const track = stream?.getVideoTracks()[0];
  if (!track) return false;
  const caps = track.getCapabilities?.() as { torch?: boolean } | undefined;
  if (!caps?.torch) return false;
  try {
    await track.applyConstraints({ advanced: [{ torch: on }] } as unknown as MediaTrackConstraints);
    return true;
  } catch {
    return false;
  }
}

export async function startDualCameras(): Promise<DualCamSession> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    const empty: DualCamSession = {
      rear: null,
      front: null,
      mode: "none",
      stop: () => {},
      hardwareRear: () => null,
    };
    session = empty;
    live = empty;
    return empty;
  }

  await primePermission();
  const classified = await listVideoDevices();

  const concurrent = await tryConcurrent(classified);
  if (concurrent) {
    await attachMic(concurrent.rear);
    const started: DualCamSession = {
      ...concurrent,
      hardwareRear: () => concurrent.rear,
      stop: () => {
        releaseStream(concurrent.rear);
        releaseStream(concurrent.front);
      },
    };
    session = started;
    live = started;
    startEvidenceRecorders(started);
    return started;
  }

  const multiplex = await startMultiplex(classified);
  if (multiplex) {
    session = multiplex;
    live = multiplex;
    startEvidenceRecorders(multiplex);
    return multiplex;
  }

  const fallbackRear =
    (await openKind("rear", classified.rear?.deviceId, false)) ??
    (await gum({ audio: false, video: true }));
  const empty: DualCamSession = {
    rear: fallbackRear,
    front: null,
    mode: "none",
    hardwareRear: () => fallbackRear,
    stop: () => releaseStream(fallbackRear),
  };
  if (fallbackRear) await attachMic(fallbackRear);
  session = empty;
  live = empty;
  startEvidenceRecorders(empty);
  return empty;
}

export function primeDualCameras() {
  if (!primed) {
    primed = startDualCameras().catch((err) => {
      primed = null;
      throw err;
    });
  }
  return primed;
}

export function resetCameraPrime() {
  primed = null;
}

export function stopDualCameras() {
  stopEvidenceRecorders();
  session?.stop();
  session = null;
  live = { rear: null, front: null, mode: "none" };
  resetCameraPrime();
}

export function stopStreams(streams: CamStreams) {
  if (session && (streams.rear === session.rear || streams.front === session.front)) {
    stopDualCameras();
    return;
  }
  releaseStream(streams.rear);
  releaseStream(streams.front);
  if (streams.rear === live.rear) live.rear = null;
  if (streams.front === live.front) live.front = null;
}

/** Keep trying the missing lens without dropping the one that is already recording. */
export async function ensureDualCameras() {
  if (!session || session.mode === "multiplex") return session;
  const rearOk = streamHasLiveVideo(session.rear);
  const frontOk = streamHasLiveVideo(session.front);
  if (rearOk && frontOk && isPhysicalDual(session.rear, session.front)) {
    session.mode = "concurrent";
    live = session;
    return session;
  }
  const classified = await listVideoDevices();
  if (!classified.dualDevices) return session;
  if (rearOk && !frontOk) {
    const front = await openKind("front", classified.front?.deviceId, true);
    if (front && isPhysicalDual(session.rear, front)) {
      session.front = front;
      session.mode = "concurrent";
      live = session;
      startEvidenceRecorders(session);
      return session;
    }
    releaseStream(front);
  }
  if (frontOk && !rearOk) {
    const rear = await openKind("rear", classified.rear?.deviceId, true);
    if (rear && isPhysicalDual(rear, session.front)) {
      session.rear = rear;
      session.mode = "concurrent";
      session.hardwareRear = () => rear;
      live = session;
      startEvidenceRecorders(session);
      return session;
    }
    releaseStream(rear);
  }
  if ((!rearOk || !frontOk) && classified.dualDevices) {
    const keep = session;
    const multiplex = await startMultiplex(classified);
    if (multiplex) {
      keep.stop();
      session = multiplex;
      live = multiplex;
      startEvidenceRecorders(multiplex);
      return multiplex;
    }
  }
  return session;
}
