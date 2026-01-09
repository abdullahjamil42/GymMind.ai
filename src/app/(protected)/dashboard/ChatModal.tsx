"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Send,
  Loader2,
  Trash2,
  Bot,
  User,
  Sparkles,
  MessageCircle,
  X,
} from "lucide-react";

/* ---------- Scrollbar Styles ---------- */
if (typeof document !== "undefined") {
  if (!document.getElementById("chat-scrollbar-styles")) {
    const style = document.createElement("style");
    style.id = "chat-scrollbar-styles";
    style.textContent = `
      .chat-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .chat-scrollbar::-webkit-scrollbar-track {
        background: #1f2937;
      }
      .chat-scrollbar::-webkit-scrollbar-thumb {
        background: #4b5563;
        border-radius: 4px;
      }
      .chat-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }
    `;
    document.head.appendChild(style);
  }
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatModal({ onClose }: { onClose: () => void }) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* ---------- Lock background scroll ---------- */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchChatHistory();
    }
  }, [status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (data.success) {
        setMessages(
          data.messages.map((m: any) => ({
            id: m._id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || sending) return;

    const text = inputValue.trim();
    setInputValue("");
    setSending(true);
    setError("");

    const temp: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, temp]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== temp.id),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const clearHistory = async () => {
    if (!confirm("Clear all chat history?")) return;
    await fetch("/api/chat", { method: "DELETE" });
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-lg"
      onClick={onClose}
    >
      {/* ---------- MODAL ---------- */}
      <div
        className="
          bg-gray-900
          rounded-2xl
          shadow-2xl
          w-full max-w-2xl
          h-[85vh] max-h-[85vh]
          flex flex-col
          relative
          border border-gray-800
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        

        {/* Header */}
        <header className="px-6 py-4 border-b border-gray-800 bg-black/80 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                <Bot className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold">GymMind AI</h1>
                <p className="text-xs text-gray-400">AI Fitness Coach</p>
              </div>
            </div>
            {messages.length > 0 && (
              <div className="flex items-center gap-4">
                <button onClick={clearHistory} className="text-gray-400 hover:text-red-400">
                  <Trash2 />
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white z-20"
                >
                  <X />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto chat-scrollbar px-6 py-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Sparkles className="h-10 w-10 text-primary-500 mb-4" />
              <p className="text-gray-400">Ask me anything about fitness 💪</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && <Bot className="text-primary-500" />}
                  <div
                    className={`px-4 py-3 rounded-xl max-w-[75%] ${
                      m.role === "user"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-800 text-gray-100"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  </div>
                  {m.role === "user" && <User className="text-gray-400" />}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input */}
        <footer className="border-t border-gray-800 bg-black/80 px-6 py-4 sticky bottom-0">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              rows={1}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white resize-none"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || sending}
              className="bg-primary-600 text-white px-4 rounded-xl"
            >
              {sending ? <Loader2 className="animate-spin" /> : <Send />}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
