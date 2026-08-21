import assert from "node:assert/strict";
import test from "node:test";
import {
  areDistinctCameras,
  cameraConstraintAttempts,
  classifyVideoDevices,
  concurrentConstraintAttempts,
  dualCamModeFromIdentities,
  pickRecorderMime,
} from "./dual-cam-plan.mjs";

function cam(id, label, kind = "videoinput") {
  return { deviceId: id, kind, label };
}

test("classifies labeled front and rear cameras", () => {
  const { front, rear, dualDevices } = classifyVideoDevices([
    cam("a", "Front Camera"),
    cam("b", "Back Camera"),
  ]);
  assert.equal(front?.deviceId, "a");
  assert.equal(rear?.deviceId, "b");
  assert.equal(dualDevices, true);
});

test("treats selfie / FaceTime as front and environment / ultra as rear", () => {
  const { front, rear, dualDevices } = classifyVideoDevices([
    cam("u", "camera2 0, facing back, ultra-wide"),
    cam("f", "FaceTime HD Camera"),
  ]);
  assert.equal(front?.deviceId, "f");
  assert.equal(rear?.deviceId, "u");
  assert.equal(dualDevices, true);
});

test("two unlabeled cameras become rear then front (Android camera0 is usually back)", () => {
  const { front, rear, dualDevices } = classifyVideoDevices([
    cam("0", ""),
    cam("1", ""),
  ]);
  assert.equal(rear?.deviceId, "0");
  assert.equal(front?.deviceId, "1");
  assert.equal(dualDevices, true);
});

test("a single camera is not dualDevices", () => {
  const { dualDevices, all } = classifyVideoDevices([cam("only", "Integrated Webcam")]);
  assert.equal(all.length, 1);
  assert.equal(dualDevices, false);
});

test("ignores audio inputs and default device ids", () => {
  const { all, dualDevices } = classifyVideoDevices([
    { deviceId: "mic", kind: "audioinput", label: "Mic" },
    cam("default", "Front Camera"),
    cam("real", "Back Camera"),
  ]);
  assert.equal(all.length, 1);
  assert.equal(dualDevices, false);
});

test("distinct cameras require different hardware, not a cloned track", () => {
  assert.equal(
    areDistinctCameras(
      { deviceId: "1", facingMode: "user", trackId: "t1" },
      { deviceId: "2", facingMode: "environment", trackId: "t2" },
    ),
    true,
  );
  assert.equal(
    areDistinctCameras(
      { deviceId: "1", facingMode: "user", trackId: "t1" },
      { deviceId: "1", facingMode: "user", trackId: "t1-clone" },
    ),
    false,
  );
  assert.equal(
    areDistinctCameras({ trackId: "same" }, { trackId: "same", deviceId: "x" }),
    false,
  );
  assert.equal(areDistinctCameras(null, { deviceId: "1" }), false);
});

test("facingMode user vs environment is enough even without deviceIds", () => {
  assert.equal(
    areDistinctCameras({ facingMode: "user" }, { facingMode: "environment" }),
    true,
  );
});

test("constraint ladder uses exact deviceId first then facingMode", () => {
  const attempts = cameraConstraintAttempts("rear", "back-id", {
    width: { max: 320 },
    height: { max: 240 },
  });
  assert.deepEqual(attempts[0].video.deviceId, { exact: "back-id" });
  assert.equal(attempts[0].audio, false);
  assert.equal(attempts.some((a) => a.video.facingMode?.exact === "environment"), true);
  assert.equal(attempts.some((a) => a.video.facingMode === "environment"), true);
});

test("concurrent ladder starts at 320x240 so phones can run two lenses", () => {
  const first = concurrentConstraintAttempts("front", "f")[0];
  assert.equal(first.video.width.max, 320);
  assert.equal(first.video.height.max, 240);
  assert.equal(first.video.frameRate.max, 12);
});

test("picks the first MediaRecorder mime the browser supports", () => {
  assert.equal(pickRecorderMime(() => false), "");
  assert.equal(
    pickRecorderMime((t) => t === "video/mp4"),
    "video/mp4",
  );
  assert.equal(
    pickRecorderMime((t) => t.startsWith("video/webm")),
    "video/webm;codecs=vp8,opus",
  );
});

test("mode is concurrent only for distinct identities", () => {
  assert.equal(
    dualCamModeFromIdentities({ deviceId: "a", facingMode: "environment" }, { deviceId: "b", facingMode: "user" }),
    "concurrent",
  );
  assert.equal(dualCamModeFromIdentities({ deviceId: "a" }, { deviceId: "a" }), "none");
});
