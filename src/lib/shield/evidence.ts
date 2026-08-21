export const GC_LAT = -27.9674;
export const GC_LNG = 153.3997;

export type TorchDecision = {
  on: boolean;
  reason: string;
  night: boolean;
  lux: number | null;
  luma: number | null;
};

const enc = new TextEncoder();

export function isNightFromClock(date = new Date()) {
  const hour = date.getHours();
  return hour < 6 || hour >= 18;
}

export async function sha256Hex(text: string) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
    return Math.abs(h).toString(16).padStart(16, "0");
  }
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function b64(bytes: ArrayBuffer | Uint8Array) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

export async function makeSessionKey() {
  if (typeof crypto === "undefined" || !crypto.subtle) return null;
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt"]);
}

export async function encryptPayload(key: CryptoKey | null, payload: string) {
  if (!key || typeof crypto === "undefined" || !crypto.subtle) {
    return { iv: "demo", cipher: btoa(payload).slice(0, 48) };
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(payload));
  return { iv: b64(iv), cipher: b64(cipher) };
}

export function decideTorch(opts: {
  userOff: boolean;
  userOn: boolean;
  hour?: number;
  lux: number | null;
  luma: number | null;
}): TorchDecision {
  const hour = opts.hour ?? new Date().getHours();
  const night = hour < 6 || hour >= 18;
  if (opts.userOff) {
    return { on: false, reason: "Torch off — you turned it off", night, lux: opts.lux, luma: opts.luma };
  }
  if (opts.userOn) {
    return { on: true, reason: "Torch on — you turned it on", night, lux: opts.lux, luma: opts.luma };
  }
  if (night) {
    return { on: true, reason: "Night on phone clock — torch on", night, lux: opts.lux, luma: opts.luma };
  }
  if (opts.lux != null && opts.lux < 20) {
    return { on: true, reason: `Low ambient light (${Math.round(opts.lux)} lux) — torch on`, night, lux: opts.lux, luma: opts.luma };
  }
  if (opts.luma != null && opts.luma < 38) {
    return { on: true, reason: "Camera routing: scene is dark — torch on", night, lux: opts.lux, luma: opts.luma };
  }
  return { on: false, reason: "Daytime / enough light — torch standby", night, lux: opts.lux, luma: opts.luma };
}

export function sampleLuma(video: HTMLVideoElement | null) {
  if (!video || video.readyState < 2) return null;
  const w = 32;
  const h = 18;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  try {
    ctx.drawImage(video, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return sum / (w * h);
  } catch {
    return null;
  }
}

export async function applyTorch(stream: MediaStream | null, on: boolean) {
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

export type CamStreams = { rear: MediaStream | null; front: MediaStream | null };

let liveStreams: CamStreams = { rear: null, front: null };
let primed: Promise<CamStreams> | null = null;

export function setLiveStreams(streams: CamStreams) {
  liveStreams = streams;
}

export function getLiveStreams() {
  return liveStreams;
}

function bindVideo(el: HTMLVideoElement | null, stream: MediaStream | null) {
  if (!el || !stream) return false;
  if (el.srcObject !== stream) el.srcObject = stream;
  el.muted = true;
  el.playsInline = true;
  el.autoplay = true;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  void el.play().catch(() => {});
  return true;
}

export function attachCameras() {
  const rear = document.getElementById("shield-rear-cam") as HTMLVideoElement | null;
  const front = document.getElementById("shield-front-cam") as HTMLVideoElement | null;
  const rearOk = bindVideo(rear, liveStreams.rear);
  const frontOk = bindVideo(front, liveStreams.front);
  return { rear: rearOk, front: frontOk };
}

async function gum(constraints: MediaStreamConstraints) {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch {
    return null;
  }
}

export async function openDualCameras(): Promise<CamStreams> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return { rear: null, front: null };
  }

  let [rear, front] = await Promise.all([
    gum({
      audio: false,
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
    }),
    gum({
      audio: false,
      video: { facingMode: { ideal: "user" }, width: { ideal: 640 }, height: { ideal: 480 } },
    }),
  ]);

  if (!rear && !front) {
    rear = await gum({ audio: false, video: true });
  }

  if (rear && front) {
    const rearId = rear.getVideoTracks()[0]?.getSettings?.().deviceId;
    const frontId = front.getVideoTracks()[0]?.getSettings?.().deviceId;
    if (rearId && frontId && rearId === frontId) {
      const devices = await navigator.mediaDevices.enumerateDevices().catch(() => [] as MediaDeviceInfo[]);
      const other = devices.find((d) => d.kind === "videoinput" && d.deviceId && d.deviceId !== rearId);
      if (other) {
        const alt = await gum({ audio: false, video: { deviceId: { exact: other.deviceId } } });
        if (alt) {
          front.getTracks().forEach((t) => t.stop());
          front = alt;
        }
      }
    }
  }

  if (rear && !front) {
    try {
      front = rear.clone();
    } catch {
      front = null;
    }
  }

  const mic = await gum({ audio: true, video: false });
  if (mic && rear) {
    mic.getAudioTracks().forEach((t) => rear!.addTrack(t));
  } else {
    mic?.getTracks().forEach((t) => t.stop());
  }

  return { rear, front };
}

export function primeDualCameras() {
  if (!primed) primed = openDualCameras();
  return primed;
}

export function resetCameraPrime() {
  primed = null;
}

export function stopStreams(streams: CamStreams) {
  for (const s of [streams.rear, streams.front]) {
    s?.getTracks().forEach((t) => t.stop());
  }
  if (streams.rear === liveStreams.rear) liveStreams.rear = null;
  if (streams.front === liveStreams.front) liveStreams.front = null;
}

export function watchGps(onFix: (lat: number, lng: number, accuracy: number) => void) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onFix(GC_LAT, GC_LNG, 12);
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (pos) => onFix(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
    () => onFix(GC_LAT, GC_LNG, 25),
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 8000 },
  );
  return () => navigator.geolocation.clearWatch(id);
}

export function watchLux(onLux: (lux: number | null) => void) {
  const Sensor = (window as unknown as { AmbientLightSensor?: new (opts: { frequency: number }) => {
    start: () => void;
    stop: () => void;
    illuminance: number;
    onreading: (() => void) | null;
    onerror: (() => void) | null;
  } }).AmbientLightSensor;
  if (!Sensor) {
    onLux(null);
    return () => {};
  }
  try {
    const sensor = new Sensor({ frequency: 1 });
    sensor.onreading = () => onLux(sensor.illuminance);
    sensor.onerror = () => onLux(null);
    sensor.start();
    return () => {
      try {
        sensor.stop();
      } catch {
        /* ignore */
      }
    };
  } catch {
    onLux(null);
    return () => {};
  }
}
