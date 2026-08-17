import type { EventType, MatchStatus } from "./types";

export function isLive(status: MatchStatus): boolean {
  return status === "FIRST_HALF" || status === "SECOND_HALF" || status === "HALF_TIME";
}

export function statusLabel(status: MatchStatus, minute: number): string {
  switch (status) {
    case "NOT_STARTED":
      return "Kickoff soon";
    case "FIRST_HALF":
      return `${minute}' · 1H`;
    case "HALF_TIME":
      return "Half-time";
    case "SECOND_HALF":
      return `${minute}' · 2H`;
    case "FULL_TIME":
      return "Full-time";
    default:
      return status;
  }
}

export function eventIcon(type: EventType): string {
  switch (type) {
    case "GOAL":
      return "⚽";
    case "YELLOW_CARD":
      return "🟨";
    case "RED_CARD":
      return "🟥";
    case "SUBSTITUTION":
      return "🔄";
    case "FOUL":
      return "⚠️";
    case "SHOT":
      return "🎯";
    default:
      return "•";
  }
}

export function eventAccent(type: EventType): string {
  switch (type) {
    case "GOAL":
      return "text-live";
    case "YELLOW_CARD":
      return "text-amber";
    case "RED_CARD":
      return "text-live";
    default:
      return "text-mute";
  }
}

export function formatClock(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
