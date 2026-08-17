"use client";

import { useCallback, useEffect, useState } from "react";
import { getMatchById, ApiError } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type {
  MatchDetail,
  MatchEventPayload,
  ScoreUpdatePayload,
  StatsUpdatePayload,
  StatusChangePayload,
} from "@/lib/types";
import { useConnectionStatus } from "./useConnectionStatus";

export function useMatchDetail(matchId: string) {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getMatchById(matchId);
      setMatch(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't load this match. Try again."
      );
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  // If we lost connection mid-match, re-fetch on reconnect so events/stats
  // that happened while offline aren't silently missing from the timeline.
  const connectionState = useConnectionStatus(load);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("subscribe_match", { matchId });

    const handleScoreUpdate = (payload: ScoreUpdatePayload) => {
      if (payload.matchId !== matchId) return;
      setMatch((prev) =>
        prev ? { ...prev, homeScore: payload.homeScore, awayScore: payload.awayScore } : prev
      );
    };

    const handleMatchEvent = (payload: MatchEventPayload) => {
      if (payload.matchId !== matchId) return;
      setMatch((prev) => {
        if (!prev) return prev;
        if (prev.events.some((e) => e.id === payload.id)) return prev;
        const { matchId: _omit, ...event } = payload;
        return { ...prev, events: [event, ...prev.events] };
      });
    };

    const handleStatsUpdate = (payload: StatsUpdatePayload) => {
      if (payload.matchId !== matchId) return;
      setMatch((prev) => (prev ? { ...prev, statistics: payload.statistics } : prev));
    };

    const handleStatusChange = (payload: StatusChangePayload) => {
      if (payload.matchId !== matchId) return;
      setMatch((prev) =>
        prev ? { ...prev, status: payload.status, minute: payload.minute } : prev
      );
    };

    socket.on("score_update", handleScoreUpdate);
    socket.on("match_event", handleMatchEvent);
    socket.on("stats_update", handleStatsUpdate);
    socket.on("status_change", handleStatusChange);

    return () => {
      socket.off("score_update", handleScoreUpdate);
      socket.off("match_event", handleMatchEvent);
      socket.off("stats_update", handleStatsUpdate);
      socket.off("status_change", handleStatusChange);
      socket.emit("unsubscribe_match", { matchId });
    };
  }, [matchId]);

  return { match, loading, error, connectionState, refetch: load };
}
