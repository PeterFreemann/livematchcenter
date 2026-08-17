import type { Match } from "@/lib/types";
import { isLive } from "@/lib/format";

export function ScoreboardTicker({ matches }: { matches: Match[] }) {
  const live = matches.filter((m) => isLive(m.status));
  if (live.length === 0) return null;

  const items = live.map((m) => (
    <span key={m.id} className="inline-flex items-center gap-2 px-6 font-mono text-sm text-chalk">
      <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulseDot" />
      {m.homeTeam.shortName} <span className="text-gold">{m.homeScore}</span>
      <span className="text-mute">–</span>
      <span className="text-gold">{m.awayScore}</span> {m.awayTeam.shortName}
      <span className="text-mute">{m.minute}&apos;</span>
    </span>
  ));

  return (
    <div className="overflow-hidden border-y border-pitch-line bg-pitch-card/60">
      <div className="flex w-max animate-ticker whitespace-nowrap py-2 motion-reduce:animate-none">
        {items}
        {items}
      </div>
    </div>
  );
}
