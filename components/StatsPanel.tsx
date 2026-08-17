import type { Statistics } from "@/lib/types";

type StatKey = keyof Statistics;

const ROWS: { key: StatKey; label: string; suffix?: string }[] = [
  { key: "possession", label: "Possession", suffix: "%" },
  { key: "shots", label: "Shots" },
  { key: "shotsOnTarget", label: "Shots on target" },
  { key: "corners", label: "Corners" },
  { key: "fouls", label: "Fouls" },
  { key: "yellowCards", label: "Yellow cards" },
  { key: "redCards", label: "Red cards" },
];

export function StatsPanel({ statistics }: { statistics: Statistics }) {
  return (
    <div className="space-y-4">
      {ROWS.map(({ key, label, suffix }) => {
        const { home, away } = statistics[key];
        const total = home + away || 1;
        const homePct = (home / total) * 100;

        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between font-mono text-xs text-chalk">
              <span>
                {home}
                {suffix ?? ""}
              </span>
              <span className="text-mute">{label}</span>
              <span>
                {away}
                {suffix ?? ""}
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-pitch-line">
              <div className="bg-gold" style={{ width: `${homePct}%` }} />
              <div className="flex-1 bg-mute/40" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
