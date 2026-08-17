"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { getStoredUsername, setStoredUsername } from "@/lib/identity";
import { formatClock } from "@/lib/format";

export function Chat({ matchId }: { matchId: string }) {
  const [username, setUsername] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [message, setMessage] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsername(getStoredUsername());
  }, []);

  const {
    messages,
    typingUsers,
    chatError,
    clearChatError,
    sendMessage,
    notifyTyping,
    messageLimit,
  } = useChat(matchId, username);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typingUsers.length]);

  function handleSetUsername(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    setStoredUsername(trimmed);
    setUsername(trimmed);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(message);
    setMessage("");
  }

  if (!username) {
    return (
      <form onSubmit={handleSetUsername} className="space-y-3">
        <p className="text-sm text-mute">Pick a name to join the match chat.</p>
        <div className="flex gap-2">
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={24}
            placeholder="Your name"
            className="flex-1 rounded-md border border-pitch-line bg-pitch px-3 py-2 text-sm text-chalk outline-none placeholder:text-mute focus:border-gold/50"
          />
          <button
            type="submit"
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-pitch transition hover:brightness-110"
          >
            Join chat
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex h-[420px] flex-col">
      <div ref={listRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="py-6 text-center text-sm text-mute">
            No messages yet. Say something before kickoff talk starts.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={`${m.userId}-${m.timestamp}-${i}`} className="text-sm">
            <div className="flex items-baseline gap-2">
              <span className={`font-medium ${m.username === username ? "text-gold" : "text-chalk"}`}>
                {m.username}
              </span>
              <span className="font-mono text-[11px] text-mute">{formatClock(m.timestamp)}</span>
            </div>
            <p className="text-chalk/90">{m.message}</p>
          </div>
        ))}
      </div>

      <div className="h-5 pt-1 text-xs italic text-mute">
        {typingUsers.length > 0 &&
          `${typingUsers.map((u) => u.username).join(", ")} ${
            typingUsers.length === 1 ? "is" : "are"
          } typing…`}
      </div>

      {chatError && (
        <div className="mb-2 flex items-center justify-between rounded-md bg-live/10 px-3 py-1.5 text-xs text-live">
          {chatError}
          <button onClick={clearChatError} className="ml-2 text-live/70 hover:text-live">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-pitch-line pt-3">
        <input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            notifyTyping();
          }}
          maxLength={messageLimit}
          placeholder="Send a message"
          className="flex-1 rounded-md border border-pitch-line bg-pitch px-3 py-2 text-sm text-chalk outline-none placeholder:text-mute focus:border-gold/50"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-pitch transition hover:brightness-110 disabled:opacity-40"
        >
          Send
        </button>
      </form>
      <div className="pt-1 text-right font-mono text-[10px] text-mute">
        {message.length}/{messageLimit}
      </div>
    </div>
  );
}
