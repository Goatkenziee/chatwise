"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageBubble } from "@/components/message-bubble";
import { ChatInput } from "@/components/chat-input";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, ArrowDown } from "lucide-react";
import {
  createConversation,
  getConversations,
  getConversation,
  addConversation,
  updateConversation,
  deleteConversation,
  addMessage,
  clearConversations,
} from "@/lib/store";
import type { Conversation, Message } from "@/lib/types";

export function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load conversations on mount
  useEffect(() => {
    const convs = getConversations();
    setConversations(convs);
    if (convs.length > 0 && !activeId) {
      setActiveId(convs[0].id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: force ? "auto" : "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [streamingContent, scrollToBottom]);

  // Track scroll position for "scroll to bottom" button
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const activeConversation = activeId ? getConversation(activeId) : null;

  const handleNewConversation = () => {
    const conv = createConversation();
    addConversation(conv);
    setConversations(getConversations());
    setActiveId(conv.id);
    setStreamingContent("");
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setStreamingContent("");
    // Collapse sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    const convs = getConversations();
    setConversations(convs);
    if (activeId === id) {
      setActiveId(convs.length > 0 ? convs[0].id : null);
    }
  };

  const handleClearConversations = () => {
    clearConversations();
    setConversations([]);
    setActiveId(null);
    setStreamingContent("");
  };

  const handleSendMessage = async (content: string) => {
    let convId = activeId;

    // Create new conversation if none active
    if (!convId) {
      const conv = createConversation();
      addConversation(conv);
      convId = conv.id;
      setActiveId(conv.id);
      setConversations(getConversations());
    }

    const userMessage: Message = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      role: "user",
      content,
      createdAt: Date.now(),
    };

    addMessage(convId, userMessage);
    setConversations(getConversations());
    setIsLoading(true);
    setStreamingContent("");

    try {
      const conv = getConversation(convId);
      if (!conv) throw new Error("Conversation not found");

      const apiMessages = conv.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      abortRef.current = new AbortController();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, model: conv.model }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error("API request failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.done) break;
            fullContent += data.content;
            setStreamingContent(fullContent);
          } catch {
            // Skip malformed lines
          }
        }
      }

      // Save the assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        role: "assistant",
        content: fullContent,
        createdAt: Date.now(),
      };

      addMessage(convId, assistantMessage);
      setConversations(getConversations());
      setStreamingContent("");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // User cancelled
      } else {
        console.error("Chat error:", err);
        // Add error message
        const errorMessage: Message = {
          id: Date.now().toString(36),
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
          createdAt: Date.now(),
        };
        addMessage(convId!, errorMessage);
      }
    } finally {
      setIsLoading(false);
      setStreamingContent("");
      abortRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    abortRef.current?.abort();
    setIsLoading(false);

    // Save whatever we streamed so far
    if (activeId && streamingContent) {
      const partialMessage: Message = {
        id: Date.now().toString(36),
        role: "assistant",
        content: streamingContent + "\n\n*[Generation stopped]*",
        createdAt: Date.now(),
      };
      addMessage(activeId, partialMessage);
      setConversations(getConversations());
      setStreamingContent("");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        onClear={handleClearConversations}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(false)}
            className="h-8 w-8"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm gradient-text">ChatWise</span>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth"
        >
          {activeConversation && activeConversation.messages.length === 0 && !streamingContent ? (
            <div className="h-full flex flex-col items-center justify-center px-6 py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 border border-primary/10">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold gradient-text mb-2">How can I help you?</h2>
              <p className="text-muted-foreground text-sm text-center max-w-md">
                Ask me anything — I can help with writing, coding, research, analysis, and creative tasks.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {activeConversation?.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Streaming message */}
              {streamingContent && (
                <MessageBubble
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streamingContent,
                    createdAt: Date.now(),
                  }}
                  isStreaming
                />
              )}

              {/* Loading indicator when starting */}
              {isLoading && !streamingContent && (
                <div className="flex gap-4 animate-fade-up">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-card border border-border rounded-tl-md">
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Empty state when no conversation */}
              {!activeConversation && !isLoading && (
                <div className="h-[60vh] flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 border border-primary/10">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold gradient-text mb-2">Welcome to ChatWise</h2>
                  <p className="text-muted-foreground text-sm text-center max-w-md">
                    Start a new conversation or select one from the sidebar.
                  </p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom(true)}
            className="fixed bottom-24 right-8 z-20 w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition animate-fade-up"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Input Area */}
        <div className="border-t border-border bg-gradient-to-t from-background via-background to-transparent pt-2 pb-4 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <ChatInput
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                  placeholder={
                    activeConversation
                      ? "Message ChatWise..."
                      : "Start a new conversation..."
                  }
                />
              </div>
              {isLoading && (
                <Button
                  variant="outline"
                  onClick={handleStopGeneration}
                  className="h-11 px-3 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  Stop
                </Button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
              ChatWise may produce inaccurate information. Verify important facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
