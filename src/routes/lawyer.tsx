import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Scale, Video } from "lucide-react";

export const Route = createFileRoute("/lawyer")({ component: LawyerPortal });

function LawyerPortal() {
  const [channel, setChannel] = useState("shield-gc-traffic-demo");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="min-h-dvh bg-canvas p-4 text-zinc-100">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-navy">
            <Scale className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">MyShield Lawyer</h1>
            <p className="text-xs text-zinc-400">Agora video — panel portal</p>
          </div>
        </div>

        {!joined ? (
          <div className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <label className="mb-1 block text-xs text-zinc-400">Session channel</label>
            <input
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="Paste channel from client app"
              className="mb-3 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (!channel.trim()) {
                  setError("Enter the channel name from the client app.");
                  return;
                }
                setError("");
                setJoined(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-semibold hover:bg-emerald-500"
            >
              <Video className="size-4" /> Join video session
            </button>
            <p className="mt-3 text-[10px] text-zinc-500">
              Client shows this channel ID on the match screen. Open this page on a second device or
              laptop. Agora credentials are not configured in this partner copy — the join is
              simulated.
            </p>
          </div>
        ) : (
          <div>
            <div className="relative mb-3 aspect-3/4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-sm text-zinc-400">
                Client video (demo)
              </div>
              <div className="absolute top-3 left-3 rounded-full bg-sos px-2 py-1 text-[10px] font-semibold">
                LIVE
              </div>
              <div className="absolute right-3 bottom-3 flex h-32 w-24 items-center justify-center rounded-xl border-2 border-white/30 bg-navy text-xs font-bold">
                You
              </div>
            </div>
            <div className="mb-3 text-xs text-zinc-400">Connected via Agora E2E (simulated)</div>
            <button
              type="button"
              onClick={() => setJoined(false)}
              className="w-full rounded-2xl bg-sos py-3 text-sm font-semibold"
            >
              Leave session
            </button>
          </div>
        )}

        {error ? <p className="text-xs text-red-400">{error}</p> : null}

        <Link to="/" className="mt-6 inline-block text-xs text-blue-400 underline">
          ← Back to member app
        </Link>
      </div>
    </div>
  );
}
