// @ts-check
/**
 * Pure dual-camera helpers. Used by the live capture module and unit tests.
 * No DOM / getUserMedia here — those live in src/lib/shield/dual-cam.ts.
 */

export const FRONT_LABEL_RE = /front|user|face|selfie|facetime|facing.?user/i;
export const REAR_LABEL_RE =
  /back|rear|environment|traseira|arri[eè]re|world|wide|ultra|tele|environment-facing/i;

/** Low-res first: concurrent cameras usually only work when both streams are small. */
export const CONCURRENT_SIZES = [
  { width: { max: 320 }, height: { max: 240 }, frameRate: { max: 12 } },
  { width: { max: 640 }, height: { max: 480 }, frameRate: { max: 15 } },
];

export const MULTIPLEX_SIZES = [
  { width: { max: 640 }, height: { max: 480 }, frameRate: { max: 20 } },
  { width: { max: 1280 }, height: { max: 720 }, frameRate: { max: 24 } },
];

/** Rear stays on longer — that is the scene. Front still gets regular stills + motion. */
export const MULTIPLEX_REAR_MS = 1600;
export const MULTIPLEX_FRONT_MS = 700;

/**
 * @typedef {{ deviceId: string, kind?: string, label?: string, groupId?: string }} VideoDeviceLike
 * @typedef {{ front: VideoDeviceLike | null, rear: VideoDeviceLike | null, all: VideoDeviceLike[], dualDevices: boolean }} ClassifiedCams
 * @typedef {{ deviceId?: string, facingMode?: string, label?: string, trackId?: string }} CamIdentity
 */

/**
 * @param {Iterable<{ deviceId?: string, kind?: string, label?: string, groupId?: string }>} devices
 * @returns {ClassifiedCams}
 */
export function classifyVideoDevices(devices) {
  /** @type {VideoDeviceLike[]} */
  const cams = [];
  for (const d of devices) {
    if ((d.kind ?? "videoinput") !== "videoinput") continue;
    if (!d.deviceId || d.deviceId === "default") continue;
    cams.push({
      deviceId: d.deviceId,
      kind: d.kind,
      label: d.label ?? "",
      groupId: d.groupId,
    });
  }

  const labeledFront = cams.find((d) => FRONT_LABEL_RE.test(d.label ?? "")) ?? null;
  const labeledRear =
    cams.find((d) => REAR_LABEL_RE.test(d.label ?? "") && d.deviceId !== labeledFront?.deviceId) ??
    null;

  /** @type {VideoDeviceLike | null} */
  let front = labeledFront;
  /** @type {VideoDeviceLike | null} */
  let rear = labeledRear;

  if (!labeledFront && !labeledRear && cams.length >= 2) {
    rear = cams[0];
    front = cams[1];
  } else {
    const rest = cams.filter((d) => d.deviceId !== front?.deviceId && d.deviceId !== rear?.deviceId);
    if (!rear && rest.length) rear = rest.shift() ?? null;
    if (!front && rest.length) front = rest.shift() ?? null;
    if (!front && cams[0] && cams[0].deviceId !== rear?.deviceId) front = cams[0];
    if (!rear && cams[0] && cams[0].deviceId !== front?.deviceId) rear = cams[0];
  }

  const dualDevices = Boolean(front && rear && front.deviceId !== rear.deviceId);
  return { front, rear, all: cams, dualDevices };
}

/**
 * Two live tracks are a real dual-cam pair only if they are different hardware
 * (facingMode, deviceId, or label). Same deviceId / same track is a fake clone.
 * @param {CamIdentity | null | undefined} a
 * @param {CamIdentity | null | undefined} b
 */
export function areDistinctCameras(a, b) {
  if (!a || !b) return false;
  if (a.trackId && b.trackId && a.trackId === b.trackId) return false;
  if (a.deviceId && b.deviceId && a.deviceId === b.deviceId) return false;
  if (a.facingMode && b.facingMode && a.facingMode !== b.facingMode) return true;
  if (a.deviceId && b.deviceId && a.deviceId !== b.deviceId) return true;
  if (a.label && b.label && a.label !== b.label) return true;
  return false;
}

/**
 * @param {"rear" | "front"} kind
 * @param {string | null | undefined} deviceId
 * @param {{ width?: object, height?: object, frameRate?: object }} size
 * @returns {Array<{ video: object, audio: false }>}
 */
export function cameraConstraintAttempts(kind, deviceId, size) {
  const facing = kind === "rear" ? "environment" : "user";
  /** @type {Array<{ video: object, audio: false }>} */
  const attempts = [];
  if (deviceId) {
    attempts.push({ video: { deviceId: { exact: deviceId }, ...size }, audio: false });
    attempts.push({ video: { deviceId: { ideal: deviceId }, ...size }, audio: false });
  }
  attempts.push({ video: { facingMode: { exact: facing }, ...size }, audio: false });
  attempts.push({ video: { facingMode: { ideal: facing }, ...size }, audio: false });
  attempts.push({ video: { facingMode: facing, ...size }, audio: false });
  return attempts;
}

/**
 * @param {"rear" | "front"} kind
 * @param {string | null | undefined} deviceId
 */
export function concurrentConstraintAttempts(kind, deviceId) {
  return CONCURRENT_SIZES.flatMap((size) => cameraConstraintAttempts(kind, deviceId, size));
}

/**
 * @param {"rear" | "front"} kind
 * @param {string | null | undefined} deviceId
 */
export function multiplexConstraintAttempts(kind, deviceId) {
  return MULTIPLEX_SIZES.flatMap((size) => cameraConstraintAttempts(kind, deviceId, size));
}

/**
 * @param {(type: string) => boolean} isTypeSupported
 */
export function pickRecorderMime(isTypeSupported) {
  const types = [
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4;codecs=avc1",
    "video/mp4",
  ];
  return types.find((t) => isTypeSupported(t)) ?? "";
}

/**
 * @param {CamIdentity | null | undefined} rear
 * @param {CamIdentity | null | undefined} front
 * @returns {"concurrent" | "none"}
 */
export function dualCamModeFromIdentities(rear, front) {
  return areDistinctCameras(rear, front) ? "concurrent" : "none";
}
