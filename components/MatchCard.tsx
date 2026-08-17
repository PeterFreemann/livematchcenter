import Link from "next/link";
import type { Match } from "@/lib/types";
import { isLive, statusLabel } from "@/lib/format";
import { LiveBadge } from "./LiveBadge";

export function MatchCard({ match }: { match: Match }) {
  const live = isLive(match.status);
  const finished = match.status === "FULL_TIME";

  return (
    <Link
      href={`/match/${match.id}`}
      className={`group block rounded-lg border bg-pitch-card p-4 transition hover:border-gold/40 hover:bg-pitch-raised ${
        live ? "border-live/30" : "border-pitch-line"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        {live ? (
          <LiveBadge />
        ) : (
          <span className="text-xs font-medium uppercase tracking-widest text-mute">
            {finished ? "Full-time" : "Upcoming"}
          </span>
        )}
        <span className="font-mono text-xs text-mute">{statusLabel(match.status, match.minute)}</span>
      </div>

      <div className="space-y-2">
        <TeamRow name={match.homeTeam.name} short={match.homeTeam.shortName} score={match.homeScore} emphasize={live} />
        <TeamRow name={match.awayTeam.name} short={match.awayTeam.shortName} score={match.awayScore} emphasize={live} />
      </div>

      <div className="mt-3 text-right text-xs font-medium text-mute opacity-0 transition group-hover:opacity-100">
        View match →
      </div>
    </Link>
  );
}

function TeamRow({
  name,
  short,
  score,
  emphasize,
}: {
  name: string;
  short: string;
  score: number;
  emphasize: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-pitch-line font-display text-[11px] font-semibold text-mute">
          {short}
        </span>
        <span className="truncate text-sm text-chalk">{name}</span>
      </div>
      <span
        className={`font-display text-2xl leading-none ${
          emphasize ? "text-chalk" : "text-mute"
        }`}
      >
        {score}
      </span>
    </div>
  );
}
