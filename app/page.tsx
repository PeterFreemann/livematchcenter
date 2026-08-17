"use client";

import { useMatches } from "@/hooks/useMatches";
import { MatchCard } from "@/components/MatchCard";
import { ScoreboardTicker } from "@/components/ScoreboardTicker";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { isLive } from "@/lib/format";
import type { Match } from "@/lib/types";

export default function DashboardPage() {
  const { matches, loading, error, connectionState, refetch } = useMatches();

  const live = matches.filter((m) => isLive(m.status));
  const upcoming = matches.filter((m) => m.status === "NOT_STARTED");
  const finished = matches.filter((m) => m.status === "FULL_TIME");

  return (
    <main className="min-h-screen">
      <ConnectionStatus state={connectionState} />
      <ScoreboardTicker matches={matches} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mute">Match Center</p>
          <h1 className="font-display text-5xl leading-none tracking-tight text-chalk">
            Today&apos;s Fixtures
          </h1>
        </header>

        {loading && <SkeletonGrid />}

        {error && !loading && (
          <div className="rounded-lg border border-live/30 bg-live/5 p-4 text-sm text-live">
            {error}{" "}
            <button onClick={refetch} className="underline underline-offset-2 hover:text-chalk">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <p className="text-sm text-mute">No matches on the board right now.</p>
        )}

        {!loading && !error && (
          <div className="space-y-10">
            <Section title="Live now" matches={live} />
            <Section title="Upcoming" matches={upcoming} />
            <Section title="Full-time" matches={finished} />
          </div>
        )}
      </div>
    </main>
  );
}

function Section({ title, matches }: { title: string; matches: Match[] }) {
  if (matches.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-mute">
        {title} <span className="text-pitch-line">/</span> {matches.length}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-lg border border-pitch-line bg-pitch-card" />
      ))}
    </div>
  );
}
