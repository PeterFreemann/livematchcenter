"use client";

import Link from "next/link";
import { useMatchDetail } from "@/hooks/useMatchDetail";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { LiveBadge } from "@/components/LiveBadge";
import { EventTimeline } from "@/components/EventTimeline";
import { StatsPanel } from "@/components/StatsPanel";
import { Chat } from "@/components/Chat";
import { isLive, statusLabel } from "@/lib/format";

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const { match, loading, error, connectionState, refetch } = useMatchDetail(params.id);

  return (
    <main className="min-h-screen">
      <ConnectionStatus state={connectionState} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href="/" className="mb-6 inline-block text-xs text-mute hover:text-chalk">
          ← All matches
        </Link>

        {loading && (
          <div className="h-40 animate-pulse rounded-lg border border-pitch-line bg-pitch-card" />
        )}

        {error && !loading && (
          <div className="rounded-lg border border-live/30 bg-live/5 p-4 text-sm text-live">
            {error}{" "}
            <button onClick={refetch} className="underline underline-offset-2 hover:text-chalk">
              Retry
            </button>
          </div>
        )}

        {match && !loading && (
          <>
            <section className="rounded-lg border border-pitch-line bg-pitch-card p-6">
              <div className="mb-4 flex items-center justify-between">
                {isLive(match.status) ? (
                  <LiveBadge />
                ) : (
                  <span className="text-xs font-medium uppercase tracking-widest text-mute">
                    {match.status === "FULL_TIME" ? "Full-time" : "Upcoming"}
                  </span>
                )}
                <span className="font-mono text-xs text-mute">
                  {statusLabel(match.status, match.minute)}
                </span>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <TeamBlock name={match.homeTeam.name} short={match.homeTeam.shortName} />
                <div className="text-center font-display text-6xl text-chalk">
                  {match.homeScore} <span className="text-mute">–</span> {match.awayScore}
                </div>
                <TeamBlock name={match.awayTeam.name} short={match.awayTeam.shortName} align="right" />
              </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-lg border border-pitch-line bg-pitch-card p-5">
                <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-mute">Timeline</h2>
                <EventTimeline events={match.events} />
              </section>

              <div className="space-y-6">
                <section className="rounded-lg border border-pitch-line bg-pitch-card p-5">
                  <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-mute">Statistics</h2>
                  <StatsPanel statistics={match.statistics} />
                </section>

                <section className="rounded-lg border border-pitch-line bg-pitch-card p-5">
                  <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-mute">Match chat</h2>
                  <Chat matchId={match.id} />
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function TeamBlock({
  name,
  short,
  align = "left",
}: {
  name: string;
  short: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div
        className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-pitch-line font-display text-sm font-semibold text-mute">
          {short}
        </span>
        <span className="truncate text-sm text-chalk">{name}</span>
      </div>
    </div>
  );
}
