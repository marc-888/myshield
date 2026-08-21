import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { APP_NAME, DEMO_PIN } from "@/lib/shield/data";

export const Route = createFileRoute("/install")({ component: InstallPage });

function InstallPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas p-6 text-zinc-100">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-navy">
            <Shield className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{APP_NAME}</h1>
            <p className="text-sm text-zinc-400">Add to your phone home screen</p>
          </div>
        </div>
        <div className="mb-8 space-y-4 text-sm text-zinc-300">
          {[
            "Open this site in Chrome (Android) or Safari (iPhone).",
            "Tap Share or the menu → Add to Home Screen.",
            `Launch ${APP_NAME} from the icon. Demo PIN to end calls: ${DEMO_PIN}.`,
            "Attorney, Witness and SOS sit at the top — dual cam and GPS start instantly.",
          ].map((step, i) => (
            <div key={step} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold">
                {i + 1}
              </span>
              <p>{step}</p>
            </div>
          ))}
        </div>
        <Link
          to="/"
          className="mb-3 block w-full rounded-2xl bg-emerald-600 py-4 text-center font-semibold hover:bg-emerald-500"
        >
          Open {APP_NAME}
        </Link>
        <p className="mt-6 text-center text-xs text-zinc-500">Demo prototype. Not legal advice.</p>
      </div>
    </div>
  );
}