"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Message, Conversation } from "@/lib/types";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { Sidebar } from "./sidebar";
import { nanoid } from "nanoid";
import { Menu, Plus, MessageSquare, Sparkles, Code, BookOpen, Lightbulb, Zap } from "lucide-react";

const SUGGESTED_PROMPTS = [
  { icon: Sparkles, text: "Explain quantum computing simply" },
  { icon: Code, text: "Write a Python script to sort files" },
  { icon: BookOpen, text: "Summarize the theory of relativity" },
  { icon: Lightbulb, text: "Brainstorm startup ideas for 2025" },
];

export function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, scrollToBottom]);

  function createNewConversation() {
    const id = nanoid();
    const newConv: Conversation = {
      id,
      title: "New Chat",
      messages: [],
      model: "gpt-4o-mini",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(id);
  }

  function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || isStreaming) return;

    let convId = activeId;
    if (!convId) {
      const id = nanoid();
      const newConv: Conversation = {
        id,
        title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
        messages: [],
        model: "gpt-4o-mini",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(id);
      convId = id;
    }

    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content,
      createdAt: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              updatedAt: Date.now(),
              title: c.messages.length === 0 ? content.slice(0, 50) + (content.length > 50 ? "..." : "") : c.title,
            }
          : c
      )
    );

    setIsStreaming(true);

    try {
      const abortController = new AbortController();
      abortRef.current = abortController;

      const currentConv = conversations.find((c) => c.id === convId) || {
        messages: [] as Message[],
      };
      const apiMessages = [...currentConv.messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const assistantId = nanoid();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMessage] }
            : c
        )
      );

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantId ? { ...m, content: fullContent } : m
                  ),
                }
              : c
          )
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Chat error:", error);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      id: nanoid(),
                      role: "assistant",
                      content: "Sorry, something went wrong. Please try again.",
                      createdAt: Date.now(),
                    },
                  ],
                }
              : c
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
    setIsStreaming(false);
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={createNewConversation}
        onDelete={deleteConversation}
        isOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          {!activeConversation && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h1 className="text-sm font-medium">ChatWise</h1>
            </div>
          )}
          {activeConversation && (
            <h2 className="text-sm font-medium truncate">
              {activeConversation.title}
            </h2>
          )}
          <div className="ml-auto">
            <button
              onClick={createNewConversation}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Welcome to ChatWise</h2>
                <p className="text-muted-foreground text-sm">
                  Your intelligent AI assistant. Start a conversation below.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.text)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-card-hover transition-colors text-left group"
                  >
                    <prompt.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {prompt.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-1">
              {activeConversation.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isStreaming && (
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSend={sendMessage}
              onStop={stopStreaming}
              isStreaming={isStreaming}
            />
            <p className="text-xs text-muted-foreground text-center mt-2">
              ChatWise may produce inaccurate information. Verify important facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}