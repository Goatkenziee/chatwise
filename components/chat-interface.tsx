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

export function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    const stored = getConversations();
    setConversations(stored);
    if (stored.length > 0) {
      setActiveConversationId(stored[0].id);
    } else {
      // Create first conversation
      const conv = createConversation();
      addConversation(conv);
      setConversations([conv]);
      setActiveConversationId(conv.id);
    }
  }, []);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const messages = activeConversation?.messages ?? [];

  // Refresh conversations from store
  const refreshConversations = useCallback(() => {
    setConversations([...getConversations()]);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (content: string) => {
    let convId = activeConversationId;

    // Create new conversation if none active
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

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...(activeConversation?.messages ?? []), userMessage],
        }),
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
                // Update message in store
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
    } catch (error) {
      // Update with error message
      const conv = getConversation(convId);
      if (conv) {
        const msgIdx = conv.messages.findIndex(
          (m) => m.id === assistantMessage.id
        );
        if (msgIdx !== -1) {
          conv.messages[msgIdx].content =
            "Sorry, I encountered an error. Please try again.";
          updateConversation(convId, { messages: conv.messages });
          refreshConversations();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const conv = createConversation();
    addConversation(conv);
    setActiveConversationId(conv.id);
    refreshConversations();
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
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
        onDelete={handleDeleteConversation}
        onRename={handleRenameConversation}
        onClearAll={handleClearAll}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 4h12M2 8h12M2 12h12" />
              </svg>
            </button>
            {activeConversation && (
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {activeConversation.title || "New chat"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
              New chat
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            /* Welcome Screen — OpenAI-style */
            <div className="flex flex-col items-center justify-center h-full px-6 animate-fade-in-up">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-foreground to-foreground/70 text-background mb-6 shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold mb-2">How can I help you?</h1>
              <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
                Ask me anything — I can help with writing, analysis, coding, 
                brainstorming, and more.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  { icon: "✍️", text: "Write a poem about AI" },
                  { icon: "💻", text: "Explain React hooks" },
                  { icon: "📊", text: "Analyze this data" },
                  { icon: "💡", text: "Brainstorm ideas" },
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion.text)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-accent/50 transition-all text-left group"
                  >
                    <span className="text-lg shrink-0">{suggestion.icon}</span>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {suggestion.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isLoading={isLoading && msg.role === "assistant" && !msg.content}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area — always visible at bottom */}
        <div className={cn(
          "pb-4",
          hasMessages && "border-t border-border/50 pt-3"
        )}>
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
