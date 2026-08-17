import type { ConnectionState } from "@/lib/types";

const COPY: Record<ConnectionState, { label: string; tone: string } | null> = {
  connected: null,
  connecting: { label: "Connecting to live feed…", tone: "bg-amber/10 text-amber" },
  reconnecting: { label: "Connection lost — reconnecting…", tone: "bg-amber/10 text-amber" },
  disconnected: { label: "Offline — live updates paused", tone: "bg-live/10 text-live" },
};

export function ConnectionStatus({ state }: { state: ConnectionState }) {
  const copy = COPY[state];
  if (!copy) return null;

  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium ${copy.tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {copy.label}
    </div>
  );
}
