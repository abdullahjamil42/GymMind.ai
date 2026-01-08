"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2, Trash2, Bot, User, Sparkles, MessageCircle, X } from "lucide-react";

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

  useEffect(() => {
    if (status === "authenticated") {
      fetchChatHistory();
    }
  }, [status]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chat");
      const data = await response.json();
      if (data.success && data.messages) {
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
      console.error("Error fetching chat history:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || sending) return;
    const userMessage = inputValue.trim();
    setInputValue("");
    setError("");
    setSending(true);
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMessage.id);
        return [
          ...filtered,
          {
            id: data.userMessage.id,
            role: "user",
            content: data.userMessage.content,
            timestamp: data.userMessage.timestamp,
          },
          {
            id: data.assistantMessage.id,
            role: "assistant",
            content: data.assistantMessage.content,
            timestamp: data.assistantMessage.timestamp,
          },
        ];
      });
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const clearHistory = async () => {
    if (!confirm("Are you sure you want to clear all chat history?")) return;
    try {
      const response = await fetch("/api/chat", { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error clearing chat:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (status === "loading" || loading) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-lg"
        onClick={onClose}
      >
        <div className="text-center" onClick={e => e.stopPropagation()}>
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-lg"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 my-8 flex flex-col relative border border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10"
          title="Close Chat"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 rounded-t-2xl sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">GymMind AI Coach</h1>
                <p className="text-xs text-gray-400">Your personal fitness assistant</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-2 text-gray-400 hover:text-red-400 transition"
                title="Clear chat history"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto relative z-10 px-6 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Welcome to GymMind AI!</h2>
              <p className="text-gray-400 max-w-md mb-8">
                I'm your personal AI gym coach. Ask me anything about workouts, nutrition, form tips, or fitness advice!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  "What should I eat before a workout?",
                  "How do I improve my squat form?",
                  "Create a warm-up routine for me",
                  "How many calories should I eat?"
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputValue(suggestion)}
                    className="p-3 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition text-left"
                  >
                    <MessageCircle className="h-4 w-4 inline mr-2 text-primary-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-800 text-gray-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.role === "user" ? "text-primary-200" : "text-gray-500"}`}>
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                      <span className="text-sm text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Error Display */}
        {error && (
          <div className="px-6 pb-2 relative z-20">
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Input Area */}
        <footer className="bg-black/80 backdrop-blur-md border-t border-gray-800 rounded-b-2xl sticky bottom-0 z-30 px-6 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about fitness..."
                rows={1}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
                disabled={sending}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || sending}
              className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            GymMind AI provides fitness guidance only. For medical advice, consult a healthcare professional.
          </p>
        </footer>
      </div>
    </div>
  );
}