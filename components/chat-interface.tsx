"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Message, Conversation } from "@/lib/types";
import {
  getConversations,
  getConversation,
  createConversation,
  addConversation,
  updateConversation,
  deleteConversation,
  clearConversations,
  addMessage as storeAddMessage,
} from "@/lib/store";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { Sidebar } from "./sidebar";
import { Sparkles } from "lucide-react";

export function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load conversations on mount
  useEffect(() => {
    const stored = getConversations();
    setConversations(stored);
    if (stored.length > 0) {
      setActiveConversationId(stored[0].id);
    } else {
      const conv = createConversation();
      addConversation(conv);
      setConversations([conv]);
      setActiveConversationId(conv.id);
    }
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages ?? [];

  const refreshConversations = useCallback(() => {
    setConversations([...getConversations()]);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (content: string) => {
    let convId = activeConversationId;

    if (!convId) {
      const conv = createConversation();
      addConversation(conv);
      convId = conv.id;
      setActiveConversationId(conv.id);
      refreshConversations();
    }

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: Date.now(),
    };
    storeAddMessage(convId, userMessage);
    refreshConversations();

    // Add placeholder assistant message
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };
    storeAddMessage(convId, assistantMessage);
    refreshConversations();
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...(activeConversation?.messages ?? []), userMessage],
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                fullContent += delta;
                const conv = getConversation(convId);
                if (conv) {
                  const msgIdx = conv.messages.findIndex(
                    (m) => m.id === assistantMessage.id
                  );
                  if (msgIdx !== -1) {
                    conv.messages[msgIdx].content = fullContent;
                    updateConversation(convId, { messages: conv.messages });
                    refreshConversations();
                  }
                }
              } catch {
                // skip parse errors
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error?.name === "AbortError") return;
      const conv = getConversation(convId);
      if (conv) {
        const msgIdx = conv.messages.findIndex(
          (m) => m.id === assistantMessage.id
        );
        if (msgIdx !== -1) {
          conv.messages[msgIdx].content = "Sorry, I encountered an error. Please try again.";
          updateConversation(convId, { messages: conv.messages });
          refreshConversations();
        }
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const handleNewChat = () => {
    const conv = createConversation();
    addConversation(conv);
    setActiveConversationId(conv.id);
    refreshConversations();
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    refreshConversations();
    if (id === activeConversationId) {
      const remaining = getConversations();
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRenameConversation = (id: string, title: string) => {
    updateConversation(id, { title });
    refreshConversations();
  };

  const handleClearAll = () => {
    clearConversations();
    setConversations([]);
    setActiveConversationId(null);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-chat-bg">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
        onRename={handleRenameConversation}
        onDelete={handleDeleteConversation}
        onClear={handleClearAll}
      />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {hasMessages ? (
            <div className="max-w-[700px] mx-auto px-4 pt-8 pb-2">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.content === "" && (
                <div className="flex items-center gap-1.5 py-3 animate-message-in">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse-dot" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse-dot" style={{ animationDelay: "200ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse-dot" style={{ animationDelay: "400ms" }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Empty state — clean, minimal */
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="flex flex-col items-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-foreground/60" />
                </div>
                <h1 className="text-xl font-medium text-foreground/80">ChatWise</h1>
                <p className="text-sm text-muted-foreground/60 text-center max-w-[300px]">
                  Ask anything — I'll help you think, write, code, and create.
                </p>
              </div>

              {/* Suggested prompts */}
              <div className="grid grid-cols-2 gap-2 max-w-[400px] w-full">
                {[
                  ["Explain quantum computing", "in simple terms"],
                  ["Write a poem about", "artificial intelligence"],
                  ["Help me debug", "a React component"],
                  ["Summarize the plot of", "Inception"],
                ].map(([pre, post], i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(`${pre} ${post}`)}
                    className="text-left px-3 py-2.5 rounded-xl border border-border hover:bg-muted transition-all duration-150 text-sm"
                  >
                    <span className="text-muted-foreground/70">{pre}</span>
                    <br />
                    <span className="text-muted-foreground">{post}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="shrink-0">
          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
