import { createFileRoute } from "@tanstack/react-router";
import { ShieldApp } from "@/components/shield/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ShieldApp />;
}
