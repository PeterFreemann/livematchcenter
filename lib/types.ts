export type MatchStatus =
  | "NOT_STARTED"
  | "FIRST_HALF"
  | "HALF_TIME"
  | "SECOND_HALF"
  | "FULL_TIME";

export type EventType =
  | "GOAL"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "SUBSTITUTION"
  | "FOUL"
  | "SHOT";

export interface Team {
  id: string;
  name: string;
  shortName: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: MatchStatus;
  startTime: string;
}

export interface MatchEvent {
  id: string;
  type: EventType;
  minute: number;
  team: "home" | "away";
  player?: string;
  assistPlayer?: string;
  description: string;
  timestamp: string;
}

export interface Statistics {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
}

export interface MatchDetail extends Match {
  events: MatchEvent[];
  statistics: Statistics;
}

export interface ChatMessage {
  matchId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface TypingUser {
  userId: string;
  username: string;
}

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";

// ---- Socket payload contracts ----

export interface ScoreUpdatePayload {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface MatchEventPayload extends MatchEvent {
  matchId: string;
}

export interface StatsUpdatePayload {
  matchId: string;
  statistics: Statistics;
}

export interface StatusChangePayload {
  matchId: string;
  status: MatchStatus;
  minute: number;
}

export interface UserJoinedPayload {
  matchId: string;
  userId: string;
  username: string;
}

export interface UserLeftPayload {
  matchId: string;
  userId: string;
}

export interface TypingIndicatorPayload {
  matchId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface SocketErrorPayload {
  code: string;
  message: string;
}
