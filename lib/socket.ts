import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "wss://profootball.srv883830.hstgr.cloud";

let socket: Socket | null = null;

/**
 * Returns a single shared Socket.IO connection for the whole app.
 *
 * We keep exactly one transport connection alive regardless of how many
 * components subscribe to matches or chat rooms - each component manages
 * its own `subscribe_match` / `join_chat` lifecycle on top of this shared
 * connection, and cleans that up on unmount, but never tears the socket
 * itself down. That way navigating between the dashboard and a match
 * detail view doesn't pay a reconnect cost.
 */
export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    randomizationFactor: 0.5,
    autoConnect: true,
  });

  return socket;
}

export function closeSocket(): void {
  socket?.close();
  socket = null;
}
