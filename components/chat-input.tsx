"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    if (isStreaming) return;
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-3 focus-within:border-accent/50 focus-within:shadow-lg focus-within:shadow-accent/5 transition-all duration-200">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        rows={1}
        disabled={isStreaming}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none min-h-[24px] max-h-[200px] disabled:opacity-50"
        aria-label="Chat input"
      />

      {isStreaming ? (
        <button
          onClick={onStop}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-foreground text-background hover:opacity-80 transition-all duration-150"
          aria-label="Stop generating"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-foreground text-background hover:opacity-80 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150"
          aria-label="Send message"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
