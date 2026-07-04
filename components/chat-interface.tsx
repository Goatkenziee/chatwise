"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Message, Conversation } from "@/lib/types";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { Sidebar } from "./sidebar";
import { nanoid } from "nanoid";
import { Menu, Sparkles, Code, BookOpen, Lightbulb } from "lucide-react";
import { loadConversations, saveConversations } from "@/lib/store";

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
  const [isLoaded, setIsLoaded] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeId);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadConversations();
    if (saved.length > 0) {
      setConversations(saved);
      setActiveId(saved[0].id);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (isLoaded) {
      saveConversations(conversations);
    }
  }, [conversations, isLoaded]);

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

  function clearAllConversations() {
    setConversations([]);
    setActiveId(null);
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
              title:
                c.messages.length === 0
                  ? content.slice(0, 50) + (content.length > 50 ? "..." : "")
                  : c.title,
            }
          : c
      )
    );

    setIsStreaming(true);

    try {
      const abortController = new AbortController();
      abortRef.current = abortController;

      const currentConv = conversations.find((c) => c.id === convId);
      const existingMessages = currentConv?.messages || [];
      const apiMessages = [...existingMessages, userMessage].map((m) => ({
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
                      role: "assistant" as const,
                      content:
                        "Sorry, something went wrong. Please try again.",
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

  function selectConversation(id: string) {
    setActiveId(id);
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onNew={createNewConversation}
        onDelete={deleteConversation}
        onClearAll={clearAllConversations}
        isOpen={sidebarOpen}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-medium text-foreground">ChatWise</h1>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {activeConversation && activeConversation.messages.length > 0 ? (
            <div className="max-w-3xl mx-auto py-4">
              {activeConversation.messages.map((msg) => (
                <div key={msg.id} className="message-enter">
                  <MessageBubble message={msg} />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-accent/20">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                How can I help you today?
              </h2>
              <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
                Ask me anything — I can write code, explain concepts, brainstorm
                ideas, and more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt, i) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt.text)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-card-hover transition-colors text-left group"
                    >
                      <Icon className="w-5 h-5 text-accent shrink-0" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {prompt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border shrink-0">
          <div className="max-w-3xl mx-auto w-full px-4 py-3">
            <ChatInput
              onSend={sendMessage}
              onStop={stopStreaming}
              isStreaming={isStreaming}
            />
            <p className="text-xs text-center text-muted-foreground mt-2">
              ChatWise can make mistakes. Consider checking important
              information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
