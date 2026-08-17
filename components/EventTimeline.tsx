import type { MatchEvent } from "@/lib/types";
import { eventAccent, eventIcon } from "@/lib/format";

export function EventTimeline({ events }: { events: MatchEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-mute">
        No events yet — the timeline fills in as the match happens.
      </p>
    );
  }

  return (
    <ol className="space-y-0">
      {events.map((event, i) => (
        <li
          key={event.id}
          className={`flex gap-3 border-pitch-line py-3 ${i !== events.length - 1 ? "border-b" : ""}`}
        >
          <span className="w-10 shrink-0 pt-0.5 text-right font-mono text-xs text-mute">
            {event.minute}&apos;
          </span>
          <span className="pt-0.5 text-base leading-none">{eventIcon(event.type)}</span>
          <div className="min-w-0">
            <p className={`text-sm ${eventAccent(event.type)}`}>{event.description}</p>
            {event.assistPlayer && (
              <p className="mt-0.5 text-xs text-mute">Assist: {event.assistPlayer}</p>
            )}
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-mute">
              {event.team === "home" ? "Home" : "Away"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
