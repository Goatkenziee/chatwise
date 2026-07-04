"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center px-4">
      {/* Input bar */}
      <div className="relative w-full max-w-3xl">
        <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-input-bg shadow-sm transition-shadow focus-within:shadow-md focus-within:border-foreground/30">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ChatWise..."
            rows={1}
            disabled={isLoading}
            className={cn(
              "flex-1 resize-none bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-muted-foreground/60",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          />

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-xl mr-1.5 mb-1.5 transition-all",
              input.trim() && !isLoading
                ? "bg-foreground text-background hover:opacity-80"
                : "bg-accent text-muted-foreground cursor-not-allowed"
            )}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 1L1 6l5 4 4 5 5-14z" />
              <path d="M10 6L6 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground/50 mt-2 text-center">
        ChatWise can make mistakes. Check important info.
      </p>
    </div>
  );
}
