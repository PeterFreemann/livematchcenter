"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import type { ConnectionState } from "@/lib/types";


export function useConnectionStatus(onReconnected?: () => void) {
  const [state, setState] = useState<ConnectionState>("connecting");

  useEffect(() => {
    const socket = getSocket();

    if (socket.connected) setState("connected");

    const handleConnect = () => setState("connected");
    const handleDisconnect = () => setState("disconnected");
    const handleReconnectAttempt = () => setState("reconnecting");
    const handleReconnect = () => {
      setState("connected");
      onReconnected?.();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect", handleReconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect", handleReconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
