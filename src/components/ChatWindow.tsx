"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/lib/types";
import { getMessages, sendMessage } from "@/lib/order-api";
import { useAuth } from "@/context/AuthContext";
import { echo } from "@/lib/echo";

interface ChatWindowProps {
  orderId: number;
  receiverId: number;
  receiverName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWindow({
  orderId,
  receiverId,
  receiverName,
  isOpen,
  onClose,
}: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    setLoading(true);
    getMessages(orderId)
      .then((msgs) => setMessages(msgs))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));

    if (echo) {
      const channel = echo.channel(`order-chat.${orderId}`);
      channel.listen(".MessageSent", (e: { messageData: Message }) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === e.messageData.id)) return prev;
          return [...prev, e.messageData];
        });
      });

      return () => {
        channel.stopListening(".MessageSent");
        echo?.leaveChannel(`order-chat.${orderId}`);
      };
    }
  }, [isOpen, orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(orderId, receiverId, input.trim());
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setInput("");
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: "1rem",
        width: "min(400px, calc(100vw - 2rem))",
        height: "min(500px, 70vh)",
        background: "var(--bg-card, #fff)",
        borderRadius: "1rem 1rem 0 0",
        boxShadow: "0 -4px 30px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        border: "1px solid #e7e5e4",
        borderBottom: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid #e7e5e4",
          background: "linear-gradient(135deg, #d97706, #f59e0b)",
          borderRadius: "1rem 1rem 0 0",
          color: "#fff",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
          💬 Chat with {receiverName}
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "#fff",
            borderRadius: "50%",
            width: 28,
            height: 28,
            cursor: "pointer",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: "#78716c", padding: "2rem" }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#78716c", padding: "2rem", fontSize: "0.85rem" }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#a8a29e",
                    marginBottom: "0.15rem",
                    fontWeight: 500,
                  }}
                >
                  {isMe ? "You" : msg.sender_name}
                </div>
                <div
                  style={{
                    background: isMe
                      ? "linear-gradient(135deg, #d97706, #f59e0b)"
                      : "#f5f5f4",
                    color: isMe ? "#fff" : "#292524",
                    padding: "0.5rem 0.75rem",
                    borderRadius: isMe
                      ? "1rem 1rem 0.25rem 1rem"
                      : "1rem 1rem 1rem 0.25rem",
                    maxWidth: "80%",
                    fontSize: "0.85rem",
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.message}
                </div>
                <div
                  style={{
                    fontSize: "0.6rem",
                    color: "#a8a29e",
                    marginTop: "0.15rem",
                  }}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.75rem",
          borderTop: "1px solid #e7e5e4",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            border: "1px solid #d6d3d1",
            borderRadius: "0.75rem",
            padding: "0.5rem 0.75rem",
            fontSize: "0.85rem",
            outline: "none",
            background: "#fafaf9",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          style={{
            background: input.trim() ? "linear-gradient(135deg, #d97706, #f59e0b)" : "#d6d3d1",
            color: "#fff",
            border: "none",
            borderRadius: "0.75rem",
            padding: "0.5rem 1rem",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: input.trim() ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
