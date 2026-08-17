# Live Match Center

A real-time football match dashboard built with Next.js 14 (App Router) and TypeScript, integrating with the provided Live Match backend over REST and Socket.IO.

## Stack

- **Next.js 14** (App Router), **TypeScript**
- **Tailwind CSS** for styling (no component library — small enough surface area that plain utility classes stay readable)
- **socket.io-client** for the WebSocket layer

No state-management library — the socket event handlers write directly into local component state via hooks (`useMatches`, `useMatchDetail`, `useChat`). At this scope a global store would add indirection without buying much.

## Getting started

```bash
npm install
cp .env.example .env.local   # already points at the provided backend
npm run dev
```

Open http://localhost:3000.

Environment variables (see `.env.example`):

- `NEXT_PUBLIC_API_BASE_URL` — REST base URL
- `NEXT_PUBLIC_SOCKET_URL` — Socket.IO URL

## Structure

```
app/
  page.tsx                 Dashboard (live / upcoming / full-time)
  match/[id]/page.tsx      Match detail: score, timeline, stats, chat
  layout.tsx, globals.css
components/                Presentational pieces (MatchCard, EventTimeline, StatsPanel, Chat, ...)
hooks/
  useMatches.ts             Dashboard data + score/status subscriptions
  useMatchDetail.ts          Single match data + event/stat/status subscriptions
  useChat.ts                 Chat room join/leave, messages, typing indicators
  useConnectionStatus.ts     Shared connection-state tracking + reconnect callback
lib/
  api.ts, socket.ts, types.ts, identity.ts, format.ts
```

## Approach

**One shared socket.** `lib/socket.ts` holds a single Socket.IO connection for the whole app (`getSocket()`), so navigating from the dashboard to a match and back doesn't pay a reconnect cost. Each screen manages its own `subscribe_match` / `join_chat` lifecycle on top of that shared connection and tears its own subscriptions down on unmount — the transport itself stays alive.

**Dashboard (`useMatches`).** Fetches `/api/matches` once, then diffs the match id list against a `subscribedIdsRef` set to `subscribe_match` new matches and `unsubscribe_match` ones that drop off the board (e.g. a match finishing). `score_update` and `status_change` patch matches in place. A 30s poll of the REST endpoint is a fallback for matches that start/finish, in case a socket event is ever missed - real-time first, poll as a safety net rather than the primary mechanism.

**Match detail (`useMatchDetail`).** Fetches full match detail (events + statistics) on mount, subscribes to that one match, and applies `score_update` / `match_event` / `stats_update` / `status_change` directly onto the cached detail object. New events are prepended and de-duplicated by id (in case of a re-emit after reconnect). Unsubscribes on unmount.

**Chat (`useChat`).** Joins the room only once the user has a username (asked once, stored in `localStorage` alongside a generated anonymous `userId`), leaves it on unmount. Typing indicators debounce locally: `typing_start` fires on the first keystroke, `typing_stop` fires either after 2s of inactivity or on send. Enforces the 500-character limit client-side and surfaces server `error` events (e.g. rate limiting) inline above the input.

**Connection handling.** `socket.io-client`'s built-in reconnection is configured for indefinite retry with backoff (`reconnectionDelay` 1s → up to 10s). `useConnectionStatus` surfaces `connecting` / `connected` / `reconnecting` / `disconnected` for a top-of-page banner, and takes an `onReconnected` callback - both `useMatches` and `useMatchDetail` use it to re-fetch REST state on reconnect, since events emitted while offline are otherwise lost.

## Trade-offs / known limitations

- **Chat presence count** is derived only from `user_joined` / `user_left` deltas after mount, since the backend doesn't send an initial room roster — so the count reflects joins/leaves observed during the session, not true room occupancy at join time. Not surfaced in the UI for that reason.
- **No message history on join** — chat starts empty per session; the spec doesn't expose a history endpoint, so this reflects the API's shape rather than an oversight.
- **Optimistic send** isn't used for chat — messages appear once the server echoes `chat_message` back, which keeps ordering/ids authoritative but adds a tick of latency on send.
- **Styling direction**: a broadcast-graphics / stadium aesthetic (deep pitch green, chalk white, live-red, a gold accent for stats and the scrolling live-score ticker) rather than a generic dashboard look, since the subject is a live sports product.

## Deployment

Any Next.js host works (Vercel is the path of least resistance): set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SOCKET_URL` as environment variables on the project, then deploy. No server-side API routes are used, so a static/edge-friendly host is sufficient.
