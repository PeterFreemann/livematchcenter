"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMatches, ApiError } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type {
  Match,
  ScoreUpdatePayload,
  StatusChangePayload,
} from "@/lib/types";
import { useConnectionStatus } from "./useConnectionStatus";

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscribedIdsRef = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      setError(null);
      const { matches: fetched } = await getMatches();
      setMatches(fetched);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't load matches. Try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-sync the full list whenever the socket reconnects, in case matches
  // finished, started, or updated while we were offline.
  const connectionState = useConnectionStatus(load);

  useEffect(() => {
    load();
    // Poll as a fallback so matches that start/finish (entering or leaving
    // the board) still show up even if a subscribe event is missed.
    const pollId = setInterval(load, 30000);
    return () => clearInterval(pollId);
  }, [load]);

  // Keep socket subscriptions in sync with whichever matches are on screen.
  useEffect(() => {
    const socket = getSocket();
    const currentIds = new Set(matches.map((m) => m.id));
    const subscribed = subscribedIdsRef.current;

    currentIds.forEach((id) => {
      if (!subscribed.has(id)) {
        socket.emit("subscribe_match", { matchId: id });
        subscribed.add(id);
      }
    });
    subscribed.forEach((id) => {
      if (!currentIds.has(id)) {
        socket.emit("unsubscribe_match", { matchId: id });
        subscribed.delete(id);
      }
    });
  }, [matches]);

  useEffect(() => {
    const socket = getSocket();

    const handleScoreUpdate = (payload: ScoreUpdatePayload) => {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === payload.matchId
            ? { ...m, homeScore: payload.homeScore, awayScore: payload.awayScore }
            : m
        )
      );
    };

    const handleStatusChange = (payload: StatusChangePayload) => {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === payload.matchId
            ? { ...m, status: payload.status, minute: payload.minute }
            : m
        )
      );
    };

    socket.on("score_update", handleScoreUpdate);
    socket.on("status_change", handleStatusChange);

    return () => {
      socket.off("score_update", handleScoreUpdate);
      socket.off("status_change", handleStatusChange);
    };
  }, []);

  // Unsubscribe from everything on unmount.
  useEffect(() => {
    const socket = getSocket();
    const subscribed = subscribedIdsRef.current;
    return () => {
      subscribed.forEach((id) => socket.emit("unsubscribe_match", { matchId: id }));
      subscribed.clear();
    };
  }, []);

  return { matches, loading, error, connectionState, refetch: load };
}
