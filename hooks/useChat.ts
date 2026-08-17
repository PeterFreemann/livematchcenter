"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { getUserId } from "@/lib/identity";
import type {
  ChatMessage,
  SocketErrorPayload,
  TypingIndicatorPayload,
  TypingUser,
  UserJoinedPayload,
  UserLeftPayload,
} from "@/lib/types";

const TYPING_STOP_DELAY_MS = 2000;
const MESSAGE_LIMIT = 500;

export function useChat(matchId: string, username: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [presenceCount, setPresenceCount] = useState(0);
  const [chatError, setChatError] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const userId = useRef(getUserId());

  useEffect(() => {
    if (!username) return;
    const socket = getSocket();

    socket.emit("join_chat", { matchId, userId: userId.current, username });
    setPresenceCount((c) => c + 1);

    const handleChatMessage = (msg: ChatMessage) => {
      if (msg.matchId !== matchId) return;
      setMessages((prev) => [...prev, msg]);
    };

    const handleUserJoined = (payload: UserJoinedPayload) => {
      if (payload.matchId !== matchId) return;
      setPresenceCount((c) => c + 1);
    };

    const handleUserLeft = (payload: UserLeftPayload) => {
      if (payload.matchId !== matchId) return;
      setPresenceCount((c) => Math.max(0, c - 1));
    };

    const handleTyping = (payload: TypingIndicatorPayload) => {
      if (payload.matchId !== matchId || payload.userId === userId.current) return;
      setTypingUsers((prev) => {
        const withoutUser = prev.filter((u) => u.userId !== payload.userId);
        return payload.isTyping
          ? [...withoutUser, { userId: payload.userId, username: payload.username }]
          : withoutUser;
      });
    };

    const handleError = (payload: SocketErrorPayload) => {
      setChatError(payload.message || "Something went wrong with the chat.");
    };

    socket.on("chat_message", handleChatMessage);
    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);
    socket.on("typing_indicator", handleTyping);
    socket.on("error", handleError);

    return () => {
      socket.off("chat_message", handleChatMessage);
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
      socket.off("typing_indicator", handleTyping);
      socket.off("error", handleError);
      socket.emit("leave_chat", { matchId, userId: userId.current });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setMessages([]);
      setTypingUsers([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, username]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !username) return;
      if (trimmed.length > MESSAGE_LIMIT) {
        setChatError(`Messages are limited to ${MESSAGE_LIMIT} characters.`);
        return;
      }
      const socket = getSocket();
      socket.emit("send_message", {
        matchId,
        userId: userId.current,
        username,
        message: trimmed,
      });
      stopTyping();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matchId, username]
  );

  const stopTyping = useCallback(() => {
    if (!isTypingRef.current || !username) return;
    isTypingRef.current = false;
    const socket = getSocket();
    socket.emit("typing_stop", { matchId, userId: userId.current });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, username]);

  const notifyTyping = useCallback(() => {
    if (!username) return;
    const socket = getSocket();
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing_start", { matchId, userId: userId.current, username });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, TYPING_STOP_DELAY_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, username, stopTyping]);

  return {
    messages,
    typingUsers,
    presenceCount,
    chatError,
    clearChatError: () => setChatError(null),
    sendMessage,
    notifyTyping,
    messageLimit: MESSAGE_LIMIT,
  };
}
